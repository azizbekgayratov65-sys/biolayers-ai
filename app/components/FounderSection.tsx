"use client";

import { motion } from "framer-motion";

const achievements = [
  "5X International Taekwon-do Champion",
  "Black Belt I Dan",
  "Cancer Biology Researcher",
  "PIVOT Global Fellow — Top 30",
  "International Volunteer",
  "Founder of BioLayers AI",
];

export default function FounderSection() {
  return (
    <section
      id="founder"
      className="relative z-20 overflow-hidden border-t border-white/[0.07] bg-[#020617] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_45%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.12),transparent_34%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:64px_64px]" />

      <motion.div
        animate={{
          x: ["-12%", "12%", "-12%"],
          y: ["-8%", "10%", "-8%"],
          scale: [0.9, 1.15, 0.9],
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-48 top-24 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[140px]"
      />

      <motion.div
        animate={{
          x: ["10%", "-10%", "10%"],
          y: ["8%", "-10%", "8%"],
          scale: [1.1, 0.88, 1.1],
          opacity: [0.07, 0.17, 0.07],
        }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-52 bottom-10 h-[460px] w-[460px] rounded-full bg-violet-500/20 blur-[150px]"
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
        <motion.div
          initial={{
            opacity: 0,
            x: -40,
            filter: "blur(16px)",
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative mx-auto w-full max-w-[460px]"
        >
          <div className="pointer-events-none absolute -inset-8 rounded-full bg-cyan-400/10 blur-[90px]" />

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute -inset-6 rounded-[48px]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(34,211,238,.45), transparent, rgba(168,85,247,.45), transparent, rgba(236,72,153,.35), transparent)",
              filter: "blur(26px)",
            }}
          />

          <motion.div
            whileHover={{
              y: -8,
              rotateY: 2,
              rotateX: -2,
            }}
            className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_35px_120px_rgba(8,145,178,0.18)] backdrop-blur-2xl"
            style={{
              transformStyle: "preserve-3d",
              perspective: 1000,
            }}
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-slate-900 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('/founder-2026.png')",
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

              <motion.div
                animate={{
                  y: ["-30%", "125%"],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-transparent via-cyan-100/20 to-transparent blur-xl"
              />

              <div className="pointer-events-none absolute left-5 top-5 h-8 w-8 border-l border-t border-cyan-300/50" />
              <div className="pointer-events-none absolute right-5 top-5 h-8 w-8 border-r border-t border-violet-300/50" />
              <div className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 border-b border-l border-fuchsia-300/50" />
              <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 border-b border-r border-cyan-300/50" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Founder · Creator · Designer · Developer
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  Azizbek Gayratov
                </h3>

                <p className="mt-2 text-sm font-medium text-slate-200">
                  AI-Driven Computational Oncology
                </p>

                <p className="mt-1 text-sm text-violet-200">
                  and Precision Medicine
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Tashkent, Uzbekistan
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 40,
            filter: "blur(16px)",
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Meet the founder
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Building at the intersection of
            <motion.span
              animate={{
                backgroundPosition: [
                  "0% 50%",
                  "100% 50%",
                  "0% 50%",
                ],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              className="block bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-[length:220%_220%] bg-clip-text text-transparent"
            >
              biology, AI and human impact.
            </motion.span>
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Azizbek Gayratov is the founder,
            creator, product designer and developer
            of BioLayers AI. His academic direction
            focuses on AI-driven computational
            oncology and precision medicine.
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            He created BioLayers AI while
            researching cancer-associated
            fibroblasts and prostate cancer bone
            metastasis. He developed the product
            concept, interface, biological knowledge
            graph, scientific visualizations,
            AI-assisted workflow and animated user
            experience.
          </p>

          <div className="mt-8 rounded-[26px] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Education
            </p>

            <h3 className="mt-3 text-lg font-semibold leading-7 text-white">
              Graduate of the Specialized School of
              Young Chemists and Biologists named
              after Abu Ali ibn Sina
            </h3>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            {achievements.map(
              (achievement, index) => (
                <motion.span
                  key={achievement}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay:
                      0.15 + index * 0.07,
                    duration: 0.5,
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.03,
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.07]"
                >
                  {achievement}
                </motion.span>
              ),
            )}
          </div>

          <div className="mt-10 max-w-2xl border-l border-cyan-300/50 pl-5">
            <p className="text-lg leading-8 text-slate-200">
              “Scientific knowledge should not
              remain trapped inside dense papers. It
              should be visible, connected and
              explorable.”
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Azizbek Gayratov · Founder of
              BioLayers AI
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}