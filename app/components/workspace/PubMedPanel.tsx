"use client";

import type { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";

import type {
  PaperSort,
  PubMedPaper,
} from "../../hooks/usePubMed";

type PubMedPanelProps = {
  pubMedTotal: number;
  pubMedPapers: PubMedPaper[];
  pubMedSort: PaperSort;
  setPubMedSort: Dispatch<SetStateAction<PaperSort>>;
  comparedPapers: PubMedPaper[];
  pubMedLoading: boolean;
  pubMedError: string;
  pubMedHasMore: boolean;
  pubMedLoadingMore: boolean;
  togglePaperComparison: (paper: PubMedPaper) => void;
  loadMorePubMed: () => Promise<void>;
  openPaperInspector: (paper: PubMedPaper) => void;
};

export default function PubMedPanel({
  pubMedTotal,
  pubMedPapers,
  pubMedSort,
  setPubMedSort,
  comparedPapers,
  pubMedLoading,
  pubMedError,
  pubMedHasMore,
  pubMedLoadingMore,
  togglePaperComparison,
  loadMorePubMed,
  openPaperInspector,
}: PubMedPanelProps) {
  return (
                      <section className="mt-7">
                        <div className="mb-6 flex flex-col gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {pubMedTotal.toLocaleString()} matching records
                            </p>
                            <p className="mt-1 text-[10px] text-slate-600">
                              {pubMedPapers.length} loaded
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPubMedSort(
                                  "relevance",
                                )
                              }
                              className={`rounded-[12px] px-3 py-2 text-[10px] ${
                                pubMedSort ===
                                "relevance"
                                  ? "bg-cyan-300 text-slate-950"
                                  : "border border-white/10 text-slate-400"
                              }`}
                            >
                              Relevance
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPubMedSort(
                                  "date",
                                )
                              }
                              className={`rounded-[12px] px-3 py-2 text-[10px] ${
                                pubMedSort ===
                                "date"
                                  ? "bg-cyan-300 text-slate-950"
                                  : "border border-white/10 text-slate-400"
                              }`}
                            >
                              Newest
                            </button>
                          </div>
                        </div>

                        {comparedPapers.length >
                          0 && (
                          <div className="mb-6 grid gap-3 rounded-[22px] border border-violet-300/15 bg-violet-300/[0.04] p-4 md:grid-cols-2">
                            {comparedPapers.map(
                              (paper) => (
                                <div
                                  key={`compare-${paper.pmid}`}
                                  className="rounded-[17px] border border-white/[0.07] bg-black/20 p-4"
                                >
                                  <p className="font-mono text-[8px] text-violet-300/65">
                                    PMID {paper.pmid}
                                  </p>
                                  <p className="mt-2 line-clamp-3 text-xs font-semibold text-slate-200">
                                    {paper.title}
                                  </p>
                                  <p className="mt-3 text-[10px] text-slate-600">
                                    {paper.journal} ·{" "}
                                    {paper.year}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {pubMedLoading && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {[0, 1, 2, 3].map(
                              (item) => (
                                <div
                                  key={item}
                                  className="animate-pulse rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5"
                                >
                                  <div className="h-2.5 w-1/3 rounded-full bg-white/[0.08]" />
                                  <div className="mt-4 h-3 w-full rounded-full bg-white/[0.06]" />
                                  <div className="mt-2 h-3 w-4/5 rounded-full bg-white/[0.06]" />
                                  <div className="mt-5 h-2 w-1/2 rounded-full bg-white/[0.05]" />
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {!pubMedLoading &&
                          pubMedError && (
                            <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/[0.04] p-6">
                              <p className="text-sm leading-7 text-amber-200">
                                {pubMedError}
                              </p>
                            </div>
                          )}

                        {!pubMedLoading &&
                          !pubMedError &&
                          pubMedPapers.length ===
                            0 && (
                            <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-8 text-center">
                              <p className="text-sm text-slate-500">
                                No oncology-focused PubMed papers were found for this entity.
                              </p>
                            </div>
                          )}

                        {!pubMedLoading &&
                          pubMedPapers.length >
                            0 && (
                            <div className="grid gap-4 md:grid-cols-2">
                              {pubMedPapers.map(
                                (paper) => (
                                  <button
                                    key={`${paper.pmid}-full`}
                                    type="button"
                                    onClick={() =>
                                      openPaperInspector(
                                        paper,
                                      )
                                    }
                                    className="group rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-300/65">
                                        PMID{" "}
                                        {
                                          paper.pmid
                                        }
                                      </p>

                                      <span className="text-[10px] font-semibold text-slate-600 transition group-hover:text-cyan-300">
                                        Open ↗
                                      </span>
                                    </div>

                                    <h3 className="mt-4 text-base font-semibold leading-7 text-slate-100">
                                      {
                                        paper.title
                                      }
                                    </h3>

                                    <p className="mt-4 text-xs leading-6 text-slate-500">
                                      {
                                        paper.journal
                                      }{" "}
                                      ·{" "}
                                      {
                                        paper.year
                                      }
                                    </p>

                                    {paper.authors
                                      .length >
                                      0 && (
                                      <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">
                                        {paper.authors.join(
                                          ", ",
                                        )}
                                      </p>
                                    )}

                                    {paper.doi && (
                                      <p className="mt-4 truncate rounded-[10px] border border-violet-300/10 bg-violet-300/[0.035] px-3 py-2 font-mono text-[9px] text-violet-300/65">
                                        DOI{" "}
                                        {
                                          paper.doi
                                        }
                                      </p>
                                    )}

                                    <span
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        togglePaperComparison(
                                          paper,
                                        );
                                      }}
                                      className={`mt-4 block rounded-[11px] border px-3 py-2 text-center text-[9px] ${
                                        comparedPapers.some(
                                          (item) =>
                                            item.pmid ===
                                            paper.pmid,
                                        )
                                          ? "border-violet-300/25 bg-violet-300/[0.09] text-violet-200"
                                          : "border-white/[0.08] text-slate-500"
                                      }`}
                                    >
                                      Add to comparison
                                    </span>
                                  </button>
                                ),
                              )}
                            </div>
                          )}

                        {!pubMedLoading &&
                          pubMedHasMore && (
                          <button
                            type="button"
                            onClick={() =>
                              void loadMorePubMed()
                            }
                            disabled={pubMedLoadingMore}
                            className="mx-auto mt-7 block rounded-[15px] border border-cyan-300/15 bg-cyan-300/[0.055] px-6 py-3 text-xs font-bold text-cyan-100 disabled:opacity-40"
                          >
                            {pubMedLoadingMore
                              ? "Loading more..."
                              : `Load more · ${pubMedPapers.length} of ${pubMedTotal.toLocaleString()}`}
                          </button>
                        )}
                      </section>
  );
}