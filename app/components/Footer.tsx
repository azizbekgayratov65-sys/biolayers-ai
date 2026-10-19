import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Mind map", href: "/mindmap" },
      { label: "Cell atlas", href: "/cells" },
      { label: "Cipher", href: "/cipher" },
      { label: "Library", href: "/library" },
      { label: "3D journey", href: "/journey" },
    ],
  },
  {
    title: "Evidence",
    links: [
      { label: "Validation report", href: "/validation" },
      {
        label: "Pipeline source code",
        href: "https://github.com/azizbekgayratov65-sys/biolayers-ai/tree/main/research/cell-pipeline",
        external: true,
      },
      { label: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/", external: true },
      { label: "Cell Ontology", href: "https://www.ebi.ac.uk/ols4/ontologies/cl", external: true },
    ],
  },
  {
    title: "Organisation",
    links: [
      { label: "About", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Press", href: "/press" },
      { label: "Privacy", href: "/about#privacy" },
      { label: "Terms", href: "/about#terms" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/biolayers-ai", external: true },
      { label: "GitHub", href: "https://github.com/azizbekgayratov65-sys/biolayers-ai", external: true },
      { label: "HundrED", href: "https://hundred.org/en/innovations/biolayers-ai", external: true },
      { label: "biolayers.ai@gmail.com", href: "mailto:biolayers.ai@gmail.com" },
    ],
  },
];

const linkClass =
  "group flex min-h-[40px] items-center gap-1.5 text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]";

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="relative z-10 border-t border-teal-200/10 bg-[#04070a]/95 text-slate-300 backdrop-blur-xl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-teal-300/35 to-transparent"
      />

      <div className="mx-auto max-w-[1540px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-3 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
              aria-label="BioLayers AI home"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-teal-200/25 bg-teal-300/[0.08] p-1.5 shadow-[0_0_15px_rgba(77,141,255,0.15)]">
                <Image src="/biolayers-logo.svg" alt="" fill className="object-contain p-1" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-[-0.02em] text-white">BioLayers AI</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300/80">
                  Computational Oncology
                </span>
              </div>
            </Link>

            <p className="max-w-md text-xs leading-relaxed text-slate-400">
              Connects cancer literature to real microscopy, with a source on every claim.
            </p>
            <p className="max-w-md text-xs leading-relaxed text-slate-500">
              For research and education. Not a clinical diagnostic.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        <span>{link.label}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-white" aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} BioLayers AI, Tashkent</p>
          <p className="text-center text-[11px] text-slate-400 sm:text-right">
            Gemini keys you add are encrypted with AES-256-GCM.
          </p>
        </div>
      </div>
    </footer>
  );
}
