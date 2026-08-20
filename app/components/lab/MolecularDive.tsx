"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type GeneProfile = {
  gene: string;
  chromosome: string;
  locus: string;
  alteration: string;
  consequence: string;
  pathway: string;
  impact: number;
  evidence: number;
  color: string;
  secondary: string;
  description: string;
  downstream: string[];
};

const genes: GeneProfile[] = [
  {
    gene: "TP53",
    chromosome: "17p13.1",
    locus: "c.524G>A",
    alteration: "R175H",
    consequence: "Loss of tumor suppressor activity",
    pathway: "DNA Damage Response",
    impact: 96,
    evidence: 94,
    color: "#fb7185",
    secondary: "#f43f5e",
    description:
      "A high-impact TP53 alteration associated with impaired DNA-damage response, genomic instability, and altered apoptotic signaling.",
    downstream: ["CDKN1A", "BAX", "MDM2", "DNA Repair"],
  },
  {
    gene: "BRCA2",
    chromosome: "13q13.1",
    locus: "Frameshift",
    alteration: "HRD-associated",
    consequence: "Homologous recombination deficiency",
    pathway: "DNA Repair / HRR",
    impact: 91,
    evidence: 96,
    color: "#34d399",
    secondary: "#a15cff",
    description:
      "BRCA2 disruption may impair homologous recombination repair and produce a therapeutically relevant DNA-repair vulnerability.",
    downstream: ["RAD51", "PARP", "HRR", "Replication Fork"],
  },
  {
    gene: "PTEN",
    chromosome: "10q23.31",
    locus: "Deletion",
    alteration: "Loss",
    consequence: "PI3K/AKT pathway activation",
    pathway: "PI3K / AKT / mTOR",
    impact: 88,
    evidence: 90,
    color: "#a78bfa",
    secondary: "#8b5cf6",
    description:
      "PTEN loss removes a major negative regulator of PI3K signaling, enabling persistent AKT pathway activation and survival signaling.",
    downstream: ["PI3K", "AKT", "mTOR", "FOXO"],
  },
  {
    gene: "AR",
    chromosome: "Xq12",
    locus: "Amplification",
    alteration: "Copy-number gain",
    consequence: "Enhanced androgen signaling",
    pathway: "Androgen Receptor",
    impact: 85,
    evidence: 93,
    color: "#a15cff",
    secondary: "#4d8dff",
    description:
      "AR amplification can increase androgen-receptor signaling and is a recurrent molecular event in advanced prostate cancer.",
    downstream: ["KLK3", "TMPRSS2", "FOXA1", "Cell Growth"],
  },
];

