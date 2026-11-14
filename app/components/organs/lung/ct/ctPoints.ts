/*
  Turns a real CT volume into a glowing point cloud.

  Per axial slice (on a half-resolution grid):
    1. Air is anything below −400 HU.
    2. Air reachable from the image border is outside the body; the rest is
       internal air: lungs, trachea and bronchi.
    3. The lung field is everything not reachable from the border without
       crossing internal air, so vessels and nodules surrounded by lung
       count as "inside the lung", while the mediastinum and chest wall do not.
  Then each voxel gets a class from its density and position, and classes
  are sampled down to a point budget.
*/

export type CtClassId = "airway" | "parenchyma" | "vessel" | "bone";

export type CtClass = { id: CtClassId; index: number; label: string; color: string; description: string };

// Neon colours to match the cell model; each class also shifts colour with density in the 3D view.
export const CT_CLASSES: CtClass[] = [
  { id: "airway", index: 0, label: "Airways", color: "#00f5d4", description: "Air in the trachea and bronchi, below −960 HU." },
  {
    id: "parenchyma",
    index: 1,
    label: "Lung tissue",
    color: "#4f7dff",
    description: "Aerated lung between −960 and −500 HU.",
  },
  {
    id: "vessel",
    index: 2,
    label: "Vessels & nodules",
    color: "#ff4ecd",
    description: "Denser structures inside the lung field: blood vessels, nodules and tumours.",
  },
  { id: "bone", index: 3, label: "Bone", color: "#9b5cff", description: "Ribs, spine and sternum above 250 HU." },
];

export type CtPointCloud = {
  positions: Float32Array;
  classes: Float32Array;
  /* Density of each point in Hounsfield units, used for its colour. */
  hu: Float32Array;
  counts: Record<CtClassId, number>;
  /* Half-extents of the cloud in scene units, for framing the camera. */
  extent: [number, number, number];
};

const BUDGET: Record<CtClassId, number> = { airway: 25000, parenchyma: 70000, vessel: 120000, bone: 45000 };

/* Scene units per millimetre: a 350 mm chest becomes about 3 units wide. */
export const MM_TO_SCENE = 1 / 115;

