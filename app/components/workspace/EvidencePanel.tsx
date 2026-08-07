"use client";

import { motion } from "framer-motion";

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
  direction:
    | "incoming"
    | "outgoing";
};

type EvidencePanelProps = {
  selectedEntity: ResearchEntityData;
  relatedConnections: RelatedConnection[];
  pubMedLoading: boolean;
  pubMedPaperCount: number;
  evidenceProfile: EvidenceProfile;
  focusNode: (
    nodeId: string,
  ) => Promise<void>;
  showGraph: () => void;
  showPubMed: () => void;
};

const entityColorClass: Record<
  EntityType,
  string
> = {
  cell: "bg-teal-400",
  protein: "bg-violet-400",
  pathway: "bg-amber-400",
  process: "bg-blue-400",
  disease: "bg-rose-400",
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
    Math.min(
      Math.max(confidence, 0),
      1,
    ) * 100,
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
  const aiConfidence =
    confidencePercent(
      selectedEntity.confidence,
    );

  const evidenceQuote =
    selectedEntity.evidenceQuote?.trim();

  return (
    <>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <EvidenceMetricCard
          eyebrow="Entity type"
          value={selectedEntity.type}
          detail="Biological classification"
        />

        <EvidenceMetricCard
          eyebrow="Direct links"
          value={String(
            relatedConnections.length,
          )}
          detail="Visible graph relationships"
        />

        <EvidenceMetricCard
          eyebrow="PubMed papers"
          value={
            pubMedLoading
              ? "…"
              : String(
                  pubMedPaperCount,
                )
          }
          detail="Oncology-focused evidence"
        />

        <EvidenceMetricCard
          eyebrow="Literature coverage"
          value={evidenceProfile.level}
          detail={`${evidenceProfile.score}% coverage indicator`}
        />

        <EvidenceMetricCard
          eyebrow="AI confidence"
          value={
            aiConfidence === null
              ? "—"
              : `${aiConfidence}%`
          }
          detail="Extraction confidence"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                Mechanistic network
              </p>

              <h3 className="mt-2 text-xl font-semibold text-white">
                Connected biological entities
              </h3>
            </div>

            <span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[9px] text-slate-500">
              {relatedConnections.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {relatedConnections.length ===
            0 ? (
              <div className="rounded-[18px] border border-white/[0.06] bg-black/20 p-4">
                <p className="text-sm text-slate-500">
                  No visible direct relationships were found.
                </p>
              </div>
            ) : (
              relatedConnections.map(
                (connection) => (
                  <button
                    key={`${connection.nodeId}-evidence`}
                    type="button"
                    onClick={() => {
                      void focusNode(
                        connection.nodeId,
                      );
                      showGraph();
                    }}
                    className="group flex w-full items-center justify-between gap-4 rounded-[19px] border border-white/[0.07] bg-black/20 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            entityColorClass[
                              connection
                                .type
                            ]
                          }`}
                        />

                        <p className="truncate text-sm font-semibold text-slate-100">
                          {
                            connection.label
                          }
                        </p>
                      </div>

                      <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                        {connection.direction ===
                        "outgoing"
                          ? "Outgoing"
                          : "Incoming"}{" "}
                        ·{" "}
                        {
                          connection.relation
                        }
                      </p>
                    </div>

                    <span className="rounded-[11px] border border-white/[0.08] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 transition group-hover:border-cyan-300/20 group-hover:text-cyan-300">
                      Focus
                    </span>
                  </button>
                ),
              )
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(34,211,238,.055),rgba(139,92,246,.035))] p-5 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Scientific interpretation
          </p>

          <h3 className="mt-3 text-xl font-semibold text-white">
            Biological context
          </h3>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            {
              selectedEntity.description
            }
          </p>

          {selectedEntity.aliases &&
            selectedEntity.aliases
              .length > 0 && (
              <div className="mt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  Aliases
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEntity.aliases
                    .slice(0, 6)
                    .map((alias) => (
                      <span
                        key={alias}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[9px] text-slate-400"
                      >
                        {alias}
                      </span>
                    ))}
                </div>
              </div>
            )}

          {aiConfidence !== null && (
            <div className="mt-6 rounded-[18px] border border-emerald-300/12 bg-emerald-300/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    AI extraction confidence
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Explicit support in the analyzed text
                  </p>
                </div>

                <span className="font-mono text-lg font-semibold text-emerald-200">
                  {aiConfidence}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${aiConfidence}%`,
                  }}
                  transition={{
                    duration: 0.65,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-violet-300"
                />
              </div>

              <p className="mt-3 text-[10px] leading-5 text-slate-500">
                This score reflects confidence in the extraction from the submitted text, not certainty that the biological claim is universally true.
              </p>
            </div>
          )}

          {evidenceQuote && (
            <div className="mt-6 rounded-[18px] border border-cyan-300/12 bg-cyan-300/[0.035] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                Extracted evidence
              </p>

              <blockquote className="mt-3 border-l-2 border-cyan-300/35 pl-4 text-sm italic leading-7 text-slate-300">
                “{evidenceQuote}”
              </blockquote>

              <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-slate-600">
                Source: submitted research text
              </p>
            </div>
          )}

          <div className="mt-6 border-l border-cyan-300/30 pl-4">
            <p className="text-sm leading-7 text-slate-300">
              BioLayers combines the extracted graph structure with live PubMed retrieval. AI extraction confidence and literature coverage are intentionally shown as separate signals.
            </p>
          </div>

          <button
            type="button"
            onClick={showPubMed}
            className="mt-6 w-full rounded-[15px] bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-4 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110"
          >
            Open PubMed evidence
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
}: {
  eyebrow: string;
  value: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5"
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-600">
        {eyebrow}
      </p>

      <p className="mt-3 truncate text-2xl font-semibold capitalize tracking-[-0.035em] text-white">
        {value}
      </p>

      <p className="mt-2 text-[10px] leading-5 text-slate-500">
        {detail}
      </p>
    </motion.div>
  );
}