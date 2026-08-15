"use client";

import { motion, useReducedMotion } from "framer-motion";

import type {
  EntityData,
  EntityType,
} from "../../lib/buildGraphFromText";
import type { PubMedPaper } from "../../hooks/usePubMed";

type RelatedConnection = {
  nodeId: string;
  label: string;
  type: EntityType;
  relation: string;
  direction: "incoming" | "outgoing";
};

type EvidenceProfile = {
  level: "No evidence" | "Limited" | "Moderate" | "Strong";
  score: number;
  description: string;
  badgeClass: string;
  meterClass: string;
};

type InspectorPanelProps = {
  selectedEntity: EntityData;
  selectedConnectionCount: number;
  evidenceProfile: EvidenceProfile;
  relatedConnections: RelatedConnection[];
  pubMedLoading: boolean;
  pubMedError: string;
  pubMedPapers: PubMedPaper[];
  focusNode: (nodeId: string) => Promise<void>;
  openPaperInspector: (paper: PubMedPaper) => void;
  onAskCopilot: () => void;
};

const entityColorClass: Record<EntityType, string> = {
  cell: "bg-teal-400",
  protein: "bg-cyan-300",
  gene: "bg-cyan-400",
  drug: "bg-orange-300",
  pathway: "bg-amber-400",
  process: "bg-blue-400",
  disease: "bg-rose-400",
};

