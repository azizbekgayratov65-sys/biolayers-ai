"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Particle = {
  u: number;
  v: number;
  r: number;
  phase: number;
  size: number;
  hue: number;
};

const TAU = Math.PI * 2;
const DURATION = 13.5;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smooth(a: number, b: number, t: number) {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function seeded(n: number) {
  const x = Math.sin(n * 91.3458 + 12.234) * 47453.5453;
  return x - Math.floor(x);
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    u: seeded(i + 1),
    v: seeded(i + 1001),
    r: seeded(i + 2001),
    phase: seeded(i + 3001) * TAU,
    size: 0.55 + seeded(i + 4001) * 1.45,
    hue: seeded(i + 5001),
  }));
}

function pointForStage(
  p: Particle,
  index: number,
  stage: number,
  local: number,
  w: number,
  h: number,
) {
  const cx = w * 0.5;
  const cy = h * 0.49;
  const s = Math.min(w, h);

  // Stage 0: giant luminous portal ring around hero copy
  if (stage === 0) {
    const angle = p.phase + local * 0.25;
    const rx = s * (0.33 + p.r * 0.018);
    const ry = rx * 0.78;
    const wobble = Math.sin(angle * 3 + local * 5) * s * 0.007;
    return {
      x: cx + Math.cos(angle) * (rx + wobble),
      y: cy + Math.sin(angle) * (ry + wobble),
      a: 0.45 + p.u * 0.55,
      hue: p.hue > 0.56 ? 335 : p.hue > 0.3 ? 265 : 195,
    };
  }

  // Stage 1: hourglass / funnel
  if (stage === 1) {
    const yNorm = p.u * 2 - 1;
    const y = cy + yNorm * s * 0.40;
    const pinch = 0.02 + Math.pow(Math.abs(yNorm), 1.35) * 0.19;
    const angle = p.phase + yNorm * 6.5 + local * 1.3;
    const radius = s * pinch * (0.55 + p.r * 0.9);
    return {
      x: cx + Math.cos(angle) * radius,
      y,
      a: 0.25 + (1 - Math.abs(yNorm)) * 0.75,
      hue: yNorm > 0 ? 330 : 200,
    };
  }

  // Stage 2: DNA helix, very explicit
  if (stage === 2) {
    const yNorm = p.u * 2 - 1;
    const strand = index % 2 === 0 ? 0 : Math.PI;
    const angle = yNorm * 8.5 + local * 2.3 + strand;
    const radius = s * (0.075 + p.r * 0.012);
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + yNorm * s * 0.34,
      a: 0.45 + p.v * 0.55,
      hue: index % 2 === 0 ? 198 : 280,
    };
  }

  // Stage 3: particles burst outward / starfield
  if (stage === 3) {
    const angle = p.phase;
    const radius = s * (0.06 + Math.pow(p.u, 0.55) * 0.65) * (0.65 + local * 0.5);
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.56,
      a: 0.18 + p.v * 0.82,
      hue: p.hue > 0.72 ? 330 : p.hue > 0.42 ? 270 : 205,
    };
  }

  // Stage 4: low, horizontal energy wave exactly like reference
  if (stage === 4) {
    const x = w * (-0.05 + p.u * 1.1);
    const base = h * 0.72;
    const wave =
      Math.sin(p.u * 18 + p.phase + local * 7) * s * 0.018 +
      Math.sin(p.u * 42 + local * 5) * s * 0.006;
    const band = (p.v - 0.5) * s * 0.07;
    return {
      x,
      y: base + wave + band,
      a: 0.22 + (1 - Math.abs(p.v - 0.5) * 2) * 0.78,
      hue: p.u > 0.62 ? 335 : p.u > 0.36 ? 275 : 195,
    };
  }

  // Stage 5: black-hole / galaxy disk finale
  const angle =
    p.phase +
    p.u * 10.5 +
    local * 0.55 +
    (index % 4) * 0.33;
  const radius = s * (0.035 + Math.pow(p.u, 0.62) * 0.45);
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius * 0.26,
    a: 0.26 + p.v * 0.74,
    hue: p.hue > 0.68 ? 325 : p.hue > 0.37 ? 270 : 200,
  };
}

