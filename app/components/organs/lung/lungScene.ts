/*
  Procedural "living lung" scene in plain three.js.

  Everything here is generated from code: two lungs shaped from deformed
  spheres, branching airway and vessel trees grown inside them, a lumpy
  spiculated tumour in the right upper lobe, hilar/mediastinal lymph nodes
  and a tumour microenvironment that fades in as the camera flies close.

  It is an anatomical illustration, not a segmentation of a real CT. The
  public data pipeline (LIDC-IDRI + TotalSegmentator) is the next step and
  will replace the procedural meshes with patient-derived ones.
*/

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

import { LYMPH_NODES } from "./lungNodes";

export type LayerId = "parenchyma" | "airways" | "vessels" | "tumor" | "nodes" | "tme";

export type PickId = "tumor" | `node:${string}`;

export type LungSceneOptions = {
  reducedMotion: boolean;
  onPick: (id: PickId) => void;
  onHover: (hover: { label: string; x: number; y: number } | null) => void;
};

export type LungSceneHandle = {
  setLayerVisible: (id: LayerId, visible: boolean) => void;
  setTumorState: (scale: number, resistantFraction: number) => void;
  setSelected: (id: PickId | null) => void;
  setBreathing: (on: boolean) => void;
  focusTumor: () => void;
  resetView: () => void;
  dispose: () => void;
};

/* ---------- small helpers ---------- */

type Side = "right" | "left";

// Patient's right is on the viewer's left in a frontal view.
const LUNG_CENTER_X: Record<Side, number> = { right: -0.95, left: 0.95 };
const TUMOR_POSITION = new THREE.Vector3(-1.05, 0.85, 0.18);
const TUMOR_BASE_RADIUS = 0.16;

const COLOR = {
  parenchyma: 0x5eead4,
  alveoli: 0x7dd3fc,
  airway: 0x34f5a0,
  artery: 0xff5c8a,
  vein: 0xa78bfa,
  heart: 0xfb7185,
  tumorSensitive: new THREE.Color(0xffb347),
  tumorResistant: new THREE.Color(0xff3d6e),
  nodeSuspicious: 0xffb347,
  nodeBenign: 0x7dd3fc,
  cancerCell: 0xffc56b,
  tCell: 0x4ade80,
  macrophage: 0xc084fc,
};

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

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function medialFactor(side: Side, y: number) {
  // The left lung is cut deeper by the heart (cardiac notch), mostly low down.
  if (side === "left") return y < 0.2 ? 0.38 : 0.5;
  return 0.6;
}

/* Map a point on the unit sphere onto the lung surface. */
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

