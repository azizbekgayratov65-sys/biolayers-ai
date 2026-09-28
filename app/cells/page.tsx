"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Microscope,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import MicroscopyViewer from "../components/atlas/MicroscopyViewer";
import { SEED_CELL_ATLAS_ENTRIES } from "../lib/atlasSeedData";
import type { CellAtlasDetail, MicroscopyModality } from "../lib/atlasTypes";
import { MODALITY_LABELS } from "../lib/atlasTypes";

export default function CellAtlasCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModality, setSelectedModality] = useState<MicroscopyModality | "all">("all");
  const [selectedOrganism, setSelectedOrganism] = useState<string>("all");
  const [selectedTissue, setSelectedTissue] = useState<string>("all");
  const [previewEntry, setPreviewEntry] = useState<CellAtlasDetail | null>(null);

  // Available filter options
  const organisms = useMemo(() => {
    return Array.from(new Set(SEED_CELL_ATLAS_ENTRIES.map((e) => e.cellType.organism)));
  }, []);

  const tissues = useMemo(() => {
    return Array.from(new Set(SEED_CELL_ATLAS_ENTRIES.map((e) => e.cellType.tissue)));
  }, []);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return SEED_CELL_ATLAS_ENTRIES.filter((entry) => {
      // Modality filter
      if (selectedModality !== "all" && entry.image.microscopyModality !== selectedModality) {
        return false;
      }
      // Organism filter
      if (selectedOrganism !== "all" && entry.cellType.organism !== selectedOrganism) {
        return false;
      }
      // Tissue filter
      if (selectedTissue !== "all" && entry.cellType.tissue !== selectedTissue) {
        return false;
      }
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          entry.cellType.name,
          entry.cellType.label,
          entry.cellType.disease,
          entry.cellType.tissue,
          entry.image.cellLine,
          entry.image.staining,
          entry.image.datasetAccession,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery, selectedModality, selectedOrganism, selectedTissue]);

  return (
    <div className="relative isolate min-h-screen bg-transparent text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Ambient background glow atmospheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-20 h-[550px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.04] blur-[170px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/2 -z-20 h-[450px] w-[450px] rounded-full bg-sky-400/[0.03] blur-[150px]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="relative border-b border-teal-500/15 pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-200 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(77,141,255,0.12)]">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-teal-100">
              BioLayers Cell Atlas · Phase 1 Foundation
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-5xl text-white">
                From Papers to{" "}
                <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                  Living Cells
                </span>
              </h1>
              <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-300/90 leading-relaxed">
                Explore calibrated microscopy, multi-channel fluorophore staining, and quantitative
                morphology across verified oncology specimens. Every image is grounded in peer-reviewed literature
                and open-access provenance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-[16px] border border-teal-500/25 bg-[#08121f]/75 px-5 py-3 backdrop-blur-md shadow-lg">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  VERIFIED SPECIMENS
                </span>
                <span className="font-mono text-2xl font-bold text-teal-200 tabular-nums">
                  {SEED_CELL_ATLAS_ENTRIES.length} Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by cell type, line, marker (e.g. CAF, alpha-SMA, U2OS)…"
              aria-label="Search specimen catalog"
              className="w-full min-h-[46px] rounded-[14px] border border-teal-500/25 bg-[#070e1a]/90 py-2.5 pl-10 pr-12 text-base sm:text-sm text-slate-100 placeholder-slate-400 shadow-inner transition-[border-color,box-shadow] focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search input"
                className="absolute right-3 top-2.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Organism Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedOrganism}
              onChange={(e) => setSelectedOrganism(e.target.value)}
              aria-label="Filter by organism"
              style={{ colorScheme: "dark" }}
              className="w-full min-h-[46px] rounded-[14px] border border-teal-500/20 bg-[#070e1a] py-2.5 px-3.5 text-sm font-medium text-slate-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            >
              <option value="all">All Organisms</option>
              {organisms.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          {/* Tissue Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedTissue}
              onChange={(e) => setSelectedTissue(e.target.value)}
              aria-label="Filter by tissue"
              style={{ colorScheme: "dark" }}
              className="w-full min-h-[46px] rounded-[14px] border border-teal-500/20 bg-[#070e1a] py-2.5 px-3.5 text-sm font-medium text-slate-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            >
              <option value="all">All Tissues</option>
              {tissues.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modality Filter Tabs */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Microscopy modalities">
          <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1.5 shrink-0">
            <Filter className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" /> Modality:
          </span>
          {(["all", "confocal", "fluorescence", "brightfield", "phase_contrast", "two_photon", "electron", "super_resolution", "light_sheet", "tirf", "dic", "atomic_force", "cryo_em", "multiplex_ihc"] as const).map((mod) => {
            const active = selectedModality === mod;
            return (
              <button
                key={mod}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedModality(mod)}
                style={{ touchAction: "manipulation" }}
                className={`min-h-[34px] whitespace-nowrap rounded-[10px] px-3.5 py-1.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow] ${
                  active
                    ? "border border-teal-300/40 bg-teal-400/20 text-white font-semibold shadow-[0_0_12px_rgba(77,141,255,0.2)]"
                    : "border border-white/5 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
              >
                {mod === "all" ? "All Modalities" : MODALITY_LABELS[mod] || mod}
              </button>
            );
          })}
        </div>

        {/* Live Interactive Quick-Preview Modal (If toggled) */}
        {previewEntry && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            className="mt-8 rounded-[24px] border border-teal-400/35 bg-[#060c16]/95 p-6 shadow-2xl backdrop-blur-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-4 mb-4">
              <div>
                <span className="font-mono text-[10px] font-semibold text-teal-300 tracking-wider uppercase">
                  Interactive Specimen Preview
                </span>
                <h3 id="preview-modal-title" className="text-lg font-bold text-white mt-0.5">
                  {previewEntry.cellType.name} · {previewEntry.image.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/cells/${previewEntry.cellType.id}`}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-[12px] border border-teal-400/40 bg-teal-500/20 px-4 py-2 text-xs font-bold text-teal-100 hover:bg-teal-500/30 transition shadow-sm"
                >
                  Open Full Cell Card <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewEntry(null)}
                  aria-label="Close interactive preview"
                  className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-[12px] p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <MicroscopyViewer image={previewEntry.image} />
          </div>
        )}

        {/* Specimen Catalog Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => {
            const isFlagship = entry.image.isFlagship;

            return (
              <div
                key={entry.cellType.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[22px] border transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-2xl ${
                  isFlagship
                    ? "border-teal-400/40 bg-gradient-to-b from-[#081322] to-[#040912] shadow-[0_0_35px_rgba(77,141,255,0.12)]"
                    : "border-teal-500/20 bg-[#060b14]/90 hover:border-teal-400/35"
                }`}
              >
                {/* Card Top: Image Thumbnail with Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.image.thumbnailUrl}
                    alt={entry.image.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] via-transparent to-black/50" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-md border border-teal-400/35 bg-[#060c16]/90 px-2.5 py-1 font-mono text-[10px] font-bold text-teal-200 backdrop-blur-md">
                      {entry.image.microscopyModality.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isFlagship && (
                        <span className="rounded-md border border-teal-400/40 bg-teal-500/25 px-2.5 py-1 text-[10px] font-bold text-teal-100 tracking-wide uppercase backdrop-blur-md">
                          Flagship Study
                        </span>
                      )}
                      <span className="rounded-md border border-white/15 bg-black/80 px-2 py-1 font-mono text-[10px] font-semibold text-slate-200 backdrop-blur-md flex items-center gap-1">
                        <Layers className="h-3 w-3 text-teal-300" aria-hidden="true" />
                        {entry.image.channelCount}&nbsp;ch
                      </span>
                    </div>
                  </div>

                  {/* Bottom Quick Action: Quick View */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="button"
                      onClick={() => setPreviewEntry(entry)}
                      style={{ touchAction: "manipulation" }}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[12px] border border-teal-300/40 bg-[#08121f]/95 px-3 py-1.5 text-xs font-bold text-teal-100 backdrop-blur-md hover:bg-teal-500/30 transition-[background-color,border-color] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Quick Viewer
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{entry.cellType.tissue}</span>
                    <span className="font-mono text-[10px] font-bold text-teal-300">
                      {entry.cellType.ontologyId}
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-lg font-bold text-white group-hover:text-teal-200 transition-colors">
                    {entry.cellType.name}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {entry.cellType.biologicalContext}
                  </p>

                  {/* Provenance Metadata Snapshot */}
                  <div className="mt-4 rounded-[14px] border border-white/10 bg-white/[0.03] p-3.5 text-[11px] space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Cell Line:</span>
                      <span className="font-semibold text-slate-100">{entry.image.cellLine}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Staining:</span>
                      <span className="font-semibold text-slate-100 truncate max-w-[180px]">
                        {entry.image.staining}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Accession:</span>
                      <span className="font-mono font-bold text-teal-300">{entry.image.datasetAccession}</span>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" /> {entry.image.license}
                    </span>

                    <Link
                      href={`/cells/${entry.cellType.id}`}
                      style={{ touchAction: "manipulation" }}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] px-2.5 py-1 text-xs font-bold text-teal-200 hover:text-white transition-colors group-hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      View Cell Card <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
