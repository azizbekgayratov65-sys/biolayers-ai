"use client";

import { motion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type PointerState = {
  x: number;
  y: number;
};

export default function BioScanLayer() {
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
  });

  const [pointer, setPointer] =
    useState<PointerState>({
      x: 0,
      y: 0,
    });

  useEffect(() => {
    function handlePointerMove(
      event: PointerEvent,
    ) {
      const nextPointer = {
        x: event.clientX,
        y: event.clientY,
      };

      pointerRef.current = nextPointer;
      setPointer(nextPointer);
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[16] hidden overflow-hidden lg:block"
    >
      {/* Moving horizontal scan beam */}
      <motion.div
        animate={{
          y: [
            "-12vh",
            "112vh",
          ],
        }}
        transition={{
          duration: 7.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 top-0 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(103,232,249,0.85), rgba(216,180,254,0.95), transparent)",
          boxShadow:
            "0 0 22px rgba(103,232,249,0.7), 0 0 45px rgba(168,85,247,0.35)",
        }}
      />

      {/* Faint trailing glow */}
      <motion.div
        animate={{
          y: [
            "-20vh",
            "108vh",
          ],
        }}
        transition={{
          duration: 7.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 top-0 h-24 w-full opacity-25 blur-2xl"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(34,211,238,0.18), transparent)",
        }}
      />

      {/* Cursor-reactive halo grid */}
      <motion.div
        animate={{
          x: pointer.x - 260,
          y: pointer.y - 260,
        }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 24,
          mass: 0.35,
        }}
        className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(103,232,249,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,139,250,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "34px 34px",
          maskImage:
            "radial-gradient(circle, black 0%, rgba(0,0,0,0.85) 38%, transparent 74%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 0%, rgba(0,0,0,0.85) 38%, transparent 74%)",
          transform:
            "perspective(700px) rotateX(68deg)",
          transformOrigin: "center",
        }}
      />

      {/* Vertical cursor tracer */}
      <motion.div
        animate={{
          x: pointer.x,
        }}
        transition={{
          duration: 0.08,
          ease: "linear",
        }}
        className="absolute top-0 h-full w-px opacity-25"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(103,232,249,0.65), transparent)",
        }}
      />

      {/* Horizontal cursor tracer */}
      <motion.div
        animate={{
          y: pointer.y,
        }}
        transition={{
          duration: 0.08,
          ease: "linear",
        }}
        className="absolute left-0 h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,114,182,0.6), transparent)",
        }}
      />

      {/* Floating diagnostic marks */}
      <DiagnosticMark
        left="12%"
        top="23%"
        label="SIGNAL"
        delay={0}
      />

      <DiagnosticMark
        left="73%"
        top="18%"
        label="GENE"
        delay={1.4}
      />

      <DiagnosticMark
        left="81%"
        top="66%"
        label="PATHWAY"
        delay={2.2}
      />

      <DiagnosticMark
        left="18%"
        top="78%"
        label="EVIDENCE"
        delay={3}
      />
    </div>
  );
}

function DiagnosticMark({
  left,
  top,
  label,
  delay,
}: {
  left: string;
  top: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: [
          0,
          0.55,
          0.15,
          0.55,
          0,
        ],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute"
      style={{
        left,
        top,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="h-px w-8 bg-cyan-300/50" />

        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-200/50">
          {label}
        </span>
      </div>

      <div className="mt-1 h-5 w-px bg-gradient-to-b from-cyan-300/40 to-transparent" />
    </motion.div>
  );
}