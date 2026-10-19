import Link from "next/link";
import { ArrowRight, Microscope, Sparkles, Workflow } from "lucide-react";

import SpecimenViewer from "./components/home/SpecimenViewer";
import EvidenceTag, { type EvidenceLevel } from "./components/home/EvidenceTag";
import ZoomableFigure from "./components/ZoomableFigure";
import { Eyebrow } from "./components/ui/Chrome";
import { btnPrimary, btnSecondary, pageShell, textLink } from "./components/ui/styles";

export const metadata = {
  title: "BioLayers AI: from papers to living cells",
  description:
    "BioLayers AI connects biomedical literature, biological mechanisms, real microscopy, and cellular phenotypes into evidence-grounded maps for computational oncology.",
};

type ChainStep = {
  claim: string;
  level: EvidenceLevel;
  detail: string;
  sources: { label: string; href: string }[];
  context?: string;
};

// From research/cell-pipeline/knowledge/literature.json (v0.2.0) and the
// flagship cell U373-02-T7 in research/cell-pipeline/handoff/u373_seq02.
const flagshipChain: ChainStep[] = [
  {
    claim: "Fibroblasts in tumours secrete CXCL12",
    level: "literature",
    detail:
      "Carcinoma-associated fibroblasts secrete elevated CXCL12, which acts through CXCR4 on carcinoma cells.",
    sources: [{ label: "Orimo et al., Cell 2005", href: "https://pubmed.ncbi.nlm.nih.gov/15882617/" }],
    context: "Shown in breast carcinoma, not glioma.",
  },
  {
    claim: "CXCL12 acts on CXCR4 on glioma cells",
    level: "literature",
    detail:
      "CXCR4 is the main chemokine receptor on 13 of 16 human glioma cell lines, and CXCL12 makes those cells move toward it.",
    sources: [{ label: "Zhou et al., J Biol Chem 2002", href: "https://pubmed.ncbi.nlm.nih.gov/12388552/" }],
    context: "Glioma cell lines and resected tumours, in vitro.",
  },
  {
    claim: "CXCR4 drives glioma invasion",
    level: "literature",
    detail:
      "Invasive glioma cells overexpress CXCR4, and blocking it impairs invasion. CXCL12 and CXCR4 rise with tumour grade.",
    sources: [
      { label: "Ehtesham et al., Oncogene 2006", href: "https://pubmed.ncbi.nlm.nih.gov/16407848/" },
      { label: "Rempel et al., Clin Cancer Res 2000", href: "https://pubmed.ncbi.nlm.nih.gov/10656438/" },
    ],
  },
  {
    claim: "This cell migrates",
    level: "observed",
    detail:
      "Glioblastoma cell U373-02-T7, tracked for 28.5 hours: 175.9 µm net displacement, 0.193 µm per minute, directionality 0.53.",
    sources: [
      {
        label: "Cell Tracking Challenge, PhC-C2DH-U373",
        href: "https://celltrackingchallenge.net/2d-datasets/",
      },
    ],
  },
];

const tools = [
  {
    name: "Mind map",
    href: "/mindmap",
    action: "Map a paper",
    body: "Upload a PDF or DOCX and get a structured map of its mechanisms, each linked to the sentence it came from. Uses your own Gemini API key.",
  },
  {
    name: "Cell atlas",
    href: "/cells",
    action: "Browse the atlas",
    body: "634 catalogued microscopy records from the Broad Bioimage Benchmark Collection and the Cell Tracking Challenge, each with its source and licence.",
  },
  {
    name: "Cipher",
    href: "/cipher",
    action: "Open Cipher",
    body: "Cause-and-effect maps of cancer pathways such as KRAS G12D resistance, readable in plain language or with full terminology.",
  },
  {
    name: "Library",
    href: "/library",
    action: "Read the library",
    body: "Mind maps that other researchers have saved, newest first, with a page for each author.",
  },
];

