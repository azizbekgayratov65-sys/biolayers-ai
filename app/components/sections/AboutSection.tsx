"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const technologies = [
  "React Flow",
  "Dagre",
  "PubMed",
  "Three.js",
  "Next.js",
] as const;

export default function AboutSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative z-40 overflow-hidden border-t border-white/[0.08] bg-[#020617] px-6 py-24 sm:px-10 lg:px-16"
    >
      {/* Ambient cyan glow */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [-80, 80, -80],
                opacity: [0.08, 0.2, 0.08],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[130px]"
      />

      {/* Secondary violet atmosphere */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [70, -60, 70],
                y: [0, 40, 0],
                opacity: [0.05, 0.13, 0.05],
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-40 bottom-[-140px] h-[420px] w-[420px] rounded-full bg-violet-500/15 blur-[140px]"
      />

      {/* Subtle grid */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ["0px 0px", "64px 64px"],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(103,232,249,.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,.16) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-[1500px]">
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 35,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between"
        >
          {/* Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.045] px-4 py-2 backdrop-blur-xl">
              <motion.span
                aria-hidden="true"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.35, 1, 0.35],
                        scale: [1, 1.55, 1],
                      }
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]"
              />

              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-200">
                Built for computational oncology
              </p>
            </div>

            <h2
              id="about-heading"
              className="mt-6 text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl"
            >
              Make complex cancer biology

              <motion.span
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        backgroundPosition: [
                          "0% 50%",
                          "100% 50%",
                          "0% 50%",
                        ],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-[length:220%_220%] bg-clip-text text-transparent"
              >
                easier to see.
              </motion.span>
            </h2>

            <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
              BioLayers transforms dense research paragraphs into visual,
              explorable biological systems by combining knowledge graphs,
              scientific search, and evidence discovery.
            </p>

            <div className="mt-8 h-px max-w-xl overflow-hidden bg-white/[0.06]">
              <motion.div
                aria-hidden="true"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x: ["-100%", "260%"],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: "easeInOut",
                }}
                className="h-full w-32 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent shadow-[0_0_18px_rgba(34,211,238,.7)]"
              />
            </div>
          </div>

          {/* Technology stack */}
          <div className="max-w-xl">
            <p className="mb-4 font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Technology stack
            </p>

            <div className="flex flex-wrap gap-3">
              {technologies.map((technology, index) => (
                <Tag
                  key={technology}
                  index={index}
                  reduceMotion={Boolean(reduceMotion)}
                >
                  {technology}
                </Tag>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type TagProps = {
  children: ReactNode;
  index: number;
  reduceMotion: boolean;
};

function Tag({
  children,
  index,
  reduceMotion,
}: TagProps) {
  return (
    <motion.span
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 12,
              scale: 0.96,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.55,
        delay: reduceMotion ? 0 : index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              scale: 1.04,
            }
      }
      className="group relative overflow-hidden rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/[0.07] hover:text-white"
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden="true"
          animate={{
            x: ["-180%", "260%"],
          }}
          transition={{
            duration: 5 + index * 0.35,
            repeat: Infinity,
            repeatDelay: 0.8,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-cyan-200/15 to-transparent"
        />
      )}

      <span className="relative">{children}</span>
    </motion.span>
  );
}