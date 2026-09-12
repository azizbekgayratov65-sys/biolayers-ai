import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Dna,
  Layers,
  Microscope,
  BookOpen,
  Activity,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  GitFork,
} from "lucide-react";
import MicroscopyViewer from "../../components/atlas/MicroscopyViewer";
import { getCellAtlasDetailById } from "../../lib/atlasSeedData";
import { EVIDENCE_BADGES, type EvidenceLevel } from "../../lib/atlasTypes";

type PageProps = {
  params: Promise<{ cell_id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cell_id } = await params;
  const detail = getCellAtlasDetailById(cell_id);

  if (!detail) {
    return { title: "Cell Not Found · BioLayers Cell Atlas" };
  }

  return {
    title: `${detail.cellType.name} · BioLayers Cell Atlas`,
    description: detail.cellType.biologicalContext,
  };
}

export default async function CellCardPage({ params }: PageProps) {
  const { cell_id } = await params;
  const detail = getCellAtlasDetailById(cell_id);

  if (!detail) {
    notFound();
  }

  const { cellType, image, morphologySummary, entities } = detail;

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

      <div className="mx-auto max-w-6xl px-4 pt-28 pb-28 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/cells"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-teal-300 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Cell Atlas
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">ID: {cellType.id}</span>
            {cellType.ontologyId && (
              <span className="rounded bg-teal-500/10 border border-teal-400/30 px-2 py-0.5 font-mono text-[11px] text-teal-300">
                {cellType.ontologyId}
              </span>
            )}
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div className="border-b border-teal-500/15 pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase tracking-widest text-teal-400">
                  {cellType.tissue} · {cellType.organism}
                </span>
                {image.isFlagship && (
                  <span className="rounded bg-teal-500/20 border border-teal-400/40 px-2 py-0.5 font-mono text-[10px] text-teal-200 uppercase font-bold">
                    Flagship Case Study
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {cellType.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400 font-mono">
                Cell Line: {image.cellLine} · {cellType.disease || "Non-pathological baseline"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/platform/pipeline"
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-500/15 px-4 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/25 transition shadow-lg"
              >
                <GitFork className="h-3.5 w-3.5" /> View in Knowledge Graph
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================================
            STRICT 10-BLOCK SEQUENTIAL LAYOUT (PRIORITY 2 REQUIREMENT)
            ==================================================================== */}

        {/* BLOCK 1: Microscopy Image (Interactive Viewer) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
                01
              </span>
              Microscopy Image
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {image.channelCount} Channels · {image.widthPx} × {image.heightPx} px · {image.pixelSizeUm} µm/px
            </span>
          </div>

          <MicroscopyViewer image={image} />
        </section>

        {/* BLOCK 2: Metadata (Acquisition, Hardware, Staining, Provenance) */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              02
            </span>
            Acquisition & Provenance Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-slate-500 block text-[10px]">MICROSCOPE</span>
              <span className="text-slate-200 font-medium">{image.microscope}</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-slate-500 block text-[10px]">OBJECTIVE</span>
              <span className="text-slate-200 font-medium">{image.objective}</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-slate-500 block text-[10px]">PIXEL RESOLUTION</span>
              <span className="text-slate-200 font-medium">{image.pixelSizeUm} µm / pixel</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-slate-500 block text-[10px]">STAINING PROTOCOL</span>
              <span className="text-slate-200 font-medium">{image.staining}</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-slate-500 block text-[10px]">EXPERIMENTAL TREATMENT</span>
              <span className="text-slate-200 font-medium">{image.treatment}</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-slate-500 block text-[10px]">ACCESSION & LICENSE</span>
              <span className="text-teal-300 font-medium">
                {image.datasetAccession} · {image.license}
              </span>
            </div>
          </div>
        </section>

        {/* BLOCK 3: Biological Context */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              03
            </span>
            Biological Context & Oncology Function
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {cellType.biologicalContext}
          </p>
          {cellType.lineage && (
            <p className="mt-3 text-xs font-mono text-slate-400">
              <span className="text-slate-500">Lineage:</span> {cellType.lineage}
            </p>
          )}
        </section>

        {/* BLOCK 4: Associated Genes */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              04
            </span>
            Associated Genes ({entities.genes.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entities.genes.map((gene) => (
              <div
                key={gene.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-teal-200">{gene.identifier}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        EVIDENCE_BADGES[gene.evidenceLevel].tone
                      }`}
                    >
                      {EVIDENCE_BADGES[gene.evidenceLevel].symbol}{" "}
                      {EVIDENCE_BADGES[gene.evidenceLevel].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{gene.description}</p>
                </div>
                {gene.externalRef && (
                  <span className="mt-3 font-mono text-[10px] text-slate-500">
                    Ref: {gene.externalRef}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BLOCK 5: Associated Proteins */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              05
            </span>
            Associated Proteins ({entities.proteins.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entities.proteins.map((protein) => (
              <div
                key={protein.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-cyan-200">{protein.label}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        EVIDENCE_BADGES[protein.evidenceLevel].tone
                      }`}
                    >
                      {EVIDENCE_BADGES[protein.evidenceLevel].symbol}{" "}
                      {EVIDENCE_BADGES[protein.evidenceLevel].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{protein.description}</p>
                </div>
                {protein.externalRef && (
                  <span className="mt-3 font-mono text-[10px] text-slate-500">
                    Ref: {protein.externalRef}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BLOCK 6: Pathways */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              06
            </span>
            Biological Pathways ({entities.pathways.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entities.pathways.map((pathway) => (
              <div
                key={pathway.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-sky-200">{pathway.label}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        EVIDENCE_BADGES[pathway.evidenceLevel].tone
                      }`}
                    >
                      {EVIDENCE_BADGES[pathway.evidenceLevel].symbol}{" "}
                      {EVIDENCE_BADGES[pathway.evidenceLevel].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{pathway.description}</p>
                </div>
                {pathway.externalRef && (
                  <span className="mt-3 font-mono text-[10px] text-slate-500">
                    Reactome: {pathway.externalRef}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BLOCK 7: Diseases */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              07
            </span>
            Associated Diseases & Pathologies ({entities.diseases.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entities.diseases.map((disease) => (
              <div
                key={disease.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-sm text-rose-200">{disease.label}</span>
                  <p className="text-xs text-slate-400 mt-2">{disease.description}</p>
                </div>
                {disease.externalRef && (
                  <span className="mt-3 font-mono text-[10px] text-slate-500">
                    DOID: {disease.externalRef}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BLOCK 8: Phenotypes (Morphological & Functional) */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              08
            </span>
            Phenotypic Profiles & Morphology Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {entities.phenotypes.map((phenotype) => (
              <div
                key={phenotype.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-200">{phenotype.label}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        EVIDENCE_BADGES[phenotype.evidenceLevel].tone
                      }`}
                    >
                      {EVIDENCE_BADGES[phenotype.evidenceLevel].symbol}{" "}
                      {EVIDENCE_BADGES[phenotype.evidenceLevel].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{phenotype.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Morphometric Quantitative Summary */}
          <div className="rounded-xl border border-teal-500/20 bg-[#070f1c] p-4 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 block mb-2">
              Model-Derived Nuclear Morphometry ({morphologySummary.benchmarkModel})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">OBJECTS SEGMENTED</span>
                <span className="text-white font-bold text-sm">
                  {morphologySummary.totalSegmentedObjects}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MEAN CIRCULARITY</span>
                <span className="text-teal-300 font-bold text-sm">
                  {morphologySummary.meanCircularity.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MEAN ASPECT RATIO</span>
                <span className="text-teal-300 font-bold text-sm">
                  {morphologySummary.meanAspectRatio.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">EVIDENCE LEVEL</span>
                <span className="text-teal-400 font-bold text-sm">□ Observed</span>
              </div>
            </div>
          </div>
        </section>

        {/* BLOCK 9: Literature Evidence */}
        <section className="mb-12 rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              09
            </span>
            Literature Evidence ({entities.literature.length})
          </h2>

          <div className="space-y-3">
            {entities.literature.map((lit) => (
              <div
                key={lit.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{lit.label}</span>
                  {lit.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${lit.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-teal-300 hover:underline"
                    >
                      PubMed:{lit.pmid} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-slate-300 mt-2 leading-relaxed">{lit.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-sky-400/30 bg-sky-500/10 text-sky-200">
                    ▤ Supported by literature
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BLOCK 10: Dataset / Source */}
        <section className="rounded-2xl border border-teal-500/20 bg-[#060b14] p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/20 text-teal-300 text-[10px]">
              10
            </span>
            Dataset & Source Repository
          </h2>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Dataset Repository:</span>
              <span className="font-medium text-white">{image.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accession Identifier:</span>
              <span className="font-mono text-teal-300">{image.datasetAccession}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Licensing Terms:</span>
              <span className="font-mono text-slate-300">{image.license}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scientific Attribution:</span>
              <span className="text-slate-300 text-right">{image.attribution}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
