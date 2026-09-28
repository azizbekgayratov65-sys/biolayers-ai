import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Workflow,
  Sparkles,
  Network,
  Globe2,
  BookOpen,
  Microscope,
  Compass,
  FileText,
  CheckCircle2,
  Activity,
  Layers,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "BioLayers AI — Computational Oncology & Mind Map Workspace",
  description:
    "Transform complex cancer biology literature into explorable, evidence-grounded mechanistic knowledge graphs and multi-channel microscopy views.",
};

const highlights = [
  {
    icon: Compass,
    title: "4-Step Mechanism Journey",
    desc: "Interactive computational walkthrough: from raw manuscript tokens to directional causal graphs.",
    href: "/journey",
    action: "Explore Journey",
    badge: "Interactive Walkthrough",
  },
  {
    icon: BookOpen,
    title: "Leadership & Mentorship",
    desc: "Founded in Tashkent with precision oncology and biomedical engineering mentorship.",
    href: "/about",
    action: "Meet the Team",
    badge: "Precision Oncology",
  },
  {
    icon: Globe2,
    title: "Strategic Alliances",
    desc: "Partnered with NXT Horizon to scale AI-driven oncology knowledge mapping globally.",
    href: "/partners",
    action: "View Partners",
    badge: "Global Initiative",
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-transparent px-4 pt-28 pb-12 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36">
      {/* Dark-field fluorescence ambient backdrops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-20 h-[550px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(43,255,136,0.06),transparent_70%)] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/3 -z-20 h-[480px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,141,255,0.05),transparent_70%)] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-8 bottom-1/4 -z-20 h-[400px] w-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(161,92,255,0.04),transparent_70%)] blur-[160px]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        {/* =========================================================================
            HERO SECTION: Hick's & Fitts's Law Dominant Primary Action
            ========================================================================= */}
        <section className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/25 bg-teal-300/[0.06] px-4 py-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(43,255,136,0.08)]">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              AI-Driven Computational Oncology
            </span>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Reconstruct cancer biology from{" "}
            <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              fragmented literature
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300/85 sm:text-base">
            BioLayers AI transforms scientific papers into explorable,
            evidence-grounded mechanistic knowledge graphs — connecting genes,
            proteins, pathways, and therapeutic targets with verbatim manuscript grounding.
          </p>

          {/* Primary Action + Secondary Group */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            {/* Dominant Primary CTA (Fitts's Law compliant >= 48px hit target, high contrast FITC emerald) */}
            <Link
              href="/mindmap"
              className="group relative inline-flex min-h-[52px] items-center justify-center gap-3 rounded-[16px] border-2 border-emerald-400/50 bg-emerald-400/15 px-8 py-3.5 text-sm sm:text-base font-bold text-emerald-100 shadow-[0_0_30px_rgba(43,255,136,0.22)] backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-200 hover:scale-[1.02] hover:border-emerald-300 hover:bg-emerald-400/25 hover:text-white hover:shadow-[0_0_45px_rgba(43,255,136,0.38)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2bff88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <Workflow className="h-5 w-5 text-emerald-300 group-hover:text-emerald-200" aria-hidden="true" />
              <span>Launch Mind Map Workspace</span>
              <ArrowRight className="h-4 w-4 text-emerald-300 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>

            {/* Secondary Actions Cluster (Hick's Law chunked, >= 44px touch targets) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                href="/cells"
                className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-[12px] border border-sky-400/25 bg-sky-400/[0.06] px-4 py-2 text-xs font-semibold text-sky-100 transition-[background-color,border-color,color] duration-150 hover:border-sky-300/40 hover:bg-sky-400/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
              >
                <Microscope className="h-4 w-4 text-sky-300" aria-hidden="true" />
                <span>Explore Cell Atlas</span>
              </Link>

              <Link
                href="/cipher"
                className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-[12px] border border-teal-200/25 bg-teal-300/[0.06] px-4 py-2 text-xs font-semibold text-teal-100 transition-[background-color,border-color,color] duration-150 hover:border-teal-200/40 hover:bg-teal-300/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
              >
                <Network className="h-4 w-4 text-teal-300" aria-hidden="true" />
                <span>Project Cipher (Visual Maps)</span>
              </Link>

              <Link
                href="/journey"
                className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300 transition-[background-color,border-color,color] duration-150 hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
              >
                <Compass className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>3D Mechanism Journey</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROGRESSIVE FEATURE PREVIEWS (Below the Fold)
            Concentric nested radii: R_inner = R_outer - padding
            Full card surface clickability: no dead zones
            ========================================================================= */}
        <section className="mt-20 space-y-10" aria-label="Platform feature previews">
          <div className="text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-teal-300/80">
              Interactive Instruments
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Precision oncology workflow at a glance
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-400">
              From raw literature ingestion to multi-channel confocal microscopy and causal pathway inference.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* -------------------------------------------------------------------
                PREVIEW 1: Automated Literature Deconstruction (Mind Map)
                Outer: rounded-[28px], padding p-5 (20px) -> Inner: rounded-[8px]
                ------------------------------------------------------------------- */}
            <Link
              href="/mindmap"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[#070c12]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-[#0a131b]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2bff88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                    <Workflow className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                    Section 01 · Mind Map
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">Stage 01</span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-emerald-100 transition-colors">
                  Automated Literature Deconstruction
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Deconstruct 40-page oncology papers into structured hierarchical maps with verbatim manuscript citation anchors and zero information loss.
                </p>

                {/* Concentric Inner Simulation Container: R_inner = 28px - 20px = 8px */}
                <div className="mt-5 rounded-[8px] border border-emerald-500/15 bg-black/40 p-3.5 text-left font-mono">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px]">
                    <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <FileText className="h-3 w-3" aria-hidden="true" />
                      Nature Cancer 2024
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400/90">
                      <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                      Verbatim Grounded
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-2 text-[10px]">
                    <div className="rounded-[4px] bg-emerald-400/[0.05] p-2 border border-emerald-400/15">
                      <p className="text-slate-300 font-sans text-[11px] leading-tight font-semibold">
                        KRAS G12D Oncogenic Signalling
                      </p>
                      <p className="mt-1 text-[9.5px] text-slate-400 font-sans italic">
                        &ldquo;MRTX1133 selectively binds the switch-II pocket, preventing RAF interaction.&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                      <span>• 5 Key Mechanism Nodes</span>
                      <span className="text-emerald-300 font-semibold">100% In-Context</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                <span>Launch Mind Map Workspace</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>

            {/* -------------------------------------------------------------------
                PREVIEW 2: Causal Biological Networks (Project Cipher)
                Outer: rounded-[28px], padding p-5 (20px) -> Inner: rounded-[8px]
                ------------------------------------------------------------------- */}
            <Link
              href="/cipher"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#070c12]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-[#0a131b]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/[0.08] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-200">
                    <Network className="h-3 w-3 text-cyan-300" aria-hidden="true" />
                    Section 02 · Project Cipher
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">Stage 02</span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-100 transition-colors">
                  Causal Biological Networks
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Interactive directed causal graphs depicting molecular cascades, feedback loops, and pharmacological targets with dual plain/academic decoding.
                </p>

                {/* Concentric Inner Simulation Container: R_inner = 28px - 20px = 8px */}
                <div className="mt-5 rounded-[8px] border border-cyan-500/15 bg-black/40 p-3.5 text-left font-mono">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px]">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <Activity className="h-3 w-3" aria-hidden="true" />
                      MAPK / ERK Cascade
                    </span>
                    <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[8.5px] font-bold text-cyan-200">
                      Plain Decoder Active
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-2 text-slate-300 text-[10px]">
                      <span className="rounded-[4px] bg-sky-400/20 px-1.5 py-0.5 text-sky-200 font-bold">EGFR</span>
                      <span className="text-slate-500">→</span>
                      <span className="rounded-[4px] bg-rose-400/20 px-1.5 py-0.5 text-rose-200 font-bold">KRAS</span>
                      <span className="text-slate-500">→</span>
                      <span className="rounded-[4px] bg-teal-400/20 px-1.5 py-0.5 text-teal-200 font-bold">BRAF</span>
                      <span className="text-slate-500">→</span>
                      <span className="rounded-[4px] bg-emerald-400/20 px-1.5 py-0.5 text-emerald-200 font-bold">ERK1/2</span>
                    </div>

                    <p className="mt-1 rounded-[4px] bg-white/[0.02] p-1.5 text-[9.5px] text-slate-400 font-sans">
                      <strong className="text-cyan-200">Mechanism:</strong> Sustained GTP loading drives proliferation signaling via transcription factors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                <span>Explore Project Cipher</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>

            {/* -------------------------------------------------------------------
                PREVIEW 3: High-Resolution Microscopy Atlas (Cell Atlas)
                Outer: rounded-[28px], padding p-5 (20px) -> Inner: rounded-[8px]
                ------------------------------------------------------------------- */}
            <Link
              href="/cells"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-violet-400/20 bg-[#070c12]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-[#0a131b]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a15cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/[0.08] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-violet-200">
                    <Microscope className="h-3 w-3 text-violet-300" aria-hidden="true" />
                    Section 03 · Cell Atlas
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">Stage 03</span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-violet-100 transition-colors">
                  High-Resolution Microscopy Atlas
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Explore multiplexed histology and spatial transcriptomics with independent DAPI, FITC, and Cy5 channel controls across diverse human malignancies.
                </p>

                {/* Concentric Inner Simulation Container: R_inner = 28px - 20px = 8px */}
                <div className="mt-5 rounded-[8px] border border-violet-500/15 bg-black/40 p-3.5 text-left font-mono">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px]">
                    <span className="flex items-center gap-1.5 text-violet-300 font-semibold">
                      <Layers className="h-3 w-3" aria-hidden="true" />
                      Multi-Channel Staining
                    </span>
                    <span className="text-[9px] text-slate-400">40x Confocal</span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-1.5 text-[9px]">
                    <span className="flex items-center gap-1 rounded-[4px] border border-sky-400/30 bg-sky-400/10 px-2 py-1 font-bold text-sky-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4d8dff]" />
                      DAPI (461nm)
                    </span>
                    <span className="flex items-center gap-1 rounded-[4px] border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-bold text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2bff88]" />
                      FITC (520nm)
                    </span>
                    <span className="flex items-center gap-1 rounded-[4px] border border-violet-400/30 bg-violet-400/10 px-2 py-1 font-bold text-violet-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a15cff]" />
                      Cy5 (670nm)
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 pt-1">
                    <span>Specimen: Pancreatic Ductal FFPE</span>
                    <span className="font-mono text-violet-300">Scale: 50 µm</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-semibold text-violet-300 group-hover:text-violet-200">
                <span>Open Cell Atlas Viewer</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            INSTITUTIONAL HIGHLIGHTS GRID (Full Card Surface Clickability)
            Outer: rounded-[24px], padding p-5 (20px) -> Inner icon: rounded-[4px]
            ========================================================================= */}
        <section className="mt-16" aria-label="Institutional highlights">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group relative flex flex-col justify-between rounded-[24px] border border-teal-100/[0.08] bg-[#070c12]/70 p-5 backdrop-blur-xl transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-200/30 hover:bg-[#0a121a]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      {/* Concentric geometry: R_inner = 24px - 20px = 4px */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-teal-200/25 bg-teal-300/[0.08] text-teal-300 transition-colors group-hover:border-teal-200/40 group-hover:bg-teal-300/[0.14]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                        {item.badge}
                      </span>
                    </div>

                    <h2 className="mt-4 text-sm font-bold text-teal-50 group-hover:text-white transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 border-t border-white/[0.05] pt-3 text-[11px] font-bold text-teal-300 transition group-hover:text-teal-100">
                    <span>{item.action}</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* =========================================================================
          BOTTOM PROOF STRIP: Partner trust badges optically aligned
          Touch targets >= 44px on all interactive links
          ========================================================================= */}
      <footer className="mx-auto mt-16 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.08] pt-6 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Strategic Partner: NXT Horizon */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400">
              Strategic Partner:
            </span>
            <Link
              href="/partners"
              aria-label="View strategic partnership with NXT Horizon"
              className="group inline-flex min-h-[44px] items-center gap-2.5 rounded-[12px] border border-teal-200/20 bg-white/[0.02] px-3 py-1.5 transition-[background-color,border-color] hover:border-teal-200/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-white/20 bg-white p-0.5">
                <Image
                  src="/branding/nxthorizon-logo.png"
                  alt="NXT Horizon logo"
                  width={20}
                  height={20}
                  className="h-full w-full object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <span className="text-[11px] font-bold text-teal-100 group-hover:text-white">
                NXT Horizon
              </span>
            </Link>
          </div>

          <span className="hidden sm:inline text-slate-700" aria-hidden="true">·</span>

          {/* Press & Coverage: HundrED */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400">
              Press & Coverage:
            </span>
            <Link
              href="/press"
              aria-label="View HundrED press coverage and recognition"
              className="group inline-flex min-h-[44px] items-center gap-2 rounded-[12px] border border-sky-200/20 bg-white/[0.02] px-3 py-1.5 transition-[background-color,border-color] hover:border-sky-200/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <span className="text-[11px] font-bold text-sky-100 group-hover:text-white">
                HundrED
              </span>
            </Link>
          </div>
        </div>

        {/* Ontology & BYOK Grounding Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            PubMed Grounded
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 text-sky-400" aria-hidden="true" />
            Cell Ontology
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 text-violet-400" aria-hidden="true" />
            BYOK Gemini
          </span>
        </div>
      </footer>
    </div>
  );
}