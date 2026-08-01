"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useCallback,
  useEffect,
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
};

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    label: "Reading research paragraph",
    description:
      "Parsing terminology and scientific context.",
  },
  {
    label: "Extracting biological entities",
    description:
      "Identifying cells, proteins, pathways and diseases.",
  },
  {
    label: "Mapping relationships",
    description:
      "Connecting biological mechanisms and interactions.",
  },
  {
    label: "Connecting scientific evidence",
    description:
      "Preparing PubMed and citation discovery.",
  },
  {
    label: "Knowledge graph ready",
    description:
      "Opening the BioLayers workspace.",
  },
];

const TOTAL_DURATION = 3600;
const COMPLETION_DELAY = 450;

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

  const completeReveal = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setProgress(0);
      hasCompletedRef.current = false;

      return;
    }

    hasCompletedRef.current = false;

    const startedAt = performance.now();

    function animate(currentTime: number) {
      const elapsed =
        currentTime - startedAt;

      const normalizedProgress = clamp(
        elapsed / TOTAL_DURATION,
        0,
        1,
      );

      const calculatedStepIndex = clamp(
        Math.floor(
          normalizedProgress *
            ANALYSIS_STEPS.length,
        ),
        0,
        ANALYSIS_STEPS.length - 1,
      );

      setProgress(normalizedProgress);
      setStepIndex(calculatedStepIndex);

      if (normalizedProgress < 1) {
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
        animationFrameRef.current !== null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }

      if (
        completionTimerRef.current !== null
      ) {
        window.clearTimeout(
          completionTimerRef.current,
        );
      }
    };
  }, [active, completeReveal]);

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
    ANALYSIS_STEPS[safeStepIndex] ??
    ANALYSIS_STEPS[0];

  const safeProgress = clamp(
    Number.isFinite(progress)
      ? progress
      : 0,
    0,
    1,
  );

  return (
    <motion.div
      initial={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: "blur(18px)",
      }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-0 z-[200] overflow-hidden bg-[#020617]"
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.17),transparent_38%),radial-gradient(circle_at_72%_28%,rgba(147,51,234,0.16),transparent_34%),radial-gradient(circle_at_25%_75%,rgba(236,72,153,0.13),transparent_32%)]" />

      {/* Scientific grid */}
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:52px_52px]" />

      {/* Animated glowing clouds */}
      <motion.div
        animate={{
          x: [-40, 45, -40],
          y: [-20, 35, -20],
          scale: [0.9, 1.18, 0.9],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[18%] top-[20%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[110px]"
      />

      <motion.div
        animate={{
          x: [35, -45, 35],
          y: [20, -30, 20],
          scale: [1.1, 0.88, 1.1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[14%] right-[18%] h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[125px]"
      />

      {/* Expanding analysis rings */}
      <motion.div
        animate={{
          scale: [0.7, 1.5],
          opacity: [0.55, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25"
      />

      <motion.div
        animate={{
          scale: [0.62, 1.28],
          opacity: [0.48, 0],
        }}
        transition={{
          duration: 2.4,
          delay: 0.7,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20"
      />

      {/* Vertical scanner */}
      <motion.div
        animate={{
          y: ["-10vh", "110vh"],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_28px_rgba(103,232,249,0.8)]"
      />

      <motion.div
        animate={{
          y: ["-18vh", "102vh"],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent blur-2xl"
      />

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl">
          {/* Analysis core */}
          <div className="relative mx-auto mb-12 flex h-32 w-32 items-center justify-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border border-dashed border-cyan-300/55"
            />

            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-3 rounded-full border border-violet-400/50"
            />

            <motion.div
              animate={{
                rotate: 360,
                scale: [0.92, 1.07, 0.92],
              }}
              transition={{
                rotate: {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "linear",
                },

                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute inset-7 rounded-full border border-fuchsia-400/55"
            />

            <motion.div
              animate={{
                scale: [0.75, 1.25, 0.75],
                opacity: [0.68, 1, 0.68],
              }}
              transition={{
                duration: 1.25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-9 w-9 rounded-full bg-white shadow-[0_0_20px_white,0_0_50px_#22d3ee,0_0_90px_#8b5cf6,0_0_130px_#ec4899]"
            />

            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-[-18px] rounded-full"
            >
              <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_#67e8f9]" />

              <span className="absolute bottom-3 right-2 h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_14px_#f0abfc]" />
            </motion.div>
          </div>

          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
            BioLayers intelligence engine
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.label}
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
                y: -16,
                filter: "blur(10px)",
              }}
              transition={{
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-5 text-center"
            >
              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                {activeStep.label}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {activeStep.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <span>
                Stage {safeStepIndex + 1}/
                {ANALYSIS_STEPS.length}
              </span>

              <span className="font-mono text-cyan-300">
                {Math.round(
                  safeProgress * 100,
                )}
                %
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{
                  width: `${safeProgress * 100}%`,
                }}
                transition={{
                  duration: 0.1,
                  ease: "linear",
                }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_20px_rgba(103,232,249,0.8)]"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-5 gap-2">
            {ANALYSIS_STEPS.map(
              (step, index) => {
                const completed =
                  index < safeStepIndex;

                const isActive =
                  index === safeStepIndex;

                return (
                  <div
                    key={step.label}
                    className="text-center"
                  >
                    <motion.div
                      animate={{
                        scale: isActive
                          ? [1, 1.3, 1]
                          : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: isActive
                          ? Infinity
                          : 0,
                      }}
                      className={`mx-auto h-2.5 w-2.5 rounded-full border ${
                        completed
                          ? "border-cyan-300 bg-cyan-300 shadow-[0_0_14px_#22d3ee]"
                          : isActive
                            ? "border-white bg-white shadow-[0_0_16px_white,0_0_28px_#8b5cf6]"
                            : "border-white/20 bg-white/5"
                      }`}
                    />

                    <p className="mt-2 hidden text-[8px] uppercase tracking-[0.12em] text-slate-600 sm:block">
                      0{index + 1}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}