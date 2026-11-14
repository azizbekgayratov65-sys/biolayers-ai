import Link from "next/link";
import { ArrowRight, Wind } from "lucide-react";

import { AmbientGlow, Eyebrow } from "../components/ui/Chrome";
import { pageShell, panel, sectionLabel } from "../components/ui/styles";

type Organ = {
  slug: string;
  name: string;
  cancer: string;
  status: "live" | "planned";
  blurb: string;
};

const ORGANS: Organ[] = [
  {
    slug: "lung",
    name: "Lung",
    cancer: "Non-small cell lung cancer",
    status: "live",
    blurb: "Airways, vessels, lymph nodes and an EGFR-mutant tumour you can fly into, with two years of treatment response.",
  },
  { slug: "breast", name: "Breast", cancer: "Breast carcinoma", status: "planned", blurb: "Ductal tree, lymphatic drainage and receptor status layers." },
  { slug: "prostate", name: "Prostate", cancer: "Prostate adenocarcinoma", status: "planned", blurb: "Zonal anatomy with MRI-guided lesion mapping." },
  { slug: "colon", name: "Colon", cancer: "Colorectal cancer", status: "planned", blurb: "Mucosa-to-serosa layers and nodal spread along the mesentery." },
  { slug: "pancreas", name: "Pancreas", cancer: "Pancreatic ductal adenocarcinoma", status: "planned", blurb: "Dense stroma and vessel involvement around the tumour." },
  { slug: "liver", name: "Liver", cancer: "Hepatocellular carcinoma", status: "planned", blurb: "Segmental anatomy and portal and hepatic vessel trees." },
];

export default function OrgansPage() {
  return (
    <div className="relative overflow-hidden">
      <AmbientGlow />
      <div className={`${pageShell} pt-28 pb-24 sm:pt-32`}>
        <div className="max-w-3xl">
          <Eyebrow icon={Wind}>Organ atlas</Eyebrow>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl">Cancer, organ by organ</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Each organ is a living, layered model: tissue, airways or ducts, vessels, lymph nodes and the tumour with its
            microenvironment, linked to the evidence behind it. We start with the lung.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORGANS.map((organ) => {
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <p className={sectionLabel}>{organ.cancer}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      organ.status === "live" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {organ.status === "live" ? "Live" : "Planned"}
                  </span>
                </div>
                <h2 className="mt-3 font-serif text-2xl text-white">{organ.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{organ.blurb}</p>
                {organ.status === "live" && (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-200">
                    Open the model <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </>
            );
            return organ.status === "live" ? (
              <Link
                key={organ.slug}
                href={`/organs/${organ.slug}`}
                className={`${panel} block p-6 transition hover:border-emerald-300/40`}
              >
                {body}
              </Link>
            ) : (
              <div key={organ.slug} className={`${panel} p-6 opacity-70`}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
