"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { DATASETS_UNDER_REVIEW, REVIEW_NOTE } from "../../lib/atlasIntegrity";
import { MASTER_CATALOG_RECORDS, queryMasterCatalog } from "../../lib/atlasMasterCatalog";
import type { MasterCatalogRecord, MicroscopyModality } from "../../lib/atlasTypes";
import { MODALITY_LABELS } from "../../lib/atlasTypes";
import { btnSecondary, fieldInput, textLink } from "../ui/styles";

const PAGE_SIZE = 25;

const SHORT_MODALITY: Partial<Record<MicroscopyModality, string>> = {
  confocal: "Confocal",
  fluorescence: "Fluorescence",
  brightfield: "Brightfield",
  phase_contrast: "Phase contrast",
  dic: "DIC",
};

function licenceTone(record: MasterCatalogRecord) {
  if (DATASETS_UNDER_REVIEW.has(record.dataset_id)) {
    return { text: "text-stain-rfp-bright", note: "Provenance under review" };
  }
  if (record.commercial_use === "Permitted") {
    return { text: "text-stain-fitc-bright", note: "Commercial use allowed" };
  }
  if (record.commercial_use === "Non-Commercial Only") {
    return { text: "text-stain-yfp-bright", note: "Non-commercial only" };
  }
  return { text: "text-stain-rfp-bright", note: "Restricted" };
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="border-t border-rule py-2.5">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-ink">{value || "Not recorded"}</dd>
    </div>
  );
}

