"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const modules = [
  {
    title: "Oncology Command Center",
    subtitle: "Integrated cancer research workspace",
    description:
      "A central command interface for navigating molecular, cellular, pathway, and evidence layers.",
    href: "/lab/command-center",
    tag: "CORE",
    accent: "cyan",
  },
  {
    title: "Molecular Dive",
    subtitle: "Gene and pathway resolution",
    description:
      "Explore TP53, BRCA2, PTEN, AR, genomic alterations, pathway effects, and molecular evidence.",
    href: "/molecular-dive",
    tag: "GENOMICS",
    accent: "emerald",
  },
  {
    title: "Cancer Evolution",
    subtitle: "Clonal evolution through time",
    description:
      "Trace tumor diversification, therapy pressure, resistant clones, and metastatic progression.",
    href: "/evolution",
    tag: "EVOLUTION",
    accent: "rose",
  },
  {
    title: "Patient Digital Twin",
    subtitle: "Virtual tumor simulation",
    description:
      "Model tumor burden, molecular alterations, therapy response, and resistance scenarios.",
    href: "/digital-twin",
    tag: "SIMULATION",
    accent: "violet",
  },
  {
    title: "Tumor Microenvironment",
    subtitle: "Spatial ecosystem atlas",
    description:
      "Explore cancer cells, CAFs, immune populations, vascular cells, hypoxia, and intercellular signaling.",
    href: "/microenvironment",
    tag: "SPATIAL",
    accent: "amber",
  },
  {
    title: "Metastatic Route Explorer",
    subtitle: "Primary tumor to bone niche",
    description:
      "Follow invasion, intravasation, circulating tumor cells, bone homing, and metastatic colonization.",
    href: "/metastasis",
    tag: "METASTASIS",
    accent: "pink",
  },
  {
    title: "Research Copilot",
    subtitle: "Mechanistic AI research interface",
    description:
      "Ask cancer-biology questions and navigate genes, pathways, mechanisms, evidence, and research directions.",
    href: "/research-copilot",
    tag: "AI",
    accent: "blue",
  },
  {
    title: "Knowledge Graph",
    subtitle: "BioLayers biological explorer",
    description:
      "Explore biological relationships between cells, genes, proteins, pathways, processes, diseases, and drugs.",
    href: "/explore",
    tag: "GRAPH",
    accent: "teal",
  },
];

const accentMap = {
  cyan: {
    border: "hover:border-cyan-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(34,211,238,.10)]",
    dot: "bg-cyan-300 shadow-[0_0_14px_rgba(161,92,255,.9)]",
    text: "text-cyan-200",
    background: "from-cyan-400/[0.07]",
  },
  emerald: {
    border: "hover:border-emerald-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(52,211,153,.10)]",
    dot: "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.9)]",
    text: "text-emerald-200",
    background: "from-emerald-400/[0.07]",
  },
  rose: {
    border: "hover:border-rose-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(251,113,133,.10)]",
    dot: "bg-rose-300 shadow-[0_0_14px_rgba(253,164,175,.9)]",
    text: "text-rose-200",
    background: "from-rose-400/[0.07]",
  },
  violet: {
    border: "hover:border-violet-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(167,139,250,.10)]",
    dot: "bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,.9)]",
    text: "text-violet-200",
    background: "from-violet-400/[0.07]",
  },
  amber: {
    border: "hover:border-amber-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(251,191,36,.10)]",
    dot: "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,.9)]",
    text: "text-amber-200",
    background: "from-amber-400/[0.07]",
  },
  pink: {
    border: "hover:border-pink-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(244,114,182,.10)]",
    dot: "bg-pink-300 shadow-[0_0_14px_rgba(249,168,212,.9)]",
    text: "text-pink-200",
    background: "from-pink-400/[0.07]",
  },
  blue: {
    border: "hover:border-blue-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(96,165,250,.10)]",
    dot: "bg-blue-300 shadow-[0_0_14px_rgba(147,197,253,.9)]",
    text: "text-blue-200",
    background: "from-blue-400/[0.07]",
  },
  teal: {
    border: "hover:border-teal-300/30",
    glow: "group-hover:shadow-[0_0_55px_rgba(77,141,255,.10)]",
    dot: "bg-teal-300 shadow-[0_0_14px_rgba(77,141,255,.9)]",
    text: "text-teal-200",
    background: "from-teal-400/[0.07]",
  },
};

