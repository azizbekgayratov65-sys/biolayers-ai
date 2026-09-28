"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { Play, Pause, Sliders, RotateCcw, X, Info } from "lucide-react";

/* ---------------------------------------------------------
   SSR-safe external store subscription for prefers-reduced-motion
   --------------------------------------------------------- */

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

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
    label: "DAPI Cyan (Fluorescence)",
    filter: "hue-rotate(175deg) brightness(0.95) contrast(1.3) saturate(1.4)",
    overlayGradient:
      "linear-gradient(135deg, rgba(77, 141, 255, 0.1) 0%, transparent 50%, rgba(161, 92, 255, 0.08) 100%)",
    opacity: 0.8,
  },
  amber: {
    id: "amber",
    name: "Subdued Amber / Gold",
    label: "Raw Microscopy Amber",
    filter: "brightness(0.95) contrast(1.25) saturate(1.2)",
    overlayGradient:
      "linear-gradient(135deg, rgba(255, 197, 61, 0.08) 0%, transparent 50%, rgba(77, 141, 255, 0.05) 100%)",
    opacity: 0.8,
  },
  emerald: {
    id: "emerald",
    name: "FITC Emerald & Teal",
    label: "FITC Emerald / Activation",
    filter: "hue-rotate(105deg) brightness(0.95) contrast(1.3) saturate(1.35)",
    overlayGradient:
      "linear-gradient(135deg, rgba(43, 255, 136, 0.1) 0%, transparent 50%, rgba(77, 141, 255, 0.06) 100%)",
    opacity: 0.8,
  },
  violet: {
    id: "violet",
    name: "Cy5 Deep Violet",
    label: "Cy5 Spectral Violet",
    filter: "hue-rotate(220deg) brightness(0.95) contrast(1.35) saturate(1.4)",
    overlayGradient:
      "linear-gradient(135deg, rgba(161, 92, 255, 0.12) 0%, transparent 50%, rgba(77, 141, 255, 0.06) 100%)",
    opacity: 0.78,
  },
  inverted: {
    id: "inverted",
    name: "Luminescent Inverted",
    label: "Inverted Bio-Fluorescence",
    filter:
      "invert(1) hue-rotate(195deg) brightness(0.7) contrast(1.4) saturate(1.5)",
    overlayGradient:
      "linear-gradient(135deg, rgba(77, 141, 255, 0.1) 0%, transparent 50%, rgba(161, 92, 255, 0.06) 100%)",
    opacity: 0.65,
  },
};

interface BackgroundVideoProps {
  /** Video source (defaults to /background.mp4) */
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
  const prefersReducedMotion = usePrefersReducedMotion();

  const [currentPresetKey, setCurrentPresetKey] = useState<string>(initialPreset);
  const [opacity, setOpacity] = useState<number>(
    VIDEO_PRESETS[initialPreset]?.opacity ?? 0.8,
  );
  const [brightness, setBrightness] = useState<number>(100);
  const [userPausedOverride, setUserPausedOverride] = useState<boolean | null>(
    null,
  );
  const isPlaying =
    userPausedOverride !== null ? !userPausedOverride : !prefersReducedMotion;
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activePreset = VIDEO_PRESETS[currentPresetKey] || VIDEO_PRESETS.dapi;

  // Synchronize playing state with HTML5 video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Handle play/pause toggle
  const togglePlay = () => {
    setUserPausedOverride(isPlaying);
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
    setUserPausedOverride(null);
  };

