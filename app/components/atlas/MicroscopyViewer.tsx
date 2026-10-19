"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Minus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";

import type { ImageChannel, MicroscopyImageRecord } from "../../lib/atlasTypes";

interface MicroscopyViewerProps {
  image: MicroscopyImageRecord;
  className?: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 8;
const PAN_STEP = 40;

const clampZoom = (value: number) => Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);

/*
  Pan-and-zoom viewer for one microscopy image.
  The image is a single composite, so channels are listed as a legend
  rather than offered as toggles: we cannot separate them in the browser.
*/
export default function MicroscopyViewer({ image, className = "" }: MicroscopyViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showLevels, setShowLevels] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
  }, []);

  // Ctrl/Cmd + wheel zooms; a plain wheel keeps scrolling the page.
  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.15 : 0.87;
      setZoom((current) => clampZoom(current * factor));
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!rootRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current.requestFullscreen().catch(() => {});
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [PAN_STEP, 0],
      ArrowRight: [-PAN_STEP, 0],
      ArrowUp: [0, PAN_STEP],
      ArrowDown: [0, -PAN_STEP],
    };
    if (moves[event.key]) {
      event.preventDefault();
      const [dx, dy] = moves[event.key];
      setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom((current) => clampZoom(current * 1.3));
    } else if (event.key === "-") {
      event.preventDefault();
      setZoom((current) => clampZoom(current / 1.3));
    } else if (event.key === "0") {
      event.preventDefault();
      reset();
    }
  };

  // Scale bar: a round length near 100 screen pixels at the current zoom.
  const pixelSize = image.pixelSizeUm || 0.24;
  const rawUm = (100 * pixelSize) / zoom;
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const scaleBarUm = steps.reduce((best, step) =>
    Math.abs(step - rawUm) < Math.abs(best - rawUm) ? step : best,
  );
  const scaleBarPx = (scaleBarUm / pixelSize) * zoom;

  const toolButton =
    "flex h-10 w-10 items-center justify-center rounded-md text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink";

  return (
    <div ref={rootRef} className={`bg-field ${className}`}>
      <div
        ref={frameRef}
        tabIndex={0}
        role="application"
        aria-roledescription="image viewer"
        aria-label={`${image.title}. Arrow keys pan, plus and minus zoom, 0 resets.`}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
        }}
        onPointerMove={(event) => {
          if (!dragStart) return;
          setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y });
        }}
        onPointerUp={() => setDragStart(null)}
        onPointerCancel={() => setDragStart(null)}
        className={`relative flex select-none items-center justify-center overflow-hidden rounded-[20px] border border-teal-500/25 bg-black shadow-2xl ${
          dragStart ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ height: isFullscreen ? "calc(100vh - 7rem)" : "min(70vh, 540px)", touchAction: "none" }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.imageUrl}
            alt={image.title}
            draggable={false}
            className="pointer-events-none max-w-none"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              width: `${image.widthPx}px`,
              height: `${image.heightPx}px`,
            }}
          />
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col items-center rounded bg-black/70 px-2 py-1">
          <div className="h-1 bg-white" style={{ width: `${Math.max(scaleBarPx, 20)}px` }} />
          <span className="mt-1 text-xs tabular-nums text-white">{scaleBarUm} µm</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setZoom((current) => clampZoom(current / 1.3))}
          aria-label="Zoom out"
          className={toolButton}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="w-14 text-center text-sm tabular-nums text-ink" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((current) => clampZoom(current * 1.3))}
          aria-label="Zoom in"
          className={toolButton}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={reset} aria-label="Reset view" className={toolButton}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setShowLevels((open) => !open)}
          aria-expanded={showLevels}
          aria-controls={`${image.id}-levels`}
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Levels
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          className={`${toolButton} ml-auto`}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <p className="mt-1 text-sm text-graphite-soft">
        Drag to pan. Hold Ctrl or ⌘ and scroll to zoom.
      </p>

      {showLevels && (
        <div id={`${image.id}-levels`} className="mt-3 grid gap-4 rounded-[20px] border border-rule p-4 sm:grid-cols-2">
          <label className="block text-sm text-graphite">
            <span className="flex justify-between">
              Brightness <span className="tabular-nums text-ink">{brightness}%</span>
            </span>
            <input
              type="range"
              min={40}
              max={180}
              value={brightness}
              onChange={(event) => setBrightness(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-sm text-graphite">
            <span className="flex justify-between">
              Contrast <span className="tabular-nums text-ink">{contrast}%</span>
            </span>
            <input
              type="range"
              min={50}
              max={200}
              value={contrast}
              onChange={(event) => setContrast(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <p className="text-sm text-graphite-soft sm:col-span-2">
            Display adjustments only. Measurements always use the original pixels.
          </p>
        </div>
      )}

      {image.channels.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-graphite">
            Channels in this composite ({image.channels.length})
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {image.channels.map((channel: ImageChannel) => (
              <li key={channel.id} className="inline-flex items-center gap-2 text-ink">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: channel.assignedColor }}
                />
                {channel.name}
                <span className="text-graphite">{channel.fluorophore}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
