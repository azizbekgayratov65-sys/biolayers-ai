"use client";

import { motion } from "framer-motion";

const achievements = [
  "SAT 1500",
  "5× International Taekwon-do Champion",
  "Black Belt I Dan",
  "Cancer Biology Researcher",
  "PIVOT Global Fellow — Top 30",
  "International Volunteer",
];

export default function FounderSection() {
  return (
    <section
      id="founder"
      className="relative z-20 overflow-hidden border-t border-white/[0.07] bg-[#020617] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_45%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.12),transparent_34%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[0.82fr_1.18fr]">
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

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_35px_120px_rgba(8,145,178,0.18)] backdrop-blur-2xl">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-slate-900 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/founder.png?v=3')",
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Founder & Builder
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Azizbek
                </h3>

                <p className="mt-1 text-sm text-slate-300">
                  Tashkent, Uzbekistan
                </p>
              </div>
            </div>
          </div>
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
            <span className="block bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              biology, AI and human impact.
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Azizbek is a student researcher and founder from Uzbekistan
            working at the intersection of cancer biology, artificial
            intelligence and scientific visualization.
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            He created BioLayers AI while researching cancer-associated
            fibroblasts and prostate cancer bone metastasis. His background
            also includes international leadership, community service and
            elite-level martial arts.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            {achievements.map((achievement, index) => (
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
                  delay: 0.15 + index * 0.07,
                  duration: 0.5,
                }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.07]"
              >
                {achievement}
              </motion.span>
            ))}
          </div>

          <div className="mt-10 max-w-2xl border-l border-cyan-300/50 pl-5">
            <p className="text-lg leading-8 text-slate-200">
              “Scientific knowledge should not remain trapped inside dense
              papers. It should be visible, connected and explorable.”
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Azizbek · Founder of BioLayers AI
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}