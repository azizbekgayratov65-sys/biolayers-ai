const nodes = [
  { name: "CAFs", position: "left-[42%] top-[12%]", type: "cell" },
  { name: "CXCL12", position: "left-[12%] top-[44%]", type: "protein" },
  { name: "TGF-β", position: "right-[10%] top-[40%]", type: "protein" },
  { name: "Bone niche", position: "left-[34%] bottom-[12%]", type: "process" },
];

const nodeStyles = {
  cell: "border-teal-300 bg-teal-50 text-teal-950",
  protein: "border-violet-300 bg-violet-50 text-violet-950",
  process: "border-blue-300 bg-blue-50 text-blue-950",
};

export default function DemoGraph() {
  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.10),transparent_55%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 460"
        aria-hidden="true"
      >
        <line x1="300" y1="95" x2="130" y2="225" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="300" y1="95" x2="470" y2="210" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="130" y1="225" x2="280" y2="380" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="470" y1="210" x2="280" y2="380" stroke="#cbd5e1" strokeWidth="2" />
      </svg>

      <div className="absolute left-5 top-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Live knowledge map
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Click, zoom, and explore every connection.
        </p>
      </div>

      {nodes.map((node) => (
        <div
          key={node.name}
          className={`absolute ${node.position} rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm ${
            nodeStyles[node.type as keyof typeof nodeStyles]
          }`}
        >
          {node.name}
        </div>
      ))}

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Source: simulated cancer biology paragraph
      </div>
    </div>
  );
}