const nodes = [
  { name: "CAFs", position: "left-[42%] top-[12%]", type: "cell" },
  { name: "CXCL12", position: "left-[12%] top-[44%]", type: "protein" },
  { name: "TGF-β", position: "right-[10%] top-[40%]", type: "protein" },
  { name: "Bone niche", position: "left-[34%] bottom-[12%]", type: "process" },
];

const nodeStyles = {
  cell: "border-teal-300/40 bg-teal-400/[0.10] text-teal-100",
  protein: "border-cyan-300/40 bg-cyan-400/[0.10] text-cyan-100",
  process: "border-sky-300/40 bg-sky-400/[0.10] text-sky-100",
};

const edgeStyles: Record<string, string> = {
  "0": "#8db2ff",
  "1": "#ff3b5c",
  "2": "#ffc53d",
  "3": "#2bff88",
};

export default function DemoGraph() {
  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-[24px] border border-teal-100/[0.09] bg-[#05080d] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(141,178,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(141,178,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,141,255,0.07),transparent_55%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 460"
        aria-hidden="true"
      >
        <line x1="300" y1="95" x2="130" y2="225" stroke={edgeStyles["0"]} strokeWidth="1.5" strokeDasharray="4 8" />
        <line x1="300" y1="95" x2="470" y2="210" stroke={edgeStyles["1"]} strokeWidth="1.5" strokeDasharray="5 10" />
        <line x1="130" y1="225" x2="280" y2="380" stroke={edgeStyles["2"]} strokeWidth="1.5" strokeDasharray="6 10" />
        <line x1="470" y1="210" x2="280" y2="380" stroke={edgeStyles["3"]} strokeWidth="1.5" strokeDasharray="2 9" />
      </svg>

      <div className="absolute left-5 top-5">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-teal-300/60">
          CH·GRAPH · λ488nm
        </p>
        <p className="mt-1.5 text-sm text-slate-400">
          Click, zoom, and explore every connection.
        </p>
      </div>

      {nodes.map((node) => (
        <div
          key={node.name}
          className={`absolute ${node.position} rounded-2xl border px-5 py-3 text-sm font-semibold backdrop-blur-sm ${
            nodeStyles[node.type as keyof typeof nodeStyles]
          }`}
        >
          {node.name}
        </div>
      ))}

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-teal-100/[0.07] bg-[#0a0f14]/80 px-4 py-3 font-mono text-[10px] tracking-[0.12em] text-slate-500">
        Source: simulated cancer biology paragraph
      </div>
    </div>
  );
}