/*
  Cell categories for the point-cloud lung. Every point in the scene is one
  cell; its colour says which category it belongs to.

  Colours are the dark-mode categorical palette (8 slots, validated for
  colour-vision deficiency on adjacent pairs). Because a point cloud puts
  every pair next to every other, identity never relies on colour alone:
  the legend names each category with a count, the atlas view labels each
  cluster directly, and hovering a point names the cell.

  Kept free of three.js so UI code can import it without the 3D bundle.
*/

export type CellCategoryId =
  | "alveolar"
  | "tumorResistant"
  | "airway"
  | "tumorSensitive"
  | "macrophage"
  | "lymphocyte"
  | "vein"
  | "artery";

export type CellCategory = {
  id: CellCategoryId;
  index: number;
  label: string;
  color: string;
  description: string;
};

// Order follows the palette's fixed slot order (blue, orange, aqua, yellow,
// magenta, green, violet, red); the index is what the shader sees.
export const CELL_CATEGORIES: CellCategory[] = [
  {
    id: "alveolar",
    index: 0,
    label: "Alveolar epithelium",
    color: "#3987e5",
    description: "Type I cells line the air sacs for gas exchange; type II cells make surfactant and repair them.",
  },
  {
    id: "tumorResistant",
    index: 1,
    label: "Resistant tumour cells",
    color: "#d95926",
    description: "Cells that survive the EGFR inhibitor, for example through MET amplification or an EGFR C797S mutation.",
  },
  {
    id: "airway",
    index: 2,
    label: "Airway epithelium",
    color: "#199e70",
    description: "Ciliated, club and basal cells lining the trachea and bronchi.",
  },
  {
    id: "tumorSensitive",
    index: 3,
    label: "Tumour cells",
    color: "#c98500",
    description: "Adenocarcinoma cells carrying the EGFR exon 19 deletion, still sensitive to the drug.",
  },
  {
    id: "macrophage",
    index: 4,
    label: "Macrophages",
    color: "#d55181",
    description: "Alveolar macrophages in healthy tissue and tumour-associated macrophages around the lesion.",
  },
  {
    id: "lymphocyte",
    index: 5,
    label: "Lymphocytes",
    color: "#0ca30c",
    description: "T and B cells in lymph nodes and infiltrating the tumour.",
  },
  {
    id: "vein",
    index: 6,
    label: "Venous endothelium",
    color: "#9085e9",
    description: "Cells lining the pulmonary veins that return oxygenated blood to the heart.",
  },
  {
    id: "artery",
    index: 7,
    label: "Arterial endothelium",
    color: "#e66767",
    description: "Cells lining the pulmonary arteries and their smooth muscle wall.",
  },
];

export const CATEGORY_BY_ID: Record<CellCategoryId, CellCategory> = Object.fromEntries(
  CELL_CATEGORIES.map((c) => [c.id, c]),
) as Record<CellCategoryId, CellCategory>;

/* Finer cell types shown on hover. */
export type CellSubtype = { label: string; category: CellCategoryId; share: number };

export const CELL_SUBTYPES: CellSubtype[] = [
  { label: "Alveolar type I cell", category: "alveolar", share: 0.55 },
  { label: "Alveolar type II cell", category: "alveolar", share: 0.45 },
  { label: "Ciliated cell", category: "airway", share: 0.5 },
  { label: "Club cell", category: "airway", share: 0.3 },
  { label: "Basal cell", category: "airway", share: 0.2 },
  { label: "Arterial endothelial cell", category: "artery", share: 0.7 },
  { label: "Arterial smooth muscle cell", category: "artery", share: 0.3 },
  { label: "Venous endothelial cell", category: "vein", share: 0.8 },
  { label: "Pericyte", category: "vein", share: 0.2 },
  { label: "Tumour cell · EGFR exon 19 deletion", category: "tumorSensitive", share: 1 },
  { label: "CD8 T cell", category: "lymphocyte", share: 0.45 },
  { label: "CD4 T cell", category: "lymphocyte", share: 0.35 },
  { label: "B cell", category: "lymphocyte", share: 0.2 },
  { label: "Alveolar macrophage", category: "macrophage", share: 0.5 },
  { label: "Tumour-associated macrophage", category: "macrophage", share: 0.5 },
];

export const RESISTANT_SUBTYPE_LABEL = "Resistant tumour cell · e.g. MET amplification";

/* ---------- Flows: cell type → signalling pathway → drug ---------- */

export type FlowNode = { label: string; note: string };

export const PATHWAYS: FlowNode[] = [
  { label: "EGFR → RAS/MAPK", note: "The mutant EGFR drives growth through the RAS–RAF–MEK–ERK cascade." },
  { label: "PI3K → AKT → mTOR", note: "Survival signalling downstream of EGFR and MET." },
  { label: "MET bypass", note: "MET amplification lets resistant cells grow without EGFR." },
  { label: "PD-1 / PD-L1 checkpoint", note: "Tumour and myeloid cells use PD-L1 to switch off T cells." },
  { label: "VEGF angiogenesis", note: "Tumour-associated macrophages and endothelium build new vessels." },
  { label: "EGFR in healthy epithelium", note: "Normal lung and airway cells also use EGFR, the source of side effects." },
];

export const DRUGS: FlowNode[] = [
  { label: "Osimertinib", note: "Third-generation EGFR inhibitor, standard first-line for EGFR-mutant NSCLC." },
  { label: "Amivantamab", note: "Bispecific antibody against EGFR and MET." },
  { label: "MET inhibitors", note: "Savolitinib, capmatinib or tepotinib, used against MET-driven resistance." },
  { label: "Pembrolizumab", note: "Anti-PD-1 immune checkpoint inhibitor." },
  { label: "Anti-VEGF", note: "Bevacizumab or ramucirumab, which block new vessel growth." },
];

/* [pathway, drug, weight] routes for each cell type. Illustrative, not a treatment guide. */
export const FLOW_ROUTES: Record<CellCategoryId, [number, number, number][]> = {
  alveolar: [[5, 0, 1]],
  airway: [[5, 0, 1]],
  tumorSensitive: [
    [0, 0, 0.55],
    [1, 0, 0.25],
    [0, 1, 0.2],
  ],
  tumorResistant: [
    [2, 2, 0.5],
    [2, 1, 0.3],
    [1, 0, 0.2],
  ],
  lymphocyte: [[3, 3, 1]],
  macrophage: [
    [3, 3, 0.6],
    [4, 4, 0.4],
  ],
  artery: [[4, 4, 1]],
  vein: [[4, 4, 1]],
};

/* Share of each cell type drawn in the flow view, so 47k alveolar cells don't drown the rest. */
export const FLOW_KEEP: Record<CellCategoryId, number> = {
  alveolar: 0.12,
  airway: 0.35,
  tumorSensitive: 1,
  tumorResistant: 1,
  lymphocyte: 1,
  macrophage: 1,
  artery: 0.4,
  vein: 0.35,
};
