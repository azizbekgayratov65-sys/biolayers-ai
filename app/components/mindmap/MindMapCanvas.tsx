"use client";

import {
  useCallback,
  useMemo,
} from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type OnNodesChange,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import MindMapNode from "./MindMapNode";
import {
  sectionColor,
  type MindMapFlowEdge,
  type MindMapFlowNode,
} from "./mindMapFlow";

const nodeTypes = {
  mindmap: MindMapNode,
};

type MindMapCanvasProps = {
  nodes: MindMapFlowNode[];
  edges: MindMapFlowEdge[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelectNode: (id: string) => void;
  onClearSelection: () => void;
  onNodeHover: (id: string | null) => void;
  onNodesChange: OnNodesChange<MindMapFlowNode>;
};

export default function MindMapCanvas({
  nodes,
  edges,
  selectedId,
  hoveredId,
  onSelectNode,
  onClearSelection,
  onNodeHover,
  onNodesChange,
}: MindMapCanvasProps) {
  const connectedIds = useMemo(() => {
    if (!hoveredId) {
      return new Set<string>();
    }

    const related = new Set<string>([
      hoveredId,
    ]);

    edges.forEach((edge) => {
      if (edge.source === hoveredId) {
        related.add(edge.target);
      }

      if (edge.target === hoveredId) {
        related.add(edge.source);
      }
    });

    return related;
  }, [hoveredId, edges]);

  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      const dimmed =
        Boolean(hoveredId) &&
        !connectedIds.has(node.id);

      const isSelected =
        selectedId === node.id;

      return {
        ...node,
        selected: isSelected,
        style: {
          ...node.style,
          opacity: dimmed ? 0.18 : 1,
          filter: dimmed
            ? "saturate(0.3)"
            : undefined,
          transition:
            "opacity 160ms ease, filter 160ms ease",
        },
      };
    });
  }, [
    nodes,
    hoveredId,
    connectedIds,
    selectedId,
  ]);

  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceNode = nodes.find(
        (node) => node.id === edge.source,
      );

      const accent = sectionColor(
        sourceNode?.data.section,
      );

      const isSelected =
        selectedId === edge.source ||
        selectedId === edge.target;

      const isDimmed =
        Boolean(hoveredId) &&
        hoveredId !== edge.source &&
        hoveredId !== edge.target;

      return {
        ...edge,
        animated: isSelected,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSelected
            ? accent
            : "#475569",
          width: 18,
          height: 18,
        },
        style: {
          stroke: isSelected
            ? accent
            : "#334155",
          strokeWidth: isSelected
            ? 2.6
            : 1.6,
          opacity: isDimmed ? 0.12 : 1,
          cursor: "pointer",
          transition:
            "opacity 160ms ease, stroke 160ms ease",
        },
        label: edge.label,
        labelStyle: {
          fill: isSelected
            ? accent
            : "#94a3b8",
          fontSize: 10,
          fontWeight: 700,
        },
        labelBgStyle: {
          fill: "#081722",
          fillOpacity: 0.92,
        },
        labelBgPadding: [5, 3] as [
          number,
          number,
        ],
        labelBgBorderRadius: 6,
      };
    });
  }, [
    edges,
    nodes,
    selectedId,
    hoveredId,
  ]);

  const handleNodeClick = useCallback(
    (_: unknown, node: MindMapFlowNode) => {
      onSelectNode(node.id);
    },
    [onSelectNode],
  );

  const handleNodeEnter = useCallback(
    (_: unknown, node: MindMapFlowNode) => {
      onNodeHover(node.id);
    },
    [onNodeHover],
  );

  const handleNodeLeave = useCallback(() => {
    onNodeHover(null);
  }, [onNodeHover]);

  const miniMapColor = useCallback(
    (node: MindMapFlowNode) =>
      node.data.level === 1
        ? "#5eead4"
        : sectionColor(
            node.data.section,
          ),
    [],
  );

  return (
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-[#07151f]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[0]
          bg-[radial-gradient(circle_at_50%_45%,rgba(94,234,212,.045),transparent_38%)]
        "
      />

      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={onClearSelection}
        onNodeMouseEnter={handleNodeEnter}
        onNodeMouseLeave={handleNodeLeave}
        fitView
        fitViewOptions={{
          padding: 0.14,
          maxZoom: 1.15,
          minZoom: 0.25,
        }}
        minZoom={0.2}
        maxZoom={1.8}
        deleteKeyCode={null}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "default",
        }}
        className="!bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={26}
          size={1.4}
          color="rgba(148,163,184,0.14)"
        />

        <Controls
          showInteractive={false}
          className="
            !border-white/10
            !bg-[#0a1b26]/90
            !shadow-[0_10px_30px_rgba(0,0,0,.4)]
          "
        />

        <MiniMap
          nodeColor={miniMapColor}
          nodeStrokeWidth={2}
          maskColor="rgba(6,17,26,0.72)"
          className="
            !bottom-4
            !right-4
            !h-36
            !w-52
            !border
            !border-white/10
            !bg-[#0a1b26]/90
            !rounded-xl
            !overflow-hidden
          "
        />
      </ReactFlow>
    </div>
  );
}