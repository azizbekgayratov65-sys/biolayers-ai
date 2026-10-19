"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { FLAGSHIP_TRAJECTORY_POINTS } from "../../lib/atlasMasterCatalog";
import type { TrajectoryPoint } from "../../lib/atlasTypes";

interface MigrationTrajectoryViewerProps {
  backgroundImageUrl?: string;
}

const TOTAL_FRAMES = 48;

/*
  Plays back the CAF migration series frame by frame.
  The series has no traceable source recording (see lib/atlasIntegrity.ts),
  so it is labelled illustrative and only values computed from the
  points themselves are shown.
*/
export default function MigrationTrajectoryViewer({
  backgroundImageUrl = "/atlas/caf_specimen_reference.png",
}: MigrationTrajectoryViewerProps) {
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<number | "all">("all");
  const [showTrails, setShowTrails] = useState(true);

  const tracks = useMemo(() => {
    const map = new Map<number, TrajectoryPoint[]>();
    for (const point of FLAGSHIP_TRAJECTORY_POINTS) {
      const list = map.get(point.cell_track_id) ?? [];
      list.push(point);
      map.set(point.cell_track_id, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.frame_number - b.frame_number);
    return map;
  }, []);

  const trackIds = useMemo(() => Array.from(tracks.keys()).sort((a, b) => a - b), [tracks]);

  const pointsNow = useMemo(
    () => FLAGSHIP_TRAJECTORY_POINTS.filter((point) => point.frame_number === frame),
    [frame],
  );

  const metrics = useMemo(() => {
    const shown =
      selectedTrack === "all"
        ? pointsNow
        : pointsNow.filter((point) => point.cell_track_id === selectedTrack);
    const count = shown.length || 1;
    return {
      speed: shown.reduce((sum, p) => sum + p.instantaneous_velocity_um_min, 0) / count,
      displacement: shown.reduce((sum, p) => sum + p.net_displacement_um, 0) / count,
      minutes: (shown[0]?.timestamp_sec ?? 0) / 60,
      cells: shown.length,
    };
  }, [pointsNow, selectedTrack]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setFrame((current) => (current >= TOTAL_FRAMES ? 1 : current + 1));
    }, 180 / speed);
    return () => clearInterval(timer);
  }, [playing, speed]);

  const segmentButton = (active: boolean) =>
    `min-h-10 rounded-md px-3 text-sm transition-colors ${
      active ? "bg-white/[0.08] font-medium text-ink-strong" : "text-graphite hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl">Migration time-lapse</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-graphite">
            {trackIds.length} tracked cells over {TOTAL_FRAMES} frames. Speed and displacement are
            computed from the tracked positions.
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-[20px] border border-stain-yfp/30 bg-stain-yfp/[0.06] px-4 py-3 text-sm leading-relaxed text-ink">
        Illustrative series. We could not trace these tracks to a recorded experiment, and the
        background image is a different specimen. Use it to see how the viewer works, not as data.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-teal-500/25 bg-black shadow-2xl select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImageUrl}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
            <svg
              viewBox="0 0 650 487"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              role="img"
              aria-label={`Cell positions at frame ${frame}`}
            >
              {showTrails &&
                Array.from(tracks.entries()).map(([id, points]) => {
                  if (selectedTrack !== "all" && selectedTrack !== id) return null;
                  const visible = points.filter((p) => p.frame_number <= frame);
                  if (visible.length < 2) return null;
                  return (
                    <path
                      key={`trail-${id}`}
                      d={visible
                        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.coord_x_px} ${p.coord_y_px}`)
                        .join(" ")}
                      fill="none"
                      stroke={visible[0]?.cell_color || "#7ea6ff"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              {pointsNow.map((point) => {
                if (selectedTrack !== "all" && selectedTrack !== point.cell_track_id) return null;
                return (
                  <g key={`marker-${point.cell_track_id}`}>
                    <circle
                      cx={point.coord_x_px}
                      cy={point.coord_y_px}
                      r="5"
                      fill={point.cell_color || "#7ea6ff"}
                      stroke="#f2f5f7"
                      strokeWidth="1.5"
                    />
                    <text
                      x={point.coord_x_px + 8}
                      y={point.coord_y_px - 8}
                      fill="#f2f5f7"
                      fontSize="11"
                    >
                      {point.cell_track_id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((on) => !on)}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-hoechst text-field transition-colors hover:bg-hoechst-strong"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
            <input
              type="range"
              min={1}
              max={TOTAL_FRAMES}
              value={frame}
              onChange={(event) => setFrame(Number(event.target.value))}
              aria-label="Frame"
              className="flex-1"
            />
            <span className="w-20 text-right text-sm tabular-nums text-ink">
              {frame} / {TOTAL_FRAMES}
            </span>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setFrame(1);
              }}
              aria-label="Back to first frame"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
              {[1, 2, 4].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={speed === value}
                  onClick={() => setSpeed(value)}
                  className={segmentButton(speed === value)}
                >
                  {value}×
                </button>
              ))}
            </div>
            <label className="inline-flex min-h-10 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={showTrails}
                onChange={(event) => setShowTrails(event.target.checked)}
                className="h-4 w-4"
              />
              Show trails
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm text-graphite">Cells</p>
          <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Choose a cell">
            <button
              type="button"
              aria-pressed={selectedTrack === "all"}
              onClick={() => setSelectedTrack("all")}
              className={segmentButton(selectedTrack === "all")}
            >
              All
            </button>
            {trackIds.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={selectedTrack === id}
                onClick={() => setSelectedTrack(id)}
                className={`${segmentButton(selectedTrack === id)} inline-flex items-center gap-2`}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ background: tracks.get(id)?.[0]?.cell_color || "#7ea6ff" }}
                />
                Cell {id}
              </button>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-4" aria-live="polite">
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</dt>
              <dd className="text-xl tabular-nums text-ink-strong">
                {metrics.speed.toFixed(2)} <span className="text-sm text-graphite">µm/min</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Net displacement</dt>
              <dd className="text-xl tabular-nums text-ink-strong">
                {metrics.displacement.toFixed(1)} <span className="text-sm text-graphite">µm</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</dt>
              <dd className="text-xl tabular-nums text-ink-strong">
                {metrics.minutes.toFixed(0)} <span className="text-sm text-graphite">min</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Cells shown</dt>
              <dd className="text-xl tabular-nums text-ink-strong">{metrics.cells}</dd>
            </div>
          </dl>
          {selectedTrack === "all" && (
            <p className="mt-2 text-sm text-graphite-soft">Averages across the cells shown.</p>
          )}
        </div>
      </div>
    </div>
  );
}
