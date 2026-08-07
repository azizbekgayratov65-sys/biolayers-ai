"use client";

import Navbar from "./components/Navbar";

import AboutSection from "./components/sections/AboutSection";
import CapabilitiesSection from "./components/sections/CapabilitiesSection";
import HeroSection from "./components/sections/HeroSection";
import HomeScrollCinematic from "./components/sections/HomeScrollCinematic";

import PlanetScene from "./components/planet/PlanetScene";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#01030a] text-white">
      <Navbar />

      <HomeScrollCinematic
        hero={
          <HeroSection />
        }
        capabilities={
          <CapabilitiesSection />
        }
        team={
          <PlanetScene />
        }
        about={
          <AboutSection />
        }
      />
    </main>
  );
}