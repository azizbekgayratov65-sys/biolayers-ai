"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import type {
  ResearchEntityData,
} from "../../lib/researchGraph";

import BiologicalArtwork, {
  entityVisualTheme,
} from "./BiologicalArtwork";

type EntityNodeType = Node<
  ResearchEntityData,
  "entity"
>;

function confidencePercent(
  confidence?: number,
) {
  if (
    typeof confidence !== "number" ||
    Number.isNaN(confidence)
  ) {
    return null;
  }

  return Math.round(
    Math.min(
      Math.max(confidence, 0),
      1,
    ) * 100,
  );
}

export default memo(function EntityNode({
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}: NodeProps<EntityNodeType>) {
  const theme =
    entityVisualTheme[data.type];

  const confidence =
    confidencePercent(
      data.confidence,
    );

  const [hovered, setHovered] =
    useState(false);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.6,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        scale: selected
          ? [1, 1.04, 1]
          : 1,
        filter: "blur(0px)",
      }}
      transition={{
        opacity: {
          duration: 0.42,
        },
        filter: {
          duration: 0.42,
        },
        scale: selected
          ? {
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
            },
      }}
      whileHover={{
        scale: selected ? 1.08 : 1.05,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative select-none"
    >
      {/* ambient halo */}
      <motion.div
        animate={{
          opacity: selected
            ? [0.25, 0.5, 0.25]
            : [0.08, 0.18, 0.08],
          scale: selected
            ? [0.96, 1.08, 0.96]
            : [0.98, 1.04, 0.98],
        }}
        transition={{
          duration: selected ? 3 : 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -inset-4 rounded-full blur-[24px]"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${theme.glow}, transparent 68%)`,
        }}
      />

      {/* selected perimeter ring */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -inset-[2px] rounded-full"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}77, ${theme.secondary}66)`,
          }}
        />
      )}

      <Handle
        type="target"
        position={targetPosition}
        style={{
          width: 10,
          height: 10,
          background: theme.accent,
          border: "2.5px solid #070b10",
          boxShadow: `0 0 14px ${theme.glow}`,
          zIndex: 40,
        }}
      />

      {/* circle body */}
      <div
        className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_20px_50px_rgba(1,7,13,.4)] backdrop-blur-2xl transition-shadow duration-300 group-hover:shadow-[0_26px_60px_rgba(1,7,13,.5)]"
        style={{
          borderColor: selected
            ? `${theme.accent}88`
            : `${theme.accent}44`,
          background: `radial-gradient(circle at 40% 35%, rgba(14,38,50,.95), rgba(6,19,29,.98))`,
          boxShadow: selected
            ? `0 26px 70px rgba(1,7,13,.5), 0 0 30px ${theme.accentSoft}`
            : `0 20px 50px rgba(1,7,13,.4), 0 0 18px ${theme.accentSoft}`,
        }}
      >
        {/* inner artwork clipped to circle */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <BiologicalArtwork
            type={data.type}
            label={data.label}
            active={selected}
          />
        </div>

        {/* subtle radial overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 50%, ${theme.accent}0d 100%)`,
          }}
        />

        {/* pulsing dot center */}
        <motion.span
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 h-2.5 w-2.5 rounded-full"
          style={{
            background: theme.accent,
            boxShadow: `0 0 16px ${theme.accent}`,
          }}
        />
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        style={{
          width: 10,
          height: 10,
          background: theme.secondary,
          border: "2.5px solid #070b10",
          boxShadow: `0 0 14px ${theme.glow}`,
          zIndex: 40,
        }}
      />

      {/* hover label tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{
              opacity: 0,
              y: 6,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 6,
              scale: 0.92,
            }}
            transition={{
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute left-1/2 top-[108px] z-50 w-[200px] -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0a1018]/95 px-3 py-2.5 shadow-[0_16px_40px_rgba(1,8,15,.45)] backdrop-blur-xl"
          >
            <span
              className="mb-1 inline-block rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em]"
              style={{
                color: theme.accent,
                borderColor: `${theme.accent}30`,
                backgroundColor: `${theme.accent}10`,
              }}
            >
              {data.type}
            </span>

            <p className="text-[13px] font-semibold leading-tight text-[#f1fbfa]">
              {data.label}
            </p>

            {data.description && (
              <p className="mt-1 line-clamp-2 text-[10px] leading-[1.4] text-slate-400">
                {data.description}
              </p>
            )}

            {confidence !== null && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`,
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] text-slate-500">
                  {confidence}%
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
