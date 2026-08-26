"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";

type PressItem = {
  name: string;
  headline: string;
  description: string;
  url: string;
  date: string;
  logo?: string;
};

const pressItems: PressItem[] = [
  {
    name: "AI Business",
    headline: "BioLayers AI: Cancer Literature Maps",
    description:
      "A teenager in Tashkent read 100 cancer papers and built the tool he was missing — transforming fragmented literature into explorable mechanistic maps.",
    url: "https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps",
    date: "2026-08-25",
  },
];

export default function PressSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="press"
      aria-labelledby="press-heading"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.04]
        bg-[#04070a]
        px-6
        py-24
        sm:px-10
        sm:py-28
        lg:px-16
        lg:py-36
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                        */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[30%]
          -z-20
          h-[700px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.03]
          blur-[180px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          opacity-[0.2]
          [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]
          bg-[linear-gradient(rgba(141,178,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,.015)_1px,transparent_1px)]
          bg-[size:80px_80px]
        "
      />

      <div className="mx-auto max-w-5xl">
        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 22,
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
            duration: reduceMotion ? 0 : 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-3xl text-center mx-auto"
        >
          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-teal-200/15
              bg-teal-300/[0.04]
              px-4
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-teal-100/75
            "
          >
            <span className="h-3.5 w-3.5 rounded-full bg-teal-300/60" />
            Featured in
          </div>

          <h2
            id="press-heading"
            className="
              max-w-3xl
              text-3xl
              font-semibold
              leading-[1.04]
              tracking-[-0.05em]
              text-teal-50
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            Recognition &
            <span
              className="
                ml-3
                bg-gradient-to-r
                from-teal-200
                via-cyan-200
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              press coverage
            </span>
          </h2>

          <p
            className="
              mt-6
              max-w-2xl
              mx-auto
              text-base
              leading-8
              text-slate-300/80
              md:text-lg
              md:leading-9
            "
          >
            BioLayers has been featured in publications covering AI-driven
            computational oncology and research tooling.
          </p>
        </motion.div>

{/* ================================================= */}
        {/* PRESS CARDS                                       */}
        {/* ================================================= */}

        <div
          className="
            mt-12
            flex
            flex-wrap
            gap-4
            justify-center
            max-w-6xl
            mx-auto
          "
        >
          {pressItems.map((item, index) => (
            <motion.article
              key={item.name}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 20,
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
                duration: reduceMotion ? 0 : 0.58,
                delay: reduceMotion ? 0 : index * 0.06,
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
                rounded-[24px]
                border
                border-teal-100/[0.07]
                bg-[#0a0f14]/50
                p-6
                shadow-[0_18px_55px_rgba(1,8,15,.16)]
                backdrop-blur-2xl
                transition-colors
                duration-300
                hover:border-teal-100/[0.14]
                hover:bg-[#10161d]/62
                flex-1
                min-w-[260px]
                max-w-[360px]
                basis-[calc(25%-12px)]
              "
            >
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-36
                  w-36
                  rounded-full
                  bg-teal-300/[0.045]
                  blur-[60px]
                  transition
                  duration-500
                  group-hover:bg-teal-300/[0.075]
                "
              />

              <div className="relative">
                {/* Publication name / logo */}
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-emerald-300/20
                    bg-emerald-300/[0.06]
                    px-3
                    py-1.5
                    font-mono
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-emerald-200/90
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {item.name}
                </div>

                {/* Date */}
                <div className="mt-3">
                  <time
                    dateTime={item.date}
                    className="
                      font-mono
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[0.16em]
                      text-slate-500/80
                    "
                  >
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {/* Headline */}
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-teal-50">
                  {item.headline}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-slate-400/90">
                  {item.description}
                </p>

                {/* Read link */}
                <div className="relative mt-6">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-semibold
                      text-teal-200/75
                      transition
                      hover:text-teal-100
                    "
                  >
                    Read the story
                    <motion.span
                      animate={{
                        x: reduceMotion ? 0 : 0,
                      }}
                      whileHover={{
                        x: reduceMotion ? 0 : 4,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </motion.span>
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* ================================================= */}
        {/* FOOTER NOTE                                       */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 16,
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
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.1,
          }}
          className="mt-10 text-center"
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-slate-500/75">
            Partner Story · Written interview submitted through{" "}
            <a
              href="https://aibusiness.vc/submit-your-story"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-200/60 hover:text-teal-100 underline underline-offset-2"
            >
              Submit Your Story
            </a>
            {" · "}
            <a
              href={pressItems[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-200/60 hover:text-teal-100 underline underline-offset-2"
            >
              Read full article →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