export default function MolecularDive() {
  const [selectedGene, setSelectedGene] = useState("TP53");
  const [sequenceMode, setSequenceMode] = useState<"DNA" | "Protein">("DNA");
  const [scanning, setScanning] = useState(false);

  const profile = useMemo(
    () => genes.find((gene) => gene.gene === selectedGene) ?? genes[0],
    [selectedGene],
  );

  const runScan = () => {
    if (scanning) return;

    setScanning(true);

    window.setTimeout(() => {
      setScanning(false);
    }, 2800);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#010309] px-4 py-8 text-white md:px-8">
      <Background color={profile.color} />

      <div className="relative z-10 mx-auto max-w-[1720px]">
        <header className="mb-6 flex flex-col gap-5 rounded-[30px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-2xl xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{
                  backgroundColor: profile.color,
                  boxShadow: `0 0 15px ${profile.color}`,
                }}
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/40">
                BioLayers Molecular Resolution
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Molecular Dive
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
              Navigate from genomic alteration to molecular mechanism,
              downstream pathway disruption, and biological evidence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {genes.map((gene) => {
              const active = gene.gene === selectedGene;

              return (
                <button
                  key={gene.gene}
                  onClick={() => setSelectedGene(gene.gene)}
                  className={`rounded-xl border px-4 py-2.5 font-mono text-xs transition ${
                    active
                      ? "border-white/20 bg-white/[0.1] text-white"
                      : "border-white/[0.06] bg-white/[0.025] text-white/35 hover:bg-white/[0.05] hover:text-white/70"
                  }`}
                >
                  {gene.gene}
                </button>
              );
            })}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <div className="relative min-h-[760px] overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#040812]/85 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                  Genomic viewport
                </p>

                <div className="mt-1 flex items-baseline gap-3">
                  <h2 className="text-3xl font-semibold">{profile.gene}</h2>

                  <span className="font-mono text-xs text-white/30">
                    {profile.chromosome}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-1">
                <ModeButton
                  active={sequenceMode === "DNA"}
                  onClick={() => setSequenceMode("DNA")}
                >
                  DNA
                </ModeButton>

                <ModeButton
                  active={sequenceMode === "Protein"}
                  onClick={() => setSequenceMode("Protein")}
                >
                  Protein
                </ModeButton>
              </div>
            </div>

            <div className="relative h-[570px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${profile.gene}-${sequenceMode}`}
                  initial={{
                    opacity: 0,
                    scale: 0.94,
                    filter: "blur(14px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.04,
                    filter: "blur(14px)",
                  }}
                  transition={{
                    duration: 0.55,
                  }}
                  className="absolute inset-0"
                >
                  {sequenceMode === "DNA" ? (
                    <DNAHelix profile={profile} scanning={scanning} />
                  ) : (
                    <ProteinStructure profile={profile} scanning={scanning} />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-5 top-5 rounded-xl border border-white/[0.06] bg-black/35 px-3 py-2 backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.23em] text-white/25">
                  Variant locus
                </div>

                <div
                  className="mt-1 font-mono text-xs"
                  style={{
                    color: profile.color,
                  }}
                >
                  {profile.locus}
                </div>
              </div>

              <div className="absolute right-5 top-5 text-right">
                <div className="font-mono text-[10px] text-white/20">
                  MOLECULAR SCALE
                </div>

                <div className="mt-1 font-mono text-xs text-white/45">
                  10⁻⁹ m
                </div>
              </div>

              <AnimatePresence>
                {scanning && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-0 bg-white/[0.015]"
                    />

                    <motion.div
                      className="pointer-events-none absolute inset-y-0 w-px"
                      style={{
                        background: profile.color,
                        boxShadow: `0 0 28px ${profile.color}`,
                      }}
                      initial={{
                        left: "3%",
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
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-black/25 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/25">
                    Molecular consequence
                  </div>

                  <div className="mt-1 text-sm text-white/65">
                    {profile.consequence}
                  </div>
                </div>

                <button
                  onClick={runScan}
                  disabled={scanning}
                  className="relative overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.04] px-5 py-2.5 text-xs font-medium transition hover:bg-white/[0.08]"
                >
                  <span className="relative z-10">
                    {scanning ? "Scanning locus..." : "Run molecular scan"}
                  </span>

                  {scanning && (
                    <motion.div
                      className="absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: [-70, 260],
                      }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={profile.gene}
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
                className="rounded-[30px] border border-white/[0.08] bg-[#040812]/85 p-6 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                      Alteration
                    </p>

                    <h3
                      className="mt-2 text-4xl font-semibold"
                      style={{
                        color: profile.color,
                      }}
                    >
                      {profile.alteration}
                    </h3>
                  </div>

                  <div
                    className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      borderColor: `${profile.color}40`,
                      backgroundColor: `${profile.color}12`,
                      color: profile.color,
                    }}
                  >
                    High impact
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-white/45">
                  {profile.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <ScoreCard
                    label="Biological impact"
                    score={profile.impact}
                    color={profile.color}
                  />

                  <ScoreCard
                    label="Evidence"
                    score={profile.evidence}
                    color={profile.secondary}
                  />
                </div>
              </motion.section>
            </AnimatePresence>

            <section className="rounded-[30px] border border-white/[0.08] bg-[#040812]/85 p-6 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                Pathway propagation
              </p>

              <h3 className="mt-2 text-xl font-medium">{profile.pathway}</h3>

              <div className="mt-6">
                <SignalCascade profile={profile} />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/[0.08] bg-[#040812]/85 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                    Evidence stack
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Molecular confidence
                  </h3>
                </div>

                <div
                  className="text-3xl font-semibold"
                  style={{
                    color: profile.color,
                  }}
                >
                  {profile.evidence}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <EvidenceRow
                  label="Genomic association"
                  value={96}
                  color={profile.color}
                />

                <EvidenceRow
                  label="Pathway consistency"
                  value={91}
                  color={profile.secondary}
                />

                <EvidenceRow
                  label="Literature support"
                  value={profile.evidence}
                  color="#34d399"
                />

                <EvidenceRow
                  label="Therapeutic relevance"
                  value={Math.max(72, profile.impact - 4)}
                  color="#f59e0b"
                />
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#040812]/85 backdrop-blur-xl">
          <div className="border-b border-white/[0.07] p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
              Downstream molecular network
            </p>

            <h2 className="mt-2 text-2xl font-medium">
              Signal Propagation from {profile.gene}
            </h2>
          </div>

          <div className="relative min-h-[270px] p-6 md:p-10">
            <DownstreamNetwork profile={profile} />
          </div>
        </section>

        <footer className="py-6 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
          BioLayers AI · research visualization · not clinical decision support
        </footer>
      </div>
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-xs transition ${
        active
          ? "bg-white/[0.1] text-white"
          : "text-white/30 hover:text-white/65"
      }`}
    >
      {children}
    </button>
  );
}

function DNAHelix({
  profile,
  scanning,
}: {
  profile: GeneProfile;
  scanning: boolean;
}) {
  const particles = Array.from({ length: 42 });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{
          rotate: scanning ? 360 : 0,
        }}
        transition={{
          duration: 8,
          repeat: scanning ? Infinity : 0,
          ease: "linear",
        }}
        className="relative h-[430px] w-[600px]"
      >
        <svg viewBox="0 0 600 430" className="h-full w-full">
          <defs>
            <filter id={`dna-glow-${profile.gene}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient
              id={`strand-a-${profile.gene}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={profile.color} />
              <stop offset="100%" stopColor={profile.secondary} />
            </linearGradient>
          </defs>

          {Array.from({ length: 31 }).map((_, index) => {
            const progress = index / 30;
            const y = 42 + progress * 346;
            const wave = Math.sin(progress * Math.PI * 5.4);
            const x1 = 300 + wave * 118;
            const x2 = 300 - wave * 118;
            const highlighted = index === 16;

            return (
              <g key={index}>
                <motion.line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={
                    highlighted
                      ? profile.color
                      : "rgba(255,255,255,.13)"
                  }
                  strokeWidth={highlighted ? 4 : 1.4}
                  animate={
                    highlighted
                      ? {
                          opacity: [0.45, 1, 0.45],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                  }}
                />

                <circle
                  cx={x1}
                  cy={y}
                  r={highlighted ? 7 : 3.2}
                  fill={highlighted ? profile.color : profile.secondary}
                  opacity={highlighted ? 1 : 0.58}
                  filter={
                    highlighted
                      ? `url(#dna-glow-${profile.gene})`
                      : undefined
                  }
                />

                <circle
                  cx={x2}
                  cy={y}
                  r={highlighted ? 7 : 3.2}
                  fill={highlighted ? profile.color : profile.color}
                  opacity={highlighted ? 1 : 0.58}
                  filter={
                    highlighted
                      ? `url(#dna-glow-${profile.gene})`
                      : undefined
                  }
                />
              </g>
            );
          })}

          <motion.path
            d={buildHelixPath(1)}
            fill="none"
            stroke={`url(#strand-a-${profile.gene})`}
            strokeWidth="3"
            filter={`url(#dna-glow-${profile.gene})`}
            animate={{
              opacity: [0.55, 1, 0.55],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          <motion.path
            d={buildHelixPath(-1)}
            fill="none"
            stroke={profile.secondary}
            strokeWidth="2.2"
            opacity="0.7"
            animate={{
              opacity: [0.35, 0.85, 0.35],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0.7,
            }}
          />
        </svg>

        {particles.map((_, index) => {
          const angle = (index / particles.length) * Math.PI * 2;
          const radius = 220 + (index % 4) * 20;

          return (
            <motion.span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                left: 300 + Math.cos(angle) * radius,
                top: 215 + Math.sin(angle) * radius * 0.55,
              }}
              animate={{
                opacity: [0.08, 0.6, 0.08],
                scale: [0.6, 1.4, 0.6],
              }}
              transition={{
                duration: 2.5 + (index % 6) * 0.35,
                repeat: Infinity,
                delay: index * 0.05,
              }}
            />
          );
        })}
      </motion.div>

      <motion.div
        className="absolute h-32 w-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${profile.color}22, transparent 70%)`,
        }}
        animate={{
          scale: [0.8, 1.35, 0.8],
          opacity: [0.3, 0.85, 0.3],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
        }}
      />
    </div>
  );
}

