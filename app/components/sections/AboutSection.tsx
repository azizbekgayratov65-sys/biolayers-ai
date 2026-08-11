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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-white/[0.06]
        bg-[#020105]
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
          bg-[#020105]
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
          bg-violet-500/[0.075]
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
          bg-cyan-400/[0.065]
          blur-[170px]
        "
      />

      {/* Violet atmosphere */}

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
          bg-violet-500/[0.07]
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
            linear-gradient(rgba(103,232,249,.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,.15) 1px, transparent 1px)
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
                border-cyan-300/15
                bg-cyan-300/[0.035]
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
                  bg-cyan-300
                  shadow-[0_0_12px_rgba(103,232,249,.65)]
                "
              />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-cyan-100/75
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
                font-black
                leading-[0.98]
                tracking-[-0.06em]
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
                  from-cyan-300
                  via-white
                  to-violet-400
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
                text-slate-300/70
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
              border-white/[0.08]
              pl-6
              lg:mb-2
              lg:pl-8
            "
          >
            <div className="flex items-center gap-3">
              <Microscope className="h-4 w-4 text-violet-300/60" />

              <span
                className="
                  font-mono
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-violet-200/45
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
                text-white/75
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
                text-slate-400/65
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
            from-cyan-300/30
            via-white/[0.08]
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
                  border-white/[0.07]
                  bg-white/[0.018]
                  p-6
                  backdrop-blur-xl
                  transition-colors
                  duration-300
                  hover:border-white/[0.12]
                  hover:bg-white/[0.025]
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
                    bg-violet-500/[0.07]
                    blur-[80px]
                    transition-all
                    duration-500
                    group-hover:bg-cyan-400/[0.09]
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
                        font-black
                        uppercase
                        tracking-[0.25em]
                        text-cyan-200/35
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
                        text-white/20
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
                      border-white/[0.07]
                      bg-white/[0.025]
                    "
                  >
                    <Icon className="h-4 w-4 text-white/45" />
                  </div>
                </div>

                {/* CONTENT */}

                <h3
                  className="
                    relative
                    mt-10
                    text-2xl
                    font-black
                    tracking-[-0.035em]
                    text-white/90
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
                    text-slate-400/70
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
                    bg-white/[0.05]
                  "
                >
                  <div
                    className="
                      h-full
                      w-20
                      bg-gradient-to-r
                      from-cyan-300/45
                      to-violet-400/20
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
            rounded-[32px]
            border
            border-white/[0.075]
            bg-white/[0.018]
            px-6
            py-12
            backdrop-blur-xl
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
              bg-violet-500/[0.065]
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
                  font-black
                  uppercase
                  tracking-[0.28em]
                  text-violet-200/45
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
                  from-violet-300/60
                  to-transparent
                "
              />
            </div>

            <div>
              <p
                className="
                  max-w-4xl
                  text-2xl
                  font-black
                  leading-[1.3]
                  tracking-[-0.04em]
                  text-white/90
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                A research environment where scientists can move from

                <span className="text-cyan-200">
                  {" "}evidence
                </span>

                <span className="text-white/25">
                  {" "}→{" "}
                </span>

                <span className="text-violet-200">
                  mechanism
                </span>

                <span className="text-white/25">
                  {" "}→{" "}
                </span>

                <span className="text-fuchsia-200">
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
            border-white/[0.06]
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
                  font-mono
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-cyan-200/35
                "
              >
                BioLayers AI
              </div>

              <h3
                className="
                  mt-5
                  max-w-3xl
                  text-3xl
                  font-black
                  tracking-[-0.045em]
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                See the mechanism,
                <span className="block text-white/40">
                  not just the paper.
                </span>
              </h3>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-4
                rounded-full
                border
                border-cyan-300/20
                bg-cyan-300/[0.055]
                px-6
                py-4
                text-sm
                font-bold
                text-cyan-50
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-cyan-300/35
                hover:bg-cyan-300/[0.09]
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
            </button>
          </div>

          {/* Footer line */}

          <div
            className="
              mt-16
              flex
              flex-col
              gap-3
              border-t
              border-white/[0.045]
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
                text-white/20
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
                text-white/15
              "
            >
              Research platform in development
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}