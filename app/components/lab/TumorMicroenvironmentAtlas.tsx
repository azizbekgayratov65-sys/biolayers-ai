"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type CellType =
  | "Cancer"
  | "CAF"
  | "T Cell"
  | "Macrophage"
  | "Endothelial"
  | "Hypoxic";

type Cell = {
  id: number;
  type: CellType;
  x: number;
  y: number;
  size: number;
  signal: number;
  color: string;
};

type Interaction = {
  source: CellType;
  target: CellType;
  signal: string;
  strength: number;
  color: string;
};

const cellColors: Record<CellType, string> = {
  Cancer: "#fb7185",
  CAF: "#f59e0b",
  "T Cell": "#a15cff",
  Macrophage: "#a78bfa",
  Endothelial: "#34d399",
  Hypoxic: "#64748b",
};

const interactions: Interaction[] = [
  {
    source: "CAF",
    target: "Cancer",
    signal: "TGF-β",
    strength: 88,
    color: "#f59e0b",
  },
  {
    source: "Macrophage",
    target: "Cancer",
    signal: "IL-6",
    strength: 76,
    color: "#a78bfa",
  },
  {
    source: "Cancer",
    target: "Endothelial",
    signal: "VEGF",
    strength: 91,
    color: "#34d399",
  },
  {
    source: "T Cell",
    target: "Cancer",
    signal: "Cytotoxicity",
    strength: 64,
    color: "#a15cff",
  },
  {
    source: "Cancer",
    target: "CAF",
    signal: "PDGF",
    strength: 72,
    color: "#fb7185",
  },
];

const cells: Cell[] = Array.from({ length: 110 }, (_, index) => {
  const types: CellType[] = [
    "Cancer",
    "Cancer",
    "Cancer",
    "CAF",
    "CAF",
    "T Cell",
    "Macrophage",
    "Endothelial",
    "Hypoxic",
  ];

  const type = types[index % types.length];
  const angle = index * 2.399963;
  const radius = 10 + ((index * 17) % 42);

  return {
    id: index,
    type,
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius * 0.82,
    size: 5 + ((index * 7) % 8),
    signal: 30 + ((index * 13) % 70),
    color: cellColors[type],
  };
});