export default function InspectorPanel({
  selectedEntity,
  selectedConnectionCount,
  evidenceProfile,
  relatedConnections,
  pubMedLoading,
  pubMedError,
  pubMedPapers,
  focusNode,
  openPaperInspector,
  onAskCopilot,
}: InspectorPanelProps) {
  const reduceMotion = Boolean(useReducedMotion());

  return (
<motion.div
                key={`${selectedEntity.label}-${selectedEntity.type}`}
                initial={{
                  opacity: 0,
                  x: 18,
                  filter: "blur(8px)",
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  x: -12,
                  filter: "blur(8px)",
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="mt-4 rounded-[26px] border border-teal-100/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      {selectedEntity.type}
                    </span>

                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
                  </div>

                  <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-white">
                    {selectedEntity.label}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {selectedEntity.description}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InspectorMetric
                    value={String(
                      selectedConnectionCount,
                    )}
                    label="Connections"
                  />
                  <InspectorMetric
                    value={selectedEntity.type}
                    label="Entity class"
                  />
                </div>

                <div className="mt-4 rounded-[22px] border border-teal-100/[0.08] bg-[#0a1b26]/48 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Literature coverage
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Based on loaded PubMed records
                      </p>
                    </div>

                    <EvidenceBadge
                      profile={evidenceProfile}
                    />
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-teal-100/[0.06]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${evidenceProfile.meterClass}`}
                      style={{
                        width: `${evidenceProfile.score}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-slate-500">
                    {evidenceProfile.description} This does not evaluate study quality or prove causality.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <RoleCard
                    code="ROLE_01"
                    title="Biological role"
                    text="This entity contributes to the biological mechanism represented in the submitted research paragraph."
                    reduceMotion={reduceMotion}
                  />
                </div>

                <div className="mt-6 rounded-[22px] border border-teal-100/[0.08] bg-[#0a1b26]/48 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300">
                        Connected entities
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Direct biological relationships
                      </p>
                    </div>

                    <span className="rounded-full border border-teal-100/[0.08] bg-teal-100/[0.04] px-2.5 py-1 font-mono text-[9px] text-slate-400">
                      {relatedConnections.length}
                    </span>
                  </div>

                  {relatedConnections.length === 0 ? (
                    <div className="mt-4 rounded-[16px] border border-teal-100/[0.06] bg-black/15 p-3">
                      <p className="text-xs leading-5 text-slate-500">
                        No visible direct connections for this entity.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {relatedConnections.map(
                        (connection) => (
                          <button
                            key={`${connection.nodeId}-${connection.direction}-${connection.relation}`}
                            type="button"
                            onClick={() =>
                              void focusNode(
                                connection.nodeId,
                              )
                            }
                            className="group flex w-full items-center justify-between gap-3 rounded-[16px] border border-teal-100/[0.07] bg-black/15 p-3 text-left transition hover:-translate-y-0.5 hover:border-teal-300/20 hover:bg-teal-300/[0.04]"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${
                                    entityColorClass[connection.type]
                                  }`}
                                />

                                <p className="truncate text-xs font-semibold text-slate-200">
                                  {connection.label}
                                </p>
                              </div>

                              <p className="mt-1 truncate text-[9px] uppercase tracking-[0.13em] text-slate-600">
                                {connection.direction ===
                                "outgoing"
                                  ? "→"
                                  : "←"}{" "}
                                {connection.relation}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-[10px] border border-teal-100/[0.08] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 transition group-hover:border-cyan-300/20 group-hover:text-cyan-300">
                              Focus
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-[22px] border border-cyan-300/12 bg-cyan-300/[0.035] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                        PubMed evidence
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Oncology-focused literature for{" "}
                        {selectedEntity.label}
                      </p>
                    </div>

                    <span className="rounded-full border border-teal-100/[0.08] bg-teal-100/[0.04] px-2.5 py-1 font-mono text-[9px] text-slate-400">
                      {pubMedLoading
                        ? "..."
                        : pubMedPapers.length}
                    </span>
                  </div>

                  {pubMedLoading && (
                    <div className="mt-4 space-y-3">
                      {[0, 1, 2].map((item) => (
                        <div
                          key={item}
                          className={`${reduceMotion ? "" : "animate-pulse"} rounded-[16px] border border-teal-100/[0.06] bg-black/15 p-3`}
                        >
                          <div className="h-2.5 w-2/3 rounded-full bg-white/[0.08]" />
                          <div className="mt-3 h-2 w-full rounded-full bg-white/[0.05]" />
                          <div className="mt-2 h-2 w-4/5 rounded-full bg-white/[0.05]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!pubMedLoading &&
                    pubMedError && (
                      <div className="mt-4 rounded-[16px] border border-amber-300/12 bg-amber-300/[0.04] p-3">
                        <p className="text-xs leading-5 text-amber-200">
                          {pubMedError}
                        </p>
                      </div>
                    )}

                  {!pubMedLoading &&
                    !pubMedError &&
                    pubMedPapers.length === 0 && (
                      <div className="mt-4 rounded-[16px] border border-teal-100/[0.06] bg-black/15 p-3">
                        <p className="text-xs leading-5 text-slate-500">
                          No matching oncology papers were found for this entity.
                        </p>
                      </div>
                    )}

                  {!pubMedLoading &&
                    pubMedPapers.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {pubMedPapers.map(
                          (paper) => (
                            <button
                              key={paper.pmid}
                              type="button"
                              onClick={() =>
                                openPaperInspector(
                                  paper,
                                )
                              }
                              className="group block w-full rounded-[17px] border border-teal-100/[0.07] bg-black/15 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-300/60">
                                  PMID {paper.pmid}
                                </p>

                                <span className="text-[9px] font-semibold text-slate-600 transition group-hover:text-cyan-300">
                                  Open ↗
                                </span>
                              </div>

                              <h3 className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-slate-200">
                                {paper.title}
                              </h3>

                              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                                {paper.journal} ·{" "}
                                {paper.year}
                              </p>

                              {paper.authors.length >
                                0 && (
                                <p className="mt-1 line-clamp-1 text-[9px] text-slate-600">
                                  {paper.authors.join(
                                    ", ",
                                  )}
                                </p>
                              )}

                              {paper.doi && (
                                <p className="mt-2 truncate font-mono text-[8px] text-teal-300/55">
                                  DOI {paper.doi}
                                </p>
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                </div>

                <div className="mt-6 rounded-[22px] border border-teal-300/12 bg-teal-300/[0.045] p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300">
                    BioLayers Copilot
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    Ask the AI to explain this entity,
                    identify mechanisms or generate a
                    research hypothesis.
                  </p>

                  <button
                    type="button"
                    onClick={onAskCopilot}
                    className="mt-4 w-full rounded-[14px] bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 px-4 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110"
                  >
                    Ask BioLayers AI
                  </button>
                </div>
              </motion.div>
  );
}

function InspectorMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[18px] border border-teal-100/[0.08] bg-[#0a1b26]/48 p-4">
      <p className="truncate text-lg font-semibold capitalize text-white">
        {value}
      </p>
      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

function EvidenceBadge({
  profile,
}: {
  profile: EvidenceProfile;
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] ${profile.badgeClass}`}
    >
      {profile.level}
    </span>
  );
}

function RoleCard({
  code,
  title,
  text,
  reduceMotion,
}: {
  code: string;
  title: string;
  text: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-[20px] border border-teal-100/[0.08] bg-[#0a1b26]/52 p-4 transition hover:border-cyan-300/15 hover:bg-cyan-300/[0.035]"
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-300/55">
        {code}
      </p>

      <h3 className="mt-2 text-sm font-semibold text-slate-100">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {text}
      </p>
    </motion.div>
  );
}