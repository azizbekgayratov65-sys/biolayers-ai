"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  Globe2,
  Cpu,
  Handshake,
  Mail,
  Network,
  ShieldCheck,
  ArrowRight,
  Workflow,
  GraduationCap,
} from "lucide-react";

const nxtPillars = [
  {
    title: "Spectral Graph Theory",
    desc: "Advancing directional graph algorithms, topological mechanism synthesis, and multi-scale causal networks.",
    icon: Network,
    badge: "Graph Theory",
  },
  {
    title: "AI Safety & Verification",
    desc: "Engineering robust, zero-hallucination mathematical architectures with verifiable evidence grounding.",
    icon: ShieldCheck,
    badge: "AI Safety",
  },
  {
    title: "Frontier AI Ecosystem",
    desc: "Connecting frontier AI benchmarks, open mathematical research, and precision oncology globally.",
    icon: Cpu,
    badge: "Frontier AI",
  },
];

const hundredPillars = [
  {
    title: "Global Reach (17+ Countries)",
    desc: "Spreading interactive oncology knowledge maps to students and young researchers across 17+ countries.",
    icon: Globe2,
    badge: "17+ Countries",
  },
  {
    title: "Open STEM & AI Education",
    desc: "Democratizing dense biomedical literature into visual layers that make complex biology intuitive to learn.",
    icon: GraduationCap,
    badge: "STEM Education",
  },
  {
    title: "Global Innovation Catalog",
    desc: "Recognized in HundrED's global platform for impactful and scalable educational technology.",
    icon: Sparkles,
    badge: "Helsinki, Finland",
  },
];

