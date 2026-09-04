"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Sliders, RotateCcw, X, Sparkles } from "lucide-react";

export interface VideoPreset {
  id: string;
  name: string;
  label: string;
  filter: string;
  overlayGradient?: string;
  opacity: number;
}

export const VIDEO_PRESETS: Record<string, VideoPreset> = {
  dapi: {
    id: "dapi",
    name: "DAPI Azure & Cyan",
    label: "DAPI Cyan (Recommended)",
    filter: "hue-rotate(180deg) brightness(0.62) contrast(1.45) saturate(1.4)",
    overlayGradient: "linear-gradient(135deg, rgba(77, 141, 255, 0.12) 0%, transparent 50%, rgba(161, 92, 255, 0.08) 100%)",
    opacity: 0.55,
  },
  emerald: {
    id: "emerald",
    name: "FITC Emerald & Teal",
    label: "FITC Emerald / Activation",
    filter: "hue-rotate(115deg) brightness(0.55) contrast(1.4) saturate(1.35)",
    overlayGradient: "linear-gradient(135deg, rgba(43, 255, 136, 0.1) 0%, transparent 50%, rgba(77, 141, 255, 0.08) 100%)",
    opacity: 0.52,
  },
  violet: {
    id: "violet",
    name: "Cy5 Deep Violet",
    label: "Cy5 Spectral Violet",
    filter: "hue-rotate(225deg) brightness(0.6) contrast(1.5) saturate(1.5)",
    overlayGradient: "linear-gradient(135deg, rgba(161, 92, 255, 0.12) 0%, transparent 50%, rgba(77, 141, 255, 0.08) 100%)",
    opacity: 0.5,
  },
  amber: {
    id: "amber",
    name: "Subdued Amber / Gold",
    label: "Raw Microscopy Amber",
    filter: "brightness(0.4) contrast(1.35) saturate(0.9)",
    overlayGradient: "linear-gradient(135deg, rgba(255, 197, 61, 0.08) 0%, transparent 50%, rgba(77, 141, 255, 0.05) 100%)",
    opacity: 0.45,
  },
  inverted: {
    id: "inverted",
    name: "Luminescent Inverted",
    label: "Inverted Bio-Fluorescence",
    filter: "invert(1) hue-rotate(195deg) brightness(0.42) contrast(1.6) saturate(1.7)",
    overlayGradient: "linear-gradient(135deg, rgba(77, 141, 255, 0.1) 0%, transparent 50%, rgba(161, 92, 255, 0.08) 100%)",
    opacity: 0.4,
  },
};

interface BackgroundVideoProps {
  /** Video source (defaults to /background.mp4 with smooth forward/reverse loop) */
  src?: string;
  /** Initial preset key (defaults to 'dapi') */
  initialPreset?: keyof typeof VIDEO_PRESETS;
  /** Whether to show the live interactive control widget */
  showControls?: boolean;
  /** Optional extra CSS class */
  className?: string;
}

