/*
  Point-cloud "living lung" in plain three.js.

  Every point is one cell. Cells are placed where they live in the organ:
  alveolar epithelium filling the lungs, airway epithelium along a branching
  bronchial tree, endothelium along arteries and veins, a lumpy spiculated
  tumour in the right upper lobe with immune cells around it, and
  lymphocytes packed into hilar and mediastinal nodes.

  Each cell also has a second home in a "cell atlas" layout, where cells
  gather into clusters by type. Switching view morphs every point from its
  anatomical position to its cluster, with a small per-cell delay so the
  organ appears to flow apart and back together.

  All positions are generated from code. This is an illustration, not a
  segmentation of a real CT or a real single-cell dataset.
*/

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
  CELL_CATEGORIES,
  CELL_SUBTYPES,
  DRUGS,
  FLOW_KEEP,
  FLOW_ROUTES,
  PATHWAYS,
  RESISTANT_SUBTYPE_LABEL,
  type CellCategoryId,
} from "./lungCells";
import { LYMPH_NODES } from "./lungNodes";

export type ViewMode = "anatomy" | "atlas" | "flow";

export type PickId = "tumor" | `node:${string}`;

export type HoverInfo = { title: string; detail: string; color: string; x: number; y: number };

export type LungSceneOptions = {
  reducedMotion: boolean;
  onPick: (id: PickId) => void;
  onHover: (hover: HoverInfo | null) => void;
};

export type LungSceneHandle = {
  /* Number of cells per category; tumour cells are all counted as sensitive. */
  counts: Record<CellCategoryId, number>;
  setCategoryVisible: (id: CellCategoryId, visible: boolean) => void;
  setView: (view: ViewMode) => void;
  setTumorState: (scale: number, resistantFraction: number) => void;
  setSelected: (id: PickId | null) => void;
  setBreathing: (on: boolean) => void;
  focusTumor: () => void;
  resetView: () => void;
  dispose: () => void;
};

/* ---------- geometry helpers ---------- */

type Side = "right" | "left";

// Patient's right is on the viewer's left in a frontal view.
const LUNG_CENTER_X: Record<Side, number> = { right: -0.95, left: 0.95 };
const TUMOR_CENTER = new THREE.Vector3(-1.05, 0.85, 0.18);
const TUMOR_BASE_RADIUS = 0.16;
const BREATH_CENTER = new THREE.Vector3(0, 0.3, 0);

