"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { AnimatePresence, motion } from "framer-motion";

import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  getSmoothStepPath,
  useNodesState,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  buildGraphFromText,
  type EntityData,
  type EntityType,
} from "../lib/buildGraphFromText";

import { layoutGraph } from "../lib/layoutGraph";
import WorkspaceReveal from "../components/workspace/WorkspaceReveal";

import {
  deleteBioLayersProject,
  hasSavedBioLayersProject,
  loadBioLayersProject,
  saveBioLayersProject,
} from "../lib/projectStorage";


type CellOntologyTerm = {
  id: string;
  iri: string;
  label: string;
  description: string;
  synonyms: string[];
  ontology: "cl" | "clo";
  ontologyLabel:
    | "Cell Ontology"
    | "Cell Line Ontology";
};

type CellSearchResponse = {
  query?: string;
  ontology?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  terms?: CellOntologyTerm[];
  error?: string;
};

function mergeUniqueById<T extends {
  id: string;
}>(
  current: T[],
  incoming: T[],
): T[] {
  const map = new Map<string, T>();

  for (const item of current) {
    map.set(item.id, item);
  }

  for (const item of incoming) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

async function searchCells({
  query,
  page = 0,
  pageSize = 20,
  ontology = "cl",
  signal,
}: {
  query: string;
  page?: number;
  pageSize?: number;
  ontology?: "cl" | "clo" | "all";
  signal?: AbortSignal;
}): Promise<CellSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    pageSize: String(pageSize),
    ontology,
  });

  const response = await fetch(
    `/api/cells?${params.toString()}`,
    {
      signal,
    },
  );

  const result =
    (await response.json()) as CellSearchResponse;

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Could not search cell ontologies.",
    );
  }

  return result;
}

type LayerState = Record<EntityType, boolean>;
type LayoutDirection = "TB" | "LR";

type GenerationMode =
  | "loading"
  | "ai"
  | "fallback"
  | "saved"
  | "error";

type EntityNodeType = Node<EntityData, "entity">;
type FlowInstance = ReactFlowInstance<
  EntityNodeType,
  Edge
>;

type ApiEntity = {
  id: string;
  label: string;
  type: EntityType;
  description: string;
};

type ApiRelation = {
  source: string;
  target: string;
  label: string;
};

type ApiGraphResponse = {
  entities: ApiEntity[];
  relations: ApiRelation[];
  error?: string;
};

type PubMedPaper = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  authors: string[];
  doi: string | null;
  pubmedUrl: string;
};

type PubMedResponse = {
  query?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  loaded?: number;
  hasMore?: boolean;
  sort?: "relevance" | "date";
  papers?: PubMedPaper[];
  error?: string;
};

type PaperSort = "relevance" | "date";
type CellOntologyScope =
  | "cl"
  | "clo"
  | "all";

type RelatedConnection = {
  nodeId: string;
  label: string;
  type: EntityType;
  relation: string;
  direction: "incoming" | "outgoing";
};

type WorkspaceView =
  | "graph"
  | "evidence"
  | "citations"
  | "timeline"
  | "cells"
  | "pubmed";

type NarrativeStep = {
  id: string;
  nodeId: string;
  edgeId: string | null;
  title: string;
  relation: string;
  explanation: string;
};

type DemoScene =
  | "problem"
  | "mechanism"
  | "evidence"
  | "cells"
  | "vision";

type CopilotMode =
  | "explain"
  | "mechanism"
  | "hypothesis"
  | "limitations"
  | "simplify"
  | "custom";

type CopilotCitation = {
  pmid: string;
  title: string;
  support: string;
};

type CopilotResponse = {
  title: string;
  answer: string;
  keyPoints: string[];
  limitations: string[];
  followUpQuestions: string[];
  citations: CopilotCitation[];
  error?: string;
};

type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  keyPoints?: string[];
  limitations?: string[];
  followUpQuestions?: string[];
  citations?: CopilotCitation[];
};

type EvidenceLevel =
  | "No evidence"
  | "Limited"
  | "Moderate"
  | "Strong";

type EvidenceProfile = {
  level: EvidenceLevel;
  score: number;
  description: string;
  badgeClass: string;
  meterClass: string;
};

function getEvidenceProfile(
  paperCount: number,
  loading = false,
  hasError = false,
): EvidenceProfile {
  if (loading) {
    return {
      level: "Limited",
      score: 18,
      description: "Literature coverage is loading.",
      badgeClass:
        "border-slate-300/15 bg-slate-300/[0.05] text-slate-300",
      meterClass:
        "from-slate-500 via-cyan-300 to-violet-300",
    };
  }

  if (hasError || paperCount <= 0) {
    return {
      level: "No evidence",
      score: 8,
      description:
        "No matching PubMed metadata is currently loaded.",
      badgeClass:
        "border-rose-300/15 bg-rose-300/[0.05] text-rose-200",
      meterClass:
        "from-rose-400 via-rose-300 to-amber-300",
    };
  }

  if (paperCount === 1) {
    return {
      level: "Limited",
      score: 34,
      description:
        "One relevant PubMed record is currently linked.",
      badgeClass:
        "border-amber-300/15 bg-amber-300/[0.06] text-amber-200",
      meterClass:
        "from-amber-400 via-amber-300 to-cyan-300",
    };
  }

  if (paperCount <= 3) {
    return {
      level: "Moderate",
      score: 68,
      description:
        "Several relevant PubMed records are currently linked.",
      badgeClass:
        "border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200",
      meterClass:
        "from-cyan-400 via-cyan-300 to-violet-300",
    };
  }

  return {
    level: "Strong",
    score: 92,
    description:
      "Four or more relevant PubMed records are currently linked.",
    badgeClass:
      "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200",
    meterClass:
      "from-emerald-400 via-cyan-300 to-violet-300",
  };
}

const nodeClassNames: Record<EntityType, string> = {
  cell:
    "border-teal-300/45 bg-[linear-gradient(145deg,rgba(20,184,166,.22),rgba(4,12,24,.96))] text-teal-50 shadow-[0_18px_55px_rgba(20,184,166,.14)]",
  protein:
    "border-violet-300/45 bg-[linear-gradient(145deg,rgba(139,92,246,.23),rgba(4,12,24,.96))] text-violet-50 shadow-[0_18px_55px_rgba(139,92,246,.16)]",
  pathway:
    "border-amber-300/45 bg-[linear-gradient(145deg,rgba(245,158,11,.2),rgba(4,12,24,.96))] text-amber-50 shadow-[0_18px_55px_rgba(245,158,11,.13)]",
  process:
    "border-blue-300/45 bg-[linear-gradient(145deg,rgba(59,130,246,.22),rgba(4,12,24,.96))] text-blue-50 shadow-[0_18px_55px_rgba(59,130,246,.15)]",
  disease:
    "border-rose-300/45 bg-[linear-gradient(145deg,rgba(244,63,94,.22),rgba(4,12,24,.96))] text-rose-50 shadow-[0_18px_55px_rgba(244,63,94,.15)]",
};

const miniMapColors: Record<EntityType, string> = {
  cell: "#2dd4bf",
  protein: "#a78bfa",
  pathway: "#fbbf24",
  process: "#60a5fa",
  disease: "#fb7185",
};

const layerLabels: Array<{
  key: EntityType;
  label: string;
}> = [
  { key: "cell", label: "Cells" },
  { key: "protein", label: "Proteins" },
  { key: "pathway", label: "Pathways" },
  { key: "process", label: "Processes" },
  { key: "disease", label: "Diseases" },
];

const legendItems: Array<{
  key: EntityType;
  label: string;
  colorClass: string;
}> = [
  {
    key: "cell",
    label: "Cell",
    colorClass: "bg-teal-400",
  },
  {
    key: "protein",
    label: "Protein",
    colorClass: "bg-violet-400",
  },
  {
    key: "pathway",
    label: "Pathway",
    colorClass: "bg-amber-400",
  },
  {
    key: "process",
    label: "Process",
    colorClass: "bg-blue-400",
  },
  {
    key: "disease",
    label: "Disease",
    colorClass: "bg-rose-400",
  },
];


const entityVisualTheme: Record<
  EntityType,
  {
    accent: string;
    accentSoft: string;
    secondary: string;
    border: string;
    glow: string;
    label: string;
  }
> = {
  cell: {
    accent: "#2dd4bf",
    accentSoft: "rgba(45,212,191,.18)",
    secondary: "#67e8f9",
    border: "rgba(94,234,212,.42)",
    glow: "rgba(45,212,191,.36)",
    label: "Living cell",
  },
  protein: {
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,.18)",
    secondary: "#e879f9",
    border: "rgba(196,181,253,.42)",
    glow: "rgba(167,139,250,.36)",
    label: "Protein structure",
  },
  pathway: {
    accent: "#fbbf24",
    accentSoft: "rgba(251,191,36,.18)",
    secondary: "#fb7185",
    border: "rgba(252,211,77,.42)",
    glow: "rgba(251,191,36,.34)",
    label: "Signal pathway",
  },
  process: {
    accent: "#60a5fa",
    accentSoft: "rgba(96,165,250,.18)",
    secondary: "#22d3ee",
    border: "rgba(147,197,253,.42)",
    glow: "rgba(96,165,250,.35)",
    label: "Biological process",
  },
  disease: {
    accent: "#fb7185",
    accentSoft: "rgba(251,113,133,.18)",
    secondary: "#f472b6",
    border: "rgba(253,164,175,.42)",
    glow: "rgba(251,113,133,.36)",
    label: "Disease state",
  },
};

function getSemanticVisual(
  label: string,
  type: EntityType,
):
  | "bone"
  | "prostate"
  | "tumor"
  | "fibroblast"
  | "cxcl12"
  | "cell"
  | "protein"
  | "pathway"
  | "process"
  | "disease" {
  const normalized =
    label.toLowerCase();

  if (
    normalized.includes("bone") ||
    normalized.includes("osteoblast") ||
    normalized.includes("osteoclast")
  ) {
    return "bone";
  }

  if (
    normalized.includes("prostate")
  ) {
    return "prostate";
  }

  if (
    normalized.includes("tumor") ||
    normalized.includes("cancer") ||
    normalized.includes("metast")
  ) {
    return "tumor";
  }

  if (
    normalized.includes("fibroblast") ||
    normalized.includes("caf")
  ) {
    return "fibroblast";
  }

  if (
    normalized.includes("cxcl12") ||
    normalized.includes("chemokine")
  ) {
    return "cxcl12";
  }

  return type;
}

