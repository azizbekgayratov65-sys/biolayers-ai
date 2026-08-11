"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import type { Edge } from "@xyflow/react";

import type { ResearchEdgeData } from "../../lib/researchGraph";

export type EvidenceLensMode =
  | "all"
  | "established"
  | "supported"
  | "emerging"
  | "hypothesis";

type EvidenceLensPanelProps = {
  edges: Edge<ResearchEdgeData>[];
  open: boolean;
  mode: EvidenceLensMode;
  onClose: () => void;
  onChangeMode: (mode: EvidenceLensMode) => void;
};

type EvidenceDefinition = {
  id: EvidenceLensMode;
  title: string;
  code: string;
  description: string;
  color: string;
  border: string;
  background: string;
};

const definitions: EvidenceDefinition[] = [
  {
    id: "all",
    title: "All Evidence",
    code: "ALL",
    description:
      "Show the complete biological graph without filtering by evidence strength.",
    color: "#d8e1e7",
    border: "#33424a",
    background: "#0b151b",
  },
  {
    id: "established",
    title: "Established",
    code: "E4",
    description:
      "High-confidence relationships or connections supported by broad literature coverage.",
    color: "#8ff0b3",
    border: "#315844",
    background: "#0c1d15",
  },
  {
    id: "supported",
    title: "Supported",
    code: "E3",
    description:
      "Well-supported relationships with strong but not maximal evidence.",
    color: "#79dce8",
    border: "#28545c",
    background: "#0a1b20",
  },
  {
    id: "emerging",
    title: "Emerging",
    code: "E2",
    description:
      "Relationships with moderate support that may represent developing biological evidence.",
    color: "#f4c56a",
    border: "#624d2b",
    background: "#20180b",
  },
  {
    id: "hypothesis",
    title: "Hypothesis",
    code: "E1",
    description:
      "Low-confidence or exploratory relationships that should be interpreted cautiously.",
    color: "#ff8b79",
    border: "#683b35",
    background: "#24100e",
  },
];

function classifyEdge(
  edge: Edge<ResearchEdgeData>,
): Exclude<EvidenceLensMode, "all"> {
  const confidence =
    typeof edge.data?.confidence === "number"
      ? edge.data.confidence
      : 0.55;

  const evidenceCount =
    typeof edge.data?.evidenceCount === "number"
      ? edge.data.evidenceCount
      : 0;

  if (confidence >= 0.85 || evidenceCount >= 4) {
    return "established";
  }

  if (confidence >= 0.7 || evidenceCount >= 2) {
    return "supported";
  }

  if (confidence >= 0.5 || evidenceCount >= 1) {
    return "emerging";
  }

  return "hypothesis";
}

export default function EvidenceLensPanel({
  edges,
  open,
  mode,
  onClose,
  onChangeMode,
}: EvidenceLensPanelProps) {
  const counts = useMemo(() => {
    const result: Record<
      Exclude<EvidenceLensMode, "all">,
      number
    > = {
      established: 0,
      supported: 0,
      emerging: 0,
      hypothesis: 0,
    };

    for (const edge of edges) {
      result[classifyEdge(edge)] += 1;
    }

    return result;
  }, [edges]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close Evidence Lens"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[64] bg-[#01040a]/55 backdrop-blur-sm"
          />

          <motion.section
            initial={{ opacity: 0, x: 90, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 90, scale: 0.985 }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-5 right-5 top-5 z-[66] flex w-[min(500px,calc(100vw-40px))] flex-col overflow-hidden rounded-[28px] border border-[#3c2d28] bg-[#110b09]/96 shadow-[0_30px_120px_rgba(0,0,0,.62)]"
          >
            <header className="border-b border-[#32241f] px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff8b5e] shadow-[0_0_12px_rgba(255,139,94,.7)]" />

                    <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b8775f]">
                      BioLayers / Evidence Engine
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#f5e8e2]">
                    Evidence Lens
                  </h2>

                  <p className="mt-2 max-w-md text-xs leading-6 text-[#9a8178]">
                    Re-render the biological graph according to
                    evidence strength instead of treating every
                    relationship as equally trustworthy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[11px] border border-[#43332d] bg-[#18100d] px-3 py-2 font-mono text-[10px] text-[#8b7168] transition hover:border-[#705247] hover:text-white"
                >
                  ESC
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="rounded-[16px] border border-[#3a2b26] bg-[#170f0c] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#80675f]">
                    Graph evidence profile
                  </p>

                  <span className="font-mono text-[9px] text-[#a98d82]">
                    {edges.length} RELATIONS
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  <MiniMetric
                    label="E4"
                    value={counts.established}
                    color="#8ff0b3"
                  />
                  <MiniMetric
                    label="E3"
                    value={counts.supported}
                    color="#79dce8"
                  />
                  <MiniMetric
                    label="E2"
                    value={counts.emerging}
                    color="#f4c56a"
                  />
                  <MiniMetric
                    label="E1"
                    value={counts.hypothesis}
                    color="#ff8b79"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {definitions.map((definition) => {
                  const active = mode === definition.id;

                  const count =
                    definition.id === "all"
                      ? edges.length
                      : counts[definition.id];

                  return (
                    <button
                      key={definition.id}
                      type="button"
                      onClick={() =>
                        onChangeMode(definition.id)
                      }
                      className="group w-full rounded-[18px] border p-4 text-left transition"
                      style={{
                        borderColor: active
                          ? definition.color
                          : definition.border,
                        backgroundColor:
                          definition.background,
                        boxShadow: active
                          ? `0 0 0 1px ${definition.color}28, 0 0 26px ${definition.color}12`
                          : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border font-mono text-[9px] font-bold"
                            style={{
                              color: definition.color,
                              borderColor:
                                `${definition.color}45`,
                              backgroundColor:
                                `${definition.color}0d`,
                            }}
                          >
                            {definition.code}
                          </span>

                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{
                                color: active
                                  ? definition.color
                                  : "#e5d8d2",
                              }}
                            >
                              {definition.title}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-[#8c756c]">
                              {definition.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className="rounded-full border px-2 py-1 font-mono text-[9px]"
                          style={{
                            color: definition.color,
                            borderColor:
                              `${definition.color}2f`,
                          }}
                        >
                          {count}
                        </span>
                      </div>

                      {active && (
                        <motion.div
                          layoutId="evidence-lens-active"
                          className="mt-4 h-px"
                          style={{
                            background: `linear-gradient(90deg, ${definition.color}, transparent)`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[16px] border border-[#3a2b26] bg-[#150e0b] p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#80675f]">
                  Evidence model
                </p>

                <p className="mt-2 text-xs leading-6 text-[#917b73]">
                  BioLayers currently classifies graph relationships
                  using edge confidence plus loaded evidence count.
                  This is a visualization layer for research
                  exploration, not a formal grading of scientific
                  truth or clinical evidence.
                </p>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

function MiniMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#352823] bg-[#0f0908] px-3 py-3 text-center">
      <p
        className="font-mono text-[9px] font-bold"
        style={{ color }}
      >
        {label}
      </p>

      <p className="mt-2 font-mono text-lg font-semibold text-[#f0e4df]">
        {value}
      </p>
    </div>
  );
}