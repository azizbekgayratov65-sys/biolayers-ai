import {
  Position,
  type Edge,
  type Node,
} from "@xyflow/react";

export type RadialNode = Node<{
  level?: number;
  label?: string;
}>;

const ROOT_WIDTH = 260;
const ROOT_HEIGHT = 110;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 78;
const RING_SPACING = 250;
const MIN_GAP_ANGLE = 0.12;

function nodeLevel(
  node: RadialNode,
): number {
  return Math.max(
    Number(
      node.data?.level ?? 2,
    ) || 2,
    1,
  );
}

function nodeSize(
  level: number,
): {
  width: number;
  height: number;
} {
  return level === 1
    ? {
        width: ROOT_WIDTH,
        height: ROOT_HEIGHT,
      }
    : {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      };
}

function buildChildrenMap(
  nodes: RadialNode[],
  edges: Edge[],
): Map<string, string[]> {

  const children = new Map<
    string,
    string[]
>();

  const levelById = new Map(
    nodes.map((node) => [
      node.id,
      nodeLevel(node),
    ]),
  );

  nodes.forEach((node) => {
    children.set(node.id, []);
  });

  edges.forEach((edge) => {
    const sourceLevel =
      levelById.get(edge.source) ?? 2;

    const targetLevel =
      levelById.get(edge.target) ?? 2;

    let parent: string;
    let child: string;

    if (sourceLevel < targetLevel) {
      parent = edge.source;
      child = edge.target;
    } else if (
      targetLevel < sourceLevel
    ) {
      parent = edge.target;
      child = edge.source;
    } else {
      return;
    }

    const siblings =
      children.get(parent) ?? [];

    if (!siblings.includes(child)) {
      siblings.push(child);
      children.set(parent, siblings);
    }
  });

  return children;
}

function computeSubtreeSizes(
  rootId: string,
  children: Map<string, string[]>,
): Map<string, number> {
  const sizes = new Map<string, number>();

  function visit(id: string): number {
    const subs =
      children.get(id) ?? [];

    const size = subs.reduce(
      (total, child) =>
        total + visit(child),
      1,
    );

    sizes.set(id, size);
    return size;
  }

  visit(rootId);
  return sizes;
}

function placeAtRing(
  angle: number,
  level: number,
): { x: number; y: number } {
  const radius =
    (level - 1) * RING_SPACING;

  const { width, height } =
    nodeSize(level);

  return {
    x:
      Math.cos(angle) * radius -
      width / 2,
    y:
      Math.sin(angle) * radius -
      height / 2,
  };
}

export function radialMindMapLayout<
  T extends RadialNode,
>(
  nodes: T[],
  edges: Edge[],
): T[] {
  if (nodes.length === 0) {
    return [];
  }

  const root =
    nodes.find(
      (node) =>
        nodeLevel(node) === 1,
    ) ?? nodes[0];

  const children =
    buildChildrenMap(nodes, edges);

  const subtreeSizes =
    computeSubtreeSizes(
      root.id,
      children,
    );

  const spans = new Map<
    string,
    { start: number; end: number }
  >();

  spans.set(root.id, {
    start: -Math.PI / 2,
    end: Math.PI * 1.5,
  });

  const queue: string[] = [root.id];

  while (queue.length > 0) {
    const id = queue.shift() ?? "";

    const span = spans.get(id);

    if (!span) {
      continue;
    }

    const subs = children.get(id) ?? [];

    if (subs.length === 0) {
      continue;
    }

    const usable = Math.max(
      span.end -
        span.start -
        MIN_GAP_ANGLE * subs.length,
      0,
    );

    const totalSubSize = subs.reduce(
      (sum, child) =>
        sum +
        (subtreeSizes.get(child) ??
          1),
      0,
    );

    let cursor = span.start;

    subs.forEach((child) => {
      const childSize =
        subtreeSizes.get(child) ??
        1;

      const childStart = cursor;

      const childEnd =
        childStart +
        usable *
          (childSize / totalSubSize);

      spans.set(child, {
        start: childStart,
        end: childEnd,
      });

      cursor =
        childEnd +
        MIN_GAP_ANGLE;

      queue.push(child);
    });
  }

  const layoutedNodes = nodes.map(
    (node) => {
      const level = nodeLevel(node);

      const span = spans.get(
        node.id,
      );

      const { width, height } =
        nodeSize(level);

      if (node.id === root.id) {
        return {
          ...node,
          position: {
            x: -width / 2,
            y: -height / 2,
          },
          targetPosition:
            Position.Top as never,
          sourcePosition:
            Position.Bottom as never,
        };
      }

      if (span) {
        const midAngle =
          (span.start + span.end) / 2;

const ringPosition =
          placeAtRing(
            midAngle,
            level,
          );

        return {
          ...node,
          position: ringPosition,
          targetPosition:
            Position.Top as never,
          sourcePosition:
            Position.Bottom as never,
        };
      }

      return {
        ...node,
        position: {
          x: 0,
          y: 0,
        },
        targetPosition:
          Position.Top as never,
        sourcePosition:
          Position.Bottom as never,
      };
    },
  );

  /*
    Orphans (not connected to the tree) are pushed onto
    their level ring, one after another, away from center.
  */
  const orphanCountByLevel = new Map<
    number,
    number
  >();

  nodes.forEach((node) => {
    if (spans.has(node.id)) {
      return;
    }

    const level = nodeLevel(node);

    orphanCountByLevel.set(
      level,
      (orphanCountByLevel.get(
        level,
      ) ?? 0) + 1,
    );

    const count =
      orphanCountByLevel.get(level) ??
      1;

    const angle =
      (count - 0.5) *
      ((2 * Math.PI) /
        Math.max(
          count + 1,
          1,
        ));

    const existing =
      layoutedNodes.find(
        (item) => item.id === node.id,
      );

    if (existing) {
existing.position =
        placeAtRing(
          angle,
          level,
        );
    }
  });

  return layoutedNodes;
}
