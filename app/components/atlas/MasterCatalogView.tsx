"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Microscope,
  ShieldCheck,
  ExternalLink,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  MASTER_CATALOG_RECORDS,
  queryMasterCatalog,
} from "../../lib/atlasMasterCatalog";
import type { MasterCatalogRecord, MicroscopyModality } from "../../lib/atlasTypes";
import { MODALITY_LABELS } from "../../lib/atlasTypes";

export default function MasterCatalogView() {
  const [search, setSearch] = useState("");
  const [modality, setModality] = useState<MicroscopyModality | "all">("all");
  const [organism, setOrganism] = useState<string>("all");
  const [tissue, setTissue] = useState<string>("all");
  const [dataset, setDataset] = useState<string>("all");
  const [commercialOnly, setCommercialOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [selectedRecord, setSelectedRecord] = useState<MasterCatalogRecord | null>(null);

  const pageSize = 24;

  const queryResult = useMemo(() => {
    return queryMasterCatalog({
      search,
      modality,
      organism,
      tissue,
      dataset,
      commercialOnly,
      page,
      pageSize,
    });
  }, [search, modality, organism, tissue, dataset, commercialOnly, page]);

  const { records, total, totalPages, facets } = queryResult;

  // Reset page to 0 whenever filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleModalityChange = (val: MicroscopyModality | "all") => {
    setModality(val);
    setPage(0);
  };

  const handleOrganismChange = (val: string) => {
    setOrganism(val);
    setPage(0);
  };

  const handleTissueChange = (val: string) => {
    setTissue(val);
    setPage(0);
  };

  const handleDatasetChange = (val: string) => {
    setDataset(val);
    setPage(0);
  };

  const handleCommercialToggle = () => {
    setCommercialOnly((prev) => !prev);
    setPage(0);
  };

  const resetAllFilters = () => {
    setSearch("");
    setModality("all");
    setOrganism("all");
    setTissue("all");
    setDataset("all");
    setCommercialOnly(false);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Controls Container */}
      <div className="rounded-[22px] border border-teal-500/20 bg-[#070e1a]/90 p-5 backdrop-blur-xl shadow-xl space-y-4">
        {/* Search and Commercial Toggle Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              inputMode="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search 634 records by cell line, disease, phenotype, dataset ID (e.g. U2OS, MDA-MB-231, BBBC039v1)..."
              aria-label="Search master cell catalog"
              className="w-full min-h-[46px] rounded-[14px] border border-teal-500/25 bg-[#050912] py-2.5 pl-10 pr-12 text-sm text-slate-100 placeholder-slate-400 shadow-inner transition-[border-color,box-shadow] focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search input"
                className="absolute right-3 top-2.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCommercialToggle}
            className={`inline-flex min-h-[46px] items-center gap-2 rounded-[14px] border px-4 py-2.5 text-xs font-semibold transition-[background-color,border-color,color] ${
              commercialOnly
                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>Commercial Use Permitted Only</span>
            {commercialOnly && (
              <span className="ml-1 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                {facets.commercialCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Modality */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Microscopy Modality
            </label>
            <select
              value={modality}
              onChange={(e) => handleModalityChange(e.target.value as MicroscopyModality | "all")}
              aria-label="Filter by modality"
              style={{ colorScheme: "dark" }}
              className="w-full min-h-[40px] rounded-[10px] border border-teal-500/20 bg-[#050912] py-2 px-3 text-slate-200 focus:border-teal-400 focus:outline-none"
            >
              <option value="all">All Modalities ({MASTER_CATALOG_RECORDS.length})</option>
              {facets.modalities.map((m) => (
                <option key={m.value} value={m.value}>
                  {MODALITY_LABELS[m.value as MicroscopyModality] || m.value} ({m.count})
                </option>
              ))}
            </select>
          </div>

          {/* Organism */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Organism / Host
            </label>
            <select
              value={organism}
              onChange={(e) => handleOrganismChange(e.target.value)}
              aria-label="Filter by organism"
              style={{ colorScheme: "dark" }}
              className="w-full min-h-[40px] rounded-[10px] border border-teal-500/20 bg-[#050912] py-2 px-3 text-slate-200 focus:border-teal-400 focus:outline-none"
            >
              <option value="all">All Organisms</option>
              {facets.organisms.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.value} ({o.count})
                </option>
              ))}
            </select>
          </div>

          {/* Tissue */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Tissue of Origin
            </label>
            <select
              value={tissue}
              onChange={(e) => handleTissueChange(e.target.value)}
              aria-label="Filter by tissue"
              style={{ colorScheme: "dark" }}
              className="w-full min-h-[40px] rounded-[10px] border border-teal-500/20 bg-[#050912] py-2 px-3 text-slate-200 focus:border-teal-400 focus:outline-none"
            >
              <option value="all">All Tissues</option>
              {facets.tissues.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.value} ({t.count})
                </option>
              ))}
            </select>
          </div>

          {/* Dataset Accession */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Dataset Accession
            </label>
            <select
              value={dataset}
              onChange={(e) => handleDatasetChange(e.target.value)}
              aria-label="Filter by dataset accession"
              style={{ colorScheme: "dark" }}
              className="w-full min-h-[40px] rounded-[10px] border border-teal-500/20 bg-[#050912] py-2 px-3 text-slate-200 focus:border-teal-400 focus:outline-none"
            >
              <option value="all">All Datasets (15 Accessions)</option>
              {facets.datasets.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.value} ({d.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span>Showing <strong className="text-teal-200">{records.length}</strong> of <strong className="text-teal-200">{total}</strong> records</span>
            {(search || modality !== "all" || organism !== "all" || tissue !== "all" || dataset !== "all" || commercialOnly) && (
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-teal-300 font-bold">Filtered</span>
            )}
          </div>

          {(search || modality !== "all" || organism !== "all" || tissue !== "all" || dataset !== "all" || commercialOnly) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-teal-400 hover:text-teal-200 font-semibold underline underline-offset-2 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Records Grid */}
      {records.length === 0 ? (
        <div className="rounded-[22px] border border-white/10 bg-[#060b14] p-12 text-center">
          <Microscope className="mx-auto h-10 w-10 text-slate-500 mb-3" aria-hidden="true" />
          <h3 className="text-lg font-bold text-white">No microscopy records matched your query</h3>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search terms, changing the modality filter, or toggling commercial permissions.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/15 px-4 py-2 text-xs font-bold text-teal-200 hover:bg-teal-500/25 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map((record) => {
            const isCommercial = record.commercial_use === "Permitted";
            return (
              <div
                key={record.image_id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-teal-500/20 bg-[#060b14]/90 hover:border-teal-400/35 hover:-translate-y-0.5 transition-[transform,border-color,box-shadow] duration-200 shadow-md hover:shadow-xl p-5"
              >
                <div>
                  {/* Top Bar: Dataset & License */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <span className="font-mono text-[10px] font-bold text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded px-2 py-0.5">
                      {record.dataset_id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[9px] font-semibold px-2 py-0.5 rounded border ${
                        isCommercial
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-400/30 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {isCommercial ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                      {record.license}
                    </span>
                  </div>

                  {/* Title & Cell Line */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white group-hover:text-teal-200 transition-colors">
                        {record.cell_line}
                      </h4>
                      <span className="font-mono text-[10px] uppercase text-slate-400">
                        {record.microscopy_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300/90 mt-1 line-clamp-2">
                      {record.phenotype}
                    </p>
                  </div>

                  {/* Provenance Key-Value Badges */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Tissue / Host:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[170px]">
                        {record.tissue} ({record.organism})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Staining:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[170px]">
                        {record.staining}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Resolution:</span>
                      <span className="font-medium text-slate-200">{record.pixel_size}</span>
                    </div>
                    {record.treatment && (
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Treatment:</span>
                        <span className="font-medium text-teal-300 truncate max-w-[170px]">
                          {record.treatment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    {record.PMID && (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${record.PMID}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-teal-300 hover:underline"
                      >
                        PMID:{record.PMID} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {record.DOI && !record.PMID && (
                      <a
                        href={`https://doi.org/${record.DOI}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-teal-300 hover:underline"
                      >
                        DOI <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    style={{ touchAction: "manipulation" }}
                    className="inline-flex items-center gap-1 rounded-lg border border-teal-400/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-bold text-teal-200 hover:bg-teal-500/20 transition"
                  >
                    <Eye className="h-3 w-3" /> Full Provenance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="font-mono text-xs text-slate-400">
            Page <strong className="text-white">{page + 1}</strong> of <strong className="text-white">{totalPages}</strong>
          </div>

          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Full Provenance Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-teal-400/35 bg-[#060c16] p-6 shadow-2xl text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase text-teal-400 font-bold">
                  {selectedRecord.dataset_id} · {selectedRecord.image_id}
                </span>
                <h3 id="record-modal-title" className="text-xl font-bold text-white mt-1">
                  {selectedRecord.cell_line} ({selectedRecord.organism})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close modal"
                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 block text-[10px]">TISSUE & DISEASE</span>
                  <span className="text-slate-200 font-semibold">{selectedRecord.tissue} · {selectedRecord.disease || "None (Baseline)"}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 block text-[10px]">MICROSCOPY TYPE</span>
                  <span className="text-slate-200 font-semibold">{selectedRecord.microscopy_type} ({selectedRecord.magnification || "N/A"})</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 block text-[10px]">STAINING PROTOCOL</span>
                  <span className="text-slate-200 font-semibold">{selectedRecord.staining}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 block text-[10px]">EXPERIMENTAL TREATMENT</span>
                  <span className="text-slate-200 font-semibold">{selectedRecord.treatment}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 block text-[10px]">PIXEL SIZE</span>
                  <span className="text-slate-200 font-semibold">{selectedRecord.pixel_size}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 block text-[10px]">LICENSE & COMMERCIAL USE</span>
                  <span className="text-teal-300 font-semibold">{selectedRecord.license} · {selectedRecord.commercial_use}</span>
                </div>
              </div>

              {/* Phenotype Description */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <span className="text-slate-500 block text-[10px] mb-1">PHENOTYPIC PROFILE</span>
                <p className="text-slate-200 font-sans text-xs leading-relaxed">
                  {selectedRecord.phenotype}
                </p>
              </div>

              {/* Citation & Attribution */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <span className="text-slate-500 block text-[10px] mb-1">PEER-REVIEWED CITATION & SOURCE</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {selectedRecord.citation}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  {selectedRecord.PMID && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${selectedRecord.PMID}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-teal-300 hover:underline"
                    >
                      PubMed: {selectedRecord.PMID} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedRecord.DOI && (
                    <a
                      href={`https://doi.org/${selectedRecord.DOI}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-teal-300 hover:underline"
                    >
                      DOI: {selectedRecord.DOI} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 flex items-center justify-between">
                <span className="text-slate-400">Curator & Status:</span>
                <span className="text-teal-200 font-bold">{selectedRecord.curator} · {selectedRecord.verification_status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
