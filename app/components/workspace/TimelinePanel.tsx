"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const reduceMotion = Boolean(useReducedMotion());

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

  const knownYears = papersByYear
    .map(([year]) => year)
    .filter((year) => year !== "Unknown year");

  const newestYear = knownYears[0];
  const oldestYear = knownYears[knownYears.length - 1];

  return (
    <section className="mt-7 pb-10">
      {/* =========================================================
          TIMELINE OVERVIEW
      ========================================================= */}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
        className="relative overflow-hidden rounded-[22px] border border-teal-100/[0.07] bg-[#0a1b26]/52 p-5 shadow-[0_20px_60px_rgba(1,8,15,.18)]"
      >
        {/* subtle background glow */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-300/[0.035] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-300/[0.025] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,.8)]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-300">
                Literature timeline
              </p>
            </div>

            <h2 className="mt-3 text-[21px] font-semibold tracking-[-0.025em] text-[#f1fbfa]">
              Research chronology
            </h2>

            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-400">
              Explore how the currently retrieved PubMed records are
              distributed across publication years and inspect
              individual records.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <TimelineMetric
              value={pubMedPapers.length.toLocaleString()}
              label="Loaded"
            />

            <TimelineMetric
              value={pubMedTotal.toLocaleString()}
              label="Matches"
            />

            <TimelineMetric
              value={String(papersByYear.length)}
              label="Year groups"
            />
          </div>
        </div>

        {(newestYear || oldestYear) && (
          <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-teal-100/[0.05] pt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Loaded range
            </span>

            {oldestYear && (
              <span className="rounded-full border border-teal-100/[0.06] bg-black/[0.1] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                {oldestYear}
              </span>
            )}

            {oldestYear && newestYear && (
              <span className="text-[11px] text-slate-600">
                →
              </span>
            )}

            {newestYear && (
              <span className="rounded-full border border-teal-200/[0.09] bg-teal-200/[0.035] px-2.5 py-1 text-[11px] font-semibold text-teal-200">
                {newestYear}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}

      {papersByYear.length === 0 && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          className="mt-6 rounded-[20px] border border-dashed border-teal-100/[0.08] bg-[#081722]/45 px-6 py-14 text-center"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] border border-teal-200/[0.09] bg-teal-200/[0.035]">
            <span className="text-lg text-teal-300">
              ◷
            </span>
          </div>

          <p className="mt-4 text-[15px] font-semibold text-slate-200">
            No timeline records yet
          </p>

          <p className="mx-auto mt-2 max-w-md text-[12px] leading-5 text-slate-500">
            PubMed publications will appear here once
            literature records have been retrieved.
          </p>
        </motion.div>
      )}

      {/* =========================================================
          TIMELINE
      ========================================================= */}

      <div className="mt-8 space-y-3">
        {papersByYear.map(([year, papers], yearIndex) => (
          <motion.div
            key={year}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 14,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              delay: reduceMotion
                ? 0
                : Math.min(yearIndex * 0.04, 0.2),
            }}
            className="relative"
          >
            <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 md:grid-cols-[100px_minmax(0,1fr)] md:gap-6">
              {/* YEAR COLUMN */}

              <div className="relative">
                <div className="sticky top-5">
                  <p className="text-right text-[20px] font-semibold tracking-[-0.035em] text-[#edfafa] md:text-[23px]">
                    {year}
                  </p>

                  <p className="mt-1 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {papers.length}{" "}
                    {papers.length === 1
                      ? "paper"
                      : "papers"}
                  </p>
                </div>
              </div>

              {/* TIMELINE CONTENT */}

              <div className="relative border-l border-teal-200/[0.10] pb-8 pl-5 md:pl-7">
                {/* timeline node */}

                <span aria-hidden="true" className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full border-2 border-[#081722] bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,.55)]" />

                {/* year pulse */}

                <span className={`absolute -left-[9px] top-[-2px] h-[17px] w-[17px] rounded-full bg-teal-300/[0.07] ${reduceMotion ? "" : "animate-ping"}`} />

                <div className="grid gap-3 xl:grid-cols-2">
                  {papers.map((paper, paperIndex) => (
                    <motion.button
                      key={`timeline-${paper.pmid}`}
                      type="button"
                      onClick={() =>
                        openPaperInspector(paper)
                      }
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 8,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.3,
                        delay: reduceMotion
                          ? 0
                          : Math.min(
                              paperIndex * 0.025,
                              0.15,
                            ),
                      }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -2 }
                      }
                      className="group relative overflow-hidden rounded-[17px] border border-teal-100/[0.055] bg-[#0a1b26]/46 p-4 text-left shadow-[0_12px_32px_rgba(1,8,15,.12)] transition-colors duration-300 hover:border-teal-200/[0.13] hover:bg-[#0c202c]/62"
                    >
                      {/* hover light */}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-200/[0.025] via-transparent to-sky-300/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative">
                        {/* metadata */}

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="rounded-full border border-teal-200/[0.08] bg-teal-200/[0.025] px-2 py-1 font-mono text-[10px] font-medium tracking-[0.04em] text-teal-300/80">
                              PMID {paper.pmid}
                            </span>

                            {paper.year && (
                              <span className="hidden text-[10px] font-medium text-slate-500 sm:inline">
                                {paper.year}
                              </span>
                            )}
                          </div>

                          <span className="shrink-0 text-[13px] text-slate-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-teal-300">
                            ↗
                          </span>
                        </div>

                        {/* title */}

                        <p className="mt-3 line-clamp-3 text-[14px] font-semibold leading-[1.55] tracking-[-0.012em] text-slate-200 transition-colors group-hover:text-[#f1fbfa]">
                          {paper.title}
                        </p>

                        {/* journal */}

                        <div className="mt-4 flex items-center gap-2 border-t border-teal-100/[0.045] pt-3">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300/70" />

                          <p className="truncate text-[11px] font-medium text-slate-500">
                            {paper.journal ||
                              "Journal unavailable"}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* =========================================================
          LOAD MORE
      ========================================================= */}

      {pubMedHasMore && (
        <div className="mt-3 flex flex-col items-center">
          <div className="mb-5 h-10 w-px bg-gradient-to-b from-teal-200/[0.12] to-transparent" />

          <motion.button
            type="button"
            onClick={() => void loadMorePubMed()}
            disabled={pubMedLoadingMore}
            whileHover={
              pubMedLoadingMore || reduceMotion
                ? undefined
                : { y: -2 }
            }
            whileTap={
              pubMedLoadingMore || reduceMotion
                ? undefined
                : { scale: 0.98 }
            }
            className="group flex min-w-[220px] items-center justify-center gap-2 rounded-[14px] border border-teal-200/[0.11] bg-teal-200/[0.035] px-6 py-3 text-[12px] font-semibold text-teal-100 shadow-[0_12px_30px_rgba(1,8,15,.16)] transition-colors duration-300 hover:border-teal-200/[0.18] hover:bg-teal-200/[0.065] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pubMedLoadingMore ? (
              <>
                <span className={`h-3.5 w-3.5 rounded-full border-2 border-teal-200/25 border-t-teal-200 ${reduceMotion ? "" : "animate-spin"}`} />
                Loading literature...
              </>
            ) : (
              <>
                Load more papers

                <span className="text-teal-300 transition-transform duration-300 group-hover:translate-y-0.5">
                  ↓
                </span>
              </>
            )}
          </motion.button>

          <p className="mt-3 text-[10px] font-medium text-slate-600">
            {pubMedPapers.length.toLocaleString()} of{" "}
            {pubMedTotal.toLocaleString()} records loaded
          </p>
        </div>
      )}

      {/* =========================================================
          END OF TIMELINE
      ========================================================= */}

      {!pubMedHasMore && pubMedPapers.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-teal-200/[0.10]" />

          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
            End of loaded literature
          </p>

          <span className="h-px w-10 bg-gradient-to-l from-transparent to-teal-200/[0.10]" />
        </div>
      )}
    </section>
  );
}

/* =========================================================
   METRIC
========================================================= */

function TimelineMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-[72px] rounded-[13px] border border-teal-100/[0.055] bg-black/[0.10] px-3 py-2.5 text-center">
      <p className="text-[14px] font-semibold tracking-[-0.02em] text-slate-100">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
    </div>
  );
}