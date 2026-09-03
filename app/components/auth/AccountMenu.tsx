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

function initialsOf(
  name: string | null,
  email: string | null,
): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (
        parts[0][0] + parts[1][0]
      ).toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() ?? "U";
  }
  return (email?.[0] ?? "U").toUpperCase();
}

/*
  Account menu for the navbar. Shows an avatar/name dropdown for
  authenticated users, or Sign In / Get Started buttons otherwise.
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
      const rect =
        buttonRef.current?.getBoundingClientRect();

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
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
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
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

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
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.03]">
        <Loader2 className="h-4 w-4 animate-spin text-white/40" />
      </div>
    );
  }

  if (!user) {
    if (variant === "mobile") {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/login"
            className="flex h-11 items-center justify-center gap-2 rounded-[16px] border border-white/[0.1] bg-white/[0.03] px-4 text-sm font-semibold text-white/75 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>

          <Link
            href="/signup"
            className="flex h-11 items-center justify-center gap-2 rounded-[16px] border border-teal-200/20 bg-teal-300/[0.07] px-4 text-sm font-bold text-teal-50 transition hover:border-teal-200/35 hover:bg-teal-300/[0.11]"
          >
            <UserPlus className="h-4 w-4" />
            Get Started
          </Link>
        </div>
      );
    }

    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/login"
          className="flex h-10 items-center gap-2 rounded-[13px] border border-white/[0.08] bg-white/[0.025] px-4 text-xs font-semibold text-white/70 transition hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-white"
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign In
        </Link>

        <Link
          href="/signup"
          className="group flex h-10 items-center gap-2 rounded-[13px] border border-teal-200/20 bg-teal-300/[0.07] px-4 text-xs font-bold text-teal-50 transition hover:border-teal-200/35 hover:bg-teal-300/[0.11]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Get Started
        </Link>
      </div>
    );
  }

  const displayName = user.fullName || "BioLayers user";

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group flex h-10 items-center gap-2 rounded-[13px] border border-white/[0.09] bg-white/[0.03] py-1 pl-1 pr-3 transition hover:border-white/[0.18] hover:bg-white/[0.05]"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-[10px] object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-teal-300/[0.09] text-[11px] font-bold text-teal-100">
            {initialsOf(user.fullName, user.email)}
          </span>
        )}

        <span className="hidden max-w-[140px] truncate text-xs font-semibold text-white/80 xl:block">
          {displayName}
        </span>
      </button>

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            style={{
              position: "fixed",
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 9999,
            }}
            className="w-72 overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#08131c]/95 shadow-[0_30px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl"
          >
          <div className="border-b border-white/[0.06] px-4 py-4">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-11 w-11 rounded-[14px] object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-teal-300/[0.09] text-sm font-bold text-teal-100">
                  {initialsOf(user.fullName, user.email)}
                </span>
              )}

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {displayName}
                </div>
                <div className="truncate text-xs text-white/40">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <MenuItem
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Account & Settings"
            />
            <MenuItem
              href="/settings#ai"
              icon={<KeyRound className="h-4 w-4" />}
              label="AI Settings"
            />
          </div>

          <div className="border-t border-white/[0.06] p-2">
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
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
      className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
    >
      <span className="text-white/45">{icon}</span>
      {label}
    </Link>
  );
}