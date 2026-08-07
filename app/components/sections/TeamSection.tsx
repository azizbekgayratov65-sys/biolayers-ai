"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

const founderSkills = [
  "Computational Oncology",
  "AI",
  "Product",
  "Research",
  "Engineering",
];

const cofounderSkills = [
  "Communication",
  "Media",
  "Business",
  "Presentations",
  "Strategy",
];

type PersonCardProps = {
  side: "left" | "right";
  image: string;
  name: string;
  role: string;
  focus: string;
  skills: string[];
  accent: string;
};

function PersonCard({
  side,
  image,
  name,
  role,
  focus,
  skills,
  accent,
}: PersonCardProps) {
  const reduceMotion =
    useReducedMotion();

  return (
    <div className="relative">
      <motion.div
        initial={{
          opacity: 0,
          x:
            side === "left"
              ? -55
              : 55,
          scale: 0.96,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.22,
        }}
        transition={{
          duration: 0.9,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        whileHover={{
          y: -8,
          rotateY:
            side === "left"
              ? 2
              : -2,
        }}
        className="relative overflow-hidden rounded-[34px] border border-white/[0.09] bg-[#050814]/82 p-3 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-2xl"
        style={{
          transformStyle:
            "preserve-3d",
          perspective: 1000,
        }}
      >
        <div
          className="pointer-events-none absolute -inset-10 opacity-30 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${accent}2b, transparent 65%)`,
          }}
        />

        <div className="relative overflow-hidden rounded-[26px] bg-[#020617]">
          <img
            src={image}
            alt={name}
            className="block aspect-[4/5] h-auto w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/18 to-transparent" />

          {!reduceMotion && (
            <motion.div
              animate={{
                y: [
                  "-28%",
                  "128%",
                ],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-transparent via-cyan-100/15 to-transparent blur-xl"
            />
          )}

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#050814]/70 px-3 py-1.5 backdrop-blur-xl">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background:
                  accent,
                boxShadow: `0 0 12px ${accent}`,
              }}
            />
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-300">
              Human node
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <p
              className="text-[8px] font-black uppercase tracking-[0.22em]"
              style={{
                color:
                  accent,
              }}
            >
              {role}
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-white sm:text-3xl">
              {name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {focus}
            </p>
          </div>
        </div>
      </motion.div>

      <div
        className={`mt-5 grid gap-2 ${
          side === "left"
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2"
        }`}
      >
        {skills.map(
          (
            skill,
            index,
          ) => (
            <motion.div
              key={skill}
              initial={{
                opacity: 0,
                y: 14,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.4,
              }}
              transition={{
                delay:
                  index *
                  0.06,
                duration:
                  0.35,
              }}
              className="rounded-[15px] border border-white/[0.07] bg-white/[0.025] px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      accent,
                    boxShadow: `0 0 10px ${accent}`,
                  }}
                />
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {skill}
                </span>
              </div>
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}

function CoreNode() {
  const reduceMotion =
    useReducedMotion();

  return (
    <div className="relative mx-auto flex h-[300px] w-full max-w-[300px] items-center justify-center">
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: 360,
              }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-60 w-60 rounded-full border border-dashed border-cyan-300/[0.12]"
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
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-44 w-44 rounded-full border border-violet-300/[0.15]"
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [
                  0.94,
                  1.06,
                  0.94,
                ],
              }
        }
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan-200/25 bg-[#050814]/90 shadow-[0_0_36px_rgba(103,232,249,.28),0_0_80px_rgba(139,92,246,.18)] backdrop-blur-xl"
      >
        <div className="h-8 w-8 rounded-full bg-white shadow-[0_0_18px_white,0_0_42px_#67e8f9,0_0_72px_#8b5cf6]" />
      </motion.div>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.25em] text-cyan-300">
          Shared core
        </p>

        <p className="mt-1 text-sm font-semibold text-white">
          BioLayers AI
        </p>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const reduceMotion =
    useReducedMotion();

  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className="relative z-40 overflow-hidden border-y border-white/[0.06] bg-[#01030a] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(34,211,238,.09),transparent_30%),radial-gradient(circle_at_82%_30%,rgba(139,92,246,.10),transparent_32%),radial-gradient(circle_at_50%_110%,rgba(236,72,153,.06),transparent_38%)]" />

      {!reduceMotion && (
        <motion.div
          animate={{
            backgroundPosition: [
              "0px 0px",
              "72px 72px",
            ],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(103,232,249,.14) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,.12) 1px, transparent 1px)
            `,
            backgroundSize:
              "72px 72px",
          }}
        />
      )}

      <div className="relative mx-auto max-w-[1500px]">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.8,
          }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-cyan-300/75">
            Human Intelligence Network
          </p>

          <h2
            id="team-heading"
            className="mt-5 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl lg:text-[68px]"
          >
            Two people.
            <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
              One biological system.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            BioLayers combines scientific thinking,
            software creation and communication into one
            connected research platform.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-10 lg:grid-cols-[1fr_300px_1fr] lg:items-start">
          <PersonCard
            side="left"
            image="/founder-2026.png"
            name="Azizbek Gayratov"
            role="Founder · Creator · Designer · Developer"
            focus="AI-Driven Computational Oncology and Precision Medicine"
            skills={
              founderSkills
            }
            accent="#67e8f9"
          />

          <div className="relative hidden lg:block">
            <div className="absolute left-0 top-[145px] h-px w-[calc(50%-52px)] bg-gradient-to-r from-transparent via-cyan-300/45 to-cyan-300/70" />
            <div className="absolute right-0 top-[145px] h-px w-[calc(50%-52px)] bg-gradient-to-l from-transparent via-violet-300/45 to-violet-300/70" />

            <motion.span
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: [
                        -115,
                        115,
                      ],
                      opacity: [
                        0,
                        1,
                        0,
                      ],
                    }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute left-1/2 top-[142px] h-1.5 w-10 -translate-x-1/2 rounded-full bg-white shadow-[0_0_14px_white,0_0_24px_#67e8f9]"
            />

            <CoreNode />
          </div>

          <PersonCard
            side="right"
            image="/cofounder.png"
            name="Akbarshoh Rustamov"
            role="Co-Founder · Communications Lead"
            focus="International Business, Media and Public Communication"
            skills={
              cofounderSkills
            }
            accent="#c084fc"
          />
        </div>

        <div className="mt-16 grid gap-3 md:grid-cols-3">
          {[
            [
              "Scientific direction",
              "Computational oncology, biological systems and precision medicine.",
            ],
            [
              "Product direction",
              "AI workflows, knowledge graphs, research interfaces and interaction design.",
            ],
            [
              "Communication direction",
              "Clear storytelling, media strategy, public presentation and outreach.",
            ],
          ].map(
            (
              [
                title,
                text,
              ],
              index,
            ) => (
              <motion.div
                key={title}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                transition={{
                  delay:
                    index *
                    0.08,
                  duration: 0.45,
                }}
                className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300/70">
                  0{index + 1}
                </p>

                <h3 className="mt-3 text-base font-semibold text-white">
                  {title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  {text}
                </p>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}