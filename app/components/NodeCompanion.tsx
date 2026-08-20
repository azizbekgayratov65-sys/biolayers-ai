"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type NodeMode =
  | "idle"
  | "route"
  | "connect"
  | "evidence"
  | "hypothesis"
  | "research"
  | "success"
  | "warning";

type NodeCommandDetail = {
  mode?: NodeMode;
  message?: string;
  duration?: number;
};

declare global {
  interface WindowEventMap {
    "biolayers:node": CustomEvent<NodeCommandDetail>;
  }
}

type NodeCompanionProps = {
  className?: string;
};

const palettes: Record<
  NodeMode,
  {
    core: string;
    core2: string;
    signal: string;
    accent: string;
  }
> = {
  idle: {
    core: "#4d8dff",
    core2: "#a15cff",
    signal: "#a15cff",
    accent: "#c095fd",
  },
  route: {
    core: "#e8edf2",
    core2: "#a15cff",
    signal: "#c095fd",
    accent: "#c095fd",
  },
  connect: {
    core: "#57ffa0",
    core2: "#a15cff",
    signal: "#57ffa0",
    accent: "#a15cff",
  },
  evidence: {
    core: "#ffc53d",
    core2: "#ff3b5c",
    signal: "#ffc53d",
    accent: "#ff3b5c",
  },
  hypothesis: {
    core: "#ffd64a",
    core2: "#a15cff",
    signal: "#ffc53d",
    accent: "#c095fd",
  },
  research: {
    core: "#90ffc0",
    core2: "#4d8dff",
    signal: "#2bff88",
    accent: "#8db2ff",
  },
  success: {
    core: "#57ffa0",
    core2: "#2bff88",
    signal: "#90ffc0",
    accent: "#a15cff",
  },
  warning: {
    core: "#ff93aa",
    core2: "#ff3b5c",
    signal: "#ff3b5c",
    accent: "#ffc53d",
  },
};

function restingMode(pathname: string): NodeMode {
  if (
    pathname.includes("/lab") ||
    pathname.includes("/research") ||
    pathname.includes("/metastasis") ||
    pathname.includes("/microenvironment") ||
    pathname.includes("/molecular") ||
    pathname.includes("/evolution") ||
    pathname.includes("/digital-twin")
  ) {
    return "research";
  }

  return "idle";
}

function routeMessage(pathname: string) {
  if (pathname === "/") {
    return "I live between the layers.";
  }

  if (pathname.includes("/explore")) {
    return "Point me at a mechanism.";
  }

  if (pathname.includes("/lab")) {
    return "Research systems online.";
  }

  if (pathname.includes("/evolution")) {
    return "Following clonal change.";
  }

  if (pathname.includes("/molecular-dive")) {
    return "Crossing the molecular scale.";
  }

  if (pathname.includes("/digital-twin")) {
    return "Constructing a living model.";
  }

  if (pathname.includes("/metastasis")) {
    return "Tracing metastatic escape.";
  }

  if (pathname.includes("/microenvironment")) {
    return "Reading the tumor ecosystem.";
  }

  if (pathname.includes("/research-copilot")) {
    return "Research context connected.";
  }

  return "Another biological layer is opening.";
}

const portalParticles = Array.from(
  { length: 38 },
  (_, index) => {
    const angle =
      (index / 38) *
      Math.PI *
      2;

    const distance =
      150 +
      (index % 7) * 28;

    return {
      id: index,
      x:
        Math.cos(angle) *
        distance,
      y:
        Math.sin(angle) *
        distance *
        0.58,
      size:
        2 + (index % 5),
      delay:
        (index % 10) * 0.018,
    };
  },
);

