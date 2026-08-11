"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  FlaskConical,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

/* =========================================================
   NAVIGATION
   ========================================================= */

const navItems = [
  {
    href: "#capabilities",
    label: "Product",
    id: "capabilities",
  },
  {
    href: "#scientific-sources",
    label: "Science",
    id: "scientific-sources",
  },
  {
    href: "#research-copilot",
    label: "Copilot",
    id: "research-copilot",
  },
  {
    href: "#about",
    label: "About",
    id: "about",
  },
] as const;

/* =========================================================
   NAVBAR
   ========================================================= */

export default function Navbar() {
  const reduceMotion = Boolean(useReducedMotion());

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  /* =======================================================
     SCROLL STATE
     ======================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =======================================================
     ACTIVE SECTION
     ======================================================= */

  useEffect(() => {
    const elements = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio,
          );

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.05, 0.15, 0.3, 0.5],
      },
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =======================================================
     ESC CLOSE
     ======================================================= */

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  /* =======================================================
     BODY LOCK
     ======================================================= */

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <motion.header
        initial={
          reduceMotion
            ? false
            : {
                y: -70,
                opacity: 0,
              }
        }
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          fixed
          inset-x-0
          top-0
          z-[100]
          px-3
          pt-3
          sm:px-5
          sm:pt-4
        "
      >
        <motion.div
          animate={{
            backgroundColor: scrolled
              ? "rgba(2, 4, 13, 0.88)"
              : "rgba(2, 4, 13, 0.42)",
            borderColor: scrolled
              ? "rgba(255,255,255,0.10)"
              : "rgba(103,232,249,0.07)",
          }}
          transition={{
            duration: 0.3,
          }}
          className="
            relative
            mx-auto
            max-w-[1500px]
            overflow-hidden
            rounded-[22px]
            border
            backdrop-blur-2xl
            shadow-[0_18px_70px_rgba(0,0,0,.24)]
          "
        >
          {/* ================================================= */}
          {/* TOP LIGHT                                         */}
          {/* ================================================= */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-x-16
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-cyan-300/35
              to-transparent
            "
          />

          {/* ================================================= */}
          {/* AMBIENT GLOW                                      */}
          {/* ================================================= */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -left-20
              -top-20
              h-44
              w-44
              rounded-full
              bg-cyan-400/[0.05]
              blur-[70px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-44
              w-44
              rounded-full
              bg-violet-500/[0.06]
              blur-[70px]
            "
          />

          {/* ================================================= */}
          {/* NAVBAR CONTENT                                    */}
          {/* ================================================= */}

          <div
            className="
              relative
              flex
              h-[70px]
              items-center
              justify-between
              gap-5
              px-4
              sm:px-5
              lg:px-6
            "
          >
            {/* ================================================= */}
            {/* BRAND                                            */}
            {/* ================================================= */}

            <Link
              href="/"
              aria-label="BioLayers AI home"
              className="
                group
                flex
                shrink-0
                items-center
                gap-3
              "
            >
              <motion.div
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.05,
                      }
                }
                className="
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[13px]
                  border
                  border-cyan-300/20
                  bg-cyan-300/[0.04]
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-cyan-300/[0.10]
                    via-transparent
                    to-violet-400/[0.12]
                  "
                />

                <span
                  className="
                    relative
                    text-[11px]
                    font-black
                    tracking-[0.08em]
                    text-cyan-50
                  "
                >
                  BL
                </span>
              </motion.div>

              <div>
                <div
                  className="
                    text-sm
                    font-black
                    tracking-[-0.02em]
                    text-white
                  "
                >
                  BioLayers AI
                </div>

                <div
                  className="
                    mt-0.5
                    hidden
                    font-mono
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-white/25
                    sm:block
                  "
                >
                  Computational oncology
                </div>
              </div>
            </Link>

            {/* ================================================= */}
            {/* DESKTOP NAVIGATION                               */}
            {/* ================================================= */}

            <nav
              aria-label="Primary navigation"
              className="
                hidden
                items-center
                gap-1
                lg:flex
              "
            >
              {navItems.map((item) => (
                <DesktopNavItem
                  key={item.id}
                  href={item.href}
                  label={item.label}
                  active={activeSection === item.id}
                  reduceMotion={reduceMotion}
                />
              ))}
            </nav>

            {/* ================================================= */}
            {/* DESKTOP ACTIONS                                  */}
            {/* ================================================= */}

            <div
              className="
                hidden
                shrink-0
                items-center
                gap-2
                lg:flex
              "
            >
              {/* Research Lab */}

              <Link
                href="/lab"
                className="
                  group
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-[13px]
                  border
                  border-violet-300/10
                  bg-violet-300/[0.025]
                  px-4
                  text-xs
                  font-semibold
                  text-white/55
                  transition
                  duration-300
                  hover:border-violet-300/20
                  hover:bg-violet-300/[0.05]
                  hover:text-white/80
                "
              >
                <FlaskConical
                  className="
                    h-3.5
                    w-3.5
                    text-violet-300/55
                  "
                />

                Research Lab
              </Link>

              {/* Workspace */}

              <motion.div
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
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
              >
                <Link
                  href="/explore"
                  className="
                    group
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-[13px]
                    border
                    border-cyan-300/20
                    bg-cyan-300/[0.06]
                    px-4
                    text-xs
                    font-bold
                    text-cyan-50
                    transition
                    duration-300
                    hover:border-cyan-300/35
                    hover:bg-cyan-300/[0.10]
                  "
                >
                  Open Workspace

                  <ArrowRight
                    className="
                      h-3.5
                      w-3.5
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>
              </motion.div>
            </div>

            {/* ================================================= */}
            {/* MOBILE BUTTON                                    */}
            {/* ================================================= */}

            <button
              type="button"
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((current) => !current);
              }}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-[13px]
                border
                border-white/[0.08]
                bg-white/[0.025]
                text-white/65
                transition
                hover:border-white/[0.15]
                hover:bg-white/[0.05]
                hover:text-white
                lg:hidden
              "
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.header>

      {/* ===================================================== */}
      {/* MOBILE NAVIGATION                                    */}
      {/* ===================================================== */}

      <AnimatePresence>
        {mobileOpen && (
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
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
            }}
            className="
              fixed
              inset-0
              z-[90]
              bg-[#020105]/92
              px-4
              pb-6
              pt-[100px]
              backdrop-blur-3xl
              lg:hidden
            "
          >
            {/* Ambient */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-[450px]
                w-[600px]
                -translate-x-1/2
                rounded-full
                bg-violet-500/[0.08]
                blur-[140px]
              "
            />

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: -15,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                relative
                mx-auto
                max-w-xl
                overflow-hidden
                rounded-[26px]
                border
                border-white/[0.08]
                bg-white/[0.02]
                p-4
                shadow-[0_30px_100px_rgba(0,0,0,.4)]
              "
            >
              {/* Navigation */}

              <nav
                aria-label="Mobile navigation"
                className="space-y-1"
              >
                {navItems.map((item, index) => {
                  const active = activeSection === item.id;

                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setMobileOpen(false);
                      }}
                      className={`
                        group
                        flex
                        items-center
                        justify-between
                        rounded-[17px]
                        border
                        px-4
                        py-4
                        transition
                        duration-300

                        ${
                          active
                            ? "border-cyan-300/15 bg-cyan-300/[0.055]"
                            : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.025]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="
                            font-mono
                            text-[8px]
                            font-bold
                            tracking-[0.15em]
                            text-cyan-300/35
                          "
                        >
                          0{index + 1}
                        </span>

                        <span
                          className={`
                            text-lg
                            font-semibold
                            tracking-[-0.02em]

                            ${
                              active
                                ? "text-white"
                                : "text-white/60"
                            }
                          `}
                        >
                          {item.label}
                        </span>
                      </div>

                      {active && (
                        <span
                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-cyan-300
                            shadow-[0_0_10px_rgba(103,232,249,.8)]
                          "
                        />
                      )}
                    </a>
                  );
                })}
              </nav>

              {/* Mobile actions */}

              <div
                className="
                  mt-4
                  grid
                  gap-2
                  border-t
                  border-white/[0.06]
                  pt-4
                  sm:grid-cols-2
                "
              >
                <Link
                  href="/lab"
                  onClick={() => {
                    setMobileOpen(false);
                  }}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    border
                    border-violet-300/12
                    bg-violet-300/[0.035]
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    text-violet-100/70
                    transition
                    hover:border-violet-300/25
                    hover:bg-violet-300/[0.07]
                    hover:text-white
                  "
                >
                  <FlaskConical className="h-4 w-4" />

                  Research Lab
                </Link>

                <Link
                  href="/explore"
                  onClick={() => {
                    setMobileOpen(false);
                  }}
                  className="
                    group
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    border
                    border-cyan-300/20
                    bg-cyan-300/[0.065]
                    px-4
                    py-3.5
                    text-sm
                    font-bold
                    text-cyan-50
                    transition
                    hover:border-cyan-300/35
                    hover:bg-cyan-300/[0.10]
                  "
                >
                  Open Workspace

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>
              </div>

              {/* Status */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  px-2
                  pb-1
                  font-mono
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-white/20
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-violet-300/60
                  "
                />

                Research platform in development
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================================================
   DESKTOP NAV ITEM
   ========================================================= */

function DesktopNavItem({
  href,
  label,
  active,
  reduceMotion,
}: {
  href: string;
  label: string;
  active: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.a
      href={href}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -1,
            }
      }
      className={`
        group
        relative
        rounded-[12px]
        px-3.5
        py-2.5
        text-xs
        font-semibold
        transition-colors
        duration-300

        ${
          active
            ? "text-white"
            : "text-white/45 hover:text-white/80"
        }
      `}
    >
      {active && (
        <motion.div
          layoutId="active-navigation"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
          className="
            absolute
            inset-0
            rounded-[12px]
            border
            border-cyan-300/10
            bg-cyan-300/[0.035]
          "
        />
      )}

      <span className="relative">
        {label}
      </span>

      {active && (
        <motion.span
          layoutId="active-navigation-dot"
          className="
            absolute
            -bottom-[1px]
            left-1/2
            h-[2px]
            w-5
            -translate-x-1/2
            rounded-full
            bg-cyan-300
            shadow-[0_0_8px_rgba(103,232,249,.65)]
          "
        />
      )}
    </motion.a>
  );
}