"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import BioScanLayer from "./components/hero/BioScanLayer";
import CancerScene from "./components/hero/CancerScene";
import CursorEnergyField from "./components/hero/CursorEnergyField";
import HeroContent from "./components/hero/HeroContent";
import MorphStageOverlay from "./components/hero/MorphStageOverlay";

type Capability = {
  eyebrow: string;
  title: string;
  text: string;
  label: string;
  gradient: string;
  glow: string;
  icon: string;
};

type FounderAchievement = {
  code: string;
  title: string;
  subtitle: string;
  gradient: string;
};

type CoFounderAchievement = {
  code: string;
  title: string;
  subtitle: string;
  metric: string;
  gradient: string;
};

const capabilities: Capability[] = [
  {
    eyebrow: "01",
    title: "Extract biology",
    text: "Identify cells, proteins, pathways, biological processes and disease mechanisms from complex oncology literature.",
    label: "ENTITY EXTRACTION",
    gradient: "from-cyan-300 via-blue-400 to-violet-400",
    glow: "rgba(34,211,238,.18)",
    icon: "⌁",
  },
  {
    eyebrow: "02",
    title: "Explore relationships",
    text: "Navigate connected biological knowledge graphs with interactive entities, mechanistic relationships and contextual layers.",
    label: "GRAPH INTELLIGENCE",
    gradient: "from-violet-300 via-fuchsia-400 to-cyan-300",
    glow: "rgba(168,85,247,.18)",
    icon: "◇",
  },
  {
    eyebrow: "03",
    title: "Connect evidence",
    text: "Surface PubMed studies, journals, authors, DOI records and supporting scientific evidence for every biological mechanism.",
    label: "EVIDENCE ENGINE",
    gradient: "from-fuchsia-300 via-rose-400 to-cyan-300",
    glow: "rgba(236,72,153,.18)",
    icon: "◎",
  },
];

const founderAchievements: FounderAchievement[] = [
  {
    code: "FOUNDER_01",
    title: "Founder & Product Builder",
    subtitle: "BioLayers AI",
    gradient: "from-amber-200 via-orange-400 to-red-400",
  },
  {
    code: "MAJOR_02",
    title: "AI-Driven Oncology",
    subtitle: "Computational research",
    gradient: "from-emerald-200 via-teal-300 to-cyan-400",
  },
  {
    code: "RESEARCH_03",
    title: "Cancer Biology Researcher",
    subtitle: "Tumor microenvironment",
    gradient: "from-lime-200 via-emerald-400 to-teal-400",
  },
  {
    code: "SPORT_04",
    title: "5X International Champion",
    subtitle: "Taekwon-do",
    gradient: "from-red-300 via-orange-400 to-amber-300",
  },
  {
    code: "LEADERSHIP_05",
    title: "Global Leadership",
    subtitle: "PIVOT Global Fellow — Top 30",
    gradient: "from-yellow-200 via-amber-400 to-orange-500",
  },
  {
    code: "DESIGN_06",
    title: "Scientific Visualization",
    subtitle: "Knowledge graph design",
    gradient: "from-cyan-200 via-blue-400 to-violet-400",
  },
];

