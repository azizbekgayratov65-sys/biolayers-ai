"use client";

import {
  useEffect,
  useRef,
} from "react";
import { useReducedMotion } from "framer-motion";

type Particle = {
  seed: number;
  phase: number;
  radius: number;
  speed: number;
  size: number;
  drift: number;
};

const TAU = Math.PI * 2;
const CYCLE = 13.4;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(
  edge0: number,
  edge1: number,
  value: number,
) {
  const x = clamp01(
    (value - edge0) / (edge1 - edge0),
  );

  return x * x * (3 - 2 * x);
}

function mix(
  a: number,
  b: number,
  t: number,
) {
  return a + (b - a) * t;
}

function seeded(index: number) {
  const value = Math.sin(
    index * 12.9898 + 78.233,
  ) * 43758.5453;

  return value - Math.floor(value);
}

function createParticles(
  count: number,
): Particle[] {
  return Array.from(
    { length: count },
    (_, index) => {
      const seed = seeded(index + 1);

      return {
        seed,
        phase:
          seeded(index + 77) * TAU,
        radius:
          0.35 +
          seeded(index + 133) * 0.65,
        speed:
          0.7 +
          seeded(index + 311) * 1.4,
        size:
          0.45 +
          seeded(index + 501) * 1.65,
        drift:
          seeded(index + 701) * 2 - 1,
      };
    },
  );
}

function getStageTarget(
  particle: Particle,
  index: number,
  stage: number,
  local: number,
  width: number,
  height: number,
) {
  const cx = width * 0.72;
  const cy = height * 0.48;
  const scale = Math.min(
    width,
    height,
  );

  const randomAngle =
    particle.phase +
    local * particle.speed;

  // 0 — luminous portal ring
  if (stage === 0) {
    const ringRadius =
      scale *
      (0.18 +
        particle.seed * 0.015);

    const pulse =
      Math.sin(
        local * TAU * 1.3 +
          particle.phase,
      ) *
      scale *
      0.008;

    return {
      x:
        cx +
        Math.cos(randomAngle) *
          (ringRadius + pulse),
      y:
        cy +
        Math.sin(randomAngle) *
          (ringRadius * 0.53 + pulse),
      alpha:
        0.32 +
        particle.seed * 0.68,
      hue:
        particle.seed > 0.54
          ? 275
          : 190,
    };
  }

  // 1 — ring collapses into a particle fountain / neural plume
  if (stage === 1) {
    const spread =
      Math.pow(
        particle.seed,
        1.8,
      );

    const rise =
      scale *
      (0.06 +
        local * 0.43 +
        particle.seed * 0.16);

    const lateral =
      particle.drift *
      scale *
      (0.035 +
        spread * 0.15) *
      (0.35 +
        Math.sin(
          particle.phase +
            local * 4,
        ) *
          0.65);

    return {
      x:
        cx +
        lateral +
        Math.sin(
          particle.phase * 3 +
            local * 5,
        ) *
          18,
      y:
        cy +
        scale * 0.21 -
        rise,
      alpha:
        0.18 +
        (1 - spread) * 0.8,
      hue:
        205 +
        particle.seed * 85,
    };
  }

  // 2 — double helix / DNA-like structure
  if (stage === 2) {
    const strand =
      index % 2 === 0
        ? 0
        : Math.PI;

    const vertical =
      (particle.seed - 0.5) *
      scale *
      0.6;

    const helixAngle =
      particle.phase +
      vertical * 0.017 +
      local * 2.4 +
      strand;

    const helixRadius =
      scale *
      (0.055 +
        Math.sin(
          particle.phase * 2,
        ) *
          0.006);

    return {
      x:
        cx +
        Math.cos(helixAngle) *
          helixRadius,
      y:
        cy + vertical,
      alpha:
        0.35 +
        particle.seed * 0.65,
      hue:
        index % 2 === 0
          ? 190
          : 276,
    };
  }

  // 3 — horizontal energy beam
  if (stage === 3) {
    const x =
      width *
      (0.12 +
        particle.seed * 0.86);

    const wave =
      Math.sin(
        particle.phase +
          particle.seed * 16 +
          local * 7,
      );

    const y =
      cy +
      wave *
        scale *
        (0.008 +
          particle.radius *
            0.012);

    return {
      x,
      y,
      alpha:
        0.28 +
        (1 -
          Math.abs(
            particle.seed - 0.5,
          )) *
          0.72,
      hue:
        particle.seed > 0.6
          ? 320
          : 205,
    };
  }

  // 4 — galaxy / knowledge-space explosion
  if (stage === 4) {
    const arm =
      index % 4;

    const angle =
      particle.phase +
      particle.radius * 8.8 +
      arm * (TAU / 4) +
      local * 0.65;

    const galaxyRadius =
      scale *
      (0.04 +
        Math.pow(
          particle.seed,
          0.58,
        ) *
          0.43);

    const flatten =
      0.42 +
      particle.seed * 0.18;

    return {
      x:
        cx +
        Math.cos(angle) *
          galaxyRadius,
      y:
        cy +
        Math.sin(angle) *
          galaxyRadius *
          flatten,
      alpha:
        0.18 +
        particle.seed * 0.82,
      hue:
        190 +
        particle.seed * 125,
    };
  }

  // 5 — final clean orbit, settling behind the CTA
  const ringRadius =
    scale *
    (0.11 +
      particle.seed * 0.025);

  return {
    x:
      cx +
      Math.cos(
        particle.phase +
          local * 0.75,
      ) *
        ringRadius,
    y:
      cy +
      Math.sin(
        particle.phase +
          local * 0.75,
      ) *
        ringRadius *
        0.38,
    alpha:
      0.18 +
      particle.seed * 0.65,
    hue:
      particle.seed > 0.5
        ? 275
        : 195,
  };
}

