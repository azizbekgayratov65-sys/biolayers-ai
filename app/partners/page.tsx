import type { Metadata } from "next";
import Image from "next/image";
import { Globe2 } from "lucide-react";

import { btnSecondary, pageShell, textLink } from "../components/ui/styles";
import { AmbientGlow, Eyebrow } from "../components/ui/Chrome";

export const metadata: Metadata = {
  title: "Partners",
  description: "Organisations BioLayers AI works with on research, education and outreach.",
};

type Partner = {
  name: string;
  kind: string;
  logo: string;
  href: string;
  site: string;
  work: string;
};

const partners: Partner[] = [
  {
    name: "NXT Horizon",
    kind: "Strategic partner",
    logo: "/branding/nxthorizon-logo.png",
    href: "https://nxthorizon.org",
    site: "nxthorizon.org",
    work: "Research collaboration on graph methods and causal reasoning for the mechanism maps, including Project Cipher.",
  },
  {
    name: "STEMise",
    kind: "Education nonprofit",
    logo: "/branding/stemise-logo.png",
    href: "https://stemise.org",
    site: "stemise.org",
    work: "Brings BioLayers maps into open STEM curricula and hands-on student workshops.",
  },
  {
    name: "BioMedizone",
    kind: "Student biomedical nonprofit",
    logo: "/branding/biomedizone-logo.png",
    href: "https://www.biomedizone.org/",
    site: "biomedizone.org",
    work: "A student research network of more than 3,000 students in 68 countries. Its scholars use BioLayers to explore cancer literature.",
  },
  {
    name: "Computational Biologists Society at UCLA",
    kind: "University student society",
    logo: "/branding/ucla-logo.svg",
    href: "https://compbiosocucla.wixsite.com/my-site",
    site: "compbiosocucla.wixsite.com",
    work: "Seminars, hackathons and literature workshops for students in computational and systems biology.",
  },
  {
    name: "The Ohio State University",
    kind: "University",
    logo: "/branding/osu-logo.svg",
    href: "https://www.osu.edu/",
    site: "osu.edu",
    work: "Collaboration on applying knowledge graphs to oncology research.",
  },
  {
    name: "Nationwide Children's Hospital",
    kind: "Children's hospital",
    logo: "/branding/nch-logo.svg",
    href: "https://www.nationwidechildrens.org/",
    site: "nationwidechildrens.org",
    work: "Collaboration on pediatric cancer research questions.",
  },
];

export default function PartnersPage() {
  return (
    <div className={`relative isolate ${pageShell} pt-28 pb-24 sm:pt-32`}>
      <AmbientGlow />
      <header className="mx-auto max-w-3xl text-center animate-fade-up">
        <Eyebrow icon={Globe2}>Ecosystem &amp; Strategic Alliances</Eyebrow>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">Partners</span>
        </h1>
        <p className="mx-auto mt-5 text-lg leading-relaxed text-ink">
          Organisations we work with on research, teaching and outreach. Each entry says what the
          collaboration covers.
        </p>
      </header>

      <ul className="mt-14 divide-y divide-rule border-y border-rule">
        {partners.map((partner) => (
          <li key={partner.name} className="grid gap-6 py-8 md:grid-cols-[10rem_1fr_auto] md:items-start">
            <div className="flex h-20 w-40 items-center justify-center rounded-md bg-ink-strong p-3">
              <Image
                src={partner.logo}
                alt=""
                width={136}
                height={56}
                className="max-h-14 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="font-sans text-xl font-semibold text-ink-strong">{partner.name}</h2>
              <p className="mt-0.5 text-graphite">{partner.kind}</p>
              <p className="mt-3 max-w-prose leading-relaxed text-ink">{partner.work}</p>
            </div>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${textLink} inline-flex min-h-10 items-center md:justify-end`}
            >
              {partner.site}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-graphite">
        Logos and names are used to identify the organisations we work with. They do not mean an
        organisation endorses BioLayers AI or its results.
      </p>

      <section aria-labelledby="join-heading" className="mt-20 rounded-[24px] border border-teal-200/20 bg-gradient-to-b from-[#0a121d]/90 via-[#070c14]/85 to-[#04080e]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl px-6 py-10 sm:px-10">
        <h2 id="join-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          Work with us
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-graphite">
          Labs, schools and student organisations can use BioLayers for teaching or research. Tell
          us what you study and we will reply within a week.
        </p>
        <a
          href="mailto:biolayers.ai@gmail.com?subject=Partnership%20with%20BioLayers%20AI"
          className={`${btnSecondary} mt-6`}
        >
          Email biolayers.ai@gmail.com
        </a>
      </section>
    </div>
  );
}
