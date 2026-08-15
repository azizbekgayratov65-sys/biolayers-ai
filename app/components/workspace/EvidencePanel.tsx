"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import type {
  EntityType,
} from "../../lib/buildGraphFromText";

import type {
  ResearchEntityData,
} from "../../lib/researchGraph";

export type EvidenceLevel =
  | "No evidence"
  | "Limited"
  | "Moderate"
  | "Strong";

export type EvidenceProfile = {
  level: EvidenceLevel;
  score: number;
  description: string;
  badgeClass: string;
  meterClass: string;
};

export type RelatedConnection = {
  nodeId: string;
  label: string;
  type: EntityType;
  relation: string;
  direction: "incoming" | "outgoing";
};

type EvidencePanelProps = {
  selectedEntity: ResearchEntityData;
  relatedConnections: RelatedConnection[];
  pubMedLoading: boolean;
  pubMedPaperCount: number;
  evidenceProfile: EvidenceProfile;
  focusNode: (nodeId: string) => Promise<void>;
  showGraph: () => void;
  showPubMed: () => void;
};

const entityVisual: Record<
  EntityType,
  {
    dot: string;
    border: string;
    bg: string;
  }
> = {
  cell: {
    dot: "bg-teal-300",
    border: "border-teal-200/[0.12]",
    bg: "bg-teal-200/[0.025]",
  },
  protein: {
    dot: "bg-cyan-300",
    border: "border-cyan-200/[0.12]",
    bg: "bg-cyan-200/[0.025]",
  },
  gene: {
    dot: "bg-emerald-300",
    border: "border-emerald-200/[0.12]",
    bg: "bg-emerald-200/[0.025]",
  },
  pathway: {
    dot: "bg-amber-300",
    border: "border-amber-200/[0.12]",
    bg: "bg-amber-200/[0.025]",
  },
  process: {
    dot: "bg-sky-300",
    border: "border-sky-200/[0.12]",
    bg: "bg-sky-200/[0.025]",
  },
  disease: {
    dot: "bg-rose-300",
    border: "border-rose-200/[0.12]",
    bg: "bg-rose-200/[0.025]",
  },
  drug: {
    dot: "bg-orange-300",
    border: "border-orange-200/[0.12]",
    bg: "bg-orange-200/[0.025]",
  },
};

function confidencePercent(
  confidence?: number,
) {
  if (
    typeof confidence !== "number" ||
    Number.isNaN(confidence)
  ) {
    return null;
  }

  return Math.round(
    Math.min(Math.max(confidence, 0), 1) * 100,
  );
}

