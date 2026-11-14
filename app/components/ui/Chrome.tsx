import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* Decorative glow removed: the site is plain black. Kept as a no-op so pages need no edits. */
export function AmbientGlow() {
  return null;
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
