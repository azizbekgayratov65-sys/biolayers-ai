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
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>BioLayers Cell Atlas · Phase 1 Foundation</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                From Papers to Living Cells
              </h1>
              <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
                Explore calibrated microscopy, multi-channel fluorophore staining, and quantitative
                morphology across verified oncology specimens. Every image is grounded in peer-reviewed literature
                and open-access provenance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-teal-500/20 bg-[#08121f]/60 px-4 py-2.5 backdrop-blur-md">
                <span className="block font-mono text-xs text-slate-400">VERIFIED SPECIMENS</span>
                <span className="font-mono text-xl font-bold text-teal-300">
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
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by cell type, line, marker (e.g. CAF, alpha-SMA, U2OS)..."
              className="w-full rounded-xl border border-teal-500/25 bg-[#070e1a]/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
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
              className="w-full rounded-xl border border-teal-500/20 bg-[#070e1a]/80 py-2.5 px-3 text-sm text-slate-300 focus:border-teal-400 focus:outline-none"
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
              className="w-full rounded-xl border border-teal-500/20 bg-[#070e1a]/80 py-2.5 px-3 text-sm text-slate-300 focus:border-teal-400 focus:outline-none"
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
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Modality:
          </span>
          {(["all", "confocal", "fluorescence"] as const).map((mod) => {
            const active = selectedModality === mod;
            return (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModality(mod)}
                className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border border-teal-400/40 bg-teal-500/20 text-teal-200 font-semibold shadow-sm"
                    : "border border-transparent bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
                }`}
              >
                {mod === "all" ? "All Modalities" : MODALITY_LABELS[mod] || mod}
              </button>
            );
          })}
        </div>

        {/* Live Interactive Quick-Preview Modal (If toggled) */}
        {previewEntry && (
          <div className="mt-8 rounded-2xl border border-teal-400/30 bg-[#060c16]/95 p-6 shadow-2xl backdrop-blur-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-4 mb-4">
              <div>
                <span className="font-mono text-xs font-semibold text-teal-300 tracking-wide uppercase">
                  Interactive Specimen Preview
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {previewEntry.cellType.name} · {previewEntry.image.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/cells/${previewEntry.cellType.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/40 bg-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-200 hover:bg-teal-500/30 transition"
                >
                  Open Full Cell Card <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewEntry(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
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
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${
                  isFlagship
                    ? "border-teal-400/35 bg-gradient-to-b from-[#081322] to-[#040912] shadow-[0_0_30px_rgba(20,184,166,0.08)]"
                    : "border-teal-500/15 bg-[#060b14] hover:border-teal-500/30"
                }`}
              >
                {/* Card Top: Image Thumbnail with Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.image.thumbnailUrl}
                    alt={entry.image.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-md border border-teal-400/30 bg-[#060c16]/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-teal-300 backdrop-blur-md">
                      {entry.image.microscopyModality.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isFlagship && (
                        <span className="rounded-md border border-teal-400/40 bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-200 tracking-wide uppercase backdrop-blur-md">
                          Flagship Study
                        </span>
                      )}
                      <span className="rounded-md border border-white/10 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-md flex items-center gap-1">
                        <Layers className="h-2.5 w-2.5 text-teal-400" />
                        {entry.image.channelCount} ch
                      </span>
                    </div>
                  </div>

                  {/* Bottom Quick Action: Quick View */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="button"
                      onClick={() => setPreviewEntry(entry)}
                      className="inline-flex items-center gap-1 rounded-lg border border-teal-400/30 bg-[#08121f]/90 px-2.5 py-1 text-xs font-medium text-teal-200 backdrop-blur-md hover:bg-teal-500/30 transition shadow-md"
                    >
                      <Eye className="h-3 w-3" /> Quick Viewer
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{entry.cellType.tissue}</span>
                    <span className="font-mono text-[10px] text-teal-400/70">
                      {entry.cellType.ontologyId}
                    </span>
                  </div>

                  <h3 className="mt-1 text-lg font-bold text-white group-hover:text-teal-200 transition">
                    {entry.cellType.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {entry.cellType.biologicalContext}
                  </p>

                  {/* Provenance Metadata Snapshot */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Cell Line:</span>
                      <span className="font-medium text-slate-200">{entry.image.cellLine}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Staining:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">
                        {entry.image.staining}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Accession:</span>
                      <span className="font-mono text-teal-300">{entry.image.datasetAccession}</span>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> {entry.image.license}
                    </span>

                    <Link
                      href={`/cells/${entry.cellType.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-300 hover:text-teal-100 transition group-hover:translate-x-0.5"
                    >
                      View Cell Card <ArrowRight className="h-3.5 w-3.5" />
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
