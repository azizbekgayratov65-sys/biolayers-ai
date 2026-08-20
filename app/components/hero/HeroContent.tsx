"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BookOpenText,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import PortalTransition from "./PortalTransition";

const EXAMPLE_TEXT =
  "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and remodeling of the tumor microenvironment.";

const TRANSITION_DURATION = 3900;

export default function HeroContent() {
  const router = useRouter();

  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const [text, setText] = useState("");

  const [error, setError] = useState("");

  const [
    transitioning,
    setTransitioning,
  ] = useState(false);

  const transitionTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (
        transitionTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          transitionTimerRef.current,
        );
      }
    };
  }, []);

  const goToWorkspace =
    useCallback(() => {
      if (transitioning) {
        return;
      }

      setError("");
      setTransitioning(true);

      if (
        transitionTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          transitionTimerRef.current,
        );
      }

      transitionTimerRef.current =
        window.setTimeout(
          () => {
            router.push("/explore");
          },
          reduceMotion
            ? 150
            : TRANSITION_DURATION,
        );
    }, [
      reduceMotion,
      router,
      transitioning,
    ]);

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

  function exploreProduct() {
    const target =
      document.getElementById(
        "capabilities",
      );

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: reduceMotion
        ? "auto"
        : "smooth",
      block: "start",
    });
  }

  return (
    <>
      <motion.div
        animate={{
          scale: transitioning
            ? 0.978
            : 1,
          opacity: transitioning
            ? 0.68
            : 1,
          filter: transitioning
            ? "blur(2px)"
            : "blur(0px)",
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          relative z-20 mx-auto flex
          min-h-screen w-full
          max-w-[1560px] items-center
          px-6 pb-14 pt-32
          sm:px-10
          lg:px-16 lg:pt-28
          2xl:px-20
        "
      >
        <div
          className="
            mx-auto w-full
            max-w-[760px] text-center
          "
        >
          {/* ============================================= */}
          {/* BIOLAYERS BRAND                              */}
          {/* ============================================= */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: -12,
                    scale: 0.94,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: reduceMotion
                ? 0
                : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              mb-7 flex
              items-center justify-center gap-4
            "
          >
            {/* Logo */}

            <div
              className="
                relative flex
                h-[62px] w-[62px]
                shrink-0
                items-center
                justify-center
              "
            >
              {/* ambient glow */}

              <motion.div
                aria-hidden="true"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [
                          0.35,
                          0.7,
                          0.35,
                        ],
                        scale: [
                          0.9,
                          1.15,
                          0.9,
                        ],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  pointer-events-none
                  absolute inset-[-10px]
                  rounded-[24px]
                  bg-teal-300/[0.12]
                  blur-2xl
                "
              />

              {/* orbit */}

              <motion.div
                aria-hidden="true"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        rotate: 360,
                      }
                }
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  pointer-events-none
                  absolute inset-[-6px]
                  rounded-[21px]
                  border
                  border-teal-200/[0.09]
                "
              >
                <span
                  className="
                    absolute
                    left-1/2 top-[-2px]
                    h-[5px] w-[5px]
                    -translate-x-1/2
                    rounded-full
                    bg-teal-200
                    shadow-[0_0_12px_rgba(141,178,255,.95)]
                  "
                />
              </motion.div>

              {/* logo frame */}

              <div
                className="
                  relative flex
                  h-[62px] w-[62px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[18px]
                  border
                  border-teal-200/[0.15]
                  bg-[#06131d]/75
                  shadow-[0_12px_38px_rgba(1,8,15,.32),0_0_30px_rgba(77,141,255,.08)]
                  backdrop-blur-2xl
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute inset-x-2 top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-teal-200/30
                    to-transparent
                  "
                />

                <img
                  src="/branding/biolayers-logo.png"
                  alt="BioLayers AI"
                  draggable={false}
                  className="
                    relative z-10
                    h-[48px] w-[48px]
                    select-none
                    object-contain
                    brightness-125
                    contrast-125
                    drop-shadow-[0_0_10px_rgba(141,178,255,.25)]
                  "
                />

                {/* scan */}

                {!reduceMotion && (
                  <motion.div
                    aria-hidden="true"
                    initial={{
                      y: -35,
                      opacity: 0,
                    }}
                    animate={{
                      y: [
                        -35,
                        35,
                        35,
                      ],
                      opacity: [
                        0,
                        0.8,
                        0,
                      ],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      repeatDelay: 2.8,
                      ease: "easeInOut",
                    }}
                    className="
                      pointer-events-none
                      absolute
                      left-2 right-2 top-1/2
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-teal-100
                      to-transparent
                      shadow-[0_0_9px_rgba(141,178,255,.9)]
                    "
                  />
                )}
              </div>
            </div>

            {/* brand text */}

            <div className="min-w-0">
              <div
                className="
                  flex items-center
                  gap-2.5
                "
              >
                <span
                  className="
                    text-[17px]
                    font-semibold
                    tracking-[-0.025em]
                    text-[#e8edf2]
                  "
                >
                  BioLayers
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-teal-200/[0.13]
                    bg-teal-200/[0.055]
                    px-2 py-0.5
                    text-[7px]
                    font-extrabold
                    uppercase
                    tracking-[0.19em]
                    text-teal-200
                  "
                >
                  AI
                </span>
              </div>

              <p
                className="
                  mt-1
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-500
                  sm:text-[9px]
                "
              >
                Computational Oncology
                Intelligence
              </p>
            </div>
          </motion.div>

          {/* ============================================= */}
          {/* CATEGORY BADGE                               */}
          {/* ============================================= */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 14,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reduceMotion
                ? 0
                : 0.72,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              mb-7 inline-flex
              items-center gap-3
              rounded-full
              border
              border-teal-200/[0.14]
              bg-[#0a0f14]/55
              px-4 py-2
              shadow-[0_10px_34px_rgba(1,8,15,.18)]
              backdrop-blur-2xl
            "
          >
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute inline-flex
                  h-full w-full
                  animate-ping
                  rounded-full
                  bg-teal-300
                  opacity-45
                "
              />

              <span
                className="
                  relative inline-flex
                  h-2 w-2
                  rounded-full
                  bg-teal-300
                  shadow-[0_0_12px_rgba(77,141,255,.8)]
                "
              />
            </span>

            <span
              className="
                text-[10px]
                font-bold uppercase
                tracking-[0.22em]
                text-teal-100/85
                sm:text-[11px]
              "
            >
              AI-driven Computational
              Oncology Research
            </span>
          </motion.div>

          {/* ============================================= */}
          {/* HEADLINE                                     */}
          {/* ============================================= */}

          <motion.h1
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 24,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion
                ? 0
                : 0.06,
              duration: reduceMotion
                ? 0
                : 0.86,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              max-w-[760px]
              text-[54px]
              font-semibold
              leading-[0.93]
              tracking-[-0.062em]
              text-[#e8edf2]
              sm:text-[66px]
              lg:text-[78px]
              xl:text-[88px]
            "
          >
            Map cancer

            <span
              className="
                block
                bg-gradient-to-r
                from-[#2bff88]
                via-[#8db2ff]
                to-[#c095fd]
                bg-clip-text
                text-transparent
              "
            >
              mechanisms.
            </span>

            <span
              className="
                mt-3 block
                max-w-[680px]
                text-[0.56em]
                font-medium
                leading-[1.02]
                tracking-[-0.042em]
                text-slate-300
              "
            >
              Trace every claim.
            </span>
          </motion.h1>

          {/* ============================================= */}
          {/* DESCRIPTION                                  */}
          {/* ============================================= */}

          <motion.p
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
              delay: reduceMotion
                ? 0
                : 0.18,
              duration: reduceMotion
                ? 0
                : 0.76,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              mt-7 mx-auto max-w-[680px]
              text-[16px]
              leading-8
              text-slate-300/90
              sm:text-[18px]
            "
          >
            Upload a research paper and
            BioLayers compresses it into a
            compact, interactive mind map —
            every idea preserved, every node
            linked back to the exact source
            text it came from.
          </motion.p>

          {/* ============================================= */}
          {/* SIGNALS                                      */}
          {/* ============================================= */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 12,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion
                ? 0
                : 0.26,
              duration: reduceMotion
                ? 0
                : 0.7,
            }}
            className="
              mt-6 flex flex-wrap
              justify-center gap-2
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

          {/* ============================================= */}
          {/* INPUT                                        */}
          {/* ============================================= */}

          <motion.form
            onSubmit={openWorkspace}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 24,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduceMotion
                ? 0
                : 0.34,
              duration: reduceMotion
                ? 0
                : 0.84,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              mx-auto mt-8 w-full
              max-w-[650px]
            "
          >
            <div
              className="
                mb-3 flex
                items-center
                justify-between
                gap-4 px-1
              "
            >
              <div
                className="
                  flex items-center
                  gap-2 text-[10px]
                  font-bold uppercase
                  tracking-[0.17em]
                  text-slate-400
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />

                Try BioLayers
              </div>

              <div
                className="
                  hidden text-[9px]
                  font-semibold uppercase
                  tracking-[0.15em]
                  text-slate-600
                  sm:block
                "
              >
                Research text → evidence-linked
                mechanism
              </div>
            </div>

            <div
              className={`
                relative overflow-hidden
                rounded-[24px]
                border
                bg-[#070b10]/82
                shadow-[0_28px_90px_rgba(1,8,15,.34)]
                backdrop-blur-3xl
                transition-all duration-300

                ${
                  transitioning
                    ? "border-teal-200/[0.24] shadow-[0_0_70px_rgba(77,141,255,.12)]"
                    : "border-teal-100/[0.08] hover:border-teal-200/[0.14]"
                }
              `}
            >
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/[0.18] to-transparent" />

              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-teal-300/[0.035] blur-3xl" />

              <textarea
                value={text}
                disabled={transitioning}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
                placeholder="Paste a paragraph from a cancer research paper..."
                className="
                  relative min-h-36
                  w-full resize-none
                  bg-transparent
                  px-6 pb-4 pt-6
                  text-[15px]
                  leading-7
                  text-[#eef4ff]
                  outline-none
                  placeholder:text-slate-500
                  disabled:cursor-not-allowed
                "
              />

              <div
                className="
                  relative flex
                  flex-col gap-3
                  border-t
                  border-teal-100/[0.06]
                  bg-black/[0.08]
                  p-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <button
                  type="button"
                  onClick={useExample}
                  disabled={transitioning}
                  className="
                    rounded-[11px]
                    px-3 py-2
                    text-left
                    text-[12px]
                    font-semibold
                    text-slate-400
                    transition
                    hover:bg-white/[0.035]
                    hover:text-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Use an example
                </button>

                <motion.button
                  type="submit"
                  disabled={transitioning}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale:
                            transitioning
                              ? 1
                              : 1.015,
                        }
                  }
                  whileTap={
                    reduceMotion
                      ? undefined
                      : {
                          scale:
                            transitioning
                              ? 1
                              : 0.98,
                        }
                  }
                  animate={{
                    boxShadow:
                      transitioning
                        ? [
                            "0 12px 34px rgba(77,141,255,.10)",
                            "0 0 48px rgba(161,92,255,.25)",
                            "0 12px 34px rgba(77,141,255,.10)",
                          ]
                        : "0 12px 34px rgba(77,141,255,.10)",
                  }}
                  transition={{
                    duration:
                      transitioning
                        ? 0.9
                        : 0.25,
                    repeat:
                      transitioning
                        ? Infinity
                        : 0,
                  }}
                  className="
                    group relative
                    overflow-hidden
                    rounded-[13px]
                    border
                    border-teal-100/[0.16]
                    bg-[linear-gradient(135deg,#8db2ff_0%,#a15cff_56%,#8db2ff_100%)]
                    px-6 py-3
                    text-[12px]
                    font-extrabold
                    text-[#04070a]
                    shadow-[0_12px_30px_rgba(77,141,255,.14)]
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
                        absolute inset-y-0
                        w-20
                        bg-gradient-to-r
                        from-transparent
                        via-white/55
                        to-transparent
                        blur-md
                      "
                    />
                  )}

                  <span className="relative flex items-center gap-2">
                    {transitioning
                      ? "Opening workspace..."
                      : "Build mechanism"}

                    {!transitioning && (
                      <ArrowRight
                        className="
                          h-4 w-4
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

            {error && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-3 rounded-[11px]
                  border border-rose-200/[0.09]
                  bg-rose-200/[0.025]
                  px-3 py-2
                  text-[11px]
                  text-rose-200
                "
              >
                {error}
              </motion.p>
            )}

            {transitioning && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-4 flex
                  items-center gap-3
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.17em]
                  text-teal-200/75
                "
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-55" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
                </span>

                Building biological workspace
              </motion.div>
            )}
          </motion.form>

          {/* ============================================= */}
          {/* PRODUCT LINK                                 */}
          {/* ============================================= */}

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
              delay: reduceMotion
                ? 0
                : 0.62,
              duration: reduceMotion
                ? 0
                : 0.75,
            }}
            className="
              group mt-6
              flex items-center
              gap-2
              text-[11px]
              font-semibold
              text-slate-500
              transition-colors
              hover:text-teal-100
            "
          >
            See how BioLayers works

            <ArrowRight
              className="
                h-3.5 w-3.5
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </motion.button>

          {/* ============================================= */}
          {/* ENTITY TYPES                                 */}
          {/* ============================================= */}

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
              delay: reduceMotion
                ? 0
                : 0.72,
              duration: reduceMotion
                ? 0
                : 0.9,
            }}
            className="
              mt-7 flex
              max-w-[650px]
              flex-wrap gap-x-6
              gap-y-2
              text-[9px]
              font-bold uppercase
              tracking-[0.15em]
              text-slate-600
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

      <PortalTransition
        active={transitioning}
      />
    </>
  );
}

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
        inline-flex items-center
        gap-2 rounded-full
        border
        border-teal-100/[0.065]
        bg-[#0a0f14]/42
        px-3 py-1.5
        text-[10px]
        font-semibold
        text-slate-400
        shadow-[0_8px_24px_rgba(1,8,15,.10)]
        backdrop-blur-xl
      "
    >
      <Icon className="h-3 w-3 text-teal-300/70" />

      {text}
    </div>
  );
}