const CAT = Object.fromEntries(CELL_CATEGORIES.map((c) => [c.id, c.index])) as Record<CellCategoryId, number>;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number) {
  const u = Math.max(1e-9, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function randomInBall(rng: () => number, out: THREE.Vector3) {
  do {
    out.set(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
  } while (out.lengthSq() > 1);
  return out;
}

function randomDirection(rng: () => number, out: THREE.Vector3) {
  randomInBall(rng, out);
  if (out.lengthSq() < 1e-6) out.set(0, 1, 0);
  return out.normalize();
}

function medialFactor(side: Side, y: number) {
  // The left lung is cut deeper by the heart (cardiac notch), mostly low down.
  if (side === "left") return y < 0.2 ? 0.38 : 0.5;
  return 0.6;
}

/* Map a point on (or inside) the unit sphere onto the lung. */
function shapeLungVertex(v: THREE.Vector3, side: Side) {
  const n =
    0.035 * Math.sin(3.1 * v.x + 1.7) * Math.sin(2.7 * v.y + 0.4) * Math.sin(3.3 * v.z + 2.1) +
    0.015 * Math.sin(7.3 * v.x + 0.2) * Math.sin(6.1 * v.z + 1.1);
  const ux = v.x * (1 + n);
  const uy = v.y * (1 + n);
  const uz = v.z * (1 + n);

  const medialSign = side === "right" ? 1 : -1;
  const t = (uy + 1) / 2;
  const wf = 1 - 0.55 * t * t;

  let x = ux;
  if (x * medialSign > 0) x *= medialFactor(side, uy);

  let y = uy * (side === "left" ? 1.4 : 1.45);
  // Diaphragm dome pushes the base up into a concave floor.
  const lift = 0.55 * Math.max(0, (-uy - 0.4) / 0.6) * Math.max(0, 1 - (ux * ux + uz * uz) / 0.64);
  y += lift;

  v.set(LUNG_CENTER_X[side] + x * 0.85 * wf, y, uz * 0.95 * wf);
}

/* Approximate inverse of shapeLungVertex: is p inside the lung (with margin)? */
function insideLung(p: THREE.Vector3, side: Side, margin: number) {
  const y = p.y / 1.45;
  if (y < -0.82 || y > 0.97) return false;
  const t = (y + 1) / 2;
  const wf = 1 - 0.55 * t * t;
  const medialSign = side === "right" ? 1 : -1;
  let x = (p.x - LUNG_CENTER_X[side]) / (0.85 * wf);
  if (x * medialSign > 0) x /= medialFactor(side, y);
  const z = p.z / (0.95 * wf);
  return x * x + y * y + z * z < margin;
}

type Segment = { a: THREE.Vector3; b: THREE.Vector3; r: number };

function growTree(
  rng: () => number,
  start: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  radius: number,
  depth: number,
  maxDepth: number,
  side: Side,
  out: Segment[],
) {
  let len = length;
  let end = start.clone().addScaledVector(dir, len);
  for (let i = 0; i < 3 && depth > 0 && !insideLung(end, side, 0.85); i++) {
    len *= 0.65;
    end = start.clone().addScaledVector(dir, len);
  }
  if (depth > 0 && !insideLung(end, side, 0.92)) return;
  out.push({ a: start, b: end, r: radius });
  if (depth >= maxDepth) return;

  let axis = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).cross(dir);
  if (axis.lengthSq() < 1e-6) axis = new THREE.Vector3(1, 0, 0).cross(dir);
  axis.normalize();
  const nextLen = len * (0.72 + rng() * 0.12);
  const probe = new THREE.Vector3();
  for (const sign of [1, -1]) {
    const next = dir.clone().applyAxisAngle(axis, sign * (0.3 + rng() * 0.35));
    next.applyAxisAngle(dir, (rng() - 0.5) * 0.9).normalize();
    // Steer toward a point of lung ahead of us so the tree fills the organ.
    for (let tries = 0; tries < 14; tries++) {
      probe.copy(next).multiplyScalar(nextLen * (1 + rng() * 2));
      probe.add(new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(nextLen * 2));
      probe.add(end);
      if (insideLung(probe, side, 0.8)) {
        const toward = probe.clone().sub(end).normalize();
        next.multiplyScalar(0.45).addScaledVector(toward, 0.55).normalize();
        break;
      }
    }
    growTree(rng, end, next, nextLen, radius * 0.7, depth + 1, maxDepth, side, out);
  }
}

function lobarTree(
  seed: number,
  side: Side,
  hilum: THREE.Vector3,
  lobes: [number, number, number][],
  radius: number,
  maxDepth: number,
) {
  const rng = mulberry32(seed);
  const segments: Segment[] = [];
  for (const d of lobes) {
    growTree(rng, hilum.clone(), new THREE.Vector3(...d).normalize(), 0.42, radius, 0, maxDepth, side, segments);
  }
  return segments;
}

function tumorRadiusAt(dir: THREE.Vector3) {
  return (
    1 +
    0.17 * Math.sin(4.1 * dir.x + 1.3) * Math.sin(3.7 * dir.y + 0.2) * Math.sin(4.4 * dir.z + 2.2) +
    0.07 * Math.sin(9.3 * dir.x + 0.7) * Math.sin(8.1 * dir.y + 1.9) * Math.sin(8.7 * dir.z + 0.3)
  );
}

/* ---------- atlas layout ---------- */

type Cluster = { x: number; y: number; spread: number };

const ATLAS: Record<CellCategoryId, Cluster> = {
  alveolar: { x: -1.3, y: 0.45, spread: 0.85 },
  airway: { x: -0.55, y: 1.75, spread: 0.4 },
  artery: { x: 0.65, y: 1.75, spread: 0.36 },
  vein: { x: 1.55, y: 1.05, spread: 0.34 },
  lymphocyte: { x: 1.6, y: -0.25, spread: 0.4 },
  macrophage: { x: 0.75, y: -1.15, spread: 0.34 },
  tumorSensitive: { x: -0.65, y: -1.2, spread: 0.45 },
  tumorResistant: { x: -0.05, y: -1.62, spread: 0.3 },
};

/* ---------- flow layout: cell type → pathway → drug ---------- */

const FLOW_X = { cell: -1.9, path: 0, drug: 1.9 };
const FLOW_TOP = 1.75;
const FLOW_SPAN = 3.2;
// Cell types top to bottom, ordered to keep the ribbons from crossing more than they must.
const FLOW_CELL_ORDER: CellCategoryId[] = [
  "tumorSensitive",
  "tumorResistant",
  "lymphocyte",
  "macrophage",
  "artery",
  "vein",
  "airway",
  "alveolar",
];
const evenly = (n: number) => Array.from({ length: n }, (_, k) => FLOW_TOP - (n === 1 ? 0 : (k * FLOW_SPAN) / (n - 1)));
const FLOW_CELL_Y: number[] = (() => {
  const ys = evenly(FLOW_CELL_ORDER.length);
  const out = new Array<number>(CELL_CATEGORIES.length).fill(0);
  FLOW_CELL_ORDER.forEach((id, k) => {
    out[CELL_CATEGORIES.find((c) => c.id === id)!.index] = ys[k];
  });
  return out;
})();
const FLOW_PATH_Y = evenly(PATHWAYS.length);
const FLOW_DRUG_Y = evenly(DRUGS.length);

function fract(x: number) {
  return x - Math.floor(x);
}

/* Same maths as flowPos() in the vertex shader. */
function flowPoint(cat: number, path: number, drug: number, seed: number, time: number, out: THREE.Vector3) {
  const speed = 0.05 * (0.7 + 0.6 * fract(Math.sin(seed * 39.425 + 1.7) * 23421.631));
  const t = fract(seed * 7.31 + time * speed);
  const lane = (fract(Math.sin(seed * 78.233) * 43758.5453) - 0.5) * 2;
  const lane2 = (fract(Math.sin(seed * 12.9898 + 4.1) * 43758.5453) - 0.5) * 2;
  const ease = (v: number) => v * v * (3 - 2 * v);
  let x: number;
  let y: number;
  if (t < 0.5) {
    const k = t * 2;
    x = FLOW_X.cell + (FLOW_X.path - FLOW_X.cell) * k;
    y = FLOW_CELL_Y[cat] + (FLOW_PATH_Y[path] - FLOW_CELL_Y[cat]) * ease(k);
  } else {
    const k = t * 2 - 1;
    x = FLOW_X.path + (FLOW_X.drug - FLOW_X.path) * k;
    y = FLOW_PATH_Y[path] + (FLOW_DRUG_Y[drug] - FLOW_PATH_Y[path]) * ease(k);
  }
  return out.set(x, y + lane * 0.09, lane2 * 0.08);
}

function pickRoute(rng: () => number, category: CellCategoryId): [number, number] {
  const routes = FLOW_ROUTES[category];
  let r = rng();
  for (const [path, drug, weight] of routes) {
    r -= weight;
    if (r <= 0) return [path, drug];
  }
  const last = routes[routes.length - 1];
  return [last[0], last[1]];
}

function atlasPoint(rng: () => number, category: CellCategoryId, subIndex: number, subCount: number, out: THREE.Vector3) {
  const c = ATLAS[category];
  let ox = 0;
  let oy = 0;
  if (subCount > 1) {
    const angle = (2 * Math.PI * subIndex) / subCount + CAT[category];
    ox = Math.cos(angle) * c.spread * 0.42;
    oy = Math.sin(angle) * c.spread * 0.42;
  }
  const s = c.spread * 0.33;
  out.set(c.x + ox + gaussian(rng) * s, c.y + oy + gaussian(rng) * s + 0.1, gaussian(rng) * 0.22);
  return out;
}

/* ---------- point buffer ---------- */

type Builder = {
  anat: number[];
  atlas: number[];
  atlas2: number[];
  cat: number[];
  seed: number[];
  rank: number[];
  flag: number[];
  size: number[];
  subtype: number[];
  node: number[];
  flow: number[];
};

const SUBTYPES_BY_CATEGORY: Record<CellCategoryId, number[]> = Object.fromEntries(
  CELL_CATEGORIES.map((c) => [c.id, CELL_SUBTYPES.map((s, i) => (s.category === c.id ? i : -1)).filter((i) => i >= 0)]),
) as Record<CellCategoryId, number[]>;

function pickSubtype(rng: () => number, category: CellCategoryId) {
  const ids = SUBTYPES_BY_CATEGORY[category];
  let r = rng();
  for (let k = 0; k < ids.length; k++) {
    r -= CELL_SUBTYPES[ids[k]].share;
    if (r <= 0) return k;
  }
  return ids.length - 1;
}

export function buildCells(): Builder {
  const b: Builder = {
    anat: [],
    atlas: [],
    atlas2: [],
    cat: [],
    seed: [],
    rank: [],
    flag: [],
    size: [],
    subtype: [],
    node: [],
    flow: [],
  };
  const rng = mulberry32(20261114);
  const tmp = new THREE.Vector3();
  const at = new THREE.Vector3();
  const at2 = new THREE.Vector3();

  const SIZE: Record<CellCategoryId, number> = {
    alveolar: 0.9,
    airway: 1.05,
    artery: 1.0,
    vein: 1.0,
    tumorSensitive: 1.15,
    tumorResistant: 1.15,
    lymphocyte: 1.3,
    macrophage: 1.55,
  };

  const add = (p: THREE.Vector3, category: CellCategoryId, opts: { flag?: number; rank?: number; node?: number } = {}) => {
    const k = pickSubtype(rng, category);
    const ids = SUBTYPES_BY_CATEGORY[category];
    atlasPoint(rng, category, k, ids.length, at);
    if (category === "tumorSensitive") atlasPoint(rng, "tumorResistant", 0, 1, at2);
    else at2.copy(at);
    b.anat.push(p.x, p.y, p.z);
    b.atlas.push(at.x, at.y, at.z);
    b.atlas2.push(at2.x, at2.y, at2.z);
    b.cat.push(CAT[category]);
    b.seed.push(rng());
    b.rank.push(opts.rank ?? 0);
    b.flag.push(opts.flag ?? 0);
    b.size.push(SIZE[category]);
    b.subtype.push(ids[k]);
    b.node.push(opts.node ?? -1);
    const [path, drug] = pickRoute(rng, category);
    const [path2, drug2] = category === "tumorSensitive" ? pickRoute(rng, "tumorResistant") : [path, drug];
    b.flow.push(path, drug, path2, drug2);
  };

  /* Alveolar epithelium: dense near the pleural surface, lighter inside. */
  for (const side of ["right", "left"] as Side[]) {
    for (let i = 0; i < 15000; i++) {
      randomDirection(rng, tmp).multiplyScalar(1 - Math.pow(rng(), 3) * 0.1);
      shapeLungVertex(tmp, side);
      add(tmp, "alveolar");
    }
    let placed = 0;
    while (placed < 8500) {
      tmp.set(LUNG_CENTER_X[side] + (rng() - 0.5) * 1.8, (rng() - 0.5) * 2.9, (rng() - 0.5) * 1.9);
      if (!insideLung(tmp, side, 0.95)) continue;
      if (tmp.distanceTo(TUMOR_CENTER) < TUMOR_BASE_RADIUS * 1.1) continue;
      add(tmp, "alveolar");
      placed++;
    }
    // Alveolar macrophages roam the air spaces.
    placed = 0;
    while (placed < 700) {
      tmp.set(LUNG_CENTER_X[side] + (rng() - 0.5) * 1.8, (rng() - 0.5) * 2.9, (rng() - 0.5) * 1.9);
      if (!insideLung(tmp, side, 0.9)) continue;
      add(tmp, "macrophage");
      placed++;
    }
  }

  /* Tubes: cells sit on the wall of each airway or vessel segment. */
  const along = (segments: Segment[], category: CellCategoryId, density: number) => {
    const dir = new THREE.Vector3();
    const u = new THREE.Vector3();
    const w = new THREE.Vector3();
    for (const s of segments) {
      dir.copy(s.b).sub(s.a);
      const len = dir.length();
      dir.normalize();
      u.set(dir.y, -dir.x, 0);
      if (u.lengthSq() < 1e-6) u.set(1, 0, 0);
      u.normalize();
      w.copy(dir).cross(u).normalize();
      const n = Math.max(2, Math.round(len * density * (0.45 + s.r / 0.05)));
      for (let i = 0; i < n; i++) {
        const t = rng();
        const theta = rng() * Math.PI * 2;
        const r = s.r * (0.82 - 0.18 * t) * (0.75 + 0.25 * rng());
        tmp.copy(s.a).addScaledVector(dir, t * len);
        tmp.addScaledVector(u, Math.cos(theta) * r).addScaledVector(w, Math.sin(theta) * r);
        add(tmp, category);
      }
    }
  };

  const carina = new THREE.Vector3(0, 0.92, 0);
  const rightHilum = new THREE.Vector3(-0.5, 0.66, 0.0);
  const leftHilum = new THREE.Vector3(0.55, 0.56, 0.0);
  along(
    [
      { a: new THREE.Vector3(0, 2.05, 0.02), b: carina, r: 0.075 },
      { a: carina, b: rightHilum, r: 0.06 },
      { a: carina, b: leftHilum, r: 0.055 },
      ...lobarTree(101, "right", rightHilum, [[-0.45, 0.85, 0.12], [-0.6, -0.25, 0.65], [-0.3, -0.9, -0.25]], 0.045, 7),
      ...lobarTree(202, "left", leftHilum, [[0.45, 0.85, 0.12], [0.6, -0.2, 0.6], [0.3, -0.9, -0.25]], 0.043, 7),
    ],
    "airway",
    330,
  );

  const trunk = new THREE.Vector3(0.12, 0.38, 0.32);
  const rA = rightHilum.clone().add(new THREE.Vector3(0.02, 0.05, -0.1));
  const lA = leftHilum.clone().add(new THREE.Vector3(-0.02, 0.07, -0.1));
  along(
    [
      { a: new THREE.Vector3(0.2, -0.1, 0.38), b: trunk, r: 0.07 },
      { a: trunk, b: rA, r: 0.05 },
      { a: trunk, b: lA, r: 0.05 },
      ...lobarTree(303, "right", rA, [[-0.5, 0.8, 0.0], [-0.65, -0.2, 0.55], [-0.35, -0.9, -0.3]], 0.038, 6),
      ...lobarTree(404, "left", lA, [[0.5, 0.8, 0.0], [0.6, -0.15, 0.5], [0.35, -0.9, -0.3]], 0.036, 6),
    ],
    "artery",
    300,
  );

  const rV = rightHilum.clone().add(new THREE.Vector3(0.03, -0.18, 0.08));
  const lV = leftHilum.clone().add(new THREE.Vector3(-0.03, -0.16, 0.08));
  const atrium = new THREE.Vector3(0.12, -0.12, 0.05);
  along(
    [
      { a: rV, b: atrium, r: 0.04 },
      { a: lV, b: atrium, r: 0.04 },
      ...lobarTree(505, "right", rV, [[-0.55, 0.6, 0.25], [-0.6, -0.5, 0.4], [-0.3, -0.95, 0.05]], 0.034, 6),
      ...lobarTree(606, "left", lV, [[0.55, 0.6, 0.25], [0.6, -0.45, 0.4], [0.3, -0.95, 0.05]], 0.032, 6),
    ],
    "vein",
    300,
  );

  /* Tumour: positions are stored in tumour radii and scaled on the GPU. */
  const TUMOR_CELLS = 5200;
  const ranks = Array.from({ length: TUMOR_CELLS }, (_, i) => (i + 0.5) / TUMOR_CELLS);
  for (let i = ranks.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  const dir = new THREE.Vector3();
  const jitter = new THREE.Vector3();
  for (let i = 0; i < TUMOR_CELLS; i++) {
    if (i < 600) {
      // Spiculated margin: cells streaming outward along thin strands.
      const sr = mulberry32(900 + Math.floor(rng() * 26));
      randomDirection(sr, dir);
      const reach = 0.35 + sr() * 0.55;
      tmp.copy(dir).multiplyScalar(0.9 + rng() * reach);
      jitter.set(gaussian(rng), gaussian(rng), gaussian(rng)).multiplyScalar(0.025);
      tmp.add(jitter);
    } else {
      randomDirection(rng, dir);
      const depth = i % 3 === 0 ? 0.92 + rng() * 0.08 : Math.cbrt(rng());
      tmp.copy(dir).multiplyScalar(tumorRadiusAt(dir) * depth);
    }
    add(tmp, "tumorSensitive", { flag: 1, rank: ranks[i] });
  }

  /* Tumour microenvironment, also in tumour radii. */
  for (let i = 0; i < 1300; i++) {
    randomDirection(rng, dir).multiplyScalar(1.05 + Math.pow(rng(), 1.8) * 2.2);
    add(dir, "lymphocyte", { flag: 1 });
  }
  for (let i = 0; i < 800; i++) {
    randomDirection(rng, dir).multiplyScalar(0.85 + Math.pow(rng(), 1.5) * 1.3);
    add(dir, "macrophage", { flag: 1 });
  }

  /* Lymph nodes: tight balls of lymphocytes with a few macrophages. */
  LYMPH_NODES.forEach((node, index) => {
    const radius = 0.03 + node.shortAxisMm * 0.0034;
    const count = 140 + node.shortAxisMm * 32;
    const centre = new THREE.Vector3(...node.position);
    for (let i = 0; i < count; i++) {
      randomInBall(rng, tmp).multiplyScalar(radius).add(centre);
      add(tmp, i % 9 === 0 ? "macrophage" : "lymphocyte", { node: index });
    }
  });

  return b;
}

/* ---------- shaders ---------- */

const vertexShader = /* glsl */ `
  attribute vec3 aAtlas;
  attribute vec3 aAtlas2;
  attribute float aCat;
  attribute float aSeed;
  attribute float aRank;
  attribute float aFlag;
  attribute float aSize;
  attribute vec4 aFlow;

  uniform float uTime;
  uniform float uFlowMix;
  uniform vec3 uFlowX;
  uniform float uCellY[8];
  uniform float uPathY[6];
  uniform float uDrugY[5];
  uniform float uFlowKeep[8];
  uniform float uMorph;
  uniform float uScale;
  uniform float uPixelRatio;
  uniform float uResist;
  uniform float uTumorRadius;
  uniform vec3 uTumorCenter;
  uniform vec3 uBreath;
  uniform vec3 uBreathCenter;
  uniform vec3 uColors[8];
  uniform float uAlpha[8];

  varying vec3 vColor;
  varying float vAlpha;

  vec3 flowPos(int cat, float path, float drug, float seed) {
    // Independent hashes so lane, depth and speed don't line up into stripes.
    float speed = 0.05 * (0.7 + 0.6 * fract(sin(seed * 39.425 + 1.7) * 23421.631));
    float t = fract(seed * 7.31 + uTime * speed);
    float lane = (fract(sin(seed * 78.233) * 43758.5453) - 0.5) * 2.0;
    float lane2 = (fract(sin(seed * 12.9898 + 4.1) * 43758.5453) - 0.5) * 2.0;
    float y0 = uCellY[cat];
    float y1 = uPathY[int(path + 0.5)];
    float y2 = uDrugY[int(drug + 0.5)];
    float x;
    float y;
    if (t < 0.5) {
      float k = t * 2.0;
      x = mix(uFlowX.x, uFlowX.y, k);
      y = mix(y0, y1, k * k * (3.0 - 2.0 * k));
    } else {
      float k = t * 2.0 - 1.0;
      x = mix(uFlowX.y, uFlowX.z, k);
      y = mix(y1, y2, k * k * (3.0 - 2.0 * k));
    }
    return vec3(x, y + lane * 0.09, lane2 * 0.08);
  }

  void main() {
    vec3 anat = aFlag > 0.5 ? uTumorCenter + position * uTumorRadius : position;
    anat = uBreathCenter + (anat - uBreathCenter) * uBreath;

    int cat = int(aCat + 0.5);
    bool resistant = cat == 3 && aRank < uResist;
    if (resistant) cat = 1;
    vec3 atlas = resistant ? aAtlas2 : aAtlas;

    float t = clamp(uMorph * 1.6 - aSeed * 0.6, 0.0, 1.0);
    float e = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(anat, atlas, e);

    float tf = clamp(uFlowMix * 1.6 - aSeed * 0.6, 0.0, 1.0);
    float ef = tf * tf * (3.0 - 2.0 * tf);
    if (ef > 0.0) {
      vec3 fp = resistant ? flowPos(cat, aFlow.z, aFlow.w, aSeed) : flowPos(cat, aFlow.x, aFlow.y, aSeed);
      p = mix(p, fp, ef);
    }
    p += 0.005 * vec3(
      sin(uTime * 0.9 + aSeed * 40.0),
      cos(uTime * 0.7 + aSeed * 31.0),
      sin(uTime * 0.8 + aSeed * 23.0)
    );

    vColor = uColors[cat];
    float keep = fract(aSeed * 3.17) < uFlowKeep[cat] ? 1.0 : 0.0;
    vAlpha = uAlpha[cat] * mix(1.0, keep, ef);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uScale * uPixelRatio / max(0.05, -mv.z), 1.0, 18.0 * uPixelRatio);
    if (vAlpha < 0.001) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
    }
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.22, 0.0, d);
    gl_FragColor = vec4(vColor * (0.85 + 0.7 * core), a * vAlpha);
  }
`;

const BASE_ALPHA: Record<CellCategoryId, number> = {
  alveolar: 0.42,
  airway: 0.8,
  artery: 0.75,
  vein: 0.75,
  tumorSensitive: 0.6,
  tumorResistant: 0.75,
  lymphocyte: 0.9,
  macrophage: 0.85,
};

/* ---------- scene ---------- */

export function createLungScene(container: HTMLElement, options: LungSceneOptions): LungSceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 100);
  const HOME_TARGET = new THREE.Vector3(0, 0.15, 0);
  const ATLAS_TARGET = new THREE.Vector3(0, 0.15, 0);
  // Pull the camera back on narrow screens so the whole organ or atlas fits.
  const fitDistance = (base: number, halfWidth: number) => {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return Math.max(base, halfWidth / (tanHalf * Math.max(0.2, camera.aspect)));
  };
  const homePosition = () =>
    new THREE.Vector3(0.4, 0.4, 6.4).normalize().multiplyScalar(fitDistance(6.4, 1.95)).add(HOME_TARGET);
  const atlasPosition = () => new THREE.Vector3(0, 0, fitDistance(6.8, 2.45)).add(ATLAS_TARGET);
  const flowPosition = () => new THREE.Vector3(0, 0, fitDistance(7.2, 3.3)).add(ATLAS_TARGET);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.35;
  controls.maxDistance = 11;
  controls.autoRotate = !options.reducedMotion;
  controls.autoRotateSpeed = 0.35;

  /* Build the cells. */
  const cells = buildCells();
  const N = cells.cat.length;
  const anat = new Float32Array(cells.anat);
  const atlas = new Float32Array(cells.atlas);
  const atlas2 = new Float32Array(cells.atlas2);
  const catArr = new Float32Array(cells.cat);
  const seedArr = new Float32Array(cells.seed);
  const rankArr = new Float32Array(cells.rank);
  const flagArr = new Float32Array(cells.flag);
  const subtypeArr = Uint8Array.from(cells.subtype);
  const nodeArr = Int8Array.from(cells.node);
  const flowArr = new Float32Array(cells.flow);

  const counts = Object.fromEntries(CELL_CATEGORIES.map((c) => [c.id, 0])) as Record<CellCategoryId, number>;
  for (let i = 0; i < N; i++) counts[CELL_CATEGORIES[catArr[i]].id]++;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(anat, 3));
  geometry.setAttribute("aAtlas", new THREE.BufferAttribute(atlas, 3));
  geometry.setAttribute("aAtlas2", new THREE.BufferAttribute(atlas2, 3));
  geometry.setAttribute("aCat", new THREE.BufferAttribute(catArr, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seedArr, 1));
  geometry.setAttribute("aRank", new THREE.BufferAttribute(rankArr, 1));
  geometry.setAttribute("aFlag", new THREE.BufferAttribute(flagArr, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(cells.size), 1));
  geometry.setAttribute("aFlow", new THREE.BufferAttribute(flowArr, 4));
  // Positions move on the GPU, so give the culling sphere generous bounds.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.2, 0), 6);

  const alpha = CELL_CATEGORIES.map((c) => BASE_ALPHA[c.id]);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uScale: { value: 15 },
      uPixelRatio: { value: pixelRatio },
      uResist: { value: 0 },
      uTumorRadius: { value: TUMOR_BASE_RADIUS },
      uTumorCenter: { value: TUMOR_CENTER.clone() },
      uBreath: { value: new THREE.Vector3(1, 1, 1) },
      uBreathCenter: { value: BREATH_CENTER.clone() },
      uColors: { value: CELL_CATEGORIES.map((c) => new THREE.Color(c.color)) },
      uAlpha: { value: alpha },
      uFlowMix: { value: 0 },
      uFlowX: { value: new THREE.Vector3(FLOW_X.cell, FLOW_X.path, FLOW_X.drug) },
      uCellY: { value: FLOW_CELL_Y },
      uPathY: { value: FLOW_PATH_Y },
      uDrugY: { value: FLOW_DRUG_Y },
      uFlowKeep: { value: CELL_CATEGORIES.map((c) => FLOW_KEEP[c.id]) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* Hover marker: one bright ring that follows the hovered cell. */
  const markerGeometry = new THREE.BufferGeometry();
  markerGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
  const markerMaterial = new THREE.ShaderMaterial({
    uniforms: { uSize: { value: 22 * pixelRatio } },
    vertexShader: /* glsl */ `
      uniform float uSize;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize;
      }
    `,
    fragmentShader: /* glsl */ `
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.3, 0.38, d);
        if (ring < 0.01) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, ring);
      }
    `,
    transparent: true,
    depthTest: false,
  });
  const marker = new THREE.Points(markerGeometry, markerMaterial);
  marker.renderOrder = 10;
  marker.visible = false;
  marker.frustumCulled = false;
  scene.add(marker);

  /* Selection reticle (billboarded ring) for the tumour or a node. */
  const reticleMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0fdf4,
    transparent: true,
    opacity: 0.8,
    depthTest: false,
    side: THREE.DoubleSide,
  });
  const reticleGeometry = new THREE.RingGeometry(1, 1.05, 64);
  const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
  reticle.renderOrder = 11;
  reticle.visible = false;
  scene.add(reticle);

  /* Direct labels for atlas clusters. */
  const labelLayer = document.createElement("div");
  labelLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
  container.appendChild(labelLayer);
  const labels = CELL_CATEGORIES.map((c) => {
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute;left:0;top:0;white-space:nowrap;font:600 11px/1.2 ui-sans-serif,system-ui,sans-serif;color:#e2e8f0;text-shadow:0 1px 6px #000,0 0 2px #000;opacity:0;display:flex;align-items:center;gap:6px;";
    const dot = document.createElement("span");
    dot.style.cssText = `width:8px;height:8px;border-radius:999px;background:${c.color};display:inline-block;`;
    const text = document.createElement("span");
    el.append(dot, text);
    labelLayer.appendChild(el);
    return { id: c.id, el, text };
  });

  /* Labels for the flow view: cell types on the left, pathways in the middle, drugs on the right. */
  type FlowLabel = { el: HTMLDivElement; x: number; y: number; align: "left" | "center" | "right" };
  const flowLabels: FlowLabel[] = [];
  const makeFlowLabel = (text: string, x: number, y: number, align: FlowLabel["align"], color?: string, sub?: string) => {
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute;left:0;top:0;white-space:nowrap;font:600 11px/1.25 ui-sans-serif,system-ui,sans-serif;color:#f1f5f9;text-shadow:0 1px 6px #000,0 0 2px #000;opacity:0;display:flex;align-items:center;gap:6px;";
    if (color) {
      const dot = document.createElement("span");
      dot.style.cssText = `width:8px;height:8px;border-radius:999px;background:${color};display:inline-block;flex:none;`;
      el.appendChild(dot);
    }
    const body = document.createElement("span");
    body.textContent = text;
    if (sub) {
      const small = document.createElement("span");
      small.textContent = sub;
      small.style.cssText = "display:block;font:500 9px/1.2 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;";
      const wrap = document.createElement("span");
      wrap.append(small, body);
      el.appendChild(wrap);
    } else {
      el.appendChild(body);
    }
    labelLayer.appendChild(el);
    flowLabels.push({ el, x, y, align });
  };
  FLOW_CELL_ORDER.forEach((id) => {
    const c = CELL_CATEGORIES.find((cat) => cat.id === id)!;
    makeFlowLabel(c.label, FLOW_X.cell - 0.08, FLOW_CELL_Y[c.index], "right", c.color);
  });
  PATHWAYS.forEach((p, k) => makeFlowLabel(p.label, FLOW_X.path, FLOW_PATH_Y[k] + 0.17, "center", undefined, k === 0 ? "Pathway" : undefined));
  DRUGS.forEach((d, k) => makeFlowLabel(d.label, FLOW_X.drug + 0.08, FLOW_DRUG_Y[k], "left", undefined, k === 0 ? "Drug" : undefined));

  /* ---------- state ---------- */

  let tumorScale = 1;
  let resistant = 0;
  let selected: PickId | null = null;
  let breathing = !options.reducedMotion;
  let view: ViewMode = "anatomy";
  // Two blend weights: anatomy↔atlas and (anything)↔flow.
  type Blend = { value: number; from: number; to: number; start: number };
  const atlasBlend: Blend = { value: 0, from: 0, to: 0, start: 0 };
  const flowBlend: Blend = { value: 0, from: 0, to: 0, start: 0 };
  const MORPH_MS = options.reducedMotion ? 1 : 2600;
  const startBlend = (blend: Blend, to: number) => {
    blend.from = blend.value;
    blend.to = to;
    blend.start = performance.now();
  };
  const stepBlend = (blend: Blend, now: number) => {
    const t = Math.min(1, (now - blend.start) / MORPH_MS);
    blend.value = blend.from + (blend.to - blend.from) * t;
  };
  let animTime = 0;
  let fly: {
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    duration: number;
  } | null = null;
  const breath = new THREE.Vector3(1, 1, 1);

  const tumorRadius = () => TUMOR_BASE_RADIUS * tumorScale;

  const isResistant = (i: number) => catArr[i] === CAT.tumorSensitive && rankArr[i] < resistant;
  const effectiveCat = (i: number) => (isResistant(i) ? CAT.tumorResistant : catArr[i]);

  const refreshLabels = () => {
    let nRes = 0;
    for (let i = 0; i < N; i++) if (isResistant(i)) nRes++;
    for (const l of labels) {
      let n = counts[l.id];
      if (l.id === "tumorSensitive") n -= nRes;
      if (l.id === "tumorResistant") n = nRes;
      l.text.textContent = `${CELL_CATEGORIES[CAT[l.id]].label} · ${n.toLocaleString("en-US")}`;
    }
  };
  refreshLabels();

  /* CPU mirror of the vertex shader, for hover, picking and markers. */
  const flowScratch = new THREE.Vector3();
  const cellPosition = (i: number, out: THREE.Vector3) => {
    const j = i * 3;
    if (flagArr[i] > 0.5) {
      const r = tumorRadius();
      out.set(TUMOR_CENTER.x + anat[j] * r, TUMOR_CENTER.y + anat[j + 1] * r, TUMOR_CENTER.z + anat[j + 2] * r);
    } else {
      out.set(anat[j], anat[j + 1], anat[j + 2]);
    }
    out.sub(BREATH_CENTER).multiply(breath).add(BREATH_CENTER);
    const stagger = (v: number) => {
      const t = Math.min(1, Math.max(0, v * 1.6 - seedArr[i] * 0.6));
      return t * t * (3 - 2 * t);
    };
    const e = stagger(atlasBlend.value);
    if (e > 0) {
      const src = isResistant(i) ? atlas2 : atlas;
      out.x += (src[j] - out.x) * e;
      out.y += (src[j + 1] - out.y) * e;
      out.z += (src[j + 2] - out.z) * e;
    }
    const ef = stagger(flowBlend.value);
    if (ef > 0) {
      const [path, drug] = flowRoute(i);
      flowPoint(effectiveCat(i), path, drug, seedArr[i], animTime, flowScratch);
      out.lerp(flowScratch, ef);
    }
    return out;
  };

  const flowRoute = (i: number): [number, number] =>
    isResistant(i) ? [flowArr[i * 4 + 2], flowArr[i * 4 + 3]] : [flowArr[i * 4], flowArr[i * 4 + 1]];

  /* Is the cell drawn at all right now (hidden type, or thinned out in the flow view)? */
  const isDrawn = (i: number) => {
    const cat = effectiveCat(i);
    if (alpha[cat] < 0.001) return false;
    if (flowBlend.value > 0.5 && fract(seedArr[i] * 3.17) >= FLOW_KEEP[CELL_CATEGORIES[cat].id]) return false;
    return true;
  };

  const describe = (i: number): Omit<HoverInfo, "x" | "y"> => {
    const category = CELL_CATEGORIES[effectiveCat(i)];
    const title = isResistant(i) ? RESISTANT_SUBTYPE_LABEL : CELL_SUBTYPES[subtypeArr[i]].label;
    let where: string;
    if (nodeArr[i] >= 0) {
      const node = LYMPH_NODES[nodeArr[i]];
      where = `Lymph node ${node.station} · ${node.name}`;
    } else if (flagArr[i] > 0.5) {
      where = catArr[i] === CAT.tumorSensitive ? "Primary tumour, right upper lobe" : "Tumour microenvironment";
    } else {
      const j = i * 3;
      const x = anat[j];
      const y = anat[j + 1];
      const z = anat[j + 2];
      if (Math.abs(x) < 0.3 && y > 0.85) where = "Trachea";
      else if (x < 0) where = y > 0.45 ? "Right upper lobe" : y > -0.1 && z > 0 ? "Right middle lobe" : "Right lower lobe";
      else where = y > 0.15 ? "Left upper lobe" : "Left lower lobe";
    }
    if (flowBlend.value > 0.5) {
      const [path, drug] = flowRoute(i);
      return { title, detail: `${PATHWAYS[path].label} → ${DRUGS[drug].label} · ${where}`, color: category.color };
    }
    return { title, detail: `${category.label} · ${where}`, color: category.color };
  };

  const worldPositionOf = (id: PickId) => {
    let p: THREE.Vector3;
    if (id === "tumor") p = TUMOR_CENTER.clone();
    else {
      const node = LYMPH_NODES.find((n) => `node:${n.station}` === id);
      p = node ? new THREE.Vector3(...node.position) : HOME_TARGET.clone();
    }
    return p.sub(BREATH_CENTER).multiply(breath).add(BREATH_CENTER);
  };

  const flyTo = (toPos: THREE.Vector3, toTarget: THREE.Vector3) => {
    fly = {
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos,
      toTarget,
      start: performance.now(),
      duration: options.reducedMotion ? 1 : 1400,
    };
  };

  /* ---------- pointer handling ---------- */

  let pointerX = 0;
  let pointerY = 0;
  let pointerInside = false;
  let pickDirty = false;
  let hovered = -1;
  let downX = 0;
  let downY = 0;
  const proj = new THREE.Vector3();

  const pickAt = (px: number, py: number) => {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    let best = -1;
    let bestScore = 81; // within 9 px
    for (let i = 0; i < N; i++) {
      if (!isDrawn(i)) continue;
      cellPosition(i, proj).project(camera);
      if (proj.z > 1 || proj.z < -1) continue;
      const dx = ((proj.x + 1) / 2) * w - px;
      const dy = ((1 - proj.y) / 2) * h - py;
      const d = dx * dx + dy * dy;
      if (d < bestScore) {
        bestScore = d;
        best = i;
      }
    }
    return best;
  };

  const onPointerDown = (event: PointerEvent) => {
    downX = event.clientX;
    downY = event.clientY;
    controls.autoRotate = false;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > 5) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const i = pickAt(event.clientX - rect.left, event.clientY - rect.top);
    if (i < 0) return;
    if (nodeArr[i] >= 0) options.onPick(`node:${LYMPH_NODES[nodeArr[i]].station}`);
    else if (flagArr[i] > 0.5) options.onPick("tumor");
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.buttons !== 0) {
      if (hovered >= 0) {
        hovered = -1;
        options.onHover(null);
      }
      return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    pointerInside = true;
    pickDirty = true;
  };
  const onPointerLeave = () => {
    pointerInside = false;
    hovered = -1;
    options.onHover(null);
  };

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerleave", onPointerLeave);

  /* ---------- sizing & loop ---------- */

  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  camera.position.copy(homePosition());
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const startTime = performance.now();
  let lastPick = 0;
  let frame = 0;
  const scratch = new THREE.Vector3();

  const tick = () => {
    frame = requestAnimationFrame(tick);
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;

    stepBlend(atlasBlend, now);
    stepBlend(flowBlend, now);
    const away = Math.max(atlasBlend.value, flowBlend.value);
    animTime = options.reducedMotion ? 0 : elapsed;

    // Breathing: ~14 breaths per minute, fading out away from the anatomy view.
    const b = breathing ? Math.sin((elapsed * Math.PI * 2) / 4.3) * (1 - away) : 0;
    breath.set(1 + 0.022 * b, 1 + 0.03 * b, 1 + 0.022 * b);

    const pulse = options.reducedMotion ? 1 : 1 + 0.018 * Math.sin(elapsed * 2.6);
    const u = material.uniforms;
    u.uTime.value = animTime;
    u.uMorph.value = atlasBlend.value;
    u.uFlowMix.value = flowBlend.value;
    u.uResist.value = resistant;
    u.uTumorRadius.value = tumorRadius() * pulse;
    (u.uBreath.value as THREE.Vector3).copy(breath);

    if (fly) {
      const t = Math.min(1, (now - fly.start) / fly.duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(fly.fromPos, fly.toPos, e);
      controls.target.lerpVectors(fly.fromTarget, fly.toTarget, e);
      if (t >= 1) fly = null;
    }
    controls.update();

    // Hover picking, at most every 50 ms.
    if (pointerInside && pickDirty && now - lastPick > 50) {
      pickDirty = false;
      lastPick = now;
      const i = pickAt(pointerX, pointerY);
      if (i !== hovered) {
        hovered = i;
        renderer.domElement.style.cursor = i >= 0 && (nodeArr[i] >= 0 || flagArr[i] > 0.5) ? "pointer" : "grab";
      }
      options.onHover(i >= 0 ? { ...describe(i), x: pointerX, y: pointerY } : null);
    }
    if (hovered >= 0) {
      cellPosition(hovered, scratch);
      const attr = markerGeometry.attributes.position as THREE.BufferAttribute;
      attr.setXYZ(0, scratch.x, scratch.y, scratch.z);
      attr.needsUpdate = true;
      marker.visible = true;
    } else {
      marker.visible = false;
    }

    // Selection reticle only makes sense in the anatomical view.
    if (selected && away < 0.5) {
      reticle.visible = true;
      reticle.position.copy(worldPositionOf(selected));
      reticle.quaternion.copy(camera.quaternion);
      const r = selected === "tumor" ? tumorRadius() * 2.2 : 0.09;
      reticle.scale.setScalar(r * (1 + 0.04 * Math.sin(elapsed * 3)));
      reticleMaterial.opacity = 0.8 * (1 - away * 2);
    } else {
      reticle.visible = false;
    }

    // Atlas labels follow their cluster centres.
    const labelAlpha = Math.max(0, (atlasBlend.value - 0.6) / 0.4) * (1 - flowBlend.value);
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    for (const l of labels) {
      const c = ATLAS[l.id];
      if (labelAlpha <= 0 || alpha[CAT[l.id]] < 0.001) {
        l.el.style.opacity = "0";
        continue;
      }
      scratch.set(c.x, c.y + 0.1 + c.spread * 0.85, 0).project(camera);
      l.el.style.opacity = String(labelAlpha);
      l.el.style.transform = `translate(${((scratch.x + 1) / 2) * w}px, ${((1 - scratch.y) / 2) * h}px) translate(-50%, -50%)`;
    }

    const flowAlpha = Math.max(0, (flowBlend.value - 0.6) / 0.4);
    for (const l of flowLabels) {
      if (flowAlpha <= 0) {
        l.el.style.opacity = "0";
        continue;
      }
      scratch.set(l.x, l.y, 0).project(camera);
      const shift = l.align === "right" ? "-100%" : l.align === "center" ? "-50%" : "0%";
      l.el.style.opacity = String(flowAlpha);
      l.el.style.transform = `translate(${((scratch.x + 1) / 2) * w}px, ${((1 - scratch.y) / 2) * h}px) translate(${shift}, -50%)`;
    }

    renderer.render(scene, camera);
  };
  tick();

  /* ---------- handle ---------- */

  return {
    counts,
    setCategoryVisible(id, visible) {
      alpha[CAT[id]] = visible ? BASE_ALPHA[id] : 0;
      material.uniforms.uAlpha.value = alpha;
    },
    setView(next) {
      if (next === view) return;
      view = next;
      controls.autoRotate = next === "anatomy" && !options.reducedMotion;
      if (next === "anatomy") {
        startBlend(atlasBlend, 0);
        startBlend(flowBlend, 0);
        flyTo(homePosition(), HOME_TARGET.clone());
      } else if (next === "atlas") {
        startBlend(atlasBlend, 1);
        startBlend(flowBlend, 0);
        flyTo(atlasPosition(), ATLAS_TARGET.clone());
      } else {
        startBlend(flowBlend, 1);
        flyTo(flowPosition(), ATLAS_TARGET.clone());
      }
    },
    setTumorState(scale, resistantFraction) {
      tumorScale = scale;
      resistant = Math.min(1, Math.max(0, resistantFraction));
      refreshLabels();
    },
    setSelected(id) {
      selected = id;
    },
    setBreathing(on) {
      breathing = on;
    },
    focusTumor() {
      controls.autoRotate = false;
      let target: THREE.Vector3;
      if (view === "atlas") target = new THREE.Vector3(ATLAS.tumorSensitive.x, ATLAS.tumorSensitive.y + 0.1, 0);
      else if (view === "flow") target = new THREE.Vector3(FLOW_X.cell, FLOW_CELL_Y[CAT.tumorSensitive], 0);
      else target = worldPositionOf("tumor");
      const offset = new THREE.Vector3(-0.55, 0.22, 1.0).normalize().multiplyScalar(0.7 + tumorScale * 0.35);
      flyTo(target.clone().add(offset), target);
    },
    resetView() {
      controls.autoRotate = !options.reducedMotion && view === "anatomy";
      if (view === "atlas") flyTo(atlasPosition(), ATLAS_TARGET.clone());
      else if (view === "flow") flyTo(flowPosition(), ATLAS_TARGET.clone());
      else flyTo(homePosition(), HOME_TARGET.clone());
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      reticleGeometry.dispose();
      reticleMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
    },
  };
}