function drawDNAConnectors(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  local: number,
) {
  const cx = w * 0.5;
  const cy = h * 0.49;
  const s = Math.min(w, h);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(185,205,255,.24)";

  for (let i = 0; i < 26; i += 1) {
    const t = i / 25;
    const yNorm = t * 2 - 1;
    const y = cy + yNorm * s * 0.34;
    const angle = yNorm * 8.5 + local * 2.3;
    const r = s * 0.078;
    const x1 = cx + Math.cos(angle) * r;
    const x2 = cx + Math.cos(angle + Math.PI) * r;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  local: number,
) {
  const base = h * 0.72;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let j = 0; j < 13; j += 1) {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "rgba(34,211,238,0)");
    g.addColorStop(0.18, "rgba(34,211,238,.45)");
    g.addColorStop(0.48, "rgba(161,92,255,.58)");
    g.addColorStop(0.77, "rgba(244,63,94,.52)");
    g.addColorStop(1, "rgba(244,63,94,0)");

    ctx.strokeStyle = g;
    ctx.lineWidth = j === 6 ? 1.8 : 0.75;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(161,92,255,.65)";

    ctx.beginPath();
    for (let x = 0; x <= w; x += 12) {
      const u = x / w;
      const y =
        base +
        (j - 6) * 4 +
        Math.sin(u * 16 + local * 7 + j * 0.2) * 12 +
        Math.sin(u * 40 + local * 4) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawGalaxyCore(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  local: number,
) {
  const cx = w * 0.5;
  const cy = h * 0.49;
  const s = Math.min(w, h);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const glow = ctx.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    s * 0.22,
  );
  glow.addColorStop(0, "rgba(255,255,255,.98)");
  glow.addColorStop(0.08, "rgba(244,114,182,.85)");
  glow.addColorStop(0.22, "rgba(161,92,255,.48)");
  glow.addColorStop(0.48, "rgba(59,130,246,.16)");
  glow.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.23, s * 0.08, -0.08, 0, TAU);
  ctx.fill();

  // central dark singularity
  const hole = ctx.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    s * 0.055,
  );
  hole.addColorStop(0, "rgba(0,0,0,1)");
  hole.addColorStop(0.75, "rgba(0,0,0,.95)");
  hole.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hole;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.06, 0, TAU);
  ctx.fill();

  ctx.restore();
}

export default function ReferenceCinematicAnimation() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Stable non-null aliases for nested callbacks.
    // TypeScript does not preserve the original null narrowing
    // across resize()/frame() closures.
    const canvasEl: HTMLCanvasElement = canvas;
    const context: CanvasRenderingContext2D = ctx;

    const particles = makeParticles(2200);
    let w = 0;
    let h = 0;
    let raf = 0;
    const start = performance.now();

    function resize() {
      const rect = canvasEl.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      canvasEl.width = Math.max(1, Math.floor(w * dpr));
      canvasEl.height = Math.max(1, Math.floor(h * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvasEl);

    function frame(now: number) {
      const elapsed = reduced ? 0.8 : ((now - start) / 1000) % DURATION;
      const stageFloat = (elapsed / DURATION) * 6;
      const stage = Math.min(5, Math.floor(stageFloat));
      const local = stageFloat - stage;

      context.clearRect(0, 0, w, h);

      // background star dust
      context.save();
      context.globalCompositeOperation = "lighter";
      for (let i = 0; i < 180; i += 1) {
        const x = seeded(i * 11 + 1) * w;
        const y = seeded(i * 13 + 2) * h;
        const twinkle = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(now * 0.0015 + i));
        context.fillStyle = `rgba(141,178,255,${0.05 * twinkle})`;
        context.fillRect(x, y, 1, 1);
      }
      context.restore();

      if (stage === 2) drawDNAConnectors(context, w, h, local);
      if (stage === 4) drawWave(context, w, h, local);
      if (stage === 5) drawGalaxyCore(context, w, h, local);

      const morph = smooth(0.70, 1, local);
      const nextStage = stage === 5 ? 0 : stage + 1;

      context.save();
      context.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const a = pointForStage(p, i, stage, local, w, h);
        const b = pointForStage(p, i, nextStage, 0, w, h);

        const x = lerp(a.x, b.x, morph);
        const y = lerp(a.y, b.y, morph);
        const hue = lerp(a.hue, b.hue, morph);
        const alpha = lerp(a.a, b.a, morph);
        const pulse = 0.6 + 0.4 * Math.sin(now * 0.002 + p.phase);
        const size = p.size * (0.8 + pulse * 0.9);

        context.fillStyle = `hsla(${hue}, 100%, 72%, ${alpha * 0.72})`;
        context.shadowColor = `hsla(${hue}, 100%, 70%, ${alpha})`;
        context.shadowBlur = 7 + size * 4;

        context.beginPath();
        context.arc(x, y, size, 0, TAU);
        context.fill();
      }

      context.restore();

      // ring light arcs
      if (stage === 0) {
        const cx = w * 0.5;
        const cy = h * 0.49;
        const s = Math.min(w, h);
        context.save();
        context.globalCompositeOperation = "lighter";
        context.lineCap = "round";

        for (let j = 0; j < 7; j += 1) {
          const radius = s * (0.315 + j * 0.006);
          const grad = context.createLinearGradient(cx - radius, cy, cx + radius, cy);
          grad.addColorStop(0, "rgba(34,211,238,.95)");
          grad.addColorStop(0.45, "rgba(161,92,255,.9)");
          grad.addColorStop(1, "rgba(244,63,94,.95)");
          context.strokeStyle = grad;
          context.lineWidth = j === 3 ? 2.2 : 0.8;
          context.shadowBlur = 24;
          context.shadowColor = "rgba(161,92,255,.8)";
          context.beginPath();
          context.ellipse(
            cx,
            cy,
            radius,
            radius * 0.78,
            0,
            local * 0.5 + j * 0.12,
            local * 0.5 + j * 0.12 + TAU * 0.82,
          );
          context.stroke();
        }
        context.restore();
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    frame(performance.now());

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,3,10,.08)_46%,rgba(1,3,10,.72)_78%,#030507_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,3,10,.05),rgba(1,3,10,0)_55%,rgba(1,3,10,.65))]" />
    </div>
  );
}