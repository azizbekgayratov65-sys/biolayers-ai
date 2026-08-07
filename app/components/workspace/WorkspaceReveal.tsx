"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type WorkspaceRevealProps = {
  active: boolean;
  onComplete: () => void;
};

type AnalysisStep = {
  label: string;
  description: string;
  accent: string;
};

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    label: "Reading research paragraph",
    description:
      "Parsing terminology and scientific context.",
    accent: "#67e8f9",
  },
  {
    label: "Extracting biological entities",
    description:
      "Identifying cells, proteins, pathways and diseases.",
    accent: "#a78bfa",
  },
  {
    label: "Mapping relationships",
    description:
      "Connecting biological mechanisms and interactions.",
    accent: "#f0abfc",
  },
  {
    label: "Connecting scientific evidence",
    description:
      "Preparing PubMed and citation discovery.",
    accent: "#60a5fa",
  },
  {
    label: "Knowledge graph ready",
    description:
      "Opening the BioLayers workspace.",
    accent: "#ffffff",
  },
];

const TOTAL_DURATION = 4300;
const COMPLETION_DELAY = 500;

const ENTITY_LABELS = [
  "CAF",
  "CXCL12",
  "TGF-β",
  "SMAD",
  "ECM",
  "EMT",
  "Bone niche",
  "Tumor cell",
];

const PAPER_LINES = [
  "Cancer-associated fibroblasts promote metastatic progression",
  "through cytokine signaling and extracellular matrix remodeling.",
  "CXCL12-mediated communication contributes to tumor-stroma crosstalk.",
  "Mechanistic evidence suggests pathway-level interactions.",
];

const GRAPH_EDGES = [
  [0, 1],
  [0, 4],
  [2, 3],
  [1, 5],
  [5, 7],
  [4, 6],
  [6, 7],
] as const;

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

