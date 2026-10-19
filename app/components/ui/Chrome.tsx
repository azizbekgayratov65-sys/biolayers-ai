import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* Soft dark-field glow behind a page section. Purely decorative. */
export function AmbientGlow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-20 h-[550px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.045] blur-[170px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/2 -z-20 h-[450px] w-[450px] rounded-full bg-sky-400/[0.035] blur-[150px]"
      />
    </>
  );
}

/* Small glowing pill above a page title. */
export function Eyebrow({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/25 bg-teal-300/[0.06] px-4 py-1.5 shadow-[0_0_20px_rgba(43,255,136,0.08)] backdrop-blur-xl">
      {Icon && <Icon className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />}
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-100/90">
        {children}
      </span>
    </div>
  );
}
