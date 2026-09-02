"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import type {
  PaperSort,
  PubMedPaper,
} from "../../hooks/usePubMed";

/* =========================================================
   TYPES
   ========================================================= */

type PubMedMode =
  | "entity"
  | "relationship";

type EvidenceClassification =
  | "supporting"
  | "contradicting"
  | "contextual"
  | "unrelated";

type EvidenceStrength =
  | "unassessed"
  | "limited"
  | "moderate"
  | "strong";

type EvidenceBasis =
  | "metadata_only"
  | "abstract_and_metadata"
  | "source_text_and_metadata"
  | "source_text_abstract_and_metadata";

type EvidenceAssessment = {
  pmid: string;

  classification:
    EvidenceClassification;

  confidence: number;

  rationale: string;

  evidenceBasis:
    EvidenceBasis;
};

type EvidenceSummary = {
  totalCandidates: number;
  analyzed: number;

  withAbstract?: number;
  withoutAbstract?: number;

  supporting: number;
  contradicting: number;
  contextual: number;
  unrelated: number;

  // Candidates that were retrieved but not classified.
  // Kept in sync with the canonical EvidenceSummary
  // used by researchGraph.ts / page.tsx.
  unclassified: number;

  strength:
    EvidenceStrength;
};

type EvidenceApiResponse = {
  relationship?: {
    source: string;
    relation: string;
    target: string;
  };

  assessments?:
    EvidenceAssessment[];

  summary?:
    EvidenceSummary;

  limitations?:
    string[];

  meta?: {
    provider?: string;
    model?: string;
    analyzedPapers?: number;
    abstractsAvailable?: number;
  };

  error?: string;
};

type EvidenceAnalysisResult = {
  assessments:
    EvidenceAssessment[];

  summary:
    EvidenceSummary;

  limitations:
    string[];

  provider: string;

  model: string;

  analyzedAt: string;
};

type PubMedPanelProps = {
  pubMedTotal: number;

  pubMedPapers:
    PubMedPaper[];

  pubMedSort:
    PaperSort;

  setPubMedSort:
    Dispatch<
      SetStateAction<PaperSort>
    >;

  comparedPapers:
    PubMedPaper[];

  pubMedLoading:
    boolean;

  pubMedError:
    string;

  pubMedHasMore:
    boolean;

  pubMedLoadingMore:
    boolean;

  togglePaperComparison: (
    paper: PubMedPaper,
  ) => void;

  loadMorePubMed: () =>
    Promise<void>;

  openPaperInspector: (
    paper: PubMedPaper,
  ) => void;

  mode?: PubMedMode;

  entityLabel?:
    string | null;

  relationshipSource?:
    string | null;

  relationshipTarget?:
    string | null;

  relationshipLabel?:
    string | null;

  pubMedQuery?:
    string | null;

  sourceText?: string;

  /*
    Called after a successful evidence analysis.
    The parent graph component can use this to
    persist the result into the selected edge.
  */
  onEvidenceAnalyzed?: (
    result: EvidenceAnalysisResult,
  ) => void;
};

/* =========================================================
   HELPERS
   ========================================================= */

function classificationLabel(
  value:
    EvidenceClassification,
) {
  switch (value) {
    case "supporting":
      return "SUPPORTING";

    case "contradicting":
      return "CONTRADICTING";

    case "contextual":
      return "CONTEXTUAL";

    case "unrelated":
      return "UNRELATED";
  }
}

function classificationClass(
  value:
    EvidenceClassification,
) {
  switch (value) {
    case "supporting":
      return `
        border-emerald-300/20
        bg-emerald-300/[0.07]
        text-emerald-200
      `;

    case "contradicting":
      return `
        border-rose-300/20
        bg-rose-300/[0.07]
        text-rose-200
      `;

    case "contextual":
      return `
        border-teal-200/[0.14]
        bg-cyan-300/[0.07]
        text-teal-200
      `;

    case "unrelated":
      return `
        border-teal-100/[0.06]
        bg-[#0a0f14]/46
        text-slate-500
      `;
  }
}

function strengthLabel(
  strength:
    EvidenceStrength,
) {
  switch (strength) {
    case "limited":
      return "LIMITED";

    case "moderate":
      return "MODERATE";

    case "strong":
      return "STRONG";

    default:
      return "UNASSESSED";
  }
}

