import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import MicroscopyViewer from "../../components/atlas/MicroscopyViewer";
import MigrationTrajectoryViewer from "../../components/atlas/MigrationTrajectoryViewer";
import EvidenceTag, { fromPipelineLevel } from "../../components/home/EvidenceTag";
import { btnSecondary, pageShell, textLink } from "../../components/ui/styles";
import { AmbientGlow } from "../../components/ui/Chrome";
import { CELL_TYPES_UNDER_REVIEW } from "../../lib/atlasIntegrity";
import { getCellAtlasDetailById } from "../../lib/atlasSeedData";
import type { AssociatedBiologicalEntity } from "../../lib/atlasTypes";
import { MODALITY_LABELS } from "../../lib/atlasTypes";

type PageProps = {
  params: Promise<{ cell_id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cell_id } = await params;
  const detail = getCellAtlasDetailById(cell_id);

  if (!detail) {
    return { title: "Cell not found" };
  }

  return {
    title: `${detail.cellType.name}, cell atlas`,
    description: detail.cellType.biologicalContext,
  };
}

function EntityList({
  title,
  items,
  refLabel,
  showEvidence = true,
}: {
  title: string;
  items: AssociatedBiologicalEntity[];
  refLabel?: string;
  showEvidence?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`${title}-heading`} className="border-t border-rule pt-6">
      <h3 id={`${title}-heading`} className="text-base font-semibold">
        {title} <span className="font-normal text-graphite">({items.length})</span>
      </h3>
      <ul className="mt-3 space-y-5">
        {items.map((item) => (
          <li key={item.id}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-medium text-ink-strong">{item.label || item.identifier}</span>
              {showEvidence && <EvidenceTag level={fromPipelineLevel(item.evidenceLevel)} />}
            </div>
            <p className="mt-1 max-w-prose leading-relaxed text-graphite">{item.description}</p>
            {item.externalRef && (
              <p className="mt-1 text-sm text-graphite-soft">
                {refLabel ?? "Reference"} <span className="font-mono text-[13px]">{item.externalRef}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SourceField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule py-3 first:border-t-0 first:pt-0">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}

export default async function CellCardPage({ params }: PageProps) {
  const { cell_id } = await params;
  const detail = getCellAtlasDetailById(cell_id);

  if (!detail) {
    notFound();
  }

  const { cellType, image, morphologySummary, entities } = detail;
  const underReview = CELL_TYPES_UNDER_REVIEW.has(cellType.id);
  const ontologyUrl = cellType.ontologyId?.startsWith("CL:")
    ? `https://www.ebi.ac.uk/ols4/ontologies/cl/classes?obo_id=${encodeURIComponent(cellType.ontologyId)}`
    : null;

  return (
    <div className={`relative isolate ${pageShell} pt-28 pb-28`}>
      <AmbientGlow />
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-400">
        <Link href="/cells" className="hover:text-ink">
          Cell atlas
        </Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span aria-current="page" className="text-ink">{cellType.name}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-6 border-b border-rule pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{cellType.name}</h1>
          <p className="mt-2 font-mono text-sm text-slate-400">
            {image.cellLine}, {cellType.tissue.toLowerCase()}, {cellType.organism}
            {cellType.disease ? `. ${cellType.disease}` : ""}
          </p>
          {cellType.ontologyId && (
            <p className="mt-2 text-sm text-graphite">
              Cell Ontology{" "}
              {ontologyUrl ? (
                <a href={ontologyUrl} target="_blank" rel="noopener noreferrer" className={`${textLink} font-mono`}>
                  {cellType.ontologyId}
                </a>
              ) : (
                <span className="font-mono text-ink">{cellType.ontologyId}</span>
              )}
            </p>
          )}
          {underReview && (
            <p
              role="note"
              className="mt-4 max-w-2xl rounded-[20px] border border-stain-rfp/35 bg-stain-rfp/[0.07] px-4 py-3 text-sm leading-relaxed text-ink"
            >
              <strong className="font-medium text-stain-rfp-bright">Provenance under review.</strong>{" "}
              The accession cited for this record belongs to an unrelated study, and the image shown
              is of U2OS nuclei from BBBC039, not fibroblasts. Do not cite this record until its
              source is verified.
            </p>
          )}
        </div>
        <Link href="/mindmap" className={btnSecondary}>
          Map a related paper
        </Link>
      </header>

      <section aria-labelledby="image-heading" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="image-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            {image.title}
          </h2>
          <p className="text-sm tabular-nums text-graphite">
            {MODALITY_LABELS[image.microscopyModality]}, {image.widthPx} × {image.heightPx} px,{" "}
            {image.pixelSizeUm} µm per pixel
          </p>
        </div>
        <div className="mt-4">
          <MicroscopyViewer image={image} />
        </div>
      </section>

      {(image.isFlagship || cellType.id === "caf-cxcl12") && (
        <section className="mt-14">
          <MigrationTrajectoryViewer backgroundImageUrl={image.thumbnailUrl} />
        </section>
      )}

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <section aria-labelledby="context-heading">
            <h2 id="context-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Biological context
            </h2>
            <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink">
              {cellType.biologicalContext}
            </p>
            {cellType.lineage && (
              <p className="mt-2 text-graphite">Lineage: {cellType.lineage}</p>
            )}
          </section>

          <section aria-labelledby="measures-heading" className="border-t border-rule pt-6">
            <h3 id="measures-heading" className="text-base font-semibold">
              Measured in the image
            </h3>
            <div className="mt-1.5">
              {underReview ? (
                <span className="text-sm font-medium text-stain-rfp-bright">
                  Not verified: source under review
                </span>
              ) : (
                <EvidenceTag level="observed" />
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Objects segmented</dt>
                <dd className="text-xl tabular-nums text-ink-strong">
                  {morphologySummary.totalSegmentedObjects}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Mean circularity</dt>
                <dd className="text-xl tabular-nums text-ink-strong">
                  {morphologySummary.meanCircularity.toFixed(3)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Mean aspect ratio</dt>
                <dd className="text-xl tabular-nums text-ink-strong">
                  {morphologySummary.meanAspectRatio.toFixed(2)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-sm text-graphite-soft">
              Segmentation model: {morphologySummary.benchmarkModel}
            </p>
          </section>

          <EntityList title="Phenotypes" items={entities.phenotypes} />
          <EntityList title="Genes" items={entities.genes} />
          <EntityList title="Proteins" items={entities.proteins} />
          <EntityList title="Pathways" items={entities.pathways} refLabel="Reactome ID" />
          <EntityList title="Diseases" items={entities.diseases} refLabel="Disease Ontology ID" showEvidence={false} />

          {entities.literature.length > 0 && (
            <section aria-labelledby="literature-heading" className="border-t border-rule pt-6">
              <h3 id="literature-heading" className="text-base font-semibold">
                Literature <span className="font-normal text-graphite">({entities.literature.length})</span>
              </h3>
              <ul className="mt-3 space-y-5">
                {entities.literature.map((paper) => (
                  <li key={paper.id}>
                    <p className="font-medium text-ink-strong">{paper.label}</p>
                    <p className="mt-1 max-w-prose leading-relaxed text-graphite">{paper.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <EvidenceTag level="literature" />
                      {paper.pmid && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${textLink} text-sm`}
                        >
                          PubMed {paper.pmid}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="source-heading" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-5">
            <h2 id="source-heading" className="font-sans text-base font-semibold">
              Source and licence
            </h2>
            <dl className="mt-4">
              <SourceField label="Repository">{image.source}</SourceField>
              <SourceField label="Accession">
                <span className="font-mono text-[13px]">{image.datasetAccession}</span>
              </SourceField>
              <SourceField label="Licence">{image.license}</SourceField>
              <SourceField label="Attribution">{image.attribution}</SourceField>
              {image.doiPmid && <SourceField label="Publication">{image.doiPmid}</SourceField>}
              <SourceField label="Microscope">{image.microscope}</SourceField>
              <SourceField label="Objective">{image.objective}</SourceField>
              <SourceField label="Stain">{image.staining}</SourceField>
              <SourceField label="Treatment">{image.treatment}</SourceField>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
