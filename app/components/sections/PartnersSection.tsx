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
} from "lucide-react";

const pillars = [
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

export default function PartnersSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="partners"
      aria-label="Partners and Alliances"
      className="relative isolate overflow-hidden bg-[#04070a] px-6 py-24 sm:px-10 sm:py-28 lg:px-16"
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-20 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.04] blur-[160px]"
      />

      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.05] px-4 py-1.5 backdrop-blur-xl">
            <Globe2 className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              Ecosystem & Strategic Alliances
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
            Strategic Partnerships &{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              Frontier Innovation
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            BioLayers AI collaborates with leading innovation catalysts and frontier AI
            organizations to advance precision oncology knowledge graphs and verifiable AI architectures.
          </p>
        </div>

        {/* FEATURED PARTNER CARD */}
        <div className="mt-8 rounded-[28px] border border-teal-200/25 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-teal-100/[0.08] pb-6">
            <div className="flex items-center gap-4 sm:gap-5">
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

                <h3 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  NXT Horizon
                </h3>
                <div className="font-mono text-[11px] text-slate-400">
                  nxthorizon.org · Frontier AI Research Organization
                </div>
              </div>
            </div>

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

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-teal-300">
                Strategic Research Scope
              </div>
              <h4 className="mt-1 text-base font-bold text-teal-50 sm:text-lg">
                Advancing Graph Theory & Zero-Hallucination Biological Reasoning
              </h4>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                NXT Horizon collaborates with BioLayers AI to explore next-generation
                spectral graph theory, AI safety architectures, and causal reasoning networks —
                accelerating how computational knowledge graphs extract and verify complex oncology mechanisms.
              </p>

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

            <div className="space-y-2.5">
              {pillars.map((pillar) => {
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
        </div>

        {/* BOTTOM PARTNER INQUIRY CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-100/[0.08] bg-white/[0.015] px-5 py-3.5 text-xs backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Handshake className="h-4 w-4 text-teal-300" />
            <span>Interested in research, clinical, or AI safety collaborations?</span>
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
    </section>
  );
}
