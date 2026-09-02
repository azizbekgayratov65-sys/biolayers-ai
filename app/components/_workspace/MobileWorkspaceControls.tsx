"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import type {
  EntityData,
} from "../../lib/buildGraphFromText";

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
  setWorkspaceView: (
    view: WorkspaceView,
  ) => void;
  selectedEntity: EntityData;
  selectedConnectionCount: number;
  resetView: () => Promise<void>;
};

const mobileViews: Array<{
  key: WorkspaceView;
  label: string;
}> = [
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
];

export default function MobileWorkspaceControls({
  demoMode,
  workspaceView,
  setWorkspaceView,
  selectedEntity,
  selectedConnectionCount,
  resetView,
}: MobileWorkspaceControlsProps) {
  const reduceMotion =
    Boolean(useReducedMotion());

  if (demoMode) {
    return null;
  }

  return (
    <>
      {/* ================================================= */}
      {/* MOBILE VIEW SWITCHER                             */}
      {/* ================================================= */}

      <nav
        aria-label="Workspace views"
        className="
          fixed
          bottom-[78px]
          left-3
          right-3
          z-[70]
          grid
          grid-cols-3
          gap-1
          rounded-[18px]
          border
          border-teal-100/[0.09]
          bg-[#070b10]/94
          p-1.5
          shadow-[0_20px_60px_rgba(1,8,15,.44)]
          backdrop-blur-2xl
          lg:hidden
          sm:grid-cols-6
        "
      >
        {mobileViews.map(
          (item) => {
            const active =
              workspaceView ===
              item.key;

            return (
              <button
                key={item.key}
                type="button"
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  setWorkspaceView(
                    item.key,
                  )
                }
                className={`
                  relative
                  overflow-hidden
                  rounded-[12px]
                  px-1
                  py-2.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  transition
                  duration-300
                  ${
                    active
                      ? "text-teal-50"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-workspace-active"
                    transition={
                      reduceMotion
                        ? {
                            duration: 0,
                          }
                        : {
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }
                    }
                    className="
                      absolute
                      inset-0
                      rounded-[12px]
                      border
                      border-teal-200/[0.13]
                      bg-[linear-gradient(145deg,rgba(77,141,255,.12),rgba(141,178,255,.05))]
                      shadow-[0_7px_20px_rgba(13,148,136,.08)]
                    "
                  />
                )}

                <span className="relative z-10">
                  {item.label}
                </span>
              </button>
            );
          },
        )}
      </nav>

      {/* ================================================= */}
      {/* MOBILE STATUS BAR                                */}
      {/* ================================================= */}

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
        }}
        className="
          fixed
          bottom-3
          left-3
          right-3
          z-[71]
          flex
          items-center
          justify-between
          gap-3
          rounded-[18px]
          border
          border-teal-100/[0.09]
          bg-[#070b10]/94
          px-4
          py-3
          shadow-[0_20px_60px_rgba(1,8,15,.44)]
          backdrop-blur-2xl
          lg:hidden
        "
      >
        <div className="min-w-0">
          <p
            className="
              truncate
              text-xs
              font-semibold
              text-teal-50
            "
          >
            {selectedEntity.label}
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-teal-200/65
            "
          >
            {selectedEntity.type}
            {" · "}
            {selectedConnectionCount}
            {" "}
            {selectedConnectionCount ===
            1
              ? "link"
              : "links"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void resetView()
          }
          title="Fit the graph into view"
          className="
            shrink-0
            rounded-[12px]
            border
            border-teal-100/[0.09]
            bg-teal-100/[0.025]
            px-3
            py-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-slate-300
            transition
            duration-300
            hover:border-teal-200/[0.16]
            hover:bg-teal-200/[0.05]
            hover:text-teal-50
          "
        >
          Fit graph
        </button>
      </motion.div>
    </>
  );
}