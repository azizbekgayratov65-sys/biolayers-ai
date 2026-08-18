"use client";

import dynamic from "next/dynamic";
import HeroContent from "../hero/HeroContent";
import HeroStageNarrative from "../hero/HeroStageNarrative";

const CursorEnergyField = dynamic(
  () => import("../hero/CursorEnergyField"),
  { ssr: false },
);

const HeroThreeScene = dynamic(
  () => import("../hero/HeroThreeScene"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(45,212,191,.055),transparent_30%),radial-gradient(circle_at_84%_70%,rgba(125,211,252,.035),transparent_26%)]" />
    ),
  },
);

export default function HeroSection() {
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
          bg-[#01030a]
        "
      >
        {/* ================================================= */}
        {/* 3D BIOLOGICAL ENVIRONMENT                        */}
        {/* ================================================= */}

        <div className="absolute inset-0 z-0">
          <HeroThreeScene />
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
            bg-[linear-gradient(90deg,rgba(1,3,10,.92)_0%,rgba(1,3,10,.68)_30%,rgba(1,3,10,.20)_58%,rgba(1,3,10,.07)_100%)]
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
            bg-teal-300/[0.025]
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

      <CursorEnergyField />
    </>
  );
}