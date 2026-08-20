"use client";

import { motion } from "framer-motion";

type FocusExpandControlsProps = {
  demoMode: boolean;
  cinematicFocus: boolean;
  hasSelectedNode: boolean;
  expandingGraph: boolean;
  enterCinematicFocus: () => Promise<void>;
  exitCinematicFocus: () => Promise<void>;
  expandSelectedEntity: () => Promise<void>;
};

export default function FocusExpandControls({
  demoMode,
  cinematicFocus,
  hasSelectedNode,
  expandingGraph,
  enterCinematicFocus,
  exitCinematicFocus,
  expandSelectedEntity,
}: FocusExpandControlsProps) {
  return (
    <div
      data-export-ignore="true"
      className={`absolute left-4 z-30 hidden items-center gap-1.5 sm:flex ${
        demoMode ? "bottom-24" : "bottom-5"
      }`}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() =>
          cinematicFocus
            ? void exitCinematicFocus()
            : void enterCinematicFocus()
        }
        disabled={!hasSelectedNode}
        className={`rounded-[12px] border px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.09em] shadow-[0_12px_36px_rgba(1,8,15,.25)] backdrop-blur-2xl transition duration-300 ${
          cinematicFocus
            ? "border-rose-200/[0.15] bg-rose-200/[0.06] text-rose-100 hover:bg-rose-200/[0.09]"
            : "border-teal-200/[0.12] bg-[#0a0f14]/86 text-teal-100 hover:-translate-y-0.5 hover:bg-teal-200/[0.05]"
        } disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <span className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              cinematicFocus
                ? "bg-rose-300 shadow-[0_0_8px_rgba(253,164,175,.7)]"
                : "bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,.65)]"
            }`}
          />
          {cinematicFocus ? "Exit focus" : "Cinematic focus"}
        </span>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => void expandSelectedEntity()}
        disabled={!hasSelectedNode || expandingGraph}
        className="rounded-[12px] border border-sky-200/[0.12] bg-[#0a0f14]/86 px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.09em] text-sky-100 shadow-[0_12px_36px_rgba(1,8,15,.25)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-sky-200/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
      >
        <span className="flex items-center gap-2">
          <motion.span
            animate={
              expandingGraph
                ? { rotate: 360 }
                : { rotate: 0 }
            }
            transition={
              expandingGraph
                ? {
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }
                : undefined
            }
            className="text-[12px] text-sky-300"
          >
            ✦
          </motion.span>
          {expandingGraph ? "Expanding" : "Expand entity"}
        </span>
      </motion.button>
    </div>
  );
}