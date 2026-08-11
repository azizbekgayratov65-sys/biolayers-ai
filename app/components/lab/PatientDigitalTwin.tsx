"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type TherapyOption = {
  id: string;
  name: string;
  className: string;
  target: string;
  response: number;
  resistance: number;
  toxicity: number;
  color: string;
  rationale: string;
};

type MolecularEvent = {
  gene: string;
  alteration: string;
  type: string;
  impact: number;
  color: string;
};

const therapies: TherapyOption[] = [
  {
    id: "olaparib",
    name: "Olaparib",
    className: "PARP inhibitor",
    target: "BRCA2 / HRD",
    response: 86,
    resistance: 24,
    toxicity: 31,
    color: "#34d399",
    rationale:
      "Simulated sensitivity based on homologous recombination deficiency and BRCA2-associated DNA repair disruption.",
  },
  {
    id: "akt",
    name: "AKT Pathway Inhibition",
    className: "Pathway-targeted therapy",
    target: "PTEN → PI3K / AKT",
    response: 73,
    resistance: 43,
    toxicity: 38,
    color: "#a78bfa",
    rationale:
      "PTEN loss may create persistent PI3K/AKT signaling and a potential pathway-level vulnerability.",
  },
  {
    id: "ar",
    name: "AR Pathway Targeting",
    className: "Hormonal pathway therapy",
    target: "AR amplification",
    response: 69,
    resistance: 58,
    toxicity: 22,
    color: "#22d3ee",
    rationale:
      "AR amplification suggests persistent androgen receptor signaling but also elevated evolutionary pressure toward resistance.",
  },
  {
    id: "combo",
    name: "Combination Strategy",
    className: "Multi-pathway simulation",
    target: "DNA repair + AR axis",
    response: 91,
    resistance: 17,
    toxicity: 62,
    color: "#fb7185",
    rationale:
      "A simulated multi-pathway strategy produces the strongest tumor suppression but also increases modeled toxicity burden.",
  },
];

const molecularEvents: MolecularEvent[] = [
  {
    gene: "TP53",
    alteration: "R175H",
    type: "Driver",
    impact: 96,
    color: "#fb7185",
  },
  {
    gene: "PTEN",
    alteration: "Loss",
    type: "Driver",
    impact: 89,
    color: "#a78bfa",
  },
  {
    gene: "BRCA2",
    alteration: "Frameshift",
    type: "HRD",
    impact: 92,
    color: "#34d399",
  },
  {
    gene: "AR",
    alteration: "Amplification",
    type: "Resistance",
    impact: 84,
    color: "#22d3ee",
  },
];

const particles = Array.from({ length: 48 }, (_, index) => ({
  id: index,
  left: `${(index * 31) % 100}%`,
  top: `${(index * 53) % 100}%`,
  delay: `${(index % 13) * 0.16}s`,
  duration: `${3.5 + (index % 7)}s`,
}));

