"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  ExternalLink,
  Info,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Wind,
} from "lucide-react";

import { Eyebrow } from "../../ui/Chrome";
import { btnQuiet, btnSecondary, insetPanel, monoLabel, pageShell, panel, sectionLabel, textLink } from "../../ui/styles";
import {
  BASELINE_DIAMETER_MM,
  MAX_MONTH,
  SCENARIOS,
  diameterSeries,
  progressionMonth,
  tumorStateAt,
  type ScenarioId,
  type TumorState,
} from "./lungModel";
import type { HoverInfo, LungSceneHandle, PickId, ViewMode } from "./lungScene";
import { CELL_CATEGORIES, type CellCategoryId } from "./lungCells";
import { LYMPH_NODES, type LymphNodeInfo } from "./lungNodes";

/* ---------- static content ---------- */

const CASE = {
  id: "BL-LUNG-0001",
  summary: "62-year-old never-smoker, lung adenocarcinoma",
  stage: "cT1c N1 M1b · stage IVA (AJCC 8th)",
  primary: "Right upper lobe, spiculated solid nodule",
  metastasis: "Single left adrenal metastasis (outside this view)",
  biomarkers: [
    { label: "EGFR", value: "Exon 19 deletion", tone: "text-amber-200" },
    { label: "ALK", value: "Negative", tone: "text-slate-300" },
    { label: "KRAS", value: "Wild type", tone: "text-slate-300" },
    { label: "PD-L1 TPS", value: "5%", tone: "text-slate-300" },
  ],
};

const PUBMED_QUERY = "https://pubmed.ncbi.nlm.nih.gov/?term=osimertinib+resistance+EGFR+exon+19+deletion";

/* ---------- component ---------- */

