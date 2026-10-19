import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

import { btnSecondary, pageShell } from "../components/ui/styles";
import { AmbientGlow, Eyebrow } from "../components/ui/Chrome";

export const metadata: Metadata = {
  title: "Press",
  description: "Coverage and recognition of BioLayers AI.",
};

const coverage = [
  {
    outlet: "HundrED",
    date: "2026-09-02",
    dateLabel: "September 2026",
    headline: "BioLayers AI",
    href: "https://hundred.org/en/innovations/biolayers-ai",
    summary:
      "Listed as an education innovation: interactive maps that turn cancer research into knowledge students, researchers and educators can explore.",
  },
  {
    outlet: "AI Business",
    date: "2026-08-25",
    dateLabel: "25 August 2026",
    headline: "BioLayers AI: A Teenager in Tashkent Read 100 Cancer Papers and Built the Tool He Was Missing",
    href: "https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps",
    summary:
      "A profile of the founder and of how BioLayers turns fragmented cancer literature into maps of mechanisms.",
  },
];

export default function PressPage() {
  return (
    <div className={`relative isolate ${pageShell} pt-28 pb-24 sm:pt-32`}>
      <AmbientGlow />
      <header className="mx-auto max-w-3xl text-center animate-fade-up">
        <Eyebrow icon={Newspaper}>Media, Recognition &amp; Spotlights</Eyebrow>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">Press</span>
        </h1>
        <p className="mx-auto mt-5 text-lg leading-relaxed text-ink">
          Where BioLayers AI has been written about.
        </p>
      </header>

      <ol className="mt-14 divide-y divide-rule border-y border-rule">
        {coverage.map((item) => (
          <li key={item.href} className="grid gap-3 py-8 md:grid-cols-[12rem_1fr] md:gap-10">
            <div>
              <p className="font-medium text-ink-strong">{item.outlet}</p>
              <time dateTime={item.date} className="text-sm text-graphite">
                {item.dateLabel}
              </time>
            </div>
            <div>
              <h2 className="text-2xl leading-snug">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-rule-strong underline-offset-[6px] transition-colors hover:text-hoechst-strong hover:decoration-hoechst"
                >
                  {item.headline}
                </a>
              </h2>
              <p className="mt-3 max-w-prose leading-relaxed text-graphite">{item.summary}</p>
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="contact-heading" className="mt-20 max-w-2xl">
        <h2 id="contact-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          Writing about us?
        </h2>
        <p className="mt-3 leading-relaxed text-graphite">
          For interviews, images or a demo, email us. We can share the validation report, the demo
          video and photos of the team.
        </p>
        <a
          href="mailto:biolayers.ai@gmail.com?subject=Press%20enquiry%3A%20BioLayers%20AI"
          className={`${btnSecondary} mt-6`}
        >
          Email biolayers.ai@gmail.com
        </a>
      </section>
    </div>
  );
}
