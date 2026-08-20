"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type Stage = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  x: number;
  y: number;
  color: string;
  metric: string;
  details: string[];
};

const stages: Stage[] = [
  {
    id: "primary",
    title: "Primary Tumor",
    subtitle: "Prostate",
    description:
      "Tumor cells acquire invasive behavior and remodel the local microenvironment.",
    x: 10,
    y: 58,
    color: "#fb7185",
    metric: "Local invasion",
    details: ["CAF activation", "ECM remodeling", "EMT-like state"],
  },
  {
    id: "intravasation",
    title: "Intravasation",
    subtitle: "Vascular entry",
    description:
      "Cancer cells cross the vascular boundary and enter systemic circulation.",
    x: 28,
    y: 36,
    color: "#f59e0b",
    metric: "Vascular access",
    details: ["VEGF signaling", "Matrix degradation", "Endothelial escape"],
  },
  {
    id: "ctc",
    title: "Circulating Tumor Cells",
    subtitle: "Bloodstream",
    description:
      "Circulating tumor cells survive shear stress, immune pressure, and anoikis.",
    x: 46,
    y: 61,
    color: "#a15cff",
    metric: "Circulatory survival",
    details: ["Platelet shielding", "Immune evasion", "Stress adaptation"],
  },
  {
    id: "homing",
    title: "Bone Homing",
    subtitle: "Bone marrow niche",
    description:
      "Tumor cells migrate toward bone-associated chemokine and adhesion signals.",
    x: 65,
    y: 33,
    color: "#a78bfa",
    metric: "Bone tropism",
    details: ["CXCL12/CXCR4", "Integrins", "Endothelial adhesion"],
  },
  {
    id: "colonization",
    title: "Metastatic Colonization",
    subtitle: "Bone metastasis",
    description:
      "Disseminated tumor cells adapt to the bone niche and establish a metastatic lesion.",
    x: 84,
    y: 59,
    color: "#34d399",
    metric: "Colonization",
    details: ["Dormancy escape", "Osteomimicry", "Niche remodeling"],
  },
];

const signals = [
  { label: "TGF-β", source: 0, target: 1, color: "#f59e0b" },
  { label: "VEGF", source: 0, target: 1, color: "#34d399" },
  { label: "CXCL12", source: 3, target: 4, color: "#a78bfa" },
  { label: "CXCR4", source: 2, target: 3, color: "#a15cff" },
];

