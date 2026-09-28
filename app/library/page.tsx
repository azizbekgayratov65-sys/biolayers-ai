"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    // Navigate in same tab
    router.push(`/mindmap/${paper.id}`);
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
    <div className="relative isolate min-h-screen bg-transparent">
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.06] px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-200/90 shadow-[0_0_15px_rgba(77,141,255,0.1)]">
              <FileText className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
              Research Library
            </div>

            <h1 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Collective{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                Knowledge
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300/85">
              Explore papers analyzed by the BioLayers community. Every
              entry links to a full interactive mind map with evidence-backed
              biological mechanisms.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-[16px] border border-rose-200/25 bg-rose-400/[0.08] p-4 text-center text-sm font-semibold text-rose-200 shadow-sm" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4" aria-busy="true" aria-label="Loading library papers">
              {[...Array(5)].map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
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
                  <div className="flex items-center justify-center gap-2 py-8" role="status" aria-live="polite">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-300" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-300">Loading more…</span>
                  </div>
                )}
                {hasMore === false && papers.length > 0 && (
                  <p className="text-center font-mono text-[11px] text-slate-400 py-6">
                    End of library · {papers.length}&nbsp;papers loaded
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
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(paper)}
      style={{ touchAction: "manipulation" }}
      className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-[20px]
        border
        border-teal-100/[0.09]
        bg-[#0a0f16]/80
        backdrop-blur-xl
        p-5
        md:p-6
        transition-[transform,border-color,background-color,box-shadow]
        duration-200
        hover:border-teal-200/30
        hover:bg-[#101822]/90
        hover:-translate-y-0.5
        hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-teal-400
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[#04070a]
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
          <div className="flex items-center gap-3.5">
            <div
              className="
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-[12px] border border-teal-200/20 bg-teal-300/[0.08]
                shadow-[0_0_15px_rgba(77,141,255,0.08)]
              "
            >
              <FileText className="h-5 w-5 text-teal-300" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-white group-hover:text-teal-100 transition-colors">
                {paper.title ?? paper.fileName ?? "Untitled Paper"}
              </h3>
              <p className="mt-1 truncate font-mono text-xs text-slate-300 tabular-nums">
                {paper.fileType ?? "Mind Map"} · {formatChars(paper.characterCount)}&nbsp;chars
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {formatDate(paper.createdAt)}
            </span>
            {paper.username && (
              <Link
                href={`/library/${paper.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 font-semibold text-slate-300 hover:text-teal-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
              >
                <User className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                @{paper.username}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-teal-200/20 bg-teal-300/[0.08] px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">
            Open Map
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
          bg-gradient-to-r
          from-teal-400/[0.04]
          to-transparent
        "
      />
    </motion.article>
  );
}

function PaperCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-teal-100/[0.08] bg-[#0a0f16]/75 p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 shrink-0 rounded-[12px] bg-white/[0.05] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 bg-white/[0.05] animate-pulse rounded-[6px]" />
          <div className="h-3.5 w-1/3 bg-white/[0.05] animate-pulse rounded-[6px]" />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-3.5 w-24 bg-white/[0.05] animate-pulse rounded-[6px]" />
        <div className="h-3.5 w-28 bg-white/[0.05] animate-pulse rounded-[6px]" />
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