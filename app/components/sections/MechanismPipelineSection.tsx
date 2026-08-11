"use client";

import React from "react";
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
    description: "Start with a PMID, DOI, abstract, or research paper.",
    tags: ["PMID", "DOI", "Abstract", "Paper"],
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
    tags: ["PMID", "Sentence", "Model", "Confidence"],
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
          bg-purple-500/[0.055]
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
          bg-cyan-500/[0.04]
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
          bg-fuchsia-500/[0.05]
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
              text-cyan-300/70
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
            <span className="text-white/35"> to </span>
            <span
              className="
                bg-gradient-to-r
                from-cyan-300
                via-purple-300
                to-fuchsia-300
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
              text-white/50
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
            <div className="absolute inset-0 bg-white/[0.07]" />

            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 4.5,
                delay: 0.3,
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: "linear",
              }}
              className="
                absolute
                top-0
                h-px
                w-[28%]
                bg-gradient-to-r
                from-transparent
                via-cyan-300/70
                to-transparent
              "
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
                    rounded-[28px]
                    border
                    border-white/[0.08]
                    bg-white/[0.022]
                    p-7
                    backdrop-blur-xl
                    transition
                    duration-500
                    hover:-translate-y-1
                    hover:border-white/[0.16]
                    hover:bg-white/[0.04]
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
                      from-cyan-500/[0.07]
                      via-transparent
                      to-fuchsia-500/[0.07]
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
                      text-white/18
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
                        border-white/[0.08]
                        bg-white/[0.035]
                      "
                    >
                      <Icon className="h-5 w-5 text-white/65" />
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
                        text-white/42
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
                            border-white/[0.07]
                            bg-white/[0.025]
                            px-3
                            py-1.5
                            text-[11px]
                            font-medium
                            text-white/38
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
                          text-white/20
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
            rounded-[34px]
            border
            border-white/[0.09]
            bg-white/[0.025]
            p-8
            backdrop-blur-xl
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
              bg-purple-500/[0.06]
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
                text-white/30
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
              <span className="text-white/40">
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
                <React.Fragment key={node}>
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
                      border-white/[0.08]
                      bg-white/[0.035]
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-white/65
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
                        text-white/20
                        lg:rotate-0
                      "
                    />
                  )}
                </React.Fragment>
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
                  border-white/[0.07]
                  bg-white/[0.02]
                  p-5
                "
              >
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-300/55">
                  Direction
                </div>

                <div className="mt-2 text-sm leading-6 text-white/45">
                  Relationships preserve biological directionality instead
                  of becoming generic undirected links.
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  p-5
                "
              >
                <div className="text-xs uppercase tracking-[0.18em] text-purple-300/55">
                  Context
                </div>

                <div className="mt-2 text-sm leading-6 text-white/45">
                  Cancer type, experimental model and biological context can
                  remain attached to the mechanism.
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  p-5
                "
              >
                <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-300/55">
                  Evidence
                </div>

                <div className="mt-2 text-sm leading-6 text-white/45">
                  Every important connection can link back to its paper,
                  evidence sentence and confidence.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}