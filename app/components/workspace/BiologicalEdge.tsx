"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import type {
  ResearchEdgeData,
  RelationType,
} from "../../lib/researchGraph";

/* =========================================================
   VISUAL MODEL
   ========================================================= */

type RelationshipVisual = {
  color: string;
  secondary: string;

  particle:
    | "molecule"
    | "cell"
    | "signal"
    | "none";

  dash: string;

  semantic:
    | "activation"
    | "inhibition"
    | "transport"
    | "movement"
    | "metastasis"
    | "association"
    | "regulation";
};

/* =========================================================
   RELATION VISUALS
   ========================================================= */

function getRelationshipVisual(
  relationType?: RelationType,
  label = "",
): RelationshipVisual {
  const normalized =
    `${relationType ?? ""} ${label}`.toLowerCase();

  /* =======================================================
     INHIBITION
     ======================================================= */

  if (
    normalized.includes("inhibit") ||
    normalized.includes("suppress") ||
    normalized.includes("block")
  ) {
    return {
      color: "#ff3b5c",
      secondary: "#ff93aa",
      particle: "signal",
      dash: "5 10",
      semantic: "inhibition",
    };
  }

  /* =======================================================
     SECRETION / MOLECULAR TRANSPORT
     ======================================================= */

  if (
    normalized.includes("secrete") ||
    normalized.includes("express") ||
    normalized.includes("release") ||
    normalized.includes("produce")
  ) {
    return {
      color: "#a15cff",
      secondary: "#c095fd",
      particle: "molecule",
      dash: "3 9",
      semantic: "transport",
    };
  }

  /* =======================================================
     CELLULAR MOVEMENT
     ======================================================= */

  if (
    normalized.includes("recruit") ||
    normalized.includes("migrate") ||
    normalized.includes("infiltrat")
  ) {
    return {
      color: "#ffc53d",
      secondary: "#ffd64a",
      particle: "cell",
      dash: "8 12",
      semantic: "movement",
    };
  }

  /* =======================================================
     METASTASIS
     ======================================================= */

  if (
    normalized.includes("metastas") ||
    normalized.includes("spread")
  ) {
    return {
      color: "#ff3b5c",
      secondary: "#ffc0ce",
      particle: "cell",
      dash: "6 11",
      semantic: "metastasis",
    };
  }

  /* =======================================================
     ACTIVATION / PROMOTION
     ======================================================= */

  if (
    normalized.includes("activate") ||
    normalized.includes("promote") ||
    normalized.includes("support") ||
    normalized.includes("increase")
  ) {
    return {
      color: "#2bff88",
      secondary: "#90ffc0",
      particle: "signal",
      dash: "2 10",
      semantic: "activation",
    };
  }

  /* =======================================================
     REGULATION / REMODELING
     ======================================================= */

  if (
    normalized.includes("regulat") ||
    normalized.includes("remodel")
  ) {
    return {
      color: "#4d8dff",
      secondary: "#8db2ff",
      particle: "signal",
      dash: "4 10",
      semantic: "regulation",
    };
  }

  /* =======================================================
     ASSOCIATION / INTERACTION
     ======================================================= */

  return {
    color: "#8db2ff",
    secondary: "#b7cfff",
    particle: "none",
    dash: "4 10",
    semantic: "association",
  };
}

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeConfidence(
  value?: number,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  const normalized =
    value <= 1
      ? value * 100
      : value;

  return Math.round(
    Math.min(
      Math.max(
        normalized,
        0,
      ),
      100,
    ),
  );
}

/* =========================================================
   LITERATURE / EVIDENCE STATUS
   ========================================================= */

type EvidenceLevel =
  | "STRONG"
  | "SUPPORTED"
  | "LIMITED"
  | "MIXED"
  | "CONTRADICTED"
  | "REVIEWED"
  | "CANDIDATE"
  | "EXTRACTED"
  | "HYPOTHESIS"
  | "UNMAPPED";