  // Close panel on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isPanelOpen) {
        setIsPanelOpen(false);
      }
    }

    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPanelOpen]);

  // Check when video can play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => setIsLoaded(true);
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, []);

  // Compute composed CSS filter
  const brightnessMultiplier = brightness / 100;
  const computedFilter = `${activePreset.filter} brightness(${brightnessMultiplier})`;

  return (
    <>
      {/* Background Video Layer — Fixed at z-0 behind content */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${className}`}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay={!prefersReducedMotion}
          loop
          muted
          playsInline
          preload="auto"
          className={`h-full w-full object-cover transition-opacity duration-500 ease-out will-change-transform ${
            isLoaded ? "opacity-100" : "opacity-90"
          }`}
          style={{
            filter: computedFilter,
            opacity: opacity,
            transform: "scale(1.04)",
          }}
        />

        {/* Multi-tier Balanced Overlays: Protects text contrast while keeping video vibrantly visible */}
        {/* Tier 1: Soft radial vignette behind center text */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(4, 7, 10, 0.62) 0%, rgba(4, 7, 10, 0.2) 60%, rgba(4, 7, 10, 0.5) 100%)",
          }}
        />

        {/* Tier 2: Smooth top & bottom edge blend */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(4, 7, 10, 0.75) 0%, transparent 12%, transparent 82%, rgba(4, 7, 10, 0.9) 100%)",
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

      {/* Floating Micro-Controller Widget (Bottom-Right) */}
      {showControls && (
        <div
          className="fixed bottom-4 right-4 z-50 select-none print:hidden sm:bottom-6 sm:right-6"
          ref={panelRef}
        >
          {isPanelOpen ? (
            /* Expanded Settings Dialog */
            <div
              role="dialog"
              aria-label="Microscopy backdrop settings"
              className="w-72 rounded-[20px] border border-teal-200/25 bg-[#070c14]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-teal-200/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/15">
                    <Sliders className="h-3 w-3 text-teal-300" />
                  </div>
                  <span className="font-mono text-xs font-bold text-white tracking-wide">
                    Microscopy Lens
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset to recommended settings"
                    aria-label="Reset to recommended settings"
                    className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    title="Close backdrop controls"
                    aria-label="Close backdrop controls"
                    className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Reduced motion indicator if enabled */}
              {prefersReducedMotion && (
                <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-amber-300/25 bg-amber-400/[0.08] p-2 text-[10px] text-amber-200">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>Reduced motion preferred. Autoplay paused.</span>
                </div>
              )}

              {/* Color Presets */}
              <div className="mt-2.5">
                <div className="mb-1 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Channel Presets
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(VIDEO_PRESETS).map(([key, preset]) => {
                    const isSelected = key === currentPresetKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePresetSelect(key)}
                        className={`flex min-h-[36px] items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] ${
                          isSelected
                            ? "border border-teal-300/40 bg-teal-400/15 text-white font-medium"
                            : "border border-transparent bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
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
                          <span className="text-[11px]">{preset.label}</span>
                        </span>
                        {isSelected && (
                          <span className="font-mono text-[9px] text-teal-300 font-semibold">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders */}
              <div className="mt-3 space-y-2 border-t border-teal-200/10 pt-2.5">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1 font-mono">
                    <span>Field Opacity</span>
                    <span className="text-teal-300 font-bold">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={Math.round(opacity * 100)}
                    onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                    aria-label="Background field opacity"
                    className="w-full accent-teal-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1 font-mono">
                    <span>Field Brightness</span>
                    <span className="text-teal-300 font-bold">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    aria-label="Background field brightness"
                    className="w-full accent-teal-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Play / Pause Toggle (>= 44px touch target) */}
              <div className="mt-3 flex items-center justify-between border-t border-teal-200/10 pt-2.5">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex min-h-[44px] items-center gap-2 rounded-[10px] border border-teal-200/25 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-teal-200/40 hover:bg-white/[0.09] hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff]"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-teal-300" />
                      <span>Pause Backdrop</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-teal-300" />
                      <span>Play Backdrop</span>
                    </>
                  )}
                </button>

                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Global Lens
                </span>
              </div>
            </div>
          ) : (
            /* Minimized Control Pill — Hit target enlarged to >= 44px x 44px */
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              aria-label="Customize Video Backdrop"
              title="Customize Video Backdrop"
              className="group flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-full border border-teal-200/30 bg-[#070c14]/90 text-teal-300 shadow-2xl backdrop-blur-xl transition-all hover:border-teal-200/60 hover:bg-[#0d1624] hover:text-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <Sliders className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="sr-only">Customize Video Backdrop</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
