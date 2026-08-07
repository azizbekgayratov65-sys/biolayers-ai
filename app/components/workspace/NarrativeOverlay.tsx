"use client";

import { AnimatePresence, motion } from "framer-motion";

export type NarrativeStep = {
  id: string;
  nodeId: string;
  edgeId: string | null;
  title: string;
  relation: string;
  explanation: string;
};

type NarrativeOverlayProps = {
  narrativeOpen: boolean;
  activeNarrativeStep: NarrativeStep | undefined;
  narrativeIndex: number;
  narrativeSteps: NarrativeStep[];
  narrativePlaying: boolean;
  demoMode: boolean;
  closeNarrative: () => Promise<void>;
  previousNarrativeStep: () => void;
  pauseNarrative: () => void;
  resumeNarrative: () => void;
  nextNarrativeStep: () => void;
  restartNarrative: () => void;
  enterDemoMode: () => void;
};

export default function NarrativeOverlay({
  narrativeOpen,
  activeNarrativeStep,
  narrativeIndex,
  narrativeSteps,
  narrativePlaying,
  demoMode,
  closeNarrative,
  previousNarrativeStep,
  pauseNarrative,
  resumeNarrative,
  nextNarrativeStep,
  restartNarrative,
  enterDemoMode,
}: NarrativeOverlayProps) {
  return (
            <AnimatePresence>
              {narrativeOpen &&
                activeNarrativeStep && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 28,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 28,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.42,
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1,
                    ],
                  }}
                  className={`absolute z-[60] w-[min(92vw,560px)] rounded-[28px] border border-white/[0.11] bg-[#050814]/92 p-5 shadow-[0_28px_100px_rgba(0,0,0,.52)] backdrop-blur-3xl sm:p-6 ${
                    demoMode
                      ? "bottom-28 left-6"
                      : "bottom-20 left-1/2 -translate-x-1/2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                        Mechanism story ·{" "}
                        {narrativeIndex + 1}/
                        {
                          narrativeSteps.length
                        }
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">
                        {
                          activeNarrativeStep.title
                        }
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void closeNarrative()
                      }
                      className="rounded-[12px] border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 rounded-[17px] border border-cyan-300/12 bg-cyan-300/[0.035] px-4 py-3">
                    <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-cyan-300/65">
                      Current relationship
                    </p>
                    <p className="mt-2 text-sm font-semibold text-cyan-100">
                      {
                        activeNarrativeStep.relation
                      }
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {
                      activeNarrativeStep.explanation
                    }
                  </p>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      animate={{
                        width: `${
                          ((narrativeIndex +
                            1) /
                            Math.max(
                              narrativeSteps.length,
                              1,
                            )) *
                          100
                        }%`,
                      }}
                      transition={{
                        duration: 0.45,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={
                        previousNarrativeStep
                      }
                      disabled={
                        narrativeIndex === 0
                      }
                      className="rounded-[13px] border border-white/10 px-2 py-2.5 text-[9px] font-bold uppercase text-slate-400 disabled:opacity-30"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={
                        narrativePlaying
                          ? pauseNarrative
                          : resumeNarrative
                      }
                      className="rounded-[13px] bg-gradient-to-r from-cyan-300 to-violet-300 px-2 py-2.5 text-[9px] font-black uppercase text-slate-950"
                    >
                      {narrativePlaying
                        ? "Pause"
                        : "Play"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        nextNarrativeStep
                      }
                      disabled={
                        narrativeIndex >=
                        narrativeSteps.length -
                          1
                      }
                      className="rounded-[13px] border border-white/10 px-2 py-2.5 text-[9px] font-bold uppercase text-slate-400 disabled:opacity-30"
                    >
                      Next
                    </button>

                    <button
                      type="button"
                      onClick={
                        restartNarrative
                      }
                      className="rounded-[13px] border border-white/10 px-2 py-2.5 text-[9px] font-bold uppercase text-slate-400"
                    >
                      Restart
                    </button>

                    <button
                      type="button"
                      onClick={enterDemoMode}
                      className="rounded-[13px] border border-violet-300/15 bg-violet-300/[0.05] px-2 py-2.5 text-[9px] font-bold uppercase text-violet-200"
                    >
                      Fullscreen
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
  );
}