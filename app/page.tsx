"use client";

import Navbar from "./components/Navbar";

import HeroSection from "./components/sections/HeroSection";
import CapabilitiesSection from "./components/sections/CapabilitiesSection";
import AboutSection from "./components/sections/AboutSection";

import BioJourney from "./components/journey/BioJourney";

export default function Home() {
  return (
    <main
      className="
        relative
        min-h-screen
        bg-[#020105]
      "
      style={{
        overflowX: "clip",
      }}
    >
      <Navbar />

      {/* ================================================= */}
      {/* 01 — HERO                                        */}
      {/* ================================================= */}

      <HeroSection />

      {/* ================================================= */}
      {/* 02 — CAPABILITIES                                */}
      {/* ================================================= */}

      <CapabilitiesSection />

      {/* ================================================= */}
      {/* 03 — ONE CONTINUOUS BIO JOURNEY                  */}
      {/* ================================================= */}

      <BioJourney />

      {/* ================================================= */}
      {/* 04 — ABOUT                                       */}
      {/* ================================================= */}

      <AboutSection />
    </main>
  );
}