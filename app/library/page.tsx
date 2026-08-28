"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, User, Clock, Loader2 } from "lucide-react";

type LibraryPaper = {
  id: string;
  fileName: string | null;
  fileType: string | null;
  title: string | null;
  characterCount: number | null;
  createdAt: string;
  userId: string;
  userFullName: string | null;
  userAvatarUrl: string | null;
  username: string | null;
};

type LibraryResponse = {
  papers: LibraryPaper[];
  limit: number;
  offset: number;
};

export default function LibraryPage() {
  const reduceMotion = Boolean(useReducedMotion());
  const [papers, setPapers] = useState<LibraryPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const LIMIT = 20;

  const handlePaperClick = (paper: LibraryPaper) => {
    // Open in new tab
    window.open(`/mindmap/${paper.id}`, '_blank', 'noopener,noreferrer');
  };

  const fetchPapers = async (offset: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/library?limit=${LIMIT}&offset=${offset}`,
      );
      if (!res.ok) throw new Error("Failed to fetch library");

      const data: LibraryResponse = await res.json();
      const newPapers = data.papers ?? [];

      if (append) {
        setPapers((prev) => [...prev, ...newPapers]);
      } else {
        setPapers(newPapers);
      }

      setHasMore(newPapers.length === LIMIT);
      offsetRef.current = offset + newPapers.length;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load library",
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPapers(0, false);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMore) {
          fetchPapers(offsetRef.current, true);
        }
      },
      { rootMargin: "200px", threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadingMore]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatChars = (count: number | null) => {
    if (!count) return "—";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative min-h-screen bg-[#04070a]">
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-0
          h-[520px]
          bg-[radial-gradient(ellipse_at_top,rgba(77,141,255,.07),transparent_62%)]
        "
      />

      <div className="relative z-10 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/15 bg-teal-300/[0.05] px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-200/80">
              <FileText className="h-3 w-3" />
              Research Library
            </div>

            <h1 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">
              Collective
              <span className="text-teal-300"> Knowledge</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              Explore papers analyzed by the BioLayers community. Every
              entry links to a full interactive mind map with evidence-backed
              biological mechanisms.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200/20 bg-rose-300/[0.05] p-4 text-center text-sm text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4" aria-busy="true">
              {[...Array(5)].map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No papers in the library yet. Be the first to analyze one!
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {papers.map((paper, index) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    index={index}
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
        </motion.div>
      </div>
    </div>
  );
}

function PaperCard({
  paper,
  index,
  onClick,
}: {
  paper: LibraryPaper;
  index: number;
  onClick: (paper: LibraryPaper) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(paper)}
      className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-[20px]
        border
        border-teal-100/[0.07]
        bg-[#0a0f14]/70
        p-5
        md:p-6
        transition-all
        duration-300
        hover:border-teal-200/20
        hover:bg-[#10161d]/80
        hover:-translate-y-0.5
      "
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
            <div
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl border border-teal-200/15 bg-teal-300/[0.06]
              "
            >
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
            {paper.username && (
              <Link
                href={`/library/${paper.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 hover:text-teal-300 transition-colors"
              >
                <User className="h-3 w-3" />
                @{paper.username}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-teal-200/15 bg-teal-300/[0.05] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-teal-200/70">
            Open Map
          </span>
        </div>
      </div>

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
          bg-gradient-to-r
          from-teal-400/[0.03]
          to-transparent
        "
      />
    </motion.article>
  );
}

function PaperCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-teal-100/[0.07] bg-[#0a0f14]/70 p-5 md:p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-white/[0.03] animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-white/[0.03] animate-pulse rounded" />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-4 w-24 bg-white/[0.03] animate-pulse rounded" />
        <div className="h-4 w-32 bg-white/[0.03] animate-pulse rounded" />
      </div>
    </div>
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