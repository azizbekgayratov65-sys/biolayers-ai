"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useEffect,
  useState,
} from "react";

export default function BrandIntro() {
  const reduced =
    Boolean(useReducedMotion());

  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setVisible(false);
        },
        reduced ? 500 : 1750,
      );

    return () =>
      window.clearTimeout(timer);
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="brand-intro"
          initial={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.035,
          }}
          transition={{
            duration:
              reduced
                ? 0.15
                : 0.38,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="
            fixed
            inset-0
            z-[99999]

            flex
            items-center
            justify-center

            overflow-hidden

            bg-[#02080d]
          "
        >
          {/* background */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0

              bg-[radial-gradient(circle_at_50%_48%,rgba(77,141,255,.12),transparent_26%),radial-gradient(circle_at_50%_52%,rgba(141,178,255,.06),transparent_42%)]
            "
          />

          {/* simple static grid */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0

              opacity-[0.14]

              [background-image:linear-gradient(rgba(141,178,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,.035)_1px,transparent_1px)]

              [background-size:72px_72px]

              [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]
            "
          />

          {/* one expanding ring only */}

          {!reduced && (
            <motion.div
              aria-hidden="true"
              initial={{
                scale: 0.45,
                opacity: 0,
              }}
              animate={{
                scale: 1.45,
                opacity: [
                  0,
                  0.24,
                  0,
                ],
              }}
              transition={{
                duration: 1.45,
                ease: "easeOut",
              }}
              className="
                pointer-events-none
                absolute

                h-[320px]
                w-[320px]

                rounded-full

                border
                border-teal-100/10
              "
            />
          )}

          {/* logo */}

          <motion.div
            initial={
              reduced
                ? false
                : {
                    opacity: 0,
                    scale: 0.78,
                    filter:
                      "blur(10px)",
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
              filter:
                "blur(0px)",
            }}
            transition={{
              duration:
                reduced
                  ? 0
                  : 0.65,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              relative
              z-10

              flex
              flex-col
              items-center

              text-center
            "
          >
            <div
              className="
                relative

                h-[150px]
                w-[150px]

                sm:h-[190px]
                sm:w-[190px]
              "
            >
              {/* glow */}

              <motion.div
                aria-hidden="true"
                animate={
                  reduced
                    ? undefined
                    : {
                        opacity: [
                          0.15,
                          0.42,
                          0.15,
                        ],
                        scale: [
                          0.8,
                          1.15,
                          0.9,
                        ],
                      }
                }
                transition={{
                  duration: 1.5,
                  repeat:
                    reduced
                      ? 0
                      : Infinity,
                  ease:
                    "easeInOut",
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-[20%]

                  rounded-full

                  bg-teal-300/[0.14]

                  blur-3xl
                "
              />

              <Image
                src="/branding/biolayers-logo.png"
                alt="BioLayers AI"
                fill
                priority
                sizes="190px"
                className="
                  object-contain

                  drop-shadow-[0_0_22px_rgba(141,178,255,.28)]
                "
              />

              {/* scanner */}

              {!reduced && (
                <motion.div
                  aria-hidden="true"
                  initial={{
                    top: "18%",
                    opacity: 0,
                  }}
                  animate={{
                    top: [
                      "18%",
                      "82%",
                    ],
                    opacity: [
                      0,
                      1,
                      0,
                    ],
                  }}
                  transition={{
                    delay: 0.3,
                    duration: 0.85,
                    ease:
                      "easeInOut",
                  }}
                  className="
                    pointer-events-none
                    absolute

                    left-[18%]
                    right-[18%]

                    h-px

                    bg-gradient-to-r
                    from-transparent
                    via-white
                    to-transparent

                    shadow-[0_0_14px_rgba(141,178,255,.9)]
                  "
                />
              )}
            </div>

            <motion.p
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  reduced
                    ? 0
                    : 0.35,
                duration: 0.35,
              }}
              className="
                mt-4

                font-mono
                text-[7px]
                font-semibold

                uppercase

                tracking-[0.3em]

                text-teal-200/55
              "
            >
              AI-driven Computational Oncology
            </motion.p>

            <motion.h1
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  reduced
                    ? 0
                    : 0.43,
                duration: 0.38,
              }}
              className="
                mt-2

                text-[32px]
                font-semibold

                tracking-[-0.055em]

                text-white

                sm:text-[40px]
              "
            >
              BioLayers AI
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay:
                  reduced
                    ? 0
                    : 0.55,
              }}
              className="
                mt-2

                text-[9px]

                tracking-[0.06em]

                text-slate-500
              "
            >
              Evidence → Mechanism → Hypothesis
            </motion.p>
          </motion.div>

          {/* final flash */}

          {!reduced && (
            <motion.div
              aria-hidden="true"
              initial={{
                opacity: 0,
                scale: 0.3,
              }}
              animate={{
                opacity: [
                  0,
                  0,
                  0.7,
                  0,
                ],
                scale: [
                  0.3,
                  0.3,
                  3,
                  6,
                ],
              }}
              transition={{
                duration: 0.55,
                delay: 1.15,
                times: [
                  0,
                  0.2,
                  0.65,
                  1,
                ],
              }}
              className="
                pointer-events-none
                absolute
                inset-0

                bg-[radial-gradient(circle_at_center,rgba(141,178,255,.12),transparent_15%)]
              "
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}