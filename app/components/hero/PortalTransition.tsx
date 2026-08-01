"use client";

import { motion } from "framer-motion";

type PortalTransitionProps = {
  active: boolean;
};

export default function PortalTransition({
  active,
}: PortalTransitionProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-slate-950">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.2,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.2, 1.1, 14, 20],
        }}
        transition={{
          duration: 1.15,
          ease: [0.16, 1, 0.3, 1],
          times: [0, 0.25, 0.72, 1],
        }}
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, #ffffff 0%, #67e8f9 18%, #8b5cf6 38%, #ec4899 58%, transparent 72%)",
          boxShadow:
            "0 0 80px rgba(103,232,249,0.9), 0 0 180px rgba(139,92,246,0.7), 0 0 260px rgba(236,72,153,0.45)",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          scaleX: [0, 1, 18, 24],
        }}
        transition={{
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1],
          times: [0, 0.3, 0.75, 1],
        }}
        className="absolute left-1/2 top-1/2 h-px w-40 -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, #ffffff, #67e8f9, #d946ef, transparent)",
          boxShadow:
            "0 0 30px rgba(103,232,249,0.95), 0 0 70px rgba(217,70,239,0.75)",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
          scaleY: 0,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          scaleY: [0, 1, 18, 24],
        }}
        transition={{
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1],
          times: [0, 0.3, 0.75, 1],
        }}
        className="absolute left-1/2 top-1/2 h-40 w-px -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(180deg, transparent, #ffffff, #67e8f9, #d946ef, transparent)",
          boxShadow:
            "0 0 30px rgba(103,232,249,0.95), 0 0 70px rgba(217,70,239,0.75)",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.1,
          rotate: 0,
        }}
        animate={{
          opacity: [0, 0.9, 0],
          scale: [0.1, 3.5, 8],
          rotate: [0, 120, 280],
        }}
        transition={{
          duration: 1.1,
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/40"
        style={{
          boxShadow:
            "0 0 45px rgba(34,211,238,0.4), inset 0 0 45px rgba(168,85,247,0.3)",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.85,
          delay: 0.15,
        }}
        className="absolute inset-0 bg-white"
      />
    </div>
  );
}