function fresnelMaterial(
  color: THREE.ColorRepresentation,
  { base = 0.04, power = 2.4, intensity = 1.0, opacity = 1.0 } = {},
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uBase: { value: base },
      uPower: { value: power },
      uIntensity: { value: intensity },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uBase;
      uniform float uPower;
      uniform float uIntensity;
      uniform float uOpacity;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        float a = (uBase + f * uIntensity) * uOpacity;
        gl_FragColor = vec4(uColor * (0.55 + f * 1.25), clamp(a, 0.0, 1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function particleMaterial(color: THREE.ColorRepresentation, size: number, motion: number, opacity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uMotion: { value: motion },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uSize;
      uniform float uMotion;
      uniform float uPixelRatio;
      void main() {
        vec3 p = position + uMotion * vec3(
          sin(uTime * 0.7 + aSeed * 6.2831),
          cos(uTime * 0.55 + aSeed * 12.566),
          sin(uTime * 0.63 + aSeed * 3.1416)
        );
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uPixelRatio * (0.75 + 0.5 * fract(aSeed * 7.13)) / max(0.05, -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function pointsFromPositions(positions: number[], material: THREE.ShaderMaterial, rng: () => number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const seeds = new Float32Array(positions.length / 3);
  for (let i = 0; i < seeds.length; i++) seeds[i] = rng();
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return new THREE.Points(geometry, material);
}

function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number) {
  const length = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r1, r0, length, 7, 1, true);
  g.translate(0, length / 2, 0);
  const dir = b.clone().sub(a).normalize();
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
  g.translate(a.x, a.y, a.z);
  return g;
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
    // Steer toward an unclaimed point of lung ahead of us so the tree fills the organ.
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

function treeGeometry(segments: Segment[]) {
  const parts = segments.map((s) => cylinderBetween(s.a, s.b, s.r, s.r * 0.82));
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  return merged ?? new THREE.BufferGeometry();
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
  const HOME_POSITION = new THREE.Vector3(0.4, 0.55, 6.4);
  const HOME_TARGET = new THREE.Vector3(0, 0.15, 0);
  camera.position.copy(HOME_POSITION);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.45;
  controls.maxDistance = 11;
  controls.autoRotate = !options.reducedMotion;
  controls.autoRotateSpeed = 0.35;

  scene.add(new THREE.AmbientLight(0xbfe9ff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 3, 4);
  scene.add(key);
  const tumorLight = new THREE.PointLight(0xffb347, 2.2, 1.6, 2);
  tumorLight.position.copy(TUMOR_POSITION).add(new THREE.Vector3(0.1, 0.1, 0.25));
  scene.add(tumorLight);

  // Everything that breathes lives in one group.
  const thorax = new THREE.Group();
  scene.add(thorax);

  const layers: Record<LayerId, THREE.Group> = {
    parenchyma: new THREE.Group(),
    airways: new THREE.Group(),
    vessels: new THREE.Group(),
    tumor: new THREE.Group(),
    nodes: new THREE.Group(),
    tme: new THREE.Group(),
  };
  const layerVisible: Record<LayerId, boolean> = {
    parenchyma: true,
    airways: true,
    vessels: true,
    tumor: true,
    nodes: true,
    tme: true,
  };
  for (const g of Object.values(layers)) thorax.add(g);

  const particleMaterials: THREE.ShaderMaterial[] = [];

  /* Parenchyma: glowing shells plus a cloud of alveolar points. */
  const parenchymaMaterial = fresnelMaterial(COLOR.parenchyma, { base: 0.025, power: 2.2, intensity: 0.9, opacity: 0.85 });
  const alveoliMaterial = particleMaterial(COLOR.alveoli, 9, 0, 0.32);
  particleMaterials.push(alveoliMaterial);
  for (const side of ["right", "left"] as Side[]) {
    const g = new THREE.SphereGeometry(1, 128, 96);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      shapeLungVertex(v, side);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    layers.parenchyma.add(new THREE.Mesh(g, parenchymaMaterial));

    const rng = mulberry32(side === "right" ? 11 : 23);
    const pts: number[] = [];
    const p = new THREE.Vector3();
    let guard = 0;
    while (pts.length < 3800 * 3 && guard++ < 60000) {
      p.set(LUNG_CENTER_X[side] + (rng() - 0.5) * 1.8, (rng() - 0.5) * 2.9, (rng() - 0.5) * 1.9);
      if (insideLung(p, side, 0.95)) pts.push(p.x, p.y, p.z);
    }
    layers.parenchyma.add(pointsFromPositions(pts, alveoliMaterial, rng));
  }

  // Faint heart silhouette for anatomical context (not a layer).
  const heartGeometry = new THREE.SphereGeometry(1, 64, 48);
  {
    const pos = heartGeometry.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const taper = 1 - 0.25 * Math.max(0, -v.y);
      pos.setXYZ(i, v.x * 0.55 * taper, v.y * 0.62, v.z * 0.5 * taper);
    }
    heartGeometry.computeVertexNormals();
  }
  const heart = new THREE.Mesh(heartGeometry, fresnelMaterial(COLOR.heart, { base: 0.01, intensity: 0.35, opacity: 0.6 }));
  heart.position.set(0.22, -0.32, 0.22);
  heart.rotation.z = -0.5;
  thorax.add(heart);

  /* Airways: trachea, main bronchi and lobar trees. */
  const airwayMaterial = fresnelMaterial(COLOR.airway, { base: 0.22, power: 1.6, intensity: 0.9, opacity: 0.9 });
  const carina = new THREE.Vector3(0, 0.92, 0);
  const rightHilum = new THREE.Vector3(-0.5, 0.66, 0.0);
  const leftHilum = new THREE.Vector3(0.55, 0.56, 0.0);
  const airwaySegments: Segment[] = [
    { a: new THREE.Vector3(0, 2.05, 0.02), b: carina, r: 0.075 },
    { a: carina, b: rightHilum, r: 0.06 },
    { a: carina, b: leftHilum, r: 0.055 },
    ...lobarTree(101, "right", rightHilum, [[-0.45, 0.85, 0.12], [-0.6, -0.25, 0.65], [-0.3, -0.9, -0.25]], 0.045, 7),
    ...lobarTree(202, "left", leftHilum, [[0.45, 0.85, 0.12], [0.6, -0.2, 0.6], [0.3, -0.9, -0.25]], 0.043, 7),
  ];
  layers.airways.add(new THREE.Mesh(treeGeometry(airwaySegments), airwayMaterial));

  /* Vessels: pulmonary arteries (rose) and veins (violet). */
  const arteryMaterial = fresnelMaterial(COLOR.artery, { base: 0.18, power: 1.6, intensity: 0.8, opacity: 0.75 });
  const veinMaterial = fresnelMaterial(COLOR.vein, { base: 0.16, power: 1.6, intensity: 0.8, opacity: 0.65 });
  const trunk = new THREE.Vector3(0.12, 0.38, 0.32);
  const rA = rightHilum.clone().add(new THREE.Vector3(0.02, 0.05, -0.1));
  const lA = leftHilum.clone().add(new THREE.Vector3(-0.02, 0.07, -0.1));
  const arterySegments: Segment[] = [
    { a: new THREE.Vector3(0.2, -0.1, 0.38), b: trunk, r: 0.07 },
    { a: trunk, b: rA, r: 0.05 },
    { a: trunk, b: lA, r: 0.05 },
    ...lobarTree(303, "right", rA, [[-0.5, 0.8, 0.0], [-0.65, -0.2, 0.55], [-0.35, -0.9, -0.3]], 0.038, 6),
    ...lobarTree(404, "left", lA, [[0.5, 0.8, 0.0], [0.6, -0.15, 0.5], [0.35, -0.9, -0.3]], 0.036, 6),
  ];
  const rV = rightHilum.clone().add(new THREE.Vector3(0.03, -0.18, 0.08));
  const lV = leftHilum.clone().add(new THREE.Vector3(-0.03, -0.16, 0.08));
  const atrium = new THREE.Vector3(0.12, -0.12, 0.05);
  const veinSegments: Segment[] = [
    { a: rV, b: atrium, r: 0.04 },
    { a: lV, b: atrium, r: 0.04 },
    ...lobarTree(505, "right", rV, [[-0.55, 0.6, 0.25], [-0.6, -0.5, 0.4], [-0.3, -0.95, 0.05]], 0.034, 6),
    ...lobarTree(606, "left", lV, [[0.55, 0.6, 0.25], [0.6, -0.45, 0.4], [0.3, -0.95, 0.05]], 0.032, 6),
  ];
  layers.vessels.add(new THREE.Mesh(treeGeometry(arterySegments), arteryMaterial));
  layers.vessels.add(new THREE.Mesh(treeGeometry(veinSegments), veinMaterial));

  /* Tumour: lumpy core, spiculated margin, glow shell, cancer cells inside. */
  const tumorGroup = new THREE.Group();
  tumorGroup.position.copy(TUMOR_POSITION);
  tumorGroup.scale.setScalar(TUMOR_BASE_RADIUS);
  layers.tumor.add(tumorGroup);

  let coreGeometry: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 5);
  coreGeometry.deleteAttribute("uv");
  coreGeometry.deleteAttribute("normal");
  coreGeometry = mergeVertices(coreGeometry);
  {
    const pos = coreGeometry.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        0.17 * Math.sin(4.1 * v.x + 1.3) * Math.sin(3.7 * v.y + 0.2) * Math.sin(4.4 * v.z + 2.2) +
        0.07 * Math.sin(9.3 * v.x + 0.7) * Math.sin(8.1 * v.y + 1.9) * Math.sin(8.7 * v.z + 0.3) +
        0.03 * Math.sin(17.0 * v.x) * Math.sin(15.0 * v.z + 1.0);
      v.multiplyScalar(1 + n);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    coreGeometry.computeVertexNormals();
  }
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: COLOR.tumorSensitive.clone(),
    emissive: COLOR.tumorSensitive.clone(),
    emissiveIntensity: 0.55,
    roughness: 0.45,
    metalness: 0.05,
    transparent: true,
    opacity: 1,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.userData.pick = "tumor" satisfies PickId;
  tumorGroup.add(core);

  const shellMaterial = fresnelMaterial(COLOR.tumorSensitive, { base: 0.02, power: 1.8, intensity: 1.3, opacity: 0.9 });
  const shell = new THREE.Mesh(coreGeometry, shellMaterial);
  shell.scale.setScalar(1.12);
  tumorGroup.add(shell);

  const spiculeRng = mulberry32(77);
  const spiculeParts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 26; i++) {
    const dir = new THREE.Vector3(spiculeRng() - 0.5, spiculeRng() - 0.5, spiculeRng() - 0.5).normalize();
    const length = 0.35 + spiculeRng() * 0.55;
    const g = new THREE.ConeGeometry(0.035 + spiculeRng() * 0.03, length, 6, 1, true);
    g.translate(0, length / 2 + 0.85, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
    spiculeParts.push(g);
  }
  const spiculeGeometry = mergeGeometries(spiculeParts, false) ?? new THREE.BufferGeometry();
  for (const p of spiculeParts) p.dispose();
  const spiculeMaterial = fresnelMaterial(COLOR.tumorSensitive, { base: 0.3, power: 1.4, intensity: 0.8, opacity: 0.8 });
  tumorGroup.add(new THREE.Mesh(spiculeGeometry, spiculeMaterial));

  const cancerRng = mulberry32(909);
  const cancerPts: number[] = [];
  while (cancerPts.length < 1400 * 3) {
    const x = cancerRng() * 2 - 1;
    const y = cancerRng() * 2 - 1;
    const z = cancerRng() * 2 - 1;
    if (x * x + y * y + z * z < 1) cancerPts.push(x * 1.05, y * 1.05, z * 1.05);
  }
  const cancerMaterial = particleMaterial(COLOR.cancerCell, 7, 0.01, 0);
  particleMaterials.push(cancerMaterial);
  const cancerCells = pointsFromPositions(cancerPts, cancerMaterial, cancerRng);
  tumorGroup.add(cancerCells);

  /* Tumour microenvironment: T cells and macrophages around the tumour. */
  const tmeGroup = new THREE.Group();
  tmeGroup.position.copy(TUMOR_POSITION);
  layers.tme.add(tmeGroup);
  const tmeRng = mulberry32(4242);
  const shellPoints = (count: number, rMin: number, rMax: number) => {
    const out: number[] = [];
    while (out.length < count * 3) {
      const d = new THREE.Vector3(tmeRng() - 0.5, tmeRng() - 0.5, tmeRng() - 0.5);
      if (d.lengthSq() < 1e-4) continue;
      d.normalize().multiplyScalar(rMin + Math.pow(tmeRng(), 0.7) * (rMax - rMin));
      out.push(d.x, d.y, d.z);
    }
    return out;
  };
  const tCellMaterial = particleMaterial(COLOR.tCell, 7, 0.025, 0);
  const macrophageMaterial = particleMaterial(COLOR.macrophage, 10, 0.008, 0);
  particleMaterials.push(tCellMaterial, macrophageMaterial);
  tmeGroup.add(pointsFromPositions(shellPoints(520, 0.14, 0.55), tCellMaterial, tmeRng));
  tmeGroup.add(pointsFromPositions(shellPoints(260, 0.12, 0.4), macrophageMaterial, tmeRng));

  /* Lymph nodes. */
  const nodeGeometry = new THREE.SphereGeometry(1, 24, 18);
  const nodeMeshes = new Map<string, THREE.Mesh>();
  for (const node of LYMPH_NODES) {
    const suspicious = node.status === "suspicious";
    const color = suspicious ? COLOR.nodeSuspicious : COLOR.nodeBenign;
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: suspicious ? 0.7 : 0.35,
      roughness: 0.5,
    });
    const mesh = new THREE.Mesh(nodeGeometry, material);
    mesh.position.set(...node.position);
    mesh.scale.setScalar(0.02 + node.shortAxisMm * 0.0028);
    mesh.userData.pick = `node:${node.station}` satisfies PickId;
    mesh.userData.baseScale = mesh.scale.x;
    nodeMeshes.set(node.station, mesh);
    layers.nodes.add(mesh);
  }

  /* Selection reticle (billboarded ring). */
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(1, 1.06, 64),
    new THREE.MeshBasicMaterial({ color: 0xe0fdf4, transparent: true, opacity: 0.85, depthTest: false, side: THREE.DoubleSide }),
  );
  reticle.renderOrder = 10;
  reticle.visible = false;
  scene.add(reticle);

  /* ---------- state ---------- */

  let tumorScale = 1;
  let resistant = 0;
  let selected: PickId | null = null;
  let breathing = !options.reducedMotion;
  let fly: {
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    duration: number;
  } | null = null;

  const pickables = (): THREE.Object3D[] => {
    const out: THREE.Object3D[] = [];
    if (layerVisible.tumor) out.push(core);
    if (layerVisible.nodes) out.push(...nodeMeshes.values());
    return out;
  };

  const worldPositionOf = (id: PickId) => {
    const v = new THREE.Vector3();
    if (id === "tumor") return core.getWorldPosition(v);
    const mesh = nodeMeshes.get(id.slice(5));
    return mesh ? mesh.getWorldPosition(v) : v.copy(HOME_TARGET);
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

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downX = 0;
  let downY = 0;

  const hitTest = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables(), false)[0];
    return { id: (hit?.object.userData.pick as PickId | undefined) ?? null, rect };
  };

  const labelFor = (id: PickId) => {
    if (id === "tumor") return "Primary tumour · right upper lobe";
    const node = LYMPH_NODES.find((n) => `node:${n.station}` === id);
    return node ? `Station ${node.station} · ${node.name}` : id;
  };

  const onPointerDown = (event: PointerEvent) => {
    downX = event.clientX;
    downY = event.clientY;
    controls.autoRotate = false;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > 5) return;
    const { id } = hitTest(event);
    if (id) options.onPick(id);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.buttons !== 0) return;
    const { id, rect } = hitTest(event);
    renderer.domElement.style.cursor = id ? "pointer" : "grab";
    options.onHover(id ? { label: labelFor(id), x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
  };
  const onPointerLeave = () => options.onHover(null);

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
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  for (const m of particleMaterials) m.uniforms.uPixelRatio.value = pixelRatio * 60;

  const startTime = performance.now();
  const tumorWorld = new THREE.Vector3();
  let frame = 0;

  const tick = () => {
    frame = requestAnimationFrame(tick);
    const elapsed = (performance.now() - startTime) / 1000;
    const animTime = options.reducedMotion ? 0 : elapsed;

    // Breathing: ~14 breaths per minute.
    const breath = breathing ? Math.sin((elapsed * Math.PI * 2) / 4.3) : 0;
    thorax.scale.set(1 + 0.022 * breath, 1 + 0.03 * breath, 1 + 0.022 * breath);

    const pulse = options.reducedMotion ? 1 : 1 + 0.018 * Math.sin(elapsed * 2.6);
    tumorGroup.scale.setScalar(TUMOR_BASE_RADIUS * tumorScale * pulse);

    for (const m of particleMaterials) m.uniforms.uTime.value = animTime;

    if (fly) {
      const t = Math.min(1, (performance.now() - fly.start) / fly.duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(fly.fromPos, fly.toPos, e);
      controls.target.lerpVectors(fly.fromTarget, fly.toTarget, e);
      if (t >= 1) fly = null;
    }
    controls.update();

    // Multiscale reveal: the closer the camera, the more cellular detail.
    core.getWorldPosition(tumorWorld);
    const dist = camera.position.distanceTo(tumorWorld);
    const closeness = 1 - smoothstep(0.9, 3.0, dist);
    parenchymaMaterial.uniforms.uOpacity.value = 0.85 * (1 - 0.6 * closeness);
    alveoliMaterial.uniforms.uOpacity.value = 0.32 * (1 - 0.5 * closeness);
    coreMaterial.opacity = 1 - 0.72 * closeness;
    coreMaterial.depthWrite = coreMaterial.opacity > 0.95;
    cancerMaterial.uniforms.uOpacity.value = 0.95 * closeness;
    tCellMaterial.uniforms.uOpacity.value = 0.95 * closeness;
    macrophageMaterial.uniforms.uOpacity.value = 0.85 * closeness;

    if (selected && reticle.visible) {
      const p = worldPositionOf(selected);
      reticle.position.copy(p);
      reticle.quaternion.copy(camera.quaternion);
      const r = selected === "tumor" ? TUMOR_BASE_RADIUS * tumorScale * 1.9 : 0.08;
      reticle.scale.setScalar(r * (1 + 0.04 * Math.sin(elapsed * 3)));
    }

    renderer.render(scene, camera);
  };
  tick();

  /* ---------- handle ---------- */

  const applyTumorColor = () => {
    const c = COLOR.tumorSensitive.clone().lerp(COLOR.tumorResistant, resistant);
    coreMaterial.color.copy(c);
    coreMaterial.emissive.copy(c);
    (shellMaterial.uniforms.uColor.value as THREE.Color).copy(c);
    (spiculeMaterial.uniforms.uColor.value as THREE.Color).copy(c);
    tumorLight.color.copy(c);
  };

  return {
    setLayerVisible(id, visible) {
      layerVisible[id] = visible;
      layers[id].visible = visible;
      if (id === "tumor") tumorLight.visible = visible;
      if (!visible && selected) {
        if ((id === "tumor" && selected === "tumor") || (id === "nodes" && selected.startsWith("node:"))) {
          reticle.visible = false;
        }
      } else if (visible && selected) {
        reticle.visible = true;
      }
    },
    setTumorState(scale, resistantFraction) {
      tumorScale = scale;
      resistant = Math.min(1, Math.max(0, resistantFraction));
      applyTumorColor();
    },
    setSelected(id) {
      selected = id;
      reticle.visible = id !== null;
      for (const [station, mesh] of nodeMeshes) {
        const base = mesh.userData.baseScale as number;
        mesh.scale.setScalar(id === `node:${station}` ? base * 1.35 : base);
      }
    },
    setBreathing(on) {
      breathing = on;
    },
    focusTumor() {
      controls.autoRotate = false;
      const target = core.getWorldPosition(new THREE.Vector3());
      const offset = new THREE.Vector3(-0.55, 0.22, 1.0).normalize().multiplyScalar(0.75 + tumorScale * 0.35);
      flyTo(target.clone().add(offset), target);
    },
    resetView() {
      controls.autoRotate = !options.reducedMotion;
      flyTo(HOME_POSITION.clone(), HOME_TARGET.clone());
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const withGeometry = obj as THREE.Mesh | THREE.Points;
        if (withGeometry.geometry) geometries.add(withGeometry.geometry);
        const mat = (withGeometry as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => materials.add(m));
        else if (mat) materials.add(mat);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
