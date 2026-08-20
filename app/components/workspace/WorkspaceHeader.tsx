"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export type WorkspaceView =
  | "graph"
  | "evidence"
  | "citations"
  | "timeline"
  | "cells"
  | "pubmed";

export type GenerationMode =
  | "loading"
  | "ai"
  | "fallback"
  | "saved"
  | "error";

type WorkspaceHeaderProps = {
  demoMode: boolean;
  generationMode: GenerationMode;
  generationMessage: string;
  workspaceView: WorkspaceView;
  setWorkspaceView: (view: WorkspaceView) => void;
  saveCurrentProject: () => void;
  exporting: boolean;
  exportMenuOpen: boolean;
  setExportMenuOpen: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
  exportGraphAsPng: () => Promise<void>;
  exportGraphAsJson: () => void;
  exportGraphAsGraphMl: () => void;
};

const workspaceTabs: Array<{
  key: WorkspaceView;
  label: string;
  short: string;
}> = [
  { key: "graph", label: "Graph", short: "G" },
  { key: "evidence", label: "Evidence", short: "E" },
  { key: "citations", label: "Citations", short: "C" },
  { key: "timeline", label: "Timeline", short: "T" },
  { key: "cells", label: "Cells", short: "L" },
  { key: "pubmed", label: "PubMed", short: "P" },
];

function statusStyles(mode: GenerationMode) {
  if (mode === "ai") {
    return {
      dot: "bg-emerald-300",
      glow: "shadow-[0_0_14px_rgba(110,231,183,.9)]",
      text: "text-emerald-200",
      label: "AI ready",
    };
  }

  if (mode === "loading") {
    return {
      dot: "bg-cyan-300",
      glow: "shadow-[0_0_14px_rgba(161,92,255,.9)]",
      text: "text-cyan-200",
      label: "Processing",
    };
  }

  if (mode === "saved") {
    return {
      dot: "bg-sky-300",
      glow: "shadow-[0_0_14px_rgba(141,178,255,.85)]",
      text: "text-sky-200",
      label: "Saved",
    };
  }

  if (mode === "error") {
    return {
      dot: "bg-rose-300",
      glow: "shadow-[0_0_14px_rgba(253,164,175,.85)]",
      text: "text-rose-200",
      label: "Attention",
    };
  }

  return {
    dot: "bg-amber-300",
    glow: "shadow-[0_0_14px_rgba(252,211,77,.8)]",
    text: "text-amber-200",
    label: "Local mode",
  };
}