export default function NodeCompanion({
  className = "",
}: NodeCompanionProps) {
  const pathname = usePathname();
  const reduceMotion =
    Boolean(useReducedMotion());

  const [mode, setMode] =
    useState<NodeMode>("route");

  const [message, setMessage] =
    useState(
      routeMessage(pathname),
    );

  const [expanded, setExpanded] =
    useState(pathname === "/");

  const [transitionId, setTransitionId] =
    useState(0);

  const temporaryTimerRef =
    useRef<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(
    mouseX,
    {
      stiffness: 70,
      damping: 20,
      mass: 0.65,
    },
  );

  const springY = useSpring(
    mouseY,
    {
      stiffness: 70,
      damping: 20,
      mass: 0.65,
    },
  );

  const rotateY = useTransform(
    springX,
    [-1, 1],
    [-9, 9],
  );

  const rotateX = useTransform(
    springY,
    [-1, 1],
    [8, -8],
  );

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    function onPointerMove(
      event: PointerEvent,
    ) {
      mouseX.set(
        (event.clientX /
          window.innerWidth) *
          2 -
          1,
      );

      mouseY.set(
        (event.clientY /
          window.innerHeight) *
          2 -
          1,
      );
    }

    window.addEventListener(
      "pointermove",
      onPointerMove,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        onPointerMove,
      );
    };
  }, [
    mouseX,
    mouseY,
    reduceMotion,
  ]);

  useEffect(() => {
    setMode("route");
    setExpanded(false);
    setMessage(
      routeMessage(pathname),
    );
    setTransitionId(
      (current) => current + 1,
    );

    const finishTransition =
      window.setTimeout(() => {
        setMode(
          restingMode(pathname),
        );
      }, reduceMotion ? 0 : 2480);

    const showMessage =
      window.setTimeout(() => {
        setExpanded(true);
      }, reduceMotion ? 0 : 2580);

    const hideMessage =
      window.setTimeout(() => {
        if (pathname !== "/") {
          setExpanded(false);
        }
      }, 5600);

    return () => {
      window.clearTimeout(
        finishTransition,
      );
      window.clearTimeout(
        showMessage,
      );
      window.clearTimeout(
        hideMessage,
      );
    };
  }, [
    pathname,
    reduceMotion,
  ]);

  useEffect(() => {
    function onNodeCommand(
      event:
        WindowEventMap["biolayers:node"],
    ) {
      if (
        temporaryTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          temporaryTimerRef.current,
        );
      }

      const {
        mode:
          requestedMode,
        message:
          requestedMessage,
        duration = 2400,
      } = event.detail ?? {};

      if (requestedMode) {
        setMode(
          requestedMode,
        );
      }

      if (requestedMessage) {
        setMessage(
          requestedMessage,
        );
        setExpanded(true);
      }

      temporaryTimerRef.current =
        window.setTimeout(() => {
          setMode(
            restingMode(pathname),
          );

          temporaryTimerRef.current =
            null;
        }, duration);
    }

    window.addEventListener(
      "biolayers:node",
      onNodeCommand,
    );

    return () => {
      window.removeEventListener(
        "biolayers:node",
        onNodeCommand,
      );

      if (
        temporaryTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          temporaryTimerRef.current,
        );
      }
    };
  }, [pathname]);

  const isHome =
    pathname === "/";

  return (
    <>
      <AnimatePresence>
        {mode === "route" &&
          !reduceMotion && (
            <PortalTransition
              key={`portal-${transitionId}`}
            />
          )}
      </AnimatePresence>

      <div
        data-node-companion="true"
        className={`pointer-events-none fixed z-[210] ${
          isHome
            ? "bottom-8 right-8"
            : "bottom-5 right-5"
        } ${className}`}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformPerspective:
              700,
          }}
          initial={false}
          animate={{
            opacity:
              mode === "route"
                ? 0
                : 1,
            scale:
              mode === "route"
                ? 0.2
                : isHome
                  ? 1.18
                  : 1,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.42,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="relative"
        >
          <AnimatePresence>
            {expanded &&
              mode !== "route" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 18,
                    scale: 0.96,
                    filter:
                      "blur(8px)",
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter:
                      "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    x: 12,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.34,
                  }}
                  className="pointer-events-auto absolute bottom-[18px] right-[112px] w-[250px] overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#050b12]/94 p-4 shadow-[0_25px_90px_rgba(0,0,0,.55)] backdrop-blur-3xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            palettes[
                              mode
                            ]
                              .signal,
                          boxShadow: `0 0 10px ${
                            palettes[
                              mode
                            ]
                              .signal
                          }`,
                        }}
                      />

                      <p className="font-mono text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
                        NODE / Living interface
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(
                          false,
                        )
                      }
                      className="text-xs text-slate-600 transition hover:text-white"
                    >
                      ×
                    </button>
                  </div>

                  <p className="mt-3 text-[15px] font-semibold leading-6 text-white">
                    {message}
                  </p>

                  <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    {mode} · BioLayers AI
                  </p>
                </motion.div>
              )}
          </AnimatePresence>

          <button
            type="button"
            aria-label="Open NODE"
            onClick={() =>
              setExpanded(
                (current) =>
                  !current,
              )
            }
            className="pointer-events-auto relative block h-[106px] w-[106px] outline-none"
          >
            <LivingNode
              mode={mode}
              reduceMotion={
                reduceMotion
              }
            />
          </button>
        </motion.div>
      </div>
    </>
  );
}

