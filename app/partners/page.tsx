import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Globe2,
  Cpu,
  Handshake,
  Mail,
  Network,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Binary,
  Microscope,
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

const stemisePillars = [
  {
    title: "Hands-On STEM Access",
    desc: "Democratizing practical biomedical and computational inquiry for students and learners worldwide.",
    icon: GraduationCap,
    badge: "STEM Access",
  },
  {
    title: "Open Curriculum & Workshops",
    desc: "Integrating interactive cancer knowledge graphs and causal diagrams into youth research programs.",
    icon: BookOpen,
    badge: "Curriculum",
  },
  {
    title: "Global Youth Research",
    desc: "Empowering the next generation of scientific leaders to explore molecular biology without barriers.",
    icon: Globe2,
    badge: "Global Reach",
  },
];

const cbsUclaPillars = [
  {
    title: "Student Research & Seminars",
    desc: "Connecting students across UCLA Computational and Systems Biology (CaSB) and bioinformatics.",
    icon: Binary,
    badge: "Seminars",
  },
  {
    title: "Faculty & Peer Networking",
    desc: "Fostering interdisciplinary dialogues across computational genomics, systems biology, and AI.",
    icon: Network,
    badge: "Networking",
  },
  {
    title: "Literature Exploration",
    desc: "Leveraging evidence-grounded oncology knowledge maps for student research workflows and hackathons.",
    icon: Cpu,
    badge: "CompBio Tools",
  },
];

const biomedizonePillars = [
  {
    title: "Global Research Scholars",
    desc: "Empowering students across 68 countries through virtual biomedical research programs and capstones.",
    icon: Microscope,
    badge: "68+ Countries",
  },
  {
    title: "Open Biomedical Education",
    desc: "Democratizing free educational resources, research journals, and mentorship for underserved communities.",
    icon: BookOpen,
    badge: "Open Education",
  },
  {
    title: "Youth Research Innovation",
    desc: "Connecting rising investigators to interactive cancer genomics and computational knowledge graphs.",
    icon: Globe2,
    badge: "Youth Leadership",
  },
];

