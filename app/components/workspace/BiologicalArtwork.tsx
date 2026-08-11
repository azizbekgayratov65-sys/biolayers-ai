"use client";

import { motion } from "framer-motion";
import type { EntityType } from "../../lib/buildGraphFromText";

export const entityVisualTheme: Record<
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
  gene: {
    accent: "#34d399",
    accentSoft: "rgba(52,211,153,.18)",
    secondary: "#22d3ee",
    border: "rgba(110,231,183,.42)",
    glow: "rgba(52,211,153,.36)",
    label: "Gene",
  },
  drug: {
    accent: "#f59e0b",
    accentSoft: "rgba(245,158,11,.18)",
    secondary: "#fb7185",
    border: "rgba(252,211,77,.42)",
    glow: "rgba(245,158,11,.36)",
    label: "Drug / therapy",
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
  | "disease"
  | "gene"
  | "drug" {
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

export default function BiologicalArtwork({
  type,
  label,
  active,
}: {
  type: EntityType;
  label: string;
  active: boolean;
}) {
  const theme = entityVisualTheme[type];
  const semanticVisual = getSemanticVisual(
    label,
    type,
  );
  const visual =
    semanticVisual === "gene"
      ? "protein"
      : semanticVisual === "drug"
        ? "pathway"
        : semanticVisual;

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