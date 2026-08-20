"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Edge, Node } from "@xyflow/react";

import type { EntityType } from "../../lib/buildGraphFromText";
import type {
  ResearchEdgeData,
  ResearchEntityData,
} from "../../lib/researchGraph";

type EntityNodeType = Node<ResearchEntityData, "entity">;

export type BiologicalPathStep = {
  nodeId: string;
  label: string;
  type: EntityType;
};

export type BiologicalPathEdge = {
  edgeId: string;
  source: string;
  target: string;
  relation: string;
  confidence: number;
  evidenceLevel:
    | "Established"
    | "Supported"
    | "Emerging"
    | "Hypothesis";
};

export type BiologicalPathResult = {
  nodes: BiologicalPathStep[];
  edges: BiologicalPathEdge[];
};

type ConnectBiologyPanelProps = {
  nodes: EntityNodeType[];
  edges: Edge<ResearchEdgeData>[];
  open: boolean;
  onClose: () => void;
  onFocusPath: (result: BiologicalPathResult) => void;
};

const typeColors: Record<EntityType, string> = {
  cell: "#4d8dff",
  protein: "#c4b5fd",
  gene: "#6ee7b7",
  drug: "#fdba74",
  pathway: "#fcd34d",
  process: "#8db2ff",
  disease: "#fda4af",
};

function confidenceToEvidence(
  confidence: number,
): BiologicalPathEdge["evidenceLevel"] {
  if (confidence >= 0.85) return "Established";
  if (confidence >= 0.7) return "Supported";
  if (confidence >= 0.5) return "Emerging";
  return "Hypothesis";
}

function findShortestPath(
  nodes: EntityNodeType[],
  edges: Edge<ResearchEdgeData>[],
  sourceId: string,
  targetId: string,
): BiologicalPathResult | null {
  if (!sourceId || !targetId) return null;

  const adjacency = new Map<
    string,
    Array<{
      nodeId: string;
      edge: Edge<ResearchEdgeData>;
    }>
  >();

  for (const edge of edges) {
    const sourceItems = adjacency.get(edge.source) ?? [];
    sourceItems.push({ nodeId: edge.target, edge });
    adjacency.set(edge.source, sourceItems);

    const targetItems = adjacency.get(edge.target) ?? [];
    targetItems.push({ nodeId: edge.source, edge });
    adjacency.set(edge.target, targetItems);
  }

  const queue = [sourceId];
  const visited = new Set<string>([sourceId]);
  const previous = new Map<
    string,
    {
      nodeId: string;
      edge: Edge<ResearchEdgeData>;
    }
  >();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current === targetId) break;

    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor.nodeId)) continue;

      visited.add(neighbor.nodeId);
      previous.set(neighbor.nodeId, {
        nodeId: current,
        edge: neighbor.edge,
      });
      queue.push(neighbor.nodeId);
    }
  }

  if (!visited.has(targetId)) return null;

  const nodeIds: string[] = [targetId];
  const pathEdges: Edge<ResearchEdgeData>[] = [];
  let cursor = targetId;

  while (cursor !== sourceId) {
    const step = previous.get(cursor);
    if (!step) return null;

    pathEdges.push(step.edge);
    cursor = step.nodeId;
    nodeIds.push(cursor);
  }

  nodeIds.reverse();
  pathEdges.reverse();

  const pathNodes = nodeIds
    .map((id) => nodes.find((node) => node.id === id))
    .filter((node): node is EntityNodeType => Boolean(node))
    .map((node) => ({
      nodeId: node.id,
      label: node.data.label,
      type: node.data.type,
    }));

  return {
    nodes: pathNodes,
    edges: pathEdges.map((edge) => {
      const confidence =
        typeof edge.data?.confidence === "number"
          ? edge.data.confidence
          : 0.55;

      return {
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        relation:
          typeof edge.label === "string"
            ? edge.label
            : edge.data?.relationType ?? "connected to",
        confidence,
        evidenceLevel: confidenceToEvidence(confidence),
      };
    }),
  };
}

