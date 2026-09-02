"use client";

import type React from "react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ScanSearch,
  Network,
  Layers3,
  BadgeCheck,
  GitBranch,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Input",
    description:
      "Start with a research paper, abstract, or pasted research text.",
    tags: ["PDF", "DOCX", "TXT", "Abstract", "Text"],
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Extract",
    description:
      "Identify the biological entities that matter inside the literature.",
    tags: ["Cells", "Genes", "Proteins", "Pathways"],
  },
  {
    number: "03",
    icon: Network,
    title: "Connect",
    description:
      "Reconstruct directional biological relationships between entities.",
    tags: ["Activates", "Inhibits", "Secretes", "Regulates"],
  },
  {
    number: "04",
    icon: Layers3,
    title: "Layer",
    description:
      "Organize the mechanism across biological scales instead of one flat graph.",
    tags: ["Cell", "Molecule", "Pathway", "Phenotype"],
  },
  {
    number: "05",
    icon: BadgeCheck,
    title: "Evidence",
    description:
      "Attach provenance and supporting evidence to each mechanistic connection.",
    tags: ["Source", "PMID", "Model", "Confidence"],
  },
  {
    number: "06",
    icon: GitBranch,
    title: "Mechanism Map",
    description:
      "Turn fragmented findings into an interpretable, evidence-linked cancer mechanism.",
    tags: ["Mechanism", "Evidence", "Context", "Reasoning"],
  },
];