export default function PartnersPage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#04070a] px-6 pt-28 pb-8 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
      {/* Ambient background glow atmospheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-20 h-[550px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.045] blur-[170px]"
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
            <Globe2 className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              Ecosystem & Strategic Alliances
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
            Strategic Partnerships &{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              Frontier Innovation
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            BioLayers AI collaborates with leading innovation catalysts and frontier AI
            organizations to advance precision oncology knowledge graphs and verifiable AI architectures.
          </p>
        </motion.div>

        <div className="mt-8 space-y-6">
          {/* FEATURED STRATEGIC PARTNER: NXT HORIZON */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="rounded-[28px] border border-teal-200/25 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8"
          >
            {/* Top Bar: Emblem + Brand Info + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-teal-100/[0.08] pb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Premium Emblem Card */}
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-white p-2 shadow-[0_0_30px_rgba(0,210,255,0.25)] sm:h-20 sm:w-20">
                  <Image
                    src="/branding/nxthorizon-logo.png"
                    alt="NXT Horizon Emblem"
                    width={72}
                    height={72}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/[0.1] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      Featured Strategic Partner
                    </span>
                    <span className="font-mono text-[9px] text-teal-300/70">
                      AI Safety & Spectral Graph Theory
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    NXT Horizon
                  </h2>
                  <div className="font-mono text-[11px] text-slate-400">
                    nxthorizon.org · Frontier AI Research Organization
                  </div>
                </div>
              </div>

              {/* Visit Website CTA */}
              <a
                href="https://nxthorizon.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 rounded-xl border border-teal-200/30 bg-teal-300/[0.08] px-4 py-2.5 text-xs font-bold text-teal-50 transition hover:border-teal-200/60 hover:bg-teal-300/[0.18]"
              >
                <span>Explore nxthorizon.org</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>

            {/* Core Collaboration Narrative & 3 Research Pillars */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-teal-300">
                  Strategic Research Scope
                </div>
                <h3 className="mt-1 text-base font-bold text-teal-50 sm:text-lg">
                  Advancing Graph Theory & Zero-Hallucination Biological Reasoning
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                  NXT Horizon collaborates with BioLayers AI to explore next-generation
                  spectral graph theory, AI safety architectures, and causal reasoning networks —
                  accelerating how computational knowledge graphs extract and verify complex oncology mechanisms.
                </p>

                {/* Badges strip */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Spectral Graph Theory", "AI Safety", "AI4Math", "Causal Networks"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-teal-100/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-semibold text-teal-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3 Pillars Cards */}
              <div className="space-y-2.5">
                {nxtPillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-xl border border-teal-100/[0.08] bg-[#070d14]/70 p-3.5 transition hover:border-teal-200/25 hover:bg-[#0a121c]/80"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-teal-300">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-bold text-teal-50">
                            {pillar.title}
                          </span>
                        </div>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-teal-300/60">
                          {pillar.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* GLOBAL EDUCATION INNOVATION PARTNER: HUNDRED */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="rounded-[28px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8"
          >
            {/* Top Bar: Brand Logo + Info + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-teal-100/[0.08] pb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Logo Card */}
                <div className="relative flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-white p-3 shadow-[0_0_30px_rgba(77,141,255,0.2)] sm:h-20 sm:w-32">
                  <Image
                    src="/branding/hundred-logo.svg"
                    alt="HundrED Logo"
                    width={100}
                    height={28}
                    className="h-auto max-h-8 w-auto object-contain"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-400/[0.1] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-sky-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                      Global Education Innovation Partner
                    </span>
                    <span className="font-mono text-[9px] text-teal-300/70">
                      Helsinki, Finland · 17+ Countries Reach
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    HundrED
                  </h2>
                  <div className="font-mono text-[11px] text-slate-400">
                    hundred.org · Global Education Innovation Platform
                  </div>
                </div>
              </div>

              {/* Visit Website CTA */}
              <a
                href="https://hundred.org/en/innovations/biolayers-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 rounded-xl border border-sky-200/30 bg-sky-300/[0.08] px-4 py-2.5 text-xs font-bold text-sky-50 transition hover:border-sky-200/60 hover:bg-sky-300/[0.18]"
              >
                <span>View on hundred.org</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>

            {/* Core Narrative & 3 Education Pillars */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-sky-300">
                  Global Education Scope
                </div>
                <h3 className="mt-1 text-base font-bold text-teal-50 sm:text-lg">
                  Democratizing Complex Cancer Knowledge for Global Learners
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                  Featured on HundrED for converting dense oncology literature into interactive,
                  evidence-linked visual maps. BioLayers AI empowers students, researchers, and educators
                  across 17+ countries to explore disease mechanisms and therapies without barriers.
                </p>

                {/* Badges strip */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["17+ Countries", "Open STEM", "EdTech Catalyst", "Visual Knowledge Maps"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-teal-100/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-semibold text-sky-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3 Pillars Cards */}
              <div className="space-y-2.5">
                {hundredPillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-xl border border-teal-100/[0.08] bg-[#070d14]/70 p-3.5 transition hover:border-sky-200/25 hover:bg-[#0a121c]/80"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sky-300">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-bold text-teal-50">
                            {pillar.title}
                          </span>
                        </div>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-sky-300/60">
                          {pillar.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM PARTNER INQUIRY CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-100/[0.08] bg-white/[0.015] px-5 py-3.5 text-xs backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Handshake className="h-4 w-4 text-teal-300" />
            <span>Interested in research, educational, or AI safety collaborations?</span>
          </div>

          <a
            href="mailto:contact@biolayers.ai?subject=Partnership%20Inquiry%20-%20BioLayers%20AI"
            className="inline-flex items-center gap-1.5 font-bold text-teal-300 hover:text-teal-100"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>contact@biolayers.ai</span>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs text-slate-500">
        <span>BioLayers AI Ecosystem & Alliances</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-300">About & Mentorship</Link>
          <span>·</span>
          <Link href="/press" className="hover:text-slate-300">Press & Coverage</Link>
          <span>·</span>
          <Link href="/mindmap" className="text-teal-300 hover:text-teal-200">Open Mind Map →</Link>
        </div>
      </div>
    </div>
  );
}
