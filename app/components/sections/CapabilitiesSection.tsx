"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ScanSearch,
  GitBranch,
  BookOpenText,
  ArrowRight,
} from "lucide-react";

type Capability = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  label: string;
  gradient: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
  pipelineFrom: string;
  pipelineTo: string;
};

const capabilities: Capability[] = [
  {
    id: "entity-extraction",
    eyebrow: "01",
    title: "Extract biology",
    text:
      "Identify cells, genes, proteins, pathways, biological processes, and disease mechanisms from complex oncology literature.",
    label: "ENTITY EXTRACTION",
    gradient: "from-teal-200 via-cyan-300 to-sky-300",
    glow: "rgba(45, 212, 191, 0.12)",
    icon: ScanSearch,
    pipelineFrom: "PAPER",
    pipelineTo: "ENTITIES",
  },
  {
    id: "mechanism-intelligence",
    eyebrow: "02",
    title: "Build mechanisms",
    text:
      "Transform extracted entities into directional biological relationships organized across mechanistic layers rather than a flat graph.",
    label: "MECHANISM INTELLIGENCE",
    gradient: "from-cyan-200 via-sky-300 to-indigo-300",
    glow: "rgba(125, 211, 252, 0.11)",
    icon: GitBranch,
    pipelineFrom: "ENTITIES",
    pipelineTo: "MECHANISM",
  },
  {
    id: "evidence-provenance",
    eyebrow: "03",
    title: "Trace every claim",
    text:
      "Preserve the path from biological relationships back to supporting papers, evidence sentences, PMID or DOI records, and experimental context.",
    label: "EVIDENCE PROVENANCE",
    gradient: "from-teal-200 via-cyan-200 to-indigo-300",
    glow: "rgba(165, 180, 252, 0.10)",
    icon: BookOpenText,
    pipelineFrom: "MECHANISM",
    pipelineTo: "EVIDENCE",
  },
];

