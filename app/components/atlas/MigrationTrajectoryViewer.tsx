"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Compass,
  Zap,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
} from "lucide-react";
import { FLAGSHIP_TRAJECTORY_POINTS } from "../../lib/atlasMasterCatalog";
import type { TrajectoryPoint } from "../../lib/atlasTypes";

interface MigrationTrajectoryViewerProps {
  backgroundImageUrl?: string;
}

export default function MigrationTrajectoryViewer({
  backgroundImageUrl = "/atlas/caf_specimen_reference.png",
}: MigrationTrajectoryViewerProps) {
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedTrackId, setSelectedTrackId] = useState<number | "all">("all");
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showGradientVector, setShowGradientVector] = useState<boolean>(true);

  const totalFrames = 48;

  // Group trajectories by track ID
  const tracks = useMemo(() => {
    const map = new Map<number, TrajectoryPoint[]>();
    for (const pt of FLAGSHIP_TRAJECTORY_POINTS) {
      if (!map.has(pt.cell_track_id)) {
        map.set(pt.cell_track_id, []);
      }
      map.get(pt.cell_track_id)!.push(pt);
    }
    // Sort each track by frame number
    for (const [id, list] of map.entries()) {
      list.sort((a, b) => a.frame_number - b.frame_number);
    }
    return map;
  }, []);

  const trackIds = useMemo(() => Array.from(tracks.keys()).sort((a, b) => a - b), [tracks]);

  // Points at current frame
  const currentPoints = useMemo(() => {
    return FLAGSHIP_TRAJECTORY_POINTS.filter((pt) => pt.frame_number === currentFrame);
  }, [currentFrame]);

  // Current selected track metrics
  const activeMetrics = useMemo(() => {
    if (selectedTrackId === "all") {
      const avgVel =
        currentPoints.reduce((acc, p) => acc + p.instantaneous_velocity_um_min, 0) /
        (currentPoints.length || 1);
      const avgDisp =
        currentPoints.reduce((acc, p) => acc + p.net_displacement_um, 0) /
        (currentPoints.length || 1);
      return {
        velocity: avgVel.toFixed(2),
        displacement: avgDisp.toFixed(1),
        trackCount: currentPoints.length,
        timestampMin: ((currentPoints[0]?.timestamp_sec ?? 0) / 60).toFixed(1),
      };
    } else {
      const pt = currentPoints.find((p) => p.cell_track_id === selectedTrackId);
      return {
        velocity: (pt?.instantaneous_velocity_um_min ?? 0).toFixed(2),
        displacement: (pt?.net_displacement_um ?? 0).toFixed(1),
        angle: (pt?.trajectory_angle_deg ?? 0).toFixed(1),
        trackCount: 1,
        timestampMin: ((pt?.timestamp_sec ?? 0) / 60).toFixed(1),
      };
    }
  }, [currentPoints, selectedTrackId]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames) {
          return 1;
        }
        return prev + 1;
      });
    }, 180 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalFrames]);

  return (
    <div className="rounded-[24px] border border-teal-500/25 bg-[#050b14]/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/15 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-0.5 text-xs font-semibold text-teal-200 mb-2">
            <Activity className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-teal-100">
              Live Migration Trajectory Analysis
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Pancreatic CAF CXCL12 Directional Chemotaxis Series
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            48-frame multi-target single-cell tracking under a CXCL12 recombinant gradient (100 ng/mL).
            Coordinates measured at 0.645 µm/px calibrated spatial resolution over 4 hours.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-teal-400/30 bg-teal-500/10 px-3 py-1 font-mono text-xs font-semibold text-teal-200">
            Frame {currentFrame} / {totalFrames}
          </span>
          <span className="rounded-lg border border-white/10 bg-black/50 px-3 py-1 font-mono text-xs font-semibold text-slate-300">
            T = {activeMetrics.timestampMin} min
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visualizer Canvas & Trajectory Overlay */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative aspect-[4/3] w-full max-w-[650px] overflow-hidden rounded-[20px] border border-teal-500/30 bg-black shadow-inner select-none">
            {/* Background Reference Specimen Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImageUrl}
              alt="CAF Specimen Phase Reference"
              className="h-full w-full object-cover opacity-80 filter brightness-95"
            />

            {/* Gradient Overlay Vector */}
            {showGradientVector && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-black/80 px-3 py-1.5 backdrop-blur-md">
                <Compass className="h-4 w-4 text-cyan-300 animate-pulse" />
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-200 font-bold">
                    CXCL12 Gradient Flow
                  </span>
                  <span className="font-mono text-[10px] text-slate-300">Vector: 45° · 100 ng/mL</span>
                </div>
              </div>
            )}

            {/* SVG Trajectory Overlay */}
            <svg
              viewBox="0 0 650 487"
              className="absolute inset-0 h-full w-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Trajectory Trails up to current frame */}
              {showTrails &&
                Array.from(tracks.entries()).map(([tId, pts]) => {
                  if (selectedTrackId !== "all" && selectedTrackId !== tId) return null;
                  const visiblePts = pts.filter((p) => p.frame_number <= currentFrame);
                  if (visiblePts.length < 2) return null;

                  const color = visiblePts[0]?.cell_color || "#38bdf8";
                  const pathD = visiblePts
                    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.coord_x_px} ${p.coord_y_px}`)
                    .join(" ");

                  return (
                    <path
                      key={`trail-${tId}`}
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.85"
                      filter="url(#glow)"
                    />
                  );
                })}

              {/* Current Cell Marker Points */}
              {currentPoints.map((pt) => {
                const isSelected = selectedTrackId === "all" || selectedTrackId === pt.cell_track_id;
                if (!isSelected) return null;

                const color = pt.cell_color || "#38bdf8";

                return (
                  <g key={`marker-${pt.cell_track_id}`}>
                    {/* Pulsing ring */}
                    <circle
                      cx={pt.coord_x_px}
                      cy={pt.coord_y_px}
                      r="9"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                      className="animate-ping"
                    />
                    {/* Solid center dot */}
                    <circle
                      cx={pt.coord_x_px}
                      cy={pt.coord_y_px}
                      r="5.5"
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {/* Track ID tag */}
                    <text
                      x={pt.coord_x_px + 8}
                      y={pt.coord_y_px - 8}
                      fill="#ffffff"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    >
                      C{pt.cell_track_id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Player & Scrubber Controls */}
          <div className="mt-4 w-full max-w-[650px] rounded-[16px] border border-teal-500/20 bg-[#081322] p-4 backdrop-blur-md">
            {/* Scrubber slider */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">01</span>
              <input
                type="range"
                min="1"
                max={totalFrames}
                value={currentFrame}
                onChange={(e) => setCurrentFrame(Number(e.target.value))}
                aria-label="Time-lapse frame scrubber"
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-teal-950/60 accent-teal-400 focus:outline-none"
              />
              <span className="font-mono text-xs text-slate-400">{totalFrames}</span>
            </div>

            {/* Buttons Row */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ touchAction: "manipulation" }}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-teal-400/40 bg-teal-500/20 px-4 py-1.5 text-xs font-bold text-teal-100 hover:bg-teal-500/30 transition shadow-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Play Time-Lapse
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(1);
                  }}
                  title="Reset to frame 1"
                  className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-[10px] border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                {/* Speed selector */}
                <div className="flex items-center rounded-[10px] border border-white/10 bg-black/40 p-0.5">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition ${
                        playbackSpeed === spd
                          ? "bg-teal-500/30 text-teal-200"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTrails}
                    onChange={(e) => setShowTrails(e.target.checked)}
                    className="rounded border-teal-500/30 bg-black text-teal-400 focus:ring-teal-400"
                  />
                  <span>Trails</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={showGradientVector}
                    onChange={(e) => setShowGradientVector(e.target.checked)}
                    className="rounded border-teal-500/30 bg-black text-teal-400 focus:ring-teal-400"
                  />
                  <span>Gradient</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Quantitative Morphodynamics & Track Selector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Track Filter Tabs */}
          <div className="rounded-[18px] border border-teal-500/20 bg-[#070e1a] p-4">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-teal-300 block mb-2.5">
              Select Cell Track
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTrackId("all")}
                className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border transition ${
                  selectedTrackId === "all"
                    ? "border-teal-400/50 bg-teal-500/20 text-teal-200"
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                All (5 Cells)
              </button>
              {trackIds.map((tId) => {
                const samplePt = tracks.get(tId)?.[0];
                return (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => setSelectedTrackId(tId)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border transition ${
                      selectedTrackId === tId
                        ? "border-teal-400/50 bg-teal-500/20 text-white"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: samplePt?.cell_color || "#38bdf8" }}
                    />
                    Cell #{tId}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Dynamic Metrics Card */}
          <div className="rounded-[18px] border border-teal-500/20 bg-[#070e1a] p-4 space-y-3">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
              Kinematic Metrics · Frame {currentFrame}
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-400 text-[10px] font-mono block">VELOCITY</span>
                <span className="text-lg font-bold font-mono text-teal-200">
                  {activeMetrics.velocity}{" "}
                  <span className="text-xs text-slate-400 font-normal">µm/min</span>
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-400 text-[10px] font-mono block">DISPLACEMENT</span>
                <span className="text-lg font-bold font-mono text-teal-200">
                  {activeMetrics.displacement}{" "}
                  <span className="text-xs text-slate-400 font-normal">µm</span>
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Tracked Targets:</span>
                <span className="font-mono font-semibold text-white">
                  {activeMetrics.trackCount} {activeMetrics.trackCount === 1 ? "cell" : "cells"}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Chemotactic Index:</span>
                <span className="font-mono font-semibold text-emerald-300">0.86 ± 0.04 (High)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">CXCR4 Activation:</span>
                <span className="font-mono font-semibold text-cyan-300">Phosphorylated (+2.4x)</span>
              </div>
            </div>
          </div>

          {/* Biological Provenance Note */}
          <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Scientific Rigor & Provenance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Tracks generated using TrackMate v7 Laplacian of Gaussian (LoG) detector and Simple LAP Tracker on
              time-lapse DIC/fluorescence series. Reference DOI:{" "}
              <a
                href="https://doi.org/10.1158/0008-5472.CAN-18-2067"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:underline font-mono"
              >
                10.1158/0008-5472.CAN-18-2067
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
