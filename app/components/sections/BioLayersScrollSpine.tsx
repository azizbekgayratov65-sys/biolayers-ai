"use client";

import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type BioLayersScrollSpineProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const labels = [
  "Hero",
  "Capabilities",
  "Team",
  "About",
  "BioLayers",
];

export default function BioLayersScrollSpine({
  containerRef,
}: BioLayersScrollSpineProps) {
  const reduceMotion =
    Boolean(
      useReducedMotion(),
    );

  const {
    scrollYProgress,
  } = useScroll({
    target:
      containerRef,
    offset: [
      "start start",
      "end end",
    ],
  });

  const smoothProgress =
    useSpring(
      scrollYProgress,
      {
        stiffness: 100,
        damping: 24,
        mass: 0.35,
      },
    );

  const lineScaleY =
    useTransform(
      smoothProgress,
      [0, 1],
      [0.04, 1],
    );

  const orbY =
    useTransform(
      smoothProgress,
      [0, 1],
      ["3%", "97%"],
    );

  const orbScale =
    useTransform(
      smoothProgress,
      [
        0,
        0.2,
        0.36,
        0.54,
        0.72,
        0.88,
        1,
      ],
      [
        0.8,
        1.1,
        1.55,
        1.05,
        1.45,
        1.1,
        0.7,
      ],
    );

  const orbRotate =
    useTransform(
      smoothProgress,
      [0, 1],
      [0, 980],
    );

  const glow =
    useTransform(
      smoothProgress,
      [
        0,
        0.22,
        0.4,
        0.58,
        0.78,
        1,
      ],
      [
        0.5,
        1,
        0.8,
        1,
        0.9,
        0.55,
      ],
    );

  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setActiveIndex(0);
      return;
    }

    return smoothProgress.on(
      "change",
      (value) => {
        const index =
          Math.min(
            labels.length - 1,
            Math.max(
              0,
              Math.floor(
                value *
                  labels.length,
              ),
            ),
          );

        setActiveIndex(
          index,
        );
      },
    );
  }, [
    reduceMotion,
    smoothProgress,
  ]);

  const particles =
    useMemo(
      () =>
        Array.from(
          {
            length: 16,
          },
          (
            _,
            index,
          ) => ({
            id: index,
            delay:
              index *
              0.11,
            size:
              1.5 +
              (index % 4) *
                0.7,
          }),
        ),
      [],
    );

  return (
    <div className="pointer-events-none fixed bottom-8 right-5 top-24 z-[160] hidden w-14 lg:block">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.05]" />

      <motion.div
        style={{
          scaleY:
            lineScaleY,
          transformOrigin:
            "top",
        }}
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan-300 via-violet-300 via-60% to-fuchsia-300 shadow-[0_0_16px_rgba(103,232,249,.55)]"
      />

      {!reduceMotion &&
        particles.map(
          (particle) => (
            <motion.span
              key={
                particle.id
              }
              animate={{
                y: [
                  0,
                  520,
                ],
                opacity: [
                  0,
                  1,
                  0,
                ],
                scale: [
                  0.5,
                  1.4,
                  0.6,
                ],
              }}
              transition={{
                duration:
                  3.2 +
                  (particle.id %
                    5) *
                    0.28,
                repeat:
                  Infinity,
                delay:
                  particle.delay,
                ease: "linear",
              }}
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_10px_#67e8f9]"
              style={{
                width:
                  particle.size,
                height:
                  particle.size,
              }}
            />
          ),
        )}

      <motion.div
        style={{
          top: orbY,
          scale: orbScale,
          rotate:
            orbRotate,
          opacity: glow,
        }}
        className="absolute left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-0 rounded-full border border-cyan-200/55 shadow-[0_0_18px_#67e8f9,0_0_36px_rgba(139,92,246,.55)]" />
        <div className="absolute inset-[7px] rounded-full border border-violet-300/55" />
        <div className="absolute inset-[14px] rounded-full bg-white shadow-[0_0_12px_white,0_0_24px_#67e8f9]" />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={{
            duration: 3.6,
            repeat:
              Infinity,
            ease: "linear",
          }}
          className="absolute -inset-2 rounded-full border border-dashed border-fuchsia-300/30"
        />
      </motion.div>

      <div className="absolute -left-36 top-1/2 -translate-y-1/2 text-right">
        <motion.p
          key={
            activeIndex
          }
          initial={{
            opacity: 0,
            x: 8,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500"
        >
          {
            labels[
              activeIndex
            ]
          }
        </motion.p>
      </div>
    </div>
  );
}