function strengthClass(
  strength:
    EvidenceStrength,
) {
  switch (strength) {
    case "limited":
      return `
        border-amber-300/20
        bg-amber-300/[0.07]
        text-amber-200
      `;

    case "moderate":
      return `
        border-teal-200/[0.14]
        bg-cyan-300/[0.07]
        text-teal-200
      `;

    case "strong":
      return `
        border-emerald-300/20
        bg-emerald-300/[0.07]
        text-emerald-200
      `;

    default:
      return `
        border-teal-100/[0.06]
        bg-[#0a0f14]/46
        text-slate-500
      `;
  }
}

function evidenceBasisLabel(
  basis:
    EvidenceBasis,
) {
  switch (basis) {
    case "abstract_and_metadata":
      return "PubMed abstract + metadata";

    case "source_text_and_metadata":
      return "Graph context + metadata";

    case "source_text_abstract_and_metadata":
      return "Abstract + graph context + metadata";

    default:
      return "PubMed metadata";
  }
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function PubMedPanel({
  pubMedTotal,
  pubMedPapers,
  pubMedSort,
  setPubMedSort,
  comparedPapers,
  pubMedLoading,
  pubMedError,
  pubMedHasMore,
  pubMedLoadingMore,
  togglePaperComparison,
  loadMorePubMed,
  openPaperInspector,

  mode = "entity",

  entityLabel,

  relationshipSource,
  relationshipTarget,
  relationshipLabel,

  pubMedQuery,

  sourceText = "",

  onEvidenceAnalyzed,
}: PubMedPanelProps) {
  const reduceMotion = Boolean(useReducedMotion());

  const relationshipMode =
    mode ===
    "relationship";

  const normalizedRelation =
    relationshipLabel
      ?.trim()
      .toUpperCase() ||
    "RELATED TO";

  const hasRelationship =
    relationshipMode &&
    Boolean(
      relationshipSource &&
        relationshipTarget &&
        relationshipLabel,
    );

  /* =======================================================
     EVIDENCE ENGINE STATE
     ======================================================= */

  const [
    evidenceLoading,
    setEvidenceLoading,
  ] = useState(false);

  const [
    evidenceError,
    setEvidenceError,
  ] = useState("");

  const [
    assessments,
    setAssessments,
  ] = useState<
    EvidenceAssessment[]
  >([]);

  const [
    evidenceSummary,
    setEvidenceSummary,
  ] = useState<
    EvidenceSummary | null
  >(null);

  const [
    evidenceLimitations,
    setEvidenceLimitations,
  ] = useState<
    string[]
  >([]);

  const [
    evidenceModel,
    setEvidenceModel,
  ] = useState("");

  const [
    evidenceProvider,
    setEvidenceProvider,
  ] = useState("");

  /* =======================================================
     ANALYSIS SIGNATURE
     ======================================================= */

  const analysisSignature =
    useMemo(() => {
      if (
        !relationshipMode
      ) {
        return "entity";
      }

      const paperIds =
        pubMedPapers
          .slice(
            0,
            20,
          )
          .map(
            (paper) =>
              paper.pmid,
          )
          .join(",");

      return [
        relationshipSource ??
          "",
        relationshipLabel ??
          "",
        relationshipTarget ??
          "",
        paperIds,
      ].join("::");
    }, [
      relationshipMode,
      relationshipSource,
      relationshipLabel,
      relationshipTarget,
      pubMedPapers,
    ]);

  /* =======================================================
     RESET OLD ANALYSIS
     ======================================================= */

  useEffect(() => {
    setEvidenceLoading(
      false,
    );

    setEvidenceError(
      "",
    );

    setAssessments(
      [],
    );

    setEvidenceSummary(
      null,
    );

    setEvidenceLimitations(
      [],
    );

    setEvidenceModel(
      "",
    );

    setEvidenceProvider(
      "",
    );
  }, [
    analysisSignature,
  ]);

  /* =======================================================
     ASSESSMENT LOOKUP
     ======================================================= */

  const assessmentByPmid =
    useMemo(() => {
      return new Map(
        assessments.map(
          (assessment) => [
            assessment.pmid,
            assessment,
          ],
        ),
      );
    }, [
      assessments,
    ]);

  /* =======================================================
     ABSTRACT STATS
     ======================================================= */

  const loadedAbstractCount =
    useMemo(() => {
      return pubMedPapers
        .slice(
          0,
          20,
        )
        .filter(
          (paper) =>
            typeof paper.abstract ===
              "string" &&
            paper.abstract
              .trim()
              .length >
              0,
        )
        .length;
    }, [
      pubMedPapers,
    ]);

  /* =======================================================
     ANALYZE EVIDENCE
     ======================================================= */

  async function analyzeEvidence() {
    if (
      !relationshipMode ||
      !relationshipSource ||
      !relationshipTarget ||
      !relationshipLabel
    ) {
      setEvidenceError(
        "Select a biological relationship before analyzing evidence.",
      );

      return;
    }

    const candidatePapers =
      pubMedPapers.slice(
        0,
        20,
      );

    if (
      candidatePapers.length ===
      0
    ) {
      setEvidenceError(
        "No candidate PubMed publications are loaded.",
      );

      return;
    }

    setEvidenceLoading(
      true,
    );

    setEvidenceError(
      "",
    );

    setAssessments(
      [],
    );

    setEvidenceSummary(
      null,
    );

    setEvidenceLimitations(
      [],
    );

    setEvidenceModel(
      "",
    );

    setEvidenceProvider(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/classify-evidence",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                relationship: {
                  source:
                    relationshipSource,

                  relation:
                    relationshipLabel,

                  target:
                    relationshipTarget,

                  sourceText,
                },

                papers:
                  candidatePapers,
              }),
          },
        );

      const result =
        (await response.json()) as EvidenceApiResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "BioLayers could not classify the candidate literature.",
        );
      }

      const safeAssessments =
        Array.isArray(
          result.assessments,
        )
          ? result.assessments
          : [];

      setAssessments(
        safeAssessments,
      );

      setEvidenceSummary(
        result.summary ??
          null,
      );

      setEvidenceLimitations(
        Array.isArray(
          result.limitations,
        )
          ? result.limitations
          : [],
      );

      setEvidenceModel(
        result.meta?.model ??
          "",
      );

      const provider =
        result.meta?.provider ??
        "";

      const model =
        result.meta?.model ??
        "";

      setEvidenceProvider(
        provider,
      );

      if (
        result.summary
      ) {
        onEvidenceAnalyzed?.({
          assessments:
            safeAssessments,

          summary: {
            ...result.summary,
            unclassified:
              Math.max(
                0,
                result.summary.totalCandidates -
                  result.summary.analyzed,
              ),
          },

          limitations:
            Array.isArray(
              result.limitations,
            )
              ? result.limitations
              : [],

          provider,
          model,

          analyzedAt:
            new Date().toISOString(),
        });
      }
    } catch (
      error
    ) {
      setEvidenceError(
        error instanceof Error
          ? error.message
          : "BioLayers Evidence Engine failed.",
      );
    } finally {
      setEvidenceLoading(
        false,
      );
    }
  }

  /* =======================================================
     EMPTY MESSAGE
     ======================================================= */

  const emptyMessage =
    relationshipMode
      ? "No oncology-focused candidate publications were found for this relationship."
      : "No oncology-focused PubMed papers were found for this entity.";

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section className="mt-7">
      {/* ===================================================
          RELATIONSHIP CONTEXT
          =================================================== */}

      {hasRelationship && (
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 8,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              0.35,

            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="
            mb-6
            overflow-hidden
            rounded-[15px]
            border
            border-teal-200/[0.10]
            bg-teal-200/[0.02]
          "
        >
          {/* HEADER */}

          <div className="border-b border-teal-100/[0.045] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300/80">
                  Relationship
                  literature
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Candidate PubMed
                  publications
                  retrieved for the
                  selected biological
                  relationship
                </p>
              </div>

              {evidenceSummary ? (
                <div
                  className={`
                    rounded-full
                    border
                    px-3
                    py-1.5

                    ${strengthClass(
                      evidenceSummary.strength,
                    )}
                  `}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    {strengthLabel(
                      evidenceSummary.strength,
                    )}
                  </span>
                </div>
              ) : (
                <div className="rounded-full border border-amber-300/15 bg-amber-300/[0.055] px-3 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">
                    Not yet
                    classified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SOURCE → RELATION → TARGET */}

          <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="rounded-[15px] border border-teal-100/[0.05] bg-black/[0.10] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Source
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-white">
                {
                  relationshipSource
                }
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 px-2">
              <div className="h-px w-5 bg-gradient-to-r from-transparent to-cyan-300/40" />

              <div className="rounded-full border border-teal-200/[0.11] bg-teal-200/[0.045] px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-teal-200">
                  {
                    normalizedRelation
                  }
                </span>
              </div>

              <div className="h-px w-5 bg-gradient-to-r from-cyan-300/40 to-transparent" />
            </div>

            <div className="rounded-[15px] border border-teal-100/[0.05] bg-black/[0.10] p-4 md:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Target
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-white">
                {
                  relationshipTarget
                }
              </p>
            </div>
          </div>

          {/* QUERY */}

          {pubMedQuery && (
            <div className="border-t border-teal-100/[0.045] px-5 py-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300/65">
                  Search query
                </span>

                <code className="overflow-hidden text-ellipsis whitespace-nowrap rounded-[9px] border border-sky-300/10 bg-sky-300/[0.035] px-3 py-2 font-mono text-[9px] text-slate-500">
                  {
                    pubMedQuery
                  }
                </code>
              </div>
            </div>
          )}

          {/* ANALYSIS INFO */}

          <div className="border-t border-teal-100/[0.045] px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[14px] border border-teal-100/[0.045] bg-black/[0.08] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Loaded
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {Math.min(
                    pubMedPapers.length,
                    20,
                  )}
                </p>
              </div>

              <div className="rounded-[14px] border border-teal-200/[0.08] bg-teal-200/[0.02] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-300/50">
                  Abstracts
                </p>

                <p className="mt-1 text-sm font-semibold text-teal-100">
                  {
                    loadedAbstractCount
                  }
                </p>
              </div>

              <div className="rounded-[14px] border border-teal-100/[0.045] bg-black/[0.08] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Metadata only
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {Math.max(
                    Math.min(
                      pubMedPapers.length,
                      20,
                    ) -
                      loadedAbstractCount,
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ANALYZE */}

          <div className="border-t border-teal-100/[0.045] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Evidence
                  classification
                </p>

                <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-500">
                  BioLayers analyzes
                  PubMed abstracts when
                  available and falls
                  back to metadata when
                  an abstract is absent.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void analyzeEvidence()
                }
                disabled={
                  evidenceLoading ||
                  pubMedLoading ||
                  pubMedPapers.length ===
                    0
                }
                className="
                  rounded-[14px]
                  border
                  border-teal-200/[0.14]
                  bg-teal-200/[0.06]
                  px-5
                  py-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-teal-100
                  transition
                  hover:border-cyan-300/35
                  hover:bg-teal-200/[0.08]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {evidenceLoading
                  ? "Analyzing abstracts..."
                  : evidenceSummary
                    ? "Re-analyze evidence"
                    : `Analyze evidence · ${Math.min(
                        pubMedPapers.length,
                        20,
                      )}`}
              </button>
            </div>

            {evidenceError && (
              <div className="mt-4 rounded-[15px] border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3">
                <p role="alert" aria-live="polite" className="text-[11px] leading-5 text-rose-200">
                  {
                    evidenceError
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ===================================================
          EVIDENCE SUMMARY
          =================================================== */}

      {relationshipMode &&
        evidenceSummary && (
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 8,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-[15px] border border-teal-100/[0.06] bg-[#0a0f14]/46 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300/75">
                  Evidence
                  classification
                </p>

                <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white">
                  {
                    evidenceSummary.analyzed
                  }{" "}
                  publications
                  analyzed
                </h3>

                <p className="mt-2 max-w-xl text-[11px] leading-5 text-slate-500">
                  Classification is
                  based on PubMed
                  abstracts when
                  available. Full-text
                  review is still
                  required for research
                  validation.
                </p>
              </div>

              <div
                className={`
                  rounded-full
                  border
                  px-3
                  py-1.5

                  ${strengthClass(
                    evidenceSummary.strength,
                  )}
                `}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  {
                    strengthLabel(
                      evidenceSummary.strength,
                    )
                  }{" "}
                  evidence
                </span>
              </div>
            </div>

            {/* ABSTRACT COVERAGE */}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[14px] border border-teal-200/[0.08] bg-teal-200/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-300/55">
                  Abstract-based
                </p>

                <p className="mt-2 text-xl font-semibold text-teal-100">
                  {evidenceSummary.withAbstract ??
                    loadedAbstractCount}
                </p>
              </div>

              <div className="rounded-[14px] border border-teal-100/[0.05] bg-[#0a0f14]/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Without abstract
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-300">
                  {evidenceSummary.withoutAbstract ??
                    Math.max(
                      evidenceSummary.analyzed -
                        loadedAbstractCount,
                      0,
                    )}
                </p>
              </div>
            </div>

            {/* CLASSIFICATION COUNTERS */}

            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-[14px] border border-emerald-300/10 bg-emerald-300/[0.035] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300/60">
                  Supporting
                </p>

                <p className="mt-2 text-2xl font-semibold text-emerald-100">
                  {
                    evidenceSummary.supporting
                  }
                </p>
              </div>

              <div className="rounded-[14px] border border-rose-300/10 bg-rose-300/[0.035] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-rose-300/60">
                  Contradicting
                </p>

                <p className="mt-2 text-2xl font-semibold text-rose-100">
                  {
                    evidenceSummary.contradicting
                  }
                </p>
              </div>

              <div className="rounded-[14px] border border-teal-200/[0.08] bg-teal-200/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-300/60">
                  Contextual
                </p>

                <p className="mt-2 text-2xl font-semibold text-teal-100">
                  {
                    evidenceSummary.contextual
                  }
                </p>
              </div>

              <div className="rounded-[14px] border border-teal-100/[0.05] bg-[#0a0f14]/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Unrelated
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-300">
                  {
                    evidenceSummary.unrelated
                  }
                </p>
              </div>
            </div>

            {/* LIMITATIONS */}

            {evidenceLimitations.length >
              0 && (
              <div className="mt-5 border-t border-teal-100/[0.045] pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/60">
                  Limitations
                </p>

                <div className="mt-3 space-y-2">
                  {evidenceLimitations.map(
                    (
                      limitation,
                      index,
                    ) => (
                      <p
                        key={`${limitation}-${index}`}
                        className="text-[11px] leading-5 text-slate-500"
                      >
                        •{" "}
                        {
                          limitation
                        }
                      </p>
                    ),
                  )}
                </div>
              </div>
            )}

            {(evidenceModel ||
              evidenceProvider) && (
              <p className="mt-4 font-mono text-[7px] uppercase tracking-[0.12em] text-slate-500">
                {evidenceProvider &&
                  `${evidenceProvider} · `}

                Classification
                model ·{" "}
                {
                  evidenceModel
                }
              </p>
            )}
          </motion.div>
        )}

      {/* ===================================================
          ENTITY CONTEXT
          =================================================== */}

      {!relationshipMode &&
        entityLabel && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300/65">
              Entity literature
            </span>

            <span className="text-[9px] text-slate-500">
              ·
            </span>

            <span className="text-[9px] font-medium text-slate-500">
              {
                entityLabel
              }
            </span>
          </div>
        )}

      {/* ===================================================
          RESULTS HEADER
          =================================================== */}

      <div className="mb-6 flex flex-col gap-3 rounded-[15px] border border-teal-100/[0.06] bg-[#0a0f14]/46 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-white">
              {pubMedTotal.toLocaleString()}{" "}
              {relationshipMode
                ? "candidate publications"
                : "matching records"}
            </p>

            {relationshipMode && (
              <span className="rounded-full border border-sky-300/10 bg-teal-300/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-teal-200/60">
                Relationship
                search
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] text-slate-500">
            {
              pubMedPapers.length
            }{" "}
            loaded
          </p>

          {relationshipMode && (
            <p className="mt-2 max-w-xl text-[10px] leading-5 text-slate-500">
              Candidate
              publications are
              retrieval results,
              not automatically
              verified evidence for
              causality or biological
              directionality.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={pubMedSort === "relevance"}
            onClick={() =>
              setPubMedSort(
                "relevance",
              )
            }
            className={`rounded-[12px] px-3 py-2 text-[10px] ${
              pubMedSort ===
              "relevance"
                ? "border border-teal-200/[0.16] bg-[linear-gradient(135deg,#8db2ff,#a15cff)] text-[#04070a] shadow-[0_8px_20px_rgba(77,141,255,.12)]"
                : "border border-teal-100/[0.07] bg-[#0a0f14]/40 text-slate-400 hover:bg-teal-100/[0.03] hover:text-slate-200"
            }`}
          >
            Relevance
          </button>

          <button
            type="button"
            aria-pressed={pubMedSort === "date"}
            onClick={() =>
              setPubMedSort(
                "date",
              )
            }
            className={`rounded-[12px] px-3 py-2 text-[10px] ${
              pubMedSort ===
              "date"
                ? "border border-teal-200/[0.16] bg-[linear-gradient(135deg,#8db2ff,#a15cff)] text-[#04070a] shadow-[0_8px_20px_rgba(77,141,255,.12)]"
                : "border border-teal-100/[0.07] bg-[#0a0f14]/40 text-slate-400 hover:bg-teal-100/[0.03] hover:text-slate-200"
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* ===================================================
          COMPARISON
          =================================================== */}

      {comparedPapers.length >
        0 && (
        <div className="mb-6 grid gap-3 rounded-[15px] border border-teal-300/15 bg-teal-300/[0.04] p-4 md:grid-cols-2">
          {comparedPapers.map(
            (paper) => (
              <div
                key={`compare-${paper.pmid}`}
                className="rounded-[14px] border border-teal-100/[0.05] bg-black/[0.10] p-4"
              >
                <p className="font-mono text-[8px] text-sky-300/65">
                  PMID{" "}
                  {
                    paper.pmid
                  }
                </p>

                <p className="mt-2 line-clamp-3 text-xs font-semibold text-slate-200">
                  {
                    paper.title
                  }
                </p>

                <p className="mt-3 text-[10px] text-slate-500">
                  {
                    paper.journal
                  }{" "}
                  ·{" "}
                  {
                    paper.year
                  }
                </p>
              </div>
            ),
          )}
        </div>
      )}

      {/* ===================================================
          LOADING
          =================================================== */}

      {pubMedLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            0,
            1,
            2,
            3,
          ].map(
            (item) => (
              <div
                key={item}
                className={`${reduceMotion ? "" : "animate-pulse"} rounded-[20px] border border-teal-100/[0.05] bg-[#0a0f14]/46 p-5`}
              >
                <div className="h-2.5 w-1/3 rounded-full bg-teal-100/[0.08]" />

                <div className="mt-4 h-3 w-full rounded-full bg-teal-100/[0.06]" />

                <div className="mt-2 h-3 w-4/5 rounded-full bg-teal-100/[0.06]" />

                <div className="mt-5 h-2 w-1/2 rounded-full bg-teal-100/[0.05]" />
              </div>
            ),
          )}
        </div>
      )}

      {/* ===================================================
          PUBMED ERROR
          =================================================== */}

      {!pubMedLoading &&
        pubMedError && (
          <div className="rounded-[20px] border border-amber-300/15 bg-amber-300/[0.04] p-6">
            <p role="alert" aria-live="polite" className="text-sm leading-7 text-amber-200">
              {
                pubMedError
              }
            </p>
          </div>
        )}

      {/* ===================================================
          EMPTY
          =================================================== */}

      {!pubMedLoading &&
        !pubMedError &&
        pubMedPapers.length ===
          0 && (
          <div className="rounded-[20px] border border-teal-100/[0.05] bg-[#0a0f14]/46 p-8 text-center">
            <p className="text-sm text-slate-500">
              {
                emptyMessage
              }
            </p>
          </div>
        )}

      {/* ===================================================
          PAPERS
          =================================================== */}

      {!pubMedLoading &&
        pubMedPapers.length >
          0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {pubMedPapers.map(
              (paper) => {
                const selectedForComparison =
                  comparedPapers.some(
                    (item) =>
                      item.pmid ===
                      paper.pmid,
                  );

                const assessment =
                  assessmentByPmid.get(
                    paper.pmid,
                  );

                const hasAbstract =
                  typeof paper.abstract ===
                    "string" &&
                  paper.abstract
                    .trim()
                    .length >
                    0;

                return (
                  <button
                    key={`${paper.pmid}-full`}
                    type="button"
                    onClick={() =>
                      openPaperInspector(
                        paper,
                      )
                    }
                    className="
                      group
                      rounded-[20px]
                      border
                      border-teal-100/[0.06]
                      bg-[#0a0f14]/46
                      p-5
                      text-left
                      transition
                      hover:-translate-y-1
                      hover:border-teal-200/[0.14]
                      hover:bg-teal-200/[0.025]
                    "
                  >
                    {/* PMID */}

                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-teal-300/65">
                        PMID{" "}
                        {
                          paper.pmid
                        }
                      </p>

                      <span className="text-[10px] font-semibold text-slate-500 transition group-hover:text-teal-300">
                        Open ↗
                      </span>
                    </div>

                    {/* DATA AVAILABILITY */}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                          hasAbstract
                            ? "border-teal-200/[0.11] bg-teal-200/[0.035] text-teal-200/70"
                            : "border-teal-100/[0.05] bg-[#0a0f14]/40 text-slate-500"
                        }`}
                      >
                        {hasAbstract
                          ? "Abstract available"
                          : "Metadata only"}
                      </span>

                      {assessment && (
                        <>
                          <span
                            className={`
                              rounded-full
                              border
                              px-2
                              py-1
                              text-[7px]
                              font-bold
                              uppercase
                              tracking-[0.12em]

                              ${classificationClass(
                                assessment.classification,
                              )}
                            `}
                          >
                            {
                              classificationLabel(
                                assessment.classification,
                              )
                            }
                          </span>

                          <span className="rounded-full border border-teal-100/[0.05] bg-black/[0.10] px-2 py-1 text-[7px] font-semibold text-white/40">
                            {Math.round(
                              assessment.confidence *
                                100,
                            )}
                            % confidence
                          </span>
                        </>
                      )}
                    </div>

                    {/* TITLE */}

                    <h3 className="mt-4 text-base font-semibold leading-7 text-slate-100">
                      {
                        paper.title
                      }
                    </h3>

                    {/* META */}

                    <p className="mt-4 text-xs leading-6 text-slate-500">
                      {
                        paper.journal
                      }{" "}
                      ·{" "}
                      {
                        paper.year
                      }
                    </p>

                    {paper.authors.length >
                      0 && (
                      <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-500">
                        {paper.authors.join(
                          ", ",
                        )}
                      </p>
                    )}

                    {paper.doi && (
                      <p className="mt-4 truncate rounded-[10px] border border-sky-300/10 bg-sky-300/[0.035] px-3 py-2 font-mono text-[9px] text-sky-300/65">
                        DOI{" "}
                        {
                          paper.doi
                        }
                      </p>
                    )}

                    {/* ABSTRACT PREVIEW */}

                    {hasAbstract && (
                      <div className="mt-4 rounded-[15px] border border-sky-200/[0.07] bg-cyan-300/[0.018] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-300/45">
                          Abstract
                        </p>

                        <p className="mt-2 line-clamp-4 text-[11px] leading-5 text-slate-500">
                          {
                            paper.abstract
                          }
                        </p>
                      </div>
                    )}

                    {/* CLASSIFICATION RATIONALE */}

                    {assessment && (
                      <div className="mt-4 rounded-[15px] border border-teal-100/[0.045] bg-black/[0.10] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                          Classification
                          rationale
                        </p>

                        <p className="mt-2 text-[11px] leading-5 text-slate-500">
                          {
                            assessment.rationale
                          }
                        </p>

                        <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.1em] text-slate-500">
                          Basis ·{" "}
                          {
                            evidenceBasisLabel(
                              assessment.evidenceBasis,
                            )
                          }
                        </p>
                      </div>
                    )}

                    {/* COMPARISON */}

                    <span
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        togglePaperComparison(
                          paper,
                        );
                      }}
                      className={`mt-4 block rounded-[11px] border px-3 py-2 text-center text-[9px] ${
                        selectedForComparison
                          ? "border-teal-300/25 bg-teal-300/[0.09] text-teal-200"
                          : "border-teal-100/[0.06] text-slate-500"
                      }`}
                    >
                      {selectedForComparison
                        ? "Selected for comparison"
                        : "Add to comparison"}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}

      {/* ===================================================
          LOAD MORE
          =================================================== */}

      {!pubMedLoading &&
        pubMedHasMore && (
          <button
            type="button"
            onClick={() =>
              void loadMorePubMed()
            }
            disabled={
              pubMedLoadingMore
            }
            className="mx-auto mt-7 block rounded-[15px] border border-teal-200/[0.11] bg-teal-200/[0.04] px-6 py-3 text-xs font-bold text-teal-100 disabled:opacity-40"
          >
            {pubMedLoadingMore
              ? "Loading more..."
              : `Load more · ${pubMedPapers.length} of ${pubMedTotal.toLocaleString()}`}
          </button>
        )}
    </section>
  );
}