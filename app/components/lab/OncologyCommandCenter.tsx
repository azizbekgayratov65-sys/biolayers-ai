"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type Mutation = {
  gene: string;
  alteration: string;
  frequency: number;
  status: "Driver" | "Likely driver" | "Passenger";
  pathway: string;
};

type Therapy = {
  name: string;
  target: string;
  score: number;
  evidence: string;
  status: "Strong" | "Moderate" | "Experimental";
};

const mutations: Mutation[] = [
  {
    gene: "TP53",
    alteration: "R175H",
    frequency: 84,
    status: "Driver",
    pathway: "DNA Damage Response",
  },
  {
    gene: "PTEN",
    alteration: "Loss",
    frequency: 72,
    status: "Driver",
    pathway: "PI3K / AKT",
  },
  {
    gene: "AR",
    alteration: "Amplification",
    frequency: 61,
    status: "Driver",
    pathway: "Androgen Receptor",
  },
  {
    gene: "BRCA2",
    alteration: "Frameshift",
    frequency: 38,
    status: "Likely driver",
    pathway: "Homologous Recombination",
  },
  {
    gene: "MYC",
    alteration: "Gain",
    frequency: 31,
    status: "Likely driver",
    pathway: "Cell Proliferation",
  },
];

const therapies: Therapy[] = [
  {
    name: "Olaparib",
    target: "BRCA2 / HRD",
    score: 94,
    evidence: "Clinical evidence",
    status: "Strong",
  },
  {
    name: "Talazoparib",
    target: "PARP",
    score: 87,
    evidence: "Clinical evidence",
    status: "Strong",
  },
  {
    name: "AKT pathway inhibition",
    target: "PTEN → AKT",
    score: 76,
    evidence: "Pathway evidence",
    status: "Moderate",
  },
  {
    name: "AR pathway targeting",
    target: "AR amplification",
    score: 71,
    evidence: "Genomic association",
    status: "Moderate",
  },
  {
    name: "Synthetic-lethal strategy",
    target: "TP53 / DNA repair",
    score: 58,
    evidence: "Preclinical",
    status: "Experimental",
  },
];

const networkNodes = [
  { id: "AR", x: 17, y: 50, color: "#22d3ee" },
  { id: "PI3K", x: 34, y: 27, color: "#8b5cf6" },
  { id: "AKT", x: 53, y: 42, color: "#a78bfa" },
  { id: "DNA", x: 35, y: 75, color: "#34d399" },
  { id: "TP53", x: 62, y: 72, color: "#fb7185" },
  { id: "MYC", x: 81, y: 49, color: "#f59e0b" },
];

