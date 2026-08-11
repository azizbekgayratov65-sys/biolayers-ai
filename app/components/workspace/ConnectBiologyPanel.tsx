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
  cell: "#2dd4bf",
  protein: "#a78bfa",
  gene: "#22d3ee",
  drug: "#f472b6",
  pathway: "#fbbf24",
  process: "#60a5fa",
  disease: "#fb7185",
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
            className="absolute inset-0 z-[64] bg-[#01040a]/55 backdrop-blur-sm"
          />

          <motion.section
            initial={{ opacity: 0, x: 80, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.985 }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-5 right-5 top-5 z-[65] flex w-[min(520px,calc(100vw-40px))] flex-col overflow-hidden rounded-[28px] border border-[#21303a] bg-[#071017]/95 shadow-[0_30px_120px_rgba(0,0,0,.58)]"
          >
            <header className="border-b border-[#1d2b33] px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#d6ff4b] shadow-[0_0_12px_rgba(214,255,75,.7)]" />
                    <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9cae83]">
                      BioLayers / Mechanism Engine
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#eef4e4]">
                    Connect the Biology
                  </h2>

                  <p className="mt-2 max-w-md text-xs leading-6 text-[#819099]">
                    Select two biological entities and trace the
                    shortest mechanistic bridge already present
                    in your research graph.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[11px] border border-[#28353d] bg-[#0b151b] px-3 py-2 font-mono text-[10px] text-[#70808a] transition hover:border-[#50616a] hover:text-white"
                >
                  ESC
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
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

                <button
                  type="button"
                  onClick={swapEntities}
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#2d3940] bg-[#0a1218] font-mono text-xs text-[#a8b3b9] transition hover:border-[#d6ff4b]/40 hover:text-[#d6ff4b]"
                >
                  ⇅
                </button>

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

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={connectBiology}
                  className="flex-1 rounded-[14px] border border-[#d6ff4b]/25 bg-[#d6ff4b] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#071006] transition hover:brightness-110"
                >
                  Find Mechanistic Path
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="rounded-[14px] border border-[#26343c] bg-[#0a1319] px-4 py-3 text-xs font-semibold text-[#778690] transition hover:text-white"
                >
                  Reset
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-[15px] border border-[#743a40] bg-[#35181b] px-4 py-3 text-xs leading-5 text-[#ffb4b8]">
                  {error}
                </div>
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
                    <div className="flex items-end justify-between gap-4 border-b border-[#1e2b32] pb-4">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#708087]">
                          Mechanistic bridge
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[#edf5e7]">
                          {sourceNode?.data.label ?? "Source"} →{" "}
                          {targetNode?.data.label ?? "Target"}
                        </h3>
                      </div>

                      <span className="rounded-full border border-[#304047] bg-[#0a151b] px-3 py-1 font-mono text-[9px] text-[#819099]">
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
                                <span
                                  className="h-3 w-3 shrink-0 rounded-full border-2 border-[#071017]"
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
                                  <div className="h-16 w-px bg-[#26353c]" />
                                )}
                              </div>

                              <div className="-mt-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-semibold text-[#e4ede7]">
                                      {pathNode.label}
                                    </p>
                                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#65747c]">
                                      {pathNode.type}
                                    </p>
                                  </div>

                                  <span className="font-mono text-[9px] text-[#495960]">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                </div>

                                {nextEdge && (
                                  <div className="mt-3 flex items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-mono text-[10px] text-[#b6c899]">
                                        {nextEdge.relation}
                                      </p>
                                    </div>

                                    <EvidenceTag
                                      level={nextEdge.evidenceLevel}
                                    />

                                    <span className="font-mono text-[9px] text-[#637078]">
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
                      className="mt-7 w-full rounded-[15px] border border-[#d6ff4b]/25 bg-[#152014] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#d6ff4b] transition hover:bg-[#1d2919]"
                    >
                      Focus Path in Graph →
                    </button>

                    <div className="mt-4 rounded-[14px] border border-[#28363d] bg-[#081218] p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#66757d]">
                        Interpretation
                      </p>
                      <p className="mt-2 text-xs leading-6 text-[#829097]">
                        This path is computed only from relationships
                        currently represented in the BioLayers graph.
                        It is a research navigation aid, not a causal
                        or clinical conclusion.
                      </p>
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
    <label className="block rounded-[18px] border border-[#26343c] bg-[#091319] p-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#65757c]">
        {label}
      </span>

      <div className="mt-3 flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: selected
              ? typeColors[selected.data.type]
              : "#43515a",
          }}
        />

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#e5ece8] outline-none"
        >
          <option value="" className="bg-[#071017]">
            Choose entity...
          </option>

          {nodes.map((node) => (
            <option
              key={node.id}
              value={node.id}
              className="bg-[#071017]"
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
      ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200"
      : level === "Supported"
        ? "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200"
        : level === "Emerging"
          ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
          : "border-rose-300/20 bg-rose-300/[0.06] text-rose-200";

  return (
    <span
      className={`rounded-full border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${className}`}
    >
      {level}
    </span>
  );
}