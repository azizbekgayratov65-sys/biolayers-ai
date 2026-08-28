"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Microscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function AboutPage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#04070a] px-6 pt-28 pb-8 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
      {/* Background glow atmospheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-20 h-[550px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.045] blur-[170px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 -z-20 h-[450px] w-[450px] rounded-full bg-sky-400/[0.035] blur-[150px]"
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
            <Microscope className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              Leadership & Scientific Mentorship
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
            Building BioLayers at the intersection of{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              AI & oncology
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            Developed by a passionate computational researcher in Tashkent with
            guidance from leading physician-scientists in precision oncology and biomedical engineering.
          </p>
        </motion.div>

        {/* 2 PREMIUM PROFILES SIDE-BY-SIDE */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* ================================================= */}
          {/* FOUNDER CARD                                      */}
          {/* ================================================= */}
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-teal-200/20 bg-gradient-to-b from-[#0a121c]/90 via-[#070c14]/80 to-[#04080e]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all hover:border-teal-200/35"
          >
            <div>
              <div className="flex items-center gap-4">
                {/* Founder Photo */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-200/30 bg-teal-950/40 shadow-[0_0_25px_rgba(77,141,255,0.2)] sm:h-24 sm:w-24">
                  <Image
                    src="/mentorship/founder.png"
                    alt="Azizbek Gayratov - Founder of BioLayers AI"
                    fill
                    sizes="96px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04080e]/60 via-transparent to-transparent" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/25 bg-teal-400/[0.08] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-teal-200">
                    <span className="h-1 w-1 rounded-full bg-teal-300" />
                    Founder & Lead Architect
                  </span>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Azizbek Gayratov
                  </h2>
                  <p className="font-mono text-[10px] text-teal-300/80">
                    Founder of BioLayers AI · Tashkent
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                Read over 100 cancer manuscripts to engineer the tool he was missing —
                reconstructing fragmented biomedical literature into explorable,
                evidence-linked computational mind maps that empower oncologists to reason across disease layers.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Computational Oncology", "Knowledge Graphs", "Biomedical AI", "Graph Theory"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-teal-100/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-semibold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-teal-100/[0.06] pt-3 text-xs">
              <a
                href="https://www.linkedin.com/in/azizbekgayratov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-teal-300 transition hover:text-teal-100"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <span className="font-mono text-[10px] text-slate-500">
                Lead Research & Engineering
              </span>
            </div>
          </motion.article>

          {/* ================================================= */}
          {/* MENTOR CARD                                       */}
          {/* ================================================= */}
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-teal-200/20 bg-gradient-to-b from-[#0a121c]/90 via-[#070c14]/80 to-[#04080e]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all hover:border-teal-200/35"
          >
            <div>
              <div className="flex items-center gap-4">
                {/* Mentor Photo */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-200/30 bg-teal-950/40 shadow-[0_0_25px_rgba(77,141,255,0.2)] sm:h-24 sm:w-24">
                  <Image
                    src="/mentorship/john-william-sidhom.png"
                    alt="John-William Sidhom, M.D., Ph.D. - Scientific Mentor"
                    fill
                    sizes="96px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04080e]/60 via-transparent to-transparent" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/25 bg-sky-400/[0.08] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-sky-200">
                    <span className="h-1 w-1 rounded-full bg-sky-300" />
                    Scientific Mentor
                  </span>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    John-William Sidhom, M.D., Ph.D.
                  </h2>
                  <p className="font-mono text-[10px] text-sky-300/80">
                    Physician-Scientist in Medical Oncology
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                Providing scientific mentorship to ground BioLayers AI in clinically
                meaningful oncology workflows, multi-omics genomics, and rigorous translational evidence.
              </p>

              {/* Institution Badges */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                  <div className="relative flex h-8 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                    <Image
                      src="/mentorship/weill-cornell-medicine.png"
                      alt="Weill Cornell Medicine"
                      width={50}
                      height={20}
                      className="h-auto max-h-6 w-auto object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[7px] uppercase text-teal-300/70">Clinical Training</div>
                    <div className="truncate text-[10px] font-bold text-white">Weill Cornell / NYP</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                  <div className="relative flex h-8 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                    <Image
                      src="/mentorship/johns-hopkins-school-of-medicine.png"
                      alt="Johns Hopkins School of Medicine"
                      width={50}
                      height={20}
                      className="h-auto max-h-6 w-auto object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[7px] uppercase text-teal-300/70">MD / PhD Training</div>
                    <div className="truncate text-[10px] font-bold text-white">Johns Hopkins</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-teal-100/[0.06] pt-3 text-xs">
              <a
                href="https://www.linkedin.com/in/john-william-sidhom-md-phd-b685abb/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-sky-300 transition hover:text-sky-100"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <span className="font-mono text-[10px] text-slate-500">
                Precision Oncology Mentorship
              </span>
            </div>
          </motion.article>
        </div>

        {/* BOTTOM DISCLAIMER & ROADMAP */}
        <p className="mx-auto mt-6 text-center text-[10px] text-slate-500">
          Institutional names are presented as biographical context for the mentor and do not imply institutional endorsement of BioLayers AI.
        </p>
      </div>

      {/* FOOTER */}
      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs text-slate-500">
        <span>BioLayers AI — Leadership & Research</span>
        <div className="flex items-center gap-4">
          <Link href="/journey" className="hover:text-slate-300">Mechanism Journey</Link>
          <span>·</span>
          <Link href="/partners" className="hover:text-slate-300">Partners & NXT Horizon</Link>
          <span>·</span>
          <Link href="/press" className="hover:text-slate-300">Press</Link>
        </div>
      </div>
    </div>
  );
}
