import type { Edge, Node } from "@xyflow/react";

export type EntityType =
  | "cell"
  | "gene"
  | "protein"
  | "pathway"
  | "process"
  | "disease"
  | "drug";

export type EntityData = {
  label: string;
  type: EntityType;
  description: string;
};

export type GraphResult = {
  nodes: Node<EntityData>[];
  edges: Edge[];
};

type KnownEntity = {
  id: string;
  label: string;
  type: EntityType;
  description: string;
  keywords: string[];
};

const knownEntities: KnownEntity[] = [
  {
    id: "caf",
    label: "Cancer-associated fibroblasts",
    type: "cell",
    description:
      "Stromal cells that influence tumor growth, signaling, extracellular matrix remodeling, and metastasis.",
    keywords: [
      "cancer-associated fibroblast",
      "cancer associated fibroblast",
      "cafs",
      "caf",
    ],
  },
  {
    id: "t-cell",
    label: "T cells",
    type: "cell",
    description:
      "Lymphocytes that recognize and kill tumor cells, mediate adaptive immune responses, and are targets for immunotherapy.",
    keywords: ["t cell", "t cells", "t-cell", "t-cells", "cd8", "cd4", "t lymphocyte"],
  },
  {
    id: "macrophage",
    label: "Macrophages",
    type: "cell",
    description:
      "Phagocytic immune cells that can either suppress or promote tumor growth depending on their polarization state.",
    keywords: ["macrophage", "macrophages", "tumor-associated macrophage", "tam"],
  },
  {
    id: "nk-cell",
    label: "NK cells",
    type: "cell",
    description:
      "Natural killer cells that provide innate immune surveillance against tumor and infected cells.",
    keywords: ["nk cell", "nk cells", "natural killer"],
  },
  {
    id: "endothelial",
    label: "Endothelial cells",
    type: "cell",
    description:
      "Cells lining blood vessels that mediate angiogenesis and tumor nutrient supply.",
    keywords: ["endothelial cell", "endothelial cells", "endothelium"],
  },
  {
    id: "cxcl12",
    label: "CXCL12",
    type: "protein",
    description:
      "A chemokine involved in cell migration and communication within the tumor microenvironment.",
    keywords: ["cxcl12"],
  },
  {
    id: "tgfb",
    label: "TGF-β",
    type: "protein",
    description:
      "A signaling molecule involved in fibrosis, immune regulation, tumor progression, and cellular communication.",
    keywords: ["tgf-β", "tgf-beta", "tgf beta", "tgfb"],
  },
  {
    id: "il6",
    label: "IL-6",
    type: "protein",
    description:
      "A cytokine involved in inflammation, immune signaling, and cancer progression.",
    keywords: ["il-6", "il6", "interleukin-6"],
  },
  {
    id: "vegf",
    label: "VEGF",
    type: "protein",
    description:
      "Vascular endothelial growth factor — a key driver of angiogenesis and new blood vessel formation in tumors.",
    keywords: ["vegf", "vascular endothelial growth factor"],
  },
  {
    id: "tnf",
    label: "TNF-α",
    type: "protein",
    description:
      "A pro-inflammatory cytokine with roles in cell survival, apoptosis, and immune regulation.",
    keywords: ["tnf-α", "tnf-alpha", "tnf a", "tumor necrosis factor"],
  },
  {
    id: "pdl1",
    label: "PD-L1",
    type: "protein",
    description:
      "An immune checkpoint ligand that suppresses T cell activity — a key target for cancer immunotherapy.",
    keywords: ["pd-l1", "pdl1", "cd274"],
  },
  {
    id: "egfr",
    label: "EGFR",
    type: "protein",
    description:
      "Epidermal growth factor receptor — a receptor tyrosine kinase often mutated or overexpressed in cancers.",
    keywords: ["egfr", "epidermal growth factor receptor", "her1"],
  },
  {
    id: "microenvironment",
    label: "Tumor microenvironment",
    type: "process",
    description:
      "The network of tumor cells, stromal cells, immune cells, extracellular matrix, and signaling molecules surrounding a tumor.",
    keywords: [
      "tumor microenvironment",
      "tumour microenvironment",
      "microenvironment",
    ],
  },
  {
    id: "angiogenesis",
    label: "Angiogenesis",
    type: "process",
    description:
      "The formation of new blood vessels that supply tumors with nutrients and oxygen.",
    keywords: ["angiogenesis", "neovascularization", "blood vessel formation"],
  },
  {
    id: "emt",
    label: "Epithelial-mesenchymal transition",
    type: "process",
    description:
      "A process by which epithelial cells gain migratory and invasive properties — a key step in metastasis.",
    keywords: ["epithelial-mesenchymal transition", "emt", "mesenchymal transition"],
  },
  {
    id: "apoptosis",
    label: "Apoptosis",
    type: "process",
    description:
      "Programmed cell death — a mechanism that tumors must evade to survive and grow.",
    keywords: ["apoptosis", "programmed cell death", "cell death"],
  },
  {
    id: "glycolysis",
    label: "Warburg metabolism",
    type: "process",
    description:
      "The shift to aerobic glycolysis that cancer cells use to generate energy and biosynthetic precursors.",
    keywords: ["glycolysis", "warburg", "aerobic glycolysis", "warburg metabolism"],
  },
  {
    id: "remodeling",
    label: "ECM remodeling",
    type: "pathway",
    description:
      "Changes to the extracellular matrix that affect cell movement, communication, invasion, and tissue structure.",
    keywords: [
      "ecm remodeling",
      "ecm remodelling",
      "extracellular matrix remodeling",
      "extracellular matrix remodelling",
    ],
  },
  {
    id: "wnt",
    label: "Wnt/β-catenin",
    type: "pathway",
    description:
      "A conserved signaling pathway that regulates cell proliferation, differentiation, and stem cell maintenance.",
    keywords: ["wnt", "wnt/β-catenin", "wnt/beta-catenin", "wnt pathway"],
  },
  {
    id: "jak-stat",
    label: "JAK-STAT",
    type: "pathway",
    description:
      "A signaling cascade that transmits cytokine signals from the cell surface to the nucleus.",
    keywords: ["jak-stat", "jak stat", "jak/stat"],
  },
  {
    id: "pi3k-akt",
    label: "PI3K/AKT",
    type: "pathway",
    description:
      "A major intracellular signaling pathway that regulates cell growth, survival, and metabolism.",
    keywords: ["pi3k", "akt", "pi3k/akt", "pi3k-akt", "pi3k/akt/mtor"],
  },
  {
    id: "nf-kb",
    label: "NF-κB",
    type: "pathway",
    description:
      "A transcription factor that drives inflammatory and survival genes in cancer cells.",
    keywords: ["nf-κb", "nf-kb", "nfκb", "nuclear factor kappa"],
  },
  {
    id: "bone-metastasis",
    label: "Bone metastasis",
    type: "disease",
    description:
      "The spread and growth of malignant cells within bone tissue.",
    keywords: ["bone metastasis", "bone metastatic", "metastasis to bone"],
  },
  {
    id: "prostate-cancer",
    label: "Prostate cancer",
    type: "disease",
    description:
      "A malignant disease arising from cells of the prostate gland.",
    keywords: ["prostate cancer", "prostate tumor", "prostate tumour"],
  },
  {
    id: "lung-cancer",
    label: "Lung cancer",
    type: "disease",
    description:
      "A group of malignant diseases originating in lung tissue.",
    keywords: ["lung cancer", "lung carcinoma", "pulmonary carcinoma"],
  },
  {
    id: "breast-cancer",
    label: "Breast cancer",
    type: "disease",
    description:
      "A malignant disease arising from breast tissue — the most common cancer in women worldwide.",
    keywords: ["breast cancer", "breast tumor", "breast tumour", "mammary carcinoma"],
  },
  {
    id: "colorectal-cancer",
    label: "Colorectal cancer",
    type: "disease",
    description:
      "A malignant disease of the colon or rectum, often arising from adenomatous polyps.",
    keywords: ["colorectal cancer", "colon cancer", "rectal cancer", "crc"],
  },
  {
    id: "melanoma",
    label: "Melanoma",
    type: "disease",
    description:
      "A highly aggressive skin cancer arising from melanocytes.",
    keywords: ["melanoma", "skin cancer", "malignant melanoma"],
  },
  {
    id: "glioblastoma",
    label: "Glioblastoma",
    type: "disease",
    description:
      "An aggressive brain tumor with poor prognosis — the most common malignant primary brain tumor.",
    keywords: ["glioblastoma", "gbm", "brain tumor"],
  },
  {
    id: "osteoclast",
    label: "Osteoclast",
    type: "cell",
    description:
      "A specialized bone cell responsible for breaking down bone tissue.",
    keywords: ["osteoclast", "osteoclasts"],
  },
  {
    id: "immune-cell",
    label: "Immune cells",
    type: "cell",
    description:
      "Cells that participate in immune surveillance, inflammation, and tumor–immune interactions.",
    keywords: ["immune cell", "immune cells"],
  },
  {
    id: "pembrolizumab",
    label: "Pembrolizumab",
    type: "drug",
    description:
      "An anti-PD-1 checkpoint inhibitor that reactivates T cells against tumor cells.",
    keywords: ["pembrolizumab", "keytruda"],
  },
  {
    id: "trastuzumab",
    label: "Trastuzumab",
    type: "drug",
    description:
      "An anti-HER2 monoclonal antibody used to treat HER2-positive breast and gastric cancers.",
    keywords: ["trastuzumab", "herceptin"],
  },
];