export default function ConnectBiologyPanel({
  nodes,
  edges,
  open,
  onClose,
  onFocusPath,
}: ConnectBiologyPanelProps) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [result, setResult] =
    useState<BiologicalPathResult | null>(null);
  const [error, setError] = useState("");

  const orderedNodes = useMemo(
    () =>
      [...nodes].sort((a, b) =>
        a.data.label.localeCompare(b.data.label),
      ),
    [nodes],
  );

  const sourceNode = nodes.find((node) => node.id === sourceId);
  const targetNode = nodes.find((node) => node.id === targetId);

  function connectBiology() {
    if (!sourceId || !targetId) {
      setError("Choose both a source and target entity.");
      setResult(null);
      return;
    }

    if (sourceId === targetId) {
      setError("Choose two different biological entities.");
      setResult(null);
      return;
    }

    const path = findShortestPath(
      nodes,
      edges,
      sourceId,
      targetId,
    );

    if (!path) {
      setError(
        "No mechanistic bridge exists in the current graph. Expand one of the entities and try again.",
      );
      setResult(null);
      return;
    }

    setError("");
    setResult(path);
  }

  function swapEntities() {
    setSourceId(targetId);
    setTargetId(sourceId);
    setResult(null);
    setError("");
  }

  function reset() {
    setSourceId("");
    setTargetId("");
    setResult(null);
    setError("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close Connect the Biology"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[64] bg-[#030507]/58 backdrop-blur-[5px]"
          />

          <motion.section
            initial={{
              opacity: 0,
              x: 84,
              scale: 0.985,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              x: 84,
              scale: 0.985,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.34,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-5 right-5 top-5 z-[65] flex w-[min(560px,calc(100vw-40px))] flex-col overflow-hidden rounded-[24px] border border-teal-100/[0.08] bg-[#070b10]/97 shadow-[0_30px_120px_rgba(1,8,15,.56)] backdrop-blur-3xl"
          >
            {/* Header */}
            <header className="relative overflow-hidden border-b border-teal-100/[0.065] px-5 py-5 sm:px-6">
              <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-teal-300/[0.045] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/[0.18] to-transparent" />

              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_9px_rgba(77,141,255,.8)]"
                      animate={{
                        opacity: [0.55, 1, 0.55],
                        scale: [1, 1.22, 1],
                      }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                      BioLayers / Mechanism Engine
                    </p>
                  </div>

                  <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.038em] text-[#eef4ff]">
                    Connect the Biology
                  </h2>

                  <p className="mt-2 max-w-md text-[12px] leading-6 text-slate-400">
                    Select two biological entities and trace the
                    shortest mechanistic bridge already represented
                    in the research graph.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[11px] border border-teal-100/[0.07] bg-white/[0.018] px-3 py-2 font-mono text-[10px] text-slate-400 transition duration-300 hover:bg-white/[0.04] hover:text-slate-100"
                >
                  ESC
                </button>
              </div>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-3">
                <EntitySelector
                  label="01 / SOURCE"
                  value={sourceId}
                  nodes={orderedNodes}
                  onChange={(value) => {
                    setSourceId(value);
                    setResult(null);
                    setError("");
                  }}
                />

                <motion.button
                  type="button"
                  onClick={swapEntities}
                  whileHover={{ rotate: 180, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-teal-100/[0.07] bg-[#0a0f14]/72 text-[13px] text-slate-400 shadow-[0_8px_20px_rgba(1,8,15,.16)] transition hover:border-teal-200/[0.15] hover:text-teal-200"
                >
                  ⇅
                </motion.button>

                <EntitySelector
                  label="02 / TARGET"
                  value={targetId}
                  nodes={orderedNodes}
                  onChange={(value) => {
                    setTargetId(value);
                    setResult(null);
                    setError("");
                  }}
                />
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={connectBiology}
                  className="group relative flex-1 overflow-hidden rounded-[13px] border border-teal-200/[0.16] bg-[linear-gradient(135deg,#8db2ff,#a15cff)] px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#04070a] shadow-[0_12px_28px_rgba(77,141,255,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
                  <span className="relative">
                    Find mechanistic path
                  </span>
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="rounded-[13px] border border-teal-100/[0.07] bg-white/[0.018] px-4 py-3 text-[11px] font-semibold text-slate-400 transition duration-300 hover:bg-white/[0.04] hover:text-slate-100"
                >
                  Reset
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-[13px] border border-rose-200/[0.11] bg-rose-200/[0.035] px-4 py-3 text-[11px] leading-5 text-rose-200"
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key={`${sourceId}-${targetId}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="mt-7"
                  >
                    <div className="flex items-end justify-between gap-4 border-b border-teal-100/[0.06] pb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-500">
                          Mechanistic bridge
                        </p>

                        <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.025em] text-[#eef4ff]">
                          {sourceNode?.data.label ?? "Source"}{" "}
                          <span className="text-teal-300/60">→</span>{" "}
                          {targetNode?.data.label ?? "Target"}
                        </h3>
                      </div>

                      <span className="rounded-full border border-teal-100/[0.06] bg-black/[0.1] px-3 py-1 font-mono text-[9px] text-slate-400">
                        {result.edges.length} transitions
                      </span>
                    </div>

                    <div className="mt-5 space-y-0">
                      {result.nodes.map((pathNode, index) => {
                        const nextEdge = result.edges[index];

                        return (
                          <div key={pathNode.nodeId}>
                            <div className="relative flex items-start gap-4">
                              <div className="relative flex flex-col items-center">
                                <motion.span
                                  initial={{ scale: 0.7, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    delay: index * 0.04,
                                  }}
                                  className="h-3 w-3 shrink-0 rounded-full border-2 border-[#070b10]"
                                  style={{
                                    backgroundColor:
                                      typeColors[pathNode.type],
                                    boxShadow: `0 0 14px ${
                                      typeColors[pathNode.type]
                                    }55`,
                                  }}
                                />

                                {index <
                                  result.nodes.length - 1 && (
                                  <div className="relative h-16 w-px overflow-hidden bg-teal-100/[0.08]">
                                    <motion.div
                                      initial={{ y: "-100%" }}
                                      animate={{ y: "100%" }}
                                      transition={{
                                        duration: 1.6,
                                        repeat: Infinity,
                                        ease: "linear",
                                        delay: index * 0.15,
                                      }}
                                      className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-teal-300/55 to-transparent"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="-mt-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-[13px] font-semibold text-slate-100">
                                      {pathNode.label}
                                    </p>

                                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                                      {pathNode.type}
                                    </p>
                                  </div>

                                  <span className="font-mono text-[9px] text-slate-600">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                </div>

                                {nextEdge && (
                                  <div className="mt-3 flex items-center gap-2.5">
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-mono text-[10px] text-teal-200/75">
                                        {nextEdge.relation}
                                      </p>
                                    </div>

                                    <EvidenceTag
                                      level={nextEdge.evidenceLevel}
                                    />

                                    <span className="font-mono text-[9px] text-slate-500">
                                      {Math.round(
                                        nextEdge.confidence * 100,
                                      )}
                                      %
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => onFocusPath(result)}
                      className="group relative mt-7 w-full overflow-hidden rounded-[13px] border border-teal-200/[0.12] bg-teal-200/[0.045] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-teal-100 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-200/[0.075]"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        Focus path in graph
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </button>

                    <div className="mt-4 rounded-[14px] border border-amber-200/[0.07] bg-amber-200/[0.022] p-4">
                      <div className="flex gap-3">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
                            Interpretation
                          </p>

                          <p className="mt-2 text-[11px] leading-5 text-slate-500">
                            This path is computed only from relationships
                            currently represented in the BioLayers graph.
                            It is a research navigation aid, not a causal
                            or clinical conclusion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

function EntitySelector({
  label,
  value,
  nodes,
  onChange,
}: {
  label: string;
  value: string;
  nodes: EntityNodeType[];
  onChange: (value: string) => void;
}) {
  const selected = nodes.find((node) => node.id === value);

  return (
    <label className="block rounded-[16px] border border-teal-100/[0.06] bg-[#0a0f14]/48 p-4 transition duration-300 focus-within:border-teal-200/[0.14] focus-within:bg-teal-200/[0.02]">
      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>

      <div className="mt-3 flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: selected
              ? typeColors[selected.data.type]
              : "#475569",
            boxShadow: selected
              ? `0 0 10px ${typeColors[selected.data.type]}55`
              : undefined,
          }}
        />

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-slate-100 outline-none"
        >
          <option value="" className="bg-[#070b10]">
            Choose entity...
          </option>

          {nodes.map((node) => (
            <option
              key={node.id}
              value={node.id}
              className="bg-[#070b10]"
            >
              {node.data.label} — {node.data.type}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function EvidenceTag({
  level,
}: {
  level:
    | "Established"
    | "Supported"
    | "Emerging"
    | "Hypothesis";
}) {
  const className =
    level === "Established"
      ? "border-emerald-200/[0.14] bg-emerald-200/[0.045] text-emerald-200"
      : level === "Supported"
        ? "border-teal-200/[0.14] bg-teal-200/[0.045] text-teal-200"
        : level === "Emerging"
          ? "border-amber-200/[0.14] bg-amber-200/[0.045] text-amber-200"
          : "border-rose-200/[0.14] bg-rose-200/[0.045] text-rose-200";

  return (
    <span
      className={`rounded-full border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${className}`}
    >
      {level}
    </span>
  );
}