const coFounderAchievements: CoFounderAchievement[] = [
  {
    code: "BUSINESS_01",
    title: "Import Business Experience",
    subtitle: "Assistant in an import company",
    metric: "1+ year",
    gradient: "from-emerald-200 via-teal-300 to-cyan-400",
  },
  {
    code: "MEETINGS_02",
    title: "Business Negotiations",
    subtitle: "Live translation and meeting assistance",
    metric: "20+ meetings",
    gradient: "from-cyan-200 via-blue-400 to-indigo-400",
  },
  {
    code: "CUSTOMERS_03",
    title: "Customer Research",
    subtitle: "Direct conversations in local bazaars",
    metric: "50+ customers",
    gradient: "from-lime-200 via-emerald-400 to-cyan-400",
  },
  {
    code: "MEDIA_04",
    title: "Digital Marketing",
    subtitle: "Social media and demand analysis",
    metric: "Digital reach",
    gradient: "from-violet-300 via-fuchsia-400 to-cyan-300",
  },
  {
    code: "SPEAKING_05",
    title: "Public Communication",
    subtitle: "Presentations and project speaking",
    metric: "Audience impact",
    gradient: "from-sky-200 via-cyan-400 to-emerald-300",
  },
  {
    code: "CONTENT_06",
    title: "Visual Storytelling",
    subtitle: "Video editing and product media",
    metric: "Creative lead",
    gradient: "from-blue-300 via-violet-400 to-fuchsia-400",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#01030a] text-white">
      <CancerScene />
      <BioScanLayer />

      {/* Global cinematic background */}
      <div className="pointer-events-none fixed inset-0 z-[8] bg-[radial-gradient(circle_at_68%_38%,transparent_0%,rgba(2,6,23,.12)_34%,rgba(2,6,23,.68)_74%,#01030a_100%)]" />

      <motion.div
        animate={{
          x: ["-8%", "8%", "-8%"],
          y: ["-5%", "7%", "-5%"],
          scale: [0.92, 1.12, 0.92],
          opacity: [0.13, 0.3, 0.13],
        }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed -left-[18vw] top-[8vh] z-[9] h-[58vw] w-[58vw] rounded-full bg-cyan-500/20 blur-[150px]"
      />

      <motion.div
        animate={{
          x: ["8%", "-7%", "8%"],
          y: ["7%", "-6%", "7%"],
          scale: [1.08, 0.9, 1.08],
          opacity: [0.12, 0.28, 0.12],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed -right-[20vw] top-[15vh] z-[9] h-[62vw] w-[62vw] rounded-full bg-violet-600/20 blur-[160px]"
      />

      <motion.div
        animate={{
          backgroundPosition: ["0px 0px", "72px 72px"],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none fixed inset-0 z-[9] opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.26) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.26) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      <motion.div
        animate={{
          y: ["-20vh", "120vh"],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none fixed left-0 top-0 z-[12] h-px w-full bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent shadow-[0_0_30px_rgba(103,232,249,.7)]"
      />

      <motion.div
        animate={{
          x: ["-20vw", "120vw"],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none fixed left-0 top-0 z-[12] h-full w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
      />

      {/* Supernatural navigation */}
      <motion.header
        initial={{
          y: -90,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-x-0 top-0 z-50"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent shadow-[0_0_26px_rgba(34,211,238,.8)]" />

        <div className="relative border-b border-cyan-300/[0.08] bg-[#02040d]/65 backdrop-blur-2xl">
          <motion.div
            animate={{
              x: ["-120%", "220%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute inset-y-0 w-48 bg-gradient-to-r from-transparent via-cyan-200/[0.06] to-transparent blur-xl"
          />

          <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-10 lg:px-16">
            <Link href="/" className="group relative flex items-center gap-3">
              <motion.div
                whileHover={{
                  rotate: 8,
                  scale: 1.1,
                }}
                className="relative"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute -inset-2 rounded-[18px] bg-[conic-gradient(from_0deg,transparent,rgba(34,211,238,.5),transparent,rgba(139,92,246,.45),transparent)] blur-md"
                />

                <span className="relative flex h-11 w-11 items-center justify-center rounded-[16px] border border-cyan-300/30 bg-[#03121a]/90 text-xs font-black tracking-wider text-cyan-100 shadow-[inset_0_0_20px_rgba(34,211,238,.08),0_0_32px_rgba(34,211,238,.18)]">
                  BL
                </span>
              </motion.div>

              <div>
                <motion.p
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
                  className="bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-[length:220%_220%] bg-clip-text text-sm font-black tracking-tight text-transparent"
                >
                  BioLayers AI
                </motion.p>

                <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.26em] text-slate-400 sm:block">
                  Cancer knowledge, connected
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <NavItem href="#workspace" label="Workspace" index="01" />
              <NavItem href="#capabilities" label="Capabilities" index="02" />
              <NavItem href="#team" label="Team" index="03" />
              <NavItem href="#about" label="About" index="04" />
            </nav>

            <motion.div
              whileHover={{
                scale: 1.035,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  opacity: [0.2, 0.7, 0.2],
                  scale: [0.96, 1.06, 0.96],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute -inset-2 rounded-[20px] bg-gradient-to-r from-cyan-400/20 via-violet-400/20 to-fuchsia-400/20 blur-xl"
              />

              <Link
                href="/explore"
                className="group relative flex items-center gap-3 overflow-hidden rounded-[17px] border border-white/15 bg-white/[0.055] px-4 py-3 text-xs font-bold text-white shadow-[inset_0_0_22px_rgba(255,255,255,.025),0_16px_50px_rgba(0,0,0,.28)] backdrop-blur-xl sm:px-5 sm:text-sm"
              >
                <motion.span
                  animate={{
                    x: ["-170%", "260%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 1.4,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md"
                />

                <span className="relative hidden sm:inline">Open workspace</span>
                <span className="relative sm:hidden">Open</span>

                <motion.span
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative text-cyan-200"
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section id="workspace" className="relative z-20 min-h-screen">
        <HeroContent />
        <MorphStageOverlay />
      </section>

      {/* Supernatural capabilities */}
      <section
        id="capabilities"
        className="relative z-40 overflow-hidden border-y border-cyan-300/[0.08] bg-[#01040c] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(6,182,212,.13),transparent_28%),radial-gradient(circle_at_90%_30%,rgba(139,92,246,.14),transparent_30%),radial-gradient(circle_at_50%_120%,rgba(236,72,153,.1),transparent_40%)]" />

        <motion.div
          animate={{
            backgroundPosition: ["0px 0px", "72px 72px"],
          }}
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

        <motion.div
          animate={{
            x: [-100, 100, -100],
            y: [-50, 60, -50],
            scale: [0.88, 1.18, 0.88],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-[140px]"
        />

        <motion.div
          animate={{
            x: [100, -100, 100],
            y: [50, -60, 50],
            scale: [1.12, 0.9, 1.12],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-48 top-10 h-[560px] w-[560px] rounded-full bg-violet-600/15 blur-[150px]"
        />

        <motion.div
          animate={{
            x: ["-20vw", "120vw"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent shadow-[0_0_30px_rgba(34,211,238,.65)]"
        />

        <div className="relative mx-auto max-w-[1450px]">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
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
                  animate={{
                    opacity: [0.35, 1, 0.35],
                    scale: [1, 1.6, 1],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_13px_#67e8f9]"
                />

                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-100">
                  Core intelligence systems
                </p>
              </div>

              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1] tracking-[-0.05em] text-white sm:text-5xl lg:text-[64px]">
                Research transformed into
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
                  className="block bg-gradient-to-r from-cyan-300 via-blue-400 via-violet-400 to-fuchsia-400 bg-[length:240%_240%] bg-clip-text text-transparent"
                >
                  an explorable living system.
                </motion.span>
              </h2>
            </div>

            <p className="max-w-md border-l border-violet-300/30 pl-5 text-sm font-medium leading-7 text-slate-300 sm:text-base">
              Every layer of BioLayers AI converts complex oncology literature
              into structured, interactive and evidence-connected
              intelligence.
            </p>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <CapabilityCard
                key={capability.eyebrow}
                {...capability}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section
        id="team"
        className="relative z-40 overflow-hidden border-y border-amber-300/10 bg-[#090502] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(245,158,11,.2),transparent_31%),radial-gradient(circle_at_84%_25%,rgba(239,68,68,.14),transparent_34%),radial-gradient(circle_at_52%_88%,rgba(16,185,129,.13),transparent_38%),linear-gradient(135deg,#090502_0%,#110802_45%,#07100b_100%)]" />

        <motion.div
          animate={{
            backgroundPosition: ["0px 0px", "80px 80px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251,191,36,.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251,191,36,.3) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto max-w-[1450px]">
          <motion.div
            initial={{
              opacity: 0,
              y: 34,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/25 bg-amber-300/[0.07] px-4 py-2 backdrop-blur-xl">
                <motion.span
                  animate={{
                    scale: [1, 1.7, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_14px_#fcd34d]"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-100">
                  Meet the team behind BioLayers AI
                </p>
              </div>

              <h2 className="mt-7 max-w-5xl text-4xl font-bold leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-[72px]">
                Research, technology and
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
                  className="block bg-gradient-to-r from-amber-200 via-orange-400 via-red-400 to-emerald-300 bg-[length:240%_240%] bg-clip-text text-transparent"
                >
                  human communication.
                </motion.span>
              </h2>
            </div>

            <p className="max-w-lg border-l border-amber-300/30 pl-5 text-sm font-medium leading-7 text-zinc-300 sm:text-base">
              BioLayers AI combines scientific research, development, product
              design, visual storytelling and public communication.
            </p>
          </motion.div>

          {/* Founder */}
          <div className="grid items-start gap-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-28">
            <motion.div
              initial={{
                opacity: 0,
                x: -55,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.18,
              }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mx-auto flex w-full max-w-[620px] flex-col gap-10"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: -25,
                  scale: 0.96,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative overflow-hidden rounded-[40px] border border-amber-300/20 bg-[#120b04]/75 px-6 pb-8 pt-7 shadow-[0_30px_110px_rgba(245,158,11,.16)] backdrop-blur-2xl sm:px-8"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/[0.08]"
                />

                <motion.div
                  animate={{
                    scale: [0.75, 1.3],
                    opacity: [0.35, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/25"
                />

                <p className="relative mb-9 text-center font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-amber-300/70">
                  Academic and athletic identity
                </p>

                <div className="relative grid grid-cols-1 place-items-center gap-9 sm:grid-cols-3 sm:gap-6">
                  <FounderLogo
                    src="/school-logo.png"
                    alt="Specialized School of Young Chemists and Biologists"
                    label="Abu Ali ibn Sina School"
                    index={0}
                    size="large"
                  />

                  <FounderLogo
                    src="/taekwondo-logo.png"
                    alt="International Taekwon-do Federation"
                    label="International Taekwon-do"
                    index={1}
                    size="medium"
                  />

                  <FounderLogo
                    src="/kickboxing-logo.png"
                    alt="WAKO Uzbekistan"
                    label="WAKO Uzbekistan"
                    index={2}
                    size="medium"
                  />
                </div>
              </motion.div>

              <div className="relative">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute -inset-8 rounded-[52px]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(251,191,36,.55), transparent, rgba(239,68,68,.42), transparent, rgba(52,211,153,.35), transparent)",
                    filter: "blur(30px)",
                  }}
                />

                <motion.div
                  whileHover={{
                    y: -8,
                    rotateY: 2,
                    rotateX: -2,
                  }}
                  className="relative overflow-hidden rounded-[40px] border border-amber-300/20 bg-[#120b04]/80 p-3 shadow-[0_45px_150px_rgba(245,158,11,.2)] backdrop-blur-2xl"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                  }}
                >
                  <div className="relative overflow-hidden rounded-[30px] bg-zinc-950">
                    <img
                      src="/founder-2026.png"
                      alt="Azizbek Gayratov, founder of BioLayers AI"
                      width={900}
                      height={1125}
                      loading="eager"
                      className="block h-auto w-full object-cover"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090502] via-[#090502]/10 to-amber-200/[0.03]" />

                    <motion.div
                      animate={{
                        y: ["-24%", "118%"],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-transparent via-amber-100/20 to-transparent blur-xl"
                    />

                    <CornerMarks />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                        Founder · Creator · Designer · Developer
                      </p>

                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        Azizbek Gayratov
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        AI-Driven Computational Oncology
                      </p>

                      <p className="mt-1 text-sm text-amber-200">
                        and Precision Medicine
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 55,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.18,
              }}
              transition={{
                duration: 1,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <p className="max-w-3xl text-lg font-medium leading-8 text-zinc-100 sm:text-xl">
                Azizbek Gayratov is the founder, creator, product designer and
                developer of BioLayers AI. His academic direction is AI-driven
                computational oncology and precision medicine.
              </p>

              <p className="mt-6 max-w-3xl text-sm font-medium leading-8 text-zinc-400 sm:text-base">
                He developed the product concept, software architecture,
                interactive biological knowledge graph, interface design,
                scientific visualizations, AI-assisted workflow and animated
                user experience.
              </p>

              <InfoPanel
                eyebrow="Academic direction"
                title="AI-Driven Computational Oncology"
                highlightedText="and Precision Medicine"
              />

              <div className="mt-8 rounded-[26px] border border-amber-300/15 bg-black/20 p-6 backdrop-blur-xl">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-amber-300">
                  Education
                </p>

                <h3 className="mt-3 text-lg font-bold leading-7 text-white">
                  Graduate of the Specialized School of Young Chemists and
                  Biologists named after Abu Ali ibn Sina
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Specialized preparation in chemistry, biology and scientific
                  research.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {founderAchievements.map((achievement, index) => (
                  <AchievementCard
                    key={achievement.code}
                    achievement={achievement}
                    index={index}
                  />
                ))}
              </div>

              <div className="mt-10 grid grid-cols-3 overflow-hidden rounded-[26px] border border-amber-300/15 bg-[#100903]/70 backdrop-blur-xl [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-amber-100/10">
                <FounderMetric
                  value="5X"
                  label="International champion"
                  delay={0}
                />

                <FounderMetric
                  value="20K+"
                  label="Learners reached"
                  delay={0.12}
                />

                <FounderMetric
                  value="AI × BIO"
                  label="Core direction"
                  delay={0.24}
                />
              </div>
            </motion.div>
          </div>

          <div className="relative my-28">
            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <motion.div
              animate={{
                x: ["-50vw", "50vw"],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_24px_rgba(110,231,183,.65)]"
            />
          </div>

          {/* Compact co-founder */}
          <motion.section
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[48px] border border-emerald-300/20 bg-[#030d0d]/90 p-5 shadow-[0_50px_180px_rgba(16,185,129,.17)] backdrop-blur-2xl sm:p-8 lg:p-12"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(16,185,129,.2),transparent_31%),radial-gradient(circle_at_86%_20%,rgba(6,182,212,.18),transparent_34%),radial-gradient(circle_at_55%_105%,rgba(59,130,246,.12),transparent_38%),linear-gradient(145deg,#020908_0%,#031311_50%,#020a12_100%)]" />

            <motion.div
              animate={{ backgroundPosition: ["0px 0px", "54px 54px"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(52,211,153,.32) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34,211,238,.24) 1px, transparent 1px)
                `,
                backgroundSize: "54px 54px",
              }}
            />

            <motion.div
              animate={{ x: [-60, 70, -60], y: [-35, 45, -35], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-40 -top-40 h-[430px] w-[430px] rounded-full bg-cyan-500/18 blur-[120px]"
            />

            <motion.div
              animate={{ y: ["-15%", "115%"] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-200/70 to-cyan-200/70 shadow-[0_0_28px_rgba(52,211,153,.7)]"
            />

            <div className="relative grid items-start gap-14 lg:grid-cols-[430px_minmax(0,1fr)] lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -45 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -9, rotateY: 2, rotateX: -2 }}
                className="relative mx-auto w-full max-w-[430px]"
                style={{ perspective: 1000, transformStyle: "preserve-3d" }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="pointer-events-none absolute -inset-9 rounded-[52px]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(52,211,153,.5), transparent, rgba(34,211,238,.43), transparent, rgba(59,130,246,.35), transparent)",
                    filter: "blur(31px)",
                  }}
                />

                <div className="relative overflow-hidden rounded-[40px] border border-emerald-300/25 bg-black/35 p-3 shadow-[0_40px_140px_rgba(16,185,129,.2)]">
                  <div className="relative overflow-hidden rounded-[30px] bg-[#020807]">
                    <img
                      src="/cofounder.png"
                      alt="Akbarshoh Rustamov, co-founder of BioLayers AI"
                      width={900}
                      height={1125}
                      loading="eager"
                      className="block h-auto w-full object-cover"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020b09] via-transparent to-cyan-200/[0.03]" />

                    <motion.div
                      animate={{ y: ["-22%", "120%"] }}
                      transition={{ duration: 4.3, repeat: Infinity, ease: "linear" }}
                      className="pointer-events-none absolute left-0 top-0 h-28 w-full bg-gradient-to-b from-transparent via-emerald-100/18 to-transparent blur-xl"
                    />

                    <div className="pointer-events-none absolute left-4 top-4 h-10 w-10 border-l border-t border-emerald-300/70" />
                    <div className="pointer-events-none absolute right-4 top-4 h-10 w-10 border-r border-t border-cyan-300/65" />
                    <div className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 border-b border-l border-blue-300/55" />
                    <div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b border-r border-emerald-300/70" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-300">
                        Co-Founder · Communications Lead
                      </p>
                      <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
                        Akbarshoh Rustamov
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">
                        International Business & Trade
                      </p>
                      <p className="mt-1 text-sm text-cyan-200">
                        Media · Presentations · Public Communication
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 45 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2.5">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.6, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]"
                  />
                  <p className="text-[9px] font-bold uppercase tracking-[0.27em] text-emerald-100">
                    Co-founder profile
                  </p>
                </div>

                <h2 className="mt-7 max-w-4xl text-3xl font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-4xl lg:text-[52px]">
                  Turning complex technology into
                  <motion.span
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-[length:220%_220%] bg-clip-text text-transparent"
                  >
                    stories people remember.
                  </motion.span>
                </h2>

                <motion.div
                  animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-5 h-px max-w-xl origin-left bg-gradient-to-r from-emerald-300 via-cyan-300 to-transparent"
                />

                <p className="mt-7 max-w-3xl text-base font-medium leading-8 text-zinc-100 sm:text-lg">
                  Akbarshoh Rustamov is a high school student interested in international business, trade and commerce. He serves as Co-Founder and Communications Lead of BioLayers AI.
                </p>

                <p className="mt-5 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">
                  He leads video editing, social media strategy, public presentations and project speaking, translating the platform’s scientific value into clear communication.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {coFounderAchievements.slice(0, 3).map((achievement, index) => (
                    <CoFounderAchievementCard
                      key={achievement.code}
                      achievement={achievement}
                      index={index}
                    />
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-[26px] border border-emerald-300/15 bg-black/25 backdrop-blur-xl [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-emerald-300/10">
                  <FounderMetric value="1+" label="Year in import business" delay={0} />
                  <FounderMetric value="20+" label="Business meetings" delay={0.12} />
                  <FounderMetric value="50+" label="Customer conversations" delay={0.24} />
                </div>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="relative z-40 overflow-hidden border-t border-white/[0.08] bg-[#020617] px-6 py-24 sm:px-10 lg:px-16"
      >
        <motion.div
          animate={{
            x: [-80, 80, -80],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[130px]"
        />

        <div className="relative mx-auto flex max-w-[1500px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
              Built for computational oncology
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
              Make complex cancer biology easier to see.
            </h2>

            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
              BioLayers transforms dense research paragraphs into visual,
              explorable biological systems by combining knowledge graphs,
              scientific search and evidence discovery.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Tag>React Flow</Tag>
            <Tag>Dagre</Tag>
            <Tag>PubMed</Tag>
            <Tag>Three.js</Tag>
            <Tag>Next.js</Tag>
          </div>
        </div>
      </section>

      <CursorEnergyField />
    </main>
  );
}

function NavItem({
  href,
  label,
  index,
}: {
  href: string;
  label: string;
  index: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{
        y: -2,
      }}
      className="group relative overflow-hidden rounded-xl px-4 py-3"
    >
      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0,
        }}
        whileHover={{
          opacity: 1,
          scaleX: 1,
        }}
        className="absolute inset-x-3 bottom-1 h-px origin-center bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#67e8f9]"
      />

      <motion.div
        initial={{
          opacity: 0,
        }}
        whileHover={{
          opacity: 1,
        }}
        className="absolute inset-0 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035]"
      />

      <span className="relative flex items-center gap-2">
        <span className="text-[8px] font-black tracking-wider text-cyan-300/35 transition group-hover:text-cyan-300">
          {index}
        </span>

        <span className="text-sm font-semibold text-slate-300 transition group-hover:text-white">
          {label}
        </span>
      </span>
    </motion.a>
  );
}

function CapabilityCard({
  eyebrow,
  title,
  text,
  label,
  gradient,
  glow,
  icon,
}: Capability) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 35,
        scale: 0.96,
      }}
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
        delay: Number(eyebrow) * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -12,
        scale: 1.018,
        rotateX: 2,
      }}
      className="group relative min-h-[360px] overflow-hidden rounded-[34px] border border-white/[0.09] bg-[#040817]/80 p-7 backdrop-blur-2xl sm:p-8"
      style={{
        boxShadow: `0 35px 110px ${glow}`,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <motion.div
        animate={{
          opacity: [0.08, 0.22, 0.08],
          scale: [0.9, 1.17, 0.9],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Number(eyebrow) * 0.4,
        }}
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${gradient} blur-[90px]`}
      />

      <motion.div
        animate={{
          x: ["-180%", "240%"],
          opacity: [0, 0.35, 0],
        }}
        transition={{
          duration: 5 + Number(eyebrow),
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
        }}
        className={`pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r ${gradient} blur-2xl`}
      />

      <motion.div
        animate={{
          backgroundPosition: [
            "0% 50%",
            "100% 50%",
            "0% 50%",
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r ${gradient} bg-[length:240%_240%]`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-mono text-[8px] font-black uppercase tracking-[0.28em] text-slate-500">
            SYSTEM / {label}
          </p>

          <motion.p
            animate={{
              opacity: [0.55, 1, 0.55],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className={`mt-3 bg-gradient-to-r ${gradient} bg-clip-text text-xs font-black tracking-[0.24em] text-transparent`}
          >
            {eyebrow}
          </motion.p>
        </div>

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]"
        >
          <motion.div
            animate={{
              rotate: -360,
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              rotate: {
                duration: 8,
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

      <div className="relative mt-9">
        <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
          <span>System readiness</span>
          <span>100%</span>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{
              width: "0%",
            }}
            whileInView={{
              width: "100%",
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1.8,
              delay: 0.4 + Number(eyebrow) * 0.15,
            }}
            className={`relative h-full rounded-full bg-gradient-to-r ${gradient}`}
          >
            <motion.div
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
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-6 font-mono text-[8px] uppercase tracking-[0.22em] text-white/[0.12]">
        BIOLAYERS / CORE
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-12 border-b border-l border-white/[0.06]" />
      <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r border-t border-white/[0.06]" />
    </motion.article>
  );
}

function FounderLogo({
  src,
  alt,
  label,
  index,
  size,
}: {
  src: string;
  alt: string;
  label: string;
  index: number;
  size: "medium" | "large";
}) {
  const paths = [
    {
      x: [-8, 8, -8],
      y: [-12, 8, -12],
      rotateY: [-8, 8, -8],
      rotateZ: [-2, 2, -2],
    },
    {
      x: [6, -7, 6],
      y: [8, -13, 8],
      rotateY: [7, -7, 7],
      rotateZ: [2, -2, 2],
    },
    {
      x: [-6, 9, -6],
      y: [-8, 12, -8],
      rotateY: [-6, 9, -6],
      rotateZ: [-2, 3, -2],
    },
  ];

  return (
    <motion.div
      animate={paths[index]}
      transition={{
        duration: 4.2 + index * 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.12,
        y: -18,
        rotateY: 0,
        rotateZ: 0,
      }}
      className="group relative flex w-full flex-col items-center pb-12"
      style={{
        transformStyle: "preserve-3d",
        perspective: 900,
      }}
    >
      <motion.div
        animate={{
          scale: [0.75, 1.35],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 2.5,
          delay: index * 0.45,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute -inset-5 rounded-[36px] border border-amber-300/25"
      />

      <motion.div
        animate={{
          rotate: index % 2 === 0 ? 360 : -360,
        }}
        transition={{
          duration: 9 + index * 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute -inset-3 rounded-[34px] border border-dashed border-amber-300/30"
      />

      <motion.div
        animate={{
          opacity: [0.2, 0.7, 0.2],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 2.7,
          delay: index * 0.3,
          repeat: Infinity,
        }}
        className="pointer-events-none absolute -inset-6 rounded-[40px] bg-amber-400/20 blur-2xl"
      />

      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-[30px] border border-amber-200/30 bg-white p-2 shadow-[0_22px_75px_rgba(245,158,11,.25)] sm:p-3 ${
          size === "large"
            ? "h-[130px] w-[130px] sm:h-[150px] sm:w-[150px] xl:h-[164px] xl:w-[164px]"
            : "h-[120px] w-[120px] sm:h-[138px] sm:w-[138px] xl:h-[150px] xl:w-[150px]"
        }`}
      >
        <img
          src={src}
          alt={alt}
          className="block h-full w-full object-contain"
        />

        <motion.div
          animate={{
            x: ["-160%", "210%"],
          }}
          transition={{
            duration: 4.2,
            delay: index * 0.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-lg"
        />
      </div>

      <motion.div
        animate={{
          opacity: [0.55, 1, 0.55],
        }}
        transition={{
          duration: 1.8,
          delay: index * 0.25,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-full mt-4 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/20 bg-[#120b04]/95 px-4 py-2 backdrop-blur-xl sm:block"
      >
        <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-amber-100">
          {label}
        </p>
      </motion.div>
    </motion.div>
  );
}

function CornerMarks() {
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 h-9 w-9 border-l border-t border-amber-300/65" />
      <div className="pointer-events-none absolute right-4 top-4 h-9 w-9 border-r border-t border-red-400/55" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-9 w-9 border-b border-l border-emerald-300/50" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-9 w-9 border-b border-r border-amber-300/65" />
    </>
  );
}

function InfoPanel({
  eyebrow,
  title,
  highlightedText,
}: {
  eyebrow: string;
  title: string;
  highlightedText: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      className="relative mt-8 overflow-hidden rounded-[26px] border border-emerald-300/15 bg-gradient-to-r from-emerald-300/[0.08] via-amber-300/[0.04] to-red-400/[0.06] p-6"
    >
      <motion.div
        animate={{
          x: ["-140%", "190%"],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-y-0 w-44 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl"
      />

      <p className="relative font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-300/60">
        {eyebrow}
      </p>

      <h3 className="relative mt-3 text-xl font-bold leading-8 text-white sm:text-2xl">
        {title}
        <span className="block text-amber-200">{highlightedText}</span>
      </h3>
    </motion.div>
  );
}

function AchievementCard({
  achievement,
  index,
}: {
  achievement: FounderAchievement;
  index: number;
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 24,
        scale: 0.95,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        delay: 0.1 + index * 0.065,
        duration: 0.58,
      }}
      whileHover={{
        y: -7,
        scale: 1.025,
      }}
      className="group relative overflow-hidden rounded-[22px] border border-amber-100/10 bg-[#120b04]/65 p-4 backdrop-blur-xl"
    >
      <motion.div
        animate={{
          x: ["-160%", "210%"],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 4.2 + index * 0.4,
          repeat: Infinity,
          repeatDelay: 1.1,
        }}
        className={`pointer-events-none absolute inset-y-0 w-28 bg-gradient-to-r ${achievement.gradient} blur-2xl`}
      />

      <p className="relative font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-600">
        {achievement.code}
      </p>

      <motion.p
        animate={{
          backgroundPosition: [
            "0% 50%",
            "100% 50%",
            "0% 50%",
          ],
        }}
        transition={{
          duration: 4.8 + index * 0.3,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`relative mt-2 bg-gradient-to-r ${achievement.gradient} bg-[length:240%_240%] bg-clip-text text-sm font-bold text-transparent`}
      >
        {achievement.title}
      </motion.p>

      <p className="relative mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {achievement.subtitle}
      </p>
    </motion.article>
  );
}

function CoFounderAchievementCard({
  achievement,
  index,
}: {
  achievement: CoFounderAchievement;
  index: number;
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 30,
        rotateX: -8,
        scale: 0.94,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -9,
        rotateX: 3,
        rotateY: index % 2 === 0 ? 3 : -3,
        scale: 1.025,
      }}
      className="group relative overflow-hidden rounded-[24px] border border-emerald-300/10 bg-black/25 p-5 backdrop-blur-xl"
      style={{
        transformStyle: "preserve-3d",
        perspective: 900,
      }}
    >
      <motion.div
        animate={{
          x: ["-160%", "210%"],
          opacity: [0, 0.45, 0],
        }}
        transition={{
          duration: 4.5 + index * 0.35,
          repeat: Infinity,
          repeatDelay: 1.1,
        }}
        className={`pointer-events-none absolute inset-y-0 w-28 bg-gradient-to-r ${achievement.gradient} blur-2xl`}
      />

      <motion.div
        animate={{
          opacity: [0.2, 0.85, 0.2],
        }}
        transition={{
          duration: 2.6 + index * 0.2,
          repeat: Infinity,
        }}
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${achievement.gradient}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-emerald-300/45">
            {achievement.code}
          </p>

          <motion.h3
            animate={{
              backgroundPosition: [
                "0% 50%",
                "100% 50%",
                "0% 50%",
              ],
            }}
            transition={{
              duration: 5 + index * 0.25,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`mt-2 bg-gradient-to-r ${achievement.gradient} bg-[length:220%_220%] bg-clip-text text-sm font-bold text-transparent`}
          >
            {achievement.title}
          </motion.h3>
        </div>

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 7 + index,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/15"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_11px_#6ee7b7]" />
        </motion.div>
      </div>

      <p className="relative mt-3 text-xs leading-6 text-zinc-400">
        {achievement.subtitle}
      </p>

      <p className="relative mt-4 text-lg font-bold text-white">
        {achievement.metric}
      </p>

      <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{
            width: "0%",
          }}
          whileInView={{
            width: `${58 + index * 7}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.2,
            delay: 0.25 + index * 0.1,
          }}
          className={`h-full rounded-full bg-gradient-to-r ${achievement.gradient}`}
        />
      </div>
    </motion.article>
  );
}

function FounderMetric({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.65,
        delay,
      }}
      className="relative px-2 py-7 text-center sm:px-6"
    >
      <motion.p
        animate={{
          backgroundPosition: [
            "0% 50%",
            "100% 50%",
            "0% 50%",
          ],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
        className="bg-gradient-to-r from-amber-200 via-orange-400 to-emerald-300 bg-[length:220%_220%] bg-clip-text text-xl font-bold text-transparent sm:text-3xl"
      >
        {value}
      </motion.p>

      <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.1em] text-zinc-400 sm:text-[10px] sm:tracking-[0.12em]">
        {label}
      </p>
    </motion.div>
  );
}

function CoFounderRole({
  code,
  title,
  text,
}: {
  code: string;
  title: string;
  text: string;
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      whileHover={{
        y: -7,
        scale: 1.018,
      }}
      className="group relative overflow-hidden rounded-[24px] border border-emerald-300/10 bg-black/25 p-5 backdrop-blur-xl"
    >
      <motion.div
        animate={{
          x: ["-150%", "200%"],
          opacity: [0, 0.35, 0],
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
        className="pointer-events-none absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-emerald-300/18 to-cyan-300/12 blur-xl"
      />

      <p className="relative font-mono text-[7px] uppercase tracking-[0.22em] text-emerald-300/45">
        {code}
      </p>

      <h3 className="relative mt-2 text-sm font-bold text-emerald-100">
        {title}
      </h3>

      <p className="relative mt-3 text-xs leading-6 text-zinc-400">
        {text}
      </p>
    </motion.article>
  );
}

function Tag({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.span
      whileHover={{
        y: -4,
        scale: 1.04,
      }}
      className="relative overflow-hidden rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl"
    >
      <motion.span
        animate={{
          x: ["-180%", "260%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-cyan-200/15 to-transparent"
      />

      <span className="relative">{children}</span>
    </motion.span>
  );
}