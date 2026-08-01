export default function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          BL
        </div>

        <div>
          <p className="font-semibold tracking-tight">BioLayers AI</p>
          <p className="text-xs text-slate-500">
            Cancer knowledge, connected.
          </p>
        </div>
      </div>

      <button className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium transition hover:border-slate-950 hover:bg-slate-950 hover:text-white">
        GitHub
      </button>
    </nav>
  );
}