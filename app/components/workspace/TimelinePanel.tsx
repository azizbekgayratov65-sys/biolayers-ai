"use client";

import { useMemo } from "react";

import type { PubMedPaper } from "../../hooks/usePubMed";

type TimelinePanelProps = {
  pubMedPapers: PubMedPaper[];
  pubMedTotal: number;
  pubMedHasMore: boolean;
  pubMedLoadingMore: boolean;
  loadMorePubMed: () => Promise<void>;
  openPaperInspector: (paper: PubMedPaper) => void;
};

export default function TimelinePanel({
  pubMedPapers,
  pubMedTotal,
  pubMedHasMore,
  pubMedLoadingMore,
  loadMorePubMed,
  openPaperInspector,
}: TimelinePanelProps) {
  const papersByYear = useMemo(() => {
    const groups = new Map<string, PubMedPaper[]>();

    for (const paper of pubMedPapers) {
      const year = paper.year || "Unknown year";

      groups.set(year, [
        ...(groups.get(year) ?? []),
        paper,
      ]);
    }

    return Array.from(groups.entries()).sort(
      ([a], [b]) => {
        if (a === "Unknown year") {
          return 1;
        }

        if (b === "Unknown year") {
          return -1;
        }

        return Number(b) - Number(a);
      },
    );
  }, [pubMedPapers]);

  return (
<section className="mt-7">
                        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                            Literature timeline
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            {pubMedPapers.length} loaded of{" "}
                            {pubMedTotal.toLocaleString()} matching records.
                          </p>
                        </div>

                        <div className="mt-7 space-y-8">
                          {papersByYear.map(
                            ([year, papers]) => (
                              <div
                                key={year}
                                className="relative border-l border-cyan-300/20 pl-7"
                              >
                                <span className="absolute -left-2 top-0 h-4 w-4 rounded-full border border-cyan-200/50 bg-[#07111f]" />
                                <h3 className="text-2xl font-semibold text-white">
                                  {year}
                                </h3>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                  {papers.map(
                                    (paper) => (
                                      <button
                                        key={`timeline-${paper.pmid}`}
                                        type="button"
                                        onClick={() =>
                                          openPaperInspector(
                                            paper,
                                          )
                                        }
                                        className="rounded-[19px] border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-cyan-300/20"
                                      >
                                        <p className="font-mono text-[8px] text-cyan-300/65">
                                          PMID {paper.pmid}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-200">
                                          {paper.title}
                                        </p>
                                        <p className="mt-2 text-[10px] text-slate-600">
                                          {paper.journal}
                                        </p>
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        {pubMedHasMore && (
                          <button
                            type="button"
                            onClick={() =>
                              void loadMorePubMed()
                            }
                            disabled={pubMedLoadingMore}
                            className="mx-auto mt-7 block rounded-[15px] border border-white/10 px-6 py-3 text-xs font-semibold text-slate-200 disabled:opacity-40"
                          >
                            {pubMedLoadingMore
                              ? "Loading..."
                              : "Load more timeline papers"}
                          </button>
                        )}
                      </section>
  );
}