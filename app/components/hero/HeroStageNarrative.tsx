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

/* =========================================================
   CONFIG
   ========================================================= */

const CYCLE_SECONDS = 20;
const STAGE_COUNT = 5;

/* =========================================================
   STAGES
   ========================================================= */

const stages = [
  {
    key: "paper",
    index: "01",
    eyebrow: "Literature",
    title: "Read the paper",
    description:
      "Start with oncology literature containing biological observations, experimental findings, and mechanistic claims.",
  },
  {
    key: "entities",
    index: "02",
    eyebrow: "Extraction",
    title: "Identify the biology",
    description:
      "Extract cells, genes, proteins, pathways, biological processes, and disease-relevant entities from the research text.",
  },
  {
    key: "mechanism",
    index: "03",
    eyebrow: "Reconstruction",
    title: "Reconstruct mechanisms",
    description:
      "Connect biological entities through directional relationships to reveal the mechanistic chain described by the research.",
  },
  {
    key: "evidence",
    index: "04",
    eyebrow: "Evidence",
    title: "Trace every claim",
    description:
      "Keep mechanistic relationships connected to their supporting literature, context, and evidence rather than separating conclusions from sources.",
  },
  {
    key: "map",
    index: "05",
    eyebrow: "Research map",
    title: "Explore the system",
    description:
      "Move through the reconstructed mechanism as an interactive research map built for computational oncology.",
  },
] as const;

/* =========================================================
   HELPERS
   ========================================================= */

function clampStageIndex(value: number) {
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

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    Math.max(value, 0),
    1,
  );
}

/* =========================================================
   HERO STAGE NARRATIVE
   ========================================================= */

export default function HeroStageNarrative() {
  const reduceMotion = Boolean(useReducedMotion());

  const [stageIndex, setStageIndex] =
    useState(0);

  const [progress, setProgress] =
    useState(0);

  /* =======================================================
     TIMELINE
     ======================================================= */

  useEffect(() => {
    if (reduceMotion) {
      setStageIndex(0);
      setProgress(0);
      return;
    }

    const startedAt = performance.now();

    let animationFrame = 0;
    let lastUpdate = 0;

    /*
      We intentionally avoid updating React state on every
      browser frame.

      ~20 updates / second is more than enough for the tiny
      progress indicator while keeping the Hero lighter.
    */

    const UPDATE_INTERVAL = 50;

    const update = (now: number) => {
      if (now - lastUpdate >= UPDATE_INTERVAL) {
        lastUpdate = now;

        const elapsed =
          (now - startedAt) / 1000;

        const normalizedRaw =
          (elapsed % CYCLE_SECONDS) /
          CYCLE_SECONDS;

        const normalized =
          Number.isFinite(normalizedRaw)
            ? normalizedRaw
            : 0;

        const stageFloat =
          normalized * STAGE_COUNT;

        const nextIndex =
          clampStageIndex(stageFloat);

        const nextProgress =
          clampProgress(
            stageFloat -
              Math.floor(stageFloat),
          );

        setStageIndex((current) =>
          current === nextIndex
            ? current
            : nextIndex,
        );

        setProgress(nextProgress);
      }

      animationFrame =
        requestAnimationFrame(update);
    };

    animationFrame =
      requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [reduceMotion]);

  /* =======================================================
     SAFE VALUES
     ======================================================= */

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
    stages[safeStageIndex] ??
    stages[0];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-[7]
      "
    >
      <div
        className="
          absolute
          bottom-8
          right-6
          w-[min(420px,calc(100vw-3rem))]
          sm:right-10
          lg:bottom-10
          lg:right-14
          xl:right-20
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-teal-100/[0.08]
            bg-[#081722]/58
            p-4
            shadow-[0_28px_90px_rgba(1,8,15,.32)]
            backdrop-blur-2xl
            sm:p-5
          "
        >
          {/* =============================================== */}
          {/* SUBTLE TOP GLOW                                */}
          {/* =============================================== */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-12
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-teal-200/25
              to-transparent
            "
          />

          {/* =============================================== */}
          {/* HEADER                                         */}
          {/* =============================================== */}

          <div
            className="
              relative
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-2.5
              "
            >
              <span
                className="
                  relative
                  flex
                  h-1.5
                  w-1.5
                "
              >
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-teal-300
                    opacity-40
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-teal-300
                  "
                />
              </span>

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-teal-300/75
                "
              >
                Biological reconstruction
              </p>
            </div>

            <span
              className="
                font-mono
                text-[9px]
                text-slate-500
              "
            >
              {activeStage.index}/05
            </span>
          </div>

          {/* =============================================== */}
          {/* ACTIVE STAGE                                   */}
          {/* =============================================== */}

          <div className="relative mt-4 min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.key}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 10,
                        filter:
                          "blur(6px)",
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
                        y: -8,
                        filter:
                          "blur(6px)",
                      }
                }
                transition={{
                  duration:
                    reduceMotion
                      ? 0
                      : 0.45,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
              >
                {/* EYEBROW */}

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-sky-300/70
                  "
                >
                  {activeStage.eyebrow}
                </p>

                {/* TITLE */}

                <h2
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    tracking-[-0.035em]
                    text-[#f0fbfa]
                    sm:text-2xl
                  "
                >
                  {activeStage.title}
                </h2>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-3
                    max-w-[340px]
                    text-xs
                    leading-6
                    text-slate-300/80
                    sm:text-[13px]
                  "
                >
                  {activeStage.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* =============================================== */}
          {/* PROGRESS                                       */}
          {/* =============================================== */}

          <div
            className="
              relative
              mt-4
              grid
              grid-cols-5
              gap-1.5
            "
          >
            {stages.map(
              (stage, index) => {
                const isActive =
                  index ===
                  safeStageIndex;

                const isPast =
                  index <
                  safeStageIndex;

                return (
                  <div
                    key={stage.key}
                    className="
                      relative
                      h-[3px]
                      overflow-hidden
                      rounded-full
                      bg-teal-100/[0.055]
                    "
                  >
                    <motion.div
                      className="
                        absolute
                        inset-y-0
                        left-0
                        rounded-full
                        bg-gradient-to-r
                        from-teal-300
                        via-cyan-300
                        to-sky-300
                      "
                      animate={{
                        width: isPast
                          ? "100%"
                          : isActive
                            ? `${Math.max(
                                2,
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
                        duration: 0.06,
                        ease: "linear",
                      }}
                    />
                  </div>
                );
              },
            )}
          </div>

          {/* =============================================== */}
          {/* PIPELINE LABELS                                */}
          {/* =============================================== */}

          <div
            className="
              relative
              mt-3
              flex
              items-center
              justify-between
            "
          >
            <p
              className="
                text-[8px]
                uppercase
                tracking-[0.16em]
                text-slate-500
              "
            >
              Paper
            </p>

            <div
              className="
                flex
                items-center
                gap-1.5
                text-slate-600
              "
            >
              <span>·</span>
              <span>·</span>
              <span>·</span>
            </div>

            <p
              className="
                text-[8px]
                uppercase
                tracking-[0.16em]
                text-slate-500
              "
            >
              Research map
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}