"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Menu,
  Workflow,
  X,
  Dna,
  Binary,
  Compass,
  BookOpen,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { AccountMenu } from "./auth/AccountMenu";

/* ---------------------------------------------------------
   SSR-safe external store subscriptions (No effect setState)
   --------------------------------------------------------- */

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getScrollSnapshot(): boolean {
  return window.scrollY > 18;
}

function getScrollServerSnapshot(): boolean {
  return false;
}

/* ---------------------------------------------------------
   Navigation Architecture (Hick's Law Chunking)
   --------------------------------------------------------- */

export type NavItem = {
  label: string;
  href: string;
  path: string;
  category: "tools" | "institutional";
  icon?: ReactNode;
  description?: string;
};

const toolNavItems: NavItem[] = [
  {
    label: "Cell Atlas",
    href: "/cells",
    path: "/cells",
    category: "tools",
    icon: <Dna className="h-4 w-4 text-teal-300" />,
    description: "Multichannel fluorescence morphology & spatial stains",
  },
  {
    label: "Cipher",
    href: "/cipher",
    path: "/cipher",
    category: "tools",
    icon: <Binary className="h-4 w-4 text-sky-300" />,
    description: "Causal oncology networks & mechanistic paths",
  },
  {
    label: "Journey",
    href: "/journey",
    path: "/journey",
    category: "tools",
    icon: <Compass className="h-4 w-4 text-violet-300" />,
    description: "Interactive oncology walkthrough & mechanisms",
  },
  {
    label: "Library",
    href: "/library",
    path: "/library",
    category: "tools",
    icon: <BookOpen className="h-4 w-4 text-amber-300" />,
    description: "Peer-reviewed papers & synthesized knowledge maps",
  },
];

