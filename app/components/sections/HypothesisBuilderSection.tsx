"use client";

import type React from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
  id="hypothesis-builder"
  aria-labelledby="hypothesis-builder-heading"
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
          h-[1000px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.032]
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
          bg-sky-400/[0.03]
          blur-[170px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

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
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-teal-200/75
            "
          >
            Hypothesis Builder
          </div>

          <h2
            id="hypothesis-builder-heading"
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
                from-teal-200
                via-cyan-300
                to-sky-300
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
              text-slate-300/80
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
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              rounded-[26px]
              border
              border-teal-100/[0.085]
              bg-[#0a0f14]/48
              p-6
              backdrop-blur-2xl
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
                text-slate-500/90
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
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    className="
                      rounded-[18px]
                      border
                      border-teal-100/[0.065]
                      bg-teal-100/[0.02]
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
                          border-teal-100/[0.065]
                          bg-teal-100/[0.025]
                        "
                      >
                        <Icon className="h-4 w-4 text-slate-400/90" />
                      </div>

                      <div
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-slate-500/80
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
                        text-teal-50/82
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-400/90
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
                rounded-[20px]
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
                  text-teal-50/76
                "
              >
                <span
                  className="
                    rounded-xl
                    border
                    border-teal-100/[0.065]
                    bg-teal-100/[0.025]
                    px-4
                    py-2
                  "
                >
                  SMAD3 activation
                </span>

                <ArrowRight className="h-4 w-4 text-slate-500/75" />

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

                <ArrowRight className="h-4 w-4 text-slate-500/75" />

                <span
                  className="
                    rounded-xl
                    border
                    border-teal-100/[0.065]
                    bg-teal-100/[0.025]
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
                  text-slate-400/82
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
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
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
              bg-[#0a0f14]/48
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
                <Sparkles className="h-4 w-4" />
                Structured hypothesis
              </div>

              <div
                className="
                  rounded-full
                  border
                  border-sky-200/10
                  bg-sky-200/[0.035]
                  px-3
                  py-1.5
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-sky-100/65
                "
              >
                Demo
              </div>
            </div>

            <div className="p-6">
              <HypothesisBlock
                icon={Lightbulb}
                label="Hypothesis"
                accent="text-teal-200/70"
              >
                Increased SMAD3 activity may promote molecular programs that
                enhance metastatic colonization of bone in a context-dependent
                manner.
              </HypothesisBlock>

              <HypothesisBlock
                icon={GitBranch}
                label="Mechanistic rationale"
                accent="text-sky-200/70"
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
                accent="text-cyan-200/70"
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
                    text-slate-400/85
                  "
                >
                  Hypotheses should remain clearly separated from established
                  evidence. BioLayers should never present inference as
                  confirmed biology.
                </p>
              </div>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-3
                  gap-2
                "
              >
                <OutputMetric
                  value="1"
                  label="Gap"
                />
                <OutputMetric
                  value="1"
                  label="Hypothesis"
                />
                <OutputMetric
                  value="1"
                  label="Validation path"
                />
              </div>

              <a
                href="/explore"
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
                  border-teal-100/[0.10]
                  bg-teal-100/[0.045]
                  px-5
                  py-3.5
                  text-sm
                  font-medium
                  text-teal-50/82
                  transition
                  duration-300
                  hover:border-teal-200/20
                  hover:bg-teal-300/[0.06]
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
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function OutputMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-[14px]
        border
        border-teal-100/[0.055]
        bg-teal-100/[0.02]
        px-3
        py-3
        text-center
      "
    >
      <div className="text-sm font-semibold text-teal-50/85">
        {value}
      </div>

      <div
        className="
          mt-1
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.11em]
          text-slate-500/80
        "
      >
        {label}
      </div>
    </div>
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
        border-teal-100/[0.065]
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
          text-slate-400/90
        "
      >
        {children}
      </p>
    </div>
  );
}