export function buildCtPointCloud(volume: {
  hu: Int16Array;
  width: number;
  height: number;
  depth: number;
  spacing: [number, number, number];
}): CtPointCloud {
  const { hu, width: W, height: H, depth: D, spacing } = volume;
  const f = W >= 384 ? 2 : 1; // work on a half-resolution grid for 512 matrices
  const w = Math.floor(W / f);
  const h = Math.floor(H / f);
  const sx = spacing[0] * f;
  const sy = spacing[1] * f;
  const sz = spacing[2];

  const classOf = new Int8Array(w * h * D).fill(-1);
  const sample = new Int16Array(w * h);
  const air = new Uint8Array(w * h);
  const reach = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);

  const flood = (passable: (i: number) => boolean, mark: Uint8Array) => {
    mark.fill(0);
    let top = 0;
    const push = (i: number) => {
      if (!mark[i] && passable(i)) {
        mark[i] = 1;
        stack[top++] = i;
      }
    };
    for (let x = 0; x < w; x++) {
      push(x);
      push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      push(y * w);
      push(y * w + w - 1);
    }
    while (top > 0) {
      const i = stack[--top];
      const x = i % w;
      if (x > 0) push(i - 1);
      if (x < w - 1) push(i + 1);
      if (i >= w) push(i - w);
      if (i < w * (h - 1)) push(i + w);
    }
  };

  const outside = new Uint8Array(w * h);
  const counts: Record<CtClassId, number> = { airway: 0, parenchyma: 0, vessel: 0, bone: 0 };
  const plane = w * h;
  const S = new Int16Array(plane * D); // half-resolution HU
  const internal = new Uint8Array(plane * D); // air inside the body

  // Pass 1: downsample and find air inside the body, slice by slice.
  for (let z = 0; z < D; z++) {
    const base = z * W * H;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) sum += hu[base + (y * f + dy) * W + x * f + dx];
        const v = sum / (f * f);
        sample[y * w + x] = v;
        air[y * w + x] = v < -400 ? 1 : 0;
      }
    }
    flood((i) => air[i] === 1, outside);
    const zo = z * plane;
    for (let i = 0; i < plane; i++) {
      S[zo + i] = sample[i];
      internal[zo + i] = air[i] === 1 && outside[i] === 0 ? 1 : 0;
    }
  }

  // Pass 2: 3D connected components of internal air. The lungs and airways are
  // the big ones; bowel and stomach gas form small separate pockets and are dropped.
  const label = new Int32Array(plane * D);
  const sizes: number[] = [0];
  const queue = new Int32Array(plane * D);
  for (let start = 0; start < internal.length; start++) {
    if (!internal[start] || label[start]) continue;
    const id = sizes.length;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    label[start] = id;
    while (head < tail) {
      const i = queue[head++];
      const x = i % w;
      const y = Math.floor(i / w) % h;
      const n0 = x > 0 ? i - 1 : -1;
      const n1 = x < w - 1 ? i + 1 : -1;
      const n2 = y > 0 ? i - w : -1;
      const n3 = y < h - 1 ? i + w : -1;
      const n4 = i >= plane ? i - plane : -1;
      const n5 = i < plane * (D - 1) ? i + plane : -1;
      for (const j of [n0, n1, n2, n3, n4, n5]) {
        if (j >= 0 && internal[j] && !label[j]) {
          label[j] = id;
          queue[tail++] = j;
        }
      }
    }
    sizes.push(tail);
  }
  const largest = sizes.reduce((m, n) => (n > m ? n : m), 1);
  const keepComponent = sizes.map((n) => n >= largest * 0.1);

  // Pass 3: lung field and classes per slice.
  const lungAir = new Uint8Array(plane);
  for (let z = 0; z < D; z++) {
    const zo = z * plane;
    for (let i = 0; i < plane; i++) lungAir[i] = internal[zo + i] && keepComponent[label[zo + i]] ? 1 : 0;
    // Lung field: not reachable from the border without crossing lung air.
    flood((i) => lungAir[i] === 0, reach);
    for (let i = 0; i < plane; i++) {
      const v = S[zo + i];
      let c = -1;
      if (!reach[i]) {
        if (v < -960) c = 0;
        else if (v < -500) c = 1;
        else if (v < 400) c = 2;
      } else if (v > 250) {
        c = 3;
      }
      if (c >= 0) {
        classOf[zo + i] = c;
        counts[CT_CLASSES[c].id]++;
      }
    }
  }

  // Sample each class down to its budget.
  const keep = CT_CLASSES.map((c) => Math.min(1, BUDGET[c.id] / Math.max(1, counts[c.id])));
  const total = CT_CLASSES.reduce((n, c) => n + Math.min(counts[c.id], BUDGET[c.id]), 0) + 1000;
  const positions = new Float32Array(total * 3);
  const classes = new Float32Array(total);
  const huOut = new Float32Array(total);
  const kept: Record<CtClassId, number> = { airway: 0, parenchyma: 0, vessel: 0, bone: 0 };

  let seed = 1234567;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const cx = (w * sx) / 2;
  const cy = (h * sy) / 2;
  const cz = (D * sz) / 2;
  let n = 0;
  for (let z = 0; z < D && n < total; z++) {
    const zo = z * w * h;
    for (let y = 0; y < h && n < total; y++) {
      for (let x = 0; x < w; x++) {
        const c = classOf[zo + y * w + x];
        if (c < 0 || rand() > keep[c] || n >= total) continue;
        // DICOM: columns run to the patient's left, rows run posterior, slices run superior.
        const px = (x + rand() - 0.5) * sx - cx;
        const py = (z + rand() - 0.5) * sz - cz;
        const pz = cy - (y + rand() - 0.5) * sy;
        positions[n * 3] = px * MM_TO_SCENE;
        positions[n * 3 + 1] = py * MM_TO_SCENE;
        positions[n * 3 + 2] = pz * MM_TO_SCENE;
        classes[n] = c;
        huOut[n] = S[zo + y * w + x];
        kept[CT_CLASSES[c].id]++;
        n++;
      }
    }
  }

  return {
    positions: positions.subarray(0, n * 3),
    classes: classes.subarray(0, n),
    hu: huOut.subarray(0, n),
    counts: kept,
    extent: [cx * MM_TO_SCENE, cz * MM_TO_SCENE, cy * MM_TO_SCENE],
  };
}
