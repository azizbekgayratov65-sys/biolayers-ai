"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { btnSecondary, pageShell } from "../../components/ui/styles";
import { AmbientGlow } from "../../components/ui/Chrome";

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

const LIMIT = 20;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  const [papers, setPapers] = useState<SavedPaper[]>(initialPapers);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPapers.length >= LIMIT);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialPapers.length);

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      setError(null);

      const response = await fetch(
        `/api/library/username/${username}?limit=${LIMIT}&offset=${offsetRef.current}`,
      );
      if (!response.ok) throw new Error("request failed");

      const data = await response.json();
      const page: SavedPaper[] = data.papers || [];

      if (page.length < LIMIT) setHasMore(false);
      setPapers((current) => [...current, ...page]);
      offsetRef.current += page.length;
    } catch {
      setError("More maps could not be loaded. Check your connection and try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, username]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !error) {
        void fetchMore();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loadingMore, error]);

  const displayName = profile.fullName ?? profile.username ?? username;

  return (
    <div className={`relative isolate ${pageShell} max-w-4xl pt-24 pb-24 sm:pt-28`}>
      <AmbientGlow />
      <nav aria-label="Breadcrumb" className="text-sm text-graphite">
        <Link href="/library" className="hover:text-ink">
          Library
        </Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span aria-current="page" className="text-ink">@{username}</span>
      </nav>

      {userNotFound ? (
        <div className="mt-10">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white md:text-3xl">No researcher called @{username}</h1>
          <p className="mt-3 text-graphite">The name may be misspelled, or the account was removed.</p>
          <Link href="/library" className={`${btnSecondary} mt-6`}>
            Browse the library
          </Link>
        </div>
      ) : (
        <>
          <header className="mt-8 flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-hoechst/15 text-2xl font-semibold text-hoechst-strong">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-2xl font-bold tracking-tight text-white md:text-3xl">{displayName}</h1>
              <p className="mt-1 text-graphite">
                @{username}, {papers.length} {papers.length === 1 ? "map" : "maps"}
                {hasMore ? " so far" : ""}
              </p>
            </div>
          </header>

          {papers.length === 0 ? (
            <p className="mt-12 text-graphite">@{username} has not saved any mind maps yet.</p>
          ) : (
            <>
              <ul className="mt-12 divide-y divide-rule border-y border-rule">
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
                    <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-graphite">
                      <time dateTime={paper.createdAt}>{formatDate(paper.createdAt)}</time>
                      {paper.fileType && <span>{paper.fileType.toUpperCase()}</span>}
                    </p>
                  </li>
                ))}
              </ul>

              {error && (
                <div role="alert" className="mt-6">
                  <p className="text-ink">{error}</p>
                  <button type="button" onClick={() => void fetchMore()} className={`${btnSecondary} mt-3`}>
                    Try again
                  </button>
                </div>
              )}

              <div ref={sentinelRef} className="py-8 text-center text-sm text-graphite">
                {loadingMore && (
                  <span role="status" className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading more
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
