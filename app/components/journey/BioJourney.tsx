"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import {
  FileText,
  Dna,
  Network,
  ShieldCheck,
  Bot,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Workflow,
  Search,
  Key,
} from "lucide-react";
import Link from "next/link";

type JourneyStep = {
  id: string;
  step: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof FileText;
  featureList: string[];
  livePreview: {
    heading: string;
    subheading: string;
    details: {
      label: string;
      value: string;
    }[];
    snippetTitle?: string;
    snippetText?: string;
  };
};

const steps: JourneyStep[] = [
  {
    id: "ingest",
    step: "01",
    badge: "Paper Ingestion & Search",
    title: "Upload Manuscripts or Query PubMed",
    subtitle: "PDF / DOCX Parsing & NCBI PubMed E-Utilities",
    description:
      "Upload scientific papers directly in PDF or DOCX format, or search NCBI PubMed by keyword and PMID. The platform extracts full text and citation metadata ready for analysis.",
    icon: Search,
    featureList: [
      "Upload research papers in PDF or DOCX format",
      "Direct NCBI PubMed E-Utilities integration by PMID",
      "Automatic author, journal, and abstract extraction",
    ],
    livePreview: {
      heading: "Manuscript Ingestion Engine",
      subheading: "NCBI E-Utilities · Server-Side Parsing",
      details: [
        { label: "Supported Formats", value: "PDF, DOCX, PubMed PMID" },
        { label: "PubMed Integration", value: "Live NCBI E-Utilities API" },
        { label: "Parsing Strategy", value: "Local worker token extraction" },
      ],
      snippetTitle: "PubMed PMID Query Example",
      snippetText: "PMID: 38291045 — 'Mechanisms of EGFR-mediated signaling in lung carcinoma.'",
    },
  },
  {
    id: "extract",
    step: "02",
    badge: "AI Graph Generation",
    title: "Extract Entities & Causal Pathways",
    subtitle: "Encrypted BYOK Gemini 2.5 Flash / Pro",
    description:
      "BioLayers AI uses your encrypted Google Gemini API key to identify biological entities (genes, proteins, cell types, drugs) and directional causal relationships (activates, inhibits, upregulates).",
    icon: Dna,
    featureList: [
      "BYOK (Bring Your Own Key) encrypted with AES-256-GCM",
      "Model fallback hierarchy (Gemini 2.5 Flash / Pro)",
      "Structured JSON schema output with strict entity typing",
    ],
    livePreview: {
      heading: "Mechanistic Entity Extraction",
      subheading: "Structured Schema · Directional Relations",
      details: [
        { label: "AI Engine", value: "BYOK Gemini 2.5 Flash / Pro" },
        { label: "Entity Types", value: "Gene, Protein, Process, Drug, Cell" },
        { label: "Relation Types", value: "activates, inhibits, phosphorylates" },
      ],
      snippetTitle: "Extracted Relationship Example",
      snippetText: "[EGFR (Gene)] --(activates)--> [KRAS (Protein)] --(drives)--> [Proliferation (Process)]",
    },
  },
  {
    id: "ground",
    step: "03",
    badge: "Verification & Ontologies",
    title: "Ground in Exact Quotes & Cell Ontology",
    subtitle: "Zero Hallucination with Sentence-Level Provenance",
    description:
      "Every node and edge in the generated mind map is linked to verbatim sentence quotes in the manuscript. Cell types are matched against the EMBL-EBI Cell Ontology (CL) database.",
    icon: ShieldCheck,
    featureList: [
      "Exact sentence quote verification for every biological claim",
      "Live EMBL-EBI Cell Ontology (CL) term resolution via OLS API",
      "Zero hallucinations — claims must exist in the source text",
    ],
    livePreview: {
      heading: "Sentence-Level Citation Grounding",
      subheading: "EMBL-EBI OLS · Verbatim Quote Inspector",
      details: [
        { label: "Quote Linkage", value: "Sentence-level provenance" },
        { label: "Cell Ontology", value: "Live EMBL-EBI OLS search" },
        { label: "Verification", value: "100% text grounded" },
      ],
      snippetTitle: "Verbatim Source Evidence",
      snippetText: "“EGFR activation promotes oncogenic KRAS downstream signaling, driving sustained cell proliferation.”",
    },
  },
  {
    id: "workspace",
    step: "04",
    badge: "Workspace & Copilot",
    title: "Interactive Mind Map & Graph-Aware Copilot",
    subtitle: "ReactFlow Visualizer & Supabase Persistent Library",
    description:
      "Explore the interactive ReactFlow mind map, filter nodes, click quotes, and ask the AI Research Copilot about biological mechanisms. Save maps to your Supabase library.",
    icon: Bot,
    featureList: [
      "Interactive ReactFlow DAG mind map with custom node layouts",
      "Mechanism-aware Copilot reasoned over active graph nodes",
      "Persistent Supabase library with Row Level Security (RLS)",
    ],
    livePreview: {
      heading: "Interactive Research Workspace",
      subheading: "ReactFlow Graph · Supabase RLS Storage",
      details: [
        { label: "Mind Map UI", value: "Interactive ReactFlow DAG" },
        { label: "Copilot Scope", value: "Graph & quote-aware chat" },
        { label: "Data Sovereignty", value: "User-owned Supabase RLS" },
      ],
      snippetTitle: "Research Copilot Query",
      snippetText: "“What resistance pathways emerge when inhibiting KRAS in this mechanism?”",
    },
  },
];

