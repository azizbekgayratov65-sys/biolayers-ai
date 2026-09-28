"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Settings,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { createClient } from "../../lib/supabase/client";

type SessionUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
} | null;

function initialsOf(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() ?? "U";
  }
  return (email?.[0] ?? "U").toUpperCase();
}

/*
  Account menu for the navbar. Shows an avatar/name dropdown for
  authenticated users on desktop, or an integrated inline profile
  card inside the mobile drawer.
*/
export function AccountMenu({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setMenuPos(null);
  }

  const toggleMenu = () => {
    if (!open) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPos({
          top: rect.bottom + 10,
          right: window.innerWidth - rect.right,
        });
      }
    }
    setOpen((current) => !current);
  };

  useEffect(() => {
    const supabase = createClient();

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
              fullName:
                (session.user.user_metadata?.full_name as string | undefined) ??
                (session.user.user_metadata?.name as string | undefined) ??
                null,
              avatarUrl:
                (session.user.user_metadata?.avatar_url as string | undefined) ??
                null,
            }
          : null,
      );
      setLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
              fullName:
                (session.user.user_metadata?.full_name as string | undefined) ??
                (session.user.user_metadata?.name as string | undefined) ??
                null,
              avatarUrl:
                (session.user.user_metadata?.avatar_url as string | undefined) ??
                null,
            }
          : null,
      );
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setMenuPos(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMenuPos(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const signOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading || signingOut) {
    if (variant === "mobile") {
      return (
        <div className="flex min-h-[48px] items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.03]">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.03]">
        <Loader2 className="h-4 w-4 animate-spin text-white/40" />
      </div>
    );
  }

  // Unauthenticated user state
  if (!user) {
    if (variant === "mobile") {
      return (
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/login"
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/signup"
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-400/[0.1] px-4 py-2.5 text-xs font-bold text-teal-100 shadow-[0_0_15px_rgba(77,141,255,0.12)] transition hover:border-teal-200/40 hover:bg-teal-400/[0.18] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Get Started</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/login"
          className="flex h-10 items-center gap-2 rounded-[13px] border border-white/[0.09] bg-white/[0.03] px-4 text-xs font-semibold text-slate-200 transition hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Sign In</span>
        </Link>

        <Link
          href="/signup"
          className="group flex h-10 items-center gap-2 rounded-[13px] border border-teal-200/25 bg-teal-300/[0.08] px-4 text-xs font-bold text-teal-100 transition hover:border-teal-200/40 hover:bg-teal-300/[0.16] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Get Started</span>
        </Link>
      </div>
    );
  }

  const displayName = user.fullName || "BioLayers Researcher";

  // Authenticated state — Mobile drawer view (Inline Card)
  if (variant === "mobile") {
    return (
      <div className="rounded-[18px] border border-teal-200/15 bg-white/[0.025] p-3.5 shadow-lg">
        {/* User Identity Header */}
        <div className="flex items-center gap-3 border-b border-teal-100/[0.08] pb-3">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-[12px] border border-teal-200/25 object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-teal-200/25 bg-teal-300/[0.12] text-sm font-bold text-teal-100">
              {initialsOf(user.fullName, user.email)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-white">
              {displayName}
            </div>
            <div className="truncate font-mono text-[11px] text-slate-400">
              {user.email}
            </div>
          </div>
        </div>

        {/* Inline Navigation Links (>= 44px touch targets) */}
        <div className="mt-2 space-y-1">
          <Link
            href="/settings"
            className="flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
          >
            <Settings className="h-4 w-4 text-teal-300/80" />
            <span>Account &amp; Profile Settings</span>
          </Link>

          <Link
            href="/settings#ai"
            className="flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
          >
            <KeyRound className="h-4 w-4 text-teal-300/80" />
            <span>AI BYOK Key Settings</span>
          </Link>

          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-[12px] border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-xs font-semibold text-rose-300 transition hover:border-rose-500/35 hover:bg-rose-500/[0.12] hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a] disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state — Desktop view (Button + Portal Dropdown)
  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        className="group flex h-10 items-center gap-2 rounded-[13px] border border-white/[0.1] bg-white/[0.03] py-1 pl-1 pr-3 transition hover:border-white/[0.2] hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-[9px] object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-teal-300/[0.1] text-[11px] font-bold text-teal-100">
            {initialsOf(user.fullName, user.email)}
          </span>
        )}

        <span className="hidden max-w-[140px] truncate text-xs font-semibold text-slate-200 xl:block">
          {displayName}
        </span>
      </button>

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            aria-label="Account options"
            style={{
              position: "fixed",
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 9999,
            }}
            className="w-72 overflow-hidden rounded-[20px] border border-teal-200/15 bg-[#08131c]/95 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            {/* User Profile Header */}
            <div className="border-b border-white/[0.06] px-4 py-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-11 w-11 rounded-[12px] border border-teal-200/20 object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-teal-200/20 bg-teal-300/[0.1] text-sm font-bold text-teal-100">
                    {initialsOf(user.fullName, user.email)}
                  </span>
                )}

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </div>
                  <div className="truncate font-mono text-xs text-slate-400">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-0.5">
              <MenuItem
                href="/settings"
                icon={<Settings className="h-4 w-4" />}
                label="Account & Settings"
              />
              <MenuItem
                href="/settings#ai"
                icon={<KeyRound className="h-4 w-4" />}
                label="AI Key Settings"
              />
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-white/[0.06] p-2">
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={signingOut}
                className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a] disabled:opacity-60"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 text-rose-400" />
                )}
                <span>Sign Out</span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex min-h-[40px] items-center gap-3 rounded-[12px] px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
    >
      <span className="text-teal-300/70">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}