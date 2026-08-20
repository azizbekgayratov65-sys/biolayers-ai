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
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#070b10]/80 backdrop-blur-xl">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
          Your library
        </div>
        <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-white">
          <FileText className="h-4 w-4 text-teal-300/70" />
          Summarized papers
        </h2>
      </div>

      <div className="max-h-[560px] overflow-y-auto px-3 py-3">
        {error && (
          <div className="mb-3 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-rose-200/80">
            {error}
          </div>
        )}

        {papers.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs leading-relaxed text-white/40">
            No papers summarized yet. Generate a mind map from the{" "}
            <span className="text-teal-200/70">Mind Map</span> page and
            it will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="group relative rounded-[16px] border border-white/[0.06] bg-white/[0.02] transition hover:border-teal-200/15 hover:bg-white/[0.04]"
              >
                <Link
                  href={`/mindmap/${paper.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0 flex-1 pr-9">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-white/85 transition group-hover:text-teal-100">
                        {paper.title ||
                          paper.fileName ||
                          "Untitled paper"}
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-teal-300/0 transition group-hover:text-teal-300/80" />
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                      {paper.fileType ?? "Document"} ·{" "}
                      {paper.characterCount
                        ? `${paper.characterCount.toLocaleString()} chars`
                        : "—"}{" "}
                      ·{" "}
                      {paper.createdAt
                        ? new Date(paper.createdAt).toLocaleDateString()
                        : ""}
                    </div>
                    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-300/0 transition group-hover:text-teal-300/60">
                      Open mind map
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => void removePaper(paper.id)}
                  disabled={busyId === paper.id}
                  aria-label="Delete paper"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[10px] border border-rose-300/12 bg-rose-400/[0.04] text-rose-200/60 transition hover:border-rose-300/30 hover:bg-rose-400/[0.1] hover:text-rose-200 disabled:opacity-50"
                >
                  {busyId === paper.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
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