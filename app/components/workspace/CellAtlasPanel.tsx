"use client";

import { AnimatePresence, motion } from "framer-motion";

import BiologicalArtwork from "./BiologicalArtwork";
import type {
  CellOntologyScope,
  CellOntologyTerm,
} from "../../hooks/useCellOntology";

const cellAtlasPresets = [
  {
    label: "Fibroblasts",
    query: "fibroblast",
    description:
      "Stromal cells involved in extracellular matrix production and tissue remodeling.",
  },
  {
    label: "T cells",
    query: "T cell",
    description:
      "Adaptive immune cells including helper, cytotoxic and regulatory populations.",
  },
  {
    label: "Macrophages",
    query: "macrophage",
    description:
      "Innate immune cells involved in phagocytosis, inflammation and tissue repair.",
  },
  {
    label: "Endothelial",
    query: "endothelial cell",
    description:
      "Cells that line blood and lymphatic vessels.",
  },
  {
    label: "Osteoblasts",
    query: "osteoblast",
    description:
      "Bone-forming cells responsible for osteoid production and mineralization.",
  },
  {
    label: "Osteoclasts",
    query: "osteoclast",
    description:
      "Multinucleated bone-resorbing cells of the monocyte lineage.",
  },
  {
    label: "Epithelial",
    query: "epithelial cell",
    description:
      "Barrier and glandular cells covering surfaces and forming organs.",
  },
  {
    label: "Stem cells",
    query: "stem cell",
    description:
      "Self-renewing cells capable of differentiation into specialized lineages.",
  },
] as const;

function getCellAccent(
  label: string,
): {
  from: string;
  via: string;
  to: string;
  text: string;
  border: string;
} {
  const normalized =
    label.toLowerCase();

  if (
    normalized.includes("t cell") ||
    normalized.includes("lymphocyte")
  ) {
    return {
      from: "rgba(59,130,246,.22)",
      via: "rgba(34,211,238,.12)",
      to: "rgba(6,182,212,.04)",
      text: "text-sky-200",
      border: "border-sky-300/20",
    };
  }

  if (
    normalized.includes("macrophage") ||
    normalized.includes("monocyte")
  ) {
    return {
      from: "rgba(245,158,11,.22)",
      via: "rgba(251,113,133,.1)",
      to: "rgba(120,53,15,.04)",
      text: "text-amber-200",
      border: "border-amber-300/20",
    };
  }

  if (
    normalized.includes("osteoblast") ||
    normalized.includes("osteoclast") ||
    normalized.includes("bone")
  ) {
    return {
      from: "rgba(244,244,245,.17)",
      via: "rgba(147,197,253,.11)",
      to: "rgba(71,85,105,.04)",
      text: "text-slate-100",
      border: "border-slate-200/20",
    };
  }

  if (
    normalized.includes("endothelial") ||
    normalized.includes("vascular")
  ) {
    return {
      from: "rgba(244,63,94,.2)",
      via: "rgba(236,72,153,.1)",
      to: "rgba(127,29,29,.04)",
      text: "text-rose-200",
      border: "border-rose-300/20",
    };
  }

  if (
    normalized.includes("fibroblast") ||
    normalized.includes("stromal")
  ) {
    return {
      from: "rgba(45,212,191,.22)",
      via: "rgba(34,211,238,.11)",
      to: "rgba(15,118,110,.04)",
      text: "text-teal-200",
      border: "border-teal-300/20",
    };
  }

  if (
    normalized.includes("stem") ||
    normalized.includes("progenitor")
  ) {
    return {
      from: "rgba(168,85,247,.22)",
      via: "rgba(217,70,239,.1)",
      to: "rgba(88,28,135,.04)",
      text: "text-violet-200",
      border: "border-violet-300/20",
    };
  }

  return {
    from: "rgba(34,211,238,.2)",
    via: "rgba(139,92,246,.1)",
    to: "rgba(8,145,178,.04)",
    text: "text-cyan-200",
    border: "border-cyan-300/20",
  };
}

type CellAtlasPanelProps = {
  cellQuery: string;
  setCellQuery: (value: string) => void;
  cellTerms: CellOntologyTerm[];
  cellTotal: number;
  cellPage: number;
  cellHasMore: boolean;
  cellLoading: boolean;
  cellError: string;
  setCellError: (value: string) => void;
  cellScope: CellOntologyScope;
  setCellScope: (value: CellOntologyScope) => void;
  selectedAtlasTerm: CellOntologyTerm | null;
  setSelectedAtlasTerm: (term: CellOntologyTerm | null) => void;
  favoriteCellIds: string[];
  toggleFavoriteCell: (term: CellOntologyTerm) => void;
  openCellAtlasTerm: (term: CellOntologyTerm) => void;
  searchCellPreset: (query: string) => Promise<void>;
  runCellSearch: (page?: number, append?: boolean) => Promise<void>;
  addCellToGraph: (term: CellOntologyTerm) => Promise<void>;
};