function StepContent({ step }: { step: JourneyStep; reduceMotion?: boolean }) {
  const StepIcon = step.icon;

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
      <div className="flex flex-col justify-between rounded-[22px] border border-teal-100/[0.08] bg-[#070c12]/85 p-6 backdrop-blur-2xl">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-teal-300">
              Step 0{steps.findIndex(s => s.id === step.id) + 1} · {step.badge}
            </span>
            <span className="font-mono text-[9px] text-slate-500">
              {steps.findIndex(s => s.id === step.id) + 1} of {steps.length}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
            {step.title}
          </h2>
          <div className="font-mono text-[10px] text-teal-300/80">
            {step.subtitle}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-300/85">
            {step.description}
          </p>

          <div className="mt-4 space-y-2 border-t border-teal-100/[0.06] pt-3">
            {step.featureList.map((feat) => (
              <div key={feat} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-teal-100/[0.06] pt-3 text-xs">
          <button
            disabled={steps.findIndex(s => s.id === step.id) === 0}
            onClick={() => {}}
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            ← Previous Step
          </button>

          {steps.findIndex(s => s.id === step.id) < steps.length - 1 ? (
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-1.5 font-bold text-teal-300 hover:text-teal-100"
            >
              <span>Next: Step 0{steps.findIndex(s => s.id === step.id) + 2}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              href="/mindmap"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-300 hover:text-emerald-200"
            >
              <Workflow className="h-3.5 w-3.5" />
              <span>Open Mind Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-[22px] border border-teal-100/[0.08] bg-[#070d13]/85 p-5 backdrop-blur-2xl">
        <div>
          <div className="flex items-center justify-between border-b border-teal-100/[0.06] pb-2 text-xs">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-300">
              {step.livePreview.heading}
            </span>
            <span className="font-mono text-[8px] text-teal-300">
              {step.livePreview.subheading}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            {step.livePreview.details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5"
              >
                <span className="text-slate-400">{d.label}:</span>
                <span className="font-mono font-bold text-teal-200">{d.value}</span>
              </div>
            ))}
          </div>

          {step.livePreview.snippetText && (
            <div className="mt-3 rounded-xl border border-teal-100/[0.06] bg-[#09111a]/80 p-3">
              <div className="font-mono text-[8px] font-bold uppercase text-slate-400">
                {step.livePreview.snippetTitle}:
              </div>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-300">
                {step.livePreview.snippetText}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-teal-100/[0.06] pt-2.5 text-[10px] text-slate-500">
          <span>Verified in BioLayers Codebase</span>
          <span className="font-mono text-emerald-400">Live Architecture</span>
        </div>
      </div>
    </div>
  );
}

export default function BioJourney() {
  const reduceMotion = Boolean(useReducedMotion());
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex];

  return (
    <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#04070a] px-6 pt-28 pb-8 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-20 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.04] blur-[160px]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.05] px-4 py-1.5 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
              Platform Workflow & Capabilities
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
            How BioLayers AI{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              actually works
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-300/85 sm:text-sm">
            A 4-step computational pipeline that takes published manuscripts and
            reconstructs interactive, evidence-grounded cancer mechanism maps.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2 rounded-[18px] border border-teal-100/[0.08] bg-[#070d13]/70 p-1.5 backdrop-blur-2xl">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-[12px] px-3 py-2.5 text-xs font-semibold transition-all duration-200
                  ${isActive
                    ? "bg-teal-300/[0.12] text-white shadow-[0_0_15px_rgba(77,141,255,0.15)]"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">0{idx + 1} · {step.badge}</span>
                <span className="sm:hidden">0{idx + 1}</span>
              </button>
            );
          })}
        </div>

        <StepContent step={activeStep} reduceMotion={reduceMotion} />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-teal-100/[0.06] pt-4 text-xs text-slate-500">
        <span>BioLayers AI — 4-Step Verified Workflow</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-300">About & Mentorship</Link>
          <span>·</span>
          <Link href="/partners" className="hover:text-slate-300">Partners & NXT Horizon</Link>
          <span>·</span>
          <Link href="/mindmap" className="text-teal-300 hover:text-teal-200">Open Mind Map Workspace →</Link>
        </div>
      </div>
    </div>
  );
}