export default function OncologyCommandCenter() {
  const [selectedGene, setSelectedGene] = useState("TP53");
  const [scanning, setScanning] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [activeLayer, setActiveLayer] = useState<
    "genome" | "pathways" | "therapy"
  >("genome");

  const selectedMutation = useMemo(
    () => mutations.find((mutation) => mutation.gene === selectedGene) ?? mutations[0],
    [selectedGene],
  );

  const runAnalysis = () => {
    if (scanning) return;

    setScanning(true);
    setAnalysisComplete(false);

    window.setTimeout(() => {
      setScanning(false);
      setAnalysisComplete(true);
    }, 3600);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040a] text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-[1720px] px-4 pb-20 pt-6 md:px-8">
        <header className="mb-6 flex flex-col gap-5 rounded-[30px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-300">
                BioLayers Intelligence Engine
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
              Oncology Intelligence Core
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/45">
              Multilayer genomic interpretation for precision oncology.
            </p>
          </div>

          <button
            onClick={runAnalysis}
            disabled={scanning}
            className="group relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.08] px-7 py-3.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/[0.14]"
          >
            <span className="relative z-10">
              {scanning ? "Analyzing tumor..." : "Run BioLayers Analysis"}
            </span>

            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: scanning ? [-120, 360] : -120,
              }}
              transition={{
                duration: 1.15,
                repeat: scanning ? Infinity : 0,
                ease: "linear",
              }}
            />
          </button>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Cancer type"
            value="Prostate adenocarcinoma"
            detail="Advanced disease model"
          />

          <Metric
            label="Genomic events"
            value="37"
            detail="5 high-priority alterations"
          />

          <Metric
            label="Pathways affected"
            value="8"
            detail="4 therapeutically relevant"
          />

          <Metric
            label="Evidence confidence"
            value="91%"
            detail="Integrated evidence score"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
          <section className="relative min-h-[700px] overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#050914]/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Molecular model
                </p>

                <h2 className="mt-1 text-xl font-medium">
                  Tumor Systems Map
                </h2>
              </div>

              <div className="flex rounded-xl border border-white/[0.07] bg-black/20 p-1">
                <LayerButton
                  label="Genome"
                  active={activeLayer === "genome"}
                  onClick={() => setActiveLayer("genome")}
                />

                <LayerButton
                  label="Pathways"
                  active={activeLayer === "pathways"}
                  onClick={() => setActiveLayer("pathways")}
                />

                <LayerButton
                  label="Therapy"
                  active={activeLayer === "therapy"}
                  onClick={() => setActiveLayer("therapy")}
                />
              </div>
            </div>

            <div className="relative h-[500px] overflow-hidden">
              <TumorCore scanning={scanning} />

              <PathwayNetwork
                activeLayer={activeLayer}
                selectedGene={selectedGene}
              />

              <AnimatePresence>
                {scanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0"
                  >
                    <motion.div
                      className="absolute inset-x-0 h-px bg-cyan-300 shadow-[0_0_22px_rgba(34,211,238,.95)]"
                      animate={{
                        top: ["7%", "93%", "7%"],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <div className="absolute inset-0 bg-cyan-300/[0.018]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute left-5 top-5 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[10px] text-white/30 backdrop-blur-xl">
                CASE: PRAD-BL-001
              </div>

              <div className="absolute right-5 top-5 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[10px] text-emerald-300/70 backdrop-blur-xl">
                SYSTEM ONLINE
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-black/20 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      scanning
                        ? "animate-pulse bg-cyan-300"
                        : "bg-emerald-400"
                    }`}
                  />

                  {scanning
                    ? "Cross-layer inference running"
                    : "Molecular model synchronized"}
                </div>

                <div className="font-mono text-[10px] text-white/25">
                  BL-ONC / CORE-01
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/[0.08] bg-[#050914]/80 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">
                    Genomic layer
                  </p>

                  <h2 className="mt-1 text-lg font-medium">
                    Priority alterations
                  </h2>
                </div>

                <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[10px] uppercase tracking-wider text-rose-300">
                  Tumor
                </span>
              </div>

              <div className="space-y-2">
                {mutations.map((mutation, index) => {
                  const selected = selectedGene === mutation.gene;

                  return (
                    <motion.button
                      key={mutation.gene}
                      onClick={() => setSelectedGene(mutation.gene)}
                      initial={{
                        opacity: 0,
                        x: 12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-300/30 bg-cyan-300/[0.08]"
                          : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                              selected
                                ? "bg-cyan-300/15 text-cyan-200"
                                : "bg-white/[0.05] text-white/60"
                            }`}
                          >
                            {mutation.gene.slice(0, 2)}
                          </div>

                          <div>
                            <div className="font-semibold">
                              {mutation.gene}
                            </div>

                            <div className="text-xs text-white/35">
                              {mutation.alteration}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {mutation.frequency}%
                          </div>

                          <div className="text-[10px] text-white/30">
                            VAF
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${mutation.frequency}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.05,
                          }}
                          className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400"
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <AnimatePresence mode="wait">
              <motion.section
                key={selectedMutation.gene}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="rounded-[30px] border border-white/[0.08] bg-[#050914]/80 p-5 backdrop-blur-xl"
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">
                  Biological interpretation
                </p>

                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-semibold">
                      {selectedMutation.gene}
                    </h3>

                    <p className="mt-1 text-sm text-white/40">
                      {selectedMutation.alteration}
                    </p>
                  </div>

                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                    {selectedMutation.status}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <p className="text-xs text-white/30">
                    Affected biological program
                  </p>

                  <p className="mt-1 text-sm">
                    {selectedMutation.pathway}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoBox
                    label="Cancer relevance"
                    value="High"
                  />

                  <InfoBox
                    label="Evidence"
                    value="Integrated"
                  />
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </section>

        <section className="mt-6 rounded-[34px] border border-white/[0.08] bg-[#050914]/80 p-6 backdrop-blur-xl">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                Precision layer
              </p>

              <h2 className="mt-1 text-xl font-medium">
                Therapeutic Intelligence
              </h2>
            </div>

            <div className="text-xs text-white/30">
              Ranked from genomic + pathway + evidence signals
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {therapies.map((therapy, index) => (
              <motion.article
                key={therapy.name}
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.08 * index,
                }}
                whileHover={{
                  y: -5,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-cyan-300/20 hover:bg-white/[0.045]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      therapy.status === "Strong"
                        ? "bg-emerald-400"
                        : therapy.status === "Moderate"
                          ? "bg-amber-400"
                          : "bg-violet-400"
                    }`}
                  />

                  <span className="font-mono text-xs text-white/35">
                    {therapy.score}
                  </span>
                </div>

                <h3 className="font-medium">
                  {therapy.name}
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  {therapy.target}
                </p>

                <p className="mt-5 text-[10px] uppercase tracking-wider text-white/25">
                  {therapy.evidence}
                </p>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: analysisComplete
                        ? `${therapy.score}%`
                        : "6%",
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                  />
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <div className="mt-5 text-center text-[10px] uppercase tracking-[0.28em] text-white/20">
          Research visualization only · not clinical decision support
        </div>
      </div>
    </main>
  );
}

function LayerButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/35 hover:text-white/70"
      }`}
    >
      {label}
    </button>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-[24px] border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-xl"
    >
      <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
        {label}
      </p>

      <p className="mt-3 text-xl font-medium">
        {value}
      </p>

      <p className="mt-1 text-xs text-white/30">
        {detail}
      </p>
    </motion.div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[10px] text-white/25">
        {label}
      </div>

      <div className="mt-1 text-sm">
        {value}
      </div>
    </div>
  );
}