export default function WorkspaceHeader({
  demoMode,
  generationMode,
  generationMessage,
  workspaceView,
  setWorkspaceView,
  saveCurrentProject,
  exporting,
  exportMenuOpen,
  setExportMenuOpen,
  exportGraphAsPng,
  exportGraphAsJson,
  exportGraphAsGraphMl,
}: WorkspaceHeaderProps) {
  const status = statusStyles(generationMode);

  return (
    <header
      className={`relative z-40 items-center justify-between border-b border-teal-100/[0.09] bg-[#070b10]/82 px-3 shadow-[0_14px_40px_rgba(2,8,15,.18)] backdrop-blur-[26px] sm:px-5 ${
        demoMode ? "hidden" : "flex h-[72px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-200/[0.16] to-transparent" />
      <div className="pointer-events-none absolute left-[12%] top-0 h-px w-[28%] bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />

      <div className="flex min-w-0 items-center gap-3.5">
        <Link
          href="/"
          className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[15px] border border-teal-200/[0.16] bg-[linear-gradient(145deg,rgba(77,141,255,.12),rgba(14,116,144,.08))] text-[13px] font-black tracking-[-0.05em] text-teal-50 shadow-[0_12px_34px_rgba(13,148,136,.12)] transition duration-300 hover:-translate-y-0.5 hover:border-teal-200/30 hover:shadow-[0_16px_38px_rgba(20,184,166,.18)]"
        >
          <motion.span
            className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(141,178,255,.22),transparent_36%),linear-gradient(135deg,transparent,rgba(141,178,255,.1))]"
            animate={{
              opacity: [0.45, 0.8, 0.45],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="relative z-10">BL</span>
        </Link>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <p className="truncate text-[15px] font-semibold tracking-[-0.025em] text-[#eef4ff] sm:text-[16px]">
              BioLayers AI
            </p>

            <span className="hidden h-4 w-px bg-white/[0.09] sm:block" />

            <p className="hidden max-w-[240px] truncate text-[12px] font-medium tracking-[0.01em] text-slate-300 sm:block">
              Cancer Biology Workspace
            </p>
          </div>

          <div className="mt-1.5 flex min-w-0 items-center gap-2">
            <motion.span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot} ${status.glow}`}
              animate={
                generationMode === "loading"
                  ? {
                      scale: [1, 1.45, 1],
                      opacity: [0.55, 1, 0.55],
                    }
                  : {
                      scale: [1, 1.12, 1],
                      opacity: [0.8, 1, 0.8],
                    }
              }
              transition={{
                duration: generationMode === "loading" ? 1.25 : 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] ${status.text}`}
            >
              {status.label}
            </span>

            <span className="hidden text-[10px] text-slate-600 md:inline">
              ·
            </span>

            <p className="hidden max-w-[300px] truncate text-[11px] font-medium text-slate-400 md:block">
              {generationMessage}
            </p>
          </div>
        </div>
      </div>

      <nav className="hidden items-center rounded-[15px] border border-teal-100/[0.075] bg-[#0a0f14]/74 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_10px_30px_rgba(2,8,15,.16)] backdrop-blur-xl lg:flex">
        {workspaceTabs.map((tab) => {
          const active = workspaceView === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setWorkspaceView(tab.key)}
              className={`group relative min-w-[70px] overflow-hidden rounded-[11px] px-3 py-2 text-[12px] font-semibold tracking-[-0.01em] transition-colors duration-300 ${
                active
                  ? "text-teal-50"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="workspace-active-tab"
                  transition={{
                    type: "spring",
                    stiffness: 440,
                    damping: 34,
                  }}
                  className="absolute inset-0 rounded-[11px] border border-teal-200/[0.13] bg-[linear-gradient(145deg,rgba(77,141,255,.1),rgba(141,178,255,.045))] shadow-[0_8px_24px_rgba(13,148,136,.08)]"
                />
              )}

              {!active && (
                <span className="absolute inset-0 rounded-[11px] bg-white/[0.025] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              )}

              <span className="relative z-10 flex items-center justify-center gap-2">
                <span
                  className={`hidden font-mono text-[9px] font-bold uppercase xl:inline ${
                    active ? "text-teal-300" : "text-slate-600"
                  }`}
                >
                  {tab.short}
                </span>
                {tab.label}
              </span>

              {active && (
                <motion.span
                  layoutId="workspace-active-tab-line"
                  className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-200/90 to-transparent"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={saveCurrentProject}
          className="hidden rounded-[12px] border border-teal-100/[0.09] bg-white/[0.025] px-3.5 py-2.5 text-[12px] font-semibold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:border-teal-200/[0.2] hover:bg-teal-200/[0.055] hover:text-teal-50 sm:block"
        >
          Save
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setExportMenuOpen((current) => !current)
            }
            disabled={exporting}
            className="group relative overflow-hidden rounded-[12px] border border-teal-200/[0.22] bg-[linear-gradient(135deg,#57ffa0_0%,#4d8dff_52%,#a15cff_100%)] px-4 py-2.5 text-[12px] font-extrabold text-[#04070a] shadow-[0_12px_30px_rgba(77,141,255,.17)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(77,141,255,.24)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.38)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
            <span className="relative">
              {exporting ? "Exporting..." : "Export"}
              {!exporting && (
                <span className="ml-1.5 opacity-65">⌄</span>
              )}
            </span>
          </button>

          <AnimatePresence>
            {exportMenuOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                  filter: "blur(8px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                  filter: "blur(8px)",
                }}
                transition={{
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute right-0 top-[calc(100%+10px)] z-[120] w-56 overflow-hidden rounded-[18px] border border-teal-100/[0.1] bg-[#0a0f14]/98 p-2 shadow-[0_24px_80px_rgba(1,8,15,.58)] backdrop-blur-3xl"
              >
                <div className="mb-1 px-3 pb-2 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                    Export graph
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-400">
                    Visualization or structured research data.
                  </p>
                </div>

                <ExportOption
                  label="PNG visualization"
                  meta="Presentation-ready image"
                  onClick={() => void exportGraphAsPng()}
                />

                <ExportOption
                  label="JSON research data"
                  meta="Structured graph data"
                  onClick={exportGraphAsJson}
                />

                <ExportOption
                  label="GraphML / Cytoscape"
                  meta="Network analysis format"
                  onClick={exportGraphAsGraphMl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/"
          className="rounded-[12px] border border-teal-100/[0.08] bg-white/[0.018] px-3 py-2.5 text-[12px] font-semibold text-slate-400 transition duration-300 hover:border-teal-100/[0.15] hover:bg-white/[0.04] hover:text-slate-100"
        >
          New
        </Link>
      </div>
    </header>
  );
}

function ExportOption({
  label,
  meta,
  onClick,
}: {
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-[13px] px-3 py-2.5 text-left transition duration-250 hover:bg-teal-200/[0.055]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-slate-100 transition group-hover:text-teal-50">
            {label}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 transition group-hover:text-slate-400">
            {meta}
          </p>
        </div>

        <span className="text-[13px] text-slate-600 transition duration-300 group-hover:translate-x-0.5 group-hover:text-teal-300">
          ↗
        </span>
      </div>
    </button>
  );
}