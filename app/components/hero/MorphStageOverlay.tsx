"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type MorphStage = {
  number: string;
  label: string;
  title: string;
  description: string;
  accent: string;
  glow: string;
  gradient: string;
};

const MORPH_STAGES: MorphStage[] = [
  {
    number: "01",
    label: "Cellular system",
    title: "CELLULAR SIGNALING",
    description: "Explore how cells communicate, adapt and reshape the tumor microenvironment.",
    accent: "text-emerald-300",
    glow: "bg-emerald-400/20",
    gradient: "from-emerald-300 via-cyan-300 to-blue-400",
  },
  {
    number: "02",
    label: "Genetic layer",
    title: "GENETIC ARCHITECTURE",
    description: "Move through genes, regulatory signals and molecular instructions driving disease.",
    accent: "text-violet-300",
    glow: "bg-violet-500/20",
    gradient: "from-violet-300 via-fuchsia-400 to-cyan-300",
  },
  {
    number: "03",
    label: "Molecular layer",
    title: "MOLECULAR DYNAMICS",
    description: "See proteins, pathways and biological processes as one connected living system.",
    accent: "text-cyan-300",
    glow: "bg-cyan-400/20",
    gradient: "from-cyan-300 via-blue-400 to-emerald-300",
  },
  {
    number: "04",
    label: "Disease progression",
    title: "METASTATIC CASCADE",
    description: "Trace how signaling, remodeling and cellular interactions support cancer progression.",
    accent: "text-orange-300",
    glow: "bg-orange-500/20",
    gradient: "from-orange-300 via-red-400 to-fuchsia-400",
  },
  {
    number: "05",
    label: "Scientific evidence",
    title: "CONNECTED EVIDENCE",
    description: "Connect biological mechanisms with publications, authors, DOI records and PubMed evidence.",
    accent: "text-blue-300",
    glow: "bg-blue-500/20",
    gradient: "from-blue-300 via-violet-400 to-fuchsia-400",
  },
];

function getStageIndex(pointerX: number) {
  const normalizedX = Math.min(Math.max(pointerX / window.innerWidth, 0), 0.999);
  return Math.min(MORPH_STAGES.length - 1, Math.floor(normalizedX * MORPH_STAGES.length));
}

export default function MorphStageOverlay() {
  const [stageIndex, setStageIndex] = useState(2);
  const [pointerProgress, setPointerProgress] = useState(0.5);

  useEffect(() => {
    let frame = 0;

    function handlePointerMove(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const normalizedProgress = Math.min(Math.max(event.clientX / window.innerWidth, 0), 1);
        setPointerProgress(normalizedProgress);
        setStageIndex(getStageIndex(event.clientX));
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const activeStage = MORPH_STAGES[stageIndex];

  return (
    <div className="pointer-events-none absolute inset-0 z-[19] hidden lg:block">
      <motion.div
        style={{ x: `${(pointerProgress - 0.5) * 22}px`, y: `${(pointerProgress - 0.5) * -10}px` }}
        className="absolute bottom-10 right-10 w-[405px]"
      >
        <motion.div
          animate={{ opacity: [0.16, 0.42, 0.16], scale: [0.92, 1.1, 0.92] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -inset-14 rounded-full blur-[90px] ${activeStage.glow}`}
        />

        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/45 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <motion.div
            animate={{ x: ["-150%", "230%"] }}
            transition={{ duration: 5, repeat: Infinity, repeatDelay: 1.1 }}
            className="pointer-events-none absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent blur-2xl"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full border border-dashed border-white/[0.07]"
          />

          <div className="relative flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeStage.number}
                initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                transition={{ duration: 0.4 }}
                className={`text-xs font-black uppercase tracking-[0.24em] ${activeStage.accent}`}
              >
                {activeStage.number} · {activeStage.label}
              </motion.p>
            </AnimatePresence>

            <motion.p
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="font-mono text-[11px] text-slate-400"
            >
              {Math.round(pointerProgress * 100).toString().padStart(2, "0")}%
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.title}
              initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -30, filter: "blur(12px)" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <motion.h2
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className={`mt-5 bg-gradient-to-r ${activeStage.gradient} bg-[length:220%_220%] bg-clip-text text-2xl font-black leading-tight tracking-[-0.04em] text-transparent`}
              >
                {activeStage.title}
              </motion.h2>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
                {activeStage.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="relative mt-6 flex items-center gap-2">
            {MORPH_STAGES.map((stage, index) => (
              <div key={stage.number} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{
                    width:
                      index < stageIndex
                        ? "100%"
                        : index === stageIndex
                          ? `${Math.min(Math.max(pointerProgress * MORPH_STAGES.length - stageIndex, 0), 1) * 100}%`
                          : "0%",
                  }}
                  transition={{ duration: 0.15 }}
                  className={`h-full rounded-full bg-gradient-to-r ${activeStage.gradient}`}
                />
              </div>
            ))}
          </div>

          <div className="relative mt-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Move horizontally
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>Cell</span>
              <span className="h-px w-8 bg-slate-700" />
              <span>Evidence</span>
            </div>
          </div>

          <motion.div
            animate={{ x: `${pointerProgress * 100}%` }}
            transition={{ type: "spring", stiffness: 110, damping: 22 }}
            className="absolute bottom-0 left-0 h-px w-16 -translate-x-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_rgba(103,232,249,0.9)]"
          />
        </div>
      </motion.div>
    </div>
  );
}