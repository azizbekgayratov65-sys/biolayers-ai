"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import dynamic from "next/dynamic";

const SectionPlaceholder = ({ className = "" }: { className?: string }) => (
  <div className={`w-full animate-pulse ${className}`} />
);

const MechanismPipelineSection = dynamic(
  () => import("../components/sections/MechanismPipelineSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[70vh]" /> },
);
const InteractiveMechanismDemoSection = dynamic(
  () => import("../components/sections/InteractiveMechanismDemoSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[80vh]" /> },
);
const ScientificSourcesSection = dynamic(
  () => import("../components/sections/ScientificSourcesSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[70vh]" /> },
);
const MultiPaperEvidenceSection = dynamic(
  () => import("../components/sections/MultiPaperEvidenceSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[70vh]" /> },
);
const ResearchCopilotSection = dynamic(
  () => import("../components/sections/ResearchCopilotSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[70vh]" /> },
);
const HypothesisBuilderSection = dynamic(
  () => import("../components/sections/HypothesisBuilderSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[70vh]" /> },
);

export default function PlatformPage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <>
      {/* ================================================= */}
      {/* 01 — MECHANISM PIPELINE                          */}
      {/* ================================================= */}

      <MechanismPipelineSection />

      {/* ================================================= */}
      {/* 02 — INTERACTIVE MECHANISM DEMO                  */}
      {/* ================================================= */}

      <InteractiveMechanismDemoSection />

      {/* ================================================= */}
      {/* 03 — SCIENTIFIC DATA INFRASTRUCTURE              */}
      {/* ================================================= */}

      <ScientificSourcesSection />

      {/* ================================================= */}
      {/* 04 — MULTI-PAPER EVIDENCE SYNTHESIS              */}
      {/* ================================================= */}

      <MultiPaperEvidenceSection />

      {/* ================================================= */}
      {/* 05 — MECHANISM-AWARE RESEARCH COPILOT            */}
      {/* ================================================= */}

      <ResearchCopilotSection />

      {/* ================================================= */}
      {/* 06 — HYPOTHESIS BUILDER                          */}
      {/* ================================================= */}

      <HypothesisBuilderSection />

      {/* ================================================= */}
      {/* 07 — PAGE NAVIGATION                             */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          border-t
          border-teal-200/[0.06]
          bg-[#040d15]
          py-24
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-[300px]
            w-[700px]
            -translate-x-1/2
            rounded-full
            bg-teal-400/[0.035]
            blur-[120px]
          "
        />

        <div
          className="
            relative
            mx-auto
            flex
            max-w-4xl
            flex-col
            items-center
            gap-8
            px-6
            text-center
          "
        >
          <h2
            className="
              text-3xl
              font-black
              tracking-[-0.03em]
              text-white
              sm:text-4xl
            "
          >
            Continue exploring
          </h2>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-4
            "
          >
            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -2, scale: 1.02 }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : { scale: 0.97 }
              }
            >
              <Link
                href="/"
                className="
                  group
                  flex
                  items-center
                  gap-2.5
                  rounded-[14px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-300/80
                  transition
                  duration-300
                  hover:border-white/20
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Home
              </Link>
            </motion.div>

            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -2, scale: 1.02 }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : { scale: 0.97 }
              }
            >
              <Link
                href="/journey"
                className="
                  group
                  flex
                  items-center
                  gap-2.5
                  rounded-[14px]
                  border
                  border-teal-200/25
                  bg-teal-300/[0.08]
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-teal-50
                  transition
                  duration-300
                  hover:border-teal-200/40
                  hover:bg-teal-300/[0.14]
                "
              >
                Journey
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