function getEvidenceLevel(
  edgeData: ResearchEdgeData,
  evidenceCount: number,
  confidence: number | null,
  evidenceQuote: string,
): EvidenceLevel {
  const summary =
    edgeData.evidenceSummary;

  if (
    summary &&
    summary.analyzed > 0
  ) {
    if (
      summary.contradicting >
        summary.supporting &&
      summary.contradicting > 0
    ) {
      return "CONTRADICTED";
    }

    if (
      summary.supporting > 0 &&
      summary.contradicting > 0
    ) {
      return "MIXED";
    }

    if (
      summary.strength === "strong"
    ) {
      return "STRONG";
    }

    if (
      summary.strength === "moderate"
    ) {
      return "SUPPORTED";
    }

    if (
      summary.strength === "limited"
    ) {
      return "LIMITED";
    }

    return "REVIEWED";
  }

  if (evidenceQuote.length > 0) {
    return "EXTRACTED";
  }

  if (evidenceCount > 0) {
    return "CANDIDATE";
  }

  if (confidence !== null) {
    return "HYPOTHESIS";
  }

  return "UNMAPPED";
}

function getEvidenceBadgeClass(
  level: EvidenceLevel,
) {
  switch (level) {
    case "STRONG":
      return `
        border-emerald-300/25
        bg-emerald-300/[0.09]
        text-emerald-200
      `;

    case "SUPPORTED":
      return `
        border-cyan-300/20
        bg-cyan-300/[0.07]
        text-cyan-200
      `;

    case "LIMITED":
      return `
        border-amber-300/20
        bg-amber-300/[0.07]
        text-amber-200
      `;

    case "MIXED":
      return `
        border-orange-300/20
        bg-orange-300/[0.07]
        text-orange-200
      `;

    case "CONTRADICTED":
      return `
        border-rose-300/20
        bg-rose-300/[0.07]
        text-rose-200
      `;

    case "REVIEWED":
      return `
        border-violet-300/15
        bg-violet-300/[0.06]
        text-violet-200/80
      `;

    case "EXTRACTED":
      return `
        border-cyan-300/15
        bg-cyan-300/[0.06]
        text-cyan-200/80
      `;

    case "CANDIDATE":
      return `
        border-amber-300/15
        bg-amber-300/[0.06]
        text-amber-200/80
      `;

    case "HYPOTHESIS":
      return `
        border-fuchsia-300/15
        bg-fuchsia-300/[0.06]
        text-fuchsia-200/80
      `;

    default:
      return `
        border-white/[0.08]
        bg-white/[0.025]
        text-slate-400
      `;
  }
}

/* =========================================================
   BIOLOGICAL EDGE
   ========================================================= */