const partners = [
  { name: "NXT Horizon", role: "Strategic partner", href: "https://nxthorizon.org" },
  { name: "STEMise", role: "Open STEM curricula", href: "https://stemise.org" },
  { name: "BioMedizone", role: "Student biomedical network", href: "https://www.biomedizone.org/" },
  {
    name: "Computational Biologists Society at UCLA",
    role: "Seminars and hackathons",
    href: "https://compbiosocucla.wixsite.com/my-site",
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Dark-field fluorescence ambient backdrops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[18rem] -z-20 h-[550px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(43,255,136,0.06),transparent_70%)] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-[30rem] -z-20 h-[480px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,141,255,0.05),transparent_70%)] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-[70rem] -z-20 h-[400px] w-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(161,92,255,0.04),transparent_70%)] blur-[160px]"
      />

      {/* Hero: the real specimen is the first thing you see */}
      <section className={`${pageShell} pt-28 sm:pt-32 lg:pt-36`}>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="animate-fade-up lg:sticky lg:top-32">
            <Eyebrow icon={Sparkles}>AI-Driven Computational Oncology</Eyebrow>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              From papers to <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">living cells</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink">
              BioLayers AI connects biomedical literature, biological mechanisms, real microscopy,
              and cellular phenotypes into evidence-grounded maps for computational oncology.
            </p>
            <p className="mt-4 max-w-[34rem] leading-relaxed text-graphite">
              Every statement carries its source: a PubMed ID, a dataset accession, or a measurement
              you can check in the image yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/mindmap" className={`group ${btnPrimary}`}>
                <Workflow className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                Map a paper
                <ArrowRight className="h-4 w-4 text-emerald-300 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link href="/cells" className={btnSecondary}>
                <Microscope className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Browse the cell atlas
              </Link>
            </div>
            <p className="mt-10 max-w-[34rem] border-t border-rule pt-5 text-sm leading-relaxed text-graphite">
              On 200 benchmark images, the segmentation model matched 22,212 hand-annotated nuclei
              with a pixel overlap (IoU) of 0.942.{" "}
              <Link href="/validation" className={textLink}>
                Read the validation report
              </Link>
            </p>
          </div>

          <SpecimenViewer />
        </div>
      </section>

      {/* Flagship case: a real sequence, so it is numbered */}
      <section className={`${pageShell} mt-32`} aria-labelledby="flagship-heading">
        <div className="max-w-2xl">
          <h2 id="flagship-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            One mechanism, followed from paper to cell
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-graphite">
            Our flagship case links a glioblastoma cell we tracked for 28.5 hours to the
            CXCL12/CXCR4 signalling axis. Each step shows where its evidence comes from, and the
            last link is a hypothesis, not a measurement.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          <ol className="relative">
            {flagshipChain.map((step, index) => (
              <li key={step.claim} className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-10 last:pb-0">
                {index < flagshipChain.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.25rem] top-10 bottom-0 w-px bg-rule-strong"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-rule-strong bg-field font-serif text-lg text-ink"
                >
                  {index + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="text-lg font-semibold">{step.claim}</h3>
                  <div className="mt-1.5">
                    <EvidenceTag level={step.level} />
                  </div>
                  <p className="mt-2 max-w-prose leading-relaxed text-ink">{step.detail}</p>
                  {step.context && (
                    <p className="mt-1.5 text-sm text-graphite">{step.context}</p>
                  )}
                  <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    {step.sources.map((source) => (
                      <li key={source.href}>
                        <a
                          href={source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={textLink}
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <div>
            <ZoomableFigure
              idPrefix="flagship-figure"
              src="/validation/u373_flagship.png"
              alt="Flagship figure: a phase-contrast frame of U373 glioblastoma cells with the tracked cell outlined, its migration path, measured phenotype, and the CXCL12/CXCR4 literature links."
              width={1950}
              height={1118}
              caption="The image, cell, phenotype and literature chain for cell U373-02-T7, produced by the BioLayers pipeline."
            />
            <div className="mt-6 rounded-[20px] border border-stain-yfp/30 bg-stain-yfp/[0.06] p-4">
              <p className="text-sm font-medium text-stain-yfp-bright">What this does not show</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">
                We did not measure CXCR4 in this cell. Many cell stocks labelled U-373 are actually
                the line U-251 (
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/24810477/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={textLink}
                >
                  Torsvik et al., 2014
                </a>
                ). The link from this cell to CXCR4 is a hypothesis the literature makes plausible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className={`${pageShell} mt-32`} aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          What you can do here
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <article
              key={tool.name}
              className="group flex flex-col justify-between rounded-[24px] border border-teal-100/[0.08] bg-[#070c12]/70 p-6 backdrop-blur-xl transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-200/30 hover:bg-[#0a121a]/85"
            >
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-graphite">{tool.body}</p>
              <Link href={tool.href} className={`${textLink} mt-3 inline-flex min-h-10 items-center`}>
                {tool.action}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-graphite">
          New to the biology?{" "}
          <Link href="/journey" className={textLink}>
            Take the 3D journey
          </Link>{" "}
          from a paper to a mechanism.
        </p>
      </section>

      {/* House rules */}
      <section className={`${pageShell} mt-32`} aria-labelledby="rules-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="rules-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Three kinds of statement, never mixed
          </h2>
          <div>
            <dl className="divide-y divide-rule border-y border-rule">
              <div className="py-5">
                <dt>
                  <EvidenceTag level="observed" />
                </dt>
                <dd className="mt-1.5 leading-relaxed text-ink">
                  Measured from segmented pixels: area, shape, intensity, speed.
                </dd>
              </div>
              <div className="py-5">
                <dt>
                  <EvidenceTag level="literature" />
                </dt>
                <dd className="mt-1.5 leading-relaxed text-ink">
                  Checked against a PubMed abstract, with the system the finding was made in.
                </dd>
              </div>
              <div className="py-5">
                <dt>
                  <EvidenceTag level="inferred" />
                </dt>
                <dd className="mt-1.5 leading-relaxed text-ink">
                  A label from a transparent rule or a model score. Useful, never an experimental
                  fact.
                </dd>
              </div>
            </dl>
            <p className="mt-6 leading-relaxed text-graphite">
              The cell atlas holds no AI-generated microscopy. Every record names its public
              dataset, accession and licence, and records we cannot verify are marked for review.
            </p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className={`${pageShell} mt-32`} aria-labelledby="partners-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 id="partners-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Built with partners
            </h2>
            <p className="mt-5 leading-relaxed text-graphite">
              BioLayers AI started in Tashkent and is guided by oncologists and computational
              biologists. Featured by{" "}
              <a
                href="https://hundred.org/en/innovations/biolayers-ai"
                target="_blank"
                rel="noopener noreferrer"
                className={textLink}
              >
                HundrED
              </a>{" "}
              and{" "}
              <a
                href="https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps"
                target="_blank"
                rel="noopener noreferrer"
                className={textLink}
              >
                AI Business
              </a>
              .
            </p>
          </div>
          <div>
            <ul className="divide-y divide-rule border-y border-rule">
              {partners.map((partner) => (
                <li key={partner.name}>
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-14 flex-wrap items-baseline justify-between gap-x-4 py-3 transition-colors hover:text-hoechst-strong"
                  >
                    <span className="font-medium text-ink-strong">{partner.name}</span>
                    <span className="text-sm text-graphite">{partner.role}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/partners" className={textLink}>
                All partners
              </Link>
              <Link href="/about" className={textLink}>
                Team and mentors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className={`${pageShell} mb-32 mt-32`} aria-labelledby="start-heading">
        <div className="rounded-[24px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl px-6 py-12 sm:px-12">
          <h2 id="start-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Start with one paper
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite">
            Upload a PDF or DOCX. You get a map of its mechanisms, with the sentence each one came
            from.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mindmap" className={btnPrimary}>
              Map a paper
            </Link>
            <Link href="/library" className={btnSecondary}>
              See published maps
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
