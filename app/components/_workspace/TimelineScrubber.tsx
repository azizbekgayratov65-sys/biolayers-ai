"use client";

import { motion } from "framer-motion";

export type TimelineStep = {
  id: string;
  title: string;
  relation: string;
};

type TimelineScrubberProps = {
  steps: TimelineStep[];
  currentIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
};

export default function TimelineScrubber({
  steps,
  currentIndex,
  isPlaying,
  onSelect,
}: TimelineScrubberProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div
      className="
        absolute
        bottom-4
        left-1/2
        z-[55]
        flex
        w-[min(90vw,480px)]
        -translate-x-1/2
        items-center
        gap-2
        rounded-2xl
        border
        border-white/[0.06]
        bg-[#0a0f14]/85
        px-4
        py-2.5
        shadow-[0_12px_36px_rgba(1,8,15,.4)]
        backdrop-blur-xl
      "
    >
      {/* progress track */}
      <div className="relative flex flex-1 items-center">
        {/* background line */}
        <div className="absolute inset-x-0 h-px bg-white/[0.08]" />

        {/* filled line */}
        <motion.div
          className="absolute left-0 h-px bg-gradient-to-r from-teal-400 to-violet-400"
          animate={{
            width: `${(currentIndex / Math.max(steps.length - 1, 1)) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* dots */}
        <div className="relative flex w-full justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelect(index)}
                title={step.title}
                className="
                  group
                  relative
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                "
              >
                {/* glow ring on active */}
                {isActive && (
                  <motion.span
                    layoutId="timeline-glow"
                    className="
                      absolute
                      h-5
                      w-5
                      rounded-full
                      bg-teal-400/20
                    "
                    animate={
                      isPlaying
                        ? {
                            scale: [1, 1.6, 1],
                            opacity: [0.3, 0.1, 0.3],
                          }
                        : undefined
                    }
                    transition={
                      isPlaying
                        ? {
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : undefined
                    }
                  />
                )}

                {/* dot */}
                <span
                  className={`
                    relative
                    z-10
                    h-2.5
                    w-2.5
                    rounded-full
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? "bg-teal-300 shadow-[0_0_10px_rgba(99,225,200,.6)] scale-125"
                        : isPast
                          ? "bg-teal-400/60"
                          : "bg-white/20 group-hover:bg-white/40"
                    }
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* step label */}
      <span className="ml-2 shrink-0 font-mono text-[9px] font-bold text-slate-400">
        {currentIndex + 1}/{steps.length}
      </span>
    </div>
  );
}
