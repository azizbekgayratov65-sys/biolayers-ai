"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  Globe2,
  Cpu,
  TrendingUp,
  Handshake,
  Mail,
  Network,
} from "lucide-react";

const pillars = [
  {
    title: "Graph Theory & AI Safety",
    desc: "Collaborating on spectral graph algorithms, causal reasoning, and verified AI systems.",
    icon: Network,
  },
  {
    title: "Frontier AI Research",
    desc: "Exploring advanced mathematical architectures and robust biomedical neural systems.",
    icon: Cpu,
  },
  {
    title: "Global Ecosystem",
    desc: "Connecting open science, AI alignment, and precision oncology across international research networks.",
    icon: Globe2,
  },
];

export default function PartnersPage() {
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
            <Globe2 className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              Ecosystem & Strategic Alliances
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
            Strategic Partnerships &{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              Global Innovation
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            BioLayers AI collaborates with leading innovation catalysts and frontier AI
            organizations to expand AI-driven oncology knowledge mapping globally.
          </p>
        </motion.div>

        {/* FEATURED PARTNER CARD: NXT HORIZON */}
        <div className="mt-8 rounded-[24px] border border-teal-200/25 bg-gradient-to-b from-[#0a121c]/90 via-[#070c14]/80 to-[#05080e]/90 p-6 backdrop-blur-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-100/[0.06] pb-5">
            {/* NXT Horizon Logo Display */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-48 items-center justify-center overflow-hidden rounded-xl border border-teal-200/20 bg-[#070d14]/90 p-2 sm:h-16 sm:w-56">
                <Image
                  src="/branding/nxthorizon-logo.png"
                  alt="NXT Horizon - AI & Frontier Research"
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/[0.08] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-200">
                  <span className="h-1 w-1 rounded-full bg-emerald-300" />
                  Featured Strategic Partner
                </span>
                <div className="font-mono text-[10px] text-teal-300/80">
                  AI Research & Frontier Computational Systems
                </div>
              </div>
            </div>

            <a
              href="https://nxthorizon.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex items-center gap-2 rounded-xl border border-teal-200/30 bg-teal-300/[0.08] px-4 py-2 text-xs font-bold text-teal-50 transition hover:border-teal-200/50 hover:bg-teal-300/[0.16]"
            >
              <span>Visit nxthorizon.org</span>
              <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold text-teal-200/90">
                Frontier AI Research & Computational Knowledge Systems
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300/85">
                NXT Horizon collaborates with BioLayers AI to explore next-generation
                graph theory, AI safety, and computational architectures for extracting
                and verifying complex biological mechanisms.
              </p>
            </div>

            {/* 3 Pillars in 1 compact grid */}
            <div className="grid gap-2 sm:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-xl border border-teal-100/[0.06] bg-[#070d13]/60 p-3"
                  >
                    <div className="flex items-center gap-1.5 text-teal-300">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold text-teal-50">
                        {pillar.title}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-tight text-slate-400">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM PARTNER INQUIRY CTA */}
        <div className="mt-5 flex flex-wrap items-center justify-between rounded-xl border border-teal-100/[0.06] bg-white/[0.015] px-4 py-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Handshake className="h-4 w-4 text-teal-300" />
            <span>Interested in academic, research, or clinical collaborations?</span>
          </div>

          <a
            href="mailto:contact@biolayers.ai?subject=Partnership%20Inquiry%20-%20BioLayers%20AI"
            className="inline-flex items-center gap-1.5 font-bold text-teal-300 hover:text-teal-100"
          >
            <Mail className="h-3 w-3" />
            <span>contact@biolayers.ai</span>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs text-slate-500">
        <span>BioLayers AI Ecosystem</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-300">About Us</Link>
          <span>·</span>
          <Link href="/press" className="hover:text-slate-300">Press</Link>
          <span>·</span>
          <Link href="/mindmap" className="text-teal-300 hover:text-teal-200">Open Mind Map →</Link>
        </div>
      </div>
    </div>
  );
}