export default function TumorMicroenvironmentAtlas() {
  const [selectedType, setSelectedType] = useState<CellType | "All">("All");
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [showSignals, setShowSignals] = useState(true);
  const [scanMode, setScanMode] = useState(false);

  const selectedCell = useMemo(
    () => cells.find((cell) => cell.id === selectedCellId) ?? null,
    [selectedCellId],
  );

  const visibleCells = useMemo(() => {
    if (selectedType === "All") {
      return cells;
    }

    return cells.filter((cell) => cell.type === selectedType);
  }, [selectedType]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030507] text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-[1720px] px-4 pb-20 pt-8 md:px-8">
        <header className="mb-6 flex flex-col gap-6 rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.9)]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-emerald-200/70">
                BioLayers Spatial Biology
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Tumor Microenvironment Atlas
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
              Explore spatial organization, cell-state diversity, stromal
              structure, immune infiltration, and intercellular signaling
              inside a simulated tumor ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <HeaderChip label="Tissue" value="Prostate" />
            <HeaderChip label="Mode" value="Spatial" />
            <HeaderChip label="Cells" value={String(cells.length)} />
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr_.8fr]">
          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
              <PanelHeader eyebrow="Cell populations" title="Spatial Layers" />

              <div className="mt-5 space-y-2">
                <FilterButton
                  label="All populations"
                  count={cells.length}
                  active={selectedType === "All"}
                  color="#ffffff"
                  onClick={() => setSelectedType("All")}
                />

                {(Object.keys(cellColors) as CellType[]).map((type) => {
                  const count = cells.filter((cell) => cell.type === type).length;

                  return (
                    <FilterButton
                      key={type}
                      label={type}
                      count={count}
                      active={selectedType === type}
                      color={cellColors[type]}
                      onClick={() => setSelectedType(type)}
                    />
                  );
                })}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
              <PanelHeader eyebrow="Spatial summary" title="Tissue Composition" />

              <div className="mt-5 space-y-4">
                <CompositionRow label="Cancer cells" value={39} color="#fb7185" />
                <CompositionRow label="CAFs" value={21} color="#f59e0b" />
                <CompositionRow label="T cells" value={14} color="#a15cff" />
                <CompositionRow
                  label="Macrophages"
                  value={11}
                  color="#a78bfa"
                />
                <CompositionRow
                  label="Endothelial"
                  value={8}
                  color="#34d399"
                />
                <CompositionRow
                  label="Hypoxic zones"
                  value={7}
                  color="#64748b"
                />
              </div>
            </section>
          </aside>

          <section className="relative min-h-[800px] overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#040812]/88 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                  Spatial tissue map
                </p>

                <h2 className="mt-1 text-xl font-medium">
                  Tumor Ecosystem
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignals((value) => !value)}
                  className={`rounded-xl border px-4 py-2 text-xs transition ${
                    showSignals
                      ? "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-100"
                      : "border-white/[0.08] bg-white/[0.025] text-white/35"
                  }`}
                >
                  Signals
                </button>

                <button
                  onClick={() => setScanMode((value) => !value)}
                  className={`rounded-xl border px-4 py-2 text-xs transition ${
                    scanMode
                      ? "border-violet-300/20 bg-violet-300/[0.08] text-violet-100"
                      : "border-white/[0.08] bg-white/[0.025] text-white/35"
                  }`}
                >
                  Spatial Scan
                </button>
              </div>
            </div>

            <div className="relative h-[640px] overflow-hidden">
              <TissueMap
                visibleCells={visibleCells}
                selectedCellId={selectedCellId}
                onSelectCell={setSelectedCellId}
                showSignals={showSignals}
                scanMode={scanMode}
              />

              <div className="absolute left-5 top-5 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                  Active layer
                </div>

                <div className="mt-1 font-mono text-xs text-white/60">
                  {selectedType}
                </div>
              </div>

              <div className="absolute right-5 top-5 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 text-right backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                  Visible cells
                </div>

                <div className="mt-1 font-mono text-xs text-emerald-300">
                  {visibleCells.length}
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-black/25 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Immune infiltration" value="34%" />
                <MiniMetric label="Stromal density" value="41%" />
                <MiniMetric label="Hypoxic fraction" value="17%" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={selectedCell ? selectedCell.id : "empty"}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl"
              >
                <PanelHeader
                  eyebrow="Cell inspector"
                  title={selectedCell ? selectedCell.type : "Select a Cell"}
                />

                {selectedCell ? (
                  <div className="mt-5">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                          Cell ID
                        </span>

                        <span className="font-mono text-xs text-white/50">
                          CELL-{selectedCell.id.toString().padStart(3, "0")}
                        </span>
                      </div>

                      <div
                        className="mt-4 text-3xl font-semibold"
                        style={{ color: selectedCell.color }}
                      >
                        {selectedCell.type}
                      </div>

                      <div className="mt-5">
                        <SignalBar
                          label="Activity"
                          value={selectedCell.signal}
                          color={selectedCell.color}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <InfoTile label="Spatial X" value={selectedCell.x.toFixed(1)} />
                      <InfoTile label="Spatial Y" value={selectedCell.y.toFixed(1)} />
                      <InfoTile label="State" value="Active" />
                      <InfoTile label="Confidence" value="0.93" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/[0.08] p-6 text-center text-sm leading-6 text-white/30">
                    Click a cell inside the tissue map to inspect its spatial and
                    signaling state.
                  </div>
                )}
              </motion.section>
            </AnimatePresence>

            <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
              <PanelHeader
                eyebrow="Communication network"
                title="Cell-Cell Signaling"
              />

              <div className="mt-5 space-y-3">
                {interactions.map((interaction) => (
                  <article
                    key={`${interaction.source}-${interaction.target}-${interaction.signal}`}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium text-white/75">
                          {interaction.source}
                          <span className="mx-2 text-white/20">→</span>
                          {interaction.target}
                        </div>

                        <div
                          className="mt-1 font-mono text-[10px]"
                          style={{ color: interaction.color }}
                        >
                          {interaction.signal}
                        </div>
                      </div>

                      <div className="font-mono text-xs text-white/40">
                        {interaction.strength}
                      </div>
                    </div>

                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${interaction.strength}%`,
                          backgroundColor: interaction.color,
                          boxShadow: `0 0 12px ${interaction.color}55`,
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
              Biological interpretation
            </p>

            <h2 className="mt-2 text-2xl font-medium">
              Microenvironment Programs
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ProgramCard
              title="CAF Activation"
              description="Activated fibroblast signaling supports matrix remodeling and tumor-stroma communication."
              score={88}
              color="#f59e0b"
            />

            <ProgramCard
              title="Immune Exclusion"
              description="Spatial segregation suggests incomplete immune penetration into the tumor core."
              score={73}
              color="#a15cff"
            />

            <ProgramCard
              title="Angiogenic Signaling"
              description="VEGF-associated signaling supports vascular remodeling and nutrient delivery."
              score={91}
              color="#34d399"
            />

            <ProgramCard
              title="Hypoxic Stress"
              description="Localized low-oxygen regions may promote adaptive and invasive tumor states."
              score={67}
              color="#94a3b8"
            />
          </div>
        </section>

        <footer className="py-6 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
          BioLayers AI · spatial tumor ecosystem simulation · not clinical decision support
        </footer>
      </div>
    </main>
  );
}

function TissueMap({
  visibleCells,
  selectedCellId,
  onSelectCell,
  showSignals,
  scanMode,
}: {
  visibleCells: Cell[];
  selectedCellId: number | null;
  onSelectCell: (id: number) => void;
  showSignals: boolean;
  scanMode: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] max-w-[78vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06] bg-gradient-to-br from-white/[0.025] via-violet-500/[0.03] to-rose-500/[0.025] shadow-[0_0_120px_rgba(161,92,255,.08)]">
        <div className="absolute inset-[9%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[20%] rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[33%] rounded-full border border-white/[0.03]" />

        {visibleCells.map((cell) => {
          const selected = selectedCellId === cell.id;

          return (
            <motion.button
              key={cell.id}
              onClick={() => onSelectCell(cell.id)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: 1,
                scale: selected ? 1.5 : [0.9, 1.08, 0.9],
              }}
              transition={{
                scale: {
                  duration: 2 + (cell.id % 5) * 0.25,
                  repeat: selected ? 0 : Infinity,
                },
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                left: `${cell.x}%`,
                top: `${cell.y}%`,
                width: cell.size,
                height: cell.size,
                borderColor: selected
                  ? "#ffffff"
                  : `${cell.color}88`,
                backgroundColor: `${cell.color}44`,
                boxShadow: selected
                  ? `0 0 20px ${cell.color}`
                  : `0 0 10px ${cell.color}55`,
              }}
              aria-label={`${cell.type} cell`}
            />
          );
        })}

        {showSignals &&
          interactions.map((interaction, index) => {
            const source = visibleCells.find(
              (cell) => cell.type === interaction.source,
            );
            const target = visibleCells
              .slice()
              .reverse()
              .find((cell) => cell.type === interaction.target);

            if (!source || !target) return null;

            return (
              <svg
                key={index}
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
              >
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={`${interaction.color}33`}
                  strokeWidth=".35"
                  strokeDasharray="1.2 1.6"
                />

                <motion.circle
                  r=".8"
                  fill={interaction.color}
                  initial={{
                    cx: source.x,
                    cy: source.y,
                  }}
                  animate={{
                    cx: [source.x, target.x],
                    cy: [source.y, target.y],
                  }}
                  transition={{
                    duration: 2 + index * 0.4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            );
          })}

        {scanMode && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-px bg-cyan-200 shadow-[0_0_24px_rgba(161,92,255,.9)]"
            animate={{
              top: ["5%", "95%", "5%"],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </div>
  );
}

function PanelHeader({
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

      <h2 className="mt-2 text-lg font-semibold text-white/90">
        {title}
      </h2>
    </div>
  );
}

function HeaderChip({
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

function FilterButton({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-white/15 bg-white/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.045]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: active ? `0 0 12px ${color}` : undefined,
            }}
          />

          <span className="text-sm text-white/70">
            {label}
          </span>
        </div>

        <span className="font-mono text-[10px] text-white/30">
          {count}
        </span>
      </div>
    </button>
  );
}

function CompositionRow({
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
      <div className="mb-2 flex justify-between text-[10px]">
        <span className="text-white/30">{label}</span>
        <span className="font-mono text-white/45">{value}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
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

function SignalBar({
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
      <div className="mb-2 flex justify-between text-[10px]">
        <span className="text-white/30">{label}</span>
        <span className="font-mono text-white/45">{value}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>
      <div className="mt-2 font-mono text-xs text-white/60">
        {value}
      </div>
    </div>
  );
}

function ProgramCard({
  title,
  description,
  score,
  color,
}: {
  title: string;
  description: string;
  score: number;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />

        <span className="font-mono text-xs text-white/35">
          {score}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/35">
        {description}
      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </article>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-12%] top-[-15%] h-[650px] w-[650px] rounded-full bg-emerald-500/[0.05] blur-[170px]" />

      <div className="absolute right-[-12%] top-[18%] h-[650px] w-[650px] rounded-full bg-violet-500/[0.06] blur-[180px]" />

      <div className="absolute bottom-[-10%] left-[35%] h-[500px] w-[500px] rounded-full bg-rose-500/[0.04] blur-[160px]" />

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