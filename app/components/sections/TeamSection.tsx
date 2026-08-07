"use client";

import { motion } from "framer-motion";

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

export default function TeamSection() {
  return (
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
                  Akbarshoh Rustamov is a high school student interested in\n                  international business, trade and commerce. He serves as\n                  Co-Founder and Communications Lead of BioLayers AI.
                </p>

                <p className="mt-5 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">
                  He leads video editing, social media strategy, public\n                  presentations and project speaking, translating the\n                  platform’s scientific value into clear communication.
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