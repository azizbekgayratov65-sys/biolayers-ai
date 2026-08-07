"use client";

import { motion } from "framer-motion";

export type WorkspaceView =
  | "graph"
  | "evidence"
  | "citations"
  | "timeline"
  | "cells"
  | "pubmed";

export default function LivingWorkspaceAtmosphere({
  view,
}: {
  view: WorkspaceView;
}) {
  const palette =
    view === "evidence"
      ? {
          a: "rgba(16,185,129,.16)",
          b: "rgba(34,211,238,.12)",
          c: "rgba(59,130,246,.09)",
        }
      : view === "citations"
        ? {
            a: "rgba(139,92,246,.18)",
            b: "rgba(236,72,153,.12)",
            c: "rgba(34,211,238,.09)",
          }
        : view === "timeline"
          ? {
              a: "rgba(245,158,11,.16)",
              b: "rgba(251,113,133,.1)",
              c: "rgba(139,92,246,.09)",
            }
          : view === "cells"
            ? {
                a: "rgba(20,184,166,.18)",
                b: "rgba(34,211,238,.12)",
                c: "rgba(132,204,22,.08)",
              }
            : view === "pubmed"
              ? {
                  a: "rgba(59,130,246,.16)",
                  b: "rgba(139,92,246,.12)",
                  c: "rgba(236,72,153,.08)",
                }
              : {
                  a: "rgba(34,211,238,.13)",
                  b: "rgba(139,92,246,.11)",
                  c: "rgba(236,72,153,.07)",
                };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{
          x: [-80, 90, -80],
          y: [-50, 40, -50],
          scale: [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full blur-[110px]"
        style={{
          background: palette.a,
        }}
      />

      <motion.div
        animate={{
          x: [70, -70, 70],
          y: [30, -45, 30],
          scale: [1.08, 0.9, 1.08],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-28 top-[18%] h-[390px] w-[390px] rounded-full blur-[120px]"
        style={{
          background: palette.b,
        }}
      />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-180px] left-[30%] h-[420px] w-[420px] rounded-full border border-white/[0.035]"
        style={{
          boxShadow: `0 0 160px ${palette.c}, inset 0 0 100px ${palette.c}`,
        }}
      />

      {Array.from({
        length: 12,
      }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm"
          style={{
            width: 8 + (index % 4) * 5,
            height: 8 + (index % 4) * 5,
            left: `${7 + ((index * 17) % 86)}%`,
            top: `${10 + ((index * 23) % 78)}%`,
          }}
          animate={{
            y: [0, -20 - (index % 3) * 8, 0],
            x: [
              0,
              index % 2 === 0 ? 14 : -14,
              0,
            ],
            opacity: [0.15, 0.62, 0.15],
            scale: [0.8, 1.25, 0.8],
          }}
          transition={{
            duration: 5 + (index % 5),
            repeat: Infinity,
            delay: index * 0.24,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}