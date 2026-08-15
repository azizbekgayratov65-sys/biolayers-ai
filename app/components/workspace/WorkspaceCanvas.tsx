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
  EntityType,
} from "../../lib/buildGraphFromText";

import type {
  ResearchEntityData,
} from "../../lib/researchGraph";

import EntityNode from "./EntityNode";
import BiologicalEdge from "./BiologicalEdge";

type EntityNodeType = Node<
  ResearchEntityData,
  "entity"
>;

export type WorkspaceFlowInstance =
  ReactFlowInstance<
    EntityNodeType,
    Edge
  >;

type WorkspaceCanvasProps = {
  nodes: EntityNodeType[];
  edges: Edge[];

  onInit: (
    instance: WorkspaceFlowInstance,
  ) => void;

  onNodesChange:
    OnNodesChange<EntityNodeType>;

  onSelectNode: (
    nodeId: string,
  ) => void;

  onSelectEdge: (
    edgeId: string,
  ) => void;

  onPaneClick: () => void;

  onNodeEnter: (
    nodeId: string,
  ) => void;

  onNodeLeave: () => void;
};

const nodeTypes = {
  entity: EntityNode,
};

const edgeTypes = {
  biological: BiologicalEdge,
};

const miniMapColors: Record<
  EntityType,
  string
> = {
  cell: "#5eead4",
  protein: "#67e8f9",
  gene: "#6ee7b7",
  pathway: "#fcd34d",
  process: "#7dd3fc",
  disease: "#fda4af",
  drug: "#fdba74",
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
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-[#07151f]
      "
    >
      {/* ================================================= */}
      {/* CANVAS ATMOSPHERE                                */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[0]
          bg-[radial-gradient(circle_at_52%_44%,rgba(94,234,212,.04),transparent_35%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[0]
          opacity-[0.28]
          [mask-image:linear-gradient(to_bottom,black,transparent_88%)]
          bg-[linear-gradient(rgba(153,246,228,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(153,246,228,.015)_1px,transparent_1px)]
          bg-[size:96px_96px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-[18%]
          top-0
          z-[1]
          h-px
          bg-gradient-to-r
          from-transparent
          via-teal-200/[0.12]
          to-transparent
        "
      />

      {/* ================================================= */}
      {/* REACT FLOW                                       */}
      {/* ================================================= */}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        onNodesChange={onNodesChange}
        onNodeClick={(
          _,
          node,
        ) => {
          onSelectNode(node.id);
        }}
        onEdgeClick={(
          _,
          edge,
        ) => {
          onSelectEdge(edge.id);
        }}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={(
          _,
          node,
        ) => {
          onNodeEnter(node.id);
        }}
        onNodeMouseLeave={
          onNodeLeave
        }
        fitView
        fitViewOptions={{
          padding: 0.12,
          minZoom: 0.5,
          maxZoom: 1.06,
          duration: 760,
        }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.34}
        maxZoom={2.2}
        panOnScroll
        zoomOnScroll
        defaultEdgeOptions={{
          type: "biological",
          markerEnd: {
            type:
              MarkerType.ArrowClosed,
            color: "#7dd3fc",
            width: 16,
            height: 16,
          },
        }}
        proOptions={{
          hideAttribution: true,
        }}
        className="!bg-transparent"
      >
        {/* ================================================= */}
        {/* SCIENTIFIC GRID                                  */}
        {/* ================================================= */}

        <Background
          gap={42}
          size={1}
          color="rgba(153,246,228,.095)"
        />

        {/* ================================================= */}
        {/* MINI MAP                                         */}
        {/* ================================================= */}

        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={2}
          nodeColor={(node) =>
            miniMapColors[
              node.data
                .type as EntityType
            ]
          }
          maskColor="rgba(6,17,26,.74)"
          className="
            !hidden
            md:!block
          "
          style={{
            width: 164,
            height: 108,
            right: 14,
            bottom: 16,

            background:
              "rgba(10,27,38,.90)",

            border:
              "1px solid rgba(153,246,228,.10)",

            borderRadius: 16,

            boxShadow:
              "0 16px 46px rgba(1,8,15,.34)",

            backdropFilter:
              "blur(18px)",
          }}
        />

        {/* ================================================= */}
        {/* FLOW CONTROLS                                    */}
        {/* ================================================= */}

        <Controls
          position="bottom-right"
          showInteractive={false}
          style={{
            marginBottom: 132,
            marginRight: 14,

            overflow:
              "hidden",

            borderRadius: 13,

            border:
              "1px solid rgba(153,246,228,.10)",

            background:
              "rgba(10,27,38,.92)",

            boxShadow:
              "0 14px 42px rgba(1,8,15,.30)",
          }}
        />
      </ReactFlow>

      {/* ================================================= */}
      {/* CANVAS FRAME                                     */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-4
          top-4
          z-[3]
          h-5
          w-5
          border-l
          border-t
          border-teal-200/[0.09]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-4
          top-4
          z-[3]
          h-5
          w-5
          border-r
          border-t
          border-teal-200/[0.09]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-4
          left-4
          z-[3]
          h-5
          w-5
          border-b
          border-l
          border-teal-200/[0.07]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-4
          right-4
          z-[3]
          h-5
          w-5
          border-b
          border-r
          border-teal-200/[0.07]
        "
      />
    </div>
  );
}