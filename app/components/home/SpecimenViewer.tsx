"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  BBBC039_CELLS,
  BBBC039_SPECIMEN,
  type SpecimenCell,
  type SpecimenFlag,
} from "../../lib/specimens/bbbc039Specimen";
import EvidenceTag from "./EvidenceTag";

const FLAG_STYLE: Record<SpecimenFlag, { stroke: string; label: string }> = {
  none: { stroke: "#74dda4", label: "No flag" },
  abnormal: { stroke: "#ffc53d", label: "Abnormal shape" },
  apoptotic: { stroke: "#ff5a73", label: "Possibly dying" },
  edge: { stroke: "#66757f", label: "Cut by image edge" },
};

const FLAG_ORDER: SpecimenFlag[] = ["none", "abnormal", "apoptotic", "edge"];

// Cells you can step through: the ones whose whole shape is in frame.
const STEPPABLE = BBBC039_CELLS.filter((cell) => cell.flag !== "edge");

const DEFAULT_CELL_ID = 41;

function inferenceText(cell: SpecimenCell): string {
  switch (cell.flag) {
    case "abnormal":
      return `Flagged for abnormal shape by rule ${cell.rule}. A flag, not a diagnosis.`;
    case "apoptotic":
      return `Small, compact, bright nucleus: flagged as possibly dying by rule ${cell.rule}.`;
    case "edge":
      return "Cut by the image edge, so its shape was not assessed.";
    default:
      return "No flag raised. Whether it migrates or divides needs a time-lapse, not one frame.";
  }
}

export default function SpecimenViewer() {
  const [showOutlines, setShowOutlines] = useState(true);
  const [selectedId, setSelectedId] = useState(DEFAULT_CELL_ID);
  // The scan-in reveal waits until the specimen is on screen, so phone
  // visitors (where it sits below the fold) still see it happen.
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const counts = useMemo(() => {
    const result: Record<SpecimenFlag, number> = { none: 0, abnormal: 0, apoptotic: 0, edge: 0 };
    for (const cell of BBBC039_CELLS) result[cell.flag] += 1;
    return result;
  }, []);

  const selected =
    BBBC039_CELLS.find((cell) => cell.id === selectedId) ?? STEPPABLE[0];

  const step = (direction: 1 | -1) => {
    const index = STEPPABLE.findIndex((cell) => cell.id === selected.id);
    const next = (index + direction + STEPPABLE.length) % STEPPABLE.length;
    setSelectedId(STEPPABLE[next].id);
  };

  const { width, height } = BBBC039_SPECIMEN;

  return (
    <figure className="w-full">
      <div
        ref={frameRef}
        className="relative overflow-hidden rounded-[20px] border border-teal-500/25 bg-black shadow-2xl"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={BBBC039_SPECIMEN.imageSrc}
          alt="Fluorescence micrograph of about a hundred U2OS cell nuclei stained with Hoechst."
          width={width}
          height={height}
          priority
          unoptimized
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Blue lookup table: maps the grayscale Hoechst channel to blue */}
        <div aria-hidden="true" className="absolute inset-0 bg-[#7ea6ff] mix-blend-multiply" />

        {showOutlines && inView && (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`AI segmentation outlines for ${BBBC039_CELLS.length} nuclei`}
          >
            {BBBC039_CELLS.map((cell) => {
              const isSelected = cell.id === selected.id;
              return (
                <polygon
                  key={cell.id}
                  points={cell.points}
                  onClick={() => setSelectedId(cell.id)}
                  className="specimen-outline cursor-pointer"
                  style={{ animationDelay: `${Math.round((cell.x / width) * 900)}ms` }}
                  fill={isSelected ? "rgba(242,245,247,0.18)" : "transparent"}
                  stroke={isSelected ? "#f2f5f7" : FLAG_STYLE[cell.flag].stroke}
                  strokeWidth={isSelected ? 2.5 : 1.4}
                  strokeDasharray={cell.flag === "edge" ? "3 3" : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          role="switch"
          aria-checked={showOutlines}
          onClick={() => setShowOutlines((on) => !on)}
          className="inline-flex min-h-10 items-center gap-2.5 rounded-md text-sm text-ink"
        >
          <span
            aria-hidden="true"
            className={`relative h-5 w-9 rounded-full transition-colors ${
              showOutlines ? "bg-hoechst" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-field transition-transform ${
                showOutlines ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          AI segmentation
        </button>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-graphite" aria-label="Outline colours">
          {FLAG_ORDER.map((flag) => (
            <li key={flag} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: FLAG_STYLE[flag].stroke }}
              />
              {FLAG_STYLE[flag].label} <span className="tabular-nums text-graphite-soft">{counts[flag]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-[24px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-4" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-ink-strong">Nucleus {selected.id}</p>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous nucleus"
              className="flex h-10 w-10 items-center justify-center rounded-md text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next nucleus"
              className="flex h-10 w-10 items-center justify-center rounded-md text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-2">
          <EvidenceTag level="observed" />
          <dl className="mt-2 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Area</dt>
              <dd className="tabular-nums text-ink-strong">
                {selected.areaUm2} µm²{selected.flag === "edge" ? " (partial)" : ""}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Circularity</dt>
              <dd className="tabular-nums text-ink-strong">{selected.circularity.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Solidity</dt>
              <dd className="tabular-nums text-ink-strong">{selected.solidity.toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4">
          <EvidenceTag level="inferred" />
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{inferenceText(selected)}</p>
        </div>

        <p className="mt-4 text-sm text-graphite-soft">
          Model score {selected.confidence.toFixed(2)}. This is Cellpose&rsquo;s own confidence,
          not a calibrated error rate.
        </p>
      </div>

      <figcaption className="mt-3 text-sm leading-relaxed text-graphite">
        U2OS nuclei, Hoechst stain, 20×, shown with a blue lookup table. Image from{" "}
        <a
          href="https://bbbc.broadinstitute.org/BBBC039"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
        >
          BBBC039
        </a>{" "}
        (Broad Institute, CC0). Outlines by Cellpose with no fine-tuning. Click a nucleus to read it.
      </figcaption>
    </figure>
  );
}