function PortalTransition() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="pointer-events-none fixed inset-0 z-[205] overflow-hidden bg-[#030507]/15"
    >
      {/* 1. NODE launches from the resting corner */}
      <motion.div
        initial={{
          left:
            "calc(100% - 72px)",
          top:
            "calc(100% - 72px)",
          x: "-50%",
          y: "-50%",
          opacity: 0,
          scale: 0.18,
          rotate: 0,
        }}
        animate={{
          left: [
            "calc(100% - 72px)",
            "76%",
            "54%",
            "50%",
            "50%",
          ],
          top: [
            "calc(100% - 72px)",
            "72%",
            "54%",
            "50%",
            "50%",
          ],
          opacity: [
            0,
            1,
            1,
            1,
            1,
          ],
          scale: [
            0.18,
            0.8,
            1.6,
            2.7,
            4.8,
          ],
          rotate: [
            0,
            -10,
            16,
            0,
            24,
          ],
        }}
        transition={{
          duration: 1.05,
          times: [
            0,
            0.28,
            0.52,
            0.76,
            1,
          ],
          ease: [
            0.22,
            0.8,
            0.22,
            1,
          ],
        }}
        className="absolute h-[112px] w-[112px]"
      >
        <NodeFlightTail />

        <LivingNode
          mode="route"
          reduceMotion={false}
        />
      </motion.div>

      {/* 2. Portal opens from NODE itself */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.08,
          rotate: -24,
        }}
        animate={{
          opacity: [
            0,
            0,
            0.88,
            1,
            1,
            0.95,
            0,
          ],
          scale: [
            0.08,
            0.08,
            0.35,
            1,
            2.4,
            5.2,
            7.5,
          ],
          rotate: [
            -24,
            -24,
            0,
            80,
            160,
            250,
            320,
          ],
        }}
        transition={{
          duration: 2.15,
          times: [
            0,
            0.38,
            0.48,
            0.60,
            0.74,
            0.90,
            1,
          ],
          ease: [
            0.2,
            0.7,
            0.2,
            1,
          ],
        }}
        className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(77,141,255,.95) 28deg, rgba(161,92,255,.88) 72deg, rgba(255,59,92,.72) 118deg, transparent 160deg, rgba(77,141,255,.7) 210deg, transparent 250deg, rgba(161,92,255,.82) 300deg, transparent 360deg)",
          filter:
            "blur(1px)",
          boxShadow:
            "0 0 55px rgba(77,141,255,.3), 0 0 120px rgba(161,92,255,.24)",
          maskImage:
            "radial-gradient(circle, transparent 47%, black 51%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 47%, black 51%)",
        }}
      />

      {/* 3. Dimensional iris fills the whole screen */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.05,
        }}
        animate={{
          opacity: [
            0,
            0,
            0.12,
            0.62,
            0.94,
            0.15,
            0,
          ],
          scale: [
            0.05,
            0.05,
            0.3,
            1,
            2.8,
            5,
            6.5,
          ],
        }}
        transition={{
          duration: 2.25,
          times: [
            0,
            0.42,
            0.52,
            0.65,
            0.78,
            0.93,
            1,
          ],
          ease: [
            0.22,
            0.8,
            0.22,
            1,
          ],
        }}
        className="absolute left-1/2 top-1/2 h-[55vmax] w-[55vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,237,242,.92) 0%, rgba(161,92,255,.58) 8%, rgba(161,92,255,.32) 18%, rgba(255,59,92,.12) 30%, rgba(2,6,23,.94) 48%, rgba(1,3,10,1) 68%, rgba(1,3,10,0) 82%)",
          filter:
            "blur(12px)",
        }}
      />

      {/* 4. Genome strands race toward the portal */}
      {[0, 1, 2, 3, 4, 5].map(
        (index) => {
          const angle =
            index * 30;

          return (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                scaleX: 0.05,
              }}
              animate={{
                opacity: [
                  0,
                  0.7,
                  0.25,
                  0,
                ],
                scaleX: [
                  0.05,
                  1.1,
                  1.8,
                  0.3,
                ],
              }}
              transition={{
                duration: 1.25,
                delay:
                  0.68 +
                  index * 0.035,
                times: [
                  0,
                  0.38,
                  0.74,
                  1,
                ],
              }}
              className="absolute left-1/2 top-1/2 h-px w-[58vw] origin-left"
              style={{
                transform: `rotate(${angle}deg)`,
                background:
                  index % 2 ===
                  0
                    ? "linear-gradient(90deg, rgba(77,141,255,.88), rgba(77,141,255,.04), transparent)"
                    : "linear-gradient(90deg, rgba(161,92,255,.8), rgba(255,59,92,.04), transparent)",
                boxShadow:
                  "0 0 12px rgba(77,141,255,.22)",
              }}
            />
          );
        },
      )}

      {/* 5. Particles explode, then collapse into the portal */}
      {portalParticles.map(
        (
          particle,
          index,
        ) => (
          <motion.span
            key={
              particle.id
            }
            initial={{
              left: "50%",
              top: "50%",
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: [
                0,
                particle.x,
                particle.x *
                  0.55,
                0,
              ],
              y: [
                0,
                particle.y,
                particle.y *
                  0.55,
                0,
              ],
              opacity: [
                0,
                1,
                0.7,
                0,
              ],
              scale: [
                0,
                1.2,
                0.8,
                0.1,
              ],
            }}
            transition={{
              duration: 1.2,
              delay:
                0.92 +
                particle.delay,
              times: [
                0,
                0.42,
                0.76,
                1,
              ],
              ease: [
                0.3,
                0.7,
                0.2,
                1,
              ],
            }}
            className="absolute rounded-full"
            style={{
              width:
                particle.size,
              height:
                particle.size,
              marginLeft:
                -particle.size /
                2,
              marginTop:
                -particle.size /
                2,
              background:
                index % 3 ===
                0
                  ? "#a15cff"
                  : index % 3 ===
                      1
                    ? "#a15cff"
                    : "#a15cff",
              boxShadow:
                index % 3 ===
                0
                  ? "0 0 12px #a15cff"
                  : index % 3 ===
                      1
                    ? "0 0 12px #a15cff"
                    : "0 0 12px #a15cff",
            }}
          />
        ),
      )}

      {/* 6. Hard white flash = old page is swallowed */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [
            0,
            0,
            0,
            0.85,
            0.18,
            0,
          ],
        }}
        transition={{
          duration: 2.2,
          times: [
            0,
            0.63,
            0.73,
            0.79,
            0.88,
            1,
          ],
        }}
        className="absolute inset-0 bg-white"
      />

      {/* 7. New NODE shoots out of the portal and lands */}
      <motion.div
        initial={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          opacity: 0,
          scale: 0.18,
          rotate: -30,
        }}
        animate={{
          left: [
            "50%",
            "59%",
            "78%",
            "calc(100% - 72px)",
          ],
          top: [
            "50%",
            "58%",
            "76%",
            "calc(100% - 72px)",
          ],
          opacity: [
            0,
            1,
            1,
            0,
          ],
          scale: [
            0.18,
            0.82,
            0.58,
            0.2,
          ],
          rotate: [
            -30,
            8,
            20,
            0,
          ],
        }}
        transition={{
          duration: 0.82,
          delay: 1.55,
          times: [
            0,
            0.34,
            0.72,
            1,
          ],
          ease: [
            0.2,
            0.7,
            0.2,
            1,
          ],
        }}
        className="absolute h-[112px] w-[112px]"
      >
        <NodeFlightTail />

        <LivingNode
          mode="route"
          reduceMotion={false}
        />
      </motion.div>

      {/* Landing shockwave */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.1,
        }}
        animate={{
          opacity: [
            0,
            0,
            0.95,
            0,
          ],
          scale: [
            0.1,
            0.1,
            1.4,
            2.6,
          ],
        }}
        transition={{
          duration: 2.35,
          times: [
            0,
            0.84,
            0.92,
            1,
          ],
        }}
        className="absolute bottom-[23px] right-[23px] h-[104px] w-[104px] rounded-full border border-cyan-100/55 shadow-[0_0_35px_rgba(77,141,255,.32),0_0_95px_rgba(161,92,255,.22)]"
      />
    </motion.div>
  );
}

