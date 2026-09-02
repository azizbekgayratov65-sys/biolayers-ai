"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Menu,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { AccountMenu } from "./auth/AccountMenu";

type NavItem = {
  label: string;
  href: string;
  path: string;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", path: "/" },
  { label: "Cipher", href: "/cipher", path: "/cipher" },
  { label: "Journey", href: "/journey", path: "/journey" },
  { label: "About & Mentorship", href: "/about", path: "/about" },
  { label: "Partners", href: "/partners", path: "/partners" },
  { label: "Press", href: "/press", path: "/press" },
  { label: "Library", href: "/library", path: "/library" },
];

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 18);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const isItemActive = (item: NavItem) => {
    if (item.path === "/" && pathname === "/") return true;
    if (item.path !== "/" && pathname.startsWith(item.path)) return true;
    return false;
  };

  const navBarStyle = {
    backgroundColor: scrolled ? "rgba(4, 7, 10, 0.94)" : "rgba(4, 7, 10, 0.45)",
    borderColor: scrolled ? "rgba(141,178,255,0.14)" : "rgba(77,141,255,0.08)",
    boxShadow: scrolled ? "0 22px 70px rgba(0,0,0,.4)" : "0 12px 42px rgba(0,0,0,.18)",
    transition: "background-color 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease",
  } as React.CSSProperties;

  const navRowHeight = scrolled ? 64 : 72;

  const mobileDrawerStyle = {
    opacity: mobileOpen ? 1 : 0,
    transition: `opacity ${reduceMotion ? 0 : 0.25}s ease-out`,
    pointerEvents: mobileOpen ? "auto" : "none",
  } as React.CSSProperties;

  const mobileDrawerInnerStyle = {
    opacity: mobileOpen ? 1 : 0,
    transform: mobileOpen ? "translateY(0)" : "translateY(-15px)",
    transition: `opacity ${reduceMotion ? 0 : 0.35}s ease-out, transform ${reduceMotion ? 0 : 0.35}s ease-out`,
  } as React.CSSProperties;

  return (
    <>
      <header
        className="
          fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5 sm:pt-4
          transition-transform duration-500 ease-out
        "
        style={{
          transform: reduceMotion ? undefined : "translateY(0)",
          opacity: reduceMotion ? undefined : 1,
        }}
      >
        <div
          style={navBarStyle}
          className="
            relative mx-auto max-w-[1540px] rounded-[20px] border backdrop-blur-xl
            transition-[height] duration-300 ease-out
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-x-16 top-0 h-px
              bg-gradient-to-r from-transparent via-teal-200/30 to-transparent
            "
          />
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full
              bg-teal-400/[0.055] blur-[70px]
            "
          />
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full
              bg-sky-400/[0.045] blur-[70px]
            "
          />

          <div
            className="
              relative flex items-center justify-between gap-5 px-4 sm:px-5 lg:px-6
              transition-height duration-300 ease-out
            "
            style={{ height: navRowHeight }}
          >
            <Link
              href="/"
              aria-label="BioLayers AI home"
              className="group flex shrink-0 items-center gap-3"
            >
              <div
                className="
                  relative flex h-10 w-10 items-center justify-center overflow-hidden
                  rounded-[13px] border border-teal-200/20 bg-teal-300/[0.045]
                  transition-transform duration-250
                "
                style={{
                  transform: scrolled ? "scale(0.94)" : "scale(1)",
                }}
              >
                <Image
                  src="/biolayers-logo.svg"
                  alt="BioLayers AI"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div>
                <div className="text-sm font-black tracking-[-0.02em] text-white">
                  BioLayers AI
                </div>
                <div className="mt-0.5 hidden font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">
                  Computational oncology
                </div>
              </div>
            </Link>

            <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = isItemActive(item);
                return (
                  <DesktopNavItem
                    key={item.label}
                    href={item.href}
                    label={item.label}
                    active={active}
                  />
                );
              })}
            </nav>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <Link
                href="/mindmap"
                className="
                  group flex h-10 items-center gap-2 rounded-[13px]
                  border border-emerald-200/25 bg-emerald-300/[0.08] px-4
                  text-xs font-bold text-emerald-50 transition-colors duration-300
                  hover:border-emerald-200/40 hover:bg-emerald-300/[0.14]
                "
              >
                <Workflow className="h-3.5 w-3.5 text-emerald-300/90" />
                <span>Mind Map</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <AccountMenu />
            </div>

            <button
              type="button"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((c) => !c)}
              className="
                flex h-10 w-10 items-center justify-center rounded-[13px]
                border border-teal-100/[0.08] bg-white/[0.025] text-white/65
                transition-colors hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white lg:hidden
              "
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div
        style={mobileDrawerStyle}
        className="
          fixed inset-0 z-[90] overflow-y-auto bg-[#04070a]/96
          px-4 pb-8 pt-[96px] backdrop-blur-2xl lg:hidden
        "
        aria-hidden={!mobileOpen}
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute left-1/2 top-0 h-[450px] w-[600px]
            -translate-x-1/2 rounded-full bg-teal-400/[0.065] blur-[140px]
          "
        />
        <div style={mobileDrawerInnerStyle} className="
          relative mx-auto max-w-xl rounded-[26px] border border-teal-100/[0.08]
          bg-[#0a0f14]/80 p-4 shadow-[0_30px_100px_rgba(0,0,0,.5)]
        ">
          <nav aria-label="Mobile navigation" className="space-y-1.5">
            {navItems.map((item, index) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center justify-between rounded-[16px] border px-4 py-3.5 transition
                    ${
                      active
                        ? "border-teal-200/20 bg-teal-300/[0.08] text-white"
                        : "border-transparent text-white/70 hover:border-teal-100/[0.08] hover:bg-teal-100/[0.03] hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-teal-300/50">
                      0{index + 1}
                    </span>
                    <span className="text-base font-semibold">{item.label}</span>
                  </div>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-teal-100/[0.06] pt-4">
            <Link
              href="/mindmap"
              onClick={() => setMobileOpen(false)}
              className="
                flex items-center justify-center gap-2 rounded-[16px]
                border border-emerald-200/25 bg-emerald-300/[0.08] px-4 py-3.5
                text-sm font-bold text-emerald-50 transition-colors
                hover:border-emerald-200/40 hover:bg-emerald-300/[0.14]
              "
            >
              <Workflow className="h-4 w-4" />
              <span>Open Mind Map</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-3 border-t border-teal-100/[0.06] pt-4">
            <AccountMenu variant="mobile" />
          </div>
          <div className="mt-4 flex items-center gap-2 px-2 pb-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300/65" />
            <span>Computational oncology workspace</span>
          </div>
        </div>
      </div>
    </>
  );
}

function DesktopNavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative rounded-[12px] px-3.5 py-2.5 text-xs font-semibold
        transition-colors duration-300
        ${active ? "text-white" : "text-white/55 hover:text-white/90"}
      `}
    >
      {active && (
        <div
          className="
            absolute inset-0 rounded-[12px] border border-teal-200/10 bg-teal-300/[0.035]
            transition-all duration-300
          "
        />
      )}
      <span className="relative">{label}</span>
      {active && (
        <span
          className="
            absolute -bottom-[1px] left-1/2 h-[2px] w-5 -translate-x-1/2
            rounded-full bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,.65)]
            transition-all duration-300
          "
        />
      )}
    </Link>
  );
}