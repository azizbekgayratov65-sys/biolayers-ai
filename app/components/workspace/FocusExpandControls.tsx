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
              className={`absolute left-1/2 z-30 -translate-x-1/2 ${
                demoMode
                  ? "bottom-24"
                  : "bottom-5"
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
                className={`rounded-full border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] shadow-2xl backdrop-blur-2xl transition ${
                  cinematicFocus
                    ? "border-rose-300/20 bg-rose-300/[0.09] text-rose-100 hover:bg-rose-300/[0.15]"
                    : "border-cyan-300/20 bg-[#07101d]/88 text-cyan-100 hover:bg-cyan-300/[0.09]"
                } disabled:cursor-not-allowed disabled:opacity-35`}
              >
                {cinematicFocus
                  ? "Exit focus"
                  : "Cinematic focus"}
              </button>

              <button
                type="button"
                onClick={() =>
                  void expandSelectedEntity()
                }
                disabled={
                  !hasSelectedNode ||
                  expandingGraph
                }
                className="ml-2 rounded-full border border-violet-300/20 bg-[#07101d]/88 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-100 shadow-2xl backdrop-blur-2xl transition hover:bg-violet-300/[0.09] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {expandingGraph
                  ? "Expanding..."
                  : "Expand entity"}
              </button>
            </div>
  );
}