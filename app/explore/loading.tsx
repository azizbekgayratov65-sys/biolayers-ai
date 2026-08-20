export default function ExploreLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#04070a]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-300/30 border-t-teal-300" />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-teal-300/40">
          Loading Workspace
        </span>
      </div>
    </div>
  );
}
