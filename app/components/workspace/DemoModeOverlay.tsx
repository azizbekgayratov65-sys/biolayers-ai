"use client";

import { AnimatePresence, motion } from "framer-motion";

export type DemoScene =
  | "problem"
  | "mechanism"
  | "evidence"
  | "cells"
  | "vision";

type DemoModeOverlayProps = {
  demoMode: boolean;
  demoScene: DemoScene;
  activateDemoScene: (scene: DemoScene) => void;
};

export default function DemoModeOverlay({
  demoMode,
  demoScene,
  activateDemoScene,
}: DemoModeOverlayProps) {
  return (
            <AnimatePresence>
              {demoMode && (
                <>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -18,
                    }}
                    className="pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2 text-center"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.42em] text-cyan-300">
                      BioLayers AI
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                      Biomedical knowledge,
                      connected.
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 24,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 24,
                    }}
                    className="absolute bottom-6 left-1/2 z-50 w-[min(94vw,760px)] -translate-x-1/2 rounded-[22px] border border-white/[0.1] bg-[#050814]/88 p-2 shadow-[0_24px_90px_rgba(0,0,0,.48)] backdrop-blur-3xl"
                  >
                    <div className="grid grid-cols-5 gap-1.5">
                      {(
                        [
                          [
                            "problem",
                            "Problem",
                          ],
                          [
                            "mechanism",
                            "Mechanism",
                          ],
                          [
                            "evidence",
                            "Evidence",
                          ],
                          [
                            "cells",
                            "Cell Atlas",
                          ],
                          [
                            "vision",
                            "Vision",
                          ],
                        ] as Array<
                          [
                            DemoScene,
                            string,
                          ]
                        >
                      ).map(
                        ([scene, label]) => (
                          <button
                            key={scene}
                            type="button"
                            onClick={() =>
                              activateDemoScene(
                                scene,
                              )
                            }
                            className={`rounded-[15px] px-2 py-3 text-[8px] font-bold uppercase tracking-[0.1em] transition sm:text-[10px] ${
                              demoScene ===
                              scene
                                ? "bg-gradient-to-r from-[#57ffa0] via-[#4d8dff] to-[#a15cff] text-slate-950"
                                : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
  );
}