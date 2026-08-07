"use client";

import { motion, useReducedMotion } from "framer-motion";

type Capability = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  label: string;
  gradient: string;
  glow: string;
  icon: string;
};

const capabilities: Capability[] = [
  {
    id: "entity-extraction",
    eyebrow: "01",
    title: "Extract biology",
    text: "Identify cells, proteins, pathways, biological processes, and disease mechanisms from complex oncology literature.",
    label: "ENTITY EXTRACTION",
    gradient: "from-cyan-300 via-blue-400 to-violet-400",
    glow: "rgba(34, 211, 238, 0.18)",
    icon: "⌁",
  },
  {
    id: "graph-intelligence",
    eyebrow: "02",
    title: "Explore relationships",
    text: "Navigate connected biological knowledge graphs with interactive entities, mechanistic relationships, and contextual layers.",
    label: "GRAPH INTELLIGENCE",
    gradient: "from-violet-300 via-fuchsia-400 to-cyan-300",
    glow: "rgba(168, 85, 247, 0.18)",
    icon: "◇",
  },
  {
    id: "evidence-engine",
    eyebrow: "03",
    title: "Connect evidence",
    text: "Surface PubMed studies, journals, authors, DOI records, and supporting scientific evidence for every biological mechanism.",
    label: "EVIDENCE ENGINE",
    gradient: "from-fuchsia-300 via-rose-400 to-cyan-300",
    glow: "rgba(236, 72, 153, 0.18)",
    icon: "◎",
  },
];

export default function CapabilitiesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative z-40 overflow-hidden border-y border-cyan-300/[0.08] bg-[#01040c] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(6,182,212,.13),transparent_28%),radial-gradient(circle_at_90%_30%,rgba(139,92,246,.14),transparent_30%),radial-gradient(circle_at_50%_120%,rgba(236,72,153,.10),transparent_40%)]"
      />

      {/* Moving grid */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ["0px 0px", "72px 72px"],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,.18) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Cyan energy field */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [-100, 100, -100],
                y: [-50, 60, -50],
                scale: [0.88, 1.18, 0.88],
              }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-[140px]"
      />

      {/* Violet energy field */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [100, -100, 100],
                y: [50, -60, 50],
                scale: [1.12, 0.9, 1.12],
              }
        }
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-48 top-10 h-[560px] w-[560px] rounded-full bg-violet-600/15 blur-[150px]"
      />

      {/* Scanning line */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-20vw", "120vw"],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent shadow-[0_0_30px_rgba(34,211,238,.65)]"
      />

      <div className="relative mx-auto max-w-[1450px]">
        {/* Section header */}
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 30,
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
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-14 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.055] px-4 py-2 backdrop-blur-xl">
              <motion.span
                aria-hidden="true"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.35, 1, 0.35],
                        scale: [1, 1.6, 1],
                      }
                }
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_13px_#67e8f9]"
              />

              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-100">
                Core intelligence systems
              </p>
            </div>

            <h2
              id="capabilities-heading"
              className="mt-6 max-w-4xl text-4xl font-black leading-[1] tracking-[-0.05em] text-white sm:text-5xl lg:text-[64px]"
            >
              Research transformed into

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
                className="block bg-gradient-to-r from-cyan-300 via-blue-400 via-violet-400 to-fuchsia-400 bg-[length:240%_240%] bg-clip-text text-transparent"
              >
                an explorable living system.
              </motion.span>
            </h2>
          </div>

          <p className="max-w-md border-l border-violet-300/30 pl-5 text-sm font-medium leading-7 text-slate-300 sm:text-base">
            Every layer of BioLayers AI converts complex oncology literature
            into structured, interactive, evidence-connected intelligence.
          </p>
        </motion.div>

        {/* Capability cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              index={index}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type CapabilityCardProps = {
  capability: Capability;
  index: number;
  reduceMotion: boolean;
};

function CapabilityCard({
  capability,
  index,
  reduceMotion,
}: CapabilityCardProps) {
  const {
    eyebrow,
    title,
    text,
    label,
    gradient,
    glow,
    icon,
  } = capability;

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 35,
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
        amount: 0.2,
      }}
      transition={{
        duration: 0.75,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -10,
              scale: 1.015,
            }
      }
      className="group relative min-h-[360px] overflow-hidden rounded-[34px] border border-white/[0.09] bg-[#040817]/80 p-7 backdrop-blur-2xl sm:p-8"
      style={{
        boxShadow: `0 35px 110px ${glow}`,
      }}
    >
      {/* Ambient card glow */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.08, 0.22, 0.08],
                scale: [0.9, 1.17, 0.9],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.4,
        }}
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${gradient} blur-[90px]`}
      />

      {/* Passing energy beam */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-180%", "240%"],
                opacity: [0, 0.35, 0],
              }
        }
        transition={{
          duration: 5.5 + index,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "easeInOut",
        }}
        className={`pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r ${gradient} blur-2xl`}
      />

      {/* Animated top border */}
      <motion.div
        aria-hidden="true"
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
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r ${gradient} bg-[length:240%_240%]`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-mono text-[8px] font-black uppercase tracking-[0.28em] text-slate-500">
            SYSTEM / {label}
          </p>

          <motion.p
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.55, 1, 0.55],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`mt-3 bg-gradient-to-r ${gradient} bg-clip-text text-xs font-black tracking-[0.24em] text-transparent`}
          >
            {eyebrow}
          </motion.p>
        </div>

        {/* Capability icon */}
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]"
          aria-hidden="true"
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate: -360,
                    scale: [0.82, 1.08, 0.82],
                  }
            }
            transition={{
              rotate: {
                duration: 9,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className={`absolute inset-2 rounded-xl border border-dashed bg-gradient-to-r ${gradient} opacity-30`}
          />

          <span className="relative text-2xl font-light text-white">
            {icon}
          </span>
        </motion.div>
      </div>

      <h3 className="relative mt-10 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
        {title}
      </h3>

      <p className="relative mt-5 text-sm font-medium leading-7 text-slate-300">
        {text}
      </p>

      {/* Readiness */}
      <div className="relative mt-9">
        <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
          <span>System readiness</span>
          <span>100%</span>
        </div>

        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-label={`${title} system readiness`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
        >
          <motion.div
            initial={
              reduceMotion
                ? {
                    width: "100%",
                  }
                : {
                    width: "0%",
                  }
            }
            whileInView={{
              width: "100%",
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: reduceMotion ? 0 : 1.8,
              delay: reduceMotion ? 0 : 0.35 + index * 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative h-full rounded-full bg-gradient-to-r ${gradient}`}
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden="true"
                animate={{
                  x: ["-100%", "300%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white to-transparent"
              />
            )}
          </motion.div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-5 right-6 font-mono text-[8px] uppercase tracking-[0.22em] text-white/[0.12]"
      >
        BIOLAYERS / CORE
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-12 w-12 border-b border-l border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r border-t border-white/[0.06]"
      />
    </motion.article>
  );
}