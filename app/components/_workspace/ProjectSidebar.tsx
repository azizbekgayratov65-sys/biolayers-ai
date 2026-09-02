"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { EntityType } from "../../lib/buildGraphFromText";

type LayerState = Record<EntityType, boolean>;

type ProjectToolbarProps = {
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
  shortLabel: string;
}> = [
  { key: "cell", label: "Cells", shortLabel: "Cell" },
  { key: "protein", label: "Proteins", shortLabel: "Prot" },
  { key: "gene", label: "Genes", shortLabel: "Gene" },
  { key: "pathway", label: "Pathways", shortLabel: "Path" },
  { key: "process", label: "Processes", shortLabel: "Proc" },
  { key: "disease", label: "Diseases", shortLabel: "Dis" },
  { key: "drug", label: "Drugs", shortLabel: "Drug" },
];

const layerDots: Record<EntityType, string> = {
  cell: "bg-[#2f6ef5]",
  protein: "bg-[#a78bfa]",
  gene: "bg-[#34d399]",
  pathway: "bg-[#fbbf24]",
  process: "bg-[#60a5fa]",
  disease: "bg-[#fb7185]",
  drug: "bg-[#f59e0b]",
};

export default function ProjectToolbar({
  demoMode,
  nodeCount,
  edgeCount,
  layers,
  toggleLayer,
  saveCurrentProject,
  restoreSavedProject,
  deleteSavedProject,
  hasSavedProject,
  saveMessage,
  apiError,
}: ProjectToolbarProps) {
  const reduceMotion = Boolean(useReducedMotion());

  if (demoMode) {
    return null;
  }

  return (
    <div
      className="
        relative
        z-20
        flex
        items-center
        gap-3
        border-b
        border-teal-100/[0.065]
        bg-[#070b10]/80
        px-4
        py-2
        backdrop-blur-[20px]
        lg:px-5
      "
    >
      {/* metrics */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-full border border-teal-100/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] font-bold text-slate-300">
          {nodeCount} nodes
        </span>
        <span className="rounded-full border border-teal-100/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] font-bold text-slate-300">
          {edgeCount} links
        </span>
      </div>

      <span className="hidden h-4 w-px bg-white/[0.06] sm:block" />

      {/* layer toggles — compact colored dots */}
      <div className="flex items-center gap-1">
        {layerLabels.map((layer) => {
          const active = layers[layer.key];

          return (
            <motion.button
              key={layer.key}
              type="button"
              onClick={() => toggleLayer(layer.key)}
              aria-pressed={active}
              aria-label={`${active ? "Hide" : "Show"} ${layer.label}`}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className={`
                flex
                h-7
                items-center
                gap-1.5
                rounded-full
                border
                px-2
                text-[9px]
                font-bold
                uppercase
                tracking-[0.08em]
                transition-all
                duration-200

                ${
                  active
                    ? "border-white/[0.1] bg-white/[0.06] text-slate-200"
                    : "border-transparent bg-transparent text-slate-600 hover:text-slate-400"
                }
              `}
            >
              <span
                className={`h-2 w-2 rounded-full ${layerDots[layer.key]} ${
                  active ? "shadow-[0_0_8px_rgba(255,255,255,.15)]" : "opacity-30"
                }`}
              />
              <span className="hidden xl:inline">{layer.shortLabel}</span>
            </motion.button>
          );
        })}
      </div>

      <span className="h-4 w-px bg-white/[0.06]" />

      {/* project actions */}
      <div className="ml-auto flex items-center gap-1.5">
        {(saveMessage || apiError) && (
          <span
            className={`hidden max-w-[160px] truncate text-[9px] font-medium sm:block ${
              apiError ? "text-amber-200" : "text-emerald-200"
            }`}
          >
            {apiError || saveMessage}
          </span>
        )}

        <button
          type="button"
          onClick={saveCurrentProject}
          className="
            rounded-full
            border
            border-teal-200/[0.14]
            bg-teal-200/[0.06]
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-teal-200
            transition
            duration-200
            hover:bg-teal-200/[0.1]
          "
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => void restoreSavedProject()}
          disabled={!hasSavedProject}
          className="
            rounded-full
            border
            border-white/[0.06]
            bg-white/[0.03]
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-slate-300
            transition
            duration-200
            hover:bg-white/[0.06]
            disabled:cursor-not-allowed
            disabled:opacity-25
          "
        >
          Restore
        </button>

        <button
          type="button"
          onClick={deleteSavedProject}
          disabled={!hasSavedProject}
          className="
            rounded-full
            border
            border-rose-200/[0.08]
            bg-rose-200/[0.03]
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-rose-200/60
            transition
            duration-200
            hover:border-rose-200/[0.14]
            hover:text-rose-200
            disabled:cursor-not-allowed
            disabled:opacity-20
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
}