export default function MetastaticRouteExplorer() {
  const [selectedStageId, setSelectedStageId] = useState("primary");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedStageId) ?? stages[0],
    [selectedStageId],
  );

  const runJourney = () => {
    if (playing) return;

    setPlaying(true);
    setProgress(0);
    setSelectedStageId(stages[0].id);

    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;

      setProgress(index);

      if (index < stages.length) {
        setSelectedStageId(stages[index].id);
      }

      if (index >= stages.length - 1) {
        window.clearInterval(interval);
        setPlaying(false);
      }
    }, 850);
  };

  const resetJourney = () => {
    setPlaying(false);
    setProgress(0);
    setSelectedStageId(stages[0].id);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030507] text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-[1720px] px-4 pb-20 pt-32 md:px-8">
        <header className="mb-6 flex flex-col gap-6 rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-300 shadow-[0_0_16px_rgba(253,164,175,.9)]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-rose-200/70">
                BioLayers Metastatic Intelligence
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Metastatic Route Explorer
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
              Follow the biological journey from a primary prostate tumor to
              circulation, bone homing, and metastatic colonization.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={runJourney}
              disabled={playing}
              className="relative overflow-hidden rounded-xl border border-rose-300/20 bg-rose-300/[0.08] px-5 py-3 text-xs font-medium text-rose-100 transition hover:bg-rose-300/[0.14]"
            >
              <span className="relative z-10">
                {playing ? "Tracing route..." : "Run metastatic journey"}
              </span>

              {playing && (
                <motion.div
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: [-80, 280],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </button>

            <button
              onClick={resetJourney}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-xs text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            >
              Reset
            </button>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.28fr_.72fr]">
          <section className="relative min-h-[780px] overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#040812]/88 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                  Metastatic trajectory
                </p>

                <h2 className="mt-1 text-xl font-medium">
                  Prostate → Bone
                </h2>
              </div>

              <div className="font-mono text-[10px] text-white/25">
                MODEL: PRAD-BONE-01
              </div>
            </div>

            <div className="relative h-[630px] overflow-hidden">
              <RouteMap
                selectedStageId={selectedStageId}
                progress={progress}
                onSelect={setSelectedStageId}
              />

              <div className="absolute left-5 top-5 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                  Route stage
                </div>

                <div className="mt-1 font-mono text-xs text-white/60">
                  {progress + 1}/{stages.length}
                </div>
              </div>

              <div className="absolute right-5 top-5 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 text-right backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                  Destination
                </div>

                <div className="mt-1 font-mono text-xs text-emerald-300">
                  BONE NICHE
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-black/25 p-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <MiniMetric label="Invasion" value="88%" />
                <MiniMetric label="CTC survival" value="62%" />
                <MiniMetric label="Bone tropism" value="84%" />
                <MiniMetric label="Colonization" value="73%" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={selectedStage.id}
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -12,
                }}
                className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-6 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                      Selected stage
                    </div>

                    <h2 className="mt-2 text-3xl font-semibold">
                      {selectedStage.title}
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      {selectedStage.subtitle}
                    </p>
                  </div>

                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: selectedStage.color,
                      boxShadow: `0 0 18px ${selectedStage.color}`,
                    }}
                  />
                </div>

                <p className="mt-6 text-sm leading-7 text-white/45">
                  {selectedStage.description}
                </p>

                <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                    Dominant process
                  </div>

                  <div
                    className="mt-2 text-lg font-semibold"
                    style={{
                      color: selectedStage.color,
                    }}
                  >
                    {selectedStage.metric}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {selectedStage.details.map((detail) => (
                    <div
                      key={detail}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: selectedStage.color,
                        }}
                      />

                      <span className="text-xs text-white/55">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            </AnimatePresence>

            <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-6 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                Molecular signaling
              </div>

              <h2 className="mt-2 text-xl font-medium">
                Route Drivers
              </h2>

              <div className="mt-5 space-y-3">
                {signals.map((signal) => (
                  <article
                    key={signal.label}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className="font-mono text-xs font-semibold"
                          style={{
                            color: signal.color,
                          }}
                        >
                          {signal.label}
                        </div>

                        <div className="mt-1 text-[10px] text-white/30">
                          Stage {signal.source + 1} → {signal.target + 1}
                        </div>
                      </div>

                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: signal.color,
                          boxShadow: `0 0 12px ${signal.color}`,
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="mt-6 rounded-[34px] border border-white/[0.08] bg-[#040812]/80 p-6 backdrop-blur-xl">
          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/25">
              Metastatic cascade
            </div>

            <h2 className="mt-2 text-2xl font-medium">
              Biological Checkpoints
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {stages.map((stage, index) => (
              <CheckpointCard
                key={stage.id}
                index={index + 1}
                title={stage.title}
                description={stage.description}
                color={stage.color}
                active={progress >= index}
              />
            ))}
          </div>
        </section>

        <footer className="py-6 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
          BioLayers AI · metastatic cascade research visualization · not clinical decision support
        </footer>
      </div>
    </main>
  );
}

function RouteMap({
  selectedStageId,
  progress,
  onSelect,
}: {
  selectedStageId: string;
  progress: number;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id="routeGlow">
            <feGaussianBlur
              stdDeviation="1.2"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {stages.slice(0, -1).map((stage, index) => {
          const next = stages[index + 1];
          const active = progress > index;

          return (
            <g key={`${stage.id}-${next.id}`}>
              <motion.path
                d={`M ${stage.x} ${stage.y} C ${
                  (stage.x + next.x) / 2
                } ${stage.y - 18}, ${(stage.x + next.x) / 2} ${
                  next.y + 18
                }, ${next.x} ${next.y}`}
                fill="none"
                stroke={
                  active
                    ? "rgba(255,255,255,.22)"
                    : "rgba(255,255,255,.07)"
                }
                strokeWidth=".45"
                strokeDasharray="1.3 1.2"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: active ? 1 : 0.12,
                }}
                transition={{
                  duration: 0.8,
                }}
              />

              {active && (
                <motion.circle
                  r=".65"
                  fill={next.color}
                  filter="url(#routeGlow)"
                  animate={{
                    cx: [stage.x, next.x],
                    cy: [stage.y, next.y],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {stages.map((stage, index) => {
        const selected = selectedStageId === stage.id;
        const reached = progress >= index;

        return (
          <button
            key={stage.id}
            onClick={() => onSelect(stage.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${stage.x}%`,
              top: `${stage.y}%`,
            }}
          >
            <motion.div
              animate={{
                scale: selected ? [1, 1.08, 1] : 1,
                opacity: reached ? 1 : 0.35,
              }}
              transition={{
                duration: 2,
                repeat: selected ? Infinity : 0,
              }}
              whileHover={{
                scale: 1.08,
              }}
              className="relative flex h-28 w-28 items-center justify-center rounded-full border backdrop-blur-xl md:h-32 md:w-32"
              style={{
                borderColor: selected
                  ? `${stage.color}88`
                  : `${stage.color}35`,
                background: `radial-gradient(circle at 35% 30%, ${stage.color}33, ${stage.color}12 48%, rgba(3,7,18,.88) 75%)`,
                boxShadow: selected
                  ? `0 0 45px ${stage.color}28`
                  : `0 0 18px ${stage.color}12`,
              }}
            >
              <div className="px-3 text-center">
                <div
                  className="font-mono text-xs font-bold"
                  style={{
                    color: stage.color,
                  }}
                >
                  0{index + 1}
                </div>

                <div className="mt-2 text-[10px] leading-4 text-white/60">
                  {stage.title}
                </div>
              </div>

              {selected && (
                <motion.div
                  className="absolute inset-[-9px] rounded-full border"
                  style={{
                    borderColor: `${stage.color}30`,
                  }}
                  animate={{
                    scale: [0.9, 1.2, 0.9],
                    opacity: [0, 0.75, 0],
                  }}
                  transition={{
                    duration: 1.7,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </div>

      <div className="mt-1 text-lg font-semibold text-white/80">
        {value}
      </div>
    </div>
  );
}

function CheckpointCard({
  index,
  title,
  description,
  color,
  active,
}: {
  index: number;
  title: string;
  description: string;
  color: string;
  active: boolean;
}) {
  return (
    <motion.article
      animate={{
        opacity: active ? 1 : 0.28,
        y: active ? 0 : 5,
      }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
    >
      <div className="flex items-center justify-between">
        <div
          className="font-mono text-xs font-semibold"
          style={{
            color,
          }}
        >
          0{index}
        </div>

        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: active ? `0 0 12px ${color}` : undefined,
          }}
        />
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/30">
        {description}
      </p>
    </motion.article>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-12%] top-[-15%] h-[650px] w-[650px] rounded-full bg-rose-500/[0.05] blur-[170px]" />

      <div className="absolute right-[-12%] top-[18%] h-[650px] w-[650px] rounded-full bg-violet-500/[0.06] blur-[180px]" />

      <div className="absolute bottom-[-12%] left-[35%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.04] blur-[160px]" />

      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
    </div>
  );
}