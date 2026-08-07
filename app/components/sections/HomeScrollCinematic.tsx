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

type HomeScrollCinematicProps = {
  hero: ReactNode;
  capabilities: ReactNode;
  team: ReactNode;
  about: ReactNode;
};

type StageTone =
  | "violet"
  | "white";

type CinematicStageProps = {
  children: ReactNode;
  tone: StageTone;
};

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

  /*
   * Main reveal.
   *
   * Restrained cinematic motion.
   */

  const opacity =
    useTransform(
      scrollYProgress,
      [
        0,
        0.12,
        0.86,
        1,
      ],
      [
        0.2,
        1,
        1,
        0.18,
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
        0.975,
        1,
        1,
        0.975,
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
        42,
        0,
        0,
        -42,
      ],
    );

  const blur =
    useTransform(
      scrollYProgress,
      [
        0,
        0.13,
        0.87,
        1,
      ],
      [
        8,
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

  /*
   * Transition glow.
   */

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
        0.12,
        0.24,
        0.1,
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
        0.55,
        1,
        1,
        0.55,
      ],
    );

  /*
   * Reference palette.
   *
   * black
   * deep violet
   * soft magenta
   * restrained electric blue
   */

  const palette =
    tone === "violet"
      ? {
          primary:
            "rgba(82,32,160,.16)",

          secondary:
            "rgba(168,38,235,.10)",

          blue:
            "rgba(64,85,255,.065)",

          line:
            "rgba(165,125,255,.28)",

          particleA:
            "#8B6CFF",

          particleB:
            "#C65CFF",

          particleC:
            "#688BFF",
        }
      : {
          primary:
            "rgba(102,72,170,.09)",

          secondary:
            "rgba(188,130,240,.06)",

          blue:
            "rgba(255,255,255,.025)",

          line:
            "rgba(222,211,255,.18)",

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
      className="relative"
    >
      {!reduceMotion && (
        <>
          {/* Local violet bloom */}

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
              h-[42vw]
              w-[42vw]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              blur-[145px]
            "
          />

          {/* Fine transition beam */}

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
              left-[12%]
              top-0
              z-[9]
              h-px
              w-[76%]
              origin-center
            "
          />

          {/* Sparse transition sparks */}

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
              h-24
              overflow-hidden
            "
          >
            {Array.from({
              length: 8,
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
                      -12,
                      75,
                    ],

                    x: [
                      0,
                      particleIndex %
                          2 ===
                        0
                        ? 18
                        : -18,
                    ],

                    opacity: [
                      0,
                      0.42,
                      0,
                    ],

                    scale: [
                      0.45,
                      0.9,
                      0.45,
                    ],
                  }}
                  transition={{
                    duration:
                      2.5 +
                      (
                        particleIndex %
                        3
                      ) *
                        0.35,

                    repeat:
                      Infinity,

                    delay:
                      particleIndex *
                      0.14,

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
                      12 +
                      (
                        (
                          particleIndex *
                          19
                        ) %
                        76
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

      {/* Actual section */}

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

/*
 * Planet receives its own wrapper.
 *
 * No external:
 * - glow
 * - particles
 * - opacity animation
 * - blur
 * - scaling
 * - color wash
 *
 * PlanetScene controls itself.
 */

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
        bg-[#020105]
      "
    >
      {children}
    </div>
  );
}

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

  /*
   * Hero cinematic exit.
   */

  const scale =
    useTransform(
      scrollYProgress,
      [
        0,
        0.66,
        1,
      ],
      [
        1,
        0.98,
        0.92,
      ],
    );

  const opacity =
    useTransform(
      scrollYProgress,
      [
        0,
        0.76,
        1,
      ],
      [
        1,
        1,
        0.1,
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
        -82,
      ],
    );

  const blur =
    useTransform(
      scrollYProgress,
      [
        0,
        0.75,
        1,
      ],
      [
        0,
        0,
        11,
      ],
    );

  const filter =
    useTransform(
      blur,
      (value) =>
        `blur(${value}px)`,
    );

  const ringScale =
    useTransform(
      scrollYProgress,
      [
        0.62,
        0.84,
        1,
      ],
      [
        0.25,
        1,
        2.4,
      ],
    );

  const ringOpacity =
    useTransform(
      scrollYProgress,
      [
        0.6,
        0.82,
        1,
      ],
      [
        0,
        0.28,
        0,
      ],
    );

  return (
    <div
      ref={ref}
      className="relative"
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

      {!reduceMotion && (
        <>
          {/* Main portal ring */}

          <motion.div
            aria-hidden="true"
            style={{
              scale:
                ringScale,

              opacity:
                ringOpacity,
            }}
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              z-[18]
              h-[22vmin]
              w-[22vmin]
              -translate-x-1/2
              translate-y-1/2
              rounded-full
              border
              border-violet-400/25
              shadow-[0_0_32px_rgba(112,76,255,.22),0_0_76px_rgba(131,42,205,.14)]
            "
          />

          {/* Secondary soft portal ring */}

          <motion.div
            aria-hidden="true"
            style={{
              scale:
                ringScale,

              opacity:
                ringOpacity,
            }}
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              z-[17]
              h-[32vmin]
              w-[32vmin]
              -translate-x-1/2
              translate-y-1/2
              rounded-full
              border
              border-fuchsia-400/[0.07]
              shadow-[0_0_65px_rgba(165,40,255,.10)]
            "
          />
        </>
      )}
    </div>
  );
}

export default function HomeScrollCinematic({
  hero,
  capabilities,
  team,
  about,
}: HomeScrollCinematicProps) {
  return (
    <div
      className="
        relative
        bg-[#020105]
      "
    >
      {/* HERO */}

      <HeroExit>
        {hero}
      </HeroExit>

      {/* CAPABILITIES */}

      <CinematicStage
        tone="violet"
      >
        {capabilities}
      </CinematicStage>

      {/* PLANET / TEAM */}

      <PlanetStage>
        {team}
      </PlanetStage>

      {/* ABOUT */}

      <CinematicStage
        tone="white"
      >
        {about}
      </CinematicStage>
    </div>
  );
}