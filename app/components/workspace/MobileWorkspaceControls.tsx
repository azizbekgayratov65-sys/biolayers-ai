"use client";

import type { EntityData } from "../../lib/buildGraphFromText";

export type WorkspaceView =
  | "graph"
  | "evidence"
  | "citations"
  | "timeline"
  | "cells"
  | "pubmed";

type MobileWorkspaceControlsProps = {
  demoMode: boolean;
  workspaceView: WorkspaceView;
  setWorkspaceView: (view: WorkspaceView) => void;
  selectedEntity: EntityData;
  selectedConnectionCount: number;
  resetView: () => Promise<void>;
};

export default function MobileWorkspaceControls({
  demoMode,
  workspaceView,
  setWorkspaceView,
  selectedEntity,
  selectedConnectionCount,
  resetView,
}: MobileWorkspaceControlsProps) {
  return (
    <>
        <nav
          className={`fixed bottom-[76px] left-3 right-3 z-[70] grid-cols-5 gap-1 rounded-[18px] ${
            demoMode
              ? "hidden"
              : "grid lg:hidden"
          } border border-white/[0.1] bg-[#07101d]/94 p-1.5 shadow-2xl backdrop-blur-2xl`}
        >
          {(
            [
              ["graph", "Graph"],
              ["evidence", "Evidence"],
              ["citations", "Citations"],
              ["timeline", "Timeline"],
              ["pubmed", "PubMed"],
            ] as Array<
              [WorkspaceView, string]
            >
          ).map(([view, label]) => (
            <button
              key={view}
              type="button"
              onClick={() =>
                setWorkspaceView(view)
              }
              className={`rounded-[12px] px-1 py-2 text-[8px] font-bold uppercase ${
                workspaceView === view
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-500"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile status strip */}
        <div
          className={`absolute bottom-3 left-3 right-3 z-50 items-center justify-between rounded-[18px] ${
            demoMode
              ? "hidden"
              : "flex lg:hidden"
          } border border-white/[0.1] bg-[#07101d]/92 px-4 py-3 shadow-2xl backdrop-blur-2xl`}
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {selectedEntity.label}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-cyan-300">
              {selectedEntity.type} ·{" "}
              {selectedConnectionCount} links
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void resetView()
            }
            className="rounded-[12px] border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300"
          >
            Fit graph
          </button>
        </div>
    </>
  );
}