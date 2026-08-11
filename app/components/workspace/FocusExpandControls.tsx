"use client";

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
      className={`absolute left-5 z-30 flex flex-col items-start gap-1.5 ${
        demoMode ? "bottom-24" : "bottom-5"
      }`}
    >
      <button
        type="button"
        onClick={() =>
          cinematicFocus
            ? void exitCinematicFocus()
            : void enterCinematicFocus()
        }
        disabled={!hasSelectedNode}
        className={`w-[178px] rounded-[13px] border px-3.5 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.13em] shadow-xl backdrop-blur-2xl transition ${
          cinematicFocus
            ? "border-rose-300/20 bg-rose-300/[0.09] text-rose-100 hover:bg-rose-300/[0.15]"
            : "border-cyan-300/20 bg-[#07101d]/90 text-cyan-100 hover:bg-cyan-300/[0.09]"
        } disabled:cursor-not-allowed disabled:opacity-35`}
      >
        {cinematicFocus ? "Exit cinematic focus" : "Cinematic focus"}
      </button>

      <button
        type="button"
        onClick={() => void expandSelectedEntity()}
        disabled={!hasSelectedNode || expandingGraph}
        className="w-[178px] rounded-[13px] border border-violet-300/20 bg-[#07101d]/90 px-3.5 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-violet-100 shadow-xl backdrop-blur-2xl transition hover:bg-violet-300/[0.09] disabled:cursor-not-allowed disabled:opacity-35"
      >
        {expandingGraph ? "Expanding..." : "Expand entity"}
      </button>
    </div>
  );
}