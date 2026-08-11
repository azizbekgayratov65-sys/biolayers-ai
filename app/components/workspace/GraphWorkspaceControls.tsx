"use client";

type LayoutDirection = "TB" | "LR";

type GraphWorkspaceControlsProps = {
  demoMode: boolean;
  narrativeStepCount: number;
  layoutDirection: LayoutDirection;
  toggleDemoMode: () => Promise<void>;
  startNarrative: () => void;
  changeLayout: (direction: LayoutDirection) => Promise<void>;
  resetView: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchError: string;
  setSearchError: (value: string) => void;
  exportError: string;
  findEntity: () => Promise<void>;
};

export default function GraphWorkspaceControls({
  demoMode,
  narrativeStepCount,
  layoutDirection,
  toggleDemoMode,
  startNarrative,
  changeLayout,
  resetView,
  searchQuery,
  setSearchQuery,
  searchError,
  setSearchError,
  exportError,
  findEntity,
}: GraphWorkspaceControlsProps) {
  return (
    <>
      {/* Graph identity — top left */}
      <div
        data-export-ignore="true"
        className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-24px)] items-center gap-2 sm:left-5 sm:top-5"
      >
        <div className="rounded-[16px] border border-white/[0.09] bg-[#07101d]/85 px-3.5 py-2.5 shadow-[0_18px_55px_rgba(0,0,0,.32)] backdrop-blur-2xl sm:px-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Generated knowledge graph
          </p>

          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
            Hover to isolate relationships. Click to inspect.
          </p>
        </div>
      </div>

      {/* Graph actions — top right, deliberately leaving the far-right
          corner free for WorkspaceCanvas' 2D / 3D switch. */}
      <div
        data-export-ignore="true"
        className="absolute right-[118px] top-3 z-20 hidden max-w-[calc(100%-360px)] flex-wrap justify-end gap-1.5 xl:flex sm:top-5"
      >
        <button
          type="button"
          onClick={() => void toggleDemoMode()}
          className={`rounded-[13px] border px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] shadow-lg backdrop-blur-2xl transition ${
            demoMode
              ? "border-rose-300/20 bg-rose-300/[0.09] text-rose-100"
              : "border-violet-300/20 bg-[#07101d]/88 text-violet-100 hover:bg-violet-300/[0.08]"
          }`}
        >
          {demoMode ? "Exit demo" : "Demo"}
        </button>

        <button
          type="button"
          onClick={startNarrative}
          disabled={narrativeStepCount === 0}
          className="rounded-[13px] border border-cyan-300/20 bg-[#07101d]/88 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-cyan-100 shadow-lg backdrop-blur-2xl transition hover:bg-cyan-300/[0.08] disabled:opacity-35"
        >
          Mechanism
        </button>

        <div className="hidden rounded-[13px] border border-white/[0.09] bg-[#07101d]/88 p-1 shadow-lg backdrop-blur-2xl 2xl:flex">
          <button
            type="button"
            onClick={() => void changeLayout("TB")}
            className={`rounded-[9px] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] transition ${
              layoutDirection === "TB"
                ? "bg-white/[0.1] text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Vertical
          </button>

          <button
            type="button"
            onClick={() => void changeLayout("LR")}
            className={`rounded-[9px] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] transition ${
              layoutDirection === "LR"
                ? "bg-white/[0.1] text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Horizontal
          </button>
        </div>

        <button
          type="button"
          onClick={() => void resetView()}
          className="rounded-[13px] border border-white/[0.09] bg-[#07101d]/88 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-300 shadow-lg backdrop-blur-2xl transition hover:bg-white/[0.08]"
        >
          Fit
        </button>
      </div>

      {/* Search occupies the bottom center by itself. */}
      <div
        data-export-ignore="true"
        className="absolute bottom-4 left-1/2 z-30 w-[min(72%,520px)] -translate-x-1/2"
      >
        <div className="flex items-center rounded-[18px] border border-white/[0.1] bg-[#07101d]/94 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.46)] backdrop-blur-2xl">
          <span className="pl-3 pr-1.5 text-slate-600">
            ⌕
          </span>

          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void findEntity();
              }
            }}
            placeholder="Search cells, proteins, pathways..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
          />

          <button
            type="button"
            onClick={() => void findEntity()}
            className="rounded-[12px] bg-white px-4 py-2.5 text-xs font-bold text-slate-950"
          >
            Focus
          </button>
        </div>

        {(searchError || exportError) && (
          <p className="mx-auto mt-2 w-fit rounded-full border border-rose-300/15 bg-rose-950/70 px-3 py-1.5 text-[10px] text-rose-200 backdrop-blur-xl">
            {searchError || exportError}
          </p>
        )}
      </div>
    </>
  );
}