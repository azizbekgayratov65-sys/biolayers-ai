"use client";

import { memo } from "react";
import { motion } from "framer-motion";
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

function getTypeTitle(type: ResearchEntityData["type"]) {
  switch (type) {
    case "cell":
      return "CELL";
    case "protein":
      return "PROTEIN";
    case "gene":
      return "GENE";
    case "pathway":
      return "PATHWAY";
    case "process":
      return "PROCESS";
    case "disease":
      return "DISEASE";
    case "drug":
      return "THERAPY";
    default:
      return String(type).toUpperCase();
  }
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

  const aliases =
    Array.isArray(data.aliases)
      ? data.aliases
          .filter(Boolean)
          .slice(0, 2)
      : [];

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 14,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        scale: selected
          ? [1, 1.018, 1]
          : 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        opacity: {
          duration: 0.42,
        },
        y: {
          duration: 0.42,
          ease: [0.16, 1, 0.3, 1],
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
            },
      }}
      whileHover={{
        y: -6,
        scale: selected ? 1.025 : 1.018,
      }}
      className="group relative w-[304px] select-none"
    >
      {/* ambient halo */}
      <motion.div
        animate={{
          opacity: selected
            ? [0.22, 0.48, 0.22]
            : [0.08, 0.16, 0.08],
          scale: selected
            ? [0.98, 1.05, 0.98]
            : [0.99, 1.02, 0.99],
        }}
        transition={{
          duration: selected ? 3.2 : 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -inset-3 rounded-[34px] blur-[22px]"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${theme.glow}, transparent 68%)`,
        }}
      />

      {/* selected perimeter */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.38, 0.8, 0.38],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -inset-[1px] rounded-[27px]"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}66, transparent 34%, transparent 66%, ${theme.secondary}55)`,
          }}
        />
      )}

      <Handle
        type="target"
        position={targetPosition}
        style={{
          width: 11,
          height: 11,
          background:
            theme.accent,
          border:
            "3px solid #070b10",
          boxShadow: `0 0 16px ${theme.glow}`,
          zIndex: 40,
        }}
      />

      <div
        className="relative overflow-hidden rounded-[26px] border bg-[linear-gradient(155deg,rgba(14,38,50,.96),rgba(7,24,35,.96)_58%,rgba(6,19,29,.98))] p-2.5 shadow-[0_24px_60px_rgba(1,7,13,.36)] backdrop-blur-2xl transition-all duration-300 group-hover:shadow-[0_30px_72px_rgba(1,7,13,.46)]"
        style={{
          borderColor: selected
            ? `${theme.accent}66`
            : `${theme.accent}32`,
          boxShadow: selected
            ? `0 30px 80px rgba(1,7,13,.5), 0 0 26px ${theme.accentSoft}`
            : `0 24px 60px rgba(1,7,13,.36), 0 0 18px ${theme.accentSoft}`,
        }}
      >
        {/* top polish */}
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-[52px]"
          style={{
            background: theme.accentSoft,
          }}
        />

        <div className="relative overflow-hidden rounded-[20px] border border-white/[0.045] bg-[#070b10]/72">
          <BiologicalArtwork
            type={data.type}
            label={data.label}
            active={selected}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#071823] to-transparent" />
        </div>

        <div className="relative px-2.5 pb-2.5 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em]"
                  style={{
                    color: theme.accent,
                    borderColor: `${theme.accent}30`,
                    backgroundColor: `${theme.accent}0d`,
                  }}
                >
                  {getTypeTitle(data.type)}
                </span>

                {confidence !== null && (
                  <span className="rounded-full border border-teal-100/[0.07] bg-black/[0.12] px-2 py-1 font-mono text-[9px] font-bold tracking-[0.03em] text-slate-400">
                    AI {confidence}%
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-[250px] text-[17px] font-semibold leading-[1.22] tracking-[-0.03em] text-[#f1fbfa]">
                {data.label}
              </p>
            </div>

            <motion.span
              animate={{
                opacity: [0.45, 1, 0.45],
                scale: [0.85, 1.25, 0.85],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{
                background:
                  theme.accent,
                boxShadow: `0 0 12px ${theme.accent}`,
              }}
            />
          </div>

          {aliases.length > 0 && (
            <p className="mt-2 line-clamp-1 text-[10px] leading-4 text-slate-500">
              <span className="text-slate-600">
                AKA
              </span>{" "}
              {aliases.join(" · ")}
            </p>
          )}

          {confidence !== null && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Extraction confidence
                </span>
                <span className="font-mono text-[9px] text-slate-500">
                  {confidence}%
                </span>
              </div>

              <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.045]">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${confidence}%`,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`,
                    boxShadow: `0 0 10px ${theme.glow}`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        style={{
          width: 11,
          height: 11,
          background:
            theme.secondary,
          border:
            "3px solid #070b10",
          boxShadow: `0 0 16px ${theme.glow}`,
          zIndex: 40,
        }}
      />
    </motion.div>
  );
});