export default function BackgroundVideo({
  src = "/background.mp4",
  initialPreset = "dapi",
  showControls = true,
  className = "",
}: BackgroundVideoProps) {
  const [currentPresetKey, setCurrentPresetKey] = useState<string>(initialPreset);
  const [opacity, setOpacity] = useState<number>(VIDEO_PRESETS[initialPreset]?.opacity ?? 0.55);
  const [brightness, setBrightness] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activePreset = VIDEO_PRESETS[currentPresetKey] || VIDEO_PRESETS.dapi;

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handlePresetSelect = (key: string) => {
    setCurrentPresetKey(key);
    const target = VIDEO_PRESETS[key];
    if (target) {
      setOpacity(target.opacity);
    }
  };

  const handleReset = () => {
    setCurrentPresetKey("dapi");
    setOpacity(VIDEO_PRESETS.dapi.opacity);
    setBrightness(100);
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    }
    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Compute composed CSS filter
  const brightnessMultiplier = brightness / 100;
  const computedFilter = `${activePreset.filter} brightness(${brightnessMultiplier})`;

  return (
    <>
      {/* Background Video Layer — Fixed across whole project */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 -z-30 overflow-hidden select-none ${className}`}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`h-full w-full object-cover transition-opacity duration-1000 ease-out will-change-transform ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            filter: computedFilter,
            opacity: opacity,
            transform: "scale(1.05)",
          }}
        />

        {/* Multi-tier Cinematic Overlays to seamlessly blend into #04070a */}
        {/* Tier 1: Radial Vignette protecting center content legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(4, 7, 10, 0.42) 0%, rgba(4, 7, 10, 0.78) 60%, #04070a 95%)",
          }}
        />

        {/* Tier 2: Linear Top & Bottom Fades */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #04070a 0%, rgba(4, 7, 10, 0.4) 14%, transparent 32%, rgba(4, 7, 10, 0.5) 75%, #04070a 100%)",
          }}
        />

        {/* Tier 3: Spectral Ambient Tint */}
        {activePreset.overlayGradient && (
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{
              background: activePreset.overlayGradient,
            }}
          />
        )}
      </div>

      {/* Minimized Floating Control Pill for Customization */}
      {showControls && (
        <div
          ref={panelRef}
          className="fixed bottom-3 right-3 z-50 pointer-events-auto"
        >
          {isPanelOpen ? (
            <div className="w-76 rounded-2xl border border-teal-200/25 bg-[#070c14]/95 p-3.5 shadow-2xl backdrop-blur-2xl transition-all animate-fade-up">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-teal-200/15 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-400/10 text-teal-300">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-teal-100">Video Backdrop</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset to recommended"
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    title="Minimize"
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Color Presets */}
              <div className="mt-2.5">
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(VIDEO_PRESETS).map(([key, preset]) => {
                    const isSelected = key === currentPresetKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePresetSelect(key)}
                        className={`flex items-center justify-between rounded-lg px-2 py-1 text-left transition ${
                          isSelected
                            ? "border border-teal-300/40 bg-teal-400/15 text-white font-medium"
                            : "border border-transparent bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              key === "dapi"
                                ? "bg-sky-400 shadow-[0_0_6px_#38bdf8]"
                                : key === "emerald"
                                ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                                : key === "violet"
                                ? "bg-purple-400 shadow-[0_0_6px_#c084fc]"
                                : key === "amber"
                                ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                                : "bg-cyan-300 shadow-[0_0_6px_#67e8f9]"
                            }`}
                          />
                          <span className="text-[10px]">{preset.label}</span>
                        </span>
                        {isSelected && <span className="font-mono text-[8px] text-teal-300">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders */}
              <div className="mt-2.5 space-y-1.5 border-t border-teal-200/10 pt-2">
                <div>
                  <div className="flex items-center justify-between text-[9px] text-slate-300 mb-0.5 font-mono">
                    <span>Opacity</span>
                    <span className="text-teal-300">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    value={Math.round(opacity * 100)}
                    onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                    className="w-full accent-teal-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[9px] text-slate-300 mb-0.5 font-mono">
                    <span>Brightness</span>
                    <span className="text-teal-300">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-teal-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Play / Pause Toggle */}
              <div className="mt-2.5 flex items-center justify-between border-t border-teal-200/10 pt-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 rounded border border-teal-200/20 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-white/[0.09] transition"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-2.5 w-2.5 text-teal-300" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-2.5 w-2.5 text-teal-300" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <span className="font-mono text-[8px] text-slate-400">
                  Global Backdrop
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              title="Customize Video Backdrop"
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-teal-200/25 bg-[#070c14]/85 text-teal-300 shadow-xl backdrop-blur-xl hover:border-teal-200/50 hover:bg-[#0d1624] hover:text-teal-100 transition-all"
            >
              <Sliders className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              <span className="sr-only">Customize Video Backdrop</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
