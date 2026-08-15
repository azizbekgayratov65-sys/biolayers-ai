"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Network,
  Lightbulb,
  Microscope,
} from "lucide-react";

/* =========================================================
   ABOUT DATA
   ========================================================= */

const principles = [
  {
    number: "01",
    label: "THE PROBLEM",
    title: "Evidence is fragmented.",
    text:
      "Cancer mechanisms are described across papers, experiments, genes, proteins, pathways, cell types, and disease contexts — often as disconnected pieces of evidence.",
    icon: BookOpenText,
  },
  {
    number: "02",
    label: "THE APPROACH",
    title: "Reconstruct the mechanism.",
    text:
      "BioLayers is being built to organize biological entities and relationships into explorable mechanistic maps while preserving the evidence behind them.",
    icon: Network,
  },
  {
    number: "03",
    label: "THE VISION",
    title: "Reason across biology.",
    text:
      "The goal is a research environment where scientists can move from literature to mechanism, from mechanism to evidence, and from evidence to new hypotheses.",
    icon: Lightbulb,
  },
] as const;

/* =========================================================
   ABOUT SECTION
   ========================================================= */

export default function AboutSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.05]
        bg-[#06111a]
        px-6
        py-28
        sm:px-10
        sm:py-32
        lg:px-16
        lg:py-40
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-30
          bg-[#06111a]
        "
      />

      {/* BioJourney transition glow */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[-300px]
          -z-20
          h-[720px]
          w-[1000px]
          -translate-x-1/2
          rounded-full
          bg-teal-400/[0.055]
          blur-[180px]
        "
      />

      {/* Cyan atmosphere */}

      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [-35, 35, -35],
                y: [-10, 20, -10],
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
          -left-52
          top-[20%]
          -z-20
          h-[500px]
          w-[500px]
          rounded-full
          bg-sky-400/[0.045]
          blur-[170px]
        "
      />

      {/* Teal atmosphere */}

      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [35, -35, 35],
                y: [10, -20, 10],
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
          -right-52
          bottom-[-80px]
          -z-20
          h-[540px]
          w-[540px]
          rounded-full
          bg-teal-400/[0.045]
          blur-[180px]
        "
      />

      {/* Very subtle grid */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          opacity-[0.018]
          [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]
        "
        style={{
          backgroundImage: `
            linear-gradient(rgba(94,234,212,.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125,211,252,.10) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ================================================= */}
      {/* MAIN CONTENT                                     */}
      {/* ================================================= */}

      <div className="relative mx-auto max-w-[1450px]">
        {/* ================================================= */}
        {/* INTRO                                           */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 35,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            grid
            gap-12
            lg:grid-cols-[1.3fr_.7fr]
            lg:items-end
            lg:gap-20
          "
        >
          {/* LEFT */}

          <div className="max-w-5xl">
            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-teal-200/15
                bg-teal-300/[0.04]
                px-4
                py-2
                backdrop-blur-2xl
              "
            >
              <span
                aria-hidden="true"
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-teal-300
                  shadow-[0_0_12px_rgba(94,234,212,.60)]
                "
              />

              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-teal-50/80
                "
              >
                About BioLayers AI
              </span>
            </div>

            <h2
              id="about-heading"
              className="
                mt-7
                max-w-5xl
                text-4xl
                font-semibold
                leading-[0.98]
                tracking-[-0.05em]
                text-white
                sm:text-5xl
                lg:text-6xl
                xl:text-[76px]
              "
            >
              Cancer biology is written across

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-teal-200
                  via-cyan-100
                  to-sky-300
                  bg-clip-text
                  text-transparent
                "
              >
                disconnected evidence.
              </span>
            </h2>

            <p
              className="
                mt-8
                max-w-3xl
                text-base
                font-medium
                leading-8
                text-slate-300/82
                sm:text-lg
                sm:leading-9
              "
            >
              BioLayers AI is being built to transform fragmented cancer
              literature into structured, explorable mechanistic maps —
              connecting biological entities, relationships, and supporting
              evidence across multiple layers of disease biology.
            </p>
          </div>

          {/* RIGHT */}

          <div
            className="
              border-l
              border-teal-100/[0.07]
              pl-6
              lg:mb-2
              lg:pl-8
            "
          >
            <div className="flex items-center gap-3">
              <Microscope className="h-4 w-4 text-teal-200/65" />

              <span
                className="
                  font-mono
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-teal-100/55
                "
              >
                Research origin
              </span>
            </div>

            <p
              className="
                mt-5
                text-lg
                font-semibold
                leading-8
                tracking-[-0.02em]
                text-teal-50/82
              "
            >
              Built from a researcher&apos;s frustration with fragmented
              cancer literature.
            </p>

            <p
              className="
                mt-4
                text-sm
                leading-7
                text-slate-400/85
              "
            >
              The idea is simple: researchers should not have to reconstruct
              complex biological mechanisms manually across dozens of
              disconnected papers.
            </p>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* DIVIDER                                         */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  scaleX: 0,
                  opacity: 0,
                }
          }
          whileInView={{
            scaleX: 1,
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.1,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-20
            h-px
            origin-left
            bg-gradient-to-r
            from-teal-200/30
            via-cyan-100/[0.08]
            to-transparent
            lg:mt-28
          "
        />

        {/* ================================================= */}
        {/* THREE PRINCIPLES                                */}
        {/* ================================================= */}

        <div
          className="
            mt-10
            grid
            gap-4
            lg:grid-cols-3
          "
        >
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <motion.article
                key={principle.number}
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
                        y: -4,
                      }
                }
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-teal-100/[0.065]
                  bg-[#0a1b26]/44
                  p-6
                  backdrop-blur-2xl
                  transition-colors
                  duration-300
                  hover:border-teal-100/[0.13]
                  hover:bg-teal-100/[0.035]
                  sm:p-7
                "
              >
                {/* Hover glow */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-52
                    w-52
                    rounded-full
                    bg-teal-400/[0.045]
                    blur-[80px]
                    transition-all
                    duration-500
                    group-hover:bg-teal-300/[0.07]
                  "
                />

                {/* HEADER */}

                <div
                  className="
                    relative
                    flex
                    items-start
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <div
                      className="
                        font-mono
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-[0.25em]
                        text-teal-200/45
                      "
                    >
                      {principle.label}
                    </div>

                    <div
                      className="
                        mt-3
                        font-mono
                        text-[10px]
                        font-bold
                        tracking-[0.2em]
                        text-slate-500/75
                      "
                    >
                      {principle.number}
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-teal-100/[0.065]
                      bg-teal-100/[0.03]
                    "
                  >
                    <Icon className="h-4 w-4 text-slate-300/75" />
                  </div>
                </div>

                {/* CONTENT */}

                <h3
                  className="
                    relative
                    mt-10
                    text-2xl
                    font-semibold
                    tracking-[-0.035em]
                    text-teal-50/92
                  "
                >
                  {principle.title}
                </h3>

                <p
                  className="
                    relative
                    mt-5
                    text-sm
                    leading-7
                    text-slate-400/88
                  "
                >
                  {principle.text}
                </p>

                {/* Bottom accent */}

                <div
                  aria-hidden="true"
                  className="
                    relative
                    mt-8
                    h-px
                    overflow-hidden
                    bg-teal-100/[0.045]
                  "
                >
                  <div
                    className="
                      h-full
                      w-20
                      bg-gradient-to-r
                      from-teal-200/45
                      to-sky-300/20
                    "
                  />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ================================================= */}
        {/* VISION STATEMENT                                */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 35,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            relative
            mt-16
            overflow-hidden
            rounded-[28px]
            border
            border-teal-100/[0.07]
            bg-[#0a1b26]/44
            px-6
            py-12
            backdrop-blur-2xl
            sm:px-10
            sm:py-14
            lg:mt-20
            lg:px-14
            lg:py-16
          "
        >
          {/* Glow */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[350px]
              w-[700px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-teal-400/[0.045]
              blur-[120px]
            "
          />

          <div
            className="
              relative
              grid
              gap-10
              lg:grid-cols-[.35fr_1.65fr]
              lg:items-start
            "
          >
            <div>
              <div
                className="
                  font-mono
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-teal-100/55
                "
              >
                The long-term vision
              </div>

              <div
                className="
                  mt-5
                  h-px
                  w-12
                  bg-gradient-to-r
                  from-teal-200/60
                  to-transparent
                "
              />
            </div>

            <div>
              <p
                className="
                  max-w-4xl
                  text-2xl
                  font-semibold
                  leading-[1.3]
                  tracking-[-0.04em]
                  text-teal-50/92
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                A research environment where scientists can move from

                <span className="text-teal-100">
                  {" "}evidence
                </span>

                <span className="text-slate-500/80">
                  {" "}→{" "}
                </span>

                <span className="text-sky-200">
                  mechanism
                </span>

                <span className="text-slate-500/80">
                  {" "}→{" "}
                </span>

                <span className="text-cyan-200">
                  hypothesis
                </span>

                {" "}without losing the biological context in between.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* FINAL CTA                                       */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 30,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.85,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-24
            border-t
            border-teal-100/[0.05]
            pt-14
            lg:mt-32
            lg:pt-16
          "
        >
          <div
            className="
              flex
              flex-col
              gap-10
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    font-mono
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-teal-200/45
                  "
                >
                  BioLayers AI
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-emerald-300/10
                    bg-emerald-300/[0.035]
                    px-2.5
                    py-1
                    font-mono
                    text-[7px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-emerald-200/65
                  "
                >
                  Research platform in development
                </span>
              </div>

              <h3
                className="
                  mt-5
                  max-w-3xl
                  text-3xl
                  font-semibold
                  tracking-[-0.045em]
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                See the mechanism,
                <span className="block text-slate-400/85">
                  not just the paper.
                </span>
              </h3>
            </div>

            <a
              href="/explore"
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-4
                rounded-full
                border
                border-teal-200/20
                bg-teal-300/[0.055]
                px-6
                py-4
                text-sm
                font-bold
                text-teal-50
                backdrop-blur-2xl
                transition-all
                duration-300
                hover:border-teal-200/35
                hover:bg-teal-300/[0.09]
              "
            >
              Explore BioLayers

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

          {/* Footer line */}

          <div
            className="
              mt-16
              flex
              flex-col
              gap-3
              border-t
              border-teal-100/[0.04]
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <span
              className="
                font-mono
                text-[7px]
                uppercase
                tracking-[0.24em]
                text-slate-500/75
              "
            >
              Computational oncology · Mechanistic intelligence
            </span>

            <span
              className="
                font-mono
                text-[7px]
                uppercase
                tracking-[0.24em]
                text-slate-600/80
              "
            >
              Evidence-aware biological reasoning
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}