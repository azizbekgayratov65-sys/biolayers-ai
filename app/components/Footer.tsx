import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Dna,
  ShieldCheck,
  Database,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="relative z-10 border-t border-teal-200/10 bg-[#04070a]/95 text-slate-300 backdrop-blur-xl"
    >
      {/* Decorative top luminous border accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-teal-300/35 to-transparent"
      />

      <div className="mx-auto max-w-[1540px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand & Mission Column */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-3 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
              aria-label="BioLayers AI home"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-teal-200/25 bg-teal-300/[0.08] p-1.5 shadow-[0_0_15px_rgba(77,141,255,0.15)]">
                <Image
                  src="/biolayers-logo.svg"
                  alt="BioLayers AI"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-[-0.02em] text-white">
                  BioLayers AI
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300/80">
                  Computational Oncology
                </span>
              </div>
            </Link>

            <p className="max-w-md text-xs leading-relaxed text-slate-400">
              AI-driven computational oncology workspace for evidence-linked
              biological mechanism mapping, causal reasoning, and precision
              oncology literature synthesis.
            </p>

            {/* Scientific Provenance Indicator */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-[13px] border border-teal-200/15 bg-teal-400/[0.04] px-3 py-2 text-[11px] text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[10px] text-teal-200">
                Wired with NCBI PubMed e-utilities &amp; EMBL-EBI OLS
              </span>
            </div>
          </div>

          {/* Column 1: Computational Explorers */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
              Explorers
            </h3>
            <ul className="mt-4 space-y-1">
              <li>
                <Link
                  href="/cells"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <Dna className="mr-2 h-3.5 w-3.5 text-teal-300/70" />
                  Cell Atlas
                </Link>
              </li>
              <li>
                <Link
                  href="/cipher"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <Database className="mr-2 h-3.5 w-3.5 text-sky-300/70" />
                  Project Cipher
                </Link>
              </li>
              <li>
                <Link
                  href="/mindmap"
                  className="flex min-h-[44px] items-center text-xs font-semibold text-emerald-300 transition-colors hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(43,255,136,0.8)]" />
                  Mind Map Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/journey"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  BioJourney
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  Research Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Institutional & Recognition */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
              Institutional
            </h3>
            <ul className="mt-4 space-y-1">
              <li>
                <Link
                  href="/about"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  About &amp; Mentorship
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  Partners &amp; Labs
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  Press &amp; Media
                </Link>
              </li>
              <li>
                <a
                  href="https://hundred.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[44px] items-center gap-1 text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <span>HundrED Global</span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-white" />
                </a>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="group flex min-h-[44px] items-center gap-1 text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <span>NXT Horizon Initiative</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-white" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Data Sources & Governance */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
              Integrations &amp; Legal
            </h3>
            <ul className="mt-4 space-y-1">
              <li>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[44px] items-center gap-1.5 text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <span>PubMed (NCBI)</span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-white" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ebi.ac.uk/ols4/ontologies/cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[44px] items-center gap-1.5 text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <span>Cell Ontology (EMBL-EBI)</span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-white" />
                </a>
              </li>
              <li>
                <Link
                  href="/settings#ai"
                  className="flex min-h-[44px] items-center gap-1.5 text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-300/80" />
                  BYOK Security &amp; Keys
                </Link>
              </li>
              <li>
                <Link
                  href="/about#privacy"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/about#terms"
                  className="flex min-h-[44px] items-center text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  Terms of Research
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Strategic Partner & Recognition Showcase Strip */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-teal-200/10 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Partners &amp; Recognition:
            </span>

            <Link
              href="/partners"
              className="group flex min-h-[44px] items-center gap-2 rounded-[13px] border border-teal-200/20 bg-white/[0.02] px-3 py-1.5 transition hover:border-teal-200/40 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-white/20 bg-white p-0.5">
                <Image
                  src="/branding/nxthorizon-logo.png"
                  alt="NXT Horizon"
                  width={20}
                  height={20}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-bold text-teal-100 group-hover:text-white">
                NXT Horizon
              </span>
            </Link>

            <Link
              href="/press"
              className="group flex min-h-[44px] items-center gap-2 rounded-[13px] border border-sky-200/20 bg-white/[0.02] px-3 py-1.5 transition hover:border-sky-200/40 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <span className="text-xs font-bold text-sky-100 group-hover:text-white">
                HundrED
              </span>
            </Link>
          </div>

          <div className="font-mono text-[10px] text-slate-400">
            Precision Oncology Research • For Computational Biology &amp; Oncology Workflows
          </div>
        </div>

        {/* Bottom Metadata & Legal Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} BioLayers AI. All rights reserved.
          </p>

          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Ground truth backed by NCBI PubMed and EMBL-EBI Cell Ontology. BYOK Gemini keys encrypted with AES-256-GCM.
          </p>
        </div>
      </div>
    </footer>
  );
}
