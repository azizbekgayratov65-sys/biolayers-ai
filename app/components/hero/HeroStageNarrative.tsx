"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CYCLE_SECONDS = 15;
const STAGE_COUNT = 5;

const stages = [
  {
    key: "papers",
    index: "01",
    eyebrow: "Source",
    title: "From papers",
    description:
      "Start with dense oncology literature and turn static text into a structured biological system.",
  },
  {
    key: "mechanisms",
    index: "02",
    eyebrow: "Extraction",
    title: "Extract mechanisms",
    description:
      "Identify cells, genes, proteins, pathways and the relationships that connect them.",
  },
  {
    key: "biology",
    index: "03",
    eyebrow: "Structure",
    title: "Map biology",
    description:
      "Resolve biological entities into an interpretable mechanistic map rather than a flat summary.",
  },
  {
    key: "evidence",
    index: "04",
    eyebrow: "Validation",
    title: "Connect evidence",
    description:
      "Link mechanisms to supporting literature, confidence signals and research context.",
  },
  {
    key: "system",
    index: "05",
    eyebrow: "Knowledge graph",
    title: "Reveal the system",
    description:
      "Explore the complete network as a living research workspace for computational oncology.",
  },
] as const;

function clampStageIndex(
  value: number,
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    Math.max(
      Math.floor(value),
      0,
    ),
    STAGE_COUNT - 1,
  );
}

function clampProgress(
  value: number,
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    Math.max(value, 0),
    1,
  );
}

export default function HeroStageNarrative() {
  const reduceMotion =
    useReducedMotion();

  const [
    stageIndex,
    setStageIndex,
  ] = useState(0);

  const [
    progress,
    setProgress,
  ] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setStageIndex(0);
      setProgress(0);
      return;
    }

    let frame = 0;
    const startedAt =
      performance.now();

    const update = (
      now: number,
    ) => {
      const elapsed =
        (now - startedAt) /
        1000;

      const normalizedRaw =
        (elapsed %
          CYCLE_SECONDS) /
        CYCLE_SECONDS;

      const normalized =
        Number.isFinite(
          normalizedRaw,
        )
          ? normalizedRaw
          : 0;

      const stageFloat =
        normalized *
        STAGE_COUNT;

      const nextIndex =
        clampStageIndex(
          stageFloat,
        );

      const nextProgress =
        clampProgress(
          stageFloat -
            Math.floor(
              stageFloat,
            ),
        );

      setStageIndex(
        nextIndex,
      );

      setProgress(
        nextProgress,
      );

      frame =
        requestAnimationFrame(
          update,
        );
    };

    frame =
      requestAnimationFrame(
        update,
      );

    return () => {
      cancelAnimationFrame(
        frame,
      );
    };
  }, [reduceMotion]);

  const safeStageIndex =
    useMemo(
      () =>
        clampStageIndex(
          stageIndex,
        ),
      [stageIndex],
    );

  const safeProgress =
    useMemo(
      () =>
        clampProgress(
          progress,
        ),
      [progress],
    );

  const activeStage =
    stages[
      safeStageIndex
    ] ?? stages[0];

  return (
    <div className="pointer-events-none absolute inset-0 z-[7]">
      <div className="absolute bottom-10 right-6 w-[min(390px,calc(100vw-3rem))] sm:right-10 lg:bottom-12 lg:right-14 xl:right-20">
        <div className="rounded-[26px] border border-white/[0.08] bg-[#050814]/38 p-4 shadow-[0_24px_80px_rgba(0,0,0,.22)] backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300/80">
              BioLayers sequence
            </p>

            <span className="font-mono text-[9px] text-slate-600">
              {activeStage.index}
              /05
            </span>
          </div>

          <div className="mt-4 min-h-[116px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  activeStage.key
                }
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 12,
                        filter:
                          "blur(8px)",
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  filter:
                    "blur(0px)",
                }}
                exit={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        y: -10,
                        filter:
                          "blur(8px)",
                      }
                }
                transition={{
                  duration: 0.5,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">
                  {
                    activeStage.eyebrow
                  }
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
                  {
                    activeStage.title
                  }
                </h2>

                <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-[13px]">
                  {
                    activeStage.description
                  }
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {stages.map(
              (
                stage,
                index,
              ) => {
                const isActive =
                  index ===
                  safeStageIndex;

                const isPast =
                  index <
                  safeStageIndex;

                return (
                  <div
                    key={
                      stage.key
                    }
                    className="relative h-[3px] overflow-hidden rounded-full bg-white/[0.06]"
                  >
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300"
                      animate={{
                        width: isPast
                          ? "100%"
                          : isActive
                            ? `${Math.max(
                                4,
                                safeProgress *
                                  100,
                              )}%`
                            : "0%",
                        opacity:
                          isPast ||
                          isActive
                            ? 1
                            : 0,
                      }}
                      transition={{
                        duration: 0.12,
                        ease: "linear",
                      }}
                    />
                  </div>
                );
              },
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[8px] uppercase tracking-[0.16em] text-slate-600">
              Papers
            </p>

            <p className="text-[8px] uppercase tracking-[0.16em] text-slate-600">
              System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}