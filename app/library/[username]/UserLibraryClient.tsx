"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, User, Clock, Loader2, ArrowLeft } from "lucide-react";

export type SavedPaper = {
  id: string;
  fileName: string | null;
  fileType: string | null;
  title: string | null;
  characterCount: number | null;
  createdAt: string;
  mindmap?: unknown;
};

export type UserProfile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  username: string | null;
  email?: string | null;
};

export default function UserLibraryClient({
  profile,
  initialPapers,
  username,
}: {
  profile: UserProfile;
  initialPapers: SavedPaper[];
  username: string;
}) {
  const router = useRouter();
  const [papers, setPapers] = useState<SavedPaper[]>(initialPapers);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPapers.length >= 20);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialPapers.length);
  const LIMIT = 20;

  const handlePaperClick = (paper: SavedPaper) => {
    router.push(`/mindmap/${paper.id}`);
  };

  const fetchMorePapers = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      setError(null);

      const res = await fetch(
        `/api/library/username/${username}?limit=${LIMIT}&offset=${offsetRef.current}`,
      );

      if (!res.ok) {
        throw new Error("Failed to load more papers");
      }

      const data = await res.json();
      const newPapers: SavedPaper[] = data.papers || [];

      if (newPapers.length < LIMIT) {
        setHasMore(false);
      }

      setPapers((prev) => [...prev, ...newPapers]);
      offsetRef.current += newPapers.length;
    } catch (err) {
      console.error("[UserLibrary] Fetch more error:", err);
      setError("Failed to load more papers. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, username]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          void fetchMorePapers();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchMorePapers, hasMore, loadingMore]);

  const displayName =
    profile.username ?? profile.fullName ?? username ?? "Researcher";

  return (
    <div className="relative min-h-screen bg-[#04070a]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(77,141,255,.07),transparent_62%)]"
      />

      <div className="relative z-10 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-fade-up">
          {/* BACK LINK */}
          <Link
            href="/library"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>

          {/* USER HEADER */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-full border border-teal-200/15 bg-teal-300/[0.06] flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={displayName}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-teal-300/60" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-[-0.03em] text-white">
                    {displayName}
                  </h1>
                  <span className="rounded-full border border-teal-200/15 bg-teal-300/[0.05] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-teal-200/70">
                    {papers.length} {papers.length === 1 ? "paper" : "papers"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">@{username}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200/20 bg-rose-300/[0.05] p-4 text-center text-sm text-rose-200">
              {error}
            </div>
          )}

          {papers.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              This user hasn&apos;t analyzed any public papers yet.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onClick={handlePaperClick}
                  />
                ))}
              </div>

              <div ref={sentinelRef} className="h-20" aria-hidden="true">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-300" />
                    <span className="text-sm text-slate-400">Loading more…</span>
                  </div>
                )}
                {hasMore === false && papers.length > 0 && (
                  <p className="text-center text-xs text-slate-500 py-4">
                    End of library — {papers.length} papers loaded
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaperCard({
  paper,
  onClick,
}: {
  paper: SavedPaper;
  onClick: (paper: SavedPaper) => void;
}) {
  return (
    <article
      onClick={() => onClick(paper)}
      className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-teal-100/[0.07] bg-[#0a0f14]/70 p-5 md:p-6 transition-all duration-300 hover:border-teal-200/20 hover:bg-[#10161d]/80 hover:-translate-y-0.5"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(paper);
        }
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200/15 bg-teal-300/[0.06]">
              <FileText className="h-5 w-5 text-teal-300/80" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-medium text-white">
                {paper.title ?? paper.fileName ?? "Untitled Paper"}
              </h3>
              <p className="mt-1 truncate text-sm text-slate-400">
                {paper.fileType ?? "Mind Map"} • {formatChars(paper.characterCount)} chars
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {formatDate(paper.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-teal-200/15 bg-teal-300/[0.05] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-teal-200/70">
            Open Map
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-teal-400/[0.03] to-transparent" />
    </article>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatChars(count: number | null) {
  if (!count) return "—";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
