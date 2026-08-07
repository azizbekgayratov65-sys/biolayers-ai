"use client";

import { motion } from "framer-motion";
import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import type {
  EntityData,
} from "../../lib/buildGraphFromText";

import BiologicalArtwork, {
  entityVisualTheme,
} from "./BiologicalArtwork";

type EntityNodeType = Node<EntityData, "entity">;

export default function EntityNode({
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}: NodeProps<EntityNodeType>) {
  const theme = entityVisualTheme[data.type];

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.74,
        y: 18,
        filter: "blur(12px)",
      }}
      animate={{
        opacity: 1,
        scale: selected
          ? [1.02, 1.055, 1.02]
          : 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        opacity: {
          duration: 0.55,
        },
        y: {
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        },
        filter: {
          duration: 0.55,
        },
        scale: selected
          ? {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {
              duration: 0.28,
            },
      }}
      whileHover={{
        scale: selected ? 1.06 : 1.04,
        y: -7,
        rotateX: 2,
        rotateY: -2,
      }}
      className="group relative w-[244px]"
      style={{
        perspective: 900,
      }}
    >
      <motion.div
        animate={{
          rotate: 360,
          opacity: selected
            ? [0.42, 0.8, 0.42]
            : [0.12, 0.3, 0.12],
        }}
        transition={{
          rotate: {
            duration: selected ? 9 : 17,
            repeat: Infinity,
            ease: "linear",
          },
          opacity: {
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="pointer-events-none absolute -inset-[8px] rounded-[32px] blur-[12px]"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${theme.accent}, transparent, ${theme.secondary}, transparent)`,
        }}
      />

      <Handle
        type="target"
        position={targetPosition}
        style={{
          width: 10,
          height: 10,
          background: theme.accent,
          border: "2px solid #050814",
          boxShadow: `0 0 16px ${theme.glow}`,
          zIndex: 30,
        }}
      />

      <div
        className={`relative overflow-hidden rounded-[26px] border bg-[#050814]/88 p-2.5 shadow-[0_26px_70px_rgba(0,0,0,.38)] backdrop-blur-2xl transition duration-300 ${
          selected
            ? "ring-2 ring-white/20"
            : ""
        }`}
        style={{
          borderColor: theme.border,
          boxShadow: selected
            ? `0 28px 90px rgba(0,0,0,.48), 0 0 38px ${theme.glow}`
            : `0 24px 70px rgba(0,0,0,.38), 0 0 24px ${theme.accentSoft}`,
        }}
      >
        <BiologicalArtwork
          type={data.type}
          label={data.label}
          active={selected}
        />

        <div className="relative px-2 pb-2 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-[8px] font-bold uppercase tracking-[0.22em]"
                style={{
                  color: theme.accent,
                }}
              >
                {theme.label}
              </p>

              <p className="mt-1 max-w-[188px] text-[15px] font-semibold leading-5 tracking-[-0.025em] text-white">
                {data.label}
              </p>
            </div>

            <motion.span
              animate={{
                scale: [0.75, 1.35, 0.75],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: theme.accent,
                boxShadow: `0 0 14px ${theme.accent}`,
              }}
            />
          </div>

          <div
            className="mt-3 h-px w-full opacity-45"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.secondary}, transparent)`,
            }}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        style={{
          width: 10,
          height: 10,
          background: theme.secondary,
          border: "2px solid #050814",
          boxShadow: `0 0 16px ${theme.glow}`,
          zIndex: 30,
        }}
      />
    </motion.div>
  );
}