function BiologicalArtwork({
  type,
  label,
  active,
}: {
  type: EntityType;
  label: string;
  active: boolean;
}) {
  const theme = entityVisualTheme[type];
  const visual = getSemanticVisual(
    label,
    type,
  );

  return (
    <div className="relative h-[118px] overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#02040a]">
      <motion.div
        animate={{
          opacity: active
            ? [0.5, 0.88, 0.5]
            : [0.24, 0.5, 0.24],
          scale: active
            ? [0.98, 1.07, 0.98]
            : [0.99, 1.03, 0.99],
        }}
        transition={{
          duration: active ? 3 : 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(circle at 32% 34%, ${theme.accentSoft}, transparent 34%)`,
            `radial-gradient(circle at 72% 66%, ${theme.accentSoft}, transparent 40%)`,
            "linear-gradient(145deg, rgba(255,255,255,.025), transparent 48%)",
          ].join(","),
        }}
      />

      <svg
        viewBox="0 0 320 150"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`semantic-main-${type}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={theme.accent}
            />
            <stop
              offset="58%"
              stopColor={theme.secondary}
            />
            <stop
              offset="100%"
              stopColor="#ffffff"
              stopOpacity=".72"
            />
          </linearGradient>

          <radialGradient
            id={`semantic-core-${type}`}
            cx="34%"
            cy="28%"
            r="76%"
          >
            <stop
              offset="0%"
              stopColor="#ffffff"
              stopOpacity=".82"
            />
            <stop
              offset="28%"
              stopColor={theme.secondary}
              stopOpacity=".48"
            />
            <stop
              offset="74%"
              stopColor={theme.accent}
              stopOpacity=".14"
            />
            <stop
              offset="100%"
              stopColor="#02040a"
              stopOpacity=".04"
            />
          </radialGradient>

          <filter
            id={`semantic-glow-${type}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              stdDeviation="4"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id={`semantic-organic-${type}`}
            x="-45%"
            y="-45%"
            width="190%"
            height="190%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".014 .03"
              numOctaves="2"
              seed="12"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
            />
          </filter>
        </defs>

        <rect
          width="320"
          height="150"
          fill="#02040a"
        />

        {visual === "bone" && (
          <>
            <motion.g
              animate={{
                rotate: [-3, 3, -3],
                y: [1, -2, 1],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformOrigin:
                  "160px 75px",
              }}
            >
              <path
                d="M92 53 C78 39, 57 43, 52 59 C48 72, 59 82, 72 84 L72 94 C58 97, 49 108, 54 121 C61 138, 82 138, 95 124 L226 124 C239 138, 261 137, 267 120 C272 106, 262 96, 248 93 L248 83 C262 81, 272 70, 267 56 C261 39, 240 39, 227 53Z"
                fill={`url(#semantic-core-${type})`}
                stroke={`url(#semantic-main-${type})`}
                strokeWidth="3"
                filter={`url(#semantic-glow-${type})`}
              />
              <path
                d="M99 64 C132 58, 188 58, 221 64 M99 113 C132 119, 188 119, 221 113"
                fill="none"
                stroke="rgba(255,255,255,.35)"
                strokeWidth="1.5"
              />
              {[122, 147, 173, 198].map(
                (cx, index) => (
                  <motion.circle
                    key={cx}
                    cx={cx}
                    cy={
                      index % 2 === 0
                        ? 78
                        : 99
                    }
                    r="5"
                    fill={
                      index % 2 === 0
                        ? theme.accent
                        : theme.secondary
                    }
                    animate={{
                      opacity: [
                        0.25,
                        1,
                        0.25,
                      ],
                      scale: [
                        0.7,
                        1.35,
                        0.7,
                      ],
                    }}
                    transition={{
                      duration:
                        2.3 +
                        index * 0.25,
                      repeat: Infinity,
                    }}
                  />
                ),
              )}
            </motion.g>
          </>
        )}

        {visual === "prostate" && (
          <>
            <motion.path
              d="M160 39 C121 39, 94 59, 96 83 C98 107, 122 120, 160 120 C198 120, 222 107, 224 83 C226 59, 199 39, 160 39Z"
              fill={`url(#semantic-core-${type})`}
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="3"
              filter={`url(#semantic-organic-${type})`}
              animate={{
                d: [
                  "M160 39 C121 39, 94 59, 96 83 C98 107, 122 120, 160 120 C198 120, 222 107, 224 83 C226 59, 199 39, 160 39Z",
                  "M160 36 C119 40, 91 58, 98 86 C104 111, 124 123, 160 121 C198 124, 219 109, 223 83 C227 57, 200 36, 160 36Z",
                  "M160 39 C121 39, 94 59, 96 83 C98 107, 122 120, 160 120 C198 120, 222 107, 224 83 C226 59, 199 39, 160 39Z",
                ],
              }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M160 21 L160 124"
              stroke="#ffffff"
              strokeOpacity=".32"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
              }}
            />
            {[130, 148, 176, 194].map(
              (cx, index) => (
                <motion.circle
                  key={cx}
                  cx={cx}
                  cy={
                    index % 2 === 0
                      ? 72
                      : 95
                  }
                  r="7"
                  fill={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  animate={{
                    scale: [
                      0.75,
                      1.25,
                      0.75,
                    ],
                    opacity: [
                      0.35,
                      1,
                      0.35,
                    ],
                  }}
                  transition={{
                    duration:
                      2.4 +
                      index * 0.3,
                    repeat: Infinity,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "tumor" && (
          <>
            <motion.path
              d="M70 80 C65 48, 96 27, 129 34 C157 15, 195 27, 205 52 C238 51, 260 72, 250 101 C240 128, 205 134, 181 122 C157 140, 119 134, 106 114 C82 116, 62 101, 70 80Z"
              fill={`url(#semantic-core-${type})`}
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="3"
              filter={`url(#semantic-organic-${type})`}
              animate={{
                d: [
                  "M70 80 C65 48, 96 27, 129 34 C157 15, 195 27, 205 52 C238 51, 260 72, 250 101 C240 128, 205 134, 181 122 C157 140, 119 134, 106 114 C82 116, 62 101, 70 80Z",
                  "M66 75 C74 42, 98 31, 132 31 C160 18, 192 25, 209 50 C241 53, 257 76, 247 104 C234 132, 202 130, 179 125 C151 137, 120 133, 102 111 C77 119, 56 100, 66 75Z",
                  "M70 80 C65 48, 96 27, 129 34 C157 15, 195 27, 205 52 C238 51, 260 72, 250 101 C240 128, 205 134, 181 122 C157 140, 119 134, 106 114 C82 116, 62 101, 70 80Z",
                ],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {[
              [105, 71, 13],
              [142, 94, 18],
              [176, 62, 16],
              [211, 96, 13],
              [119, 116, 9],
              [196, 119, 8],
            ].map(
              ([cx, cy, r], index) => (
                <motion.circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  opacity=".74"
                  filter={`url(#semantic-glow-${type})`}
                  animate={{
                    scale: [
                      0.78,
                      1.22,
                      0.78,
                    ],
                    opacity: [
                      0.4,
                      1,
                      0.4,
                    ],
                  }}
                  transition={{
                    duration:
                      2.1 +
                      index * 0.26,
                    repeat: Infinity,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "fibroblast" && (
          <>
            <motion.path
              d="M159 75 C132 57, 113 41, 95 30 M159 75 C132 80, 105 91, 73 112 M159 75 C173 48, 196 32, 229 24 M159 75 C184 82, 213 100, 248 119 M159 75 C160 104, 153 124, 145 142"
              fill="none"
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="7"
              strokeLinecap="round"
              filter={`url(#semantic-organic-${type})`}
              animate={{
                pathLength: [
                  0.45,
                  1,
                  0.45,
                ],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.ellipse
              cx="159"
              cy="75"
              rx="31"
              ry="21"
              fill={`url(#semantic-core-${type})`}
              stroke={theme.secondary}
              strokeWidth="2.5"
              animate={{
                rx: [29, 34, 29],
                ry: [19, 24, 19],
                rotate: [-3, 4, -3],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {[0, 1, 2, 3, 4].map(
              (index) => (
                <motion.circle
                  key={index}
                  cx={
                    120 +
                    index * 20
                  }
                  cy={
                    index % 2 === 0
                      ? 62
                      : 90
                  }
                  r="4"
                  fill={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  animate={{
                    opacity: [
                      0.2,
                      1,
                      0.2,
                    ],
                    scale: [
                      0.7,
                      1.4,
                      0.7,
                    ],
                  }}
                  transition={{
                    duration:
                      2.2 +
                      index * 0.22,
                    repeat: Infinity,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "cxcl12" && (
          <>
            <motion.path
              d="M55 92 C84 28, 120 127, 156 52 C185 9, 216 126, 268 52"
              fill="none"
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="7"
              strokeLinecap="round"
              filter={`url(#semantic-glow-${type})`}
              animate={{
                pathLength: [
                  0.34,
                  1,
                  0.34,
                ],
                opacity: [
                  0.52,
                  1,
                  0.52,
                ],
              }}
              transition={{
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {[72, 107, 143, 180, 217, 252].map(
              (cx, index) => (
                <motion.circle
                  key={cx}
                  cx={cx}
                  cy={
                    index % 2 === 0
                      ? 64
                      : 96
                  }
                  r="9"
                  fill={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  animate={{
                    y: [-3, 4, -3],
                    scale: [
                      0.82,
                      1.2,
                      0.82,
                    ],
                  }}
                  transition={{
                    duration:
                      2.5 +
                      (index % 3) * 0.4,
                    repeat: Infinity,
                    delay: index * 0.14,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "cell" && (
          <>
            <motion.ellipse
              cx="160"
              cy="75"
              rx="88"
              ry="47"
              fill={`url(#semantic-core-${type})`}
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="3"
              filter={`url(#semantic-organic-${type})`}
              animate={{
                rx: [84, 91, 84],
                ry: [45, 50, 45],
              }}
              transition={{
                duration: 5.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="160"
              cy="75"
              r="20"
              fill="rgba(2,6,23,.66)"
              stroke={theme.secondary}
              strokeWidth="2"
              animate={{
                r: [18, 23, 18],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            {[105, 127, 194, 215].map(
              (cx, index) => (
                <motion.ellipse
                  key={cx}
                  cx={cx}
                  cy={
                    index % 2 === 0
                      ? 58
                      : 96
                  }
                  rx="12"
                  ry="6"
                  fill="rgba(2,6,23,.55)"
                  stroke={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  animate={{
                    y: [-3, 3, -3],
                  }}
                  transition={{
                    duration:
                      3.2 +
                      index * 0.3,
                    repeat: Infinity,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "protein" && (
          <>
            <motion.path
              d="M40 99 C68 28, 94 124, 126 59 C154 17, 184 126, 220 57 C246 18, 268 90, 286 50"
              fill="none"
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="7"
              strokeLinecap="round"
              filter={`url(#semantic-glow-${type})`}
              animate={{
                pathLength: [
                  0.35,
                  1,
                  0.35,
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />
            {[58, 90, 122, 154, 186, 218, 250].map(
              (cx, index) => (
                <motion.circle
                  key={cx}
                  cx={cx}
                  cy={
                    index % 2 === 0
                      ? 63
                      : 96
                  }
                  r="8"
                  fill={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  animate={{
                    scale: [
                      0.8,
                      1.2,
                      0.8,
                    ],
                  }}
                  transition={{
                    duration:
                      2.4 +
                      index * 0.17,
                    repeat: Infinity,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "pathway" && (
          <>
            <motion.path
              d="M42 82 C76 31, 112 43, 143 77 C178 115, 223 113, 278 61"
              fill="none"
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="3"
              strokeDasharray="8 8"
              animate={{
                strokeDashoffset: [
                  0,
                  -64,
                ],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {[
              [55, 82],
              [101, 51],
              [145, 79],
              [190, 109],
              [232, 101],
              [276, 61],
            ].map(
              ([cx, cy], index) => (
                <motion.circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={
                    index % 2 === 0
                      ? 13
                      : 10
                  }
                  fill="rgba(2,6,23,.8)"
                  stroke={
                    index % 2 === 0
                      ? theme.accent
                      : theme.secondary
                  }
                  strokeWidth="2.3"
                  animate={{
                    scale: [
                      0.82,
                      1.18,
                      0.82,
                    ],
                  }}
                  transition={{
                    duration:
                      2.1 +
                      index * 0.26,
                    repeat: Infinity,
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "process" && (
          <>
            {[55, 37, 20].map(
              (radius, index) => (
                <motion.circle
                  key={radius}
                  cx="160"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke={
                    index === 0
                      ? theme.accent
                      : index === 1
                        ? theme.secondary
                        : "#ffffff"
                  }
                  strokeOpacity={
                    0.65 -
                    index * 0.18
                  }
                  strokeWidth={
                    index === 0
                      ? 3
                      : 1.8
                  }
                  strokeDasharray={
                    index === 0
                      ? "18 9"
                      : index === 1
                        ? "8 8"
                        : "3 7"
                  }
                  animate={{
                    rotate:
                      index % 2 === 0
                        ? 360
                        : -360,
                  }}
                  transition={{
                    duration:
                      9 +
                      index * 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    transformOrigin:
                      "160px 75px",
                  }}
                />
              ),
            )}
          </>
        )}

        {visual === "disease" && (
          <>
            <motion.path
              d="M68 77 C66 43, 101 24, 143 31 C177 17, 225 36, 236 69 C252 97, 222 124, 184 119 C153 133, 112 123, 95 103 C76 103, 61 94, 68 77Z"
              fill={`url(#semantic-core-${type})`}
              stroke={`url(#semantic-main-${type})`}
              strokeWidth="3"
              filter={`url(#semantic-organic-${type})`}
              animate={{
                d: [
                  "M68 77 C66 43, 101 24, 143 31 C177 17, 225 36, 236 69 C252 97, 222 124, 184 119 C153 133, 112 123, 95 103 C76 103, 61 94, 68 77Z",
                  "M64 74 C74 39, 104 29, 145 27 C183 18, 225 39, 239 72 C247 103, 217 126, 181 120 C150 130, 112 125, 92 101 C71 107, 55 92, 64 74Z",
                  "M68 77 C66 43, 101 24, 143 31 C177 17, 225 36, 236 69 C252 97, 222 124, 184 119 C153 133, 112 123, 95 103 C76 103, 61 94, 68 77Z",
                ],
              }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
              }}
            />
          </>
        )}

        <motion.rect
          x="-90"
          y="-20"
          width="42"
          height="190"
          fill="rgba(255,255,255,.13)"
          transform="rotate(14)"
          animate={{
            x: [-100, 390],
          }}
          transition={{
            duration: active ? 2.7 : 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <rect
          x=".5"
          y=".5"
          width="319"
          height="149"
          rx="21.5"
          fill="none"
          stroke="rgba(255,255,255,.08)"
        />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#02040a] to-transparent" />
    </div>
  );
}

function LivingWorkspaceAtmosphere({
  view,
}: {
  view: WorkspaceView;
}) {
  const palette =
    view === "evidence"
      ? {
          a: "rgba(16,185,129,.16)",
          b: "rgba(34,211,238,.12)",
          c: "rgba(59,130,246,.09)",
        }
      : view === "citations"
        ? {
            a: "rgba(139,92,246,.18)",
            b: "rgba(236,72,153,.12)",
            c: "rgba(34,211,238,.09)",
          }
        : view === "timeline"
          ? {
              a: "rgba(245,158,11,.16)",
              b: "rgba(251,113,133,.1)",
              c: "rgba(139,92,246,.09)",
            }
          : view === "cells"
            ? {
                a: "rgba(20,184,166,.18)",
                b: "rgba(34,211,238,.12)",
                c: "rgba(132,204,22,.08)",
              }
            : view === "pubmed"
              ? {
                  a: "rgba(59,130,246,.16)",
                  b: "rgba(139,92,246,.12)",
                  c: "rgba(236,72,153,.08)",
                }
              : {
                  a: "rgba(34,211,238,.13)",
                  b: "rgba(139,92,246,.11)",
                  c: "rgba(236,72,153,.07)",
                };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{
          x: [-80, 90, -80],
          y: [-50, 40, -50],
          scale: [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full blur-[110px]"
        style={{
          background: palette.a,
        }}
      />

      <motion.div
        animate={{
          x: [70, -70, 70],
          y: [30, -45, 30],
          scale: [1.08, 0.9, 1.08],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-28 top-[18%] h-[390px] w-[390px] rounded-full blur-[120px]"
        style={{
          background: palette.b,
        }}
      />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-180px] left-[30%] h-[420px] w-[420px] rounded-full border border-white/[0.035]"
        style={{
          boxShadow: `0 0 160px ${palette.c}, inset 0 0 100px ${palette.c}`,
        }}
      />

      {Array.from({
        length: 12,
      }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm"
          style={{
            width: 8 + (index % 4) * 5,
            height: 8 + (index % 4) * 5,
            left: `${7 + ((index * 17) % 86)}%`,
            top: `${10 + ((index * 23) % 78)}%`,
          }}
          animate={{
            y: [0, -20 - (index % 3) * 8, 0],
            x: [
              0,
              index % 2 === 0 ? 14 : -14,
              0,
            ],
            opacity: [0.15, 0.62, 0.15],
            scale: [0.8, 1.25, 0.8],
          }}
          transition={{
            duration: 5 + (index % 5),
            repeat: Infinity,
            delay: index * 0.24,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function EntityNode({
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}: NodeProps<EntityNodeType>) {
  const theme = entityVisualTheme[data.type];

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.74,
        y: 18,
        filter: "blur(12px)",
      }}
      animate={{
        opacity: 1,
        scale: selected
          ? [1.02, 1.055, 1.02]
          : 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        opacity: {
          duration: 0.55,
        },
        y: {
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        },
        filter: {
          duration: 0.55,
        },
        scale: selected
          ? {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {
              duration: 0.28,
            },
      }}
      whileHover={{
        scale: selected ? 1.06 : 1.04,
        y: -7,
        rotateX: 2,
        rotateY: -2,
      }}
      className="group relative w-[244px]"
      style={{
        perspective: 900,
      }}
    >
      <motion.div
        animate={{
          rotate: 360,
          opacity: selected
            ? [0.42, 0.8, 0.42]
            : [0.12, 0.3, 0.12],
        }}
        transition={{
          rotate: {
            duration: selected ? 9 : 17,
            repeat: Infinity,
            ease: "linear",
          },
          opacity: {
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="pointer-events-none absolute -inset-[8px] rounded-[32px] blur-[12px]"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${theme.accent}, transparent, ${theme.secondary}, transparent)`,
        }}
      />

      <Handle
        type="target"
        position={targetPosition}
        style={{
          width: 10,
          height: 10,
          background: theme.accent,
          border: "2px solid #050814",
          boxShadow: `0 0 16px ${theme.glow}`,
          zIndex: 30,
        }}
      />

      <div
        className={`relative overflow-hidden rounded-[26px] border bg-[#050814]/88 p-2.5 shadow-[0_26px_70px_rgba(0,0,0,.38)] backdrop-blur-2xl transition duration-300 ${
          selected
            ? "ring-2 ring-white/20"
            : ""
        }`}
        style={{
          borderColor: theme.border,
          boxShadow: selected
            ? `0 28px 90px rgba(0,0,0,.48), 0 0 38px ${theme.glow}`
            : `0 24px 70px rgba(0,0,0,.38), 0 0 24px ${theme.accentSoft}`,
        }}
      >
        <BiologicalArtwork
          type={data.type}
          label={data.label}
          active={selected}
        />

        <div className="relative px-2 pb-2 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-[8px] font-bold uppercase tracking-[0.22em]"
                style={{
                  color: theme.accent,
                }}
              >
                {theme.label}
              </p>

              <p className="mt-1 max-w-[188px] text-[15px] font-semibold leading-5 tracking-[-0.025em] text-white">
                {data.label}
              </p>
            </div>

            <motion.span
              animate={{
                scale: [0.75, 1.35, 0.75],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: theme.accent,
                boxShadow: `0 0 14px ${theme.accent}`,
              }}
            />
          </div>

          <div
            className="mt-3 h-px w-full opacity-45"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.secondary}, transparent)`,
            }}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        style={{
          width: 10,
          height: 10,
          background: theme.secondary,
          border: "2px solid #050814",
          boxShadow: `0 0 16px ${theme.glow}`,
          zIndex: 30,
        }}
      />
    </motion.div>
  );
}


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

function BiologicalEdge({
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

const nodeTypes = {
  entity: EntityNode,
};

const edgeTypes = {
  biological: BiologicalEdge,
};

function convertApiGraphToFlowGraph(
  graph: ApiGraphResponse,
) {
  const nodes: EntityNodeType[] =
    graph.entities.map((entity) => ({
      id: entity.id,
      type: "entity",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        label: entity.label,
        type: entity.type,
        description: entity.description,
      },
    }));

  const validNodeIds = new Set(
    nodes.map((node) => node.id),
  );

  const edges: Edge[] = graph.relations
    .filter(
      (relation) =>
        validNodeIds.has(relation.source) &&
        validNodeIds.has(relation.target) &&
        relation.source !== relation.target,
    )
    .map((relation, index) => ({
      id: `${relation.source}-${relation.target}-${index}`,
      source: relation.source,
      target: relation.target,
      label: relation.label,
    }));

  return {
    nodes,
    edges,
  };
}

export default function ExplorePage() {
  const [showWorkspaceReveal, setShowWorkspaceReveal] =
    useState(true);

  const graphContainerRef =
    useRef<HTMLDivElement | null>(null);

  const [
    cinematicFocus,
    setCinematicFocus,
  ] = useState(false);

  const [
    cursorPosition,
    setCursorPosition,
  ] = useState({
    x: 50,
    y: 50,
  });

  const [demoMode, setDemoMode] =
    useState(false);

  const [narrativeOpen, setNarrativeOpen] =
    useState(false);

  const [narrativePlaying, setNarrativePlaying] =
    useState(false);

  const [narrativeIndex, setNarrativeIndex] =
    useState(0);

  const [demoScene, setDemoScene] =
    useState<DemoScene>("mechanism");

  const narrativeTimerRef =
    useRef<number | null>(null);

  const [sourceText, setSourceText] =
    useState("");

  const [selectedId, setSelectedId] =
    useState("");

  const [selectedEdgeId, setSelectedEdgeId] =
    useState<string | null>(null);

  const [hoveredId, setHoveredId] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchError, setSearchError] =
    useState("");

  const [layoutDirection, setLayoutDirection] =
    useState<LayoutDirection>("TB");

  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("loading");

  const [
    generationMessage,
    setGenerationMessage,
  ] = useState(
    "Analyzing research paragraph...",
  );

  const [apiError, setApiError] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState("");

  const [exportMenuOpen, setExportMenuOpen] =
    useState(false);

  const [expandingGraph, setExpandingGraph] =
    useState(false);

  const [hasSavedProject, setHasSavedProject] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [flowInstance, setFlowInstance] =
    useState<FlowInstance | null>(null);

  const [workspaceView, setWorkspaceView] =
    useState<WorkspaceView>("graph");

  const [copilotOpen, setCopilotOpen] =
    useState(false);

  const [copilotMode, setCopilotMode] =
    useState<CopilotMode>("explain");

  const [copilotQuestion, setCopilotQuestion] =
    useState("");

  const [copilotLoading, setCopilotLoading] =
    useState(false);

  const [copilotError, setCopilotError] =
    useState("");

  const [copilotMessages, setCopilotMessages] =
    useState<CopilotMessage[]>([]);

  const [pubMedPapers, setPubMedPapers] =
    useState<PubMedPaper[]>([]);

  const [pubMedLoading, setPubMedLoading] =
    useState(false);

  const [pubMedError, setPubMedError] =
    useState("");

  const [pubMedTotal, setPubMedTotal] =
    useState(0);

  const [pubMedPage, setPubMedPage] =
    useState(0);

  const [pubMedHasMore, setPubMedHasMore] =
    useState(false);

  const [pubMedSort, setPubMedSort] =
    useState<PaperSort>("relevance");

  const [
    pubMedLoadingMore,
    setPubMedLoadingMore,
  ] = useState(false);

  const [
    comparedPapers,
    setComparedPapers,
  ] = useState<PubMedPaper[]>([]);

  const [cellQuery, setCellQuery] =
    useState("");

  const [cellTerms, setCellTerms] =
    useState<CellOntologyTerm[]>([]);

  const [cellTotal, setCellTotal] =
    useState(0);

  const [cellPage, setCellPage] =
    useState(0);

  const [cellHasMore, setCellHasMore] =
    useState(false);

  const [cellLoading, setCellLoading] =
    useState(false);

  const [cellError, setCellError] =
    useState("");

  const [cellScope, setCellScope] =
    useState<CellOntologyScope>("cl");

  const [
    selectedAtlasTerm,
    setSelectedAtlasTerm,
  ] = useState<CellOntologyTerm | null>(
    null,
  );

  const [
    favoriteCellIds,
    setFavoriteCellIds,
  ] = useState<string[]>([]);

  const [selectedPaper, setSelectedPaper] =
    useState<PubMedPaper | null>(null);

  const [paperCopyMessage, setPaperCopyMessage] =
    useState("");

  const [nodes, setNodes, onNodesChange] =
    useNodesState<EntityNodeType>([]);

  const [edges, setEdges] =
    useState<Edge[]>([]);

  const [layers, setLayers] =
    useState<LayerState>({
      cell: true,
      protein: true,
      pathway: true,
      process: true,
      disease: true,
    });

  useEffect(() => {
    setHasSavedProject(
      hasSavedBioLayersProject(),
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function generateGraph() {
      const savedText =
        sessionStorage.getItem(
          "biolayers-input",
        ) ??
        "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and ECM remodeling.";

      setSourceText(savedText);
      setGenerationMode("loading");
      setGenerationMessage(
        "Analyzing research paragraph...",
      );
      setApiError("");

      const openAiEnabled =
        process.env
          .NEXT_PUBLIC_ENABLE_OPENAI ===
        "true";

      if (!openAiEnabled) {
        const fallbackGraph =
          buildGraphFromText(savedText);

        const layoutedFallback =
          layoutGraph(
            fallbackGraph.nodes,
            fallbackGraph.edges,
            "TB",
          );

        setNodes(
          layoutedFallback.nodes as EntityNodeType[],
        );
        setEdges(layoutedFallback.edges);

        if (
          layoutedFallback.nodes.length > 0
        ) {
          setSelectedId(
            layoutedFallback.nodes[0].id,
          );
        }

        setGenerationMode("fallback");
        setGenerationMessage(
          "Local analysis mode",
        );

        return;
      }

      try {
        const response = await fetch(
          "/api/generate-graph",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              text: savedText,
            }),
            signal: controller.signal,
          },
        );

        const result =
          (await response.json()) as ApiGraphResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "The AI graph request failed.",
          );
        }

        if (
          !Array.isArray(result.entities) ||
          result.entities.length < 2
        ) {
          throw new Error(
            "The AI did not return enough biological entities.",
          );
        }

        setGenerationMessage(
          "Building the interactive graph...",
        );

        const flowGraph =
          convertApiGraphToFlowGraph(result);

        const layoutedGraph = layoutGraph(
          flowGraph.nodes,
          flowGraph.edges,
          "TB",
        );

        setNodes(
          layoutedGraph.nodes as EntityNodeType[],
        );
        setEdges(layoutedGraph.edges);

        if (layoutedGraph.nodes.length > 0) {
          setSelectedId(
            layoutedGraph.nodes[0].id,
          );
        }

        setGenerationMode("ai");
        setGenerationMessage(
          "AI-generated knowledge graph",
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "AI generation failed.";

        setApiError(message);

        const fallbackGraph =
          buildGraphFromText(savedText);

        const layoutedFallback =
          layoutGraph(
            fallbackGraph.nodes,
            fallbackGraph.edges,
            "TB",
          );

        setNodes(
          layoutedFallback.nodes as EntityNodeType[],
        );
        setEdges(layoutedFallback.edges);

        if (
          layoutedFallback.nodes.length > 0
        ) {
          setSelectedId(
            layoutedFallback.nodes[0].id,
          );
        }

        setGenerationMode("fallback");
        setGenerationMessage(
          "Local knowledge graph",
        );
      }
    }

    void generateGraph();

    return () => {
      controller.abort();
    };
  }, [setNodes]);

  useEffect(() => {
    if (
      !flowInstance ||
      nodes.length === 0 ||
      generationMode === "loading"
    ) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        void flowInstance.fitView({
          padding: 0.22,
          minZoom: 0.4,
          maxZoom: 1.15,
          duration: 600,
        });
      },
      120,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    flowInstance,
    nodes.length,
    generationMode,
  ]);

  const visibleNodes = useMemo(() => {
    return nodes.filter(
      (node) => layers[node.data.type],
    );
  }, [nodes, layers]);

  const visibleNodeIds = useMemo(() => {
    return new Set(
      visibleNodes.map((node) => node.id),
    );
  }, [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) &&
        visibleNodeIds.has(edge.target),
    );
  }, [edges, visibleNodeIds]);

  const connectedNodeIds = useMemo(() => {
    if (!hoveredId) {
      return new Set<string>();
    }

    const relatedIds = new Set<string>([
      hoveredId,
    ]);

    visibleEdges.forEach((edge) => {
      if (edge.source === hoveredId) {
        relatedIds.add(edge.target);
      }

      if (edge.target === hoveredId) {
        relatedIds.add(edge.source);
      }
    });

    return relatedIds;
  }, [hoveredId, visibleEdges]);

  const displayNodes = useMemo(() => {
    return visibleNodes.map((node) => {
      const isRelated =
        !hoveredId ||
        connectedNodeIds.has(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isRelated ? 1 : 0.22,
          transition:
            "opacity 180ms ease",
        },
      };
    });
  }, [
    visibleNodes,
    hoveredId,
    connectedNodeIds,
    cinematicFocus,
    narrativeOpen,
    demoMode,
  ]);

  const displayEdges = useMemo(() => {
    return visibleEdges.map((edge) => {
      const isConnected =
        hoveredId === edge.source ||
        hoveredId === edge.target;

      const isSelected =
        selectedEdgeId === edge.id;

      const shouldDim =
        (Boolean(hoveredId) &&
          !isConnected) ||
        (Boolean(selectedEdgeId) &&
          !isSelected);

      const highlighted =
        isConnected || isSelected;

      return {
        ...edge,
        type: "biological",
        data: {
          ...(typeof edge.data === "object" &&
          edge.data !== null
            ? edge.data
            : {}),
          evidenceCount:
            pubMedPapers.length,
        },

        animated: false,

        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: highlighted
            ? "#67e8f9"
            : "#64748b",
        },

        style: {
          stroke: highlighted
            ? "#67e8f9"
            : "#64748b",
          strokeWidth: isSelected
            ? 4.2
            : isConnected
              ? 3.4
              : 2.2,
          opacity: shouldDim ? 0.1 : 1,
          cursor: "pointer",
        },

        labelStyle: {
          fill: highlighted
            ? "#a5f3fc"
            : "#94a3b8",
          fontSize: isSelected ? 13 : 12,
          fontWeight: 700,
        },

        labelBgStyle: {
          fill: "#07111f",
          fillOpacity: shouldDim
            ? 0.12
            : 0.94,
        },

        labelBgPadding: [6, 4] as [
          number,
          number,
        ],

        labelBgBorderRadius: 8,
      };
    });
  }, [
    visibleEdges,
    hoveredId,
    selectedEdgeId,,
    pubMedPapers.length,
  ]);

  const selectedEdge = edges.find(
    (edge) => edge.id === selectedEdgeId,
  );

  const selectedEdgeSource = selectedEdge
    ? nodes.find(
        (node) =>
          node.id === selectedEdge.source,
      )
    : undefined;

  const selectedEdgeTarget = selectedEdge
    ? nodes.find(
        (node) =>
          node.id === selectedEdge.target,
      )
    : undefined;

  const selectedEdgeLabel =
    selectedEdge &&
    typeof selectedEdge.label === "string"
      ? selectedEdge.label
      : "connected to";

  const selectedNode = nodes.find(
    (node) => node.id === selectedId,
  );

  const selectedEntity: EntityData =
    selectedNode
      ? selectedNode.data
      : {
          label: "Nothing selected",
          type: "process",
          description:
            "Click a node in the graph to inspect its biological role.",
        };

  const relatedConnections =
    useMemo<RelatedConnection[]>(() => {
      if (!selectedNode) {
        return [];
      }

      const related: RelatedConnection[] = [];

      visibleEdges.forEach((edge) => {
        if (edge.source === selectedNode.id) {
          const targetNode = nodes.find(
            (node) => node.id === edge.target,
          );

          if (targetNode) {
            related.push({
              nodeId: targetNode.id,
              label: targetNode.data.label,
              type: targetNode.data.type,
              relation:
                typeof edge.label === "string"
                  ? edge.label
                  : "connected to",
              direction: "outgoing",
            });
          }
        }

        if (edge.target === selectedNode.id) {
          const sourceNode = nodes.find(
            (node) => node.id === edge.source,
          );

          if (sourceNode) {
            related.push({
              nodeId: sourceNode.id,
              label: sourceNode.data.label,
              type: sourceNode.data.type,
              relation:
                typeof edge.label === "string"
                  ? edge.label
                  : "connected to",
              direction: "incoming",
            });
          }
        }
      });

      return related;
    }, [selectedNode, visibleEdges, nodes]);

  const narrativeSteps =
    useMemo<NarrativeStep[]>(() => {
      if (nodes.length === 0) {
        return [];
      }

      const nodeById = new Map(
        nodes.map((node) => [
          node.id,
          node,
        ]),
      );

      const outgoing = new Map<
        string,
        Edge[]
      >();

      for (const edge of edges) {
        const current =
          outgoing.get(edge.source) ?? [];

        current.push(edge);
        outgoing.set(
          edge.source,
          current,
        );
      }

      const startNode =
        nodes.find((node) =>
          node.data.label
            .toLowerCase()
            .includes("fibroblast"),
        ) ??
        nodes.find(
          (node) =>
            node.data.type === "cell",
        ) ??
        nodes[0];

      const steps: NarrativeStep[] = [];
      const visited = new Set<string>();
      let currentNodeId = startNode?.id;

      for (
        let index = 0;
        index < Math.min(
          nodes.length,
          7,
        );
        index += 1
      ) {
        if (!currentNodeId) {
          break;
        }

        const currentNode =
          nodeById.get(currentNodeId);

        if (
          !currentNode ||
          visited.has(currentNode.id)
        ) {
          break;
        }

        visited.add(currentNode.id);

        const outgoingEdge =
          (outgoing.get(
            currentNode.id,
          ) ?? []).find(
            (edge) =>
              !visited.has(edge.target),
          );

        const incomingEdge =
          edges.find(
            (edge) =>
              edge.target ===
                currentNode.id &&
              !visited.has(edge.source),
          );

        const nextEdge =
          outgoingEdge ?? incomingEdge;

        const relation =
          nextEdge &&
          typeof nextEdge.label ===
            "string"
            ? nextEdge.label
            : "biological role";

        steps.push({
          id: `narrative-${currentNode.id}-${index}`,
          nodeId: currentNode.id,
          edgeId:
            nextEdge?.id ?? null,
          title:
            currentNode.data.label,
          relation,
          explanation:
            currentNode.data.description ||
            `${currentNode.data.label} participates in the current biological mechanism.`,
        });

        if (!nextEdge) {
          break;
        }

        currentNodeId =
          nextEdge.source ===
          currentNode.id
            ? nextEdge.target
            : nextEdge.source;
      }

      return steps;
    }, [nodes, edges]);

  const activeNarrativeStep =
    narrativeSteps[
      Math.min(
        narrativeIndex,
        Math.max(
          narrativeSteps.length - 1,
          0,
        ),
      )
    ];

  useEffect(() => {
    if (
      !narrativePlaying ||
      narrativeSteps.length === 0
    ) {
      if (
        narrativeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          narrativeTimerRef.current,
        );
        narrativeTimerRef.current =
          null;
      }

      return;
    }

    narrativeTimerRef.current =
      window.setTimeout(() => {
        setNarrativeIndex(
          (current) => {
            if (
              current >=
              narrativeSteps.length - 1
            ) {
              setNarrativePlaying(
                false,
              );
              return current;
            }

            return current + 1;
          },
        );
      }, 4200);

    return () => {
      if (
        narrativeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          narrativeTimerRef.current,
        );
        narrativeTimerRef.current =
          null;
      }
    };
  }, [
    narrativePlaying,
    narrativeIndex,
    narrativeSteps.length,
  ]);

  useEffect(() => {
    if (
      !narrativeOpen ||
      !activeNarrativeStep
    ) {
      return;
    }

    const node = nodes.find(
      (item) =>
        item.id ===
        activeNarrativeStep.nodeId,
    );

    if (!node || !flowInstance) {
      return;
    }

    setSelectedId(node.id);
    setSelectedEdgeId(
      activeNarrativeStep.edgeId,
    );
    setHoveredId(node.id);
    setCinematicFocus(true);

    const width =
      node.measured?.width ?? 244;
    const height =
      node.measured?.height ?? 170;

    void flowInstance.setCenter(
      node.position.x + width / 2,
      node.position.y + height / 2,
      {
        zoom: demoMode
          ? 1.7
          : 1.5,
        duration: 1050,
      },
    );
  }, [
    narrativeOpen,
    narrativeIndex,
    activeNarrativeStep,
    nodes,
    flowInstance,
    demoMode,
  ]);

  useEffect(() => {
    return () => {
      if (
        narrativeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          narrativeTimerRef.current,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      setPubMedPapers([]);
      setPubMedError("");
      setPubMedLoading(false);

      return;
    }

    const selectedLabel =
      selectedNode.data.label;

    const controller =
      new AbortController();

    async function loadPubMedPapers() {
      setPubMedLoading(true);
      setPubMedError("");

      try {
        const response = await fetch(
          `/api/pubmed?q=${encodeURIComponent(
            selectedLabel,
          )}&page=0&pageSize=20&sort=${pubMedSort}`,
          {
            signal: controller.signal,
          },
        );

        const result =
          (await response.json()) as PubMedResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not retrieve PubMed papers.",
          );
        }

        const papers = Array.isArray(
          result.papers,
        )
          ? result.papers
          : [];

        setPubMedPapers(papers);
        setPubMedTotal(
          typeof result.total === "number"
            ? result.total
            : papers.length,
        );
        setPubMedPage(0);
        setPubMedHasMore(
          Boolean(result.hasMore),
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setPubMedPapers([]);

        setPubMedError(
          error instanceof Error
            ? error.message
            : "Could not retrieve PubMed papers.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setPubMedLoading(false);
        }
      }
    }

    void loadPubMedPapers();

    return () => {
      controller.abort();
    };
  }, [selectedNode, pubMedSort]);

  async function focusNode(nodeId: string) {
    const targetNode = nodes.find(
      (node) => node.id === nodeId,
    );

    if (!targetNode || !flowInstance) {
      return;
    }

    setSelectedId(targetNode.id);
    setSelectedEdgeId(null);
    setHoveredId(null);

    const width =
      targetNode.measured?.width ?? 220;

    const height =
      targetNode.measured?.height ?? 80;

    await flowInstance.setCenter(
      targetNode.position.x + width / 2,
      targetNode.position.y + height / 2,
      {
        zoom: 1.35,
        duration: 650,
      },
    );
  }

  async function askCopilot(
    requestedMode: CopilotMode = copilotMode,
    questionOverride?: string,
  ) {
    if (!selectedNode) {
      setCopilotError(
        "Select an entity before asking BioLayers Copilot.",
      );
      setCopilotOpen(true);
      return;
    }

    const question =
      typeof questionOverride === "string"
        ? questionOverride.trim()
        : copilotQuestion.trim();

    if (
      requestedMode === "custom" &&
      question.length < 3
    ) {
      setCopilotError(
        "Enter a question containing at least 3 characters.",
      );
      setCopilotOpen(true);
      return;
    }

    setCopilotOpen(true);
    setCopilotLoading(true);
    setCopilotError("");

    const userText =
      requestedMode === "custom"
        ? question
        : {
            explain:
              "Explain this entity in the current cancer-biology context.",
            mechanism:
              "Describe the mechanism involving this entity.",
            hypothesis:
              "Generate one grounded, testable research hypothesis.",
            limitations:
              "Assess the limitations of the available evidence.",
            simplify:
              "Explain this entity in accurate, simple language.",
          }[requestedMode];

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
    };

    setCopilotMessages((current) => [
      ...current,
      userMessage,
    ]);

    try {
      const response = await fetch(
        "/api/copilot",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            mode: requestedMode,
            question,
            sourceText,
            selectedEntity: {
              id: selectedNode.id,
              label:
                selectedEntity.label,
              type:
                selectedEntity.type,
              description:
                selectedEntity.description,
            },
            connections:
              relatedConnections,
            papers: pubMedPapers,
          }),
        },
      );

      const result =
        (await response.json()) as CopilotResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "BioLayers Copilot could not answer.",
        );
      }

      const assistantMessage: CopilotMessage =
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          title: result.title,
          content: result.answer,
          keyPoints: Array.isArray(
            result.keyPoints,
          )
            ? result.keyPoints
            : [],
          limitations: Array.isArray(
            result.limitations,
          )
            ? result.limitations
            : [],
          followUpQuestions:
            Array.isArray(
              result.followUpQuestions,
            )
              ? result.followUpQuestions
              : [],
          citations: Array.isArray(
            result.citations,
          )
            ? result.citations
            : [],
        };

      setCopilotMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setCopilotQuestion("");
      setCopilotMode(requestedMode);
    } catch (error) {
      setCopilotError(
        error instanceof Error
          ? error.message
          : "BioLayers Copilot could not answer.",
      );
    } finally {
      setCopilotLoading(false);
    }
  }

  const cellAtlasPresets = [
    {
      label: "Fibroblasts",
      query: "fibroblast",
      description:
        "Stromal cells involved in extracellular matrix production and tissue remodeling.",
    },
    {
      label: "T cells",
      query: "T cell",
      description:
        "Adaptive immune cells including helper, cytotoxic and regulatory populations.",
    },
    {
      label: "Macrophages",
      query: "macrophage",
      description:
        "Innate immune cells involved in phagocytosis, inflammation and tissue repair.",
    },
    {
      label: "Endothelial",
      query: "endothelial cell",
      description:
        "Cells that line blood and lymphatic vessels.",
    },
    {
      label: "Osteoblasts",
      query: "osteoblast",
      description:
        "Bone-forming cells responsible for osteoid production and mineralization.",
    },
    {
      label: "Osteoclasts",
      query: "osteoclast",
      description:
        "Multinucleated bone-resorbing cells of the monocyte lineage.",
    },
    {
      label: "Epithelial",
      query: "epithelial cell",
      description:
        "Barrier and glandular cells covering surfaces and forming organs.",
    },
    {
      label: "Stem cells",
      query: "stem cell",
      description:
        "Self-renewing cells capable of differentiation into specialized lineages.",
    },
  ] as const;

  function getCellAccent(
    label: string,
  ): {
    from: string;
    via: string;
    to: string;
    text: string;
    border: string;
  } {
    const normalized =
      label.toLowerCase();

    if (
      normalized.includes("t cell") ||
      normalized.includes("lymphocyte")
    ) {
      return {
        from: "rgba(59,130,246,.22)",
        via: "rgba(34,211,238,.12)",
        to: "rgba(6,182,212,.04)",
        text: "text-sky-200",
        border: "border-sky-300/20",
      };
    }

    if (
      normalized.includes("macrophage") ||
      normalized.includes("monocyte")
    ) {
      return {
        from: "rgba(245,158,11,.22)",
        via: "rgba(251,113,133,.1)",
        to: "rgba(120,53,15,.04)",
        text: "text-amber-200",
        border: "border-amber-300/20",
      };
    }

    if (
      normalized.includes("osteoblast") ||
      normalized.includes("osteoclast") ||
      normalized.includes("bone")
    ) {
      return {
        from: "rgba(244,244,245,.17)",
        via: "rgba(147,197,253,.11)",
        to: "rgba(71,85,105,.04)",
        text: "text-slate-100",
        border: "border-slate-200/20",
      };
    }

    if (
      normalized.includes("endothelial") ||
      normalized.includes("vascular")
    ) {
      return {
        from: "rgba(244,63,94,.2)",
        via: "rgba(236,72,153,.1)",
        to: "rgba(127,29,29,.04)",
        text: "text-rose-200",
        border: "border-rose-300/20",
      };
    }

    if (
      normalized.includes("fibroblast") ||
      normalized.includes("stromal")
    ) {
      return {
        from: "rgba(45,212,191,.22)",
        via: "rgba(34,211,238,.11)",
        to: "rgba(15,118,110,.04)",
        text: "text-teal-200",
        border: "border-teal-300/20",
      };
    }

    if (
      normalized.includes("stem") ||
      normalized.includes("progenitor")
    ) {
      return {
        from: "rgba(168,85,247,.22)",
        via: "rgba(217,70,239,.1)",
        to: "rgba(88,28,135,.04)",
        text: "text-violet-200",
        border: "border-violet-300/20",
      };
    }

    return {
      from: "rgba(34,211,238,.2)",
      via: "rgba(139,92,246,.1)",
      to: "rgba(8,145,178,.04)",
      text: "text-cyan-200",
      border: "border-cyan-300/20",
    };
  }

  function toggleFavoriteCell(
    term: CellOntologyTerm,
  ) {
    setFavoriteCellIds((current) =>
      current.includes(term.id)
        ? current.filter(
            (id) => id !== term.id,
          )
        : [...current, term.id],
    );
  }

  function openCellAtlasTerm(
    term: CellOntologyTerm,
  ) {
    setSelectedAtlasTerm(term);
  }

  async function searchCellPreset(
    query: string,
  ) {
    setCellQuery(query);

    setCellLoading(true);
    setCellError("");

    try {
      const result = await searchCells({
        query,
        page: 0,
        pageSize: 20,
        ontology: cellScope,
      });

      const incoming = Array.isArray(
        result.terms,
      )
        ? result.terms
        : [];

      setCellTerms(incoming);
      setCellTotal(
        typeof result.total === "number"
          ? result.total
          : incoming.length,
      );
      setCellPage(0);
      setCellHasMore(
        Boolean(result.hasMore),
      );
    } catch (error) {
      setCellError(
        error instanceof Error
          ? error.message
          : "Could not search cells.",
      );
    } finally {
      setCellLoading(false);
    }
  }

  async function loadMorePubMed() {
    if (
      !selectedNode ||
      pubMedLoadingMore ||
      !pubMedHasMore
    ) {
      return;
    }

    const nextPage = pubMedPage + 1;

    setPubMedLoadingMore(true);

    try {
      const response = await fetch(
        `/api/pubmed?q=${encodeURIComponent(
          selectedNode.data.label,
        )}&page=${nextPage}&pageSize=20&sort=${pubMedSort}`,
      );

      const result =
        (await response.json()) as PubMedResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not load more papers.",
        );
      }

      const incoming = Array.isArray(
        result.papers,
      )
        ? result.papers
        : [];

      setPubMedPapers((current) => {
        const ids = new Set(
          current.map(
            (paper) => paper.pmid,
          ),
        );

        return [
          ...current,
          ...incoming.filter(
            (paper) =>
              !ids.has(paper.pmid),
          ),
        ];
      });

      setPubMedPage(nextPage);
      setPubMedHasMore(
        Boolean(result.hasMore),
      );

      if (
        typeof result.total === "number"
      ) {
        setPubMedTotal(result.total);
      }
    } catch (error) {
      setPubMedError(
        error instanceof Error
          ? error.message
          : "Could not load more papers.",
      );
    } finally {
      setPubMedLoadingMore(false);
    }
  }

  function togglePaperComparison(
    paper: PubMedPaper,
  ) {
    setComparedPapers((current) => {
      if (
        current.some(
          (item) =>
            item.pmid === paper.pmid,
        )
      ) {
        return current.filter(
          (item) =>
            item.pmid !== paper.pmid,
        );
      }

      return current.length >= 2
        ? [current[1], paper]
        : [...current, paper];
    });
  }

  async function runCellSearch(
    page = 0,
    append = false,
  ) {
    const query = cellQuery.trim();

    if (query.length < 2) {
      setCellError(
        "Enter at least 2 characters.",
      );
      return;
    }

    setCellLoading(true);
    setCellError("");

    try {
      const result = await searchCells({
        query,
        page,
        pageSize: 20,
        ontology: cellScope,
      });

      const incoming = Array.isArray(
        result.terms,
      )
        ? result.terms
        : [];

      setCellTerms((current) =>
        append
          ? mergeUniqueById(
              current,
              incoming,
            )
          : incoming,
      );

      setCellTotal(
        typeof result.total === "number"
          ? result.total
          : incoming.length,
      );
      setCellPage(page);
      setCellHasMore(
        Boolean(result.hasMore),
      );
    } catch (error) {
      setCellError(
        error instanceof Error
          ? error.message
          : "Could not search cells.",
      );
    } finally {
      setCellLoading(false);
    }
  }

  async function addCellToGraph(
    term: CellOntologyTerm,
  ) {
    const nodeId =
      term.id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `cell-${Date.now()}`;

    const existing = nodes.find(
      (node) =>
        node.id === nodeId ||
        node.data.label.toLowerCase() ===
          term.label.toLowerCase(),
    );

    if (existing) {
      setWorkspaceView("graph");
      await focusNode(existing.id);
      return;
    }

    const anchorNode =
      selectedNode ?? nodes[0];

    const newNode: EntityNodeType = {
      id: nodeId,
      type: "entity",
      position: {
        x:
          (anchorNode?.position.x ??
            0) + 280,
        y:
          (anchorNode?.position.y ??
            0) + 120,
      },
      data: {
        label: term.label,
        type: "cell",
        description:
          term.description ||
          `${term.label} is a standardized class from ${term.ontologyLabel} (${term.id}).`,
      },
    };

    setNodes((current) => [
      ...current,
      newNode,
    ]);

    if (anchorNode) {
      setEdges((current) => [
        ...current,
        {
          id: `${anchorNode.id}-${nodeId}-ontology`,
          source: anchorNode.id,
          target: nodeId,
          label: "related-cell-type",
          type: "biological",
        },
      ]);
    }

    setSelectedId(nodeId);
    setSelectedEdgeId(null);
    setWorkspaceView("graph");
  }

  function openPaperInspector(
    paper: PubMedPaper,
  ) {
    setSelectedPaper(paper);
    setPaperCopyMessage("");
  }

  async function copyPaperIdentifier(
    value: string,
    label: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setPaperCopyMessage(
        `${label} copied`,
      );

      window.setTimeout(() => {
        setPaperCopyMessage("");
      }, 1800);
    } catch {
      setPaperCopyMessage(
        `Could not copy ${label}`,
      );
    }
  }

  function startNarrative() {
    if (narrativeSteps.length === 0) {
      return;
    }

    setWorkspaceView("graph");
    setNarrativeIndex(0);
    setNarrativeOpen(true);
    setNarrativePlaying(true);
    setDemoScene("mechanism");
  }

  function pauseNarrative() {
    setNarrativePlaying(false);
  }

  function resumeNarrative() {
    if (
      narrativeSteps.length === 0
    ) {
      return;
    }

    if (
      narrativeIndex >=
      narrativeSteps.length - 1
    ) {
      setNarrativeIndex(0);
    }

    setNarrativePlaying(true);
  }

  function nextNarrativeStep() {
    setNarrativePlaying(false);
    setNarrativeIndex(
      (current) =>
        Math.min(
          current + 1,
          Math.max(
            narrativeSteps.length - 1,
            0,
          ),
        ),
    );
  }

  function previousNarrativeStep() {
    setNarrativePlaying(false);
    setNarrativeIndex(
      (current) =>
        Math.max(current - 1, 0),
    );
  }

  function restartNarrative() {
    setNarrativeIndex(0);
    setNarrativePlaying(true);
  }

  async function closeNarrative() {
    setNarrativePlaying(false);
    setNarrativeOpen(false);
    setSelectedEdgeId(null);
    setHoveredId(null);
    setCinematicFocus(false);

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.38,
      maxZoom: 1.12,
      duration: 850,
    });
  }

  async function toggleDemoMode() {
    const next = !demoMode;

    setDemoMode(next);

    if (next) {
      setWorkspaceView("graph");

      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      await flowInstance?.fitView({
        padding: 0.16,
        minZoom: 0.42,
        maxZoom: 1.2,
        duration: 850,
      });
    }
  }

  function activateDemoScene(
    scene: DemoScene,
  ) {
    setDemoScene(scene);

    if (scene === "problem") {
      setWorkspaceView("pubmed");
      setNarrativePlaying(false);
      return;
    }

    if (scene === "mechanism") {
      startNarrative();
      return;
    }

    if (scene === "evidence") {
      setWorkspaceView("evidence");
      setNarrativePlaying(false);
      return;
    }

    if (scene === "cells") {
      setWorkspaceView("cells");
      setNarrativePlaying(false);
      return;
    }

    setWorkspaceView("graph");
    setNarrativePlaying(false);
    setNarrativeOpen(false);
  }

  async function enterCinematicFocus() {
    if (!selectedNode || !flowInstance) {
      return;
    }

    setCinematicFocus(true);
    setSelectedEdgeId(null);
    setHoveredId(selectedNode.id);

    const width =
      selectedNode.measured?.width ??
      244;

    const height =
      selectedNode.measured?.height ??
      170;

    await flowInstance.setCenter(
      selectedNode.position.x +
        width / 2,
      selectedNode.position.y +
        height / 2,
      {
        zoom: 1.65,
        duration: 1200,
      },
    );
  }

  async function exitCinematicFocus() {
    setCinematicFocus(false);
    setHoveredId(null);

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.38,
      maxZoom: 1.12,
      duration: 950,
    });
  }

  function toggleLayer(type: EntityType) {
    setLayers((currentLayers) => ({
      ...currentLayers,
      [type]: !currentLayers[type],
    }));
  }

  function saveCurrentProject() {
    if (nodes.length === 0) {
      setSaveMessage(
        "There is no graph to save.",
      );
      return;
    }

    saveBioLayersProject({
      version: 1,
      name: `BioLayers project — ${new Date().toLocaleDateString()}`,
      sourceText,
      nodes,
      edges,
      layers,
      layoutDirection,
      selectedId,
      savedAt: new Date().toISOString(),
    });

    setHasSavedProject(true);
    setSaveMessage("Project saved.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  }

  async function restoreSavedProject() {
    const project = loadBioLayersProject();

    if (!project) {
      setSaveMessage(
        "No valid saved project was found.",
      );
      return;
    }

    setHoveredId(null);
    setSelectedEdgeId(null);
    setSourceText(project.sourceText);
    setNodes(
      project.nodes as EntityNodeType[],
    );
    setEdges(project.edges);
    setLayers(project.layers);
    setLayoutDirection(
      project.layoutDirection,
    );
    setSelectedId(project.selectedId);

    sessionStorage.setItem(
      "biolayers-input",
      project.sourceText,
    );

    setGenerationMode("saved");
    setGenerationMessage(
      "Restored saved project",
    );
    setApiError("");
    setSaveMessage("Project restored.");

    await new Promise((resolve) =>
      setTimeout(resolve, 120),
    );

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.4,
      maxZoom: 1.15,
      duration: 650,
    });
  }

  function deleteSavedProject() {
    deleteBioLayersProject();
    setHasSavedProject(false);
    setSaveMessage("Saved project deleted.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  }

  async function findEntity() {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      setSearchError(
        "Enter an entity name.",
      );
      return;
    }

    const matchedNode = nodes.find(
      (node) =>
        node.data.label
          .toLowerCase()
          .includes(normalizedQuery),
    );

    if (!matchedNode || !flowInstance) {
      setSearchError(
        "No matching entity was found.",
      );
      return;
    }

    setSearchError("");
    setSelectedEdgeId(null);
    setSelectedId(matchedNode.id);

    const width =
      matchedNode.measured?.width ?? 220;

    const height =
      matchedNode.measured?.height ?? 80;

    await flowInstance.setCenter(
      matchedNode.position.x + width / 2,
      matchedNode.position.y + height / 2,
      {
        zoom: 1.35,
        duration: 650,
      },
    );
  }

  async function resetView() {
    setHoveredId(null);
    setSelectedEdgeId(null);
    setSearchQuery("");
    setSearchError("");

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.4,
      maxZoom: 1.15,
      duration: 650,
    });
  }

  async function changeLayout(
    nextDirection: LayoutDirection,
  ) {
    if (
      nextDirection === layoutDirection
    ) {
      return;
    }

    setHoveredId(null);
    setSelectedEdgeId(null);
    setLayoutDirection(nextDirection);

    const layoutedGraph = layoutGraph(
      nodes,
      edges,
      nextDirection,
    );

    setNodes(
      layoutedGraph.nodes as EntityNodeType[],
    );
    setEdges(layoutedGraph.edges);

    await new Promise((resolve) =>
      setTimeout(resolve, 120),
    );

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.4,
      maxZoom: 1.15,
      duration: 650,
    });
  }

  async function exportGraphAsPng() {
    if (
      !graphContainerRef.current ||
      !flowInstance
    ) {
      setExportError(
        "The graph is not ready yet.",
      );
      return;
    }

    try {
      setExporting(true);
      setExportError("");
      setHoveredId(null);

      await flowInstance.fitView({
        padding: 0.16,
        minZoom: 0.4,
        maxZoom: 1.1,
        duration: 300,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 380),
      );

      const dataUrl = await toPng(
        graphContainerRef.current,
        {
          backgroundColor: "#050816",
          cacheBust: true,
          pixelRatio: 2,
          filter: (element) => {
            if (
              !(element instanceof HTMLElement)
            ) {
              return true;
            }

            return (
              element.dataset.exportIgnore !==
              "true"
            );
          },
        },
      );

      const link =
        document.createElement("a");

      link.download = `biolayers-graph-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExportMenuOpen(false);
    } catch {
      setExportError(
        "Could not export the graph.",
      );
    } finally {
      setExporting(false);
    }
  }

  function downloadTextFile(
    filename: string,
    content: string,
    mimeType: string,
  ) {
    const blob = new Blob([content], {
      type: mimeType,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function exportGraphAsJson() {
    const payload = {
      schema: "biolayers-knowledge-graph/v1",
      exportedAt: new Date().toISOString(),
      sourceText,
      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.data.label,
        type: node.data.type,
        description:
          node.data.description,
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label:
          typeof edge.label === "string"
            ? edge.label
            : "connected-to",
      })),
      evidence: {
        selectedEntity:
          selectedNode?.data.label ??
          null,
        loadedPubMedRecords:
          pubMedPapers.length,
        papers: pubMedPapers,
      },
    };

    downloadTextFile(
      `biolayers-graph-${Date.now()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );

    setExportMenuOpen(false);
  }

  function escapeXml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function exportGraphAsGraphMl() {
    const nodeXml = nodes
      .map(
        (node) => `    <node id="${escapeXml(
          node.id,
        )}">
      <data key="label">${escapeXml(
          node.data.label,
        )}</data>
      <data key="type">${escapeXml(
          node.data.type,
        )}</data>
      <data key="description">${escapeXml(
          node.data.description,
        )}</data>
    </node>`,
      )
      .join("\\n");

    const edgeXml = edges
      .map(
        (edge) => `    <edge id="${escapeXml(
          edge.id,
        )}" source="${escapeXml(
          edge.source,
        )}" target="${escapeXml(
          edge.target,
        )}">
      <data key="relation">${escapeXml(
          typeof edge.label === "string"
            ? edge.label
            : "connected-to",
        )}</data>
    </edge>`,
      )
      .join("\\n");

    const graphMl = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="description" for="node" attr.name="description" attr.type="string"/>
  <key id="relation" for="edge" attr.name="relation" attr.type="string"/>
  <graph id="BioLayers" edgedefault="directed">
${nodeXml}
${edgeXml}
  </graph>
</graphml>`;

    downloadTextFile(
      `biolayers-graph-${Date.now()}.graphml`,
      graphMl,
      "application/graphml+xml",
    );

    setExportMenuOpen(false);
  }

  async function expandSelectedEntity() {
    if (!selectedNode || expandingGraph) {
      return;
    }

    setExpandingGraph(true);

    const normalized =
      selectedNode.data.label.toLowerCase();

    const templates: Array<{
      label: string;
      type: EntityType;
      relation: string;
      description: string;
    }> = normalized.includes("fibroblast")
      ? [
          {
            label: "Extracellular matrix",
            type: "process",
            relation: "remodels",
            description:
              "The extracellular matrix provides structural and signaling context for tumor progression.",
          },
          {
            label: "TGF-beta signaling",
            type: "pathway",
            relation: "activated-by",
            description:
              "TGF-beta signaling is commonly associated with fibroblast activation and stromal remodeling.",
          },
          {
            label: "CXCR4",
            type: "protein",
            relation: "signals-through",
            description:
              "CXCR4 is a chemokine receptor that can respond to CXCL12 signaling.",
          },
        ]
      : normalized.includes("bone")
        ? [
            {
              label: "Osteoblast",
              type: "cell",
              relation: "forms",
              description:
                "Osteoblasts produce bone matrix and regulate mineralization.",
            },
            {
              label: "Osteoclast",
              type: "cell",
              relation: "resorbs",
              description:
                "Osteoclasts are specialized cells responsible for bone resorption.",
            },
            {
              label: "Bone remodeling",
              type: "process",
              relation: "undergoes",
              description:
                "Bone remodeling coordinates formation and resorption in the skeletal niche.",
            },
          ]
        : normalized.includes("cxcl12")
          ? [
              {
                label: "CXCR4",
                type: "protein",
                relation: "binds",
                description:
                  "CXCR4 is a principal receptor for the chemokine CXCL12.",
              },
              {
                label: "Cell migration",
                type: "process",
                relation: "promotes",
                description:
                  "Chemokine gradients can guide directional cell migration.",
              },
              {
                label: "Chemotaxis",
                type: "process",
                relation: "regulates",
                description:
                  "Chemotaxis is directed cellular movement along a chemical gradient.",
              },
            ]
          : [
              {
                label: `${selectedNode.data.label} signaling`,
                type: "pathway",
                relation: "participates-in",
                description:
                  `A contextual signaling layer connected to ${selectedNode.data.label}.`,
              },
              {
                label: `${selectedNode.data.label} regulation`,
                type: "process",
                relation: "regulates",
                description:
                  `A regulatory process associated with ${selectedNode.data.label}.`,
              },
            ];

    const existingLabels = new Set(
      nodes.map((node) =>
        node.data.label.toLowerCase(),
      ),
    );

    const additions = templates.filter(
      (item) =>
        !existingLabels.has(
          item.label.toLowerCase(),
        ),
    );

    if (additions.length === 0) {
      setExpandingGraph(false);
      return;
    }

    const radius = 340;
    const newNodes: EntityNodeType[] =
      additions.map((item, index) => {
        const angle =
          (Math.PI * 2 * index) /
            additions.length -
          Math.PI / 2;

        const id = `${item.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}-${Date.now()}-${index}`;

        return {
          id,
          type: "entity",
          position: {
            x:
              selectedNode.position.x +
              Math.cos(angle) * radius,
            y:
              selectedNode.position.y +
              Math.sin(angle) * radius,
          },
          data: {
            label: item.label,
            type: item.type,
            description:
              item.description,
          },
        };
      });

    const newEdges: Edge[] =
      newNodes.map((node, index) => ({
        id: `${selectedNode.id}-${node.id}`,
        source: selectedNode.id,
        target: node.id,
        label:
          additions[index].relation,
        type: "biological",
      }));

    setNodes((current) => [
      ...current,
      ...newNodes,
    ]);
    setEdges((current) => [
      ...current,
      ...newEdges,
    ]);

    await new Promise((resolve) =>
      window.setTimeout(resolve, 140),
    );

    await flowInstance?.fitView({
      padding: 0.18,
      minZoom: 0.35,
      maxZoom: 1.08,
      duration: 900,
    });

    setExpandingGraph(false);
  }

  const evidenceProfile = getEvidenceProfile(
    pubMedPapers.length,
    pubMedLoading,
    Boolean(pubMedError),
  );

  const papersByYear = useMemo(() => {
    const groups = new Map<
      string,
      PubMedPaper[]
    >();

    for (const paper of pubMedPapers) {
      const year =
        paper.year || "Unknown year";

      groups.set(
        year,
        [
          ...(groups.get(year) ?? []),
          paper,
        ],
      );
    }

    return Array.from(groups.entries()).sort(
      ([a], [b]) => {
        if (a === "Unknown year") {
          return 1;
        }

        if (b === "Unknown year") {
          return -1;
        }

        return Number(b) - Number(a);
      },
    );
  }, [pubMedPapers]);

  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent,
    ) {
      const target =
        event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const key =
        event.key.toLowerCase();

      if (key === "g") {
        setWorkspaceView("graph");
      }

      if (key === "e") {
        setWorkspaceView("evidence");
      }

      if (key === "c") {
        setWorkspaceView("citations");
      }

      if (key === "t") {
        setWorkspaceView("timeline");
      }

      if (key === "p") {
        setWorkspaceView("pubmed");
      }

      if (key === "f") {
        void resetView();
      }

      if (event.key === "Escape") {
        setSelectedPaper(null);
        setCopilotOpen(false);
        setSelectedEdgeId(null);

        if (narrativeOpen) {
          void closeNarrative();
        } else if (cinematicFocus) {
          void exitCinematicFocus();
        }

        if (demoMode) {
          setDemoMode(false);
        }
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [
    flowInstance,
    cinematicFocus,
  ]);

  const selectedConnectionCount = selectedNode
    ? visibleEdges.filter(
        (edge) =>
          edge.source === selectedNode.id ||
          edge.target === selectedNode.id,
      ).length
    : 0;

  const activeLayerCount = Object.values(
    layers,
  ).filter(Boolean).length;

  return (
    <>
      <AnimatePresence>
        {showWorkspaceReveal && (
          <WorkspaceReveal
            active={showWorkspaceReveal}
            onComplete={() =>
              setShowWorkspaceReveal(false)
            }
          />
        )}
      </AnimatePresence>

      <main
        className={`relative h-[100dvh] overflow-hidden bg-[#030610] text-white transition-all duration-1000 ${
          showWorkspaceReveal
            ? "scale-[1.025] opacity-0 blur-xl"
            : "scale-100 opacity-100 blur-0"
        }`}
      >
        {/* Global workspace atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_-10%,rgba(34,211,238,.11),transparent_36%),radial-gradient(circle_at_90%_45%,rgba(139,92,246,.1),transparent_34%),linear-gradient(180deg,#050914_0%,#02040b_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.38)_1px,transparent_1px)] [background-size:64px_64px]" />

        <header
          className={`relative z-40 items-center justify-between border-b border-white/[0.08] bg-[#050814]/90 px-3 backdrop-blur-2xl sm:px-5 ${
            demoMode
              ? "hidden"
              : "flex h-[72px]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-cyan-300/20 bg-cyan-300/[0.08] text-xs font-black tracking-[-0.04em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,.12)]"
            >
              <span className="relative z-10">
                BL
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-cyan-300/20 via-transparent to-violet-400/25 opacity-0 transition group-hover:opacity-100" />
            </Link>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white sm:text-base">
                  BioLayers AI
                </p>

                <span className="hidden text-slate-700 sm:inline">
                  /
                </span>

                <p className="hidden max-w-[260px] truncate text-sm text-slate-400 sm:block">
                  Cancer Biology Workspace
                </p>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    generationMode === "ai"
                      ? "bg-emerald-300 shadow-[0_0_10px_#6ee7b7]"
                      : generationMode === "loading"
                        ? "animate-pulse bg-cyan-300 shadow-[0_0_10px_#67e8f9]"
                        : "bg-amber-300 shadow-[0_0_10px_#fcd34d]"
                  }`}
                />

                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {generationMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-1 lg:flex">
            {(
              [
                {
                  key: "graph",
                  label: "Graph",
                },
                {
                  key: "evidence",
                  label: "Evidence",
                },
                {
                  key: "citations",
                  label: "Citations",
                },
                {
                  key: "timeline",
                  label: "Timeline",
                },
                {
                  key: "cells",
                  label: "Cells",
                },
                {
                  key: "pubmed",
                  label: "PubMed",
                },
              ] as Array<{
                key: WorkspaceView;
                label: string;
              }>
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setWorkspaceView(tab.key)
                }
                className={`relative overflow-hidden rounded-[10px] px-4 py-2 text-xs font-semibold transition ${
                  workspaceView === tab.key
                    ? "bg-white/[0.09] text-white shadow-sm"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                }`}
              >
                {workspaceView === tab.key && (
                  <motion.span
                    layoutId="workspace-active-tab"
                    className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  />
                )}

                <span className="relative">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveCurrentProject}
              className="hidden rounded-[13px] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.06] sm:block"
            >
              Save
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setExportMenuOpen(
                    (current) => !current,
                  )
                }
                disabled={exporting}
                className="rounded-[13px] bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-4 py-2.5 text-xs font-bold text-[#03101a] shadow-[0_12px_32px_rgba(34,211,238,.18)] transition hover:brightness-110 disabled:opacity-50"
              >
                {exporting
                  ? "Exporting..."
                  : "Export ▾"}
              </button>

              <AnimatePresence>
                {exportMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    className="absolute right-0 top-[calc(100%+10px)] z-[120] w-52 overflow-hidden rounded-[17px] border border-white/[0.1] bg-[#07101d]/98 p-2 shadow-[0_22px_70px_rgba(0,0,0,.52)] backdrop-blur-3xl"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void exportGraphAsPng()
                      }
                      className="w-full rounded-[12px] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-cyan-300/[0.08]"
                    >
                      PNG visualization
                    </button>
                    <button
                      type="button"
                      onClick={exportGraphAsJson}
                      className="w-full rounded-[12px] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-violet-300/[0.08]"
                    >
                      JSON research data
                    </button>
                    <button
                      type="button"
                      onClick={exportGraphAsGraphMl}
                      className="w-full rounded-[12px] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-teal-300/[0.08]"
                    >
                      GraphML / Cytoscape
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/"
              className="rounded-[13px] border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              New
            </Link>
          </div>
        </header>

        <section
          className={`relative z-20 grid grid-cols-1 ${
            demoMode
              ? "h-[100dvh] lg:grid-cols-1"
              : "h-[calc(100dvh-72px)] lg:grid-cols-[278px_minmax(0,1fr)_332px]"
          }`}
        >
          {/* LEFT WORKSPACE SIDEBAR */}
          <aside
            className={`overflow-y-auto border-r border-white/[0.08] bg-[#050814]/78 p-4 backdrop-blur-2xl ${
              demoMode
                ? "hidden"
                : "hidden lg:block"
            }`}
          >
            <WorkspaceSectionLabel>
              Project
            </WorkspaceSectionLabel>

            <div className="mt-3 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Cancer Bone Metastasis
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.17em] text-slate-500">
                    Knowledge graph project
                  </p>
                </div>

                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-emerald-300">
                  Active
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <ProjectMetric
                  value={String(nodes.length)}
                  label="Nodes"
                />
                <ProjectMetric
                  value={String(edges.length)}
                  label="Links"
                />
                <ProjectMetric
                  value={`${activeLayerCount}/5`}
                  label="Layers"
                />
              </div>
            </div>

            <WorkspaceSectionLabel className="mt-7">
              Source input
            </WorkspaceSectionLabel>

            <div className="mt-3 rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Research paragraph
                </p>

                <span className="font-mono text-[9px] text-slate-600">
                  {sourceText.length} chars
                </span>
              </div>

              <p className="max-h-36 overflow-y-auto pr-1 text-xs leading-6 text-slate-400">
                {sourceText}
              </p>
            </div>

            <WorkspaceSectionLabel className="mt-7">
              Biological layers
            </WorkspaceSectionLabel>

            <div className="mt-3 space-y-2">
              {layerLabels.map((layer) => {
                const active = layers[layer.key];

                return (
                  <button
                    key={layer.key}
                    type="button"
                    onClick={() =>
                      toggleLayer(layer.key)
                    }
                    className={`group flex w-full items-center justify-between rounded-[15px] border px-3.5 py-3 text-left transition ${
                      active
                        ? "border-white/[0.09] bg-white/[0.045] text-white"
                        : "border-transparent bg-transparent text-slate-600 hover:bg-white/[0.025]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${legendItems.find((item) => item.key === layer.key)?.colorClass} ${
                          active
                            ? "shadow-[0_0_12px_currentColor]"
                            : "opacity-30"
                        }`}
                      />

                      <span className="text-xs font-semibold">
                        {layer.label}
                      </span>
                    </span>

                    <span
                      className={`relative h-5 w-9 rounded-full transition ${
                        active
                          ? "bg-cyan-300/25"
                          : "bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-3 w-3 rounded-full transition ${
                          active
                            ? "left-5 bg-cyan-200 shadow-[0_0_8px_#67e8f9]"
                            : "left-1 bg-slate-600"
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            <WorkspaceSectionLabel className="mt-7">
              Project actions
            </WorkspaceSectionLabel>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={saveCurrentProject}
                className="rounded-[14px] bg-cyan-300 px-3 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() =>
                  void restoreSavedProject()
                }
                disabled={!hasSavedProject}
                className="rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Restore
              </button>

              <button
                type="button"
                onClick={deleteSavedProject}
                disabled={!hasSavedProject}
                className="col-span-2 rounded-[14px] border border-rose-300/10 px-3 py-2.5 text-xs font-semibold text-rose-300/75 transition hover:bg-rose-300/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Delete saved version
              </button>
            </div>

            {(saveMessage || apiError) && (
              <div className="mt-3 rounded-[14px] border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                <p
                  className={`text-[10px] leading-5 ${
                    apiError
                      ? "text-amber-300"
                      : "text-emerald-300"
                  }`}
                >
                  {apiError || saveMessage}
                </p>
              </div>
            )}
          </aside>

          {/* GRAPH CANVAS */}
          <section
            ref={graphContainerRef}
            onMouseMove={(event) => {
              const bounds =
                event.currentTarget.getBoundingClientRect();

              setCursorPosition({
                x:
                  ((event.clientX -
                    bounds.left) /
                    bounds.width) *
                  100,
                y:
                  ((event.clientY -
                    bounds.top) /
                    bounds.height) *
                  100,
              });
            }}
            className="relative min-h-0 overflow-hidden bg-[#050816]"
          >
            <LivingWorkspaceAtmosphere
              view={workspaceView}
            />
            <motion.div
              animate={{
                left: `${cursorPosition.x}%`,
                top: `${cursorPosition.y}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 24,
                mass: 0.55,
              }}
              className="pointer-events-none absolute z-[2] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,.11),rgba(139,92,246,.055)_35%,transparent_68%)] blur-[12px]"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,.07),transparent_30%),radial-gradient(circle_at_82%_15%,rgba(139,92,246,.065),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(236,72,153,.04),transparent_28%)]" />

            <div className="pointer-events-none absolute inset-0 z-[1] opacity-35 [background-image:radial-gradient(circle,rgba(103,232,249,.42)_1px,transparent_1.5px),radial-gradient(circle,rgba(196,181,253,.28)_1px,transparent_1.5px)] [background-position:0_0,22px_18px] [background-size:54px_54px,72px_72px]" />

            <motion.div
              animate={{
                backgroundPosition: [
                  "0px 0px",
                  "96px 54px",
                ],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute inset-0 z-[1] opacity-[0.09] [background-image:linear-gradient(115deg,transparent_42%,rgba(103,232,249,.4)_50%,transparent_58%)] [background-size:220px_220px]"
            />

            <motion.div
              animate={{
                x: [-30, 45, -30],
                y: [-20, 24, -20],
                opacity: [0.05, 0.11, 0.05],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-[20%] top-[18%] z-[1] h-80 w-80 rounded-full bg-cyan-400/20 blur-[130px]"
            />

            <div
              data-export-ignore="true"
              className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-24px)] items-center gap-2 sm:left-5 sm:top-5"
            >
              <div className="rounded-[16px] border border-white/[0.09] bg-[#07101d]/85 px-3.5 py-2.5 shadow-[0_18px_55px_rgba(0,0,0,.32)] backdrop-blur-2xl sm:px-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Generated knowledge graph
                </p>

                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                  Hover to isolate relationships. Click to inspect.
                </p>
              </div>
            </div>

            <div
              data-export-ignore="true"
              className="absolute right-3 top-3 z-20 flex max-w-[calc(100%-24px)] flex-wrap justify-end gap-2 sm:right-5 sm:top-5"
            >
              <button
                type="button"
                onClick={() =>
                  void toggleDemoMode()
                }
                className={`rounded-[15px] border px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] shadow-lg backdrop-blur-2xl transition ${
                  demoMode
                    ? "border-rose-300/20 bg-rose-300/[0.09] text-rose-100"
                    : "border-violet-300/20 bg-[#07101d]/88 text-violet-100 hover:bg-violet-300/[0.08]"
                }`}
              >
                {demoMode
                  ? "Exit demo"
                  : "Demo mode"}
              </button>

              <button
                type="button"
                onClick={startNarrative}
                disabled={
                  narrativeSteps.length === 0
                }
                className="rounded-[15px] border border-cyan-300/20 bg-[#07101d]/88 px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-100 shadow-lg backdrop-blur-2xl transition hover:bg-cyan-300/[0.08] disabled:opacity-35"
              >
                Play mechanism
              </button>
              <div className="hidden rounded-[15px] border border-white/[0.09] bg-[#07101d]/88 p-1 shadow-lg backdrop-blur-2xl sm:flex">
                <button
                  type="button"
                  onClick={() =>
                    void changeLayout("TB")
                  }
                  className={`rounded-[11px] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                    layoutDirection === "TB"
                      ? "bg-white/[0.1] text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Vertical
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void changeLayout("LR")
                  }
                  className={`rounded-[11px] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                    layoutDirection === "LR"
                      ? "bg-white/[0.1] text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Horizontal
                </button>
              </div>

              <button
                type="button"
                onClick={() => void resetView()}
                className="rounded-[15px] border border-white/[0.09] bg-[#07101d]/88 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300 shadow-lg backdrop-blur-2xl transition hover:bg-white/[0.08]"
              >
                Fit
              </button>
            </div>

            <div
              data-export-ignore="true"
              className="absolute bottom-4 left-1/2 z-30 w-[min(92%,560px)] -translate-x-1/2"
            >
              <div className="flex items-center rounded-[20px] border border-white/[0.1] bg-[#07101d]/92 p-2 shadow-[0_24px_70px_rgba(0,0,0,.46)] backdrop-blur-2xl">
                <span className="pl-3 pr-2 text-slate-600">
                  ⌕
                </span>

                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(
                      event.target.value,
                    );
                    setSearchError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void findEntity();
                    }
                  }}
                  placeholder="Search cells, proteins, pathways..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    void findEntity()
                  }
                  className="rounded-[13px] bg-white px-4 py-2.5 text-xs font-bold text-slate-950"
                >
                  Focus
                </button>
              </div>

              {(searchError || exportError) && (
                <p className="mx-auto mt-2 w-fit rounded-full border border-rose-300/15 bg-rose-950/70 px-3 py-1.5 text-[10px] text-rose-200 backdrop-blur-xl">
                  {searchError || exportError}
                </p>
              )}
            </div>

            <AnimatePresence>
              {demoMode && (
                <>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -18,
                    }}
                    className="pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2 text-center"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.42em] text-cyan-300">
                      BioLayers AI
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                      Biomedical knowledge,
                      connected.
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 24,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 24,
                    }}
                    className="absolute bottom-6 left-1/2 z-50 w-[min(94vw,760px)] -translate-x-1/2 rounded-[22px] border border-white/[0.1] bg-[#050814]/88 p-2 shadow-[0_24px_90px_rgba(0,0,0,.48)] backdrop-blur-3xl"
                  >
                    <div className="grid grid-cols-5 gap-1.5">
                      {(
                        [
                          [
                            "problem",
                            "Problem",
                          ],
                          [
                            "mechanism",
                            "Mechanism",
                          ],
                          [
                            "evidence",
                            "Evidence",
                          ],
                          [
                            "cells",
                            "Cell Atlas",
                          ],
                          [
                            "vision",
                            "Vision",
                          ],
                        ] as Array<
                          [
                            DemoScene,
                            string,
                          ]
                        >
                      ).map(
                        ([scene, label]) => (
                          <button
                            key={scene}
                            type="button"
                            onClick={() =>
                              activateDemoScene(
                                scene,
                              )
                            }
                            className={`rounded-[15px] px-2 py-3 text-[8px] font-bold uppercase tracking-[0.1em] transition sm:text-[10px] ${
                              demoScene ===
                              scene
                                ? "bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 text-slate-950"
                                : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div
              data-export-ignore="true"
              className={`absolute left-1/2 z-30 -translate-x-1/2 ${
                demoMode
                  ? "bottom-24"
                  : "bottom-5"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  cinematicFocus
                    ? void exitCinematicFocus()
                    : void enterCinematicFocus()
                }
                disabled={!selectedNode}
                className={`rounded-full border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] shadow-2xl backdrop-blur-2xl transition ${
                  cinematicFocus
                    ? "border-rose-300/20 bg-rose-300/[0.09] text-rose-100 hover:bg-rose-300/[0.15]"
                    : "border-cyan-300/20 bg-[#07101d]/88 text-cyan-100 hover:bg-cyan-300/[0.09]"
                } disabled:cursor-not-allowed disabled:opacity-35`}
              >
                {cinematicFocus
                  ? "Exit focus"
                  : "Cinematic focus"}
              </button>

              <button
                type="button"
                onClick={() =>
                  void expandSelectedEntity()
                }
                disabled={
                  !selectedNode ||
                  expandingGraph
                }
                className="ml-2 rounded-full border border-violet-300/20 bg-[#07101d]/88 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-100 shadow-2xl backdrop-blur-2xl transition hover:bg-violet-300/[0.09] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {expandingGraph
                  ? "Expanding..."
                  : "Expand entity"}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {workspaceView !== "graph" && (
                <motion.div
                  key={workspaceView}
                  initial={{
                    opacity: 0,
                    y: 18,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -12,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 z-[25] overflow-y-auto bg-[linear-gradient(145deg,rgba(2,6,23,.95),rgba(6,8,24,.92),rgba(3,7,18,.96))] p-5 backdrop-blur-3xl sm:p-8"
                >
                  <LivingWorkspaceAtmosphere
                    view={workspaceView}
                  />
                  <div className="relative z-10 mx-auto max-w-6xl pb-24">
                    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                          {workspaceView === "evidence"
                            ? "Evidence explorer"
                            : workspaceView === "citations"
                              ? "Citation network"
                              : workspaceView === "timeline"
                                ? "Research timeline"
                                : workspaceView === "cells"
                                  ? "Cell atlas"
                                  : "PubMed literature"}
                        </p>

                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
                          {selectedEntity.label}
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                          {workspaceView === "evidence"
                            ? "Inspect mechanistic connections, evidence coverage and the scientific context surrounding the selected biological entity."
                            : workspaceView === "citations"
                              ? "Explore the loaded literature records connected to the selected entity."
                              : workspaceView === "timeline"
                                ? "Review loaded publications chronologically."
                                : workspaceView === "cells"
                                  ? "Search Cell Ontology and Cell Line Ontology, then add selected cells to the graph."
                                  : "Review paginated oncology-focused publications retrieved from PubMed."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setWorkspaceView("graph")
                        }
                        className="self-start rounded-[14px] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white sm:self-auto"
                      >
                        Back to graph
                      </button>
                    </div>

                    {workspaceView ===
                    "evidence" ? (
                      <>
                        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <EvidenceMetricCard
                            eyebrow="Entity type"
                            value={
                              selectedEntity.type
                            }
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
                                    pubMedPapers.length,
                                  )
                            }
                            detail="Oncology-focused evidence"
                          />

                          <EvidenceMetricCard
                            eyebrow="Literature coverage"
                            value={evidenceProfile.level}
                            detail={`${evidenceProfile.score}% coverage indicator`}
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
                                {
                                  relatedConnections.length
                                }
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
                                  (
                                    connection,
                                  ) => (
                                    <button
                                      key={`${connection.nodeId}-evidence`}
                                      type="button"
                                      onClick={() => {
                                        void focusNode(
                                          connection.nodeId,
                                        );
                                        setWorkspaceView(
                                          "graph",
                                        );
                                      }}
                                      className="group flex w-full items-center justify-between gap-4 rounded-[19px] border border-white/[0.07] bg-black/20 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                                    >
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                              legendItems.find(
                                                (
                                                  item,
                                                ) =>
                                                  item.key ===
                                                  connection.type,
                                              )
                                                ?.colorClass
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

                            <div className="mt-6 border-l border-cyan-300/30 pl-4">
                              <p className="text-sm leading-7 text-slate-300">
                                This evidence view currently combines the extracted graph structure with live PubMed literature retrieval. Evidence ranking and claim-level citation mapping will be added next.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setWorkspaceView(
                                  "pubmed",
                                )
                              }
                              className="mt-6 w-full rounded-[15px] bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-4 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110"
                            >
                              Open PubMed evidence
                            </button>
                          </section>
                        </div>
                      </>
                    ) : workspaceView ===
                      "timeline" ? (
                      <section className="mt-7">
                        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                            Literature timeline
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            {pubMedPapers.length} loaded of{" "}
                            {pubMedTotal.toLocaleString()} matching records.
                          </p>
                        </div>

                        <div className="mt-7 space-y-8">
                          {papersByYear.map(
                            ([year, papers]) => (
                              <div
                                key={year}
                                className="relative border-l border-cyan-300/20 pl-7"
                              >
                                <span className="absolute -left-2 top-0 h-4 w-4 rounded-full border border-cyan-200/50 bg-[#07111f]" />
                                <h3 className="text-2xl font-semibold text-white">
                                  {year}
                                </h3>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                  {papers.map(
                                    (paper) => (
                                      <button
                                        key={`timeline-${paper.pmid}`}
                                        type="button"
                                        onClick={() =>
                                          openPaperInspector(
                                            paper,
                                          )
                                        }
                                        className="rounded-[19px] border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-cyan-300/20"
                                      >
                                        <p className="font-mono text-[8px] text-cyan-300/65">
                                          PMID {paper.pmid}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-200">
                                          {paper.title}
                                        </p>
                                        <p className="mt-2 text-[10px] text-slate-600">
                                          {paper.journal}
                                        </p>
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        {pubMedHasMore && (
                          <button
                            type="button"
                            onClick={() =>
                              void loadMorePubMed()
                            }
                            disabled={pubMedLoadingMore}
                            className="mx-auto mt-7 block rounded-[15px] border border-white/10 px-6 py-3 text-xs font-semibold text-slate-200 disabled:opacity-40"
                          >
                            {pubMedLoadingMore
                              ? "Loading..."
                              : "Load more timeline papers"}
                          </button>
                        )}
                      </section>
                    ) : workspaceView ===
                      "cells" ? (
                      <section className="mt-7">
                        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-[radial-gradient(circle_at_15%_15%,rgba(45,212,191,.14),transparent_31%),radial-gradient(circle_at_85%_25%,rgba(139,92,246,.12),transparent_30%),rgba(255,255,255,.018)] p-5 sm:p-7">
                          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/[0.04]" />
                          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-teal-300/[0.05]" />

                          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-teal-300">
                                Cell Atlas Pro
                              </p>

                              <h3 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                                Explore standardized
                                cell identities.
                              </h3>

                              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                                Search Cell Ontology and Cell Line Ontology, inspect definitions and synonyms, then add selected classes directly to your biological graph.
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <CellAtlasMetric
                                label="Results"
                                value={cellTotal.toLocaleString()}
                              />
                              <CellAtlasMetric
                                label="Loaded"
                                value={String(
                                  cellTerms.length,
                                )}
                              />
                              <CellAtlasMetric
                                label="Saved"
                                value={String(
                                  favoriteCellIds.length,
                                )}
                              />
                            </div>
                          </div>

                          <div className="relative z-10 mt-7 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-teal-300/65">
                                ⌕
                              </span>

                              <input
                                value={cellQuery}
                                onChange={(event) => {
                                  setCellQuery(
                                    event.target.value,
                                  );
                                  setCellError("");
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key ===
                                    "Enter"
                                  ) {
                                    void runCellSearch();
                                  }
                                }}
                                placeholder="Search fibroblast, osteoclast, T cell, endothelial cell..."
                                className="w-full rounded-[17px] border border-white/[0.09] bg-black/25 py-4 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/30 focus:bg-teal-300/[0.025]"
                              />
                            </div>

                            <select
                              value={cellScope}
                              onChange={(event) =>
                                setCellScope(
                                  event.target
                                    .value as CellOntologyScope,
                                )
                              }
                              className="rounded-[17px] border border-white/[0.09] bg-[#07111f] px-4 py-4 text-xs font-semibold text-slate-300 outline-none"
                            >
                              <option value="cl">
                                Cell Ontology
                              </option>
                              <option value="clo">
                                Cell Line Ontology
                              </option>
                              <option value="all">
                                Both ontologies
                              </option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                void runCellSearch()
                              }
                              disabled={cellLoading}
                              className="rounded-[17px] bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-950 shadow-[0_16px_45px_rgba(34,211,238,.18)] transition hover:brightness-110 disabled:opacity-50"
                            >
                              {cellLoading
                                ? "Searching..."
                                : "Search atlas"}
                            </button>
                          </div>

                          {cellError && (
                            <p className="relative z-10 mt-4 rounded-[15px] border border-rose-300/15 bg-rose-300/[0.05] p-3 text-xs text-rose-200">
                              {cellError}
                            </p>
                          )}
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                Quick discovery
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                Start with major cellular families.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {cellAtlasPresets.map(
                              (preset, index) => (
                                <motion.button
                                  key={preset.query}
                                  type="button"
                                  initial={{
                                    opacity: 0,
                                    y: 12,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  transition={{
                                    delay:
                                      index * 0.05,
                                  }}
                                  onClick={() =>
                                    void searchCellPreset(
                                      preset.query,
                                    )
                                  }
                                  className="group rounded-[20px] border border-white/[0.07] bg-white/[0.022] p-4 text-left transition hover:-translate-y-1 hover:border-teal-300/20 hover:bg-teal-300/[0.035]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-teal-300 to-violet-400 shadow-[0_0_14px_rgba(45,212,191,.55)]" />
                                    <span className="text-[9px] text-slate-700 transition group-hover:text-teal-300">
                                      Explore ↗
                                    </span>
                                  </div>

                                  <p className="mt-4 text-sm font-semibold text-white">
                                    {preset.label}
                                  </p>

                                  <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">
                                    {
                                      preset.description
                                    }
                                  </p>
                                </motion.button>
                              ),
                            )}
                          </div>
                        </div>

                        {cellTerms.length === 0 &&
                          !cellLoading && (
                          <div className="mt-7 rounded-[28px] border border-dashed border-white/[0.09] bg-white/[0.015] px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-teal-300/15 bg-teal-300/[0.05] text-3xl">
                              ◉
                            </div>

                            <h4 className="mt-5 text-xl font-semibold text-white">
                              Search the cell atlas
                            </h4>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                              Enter a cell name or choose a discovery category. Results are loaded from standardized biomedical ontologies.
                            </p>
                          </div>
                        )}

                        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {cellTerms.map(
                            (term, index) => {
                              const accent =
                                getCellAccent(
                                  term.label,
                                );

                              const favorite =
                                favoriteCellIds.includes(
                                  term.id,
                                );

                              return (
                                <motion.article
                                  key={term.id}
                                  initial={{
                                    opacity: 0,
                                    y: 18,
                                    scale: 0.98,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  transition={{
                                    delay:
                                      Math.min(
                                        index * 0.035,
                                        0.35,
                                      ),
                                  }}
                                  className={`group relative overflow-hidden rounded-[27px] border ${accent.border} bg-[#050814]/74 p-3 shadow-[0_24px_70px_rgba(0,0,0,.24)] backdrop-blur-2xl transition hover:-translate-y-1.5`}
                                >
                                  <div
                                    className="pointer-events-none absolute inset-0 opacity-90"
                                    style={{
                                      background: `radial-gradient(circle at 18% 10%, ${accent.from}, transparent 38%), radial-gradient(circle at 90% 82%, ${accent.via}, transparent 38%), linear-gradient(145deg, transparent, ${accent.to})`,
                                    }}
                                  />

                                  <div className="relative z-10">
                                    <BiologicalArtwork
                                      type="cell"
                                      label={
                                        term.label
                                      }
                                      active={
                                        selectedAtlasTerm?.id ===
                                        term.id
                                      }
                                    />

                                    <div className="px-2 pb-2 pt-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <span className={`inline-flex rounded-full border border-white/[0.08] bg-black/25 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] ${accent.text}`}>
                                            {
                                              term.ontologyLabel
                                            }
                                          </span>

                                          <h4 className="mt-3 text-lg font-semibold leading-6 tracking-[-0.025em] text-white">
                                            {term.label}
                                          </h4>
                                        </div>

                                        <button
                                          type="button"
                                          aria-label="Save cell"
                                          onClick={() =>
                                            toggleFavoriteCell(
                                              term,
                                            )
                                          }
                                          className={`shrink-0 rounded-[12px] border px-3 py-2 text-sm transition ${
                                            favorite
                                              ? "border-amber-300/25 bg-amber-300/[0.09] text-amber-200"
                                              : "border-white/[0.08] text-slate-600 hover:text-white"
                                          }`}
                                        >
                                          {favorite
                                            ? "★"
                                            : "☆"}
                                        </button>
                                      </div>

                                      <p className="mt-3 line-clamp-3 min-h-[66px] text-xs leading-6 text-slate-500">
                                        {term.description ||
                                          "No ontology definition was returned for this class."}
                                      </p>

                                      <div className="mt-4 flex items-center justify-between rounded-[13px] border border-white/[0.06] bg-black/20 px-3 py-2.5">
                                        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-600">
                                          Ontology ID
                                        </span>
                                        <span className="max-w-[150px] truncate font-mono text-[9px] text-slate-400">
                                          {term.id}
                                        </span>
                                      </div>

                                      <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openCellAtlasTerm(
                                              term,
                                            )
                                          }
                                          className="rounded-[13px] border border-white/[0.09] bg-white/[0.035] px-3 py-3 text-[10px] font-bold text-slate-200 transition hover:bg-white/[0.07]"
                                        >
                                          Inspect
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            void addCellToGraph(
                                              term,
                                            )
                                          }
                                          className="rounded-[13px] border border-teal-300/15 bg-teal-300/[0.07] px-3 py-3 text-[10px] font-bold text-teal-100 transition hover:bg-teal-300/[0.13]"
                                        >
                                          Add to graph
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.article>
                              );
                            },
                          )}
                        </div>

                        {cellHasMore && (
                          <button
                            type="button"
                            onClick={() =>
                              void runCellSearch(
                                cellPage + 1,
                                true,
                              )
                            }
                            disabled={cellLoading}
                            className="mx-auto mt-8 block rounded-[16px] border border-teal-300/15 bg-teal-300/[0.05] px-7 py-3.5 text-xs font-bold text-teal-100 transition hover:bg-teal-300/[0.1] disabled:opacity-40"
                          >
                            {cellLoading
                              ? "Loading more cells..."
                              : `Load more · ${cellTerms.length} of ${cellTotal.toLocaleString()}`}
                          </button>
                        )}

                        <AnimatePresence>
                          {selectedAtlasTerm && (
                            <>
                              <motion.button
                                type="button"
                                aria-label="Close cell inspector"
                                initial={{
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                }}
                                exit={{
                                  opacity: 0,
                                }}
                                onClick={() =>
                                  setSelectedAtlasTerm(
                                    null,
                                  )
                                }
                                className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-[3px]"
                              />

                              <motion.aside
                                initial={{
                                  opacity: 0,
                                  x: 70,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  x: 70,
                                }}
                                transition={{
                                  duration: 0.4,
                                  ease: [
                                    0.16,
                                    1,
                                    0.3,
                                    1,
                                  ],
                                }}
                                className="fixed bottom-0 right-0 top-0 z-[140] flex w-full flex-col overflow-hidden border-l border-white/[0.1] bg-[#050814]/98 shadow-[-30px_0_100px_rgba(0,0,0,.52)] backdrop-blur-3xl sm:w-[560px]"
                              >
                                <div className="border-b border-white/[0.08] p-5 sm:p-6">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-teal-300">
                                        Cell Atlas Inspector
                                      </p>
                                      <p className="mt-2 font-mono text-[9px] text-slate-600">
                                        {
                                          selectedAtlasTerm.id
                                        }
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedAtlasTerm(
                                          null,
                                        )
                                      }
                                      className="rounded-[12px] border border-white/10 px-3 py-2 text-xs text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                                  <BiologicalArtwork
                                    type="cell"
                                    label={
                                      selectedAtlasTerm.label
                                    }
                                    active
                                  />

                                  <span className="mt-5 inline-flex rounded-full border border-teal-300/15 bg-teal-300/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-teal-200">
                                    {
                                      selectedAtlasTerm.ontologyLabel
                                    }
                                  </span>

                                  <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white">
                                    {
                                      selectedAtlasTerm.label
                                    }
                                  </h2>

                                  <section className="mt-6 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-cyan-300">
                                      Ontology definition
                                    </p>

                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                      {selectedAtlasTerm.description ||
                                        "No formal definition was returned by the ontology service."}
                                    </p>
                                  </section>

                                  <section className="mt-5 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-violet-300">
                                      Known synonyms
                                    </p>

                                    {selectedAtlasTerm
                                      .synonyms.length >
                                    0 ? (
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedAtlasTerm.synonyms.map(
                                          (
                                            synonym,
                                          ) => (
                                            <span
                                              key={
                                                synonym
                                              }
                                              className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 text-[10px] text-slate-400"
                                            >
                                              {
                                                synonym
                                              }
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    ) : (
                                      <p className="mt-3 text-sm text-slate-600">
                                        No synonyms were returned.
                                      </p>
                                    )}
                                  </section>

                                  <section className="mt-5 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-amber-300">
                                      Provenance
                                    </p>

                                    <div className="mt-4 space-y-3">
                                      <AtlasProperty
                                        label="Source"
                                        value={
                                          selectedAtlasTerm.ontologyLabel
                                        }
                                      />
                                      <AtlasProperty
                                        label="Identifier"
                                        value={
                                          selectedAtlasTerm.id
                                        }
                                      />
                                      <AtlasProperty
                                        label="Ontology"
                                        value={
                                          selectedAtlasTerm.ontology.toUpperCase()
                                        }
                                      />
                                    </div>
                                  </section>

                                  <div className="mt-6 rounded-[18px] border border-amber-300/12 bg-amber-300/[0.035] p-4">
                                    <p className="text-[10px] leading-6 text-amber-100/65">
                                      BioLayers currently displays ontology metadata supplied by the external service. Molecular markers, disease associations and anatomical locations should be added only after connecting verified domain-specific sources.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] p-4 sm:px-6">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleFavoriteCell(
                                        selectedAtlasTerm,
                                      )
                                    }
                                    className="rounded-[15px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07]"
                                  >
                                    {favoriteCellIds.includes(
                                      selectedAtlasTerm.id,
                                    )
                                      ? "Remove saved"
                                      : "Save cell"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void addCellToGraph(
                                        selectedAtlasTerm,
                                      );
                                      setSelectedAtlasTerm(
                                        null,
                                      );
                                    }}
                                    className="rounded-[15px] bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 px-4 py-3 text-xs font-black text-slate-950 transition hover:brightness-110"
                                  >
                                    Add to graph
                                  </button>
                                </div>
                              </motion.aside>
                            </>
                          )}
                        </AnimatePresence>
                      </section>
                    ) : workspaceView ===
                      "citations" ? (
                      <section className="mt-7">
                        <div className="rounded-[30px] border border-white/[0.08] bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,.09),transparent_36%),rgba(255,255,255,.018)] p-5 sm:p-8">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                                Entity-to-paper map
                              </p>
                              <h3 className="mt-2 text-xl font-semibold text-white">
                                Literature connected to {selectedEntity.label}
                              </h3>
                            </div>

                            <EvidenceBadge
                              profile={evidenceProfile}
                            />
                          </div>

                          <div className="relative mt-8">
                            <div className="mx-auto max-w-md rounded-[26px] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(34,211,238,.14),rgba(5,8,20,.96))] p-5 text-center shadow-[0_0_65px_rgba(34,211,238,.14)]">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                                {selectedEntity.type}
                              </p>
                              <h4 className="mt-3 text-2xl font-semibold text-white">
                                {selectedEntity.label}
                              </h4>
                              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-slate-400">
                                {selectedEntity.description}
                              </p>
                            </div>

                            <div className="mx-auto h-10 w-px bg-gradient-to-b from-cyan-300/65 to-violet-300/20" />

                            {pubMedLoading ? (
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {[0, 1, 2, 3, 4].map(
                                  (item) => (
                                    <div
                                      key={item}
                                      className="animate-pulse rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5"
                                    >
                                      <div className="h-2.5 w-1/3 rounded-full bg-white/[0.08]" />
                                      <div className="mt-4 h-3 w-full rounded-full bg-white/[0.06]" />
                                      <div className="mt-2 h-3 w-4/5 rounded-full bg-white/[0.06]" />
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : pubMedPapers.length === 0 ? (
                              <div className="rounded-[24px] border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
                                <p className="text-sm text-slate-500">
                                  No PubMed records are currently connected to this entity.
                                </p>
                              </div>
                            ) : (
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {pubMedPapers.map(
                                  (paper, index) => (
                                    <motion.button
                                      key={`citation-${paper.pmid}`}
                                      type="button"
                                      initial={{
                                        opacity: 0,
                                        y: 18,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                      }}
                                      transition={{
                                        delay:
                                          index * 0.06,
                                        duration: 0.4,
                                      }}
                                      whileHover={{
                                        y: -5,
                                        scale: 1.01,
                                      }}
                                      onClick={() =>
                                        openPaperInspector(
                                          paper,
                                        )
                                      }
                                      className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 text-left shadow-[0_18px_55px_rgba(0,0,0,.2)] transition hover:border-violet-300/25 hover:bg-violet-300/[0.04]"
                                    >
                                      <div className="pointer-events-none absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 -translate-y-full bg-gradient-to-b from-violet-300/10 to-violet-300/65" />
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-2.5 py-1 font-mono text-[8px] text-violet-200">
                                          PMID {paper.pmid}
                                        </span>
                                        <span className="text-[9px] font-semibold text-slate-600 transition group-hover:text-cyan-300">
                                          Inspect ↗
                                        </span>
                                      </div>

                                      <h4 className="mt-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-100">
                                        {paper.title}
                                      </h4>

                                      <p className="mt-4 text-[10px] leading-5 text-slate-500">
                                        {paper.journal} · {paper.year}
                                      </p>

                                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-violet-300/20 to-transparent" />

                                      <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                        Connected to {selectedEntity.label}
                                      </p>
                                    </motion.button>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    ) : (
                      <section className="mt-7">
                        <div className="mb-6 flex flex-col gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {pubMedTotal.toLocaleString()} matching records
                            </p>
                            <p className="mt-1 text-[10px] text-slate-600">
                              {pubMedPapers.length} loaded
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPubMedSort(
                                  "relevance",
                                )
                              }
                              className={`rounded-[12px] px-3 py-2 text-[10px] ${
                                pubMedSort ===
                                "relevance"
                                  ? "bg-cyan-300 text-slate-950"
                                  : "border border-white/10 text-slate-400"
                              }`}
                            >
                              Relevance
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPubMedSort(
                                  "date",
                                )
                              }
                              className={`rounded-[12px] px-3 py-2 text-[10px] ${
                                pubMedSort ===
                                "date"
                                  ? "bg-cyan-300 text-slate-950"
                                  : "border border-white/10 text-slate-400"
                              }`}
                            >
                              Newest
                            </button>
                          </div>
                        </div>

                        {comparedPapers.length >
                          0 && (
                          <div className="mb-6 grid gap-3 rounded-[22px] border border-violet-300/15 bg-violet-300/[0.04] p-4 md:grid-cols-2">
                            {comparedPapers.map(
                              (paper) => (
                                <div
                                  key={`compare-${paper.pmid}`}
                                  className="rounded-[17px] border border-white/[0.07] bg-black/20 p-4"
                                >
                                  <p className="font-mono text-[8px] text-violet-300/65">
                                    PMID {paper.pmid}
                                  </p>
                                  <p className="mt-2 line-clamp-3 text-xs font-semibold text-slate-200">
                                    {paper.title}
                                  </p>
                                  <p className="mt-3 text-[10px] text-slate-600">
                                    {paper.journal} ·{" "}
                                    {paper.year}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {pubMedLoading && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {[0, 1, 2, 3].map(
                              (item) => (
                                <div
                                  key={item}
                                  className="animate-pulse rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5"
                                >
                                  <div className="h-2.5 w-1/3 rounded-full bg-white/[0.08]" />
                                  <div className="mt-4 h-3 w-full rounded-full bg-white/[0.06]" />
                                  <div className="mt-2 h-3 w-4/5 rounded-full bg-white/[0.06]" />
                                  <div className="mt-5 h-2 w-1/2 rounded-full bg-white/[0.05]" />
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {!pubMedLoading &&
                          pubMedError && (
                            <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/[0.04] p-6">
                              <p className="text-sm leading-7 text-amber-200">
                                {pubMedError}
                              </p>
                            </div>
                          )}

                        {!pubMedLoading &&
                          !pubMedError &&
                          pubMedPapers.length ===
                            0 && (
                            <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-8 text-center">
                              <p className="text-sm text-slate-500">
                                No oncology-focused PubMed papers were found for this entity.
                              </p>
                            </div>
                          )}

                        {!pubMedLoading &&
                          pubMedPapers.length >
                            0 && (
                            <div className="grid gap-4 md:grid-cols-2">
                              {pubMedPapers.map(
                                (paper) => (
                                  <button
                                    key={`${paper.pmid}-full`}
                                    type="button"
                                    onClick={() =>
                                      openPaperInspector(
                                        paper,
                                      )
                                    }
                                    className="group rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-300/65">
                                        PMID{" "}
                                        {
                                          paper.pmid
                                        }
                                      </p>

                                      <span className="text-[10px] font-semibold text-slate-600 transition group-hover:text-cyan-300">
                                        Open ↗
                                      </span>
                                    </div>

                                    <h3 className="mt-4 text-base font-semibold leading-7 text-slate-100">
                                      {
                                        paper.title
                                      }
                                    </h3>

                                    <p className="mt-4 text-xs leading-6 text-slate-500">
                                      {
                                        paper.journal
                                      }{" "}
                                      ·{" "}
                                      {
                                        paper.year
                                      }
                                    </p>

                                    {paper.authors
                                      .length >
                                      0 && (
                                      <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">
                                        {paper.authors.join(
                                          ", ",
                                        )}
                                      </p>
                                    )}

                                    {paper.doi && (
                                      <p className="mt-4 truncate rounded-[10px] border border-violet-300/10 bg-violet-300/[0.035] px-3 py-2 font-mono text-[9px] text-violet-300/65">
                                        DOI{" "}
                                        {
                                          paper.doi
                                        }
                                      </p>
                                    )}

                                    <span
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        togglePaperComparison(
                                          paper,
                                        );
                                      }}
                                      className={`mt-4 block rounded-[11px] border px-3 py-2 text-center text-[9px] ${
                                        comparedPapers.some(
                                          (item) =>
                                            item.pmid ===
                                            paper.pmid,
                                        )
                                          ? "border-violet-300/25 bg-violet-300/[0.09] text-violet-200"
                                          : "border-white/[0.08] text-slate-500"
                                      }`}
                                    >
                                      Add to comparison
                                    </span>
                                  </button>
                                ),
                              )}
                            </div>
                          )}

                        {!pubMedLoading &&
                          pubMedHasMore && (
                          <button
                            type="button"
                            onClick={() =>
                              void loadMorePubMed()
                            }
                            disabled={pubMedLoadingMore}
                            className="mx-auto mt-7 block rounded-[15px] border border-cyan-300/15 bg-cyan-300/[0.055] px-6 py-3 text-xs font-bold text-cyan-100 disabled:opacity-40"
                          >
                            {pubMedLoadingMore
                              ? "Loading more..."
                              : `Load more · ${pubMedPapers.length} of ${pubMedTotal.toLocaleString()}`}
                          </button>
                        )}
                      </section>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {narrativeOpen &&
                activeNarrativeStep && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 28,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 28,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.42,
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1,
                    ],
                  }}
                  className={`absolute z-[60] w-[min(92vw,560px)] rounded-[28px] border border-white/[0.11] bg-[#050814]/92 p-5 shadow-[0_28px_100px_rgba(0,0,0,.52)] backdrop-blur-3xl sm:p-6 ${
                    demoMode
                      ? "bottom-28 left-6"
                      : "bottom-20 left-1/2 -translate-x-1/2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                        Mechanism story ·{" "}
                        {narrativeIndex + 1}/
                        {
                          narrativeSteps.length
                        }
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">
                        {
                          activeNarrativeStep.title
                        }
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void closeNarrative()
                      }
                      className="rounded-[12px] border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 rounded-[17px] border border-cyan-300/12 bg-cyan-300/[0.035] px-4 py-3">
                    <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-cyan-300/65">
                      Current relationship
                    </p>
                    <p className="mt-2 text-sm font-semibold text-cyan-100">
                      {
                        activeNarrativeStep.relation
                      }
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {
                      activeNarrativeStep.explanation
                    }
                  </p>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      animate={{
                        width: `${
                          ((narrativeIndex +
                            1) /
                            Math.max(
                              narrativeSteps.length,
                              1,
                            )) *
                          100
                        }%`,
                      }}
                      transition={{
                        duration: 0.45,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={
                        previousNarrativeStep
                      }
                      disabled={
                        narrativeIndex === 0
                      }
                      className="rounded-[13px] border border-white/10 px-2 py-2.5 text-[9px] font-bold uppercase text-slate-400 disabled:opacity-30"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={
                        narrativePlaying
                          ? pauseNarrative
                          : resumeNarrative
                      }
                      className="rounded-[13px] bg-gradient-to-r from-cyan-300 to-violet-300 px-2 py-2.5 text-[9px] font-black uppercase text-slate-950"
                    >
                      {narrativePlaying
                        ? "Pause"
                        : "Play"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        nextNarrativeStep
                      }
                      disabled={
                        narrativeIndex >=
                        narrativeSteps.length -
                          1
                      }
                      className="rounded-[13px] border border-white/10 px-2 py-2.5 text-[9px] font-bold uppercase text-slate-400 disabled:opacity-30"
                    >
                      Next
                    </button>

                    <button
                      type="button"
                      onClick={
                        restartNarrative
                      }
                      className="rounded-[13px] border border-white/10 px-2 py-2.5 text-[9px] font-bold uppercase text-slate-400"
                    >
                      Restart
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDemoMode(true)
                      }
                      className="rounded-[13px] border border-violet-300/15 bg-violet-300/[0.05] px-2 py-2.5 text-[9px] font-bold uppercase text-violet-200"
                    >
                      Fullscreen
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {cinematicFocus && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="pointer-events-none absolute inset-0 z-[8] bg-[radial-gradient(circle_at_50%_50%,transparent_24%,rgba(2,6,23,.22)_52%,rgba(2,6,23,.72)_100%)]"
                />
              )}
            </AnimatePresence>

            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={setFlowInstance}
              onNodesChange={onNodesChange}
              onNodeClick={(_, node) => {
                setSelectedEdgeId(null);
                setSelectedId(node.id);
                setHoveredId(null);
              }}
              onEdgeClick={(_, edge) => {
                setHoveredId(null);
                setSelectedEdgeId(edge.id);
              }}
              onPaneClick={() => {
                setHoveredId(null);
                setSelectedEdgeId(null);
              }}
              onNodeMouseEnter={(_, node) => {
                setHoveredId(node.id);
                setSelectedId(node.id);
              }}
              onNodeMouseLeave={() =>
                setHoveredId(null)
              }
              fitView
              nodesDraggable
              nodesConnectable={false}
              minZoom={0.2}
              maxZoom={2}
              defaultEdgeOptions={{
                type: "biological",
                markerEnd: {
                  type:
                    MarkerType.ArrowClosed,
                  color: "#64748b",
                },
              }}
              proOptions={{
                hideAttribution: true,
              }}
            >
              <Background
                gap={32}
                size={1}
                color="rgba(148,163,184,.13)"
              />

              <MiniMap
                nodeColor={(node) =>
                  miniMapColors[
                    node.data
                      .type as EntityType
                  ]
                }
                maskColor="rgba(2,6,23,.76)"
                style={{
                  background:
                    "rgba(7,16,29,.92)",
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  borderRadius: 16,
                }}
              />

              <Controls
                position="bottom-right"
                style={{
                  marginBottom: 82,
                  marginRight: 12,
                  overflow: "hidden",
                  borderRadius: 14,
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  background:
                    "rgba(7,16,29,.92)",
                  boxShadow:
                    "0 18px 50px rgba(0,0,0,.3)",
                }}
              />
            </ReactFlow>
          </section>

          {/* RIGHT INSPECTOR */}
          <aside className="hidden overflow-y-auto border-l border-white/[0.08] bg-[#050814]/82 p-5 backdrop-blur-2xl lg:block">
            <div className="flex items-center justify-between">
              <WorkspaceSectionLabel>
                {selectedEdge
                  ? "Selected relationship"
                  : "Selected entity"}
              </WorkspaceSectionLabel>

              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
                {selectedEdge
                  ? "Edge inspector"
                  : "Node inspector"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {selectedEdge &&
              selectedEdgeSource &&
              selectedEdgeTarget ? (
                <motion.div
                  key={`edge-${selectedEdge.id}`}
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
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                        Relationship
                      </span>

                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
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
                          {selectedEdgeSource.data.label}
                        </p>
                        <p className="mt-1 text-[10px] capitalize text-slate-500">
                          {selectedEdgeSource.data.type}
                        </p>
                      </button>

                      <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300/50 to-cyan-300/10" />
                        <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
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
                          {selectedEdgeTarget.data.label}
                        </p>
                        <p className="mt-1 text-[10px] capitalize text-slate-500">
                          {selectedEdgeTarget.data.type}
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InspectorMetric
                      value="Directed"
                      label="Edge type"
                    />
                    <InspectorMetric
                      value="Extracted"
                      label="Evidence state"
                    />
                  </div>

                  <div className="mt-6 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                      Mechanistic interpretation
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      The graph represents{" "}
                      <span className="font-semibold text-slate-200">
                        {selectedEdgeSource.data.label}
                      </span>{" "}
                      as{" "}
                      <span className="font-semibold text-cyan-200">
                        {selectedEdgeLabel}
                      </span>{" "}
                      <span className="font-semibold text-slate-200">
                        {selectedEdgeTarget.data.label}
                      </span>
                      . This relationship was extracted from the submitted research context and should be verified against primary literature before being treated as causal evidence.
                    </p>
                  </div>

                  <div className="mt-6 rounded-[22px] border border-amber-300/12 bg-amber-300/[0.035] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
                          Confidence
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Graph-level confidence estimate
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
                      {evidenceProfile.description} This is a literature-coverage indicator, not a quality or causality score.
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

                    {pubMedPapers.length === 0 ? (
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
                                PMID {paper.pmid}
                              </p>
                              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-300">
                                {paper.title}
                              </p>
                              <p className="mt-2 text-[9px] text-slate-600">
                                {paper.journal} · {paper.year}
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
              ) : (
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
                <div className="mt-4 rounded-[26px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
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

                <div className="mt-4 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
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

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
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
                  <InspectorPanel
                    code="ROLE_01"
                    title="Biological role"
                    text="This entity contributes to the biological mechanism represented in the submitted research paragraph."
                  />
                </div>

                <div className="mt-6 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                        Connected entities
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Direct biological relationships
                      </p>
                    </div>

                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-slate-400">
                      {relatedConnections.length}
                    </span>
                  </div>

                  {relatedConnections.length === 0 ? (
                    <div className="mt-4 rounded-[16px] border border-white/[0.06] bg-black/20 p-3">
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
                            className="group flex w-full items-center justify-between gap-3 rounded-[16px] border border-white/[0.07] bg-black/20 p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-300/20 hover:bg-violet-300/[0.04]"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${
                                    legendItems.find(
                                      (item) =>
                                        item.key ===
                                        connection.type,
                                    )?.colorClass
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

                            <span className="shrink-0 rounded-[10px] border border-white/[0.08] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 transition group-hover:border-cyan-300/20 group-hover:text-cyan-300">
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

                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-slate-400">
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
                          className="animate-pulse rounded-[16px] border border-white/[0.06] bg-black/20 p-3"
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
                      <div className="mt-4 rounded-[16px] border border-white/[0.06] bg-black/20 p-3">
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
                              className="group block w-full rounded-[17px] border border-white/[0.07] bg-black/20 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
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
                                <p className="mt-2 truncate font-mono text-[8px] text-violet-300/55">
                                  DOI {paper.doi}
                                </p>
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                </div>

                <div className="mt-6 rounded-[22px] border border-violet-300/12 bg-violet-300/[0.045] p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                    BioLayers Copilot
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    Ask the AI to explain this entity,
                    identify mechanisms or generate a
                    research hypothesis.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCopilotOpen(true);
                      setCopilotMode(
                        "explain",
                      );
                    }}
                    className="mt-4 w-full rounded-[14px] bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 px-4 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110"
                  >
                    Ask BioLayers AI
                  </button>
                </div>
              </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </section>

        <button
          type="button"
          onClick={() =>
            setCopilotOpen(true)
          }
          className={`fixed bottom-5 right-5 z-[80] items-center gap-2 rounded-full ${
            demoMode
              ? "hidden"
              : "hidden lg:flex"
          } border border-violet-300/20 bg-[linear-gradient(135deg,rgba(139,92,246,.92),rgba(34,211,238,.88))] px-4 py-3 text-xs font-bold text-white shadow-[0_18px_60px_rgba(139,92,246,.28)] transition hover:-translate-y-1 hover:brightness-110`}
        >
          <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]" />
          Copilot
        </button>

        <AnimatePresence>
          {copilotOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close BioLayers Copilot"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setCopilotOpen(false)
                }
                className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px]"
              />

              <motion.aside
                initial={{
                  opacity: 0,
                  x: 60,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 60,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed bottom-0 right-0 top-0 z-[100] flex w-full flex-col border-l border-white/[0.09] bg-[#050814]/96 shadow-[-30px_0_100px_rgba(0,0,0,.42)] backdrop-blur-3xl sm:w-[520px]"
              >
                <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-violet-300">
                      BioLayers Copilot
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {selectedEntity.label}
                    </h2>

                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {selectedEntity.type} ·{" "}
                      {relatedConnections.length} direct links ·{" "}
                      {pubMedPapers.length} papers
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCopilotOpen(false)
                    }
                    className="rounded-[12px] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="border-b border-white/[0.08] px-5 py-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {(
                      [
                        [
                          "explain",
                          "Explain",
                        ],
                        [
                          "mechanism",
                          "Mechanism",
                        ],
                        [
                          "hypothesis",
                          "Hypothesis",
                        ],
                        [
                          "limitations",
                          "Limits",
                        ],
                        [
                          "simplify",
                          "Simplify",
                        ],
                      ] as Array<
                        [
                          CopilotMode,
                          string,
                        ]
                      >
                    ).map(
                      ([mode, label]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setCopilotMode(
                              mode,
                            );
                            void askCopilot(
                              mode,
                            );
                          }}
                          disabled={
                            copilotLoading
                          }
                          className={`rounded-[13px] border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition ${
                            copilotMode ===
                            mode
                              ? "border-violet-300/25 bg-violet-300/[0.09] text-violet-200"
                              : "border-white/[0.08] bg-white/[0.025] text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                  {copilotMessages.length ===
                    0 &&
                    !copilotLoading && (
                      <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(139,92,246,.07),rgba(34,211,238,.035))] p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                          Grounded context
                        </p>

                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          Copilot will use the selected entity, the research paragraph, direct graph relationships and the loaded PubMed metadata.
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <CopilotContextMetric
                            label="Links"
                            value={String(
                              relatedConnections.length,
                            )}
                          />
                          <CopilotContextMetric
                            label="Papers"
                            value={String(
                              pubMedPapers.length,
                            )}
                          />
                          <CopilotContextMetric
                            label="Mode"
                            value="AI"
                          />
                        </div>
                      </div>
                    )}

                  <div className="space-y-4">
                    {copilotMessages.map(
                      (message) =>
                        message.role ===
                        "user" ? (
                          <div
                            key={message.id}
                            className="ml-auto max-w-[86%] rounded-[20px] rounded-br-[6px] bg-gradient-to-r from-violet-400 to-cyan-300 px-4 py-3 text-sm leading-6 text-slate-950 shadow-[0_12px_30px_rgba(139,92,246,.16)]"
                          >
                            {
                              message.content
                            }
                          </div>
                        ) : (
                          <div
                            key={message.id}
                            className="rounded-[22px] border border-white/[0.08] bg-white/[0.028] p-5"
                          >
                            {message.title && (
                              <h3 className="text-lg font-semibold tracking-[-0.025em] text-white">
                                {
                                  message.title
                                }
                              </h3>
                            )}

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                              {
                                message.content
                              }
                            </p>

                            {message.keyPoints &&
                              message
                                .keyPoints
                                .length >
                                0 && (
                                <div className="mt-5">
                                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                                    Key points
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {message.keyPoints.map(
                                      (
                                        point,
                                        index,
                                      ) => (
                                        <div
                                          key={`${message.id}-point-${index}`}
                                          className="flex gap-3 rounded-[14px] border border-white/[0.06] bg-black/20 p-3"
                                        >
                                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                                          <p className="text-xs leading-6 text-slate-400">
                                            {
                                              point
                                            }
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {message.limitations &&
                              message
                                .limitations
                                .length >
                                0 && (
                                <div className="mt-5 rounded-[16px] border border-amber-300/12 bg-amber-300/[0.035] p-4">
                                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300">
                                    Limitations
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {message.limitations.map(
                                      (
                                        limitation,
                                        index,
                                      ) => (
                                        <p
                                          key={`${message.id}-limitation-${index}`}
                                          className="text-xs leading-6 text-amber-100/65"
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

                            {message.citations &&
                              message
                                .citations
                                .length >
                                0 && (
                                <div className="mt-5">
                                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300">
                                    Supplied PubMed references
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {message.citations.map(
                                      (
                                        citation,
                                      ) => (
                                        <a
                                          key={`${message.id}-${citation.pmid}`}
                                          href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block rounded-[14px] border border-white/[0.06] bg-black/20 p-3 transition hover:border-violet-300/20 hover:bg-violet-300/[0.035]"
                                        >
                                          <p className="font-mono text-[8px] text-violet-300/70">
                                            PMID{" "}
                                            {
                                              citation.pmid
                                            }
                                          </p>

                                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
                                            {
                                              citation.title
                                            }
                                          </p>

                                          <p className="mt-2 text-[10px] leading-5 text-slate-600">
                                            {
                                              citation.support
                                            }
                                          </p>
                                        </a>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {message.followUpQuestions &&
                              message
                                .followUpQuestions
                                .length >
                                0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                  {message.followUpQuestions.map(
                                    (
                                      question,
                                      index,
                                    ) => (
                                      <button
                                        key={`${message.id}-follow-${index}`}
                                        type="button"
                                        onClick={() => {
                                          setCopilotMode(
                                            "custom",
                                          );
                                          setCopilotQuestion(
                                            question,
                                          );
                                          void askCopilot(
                                            "custom",
                                            question,
                                          );
                                        }}
                                        disabled={
                                          copilotLoading
                                        }
                                        className="rounded-full border border-cyan-300/12 bg-cyan-300/[0.035] px-3 py-2 text-[10px] font-semibold text-cyan-200/75 transition hover:bg-cyan-300/[0.08] disabled:opacity-40"
                                      >
                                        {
                                          question
                                        }
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        ),
                    )}
                  </div>

                  {copilotLoading && (
                    <div className="mt-4 rounded-[22px] border border-violet-300/12 bg-violet-300/[0.035] p-5">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300 shadow-[0_0_12px_#c4b5fd]" />
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
                          Copilot is reasoning
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="h-2.5 w-full animate-pulse rounded-full bg-white/[0.06]" />
                        <div className="h-2.5 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
                        <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-white/[0.05]" />
                      </div>
                    </div>
                  )}

                  {copilotError && (
                    <div className="mt-4 rounded-[18px] border border-rose-300/15 bg-rose-300/[0.04] p-4">
                      <p className="text-xs leading-6 text-rose-200">
                        {
                          copilotError
                        }
                      </p>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void askCopilot(
                      "custom",
                    );
                  }}
                  className="border-t border-white/[0.08] p-4"
                >
                  <div className="rounded-[20px] border border-white/[0.1] bg-black/25 p-2">
                    <textarea
                      value={copilotQuestion}
                      onChange={(event) => {
                        setCopilotQuestion(
                          event.target
                            .value,
                        );
                        setCopilotMode(
                          "custom",
                        );
                        setCopilotError(
                          "",
                        );
                      }}
                      placeholder={`Ask about ${selectedEntity.label}...`}
                      rows={3}
                      className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                    />

                    <div className="flex items-center justify-between gap-3 px-2 pb-1">
                      <p className="text-[9px] text-slate-600">
                        Grounded in graph + PubMed
                      </p>

                      <button
                        type="submit"
                        disabled={
                          copilotLoading
                        }
                        className="rounded-[13px] bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copilotLoading
                          ? "Thinking..."
                          : "Ask"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedPaper && (
            <>
              <motion.button
                type="button"
                aria-label="Close paper inspector"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setSelectedPaper(null)
                }
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-[3px]"
              />

              <motion.aside
                initial={{
                  opacity: 0,
                  x: 70,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 70,
                  scale: 0.985,
                }}
                transition={{
                  duration: 0.38,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed bottom-0 right-0 top-0 z-[120] flex w-full flex-col overflow-hidden border-l border-white/[0.1] bg-[#050814]/97 shadow-[-35px_0_110px_rgba(0,0,0,.48)] backdrop-blur-3xl sm:w-[560px]"
              >
                <div className="relative overflow-hidden border-b border-white/[0.08] px-5 py-5 sm:px-6">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-[80px]" />
                  <div className="pointer-events-none absolute -left-20 bottom-[-80px] h-52 w-52 rounded-full bg-violet-500/10 blur-[80px]" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                        Paper Inspector
                      </p>

                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
                        PMID {selectedPaper.pmid}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPaper(null)
                      }
                      className="rounded-[12px] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
                  <div className="rounded-[28px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(34,211,238,.055),rgba(139,92,246,.035))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-200">
                        {selectedPaper.journal}
                      </span>

                      <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-semibold text-slate-500">
                        {selectedPaper.year}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-semibold leading-[1.22] tracking-[-0.035em] text-white sm:text-3xl">
                      {selectedPaper.title}
                    </h2>

                    {selectedPaper.authors.length >
                      0 && (
                      <p className="mt-5 text-sm leading-7 text-slate-400">
                        {selectedPaper.authors.join(
                          ", ",
                        )}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <PaperMetric
                      label="PMID"
                      value={selectedPaper.pmid}
                    />

                    <PaperMetric
                      label="Publication year"
                      value={selectedPaper.year}
                    />
                  </div>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                      Why this paper matters
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      This paper was retrieved by PubMed for{" "}
                      <span className="font-semibold text-slate-200">
                        {selectedEntity.label}
                      </span>
                      . Its title and metadata provide literature context for the selected entity, but they do not by themselves establish that every graph relationship is experimentally proven.
                    </p>
                  </section>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      Context in BioLayers
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[17px] border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                          Selected entity
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          {selectedEntity.label}
                        </p>

                        <p className="mt-1 text-[10px] capitalize text-cyan-300/70">
                          {selectedEntity.type}
                        </p>
                      </div>

                      <div className="rounded-[17px] border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                          Evidence source
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          PubMed
                        </p>

                        <p className="mt-1 text-[10px] text-violet-300/70">
                          Live literature metadata
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
                      Evidence limits
                    </p>

                    <div className="mt-4 space-y-3">
                      {[
                        "The current PubMed route supplies title, journal, year, authors, PMID and DOI metadata.",
                        "Abstract, methods, results and full-text claims are not yet loaded into BioLayers.",
                        "The paper should be opened and reviewed before using it to support a mechanistic conclusion.",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex gap-3 rounded-[16px] border border-white/[0.06] bg-black/20 p-3"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />

                          <p className="text-xs leading-6 text-slate-500">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Article identifiers
                    </p>

                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        onClick={() =>
                          void copyPaperIdentifier(
                            selectedPaper.pmid,
                            "PMID",
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 rounded-[16px] border border-white/[0.07] bg-black/20 px-4 py-3 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                      >
                        <span>
                          <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                            PMID
                          </span>

                          <span className="mt-1 block font-mono text-xs text-slate-300">
                            {selectedPaper.pmid}
                          </span>
                        </span>

                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-300/70">
                          Copy
                        </span>
                      </button>

                      {selectedPaper.doi && (
                        <button
                          type="button"
                          onClick={() =>
                            void copyPaperIdentifier(
                              selectedPaper.doi ||
                                "",
                              "DOI",
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 rounded-[16px] border border-white/[0.07] bg-black/20 px-4 py-3 text-left transition hover:border-violet-300/20 hover:bg-violet-300/[0.035]"
                        >
                          <span className="min-w-0">
                            <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                              DOI
                            </span>

                            <span className="mt-1 block truncate font-mono text-xs text-slate-300">
                              {selectedPaper.doi}
                            </span>
                          </span>

                          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-300/70">
                            Copy
                          </span>
                        </button>
                      )}
                    </div>

                    {paperCopyMessage && (
                      <p className="mt-3 text-[10px] font-semibold text-emerald-300">
                        {paperCopyMessage}
                      </p>
                    )}
                  </section>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] p-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPaper(null)
                    }
                    className="rounded-[15px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Back
                  </button>

                  <a
                    href={selectedPaper.pubmedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[15px] bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-4 py-3 text-center text-xs font-bold text-slate-950 transition hover:brightness-110"
                  >
                    Open PubMed ↗
                  </a>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <nav
          className={`fixed bottom-[76px] left-3 right-3 z-[70] grid-cols-5 gap-1 rounded-[18px] ${
            demoMode
              ? "hidden"
              : "grid lg:hidden"
          } border border-white/[0.1] bg-[#07101d]/94 p-1.5 shadow-2xl backdrop-blur-2xl`}
        >
          {(
            [
              ["graph", "Graph"],
              ["evidence", "Evidence"],
              ["citations", "Citations"],
              ["timeline", "Timeline"],
              ["pubmed", "PubMed"],
            ] as Array<
              [WorkspaceView, string]
            >
          ).map(([view, label]) => (
            <button
              key={view}
              type="button"
              onClick={() =>
                setWorkspaceView(view)
              }
              className={`rounded-[12px] px-1 py-2 text-[8px] font-bold uppercase ${
                workspaceView === view
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-500"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile status strip */}
        <div
          className={`absolute bottom-3 left-3 right-3 z-50 items-center justify-between rounded-[18px] ${
            demoMode
              ? "hidden"
              : "flex lg:hidden"
          } border border-white/[0.1] bg-[#07101d]/92 px-4 py-3 shadow-2xl backdrop-blur-2xl`}
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {selectedEntity.label}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-cyan-300">
              {selectedEntity.type} ·{" "}
              {selectedConnectionCount} links
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void resetView()
            }
            className="rounded-[12px] border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300"
          >
            Fit graph
          </button>
        </div>
      </main>
    </>
  );
}

function WorkspaceSectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[9px] font-bold uppercase tracking-[0.24em] text-slate-600 ${className}`}
    >
      {children}
    </p>
  );
}

function ProjectMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[13px] border border-white/[0.06] bg-black/20 px-2 py-2.5 text-center">
      <p className="text-sm font-semibold text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-600">
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

function CellAtlasMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[76px] rounded-[15px] border border-white/[0.08] bg-black/20 px-3 py-3 text-center">
      <p className="text-lg font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

function AtlasProperty({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] border border-white/[0.06] bg-black/20 px-4 py-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </span>
      <span className="max-w-[66%] break-words text-right font-mono text-[10px] text-slate-300">
        {value}
      </span>
    </div>
  );
}

function PaperMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-base font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function CopilotContextMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-black/20 px-3 py-3 text-center">
      <p className="text-base font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
    </div>
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

function InspectorMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="truncate text-lg font-semibold capitalize text-white">
        {value}
      </p>
      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

function InspectorPanel({
  code,
  title,
  text,
}: {
  code: string;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-[20px] border border-white/[0.08] bg-white/[0.028] p-4 transition hover:border-cyan-300/15 hover:bg-cyan-300/[0.035]"
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