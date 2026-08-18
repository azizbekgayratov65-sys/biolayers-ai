"use client";

import type React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpenText,
  CheckCircle2,
  AlertTriangle,
  CircleHelp,
  GitMerge,
  ArrowRight,
  FileText,
} from "lucide-react";

type EvidenceStatus = "supported" | "conflicting" | "missing";

type EvidenceEdge = {
  from: string;
  to: string;
  relation: string;
  status: EvidenceStatus;
  papers: number;
  note: string;
};

const evidenceEdges: EvidenceEdge[] = [
  {
    from: "CAF",
    to: "TGF-β",
    relation: "secretes",
    status: "supported",
    papers: 4,
    note: "Multiple studies support secretion of TGF-β by stromal fibroblasts in tumor contexts.",
  },
  {
    from: "TGF-β",
    to: "EMT",
    relation: "induces",
    status: "supported",
    papers: 7,
    note: "Consistent evidence links TGF-β signaling with EMT-associated transcriptional programs.",
  },
  {
    from: "EMT",
    to: "Metastasis",
    relation: "contributes to",
    status: "conflicting",
    papers: 5,
    note: "Evidence is context-dependent and varies across models and cancer types.",
  },
  {
    from: "SMAD3",
    to: "Bone colonization",
    relation: "promotes",
    status: "missing",
    papers: 0,
    note: "The proposed mechanistic link is plausible, but direct supporting evidence has not yet been identified.",
  },
];

const papers = [
  {
    id: "Paper A",
    source: "PubMed",
    topic: "CAF signaling",
  },
  {
    id: "Paper B",
    source: "PubMed",
    topic: "TGF-β / EMT",
  },
  {
    id: "Paper C",
    source: "PubMed",
    topic: "Metastatic progression",
  },
];