export default function CapabilitiesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="
        relative
        z-40
        overflow-hidden
        border-y
        border-teal-100/[0.055]
        bg-[#06111a]
        px-6
        py-24
        sm:px-10
        lg:px-16
        lg:py-32
      "
    >
      {/* ================================================= */}
      {/* AMBIENT BACKGROUND                               */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_10%_20%,rgba(45,212,191,.075),transparent_30%),radial-gradient(circle_at_90%_30%,rgba(125,211,252,.06),transparent_31%),radial-gradient(circle_at_50%_120%,rgba(165,180,252,.035),transparent_42%)]
        "
      />

      {/* Subtle grid */}

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
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
        "
        style={{
          backgroundImage: `
            linear-gradient(rgba(94,234,212,.11) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125,211,252,.08) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Cyan ambient field */}

      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [-45, 45, -45],
                y: [-20, 28, -20],
                scale: [0.96, 1.05, 0.96],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -left-48
          -top-48
          h-[520px]
          w-[520px]
          rounded-full
          bg-teal-400/[0.06]
          blur-[150px]
        "
      />

      {/* Violet ambient field */}

      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [45, -45, 45],
                y: [20, -28, 20],
                scale: [1.04, 0.96, 1.04],
              }
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -right-48
          top-10
          h-[560px]
          w-[560px]
          rounded-full
          bg-sky-400/[0.05]
          blur-[155px]
        "
      />

      {/* ================================================= */}
      {/* CONTENT                                          */}
      {/* ================================================= */}

      <div className="relative mx-auto max-w-[1450px]">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 28,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mb-14
            flex
            flex-col
            gap-7
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-teal-200/15
                bg-teal-300/[0.045]
                px-4
                py-2
                backdrop-blur-xl
              "
            >
              <span
                aria-hidden="true"
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-teal-300
                  shadow-[0_0_12px_rgba(94,234,212,.7)]
                "
              />

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-teal-100
                "
              >
                Core intelligence systems
              </p>
            </div>

            <h2
              id="capabilities-heading"
              className="
                mt-6
                max-w-4xl
                text-4xl
                font-semibold
                leading-[1.02]
                tracking-[-0.05em]
                text-white
                sm:text-5xl
                lg:text-[64px]
              "
            >
              Research transformed into

              <span
                className="
                  mt-1
                  block
                  bg-gradient-to-r
                  from-teal-200
                  via-cyan-300
                  to-sky-300
                  bg-clip-text
                  text-transparent
                "
              >
                an explorable biological system.
              </span>
            </h2>
          </div>

          <p
            className="
              max-w-md
              border-l
              border-teal-200/20
              pl-5
              text-sm
              font-medium
              leading-7
              text-slate-300
              sm:text-base
            "
          >
            BioLayers turns oncology literature into structured biological
            entities, mechanistic relationships, and traceable evidence.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* CAPABILITY CARDS                                 */}
        {/* ================================================= */}

        <div className="grid gap-5 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              index={index}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </div>

        {/* ================================================= */}
        {/* SYSTEM FLOW                                      */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-8
            rounded-[24px]
            border
            border-teal-100/[0.065]
            bg-[#0a1b26]/42
            p-5
            backdrop-blur-xl
            sm:p-6
          "
        >
          <div
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.22em]
              text-slate-500
            "
          >
            BioLayers core flow
          </div>

          <div
            className="
              mt-5
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
            "
          >
            <FlowNode text="Scientific paper" />

            <FlowArrow />

            <FlowNode text="Biological entities" />

            <FlowArrow />

            <FlowNode text="Mechanistic relationships" />

            <FlowArrow />

            <FlowNode text="Evidence-linked mechanism" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   CAPABILITY CARD
   ========================================================= */

type CapabilityCardProps = {
  capability: Capability;
  index: number;
  reduceMotion: boolean;
};

function CapabilityCard({
  capability,
  index,
  reduceMotion,
}: CapabilityCardProps) {
  const {
    eyebrow,
    title,
    text,
    label,
    gradient,
    glow,
    icon: Icon,
    pipelineFrom,
    pipelineTo,
  } = capability;

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 30,
              scale: 0.975,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.72,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              scale: 1.008,
            }
      }
      className="
        group
        relative
        min-h-[360px]
        overflow-hidden
        rounded-[26px]
        border
        border-teal-100/[0.08]
        bg-[#081722]/72
        p-7
        backdrop-blur-2xl
        sm:p-8
      "
      style={{
        boxShadow: `0 28px 90px ${glow}`,
      }}
    >
      {/* Ambient card glow */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-60
          w-60
          rounded-full
          bg-gradient-to-br
          ${gradient}
          opacity-[0.12]
          blur-[95px]
          transition-opacity
          duration-500
          group-hover:opacity-[0.20]
        `}
      />

      {/* Top border */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          inset-x-8
          top-0
          h-px
          bg-gradient-to-r
          ${gradient}
          opacity-50
        `}
      />

      {/* ================================================= */}
      {/* TOP                                              */}
      {/* ================================================= */}

      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p
            className="
              font-mono
              text-[8px]
              font-black
              uppercase
              tracking-[0.28em]
              text-slate-500
            "
          >
            SYSTEM / {label}
          </p>

          <p
            className={`
              mt-3
              bg-gradient-to-r
              ${gradient}
              bg-clip-text
              text-xs
              font-black
              tracking-[0.24em]
              text-transparent
            `}
          >
            {eyebrow}
          </p>
        </div>

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-teal-100/[0.085]
            bg-teal-100/[0.035]
          "
        >
          <Icon className="h-5 w-5 text-teal-50/70" />
        </div>
      </div>

      {/* ================================================= */}
      {/* CONTENT                                          */}
      {/* ================================================= */}

      <h3
        className="
          relative
          mt-10
          text-2xl
          font-semibold
          tracking-[-0.035em]
          text-white
          sm:text-3xl
        "
      >
        {title}
      </h3>

      <p
        className="
          relative
          mt-5
          text-sm
          font-medium
          leading-7
          text-slate-300
        "
      >
        {text}
      </p>

      {/* ================================================= */}
      {/* PIPELINE                                         */}
      {/* ================================================= */}

      <div
        className="
          relative
          mt-9
          rounded-[18px]
          border
          border-teal-100/[0.06]
          bg-black/15
          p-4
        "
      >
        <div
          className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.2em]
            text-slate-500
          "
        >
          System transformation
        </div>

        <div
          className="
            mt-4
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              rounded-xl
              border
              border-teal-100/[0.065]
              bg-teal-100/[0.025]
              px-3
              py-2
              font-mono
              text-[10px]
              font-bold
              tracking-[0.12em]
              text-slate-400/85
            "
          >
            {pipelineFrom}
          </span>

          <div className="flex flex-1 items-center">
            <div
              className={`
                h-px
                flex-1
                bg-gradient-to-r
                ${gradient}
                opacity-30
              `}
            />

            <ArrowRight
              className="
                -ml-px
                h-4
                w-4
                text-teal-200/35
              "
            />
          </div>

          <span
            className="
              rounded-xl
              border
              border-teal-100/[0.065]
              bg-teal-100/[0.025]
              px-3
              py-2
              font-mono
              text-[10px]
              font-bold
              tracking-[0.12em]
              text-teal-50/70
            "
          >
            {pipelineTo}
          </span>
        </div>
      </div>

      {/* ================================================= */}
      {/* DECORATIVE LABEL                                 */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-5
          right-6
          font-mono
          text-[8px]
          uppercase
          tracking-[0.22em]
          text-white/[0.10]
        "
      >
        BIOLAYERS / CORE
      </div>

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-12
          w-12
          border-b
          border-l
          border-teal-100/[0.045]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-12
          w-12
          border-r
          border-t
          border-teal-100/[0.045]
        "
      />
    </motion.article>
  );
}

/* =========================================================
   FLOW COMPONENTS
   ========================================================= */

function FlowNode({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className="
        flex-1
        rounded-[16px]
        border
        border-teal-100/[0.065]
        bg-[#0a1b26]/42
        px-4
        py-3
        text-center
        text-xs
        font-semibold
        text-slate-400/85
      "
    >
      {text}
    </div>
  );
}

function FlowArrow() {
  return (
    <ArrowRight
      className="
        mx-auto
        h-4
        w-4
        shrink-0
        rotate-90
        text-teal-300/30
        lg:rotate-0
      "
    />
  );
}