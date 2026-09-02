"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  Newspaper,
  Globe2,
  BookOpen,
  Mail,
  ArrowRight,
  Award,
} from "lucide-react";

export default function PressPage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#04070a] px-6 pt-28 pb-8 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
      {/* Background ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-20 h-[550px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.045] blur-[170px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/2 -z-20 h-[450px] w-[450px] rounded-full bg-sky-400/[0.035] blur-[150px]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        {/* HEADER */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.05] px-4 py-1.5 backdrop-blur-xl">
            <Newspaper className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              Media, Recognition & Spotlights
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
            Recognition &{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              Global Coverage
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            BioLayers AI featured across global education innovation catalogs and technology
            publications for reconstructing cancer literature into explorable AI knowledge graphs.
          </p>
        </motion.div>

        {/* PRESS & SPOTLIGHT CARDS */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* CARD 1: HUNDRED GLOBAL INNOVATION */}
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all hover:border-teal-200/35"
          >
            <div>
              {/* Card Header: Brand Logo & Date */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-8 items-center justify-center rounded-lg bg-white px-3 py-1 text-slate-900 shadow-sm">
                    <Image
                      src="/branding/hundred-logo.svg"
                      alt="HundrED logo"
                      width={75}
                      height={18}
                      className="h-4 w-auto object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-400/[0.1] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-teal-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,0.8)]" />
                    Global Innovation Spotlight
                  </span>
                </div>

                <time
                  dateTime="2026-09-02"
                  className="font-mono text-[10px] uppercase tracking-wider text-slate-400"
                >
                  September 2026
                </time>
              </div>

              {/* Title & Quote */}
              <h2 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl leading-snug">
                BioLayers AI: Selected Global Education Innovation
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                &ldquo;Biomedical knowledge is locked in dense papers that few people can easily use.
                BioLayers AI converts cancer research and scientific literature into interactive visual
                knowledge maps. Students, researchers, and educators can quickly explore genes, pathways,
                diseases, and therapies.&rdquo;
              </p>

              {/* Badges strip */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {[
                  "17+ Countries Reach",
                  "AI & Oncology",
                  "STEM Education",
                  "EdTech Innovation",
                  "Helsinki · Global",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-teal-100/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-semibold text-teal-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-teal-100/[0.08] pt-4">
              <a
                href="https://hundred.org/en/innovations/biolayers-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 text-xs font-bold text-teal-300 transition hover:text-teal-100"
              >
                <span>View Full Innovation on hundred.org</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>

              <span className="font-mono text-[9px] text-slate-500">
                hundred.org/en/innovations/biolayers-ai
              </span>
            </div>
          </motion.article>

          {/* CARD 2: AI BUSINESS */}
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all hover:border-teal-200/35"
          >
            <div>
              {/* Card Header: Brand & Date */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/[0.1] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                    AI Business
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-slate-400">
                    Startup & Research Profile
                  </span>
                </div>

                <time
                  dateTime="2026-08-25"
                  className="font-mono text-[10px] uppercase tracking-wider text-slate-400"
                >
                  August 25, 2026
                </time>
              </div>

              {/* Title & Quote */}
              <h2 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl leading-snug">
                BioLayers AI: Cancer Literature Maps
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                &ldquo;A teenager in Tashkent read 100 cancer papers and built the tool he was missing —
                transforming fragmented literature into explorable mechanistic maps that empower researchers
                and oncologists to discover connections across biological layers.&rdquo;
              </p>

              {/* Badges strip */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {[
                  "Founder Story",
                  "Computational Oncology",
                  "Knowledge Graphs",
                  "Tashkent",
                  "PubMed Grounding",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-teal-100/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-semibold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-teal-100/[0.08] pt-4">
              <a
                href="https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 text-xs font-bold text-emerald-300 transition hover:text-emerald-100"
              >
                <span>Read Full Story on AI Business</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>

              <span className="font-mono text-[9px] text-slate-500">
                aibusiness.vc/startups/biolayers-ai
              </span>
            </div>
          </motion.article>
        </div>

        {/* INQUIRIES & MEDIA CONTACT BANNER */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-100/[0.08] bg-white/[0.015] px-5 py-4 text-xs backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Mail className="h-4 w-4 text-teal-300" />
            <span>Journalists, educators, or researchers seeking media kit / interviews:</span>
          </div>

          <a
            href="mailto:press@biolayers.ai?subject=Press%20Inquiry%20-%20BioLayers%20AI"
            className="inline-flex items-center gap-1.5 font-bold text-teal-300 hover:text-teal-100"
          >
            <span>press@biolayers.ai</span>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs text-slate-500">
        <span>BioLayers AI Press Office & Global Recognition</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-300">About & Mentorship</Link>
          <span>·</span>
          <Link href="/partners" className="hover:text-slate-300">Partners</Link>
          <span>·</span>
          <Link href="/" className="text-teal-300 hover:text-teal-200">Back to Home →</Link>
        </div>
      </div>
    </div>
  );
}