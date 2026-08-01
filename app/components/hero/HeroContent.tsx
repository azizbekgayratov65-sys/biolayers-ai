"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import PortalTransition from "./PortalTransition";

const EXAMPLE_TEXT =
  "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and remodeling of the tumor microenvironment.";

const TRANSITION_DURATION = 4550;

export default function HeroContent() {
  const router = useRouter();

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] =
    useState(false);

  const transitionTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (
        transitionTimerRef.current !== null
      ) {
        window.clearTimeout(
          transitionTimerRef.current,
        );
      }
    };
  }, []);

  const goToWorkspace = useCallback(() => {
    if (transitioning) {
      return;
    }

    setError("");
    setTransitioning(true);

    if (
      transitionTimerRef.current !== null
    ) {
      window.clearTimeout(
        transitionTimerRef.current,
      );
    }

    transitionTimerRef.current =
      window.setTimeout(() => {
        router.push("/explore");
      }, TRANSITION_DURATION);
  }, [router, transitioning]);

  function openWorkspace(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (transitioning) {
      return;
    }

    const preparedText = text.trim();

    if (preparedText.length < 20) {
      setError(
        "Paste a research paragraph containing at least 20 characters.",
      );

      return;
    }

    try {
      sessionStorage.setItem(
        "biolayers-input",
        preparedText,
      );
    } catch {
      setError(
        "Unable to save the research text in this browser.",
      );

      return;
    }

    goToWorkspace();
  }

  function useExample() {
    if (transitioning) {
      return;
    }

    setText(EXAMPLE_TEXT);
    setError("");
  }

  return (
    <>
      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-6 pb-12 pt-28 sm:px-10 lg:px-16">
        <div className="w-full max-w-[680px] lg:-translate-x-6 xl:-translate-x-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>

            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              AI × Computational Oncology
            </span>
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 28,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-[650px] text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-[78px] xl:text-[84px]"
          >
            From papers

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
              to living maps.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.22,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-8 max-w-[590px] text-base leading-8 text-slate-300 sm:text-lg"
          >
            Transform complex oncology research
            into an interactive map of cells,
            genes, proteins, pathways and disease
            mechanisms.
          </motion.p>

          <motion.form
            onSubmit={openWorkspace}
            initial={{
              opacity: 0,
              y: 28,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.34,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-10 w-full max-w-[590px] lg:-translate-x-2 xl:-translate-x-5"
          >
            <div
              className={`overflow-hidden rounded-[28px] border bg-slate-950/55 shadow-[0_30px_100px_rgba(3,105,161,0.18)] backdrop-blur-2xl transition ${
                transitioning
                  ? "border-cyan-300/20 opacity-60"
                  : "border-white/10"
              }`}
            >
              <textarea
                value={text}
                disabled={transitioning}
                onChange={(event) => {
                  setText(
                    event.target.value,
                  );

                  setError("");
                }}
                placeholder="Paste a paragraph from a cancer research paper..."
                className="min-h-40 w-full resize-none bg-transparent px-6 pb-4 pt-6 text-[15px] leading-7 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />

              <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={useExample}
                  disabled={transitioning}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use an example
                </button>

                <motion.button
                  type="submit"
                  disabled={transitioning}
                  whileHover={{
                    scale: transitioning
                      ? 1
                      : 1.025,
                  }}
                  whileTap={{
                    scale: transitioning
                      ? 1
                      : 0.97,
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_15px_40px_rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {transitioning && (
                    <motion.span
                      animate={{
                        x: [
                          "-140%",
                          "240%",
                        ],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent blur-md"
                    />
                  )}

                  <span className="relative">
                    {transitioning
                      ? "Transforming biology..."
                      : "Explore biology"}

                    {!transitioning && (
                      <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    )}
                  </span>
                </motion.button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-3 text-sm text-rose-300"
              >
                {error}
              </motion.p>
            )}

            {transitioning && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-cyan-200/70"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                </span>

                Building biological workspace
              </motion.div>
            )}
          </motion.form>

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.75,
              duration: 1,
            }}
            className="mt-8 flex max-w-[590px] flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.16em] text-slate-500 lg:-translate-x-2 xl:-translate-x-5"
          >
            <span>Cells</span>
            <span>Proteins</span>
            <span>Pathways</span>
            <span>Evidence</span>
            <span>PubMed</span>
          </motion.div>
        </div>
      </div>

      <PortalTransition
        active={transitioning}
      />
    </>
  );
}