export default function EvidencePanel({
  selectedEntity,
  relatedConnections,
  pubMedLoading,
  pubMedPaperCount,
  evidenceProfile,
  focusNode,
  showGraph,
  showPubMed,
}: EvidencePanelProps) {
  const reduceMotion = Boolean(useReducedMotion());

  const aiConfidence =
    confidencePercent(
      selectedEntity.confidence,
    );

  const evidenceQuote =
    selectedEntity.evidenceQuote?.trim();

  return (
    <>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <EvidenceMetricCard
          eyebrow="Entity type"
          value={selectedEntity.type}
          detail="Biological classification"
          reduceMotion={reduceMotion}
        />

        <EvidenceMetricCard
          eyebrow="Direct links"
          value={String(relatedConnections.length)}
          detail="Visible graph relationships"
          reduceMotion={reduceMotion}
        />

        <EvidenceMetricCard
          eyebrow="PubMed papers"
          value={
            pubMedLoading
              ? "…"
              : String(pubMedPaperCount)
          }
          detail="Candidate literature records"
          reduceMotion={reduceMotion}
        />

        <EvidenceMetricCard
          eyebrow="Coverage"
          value={evidenceProfile.level}
          detail={`${evidenceProfile.score}% literature-coverage indicator`}
          reduceMotion={reduceMotion}
        />

        <EvidenceMetricCard
          eyebrow="AI confidence"
          value={
            aiConfidence === null
              ? "—"
              : `${aiConfidence}%`
          }
          detail="Extraction confidence"
          reduceMotion={reduceMotion}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[24px] border border-teal-100/[0.07] bg-[#0a1b26]/52 p-5 shadow-[0_18px_52px_rgba(1,8,15,.12)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-teal-300">
                Mechanistic network
              </p>

              <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.025em] text-[#f0fbfa]">
                Connected biological entities
              </h3>
            </div>

            <span className="rounded-full border border-teal-100/[0.055] bg-black/[0.1] px-2.5 py-1 font-mono text-[10px] text-slate-400">
              {relatedConnections.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {relatedConnections.length === 0 ? (
              <div className="rounded-[15px] border border-teal-100/[0.045] bg-black/[0.1] p-4">
                <p className="text-[12px] text-slate-500">
                  No visible direct relationships were found.
                </p>
              </div>
            ) : (
              relatedConnections.map(
                (connection, index) => {
                  const visual =
                    entityVisual[connection.type];

                  return (
                    <motion.button
                      key={`${connection.nodeId}-evidence`}
                      type="button"
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.035,
                      }}
                      onClick={() => {
                        void focusNode(
                          connection.nodeId,
                        );
                        showGraph();
                      }}
                      className={`group flex w-full items-center justify-between gap-4 rounded-[16px] border px-4 py-3.5 text-left transition duration-300 hover:-translate-y-0.5 ${visual.border} ${visual.bg}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${visual.dot}`}
                          />

                          <p className="truncate text-[13px] font-semibold text-slate-100">
                            {connection.label}
                          </p>
                        </div>

                        <p className="mt-1.5 text-[10px] uppercase tracking-[0.11em] text-slate-500">
                          {connection.direction ===
                          "outgoing"
                            ? "Outgoing"
                            : "Incoming"}{" "}
                          · {connection.relation}
                        </p>
                      </div>

                      <span className="rounded-[10px] border border-teal-100/[0.055] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-slate-500 transition group-hover:border-teal-200/[0.12] group-hover:text-teal-300">
                        Focus
                      </span>
                    </motion.button>
                  );
                },
              )
            )}
          </div>
        </section>

        <section className="rounded-[24px] border border-teal-100/[0.07] bg-[linear-gradient(145deg,rgba(14,45,55,.58),rgba(8,27,38,.5))] p-5 shadow-[0_18px_52px_rgba(1,8,15,.12)] sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-sky-300">
            Scientific interpretation
          </p>

          <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.025em] text-[#f0fbfa]">
            Biological context
          </h3>

          <p className="mt-4 text-[14px] leading-7 text-slate-300">
            {selectedEntity.description}
          </p>

          {selectedEntity.aliases &&
            selectedEntity.aliases.length > 0 && (
              <div className="mt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Aliases
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedEntity.aliases
                    .slice(0, 6)
                    .map((alias) => (
                      <span
                        key={alias}
                        className="rounded-full border border-teal-100/[0.055] bg-black/[0.1] px-2.5 py-1 text-[10px] text-slate-400"
                      >
                        {alias}
                      </span>
                    ))}
                </div>
              </div>
            )}

          {aiConfidence !== null && (
            <div className="mt-5 rounded-[16px] border border-emerald-200/[0.09] bg-emerald-200/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                    AI extraction confidence
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Confidence in entity extraction from source text
                  </p>
                </div>

                <span className="font-mono text-[16px] font-semibold text-emerald-200">
                  {aiConfidence}%
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-teal-100/[0.045]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${aiConfidence}%`,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300"
                />
              </div>

              <p className="mt-2.5 text-[10px] leading-5 text-slate-500">
                This score reflects extraction confidence, not
                universal biological truth.
              </p>
            </div>
          )}

          {evidenceQuote && (
            <div className="mt-5 rounded-[16px] border border-sky-200/[0.09] bg-sky-200/[0.025] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-300">
                Source-text evidence
              </p>

              <blockquote className="mt-3 border-l-2 border-sky-200/[0.2] pl-3.5 text-[13px] italic leading-6 text-slate-200">
                “{evidenceQuote}”
              </blockquote>

              <p className="mt-3 text-[9px] uppercase tracking-[0.11em] text-slate-500">
                Source · submitted research text · not independently validated
              </p>
            </div>
          )}

          <div className="mt-5 border-l border-teal-200/[0.18] pl-4">
            <p className="text-[12px] leading-6 text-slate-400">
              BioLayers keeps AI extraction confidence and
              literature coverage separate so evidence volume is
              never presented as biological certainty.
            </p>
          </div>

          <button
            type="button"
            onClick={showPubMed}
            className="group relative mt-5 w-full overflow-hidden rounded-[13px] border border-teal-200/[0.16] bg-[linear-gradient(135deg,#99f6e4,#67e8f9)] px-4 py-3 text-[11px] font-extrabold text-[#062029] shadow-[0_10px_28px_rgba(45,212,191,.12)] transition duration-300 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
            <span className="relative">
              Open PubMed evidence
            </span>
          </button>
        </section>
      </div>
    </>
  );
}

function EvidenceMetricCard({
  eyebrow,
  value,
  detail,
  reduceMotion,
}: {
  eyebrow: string;
  value: string;
  detail: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className="rounded-[18px] border border-teal-100/[0.06] bg-[#0a1b26]/45 p-4 transition duration-300 hover:border-teal-200/[0.11] hover:bg-teal-200/[0.02]"
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
        {eyebrow}
      </p>

      <p className="mt-2 truncate text-[20px] font-semibold capitalize tracking-[-0.03em] text-[#f0fbfa]">
        {value}
      </p>

      <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
        {detail}
      </p>
    </motion.div>
  );
}