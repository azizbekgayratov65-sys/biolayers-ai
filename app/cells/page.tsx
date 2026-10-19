"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import MasterCatalogView from "../components/atlas/MasterCatalogView";
import { pageShell, textLink } from "../components/ui/styles";
import { AmbientGlow, Eyebrow } from "../components/ui/Chrome";
import { CELL_TYPES_UNDER_REVIEW } from "../lib/atlasIntegrity";
import { MASTER_CATALOG_RECORDS } from "../lib/atlasMasterCatalog";
import { SEED_CELL_ATLAS_ENTRIES } from "../lib/atlasSeedData";
import { MODALITY_LABELS } from "../lib/atlasTypes";

type View = "catalogue" | "specimens";

export default function CellAtlasPage() {
  const [view, setView] = useState<View>("catalogue");

  const datasetCount = useMemo(
    () => new Set(MASTER_CATALOG_RECORDS.map((record) => record.dataset_id)).size,
    [],
  );

  const tabs: { id: View; label: string; count: number }[] = [
    { id: "catalogue", label: "Catalogue", count: MASTER_CATALOG_RECORDS.length },
    { id: "specimens", label: "Specimens with images", count: SEED_CELL_ATLAS_ENTRIES.length },
  ];

  return (
    <div className={`relative isolate ${pageShell} max-w-7xl pt-28 pb-24 sm:pt-32`}>
      <AmbientGlow />
      <header className="max-w-3xl animate-fade-up">
        <Eyebrow icon={Sparkles}>Research-Grade Cell Atlas</Eyebrow>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Cell <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">atlas</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink">
          Real microscopy of cancer and reference cell lines, each record with its source dataset,
          licence and acquisition details.
        </p>
        <p className="mt-3 leading-relaxed text-graphite">
          {MASTER_CATALOG_RECORDS.length} records from {datasetCount} datasets: the Broad Bioimage
          Benchmark Collection, the Cell Tracking Challenge, the BioImage Archive, the Human
          Protein Atlas and the Allen Cell Explorer. No image here is AI-generated.
        </p>
      </header>

      <div role="tablist" aria-label="Atlas views" className="mt-10 flex gap-6 border-b border-rule">
        {tabs.map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setView(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  const next = tab.id === "catalogue" ? "specimens" : "catalogue";
                  setView(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
              className={`relative -mb-px min-h-12 border-b-2 text-sm transition-colors ${
                active
                  ? "border-hoechst font-medium text-ink-strong"
                  : "border-transparent text-graphite hover:text-ink"
              }`}
            >
              {tab.label} <span className="tabular-nums text-graphite">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${view}`}
        role="tabpanel"
        aria-labelledby={`tab-${view}`}
        className="mt-8"
      >
        {view === "catalogue" ? (
          <MasterCatalogView />
        ) : (
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SEED_CELL_ATLAS_ENTRIES.map((entry) => {
              const underReview = CELL_TYPES_UNDER_REVIEW.has(entry.cellType.id);
              return (
                <li key={entry.cellType.id}>
                  <Link href={`/cells/${entry.cellType.id}`} className="group block rounded-[20px]">
                    <div className="aspect-[4/3] overflow-hidden rounded-[20px] border border-teal-500/25 bg-black shadow-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.image.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                      />
                    </div>
                    <h2 className="mt-4 font-sans text-xl font-semibold text-ink-strong group-hover:text-hoechst-strong">
                      {entry.cellType.name}
                    </h2>
                  </Link>
                  <p className="mt-1 text-graphite">
                    {entry.image.cellLine}. {MODALITY_LABELS[entry.image.microscopyModality]}.
                  </p>
                  <p className="mt-2 line-clamp-3 leading-relaxed text-ink">
                    {entry.cellType.biologicalContext}
                  </p>
                  <dl className="mt-3 text-sm">
                    <div className="flex gap-2">
                      <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Accession</dt>
                      <dd className="font-mono text-[13px] text-ink">{entry.image.datasetAccession}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Licence</dt>
                      <dd className="text-ink">{entry.image.license}</dd>
                    </div>
                  </dl>
                  {underReview && (
                    <p className="mt-2 text-sm font-medium text-stain-rfp-bright">
                      Provenance under review
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <section aria-labelledby="rules-heading" className="mt-20 grid gap-8 border-t border-rule pt-10 lg:grid-cols-3">
        <h2 id="rules-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          How records get in
        </h2>
        <div className="space-y-4 leading-relaxed text-ink lg:col-span-2">
          <p>
            Every record names its dataset, accession and licence, and keeps the acquisition details
            the dataset publishes: organism, cell line, microscopy type, pixel size, stain and
            treatment.
          </p>
          <p>
            Licences differ. Broad Bioimage Benchmark images are public domain (CC0). Cell Tracking
            Challenge data is for research use, and some records are non-commercial. The catalogue
            shows the terms on every row, and you can filter to images licensed for commercial use.
          </p>
          <p>
            Records whose source we cannot confirm are marked &ldquo;provenance under review&rdquo; until
            they are verified or removed. See the{" "}
            <Link href="/validation" className={textLink}>
              validation report
            </Link>{" "}
            for how the segmentation and tracking were measured.
          </p>
        </div>
      </section>
    </div>
  );
}
