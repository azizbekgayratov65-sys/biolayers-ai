"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Workflow,
  Sparkles,
  Network,
  ShieldCheck,
  Lightbulb,
  Globe2,
  BookOpen,
} from "lucide-react";

const highlights = [
  {
    icon: Network,
    title: "4-Step Mechanism Journey",
    desc: "Interactive computational walkthrough: from raw manuscript tokens to directional causal graphs.",
    href: "/journey",
    action: "Explore Journey",
  },
  {
    icon: BookOpen,
    title: "Leadership & Mentorship",
    desc: "Founded in Tashkent with precision oncology and biomedical engineering mentorship.",
    href: "/about",
    action: "Meet the Team",
  },
  {
    icon: Globe2,
    title: "Strategic Alliances",
    desc: "Partnered with NXT Horizon to scale AI-driven oncology knowledge mapping globally.",
    href: "/partners",
    action: "View Partners",
  },
];

export default function HomePage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#04070a] px-6 pt-28 pb-8 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
      {/* Background glow atmospheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-20 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.045] blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/2 -z-20 h-[400px] w-[400px] rounded-full bg-sky-400/[0.035] blur-[140px]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        {/* TOP BADGE & HEADLINE */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.05] px-4 py-1.5 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              AI-Driven Computational Oncology
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Reconstruct cancer biology from{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              fragmented literature
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300/85 sm:text-base">
            BioLayers AI transforms scientific papers into explorable,
            evidence-grounded mechanistic knowledge graphs — connecting genes,
            proteins, pathways, and therapeutic targets.
          </p>

          {/* ACTIONS */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/mindmap"
              className="group flex items-center gap-2 rounded-[14px] border border-emerald-200/30 bg-emerald-300/[0.1] px-5 py-3 text-xs font-bold text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-300/[0.18]"
            >
              <Workflow className="h-4 w-4" />
              <span>Launch Mind Map Workspace</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/journey"
              className="flex items-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-300/[0.06] px-5 py-3 text-xs font-semibold text-teal-100 transition hover:border-teal-200/40 hover:bg-teal-300/[0.12]"
            >
              <span>4-Step Mechanism Journey</span>
            </Link>

            <Link
              href="/about"
              className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <span>About & Mentorship</span>
            </Link>
          </div>
        </motion.div>

        {/* 3 HIGHLIGHT CARDS IN 1 ROW */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative flex flex-col justify-between rounded-[20px] border border-teal-100/[0.07] bg-[#070c12]/60 p-5 backdrop-blur-xl transition-all hover:border-teal-200/25 hover:bg-[#0a121a]/70"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-200/20 bg-teal-300/[0.06] text-teal-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold text-teal-50">
                      {item.title}
                    </h2>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-300 transition group-hover:text-teal-100"
                  >
                    <span>{item.action}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM PARTNER & ECOSYSTEM STRIP */}
      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-slate-400">
            Strategic Innovation Partner:
          </span>
          <Link
            href="/partners"
            className="group flex items-center gap-2 rounded-lg border border-teal-200/20 bg-white/[0.02] px-2.5 py-1 hover:border-teal-200/40 hover:bg-white/[0.04]"
          >
            <div className="relative h-4 w-20">
              <Image
                src="/branding/nxthorizon-logo.png"
                alt="NXT Horizon"
                fill
                className="object-contain"
              />
            </div>
            <ArrowRight className="h-3 w-3 text-teal-300 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-wider text-slate-500">
          <span>PubMed Grounded</span>
          <span>·</span>
          <span>Cell Ontology</span>
          <span>·</span>
          <span>BYOK Gemini</span>
        </div>
      </div>
    </div>
  );
}
