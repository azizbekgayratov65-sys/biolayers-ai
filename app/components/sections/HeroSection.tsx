"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HeroContent from "../hero/HeroContent";
import HeroStageNarrative from "../hero/HeroStageNarrative";

const CursorEnergyField = dynamic(
  () => import("../hero/CursorEnergyField"),
);

const HeroThreeScene = dynamic(
  () => import("../hero/HeroThreeScene"),
  {
    loading: () => (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(77,141,255,.055),transparent_30%),radial-gradient(circle_at_84%_70%,rgba(141,178,255,.035),transparent_26%)]" />
    ),
  },
);

function useAfterIdle(
  timeoutMs = 6000,
): boolean {
  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const start = () => {
      const handle = window.requestIdleCallback(
        () => setReady(true),
        { timeout: timeoutMs },
      );

      return () => {
        window.cancelIdleCallback(handle);
      };
    };

    // Wait for the window load event so the three.js chunk
    // (3D scene) never competes with the critical JS/CSS that
    // paints the hero text — especially on slow connections.
    if (document.readyState === "complete") {
      return start();
    }

    window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
    };
  }, [timeoutMs]);

  return ready;
}

export default function HeroSection() {
  const sceneReady = useAfterIdle();

  return (
    <>
      <section
        id="hero"
        aria-label="BioLayers AI introduction"
        className="
          relative
          z-20
          min-h-screen
          overflow-hidden
          bg-[#030507]
        "
      >
        {/* ================================================= */}
        {/* DARK-FIELD SCENE — RACKED INTO FOCUS ON LOAD     */}
        {/* Loaded after the browser is idle so the three.js  */}
        {/* chunk never blocks the hero text from painting.  */}
        {/* ================================================= */}

        <div className="absolute inset-0 z-0 bl-focus-in">
          {sceneReady ? (
            <HeroThreeScene />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(77,141,255,.055),transparent_30%),radial-gradient(circle_at_84%_70%,rgba(141,178,255,.035),transparent_26%)]" />
          )}
        </div>

        {/* ================================================= */}
        {/* OBJECTIVE RING READOUT                           */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-0
            top-[100px]
            z-[3]
            hidden
            items-center
            gap-2.5
            rounded-r-full
            border
            border-l-0
            border-teal-100/[0.08]
            bg-[#0a0f14]/55
            px-2.5
            py-2
            backdrop-blur-xl
            lg:flex
          "
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-300/70 [writing-mode:vertical-lr]">
            CH·DAPI 40× λ405nm
          </span>
          <span className="h-1 w-1 rounded-full bg-teal-300" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500 [writing-mode:vertical-lr]">
            Live field
          </span>
        </div>

        {/* ================================================= */}
        {/* CONTRAST GRADIENT                                */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[linear-gradient(90deg,rgba(3,5,7,.93)_0%,rgba(3,5,7,.72)_30%,rgba(3,5,7,.24)_58%,rgba(3,5,7,.08)_100%)]
          "
        />

        {/* ================================================= */}
        {/* SUBTLE HERO LIGHT                                */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[18%]
            top-[28%]
            z-[2]
            h-[420px]
            w-[420px]
            rounded-full
            bg-teal-300/[0.03]
            blur-[100px]
          "
        />

        {/* ================================================= */}
        {/* TOP SCIENTIFIC LINE                              */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[84px]
            z-[3]
            h-px
            w-[min(72vw,900px)]
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-teal-200/[0.09]
            to-transparent
          "
        />

        {/* ================================================= */}
        {/* STAGE NARRATIVE                                  */}
        {/* ================================================= */}

        <HeroStageNarrative />

        {/* ================================================= */}
        {/* PRIMARY HERO CONTENT                             */}
        {/* ================================================= */}

        <div className="relative z-10">
          <HeroContent />
        </div>
      </section>

      {/* ================================================= */}
      {/* CURSOR ENERGY FIELD                               */}
      {/* ================================================= */}

      {sceneReady && <CursorEnergyField />}
    </>
  );
}