export default function MultiPaperEvidenceSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="multi-paper-evidence"
      aria-labelledby="multi-paper-evidence-heading"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.04]
        bg-[#06111a]
        px-6
        py-28
        md:px-10
        md:py-36
        lg:px-16
        lg:py-44
      "
    >
      {/* Background */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[900px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.035]
          blur-[200px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-5xl"
        >
          <div
            className="
              mb-6
              text-[11px]
              font-bold
              uppercase
              tracking-[0.24em]
              text-teal-200/75
            "
          >
            Multi-paper evidence synthesis
          </div>

          <h2
            id="multi-paper-evidence-heading"
            className="
              text-4xl
              font-semibold
              leading-[1.04]
              tracking-[-0.045em]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            One mechanism.
            <span
              className="
                ml-3
                bg-gradient-to-r
                from-teal-200
                via-cyan-300
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              Many papers.
            </span>
          </h2>

          <p
            className="
              mt-8
              max-w-4xl
              text-base
              leading-8
              text-slate-300/80
              md:text-lg
              md:leading-9
            "
          >
            BioLayers can merge evidence across studies to reveal where the
            literature agrees, conflicts, or leaves a mechanistic gap.
          </p>
        </motion.div>

        {/* Main synthesis workspace */}
        <div
          className="
            mt-16
            grid
            items-start
            gap-6
            xl:grid-cols-[360px_minmax(0,1fr)]
          "
        >
          {/* Left — papers */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              rounded-[26px]
              border
              border-teal-100/[0.085]
              bg-[#0a1b26]/48
              p-6
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-slate-500/90
              "
            >
              <BookOpenText className="h-4 w-4" />
              Source literature
            </div>

            <div className="mt-6 space-y-3">
              {papers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="
                    rounded-[16px]
                    border
                    border-teal-100/[0.065]
                    bg-teal-100/[0.02]
                    p-4
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-teal-100/[0.065]
                          bg-teal-100/[0.025]
                        "
                      >
                        <FileText className="h-4 w-4 text-slate-400/90" />
                      </div>

                      <div>
                        <div className="text-sm font-medium text-teal-50/80">
                          {paper.id}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500/85">
                          {paper.topic}
                        </div>
                      </div>
                    </div>

                    <div
                      className="
                        rounded-full
                        border
                        border-teal-100/[0.065]
                        bg-teal-100/[0.02]
                        px-2.5
                        py-1
                        text-[9px]
                        uppercase
                        tracking-[0.12em]
                        text-slate-500/80
                      "
                    >
                      {paper.source}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-2
                rounded-[16px]
                border
                border-teal-200/10
                bg-teal-300/[0.04]
                px-4
                py-3
                text-xs
                font-medium
                text-teal-100/70
              "
            >
              <GitMerge className="h-4 w-4" />
              Literature synthesized into one evidence map
            </div>
          </motion.div>

          {/* Right — evidence relationships */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.8,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-teal-100/[0.085]
              bg-[#0a1b26]/48
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-teal-100/[0.065]
                px-6
                py-5
              "
            >
              <div>
                <div
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-slate-500/90
                  "
                >
                  Evidence status by mechanistic edge
                </div>

                <div className="mt-2 text-sm text-slate-300/75">
                  Agreement, contradiction and missing evidence become visible.
                </div>
              </div>
            </div>

            <div className="divide-y divide-teal-100/[0.055]">
              {evidenceEdges.map((edge, index) => (
                <EvidenceRow
                  key={`${edge.from}-${edge.to}`}
                  edge={edge}
                  index={index}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: 0.08,
          }}
          className="
            mt-6
            grid
            gap-3
            sm:grid-cols-3
          "
        >
          <SummaryMetric
            value="2"
            label="Supported edges"
            tone="emerald"
          />
          <SummaryMetric
            value="1"
            label="Conflicting edge"
            tone="amber"
          />
          <SummaryMetric
            value="1"
            label="Evidence gap"
            tone="rose"
          />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
          className="
            mt-6
            grid
            gap-3
            md:grid-cols-3
          "
        >
          <LegendCard
            icon={CheckCircle2}
            title="Supported"
            text="Multiple studies support the same mechanistic relationship."
            accent="text-emerald-300/65"
          />

          <LegendCard
            icon={AlertTriangle}
            title="Conflicting"
            text="Studies disagree or the relationship depends strongly on context."
            accent="text-amber-300/65"
          />

          <LegendCard
            icon={CircleHelp}
            title="Missing link"
            text="A proposed relationship exists, but direct evidence remains insufficient."
            accent="text-rose-300/65"
          />
        </motion.div>
      </div>
    </section>
  );
}

function EvidenceRow({
  edge,
  index,
  reduceMotion,
}: {
  edge: EvidenceEdge;
  index: number;
  reduceMotion: boolean;
}) {
  const statusConfig = {
    supported: {
      icon: CheckCircle2,
      label: "Supported",
      className:
        "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300/65",
    },
    conflicting: {
      icon: AlertTriangle,
      label: "Conflicting",
      className:
        "border-amber-400/15 bg-amber-400/[0.05] text-amber-300/65",
    },
    missing: {
      icon: CircleHelp,
      label: "Missing link",
      className:
        "border-rose-400/15 bg-rose-400/[0.05] text-rose-300/65",
    },
  } as const;

  const config = statusConfig[edge.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
      }}
      className="
        group
        relative
        grid
        gap-4
        px-6
        py-6
        transition-colors
        duration-300
        hover:bg-teal-100/[0.018]
        lg:grid-cols-[minmax(0,1fr)_150px]
        lg:items-center
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-y-4
          left-0
          w-px
          bg-gradient-to-b
          from-transparent
          via-teal-200/12
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <div>
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            text-sm
            font-medium
            text-teal-50/82
          "
        >
          <span>{edge.from}</span>

          <div className="flex items-center gap-1.5 text-slate-500/80">
            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.12em]
              "
            >
              {edge.relation}
            </span>

            <ArrowRight className="h-3.5 w-3.5" />
          </div>

          <span>{edge.to}</span>
        </div>

        <p
          className="
            mt-2
            max-w-3xl
            text-xs
            leading-6
            text-slate-400/90
          "
        >
          {edge.note}
        </p>

        <div className="mt-3 text-[10px] uppercase tracking-[0.12em] text-slate-500/75">
          {edge.papers > 0
            ? `${edge.papers} supporting / relevant papers`
            : "No direct supporting paper identified"}
        </div>
      </div>

      <div className="lg:flex lg:justify-end">
        <div
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            px-3
            py-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.12em]
            ${config.className}
          `}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </div>
    </motion.div>
  );
}

function LegendCard({
  icon: Icon,
  title,
  text,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <div
      className="
        rounded-[16px]
        border
        border-teal-100/[0.065]
        bg-[#0a1b26]/42
        p-4
      "
    >
      <div
        className={`
          flex
          items-center
          gap-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          ${accent}
        `}
      >
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>

      <p className="mt-2 text-xs leading-6 text-slate-400/90">
        {text}
      </p>
    </div>
  );
}

function SummaryMetric({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const toneClass = {
    emerald:
      "border-emerald-300/10 bg-emerald-300/[0.035] text-emerald-200/75",
    amber:
      "border-amber-300/10 bg-amber-300/[0.035] text-amber-200/75",
    rose:
      "border-rose-300/10 bg-rose-300/[0.035] text-rose-200/75",
  }[tone];

  return (
    <div
      className={`
        rounded-[16px]
        border
        px-4
        py-3.5
        ${toneClass}
      `}
    >
      <div className="text-lg font-semibold">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.13em] opacity-70">
        {label}
      </div>
    </div>
  );
}