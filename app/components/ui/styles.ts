/*
  Shared class strings for the BioLayers dark-field glass design.
  Emerald (FITC) glow marks the primary action; blue (DAPI) is structure.
*/

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]";

export const btnPrimary = `inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[16px] border-2 border-emerald-400/50 bg-emerald-400/15 px-6 py-3 text-sm font-bold text-emerald-100 shadow-[0_0_30px_rgba(43,255,136,0.22)] backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-200 hover:scale-[1.02] hover:border-emerald-300 hover:bg-emerald-400/25 hover:text-white hover:shadow-[0_0_45px_rgba(43,255,136,0.38)] active:scale-[0.98] disabled:opacity-60 ${focusRing}`;

export const btnSecondary = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-sky-400/25 bg-sky-400/[0.06] px-4 py-2 text-sm font-semibold text-sky-100 transition-[background-color,border-color,color] duration-150 hover:border-sky-300/40 hover:bg-sky-400/[0.12] hover:text-white disabled:opacity-60 ${focusRing}`;

export const btnQuiet = `inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white ${focusRing}`;

export const textLink = `font-semibold text-teal-300 transition-colors hover:text-teal-100 ${focusRing} rounded-sm`;

export const panel =
  "rounded-[24px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl";

export const insetPanel = "rounded-[14px] border border-white/[0.06] bg-white/[0.02]";

export const monoLabel = "font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400";

export const sectionLabel = "font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-teal-300/80";

export const gradientText =
  "bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent";

export const pageShell = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export const pageTop = "pt-28 pb-24 sm:pt-32";

export const fieldInput =
  "min-h-[46px] w-full rounded-[14px] border border-teal-500/25 bg-[#070e1a]/90 px-3.5 text-sm text-slate-100 placeholder-slate-400 shadow-inner transition-[border-color,box-shadow] focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50";
