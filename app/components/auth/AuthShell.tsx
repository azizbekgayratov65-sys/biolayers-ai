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
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-teal-400/[0.05] blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 h-[300px] w-[400px] rounded-full bg-sky-400/[0.04] blur-[140px]"
      />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#070b10]/85 p-6 shadow-[0_30px_100px_rgba(0,0,0,.4)] backdrop-blur-2xl sm:p-8">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-[15px] border border-teal-200/20 bg-teal-300/[0.06]"
            >
              <span className="text-xs font-black tracking-[0.08em] text-teal-50">
                BL
              </span>
            </Link>

            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-teal-300/50">
              {eyebrow}
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/45">
              {description}
            </p>
          </div>

          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-white/45">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}