function buildHelixPath(direction: 1 | -1) {
  const points: string[] = [];

  for (let index = 0; index <= 80; index += 1) {
    const progress = index / 80;
    const y = 42 + progress * 346;
    const wave = Math.sin(progress * Math.PI * 5.4);
    const x = 300 + wave * 118 * direction;

    points.push(`${index === 0 ? "M" : "L"} ${x} ${y}`);
  }

  return points.join(" ");
}

function ProteinStructure({
  profile,
  scanning,
}: {
  profile: GeneProfile;
  scanning: boolean;
}) {
  const nodes = Array.from({ length: 28 }).map((_, index) => {
    const angle = index * 1.67;
    const radius = 32 + (index % 7) * 17;

    return {
      x: 50 + Math.cos(angle) * radius * 0.24,
      y: 50 + Math.sin(angle) * radius * 0.24,
      size: 1.6 + (index % 4) * 0.45,
    };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative h-[430px] w-[560px]"
        animate={{
          rotateY: scanning ? 360 : [0, 8, 0, -8, 0],
          rotateX: [0, -4, 0, 4, 0],
        }}
        transition={{
          rotateY: scanning
            ? {
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }
            : {
                duration: 8,
                repeat: Infinity,
              },
          rotateX: {
            duration: 7,
            repeat: Infinity,
          },
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <filter id={`protein-glow-${profile.gene}`}>
              <feGaussianBlur stdDeviation="1.5" result="blur" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {nodes.map((node, index) => {
            if (index === 0) return null;

            const previous = nodes[index - 1];

            return (
              <motion.line
                key={`line-${index}`}
                x1={previous.x}
                y1={previous.y}
                x2={node.x}
                y2={node.y}
                stroke="rgba(255,255,255,.13)"
                strokeWidth=".45"
                animate={{
                  opacity: [0.12, 0.4, 0.12],
                }}
                transition={{
                  duration: 2 + (index % 5) * 0.4,
                  repeat: Infinity,
                }}
              />
            );
          })}

          {nodes.map((node, index) => {
            const highlighted = index === 15;

            return (
              <motion.circle
                key={`node-${index}`}
                cx={node.x}
                cy={node.y}
                r={highlighted ? 3.5 : node.size}
                fill={
                  highlighted
                    ? profile.color
                    : index % 2 === 0
                      ? profile.secondary
                      : profile.color
                }
                opacity={highlighted ? 1 : 0.58}
                filter={
                  highlighted
                    ? `url(#protein-glow-${profile.gene})`
                    : undefined
                }
                animate={{
                  r: highlighted
                    ? [3, 4.2, 3]
                    : [node.size * 0.85, node.size * 1.1, node.size * 0.85],
                }}
                transition={{
                  duration: 2 + (index % 5) * 0.25,
                  repeat: Infinity,
                }}
              />
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
      <div className="text-[10px] text-white/25">{label}</div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold">{score}</div>

        <div className="text-[9px] text-white/20">/ 100</div>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${score}%`,
          }}
          transition={{
            duration: 0.9,
          }}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

function SignalCascade({
  profile,
}: {
  profile: GeneProfile;
}) {
  return (
    <div className="space-y-3">
      {[profile.gene, ...profile.downstream].map((item, index) => (
        <div key={item} className="flex items-center gap-3">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: index * 0.08,
            }}
            className="flex h-9 min-w-20 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 font-mono text-[10px]"
            style={{
              color: index === 0 ? profile.color : "rgba(255,255,255,.62)",
            }}
          >
            {item}
          </motion.div>

          {index < profile.downstream.length && (
            <div className="relative h-px flex-1 overflow-hidden bg-white/[0.07]">
              <motion.div
                className="absolute inset-y-0 w-20"
                style={{
                  background: `linear-gradient(90deg, transparent, ${profile.color}, transparent)`,
                }}
                animate={{
                  x: [-80, 250],
                }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "linear",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EvidenceRow({
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
      <div className="mb-1.5 flex justify-between text-[10px]">
        <span className="text-white/30">{label}</span>
        <span className="font-mono text-white/50">{value}%</span>
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
            duration: 0.9,
          }}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function DownstreamNetwork({
  profile,
}: {
  profile: GeneProfile;
}) {
  const nodes = [
    {
      label: profile.gene,
      x: 8,
      y: 50,
      primary: true,
    },
    {
      label: profile.downstream[0],
      x: 32,
      y: 22,
    },
    {
      label: profile.downstream[1],
      x: 32,
      y: 76,
    },
    {
      label: profile.downstream[2],
      x: 61,
      y: 31,
    },
    {
      label: profile.downstream[3],
      x: 61,
      y: 69,
    },
    {
      label: "Tumor State",
      x: 87,
      y: 50,
      terminal: true,
    },
  ];

  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [1, 4],
  ];

  return (
    <div className="relative h-[210px]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {links.map(([fromIndex, toIndex], index) => {
          const from = nodes[fromIndex];
          const to = nodes[toIndex];

          return (
            <g key={index}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,255,255,.09)"
                strokeWidth=".35"
              />

              <motion.circle
                r=".7"
                fill={profile.color}
                initial={{
                  cx: from.x,
                  cy: from.y,
                }}
                animate={{
                  cx: [from.x, to.x],
                  cy: [from.y, to.y],
                }}
                transition={{
                  duration: 2 + index * 0.15,
                  repeat: Infinity,
                  delay: index * 0.23,
                  ease: "linear",
                }}
              />
            </g>
          );
        })}
      </svg>

      {nodes.map((node) => (
        <motion.div
          key={node.label}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          whileHover={{
            scale: 1.06,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-4 py-3 text-center backdrop-blur-xl"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            borderColor: node.primary
              ? `${profile.color}55`
              : node.terminal
                ? "rgba(251,113,133,.28)"
                : "rgba(255,255,255,.08)",
            backgroundColor: node.primary
              ? `${profile.color}16`
              : "rgba(255,255,255,.035)",
            boxShadow: node.primary
              ? `0 0 30px ${profile.color}18`
              : undefined,
          }}
        >
          <div
            className="font-mono text-[10px]"
            style={{
              color: node.primary
                ? profile.color
                : node.terminal
                  ? "#fb7185"
                  : "rgba(255,255,255,.6)",
            }}
          >
            {node.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Background({
  color,
}: {
  color: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute left-[8%] top-[10%] h-[520px] w-[520px] rounded-full blur-[160px]"
        animate={{
          backgroundColor: `${color}0E`,
        }}
      />

      <div className="absolute right-[5%] top-[32%] h-[550px] w-[550px] rounded-full bg-violet-500/[0.045] blur-[160px]" />

      <div className="absolute bottom-[2%] left-[38%] h-[430px] w-[430px] rounded-full bg-cyan-500/[0.035] blur-[150px]" />

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {Array.from({ length: 34 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-px w-px rounded-full bg-white"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 61) % 100}%`,
          }}
          animate={{
            opacity: [0.08, 0.5, 0.08],
          }}
          transition={{
            duration: 2.5 + (index % 6),
            repeat: Infinity,
            delay: index * 0.07,
          }}
        />
      ))}
    </div>
  );
}