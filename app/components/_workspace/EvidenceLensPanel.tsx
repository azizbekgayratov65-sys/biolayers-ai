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
  softGlow: string;
};

const definitions: EvidenceDefinition[] = [
  {
    id: "all",
    title: "All Evidence",
    code: "ALL",
    description:
      "Show the complete biological graph without filtering by evidence strength.",
    color: "#dbe7ea",
    border: "rgba(148,163,184,.14)",
    background: "rgba(148,163,184,.025)",
    softGlow: "rgba(148,163,184,.08)",
  },
  {
    id: "established",
    title: "Established",
    code: "E4",
    description:
      "High-confidence relationships or connections supported by broad literature coverage.",
    color: "#2bff88",
    border: "rgba(43,255,136,.16)",
    background: "rgba(43,255,136,.035)",
    softGlow: "rgba(43,255,136,.10)",
  },
  {
    id: "supported",
    title: "Supported",
    code: "E3",
    description:
      "Well-supported relationships with strong but not maximal evidence.",
    color: "#8db2ff",
    border: "rgba(141,178,255,.16)",
    background: "rgba(141,178,255,.035)",
    softGlow: "rgba(141,178,255,.10)",
  },
  {
    id: "emerging",
    title: "Emerging",
    code: "E2",
    description:
      "Relationships with moderate support that may represent developing biological evidence.",
    color: "#ffc53d",
    border: "rgba(255,197,61,.16)",
    background: "rgba(255,197,61,.035)",
    softGlow: "rgba(255,197,61,.10)",
  },
  {
    id: "hypothesis",
    title: "Hypothesis",
    code: "E1",
    description:
      "Low-confidence or exploratory relationships that should be interpreted cautiously.",
    color: "#a15cff",
    border: "rgba(161,92,255,.16)",
    background: "rgba(161,92,255,.035)",
    softGlow: "rgba(161,92,255,.10)",
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

  const totalClassified =
    counts.established +
    counts.supported +
    counts.emerging +
    counts.hypothesis;

  const strongShare =
    totalClassified === 0
      ? 0
      : Math.round(
          ((counts.established + counts.supported) /
            totalClassified) *
            100,
        );

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
            className="absolute inset-0 z-[64] bg-[#030507]/58 backdrop-blur-[5px]"
          />

          <motion.section
            initial={{
              opacity: 0,
              x: 90,
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
              x: 90,
              scale: 0.985,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.34,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-5 right-5 top-5 z-[66] flex w-[min(520px,calc(100vw-40px))] flex-col overflow-hidden rounded-[24px] border border-teal-100/[0.08] bg-[#070b10]/97 shadow-[0_30px_120px_rgba(1,8,15,.56)] backdrop-blur-3xl"
          >
            <header className="relative overflow-hidden border-b border-teal-100/[0.065] px-5 py-5 sm:px-6">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-300/[0.04] blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-[-90px] h-48 w-48 rounded-full bg-sky-300/[0.025] blur-3xl" />
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
                      BioLayers / Evidence Engine
                    </p>
                  </div>

                  <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.038em] text-[#eef4ff]">
                    Evidence Lens
                  </h2>

                  <p className="mt-2 max-w-md text-[12px] leading-6 text-slate-400">
                    Re-render the biological graph according to
                    evidence strength instead of treating every
                    relationship as equally trustworthy.
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

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[18px] border border-teal-100/[0.06] bg-[#0a0f14]/48 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Graph evidence profile
                    </p>

                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Relationship distribution across the current graph.
                    </p>
                  </div>

                  <span className="rounded-full border border-teal-100/[0.06] bg-black/[0.1] px-2.5 py-1 font-mono text-[9px] text-slate-400">
                    {edges.length} relations
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  <MiniMetric
                    label="E4"
                    value={counts.established}
                    color="#6ee7b7"
                  />
                  <MiniMetric
                    label="E3"
                    value={counts.supported}
                    color="#a15cff"
                  />
                  <MiniMetric
                    label="E2"
                    value={counts.emerging}
                    color="#fcd34d"
                  />
                  <MiniMetric
                    label="E1"
                    value={counts.hypothesis}
                    color="#fda4af"
                  />
                </div>

                <div className="mt-4 rounded-[14px] border border-teal-100/[0.045] bg-black/[0.08] px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
                      Established + supported
                    </span>

                    <span className="font-mono text-[11px] font-semibold text-teal-200">
                      {strongShare}%
                    </span>
                  </div>

                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strongShare}%` }}
                      transition={{
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300"
                    />
                  </div>
                </div>
              </motion.div>

              <div className="mt-5 space-y-2.5">
                {definitions.map((definition, index) => {
                  const active = mode === definition.id;

                  const count =
                    definition.id === "all"
                      ? edges.length
                      : counts[definition.id];

                  return (
                    <motion.button
                      key={definition.id}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.035,
                        duration: 0.3,
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() =>
                        onChangeMode(definition.id)
                      }
                      className="group relative w-full overflow-hidden rounded-[16px] border p-4 text-left transition duration-300"
                      style={{
                        borderColor: active
                          ? definition.color
                          : definition.border,
                        backgroundColor:
                          definition.background,
                        boxShadow: active
                          ? `0 0 0 1px ${definition.color}25, 0 14px 40px ${definition.softGlow}`
                          : "0 10px 30px rgba(1,8,15,.10)",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(circle at 85% 20%, ${definition.softGlow}, transparent 40%)`,
                        }}
                      />

                      <div className="relative flex items-start justify-between gap-5">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border font-mono text-[9px] font-bold"
                            style={{
                              color: definition.color,
                              borderColor: `${definition.color}38`,
                              backgroundColor: `${definition.color}0d`,
                              boxShadow: active
                                ? `0 0 14px ${definition.softGlow}`
                                : undefined,
                            }}
                          >
                            {definition.code}
                          </span>

                          <div>
                            <p
                              className="text-[13px] font-semibold"
                              style={{
                                color: active
                                  ? definition.color
                                  : "#e5eef0",
                              }}
                            >
                              {definition.title}
                            </p>

                            <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                              {definition.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className="rounded-full border px-2.5 py-1 font-mono text-[9px]"
                          style={{
                            color: definition.color,
                            borderColor: `${definition.color}2f`,
                            backgroundColor: `${definition.color}08`,
                          }}
                        >
                          {count}
                        </span>
                      </div>

                      {active && (
                        <motion.div
                          layoutId="evidence-lens-active"
                          className="relative mt-4 h-px"
                          style={{
                            background: `linear-gradient(90deg, ${definition.color}, transparent)`,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[15px] border border-amber-200/[0.07] bg-amber-200/[0.022] p-4">
                <div className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
                      Evidence model
                    </p>

                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      BioLayers currently classifies graph relationships
                      using edge confidence plus loaded evidence count.
                      This is a visualization layer for research
                      exploration, not a formal grading of scientific
                      truth or clinical evidence.
                    </p>
                  </div>
                </div>
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
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[12px] border border-teal-100/[0.045] bg-black/[0.09] px-3 py-3 text-center"
    >
      <p
        className="font-mono text-[9px] font-bold"
        style={{ color }}
      >
        {label}
      </p>

      <p className="mt-1.5 font-mono text-[17px] font-semibold text-slate-100">
        {value}
      </p>
    </motion.div>
  );
}