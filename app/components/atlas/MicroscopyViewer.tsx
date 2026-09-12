"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Sliders,
  Info,
  Sparkles,
} from "lucide-react";
import type { MicroscopyImageRecord, ImageChannel } from "../../lib/atlasTypes";

interface MicroscopyViewerProps {
  image: MicroscopyImageRecord;
  className?: string;
  showOverlayByDefault?: boolean;
}

export default function MicroscopyViewer({
  image,
  className = "",
  showOverlayByDefault = true,
}: MicroscopyViewerProps) {
  // Navigation state (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Optical adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Multi-channel fluorescence toggles
  const [activeChannels, setActiveChannels] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    image.channels.forEach((ch) => {
      initial[ch.channelIndex] = true;
    });
    return initial;
  });

  const [channelIntensities, setChannelIntensities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    image.channels.forEach((ch) => {
      initial[ch.channelIndex] = ch.defaultIntensity ?? 1.0;
    });
    return initial;
  });

  // UI Drawer & HUD States
  const [showChannelsPanel, setShowChannelsPanel] = useState<boolean>(false);
  const [showAdjustmentPanel, setShowAdjustmentPanel] = useState<boolean>(false);
  const [showMetadataHud, setShowMetadataHud] = useState<boolean>(showOverlayByDefault);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to initial viewport
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
  }, []);

  // Button Zoom controls with bounds
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.3, 8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.3, 0.5));

  // Non-passive wheel event listener to strictly prevent page scrolling when pointer is inside the card
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      // Unconditionally cancel page scroll while pointer is over this viewer card
      e.preventDefault();
      e.stopPropagation();

      // Zoom in or out based on scroll direction
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      setZoom((prev) => Math.min(Math.max(prev * factor, 0.5), 8));
    };

    // CRITICAL: passive: false is required by browsers to allow e.preventDefault()
    el.addEventListener("wheel", onWheelNative, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheelNative);
    };
  }, []);

  // Drag Pan Interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Calculate dynamic physical scale bar (in micrometers)
  // pixelSizeUm is physical microns per pixel at zoom = 1.
  // We want a bar that is roughly 80 to 140 pixels wide on screen.
  const pixelSize = image.pixelSizeUm || 0.24; // fallback microns/px
  const targetBarPx = 100;
  const rawUmAtTarget = (targetBarPx * pixelSize) / zoom;
  
  // Pick clean round numbers for the scale bar (e.g. 5, 10, 20, 50, 100 um)
  const candidateSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const scaleBarUm = candidateSteps.reduce((prev, curr) =>
    Math.abs(curr - rawUmAtTarget) < Math.abs(prev - rawUmAtTarget) ? curr : prev
  );
  const scaleBarWidthPx = (scaleBarUm / pixelSize) * zoom;

  // Composite CSS filter for brightness, contrast & pseudo-fluorescence
  const computedFilter = `brightness(${brightness}%) contrast(${contrast}%)`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-teal-500/25 bg-[#04080e]/90 backdrop-blur-xl shadow-2xl select-none overscroll-contain ${className}`}
      style={{ minHeight: "440px", height: isFullscreen ? "100vh" : "560px" }}
    >
      {/* 1. Main Viewport & Interactive Image Layer */}
      <div
        className={`absolute inset-0 cursor-${isDragging ? "grabbing" : "grab"} flex items-center justify-center overflow-hidden`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Base Microscopy Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.imageUrl}
            alt={image.title}
            draggable={false}
            className="pointer-events-none max-w-none rounded shadow-2xl"
            style={{
              filter: computedFilter,
              width: `${image.widthPx}px`,
              height: `${image.heightPx}px`,
            }}
          />

          {/* Simulated Multi-Channel Pseudocolor Tint Overlays */}
          {image.channels.map((ch: ImageChannel) => {
            const isVisible = activeChannels[ch.channelIndex] ?? true;
            const intensity = channelIntensities[ch.channelIndex] ?? 1.0;
            if (!isVisible || intensity === 0) return null;

            return (
              <div
                key={ch.id}
                className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-200"
                style={{
                  backgroundColor: ch.assignedColor,
                  opacity: Math.min(intensity * 0.18, 0.45),
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Top-Left: Specimen Identification Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 rounded-full border border-teal-400/30 bg-[#08121f]/90 px-3 py-1 text-xs font-semibold text-teal-200 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-pulse" />
          <span>{image.cellLine}</span>
          <span className="text-teal-400/40">·</span>
          <span className="capitalize text-slate-300">{image.microscopyModality}</span>
          {image.isFlagship && (
            <span className="ml-1 rounded bg-gradient-to-r from-teal-500/30 to-cyan-500/30 border border-teal-400/40 px-1.5 py-0.5 text-[9px] font-mono text-cyan-200 uppercase tracking-widest">
              Flagship
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-mono drop-shadow ml-1">
          Objective: {image.objective} · {image.microscope}
        </p>
      </div>

      {/* 3. Top-Right: Quick Action Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-[#08121f]/85 p-1.5 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={() => setShowChannelsPanel((v) => !v)}
          title="Multi-channel selection"
          className={`rounded-lg p-2 text-xs font-medium transition ${
            showChannelsPanel
              ? "bg-teal-500/20 text-teal-200 border border-teal-400/30"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowAdjustmentPanel((v) => !v)}
          title="Brightness & Contrast"
          className={`rounded-lg p-2 text-xs font-medium transition ${
            showAdjustmentPanel
              ? "bg-teal-500/20 text-teal-200 border border-teal-400/30"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Sliders className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowMetadataHud((v) => !v)}
          title="Toggle Metadata Overlay"
          className={`rounded-lg p-2 text-xs font-medium transition ${
            showMetadataHud
              ? "bg-teal-500/20 text-teal-200 border border-teal-400/30"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Info className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-white/15 mx-1" />

        <button
          type="button"
          onClick={handleReset}
          title="Reset Zoom & Adjustments"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* 4. Bottom-Left: Floating Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-teal-500/20 bg-[#08121f]/85 p-1 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom out"
          className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="px-2 text-xs font-mono font-semibold text-teal-300 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom in"
          className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* 5. Bottom-Right: Calibrated Scale Bar */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end pointer-events-none">
        <div className="flex flex-col items-center bg-[#08121f]/80 px-2.5 py-1 rounded border border-teal-500/20 backdrop-blur-sm">
          <div
            className="h-1 bg-white border-b border-teal-400 shadow-[0_0_6px_#fff]"
            style={{ width: `${Math.max(scaleBarWidthPx, 20)}px` }}
          />
          <span className="mt-1 font-mono text-[10px] text-slate-200 tracking-wider">
            {scaleBarUm} µm
          </span>
        </div>
      </div>

      {/* 6. Multi-Channel Selector Drawer */}
      {showChannelsPanel && (
        <div className="absolute top-16 right-4 z-30 w-72 rounded-2xl border border-teal-500/30 bg-[#070e1a]/95 p-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-2 mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-200">
              <Layers className="h-3.5 w-3.5 text-teal-400" /> Fluorophore Channels
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {image.channels.length} ch
            </span>
          </div>

          <div className="space-y-3">
            {image.channels.map((ch: ImageChannel) => {
              const active = activeChannels[ch.channelIndex] ?? true;
              const intensity = channelIntensities[ch.channelIndex] ?? 1.0;

              return (
                <div key={ch.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) =>
                          setActiveChannels((prev) => ({
                            ...prev,
                            [ch.channelIndex]: e.target.checked,
                          }))
                        }
                        className="accent-teal-400 rounded h-3.5 w-3.5"
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: ch.assignedColor,
                          boxShadow: `0 0 6px ${ch.assignedColor}`,
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-200">{ch.name}</span>
                    </label>
                    <span className="font-mono text-[10px] text-slate-400">{ch.fluorophore}</span>
                  </div>

                  {active && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Gain</span>
                      <input
                        type="range"
                        min="0.2"
                        max="2.0"
                        step="0.1"
                        value={intensity}
                        onChange={(e) =>
                          setChannelIntensities((prev) => ({
                            ...prev,
                            [ch.channelIndex]: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-teal-400 h-1 bg-white/10 rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-teal-300 min-w-[28px] text-right">
                        {intensity.toFixed(1)}x
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Brightness & Contrast Drawer */}
      {showAdjustmentPanel && (
        <div className="absolute top-16 right-4 z-30 w-64 rounded-2xl border border-teal-500/30 bg-[#070e1a]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-2 mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-200">
              <Sliders className="h-3.5 w-3.5 text-teal-400" /> Optical Levels
            </span>
            <button
              type="button"
              onClick={() => {
                setBrightness(100);
                setContrast(100);
              }}
              className="text-[10px] font-mono text-teal-400 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Brightness</span>
                <span className="text-teal-300">{brightness}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-teal-400 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Contrast</span>
                <span className="text-teal-300">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-teal-400 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. Metadata HUD Overlay */}
      {showMetadataHud && (
        <div className="absolute top-16 left-4 z-20 max-w-sm rounded-xl border border-teal-500/20 bg-[#060c16]/85 p-3.5 text-xs backdrop-blur-md shadow-2xl animate-fade-in pointer-events-auto">
          <div className="flex items-center gap-1.5 font-semibold text-teal-300 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Provenance HUD
          </div>
          <div className="space-y-1 font-mono text-[10px] text-slate-300">
            <p>
              <span className="text-slate-500">Staining:</span> {image.staining}
            </p>
            <p>
              <span className="text-slate-500">Treatment:</span> {image.treatment}
            </p>
            <p>
              <span className="text-slate-500">Resolution:</span> {image.widthPx} × {image.heightPx} px (
              {image.pixelSizeUm} µm/px)
            </p>
            <p>
              <span className="text-slate-500">Accession:</span> {image.datasetAccession} · {image.license}
            </p>
            {image.doiPmid && (
              <p>
                <span className="text-slate-500">Source:</span> {image.doiPmid}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
