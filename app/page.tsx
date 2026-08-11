"use client";

import Navbar from "./components/Navbar";

import HeroSection from "./components/sections/HeroSection";
import ProblemSection from "./components/sections/ProblemSection";
import CapabilitiesSection from "./components/sections/CapabilitiesSection";
import MechanismPipelineSection from "./components/sections/MechanismPipelineSection";
import InteractiveMechanismDemoSection from "./components/sections/InteractiveMechanismDemoSection";
import ScientificSourcesSection from "./components/sections/ScientificSourcesSection";
import MultiPaperEvidenceSection from "./components/sections/MultiPaperEvidenceSection";
import ResearchCopilotSection from "./components/sections/ResearchCopilotSection";
import HypothesisBuilderSection from "./components/sections/HypothesisBuilderSection";
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
      {/* ================================================= */}
      {/* 00 — NAVBAR                                      */}
      {/* ================================================= */}

      <Navbar />

      {/* ================================================= */}
      {/* 01 — HERO                                        */}
      {/* ================================================= */}

      <HeroSection />

      {/* ================================================= */}
      {/* 02 — RESEARCH PROBLEM                            */}
      {/* ================================================= */}

      <ProblemSection />

      {/* ================================================= */}
      {/* 03 — CORE CAPABILITIES                           */}
      {/* ================================================= */}

      <CapabilitiesSection />

      {/* ================================================= */}
      {/* 04 — FROM PAPERS TO MECHANISMS                   */}
      {/* ================================================= */}

      <MechanismPipelineSection />

      {/* ================================================= */}
      {/* 05 — INTERACTIVE MECHANISM DEMO                  */}
      {/* ================================================= */}

      <InteractiveMechanismDemoSection />

      {/* ================================================= */}
      {/* 06 — SCIENTIFIC DATA INFRASTRUCTURE              */}
      {/* ================================================= */}

      <ScientificSourcesSection />

      {/* ================================================= */}
      {/* 07 — MULTI-PAPER EVIDENCE SYNTHESIS              */}
      {/* ================================================= */}

      <MultiPaperEvidenceSection />

      {/* ================================================= */}
      {/* 08 — MECHANISM-AWARE RESEARCH COPILOT            */}
      {/* ================================================= */}

      <ResearchCopilotSection />

      {/* ================================================= */}
      {/* 09 — HYPOTHESIS BUILDER                          */}
      {/* ================================================= */}

      <HypothesisBuilderSection />

      {/* ================================================= */}
      {/* 10 — BIOLOGICAL JOURNEY                          */}
      {/* ================================================= */}

      <BioJourney />

      {/* ================================================= */}
      {/* 11 — ABOUT                                       */}
      {/* ================================================= */}

      <AboutSection />
    </main>
  );
}