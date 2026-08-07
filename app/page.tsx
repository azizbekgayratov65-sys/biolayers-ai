"use client";

import Navbar from "./components/Navbar";
import AboutSection from "./components/sections/AboutSection";
import CapabilitiesSection from "./components/sections/CapabilitiesSection";
import HeroSection from "./components/sections/HeroSection";
import TeamSection from "./components/sections/TeamSection";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#01030a] text-white">
      <HeroSection />
      <Navbar />
      <CapabilitiesSection />
      <TeamSection />
      <AboutSection />
    </main>
  );
}