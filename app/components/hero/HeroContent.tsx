"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import PortalTransition from "./PortalTransition";

/* =========================================================
   CONFIG
   ========================================================= */

const EXAMPLE_TEXT =
  "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and remodeling of the tumor microenvironment.";

const TRANSITION_DURATION = 3900;

/* =========================================================
   HERO CONTENT
   ========================================================= */

export default function HeroContent() {
  const router = useRouter();
  const reduceMotion = Boolean(useReducedMotion());

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const transitionTimerRef = useRef<number | null>(null);

  /* =======================================================
     CLEANUP
     ======================================================= */

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  /* =======================================================
     WORKSPACE TRANSITION
     ======================================================= */

  const goToWorkspace = useCallback(() => {
    if (transitioning) {
      return;
    }

    setError("");
    setTransitioning(true);

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(
      () => {
        router.push("/explore");
      },
      reduceMotion ? 150 : TRANSITION_DURATION,
    );
  }, [reduceMotion, router, transitioning]);

  /* =======================================================
     SUBMIT
     ======================================================= */

  function openWorkspace(event: FormEvent<HTMLFormElement>) {
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

  /* =======================================================
     EXAMPLE
     ======================================================= */

  function useExample() {
    if (transitioning) {
      return;
    }

    setText(EXAMPLE_TEXT);
    setError("");
  }

  /* =======================================================
     SCROLL TO PRODUCT
     ======================================================= */

  function exploreProduct() {
    const target =
      document.getElementById("capabilities");

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <motion.div
        animate={{
          scale: transitioning ? 0.975 : 1,
          opacity: transitioning ? 0.72 : 1,
          filter: transitioning
            ? "blur(1.5px)"
            : "blur(0px)",
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          relative
          z-20
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1500px]
          items-center
          px-6
          pb-12
          pt-32
          sm:px-10
          lg:px-16
          lg:pt-28
        "
      >
        <div
          className="
            w-full
            max-w-[720px]
            lg:-translate-x-6
            xl:-translate-x-12
          "
        >
          {/* ================================================= */}
          {/* POSITIONING BADGE                                 */}
          {/* ================================================= */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              mb-7
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/[0.055]
              px-4
              py-2
              backdrop-blur-xl
            "
          >
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-cyan-300
                  opacity-50
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2
                  w-2
                  rounded-full
                  bg-cyan-300
                "
              />
            </span>

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-cyan-100/80
                sm:text-[11px]
              "
            >
              AI × Computational Oncology
            </span>
          </motion.div>

          {/* ================================================= */}
          {/* HEADLINE                                         */}
          {/* ================================================= */}

          <motion.h1
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 28,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.08,
              duration: reduceMotion ? 0 : 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              max-w-[700px]
              text-5xl
              font-semibold
              leading-[0.94]
              tracking-[-0.06em]
              text-white
              sm:text-6xl
              lg:text-[76px]
              xl:text-[82px]
            "
          >
            Map cancer

            <span
              className="
                block
                bg-gradient-to-r
                from-cyan-300
                via-blue-400
                to-violet-400
                bg-clip-text
                text-transparent
              "
            >
              mechanisms.
            </span>

            <span
              className="
                mt-2
                block
                text-[0.63em]
                leading-[1]
                tracking-[-0.045em]
                text-white/72
              "
            >
              Trace every claim.
            </span>
          </motion.h1>

          {/* ================================================= */}
          {/* DESCRIPTION                                      */}
          {/* ================================================= */}

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 22,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.2,
              duration: reduceMotion ? 0 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              mt-7
              max-w-[620px]
              text-base
              leading-8
              text-slate-300/80
              sm:text-lg
            "
          >
            BioLayers transforms fragmented oncology literature
            into evidence-linked maps of cells, genes, proteins,
            pathways, biological processes, and disease mechanisms.
          </motion.p>

          {/* ================================================= */}
          {/* VALUE SIGNALS                                    */}
          {/* ================================================= */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 16,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.28,
              duration: reduceMotion ? 0 : 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              mt-6
              flex
              flex-wrap
              gap-2
            "
          >
            <Signal
              icon={Network}
              text="Mechanism mapping"
            />

            <Signal
              icon={BookOpenText}
              text="Evidence linked"
            />

            <Signal
              icon={ShieldCheck}
              text="Source traceable"
            />
          </motion.div>

          {/* ================================================= */}
          {/* INPUT WORKSPACE                                  */}
          {/* ================================================= */}

          <motion.form
            onSubmit={openWorkspace}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 28,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.36,
              duration: reduceMotion ? 0 : 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              mt-8
              w-full
              max-w-[620px]
              lg:-translate-x-2
              xl:-translate-x-5
            "
          >
            {/* INPUT LABEL */}

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-4
                px-1
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white/30
                "
              >
                <Sparkles className="h-3.5 w-3.5" />

                Try BioLayers
              </div>

              <div
                className="
                  hidden
                  text-[9px]
                  uppercase
                  tracking-[0.16em]
                  text-white/18
                  sm:block
                "
              >
                Research text → mechanism
              </div>
            </div>

            <div
              className={`
                overflow-hidden
                rounded-[26px]
                border
                bg-slate-950/55
                shadow-[0_30px_100px_rgba(3,105,161,0.16)]
                backdrop-blur-2xl
                transition-all
                duration-300

                ${
                  transitioning
                    ? "border-cyan-300/30 shadow-[0_0_70px_rgba(34,211,238,.18)]"
                    : "border-white/10 hover:border-white/[0.16]"
                }
              `}
            >
              <textarea
                value={text}
                disabled={transitioning}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
                placeholder="Paste a paragraph from a cancer research paper..."
                className="
                  min-h-36
                  w-full
                  resize-none
                  bg-transparent
                  px-6
                  pb-4
                  pt-6
                  text-[15px]
                  leading-7
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  disabled:cursor-not-allowed
                "
              />

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-white/10
                  bg-white/[0.025]
                  p-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                {/* EXAMPLE */}

                <button
                  type="button"
                  onClick={useExample}
                  disabled={transitioning}
                  className="
                    rounded-xl
                    px-3
                    py-2
                    text-left
                    text-sm
                    font-medium
                    text-slate-400
                    transition
                    hover:bg-white/5
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Use an example
                </button>

                {/* SUBMIT */}

                <motion.button
                  type="submit"
                  disabled={transitioning}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale: transitioning
                            ? 1
                            : 1.02,
                        }
                  }
                  whileTap={
                    reduceMotion
                      ? undefined
                      : {
                          scale: transitioning
                            ? 1
                            : 0.97,
                        }
                  }
                  animate={{
                    boxShadow: transitioning
                      ? [
                          "0 15px 40px rgba(255,255,255,.12)",
                          "0 0 54px rgba(103,232,249,.34)",
                          "0 15px 40px rgba(255,255,255,.12)",
                        ]
                      : "0 15px 40px rgba(255,255,255,.12)",
                  }}
                  transition={{
                    duration: transitioning
                      ? 0.9
                      : 0.25,
                    repeat: transitioning
                      ? Infinity
                      : 0,
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-slate-950
                    disabled:cursor-not-allowed
                    disabled:opacity-80
                  "
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
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        w-20
                        bg-gradient-to-r
                        from-transparent
                        via-cyan-200/65
                        to-transparent
                        blur-md
                      "
                    />
                  )}

                  <span
                    className="
                      relative
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {transitioning
                      ? "Opening workspace..."
                      : "Build mechanism"}

                    {!transitioning && (
                      <ArrowRight
                        className="
                          h-4
                          w-4
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    )}
                  </span>
                </motion.button>
              </div>
            </div>

            {/* ERROR */}

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
                className="
                  mt-3
                  text-sm
                  text-rose-300
                "
              >
                {error}
              </motion.p>
            )}

            {/* TRANSITION STATUS */}

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
                className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  text-xs
                  uppercase
                  tracking-[0.18em]
                  text-cyan-200/70
                "
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="
                      absolute
                      inline-flex
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-cyan-300
                      opacity-60
                    "
                  />

                  <span
                    className="
                      relative
                      inline-flex
                      h-2
                      w-2
                      rounded-full
                      bg-cyan-300
                    "
                  />
                </span>

                Building biological workspace
              </motion.div>
            )}
          </motion.form>

          {/* ================================================= */}
          {/* SECONDARY CTA                                    */}
          {/* ================================================= */}

          <motion.button
            type="button"
            onClick={exploreProduct}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.65,
              duration: reduceMotion ? 0 : 0.8,
            }}
            className="
              group
              mt-6
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-white/35
              transition-colors
              hover:text-white/65
              lg:-translate-x-2
              xl:-translate-x-5
            "
          >
            See how BioLayers works

            <ArrowRight
              className="
                h-3.5
                w-3.5
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </motion.button>

          {/* ================================================= */}
          {/* BIOLOGICAL LAYERS                                */}
          {/* ================================================= */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.75,
              duration: reduceMotion ? 0 : 1,
            }}
            className="
              mt-7
              flex
              max-w-[620px]
              flex-wrap
              gap-x-7
              gap-y-3
              text-[10px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-slate-500
              lg:-translate-x-2
              xl:-translate-x-5
            "
          >
            <span>Cells</span>
            <span>Genes</span>
            <span>Proteins</span>
            <span>Pathways</span>
            <span>Processes</span>
            <span>Evidence</span>
          </motion.div>
        </div>
      </motion.div>

      {/* =================================================== */}
      {/* PORTAL TRANSITION                                  */}
      {/* =================================================== */}

      <PortalTransition active={transitioning} />
    </>
  );
}

/* =========================================================
   VALUE SIGNAL
   ========================================================= */

function Signal({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  text: string;
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-3
        py-1.5
        text-[10px]
        font-medium
        text-white/40
        backdrop-blur-xl
      "
    >
      <Icon className="h-3 w-3 text-cyan-300/45" />

      {text}
    </div>
  );
}