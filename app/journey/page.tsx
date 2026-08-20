"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import dynamic from "next/dynamic";

const SectionPlaceholder = ({ className = "" }: { className?: string }) => (
  <div className={`w-full animate-pulse ${className}`} />
);

const BioJourney = dynamic(
  () => import("../components/journey/BioJourney"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[100vh]" /> },
);
const ResearchMentorshipSection = dynamic(
  () => import("../components/sections/ResearchMentorshipSection"),
  { ssr: false, loading: () => <SectionPlaceholder className="min-h-[70vh]" /> },
);

export default function JourneyPage() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <>
      {/* ================================================= */}
      {/* 01 — BIOLOGICAL JOURNEY                          */}
      {/* ================================================= */}

      <BioJourney />

      {/* ================================================= */}
      {/* 02 — RESEARCH MENTORSHIP                         */}
      {/* ================================================= */}

      <ResearchMentorshipSection />

      {/* ================================================= */}
      {/* 03 — PAGE NAVIGATION                             */}
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
          <h2
            className="
              text-3xl
              font-black
              tracking-[-0.03em]
              text-white
              sm:text-4xl
            "
          >
            You've reached the end
          </h2>

          <p
            className="
              max-w-xl
              text-base
              leading-relaxed
              text-slate-400
            "
          >
            You've explored the full BioLayers journey — from papers to
            mechanisms to hypotheses. Ready to start building your own?
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
                href="/explore"
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
                Open Workspace
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
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
