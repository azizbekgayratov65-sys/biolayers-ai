"use client";

import React from "react";
import { motion } from "framer-motion";
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
  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
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
          bg-fuchsia-500/[0.045]
          blur-[200px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
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
              text-sm
              font-medium
              uppercase
              tracking-[0.3em]
              text-cyan-300/70
            "
          >
            Multi-paper evidence synthesis
          </div>

          <h2
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
                from-cyan-300
                via-purple-300
                to-fuchsia-300
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
              text-white/50
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
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              rounded-[30px]
              border
              border-white/[0.09]
              bg-white/[0.022]
              p-6
              backdrop-blur-xl
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
                text-white/26
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
                    rounded-[18px]
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
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
                          border-white/[0.07]
                          bg-white/[0.025]
                        "
                      >
                        <FileText className="h-4 w-4 text-white/45" />
                      </div>

                      <div>
                        <div className="text-sm font-medium text-white/70">
                          {paper.id}
                        </div>

                        <div className="mt-0.5 text-xs text-white/28">
                          {paper.topic}
                        </div>
                      </div>
                    </div>

                    <div
                      className="
                        rounded-full
                        border
                        border-white/[0.07]
                        bg-white/[0.02]
                        px-2.5
                        py-1
                        text-[9px]
                        uppercase
                        tracking-[0.12em]
                        text-white/25
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
                border-cyan-300/10
                bg-cyan-300/[0.035]
                px-4
                py-3
                text-xs
                font-medium
                text-cyan-200/55
              "
            >
              <GitMerge className="h-4 w-4" />
              Evidence merged into one mechanism
            </div>
          </motion.div>

          {/* Right — evidence relationships */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.8,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              overflow-hidden
              rounded-[30px]
              border
              border-white/[0.09]
              bg-white/[0.022]
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/[0.07]
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
                    text-white/26
                  "
                >
                  Evidence status by mechanistic edge
                </div>

                <div className="mt-2 text-sm text-white/48">
                  Agreement, contradiction and missing evidence become visible.
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {evidenceEdges.map((edge, index) => (
                <EvidenceRow
                  key={`${edge.from}-${edge.to}`}
                  edge={edge}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
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
}: {
  edge: EvidenceEdge;
  index: number;
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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
      }}
      className="
        grid
        gap-4
        px-6
        py-6
        lg:grid-cols-[minmax(0,1fr)_150px]
        lg:items-center
      "
    >
      <div>
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            text-sm
            font-medium
            text-white/72
          "
        >
          <span>{edge.from}</span>

          <div className="flex items-center gap-1.5 text-white/25">
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
            leading-5
            text-white/34
          "
        >
          {edge.note}
        </p>

        <div className="mt-3 text-[10px] uppercase tracking-[0.12em] text-white/20">
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
        rounded-[18px]
        border
        border-white/[0.07]
        bg-white/[0.018]
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

      <p className="mt-2 text-xs leading-5 text-white/34">
        {text}
      </p>
    </div>
  );
}