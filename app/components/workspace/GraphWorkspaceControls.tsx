"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

type LayoutDirection =
  | "TB"
  | "LR";

type GraphWorkspaceControlsProps = {
  demoMode: boolean;
  narrativeStepCount: number;
  layoutDirection: LayoutDirection;
  toggleDemoMode: () => Promise<void>;
  startNarrative: () => void;
  changeLayout: (
    direction: LayoutDirection,
  ) => Promise<void>;
  resetView: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (
    value: string,
  ) => void;
  searchError: string;
  setSearchError: (
    value: string,
  ) => void;
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
  const reduceMotion =
    Boolean(useReducedMotion());

  const errorMessage =
    searchError || exportError;

  return (
    <>
      {/* ================================================= */}
      {/* GRAPH STATUS                                     */}
      {/* ================================================= */}

      <div
        data-export-ignore="true"
        className="
          absolute
          left-4
          top-4
          z-20
          hidden
          sm:block
        "
      >
        <div
          className="
            rounded-[16px]
            border
            border-teal-100/[0.075]
            bg-[#0a0f14]/78
            px-3.5
            py-2.5
            shadow-[0_14px_42px_rgba(1,8,15,.24)]
            backdrop-blur-2xl
          "
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-teal-300
                shadow-[0_0_9px_rgba(77,141,255,.75)]
              "
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: [
                        0.55,
                        1,
                        0.55,
                      ],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-teal-300
              "
            >
              Knowledge graph
            </p>
          </div>

          <p
            className="
              mt-1.5
              text-[11px]
              text-slate-400
            "
          >
            Hover to isolate · click to inspect
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* TOP-RIGHT GRAPH CONTROLS                         */}
      {/* ================================================= */}

      <div
        data-export-ignore="true"
        className="
          absolute
          right-[112px]
          top-4
          z-20
          hidden
          items-center
          gap-1.5
          xl:flex
        "
      >
        <button
          type="button"
          onClick={() =>
            void toggleDemoMode()
          }
          aria-pressed={demoMode}
          className={`rounded-[12px] border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] shadow-[0_10px_30px_rgba(1,8,15,.18)] backdrop-blur-2xl transition duration-300 ${
            demoMode
              ? "border-rose-200/[0.18] bg-rose-200/[0.06] text-rose-100"
              : "border-sky-200/[0.12] bg-[#0a0f14]/78 text-sky-100 hover:-translate-y-0.5 hover:bg-sky-200/[0.05]"
          }`}
        >
          {demoMode
            ? "Exit demo"
            : "Demo"}
        </button>

        <button
          type="button"
          onClick={startNarrative}
          disabled={
            narrativeStepCount === 0
          }
          title={
            narrativeStepCount > 0
              ? "Play the current mechanism as a guided narrative"
              : "No mechanism narrative is available"
          }
          className="
            rounded-[12px]
            border
            border-teal-200/[0.13]
            bg-[#0a0f14]/78
            px-3
            py-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-teal-100
            shadow-[0_10px_30px_rgba(1,8,15,.18)]
            backdrop-blur-2xl
            transition
            duration-300
            hover:-translate-y-0.5
            hover:bg-teal-200/[0.05]
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          Mechanism
        </button>

        <div
          className="
            hidden
            rounded-[12px]
            border
            border-teal-100/[0.07]
            bg-[#0a0f14]/78
            p-1
            shadow-[0_10px_30px_rgba(1,8,15,.18)]
            backdrop-blur-2xl
            2xl:flex
          "
        >
          {(
            [
              [
                "TB",
                "Vertical",
              ],
              [
                "LR",
                "Horizontal",
              ],
            ] as const
          ).map(
            ([
              value,
              label,
            ]) => {
              const active =
                layoutDirection ===
                value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    void changeLayout(
                      value,
                    )
                  }
                  className={`relative rounded-[9px] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${
                    active
                      ? "text-teal-50"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="graph-layout-active"
                      className="
                        absolute
                        inset-0
                        rounded-[9px]
                        border
                        border-teal-200/[0.1]
                        bg-teal-200/[0.06]
                      "
                      transition={
                        reduceMotion
                          ? {
                              duration: 0,
                            }
                          : {
                              type: "spring",
                              stiffness: 420,
                              damping: 32,
                            }
                      }
                    />
                  )}

                  <span className="relative z-10">
                    {label}
                  </span>
                </button>
              );
            },
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            void resetView()
          }
          title="Fit the full graph into view"
          className="
            rounded-[12px]
            border
            border-teal-100/[0.07]
            bg-[#0a0f14]/78
            px-3
            py-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-slate-300
            shadow-[0_10px_30px_rgba(1,8,15,.18)]
            backdrop-blur-2xl
            transition
            duration-300
            hover:-translate-y-0.5
            hover:bg-teal-100/[0.035]
            hover:text-teal-50
          "
        >
          Fit
        </button>
      </div>

      {/* ================================================= */}
      {/* SEARCH / FOCUS BAR                               */}
      {/* ================================================= */}

      <div
        data-export-ignore="true"
        className="
          absolute
          bottom-5
          left-1/2
          z-30
          w-[min(82%,580px)]
          -translate-x-1/2
          sm:w-[min(72%,580px)]
        "
      >
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 8,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.35,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="
            group
            flex
            items-center
            rounded-[17px]
            border
            border-teal-100/[0.09]
            bg-[#0a0f14]/92
            p-1.5
            shadow-[0_22px_64px_rgba(1,8,15,.42)]
            backdrop-blur-2xl
            transition
            duration-300
            focus-within:border-teal-200/[0.2]
            focus-within:shadow-[0_24px_70px_rgba(13,148,136,.15)]
          "
        >
          <span
            aria-hidden="true"
            className="
              pl-3
              pr-1.5
              text-[15px]
              text-teal-200/60
            "
          >
            ⌕
          </span>

          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(
                event.target.value,
              );

              setSearchError("");
            }}
            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                void findEntity();
              }
            }}
            aria-label="Search biological entities in the graph"
            placeholder="Search cells, genes, proteins, pathways..."
            className="
              min-w-0
              flex-1
              bg-transparent
              px-2
              py-2.5
              text-[13px]
              font-medium
              text-slate-100
              outline-none
              placeholder:text-slate-500
            "
          />

          <button
            type="button"
            onClick={() =>
              void findEntity()
            }
            disabled={
              searchQuery.trim()
                .length === 0
            }
            className="
              group/focus
              relative
              overflow-hidden
              rounded-[11px]
              border
              border-teal-200/[0.18]
              bg-[linear-gradient(135deg,#8db2ff,#a15cff)]
              px-4
              py-2.5
              text-[11px]
              font-extrabold
              text-[#04070a]
              shadow-[0_8px_22px_rgba(77,141,255,.13)]
              transition
              duration-300
              hover:-translate-y-0.5
              disabled:cursor-not-allowed
              disabled:opacity-45
            "
          >
            <span
              aria-hidden="true"
              className="
                absolute
                inset-0
                translate-x-[-120%]
                bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)]
                transition-transform
                duration-700
                group-hover/focus:translate-x-[120%]
              "
            />

            <span className="relative">
              Focus
            </span>
          </button>
        </motion.div>

        {errorMessage && (
          <motion.p
            role="alert"
            aria-live="polite"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 4,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mx-auto
              mt-2
              w-fit
              max-w-full
              rounded-full
              border
              border-rose-200/[0.12]
              bg-rose-950/55
              px-3
              py-1.5
              text-center
              text-[10px]
              font-medium
              text-rose-200
              backdrop-blur-xl
            "
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    </>
  );
}