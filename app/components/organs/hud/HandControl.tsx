"use client";

import { useEffect, useRef, useState } from "react";
import { Hand } from "lucide-react";

import { HAND_BONES, type HandFrame } from "./handTracking";

/*
  "Hand control" button for a 3D viewer. When on, a small mirrored camera
  preview shows the tracked hand as a glowing skeleton.

  Gestures: pinch or make a fist to grab the organ, move the hand to turn
  it, bring the hand closer or further to zoom. Open the hand to let go.
*/

type Props = {
  onRotate: (dx: number, dy: number) => void;
  onZoom: (factor: number) => void;
  /* Placement of the button inside the viewer, e.g. "absolute bottom-3 right-3". */
  className?: string;
};

export default function HandControl({ onRotate, onZoom, className = "" }: Props) {
  const [on, setOn] = useState(false);
  const [status, setStatus] = useState<"off" | "starting" | "tracking" | "nohand" | "error">("off");
  const [error, setError] = useState("");
  const [grabbing, setGrabbing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handlers = useRef({ onRotate, onZoom });
  useEffect(() => {
    handlers.current = { onRotate, onZoom };
  }, [onRotate, onZoom]);

  useEffect(() => {
    if (!on) return;
    const video = videoRef.current;
    if (!video) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    let prev: HandFrame | null = null;
    let wasGrab = false;

    const draw = (f: HandFrame | null) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!f) return;
      const px = (i: number) => (1 - f.landmarks[i].x) * canvas.width;
      const py = (i: number) => f.landmarks[i].y * canvas.height;
      ctx.lineWidth = 2;
      ctx.strokeStyle = f.grab ? "#ffd60a" : "#00f5d4";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      for (const [a, b] of HAND_BONES) {
        ctx.beginPath();
        ctx.moveTo(px(a), py(a));
        ctx.lineTo(px(b), py(b));
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 21; i++) {
        ctx.beginPath();
        ctx.arc(px(i), py(i), 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    import("./handTracking")
      .then(({ startHandTracking }) =>
        startHandTracking(video, (f) => {
          draw(f);
          if (!f) {
            prev = null;
            if (wasGrab) setGrabbing(false);
            wasGrab = false;
            setStatus("nohand");
            return;
          }
          setStatus("tracking");
          if (f.grab !== wasGrab) setGrabbing(f.grab);
          if (f.grab && prev && wasGrab) {
            // Grabbed: hand movement turns the organ, hand size changes zoom it.
            handlers.current.onRotate((f.x - prev.x) * 6, (f.y - prev.y) * 4);
            const ratio = f.size / Math.max(1e-4, prev.size);
            if (Math.abs(ratio - 1) > 0.004) handlers.current.onZoom(1 / Math.pow(ratio, 1.6));
          }
          wasGrab = f.grab;
          prev = f;
        }),
      )
      .then((stopper) => {
        if (cancelled) stopper();
        else stop = stopper;
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(
          /denied|NotAllowed|Permission/i.test(message)
            ? "Camera access was blocked. Allow the camera for this site to use hand control."
            : message,
        );
        setStatus("error");
        setOn(false);
      });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [on]);

  const toggle = () => {
    if (on) {
      setOn(false);
      setStatus("off");
      setGrabbing(false);
    } else {
      setError("");
      setStatus("starting");
      setOn(true);
    }
  };

  const hint =
    status === "starting"
      ? "Starting camera…"
      : status === "nohand"
        ? "Show one hand to the camera"
        : grabbing
          ? "Grabbed · move to turn, push or pull to zoom"
          : "Pinch or make a fist to grab";

  return (
    <>
      <button
        type="button"
        aria-pressed={on}
        title="Control the model with your hand through the webcam"
        onClick={toggle}
        className={`${className} z-20 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[12px] border px-3 text-sm font-semibold backdrop-blur-xl transition ${
          on
            ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100 shadow-[0_0_18px_rgba(0,245,212,0.35)]"
            : "border-white/10 bg-black/40 text-slate-300 hover:border-white/25 hover:text-white"
        }`}
      >
        <Hand className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Hand control</span>
      </button>

      {on && (
        <div className="absolute bottom-3 left-3 z-20 w-[176px] overflow-hidden rounded-[12px] border border-cyan-300/40 bg-black/80 shadow-[0_0_24px_rgba(0,245,212,0.25)]">
          <div className="relative aspect-[4/3]">
            <video ref={videoRef} className="absolute inset-0 h-full w-full -scale-x-100 object-cover opacity-50" muted playsInline />
            <canvas ref={canvasRef} width={176} height={132} className="absolute inset-0 h-full w-full" />
          </div>
          <p className="px-2 py-1.5 font-mono text-[9px] uppercase leading-snug tracking-wider text-cyan-100/80" aria-live="polite">
            {hint}
          </p>
        </div>
      )}
      {status === "error" && error && (
        <p role="alert" className="absolute bottom-3 left-3 z-20 max-w-[260px] rounded-[10px] border border-rose-400/40 bg-black/85 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}
    </>
  );
}
