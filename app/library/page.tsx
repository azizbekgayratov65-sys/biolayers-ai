"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";

import { btnPrimary, btnSecondary, pageShell, textLink } from "../components/ui/styles";
import { AmbientGlow, Eyebrow } from "../components/ui/Chrome";

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

const LIMIT = 20;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function LibraryPage() {
  const [papers, setPapers] = useState<LibraryPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  // Callers set loading or loadingMore before calling, so the initial
  // effect never sets state synchronously.
  const fetchPapers = useCallback(async (offset: number, append: boolean) => {
    try {
      const response = await fetch(`/api/library?limit=${LIMIT}&offset=${offset}`);
      if (!response.ok) throw new Error("request failed");

      const data: LibraryResponse = await response.json();
      const page = data.papers ?? [];

      setPapers((current) => (append ? [...current, ...page] : page));
      setHasMore(page.length === LIMIT);
      setError(null);
      offsetRef.current = offset + page.length;
    } catch {
      setError("The library could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load: state is only set in promise callbacks, never synchronously.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/library?limit=${LIMIT}&offset=0`)
      .then((response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json() as Promise<LibraryResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        const page = data.papers ?? [];
        setPapers(page);
        setHasMore(page.length === LIMIT);
        offsetRef.current = page.length;
      })
      .catch(() => {
        if (!cancelled) setError("The library could not be loaded. Check your connection and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !error) {
          setLoadingMore(true);
          void fetchPapers(offsetRef.current, true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, error, fetchPapers, papers.length]);

  return (
    <div className={`relative isolate ${pageShell} max-w-4xl pt-28 pb-24 sm:pt-32`}>
      <AmbientGlow />
      <header className="mx-auto max-w-3xl text-center animate-fade-up">
        <Eyebrow icon={FileText}>Research Library</Eyebrow>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">Library</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink">
          Mind maps saved by BioLayers users, newest first. Each one links every mechanism to the
          sentence in the paper it came from.
        </p>
      </header>

      {error && (
        <div role="alert" className="mt-10 rounded-[20px] border border-stain-rfp/35 bg-stain-rfp/[0.07] p-4">
          <p className="text-ink">{error}</p>
          <button
            type="button"
            onClick={() => {
              const append = papers.length > 0;
              setError(null);
              if (append) setLoadingMore(true);
              else setLoading(true);
              void fetchPapers(append ? offsetRef.current : 0, append);
            }}
            className={`${btnSecondary} mt-3`}
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <ul className="mt-10 divide-y divide-rule border-y border-rule" aria-busy="true" aria-label="Loading the library">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="py-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-white/[0.04]" />
            </li>
          ))}
        </ul>
      ) : papers.length === 0 && !error ? (
        <div className="mt-10 rounded-[20px] border border-rule px-6 py-14 text-center">
          <p className="text-xl text-ink-strong">No mind maps yet</p>
          <p className="mt-2 text-graphite">Map a paper and it will be the first one here.</p>
          <Link href="/mindmap" className={`${btnPrimary} mt-6`}>
            Map a paper
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-rule border-y border-rule">
            {papers.map((paper) => (
              <li key={paper.id} className="relative py-6">
                <h2 className="font-sans text-lg font-semibold leading-snug text-ink-strong">
                  <Link
                    href={`/mindmap/${paper.id}`}
                    className="transition-colors after:absolute after:inset-0 hover:text-hoechst-strong"
                  >
                    {paper.title ?? paper.fileName ?? "Untitled paper"}
                  </Link>
                </h2>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-graphite">
                  <time dateTime={paper.createdAt}>{formatDate(paper.createdAt)}</time>
                  {paper.username && (
                    <Link
                      href={`/library/${paper.username}`}
                      className="relative z-10 transition-colors hover:text-ink"
                    >
                      @{paper.username}
                    </Link>
                  )}
                  {paper.fileType && <span>{paper.fileType.toUpperCase()}</span>}
                </p>
              </li>
            ))}
          </ul>

          <div ref={sentinelRef} className="py-8 text-center text-sm text-graphite">
            {loadingMore && (
              <span role="status" className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading more
              </span>
            )}
            {!hasMore && papers.length > 0 && (
              <span>
                That&rsquo;s all {papers.length} maps.{" "}
                <Link href="/mindmap" className={textLink}>
                  Add yours
                </Link>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
