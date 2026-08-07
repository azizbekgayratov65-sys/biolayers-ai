"use client";

import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type OnNodesChange,
  type ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import type {
  EntityData,
  EntityType,
} from "../../lib/buildGraphFromText";
import EntityNode from "./EntityNode";
import BiologicalEdge from "./BiologicalEdge";

type EntityNodeType = Node<EntityData, "entity">;

export type WorkspaceFlowInstance =
  ReactFlowInstance<EntityNodeType, Edge>;

type WorkspaceCanvasProps = {
  nodes: EntityNodeType[];
  edges: Edge[];
  onInit: (instance: WorkspaceFlowInstance) => void;
  onNodesChange: OnNodesChange<EntityNodeType>;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
  onPaneClick: () => void;
  onNodeEnter: (nodeId: string) => void;
  onNodeLeave: () => void;
};

const nodeTypes = {
  entity: EntityNode,
};

const edgeTypes = {
  biological: BiologicalEdge,
};

const miniMapColors: Record<EntityType, string> = {
  cell: "#2dd4bf",
  protein: "#a78bfa",
  pathway: "#fbbf24",
  process: "#60a5fa",
  disease: "#fb7185",
};

export default function WorkspaceCanvas({
  nodes,
  edges,
  onInit,
  onNodesChange,
  onSelectNode,
  onSelectEdge,
  onPaneClick,
  onNodeEnter,
  onNodeLeave,
}: WorkspaceCanvasProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={onInit}
      onNodesChange={onNodesChange}
      onNodeClick={(_, node) => {
        onSelectNode(node.id);
      }}
      onEdgeClick={(_, edge) => {
        onSelectEdge(edge.id);
      }}
      onPaneClick={onPaneClick}
      onNodeMouseEnter={(_, node) => {
        onNodeEnter(node.id);
      }}
      onNodeMouseLeave={onNodeLeave}
      fitView
      nodesDraggable
      nodesConnectable={false}
      minZoom={0.2}
      maxZoom={2}
      defaultEdgeOptions={{
        type: "biological",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#64748b",
        },
      }}
      proOptions={{
        hideAttribution: true,
      }}
    >
      <Background
        gap={32}
        size={1}
        color="rgba(148,163,184,.13)"
      />

      <MiniMap
        nodeColor={(node) =>
          miniMapColors[
            node.data.type as EntityType
          ]
        }
        maskColor="rgba(2,6,23,.76)"
        style={{
          background: "rgba(7,16,29,.92)",
          border:
            "1px solid rgba(255,255,255,.08)",
          borderRadius: 16,
        }}
      />

      <Controls
        position="bottom-right"
        style={{
          marginBottom: 82,
          marginRight: 12,
          overflow: "hidden",
          borderRadius: 14,
          border:
            "1px solid rgba(255,255,255,.08)",
          background: "rgba(7,16,29,.92)",
          boxShadow:
            "0 18px 50px rgba(0,0,0,.3)",
        }}
      />
    </ReactFlow>
  );
}