export default function LabPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030507] text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-[1700px] px-5 pb-24 pt-10 md:px-8 lg:px-10">
        <header className="rounded-[34px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(161,92,255,.9)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-200/70">
                  BioLayers AI Research OS
                </span>
              </div>

              <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-7xl">
                Computational Oncology
                <span className="block bg-gradient-to-r from-[#8db2ff] via-white to-[#c095fd] bg-clip-text text-transparent">
                  Research Platform
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-white/40 md:text-base">
                Move across molecular biology, tumor evolution, spatial
                microenvironments, metastatic progression, virtual patient
                models, evidence, and AI-assisted mechanistic research.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <HeaderMetric label="Modules" value="08" />
              <HeaderMetric label="Domain" value="Oncology" />
              <HeaderMetric label="Mode" value="Research" />
              <HeaderMetric label="Engine" value="BioLayers" />
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                Research modules
              </p>

              <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
                Enter a biological layer
              </h2>
            </div>

            <Link
              href="/"
              className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/40 transition hover:bg-white/[0.06] hover:text-white md:block"
            >
              Back to Home
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module, index) => {
              const accent =
                accentMap[module.accent as keyof typeof accentMap];

              return (
                <motion.div
                  key={module.title}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.45,
                  }}
                >
                  <Link
                    href={module.href}
                    className={`group relative block min-h-[310px] overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#070b10]/80 p-5 backdrop-blur-xl transition-all duration-300 ${accent.border} ${accent.glow}`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.background} via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100`}
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${accent.dot}`}
                        />

                        <span
                          className={`rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] ${accent.text}`}
                        >
                          {module.tag}
                        </span>
                      </div>

                      <div className="mt-8">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                          {module.subtitle}
                        </div>

                        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                          {module.title}
                        </h3>

                        <p className="mt-4 text-sm leading-6 text-white/35">
                          {module.description}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-8">
                        <span className="text-xs text-white/35 transition group-hover:text-white/65">
                          Open module
                        </span>

                        <motion.span
                          className={`font-mono text-lg ${accent.text}`}
                          initial={false}
                          whileHover={{
                            x: 4,
                          }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#040812]/80 p-6 backdrop-blur-xl md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-300/60">
                Unified workflow
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                From biology to mechanism
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/40">
                BioLayers connects biological entities across multiple scales
                instead of treating genes, pathways, cells, tumors, and
                literature as isolated datasets.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <WorkflowNode index="01" title="Observe" text="Find the biological signal." />
              <WorkflowNode index="02" title="Connect" text="Build mechanistic relationships." />
              <WorkflowNode index="03" title="Simulate" text="Explore possible biological states." />
              <WorkflowNode index="04" title="Validate" text="Connect claims to evidence." />
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
          BioLayers AI · computational oncology research platform
        </footer>
      </div>
    </main>
  );
}

function HeaderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[110px] rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/25">
        {label}
      </div>

      <div className="mt-2 text-sm font-semibold text-white/70">
        {value}
      </div>
    </div>
  );
}

function WorkflowNode({
  index,
  title,
  text,
}: {
  index: string;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="font-mono text-[9px] text-cyan-300/55">
        {index}
      </div>

      <div className="mt-4 text-sm font-semibold">
        {title}
      </div>

      <p className="mt-2 text-[10px] leading-5 text-white/30">
        {text}
      </p>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-12%] top-[-15%] h-[720px] w-[720px] rounded-full bg-cyan-500/[0.055] blur-[190px]" />

      <div className="absolute right-[-12%] top-[12%] h-[700px] w-[700px] rounded-full bg-violet-500/[0.055] blur-[190px]" />

      <div className="absolute bottom-[-20%] left-[30%] h-[600px] w-[600px] rounded-full bg-emerald-500/[0.03] blur-[180px]" />

      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
    </div>
  );
}