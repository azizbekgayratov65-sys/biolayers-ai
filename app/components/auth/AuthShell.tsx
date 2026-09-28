import Link from "next/link";
import type { ReactNode } from "react";

/*
  Shared shell for the authentication pages (login / signup / reset).
  Matches the BioLayers dark glassmorphism design system.
*/
export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24 sm:px-6">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-emerald-500/[0.04] blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 h-[300px] w-[400px] rounded-full bg-sky-500/[0.03] blur-[140px]"
      />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono font-bold text-sm tracking-wider hover:bg-emerald-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              BL
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {eyebrow}
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </div>

          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}