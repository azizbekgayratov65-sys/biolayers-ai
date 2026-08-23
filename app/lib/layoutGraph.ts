import dagre from "@dagrejs/dagre";

import {
  Position,
  type Edge,
  type Node,
} from "@xyflow/react";

const NODE_WIDTH = 100;
const NODE_HEIGHT = 100;

export function layoutGraph<
  T extends Record<string, unknown>,
>(
  nodes: Node<T>[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB",
): {
  nodes: Node<T>[];
  edges: Edge[];
} {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(
    () => ({}),
  );

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 110,
    nodesep: 70,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const isHorizontal = direction === "LR";

  const layoutedNodes: Node<T>[] = nodes.map((node) => {
    const calculatedPosition = dagreGraph.node(node.id);

    return {
      ...node,

      targetPosition: isHorizontal
        ? Position.Left
        : Position.Top,

      sourcePosition: isHorizontal
        ? Position.Right
        : Position.Bottom,

      position: {
        x: calculatedPosition.x - NODE_WIDTH / 2,
        y: calculatedPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}