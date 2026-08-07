"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

function getRelationshipVisual(
  label: string,
): {
  color: string;
  secondary: string;
  particle: "molecule" | "cell" | "signal";
  dash: string;
} {
  const normalized =
    label.toLowerCase();

  if (
    normalized.includes("inhibit") ||
    normalized.includes("suppress") ||
    normalized.includes("block")
  ) {
    return {
      color: "#fb7185",
      secondary: "#f43f5e",
      particle: "signal",
      dash: "5 10",
    };
  }

  if (
    normalized.includes("recruit") ||
    normalized.includes("migrate") ||
    normalized.includes("infiltrat")
  ) {
    return {
      color: "#2dd4bf",
      secondary: "#67e8f9",
      particle: "cell",
      dash: "8 12",
    };
  }

  if (
    normalized.includes("secrete") ||
    normalized.includes("release") ||
    normalized.includes("produce")
  ) {
    return {
      color: "#c084fc",
      secondary: "#f0abfc",
      particle: "molecule",
      dash: "3 9",
    };
  }

  if (
    normalized.includes("activate") ||
    normalized.includes("promote") ||
    normalized.includes("support") ||
    normalized.includes("increase")
  ) {
    return {
      color: "#22d3ee",
      secondary: "#a5f3fc",
      particle: "signal",
      dash: "2 10",
    };
  }

  if (
    normalized.includes("spread") ||
    normalized.includes("metastas")
  ) {
    return {
      color: "#fb7185",
      secondary: "#f9a8d4",
      particle: "cell",
      dash: "6 11",
    };
  }

  return {
    color: "#67e8f9",
    secondary: "#c4b5fd",
    particle: "molecule",
    dash: "4 10",
  };
}

export default function BiologicalEdge({
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

  const active =
    Number(style?.strokeWidth ?? 0) >= 3;

  const relationship =
    getRelationshipVisual(
      typeof label === "string"
        ? label
        : "connected to",
    );

  const evidenceCount =
    typeof (data as {
      evidenceCount?: unknown;
    } | undefined)?.evidenceCount ===
    "number"
      ? (data as {
          evidenceCount: number;
        }).evidenceCount
      : 0;

  const evidenceLabel =
    evidenceCount >= 4
      ? "STRONG"
      : evidenceCount >= 2
        ? "MODERATE"
        : evidenceCount === 1
          ? "LIMITED"
          : "UNMAPPED";

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke={relationship.color}
        strokeWidth={active ? 10 : 7}
        opacity={active ? 0.12 : 0.045}
        strokeLinecap="round"
        className="pointer-events-none"
        style={{
          filter: active
            ? `drop-shadow(0 0 16px ${relationship.color})`
            : "none",
        }}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: relationship.color,
          strokeLinecap: "round",
          filter: active
            ? `drop-shadow(0 0 8px ${relationship.color})`
            : "drop-shadow(0 0 3px rgba(100,116,139,.25))",
        }}
      />

      <path
        d={edgePath}
        fill="none"
        stroke={relationship.secondary}
        strokeWidth={active ? 1.7 : 0.85}
        strokeDasharray={relationship.dash}
        strokeLinecap="round"
        opacity={active ? 0.95 : 0.48}
        className="pointer-events-none"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="38"
          to="0"
          dur={active ? "0.72s" : "1.75s"}
          repeatCount="indefinite"
        />
      </path>

      {relationship.particle ===
        "cell" && (
        <g className="pointer-events-none">
          <circle
            r={active ? 5.2 : 3.3}
            fill="rgba(2,6,23,.85)"
            stroke={relationship.secondary}
            strokeWidth="1.5"
            style={{
              filter: active
                ? `drop-shadow(0 0 8px ${relationship.secondary})`
                : "none",
            }}
          >
            <animateMotion
              dur={active ? "1.15s" : "2.8s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          <circle
            r={active ? 1.8 : 1.1}
            fill={relationship.secondary}
          >
            <animateMotion
              dur={active ? "1.15s" : "2.8s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        </g>
      )}

      {relationship.particle ===
        "molecule" && (
        <>
          {[0, 0.46, 0.78].map(
            (delay, index) => (
              <circle
                key={delay}
                r={active ? 3.5 : 2.2}
                fill={
                  index % 2 === 0
                    ? relationship.color
                    : relationship.secondary
                }
                opacity={active ? 1 : 0.65}
                className="pointer-events-none"
                style={{
                  filter: active
                    ? `drop-shadow(0 0 8px ${relationship.color})`
                    : "none",
                }}
              >
                <animateMotion
                  begin={`${delay}s`}
                  dur={active ? "1.25s" : "3s"}
                  repeatCount="indefinite"
                  path={edgePath}
                />
              </circle>
            ),
          )}
        </>
      )}

      {relationship.particle ===
        "signal" && (
        <>
          <circle
            r={active ? 4 : 2.6}
            fill="#ffffff"
            opacity={active ? 1 : 0.7}
            className="pointer-events-none"
            style={{
              filter: active
                ? `drop-shadow(0 0 10px ${relationship.secondary})`
                : "none",
            }}
          >
            <animateMotion
              dur={active ? "0.95s" : "2.45s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          <circle
            r={active ? 7 : 4}
            fill={relationship.color}
            opacity=".18"
            className="pointer-events-none"
          >
            <animateMotion
              dur={active ? "0.95s" : "2.45s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        </>
      )}

      {label && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded-[11px] border bg-[#07111f]/94 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] backdrop-blur-xl"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color:
                typeof labelStyle?.fill ===
                "string"
                  ? labelStyle.fill
                  : relationship.secondary,
              borderColor: `${relationship.color}33`,
              boxShadow: active
                ? `0 0 22px ${relationship.color}22`
                : "0 8px 24px rgba(0,0,0,.28)",
            }}
          >
            <span>{label}</span>
            <span
              className="ml-2 rounded-full border border-white/[0.08] bg-black/25 px-1.5 py-0.5 text-[7px] tracking-[0.08em] text-white/45"
            >
              {evidenceLabel}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}