function NodeFlightTail() {
  return (
    <>
      <motion.div
        animate={{
          opacity: [
            0.3,
            0.95,
            0.3,
          ],
          scaleX: [
            0.72,
            1.25,
            0.72,
          ],
        }}
        transition={{
          duration: 0.38,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[68%] top-1/2 h-[3px] w-[185px] origin-right -translate-y-1/2 bg-gradient-to-l from-cyan-100 via-cyan-300/75 to-transparent"
        style={{
          boxShadow:
            "0 0 12px rgba(77,141,255,.6)",
        }}
      />

      <motion.div
        animate={{
          opacity: [
            0.12,
            0.52,
            0.12,
          ],
        }}
        transition={{
          duration: 0.56,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[63%] top-[56%] h-[20px] w-[165px] origin-right -translate-y-1/2 bg-gradient-to-l from-violet-400/38 via-cyan-400/18 to-transparent blur-lg"
      />
    </>
  );
}

function LivingNode({
  mode,
  reduceMotion,
}: {
  mode: NodeMode;
  reduceMotion: boolean;
}) {
  const palette =
    palettes[mode];

  return (
    <motion.div
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -5, 0],
            }
      }
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute inset-0"
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  0.86,
                  1.18,
                  0.86,
                ],
                opacity: [
                  0.22,
                  0.55,
                  0.22,
                ],
              }
        }
        transition={{
          duration: 2.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[2px] rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${palette.signal}38 0%, ${palette.accent}20 40%, transparent 72%)`,
        }}
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                borderRadius: [
                  "44% 56% 48% 52% / 55% 42% 58% 45%",
                  "57% 43% 59% 41% / 46% 57% 43% 54%",
                  "48% 52% 42% 58% / 58% 44% 56% 42%",
                  "44% 56% 48% 52% / 55% 42% 58% 45%",
                ],
                rotate: [
                  -3,
                  4,
                  -2,
                  -3,
                ],
              }
        }
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[16px] border border-white/[0.13]"
        style={{
          background: `radial-gradient(circle at 38% 32%, rgba(255,255,255,.16), ${palette.core}12 24%, ${palette.core2}12 48%, rgba(2,6,23,.1) 76%)`,
          boxShadow: `inset 0 0 24px ${palette.core}17, 0 0 30px ${palette.signal}14`,
        }}
      />

      {[0, 120, 240].map(
        (
          rotation,
          index,
        ) => (
          <motion.div
            key={rotation}
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate: [
                      rotation,
                      rotation +
                        (index %
                          2 ===
                        0
                          ? 10
                          : -10),
                      rotation,
                    ],
                    scaleY: [
                      0.92,
                      1.12,
                      0.92,
                    ],
                  }
            }
            transition={{
              duration:
                3.1 +
                index * 0.42,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 h-[47px] w-[8px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full"
            style={{
              transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
              background: `linear-gradient(to top, ${palette.signal}00, ${palette.signal}55, ${palette.core}cc)`,
              boxShadow: `0 0 12px ${palette.signal}35`,
            }}
          />
        ),
      )}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: 360,
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-[6px] rounded-full border border-white/[0.055]"
        style={{
          transform:
            "scaleY(.58) rotate(21deg)",
        }}
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: -360,
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-[9px] rounded-full border border-white/[0.045]"
        style={{
          transform:
            "scaleY(.45) rotate(-31deg)",
        }}
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  0.93,
                  1.08,
                  0.93,
                ],
              }
        }
        transition={{
          duration:
            mode === "warning"
              ? 0.75
              : 2.05,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, white 0%, ${palette.core} 13%, ${palette.core2} 45%, #050712 74%)`,
          boxShadow: `0 0 12px ${palette.core}, 0 0 30px ${palette.core2}99, 0 0 55px ${palette.signal}2c, inset 0 0 12px rgba(255,255,255,.5)`,
        }}
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [
                    0.55,
                    1,
                    0.55,
                  ],
                  opacity: [
                    0.4,
                    1,
                    0.4,
                  ],
                }
          }
          transition={{
            duration: 1.55,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_white]"
        />
      </motion.div>

      {[
        {
          radius: 42,
          duration: 6.5,
          color:
            palette.signal,
        },
        {
          radius: 50,
          duration: 8.8,
          color:
            palette.accent,
        },
        {
          radius: 36,
          duration: 5.2,
          color:
            palette.core,
        },
      ].map(
        (
          orbit,
          index,
        ) => (
          <motion.div
            key={index}
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate:
                      index === 1
                        ? -360
                        : 360,
                  }
            }
            transition={{
              duration:
                orbit.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              width:
                orbit.radius *
                2,
              height:
                orbit.radius *
                2,
              marginLeft:
                -orbit.radius,
              marginTop:
                -orbit.radius,
            }}
          >
            <span
              className="absolute left-1/2 top-0 rounded-full"
              style={{
                width:
                  index === 0
                    ? 7
                    : 5,
                height:
                  index === 0
                    ? 7
                    : 5,
                transform:
                  "translateX(-50%)",
                background:
                  orbit.color,
                boxShadow: `0 0 10px ${orbit.color}, 0 0 20px ${orbit.color}66`,
              }}
            />
          </motion.div>
        ),
      )}

      <AnimatePresence>
        {mode === "connect" && (
          <>
            <motion.div
              initial={{
                opacity: 0,
                scaleX: 0,
              }}
              animate={{
                opacity: [
                  0.2,
                  1,
                  0.2,
                ],
                scaleX: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute left-[-42px] top-1/2 h-px w-[75px] origin-right bg-gradient-to-l from-[#57ffa0] to-transparent shadow-[0_0_12px_rgba(87,255,160,.6)]"
            />

            <motion.div
              initial={{
                opacity: 0,
                scaleX: 0,
              }}
              animate={{
                opacity: [
                  0.2,
                  1,
                  0.2,
                ],
                scaleX: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute right-[-42px] top-1/2 h-px w-[75px] origin-left bg-gradient-to-r from-[#57ffa0] to-transparent shadow-[0_0_12px_rgba(87,255,160,.6)]"
            />
          </>
        )}

        {mode === "evidence" && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.4,
            }}
            animate={{
              opacity: [
                0,
                0.8,
                0,
              ],
              scale: [
                0.4,
                1.35,
                1.8,
              ],
            }}
            transition={{
              duration: 1.45,
              repeat: Infinity,
            }}
            className="absolute inset-[4px] rounded-full border border-orange-300/45"
          />
        )}

        {mode === "hypothesis" && (
          <motion.div
            initial={{
              opacity: 0,
              y: 0,
            }}
            animate={{
              opacity: [
                0,
                1,
                0,
              ],
              y: [
                0,
                -34,
                -55,
              ],
            }}
            transition={{
              duration: 1.65,
              repeat: Infinity,
            }}
            className="absolute left-[68%] top-[28%] h-3 w-3 rounded-full border border-dashed border-amber-200 bg-amber-200/20 shadow-[0_0_18px_rgba(253,230,138,.45)]"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}