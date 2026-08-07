"use client";

import { motion } from "framer-motion";
import type { Node } from "@xyflow/react";

import type {
  ResearchEdgeData,
  ResearchEntityData,
} from "../../lib/researchGraph";
import type { PubMedPaper } from "../../hooks/usePubMed";

type EntityNodeType = Node<
  ResearchEntityData,
  "entity"
>;

type EvidenceProfile = {
  level:
    | "No evidence"
    | "Limited"
    | "Moderate"
    | "Strong";
  score: number;
  description: string;
  badgeClass: string;
  meterClass: string;
};

type EdgeInspectorPanelProps = {
  selectedEdgeId: string;
  selectedEdgeSource: EntityNodeType;
  selectedEdgeTarget: EntityNodeType;
  selectedEdgeLabel: string;
  selectedEdgeData?: ResearchEdgeData;
  evidenceProfile: EvidenceProfile;
  pubMedPapers: PubMedPaper[];
  focusNode: (
    nodeId: string,
  ) => Promise<void>;
  openPaperInspector: (
    paper: PubMedPaper,
  ) => void;
};

function toPercent(
  value?: number,
) {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return null;
  }

  return Math.round(
    Math.min(
      Math.max(value, 0),
      1,
    ) * 100,
  );
}

function formatRelationType(
  relationType?: string,
) {
  if (!relationType) {
    return "Extracted";
  }

  return relationType
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function EdgeInspectorPanel({
  selectedEdgeId,
  selectedEdgeSource,
  selectedEdgeTarget,
  selectedEdgeLabel,
  selectedEdgeData,
  evidenceProfile,
  pubMedPapers,
  focusNode,
  openPaperInspector,
}: EdgeInspectorPanelProps) {
  const aiConfidence =
    toPercent(
      selectedEdgeData?.confidence,
    );

  const relationType =
    formatRelationType(
      selectedEdgeData?.relationType,
    );

  const directionality =
    selectedEdgeData?.directionality ===
    "undirected"
      ? "Undirected"
      : "Directed";

  const interpretation =
    selectedEdgeData?.description?.trim() ||
    `The graph represents ${selectedEdgeSource.data.label} as ${selectedEdgeLabel} ${selectedEdgeTarget.data.label}.`;

  const evidenceQuote =
    selectedEdgeData?.evidenceQuote?.trim();

  return (
    <motion.div
      key={`edge-${selectedEdgeId}`}
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
      <div className="mt-4 overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(34,211,238,.08),rgba(139,92,246,.035),rgba(255,255,255,.018))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.28)]">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            {relationType}
          </span>

          {aiConfidence !==
            null ? (
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2.5 py-1 font-mono text-[9px] font-bold text-emerald-200">
              AI {aiConfidence}%
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
          )}
        </div>

        <div className="mt-6 rounded-[20px] border border-white/[0.07] bg-black/20 p-4">
          <button
            type="button"
            onClick={() =>
              void focusNode(
                selectedEdgeSource.id,
              )
            }
            className="w-full text-left"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Source
            </p>
            <p className="mt-2 text-lg font-semibold text-white transition hover:text-cyan-200">
              {
                selectedEdgeSource
                  .data.label
              }
            </p>
            <p className="mt-1 text-[10px] capitalize text-slate-500">
              {
                selectedEdgeSource
                  .data.type
              }
            </p>
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300/50 to-cyan-300/10" />
            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
              {selectedEdgeLabel}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-300/10 via-cyan-300/50 to-transparent" />
          </div>

          <button
            type="button"
            onClick={() =>
              void focusNode(
                selectedEdgeTarget.id,
              )
            }
            className="w-full text-right"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Target
            </p>
            <p className="mt-2 text-lg font-semibold text-white transition hover:text-violet-200">
              {
                selectedEdgeTarget
                  .data.label
              }
            </p>
            <p className="mt-1 text-[10px] capitalize text-slate-500">
              {
                selectedEdgeTarget
                  .data.type
              }
            </p>
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <EdgeMetric
          value={directionality}
          label="Directionality"
        />
        <EdgeMetric
          value={relationType}
          label="Relation type"
        />
      </div>

      {aiConfidence !== null && (
        <div className="mt-6 rounded-[22px] border border-emerald-300/12 bg-emerald-300/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                AI extraction confidence
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Support in the submitted text
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
            This score reflects how explicitly the relationship was supported by the analyzed text. It is not a measure of biological truth or study quality.
          </p>
        </div>
      )}

      {evidenceQuote && (
        <div className="mt-6 rounded-[22px] border border-cyan-300/12 bg-cyan-300/[0.035] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
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

      <div className="mt-6 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
          Mechanistic interpretation
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {interpretation}
        </p>

        <p className="mt-3 text-[10px] leading-5 text-slate-600">
          AI-extracted relationships should be verified against primary literature before being treated as causal evidence.
        </p>
      </div>

      <div className="mt-6 rounded-[22px] border border-amber-300/12 bg-amber-300/[0.035] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
              Literature coverage
            </p>
            <p className="mt-1 text-xs text-slate-500">
              PubMed coverage for current graph context
            </p>
          </div>

          <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200">
            {evidenceProfile.level}
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${evidenceProfile.meterClass}`}
            style={{
              width: `${evidenceProfile.score}%`,
            }}
          />
        </div>

        <p className="mt-3 text-[10px] leading-5 text-slate-500">
          {
            evidenceProfile.description
          }{" "}
          This indicator is separate from the AI extraction confidence above.
        </p>
      </div>

      <div className="mt-6 rounded-[22px] border border-cyan-300/12 bg-cyan-300/[0.035] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              Supporting literature
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Papers loaded for the current graph context
            </p>
          </div>

          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-slate-400">
            {pubMedPapers.length}
          </span>
        </div>

        {pubMedPapers.length ===
        0 ? (
          <div className="mt-4 rounded-[16px] border border-white/[0.06] bg-black/20 p-3">
            <p className="text-xs leading-5 text-slate-500">
              Select either endpoint to load entity-specific PubMed evidence.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pubMedPapers
              .slice(0, 3)
              .map((paper) => (
                <button
                  key={`edge-${paper.pmid}`}
                  type="button"
                  onClick={() =>
                    openPaperInspector(
                      paper,
                    )
                  }
                  className="block w-full rounded-[16px] border border-white/[0.07] bg-black/20 p-3 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                >
                  <p className="font-mono text-[8px] text-cyan-300/60">
                    PMID{" "}
                    {paper.pmid}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-300">
                    {paper.title}
                  </p>
                  <p className="mt-2 text-[9px] text-slate-600">
                    {
                      paper.journal
                    }{" "}
                    · {paper.year}
                  </p>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            void focusNode(
              selectedEdgeSource.id,
            )
          }
          className="rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.06]"
        >
          Focus source
        </button>

        <button
          type="button"
          onClick={() =>
            void focusNode(
              selectedEdgeTarget.id,
            )
          }
          className="rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-slate-200 transition hover:border-violet-300/20 hover:bg-violet-300/[0.06]"
        >
          Focus target
        </button>
      </div>
    </motion.div>
  );
}

function EdgeMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="truncate text-lg font-semibold capitalize text-white">
        {value}
      </p>
      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>
    </div>
  );
}