export default function MechanismPipelineSection() {
  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.04]
        bg-[#04070a]
        px-6
        py-28
        md:px-10
        md:py-36
        lg:px-16
        lg:py-44
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[900px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.045]
          blur-[190px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-[-180px]
          top-[20%]
          -z-10
          h-[440px]
          w-[440px]
          rounded-full
          bg-sky-400/[0.035]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-220px]
          right-[-120px]
          -z-10
          h-[520px]
          w-[520px]
          rounded-full
          bg-indigo-400/[0.028]
          blur-[160px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
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
              text-teal-200/75
            "
          >
            From literature to mechanism
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
            From papers
            <span className="text-slate-400/80"> to </span>
            <span
              className="
                bg-gradient-to-r
                from-teal-200
                via-cyan-300
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              mechanisms.
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
            BioLayers transforms scientific literature into structured
            biological reasoning — extracting entities, reconstructing
            directional relationships, organizing them across biological
            layers, and connecting each relationship back to evidence.
          </p>
        </motion.div>

        {/* PIPELINE */}

        <div className="relative mt-20">
          {/* DESKTOP FLOW LINE */}

          <div
            className="
              pointer-events-none
              absolute
              left-[8%]
              right-[8%]
              top-[72px]
              hidden
              h-px
              overflow-hidden
              lg:block
            "
          >
            <div className="absolute inset-0 bg-teal-100/[0.06]" />

            <div
              className={`
                absolute
                top-0
                h-px
                w-[28%]
                bg-gradient-to-r
                from-transparent
                via-teal-200/65
                to-transparent
                bl-flow-sweep
              `}
            />
          </div>

          <div
            className="
              grid
              gap-5
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{
                    opacity: 0,
                    y: 28,
                    scale: 0.985,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.25,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-teal-100/[0.075]
                    bg-[#0a0f14]/48
                    p-7
                    backdrop-blur-2xl
                    transition
                    duration-500
                    hover:-translate-y-1
                    hover:border-teal-100/[0.16]
                    hover:bg-[#10161d]/68
                    md:p-8
                  "
                >
                  {/* CARD GLOW */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      opacity-0
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                      bg-gradient-to-br
                      from-teal-400/[0.055]
                      via-transparent
                      to-sky-400/[0.045]
                    "
                  />

                  {/* NUMBER */}

                  <div
                    className="
                      absolute
                      right-6
                      top-5
                      text-xs
                      font-medium
                      tracking-[0.18em]
                      text-slate-500/65
                    "
                  >
                    {step.number}
                  </div>

                  <div className="relative">
                    {/* ICON */}

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-teal-100/[0.075]
                        bg-teal-100/[0.035]
                      "
                    >
                      <Icon className="h-5 w-5 text-teal-50/75" />
                    </div>

                    {/* TITLE */}

                    <h3
                      className="
                        mt-8
                        text-2xl
                        font-medium
                        tracking-[-0.03em]
                        text-white
                      "
                    >
                      {step.title}
                    </h3>

                    {/* DESCRIPTION */}

                    <p
                      className="
                        mt-3
                        min-h-[72px]
                        text-sm
                        leading-6
                        text-slate-400/90
                      "
                    >
                      {step.description}
                    </p>

                    {/* TAGS */}

                    <div className="mt-6 flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <span
                          key={tag}
                          className="
                            rounded-full
                            border
                            border-teal-100/[0.065]
                            bg-teal-100/[0.025]
                            px-3
                            py-1.5
                            text-[11px]
                            font-medium
                            text-slate-400/80
                          "
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* SMALL FLOW ARROW */}

                    {index < steps.length - 1 && (
                      <div
                        className="
                          mt-8
                          flex
                          items-center
                          gap-2
                          text-xs
                          uppercase
                          tracking-[0.16em]
                          text-slate-500/75
                          lg:hidden
                        "
                      >
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* MECHANISTIC EXAMPLE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 26,
          }}
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
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            mt-20
            overflow-hidden
            rounded-[28px]
            border
            border-teal-100/[0.085]
            bg-teal-100/[0.025]
            p-8
            backdrop-blur-2xl
            md:p-10
            lg:p-12
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[400px]
              w-[700px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-sky-400/[0.04]
              blur-[130px]
            "
          />

          <div className="relative">
            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.28em]
                text-slate-500/85
              "
            >
              Example mechanistic chain
            </div>

            <h3
              className="
                mt-4
                max-w-3xl
                text-2xl
                font-medium
                tracking-[-0.03em]
                text-white
                md:text-3xl
              "
            >
              Not just connected entities.
              <span className="text-slate-400/85">
                {" "}
                Connected biological meaning.
              </span>
            </h3>

            <div
              className="
                mt-10
                flex
                flex-col
                gap-3
                lg:flex-row
                lg:items-center
              "
            >
              {[
                "Cancer-associated fibroblast",
                "TGF-β",
                "TGFBR",
                "SMAD2/3",
                "EMT",
                "Invasion",
                "Metastatic phenotype",
              ].map((node, index, array) => (
                <Fragment key={node}>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 14,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.5,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    className="
                      rounded-2xl
                      border
                      border-teal-100/[0.075]
                      bg-teal-100/[0.035]
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-teal-50/75
                    "
                  >
                    {node}
                  </motion.div>

                  {index < array.length - 1 && (
                    <ArrowRight
                      className="
                        h-4
                        w-4
                        shrink-0
                        rotate-90
                        text-slate-500/75
                        lg:rotate-0
                      "
                    />
                  )}
                </Fragment>
              ))}
            </div>

            <div
              className="
                mt-8
                grid
                gap-4
                md:grid-cols-3
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-teal-100/[0.065]
                  bg-[#0a0f14]/42
                  p-5
                "
              >
                <div className="text-xs uppercase tracking-[0.18em] text-teal-200/65">
                  Direction
                </div>

                <div className="mt-2 text-sm leading-6 text-slate-400/90">
                  Relationships preserve biological directionality instead
                  of becoming generic undirected links.
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-teal-100/[0.065]
                  bg-[#0a0f14]/42
                  p-5
                "
              >
                <div className="text-xs uppercase tracking-[0.18em] text-sky-200/65">
                  Context
                </div>

                <div className="mt-2 text-sm leading-6 text-slate-400/90">
                  Cancer type, experimental model and biological context can
                  remain attached to the mechanism.
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-teal-100/[0.065]
                  bg-[#0a0f14]/42
                  p-5
                "
              >
                <div className="text-xs uppercase tracking-[0.18em] text-indigo-200/65">
                  Evidence
                </div>

                <div className="mt-2 text-sm leading-6 text-slate-400/90">
                  Every important connection links back to its source
                  reference, evidence classification and confidence.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}