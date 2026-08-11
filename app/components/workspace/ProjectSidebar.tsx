"use client";

import type { ReactNode } from "react";
import type { EntityType } from "../../lib/buildGraphFromText";

type LayerState = Record<EntityType, boolean>;

type ProjectSidebarProps = {
  demoMode: boolean;
  nodeCount: number;
  edgeCount: number;
  activeLayerCount: number;
  sourceText: string;
  layers: LayerState;
  toggleLayer: (type: EntityType) => void;
  saveCurrentProject: () => void;
  restoreSavedProject: () => Promise<void>;
  deleteSavedProject: () => void;
  hasSavedProject: boolean;
  saveMessage: string;
  apiError: string;
};

const layerLabels: Array<{
  key: EntityType;
  label: string;
}> = [
  { key: "cell", label: "Cells" },
  { key: "protein", label: "Proteins" },
  { key: "pathway", label: "Pathways" },
  { key: "process", label: "Processes" },
  { key: "disease", label: "Diseases" },
];

const entityColorClass: Record<EntityType, string> = {
  cell: "bg-teal-400",
  protein: "bg-violet-400",
  gene: "bg-cyan-400",
  drug: "bg-fuchsia-400",
  pathway: "bg-amber-400",
  process: "bg-blue-400",
  disease: "bg-rose-400",
};

export default function ProjectSidebar({
  demoMode,
  nodeCount,
  edgeCount,
  activeLayerCount,
  sourceText,
  layers,
  toggleLayer,
  saveCurrentProject,
  restoreSavedProject,
  deleteSavedProject,
  hasSavedProject,
  saveMessage,
  apiError,
}: ProjectSidebarProps) {
  return (
<aside
            className={`overflow-y-auto border-r border-white/[0.08] bg-[#050814]/78 p-4 backdrop-blur-2xl ${
              demoMode
                ? "hidden"
                : "hidden lg:block"
            }`}
          >
            <WorkspaceSectionLabel>
              Project
            </WorkspaceSectionLabel>

            <div className="mt-3 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Cancer Bone Metastasis
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.17em] text-slate-500">
                    Knowledge graph project
                  </p>
                </div>

                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-emerald-300">
                  Active
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <ProjectMetric
                  value={String(nodeCount)}
                  label="Nodes"
                />
                <ProjectMetric
                  value={String(edgeCount)}
                  label="Links"
                />
                <ProjectMetric
                  value={`${activeLayerCount}/5`}
                  label="Layers"
                />
              </div>
            </div>

            <WorkspaceSectionLabel className="mt-7">
              Source input
            </WorkspaceSectionLabel>

            <div className="mt-3 rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Research paragraph
                </p>

                <span className="font-mono text-[9px] text-slate-600">
                  {sourceText.length} chars
                </span>
              </div>

              <p className="max-h-36 overflow-y-auto pr-1 text-xs leading-6 text-slate-400">
                {sourceText}
              </p>
            </div>

            <WorkspaceSectionLabel className="mt-7">
              Biological layers
            </WorkspaceSectionLabel>

            <div className="mt-3 space-y-2">
              {layerLabels.map((layer) => {
                const active = layers[layer.key];

                return (
                  <button
                    key={layer.key}
                    type="button"
                    onClick={() =>
                      toggleLayer(layer.key)
                    }
                    className={`group flex w-full items-center justify-between rounded-[15px] border px-3.5 py-3 text-left transition ${
                      active
                        ? "border-white/[0.09] bg-white/[0.045] text-white"
                        : "border-transparent bg-transparent text-slate-600 hover:bg-white/[0.025]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${entityColorClass[layer.key]} ${
                          active
                            ? "shadow-[0_0_12px_currentColor]"
                            : "opacity-30"
                        }`}
                      />

                      <span className="text-xs font-semibold">
                        {layer.label}
                      </span>
                    </span>

                    <span
                      className={`relative h-5 w-9 rounded-full transition ${
                        active
                          ? "bg-cyan-300/25"
                          : "bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-3 w-3 rounded-full transition ${
                          active
                            ? "left-5 bg-cyan-200 shadow-[0_0_8px_#67e8f9]"
                            : "left-1 bg-slate-600"
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            <WorkspaceSectionLabel className="mt-7">
              Project actions
            </WorkspaceSectionLabel>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={saveCurrentProject}
                className="rounded-[14px] bg-cyan-300 px-3 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() =>
                  void restoreSavedProject()
                }
                disabled={!hasSavedProject}
                className="rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Restore
              </button>

              <button
                type="button"
                onClick={deleteSavedProject}
                disabled={!hasSavedProject}
                className="col-span-2 rounded-[14px] border border-rose-300/10 px-3 py-2.5 text-xs font-semibold text-rose-300/75 transition hover:bg-rose-300/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Delete saved version
              </button>
            </div>

            {(saveMessage || apiError) && (
              <div className="mt-3 rounded-[14px] border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                <p
                  className={`text-[10px] leading-5 ${
                    apiError
                      ? "text-amber-300"
                      : "text-emerald-300"
                  }`}
                >
                  {apiError || saveMessage}
                </p>
              </div>
            )}
          </aside>
  );
}

function WorkspaceSectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[9px] font-bold uppercase tracking-[0.24em] text-slate-600 ${className}`}
    >
      {children}
    </p>
  );
}

function ProjectMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[13px] border border-white/[0.06] bg-black/20 px-2 py-2.5 text-center">
      <p className="text-sm font-semibold text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
    </div>
  );
}