function drawCore(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stage: number,
  local: number,
) {
  const cx = width * 0.72;
  const cy = height * 0.48;
  const scale = Math.min(
    width,
    height,
  );

  if (
    stage === 0 ||
    stage === 5
  ) {
    const radius =
      scale *
      (stage === 0
        ? 0.15
        : 0.085);

    const gradient =
      ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.05,
        cx,
        cy,
        radius * 1.75,
      );

    gradient.addColorStop(
      0,
      "rgba(2,6,23,0)",
    );
    gradient.addColorStop(
      0.34,
      "rgba(2,6,23,.72)",
    );
    gradient.addColorStop(
      0.58,
      "rgba(34,211,238,.13)",
    );
    gradient.addColorStop(
      0.72,
      "rgba(161,92,255,.09)",
    );
    gradient.addColorStop(
      1,
      "rgba(2,6,23,0)",
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      radius * 1.75,
      radius,
      0,
      0,
      TAU,
    );
    ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation =
      "lighter";
    ctx.strokeStyle =
      "rgba(161,92,255,.55)";
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 32;
    ctx.shadowColor =
      "rgba(161,92,255,.85)";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      radius,
      radius * 0.48,
      0,
      0,
      TAU,
    );
    ctx.stroke();
    ctx.restore();
  }

  if (stage === 2) {
    ctx.save();
    ctx.globalCompositeOperation =
      "lighter";
    ctx.strokeStyle =
      "rgba(167,139,250,.18)";
    ctx.lineWidth = 1;

    const span = scale * 0.58;

    for (
      let i = 0;
      i < 18;
      i += 1
    ) {
      const y =
        cy -
        span / 2 +
        (span / 17) * i;

      const angle =
        i * 0.8 +
        local * 2.4;

      const x1 =
        cx +
        Math.cos(angle) *
          scale *
          0.052;
      const x2 =
        cx +
        Math.cos(
          angle + Math.PI,
        ) *
          scale *
          0.052;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export default function BioLayersParticleSequence() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const reduceMotion =
    useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d", {
        alpha: true,
      });

    if (!ctx) {
      return;
    }

    const particles =
      createParticles(920);

    let frame = 0;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let startTime =
      performance.now();

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;
      dpr = Math.min(
        window.devicePixelRatio || 1,
        1.75,
      );

      canvas.width =
        Math.max(
          1,
          Math.floor(width * dpr),
        );
      canvas.height =
        Math.max(
          1,
          Math.floor(height * dpr),
        );

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );
    };

    resize();

    const observer =
      new ResizeObserver(resize);

    observer.observe(canvas);

    const render = (
      now: number,
    ) => {
      const elapsed =
        reduceMotion
          ? CYCLE * 0.12
          : ((now - startTime) /
              1000) %
            CYCLE;

      const normalized =
        elapsed / CYCLE;

      const stageFloat =
        normalized * 6;

      const stage =
        Math.min(
          5,
          Math.floor(stageFloat),
        );

      const local =
        stageFloat - stage;

      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      const background =
        ctx.createRadialGradient(
          width * 0.72,
          height * 0.48,
          0,
          width * 0.72,
          height * 0.48,
          Math.max(
            width,
            height,
          ) * 0.72,
        );

      background.addColorStop(
        0,
        "rgba(15,23,42,.14)",
      );
      background.addColorStop(
        0.32,
        "rgba(8,47,73,.08)",
      );
      background.addColorStop(
        0.7,
        "rgba(30,27,75,.055)",
      );
      background.addColorStop(
        1,
        "rgba(2,6,23,0)",
      );

      ctx.fillStyle = background;
      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      drawCore(
        ctx,
        width,
        height,
        stage,
        local,
      );

      ctx.save();
      ctx.globalCompositeOperation =
        "lighter";

      const transitionIn =
        smoothstep(
          0,
          0.12,
          local,
        );
      const transitionOut =
        1 -
        smoothstep(
          0.82,
          1,
          local,
        );

      const stageOpacity =
        Math.max(
          0.24,
          transitionIn *
            transitionOut,
        );

      particles.forEach(
        (particle, index) => {
          const target =
            getStageTarget(
              particle,
              index,
              stage,
              local,
              width,
              height,
            );

          const nextStage =
            stage === 5
              ? 0
              : stage + 1;

          const next =
            getStageTarget(
              particle,
              index,
              nextStage,
              0,
              width,
              height,
            );

          const morph =
            smoothstep(
              0.68,
              1,
              local,
            );

          const x = mix(
            target.x,
            next.x,
            morph,
          );
          const y = mix(
            target.y,
            next.y,
            morph,
          );

          const hue = mix(
            target.hue,
            next.hue,
            morph,
          );

          const alpha =
            mix(
              target.alpha,
              next.alpha,
              morph,
            ) *
            stageOpacity;

          const twinkle =
            0.55 +
            Math.sin(
              now * 0.002 *
                particle.speed +
                particle.phase,
            ) *
              0.45;

          const size =
            particle.size *
            (0.65 +
              twinkle * 0.75);

          ctx.fillStyle = `hsla(${hue}, 95%, 72%, ${alpha * (0.48 + twinkle * 0.52)})`;
          ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${alpha})`;
          ctx.shadowBlur =
            4 + size * 4;

          ctx.beginPath();
          ctx.arc(
            x,
            y,
            size,
            0,
            TAU,
          );
          ctx.fill();

          if (
            index % 46 === 0 &&
            stage !== 3
          ) {
            ctx.fillStyle = `hsla(${hue}, 100%, 92%, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(
              x,
              y,
              size * 2.4,
              0,
              TAU,
            );
            ctx.fill();
          }
        },
      );

      ctx.restore();

      // Fast energy streaks during the beam transition.
      if (stage === 3) {
        ctx.save();
        ctx.globalCompositeOperation =
          "lighter";

        const cy =
          height * 0.48;

        for (
          let i = 0;
          i < 9;
          i += 1
        ) {
          const offset =
            (i - 4) * 5;

          const gradient =
            ctx.createLinearGradient(
              width * 0.08,
              cy + offset,
              width * 0.96,
              cy + offset,
            );

          gradient.addColorStop(
            0,
            "rgba(34,211,238,0)",
          );
          gradient.addColorStop(
            0.28,
            "rgba(34,211,238,.34)",
          );
          gradient.addColorStop(
            0.62,
            "rgba(167,139,250,.52)",
          );
          gradient.addColorStop(
            0.88,
            "rgba(244,114,182,.25)",
          );
          gradient.addColorStop(
            1,
            "rgba(244,114,182,0)",
          );

          ctx.strokeStyle =
            gradient;
          ctx.lineWidth =
            i === 4
              ? 1.8
              : 0.7;
          ctx.shadowBlur = 18;
          ctx.shadowColor =
            "rgba(161,92,255,.65)";

          ctx.beginPath();
          ctx.moveTo(
            width * 0.06,
            cy + offset,
          );
          ctx.bezierCurveTo(
            width * 0.34,
            cy +
              offset +
              Math.sin(
                local * 5 + i,
              ) *
                8,
            width * 0.68,
            cy +
              offset -
              Math.cos(
                local * 4 + i,
              ) *
                8,
            width * 0.98,
            cy + offset,
          );
          ctx.stroke();
        }

        ctx.restore();
      }

      frame += 1;

      if (!reduceMotion) {
        animationFrame =
          requestAnimationFrame(
            render,
          );
      }
    };

    render(performance.now());

    return () => {
      observer.disconnect();
      cancelAnimationFrame(
        animationFrame,
      );

      frame = 0;
      startTime = 0;
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-95"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,#030507_0%,rgba(1,3,10,.94)_28%,rgba(1,3,10,.46)_54%,rgba(1,3,10,.08)_78%,rgba(1,3,10,.3)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#030507] via-[#030507]/65 to-transparent" />
    </div>
  );
}