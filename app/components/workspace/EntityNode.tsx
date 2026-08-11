"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import {
  BookOpenText,
  ShieldCheck,
} from "lucide-react";

import type {
  ResearchEntityData,
} from "../../lib/researchGraph";

import BiologicalArtwork, {
  entityVisualTheme,
} from "./BiologicalArtwork";

/* =========================================================
   TYPES
   ========================================================= */

type EntityNodeType = Node<
  ResearchEntityData,
  "entity"
>;

/* =========================================================
   HELPERS
   ========================================================= */

function formatConfidence(
  value?: number,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  const normalized =
    value <= 1
      ? value * 100
      : value;

  return Math.round(
    Math.min(
      Math.max(
        normalized,
        0,
      ),
      100,
    ),
  );
}

/* =========================================================
   ENTITY NODE
   ========================================================= */

export default function EntityNode({
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}: NodeProps<EntityNodeType>) {
  const reduceMotion =
    Boolean(
      useReducedMotion(),
    );

  const theme =
    entityVisualTheme[
      data.type
    ];

  const confidence =
    formatConfidence(
      data.confidence,
    );

  const evidenceQuote =
    typeof data.evidenceQuote ===
      "string"
      ? data.evidenceQuote.trim()
      : "";

  const hasEvidence =
    evidenceQuote.length > 0;

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.82,
              y: 16,
              filter:
                "blur(10px)",
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        filter:
          "blur(0px)",
      }}
      transition={{
        duration:
          reduceMotion
            ? 0
            : 0.5,
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              scale: 1.02,
            }
      }
      className="
        group
        relative
        w-[252px]
      "
    >
      {/* ================================================= */}
      {/* SELECTED GLOW                                     */}
      {/* ================================================= */}

      {selected && (
        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [
                    0.2,
                    0.45,
                    0.2,
                  ],
                }
          }
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease:
              "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            -inset-[10px]
            rounded-[30px]
            blur-[16px]
          "
          style={{
            background:
              `linear-gradient(
                135deg,
                ${theme.accentSoft},
                ${theme.glow}
              )`,
          }}
        />
      )}

      {/* ================================================= */}
      {/* TARGET HANDLE                                     */}
      {/* ================================================= */}

      <Handle
        type="target"
        position={
          targetPosition
        }
        style={{
          width: 9,
          height: 9,
          background:
            theme.accent,
          border:
            "2px solid #050814",
          boxShadow:
            `0 0 12px ${theme.glow}`,
          zIndex: 30,
        }}
      />

      {/* ================================================= */}
      {/* CARD                                              */}
      {/* ================================================= */}

      <div
        className={`
          relative
          overflow-hidden
          rounded-[24px]
          border
          bg-[#050814]/92
          p-2.5
          shadow-[0_24px_70px_rgba(0,0,0,.42)]
          backdrop-blur-2xl
          transition-all
          duration-300

          ${
            selected
              ? "ring-1 ring-white/20"
              : ""
          }
        `}
        style={{
          borderColor:
            selected
              ? theme.accent
              : theme.border,

          boxShadow:
            selected
              ? `0 28px 90px rgba(0,0,0,.48), 0 0 30px ${theme.glow}`
              : `0 22px 60px rgba(0,0,0,.36), 0 0 14px ${theme.accentSoft}`,
        }}
      >
        {/* ================================================= */}
        {/* BIOLOGICAL ART                                   */}
        {/* ================================================= */}

        <BiologicalArtwork
          type={
            data.type
          }
          label={
            data.label
          }
          active={
            selected
          }
        />

        {/* ================================================= */}
        {/* NODE INFORMATION                                 */}
        {/* ================================================= */}

        <div
          className="
            relative
            px-2
            pb-2
            pt-3
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            {/* LABEL */}

            <div className="min-w-0">
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                "
                style={{
                  color:
                    theme.accent,
                }}
              >
                {theme.label}
              </p>

              <p
                className="
                  mt-1
                  max-w-[190px]
                  text-[15px]
                  font-semibold
                  leading-5
                  tracking-[-0.025em]
                  text-white
                "
              >
                {data.label}
              </p>
            </div>

            {/* CONFIDENCE */}

            <div
              className="
                flex
                shrink-0
                flex-col
                items-end
                gap-1.5
              "
            >
              {confidence !== null && (
                <div
                  className="
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.025]
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    text-white/48
                  "
                  title="Entity extraction confidence"
                >
                  {confidence}%
                </div>
              )}

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                "
                style={{
                  background:
                    theme.accent,

                  boxShadow:
                    `0 0 10px ${theme.accent}`,
                }}
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* DESCRIPTION                                      */}
          {/* ================================================= */}

          {data.description && (
            <p
              className="
                mt-3
                line-clamp-2
                text-[10px]
                leading-4
                text-slate-400/70
              "
            >
              {data.description}
            </p>
          )}

          {/* ================================================= */}
          {/* DIVIDER                                          */}
          {/* ================================================= */}

          <div
            className="
              mt-3
              h-px
              w-full
              opacity-35
            "
            style={{
              background:
                `linear-gradient(
                  90deg,
                  transparent,
                  ${theme.accent},
                  ${theme.secondary},
                  transparent
                )`,
            }}
          />

          {/* ================================================= */}
          {/* EVIDENCE STATUS                                   */}
          {/* ================================================= */}

          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[9px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-white/28
              "
            >
              {hasEvidence ? (
                <>
                  <ShieldCheck
                    className="
                      h-3
                      w-3
                      text-emerald-300/70
                    "
                  />

                  Evidence linked
                </>
              ) : (
                <>
                  <BookOpenText
                    className="
                      h-3
                      w-3
                      text-white/30
                    "
                  />

                  No direct quote
                </>
              )}
            </div>

            <span
              className="
                text-[8px]
                uppercase
                tracking-[0.12em]
                text-white/18
              "
            >
              {data.type}
            </span>
          </div>

          {/* ================================================= */}
          {/* EVIDENCE QUOTE                                    */}
          {/* ================================================= */}

          {hasEvidence && (
            <div
              className="
                mt-3
                rounded-[12px]
                border
                border-white/[0.06]
                bg-black/20
                px-3
                py-2
              "
            >
              <p
                className="
                  line-clamp-2
                  text-[10px]
                  leading-4
                  text-white/28
                "
              >
                “{evidenceQuote}”
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* SOURCE HANDLE                                     */}
      {/* ================================================= */}

      <Handle
        type="source"
        position={
          sourcePosition
        }
        style={{
          width: 9,
          height: 9,
          background:
            theme.secondary,
          border:
            "2px solid #050814",
          boxShadow:
            `0 0 12px ${theme.glow}`,
          zIndex: 30,
        }}
      />
    </motion.div>
  );
}