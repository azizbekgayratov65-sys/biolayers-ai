"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useEffect,
  useState,
} from "react";

const TITLES = [
  {
    title: "CELLULAR SIGNALING",
    subtitle:
      "Cells communicate through dynamic molecular signals.",
    gradient:
      "from-emerald-300 via-cyan-300 to-rose-300",
  },
  {
    title: "GENETIC ARCHITECTURE",
    subtitle:
      "Genes shape the instructions behind disease progression.",
    gradient:
      "from-violet-300 via-cyan-300 to-white",
  },
  {
    title: "MOLECULAR DYNAMICS",
    subtitle:
      "Proteins and pathways behave as a connected system.",
    gradient:
      "from-blue-300 via-emerald-300 to-amber-300",
  },
  {
    title: "METASTATIC CASCADE",
    subtitle:
      "Cancer progression emerges from layered biological interactions.",
    gradient:
      "from-fuchsia-300 via-orange-300 to-violet-400",
  },
  {
    title: "CONNECTED EVIDENCE",
    subtitle:
      "Biological mechanisms linked directly to scientific literature.",
    gradient:
      "from-blue-300 via-white to-cyan-300",
  },
];

export default function CinematicStageTitle() {
  const [activeIndex, setActiveIndex] =
    useState(2);

  useEffect(() => {
    function handlePointerMove(
      event: PointerEvent,
    ) {
      const progress = Math.min(
        Math.max(
          event.clientX / window.innerWidth,
          0,
        ),
        0.999,
      );

      setActiveIndex(
        Math.floor(progress * TITLES.length),
      );
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );
    };
  }, []);

  const activeTitle =
    TITLES[activeIndex];

  return (
    <div className="pointer-events-none absolute inset-0 z-[18] hidden overflow-hidden lg:block">
      <div className="absolute left-[44%] top-1/2 w-[54%] -translate-y-1/2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTitle.title}
            initial={{
              opacity: 0,
              x: 80,
              scale: 0.92,
              filter: "blur(24px)",
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              x: -80,
              scale: 1.08,
              filter: "blur(24px)",
            }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/35">
              Morph stage 0{activeIndex + 1}
            </p>

            <h2
              className={`mt-4 bg-gradient-to-r ${activeTitle.gradient} bg-clip-text text-[clamp(46px,6vw,108px)] font-semibold leading-[0.88] tracking-[-0.065em] text-transparent`}
            >
              {activeTitle.title}
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/45">
              {activeTitle.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}