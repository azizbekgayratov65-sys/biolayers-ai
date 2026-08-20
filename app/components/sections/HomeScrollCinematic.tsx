"use client";

import type {
  ReactNode,
} from "react";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import {
  useRef,
} from "react";

/* ====================================================== */
/* TYPES                                                  */
/* ====================================================== */

type HomeScrollCinematicProps = {
  hero: ReactNode;
  capabilities: ReactNode;
  team: ReactNode;
  globalToMolecular: ReactNode;
  dataStorm: ReactNode;
  dnaSingularity: ReactNode;
  about: ReactNode;
};

type StageTone =
  | "violet"
  | "white";

type CinematicStageProps = {
  children: ReactNode;
  tone: StageTone;
};

/* ====================================================== */
/* STANDARD CINEMATIC STAGE                               */
/* ====================================================== */

function CinematicStage({
  children,
  tone,
}: CinematicStageProps) {
  const ref =
    useRef<HTMLDivElement | null>(
      null,
    );

  const reduceMotion =
    useReducedMotion();

  const {
    scrollYProgress,
  } = useScroll({
    target: ref,

    offset: [
      "start end",
      "end start",
    ],
  });

  const opacity =
    useTransform(
      scrollYProgress,
      [
        0,
        0.1,
        0.9,
        1,
      ],
      [
        0.35,
        1,
        1,
        0.35,
      ],
    );

  const scale =
    useTransform(
      scrollYProgress,
      [
        0,
        0.18,
        0.82,
        1,
      ],
      [
        0.985,
        1,
        1,
        0.985,
      ],
    );

  const y =
    useTransform(
      scrollYProgress,
      [
        0,
        0.18,
        0.82,
        1,
      ],
      [
        28,
        0,
        0,
        -28,
      ],
    );

  const blur =
    useTransform(
      scrollYProgress,
      [
        0,
        0.12,
        0.88,
        1,
      ],
      [
        5,
        0,
        0,
        5,
      ],
    );

  const filter =
    useTransform(
      blur,
      (value) =>
        `blur(${value}px)`,
    );

  const glowOpacity =
    useTransform(
      scrollYProgress,
      [
        0,
        0.18,
        0.48,
        0.82,
        1,
      ],
      [
        0,
        0.1,
        0.2,
        0.08,
        0,
      ],
    );

  const glowScale =
    useTransform(
      scrollYProgress,
      [
        0.05,
        0.35,
        0.7,
        0.95,
      ],
      [
        0.7,
        1,
        1,
        0.7,
      ],
    );

  const palette =
    tone === "violet"
      ? {
          primary:
            "rgba(82,32,160,.14)",

          secondary:
            "rgba(168,38,235,.08)",

          blue:
            "rgba(64,85,255,.05)",

          line:
            "rgba(165,125,255,.22)",

          particleA:
            "#8B6CFF",

          particleB:
            "#C65CFF",

          particleC:
            "#688BFF",
        }
      : {
          primary:
            "rgba(102,72,170,.08)",

          secondary:
            "rgba(188,130,240,.05)",

          blue:
            "rgba(255,255,255,.02)",

          line:
            "rgba(222,211,255,.16)",

          particleA:
            "#C4B5FD",

          particleB:
            "#A78BFA",

          particleC:
            "#F5F3FF",
        };

  return (
    <div
      ref={ref}
      className="
        relative
        isolate
      "
    >
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden="true"
            style={{
              opacity:
                glowOpacity,

              scale:
                glowScale,

              background: `
                radial-gradient(
                  circle,
                  ${palette.primary} 0%,
                  ${palette.secondary} 28%,
                  ${palette.blue} 47%,
                  transparent 72%
                )
              `,
            }}
            className="
              pointer-events-none
              absolute
              left-1/2
              top-0
              z-[8]
              h-[36vw]
              w-[36vw]
              min-h-[340px]
              min-w-[340px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              blur-[125px]
            "
          />

          <motion.div
            aria-hidden="true"
            style={{
              opacity:
                glowOpacity,

              scaleX:
                glowScale,

              background: `
                linear-gradient(
                  90deg,
                  transparent,
                  ${palette.line},
                  transparent
                )
              `,
            }}
            className="
              pointer-events-none
              absolute
              left-[14%]
              top-0
              z-[9]
              h-px
              w-[72%]
              origin-center
            "
          />

          <motion.div
            aria-hidden="true"
            style={{
              opacity:
                glowOpacity,
            }}
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-[9]
              h-16
              overflow-hidden
            "
          >
            {Array.from({
              length: 6,
            }).map(
              (
                _,
                particleIndex,
              ) => (
                <motion.span
                  key={
                    particleIndex
                  }
                  animate={{
                    y: [
                      -8,
                      48,
                    ],

                    x: [
                      0,

                      particleIndex %
                          2 ===
                        0
                        ? 12
                        : -12,
                    ],

                    opacity: [
                      0,
                      0.35,
                      0,
                    ],

                    scale: [
                      0.5,
                      0.9,
                      0.5,
                    ],
                  }}
                  transition={{
                    duration:
                      2.4 +
                      (
                        particleIndex %
                        3
                      ) *
                        0.3,

                    repeat:
                      Infinity,

                    delay:
                      particleIndex *
                      0.16,

                    ease:
                      "easeOut",
                  }}
                  className="
                    absolute
                    top-0
                    h-[2px]
                    w-[2px]
                    rounded-full
                  "
                  style={{
                    left: `${
                      15 +
                      (
                        (
                          particleIndex *
                          17
                        ) %
                        70
                      )
                    }%`,

                    background:
                      particleIndex %
                          3 ===
                        0
                        ? palette.particleA
                        : particleIndex %
                              3 ===
                            1
                          ? palette.particleB
                          : palette.particleC,

                    boxShadow:
                      "0 0 7px currentColor",
                  }}
                />
              ),
            )}
          </motion.div>
        </>
      )}

      <motion.div
        style={
          reduceMotion
            ? undefined
            : {
                opacity,
                scale,
                y,
                filter,
              }
        }
        className="
          relative
          origin-center
        "
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ====================================================== */
/* HERO EXIT                                              */
/* ====================================================== */

function HeroExit({
  children,
}: {
  children: ReactNode;
}) {
  const ref =
    useRef<HTMLDivElement | null>(
      null,
    );

  const reduceMotion =
    useReducedMotion();

  const {
    scrollYProgress,
  } = useScroll({
    target: ref,

    offset: [
      "start start",
      "end start",
    ],
  });

  const scale =
    useTransform(
      scrollYProgress,
      [
        0,
        0.68,
        1,
      ],
      [
        1,
        0.985,
        0.94,
      ],
    );

  const opacity =
    useTransform(
      scrollYProgress,
      [
        0,
        0.78,
        1,
      ],
      [
        1,
        1,
        0.15,
      ],
    );

  const y =
    useTransform(
      scrollYProgress,
      [
        0,
        1,
      ],
      [
        0,
        -55,
      ],
    );

  const blur =
    useTransform(
      scrollYProgress,
      [
        0,
        0.78,
        1,
      ],
      [
        0,
        0,
        8,
      ],
    );

  const filter =
    useTransform(
      blur,
      (value) =>
        `blur(${value}px)`,
    );

  return (
    <div
      ref={ref}
      className="
        relative
        isolate
      "
    >
      <motion.div
        style={
          reduceMotion
            ? undefined
            : {
                scale,
                opacity,
                y,
                filter,
              }
        }
        className="
          relative
          origin-center
        "
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ====================================================== */
/* PLANET STAGE                                           */
/* ====================================================== */

function PlanetStage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        isolate
        z-20
        bg-[#020105]
      "
    >
      {children}
    </div>
  );
}

/* ====================================================== */
/* PLANET → MOLECULAR BRIDGE                              */
/* ====================================================== */

function PlanetMolecularBridge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        isolate
        z-30
        -mt-[18vh]
        bg-[#020105]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-[2]
          h-[22vh]
          bg-gradient-to-b
          from-transparent
          via-[#020105]/60
          to-[#020105]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[4vh]
          z-[10]
          h-px
          w-[68vw]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-violet-300/22
          to-transparent
          shadow-[0_0_24px_rgba(161,92,255,.22)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[4vh]
          z-[1]
          h-[26vw]
          w-[52vw]
          min-h-[260px]
          min-w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-violet-700/[0.055]
          blur-[125px]
        "
      />

      {children}
    </div>
  );
}

/* ====================================================== */
/* DATA STORM STAGE                                       */
/* ====================================================== */

function DataStormStage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        isolate
        z-40
        -mt-[6vh]
        overflow-hidden
        bg-[#020105]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          z-[20]
          h-px
          w-[68vw]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-violet-400/30
          to-transparent
          shadow-[0_0_20px_rgba(161,92,255,.2)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          z-[1]
          h-[28vw]
          w-[50vw]
          min-h-[260px]
          min-w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-violet-700/[0.065]
          blur-[130px]
        "
      />

      {children}
    </div>
  );
}

/* ====================================================== */
/* DNA BRIDGE                                             */
/* ====================================================== */

function DNASingularityStage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        isolate
        z-50
        -mt-[12vh]
        overflow-hidden
        bg-[#020105]
      "
    >
      {/* DATA → DNA SEAM */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[2vh]
          z-[20]
          h-px
          w-[62vw]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-fuchsia-300/24
          to-transparent
          shadow-[0_0_20px_rgba(217,70,239,.16)]
        "
      />

      {/* DNA ENTRY BLOOM */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          z-[1]
          h-[30vw]
          w-[48vw]
          min-h-[280px]
          min-w-[420px]
          -translate-x-1/2
          -translate-y-[58%]
          rounded-full
          bg-fuchsia-700/[0.045]
          blur-[130px]
        "
      />

      {children}
    </div>
  );
}

/* ====================================================== */
/* ABOUT BRIDGE                                           */
/* ====================================================== */

function AboutBridge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        isolate
        z-[60]
        -mt-[14vh]
        bg-[#020105]
      "
    >
      {/* FINAL LIGHT SEAM */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          z-[12]
          h-px
          w-[60vw]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-violet-200/24
          to-transparent
        "
      />

      {/* ABOUT REVEAL BLOOM */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          z-[1]
          h-[28vw]
          w-[46vw]
          min-h-[250px]
          min-w-[400px]
          -translate-x-1/2
          -translate-y-[60%]
          rounded-full
          bg-violet-600/[0.035]
          blur-[120px]
        "
      />

      {children}
    </div>
  );
}

/* ====================================================== */
/* MAIN                                                   */
/* ====================================================== */

export default function HomeScrollCinematic({
  hero,
  capabilities,
  team,
  globalToMolecular,
  dataStorm,
  dnaSingularity,
  about,
}: HomeScrollCinematicProps) {
  return (
    <div
      className="
        relative
        overflow-x-hidden
        bg-[#020105]
      "
    >
      {/* 01 — HERO */}

      <HeroExit>
        {hero}
      </HeroExit>

      {/* 02 — CAPABILITIES */}

      <CinematicStage
        tone="violet"
      >
        {capabilities}
      </CinematicStage>

      {/* 03 — PLANET */}

      <PlanetStage>
        {team}
      </PlanetStage>

      {/* 04 — PLANET → MOLECULAR */}

      <PlanetMolecularBridge>
        {globalToMolecular}
      </PlanetMolecularBridge>

      {/* 05 — DATA UNIVERSE */}

      <DataStormStage>
        {dataStorm}
      </DataStormStage>

      {/* 06 — DNA SINGULARITY */}

      <DNASingularityStage>
        {dnaSingularity}
      </DNASingularityStage>

      {/* 07 — ABOUT */}

      <AboutBridge>
        <CinematicStage
          tone="white"
        >
          {about}
        </CinematicStage>
      </AboutBridge>
    </div>
  );
}