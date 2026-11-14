"use client";

import { useEffect, useRef } from "react";

/*
  Site-wide background: a black void with slowly drifting neon dust and faint
  links between nearby particles, like a holographic circuit. It leans a
  little toward the mouse for depth. Static when reduced motion is on,
  paused when the tab is hidden.
*/

const COLORS = ["#4f7dff", "#00f5d4", "#ff4ecd", "#ffd60a", "#9b5cff", "#ff7a1a", "#7cff4f"];

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    type P = { x: number; y: number; z: number; vx: number; vy: number; c: string; r: number; tw: number };
    let ps: P[] = [];
    let mx = 0;
    let my = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(170, (w * h) / 9000));
      ps = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        r: 0.4 + Math.random() * 1.3,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    resize();

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / w - 0.5;
      my = e.clientY / h - 0.5;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });

    let frame = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const pos = ps.map((p) => ({ x: p.x - mx * 30 * p.z, y: p.y - my * 30 * p.z, p }));
      // Faint links: the "digital schematic".
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 120 * 120) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d2) / 120) * 0.12 * Math.min(pos[i].p.z, pos[j].p.z);
          ctx.strokeStyle = pos[i].p.c;
          ctx.beginPath();
          ctx.moveTo(pos[i].x, pos[i].y);
          ctx.lineTo(pos[j].x, pos[j].y);
          ctx.stroke();
        }
      }
      for (const { x, y, p } of pos) {
        const twinkle = 0.55 + 0.45 * Math.sin(t / 900 + p.tw);
        ctx.globalAlpha = 0.18 + 0.5 * p.z * twinkle;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(x, y, p.r * p.z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      for (const p of ps) {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
      draw(t);
    };
    if (reduced) draw(0);
    else frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
