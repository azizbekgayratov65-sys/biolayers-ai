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
  userNotFound = false,
}: {
  profile: UserProfile;
  initialPapers: SavedPaper[];
  username: string;
  userNotFound?: boolean;
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
    <div className="relative isolate min-h-screen bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(77,141,255,.07),transparent_62%)]"
      />

      <div className="relative z-10 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-fade-up">
          {/* BACK LINK */}
          <Link
            href="/library"
            className="mb-8 inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Public Library
          </Link>

          {/* USER HEADER */}
          <div className="mb-10 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 rounded-full border border-emerald-500/30 bg-emerald-950/40 flex items-center justify-center overflow-hidden shadow-inner">
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
                  <User className="h-10 w-10 text-emerald-400/80" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white truncate">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <span className="tabular-nums font-bold mr-1">{papers.length}</span> {papers.length === 1 ? "Paper" : "Papers"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-mono text-slate-400">@{username}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-center text-sm text-rose-200">
              {error}
            </div>
          )}

          {userNotFound ? (
            <div className="py-16 text-center rounded-2xl border border-slate-800/60 bg-slate-900/30 p-8">
              <p className="text-base text-slate-300">Researcher @{username} was not found.</p>
              <div className="mt-4">
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 min-h-[44px] rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Browse Public Papers
                </Link>
              </div>
            </div>
          ) : papers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 rounded-2xl border border-slate-800/50 bg-slate-900/20 p-8">
              This researcher has not published any public mind maps yet.
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
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                    <span className="text-sm text-slate-400">Loading more…</span>
                  </div>
                )}
                {hasMore === false && papers.length > 0 && (
                  <p className="text-center text-xs text-slate-500 py-4 tabular-nums">
                    End of library • {papers.length} papers loaded
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
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-md p-5 md:p-6 transition-all duration-200 hover:border-emerald-500/30 hover:bg-slate-900/90 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      role="button"
      tabIndex={0}
      aria-label={`Open mind map for ${paper.title ?? paper.fileName ?? "Untitled Paper"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(paper);
        }
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base md:text-lg font-serif font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
                {paper.title ?? paper.fileName ?? "Untitled Paper"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                <span className="font-medium text-slate-300">{paper.fileType ?? "Mind Map"}</span> • <span className="tabular-nums font-mono">{formatChars(paper.characterCount)}</span> chars
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-mono tabular-nums">
              <Clock className="h-3 w-3 text-slate-400" />
              {formatDate(paper.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center shrink-0 self-end md:self-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 transition-all">
            Open Map
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-emerald-500/[0.04] to-transparent" />
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