const institutionalNavItems: NavItem[] = [
  { label: "About", href: "/about", path: "/about", category: "institutional" },
  { label: "Partners", href: "/partners", path: "/partners", category: "institutional" },
  { label: "Press", href: "/press", path: "/press", category: "institutional" },
];

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrollSnapshot,
    getScrollServerSnapshot,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Manage body scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on large viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Accessibility: Focus management and trap for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;

    // Focus close button on open
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const handleCloseDrawer = () => {
    setMobileOpen(false);
    hamburgerRef.current?.focus();
  };

  const isItemActive = (item: NavItem) => {
    if (item.path === "/" && pathname === "/") return true;
    if (item.path !== "/" && pathname.startsWith(item.path)) return true;
    return false;
  };

  const navBarStyle = {
    backgroundColor: scrolled
      ? "rgba(4, 7, 10, 0.94)"
      : "rgba(4, 7, 10, 0.65)",
    borderColor: scrolled
      ? "rgba(141, 178, 255, 0.16)"
      : "rgba(77, 141, 255, 0.08)",
    boxShadow: scrolled
      ? "0 22px 70px rgba(0,0,0,0.5)"
      : "0 12px 42px rgba(0,0,0,0.22)",
    transition:
      "background-color 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease",
  } as React.CSSProperties;

  const navRowHeight = scrolled ? 64 : 72;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5 sm:pt-4"
        style={{
          transition: "transform 0.4s ease-out",
        }}
      >
        <div
          style={navBarStyle}
          className="relative mx-auto max-w-[1540px] rounded-[20px] border backdrop-blur-2xl transition-[height] duration-300 ease-out"
        >
          {/* Subtle top edge glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/35 to-transparent"
          />

          <div
            className="relative flex items-center justify-between gap-3 px-4 sm:px-5 lg:gap-4 lg:px-6 transition-[height] duration-300 ease-out"
            style={{ height: navRowHeight }}
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label="BioLayers AI home"
              className="group flex shrink-0 items-center gap-3 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <div
                className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] border border-teal-200/25 bg-teal-300/[0.06] transition-transform duration-250 group-hover:scale-105"
                style={{
                  transform: scrolled ? "scale(0.95)" : "scale(1)",
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
                <div className="mt-0.5 hidden font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300/80 sm:block">
                  Computational oncology
                </div>
              </div>
            </Link>

            {/* Desktop Navigation (Hick's Law Structure: Primary Tools + Divider + Institutional Links) */}
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-1 xl:gap-1.5 lg:flex"
            >
              {/* Primary Computational Tools */}
              <div className="flex items-center gap-1">
                {toolNavItems.map((item) => {
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
              </div>

              {/* Cognitive separator */}
              <span
                aria-hidden="true"
                className="mx-1.5 h-4 w-px bg-white/15"
              />

              {/* Institutional / Background Links */}
              <div className="flex items-center gap-1">
                {institutionalNavItems.map((item) => {
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
              </div>
            </nav>

            {/* Desktop Actions: Primary Mind Map CTA + Account Menu */}
            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Link
                href="/mindmap"
                className="group relative flex h-10 items-center gap-2 rounded-[13px] border border-emerald-400/40 bg-emerald-500/15 px-4 text-xs font-bold text-emerald-200 shadow-[0_0_20px_rgba(43,255,136,0.18)] transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-500/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
              >
                <Workflow className="h-3.5 w-3.5 text-emerald-300 transition-transform duration-300 group-hover:rotate-12" />
                <span>Mind Map</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <AccountMenu variant="desktop" />
            </div>

            {/* Mobile Hamburger Trigger (>= 44px x 44px touch target) */}
            <button
              ref={hamburgerRef}
              type="button"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-dialog"
              onClick={() => setMobileOpen((c) => !c)}
              className="flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-[13px] border border-teal-100/[0.12] bg-white/[0.04] text-white/80 transition-colors hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a] lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer Dialog with Focus Trap & Inert Support */}
      <div
        id="mobile-navigation-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
        ref={drawerRef}
        inert={!mobileOpen ? true : undefined}
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[90] overflow-y-auto bg-[#04070a]/96 px-4 pb-10 pt-[88px] backdrop-blur-2xl lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          transition: `opacity ${reduceMotion ? 0 : 0.25}s ease-out`,
        }}
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-[600px] -translate-x-1/2 rounded-full bg-teal-400/[0.065] blur-[140px]"
        />

        <div
          className="relative mx-auto max-w-xl rounded-[26px] border border-teal-100/[0.12] bg-[#0a0f14]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          style={{
            transform: mobileOpen || reduceMotion ? "translateY(0)" : "translateY(-12px)",
            transition: `transform ${reduceMotion ? 0 : 0.3}s ease-out`,
          }}
        >
          {/* Mobile Drawer Header with Close Button */}
          <div className="mb-4 flex items-center justify-between border-b border-teal-100/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
                Navigation Menu
              </span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close navigation menu"
              onClick={handleCloseDrawer}
              className="flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-[12px] border border-teal-100/[0.1] bg-white/[0.03] text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Primary Action: Mind Map Workspace CTA */}
          <div className="mb-5">
            <Link
              href="/mindmap"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[48px] items-center justify-center gap-2.5 rounded-[14px] border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-100 shadow-[0_0_24px_rgba(43,255,136,0.2)] transition-all hover:bg-emerald-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
            >
              <Workflow className="h-4 w-4 text-emerald-300" />
              <span>Open Mind Map Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Section 1: Computational Explorers */}
          <div className="space-y-1">
            <div className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Computational Explorers
            </div>
            {toolNavItems.map((item, index) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[44px] items-center justify-between rounded-[14px] border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a] ${
                    active
                      ? "border-teal-300/30 bg-teal-400/[0.12] text-white"
                      : "border-transparent text-slate-200 hover:border-teal-100/[0.1] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-teal-200/15 bg-white/[0.03]">
                      {item.icon}
                    </span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  {active ? (
                    <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,0.9)]" />
                  ) : (
                    <span className="font-mono text-[10px] text-slate-500">
                      0{index + 1}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Section 2: Institutional & Overview */}
          <div className="mt-4 space-y-1 border-t border-teal-100/[0.08] pt-3">
            <div className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Institutional &amp; Labs
            </div>
            {institutionalNavItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[44px] items-center justify-between rounded-[14px] border px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a] ${
                    active
                      ? "border-teal-300/30 bg-teal-400/[0.12] text-white"
                      : "border-transparent text-slate-300 hover:border-teal-100/[0.1] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,0.9)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Account Section */}
          <div className="mt-5 border-t border-teal-100/[0.08] pt-4">
            <AccountMenu variant="mobile" />
          </div>

          {/* Footer note inside drawer */}
          <div className="mt-4 flex items-center justify-between px-2 pt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">
            <span>BioLayers AI v2.4</span>
            <span>PubMed &amp; OLS Connected</span>
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
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-[38px] items-center rounded-[12px] px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a] ${
        active
          ? "text-white"
          : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {active && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[12px] border border-teal-200/20 bg-teal-300/[0.07] shadow-[0_0_12px_rgba(77,141,255,0.12)]"
        />
      )}
      <span className="relative z-10">{label}</span>
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-[2px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(77,141,255,0.8)]"
        />
      )}
    </Link>
  );
}