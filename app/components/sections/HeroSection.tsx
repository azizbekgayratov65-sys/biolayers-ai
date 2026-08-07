"use client";

import { motion, useReducedMotion } from "framer-motion";

import BioScanLayer from "../hero/BioScanLayer";
import CancerScene from "../hero/CancerScene";
import CursorEnergyField from "../hero/CursorEnergyField";
import HeroContent from "../hero/HeroContent";
import MorphStageOverlay from "../hero/MorphStageOverlay";

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Biological / cinematic scene */}
      <CancerScene />
      <BioScanLayer />

      {/* Global cinematic veil */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[8] bg-[radial-gradient(circle_at_68%_38%,transparent_0%,rgba(2,6,23,.12)_34%,rgba(2,6,23,.68)_74%,#01030a_100%)]"
      />

      {/* Cyan ambient field */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-8%", "8%", "-8%"],
                y: ["-5%", "7%", "-5%"],
                scale: [0.92, 1.12, 0.92],
                opacity: [0.13, 0.3, 0.13],
              }
        }
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed -left-[18vw] top-[8vh] z-[9] h-[58vw] w-[58vw] rounded-full bg-cyan-500/20 blur-[150px]"
      />

      {/* Violet ambient field */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["8%", "-7%", "8%"],
                y: ["7%", "-6%", "7%"],
                scale: [1.08, 0.9, 1.08],
                opacity: [0.12, 0.28, 0.12],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed -right-[20vw] top-[15vh] z-[9] h-[62vw] w-[62vw] rounded-full bg-violet-600/20 blur-[160px]"
      />

      {/* Moving scientific grid */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ["0px 0px", "72px 72px"],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none fixed inset-0 z-[9] opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.26) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.26) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Horizontal scanner */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          animate={{
            y: ["-20vh", "120vh"],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none fixed left-0 top-0 z-[12] h-px w-full bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent shadow-[0_0_30px_rgba(103,232,249,.7)]"
        />
      )}

      {/* Vertical scanner */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          animate={{
            x: ["-20vw", "120vw"],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none fixed left-0 top-0 z-[12] h-full w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
        />
      )}

      {/* Main hero workspace */}
      <section
        id="workspace"
        aria-label="BioLayers AI workspace introduction"
        className="relative z-20 min-h-screen"
      >
        <HeroContent />
        <MorphStageOverlay />
      </section>

      {/* Cursor interaction layer */}
      <CursorEnergyField />
    </>
  );
}