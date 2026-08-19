import type {
  Edge,
  Node,
} from "@xyflow/react";

import type {
  MindMap,
  MindMapResponse,
} from "../../lib/mindmapTypes";

export type MindMapNodeData = {
  label: string;
  level: number;
  kind: "section" | "idea";
  section?: string;
  weight?: number;
  description: string;
  quote: string;
};

export type MindMapFlowNode = Node<
  MindMapNodeData,
  "mindmap"
>;

export type MindMapFlowEdge = Edge<{
  label?: string;
}>;

const BRANCH_COLORS = [
  "#5eead4",
  "#67e8f9",
  "#fcd34d",
  "#fda4af",
  "#c4b5fd",
  "#86efac",
  "#fdba74",
  "#7dd3fc",
  "#f0abfc",
  "#a5f3fc",
];

const BRANCH_SOFT_COLORS = [
  "rgba(94,234,212,0.10)",
  "rgba(103,232,249,0.10)",
  "rgba(252,211,77,0.10)",
  "rgba(253,164,175,0.10)",
  "rgba(196,181,253,0.10)",
  "rgba(134,239,172,0.10)",
  "rgba(253,186,116,0.10)",
  "rgba(125,211,252,0.10)",
  "rgba(240,171,252,0.10)",
  "rgba(165,243,252,0.10)",
];

export function sectionColor(
  section?: string,
): string {
  if (!section) {
    return "#5eead4";
  }

  let hash = 0;

  for (
    let index = 0;
    index < section.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        section.charCodeAt(index)) >>>
      0;
  }

  return BRANCH_COLORS[
    hash % BRANCH_COLORS.length
  ];
}

export function sectionSoftColor(
  section?: string,
): string {
  if (!section) {
    return "rgba(94,234,212,0.10)";
  }

  let hash = 0;

  for (
    let index = 0;
    index < section.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        section.charCodeAt(index)) >>>
      0;
  }

  return BRANCH_SOFT_COLORS[
    hash % BRANCH_SOFT_COLORS.length
  ];
}

export function levelColor(
  level: number,
): string {
  switch (level) {
    case 1:
      return "#5eead4";
    case 2:
      return "#67e8f9";
    case 3:
      return "#fcd34d";
    default:
      return "#7dd3fc";
  }
}

export function convertMindMapToFlow(
  mindMap: MindMap,
): {
  nodes: MindMapFlowNode[];
  edges: MindMapFlowEdge[];
} {
  const nodes: MindMapFlowNode[] =
    mindMap.nodes.map((node) => ({
      id: node.id,
      type: "mindmap",
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        level: node.level,
        kind: node.kind,
        section: node.section,
        weight: node.weight,
        description: node.description,
        quote: node.quote,
      },
    }));

  const nodeIds = new Set(
    nodes.map((node) => node.id),
  );

  const edges: MindMapFlowEdge[] =
    mindMap.links
      .filter(
        (link) =>
          nodeIds.has(link.source) &&
          nodeIds.has(link.target) &&
          link.source !== link.target,
      )
      .map((link, index) => ({
        id: `${link.source}-${link.target}-${index}`,
        source: link.source,
        target: link.target,
        label: link.label,
        data: {
          label: link.label,
        },
      }));

  return { nodes, edges };
}

export function responseError(
  response: MindMapResponse,
): string | null {
  return typeof response.error ===
    "string" &&
    response.error.trim().length > 0
    ? response.error
    : null;
}