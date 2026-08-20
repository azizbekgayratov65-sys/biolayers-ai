"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FlaskConical } from "lucide-react";

import dynamic from "next/dynamic";

const SectionPlaceholder = ({ className = "" }: { className?: string }) => (
  <div className={`w-full animate-pulse ${className}`} />
);

const HeroSection = dynamic(() => import("./components/sections/HeroSection"), { ssr: false, loading: () => <SectionPlaceholder className="min-h-screen" /> });
const ProblemSection = dynamic(() => import("./components/sections/ProblemSection"), { ssr: false, loading: () => <SectionPlaceholder className="min-h-[60vh]" /> });
const CapabilitiesSection = dynamic(() => import("./components/sections/CapabilitiesSection"), { ssr: false, loading: () => <SectionPlaceholder className="min-h-[80vh]" /> });
const AboutSection = dynamic(() => import("./components/sections/AboutSection"), { ssr: false, loading: () => <SectionPlaceholder className="min-h-[50vh]" /> });

export default function Home() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <>
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
      {/* 04 — ABOUT                                       */}
      {/* ================================================= */}

      <AboutSection />

      {/* ================================================= */}
      {/* 05 — NEXT PAGE CTA                               */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          border-t
          border-teal-200/[0.06]
          bg-[#030507]
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
          <span
            className="
              font-mono
              text-[10px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-teal-300/50
            "
          >
            Explore the platform
          </span>

          <h2
            className="
              text-3xl
              font-black
              tracking-[-0.03em]
              text-white
              sm:text-4xl
            "
          >
            See how BioLayers works
          </h2>

          <p
            className="
              max-w-xl
              text-base
              leading-relaxed
              text-slate-400
            "
          >
            Dive into the mechanism pipeline, interactive demos, scientific
            data infrastructure, and the AI copilot and evidence
            classification built into the BioLayers workspace.
          </p>

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
                href="/platform"
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
                Platform
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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
                  border-sky-200/12
                  bg-sky-200/[0.035]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-sky-100/80
                  transition
                  duration-300
                  hover:border-sky-200/25
                  hover:bg-sky-200/[0.07]
                  hover:text-white
                "
              >
                <FlaskConical className="h-4 w-4 text-sky-300/70" />
                Journey
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
