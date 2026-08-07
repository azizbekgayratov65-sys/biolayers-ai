"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { EntityData } from "../../lib/buildGraphFromText";
import type { PubMedPaper } from "../../hooks/usePubMed";

type PaperInspectorPanelProps = {
  selectedPaper: PubMedPaper | null;
  setSelectedPaper: (paper: PubMedPaper | null) => void;
  selectedEntity: EntityData;
  paperCopyMessage: string;
  copyPaperIdentifier: (
    value: string,
    label: string,
  ) => Promise<void>;
};

export default function PaperInspectorPanel({
  selectedPaper,
  setSelectedPaper,
  selectedEntity,
  paperCopyMessage,
  copyPaperIdentifier,
}: PaperInspectorPanelProps) {
  return (
        <AnimatePresence>
          {selectedPaper && (
            <>
              <motion.button
                type="button"
                aria-label="Close paper inspector"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setSelectedPaper(null)
                }
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-[3px]"
              />

              <motion.aside
                initial={{
                  opacity: 0,
                  x: 70,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 70,
                  scale: 0.985,
                }}
                transition={{
                  duration: 0.38,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed bottom-0 right-0 top-0 z-[120] flex w-full flex-col overflow-hidden border-l border-white/[0.1] bg-[#050814]/97 shadow-[-35px_0_110px_rgba(0,0,0,.48)] backdrop-blur-3xl sm:w-[560px]"
              >
                <div className="relative overflow-hidden border-b border-white/[0.08] px-5 py-5 sm:px-6">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-[80px]" />
                  <div className="pointer-events-none absolute -left-20 bottom-[-80px] h-52 w-52 rounded-full bg-violet-500/10 blur-[80px]" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                        Paper Inspector
                      </p>

                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
                        PMID {selectedPaper.pmid}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPaper(null)
                      }
                      className="rounded-[12px] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
                  <div className="rounded-[28px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(34,211,238,.055),rgba(139,92,246,.035))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-200">
                        {selectedPaper.journal}
                      </span>

                      <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-semibold text-slate-500">
                        {selectedPaper.year}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-semibold leading-[1.22] tracking-[-0.035em] text-white sm:text-3xl">
                      {selectedPaper.title}
                    </h2>

                    {selectedPaper.authors.length >
                      0 && (
                      <p className="mt-5 text-sm leading-7 text-slate-400">
                        {selectedPaper.authors.join(
                          ", ",
                        )}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <PaperMetric
                      label="PMID"
                      value={selectedPaper.pmid}
                    />

                    <PaperMetric
                      label="Publication year"
                      value={selectedPaper.year}
                    />
                  </div>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                      Why this paper matters
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      This paper was retrieved by PubMed for{" "}
                      <span className="font-semibold text-slate-200">
                        {selectedEntity.label}
                      </span>
                      . Its title and metadata provide literature context for the selected entity, but they do not by themselves establish that every graph relationship is experimentally proven.
                    </p>
                  </section>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      Context in BioLayers
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[17px] border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                          Selected entity
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          {selectedEntity.label}
                        </p>

                        <p className="mt-1 text-[10px] capitalize text-cyan-300/70">
                          {selectedEntity.type}
                        </p>
                      </div>

                      <div className="rounded-[17px] border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                          Evidence source
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          PubMed
                        </p>

                        <p className="mt-1 text-[10px] text-violet-300/70">
                          Live literature metadata
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
                      Evidence limits
                    </p>

                    <div className="mt-4 space-y-3">
                      {[
                        "The current PubMed route supplies title, journal, year, authors, PMID and DOI metadata.",
                        "Abstract, methods, results and full-text claims are not yet loaded into BioLayers.",
                        "The paper should be opened and reviewed before using it to support a mechanistic conclusion.",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex gap-3 rounded-[16px] border border-white/[0.06] bg-black/20 p-3"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />

                          <p className="text-xs leading-6 text-slate-500">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Article identifiers
                    </p>

                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        onClick={() =>
                          void copyPaperIdentifier(
                            selectedPaper.pmid,
                            "PMID",
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 rounded-[16px] border border-white/[0.07] bg-black/20 px-4 py-3 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.035]"
                      >
                        <span>
                          <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                            PMID
                          </span>

                          <span className="mt-1 block font-mono text-xs text-slate-300">
                            {selectedPaper.pmid}
                          </span>
                        </span>

                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-300/70">
                          Copy
                        </span>
                      </button>

                      {selectedPaper.doi && (
                        <button
                          type="button"
                          onClick={() =>
                            void copyPaperIdentifier(
                              selectedPaper.doi ||
                                "",
                              "DOI",
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 rounded-[16px] border border-white/[0.07] bg-black/20 px-4 py-3 text-left transition hover:border-violet-300/20 hover:bg-violet-300/[0.035]"
                        >
                          <span className="min-w-0">
                            <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600">
                              DOI
                            </span>

                            <span className="mt-1 block truncate font-mono text-xs text-slate-300">
                              {selectedPaper.doi}
                            </span>
                          </span>

                          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-300/70">
                            Copy
                          </span>
                        </button>
                      )}
                    </div>

                    {paperCopyMessage && (
                      <p className="mt-3 text-[10px] font-semibold text-emerald-300">
                        {paperCopyMessage}
                      </p>
                    )}
                  </section>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] p-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPaper(null)
                    }
                    className="rounded-[15px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Back
                  </button>

                  <a
                    href={selectedPaper.pubmedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[15px] bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-4 py-3 text-center text-xs font-bold text-slate-950 transition hover:brightness-110"
                  >
                    Open PubMed ↗
                  </a>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
  );
}

function PaperMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-base font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}