export default function PartnersPage() {
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
        <div className="text-center animate-fade-up">
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
        </div>

        <div className="mt-8 space-y-6">
          {/* FEATURED STRATEGIC PARTNER: NXT HORIZON */}
          <div className="rounded-[28px] border border-teal-200/25 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8 animate-fade-up delay-75">
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
                    style={{ width: "auto", height: "auto" }}
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
          </div>

          {/* STRATEGIC PARTNER: STEMise */}
          <div className="rounded-[28px] border border-cyan-200/25 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8 animate-fade-up delay-150">
            {/* Top Bar: Emblem + Brand Info + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-teal-100/[0.08] pb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Emblem Card */}
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-300/30 bg-[#080d1a] p-2 shadow-[0_0_30px_rgba(34,211,238,0.2)] sm:h-20 sm:w-20">
                  <Image
                    src="/branding/stemise-logo.png"
                    alt="STEMise Emblem"
                    width={72}
                    height={72}
                    className="h-full w-full object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/[0.1] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-cyan-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      Global STEM Education Partner
                    </span>
                    <span className="font-mono text-[9px] text-teal-300/70">
                      Youth-Led Nonprofit · Open Curriculum
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    STEMise
                  </h2>
                  <div className="font-mono text-[11px] text-slate-400">
                    stemise.org · Hands-On STEM & Global Technology Initiative
                  </div>
                </div>
              </div>

              {/* Visit Website CTA */}
              <a
                href="https://stemise.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 rounded-xl border border-cyan-200/30 bg-cyan-300/[0.08] px-4 py-2.5 text-xs font-bold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.18]"
              >
                <span>Explore stemise.org</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>

            {/* Core Collaboration Narrative & 3 Research Pillars */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                  Educational Outreach & Curriculum Scope
                </div>
                <h3 className="mt-1 text-base font-bold text-teal-50 sm:text-lg">
                  Democratizing Hands-On Cancer Science & AI Literacy Globally
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                  STEMise collaborates with BioLayers AI to make computational oncology and biological inquiry accessible to students and young researchers worldwide. By integrating visual knowledge maps into open STEM programs, learners can explore complex signaling pathways and cancer mechanisms through interactive, hands-on science.
                </p>

                {/* Badges strip */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["STEM Education", "Youth in STEM", "Open Curriculum", "AI Literacy"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-teal-100/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-semibold text-cyan-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3 Pillars Cards */}
              <div className="space-y-2.5">
                {stemisePillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-xl border border-teal-100/[0.08] bg-[#070d14]/70 p-3.5 transition hover:border-cyan-200/25 hover:bg-[#0a121c]/80"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-300">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-bold text-teal-50">
                            {pillar.title}
                          </span>
                        </div>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-cyan-300/60">
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

          {/* ACADEMIC PARTNER: COMPUTATIONAL BIOLOGISTS SOCIETY AT UCLA */}
          <div className="rounded-[28px] border border-sky-300/25 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8 animate-fade-up delay-200">
            {/* Top Bar: Emblem + Brand Info + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-teal-100/[0.08] pb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* UCLA Themed Emblem */}
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-400/40 bg-gradient-to-br from-[#003B5C] via-[#005587] to-[#2774AE] p-2 shadow-[0_0_30px_rgba(39,116,174,0.35)] sm:h-20 sm:w-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-sm font-black tracking-widest text-[#FFD100] sm:text-base drop-shadow-sm">
                      UCLA
                    </span>
                    <span className="font-mono text-[7px] font-bold uppercase tracking-wider text-sky-100">
                      CompBio
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-400/[0.1] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-sky-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                      Academic Society Partner
                    </span>
                    <span className="font-mono text-[9px] text-teal-300/70">
                      University of California, Los Angeles
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Computational Biologists Society at UCLA
                  </h2>
                  <div className="font-mono text-[11px] text-slate-400">
                    compbiosocucla.wixsite.com/my-site · UCLA Student Organization
                  </div>
                </div>
              </div>

              {/* Visit Website CTA */}
              <a
                href="https://compbiosocucla.wixsite.com/my-site"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 rounded-xl border border-sky-200/30 bg-sky-300/[0.08] px-4 py-2.5 text-xs font-bold text-sky-50 transition hover:border-sky-200/60 hover:bg-sky-300/[0.18]"
              >
                <span>Visit compbiosocucla.wixsite.com</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>

            {/* Core Collaboration Narrative & 3 Research Pillars */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-sky-300">
                  Academic Research & Community Scope
                </div>
                <h3 className="mt-1 text-base font-bold text-teal-50 sm:text-lg">
                  Advancing Student Research in Computational & Systems Biology
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                  The Computational Biologists Society at UCLA connects students and researchers across Computational and Systems Biology (CaSB), bioinformatics, and genomics. BioLayers AI collaborates with the society to support student research workshops, literature synthesis seminars, and interactive oncology graph exploration.
                </p>

                {/* Badges strip */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["UCLA", "Computational Biology", "Bioinformatics", "Systems Biology", "Student Seminars"].map((tag) => (
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
                {cbsUclaPillars.map((pillar) => {
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
          </div>

          {/* STRATEGIC PARTNER: BIOMEDIZONE */}
          <div className="rounded-[28px] border border-teal-200/25 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8 animate-fade-up delay-250">
            {/* Top Bar: Emblem + Brand Info + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-teal-100/[0.08] pb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Emblem Card */}
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-teal-300/30 bg-[#081324] p-1.5 shadow-[0_0_30px_rgba(20,184,166,0.25)] sm:h-20 sm:w-20">
                  <Image
                    src="/branding/biomedizone-logo.png"
                    alt="BioMedizone Emblem"
                    width={72}
                    height={72}
                    className="h-full w-full object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-400/[0.1] px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-teal-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                      Global Biomedical Education Partner
                    </span>
                    <span className="font-mono text-[9px] text-teal-300/70">
                      68+ Countries · Youth-Led Nonprofit
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    BioMedizone
                  </h2>
                  <div className="font-mono text-[11px] text-slate-400">
                    biomedizone.org · International Biomedical Research & Education
                  </div>
                </div>
              </div>

              {/* Visit Website CTA */}
              <a
                href="https://www.biomedizone.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-2 rounded-xl border border-teal-200/30 bg-teal-300/[0.08] px-4 py-2.5 text-xs font-bold text-teal-50 transition hover:border-teal-200/60 hover:bg-teal-300/[0.18]"
              >
                <span>Explore biomedizone.org</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>

            {/* Core Collaboration Narrative & 3 Research Pillars */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-teal-300">
                  Global Research & Education Scope
                </div>
                <h3 className="mt-1 text-base font-bold text-teal-50 sm:text-lg">
                  Expanding Access to Biomedical Research & Oncology Science
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300/85 sm:text-sm sm:leading-6">
                  One of the world&apos;s largest student-led biomedical research and education nonprofits, impacting over 3,000 students across 68 countries. BioLayers AI collaborates with BioMedizone to empower youth research scholars with interactive cancer knowledge graphs, virtual biomedical instruction, and evidence-grounded literature tools.
                </p>

                {/* Badges strip */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Biomedical Research", "68+ Countries", "Research Scholars", "Youth Empowerment", "Open Science"].map((tag) => (
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
                {biomedizonePillars.map((pillar) => {
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
        </div>

        {/* BOTTOM PARTNER INQUIRY CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-100/[0.08] bg-white/[0.015] px-5 py-3.5 text-xs backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Handshake className="h-4 w-4 text-teal-300" />
            <span>Interested in research, clinical, or AI safety collaborations?</span>
          </div>

          <a
            href="mailto:biolayers.ai@gmail.com?subject=Partnership%20Inquiry%20-%20BioLayers%20AI"
            className="inline-flex items-center gap-1.5 font-bold text-teal-300 hover:text-teal-100"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>biolayers.ai@gmail.com</span>
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
