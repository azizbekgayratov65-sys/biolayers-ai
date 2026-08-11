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