export default function CellAtlasPanel({
  cellQuery,
  setCellQuery,
  cellTerms,
  cellTotal,
  cellPage,
  cellHasMore,
  cellLoading,
  cellError,
  setCellError,
  cellScope,
  setCellScope,
  selectedAtlasTerm,
  setSelectedAtlasTerm,
  favoriteCellIds,
  toggleFavoriteCell,
  openCellAtlasTerm,
  searchCellPreset,
  runCellSearch,
  addCellToGraph,
}: CellAtlasPanelProps) {
  return (
                      <section className="mt-7">
                        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-[radial-gradient(circle_at_15%_15%,rgba(45,212,191,.14),transparent_31%),radial-gradient(circle_at_85%_25%,rgba(139,92,246,.12),transparent_30%),rgba(255,255,255,.018)] p-5 sm:p-7">
                          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/[0.04]" />
                          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-teal-300/[0.05]" />

                          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-teal-300">
                                Cell Atlas Pro
                              </p>

                              <h3 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                                Explore standardized
                                cell identities.
                              </h3>

                              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                                Search Cell Ontology and Cell Line Ontology, inspect definitions and synonyms, then add selected classes directly to your biological graph.
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <CellAtlasMetric
                                label="Results"
                                value={cellTotal.toLocaleString()}
                              />
                              <CellAtlasMetric
                                label="Loaded"
                                value={String(
                                  cellTerms.length,
                                )}
                              />
                              <CellAtlasMetric
                                label="Saved"
                                value={String(
                                  favoriteCellIds.length,
                                )}
                              />
                            </div>
                          </div>

                          <div className="relative z-10 mt-7 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-teal-300/65">
                                ⌕
                              </span>

                              <input
                                value={cellQuery}
                                onChange={(event) => {
                                  setCellQuery(
                                    event.target.value,
                                  );
                                  setCellError("");
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key ===
                                    "Enter"
                                  ) {
                                    void runCellSearch();
                                  }
                                }}
                                placeholder="Search fibroblast, osteoclast, T cell, endothelial cell..."
                                className="w-full rounded-[17px] border border-white/[0.09] bg-black/25 py-4 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/30 focus:bg-teal-300/[0.025]"
                              />
                            </div>

                            <select
                              value={cellScope}
                              onChange={(event) =>
                                setCellScope(
                                  event.target
                                    .value as CellOntologyScope,
                                )
                              }
                              className="rounded-[17px] border border-white/[0.09] bg-[#07111f] px-4 py-4 text-xs font-semibold text-slate-300 outline-none"
                            >
                              <option value="cl">
                                Cell Ontology
                              </option>
                              <option value="clo">
                                Cell Line Ontology
                              </option>
                              <option value="all">
                                Both ontologies
                              </option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                void runCellSearch()
                              }
                              disabled={cellLoading}
                              className="rounded-[17px] bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-950 shadow-[0_16px_45px_rgba(34,211,238,.18)] transition hover:brightness-110 disabled:opacity-50"
                            >
                              {cellLoading
                                ? "Searching..."
                                : "Search atlas"}
                            </button>
                          </div>

                          {cellError && (
                            <p className="relative z-10 mt-4 rounded-[15px] border border-rose-300/15 bg-rose-300/[0.05] p-3 text-xs text-rose-200">
                              {cellError}
                            </p>
                          )}
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                Quick discovery
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                Start with major cellular families.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {cellAtlasPresets.map(
                              (preset, index) => (
                                <motion.button
                                  key={preset.query}
                                  type="button"
                                  initial={{
                                    opacity: 0,
                                    y: 12,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  transition={{
                                    delay:
                                      index * 0.05,
                                  }}
                                  onClick={() =>
                                    void searchCellPreset(
                                      preset.query,
                                    )
                                  }
                                  className="group rounded-[20px] border border-white/[0.07] bg-white/[0.022] p-4 text-left transition hover:-translate-y-1 hover:border-teal-300/20 hover:bg-teal-300/[0.035]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-teal-300 to-violet-400 shadow-[0_0_14px_rgba(45,212,191,.55)]" />
                                    <span className="text-[9px] text-slate-700 transition group-hover:text-teal-300">
                                      Explore ↗
                                    </span>
                                  </div>

                                  <p className="mt-4 text-sm font-semibold text-white">
                                    {preset.label}
                                  </p>

                                  <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">
                                    {
                                      preset.description
                                    }
                                  </p>
                                </motion.button>
                              ),
                            )}
                          </div>
                        </div>

                        {cellTerms.length === 0 &&
                          !cellLoading && (
                          <div className="mt-7 rounded-[28px] border border-dashed border-white/[0.09] bg-white/[0.015] px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-teal-300/15 bg-teal-300/[0.05] text-3xl">
                              ◉
                            </div>

                            <h4 className="mt-5 text-xl font-semibold text-white">
                              Search the cell atlas
                            </h4>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                              Enter a cell name or choose a discovery category. Results are loaded from standardized biomedical ontologies.
                            </p>
                          </div>
                        )}

                        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {cellTerms.map(
                            (term, index) => {
                              const accent =
                                getCellAccent(
                                  term.label,
                                );

                              const favorite =
                                favoriteCellIds.includes(
                                  term.id,
                                );

                              return (
                                <motion.article
                                  key={term.id}
                                  initial={{
                                    opacity: 0,
                                    y: 18,
                                    scale: 0.98,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  transition={{
                                    delay:
                                      Math.min(
                                        index * 0.035,
                                        0.35,
                                      ),
                                  }}
                                  className={`group relative overflow-hidden rounded-[27px] border ${accent.border} bg-[#050814]/74 p-3 shadow-[0_24px_70px_rgba(0,0,0,.24)] backdrop-blur-2xl transition hover:-translate-y-1.5`}
                                >
                                  <div
                                    className="pointer-events-none absolute inset-0 opacity-90"
                                    style={{
                                      background: `radial-gradient(circle at 18% 10%, ${accent.from}, transparent 38%), radial-gradient(circle at 90% 82%, ${accent.via}, transparent 38%), linear-gradient(145deg, transparent, ${accent.to})`,
                                    }}
                                  />

                                  <div className="relative z-10">
                                    <BiologicalArtwork
                                      type="cell"
                                      label={
                                        term.label
                                      }
                                      active={
                                        selectedAtlasTerm?.id ===
                                        term.id
                                      }
                                    />

                                    <div className="px-2 pb-2 pt-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <span className={`inline-flex rounded-full border border-white/[0.08] bg-black/25 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] ${accent.text}`}>
                                            {
                                              term.ontologyLabel
                                            }
                                          </span>

                                          <h4 className="mt-3 text-lg font-semibold leading-6 tracking-[-0.025em] text-white">
                                            {term.label}
                                          </h4>
                                        </div>

                                        <button
                                          type="button"
                                          aria-label="Save cell"
                                          onClick={() =>
                                            toggleFavoriteCell(
                                              term,
                                            )
                                          }
                                          className={`shrink-0 rounded-[12px] border px-3 py-2 text-sm transition ${
                                            favorite
                                              ? "border-amber-300/25 bg-amber-300/[0.09] text-amber-200"
                                              : "border-white/[0.08] text-slate-600 hover:text-white"
                                          }`}
                                        >
                                          {favorite
                                            ? "★"
                                            : "☆"}
                                        </button>
                                      </div>

                                      <p className="mt-3 line-clamp-3 min-h-[66px] text-xs leading-6 text-slate-500">
                                        {term.description ||
                                          "No ontology definition was returned for this class."}
                                      </p>

                                      <div className="mt-4 flex items-center justify-between rounded-[13px] border border-white/[0.06] bg-black/20 px-3 py-2.5">
                                        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-600">
                                          Ontology ID
                                        </span>
                                        <span className="max-w-[150px] truncate font-mono text-[9px] text-slate-400">
                                          {term.id}
                                        </span>
                                      </div>

                                      <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openCellAtlasTerm(
                                              term,
                                            )
                                          }
                                          className="rounded-[13px] border border-white/[0.09] bg-white/[0.035] px-3 py-3 text-[10px] font-bold text-slate-200 transition hover:bg-white/[0.07]"
                                        >
                                          Inspect
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            void addCellToGraph(
                                              term,
                                            )
                                          }
                                          className="rounded-[13px] border border-teal-300/15 bg-teal-300/[0.07] px-3 py-3 text-[10px] font-bold text-teal-100 transition hover:bg-teal-300/[0.13]"
                                        >
                                          Add to graph
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.article>
                              );
                            },
                          )}
                        </div>

                        {cellHasMore && (
                          <button
                            type="button"
                            onClick={() =>
                              void runCellSearch(
                                cellPage + 1,
                                true,
                              )
                            }
                            disabled={cellLoading}
                            className="mx-auto mt-8 block rounded-[16px] border border-teal-300/15 bg-teal-300/[0.05] px-7 py-3.5 text-xs font-bold text-teal-100 transition hover:bg-teal-300/[0.1] disabled:opacity-40"
                          >
                            {cellLoading
                              ? "Loading more cells..."
                              : `Load more · ${cellTerms.length} of ${cellTotal.toLocaleString()}`}
                          </button>
                        )}

                        <AnimatePresence>
                          {selectedAtlasTerm && (
                            <>
                              <motion.button
                                type="button"
                                aria-label="Close cell inspector"
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
                                  setSelectedAtlasTerm(
                                    null,
                                  )
                                }
                                className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-[3px]"
                              />

                              <motion.aside
                                initial={{
                                  opacity: 0,
                                  x: 70,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  x: 70,
                                }}
                                transition={{
                                  duration: 0.4,
                                  ease: [
                                    0.16,
                                    1,
                                    0.3,
                                    1,
                                  ],
                                }}
                                className="fixed bottom-0 right-0 top-0 z-[140] flex w-full flex-col overflow-hidden border-l border-white/[0.1] bg-[#050814]/98 shadow-[-30px_0_100px_rgba(0,0,0,.52)] backdrop-blur-3xl sm:w-[560px]"
                              >
                                <div className="border-b border-white/[0.08] p-5 sm:p-6">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-teal-300">
                                        Cell Atlas Inspector
                                      </p>
                                      <p className="mt-2 font-mono text-[9px] text-slate-600">
                                        {
                                          selectedAtlasTerm.id
                                        }
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedAtlasTerm(
                                          null,
                                        )
                                      }
                                      className="rounded-[12px] border border-white/10 px-3 py-2 text-xs text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                                  <BiologicalArtwork
                                    type="cell"
                                    label={
                                      selectedAtlasTerm.label
                                    }
                                    active
                                  />

                                  <span className="mt-5 inline-flex rounded-full border border-teal-300/15 bg-teal-300/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-teal-200">
                                    {
                                      selectedAtlasTerm.ontologyLabel
                                    }
                                  </span>

                                  <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white">
                                    {
                                      selectedAtlasTerm.label
                                    }
                                  </h2>

                                  <section className="mt-6 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-cyan-300">
                                      Ontology definition
                                    </p>

                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                      {selectedAtlasTerm.description ||
                                        "No formal definition was returned by the ontology service."}
                                    </p>
                                  </section>

                                  <section className="mt-5 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-violet-300">
                                      Known synonyms
                                    </p>

                                    {selectedAtlasTerm
                                      .synonyms.length >
                                    0 ? (
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedAtlasTerm.synonyms.map(
                                          (
                                            synonym,
                                          ) => (
                                            <span
                                              key={
                                                synonym
                                              }
                                              className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 text-[10px] text-slate-400"
                                            >
                                              {
                                                synonym
                                              }
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    ) : (
                                      <p className="mt-3 text-sm text-slate-600">
                                        No synonyms were returned.
                                      </p>
                                    )}
                                  </section>

                                  <section className="mt-5 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-amber-300">
                                      Provenance
                                    </p>

                                    <div className="mt-4 space-y-3">
                                      <AtlasProperty
                                        label="Source"
                                        value={
                                          selectedAtlasTerm.ontologyLabel
                                        }
                                      />
                                      <AtlasProperty
                                        label="Identifier"
                                        value={
                                          selectedAtlasTerm.id
                                        }
                                      />
                                      <AtlasProperty
                                        label="Ontology"
                                        value={
                                          selectedAtlasTerm.ontology.toUpperCase()
                                        }
                                      />
                                    </div>
                                  </section>

                                  <div className="mt-6 rounded-[18px] border border-amber-300/12 bg-amber-300/[0.035] p-4">
                                    <p className="text-[10px] leading-6 text-amber-100/65">
                                      BioLayers currently displays ontology metadata supplied by the external service. Molecular markers, disease associations and anatomical locations should be added only after connecting verified domain-specific sources.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] p-4 sm:px-6">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleFavoriteCell(
                                        selectedAtlasTerm,
                                      )
                                    }
                                    className="rounded-[15px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07]"
                                  >
                                    {favoriteCellIds.includes(
                                      selectedAtlasTerm.id,
                                    )
                                      ? "Remove saved"
                                      : "Save cell"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void addCellToGraph(
                                        selectedAtlasTerm,
                                      );
                                      setSelectedAtlasTerm(
                                        null,
                                      );
                                    }}
                                    className="rounded-[15px] bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 px-4 py-3 text-xs font-black text-slate-950 transition hover:brightness-110"
                                  >
                                    Add to graph
                                  </button>
                                </div>
                              </motion.aside>
                            </>
                          )}
                        </AnimatePresence>
                      </section>
  );
}

function CellAtlasMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[76px] rounded-[15px] border border-white/[0.08] bg-black/20 px-3 py-3 text-center">
      <p className="text-lg font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

function AtlasProperty({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] border border-white/[0.06] bg-black/20 px-4 py-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </span>
      <span className="max-w-[66%] break-words text-right font-mono text-[10px] text-slate-300">
        {value}
      </span>
    </div>
  );
}