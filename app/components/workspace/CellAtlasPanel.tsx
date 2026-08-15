"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

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
  chip: string;
  dot: string;
} {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("t cell") ||
    normalized.includes("lymphocyte")
  ) {
    return {
      from: "rgba(125,211,252,.12)",
      via: "rgba(56,189,248,.07)",
      to: "rgba(8,47,73,.03)",
      text: "text-sky-200",
      border: "border-sky-200/[0.12]",
      chip: "bg-sky-200/[0.04]",
      dot: "bg-sky-300",
    };
  }

  if (
    normalized.includes("macrophage") ||
    normalized.includes("monocyte")
  ) {
    return {
      from: "rgba(252,211,77,.12)",
      via: "rgba(251,146,60,.06)",
      to: "rgba(69,26,3,.03)",
      text: "text-amber-200",
      border: "border-amber-200/[0.12]",
      chip: "bg-amber-200/[0.04]",
      dot: "bg-amber-300",
    };
  }

  if (
    normalized.includes("osteoblast") ||
    normalized.includes("osteoclast") ||
    normalized.includes("bone")
  ) {
    return {
      from: "rgba(226,232,240,.10)",
      via: "rgba(125,211,252,.055)",
      to: "rgba(30,41,59,.03)",
      text: "text-slate-100",
      border: "border-slate-200/[0.12]",
      chip: "bg-slate-200/[0.035]",
      dot: "bg-slate-200",
    };
  }

  if (
    normalized.includes("endothelial") ||
    normalized.includes("vascular")
  ) {
    return {
      from: "rgba(253,164,175,.12)",
      via: "rgba(244,114,182,.05)",
      to: "rgba(76,5,25,.03)",
      text: "text-rose-200",
      border: "border-rose-200/[0.12]",
      chip: "bg-rose-200/[0.04]",
      dot: "bg-rose-300",
    };
  }

  if (
    normalized.includes("fibroblast") ||
    normalized.includes("stromal")
  ) {
    return {
      from: "rgba(94,234,212,.13)",
      via: "rgba(45,212,191,.06)",
      to: "rgba(4,47,46,.03)",
      text: "text-teal-200",
      border: "border-teal-200/[0.12]",
      chip: "bg-teal-200/[0.04]",
      dot: "bg-teal-300",
    };
  }

  if (
    normalized.includes("stem") ||
    normalized.includes("progenitor")
  ) {
    return {
      from: "rgba(103,232,249,.12)",
      via: "rgba(56,189,248,.055)",
      to: "rgba(8,47,73,.03)",
      text: "text-cyan-200",
      border: "border-cyan-200/[0.12]",
      chip: "bg-cyan-200/[0.04]",
      dot: "bg-cyan-300",
    };
  }

  return {
    from: "rgba(103,232,249,.11)",
    via: "rgba(94,234,212,.055)",
    to: "rgba(8,47,73,.03)",
    text: "text-cyan-200",
    border: "border-cyan-200/[0.11]",
    chip: "bg-cyan-200/[0.04]",
    dot: "bg-cyan-300",
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
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section className="mt-7 pb-10">
      {/* =========================================================
          HERO / SEARCH
      ========================================================= */}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.38,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative overflow-hidden rounded-[24px] border border-teal-100/[0.075] bg-[#0a1b26]/58 p-5 shadow-[0_20px_60px_rgba(1,8,15,.18)] sm:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-300/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[28%] h-56 w-56 rounded-full bg-sky-300/[0.025] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/[0.18] to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_9px_rgba(94,234,212,.8)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.55, 1, 0.55],
                        scale: [1, 1.25, 1],
                      }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              />

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">
                Cell atlas
              </p>
            </div>

            <h3 className="mt-3 max-w-2xl text-[27px] font-semibold tracking-[-0.04em] text-[#f0fbfa] sm:text-[32px]">
              Explore standardized cellular identities.
            </h3>

            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-400">
              Search standardized Cell Ontology and Cell Line Ontology terms,
              inspect returned definitions and synonyms, then add selected
              ontology classes directly to the biological graph.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CellAtlasMetric
              label="Results"
              value={cellTotal.toLocaleString()}
            />
            <CellAtlasMetric
              label="Loaded"
              value={String(cellTerms.length)}
            />
            <CellAtlasMetric
              label="Saved"
              value={String(favoriteCellIds.length)}
            />
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_210px_auto]">
          <div className="group relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-teal-300/60 transition group-focus-within:text-teal-200">
              ⌕
            </span>

            <input
              value={cellQuery}
              onChange={(event) => {
                setCellQuery(event.target.value);
                setCellError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void runCellSearch();
                }
              }}
              placeholder="Search fibroblast, osteoclast, T cell, endothelial cell..."
              className="w-full rounded-[15px] border border-teal-100/[0.08] bg-black/[0.12] py-3.5 pl-11 pr-4 text-[13px] font-medium text-slate-100 outline-none transition duration-300 placeholder:text-slate-500 focus:border-teal-200/[0.2] focus:bg-teal-200/[0.025] focus:shadow-[0_0_0_3px_rgba(94,234,212,.03)]"
            />
          </div>

          <select
            value={cellScope}
            onChange={(event) =>
              setCellScope(
                event.target.value as CellOntologyScope,
              )
            }
            className="rounded-[15px] border border-teal-100/[0.08] bg-[#0b1d28] px-4 py-3.5 text-[12px] font-semibold text-slate-300 outline-none transition focus:border-teal-200/[0.18]"
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
            onClick={() => void runCellSearch()}
            disabled={cellLoading}
            className="group relative overflow-hidden rounded-[15px] border border-teal-200/[0.16] bg-[linear-gradient(135deg,#99f6e4,#67e8f9)] px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#062029] shadow-[0_12px_30px_rgba(45,212,191,.13)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
            <span className="relative flex items-center justify-center gap-2">
              {cellLoading && (
                <span className={`h-3.5 w-3.5 rounded-full border-2 border-[#062029]/20 border-t-[#062029] ${reduceMotion ? "" : "animate-spin"}`} />
              )}

              {cellLoading
                ? "Searching..."
                : "Search atlas"}
            </span>
          </button>
        </div>

        {cellError && (
          <motion.p
            role="alert"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mt-3 rounded-[13px] border border-rose-200/[0.11] bg-rose-200/[0.035] px-3.5 py-3 text-[11px] leading-5 text-rose-200"
          >
            {cellError}
          </motion.p>
        )}
      </motion.div>

      {/* =========================================================
          QUICK DISCOVERY
      ========================================================= */}

      <div className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Quick discovery
            </p>
            <p className="mt-1.5 text-[12px] text-slate-400">
              Start with major cellular families.
            </p>
          </div>

          <span className="hidden text-[10px] font-medium text-slate-600 sm:inline">
            8 presets
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {cellAtlasPresets.map(
            (preset, index) => (
              <motion.button
                key={preset.query}
                type="button"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 10,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: reduceMotion ? 0 : index * 0.035,
                  duration: reduceMotion ? 0 : 0.3,
                }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                onClick={() =>
                  void searchCellPreset(
                    preset.query,
                  )
                }
                className="group rounded-[16px] border border-teal-100/[0.055] bg-[#0a1b26]/42 p-3.5 text-left transition duration-300 hover:border-teal-200/[0.12] hover:bg-teal-200/[0.025]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-teal-100/[0.055] bg-black/[0.1]">
                    <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_9px_rgba(94,234,212,.55)]" />
                  </span>

                  <span className="text-[10px] text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-teal-300">
                    Explore ↗
                  </span>
                </div>

                <p className="mt-3 text-[13px] font-semibold text-slate-100">
                  {preset.label}
                </p>

                <p className="mt-1.5 line-clamp-2 text-[10px] leading-5 text-slate-500">
                  {preset.description}
                </p>
              </motion.button>
            ),
          )}
        </div>
      </div>

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}

      {cellTerms.length === 0 &&
        !cellLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-7 rounded-[22px] border border-dashed border-teal-100/[0.08] bg-[#081722]/42 px-6 py-14 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] border border-teal-200/[0.09] bg-teal-200/[0.035] text-xl text-teal-300">
              ◉
            </div>

            <h4 className="mt-4 text-[16px] font-semibold text-slate-100">
              Search the cell atlas
            </h4>

            <p className="mx-auto mt-2 max-w-md text-[12px] leading-6 text-slate-500">
              Enter a cell name or choose a discovery category.
              Results are loaded from the selected biomedical ontology source.
            </p>
          </motion.div>
        )}

      {/* =========================================================
          RESULTS
      ========================================================= */}

      {cellTerms.length > 0 && (
        <div className="mt-7 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Ontology results
            </p>

            <p className="mt-1.5 text-[12px] text-slate-400">
              {cellTerms.length.toLocaleString()} standardized cell classes loaded.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

            const selected =
              selectedAtlasTerm?.id ===
              term.id;

            return (
              <motion.article
                key={term.id}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 14,
                        scale: 0.985,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  delay: reduceMotion
                    ? 0
                    : Math.min(index * 0.025, 0.25),
                  duration: reduceMotion ? 0 : 0.34,
                }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className={`group relative overflow-hidden rounded-[22px] border ${accent.border} bg-[#091a25]/78 p-2.5 shadow-[0_18px_52px_rgba(1,8,15,.22)] backdrop-blur-2xl transition duration-300 ${
                  selected
                    ? "ring-1 ring-teal-200/[0.13]"
                    : ""
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 18% 8%, ${accent.from}, transparent 38%), radial-gradient(circle at 90% 85%, ${accent.via}, transparent 36%), linear-gradient(145deg, transparent, ${accent.to})`,
                  }}
                />

                <div className="relative z-10">
                  <div className="overflow-hidden rounded-[16px] border border-teal-100/[0.035] bg-[#06141e]/68">
                    <BiologicalArtwork
                      type="cell"
                      label={term.label}
                      active={selected}
                    />
                  </div>

                  <div className="px-2 pb-2 pt-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex rounded-full border ${accent.border} ${accent.chip} px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${accent.text}`}
                          >
                            {term.ontologyLabel}
                          </span>

                          <span className="inline-flex rounded-full border border-teal-100/[0.05] bg-black/[0.1] px-2 py-1 font-mono text-[9px] text-slate-500">
                            {term.ontology.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="mt-2.5 text-[17px] font-semibold leading-[1.28] tracking-[-0.025em] text-[#f0fbfa]">
                          {term.label}
                        </h4>
                      </div>

                      <button
                        type="button"
                        aria-label={favorite ? "Remove saved cell" : "Save cell"}
                        aria-pressed={favorite}
                        onClick={() =>
                          toggleFavoriteCell(
                            term,
                          )
                        }
                        className={`shrink-0 rounded-[11px] border px-2.5 py-2 text-[14px] transition duration-300 ${
                          favorite
                            ? "border-amber-200/[0.15] bg-amber-200/[0.06] text-amber-200"
                            : "border-teal-100/[0.055] bg-black/[0.08] text-slate-500 hover:border-amber-200/[0.12] hover:text-amber-200"
                        }`}
                      >
                        {favorite
                          ? "★"
                          : "☆"}
                      </button>
                    </div>

                    <p className="mt-3 line-clamp-3 min-h-[60px] text-[11px] leading-5 text-slate-400">
                      {term.description ||
                        "No ontology definition was returned for this class."}
                    </p>

                    <div className="mt-3 flex items-center justify-between rounded-[11px] border border-teal-100/[0.045] bg-black/[0.09] px-3 py-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-600">
                        Ontology ID
                      </span>

                      <span className="max-w-[150px] truncate font-mono text-[10px] text-slate-400">
                        {term.id}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openCellAtlasTerm(
                            term,
                          )
                        }
                        className="rounded-[11px] border border-teal-100/[0.065] bg-teal-100/[0.018] px-3 py-2.5 text-[10px] font-semibold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:border-teal-200/[0.12] hover:bg-teal-100/[0.035]"
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
                        className="group/add relative overflow-hidden rounded-[11px] border border-teal-200/[0.13] bg-teal-200/[0.05] px-3 py-2.5 text-[10px] font-semibold text-teal-100 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-200/[0.08]"
                      >
                        <span className="relative flex items-center justify-center gap-1.5">
                          Add to graph
                          <span className="transition-transform group-hover/add:translate-x-0.5">
                            →
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          },
        )}
      </div>

      {/* =========================================================
          LOAD MORE
      ========================================================= */}

      {cellHasMore && (
        <div className="mt-8 flex flex-col items-center">
          <motion.button
            type="button"
            onClick={() =>
              void runCellSearch(
                cellPage + 1,
                true,
              )
            }
            disabled={cellLoading}
            whileHover={
              cellLoading || reduceMotion
                ? undefined
                : { y: -2 }
            }
            whileTap={
              cellLoading || reduceMotion
                ? undefined
                : { scale: 0.985 }
            }
            className="flex min-w-[220px] items-center justify-center gap-2 rounded-[13px] border border-teal-200/[0.11] bg-teal-200/[0.035] px-6 py-3 text-[11px] font-semibold text-teal-100 transition duration-300 hover:border-teal-200/[0.18] hover:bg-teal-200/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cellLoading && (
              <span className={`h-3.5 w-3.5 rounded-full border-2 border-teal-200/25 border-t-teal-200 ${reduceMotion ? "" : "animate-spin"}`} />
            )}

            {cellLoading
              ? "Loading more cells..."
              : `Load more · ${cellTerms.length} of ${cellTotal.toLocaleString()}`}
          </motion.button>
        </div>
      )}

      {/* =========================================================
          CELL INSPECTOR
      ========================================================= */}

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
              className="fixed inset-0 z-[130] bg-[#020b12]/60 backdrop-blur-[5px]"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="cell-atlas-inspector-title"
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
                duration: 0.36,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              className="fixed bottom-0 right-0 top-0 z-[140] flex w-full flex-col overflow-hidden border-l border-teal-100/[0.08] bg-[#081722]/98 shadow-[-30px_0_100px_rgba(1,8,15,.52)] backdrop-blur-3xl sm:w-[560px]"
            >
              <div className="relative border-b border-teal-100/[0.065] px-5 py-5 sm:px-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_75%_0%,rgba(94,234,212,.05),transparent_60%)]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,.7)]" />

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                        Cell atlas inspector
                      </p>
                    </div>

                    <p className="mt-2 font-mono text-[10px] text-slate-500">
                      {selectedAtlasTerm.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAtlasTerm(
                        null,
                      )
                    }
                    className="rounded-[11px] border border-teal-100/[0.07] bg-teal-100/[0.018] px-3 py-2 text-[10px] font-semibold text-slate-400 transition hover:bg-teal-100/[0.04] hover:text-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="overflow-hidden rounded-[18px] border border-teal-100/[0.06] bg-[#06141e]/68">
                  <BiologicalArtwork
                    type="cell"
                    label={
                      selectedAtlasTerm.label
                    }
                    active
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-teal-200/[0.11] bg-teal-200/[0.04] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-teal-200">
                    {selectedAtlasTerm.ontologyLabel}
                  </span>

                  <span className="inline-flex rounded-full border border-teal-100/[0.05] bg-black/[0.1] px-3 py-1.5 font-mono text-[9px] uppercase text-slate-500">
                    {selectedAtlasTerm.ontology.toUpperCase()}
                  </span>
                </div>

                <h2 id="cell-atlas-inspector-title" className="mt-4 text-[29px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#f0fbfa]">
                  {selectedAtlasTerm.label}
                </h2>

                <InspectorSection
                  eyebrow="Ontology definition"
                  tone="teal"
                >
                  <p className="text-[13px] leading-6 text-slate-300">
                    {selectedAtlasTerm.description ||
                      "No formal definition was returned by the ontology service."}
                  </p>
                </InspectorSection>

                <InspectorSection
                  eyebrow="Known synonyms"
                  tone="sky"
                >
                  {selectedAtlasTerm
                    .synonyms.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAtlasTerm.synonyms.map(
                        (
                          synonym,
                        ) => (
                          <span
                            key={
                              synonym
                            }
                            className="rounded-full border border-teal-100/[0.055] bg-black/[0.1] px-3 py-2 text-[10px] text-slate-400"
                          >
                            {
                              synonym
                            }
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      No synonyms were returned.
                    </p>
                  )}
                </InspectorSection>

                <InspectorSection
                  eyebrow="Provenance"
                  tone="amber"
                >
                  <div className="space-y-2">
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
                </InspectorSection>

                <div className="mt-5 rounded-[15px] border border-amber-200/[0.09] bg-amber-200/[0.025] p-4">
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />

                    <p className="text-[10px] leading-5 text-amber-100/65">
                      BioLayers currently displays ontology metadata supplied by the external service.
                      Molecular markers, disease associations and anatomical locations should be added
                      only after connecting verified domain-specific sources.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 border-t border-teal-100/[0.065] bg-[#081722]/95 p-4 sm:px-6">
                <button
                  type="button"
                  onClick={() =>
                    toggleFavoriteCell(
                      selectedAtlasTerm,
                    )
                  }
                  className="rounded-[13px] border border-teal-100/[0.07] bg-teal-100/[0.018] px-4 py-3 text-[11px] font-semibold text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-100/[0.04]"
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
                  className="group relative overflow-hidden rounded-[13px] border border-teal-200/[0.16] bg-[linear-gradient(135deg,#99f6e4,#67e8f9)] px-4 py-3 text-[11px] font-extrabold text-[#062029] shadow-[0_10px_26px_rgba(45,212,191,.11)] transition duration-300 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
                  <span className="relative">
                    Add to graph
                  </span>
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
    <div className="min-w-[78px] rounded-[13px] border border-teal-100/[0.055] bg-black/[0.1] px-3 py-2.5 text-center">
      <p className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">
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
    <div className="flex items-start justify-between gap-4 rounded-[12px] border border-teal-100/[0.045] bg-black/[0.09] px-3.5 py-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </span>

      <span className="max-w-[66%] break-words text-right font-mono text-[10px] text-slate-300">
        {value}
      </span>
    </div>
  );
}

function InspectorSection({
  eyebrow,
  tone,
  children,
}: {
  eyebrow: string;
  tone: "teal" | "sky" | "amber";
  children: React.ReactNode;
}) {
  const toneClass = {
    teal: "text-teal-300",
    sky: "text-sky-300",
    amber: "text-amber-300",
  }[tone];

  return (
    <section className="mt-5 rounded-[16px] border border-teal-100/[0.055] bg-[#0a1b26]/44 p-4">
      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${toneClass}`}>
        {eyebrow}
      </p>

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}