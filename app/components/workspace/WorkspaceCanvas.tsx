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

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useState,
} from "react";

import "@xyflow/react/dist/style.css";

import type {
  EntityType,
} from "../../lib/buildGraphFromText";

import type {
  ResearchEntityData,
} from "../../lib/researchGraph";

import EntityNode from "./EntityNode";
import BiologicalEdge from "./BiologicalEdge";
import KnowledgeGraph3D from "./KnowledgeGraph3D";

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
  onNodesChange: OnNodesChange<EntityNodeType>;
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
  biological:
    BiologicalEdge,
};

const miniMapColors: Record<EntityType, string> = {
  cell: "#2dd4bf",
  protein: "#a78bfa",
  gene: "#22d3ee",
  drug: "#f472b6",
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
  const [mode, setMode] =
    useState<
      "2d" | "3d"
    >("2d");

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-4 top-4 z-[45] flex items-center rounded-[14px] border border-white/[0.08] bg-[#050814]/84 p-1 shadow-[0_12px_40px_rgba(0,0,0,.28)] backdrop-blur-xl">
        {(
          [
            [
              "2d",
              "2D",
            ],
            [
              "3d",
              "3D",
            ],
          ] as const
        ).map(
          ([
            value,
            label,
          ]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setMode(
                  value,
                )
              }
              className={`relative rounded-[10px] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition ${
                mode === value
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-300"
              }`}
            >
              {mode ===
                value && (
                <motion.span
                  layoutId="workspace-graph-mode"
                  className="absolute inset-0 rounded-[10px] border border-cyan-300/15 bg-cyan-300/[0.07] shadow-[0_0_20px_rgba(34,211,238,.08)]"
                  transition={{
                    type: "spring",
                    stiffness:
                      420,
                    damping:
                      34,
                  }}
                />
              )}

              <span className="relative">
                {label}
              </span>
            </button>
          ),
        )}
      </div>

      <AnimatePresence
        mode="wait"
        initial={false}
      >
        {mode === "2d" ? (
          <motion.div
            key="2d"
            initial={{
              opacity: 0,
              scale: 0.985,
              filter:
                "blur(6px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter:
                "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 1.015,
              filter:
                "blur(6px)",
            }}
            transition={{
              duration: 0.32,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="absolute inset-0"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={
                nodeTypes
              }
              edgeTypes={
                edgeTypes
              }
              onInit={onInit}
              onNodesChange={
                onNodesChange
              }
              onNodeClick={(
                _,
                node,
              ) => {
                onSelectNode(
                  node.id,
                );
              }}
              onEdgeClick={(
                _,
                edge,
              ) => {
                onSelectEdge(
                  edge.id,
                );
              }}
              onPaneClick={
                onPaneClick
              }
              onNodeMouseEnter={(
                _,
                node,
              ) => {
                onNodeEnter(
                  node.id,
                );
              }}
              onNodeMouseLeave={
                onNodeLeave
              }
              fitView
              nodesDraggable
              nodesConnectable={
                false
              }
              minZoom={0.2}
              maxZoom={2}
              defaultEdgeOptions={{
                type: "biological",
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color:
                    "#64748b",
                },
              }}
              proOptions={{
                hideAttribution:
                  true,
              }}
            >
              <MiniMap
                nodeColor={(
                  node,
                ) =>
                  miniMapColors[
                    node.data
                      .type as EntityType
                  ]
                }
                maskColor="rgba(2,6,23,.76)"
                style={{
                  background:
                    "rgba(7,16,29,.92)",
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
                  overflow:
                    "hidden",
                  borderRadius: 14,
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  background:
                    "rgba(7,16,29,.92)",
                  boxShadow:
                    "0 18px 50px rgba(0,0,0,.3)",
                }}
              />

              <Background
                gap={28}
                size={1}
                color="rgba(148,163,184,.07)"
              />
            </ReactFlow>
          </motion.div>
        ) : (
          <motion.div
            key="3d"
            initial={{
              opacity: 0,
              scale: 1.03,
              filter:
                "blur(8px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter:
                "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.985,
              filter:
                "blur(8px)",
            }}
            transition={{
              duration: 0.38,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="absolute inset-0"
          >
            <KnowledgeGraph3D
              nodes={nodes}
              edges={edges}
              onSelectNode={
                onSelectNode
              }
              onSelectEdge={
                onSelectEdge
              }
              onPaneClick={
                onPaneClick
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}