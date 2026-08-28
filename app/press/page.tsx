"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  ArrowRight,
  Newspaper,
  BookOpen,
} from "lucide-react";

export default function PressPage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#04070a] px-6 pt-28 pb-8 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
      {/* Background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-20 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.04] blur-[160px]"
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
              Media & Press
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
            Recognition &{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              Press Coverage
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            BioLayers AI featured across technology and oncology publications for
            reconstructing cancer literature with verifiable AI knowledge graphs.
          </p>
        </motion.div>

        {/* FEATURED STORY CARD */}
        <div className="mx-auto mt-8 w-full max-w-3xl rounded-[24px] border border-teal-100/[0.08] bg-[#070c12]/80 p-6 backdrop-blur-2xl sm:p-8">
          <div className="flex items-center justify-between border-b border-teal-100/[0.06] pb-3 text-xs">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 font-mono text-[9px] font-bold uppercase text-emerald-300">
              AI Business
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              August 25, 2026
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              BioLayers AI: Cancer Literature Maps
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-300/85 sm:text-sm">
              &ldquo;A teenager in Tashkent read 100 cancer papers and built the tool he
              was missing — transforming fragmented literature into explorable
              mechanistic maps.&rdquo;
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4">
            <a
              href="https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-teal-100"
            >
              <span>Read the Full Story on AI Business</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <a
              href="mailto:press@biolayers.ai?subject=Press%20Inquiry%20-%20BioLayers%20AI"
              className="font-mono text-[10px] text-slate-400 hover:text-white"
            >
              Media inquiries: press@biolayers.ai
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs text-slate-500">
        <span>BioLayers AI Press Office</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-300">About Us</Link>
          <span>·</span>
          <Link href="/partners" className="hover:text-slate-300">Partners</Link>
          <span>·</span>
          <Link href="/" className="text-teal-300 hover:text-teal-200">Back to Home →</Link>
        </div>
      </div>
    </div>
  );
}