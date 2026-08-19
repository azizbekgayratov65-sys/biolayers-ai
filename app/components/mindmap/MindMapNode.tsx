"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import {
  sectionColor,
  sectionSoftColor,
  levelColor,
  type MindMapFlowNode,
} from "./mindMapFlow";

function getLevelLabel(level: number) {
  switch (level) {
    case 1:
      return "PAPER";
    case 2:
      return "SECTION";
    case 3:
      return "CONCEPT";
    default:
      return "DETAIL";
  }
}

function WeightDots({
  weight,
  accent,
}: {
  weight: number;
  accent: string;
}) {
  return (
    <span className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map(
        (dot) => (
          <span
            key={dot}
            className="h-[5px] w-[5px] rounded-full"
            style={{
              backgroundColor:
                dot <= weight
                  ? accent
                  : "rgba(148,163,184,0.25)",
            }}
          />
        ),
      )}
    </span>
  );
}

export default memo(function MindMapNode({
  data,
  selected,
}: NodeProps<MindMapFlowNode>) {
  const isRoot = data.level === 1;
  const isSection =
    data.kind === "section";

  const accent = isRoot
    ? "#5eead4"
    : sectionColor(data.section);

  const soft = isRoot
    ? "rgba(94,234,212,0.12)"
    : sectionSoftColor(data.section);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        relative
        flex
        flex-col
        overflow-hidden
        rounded-[14px]
        border
        backdrop-blur-sm
        transition-shadow
        duration-200

        ${
          isRoot
            ? "min-w-[240px] border-teal-200/30 bg-gradient-to-br from-teal-400/[0.14] via-teal-300/[0.06] to-sky-400/[0.10] px-4 py-3.5"
            : isSection
              ? "min-w-[210px] border-l-4 px-4 py-3"
              : "min-w-[180px] px-3.5 py-2.5"
        }

        ${
          selected
            ? "shadow-[0_0_0_1.5px_var(--node-accent),0_18px_50px_rgba(0,0,0,.45)]"
            : "shadow-[0_10px_34px_rgba(0,0,0,.35)]"
        }
      `}
      style={{
        ["--node-accent" as never]:
          accent,
        borderColor: selected
          ? accent
          : isSection
            ? `color-mix(in srgb, ${accent} 42%, transparent)`
            : `color-mix(in srgb, ${accent} 22%, transparent)`,
        backgroundColor: selected
          ? `color-mix(in srgb, ${soft} 60%, #0a1b26)`
          : `color-mix(in srgb, ${soft} 100%, #0a1b26)`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-[#0a1b26]"
        style={{
          backgroundColor: accent,
        }}
      />

      <div
        className="
          mb-1.5
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <span
          className="
            font-mono
            text-[8px]
            font-bold
            uppercase
            tracking-[0.18em]
          "
          style={{
            color: levelColor(
              data.level,
            ),
          }}
        >
          {getLevelLabel(data.level)}
        </span>

        {!isRoot &&
          !isSection &&
          data.section && (
            <span
              className="
                max-w-[90px]
                truncate
                rounded-full
                border
                px-2
                py-0.5
                font-mono
                text-[7.5px]
                font-bold
                uppercase
                tracking-[0.12em]
              "
              style={{
                color: accent,
                borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
                backgroundColor: soft,
              }}
            >
              {data.section}
            </span>
          )}

        {!isRoot &&
          data.weight &&
          data.weight > 0 && (
            <WeightDots
              weight={data.weight}
              accent={accent}
            />
          )}
      </div>

      <p
        className={`
          leading-tight
          font-bold
          tracking-[-0.01em]
          text-white

          ${
            isRoot
              ? "text-[15px]"
              : isSection
                ? "text-[14px]"
                : "text-[13px]"
          }
        `}
      >
        {data.label}
      </p>

      {data.description &&
        !isRoot && (
          <p
            className="
              mt-1
              line-clamp-2
              text-[10px]
              leading-snug
              text-slate-400/90
            "
          >
            {data.description}
          </p>
        )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-[#0a1b26]"
        style={{
          backgroundColor: accent,
        }}
      />
    </motion.div>
  );
});