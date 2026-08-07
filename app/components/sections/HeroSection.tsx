"use client";

import CursorEnergyField from "../hero/CursorEnergyField";
import HeroContent from "../hero/HeroContent";
import HeroStageNarrative from "../hero/HeroStageNarrative";
import HeroThreeScene from "../hero/HeroThreeScene";

export default function HeroSection() {
  return (
    <>
      <section
        id="workspace"
        aria-label="BioLayers AI workspace introduction"
        className="relative z-20 min-h-screen overflow-hidden bg-[#01030a]"
      >
        <div className="absolute inset-0 z-0">
          <HeroThreeScene />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(1,3,10,.88)_0%,rgba(1,3,10,.58)_31%,rgba(1,3,10,.12)_58%,rgba(1,3,10,.06)_100%)]" />

        <HeroStageNarrative />

        <div className="relative z-10">
          <HeroContent />
        </div>
      </section>

      <CursorEnergyField />
    </>
  );
}