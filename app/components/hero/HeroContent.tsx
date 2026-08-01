"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRouter } from "next/navigation";

import PortalTransition from "./PortalTransition";

const EXAMPLE_TEXT =
  "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and remodeling of the tumor microenvironment.";

const KEYWORDS = ["Cells", "Proteins", "Pathways", "Evidence", "PubMed"];

export default function HeroContent() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, { stiffness: 85, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 85, damping: 22 });
  const headingX = useTransform(smoothX, [0, 1], [-10, 10]);
  const headingY = useTransform(smoothY, [0, 1], [-7, 7]);
  const cardX = useTransform(smoothX, [0, 1], [-5, 5]);
  const cardY = useTransform(smoothY, [0, 1], [-4, 4]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX / window.innerWidth);
      pointerY.set(event.clientY / window.innerHeight);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [pointerX, pointerY]);

  function goToWorkspace() {
    setTransitioning(true);
    window.setTimeout(() => router.push("/explore"), 900);
  }

  function openWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const preparedText = text.trim();

    if (preparedText.length < 20) {
      setError("Paste a research paragraph containing at least 20 characters.");
      return;
    }

    sessionStorage.setItem("biolayers-input", preparedText);
    goToWorkspace();
  }

  function useExample() {
    setText(EXAMPLE_TEXT);
    setError("");
  }

  return (
    <>
      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-6 pb-12 pt-28 sm:px-10 lg:px-16">
        <motion.div
          style={{ x: headingX, y: headingY }}
          className="w-full max-w-[700px] lg:-translate-x-6 xl:-translate-x-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8 inline-flex overflow-hidden rounded-full border border-cyan-300/25 bg-cyan-300/[0.07] px-4 py-2 backdrop-blur-2xl"
          >
            <motion.div
              animate={{ x: ["-130%", "250%"] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.2 }}
              className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md"
            />
            <div className="relative flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100">
                AI × Computational Oncology
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ opacity: [0.18, 0.5, 0.18], scale: [0.94, 1.05, 0.94] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -left-12 top-10 h-44 w-80 rounded-full bg-cyan-400/20 blur-[80px]"
            />

            <h1 className="relative max-w-[680px] text-5xl font-black leading-[0.92] tracking-[-0.065em] text-white sm:text-6xl lg:text-[78px] xl:text-[86px]">
              <span className="relative inline-block">
                From papers
                <motion.span
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{ duration: 5, repeat: Infinity, repeatDelay: 1.4 }}
                  className="pointer-events-none absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl"
                />
              </span>

              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="block bg-gradient-to-r from-cyan-300 via-blue-400 via-violet-400 to-fuchsia-400 bg-[length:260%_260%] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,.18)]"
              >
                to living maps.
              </motion.span>
            </h1>

            <motion.div
              animate={{ scaleX: [0.25, 1, 0.25], opacity: [0.25, 0.9, 0.25] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mt-6 h-px max-w-[560px] origin-left bg-gradient-to-r from-cyan-300 via-violet-400 to-transparent shadow-[0_0_18px_rgba(103,232,249,.7)]"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-[600px] text-base font-medium leading-8 text-slate-200 sm:text-lg"
          >
            Transform complex oncology research into an interactive map of{" "}
            <span className="text-cyan-200">cells</span>,{" "}
            <span className="text-blue-200">genes</span>,{" "}
            <span className="text-violet-200">proteins</span>,{" "}
            <span className="text-fuchsia-200">pathways</span> and disease mechanisms.
          </motion.p>

          <motion.form
            onSubmit={openWorkspace}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.34, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: cardX, y: cardY }}
            className="mt-10 w-full max-w-[600px] lg:-translate-x-2 xl:-translate-x-5"
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.006 }}
              className="group relative overflow-hidden rounded-[30px] border border-cyan-300/15 bg-slate-950/65 shadow-[0_35px_120px_rgba(3,105,161,0.22)] backdrop-blur-2xl"
            >
              <motion.div
                animate={{ x: ["-150%", "220%"] }}
                transition={{ duration: 6, repeat: Infinity, repeatDelay: 1.5 }}
                className="pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-200/[0.08] to-transparent blur-2xl"
              />
              <motion.div
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-[length:220%_220%]"
              />

              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
                placeholder="Paste a paragraph from a cancer research paper..."
                className="relative min-h-40 w-full resize-none bg-transparent px-6 pb-4 pt-6 text-[15px] leading-7 text-white outline-none placeholder:text-slate-500"
              />

              <div className="relative flex flex-col gap-3 border-t border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={useExample}
                  className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-400 transition hover:bg-cyan-300/[0.06] hover:text-cyan-100"
                >
                  Use an example
                </button>

                <motion.button
                  type="submit"
                  disabled={transitioning}
                  whileHover={{ scale: transitioning ? 1 : 1.035, y: transitioning ? 0 : -2 }}
                  whileTap={{ scale: transitioning ? 1 : 0.97 }}
                  className="group relative overflow-hidden rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_15px_45px_rgba(255,255,255,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <motion.span
                    animate={{ x: ["-160%", "240%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1 }}
                    className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent blur-md"
                  />
                  <span className="relative">
                    {transitioning ? "Opening portal..." : "Explore biology"}
                    {!transitioning && (
                      <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm font-medium text-rose-300"
              >
                {error}
              </motion.p>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 1 }}
            className="mt-8 flex max-w-[600px] flex-wrap gap-3 lg:-translate-x-2 xl:-translate-x-5"
          >
            {KEYWORDS.map((keyword, index) => (
              <motion.span
                key={keyword}
                animate={{ y: [0, -3, 0], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.8, delay: index * 0.22, repeat: Infinity }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 backdrop-blur-xl"
              >
                {keyword}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <PortalTransition active={transitioning} />
    </>
  );
}