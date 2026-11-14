"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Scissors, Shuffle, RotateCcw } from "lucide-react";

import {
  COLLECTIONS,
  QuotaError,
  idcViewerUrl,
  listCtSeries,
  loadVolume,
  pickBestSeries,
  type Collection,
  type CtVolume,
} from "./idc";
import { CT_CLASSES, buildCtPointCloud, type CtClassId } from "./ctPoints";
import type { CtSceneHandle } from "./ctScene";

type Plane = "axial" | "coronal" | "sagittal";
type Status = "searching" | "loading" | "building" | "ready" | "notfound" | "error";

const WINDOWS = [
  { id: "lung", label: "Lung", level: -600, width: 1500 },
  { id: "soft", label: "Soft tissue", level: 40, width: 400 },
  { id: "bone", label: "Bone", level: 400, width: 1800 },
] as const;
type WindowId = (typeof WINDOWS)[number]["id"];

const PLANES: { id: Plane; label: string }[] = [
  { id: "axial", label: "Axial" },
  { id: "coronal", label: "Coronal" },
  { id: "sagittal", label: "Sagittal" },
];

function planeDepth(v: CtVolume, plane: Plane) {
  return plane === "axial" ? v.depth : plane === "coronal" ? v.height : v.width;
}

/* Draws one slice of the volume into the canvas, keeping true proportions. */
function drawSlice(canvas: HTMLCanvasElement, v: CtVolume, plane: Plane, index: number, level: number, width: number) {
  const W = v.width;
  const H = v.height;
  const D = v.depth;
  let cols: number;
  let rows: number;
  let pxW: number;
  let pxH: number;
  if (plane === "axial") {
    cols = W;
    rows = H;
    pxW = v.spacing[0];
    pxH = v.spacing[1];
  } else if (plane === "coronal") {
    cols = W;
    rows = D;
    pxW = v.spacing[0];
    pxH = v.spacing[2];
  } else {
    cols = H;
    rows = D;
    pxW = v.spacing[1];
    pxH = v.spacing[2];
  }
  const image = new ImageData(cols, rows);
  const lo = level - width / 2;
  const scale = 255 / width;
  const data = image.data;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let i: number;
      let z: number;
      if (plane === "axial") {
        z = index;
        i = index * W * H + r * W + c;
      } else if (plane === "coronal") {
        z = D - 1 - r; // superior at the top
        i = z * W * H + index * W + c;
      } else {
        z = D - 1 - r;
        i = z * W * H + c * W + index;
      }
      let g = 0;
      if (v.loaded[z]) {
        g = (v.hu[i] - lo) * scale;
        g = g < 0 ? 0 : g > 255 ? 255 : g;
      }
      const o = (r * cols + c) * 4;
      data[o] = g;
      data[o + 1] = g;
      data[o + 2] = g;
      data[o + 3] = 255;
    }
  }
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  off.getContext("2d")?.putImageData(image, 0, 0);

  const box = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(box.width * dpr));
  canvas.height = Math.max(1, Math.round(box.height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const realW = cols * pxW;
  const realH = rows * pxH;
  const fit = Math.min(canvas.width / realW, canvas.height / realH);
  const dw = realW * fit;
  const dh = realH * fit;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
}

export default function CtArchive() {
  const [collectionId, setCollectionId] = useState(COLLECTIONS[0].id);
  const [caseNumber, setCaseNumber] = useState(1);
  const [status, setStatus] = useState<Status>("searching");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [info, setInfo] = useState<{
    patientId: string;
    collection: string;
    description: string | null;
    studyUid: string;
    slices: number;
    matrix: string;
    spacing: string;
  } | null>(null);
  const [plane, setPlane] = useState<Plane>("axial");
  const [slice, setSlice] = useState<Record<Plane, number>>({ axial: 0, coronal: 0, sagittal: 0 });
  const [windowId, setWindowId] = useState<WindowId>("lung");
  const [hidden, setHidden] = useState<Partial<Record<CtClassId, boolean>>>({});
  const [cut, setCut] = useState(false);
  const [counts, setCounts] = useState<Record<CtClassId, number> | null>(null);

  const volumeRef = useRef<CtVolume | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneBoxRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CtSceneHandle | null>(null);

  const collection: Collection = COLLECTIONS.find((c) => c.id === collectionId) ?? COLLECTIONS[0];

  const loadCase = useCallback(async (col: Collection, n: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const patientId = col.patientId(n);
    setStatus("searching");
    setMessage(`Looking up ${patientId} in the archive…`);
    setProgress({ done: 0, total: 0 });
    setCounts(null);
    try {
      const series = pickBestSeries(await listCtSeries(patientId, controller.signal));
      if (!series) {
        setStatus("notfound");
        setMessage(`${patientId} has no CT series in the archive. Try the next case.`);
        return;
      }
      setStatus("loading");
      setMessage(`Downloading ${series.instances} slices of ${patientId}…`);
      let firstFrame = true;
      const volume = await loadVolume(
        col,
        patientId,
        series,
        (v, done, total) => {
          if (firstFrame) {
            firstFrame = false;
            volumeRef.current = v;
            setSlice({ axial: Math.floor(v.depth / 2), coronal: Math.floor(v.height / 2), sagittal: Math.floor(v.width / 2) });
            setInfo({
              patientId,
              collection: col.name,
              description: series.description,
              studyUid: series.studyUid,
              slices: v.depth,
              matrix: `${v.width} × ${v.height}`,
              spacing: `${v.spacing[0].toFixed(2)} × ${v.spacing[1].toFixed(2)} × ${v.spacing[2].toFixed(2)} mm`,
            });
          }
          setProgress({ done, total });
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setStatus("building");
      setMessage("Finding the lungs, airways, vessels and bone…");
      await new Promise((r) => setTimeout(r, 30));
      const cloud = buildCtPointCloud(volume);
      if (controller.signal.aborted) return;
      sceneRef.current?.setCloud(cloud);
      setCounts(cloud.counts);
      setStatus("ready");
      setMessage("");
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setMessage(
        error instanceof QuotaError
          ? "The public archive's daily viewing quota was reached. Try again tomorrow or open the case in the IDC viewer."
          : `Could not load this case: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, []);

  /* 3D scene, mounted once. */
  useEffect(() => {
    const box = sceneBoxRef.current;
    if (!box) return;
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./ctScene").then(({ createCtScene }) => {
      if (disposed) return;
      try {
        sceneRef.current = createCtScene(box, reducedMotion);
        const v = volumeRef.current;
        if (v && v.loaded.every(Boolean)) sceneRef.current.setCloud(buildCtPointCloud(v));
      } catch (error) {
        console.error("[BioLayers] WebGL scene failed to start", error);
      }
    });
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  /* First case on arrival. */
  useEffect(() => {
    void loadCase(COLLECTIONS[0], 1);
    return () => abortRef.current?.abort();
  }, [loadCase]);

  /* Redraw the 2D slice. */
  const current = slice[plane];
  const win = WINDOWS.find((w) => w.id === windowId) ?? WINDOWS[0];
  useEffect(() => {
    const v = volumeRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;
    drawSlice(canvas, v, plane, Math.min(current, planeDepth(v, plane) - 1), win.level, win.width);
  }, [plane, current, win, progress, info]);

  /* Let the mouse wheel move through slices without scrolling the page. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stop = (e: WheelEvent) => e.preventDefault();
    canvas.addEventListener("wheel", stop, { passive: false });
    return () => canvas.removeEventListener("wheel", stop);
  }, []);

  /* Keep the 3D slice plane on the axial slice. */
  useEffect(() => {
    const v = volumeRef.current;
    if (!v) return;
    sceneRef.current?.setSlice(v.depth > 1 ? slice.axial / (v.depth - 1) : 0.5);
  }, [slice.axial, status]);

  const depth = volumeRef.current ? planeDepth(volumeRef.current, plane) : 1;
  const setCurrent = (value: number) =>
    setSlice((prev) => ({ ...prev, [plane]: Math.max(0, Math.min(depth - 1, Math.round(value))) }));

  const go = (n: number) => {
    const clamped = Math.max(collection.first, Math.min(collection.last, n));
    setCaseNumber(clamped);
    void loadCase(collection, clamped);
  };

  const busy = status === "searching" || status === "loading" || status === "building";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
      <Link href="/organs/lung" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Living lung model
      </Link>
      <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">Real lung CT archive</h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-400">
        Thousands of real chest CT scans from public cancer imaging collections, streamed slice by slice from the NCI
        Imaging Data Commons. Every scan becomes a living point cloud: airways, lung tissue, vessels and nodules, and
        bone, found automatically from the density of each voxel.
      </p>

      {/* Collection + case picker */}
      <div className="mt-8 flex flex-wrap gap-2">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === collectionId}
            onClick={() => {
              setCollectionId(c.id);
              setCaseNumber(c.first);
              void loadCase(c, c.first);
            }}
            className={`rounded-full border px-4 py-2 text-left text-sm transition ${
              c.id === collectionId
                ? "border-white/40 bg-white/[0.08] text-white"
                : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
            }`}
          >
            <span className="font-semibold">{c.name}</span>
            <span className="ml-2 font-mono text-xs text-slate-500">{c.patients.toLocaleString("en-US")} patients</span>
          </button>
        ))}
      </div>
      <p className="mt-3 max-w-3xl text-sm text-slate-500">
        {collection.summary}{" "}
        <a href={collection.page} target="_blank" rel="noopener noreferrer" className="text-slate-300 underline-offset-2 hover:underline">
          Collection page, licence and citation
        </a>
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => go(caseNumber - 1)}
          disabled={caseNumber <= collection.first}
          aria-label="Previous case"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:border-white/40 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <label className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300">
          <span className="font-mono text-xs text-slate-500">CASE</span>
          <input
            type="number"
            min={collection.first}
            max={collection.last}
            value={caseNumber}
            onChange={(e) => setCaseNumber(Number(e.target.value) || collection.first)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go(caseNumber);
            }}
            className="w-16 bg-transparent font-mono text-white outline-none"
          />
          <span className="font-mono text-xs text-slate-500">{collection.patientId(caseNumber)}</span>
        </label>
        <button
          type="button"
          onClick={() => go(caseNumber + 1)}
          disabled={caseNumber >= collection.last}
          aria-label="Next case"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:border-white/40 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => go(caseNumber)}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200"
        >
          Load scan
        </button>
        <button
          type="button"
          onClick={() => go(collection.first + Math.floor(Math.random() * (collection.last - collection.first + 1)))}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/40"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" /> Random patient
        </button>
      </div>

      {/* Status line */}
      <div className="mt-5 min-h-[44px]" aria-live="polite">
        {status !== "ready" && message && (
          <div>
            <p className={`text-sm ${status === "error" || status === "notfound" ? "text-rose-300" : "text-slate-300"}`}>{message}</p>
            {status === "loading" && progress.total > 0 && (
              <div className="mt-2 h-1 max-w-md overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-white transition-[width]" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 grid gap-6 lg:grid-cols-2">
        {/* 3D point cloud */}
        <section className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-black" aria-label="3D point cloud of the scan">
          <div className="relative">
            <div
              ref={sceneBoxRef}
              className="h-[440px] w-full sm:h-[560px]"
              role="img"
              aria-label="Rotating point cloud of the chest CT. Drag to rotate, scroll to zoom."
            />
            {busy && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
                  {status === "building" ? "Building point cloud…" : "Waiting for slices…"}
                </span>
              </div>
            )}
            <div className="absolute right-3 top-3 flex gap-1.5">
              <button
                type="button"
                aria-pressed={cut}
                title="Cut the cloud at the current axial slice"
                onClick={() => {
                  setCut(!cut);
                  sceneRef.current?.setCut(!cut);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  cut ? "border-white/40 bg-white/10 text-white" : "border-white/15 text-slate-300 hover:border-white/30"
                }`}
              >
                <Scissors className="h-3.5 w-3.5" aria-hidden="true" /> Cut at slice
              </button>
              <button
                type="button"
                aria-label="Reset view"
                onClick={() => sceneRef.current?.resetView()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-white/30"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-4 py-3">
            {CT_CLASSES.map((c) => {
              const off = Boolean(hidden[c.id]);
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.description}
                  aria-pressed={!off}
                  onClick={() => {
                    setHidden((prev) => ({ ...prev, [c.id]: !off }));
                    sceneRef.current?.setClassVisible(c.id, off);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    off ? "border-white/[0.06] text-slate-500 line-through" : "border-white/15 text-slate-100 hover:border-white/25"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color, opacity: off ? 0.25 : 1 }} aria-hidden="true" />
                  {c.label}
                  {counts && <span className="font-mono font-normal text-slate-400">{counts[c.id].toLocaleString("en-US")}</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2D slices */}
        <section className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-black" aria-label="CT slice viewer">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
            <div className="inline-flex rounded-full border border-white/10 p-1">
              {PLANES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={plane === p.id}
                  onClick={() => setPlane(p.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    plane === p.id ? "bg-white text-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-white/10 p-1">
              {WINDOWS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={windowId === w.id}
                  title={`Window level ${w.level}, width ${w.width} HU`}
                  onClick={() => setWindowId(w.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    windowId === w.id ? "bg-white text-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="h-[440px] w-full sm:h-[500px]"
            role="img"
            aria-label={`${plane} CT slice ${current + 1} of ${depth}. Scroll to move through the slices.`}
            onWheel={(e) => setCurrent(current + (e.deltaY > 0 ? 1 : -1))}
          />
          <div className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, depth - 1)}
              value={Math.min(current, depth - 1)}
              onChange={(e) => setCurrent(Number(e.target.value))}
              aria-label="Slice"
              className="h-1.5 w-full cursor-pointer accent-white"
            />
            <span className="w-24 shrink-0 text-right font-mono text-xs text-slate-400">
              {current + 1} / {depth}
            </span>
          </div>
        </section>
      </div>

      {/* Case details */}
      {info && (
        <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Patient</dt>
            <dd className="text-white">{info.patientId}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Collection</dt>
            <dd className="text-white">{info.collection}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Series</dt>
            <dd className="text-white">
              {info.slices} slices · {info.matrix}
              {info.description ? ` · ${info.description}` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Voxel size</dt>
            <dd className="text-white">{info.spacing}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <a
              href={idcViewerUrl(info.studyUid)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 underline-offset-2 hover:text-white hover:underline"
            >
              Open the full study in the IDC viewer <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </dl>
      )}

      <p className="mt-10 max-w-3xl text-xs leading-relaxed text-slate-500">
        Images: The Cancer Imaging Archive, served by the NCI Imaging Data Commons public DICOMweb proxy (viewing use,
        daily quota). Structures are found by simple density thresholds, not a validated segmentation. For research and
        education, not for diagnosis.
      </p>
    </div>
  );
}
