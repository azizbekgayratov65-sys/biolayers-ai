"use client";

import { useMemo, useState } from "react";

type EvolutionStage = {
  id: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  mutations: string[];
  burden: number;
  resistance: number;
  metastasis: number;
};

const stages: EvolutionStage[] = [
  {
    id: 0,
    year: "T0",
    title: "Primary Tumor",
    subtitle: "Initial malignant clone",
    description:
      "A dominant tumor population emerges after progressive genomic instability.",
    mutations: ["TP53", "PTEN"],
    burden: 28,
    resistance: 8,
    metastasis: 4,
  },
  {
    id: 1,
    year: "T1",
    title: "Clonal Expansion",
    subtitle: "Selective growth advantage",
    description:
      "Subclones carrying advantageous alterations begin expanding inside the tumor ecosystem.",
    mutations: ["TP53", "PTEN", "MYC"],
    burden: 46,
    resistance: 19,
    metastasis: 11,
  },
  {
    id: 2,
    year: "T2",
    title: "Therapy Pressure",
    subtitle: "Evolution under treatment",
    description:
      "Treatment suppresses sensitive populations while resistant clones survive and expand.",
    mutations: ["TP53", "PTEN", "MYC", "AR"],
    burden: 35,
    resistance: 52,
    metastasis: 22,
  },
  {
    id: 3,
    year: "T3",
    title: "Resistant Clone",
    subtitle: "Adaptive tumor evolution",
    description:
      "A resistant subpopulation becomes dominant and reconstructs the tumor architecture.",
    mutations: ["TP53", "PTEN", "AR", "PIK3CA"],
    burden: 61,
    resistance: 78,
    metastasis: 44,
  },
  {
    id: 4,
    year: "T4",
    title: "Metastatic Escape",
    subtitle: "Systemic progression",
    description:
      "Highly adapted tumor cells acquire invasive phenotypes and establish distant disease.",
    mutations: ["TP53", "PTEN", "AR", "PIK3CA", "RB1"],
    burden: 86,
    resistance: 91,
    metastasis: 88,
  },
];

const particles = Array.from({ length: 46 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  size: 1 + ((index * 7) % 3),
  delay: `${(index % 12) * 0.18}s`,
  duration: `${4 + (index % 8)}s`,
}));

