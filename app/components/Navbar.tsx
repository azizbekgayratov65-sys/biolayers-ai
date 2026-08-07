"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const navItems = [
  { href: "#workspace", label: "Workspace", index: "01" },
  { href: "#capabilities", label: "Capabilities", index: "02" },
  { href: "#team", label: "Team", index: "03" },
  { href: "#about", label: "About", index: "04" },
] as const;

export default function Navbar() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={
        reduceMotion
          ? false
          : {
              y: -90,
              opacity: 0,
            }
      }
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: reduceMotion ? 0 : 1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute inset-x-0 top-0 z-50"
    >
      {/* Top energy line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent shadow-[0_0_26px_rgba(34,211,238,.8)]"
      />

      <div className="relative border-b border-cyan-300/[0.08] bg-[#02040d]/65 backdrop-blur-2xl">
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            animate={{
              x: ["-120%", "220%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute inset-y-0 w-48 bg-gradient-to-r from-transparent via-cyan-200/[0.06] to-transparent blur-xl"
          />
        )}

        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-10 lg:px-16">
          {/* Brand */}
          <Link
            href="/"
            aria-label="BioLayers AI home"
            className="group relative flex items-center gap-3"
          >
            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      rotate: 8,
                      scale: 1.1,
                    }
              }
              className="relative"
            >
              {!reduceMotion && (
                <motion.div
                  aria-hidden="true"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute -inset-2 rounded-[18px] bg-[conic-gradient(from_0deg,transparent,rgba(34,211,238,.5),transparent,rgba(139,92,246,.45),transparent)] blur-md"
                />
              )}

              <span className="relative flex h-11 w-11 items-center justify-center rounded-[16px] border border-cyan-300/30 bg-[#03121a]/90 text-xs font-black tracking-wider text-cyan-100 shadow-[inset_0_0_20px_rgba(34,211,238,.08),0_0_32px_rgba(34,211,238,.18)]">
                BL
              </span>
            </motion.div>

            <div>
              <motion.p
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        backgroundPosition: [
                          "0% 50%",
                          "100% 50%",
                          "0% 50%",
                        ],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-[length:220%_220%] bg-clip-text text-sm font-black tracking-tight text-transparent"
              >
                BioLayers AI
              </motion.p>

              <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.26em] text-slate-400 sm:block">
                Cancer knowledge, connected
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                index={item.index}
                reduceMotion={Boolean(reduceMotion)}
              />
            ))}
          </nav>

          {/* Workspace CTA */}
          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.035,
                    y: -2,
                  }
            }
            whileTap={
              reduceMotion
                ? undefined
                : {
                    scale: 0.97,
                  }
            }
            className="relative"
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden="true"
                animate={{
                  opacity: [0.2, 0.7, 0.2],
                  scale: [0.96, 1.06, 0.96],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute -inset-2 rounded-[20px] bg-gradient-to-r from-cyan-400/20 via-violet-400/20 to-fuchsia-400/20 blur-xl"
              />
            )}

            <Link
              href="/explore"
              className="group relative flex items-center gap-3 overflow-hidden rounded-[17px] border border-white/15 bg-white/[0.055] px-4 py-3 text-xs font-bold text-white shadow-[inset_0_0_22px_rgba(255,255,255,.025),0_16px_50px_rgba(0,0,0,.28)] backdrop-blur-xl transition-colors hover:border-cyan-300/30 hover:bg-white/[0.08] sm:px-5 sm:text-sm"
            >
              {!reduceMotion && (
                <motion.span
                  aria-hidden="true"
                  animate={{
                    x: ["-170%", "260%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 1.4,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md"
                />
              )}

              <span className="relative hidden sm:inline">
                Open workspace
              </span>

              <span className="relative sm:hidden">
                Open
              </span>

              <motion.span
                aria-hidden="true"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x: [0, 5, 0],
                      }
                }
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative text-cyan-200"
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  index: string;
  reduceMotion: boolean;
};

function NavItem({
  href,
  label,
  index,
  reduceMotion,
}: NavItemProps) {
  return (
    <motion.a
      href={href}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -2,
            }
      }
      className="group relative overflow-hidden rounded-xl px-4 py-3"
    >
      <motion.div
        aria-hidden="true"
        initial={{
          opacity: 0,
          scaleX: 0,
        }}
        whileHover={{
          opacity: 1,
          scaleX: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className="absolute inset-x-3 bottom-1 h-px origin-center bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#67e8f9]"
      />

      <motion.div
        aria-hidden="true"
        initial={{
          opacity: 0,
        }}
        whileHover={{
          opacity: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className="absolute inset-0 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035]"
      />

      <span className="relative flex items-center gap-2">
        <span className="text-[8px] font-black tracking-wider text-cyan-300/35 transition-colors group-hover:text-cyan-300">
          {index}
        </span>

        <span className="text-sm font-semibold text-slate-300 transition-colors group-hover:text-white">
          {label}
        </span>
      </span>
    </motion.a>
  );
}