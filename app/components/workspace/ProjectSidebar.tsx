"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  description: string;
}> = [
  {
    key: "cell",
    label: "Cells",
    description: "Cellular actors",
  },
  {
    key: "protein",
    label: "Proteins",
    description: "Molecular effectors",
  },
  {
    key: "gene",
    label: "Genes",
    description: "Genetic regulators",
  },
  {
    key: "pathway",
    label: "Pathways",
    description: "Signaling systems",
  },
  {
    key: "process",
    label: "Processes",
    description: "Biological programs",
  },
  {
    key: "disease",
    label: "Diseases",
    description: "Disease states",
  },
  {
    key: "drug",
    label: "Drugs",
    description: "Therapies & compounds",
  },
];

const entityVisuals: Record<
  EntityType,
  {
    dot: string;
    glow: string;
    activeBorder: string;
    activeBg: string;
  }
> = {
  cell: {
    dot: "bg-teal-300",
    glow: "shadow-[0_0_12px_rgba(94,234,212,.75)]",
    activeBorder: "border-teal-200/[0.14]",
    activeBg: "bg-teal-200/[0.045]",
  },
  protein: {
    dot: "bg-cyan-300",
    glow: "shadow-[0_0_12px_rgba(103,232,249,.7)]",
    activeBorder: "border-cyan-200/[0.13]",
    activeBg: "bg-cyan-200/[0.04]",
  },
  gene: {
    dot: "bg-emerald-300",
    glow: "shadow-[0_0_12px_rgba(110,231,183,.72)]",
    activeBorder: "border-emerald-200/[0.13]",
    activeBg: "bg-emerald-200/[0.04]",
  },
  pathway: {
    dot: "bg-amber-300",
    glow: "shadow-[0_0_12px_rgba(252,211,77,.7)]",
    activeBorder: "border-amber-200/[0.12]",
    activeBg: "bg-amber-200/[0.035]",
  },
  process: {
    dot: "bg-sky-300",
    glow: "shadow-[0_0_12px_rgba(125,211,252,.72)]",
    activeBorder: "border-sky-200/[0.13]",
    activeBg: "bg-sky-200/[0.04]",
  },
  disease: {
    dot: "bg-rose-300",
    glow: "shadow-[0_0_12px_rgba(253,164,175,.7)]",
    activeBorder: "border-rose-200/[0.13]",
    activeBg: "bg-rose-200/[0.04]",
  },
  drug: {
    dot: "bg-orange-300",
    glow: "shadow-[0_0_12px_rgba(253,186,116,.72)]",
    activeBorder: "border-orange-200/[0.13]",
    activeBg: "bg-orange-200/[0.04]",
  },
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
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <aside
      className={`relative overflow-y-auto border-r border-teal-100/[0.075] bg-[#081722]/76 px-3.5 py-4 shadow-[18px_0_50px_rgba(2,8,15,.08)] backdrop-blur-[28px] ${
        demoMode ? "hidden" : "hidden lg:block"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_30%_0%,rgba(45,212,191,.07),transparent_62%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 bg-[radial-gradient(circle,rgba(56,189,248,.035),transparent_68%)]" />

      <div className="relative">
        <WorkspaceSectionLabel>Project</WorkspaceSectionLabel>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 overflow-hidden rounded-[20px] border border-teal-100/[0.085] bg-[linear-gradient(145deg,rgba(15,40,52,.72),rgba(8,26,37,.72))] p-3.5 shadow-[0_16px_44px_rgba(2,8,15,.12)]"
        >
          <div className="pointer-events-none absolute" />

          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-5 tracking-[-0.02em] text-[#effbf9]">
                Cancer Metastasis Workspace
              </p>

              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">
                Knowledge graph
              </p>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/[0.12] bg-emerald-200/[0.05] px-2 py-1">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_9px_rgba(110,231,183,.8)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.65, 1, 0.65],
                        scale: [1, 1.25, 1],
                      }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                Live
              </span>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1.5">
            <ProjectMetric value={String(nodeCount)} label="Nodes" />
            <ProjectMetric value={String(edgeCount)} label="Links" />
            <ProjectMetric
              value={`${activeLayerCount}/${layerLabels.length}`}
              label="Layers"
            />
          </div>
        </motion.div>

        <WorkspaceSectionLabel className="mt-6">
          Source
        </WorkspaceSectionLabel>

        <div className="mt-3 rounded-[19px] border border-teal-100/[0.07] bg-[#0a1b26]/58 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.02)]">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">
              Research paragraph
            </p>

            <span className="font-mono text-[9px] text-slate-500">
              {sourceText.length} chars
            </span>
          </div>

          <p className="max-h-32 overflow-y-auto break-words pr-1 text-[12px] leading-[1.65] text-slate-300 selection:bg-teal-300/20 selection:text-teal-50">
            {sourceText}
          </p>
        </div>

        <WorkspaceSectionLabel className="mt-6">
          Biological layers
        </WorkspaceSectionLabel>

        <div className="mt-2.5 space-y-1">
          {layerLabels.map((layer, index) => {
            const active = layers[layer.key];
            const visual = entityVisuals[layer.key];

            return (
              <motion.button
                key={layer.key}
                type="button"
                onClick={() => toggleLayer(layer.key)}
                aria-pressed={active}
                aria-label={`${active ? "Hide" : "Show"} ${layer.label} layer`}
                initial={reduceMotion ? false : { opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.025 * index,
                  duration: 0.3,
                }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className={`group flex w-full items-center justify-between rounded-[14px] border px-2.5 py-2.5 text-left transition-all duration-300 ${
                  active
                    ? `${visual.activeBorder} ${visual.activeBg}`
                    : "border-transparent bg-transparent hover:border-white/[0.045] hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-white/[0.04] bg-black/[0.12]">
                    <span
                      className={`h-2 w-2 rounded-full ${visual.dot} ${
                        active ? visual.glow : "opacity-30"
                      }`}
                    />
                  </span>

                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[12px] font-semibold transition ${
                        active
                          ? "text-slate-100"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {layer.label}
                    </span>
                    <span className="mt-0.5 hidden truncate text-[9px] text-slate-600 2xl:block">
                      {layer.description}
                    </span>
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`relative h-[18px] w-8 shrink-0 rounded-full border transition-all duration-300 ${
                    active
                      ? "border-teal-200/[0.12] bg-teal-200/[0.13]"
                      : "border-white/[0.04] bg-white/[0.035]"
                  }`}
                >
                  <motion.span
                    animate={{
                      x: active ? 14 : 2,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 470,
                            damping: 29,
                          }
                    }
                    className={`absolute top-[3px] h-[10px] w-[10px] rounded-full ${
                      active
                        ? "bg-teal-200 shadow-[0_0_8px_rgba(153,246,228,.65)]"
                        : "bg-slate-600"
                    }`}
                  />
                </span>
              </motion.button>
            );
          })}
        </div>

        <WorkspaceSectionLabel className="mt-6">
          Project actions
        </WorkspaceSectionLabel>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={saveCurrentProject}
            className="group relative overflow-hidden rounded-[13px] border border-teal-200/[0.18] bg-[linear-gradient(135deg,rgba(94,234,212,.9),rgba(103,232,249,.88))] px-3 py-2.5 text-[11px] font-extrabold text-[#062029] shadow-[0_10px_26px_rgba(45,212,191,.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_13px_30px_rgba(45,212,191,.18)]"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.35)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
            <span className="relative">Save</span>
          </button>

          <button
            type="button"
            onClick={() => void restoreSavedProject()}
            disabled={!hasSavedProject}
            className="rounded-[13px] border border-teal-100/[0.075] bg-white/[0.025] px-3 py-2.5 text-[11px] font-semibold text-slate-200 transition duration-300 hover:border-teal-200/[0.14] hover:bg-teal-200/[0.045] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Restore
          </button>

          <button
            type="button"
            onClick={deleteSavedProject}
            disabled={!hasSavedProject}
            className="col-span-2 rounded-[13px] border border-rose-200/[0.075] bg-rose-200/[0.015] px-3 py-2.5 text-[10px] font-semibold text-rose-200/65 transition duration-300 hover:border-rose-200/[0.13] hover:bg-rose-200/[0.04] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-25"
          >
            Delete saved version
          </button>
        </div>

        {(saveMessage || apiError) && (
          <motion.div
            role={apiError ? "alert" : "status"}
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 rounded-[13px] border px-3 py-2.5 ${
              apiError
                ? "border-amber-200/[0.1] bg-amber-200/[0.035]"
                : "border-emerald-200/[0.1] bg-emerald-200/[0.035]"
            }`}
          >
            <p
              className={`text-[10px] leading-4 ${
                apiError ? "text-amber-200" : "text-emerald-200"
              }`}
            >
              {apiError || saveMessage}
            </p>
          </motion.div>
        )}
      </div>
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
    <div
      className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 ${className}`}
    >
      <span className="h-px w-3 bg-teal-200/[0.22]" />
      <span>{children}</span>
    </div>
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
    <div className="rounded-[12px] border border-white/[0.045] bg-black/[0.13] px-1.5 py-2 text-center">
      <p className="text-[13px] font-semibold tracking-[-0.02em] text-[#eefaf8]">
        {value}
      </p>
      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>
    </div>
  );
}