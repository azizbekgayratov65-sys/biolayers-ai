"use client";

import { motion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type CursorPoint = {
  x: number;
  y: number;
};

type EnergyPulse = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const STAGE_COLORS = [
  {
    primary: "#00f5d4",
    secondary: "#b8ff5a",
    glow: "rgba(0,245,212,0.35)",
  },
  {
    primary: "#8b5cf6",
    secondary: "#5de8ff",
    glow: "rgba(139,92,246,0.38)",
  },
  {
    primary: "#2563ff",
    secondary: "#39ff88",
    glow: "rgba(37,99,255,0.38)",
  },
  {
    primary: "#ff2ea6",
    secondary: "#ff7a00",
    glow: "rgba(255,46,166,0.4)",
  },
  {
    primary: "#00e5ff",
    secondary: "#ffffff",
    glow: "rgba(0,229,255,0.42)",
  },
];

const TRAIL_LENGTH = 18;

function getStageIndex(clientX: number) {
  if (typeof window === "undefined") {
    return 2;
  }

  const progress = Math.min(
    Math.max(clientX / window.innerWidth, 0),
    0.999,
  );

  return Math.floor(
    progress * STAGE_COLORS.length,
  );
}

export default function CursorEnergyField() {
  const targetRef = useRef<CursorPoint>({
    x: 0,
    y: 0,
  });

  const trailRef = useRef<CursorPoint[]>(
    Array.from(
      { length: TRAIL_LENGTH },
      () => ({
        x: 0,
        y: 0,
      }),
    ),
  );

  const animationFrameRef =
    useRef<number | null>(null);

  const pulseIdRef = useRef(0);

  const [trail, setTrail] = useState<
    CursorPoint[]
  >([]);

  const [visible, setVisible] =
    useState(false);

  const [stageIndex, setStageIndex] =
    useState(2);

  const [pulses, setPulses] = useState<
    EnergyPulse[]
  >([]);

  useEffect(() => {
    function handlePointerMove(
      event: PointerEvent,
    ) {
      targetRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      setStageIndex(
        getStageIndex(event.clientX),
      );

      setVisible(true);
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      const activeStage =
        STAGE_COLORS[
          getStageIndex(event.clientX)
        ];

      pulseIdRef.current += 1;

      const nextPulse: EnergyPulse = {
        id: pulseIdRef.current,
        x: event.clientX,
        y: event.clientY,
        color: activeStage.primary,
      };

      setPulses((currentPulses) => [
        ...currentPulses,
        nextPulse,
      ]);

      window.setTimeout(() => {
        setPulses((currentPulses) =>
          currentPulses.filter(
            (pulse) =>
              pulse.id !== nextPulse.id,
          ),
        );
      }, 1100);
    }

    function handleMouseLeave() {
      setVisible(false);
    }

    function handleMouseEnter() {
      setVisible(true);
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "mouseleave",
      handleMouseLeave,
    );

    document.addEventListener(
      "mouseenter",
      handleMouseEnter,
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "mouseleave",
        handleMouseLeave,
      );

      document.removeEventListener(
        "mouseenter",
        handleMouseEnter,
      );
    };
  }, []);

  useEffect(() => {
    function animateTrail() {
      const points = trailRef.current;

      points[0].x +=
        (targetRef.current.x -
          points[0].x) *
        0.34;

      points[0].y +=
        (targetRef.current.y -
          points[0].y) *
        0.34;

      for (
        let index = 1;
        index < points.length;
        index += 1
      ) {
        const previousPoint =
          points[index - 1];

        const currentPoint =
          points[index];

        const followSpeed =
          Math.max(
            0.12,
            0.28 - index * 0.008,
          );

        currentPoint.x +=
          (previousPoint.x -
            currentPoint.x) *
          followSpeed;

        currentPoint.y +=
          (previousPoint.y -
            currentPoint.y) *
          followSpeed;
      }

      setTrail(
        points.map((point) => ({
          ...point,
        })),
      );

      animationFrameRef.current =
        window.requestAnimationFrame(
          animateTrail,
        );
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        animateTrail,
      );

    return () => {
      if (
        animationFrameRef.current !== null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, []);

  const activeColors =
    STAGE_COLORS[stageIndex];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[70] hidden overflow-hidden lg:block ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
    >
      {trail.map((point, index) => {
        const progress =
          1 - index / TRAIL_LENGTH;

        const size =
          4 + progress * 17;

        const opacity =
          progress * progress * 0.5;

        return (
          <motion.span
            key={index}
            animate={{
              x: point.x - size / 2,
              y: point.y - size / 2,
              width: size,
              height: size,
              opacity,
            }}
            transition={{
              duration: 0.06,
              ease: "linear",
            }}
            className="absolute left-0 top-0 rounded-full"
            style={{
              background:
                index % 2 === 0
                  ? activeColors.primary
                  : activeColors.secondary,

              boxShadow: `
                0 0 ${12 + progress * 28}px
                ${activeColors.primary}
              `,

              filter: `blur(${
                index === 0 ? 0 : 1.5
              }px)`,
            }}
          />
        );
      })}

      {trail[0] && (
        <>
          <motion.div
            animate={{
              x: trail[0].x - 35,
              y: trail[0].y - 35,
            }}
            transition={{
              duration: 0.055,
              ease: "linear",
            }}
            className="absolute left-0 top-0 h-[70px] w-[70px] rounded-full border border-white/10"
            style={{
              background: `radial-gradient(
                circle,
                ${activeColors.glow} 0%,
                transparent 68%
              )`,

              boxShadow: `
                0 0 45px ${activeColors.glow},
                inset 0 0 30px ${activeColors.glow}
              `,
            }}
          />

          <motion.div
            animate={{
              x: trail[0].x - 17,
              y: trail[0].y - 17,
              rotate: 360,
            }}
            transition={{
              x: {
                duration: 0.05,
                ease: "linear",
              },

              y: {
                duration: 0.05,
                ease: "linear",
              },

              rotate: {
                duration: 2.8,
                ease: "linear",
                repeat: Infinity,
              },
            }}
            className="absolute left-0 top-0 h-[34px] w-[34px] rounded-full border border-dashed"
            style={{
              borderColor:
                activeColors.secondary,

              boxShadow: `
                0 0 15px ${activeColors.primary}
              `,
            }}
          />

          <motion.div
            animate={{
              x: trail[0].x - 4,
              y: trail[0].y - 4,
              scale: [1, 1.45, 1],
            }}
            transition={{
              x: {
                duration: 0.045,
                ease: "linear",
              },

              y: {
                duration: 0.045,
                ease: "linear",
              },

              scale: {
                duration: 1.1,
                ease: "easeInOut",
                repeat: Infinity,
              },
            }}
            className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white"
            style={{
              boxShadow: `
                0 0 8px white,
                0 0 20px ${activeColors.primary},
                0 0 42px ${activeColors.secondary}
              `,
            }}
          />
        </>
      )}

      {pulses.map((pulse) => (
        <motion.div
          key={pulse.id}
          initial={{
            x: pulse.x - 10,
            y: pulse.y - 10,
            width: 20,
            height: 20,
            opacity: 0.95,
            scale: 0.5,
          }}
          animate={{
            x: pulse.x - 140,
            y: pulse.y - 140,
            width: 280,
            height: 280,
            opacity: 0,
            scale: 1,
          }}
          transition={{
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute left-0 top-0 rounded-full border"
          style={{
            borderColor: pulse.color,

            boxShadow: `
              0 0 30px ${pulse.color},
              inset 0 0 30px ${pulse.color}
            `,
          }}
        />
      ))}

      {trail[0] && (
        <motion.div
          animate={{
            x: trail[0].x - 160,
            y: trail[0].y - 160,
          }}
          transition={{
            duration: 0.09,
            ease: "linear",
          }}
          className="absolute left-0 top-0 h-80 w-80 rounded-full opacity-20 mix-blend-screen blur-[70px]"
          style={{
            background: `radial-gradient(
              circle,
              ${activeColors.primary} 0%,
              ${activeColors.secondary} 30%,
              transparent 72%
            )`,
          }}
        />
      )}
    </div>
  );
}