export default memo(function BiologicalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  label,
  style,
  labelStyle,
  data,
}: EdgeProps) {
  const [
    edgePath,
    labelX,
    labelY,
  ] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 26,
    offset: 26,
  });

  const edgeData =
    (data ?? {}) as ResearchEdgeData;

  const relationLabel =
    typeof label === "string"
      ? label
      : "connected to";

  const relationship =
    getRelationshipVisual(
      edgeData.relationType,
      relationLabel,
    );

  const active =
    Number(
      style?.strokeWidth ?? 0,
    ) >= 3;

  const confidence =
    normalizeConfidence(
      edgeData.confidence,
    );

  const evidenceCount =
    typeof edgeData.evidenceCount ===
      "number"
      ? edgeData.evidenceCount
      : 0;

  const evidenceQuote =
    typeof edgeData.evidenceQuote ===
      "string"
      ? edgeData.evidenceQuote.trim()
      : "";

  const evidenceLevel =
    getEvidenceLevel(
      edgeData,
      evidenceCount,
      confidence,
      evidenceQuote,
    );

  const directionality =
    edgeData.directionality ??
    "directed";

  const isHypothesis =
    evidenceLevel ===
    "HYPOTHESIS";

  const isUnmapped =
    evidenceLevel ===
    "UNMAPPED";

  const isCandidate =
    evidenceLevel ===
    "CANDIDATE";

  const isContradicted =
    evidenceLevel ===
    "CONTRADICTED";

  const isMixed =
    evidenceLevel ===
    "MIXED";

  const mainOpacity =
    isUnmapped
      ? 0.35
      : isHypothesis
        ? 0.55
        : isCandidate
          ? 0.78
          : isContradicted
            ? 0.62
            : isMixed
              ? 0.86
              : 1;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* ================================================= */}
      {/* OUTER GLOW                                       */}
      {/* ================================================= */}

      <path
        d={edgePath}
        fill="none"
        stroke={
          relationship.color
        }
        strokeWidth={
          active
            ? 10
            : 6
        }
        opacity={
          active
            ? 0.14
            : 0.045
        }
        strokeLinecap="round"
        className="pointer-events-none"
        style={{
          filter:
            active
              ? `drop-shadow(0 0 16px ${relationship.color})`
              : "none",
        }}
      />

      {/* ================================================= */}
      {/* MAIN EDGE                                        */}
      {/* ================================================= */}

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={
          directionality ===
            "undirected"
            ? undefined
            : markerEnd
        }
        style={{
          ...style,

          stroke:
            relationship.color,

          strokeLinecap:
            "round",

          strokeDasharray:
            isHypothesis ||
            isUnmapped ||
            isCandidate ||
            isContradicted ||
            isMixed
              ? "7 8"
              : undefined,

          opacity:
            typeof style?.opacity ===
              "number"
              ? style.opacity *
                mainOpacity
              : mainOpacity,

          filter:
            active
              ? `drop-shadow(0 0 8px ${relationship.color})`
              : "drop-shadow(0 0 3px rgba(77,141,255,.14))",
        }}
      />

      {/* ================================================= */}
      {/* FLOW TRACE                                       */}
      {/* ================================================= */}

      {!isUnmapped && (
        <path
          d={edgePath}
          fill="none"
          stroke={
            relationship.secondary
          }
          strokeWidth={
            active
              ? 1.6
              : 0.75
          }
          strokeDasharray={
            relationship.dash
          }
          strokeLinecap="round"
          opacity={
            active
              ? 0.9
              : 0.32
          }
          className="pointer-events-none"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="38"
            to="0"
            dur={
              active
                ? "0.8s"
                : "2.15s"
            }
            repeatCount="indefinite"
          />
        </path>
      )}

      {/* ================================================= */}
      {/* CELLULAR MOVEMENT                                */}
      {/* ================================================= */}

      {relationship.particle ===
        "cell" &&
        !isUnmapped && (
          <g className="pointer-events-none">
            <circle
              r={
                active
                  ? 5.2
                  : 3.3
              }
              fill="rgba(7,24,35,.92)"
              stroke={
                relationship.secondary
              }
              strokeWidth="1.5"
              style={{
                filter:
                  active
                    ? `drop-shadow(0 0 8px ${relationship.secondary})`
                    : "none",
              }}
            >
              <animateMotion
                dur={
                  active
                    ? "1.15s"
                    : "2.8s"
                }
                repeatCount="indefinite"
                path={edgePath}
              />
            </circle>

            <circle
              r={
                active
                  ? 1.8
                  : 1.1
              }
              fill={
                relationship.secondary
              }
            >
              <animateMotion
                dur={
                  active
                    ? "1.15s"
                    : "2.8s"
                }
                repeatCount="indefinite"
                path={edgePath}
              />
            </circle>
          </g>
        )}

      {/* ================================================= */}
      {/* MOLECULAR TRANSPORT                              */}
      {/* ================================================= */}

      {relationship.particle ===
        "molecule" &&
        !isUnmapped && (
          <>
            {[
              0,
              0.38,
              0.68,
              0.92,
            ].map(
              (
                delay,
                index,
              ) => (
                <circle
                  key={delay}
                  r={
                    active
                      ? 3.8
                      : 2.2
                  }
                  fill={
                    index %
                        2 ===
                      0
                      ? relationship.color
                      : relationship.secondary
                  }
                  opacity={
                    active
                      ? 1
                      : 0.65
                  }
                  className="pointer-events-none"
                  style={{
                    filter:
                      active
                        ? `drop-shadow(0 0 10px ${relationship.color}) drop-shadow(0 0 20px ${relationship.color}33)`
                        : "none",
                  }}
                >
                  <animateMotion
                    begin={`${delay}s`}
                    dur={
                      active
                        ? "1.15s"
                        : "3s"
                    }
                    repeatCount="indefinite"
                    path={
                      edgePath
                    }
                  />
                </circle>
              ),
            )}
          </>
        )}

      {/* ================================================= */}
      {/* SIGNAL TRANSMISSION                              */}
      {/* ================================================= */}

      {relationship.particle ===
        "signal" &&
        !isUnmapped && (
          <>
            {/* leading particle */}
            <circle
              r={
                active
                  ? 4.5
                  : 2.8
              }
              fill="#ffffff"
              opacity={
                active
                  ? 1
                  : 0.7
              }
              className="pointer-events-none"
              style={{
                filter:
                  active
                    ? `drop-shadow(0 0 12px ${relationship.secondary}) drop-shadow(0 0 24px ${relationship.secondary}44)`
                    : "none",
              }}
            >
              <animateMotion
                dur={
                  active
                    ? "0.95s"
                    : "2.45s"
                }
                repeatCount="indefinite"
                path={
                  edgePath
                }
              />
            </circle>

            {/* glow halo */}
            <circle
              r={
                active
                  ? 9
                  : 4.5
              }
              fill={
                relationship.color
              }
              opacity={
                active
                  ? 0.22
                  : 0.12
              }
              className="pointer-events-none"
            >
              <animateMotion
                dur={
                  active
                    ? "0.95s"
                    : "2.45s"
                }
                repeatCount="indefinite"
                path={
                  edgePath
                }
              />
            </circle>

            {/* trailing ghost */}
            {active && (
              <circle
                r={3}
                fill={relationship.secondary}
                opacity={0.35}
                className="pointer-events-none"
              >
                <animateMotion
                  dur="0.95s"
                  begin="0.32s"
                  repeatCount="indefinite"
                  path={edgePath}
                />
              </circle>
            )}
          </>
        )}

      {/* ================================================= */}
      {/* RELATION LABEL                                   */}
      {/* ================================================= */}

      {label && (
        <EdgeLabelRenderer>
          <div
            className="
              pointer-events-none
              absolute
              min-w-[128px]
              rounded-[14px]
              border
              bg-[#0a0f14]/96
              px-3.5
              py-2.5
              backdrop-blur-xl
            "
            style={{
              transform:
                `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,

              borderColor:
                `${relationship.color}2b`,

              boxShadow:
                active
                  ? `0 0 22px ${relationship.color}22`
                  : "0 12px 34px rgba(1,8,15,.34)",
            }}
          >
            {/* ============================================= */}
            {/* RELATION                                      */}
            {/* ============================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.07em]
                "
                style={{
                  color:
                    typeof labelStyle?.fill ===
                      "string"
                      ? labelStyle.fill
                      : relationship.secondary,
                }}
              >
                {relationLabel}
              </span>

              {directionality ===
                "undirected" && (
                <span
                  className="
                    text-[11px]
                    text-slate-500
                  "
                >
                  ↔
                </span>
              )}
            </div>

            {/* ============================================= */}
            {/* RETRIEVAL / EVIDENCE STATUS                   */}
            {/* ============================================= */}

            <div
              className="
                mt-1.5
                flex
                flex-wrap
                items-center
                gap-1.5
              "
            >
              <span
                className={`
                  rounded-full
                  border
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-bold
                  tracking-[0.06em]

                  ${getEvidenceBadgeClass(
                    evidenceLevel,
                  )}
                `}
              >
                {evidenceLevel}
              </span>

              {confidence !==
                null && (
                <span
                  className="
                    rounded-full
                    border
                    border-teal-100/[0.07]
                    bg-black/[0.12]
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-slate-400
                  "
                >
                  AI {confidence}%
                </span>
              )}

              {evidenceCount >
                0 && (
                <span
                  className="
                    rounded-full
                    border
                    border-teal-100/[0.07]
                    bg-black/[0.12]
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-slate-400
                  "
                >
                  {evidenceCount}{" "}
                  {evidenceCount ===
                  1
                    ? "paper"
                    : "papers"}
                </span>
              )}

              {edgeData.evidenceSummary &&
                edgeData.evidenceSummary.analyzed >
                  0 && (
                <span
                  className="
                    rounded-full
                    border
                    border-emerald-300/10
                    bg-emerald-300/[0.035]
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-emerald-200/70
                  "
                >
                  {edgeData.evidenceSummary.supporting} support
                </span>
              )}
            </div>

            {/* ============================================= */}
            {/* EVIDENCE QUOTE SIGNAL                        */}
            {/* ============================================= */}

            {evidenceQuote && (
              <div
                className="
                  mt-1.5
                  text-[9px]
                  uppercase
                  tracking-[0.11em]
                  text-teal-200/45
                "
              >
                Source quote linked
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});