export default function CancerEvolutionTimeline() {
  const [activeStage, setActiveStage] = useState(2);
  const stage = stages[activeStage];

  const clones = useMemo(() => {
    const amount = 10 + activeStage * 7;

    return Array.from({ length: amount }, (_, index) => {
      const angle = (index / amount) * Math.PI * 2;
      const ring = 48 + ((index * 17) % 95);
      const x = 50 + Math.cos(angle * 2.3) * ring * 0.31;
      const y = 50 + Math.sin(angle * 1.8) * ring * 0.28;
      const size = 7 + ((index * 11) % 17);

      return {
        id: index,
        x,
        y,
        size,
        resistant: index % Math.max(2, 5 - activeStage) === 0,
      };
    });
  }, [activeStage]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030507] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-15%] top-[-20%] h-[620px] w-[620px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[720px] w-[720px] rounded-full bg-violet-600/10 blur-[180px]" />
        <div className="absolute left-[42%] top-[35%] h-[380px] w-[380px] rounded-full bg-rose-500/5 blur-[150px]" />

        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute rounded-full bg-cyan-200/40 animate-pulse"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
          }}
        />
      </div>

      <section className="relative z-10 mx-auto max-w-[1600px] px-6 pb-16 pt-32 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,.9)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45">
                BioLayers AI · Evolution Engine
              </span>
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Cancer Evolution
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                Through Time
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Explore how malignant clones evolve, compete, acquire resistance,
              and progress toward metastatic disease.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusChip label="Model" value="Evolution v1" />
            <StatusChip label="State" value="Simulated" />
            <StatusChip label="Resolution" value="Clonal" />
          </div>
        </header>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.35fr_0.87fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <PanelTitle
              eyebrow="Temporal state"
              title="Evolution Timeline"
            />

            <div className="mt-7 space-y-2">
              {stages.map((item, index) => {
                const active = index === activeStage;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveStage(index)}
                    className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                      active
                        ? "border-cyan-300/35 bg-cyan-300/[0.08]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.045]"
                    }`}
                  >
                    {active && (
                      <div className="absolute inset-y-0 left-0 w-[2px] bg-cyan-300 shadow-[0_0_16px_rgba(161,92,255,.8)]" />
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold ${
                          active
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 text-white/35"
                        }`}
                      >
                        {item.year}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-white/90">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-white/35">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                Evolution index
              </div>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">
                  {String(activeStage + 1).padStart(2, "0")}
                </span>
                <span className="pb-1 text-xs text-white/30">
                  / {String(stages.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </section>

          <section className="relative min-h-[650px] overflow-hidden rounded-[32px] border border-white/10 bg-[#050811]/80 backdrop-blur-xl">
            <div className="absolute left-6 top-6 z-20">
              <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-200/50">
                Tumor ecosystem
              </div>
              <div className="mt-2 text-xl font-semibold">{stage.title}</div>
            </div>

            <div className="absolute right-6 top-6 z-20 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/45">
              live simulation
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[430px] w-[430px] max-w-[80vw]">
                <div className="absolute inset-[4%] rounded-full border border-cyan-300/10" />
                <div className="absolute inset-[13%] rounded-full border border-violet-300/10" />
                <div className="absolute inset-[23%] rounded-full border border-white/[0.06]" />

                <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-cyan-400/[0.08] via-violet-500/[0.08] to-rose-500/[0.09] blur-xl" />

                <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.025] shadow-[0_0_90px_rgba(161,92,255,.12)]">
                  <div className="absolute inset-[22%] rounded-full border border-rose-300/20 bg-rose-400/[0.06] shadow-[0_0_45px_rgba(251,113,133,.12)]" />
                  <div className="absolute inset-[40%] rounded-full bg-white/70 shadow-[0_0_30px_rgba(255,255,255,.5)]" />
                </div>

                {clones.map((clone) => (
                  <button
                    key={clone.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500 hover:scale-150 ${
                      clone.resistant
                        ? "border-rose-300/60 bg-rose-400/30 shadow-[0_0_18px_rgba(251,113,133,.5)]"
                        : "border-cyan-200/40 bg-cyan-300/20 shadow-[0_0_14px_rgba(161,92,255,.25)]"
                    }`}
                    style={{
                      left: `${clone.x}%`,
                      top: `${clone.y}%`,
                      width: clone.size,
                      height: clone.size,
                    }}
                    aria-label={
                      clone.resistant
                        ? "Resistant cancer clone"
                        : "Cancer clone"
                    }
                  />
                ))}

                <div className="absolute left-1/2 top-1/2 h-[88%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-[38deg] bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />

                <div className="absolute left-1/2 top-1/2 h-[88%] w-[2px] -translate-x-1/2 -translate-y-1/2 -rotate-[53deg] bg-gradient-to-b from-transparent via-violet-300/15 to-transparent" />
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
              <MetricMini
                label="Tumor burden"
                value={`${stage.burden}%`}
              />
              <MetricMini
                label="Resistance"
                value={`${stage.resistance}%`}
              />
              <MetricMini
                label="Metastatic risk"
                value={`${stage.metastasis}%`}
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <PanelTitle eyebrow={stage.year} title={stage.title} />

              <p className="mt-5 text-sm leading-7 text-white/50">
                {stage.description}
              </p>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Detected alterations
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {stage.mutations.map((mutation) => (
                    <span
                      key={mutation}
                      className="rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-3 py-1.5 text-xs font-medium text-violet-100"
                    >
                      {mutation}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <PanelTitle eyebrow="Selection" title="Evolution Pressure" />

              <div className="mt-6 space-y-5">
                <ProgressMetric
                  label="Tumor burden"
                  value={stage.burden}
                />
                <ProgressMetric
                  label="Therapy resistance"
                  value={stage.resistance}
                />
                <ProgressMetric
                  label="Metastatic potential"
                  value={stage.metastasis}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-rose-300/15 bg-rose-400/[0.035] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/10">
                  <span className="h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_14px_rgba(253,164,175,.9)]" />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-rose-200/45">
                    AI observation
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    Evolutionary signal detected
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-6 text-white/45">
                Resistant clones increase as treatment pressure rises. The model
                estimates progressive selection toward aggressive phenotypes.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.025] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="min-w-[190px]">
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/30">
                Navigate evolution
              </div>
              <div className="mt-2 text-lg font-semibold">
                Clonal trajectory
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-between">
              <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-white/10" />

              <div
                className="absolute left-5 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-500"
                style={{
                  width: `calc(${(activeStage / (stages.length - 1)) * 100}% - ${
                    activeStage === stages.length - 1 ? 40 : 20
                  }px)`,
                }}
              />

              {stages.map((item, index) => {
                const active = index === activeStage;
                const passed = index <= activeStage;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveStage(index)}
                    className="relative z-10 flex flex-col items-center gap-3"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
                        active
                          ? "scale-110 border-cyan-200 bg-cyan-300 text-black shadow-[0_0_25px_rgba(161,92,255,.45)]"
                          : passed
                          ? "border-violet-300/40 bg-violet-400/15 text-violet-100"
                          : "border-white/10 bg-[#070a11] text-white/30"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span
                      className={`hidden text-[10px] uppercase tracking-[0.14em] sm:block ${
                        active ? "text-white/80" : "text-white/25"
                      }`}
                    >
                      {item.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function PanelTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/30">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-white/90">
        {title}
      </h2>
    </div>
  );
}

function StatusChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/25">
        {label}
      </span>
      <span className="ml-2 text-xs font-medium text-white/65">{value}</span>
    </div>
  );
}

function MetricMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 backdrop-blur-xl">
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white/85">{value}</div>
    </div>
  );
}

function ProgressMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-white/45">{label}</span>
        <span className="text-xs font-semibold text-white/75">{value}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-rose-400 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}