export default function MasterCatalogView() {
  const [search, setSearch] = useState("");
  const [modality, setModality] = useState<MicroscopyModality | "all">("all");
  const [organism, setOrganism] = useState("all");
  const [tissue, setTissue] = useState("all");
  const [dataset, setDataset] = useState("all");
  const [commercialOnly, setCommercialOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<MasterCatalogRecord | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { records, total, totalPages, facets } = useMemo(
    () =>
      queryMasterCatalog({
        search,
        modality,
        organism,
        tissue,
        dataset,
        commercialOnly,
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, modality, organism, tissue, dataset, commercialOnly, page],
  );

  const filtered =
    Boolean(search) ||
    modality !== "all" ||
    organism !== "all" ||
    tissue !== "all" ||
    dataset !== "all" ||
    commercialOnly;

  // Every filter change returns to the first page.
  const withReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(0);
    };

  const resetFilters = () => {
    setSearch("");
    setModality("all");
    setOrganism("all");
    setTissue("all");
    setDataset("all");
    setCommercialOnly(false);
    setPage(0);
  };

  const openRecord = (record: MasterCatalogRecord) => {
    setSelected(record);
    dialogRef.current?.showModal();
  };

  const selectClass =
    "min-h-11 w-full rounded-md border border-rule-strong bg-field-deep px-3 text-sm text-ink focus:border-hoechst focus:outline-none";

  const firstShown = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastShown = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[2fr_repeat(4,1fr)]">
        <div>
          <label htmlFor="catalog-search" className="text-sm text-graphite">
            Search
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              value={search}
              onChange={(event) => withReset(setSearch)(event.target.value)}
              placeholder="Cell line, disease, stain or dataset"
              className={`${fieldInput} pl-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="catalog-modality" className="text-sm text-graphite">
            Microscopy
          </label>
          <select
            id="catalog-modality"
            value={modality}
            onChange={(event) =>
              withReset(setModality)(event.target.value as MicroscopyModality | "all")
            }
            className={`${selectClass} mt-1.5`}
          >
            <option value="all">All types</option>
            {facets.modalities.map((item) => (
              <option key={item.value} value={item.value}>
                {MODALITY_LABELS[item.value as MicroscopyModality] || item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-organism" className="text-sm text-graphite">
            Organism
          </label>
          <select
            id="catalog-organism"
            value={organism}
            onChange={(event) => withReset(setOrganism)(event.target.value)}
            className={`${selectClass} mt-1.5`}
          >
            <option value="all">All organisms</option>
            {facets.organisms.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-tissue" className="text-sm text-graphite">
            Tissue
          </label>
          <select
            id="catalog-tissue"
            value={tissue}
            onChange={(event) => withReset(setTissue)(event.target.value)}
            className={`${selectClass} mt-1.5`}
          >
            <option value="all">All tissues</option>
            {facets.tissues.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-dataset" className="text-sm text-graphite">
            Dataset
          </label>
          <select
            id="catalog-dataset"
            value={dataset}
            onChange={(event) => withReset(setDataset)(event.target.value)}
            className={`${selectClass} mt-1.5`}
          >
            <option value="all">All datasets</option>
            {facets.datasets.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={commercialOnly}
            onChange={() => withReset(setCommercialOnly)(!commercialOnly)}
            className="h-4 w-4"
          />
          Only images licensed for commercial use ({facets.commercialCount})
        </label>

        <p className="text-sm text-graphite" aria-live="polite">
          {total === 0
            ? "No records match"
            : `Showing ${firstShown}–${lastShown} of ${total} records`}
          {filtered && (
            <>
              {" "}
              <button type="button" onClick={resetFilters} className={`${textLink} ml-2`}>
                Clear filters
              </button>
            </>
          )}
        </p>
      </div>

      {total === 0 ? (
        <div className="mt-6 rounded-[20px] border border-rule px-6 py-14 text-center">
          <p className="text-lg text-ink-strong">No records match these filters</p>
          <p className="mt-2 text-graphite">
            Try a broader search, or clear the filters to see all {MASTER_CATALOG_RECORDS.length}{" "}
            records.
          </p>
          <button type="button" onClick={resetFilters} className={`${btnSecondary} mt-6`}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[20px] border border-rule">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Cell atlas catalogue records</caption>
            <thead className="border-b border-teal-100/10 bg-white/[0.03]">
              <tr>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-200">Cell line</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-200">Dataset</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Microscopy</th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Tissue</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-200">Licence</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-200">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {records.map((record) => {
                const tone = licenceTone(record);
                return (
                  <tr key={record.image_id} className="align-top transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-strong">{record.cell_line}</div>
                      <div className="mt-0.5 line-clamp-1 max-w-xs text-graphite">{record.phenotype}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">{record.dataset_id}</td>
                    <td className="hidden px-4 py-3 text-ink md:table-cell">
                      {SHORT_MODALITY[record.microscopy_type] ?? MODALITY_LABELS[record.microscopy_type]}
                    </td>
                    <td className="hidden px-4 py-3 text-ink lg:table-cell">
                      {record.tissue}
                      {record.disease && <div className="text-graphite">{record.disease}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{record.license}</div>
                      <div className={tone.text}>{tone.note}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openRecord(record)}
                        className={`${textLink} inline-flex min-h-10 items-center whitespace-nowrap`}
                      >
                        Provenance
                        <span className="sr-only"> for {record.image_id}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Catalogue pages" className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            className={btnSecondary}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <span className="text-sm text-graphite">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            className={btnSecondary}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="record-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-[90vh] w-[min(94vw,42rem)] overflow-y-auto rounded-[24px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-0 text-ink backdrop:bg-black/80"
      >
        {selected && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[13px] text-graphite">{selected.image_id}</p>
                <h2 id="record-title" className="mt-1 text-2xl">
                  {selected.cell_line}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close provenance details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-graphite transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {DATASETS_UNDER_REVIEW.has(selected.dataset_id) && (
              <p
                role="note"
                className="mt-4 rounded-[20px] border border-stain-rfp/35 bg-stain-rfp/[0.07] px-4 py-3 text-sm leading-relaxed text-ink"
              >
                {REVIEW_NOTE}
              </p>
            )}

            <p className="mt-3 leading-relaxed text-ink">{selected.phenotype}</p>

            <dl className="mt-5 grid gap-x-6 sm:grid-cols-2">
              <Field label="Organism" value={selected.organism} />
              <Field label="Tissue" value={selected.tissue} />
              <Field label="Disease" value={selected.disease} />
              <Field
                label="Microscopy"
                value={`${MODALITY_LABELS[selected.microscopy_type]}${
                  selected.magnification ? `, ${selected.magnification}` : ""
                }`}
              />
              <Field label="Pixel size" value={selected.pixel_size} />
              <Field label="Frame interval" value={selected.time_interval} />
              <Field label="Stain" value={selected.staining} />
              <Field label="Treatment" value={selected.treatment} />
              <Field label="Licence" value={`${selected.license}. ${licenceTone(selected).note}.`} />
              <Field label="Curation" value={`${selected.verification_status}, ${selected.curator}`} />
            </dl>

            <div className="mt-5 border-t border-rule pt-4">
              <p className="text-sm text-graphite">Source</p>
              <p className="mt-1 leading-relaxed text-ink">
                {selected.source}. {selected.citation}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {selected.PMID && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${selected.PMID}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={textLink}
                  >
                    PubMed {selected.PMID}
                  </a>
                )}
                {selected.DOI && (
                  <a
                    href={`https://doi.org/${selected.DOI}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={textLink}
                  >
                    DOI {selected.DOI}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