export default function WorkspaceReveal({
  active,
  onComplete,
}: WorkspaceRevealProps) {
  const reduceMotion =
    useReducedMotion();

  const [stepIndex, setStepIndex] =
    useState(0);

  const [progress, setProgress] =
    useState(0);

  const animationFrameRef =
    useRef<number | null>(null);

  const completionTimerRef =
    useRef<number | null>(null);

  const hasCompletedRef =
    useRef(false);

  const entityPositions = useMemo(
    () => [
      { x: 50, y: 24 },
      { x: 70, y: 34 },
      { x: 31, y: 34 },
      { x: 23, y: 54 },
      { x: 45, y: 61 },
      { x: 68, y: 57 },
      { x: 38, y: 78 },
      { x: 66, y: 79 },
    ],
    [],
  );

  const completeReveal =
    useCallback(() => {
      if (
        hasCompletedRef.current
      ) {
        return;
      }

      hasCompletedRef.current =
        true;

      onComplete();
    }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setProgress(0);
      hasCompletedRef.current =
        false;

      return;
    }

    hasCompletedRef.current =
      false;

    if (reduceMotion) {
      setStepIndex(
        ANALYSIS_STEPS.length - 1,
      );
      setProgress(1);

      completionTimerRef.current =
        window.setTimeout(
          completeReveal,
          500,
        );

      return;
    }

    const startedAt =
      performance.now();

    function animate(
      currentTime: number,
    ) {
      const elapsed =
        currentTime - startedAt;

      const normalizedProgress =
        clamp(
          elapsed /
            TOTAL_DURATION,
          0,
          1,
        );

      const calculatedStepIndex =
        clamp(
          Math.floor(
            normalizedProgress *
              ANALYSIS_STEPS.length,
          ),
          0,
          ANALYSIS_STEPS.length -
            1,
        );

      setProgress(
        normalizedProgress,
      );

      setStepIndex(
        calculatedStepIndex,
      );

      if (
        normalizedProgress < 1
      ) {
        animationFrameRef.current =
          window.requestAnimationFrame(
            animate,
          );

        return;
      }

      completionTimerRef.current =
        window.setTimeout(
          completeReveal,
          COMPLETION_DELAY,
        );
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }

      if (
        completionTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          completionTimerRef.current,
        );
      }
    };
  }, [
    active,
    completeReveal,
    reduceMotion,
  ]);

  if (!active) {
    return null;
  }

  const safeStepIndex = clamp(
    Number.isFinite(stepIndex)
      ? stepIndex
      : 0,
    0,
    ANALYSIS_STEPS.length - 1,
  );

  const activeStep =
    ANALYSIS_STEPS[
      safeStepIndex
    ] ?? ANALYSIS_STEPS[0];

  const safeProgress = clamp(
    Number.isFinite(progress)
      ? progress
      : 0,
    0,
    1,
  );

  const stageProgress =
    safeProgress *
    ANALYSIS_STEPS.length;

  const showPaper =
    stageProgress < 1.4;

  const showEntities =
    stageProgress >= 0.72 &&
    stageProgress < 3.8;

  const showGraph =
    stageProgress >= 1.6;

  const showEvidence =
    stageProgress >= 2.8;

  const finalStage =
    safeStepIndex ===
    ANALYSIS_STEPS.length - 1;

  return (
    <motion.div
      initial={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        scale: 1.06,
        filter: "blur(18px)",
      }}
      transition={{
        duration: 0.72,
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
      className="fixed inset-0 z-[200] overflow-hidden bg-[#01030a]"
    >
      {/* Space / lab background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(34,211,238,.09),transparent_28%),radial-gradient(circle_at_72%_30%,rgba(139,92,246,.12),transparent_33%),radial-gradient(circle_at_25%_74%,rgba(236,72,153,.09),transparent_30%),linear-gradient(180deg,#01030a_0%,#030712_60%,#01030a_100%)]" />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition:
                  [
                    "0px 0px",
                    "64px 64px",
                  ],
              }
        }
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)
          `,
          backgroundSize:
            "64px 64px",
        }}
      />

      {/* Atmospheric glow */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  0.86,
                  1.14,
                  0.86,
                ],
                opacity: [
                  0.12,
                  0.3,
                  0.12,
                ],
              }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[130px]"
      />

      {/* Scanner */}
      {!reduceMotion && (
        <motion.div
          animate={{
            y: [
              "-10vh",
              "110vh",
            ],
          }}
          transition={{
            duration: 2.25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent shadow-[0_0_26px_rgba(103,232,249,.85)]"
        />
      )}

      {/* LEFT — transforming source */}
      <div className="absolute inset-y-0 left-0 hidden w-[42%] items-center justify-center px-10 lg:flex">
        <AnimatePresence mode="wait">
          {showPaper && (
            <motion.div
              key="paper"
              initial={{
                opacity: 0,
                x: -32,
                rotateY: -8,
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotateY: 0,
              }}
              exit={{
                opacity: 0,
                x: -80,
                scale: 0.9,
                filter:
                  "blur(8px)",
              }}
              transition={{
                duration: 0.55,
              }}
              className="relative w-full max-w-[480px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#07111f]/72 p-6 shadow-[0_28px_100px_rgba(0,0,0,.38)] backdrop-blur-xl"
              style={{
                transformStyle:
                  "preserve-3d",
              }}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-[70px]" />

              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                Research paragraph
              </p>

              <div className="mt-5 space-y-3">
                {PAPER_LINES.map(
                  (
                    line,
                    index,
                  ) => (
                    <motion.div
                      key={line}
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.08,
                      }}
                      className="relative overflow-hidden rounded-[13px] border border-white/[0.05] bg-white/[0.025] px-4 py-3"
                    >
                      <p className="text-xs leading-6 text-slate-400">
                        {line}
                      </p>

                      <motion.span
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                x: [
                                  "-120%",
                                  "260%",
                                ],
                              }
                        }
                        transition={{
                          duration:
                            1.25,
                          repeat:
                            Infinity,
                          delay:
                            index *
                            0.17,
                          ease: "linear",
                        }}
                        className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-cyan-200/12 to-transparent"
                      />
                    </motion.div>
                  ),
                )}
              </div>
            </motion.div>
          )}

          {!showPaper &&
            !finalStage && (
              <motion.div
                key="tokens"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.1,
                }}
                className="grid w-full max-w-[480px] grid-cols-2 gap-3"
              >
                {ENTITY_LABELS.map(
                  (
                    entity,
                    index,
                  ) => (
                    <motion.div
                      key={entity}
                      initial={{
                        opacity: 0,
                        y: 24,
                        scale: 0.82,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        delay:
                          index *
                            0.055,
                        duration:
                          0.4,
                      }}
                      className="rounded-[18px] border border-cyan-300/12 bg-cyan-300/[0.035] px-4 py-4 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              index %
                                3 ===
                              0
                                ? "#67e8f9"
                                : index %
                                      3 ===
                                    1
                                  ? "#a78bfa"
                                  : "#f472b6",
                            boxShadow:
                              "0 0 14px currentColor",
                          }}
                        />

                        <span className="text-sm font-semibold text-white">
                          {
                            entity
                          }
                        </span>
                      </div>

                      <p className="mt-2 text-[8px] uppercase tracking-[0.14em] text-slate-600">
                        extracted entity
                      </p>
                    </motion.div>
                  ),
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* CENTER / RIGHT — graph assembly */}
      <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[7vw]">
        <div className="relative h-[62vh] w-[min(720px,88vw)]">
          {/* Connecting edges */}
          {showGraph &&
            GRAPH_EDGES.map(
              (
                [from, to],
                edgeIndex,
              ) => {
                const fromPoint =
                  entityPositions[
                    from
                  ];

                const toPoint =
                  entityPositions[
                    to
                  ];

                const x1 =
                  fromPoint.x;
                const y1 =
                  fromPoint.y;
                const x2 =
                  toPoint.x;
                const y2 =
                  toPoint.y;

                const dx =
                  x2 - x1;
                const dy =
                  y2 - y1;

                const length =
                  Math.sqrt(
                    dx * dx +
                      dy * dy,
                  );

                const angle =
                  Math.atan2(
                    dy,
                    dx,
                  ) *
                  (180 /
                    Math.PI);

                return (
                  <motion.div
                    key={`${from}-${to}`}
                    initial={{
                      opacity: 0,
                      scaleX: 0,
                    }}
                    animate={{
                      opacity:
                        finalStage
                          ? 0.75
                          : 0.44,
                      scaleX: 1,
                    }}
                    transition={{
                      delay:
                        0.08 *
                        edgeIndex,
                      duration:
                        0.45,
                    }}
                    className="absolute h-px origin-left bg-gradient-to-r from-cyan-300/20 via-white/55 to-violet-300/20"
                    style={{
                      left: `${x1}%`,
                      top: `${y1}%`,
                      width: `${length}%`,
                      transform: `rotate(${angle}deg)`,
                      boxShadow:
                        "0 0 14px rgba(103,232,249,.28)",
                    }}
                  >
                    {!reduceMotion && (
                      <motion.span
                        animate={{
                          x: [
                            "0%",
                            "100%",
                          ],
                        }}
                        transition={{
                          duration:
                            1.3 +
                            edgeIndex *
                              0.04,
                          repeat:
                            Infinity,
                          ease: "linear",
                        }}
                        className="absolute -top-[2px] h-1 w-6 rounded-full bg-white shadow-[0_0_12px_white,0_0_18px_#67e8f9]"
                      />
                    )}
                  </motion.div>
                );
              },
            )}

          {/* Graph nodes */}
          {showEntities &&
            entityPositions.map(
              (
                point,
                index,
              ) => (
                <motion.div
                  key={
                    ENTITY_LABELS[
                      index
                    ]
                  }
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale:
                      finalStage
                        ? 1.08
                        : 1,
                  }}
                  transition={{
                    delay:
                      index *
                        0.045,
                    duration:
                      0.4,
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1,
                    ],
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                >
                  <motion.div
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: [
                              0.94,
                              1.06,
                              0.94,
                            ],
                          }
                    }
                    transition={{
                      duration:
                        1.9 +
                        index *
                          0.07,
                      repeat:
                        Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex min-w-[104px] items-center gap-2 rounded-[15px] border border-white/[0.12] bg-[#07111f]/90 px-3 py-2.5 shadow-[0_12px_34px_rgba(0,0,0,.34)] backdrop-blur-xl"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background:
                          index %
                            3 ===
                          0
                            ? "#67e8f9"
                            : index %
                                  3 ===
                                1
                              ? "#a78bfa"
                              : "#f472b6",
                        boxShadow:
                          "0 0 14px currentColor",
                      }}
                    />

                    <span className="whitespace-nowrap text-[10px] font-semibold text-slate-200">
                      {
                        ENTITY_LABELS[
                          index
                        ]
                      }
                    </span>
                  </motion.div>
                </motion.div>
              ),
            )}

          {/* Core intelligence sphere */}
          <motion.div
            animate={{
              scale: finalStage
                ? [
                    1,
                    1.24,
                    1.02,
                  ]
                : [
                    0.94,
                    1.06,
                    0.94,
                  ],
              opacity:
                finalStage
                  ? [
                      0.8,
                      1,
                      0.9,
                    ]
                  : 1,
            }}
            transition={{
              duration:
                finalStage
                  ? 0.85
                  : 1.8,
              repeat:
                Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border border-cyan-300/30"
            />

            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-3 rounded-full border border-violet-300/35"
            />

            <div className="h-8 w-8 rounded-full bg-white shadow-[0_0_22px_white,0_0_54px_#67e8f9,0_0_90px_#8b5cf6]" />
          </motion.div>

          {/* Evidence badges */}
          {showEvidence && (
            <>
              <motion.div
                initial={{
                  opacity: 0,
                  x: 18,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="absolute right-[4%] top-[17%] rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-emerald-200"
              >
                Evidence linked
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  x: -18,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="absolute bottom-[15%] left-[7%] rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-cyan-200"
              >
                PubMed connected
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Final interface framing */}
      <AnimatePresence>
        {finalStage && (
          <>
            <motion.div
              initial={{
                opacity: 0,
                y: -36,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="absolute inset-x-0 top-0 h-14 border-b border-white/[0.07] bg-[#050814]/68 backdrop-blur-xl"
            />

            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="absolute bottom-0 left-0 top-14 hidden w-20 border-r border-white/[0.07] bg-[#050814]/54 lg:block"
            />

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="absolute bottom-0 right-0 top-14 hidden w-20 border-l border-white/[0.07] bg-[#050814]/54 lg:block"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: [
                  0,
                  1,
                  0,
                ],
                scale: [
                  0.7,
                  1.15,
                  1.7,
                ],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="absolute left-1/2 top-1/2 h-[48vmin] w-[48vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45 shadow-[0_0_80px_rgba(103,232,249,.35)]"
            />
          </>
        )}
      </AnimatePresence>

      {/* Status UI */}
      <div className="absolute inset-x-0 bottom-7 z-20 px-6">
        <div className="mx-auto max-w-3xl rounded-[22px] border border-white/[0.08] bg-[#050814]/66 p-4 shadow-[0_22px_70px_rgba(0,0,0,.3)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                BioLayers intelligence engine
              </p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    activeStep.label
                  }
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration:
                      0.3,
                  }}
                >
                  <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                    {
                      activeStep.label
                    }
                  </p>

                  <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">
                    {
                      activeStep.description
                    }
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-sm font-semibold text-white">
                {Math.round(
                  safeProgress *
                    100,
                )}
                %
              </p>

              <p
                className="mt-1 text-[8px] uppercase tracking-[0.16em]"
                style={{
                  color:
                    activeStep.accent,
                }}
              >
                Stage{" "}
                {safeStepIndex +
                  1}
                /5
              </p>
            </div>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              animate={{
                width: `${safeProgress * 100}%`,
              }}
              transition={{
                duration: 0.08,
                ease: "linear",
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 shadow-[0_0_18px_rgba(103,232,249,.7)]"
            />
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {ANALYSIS_STEPS.map(
              (
                step,
                index,
              ) => {
                const completed =
                  index <
                  safeStepIndex;

                const isActive =
                  index ===
                  safeStepIndex;

                return (
                  <div
                    key={
                      step.label
                    }
                    className="text-center"
                  >
                    <motion.div
                      animate={{
                        scale:
                          isActive
                            ? [
                                1,
                                1.35,
                                1,
                              ]
                            : 1,
                      }}
                      transition={{
                        duration: 0.8,
                        repeat:
                          isActive
                            ? Infinity
                            : 0,
                      }}
                      className={`mx-auto h-2 w-2 rounded-full border ${
                        completed
                          ? "border-cyan-300 bg-cyan-300 shadow-[0_0_12px_#22d3ee]"
                          : isActive
                            ? "border-white bg-white shadow-[0_0_15px_white,0_0_24px_#8b5cf6]"
                            : "border-white/15 bg-white/[0.03]"
                      }`}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Final flash */}
      {finalStage && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [
              0,
              0.28,
              0,
            ],
          }}
          transition={{
            duration: 0.7,
          }}
          className="pointer-events-none absolute inset-0 bg-white"
        />
      )}
    </motion.div>
  );
}