function TumorCore({
  scanning,
}: {
  scanning: boolean;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: scanning ? 8 : 28,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[350px] w-[350px] rounded-full border border-cyan-300/[0.08]"
      />

      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: scanning ? 5 : 19,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[280px] w-[280px] rounded-full border border-dashed border-violet-300/[0.12]"
      />

      <motion.div
        animate={{
          scale: scanning
            ? [0.92, 1.1, 0.92]
            : [0.98, 1.035, 0.98],
        }}
        transition={{
          duration: scanning ? 1.2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-[205px] w-[205px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.28), rgba(168,85,247,.24) 20%, rgba(244,63,94,.16) 46%, rgba(2,4,10,.05) 72%)",
          boxShadow:
            "0 0 100px rgba(168,85,247,.18), inset 0 0 55px rgba(244,63,94,.12)",
        }}
      >
        {Array.from({
          length: 20,
        }).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2;
          const radius = 49 + (index % 5) * 9;
          const x = 102 + Math.cos(angle) * radius;
          const y = 102 + Math.sin(angle) * radius;

          return (
            <motion.span
              key={index}
              className="absolute h-2 w-2 rounded-full bg-rose-300"
              style={{
                left: x,
                top: y,
              }}
              animate={{
                scale: [0.4, 1.4, 0.4],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 1.8 + (index % 5) * 0.4,
                repeat: Infinity,
                delay: index * 0.08,
              }}
            />
          );
        })}
      </motion.div>

      <div className="absolute text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/25">
          Tumor Core
        </div>

        <div className="mt-2 font-mono text-sm text-white/65">
          PRAD-01
        </div>
      </div>
    </div>
  );
}

function PathwayNetwork({
  activeLayer,
  selectedGene,
}: {
  activeLayer: "genome" | "pathways" | "therapy";
  selectedGene: string;
}) {
  const links = [
    [0, 1],
    [1, 2],
    [2, 5],
    [0, 3],
    [3, 4],
    [4, 5],
    [2, 4],
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id="networkGlow">
          <feGaussianBlur
            stdDeviation="0.6"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {links.map(([a, b], index) => {
        const from = networkNodes[a];
        const to = networkNodes[b];

        return (
          <motion.line
            key={`${a}-${b}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={
              activeLayer === "pathways"
                ? "rgba(103,232,249,.3)"
                : "rgba(255,255,255,.11)"
            }
            strokeWidth={activeLayer === "pathways" ? 0.34 : 0.22}
            strokeDasharray="1.2 1.4"
            animate={{
              strokeDashoffset: [0, -8],
            }}
            transition={{
              duration: 3 + index * 0.2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}

      {networkNodes.map((node, index) => {
        const highlighted =
          node.id === selectedGene ||
          (selectedGene === "PTEN" && node.id === "AKT");

        return (
          <motion.g
            key={node.id}
            animate={{
              opacity: activeLayer === "therapy" ? 0.55 : 1,
            }}
          >
            <motion.circle
              cx={node.x}
              cy={node.y}
              fill={node.color}
              filter="url(#networkGlow)"
              animate={{
                r: highlighted
                  ? [2, 2.8, 2]
                  : [1.4, 1.9, 1.4],
              }}
              transition={{
                duration: 2 + index * 0.2,
                repeat: Infinity,
              }}
            />

            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill={
                highlighted
                  ? "rgba(255,255,255,.95)"
                  : "rgba(255,255,255,.42)"
              }
              fontSize="1.8"
            >
              {node.id}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[8%] top-[6%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[140px]" />

      <div className="absolute right-[5%] top-[22%] h-[520px] w-[520px] rounded-full bg-violet-500/[0.06] blur-[150px]" />

      <div className="absolute bottom-[3%] left-[38%] h-[450px] w-[450px] rounded-full bg-rose-500/[0.04] blur-[150px]" />

      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}