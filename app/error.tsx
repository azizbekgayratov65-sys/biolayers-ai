"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#06111a] px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto h-12 w-12 rounded-full border border-rose-400/20 bg-rose-400/10 p-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-rose-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-100">Something went wrong</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-[12px] border border-teal-200/25 bg-teal-300/[0.08] px-5 py-2.5 text-sm font-semibold text-teal-50 transition hover:border-teal-200/40 hover:bg-teal-300/[0.14]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