const knownRelations = [
  {
    source: "caf",
    target: "cxcl12",
    label: "secretes",
  },
  {
    source: "caf",
    target: "tgfb",
    label: "activates",
  },
  {
    source: "caf",
    target: "il6",
    label: "releases",
  },
  {
    source: "caf",
    target: "remodeling",
    label: "drives",
  },
  {
    source: "caf",
    target: "microenvironment",
    label: "modifies",
  },
  {
    source: "cxcl12",
    target: "bone-metastasis",
    label: "promotes",
  },
  {
    source: "tgfb",
    target: "remodeling",
    label: "regulates",
  },
  {
    source: "il6",
    target: "microenvironment",
    label: "influences",
  },
  {
    source: "remodeling",
    target: "bone-metastasis",
    label: "supports",
  },
  {
    source: "microenvironment",
    target: "bone-metastasis",
    label: "enables",
  },
  {
    source: "osteoclast",
    target: "bone-metastasis",
    label: "supports",
  },
  {
    source: "prostate-cancer",
    target: "bone-metastasis",
    label: "spreads to",
  },
  {
    source: "t-cell",
    target: "pdl1",
    label: "inhibited by",
  },
  {
    source: "macrophage",
    target: "microenvironment",
    label: "shapes",
  },
  {
    source: "nk-cell",
    target: "apoptosis",
    label: "induces",
  },
  {
    source: "vegf",
    target: "angiogenesis",
    label: "drives",
  },
  {
    source: "egfr",
    target: "pi3k-akt",
    label: "activates",
  },
  {
    source: "egfr",
    target: "jak-stat",
    label: "activates",
  },
  {
    source: "tgfb",
    target: "emt",
    label: "induces",
  },
  {
    source: "nf-kb",
    target: "il6",
    label: "upregulates",
  },
  {
    source: "nf-kb",
    target: "tnf",
    label: "upregulates",
  },
  {
    source: "microenvironment",
    target: "angiogenesis",
    label: "promotes",
  },
  {
    source: "angiogenesis",
    target: "prostate-cancer",
    label: "feeds",
  },
  {
    source: "angiogenesis",
    target: "lung-cancer",
    label: "feeds",
  },
  {
    source: "emt",
    target: "bone-metastasis",
    label: "enables",
  },
  {
    source: "glycolysis",
    target: "microenvironment",
    label: "acidifies",
  },
  {
    source: "pembrolizumab",
    target: "pdl1",
    label: "blocks",
  },
  {
    source: "pdl1",
    target: "t-cell",
    label: "suppresses",
  },
  {
    source: "trastuzumab",
    target: "breast-cancer",
    label: "treats",
  },
  {
    source: "wnt",
    target: "apoptosis",
    label: "inhibits",
  },
  {
    source: "pi3k-akt",
    target: "apoptosis",
    label: "inhibits",
  },
  {
    source: "jak-stat",
    target: "microenvironment",
    label: "inflammes",
  },
];

function containsKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function createPosition(index: number, total: number) {
  const centerX = 430;
  const centerY = 330;
  const radiusX = 310;
  const radiusY = 230;

  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;

  return {
    x: centerX + Math.cos(angle) * radiusX,
    y: centerY + Math.sin(angle) * radiusY,
  };
}

export function buildGraphFromText(sourceText: string): GraphResult {
  const normalizedText = sourceText.toLowerCase();

  let detectedEntities = knownEntities.filter((entity) =>
    containsKeyword(normalizedText, entity.keywords),
  );

  if (detectedEntities.length === 0) {
    detectedEntities = [
      {
        id: "research-topic",
        label: "Research topic",
        type: "process",
        description:
          "The central biological topic identified from the submitted paragraph.",
        keywords: [],
      },
      {
        id: "biological-mechanism",
        label: "Biological mechanism",
        type: "pathway",
        description:
          "A biological process or pathway described in the submitted text.",
        keywords: [],
      },
      {
        id: "disease-progression",
        label: "Disease progression",
        type: "disease",
        description:
          "The development or advancement of the disease described in the paragraph.",
        keywords: [],
      },
      {
        id: "cell-involvement",
        label: "Cellular involvement",
        type: "cell",
        description:
          "Cell types or immune cells implicated in the described mechanism.",
        keywords: [],
      },
      {
        id: "signaling-molecule",
        label: "Signaling molecule",
        type: "protein",
        description:
          "Key proteins or cytokines mediating the described biological process.",
        keywords: [],
      },
      {
        id: "clinical-implication",
        label: "Clinical implication",
        type: "drug",
        description:
          "Potential therapeutic targets or interventions suggested by the described mechanism.",
        keywords: [],
      },
    ];
  }

  if (detectedEntities.length === 1) {
    detectedEntities = [
      ...detectedEntities,
      {
        id: "tumor-process",
        label: "Tumor process",
        type: "process",
        description:
          "A broader biological process connected to the detected entity.",
        keywords: [],
      },
      {
        id: "disease-outcome",
        label: "Disease outcome",
        type: "disease",
        description:
          "A possible disease-level result of the described biological mechanism.",
        keywords: [],
      },
      {
        id: "immune-response",
        label: "Immune response",
        type: "cell",
        description:
          "The immune system's reaction to the detected entity or disease.",
        keywords: [],
      },
      {
        id: "therapeutic-target",
        label: "Therapeutic target",
        type: "protein",
        description:
          "A molecular target that could be modulated for treatment.",
        keywords: [],
      },
    ];
  }

  const nodes: Node<EntityData>[] = detectedEntities.map((entity, index) => ({
    id: entity.id,
    type: "entity",
    position: createPosition(index, detectedEntities.length),
    data: {
      label: entity.label,
      type: entity.type,
      description: entity.description,
    },
  }));

  const detectedIds = new Set(detectedEntities.map((entity) => entity.id));

  let edges: Edge[] = knownRelations
    .filter(
      (relation) =>
        detectedIds.has(relation.source) && detectedIds.has(relation.target),
    )
    .map((relation) => ({
      id: `${relation.source}-${relation.target}`,
      source: relation.source,
      target: relation.target,
      label: relation.label,
    }));

  if (edges.length === 0 && nodes.length >= 2) {
    edges = nodes.slice(0, -1).map((node, index) => ({
      id: `${node.id}-${nodes[index + 1].id}`,
      source: node.id,
      target: nodes[index + 1].id,
      label: "related to",
    }));
  }

  return {
    nodes,
    edges,
  };
}