"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type PortalTransitionProps = {
  active: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

const PORTAL_COLORS = [
  "#67e8f9",
  "#38bdf8",
  "#818cf8",
  "#a78bfa",
  "#e879f9",
  "#f472b6",
  "#ffffff",
];

export default function PortalTransition({
  active,
}: PortalTransitionProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 52 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 4,
        delay: Math.random() * 0.9,
        duration: 1.2 + Math.random() * 1.5,
        color:
          PORTAL_COLORS[
            index % PORTAL_COLORS.length
          ],
      })),
    [],
  );

  const dnaParticles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        progress: index / 27,
        delay: index * 0.018,
      })),
    [],
  );

  const tunnelLines = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        rotate: (360 / 26) * index,
        delay: index * 0.012,
        length: 110 + (index % 5) * 34,
      })),
    [],
  );

  if (!active) {
    return null;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.12,
      }}
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-[#01030b]"
    >
      {/* Deep-space background */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [0, 1, 1, 0.8],
        }}
        transition={{
          duration: 3.9,
          times: [0, 0.08, 0.78, 1],
        }}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(30,41,90,.34) 0%, rgba(2,6,23,.88) 42%, #01030b 78%)",
        }}
      />

      {/* Background color nebulae */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.4,
        }}
        animate={{
          opacity: [0, 0.45, 0.2, 0],
          scale: [0.4, 1.15, 1.8, 2.4],
          rotate: [0, 35, 80, 125],
        }}
        transition={{
          duration: 3.6,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[85px]"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(34,211,238,.8), rgba(99,102,241,.72), rgba(217,70,239,.72), rgba(244,63,94,.55), rgba(34,211,238,.8))",
        }}
      />

      {/* Ambient stars */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [0, 0.85, 0.8, 0],
        }}
        transition={{
          duration: 3.8,
          times: [0, 0.12, 0.82, 1],
        }}
        className="absolute inset-0"
      >
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 1, 0.35, 0],
              scale: [0, 1.8, 1, 0],
              x: [0, 0, (particle.x - 50) * 2.8],
              y: [0, 0, (particle.y - 50) * 2.8],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              boxShadow: `0 0 ${
                particle.size * 5
              }px ${particle.color}`,
            }}
          />
        ))}
      </motion.div>

      {/* Phase label */}
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
          filter: "blur(8px)",
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [12, 0, 0, -8],
          filter: [
            "blur(8px)",
            "blur(0px)",
            "blur(0px)",
            "blur(8px)",
          ],
        }}
        transition={{
          duration: 0.9,
          times: [0, 0.22, 0.72, 1],
        }}
        className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.42em] text-cyan-200/75 sm:text-[11px]">
          BioLayers transformation sequence
        </p>
      </motion.div>

      {/* PHASE 1 — Energy sphere */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.05,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.05, 0.65, 1.05, 1.6],
        }}
        transition={{
          duration: 1.05,
          ease: [0.16, 1, 0.3, 1],
          times: [0, 0.24, 0.68, 1],
        }}
        className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-72 sm:w-72"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, #ffffff 0%, #cffafe 7%, #67e8f9 18%, #6366f1 43%, #a855f7 61%, rgba(236,72,153,.45) 72%, transparent 78%)",
          boxShadow:
            "0 0 45px rgba(255,255,255,.92), 0 0 110px rgba(34,211,238,.82), 0 0 220px rgba(99,102,241,.65), 0 0 320px rgba(217,70,239,.38)",
        }}
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-8 rounded-full border border-cyan-100/30"
        />

        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-16 rounded-full border border-violet-300/20"
        />

        <motion.div
          animate={{
            scale: [0.85, 1.2, 0.85],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-[38%] rounded-full bg-white shadow-[0_0_42px_18px_rgba(255,255,255,.95)]"
        />
      </motion.div>

      {/* PHASE 2 — DNA helix */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.55,
          rotateZ: -16,
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0],
          scale: [0.55, 0.55, 1, 1.08, 1.45],
          rotateZ: [-16, -16, 0, 8, 20],
        }}
        transition={{
          duration: 1.6,
          delay: 0.72,
          times: [0, 0.08, 0.26, 0.72, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute left-1/2 top-1/2 h-[62vh] w-64 -translate-x-1/2 -translate-y-1/2 sm:w-80"
      >
        {dnaParticles.map((particle, index) => {
          const angle =
            particle.progress * Math.PI * 7;

          const x1 =
            50 + Math.sin(angle) * 34;

          const x2 =
            50 - Math.sin(angle) * 34;

          const y =
            particle.progress * 100;

          const depth =
            (Math.cos(angle) + 1) / 2;

          return (
            <div key={particle.id}>
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [
                    0,
                    0.7 + depth * 0.8,
                    0.7 + depth * 0.8,
                    0,
                  ],
                }}
                transition={{
                  duration: 1.08,
                  delay:
                    0.85 + particle.delay,
                  times: [0, 0.2, 0.78, 1],
                }}
                className="absolute h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
                style={{
                  left: `${x1}%`,
                  top: `${y}%`,
                  background:
                    index % 2 === 0
                      ? "#67e8f9"
                      : "#a78bfa",
                  boxShadow:
                    index % 2 === 0
                      ? "0 0 18px #22d3ee"
                      : "0 0 18px #8b5cf6",
                }}
              />

              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [
                    0,
                    1.5 - depth * 0.7,
                    1.5 - depth * 0.7,
                    0,
                  ],
                }}
                transition={{
                  duration: 1.08,
                  delay:
                    0.85 + particle.delay,
                  times: [0, 0.2, 0.78, 1],
                }}
                className="absolute h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
                style={{
                  left: `${x2}%`,
                  top: `${y}%`,
                  background:
                    index % 2 === 0
                      ? "#f472b6"
                      : "#ffffff",
                  boxShadow:
                    index % 2 === 0
                      ? "0 0 18px #ec4899"
                      : "0 0 18px #ffffff",
                }}
              />

              {index % 2 === 0 && (
                <motion.span
                  initial={{
                    opacity: 0,
                    scaleX: 0,
                  }}
                  animate={{
                    opacity: [0, 0.7, 0.7, 0],
                    scaleX: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 0.95,
                    delay:
                      0.88 + particle.delay,
                  }}
                  className="absolute h-px origin-left bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300"
                  style={{
                    left: `${Math.min(x1, x2)}%`,
                    top: `calc(${y}% + 5px)`,
                    width: `${Math.abs(x1 - x2)}%`,
                    boxShadow:
                      "0 0 8px rgba(255,255,255,.8)",
                  }}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* PHASE 3 — Energy wave */}
      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0.1,
          scaleY: 0.3,
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0],
          scaleX: [0.1, 0.1, 1, 1.8, 3.6],
          scaleY: [0.3, 0.3, 1, 0.8, 0.3],
        }}
        transition={{
          duration: 1.25,
          delay: 1.75,
          times: [0, 0.08, 0.32, 0.7, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute left-1/2 top-1/2 h-32 w-[70vw] -translate-x-1/2 -translate-y-1/2"
      >
        {[0, 1, 2, 3, 4].map((line) => (
          <motion.div
            key={line}
            animate={{
              y: [
                0,
                line % 2 === 0 ? -20 : 20,
                0,
              ],
              opacity: [0.25, 1, 0.25],
            }}
            transition={{
              duration: 0.42 + line * 0.05,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-0 h-px w-full"
            style={{
              top: `${20 + line * 15}%`,
              background:
                line % 2 === 0
                  ? "linear-gradient(90deg, transparent, #67e8f9, #ffffff, #8b5cf6, transparent)"
                  : "linear-gradient(90deg, transparent, #ec4899, #ffffff, #22d3ee, transparent)",
              boxShadow:
                "0 0 16px rgba(103,232,249,.95)",
            }}
          />
        ))}
      </motion.div>

      {/* PHASE 4 — Star tunnel */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.2,
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0],
          scale: [0.2, 0.2, 0.75, 1.5, 4.2],
          rotate: [0, 0, 25, 110, 220],
        }}
        transition={{
          duration: 1.55,
          delay: 2.35,
          times: [0, 0.06, 0.32, 0.76, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
      >
        {tunnelLines.map((line) => (
          <motion.span
            key={line.id}
            initial={{
              scaleX: 0,
              opacity: 0,
            }}
            animate={{
              scaleX: [0, 1, 2.8],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.72,
              delay:
                2.52 + line.delay,
              repeat: 2,
              repeatDelay: 0.06,
              ease: "easeIn",
            }}
            className="absolute left-1/2 top-1/2 h-px origin-left"
            style={{
              width: line.length,
              rotate: `${line.rotate}deg`,
              background:
                line.id % 3 === 0
                  ? "linear-gradient(90deg, #ffffff, #67e8f9, transparent)"
                  : line.id % 3 === 1
                    ? "linear-gradient(90deg, #ffffff, #a78bfa, transparent)"
                    : "linear-gradient(90deg, #ffffff, #f472b6, transparent)",
              boxShadow:
                "0 0 12px rgba(255,255,255,.9)",
            }}
          />
        ))}
      </motion.div>

      {/* PHASE 5 — Black hole */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.25,
          rotate: 0,
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0],
          scale: [0.25, 0.25, 0.9, 1.35, 4.8],
          rotate: [0, 0, 90, 260, 520],
        }}
        transition={{
          duration: 1.35,
          delay: 3.12,
          times: [0, 0.08, 0.32, 0.74, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-96 sm:w-96"
        style={{
          background:
            "conic-gradient(from 20deg, transparent 0deg, #22d3ee 42deg, transparent 82deg, #8b5cf6 128deg, transparent 177deg, #ec4899 230deg, transparent 276deg, #ffffff 318deg, transparent 360deg)",
          filter: "blur(3px)",
          boxShadow:
            "0 0 70px rgba(34,211,238,.5), 0 0 150px rgba(139,92,246,.45)",
        }}
      >
        <div className="absolute inset-[18%] rounded-full bg-[#000107] shadow-[0_0_55px_22px_rgba(0,0,0,1),inset_0_0_30px_rgba(255,255,255,.08)]" />

        <motion.div
          animate={{
            scale: [0.7, 1.1, 0.7],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.45,
            repeat: Infinity,
          }}
          className="absolute inset-[34%] rounded-full bg-white blur-md shadow-[0_0_55px_28px_rgba(255,255,255,.95)]"
        />
      </motion.div>

      {/* Final interface label */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.94,
          filter: "blur(12px)",
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0],
          y: [20, 20, 0, 0, -15],
          scale: [0.94, 0.94, 1, 1, 1.05],
          filter: [
            "blur(12px)",
            "blur(12px)",
            "blur(0px)",
            "blur(0px)",
            "blur(8px)",
          ],
        }}
        transition={{
          duration: 1.1,
          delay: 3.55,
          times: [0, 0.08, 0.3, 0.72, 1],
        }}
        className="absolute inset-x-6 bottom-[14%] text-center"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.42em] text-cyan-200/70 sm:text-[11px]">
          Biological system initialized
        </p>

        <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white sm:text-2xl">
          Opening BioLayers Workspace
        </p>
      </motion.div>

      {/* Final white portal */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.02,
        }}
        animate={{
          opacity: [0, 0, 1, 1],
          scale: [0.02, 0.02, 1.2, 18],
        }}
        transition={{
          duration: 0.8,
          delay: 4.02,
          times: [0, 0.16, 0.58, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{
          boxShadow:
            "0 0 70px rgba(255,255,255,1), 0 0 150px rgba(103,232,249,.9), 0 0 300px rgba(139,92,246,.8)",
        }}
      />

      {/* Final full-screen flash */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [0, 0, 1],
        }}
        transition={{
          duration: 0.32,
          delay: 4.43,
          times: [0, 0.25, 1],
        }}
        className="absolute inset-0 bg-white"
      />

      {/* Cinematic bars */}
      <motion.div
        initial={{
          height: "8vh",
        }}
        animate={{
          height: ["8vh", "8vh", "0vh"],
        }}
        transition={{
          duration: 0.8,
          delay: 3.75,
        }}
        className="absolute left-0 right-0 top-0 bg-black"
      />

      <motion.div
        initial={{
          height: "8vh",
        }}
        animate={{
          height: ["8vh", "8vh", "0vh"],
        }}
        transition={{
          duration: 0.8,
          delay: 3.75,
        }}
        className="absolute bottom-0 left-0 right-0 bg-black"
      />
    </motion.div>
  );
}