export default function LungExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LungSceneHandle | null>(null);

  const [ready, setReady] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [hidden, setHidden] = useState<Partial<Record<CellCategoryId, boolean>>>({});
  const [counts, setCounts] = useState<Record<CellCategoryId, number> | null>(null);
  const [view, setView] = useState<ViewMode>("anatomy");
  const [scenario, setScenario] = useState<ScenarioId>("osimertinib");
  const [month, setMonth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [breathing, setBreathing] = useState(true);
  const [selected, setSelected] = useState<PickId>("tumor");
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const tumor = useMemo(() => tumorStateAt(scenario, month), [scenario, month]);
  const series = useMemo(() => diameterSeries(scenario), [scenario]);
  const pdMonth = useMemo(() => progressionMonth(scenario), [scenario]);
  const scenarioInfo = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0];

  /* Mount the three.js scene once. */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./lungScene")
      .then(({ createLungScene }) => {
        if (disposed) return;
        try {
          const handle = createLungScene(container, {
            reducedMotion,
            onPick: (id) => setSelected(id),
            onHover: (h) => setHover(h),
          });
          sceneRef.current = handle;
          setCounts({ ...handle.counts });
          setReady(true);
        } catch (error) {
          console.error("[BioLayers] WebGL scene failed to start", error);
          setWebglError(true);
        }
      })
      .catch((error: unknown) => {
        console.error("[BioLayers] Could not load the lung scene", error);
        setWebglError(true);
      });

    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  /* Keep the scene in step with React state. */
  useEffect(() => {
    sceneRef.current?.setTumorState(tumor.diameterMm / BASELINE_DIAMETER_MM, tumor.resistantFraction);
  }, [ready, tumor]);

  useEffect(() => {
    sceneRef.current?.setSelected(selected);
  }, [ready, selected]);

  /* Timeline playback. Playback stops by itself at the last month. */
  const isPlaying = playing && month < MAX_MONTH;
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setMonth((m) => Math.min(MAX_MONTH, Math.round((m + 0.25) * 100) / 100));
    }, 110);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  const toggleCategory = (id: CellCategoryId) => {
    const nextHidden = !hidden[id];
    setHidden((prev) => ({ ...prev, [id]: nextHidden }));
    sceneRef.current?.setCategoryVisible(id, !nextHidden);
  };

  const switchView = (next: ViewMode) => {
    setView(next);
    sceneRef.current?.setView(next);
  };

  /* Tumour cells flip from sensitive to resistant one by one as resistance grows. */
  const legendCount = (id: CellCategoryId) => {
    if (!counts) return null;
    const tumourTotal = counts.tumorSensitive + counts.tumorResistant;
    const nResistant = Math.max(0, Math.min(tumourTotal, Math.ceil(tumor.resistantFraction * tumourTotal - 0.5)));
    if (id === "tumorSensitive") return tumourTotal - nResistant;
    if (id === "tumorResistant") return nResistant;
    return counts[id];
  };
  const totalCells = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  const toggleBreathing = () => {
    const next = !breathing;
    setBreathing(next);
    sceneRef.current?.setBreathing(next);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    if (month >= MAX_MONTH) setMonth(0);
    setPlaying(true);
  };

  const selectedNode: LymphNodeInfo | undefined = selected.startsWith("node:")
    ? LYMPH_NODES.find((n) => `node:${n.station}` === selected)
    : undefined;

  return (
    <div className="relative overflow-hidden">
      <div className={`${pageShell} pt-28 pb-24 sm:pt-32`}>
        {/* Header */}
        <div className="max-w-3xl">
          <Eyebrow icon={Wind}>Organ atlas · Lung</Eyebrow>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl">
            A living model of lung cancer
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Every point is one cell. Break the lung apart into a cell atlas, follow each cell type through its
            signalling pathways to the drugs that target them, and watch resistant cells take over during treatment.
          </p>
          <Link
            href="/organs/lung/ct"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Open the real CT archive <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <p role="note" className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Illustrative model on a synthetic case: cells are sampled and generated by code. Not patient data, not for
          clinical use. Real scans live in the CT archive.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Viewer */}
          <section className={`${panel} relative overflow-hidden lg:col-span-8`} aria-label="3D lung viewer">
            <div
              ref={containerRef}
              className="relative h-[460px] w-full cursor-grab bg-[#03060b] sm:h-[580px]"
              aria-label="Interactive 3D model of the lungs drawn as one point per cell. Drag to rotate, scroll to zoom, hover a point to name the cell, click the tumour or a lymph node for details."
              role="img"
            />

            {!ready && !webglError && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className={monoLabel}>Placing cells…</span>
              </div>
            )}
            {webglError && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-slate-300">
                This browser could not start WebGL, so the 3D model cannot be shown. Try a recent Chrome, Edge,
                Firefox or Safari with hardware acceleration on.
              </div>
            )}

            {hover && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[125%] whitespace-nowrap rounded-lg border border-white/10 bg-[#000000]/90 px-3 py-2 shadow-lg"
                style={{ left: hover.x, top: hover.y }}
              >
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <span className="h-2 w-2 rounded-full" style={{ background: hover.color }} aria-hidden="true" />
                  {hover.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{hover.detail}</p>
              </div>
            )}

            {/* View switch */}
            <div
              role="group"
              aria-label="View"
              className="absolute left-3 top-3 inline-flex rounded-full border border-white/10 bg-[#000000]/70 p-1 backdrop-blur-xl"
            >
              {(
                [
                  { id: "anatomy", label: "Anatomy" },
                  { id: "atlas", label: "Cell atlas" },
                  { id: "flow", label: "Flows" },
                ] as { id: ViewMode; label: string }[]
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={view === v.id}
                  onClick={() => switchView(v.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    view === v.id ? "bg-emerald-400/20 text-emerald-100" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* View controls */}
            <div className="absolute right-3 top-14 flex flex-col gap-1.5 sm:top-3">
              <button
                type="button"
                className={btnQuiet}
                aria-label="Fly into tumour"
                title="Fly into tumour"
                onClick={() => sceneRef.current?.focusTumor()}
              >
                <Crosshair className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Fly into tumour</span>
              </button>
              <button
                type="button"
                className={btnQuiet}
                aria-label="Reset view"
                title="Reset view"
                onClick={() => sceneRef.current?.resetView()}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Reset view</span>
              </button>
              <button
                type="button"
                className={btnQuiet}
                aria-pressed={breathing}
                aria-label={breathing ? "Pause breathing" : "Resume breathing"}
                title={breathing ? "Pause breathing" : "Resume breathing"}
                onClick={toggleBreathing}
              >
                <Wind className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{breathing ? "Breathing" : "Paused"}</span>
              </button>
            </div>

            {/* Legend: one entry per cell category, click to hide or show */}
            <div className="border-t border-white/[0.06] bg-[#000000]/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                  <span className={monoLabel}>Cells by type · click to hide</span>
                </span>
                {totalCells !== null && (
                  <span className="font-mono text-[11px] text-slate-400">{totalCells.toLocaleString("en-US")} cells</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CELL_CATEGORIES.map((c) => {
                  const off = Boolean(hidden[c.id]);
                  const n = legendCount(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.description}
                      aria-pressed={!off}
                      onClick={() => toggleCategory(c.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                        off
                          ? "border-white/[0.06] bg-transparent text-slate-500 line-through"
                          : "border-white/15 bg-white/[0.05] text-slate-100 hover:border-white/25"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: c.color, opacity: off ? 0.25 : 1 }}
                        aria-hidden="true"
                      />
                      {c.label}
                      {n !== null && <span className="font-mono font-normal text-slate-400">{n.toLocaleString("en-US")}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {view === "flow" && (
              <p className="border-t border-white/[0.06] px-4 py-3 text-xs leading-relaxed text-slate-400">
                Each point streams from its cell type, through the signalling pathway it relies on, to a drug that
                acts there. Play the timeline: as resistant cells appear, their streams switch from the EGFR route to
                MET. Illustrative mapping, not a treatment guide.
              </p>
            )}

            {/* Timeline */}
            <div className="border-t border-white/[0.06] bg-[#000000]/60 px-4 py-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={monoLabel}>Scenario</span>
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={scenario === s.id}
                    onClick={() => setScenario(s.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      scenario === s.id
                        ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-400/15 text-emerald-100 transition hover:bg-emerald-400/25"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <label className="flex flex-1 items-center gap-3">
                  <span className="sr-only">Months since start of treatment</span>
                  <input
                    type="range"
                    min={0}
                    max={MAX_MONTH}
                    step={0.25}
                    value={month}
                    onChange={(e) => {
                      setPlaying(false);
                      setMonth(Number(e.target.value));
                    }}
                    className="h-1.5 w-full cursor-pointer accent-emerald-400"
                  />
                </label>
                <span className="w-24 shrink-0 text-right font-mono text-sm text-slate-200">
                  Month {month.toFixed(month % 1 === 0 ? 0 : 1)}
                </span>
              </div>
            </div>
          </section>

          {/* Side panel */}
          <aside className="flex flex-col gap-4 lg:col-span-4">
            <TumorPanel tumor={tumor} scenarioDescription={scenarioInfo.description} pdMonth={pdMonth} />
            <div className={`${panel} p-5`}>
              <p className={sectionLabel}>Growth curve</p>
              <DiameterChart series={series} month={month} pdMonth={pdMonth} />
            </div>
            {selectedNode ? (
              <NodePanel node={selectedNode} onBack={() => setSelected("tumor")} />
            ) : (
              <CasePanel />
            )}
          </aside>
        </div>

      </div>
    </div>
  );
}

/* ---------- panels ---------- */

function TumorPanel({
  tumor,
  scenarioDescription,
  pdMonth,
}: {
  tumor: TumorState;
  scenarioDescription: string;
  pdMonth: number | null;
}) {
  const recistTone =
    tumor.recist === "Progressive disease"
      ? "border-rose-400/40 bg-rose-400/10 text-rose-100"
      : tumor.recist === "Partial response"
        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
        : "border-white/15 bg-white/[0.05] text-slate-200";
  const change = tumor.changeFromBaselinePct;

  return (
    <div className={`${panel} p-5`}>
      <p className={sectionLabel}>Primary tumour</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-4xl font-semibold text-white">
            {tumor.diameterMm.toFixed(1)}
            <span className="ml-1 text-base text-slate-400">mm</span>
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {change === 0 ? "Baseline diameter" : `${change > 0 ? "+" : ""}${change.toFixed(0)}% from baseline`}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${recistTone}`}>{tumor.recist}</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Drug-resistant share of tumour</span>
          <span className="font-mono text-slate-200">{(tumor.resistantFraction * 100).toFixed(0)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-500"
            style={{ width: `${Math.max(2, tumor.resistantFraction * 100)}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-400">{scenarioDescription}</p>
      {pdMonth !== null && (
        <p className="mt-2 text-xs text-slate-500">Simplified RECIST reading turns progressive at month {pdMonth}.</p>
      )}
    </div>
  );
}

function CasePanel() {
  return (
    <div className={`${panel} p-5`}>
      <div className="flex items-center justify-between">
        <p className={sectionLabel}>Demo case</p>
        <span className="font-mono text-[10px] text-slate-500">{CASE.id} · synthetic</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{CASE.summary}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Stage</dt>
          <dd className="text-slate-200">{CASE.stage}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Primary</dt>
          <dd className="text-slate-200">{CASE.primary}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Metastasis</dt>
          <dd className="text-slate-200">{CASE.metastasis}</dd>
        </div>
      </dl>
      <div className={`${insetPanel} mt-4 grid grid-cols-2 gap-3 p-3`}>
        {CASE.biomarkers.map((b) => (
          <div key={b.label}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{b.label}</p>
            <p className={`text-sm font-semibold ${b.tone}`}>{b.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Link href="/cipher" className={btnSecondary}>
          EGFR pathway in Cipher <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a href={PUBMED_QUERY} target="_blank" rel="noopener noreferrer" className={`${textLink} inline-flex items-center gap-1.5 text-sm`}>
          Papers on osimertinib resistance <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function NodePanel({ node, onBack }: { node: LymphNodeInfo; onBack: () => void }) {
  const suspicious = node.status === "suspicious";
  return (
    <div className={`${panel} p-5`}>
      <p className={sectionLabel}>Lymph node · station {node.station}</p>
      <p className="mt-3 text-lg font-semibold text-white">{node.name}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Short axis</dt>
          <dd className="font-mono text-slate-200">{node.shortAxisMm} mm</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Reading</dt>
          <dd className={suspicious ? "text-amber-200" : "text-slate-200"}>
            {suspicious
              ? "Enlarged (10 mm or more on short axis). Counts as N1 disease in this case."
              : "Not enlarged."}
          </dd>
        </div>
      </dl>
      <button type="button" onClick={onBack} className={`${btnQuiet} mt-4 w-full`}>
        Back to the case
      </button>
    </div>
  );
}

/* ---------- chart ---------- */

function DiameterChart({
  series,
  month,
  pdMonth,
}: {
  series: { month: number; mm: number }[];
  month: number;
  pdMonth: number | null;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const W = 300;
  const H = 140;
  const pad = { l: 30, r: 8, t: 10, b: 22 };
  const maxMm = Math.max(40, ...series.map((p) => p.mm));
  const yMax = Math.ceil(maxMm / 10) * 10;
  const x = (m: number) => pad.l + (m / MAX_MONTH) * (W - pad.l - pad.r);
  const y = (mm: number) => pad.t + (1 - mm / yMax) * (H - pad.t - pad.b);
  const path = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.month).toFixed(1)},${y(p.mm).toFixed(1)}`).join(" ");
  const ticks = [0, yMax / 2, yMax];
  const current = series.reduce((best, p) => (Math.abs(p.month - month) < Math.abs(best.month - month) ? p : best), series[0]);
  const hovered = hoverIndex !== null ? series[hoverIndex] : null;

  return (
    <div className="relative mt-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Tumour diameter in millimetres over 24 months for the selected scenario"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const m = ((px - pad.l) / (W - pad.l - pad.r)) * MAX_MONTH;
          const idx = Math.round(Math.min(MAX_MONTH, Math.max(0, m)) / 0.5);
          setHoverIndex(Math.min(series.length - 1, Math.max(0, idx)));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">
              {t}
            </text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((m) => (
          <text key={m} x={x(m)} y={H - 6} textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
            {m}
          </text>
        ))}
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={y(BASELINE_DIAMETER_MM)}
          y2={y(BASELINE_DIAMETER_MM)}
          stroke="rgba(148,163,184,0.35)"
          strokeDasharray="3 3"
        />
        {pdMonth !== null && (
          <line x1={x(pdMonth)} x2={x(pdMonth)} y1={pad.t} y2={H - pad.b} stroke="rgba(251,113,133,0.45)" strokeDasharray="2 3" />
        )}
        <path d={path} fill="none" stroke="#5eead4" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(current.month)} cy={y(current.mm)} r={4.5} fill="#5eead4" stroke="#000000" strokeWidth={2} />
        {hovered && (
          <>
            <line x1={x(hovered.month)} x2={x(hovered.month)} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.25)" />
            <circle cx={x(hovered.month)} cy={y(hovered.mm)} r={4} fill="#e2e8f0" stroke="#000000" strokeWidth={2} />
          </>
        )}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-white/10 bg-[#000000]/95 px-2 py-1 font-mono text-[11px] text-slate-100"
          style={{ left: `${(x(hovered.month) / W) * 100}%` }}
        >
          Month {hovered.month} · {hovered.mm.toFixed(1)} mm
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span>Diameter, mm · months on x-axis</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t border-dashed border-slate-400/60" /> Baseline
        </span>
        {pdMonth !== null && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0 w-4 border-t border-dashed border-rose-400/70" /> Progression
          </span>
        )}
      </div>
    </div>
  );
}
