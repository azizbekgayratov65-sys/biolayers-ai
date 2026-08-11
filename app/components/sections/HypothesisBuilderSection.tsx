"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Beaker,
  BookOpenText,
  CircleHelp,
  FlaskConical,
  GitBranch,
  Lightbulb,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const hypothesisSteps = [
  {
    icon: CircleHelp,
    title: "Identify the gap",
    text: "Select a weak, conflicting, or missing mechanistic connection.",
  },
  {
    icon: GitBranch,
    title: "Define the mechanism",
    text: "Specify the biological entities, directionality, and proposed causal relationship.",
  },
  {
    icon: BookOpenText,
    title: "Ground in evidence",
    text: "Separate established findings from inference and unresolved uncertainty.",
  },
  {
    icon: Beaker,
    title: "Make it testable",
    text: "Translate the mechanistic gap into an experimentally falsifiable hypothesis.",
  },
];

export default function HypothesisBuilderSection() {
  return (
    <section
  id="hypothesis-builder"
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
          h-[1000px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-fuchsia-500/[0.04]
          blur-[210px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-180px]
          top-[12%]
          -z-10
          h-[500px]
          w-[500px]
          rounded-full
          bg-cyan-500/[0.04]
          blur-[170px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

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
              text-fuchsia-300/70
            "
          >
            Hypothesis Builder
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
            Turn uncertainty into
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
              a testable hypothesis.
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
            BioLayers can help researchers move from an unresolved
            mechanistic gap to a structured hypothesis while keeping the
            supporting evidence, uncertainty, and assumptions visible.
          </p>
        </motion.div>

        {/* MAIN WORKSPACE */}

        <div
          className="
            mt-16
            grid
            items-start
            gap-6
            xl:grid-cols-[minmax(0,1fr)_430px]
          "
        >
          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
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
              md:p-8
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
              <Lightbulb className="h-4 w-4" />
              Hypothesis workflow
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {hypothesisSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    className="
                      rounded-[20px]
                      border
                      border-white/[0.07]
                      bg-white/[0.02]
                      p-5
                    "
                  >
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
                        <Icon className="h-4 w-4 text-white/45" />
                      </div>

                      <div
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-white/24
                        "
                      >
                        Step {index + 1}
                      </div>
                    </div>

                    <h3
                      className="
                        mt-5
                        text-lg
                        font-medium
                        text-white/72
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-white/36
                      "
                    >
                      {step.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* GAP EXAMPLE */}

            <div
              className="
                mt-6
                rounded-[22px]
                border
                border-amber-300/10
                bg-amber-300/[0.025]
                p-5
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
                  tracking-[0.15em]
                  text-amber-300/45
                "
              >
                <CircleHelp className="h-4 w-4" />
                Selected mechanistic gap
              </div>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  text-sm
                  font-medium
                  text-white/65
                "
              >
                <span
                  className="
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    px-4
                    py-2
                  "
                >
                  SMAD3 activation
                </span>

                <ArrowRight className="h-4 w-4 text-white/20" />

                <span
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-amber-300/20
                    bg-amber-300/[0.025]
                    px-4
                    py-2
                    text-amber-100/65
                  "
                >
                  ?
                </span>

                <ArrowRight className="h-4 w-4 text-white/20" />

                <span
                  className="
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    px-4
                    py-2
                  "
                >
                  Bone colonization
                </span>
              </div>

              <p
                className="
                  mt-4
                  max-w-3xl
                  text-xs
                  leading-5
                  text-white/32
                "
              >
                The map contains evidence on both sides of the chain, but
                direct evidence for the intermediate causal step remains weak
                or incomplete.
              </p>
            </div>
          </motion.div>

          {/* RIGHT — GENERATED STRUCTURE */}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
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
                <Sparkles className="h-4 w-4" />
                Structured hypothesis
              </div>

              <div
                className="
                  rounded-full
                  border
                  border-purple-300/10
                  bg-purple-300/[0.04]
                  px-3
                  py-1.5
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-purple-200/50
                "
              >
                Demo
              </div>
            </div>

            <div className="p-6">
              <HypothesisBlock
                icon={Lightbulb}
                label="Hypothesis"
                accent="text-cyan-300/55"
              >
                Increased SMAD3 activity may promote molecular programs that
                enhance metastatic colonization of bone in a context-dependent
                manner.
              </HypothesisBlock>

              <HypothesisBlock
                icon={GitBranch}
                label="Mechanistic rationale"
                accent="text-purple-300/55"
              >
                TGF-β/SMAD signaling can alter transcriptional states linked to
                invasion, stromal interaction, and metastatic progression.
              </HypothesisBlock>

              <HypothesisBlock
                icon={BookOpenText}
                label="Evidence gap"
                accent="text-amber-300/55"
              >
                Direct evidence connecting SMAD3 activation specifically to
                successful bone colonization remains insufficient in the
                selected mechanism.
              </HypothesisBlock>

              <HypothesisBlock
                icon={FlaskConical}
                label="Possible validation"
                accent="text-fuchsia-300/55"
              >
                Compare bone-colonization phenotypes after controlled SMAD3
                perturbation in an appropriate metastatic cancer model.
              </HypothesisBlock>

              <div
                className="
                  mt-5
                  rounded-[18px]
                  border
                  border-emerald-300/10
                  bg-emerald-300/[0.025]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-emerald-300/50
                  "
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Research principle
                </div>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-white/35
                  "
                >
                  Hypotheses should remain clearly separated from established
                  evidence. BioLayers should never present inference as
                  confirmed biology.
                </p>
              </div>

              <button
                type="button"
                className="
                  group
                  mt-6
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[16px]
                  border
                  border-white/[0.1]
                  bg-white/[0.045]
                  px-5
                  py-3.5
                  text-sm
                  font-medium
                  text-white/72
                  transition
                  duration-300
                  hover:border-fuchsia-300/20
                  hover:bg-fuchsia-300/[0.055]
                  hover:text-white
                "
              >
                Open Hypothesis Builder

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HypothesisBlock({
  icon: Icon,
  label,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        border-b
        border-white/[0.07]
        py-5
        first:pt-0
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
        {label}
      </div>

      <p
        className="
          mt-3
          text-sm
          leading-6
          text-white/43
        "
      >
        {children}
      </p>
    </div>
  );
}