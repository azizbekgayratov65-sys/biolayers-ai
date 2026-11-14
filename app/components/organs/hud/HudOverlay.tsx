/*
  Holographic heads-up display drawn over a 3D viewer: glowing corner
  brackets, a sweeping scan line, a slowly turning reticle and mono readouts.
  Purely decorative, so it never takes pointer events.
*/

type Props = {
  /* Readout lines, top left. */
  lines: string[];
  /* Readout lines, bottom right. */
  footer?: string[];
};

const corner = "absolute h-6 w-6 border-cyan-300/70 shadow-[0_0_12px_rgba(0,245,212,0.45)]";

export default function HudOverlay({ lines, footer = [] }: Props) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className={`${corner} left-2 top-2 border-l-2 border-t-2`} />
      <span className={`${corner} right-2 top-2 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-2 left-2 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-2 right-2 border-b-2 border-r-2`} />

      <div className="hud-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent shadow-[0_0_10px_rgba(0,245,212,0.6)]" />

      <svg className="hud-spin absolute left-1/2 top-1/2 h-[min(70%,420px)] w-[min(70%,420px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="#00f5d4" strokeWidth="0.6" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="#4f7dff" strokeWidth="0.4" strokeDasharray="30 12 4 12" />
        {Array.from({ length: 36 }, (_, k) => {
          const a = (k * Math.PI * 2) / 36;
          const r0 = k % 3 === 0 ? 89 : 92;
          return (
            <line
              key={k}
              x1={100 + Math.cos(a) * r0}
              y1={100 + Math.sin(a) * r0}
              x2={100 + Math.cos(a) * 96}
              y2={100 + Math.sin(a) * 96}
              stroke="#00f5d4"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>

      {lines.length > 0 && (
        <div className="absolute bottom-14 left-4 font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-cyan-200/70">
          {lines.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      )}
      {footer.length > 0 && (
        <div className="absolute bottom-4 right-10 text-right font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-cyan-200/60">
          {footer.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
