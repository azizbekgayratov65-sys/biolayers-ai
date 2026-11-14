/* Lymph node stations shown in the lung demo (IASLC map numbering). Kept free of three.js so UI code can import it cheaply. */

export type LymphNodeInfo = {
  station: string;
  name: string;
  status: "suspicious" | "benign";
  shortAxisMm: number;
  position: [number, number, number];
};

export const LYMPH_NODES: LymphNodeInfo[] = [
  { station: "10R", name: "Right hilar", status: "suspicious", shortAxisMm: 14, position: [-0.42, 0.62, 0.02] },
  { station: "11R", name: "Right interlobar", status: "benign", shortAxisMm: 6, position: [-0.6, 0.45, 0.06] },
  { station: "4R", name: "Right lower paratracheal", status: "benign", shortAxisMm: 7, position: [-0.17, 1.12, 0.06] },
  { station: "7", name: "Subcarinal", status: "benign", shortAxisMm: 8, position: [0.0, 0.72, -0.08] },
  { station: "4L", name: "Left lower paratracheal", status: "benign", shortAxisMm: 5, position: [0.17, 1.08, 0.05] },
  { station: "10L", name: "Left hilar", status: "benign", shortAxisMm: 6, position: [0.46, 0.55, 0.0] },
];
