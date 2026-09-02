"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Sparkles, Globe, Newspaper } from "lucide-react";

type PressItem = {
  name: string;
  headline: string;
  description: string;
  url: string;
  date: string;
  badge: string;
  tag: string;
  location?: string;
  logoSvg?: string;
};

const pressItems: PressItem[] = [
  {
    name: "HundrED",
    headline: "BioLayers AI: Selected Global Education & AI Innovation",
    description:
      "Featured by HundrED (Helsinki, Finland) for converting dense cancer research into interactive, visual knowledge maps — democratizing biomedical learning for students, researchers, and educators across 17+ countries.",
    url: "https://hundred.org/en/innovations/biolayers-ai",
    date: "2026-09-02",
    badge: "Global Innovation",
    tag: "AI & STEM Education",
    location: "Helsinki · 17+ Countries",
    logoSvg: "/branding/hundred-logo.svg",
  },
  {
    name: "AI Business",
    headline: "BioLayers AI: Cancer Literature Maps",
    description:
      "A teenager in Tashkent read 100 cancer papers and built the tool he was missing — transforming fragmented literature into explorable mechanistic maps.",
    url: "https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps",
    date: "2026-08-25",
    badge: "Startup Spotlight",
    tag: "Computational Oncology",
    location: "Tashkent & Global",
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

      <div className="mx-auto max-w-6xl">
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
            <span className="h-2 w-2 rounded-full bg-teal-300/80 shadow-[0_0_8px_rgba(77,141,255,0.7)]" />
            Partners & Press Recognition
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
              global coverage
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
            BioLayers has been recognized across global education innovation platforms
            and AI publications for transforming cancer literature into verifiable knowledge maps.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* PRESS & PARTNER CARDS                             */}
        {/* ================================================= */}

        <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
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
                delay: reduceMotion ? 0 : index * 0.08,
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
                flex
                flex-col
                justify-between
                overflow-hidden
                rounded-[26px]
                border
                border-teal-100/[0.08]
                bg-gradient-to-b
                from-[#0a121c]/90
                via-[#070c14]/80
                to-[#04080e]/90
                p-6
                sm:p-8
                shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                backdrop-blur-2xl
                transition-all
                duration-300
                hover:border-teal-200/30
                hover:bg-[#0c1622]/90
              "
            >
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-44
                  w-44
                  rounded-full
                  bg-teal-300/[0.05]
                  blur-[60px]
                  transition
                  duration-500
                  group-hover:bg-teal-300/[0.09]
                "
              />

              <div>
                {/* Top Header inside card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    {item.logoSvg ? (
                      <div className="relative flex h-7 items-center justify-center rounded-lg bg-white px-2.5 py-1 text-slate-900 shadow-sm">
                        <Image
                          src={item.logoSvg}
                          alt={`${item.name} logo`}
                          width={64}
                          height={16}
                          className="h-3.5 w-auto object-contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                      </div>
                    ) : (
                      <div
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-emerald-300/20
                          bg-emerald-300/[0.08]
                          px-3
                          py-1
                          font-mono
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-emerald-200
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        {item.name}
                      </div>
                    )}

                    <span className="rounded-full border border-teal-100/10 bg-white/[0.025] px-2.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wider text-teal-300/90">
                      {item.badge}
                    </span>
                  </div>

                  <time
                    dateTime={item.date}
                    className="
                      font-mono
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[0.16em]
                      text-slate-400
                    "
                  >
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {/* Headline */}
                <h3 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl leading-snug">
                  {item.headline}
                </h3>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                  {item.description}
                </p>

                {/* Tags / Metadata */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-teal-100/10 bg-teal-300/[0.04] px-2 py-0.5 font-mono text-[9px] font-semibold text-teal-200">
                    {item.tag}
                  </span>
                  {item.location && (
                    <span className="font-mono text-[9px] text-slate-400">
                      · {item.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Read link */}
              <div className="relative mt-8 border-t border-teal-100/[0.06] pt-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group/link
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-teal-300
                    transition
                    hover:text-teal-100
                  "
                >
                  <span>Read feature on {item.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </a>
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
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-teal-100/[0.08] bg-white/[0.02] px-5 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400 backdrop-blur-xl">
            <span>Global Spotlights:</span>
            <a
              href="https://hundred.org/en/innovations/biolayers-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 hover:text-white underline underline-offset-2"
            >
              HundrED Innovation Profile →
            </a>
            <span>·</span>
            <a
              href="https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 hover:text-white underline underline-offset-2"
            >
              AI Business Story →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
