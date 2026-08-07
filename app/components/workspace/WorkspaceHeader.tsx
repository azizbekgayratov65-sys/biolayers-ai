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
  return (
<header
          className={`relative z-40 items-center justify-between border-b border-white/[0.08] bg-[#050814]/90 px-3 backdrop-blur-2xl sm:px-5 ${
            demoMode
              ? "hidden"
              : "flex h-[72px]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-cyan-300/20 bg-cyan-300/[0.08] text-xs font-black tracking-[-0.04em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,.12)]"
            >
              <span className="relative z-10">
                BL
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-cyan-300/20 via-transparent to-violet-400/25 opacity-0 transition group-hover:opacity-100" />
            </Link>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white sm:text-base">
                  BioLayers AI
                </p>

                <span className="hidden text-slate-700 sm:inline">
                  /
                </span>

                <p className="hidden max-w-[260px] truncate text-sm text-slate-400 sm:block">
                  Cancer Biology Workspace
                </p>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    generationMode === "ai"
                      ? "bg-emerald-300 shadow-[0_0_10px_#6ee7b7]"
                      : generationMode === "loading"
                        ? "animate-pulse bg-cyan-300 shadow-[0_0_10px_#67e8f9]"
                        : "bg-amber-300 shadow-[0_0_10px_#fcd34d]"
                  }`}
                />

                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {generationMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-1 lg:flex">
            {(
              [
                {
                  key: "graph",
                  label: "Graph",
                },
                {
                  key: "evidence",
                  label: "Evidence",
                },
                {
                  key: "citations",
                  label: "Citations",
                },
                {
                  key: "timeline",
                  label: "Timeline",
                },
                {
                  key: "cells",
                  label: "Cells",
                },
                {
                  key: "pubmed",
                  label: "PubMed",
                },
              ] as Array<{
                key: WorkspaceView;
                label: string;
              }>
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setWorkspaceView(tab.key)
                }
                className={`relative overflow-hidden rounded-[10px] px-4 py-2 text-xs font-semibold transition ${
                  workspaceView === tab.key
                    ? "bg-white/[0.09] text-white shadow-sm"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                }`}
              >
                {workspaceView === tab.key && (
                  <motion.span
                    layoutId="workspace-active-tab"
                    className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  />
                )}

                <span className="relative">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveCurrentProject}
              className="hidden rounded-[13px] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.06] sm:block"
            >
              Save
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setExportMenuOpen(
                    (current) => !current,
                  )
                }
                disabled={exporting}
                className="rounded-[13px] bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-4 py-2.5 text-xs font-bold text-[#03101a] shadow-[0_12px_32px_rgba(34,211,238,.18)] transition hover:brightness-110 disabled:opacity-50"
              >
                {exporting
                  ? "Exporting..."
                  : "Export ▾"}
              </button>

              <AnimatePresence>
                {exportMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    className="absolute right-0 top-[calc(100%+10px)] z-[120] w-52 overflow-hidden rounded-[17px] border border-white/[0.1] bg-[#07101d]/98 p-2 shadow-[0_22px_70px_rgba(0,0,0,.52)] backdrop-blur-3xl"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void exportGraphAsPng()
                      }
                      className="w-full rounded-[12px] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-cyan-300/[0.08]"
                    >
                      PNG visualization
                    </button>
                    <button
                      type="button"
                      onClick={exportGraphAsJson}
                      className="w-full rounded-[12px] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-violet-300/[0.08]"
                    >
                      JSON research data
                    </button>
                    <button
                      type="button"
                      onClick={exportGraphAsGraphMl}
                      className="w-full rounded-[12px] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-teal-300/[0.08]"
                    >
                      GraphML / Cytoscape
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/"
              className="rounded-[13px] border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              New
            </Link>
          </div>
        </header>
  );
}