export default function PatientDigitalTwin() {
  const [selectedTherapyId, setSelectedTherapyId] = useState("olaparib");
  const [simulating, setSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(true);
  const [timepoint, setTimepoint] = useState(0);

  const selectedTherapy = useMemo(
    () =>
      therapies.find((therapy) => therapy.id === selectedTherapyId) ??
      therapies[0],
    [selectedTherapyId],
  );

  const simulatedTumorBurden = Math.max(
    8,
    82 - Math.round((selectedTherapy.response * timepoint) / 100),
  );

  const runSimulation = () => {
    if (simulating) return;

    setSimulating(true);
    setSimulationComplete(false);
    setTimepoint(0);

    let current = 0;

    const interval = window.setInterval(() => {
      current += 10;
      setTimepoint(current);

      if (current >= 100) {
        window.clearInterval(interval);
        setSimulating(false);
        setSimulationComplete(true);
      }
    }, 130);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020409] text-white">
      <Background selectedColor={selectedTherapy.color} />

      <div className="relative z-10 mx-auto max-w-[1720px] px-4 pb-20 pt-8 md:px-8">
        <header className="mb-6 flex flex-col gap-6 rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-200/70">
                BioLayers Digital Twin Engine
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Patient Digital Twin
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
              A research-grade simulated representation of tumor biology,
              molecular state, clonal behavior, and therapy-response scenarios.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <TopStatus label="Case" value="BL-PRAD-001" />
            <TopStatus label="Mode" value="Simulation" />
            <TopStatus label="Engine" value="Twin v1" />
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.2fr_.82fr]">
          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/[0.08] bg-[#050914]/85 p-5 backdrop-blur-xl">
              <SectionHeader
                eyebrow="Patient profile"
                title="Clinical Context"
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoCard label="Disease" value="Prostate cancer" />
                <InfoCard label="Stage" value="Advanced" />
                <InfoCard label="Primary site" value="Prostate" />
                <InfoCard label="Metastasis" value="Bone" />
                <InfoCard label="Sample" value="Tumor tissue" />
                <InfoCard label="Model" value="Simulated" />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/[0.08] bg-[#050914]/85 p-5 backdrop-blur-xl">
              <SectionHeader
                eyebrow="Molecular layer"
                title="Priority Alterations"
              />

              <div className="mt-5 space-y-3">
                {molecularEvents.map((event) => (
                  <article
                    key={event.gene}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div
                          className="font-mono text-sm font-bold"
                          style={{
                            color: event.color,
                          }}
                        >
                          {event.gene}
                        </div>

                        <div className="mt-1 text-xs text-white/40">
                          {event.alteration}
                        </div>
                      </div>

                      <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/40">
                        {event.type}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${event.impact}%`,
                            backgroundColor: event.color,
                            boxShadow: `0 0 12px ${event.color}66`,
                          }}
                        />
                      </div>

                      <span className="font-mono text-[10px] text-white/35">
                        {event.impact}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>

          <section className="relative min-h-[790px] overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#040812]/88 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                  Virtual tumor model
                </p>

                <h2 className="mt-1 text-xl font-medium">
                  Living Tumor Twin
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/20 px-3 py-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    simulating
                      ? "animate-pulse bg-amber-300"
                      : "bg-emerald-400"
                  }`}
                />

                <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {simulating ? "Simulating" : "Synchronized"}
                </span>
              </div>
            </div>

            <div className="relative h-[600px] overflow-hidden">
              <DigitalTumor
                response={selectedTherapy.response}
                resistance={selectedTherapy.resistance}
                timepoint={timepoint}
                simulating={simulating}
                color={selectedTherapy.color}
              />

              <div className="absolute left-5 top-5 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                  Simulated burden
                </div>

                <div className="mt-1 font-mono text-lg text-white/70">
                  {simulatedTumorBurden}%
                </div>
              </div>

              <div className="absolute right-5 top-5 text-right">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">
                  Simulation time
                </div>

                <div
                  className="mt-1 font-mono text-lg"
                  style={{
                    color: selectedTherapy.color,
                  }}
                >
                  T+{timepoint}
                </div>
              </div>

              <AnimatePresence>
                {simulating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0"
                  >
                    <motion.div
                      className="absolute inset-y-0 w-px"
                      style={{
                        backgroundColor: selectedTherapy.color,
                        boxShadow: `0 0 25px ${selectedTherapy.color}`,
                      }}
                      animate={{
                        left: ["3%", "97%", "3%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-black/25 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <TwinMetric
                  label="Tumor burden"
                  value={`${simulatedTumorBurden}%`}
                />

                <TwinMetric
                  label="Response score"
                  value={`${selectedTherapy.response}%`}
                />

                <TwinMetric
                  label="Resistance risk"
                  value={`${selectedTherapy.resistance}%`}
                />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/[0.08] bg-[#050914]/85 p-5 backdrop-blur-xl">
              <SectionHeader
                eyebrow="Therapy simulator"
                title="Intervention Strategy"
              />

              <div className="mt-5 space-y-2">
                {therapies.map((therapy) => {
                  const active = therapy.id === selectedTherapyId;

                  return (
                    <button
                      key={therapy.id}
                      onClick={() => {
                        if (simulating) return;
                        setSelectedTherapyId(therapy.id);
                        setTimepoint(0);
                        setSimulationComplete(true);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-white/20 bg-white/[0.07]"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.045]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white/85">
                            {therapy.name}
                          </div>

                          <div className="mt-1 text-[10px] text-white/30">
                            {therapy.className}
                          </div>
                        </div>

                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: therapy.color,
                            boxShadow: active
                              ? `0 0 14px ${therapy.color}`
                              : undefined,
                          }}
                        />
                      </div>

                      <div className="mt-3 font-mono text-[10px] text-white/35">
                        TARGET: {therapy.target}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={runSimulation}
                disabled={simulating}
                className="relative mt-5 w-full overflow-hidden rounded-2xl border px-5 py-3.5 text-sm font-medium transition"
                style={{
                  borderColor: `${selectedTherapy.color}40`,
                  backgroundColor: `${selectedTherapy.color}12`,
                  color: selectedTherapy.color,
                }}
              >
                <span className="relative z-10">
                  {simulating
                    ? "Simulating response..."
                    : "Simulate Therapy Response"}
                </span>

                {simulating && (
                  <motion.div
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: [-100, 340],
                    }}
                    transition={{
                      duration: 0.95,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
              </button>
            </section>

            <AnimatePresence mode="wait">
              <motion.section
                key={selectedTherapy.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="rounded-[30px] border border-white/[0.08] bg-[#050914]/85 p-5 backdrop-blur-xl"
              >
                <SectionHeader
                  eyebrow="Predicted scenario"
                  title={selectedTherapy.name}
                />

                <p className="mt-4 text-sm leading-6 text-white/40">
                  {selectedTherapy.rationale}
                </p>

                <div className="mt-5 space-y-4">
                  <SimulationBar
                    label="Modeled response"
                    value={selectedTherapy.response}
                    color={selectedTherapy.color}
                  />

                  <SimulationBar
                    label="Resistance probability"
                    value={selectedTherapy.resistance}
                    color="#fb7185"
                  />

                  <SimulationBar
                    label="Relative toxicity"
                    value={selectedTherapy.toxicity}
                    color="#f59e0b"
                  />
                </div>
              </motion.section>
            </AnimatePresence>

            <section className="rounded-[30px] border border-cyan-300/[0.12] bg-cyan-300/[0.035] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08]">
                  <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(165,243,252,.9)]" />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/40">
                    BioLayers inference
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    Multi-layer interpretation
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-6 text-white/40">
                The digital twin combines simulated genomic, pathway, clonal,
                and therapy-response layers into a single interactive research
                model.
              </p>
            </section>
          </aside>
        </section>

        <section className="mt-6 rounded-[34px] border border-white/[0.08] bg-[#040812]/80 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                Response trajectory
              </p>

              <h2 className="mt-2 text-2xl font-medium">
                Simulated Tumor Dynamics
              </h2>
            </div>

            <div className="font-mono text-[10px] text-white/25">
              RESEARCH SIMULATION ONLY
            </div>
          </div>

          <div className="mt-8">
            <ResponseTrajectory
              response={selectedTherapy.response}
              resistance={selectedTherapy.resistance}
              color={selectedTherapy.color}
              activeTimepoint={timepoint}
            />
          </div>
        </section>

        <footer className="py-6 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
          BioLayers AI · simulated research visualization · not clinical decision support
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/25">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-lg font-semibold tracking-tight text-white/90">
        {title}
      </h2>
    </div>
  );
}

function TopStatus({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
      <span className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </span>

      <span className="ml-2 text-xs font-medium text-white/65">
        {value}
      </span>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>

      <div className="mt-2 text-xs font-medium text-white/65">
        {value}
      </div>
    </div>
  );
}

function TwinMetric({
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

function SimulationBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px]">
        <span className="text-white/30">{label}</span>

        <span className="font-mono text-white/50">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${value}%`,
          }}
          transition={{
            duration: 0.8,
          }}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

function DigitalTumor({
  response,
  resistance,
  timepoint,
  simulating,
  color,
}: {
  response: number;
  resistance: number;
  timepoint: number;
  simulating: boolean;
  color: string;
}) {
  const cells = useMemo(() => {
    return Array.from({ length: 62 }, (_, index) => {
      const angle = index * 2.399;
      const radius = 30 + ((index * 17) % 150);

      return {
        id: index,
        x: 50 + Math.cos(angle) * radius * 0.23,
        y: 50 + Math.sin(angle) * radius * 0.23,
        size: 5 + ((index * 13) % 11),
        resistant: index % Math.max(3, Math.round(12 - resistance / 10)) === 0,
      };
    });
  }, [resistance]);

  const shrinkFactor = Math.max(
    0.55,
    1 - (response / 100) * (timepoint / 100) * 0.45,
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative h-[450px] w-[450px] max-w-[78vw]"
        animate={{
          scale: shrinkFactor,
          rotate: simulating ? [0, 2, -2, 0] : 0,
        }}
        transition={{
          scale: {
            duration: 0.5,
          },
          rotate: {
            duration: 2,
            repeat: simulating ? Infinity : 0,
          },
        }}
      >
        <div
          className="absolute inset-[4%] rounded-full border"
          style={{
            borderColor: `${color}22`,
          }}
        />

        <div className="absolute inset-[13%] rounded-full border border-violet-300/[0.08]" />

        <div className="absolute inset-[22%] rounded-full border border-white/[0.05]" />

        <motion.div
          className="absolute inset-[18%] rounded-full blur-xl"
          animate={{
            opacity: simulating ? [0.25, 0.55, 0.25] : 0.35,
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
          }}
          style={{
            background: `radial-gradient(circle, ${color}33, rgba(139,92,246,.12), transparent 70%)`,
          }}
        />

        {cells.map((cell) => {
          const suppression =
            !cell.resistant &&
            timepoint > 0 &&
            cell.id % 100 < (response * timepoint) / 100;

          return (
            <motion.span
              key={cell.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                left: `${cell.x}%`,
                top: `${cell.y}%`,
                width: cell.size,
                height: cell.size,
                borderColor: cell.resistant
                  ? "rgba(251,113,133,.65)"
                  : `${color}66`,
                backgroundColor: cell.resistant
                  ? "rgba(251,113,133,.26)"
                  : `${color}26`,
                boxShadow: cell.resistant
                  ? "0 0 14px rgba(251,113,133,.4)"
                  : `0 0 12px ${color}35`,
              }}
              animate={{
                opacity: suppression ? 0.08 : cell.resistant ? 1 : 0.72,
                scale: suppression
                  ? 0.3
                  : cell.resistant
                    ? [0.9, 1.25, 0.9]
                    : [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: cell.resistant ? 1.5 : 2.4,
                repeat: Infinity,
              }}
            />
          );
        })}

        <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-black/30 backdrop-blur-xl">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-[0.24em] text-white/25">
              Tumor Twin
            </div>

            <div
              className="mt-2 font-mono text-xl"
              style={{
                color,
              }}
            >
              PRAD
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ResponseTrajectory({
  response,
  resistance,
  color,
  activeTimepoint,
}: {
  response: number;
  resistance: number;
  color: string;
  activeTimepoint: number;
}) {
  const points = Array.from({ length: 11 }, (_, index) => {
    const t = index / 10;
    const responseDrop = response * t * 0.67;
    const rebound = resistance * Math.max(0, t - 0.62) * 0.55;

    return Math.max(8, 86 - responseDrop + rebound);
  });

  const width = 100;
  const height = 34;

  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - (value / 100) * height;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-[260px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 p-5">
      <div className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.2em] text-white/20">
        Relative tumor burden
      </div>

      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute inset-x-5 bottom-5 top-12 h-[190px] w-[calc(100%-40px)]"
      >
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="0"
            y1={8 + line * 7}
            x2="100"
            y2={8 + line * 7}
            stroke="rgba(255,255,255,.05)"
            strokeWidth=".2"
          />
        ))}

        <path
          d={`${path} L 100 40 L 0 40 Z`}
          fill={`${color}12`}
        />

        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="0.7"
          initial={{
            pathLength: 0,
          }}
          animate={{
            pathLength: 1,
          }}
          transition={{
            duration: 1,
          }}
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />

        <motion.line
          x1={activeTimepoint}
          x2={activeTimepoint}
          y1="0"
          y2="40"
          stroke="rgba(255,255,255,.25)"
          strokeWidth=".25"
          animate={{
            opacity: activeTimepoint > 0 ? 1 : 0,
          }}
        />
      </svg>

      <div className="absolute bottom-3 left-5 right-5 flex justify-between font-mono text-[9px] text-white/20">
        <span>T0</span>
        <span>T25</span>
        <span>T50</span>
        <span>T75</span>
        <span>T100</span>
      </div>
    </div>
  );
}

function Background({
  selectedColor,
}: {
  selectedColor: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute left-[-12%] top-[-18%] h-[650px] w-[650px] rounded-full blur-[170px]"
        animate={{
          backgroundColor: `${selectedColor}12`,
        }}
      />

      <div className="absolute right-[-10%] top-[18%] h-[620px] w-[620px] rounded-full bg-violet-600/[0.06] blur-[170px]" />

      <div className="absolute bottom-[-15%] left-[30%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.035] blur-[160px]" />

      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute h-px w-px rounded-full bg-white animate-pulse"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}