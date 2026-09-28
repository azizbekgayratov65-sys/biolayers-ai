"use client";

import {
  ArrowUpRight,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type SavedPaperListItem = {
  id: string;
  fileName: string | null;
  fileType: string | null;
  title: string | null;
  characterCount: number | null;
  createdAt: string;
};

/*
  Lists the papers the user has summarized. Deletion is sent to a
  dedicated endpoint so ownership is checked server-side.
*/
export function SavedPapersPanel({
  papers: initialPapers,
}: {
  papers: SavedPaperListItem[];
}) {
  const [papers, setPapers] =
    useState<SavedPaperListItem[]>(initialPapers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const removePaper = async (id: string) => {
    setBusyId(id);
    setError(null);

    try {
      const response = await fetch(
        `/api/papers/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setError(
          data.error || "Could not delete this paper.",
        );
        return;
      }

      setPapers((current) =>
        current.filter((paper) => paper.id !== id),
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
      <div className="border-b border-slate-800/70 px-6 py-5">
        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
          Personal Archive
        </div>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-serif font-bold tracking-tight text-white">
          <FileText className="h-5 w-5 text-emerald-400" />
          Summarized Papers
        </h2>
      </div>

      <div className="max-h-[560px] overflow-y-auto px-4 py-4">
        {error && (
          <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3.5 py-2.5 text-xs leading-relaxed text-rose-200">
            {error}
          </div>
        )}

        {papers.length === 0 ? (
          <div className="px-4 py-12 text-center text-xs leading-relaxed text-slate-400">
            No papers summarized yet. Generate a mind map from the{" "}
            <Link href="/mindmap" className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              Mind Map
            </Link>{" "}
            workspace and it will appear here.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="group relative rounded-xl border border-slate-800/80 bg-slate-950/50 transition-all hover:border-emerald-500/30 hover:bg-slate-900/80"
              >
                <Link
                  href={`/mindmap/${paper.id}`}
                  className="flex items-start justify-between gap-3 p-4 pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-serif font-semibold text-slate-100 transition group-hover:text-emerald-300">
                        {paper.title ||
                          paper.fileName ||
                          "Untitled paper"}
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-400/0 transition group-hover:text-emerald-400" />
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-slate-400 tabular-nums">
                      <span className="font-semibold text-slate-300 uppercase">{paper.fileType ?? "Document"}</span> ·{" "}
                      {paper.characterCount
                        ? `${paper.characterCount.toLocaleString()} chars`
                        : "—"}{" "}
                      ·{" "}
                      {paper.createdAt
                        ? new Date(paper.createdAt).toLocaleDateString()
                        : ""}
                    </div>
                    <div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400/0 transition group-hover:text-emerald-400">
                      Open Mind Map →
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => void removePaper(paper.id)}
                  disabled={busyId === paper.id}
                  aria-label={`Delete ${paper.title || paper.fileName || "paper"}`}
                  className="absolute right-3 top-3 flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  {busyId === paper.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}