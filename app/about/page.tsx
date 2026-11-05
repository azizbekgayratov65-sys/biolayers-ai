import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Microscope } from "lucide-react";

import { pageShell, textLink } from "../components/ui/styles";
import { AmbientGlow, Eyebrow } from "../components/ui/Chrome";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who builds BioLayers SI, the physician-scientists who advise it, and how we handle your data.",
};

type Person = {
  name: string;
  role: string;
  focus: string;
  training: string;
  photo: string;
  linkedin: string;
};

const mentors: Person[] = [
  {
    name: "John-William Sidhom, MD, PhD",
    role: "Physician-scientist in medical oncology, Weill Cornell Medicine and NewYork-Presbyterian",
    focus: "Grounds BioLayers in clinically meaningful oncology workflows, multi-omics genomics and translational evidence.",
    training: "MD and PhD, Johns Hopkins",
    photo: "/mentorship/john-william-sidhom.png",
    linkedin: "https://www.linkedin.com/in/john-william-sidhom-md-phd-b685abb/",
  },
  {
    name: "Eric E. Gardner, PhD",
    role: "Assistant Professor, Thoracic/Head and Neck Medical Oncology, MD Anderson; James P. Allison Institute",
    focus: "Cancer plasticity, airway damage and new therapeutic targets in lung cancer.",
    training: "PhD, Johns Hopkins",
    photo: "/mentorship/eric-e-gardner.jpg",
    linkedin: "https://www.linkedin.com/in/eric-edison-gardner-7b44a8120/",
  },
  {
    name: "John Paul Shen, MD",
    role: "Assistant Professor, Gastrointestinal Medical Oncology, MD Anderson; CPRIT Scholar",
    focus: "Cancer genomics, CRISPR screens, synthetic lethality and machine-learning biomarkers in GI cancers.",
    training: "PhD and fellowship, UC San Diego",
    photo: "/mentorship/john-paul-shen.jpg",
    linkedin: "https://www.linkedin.com/in/john-paul-shen-393a2ab/",
  },
  {
    name: "Kathleen M. Schieffer, PhD",
    role: "Assistant Professor, Nationwide Children's Hospital and The Ohio State University",
    focus: "Pediatric tumour genomics and turning sequencing into clinical precision oncology.",
    training: "PhD, Penn State College of Medicine",
    photo: "/mentorship/kathleen-m-schieffer.jpg",
    linkedin: "https://www.linkedin.com/in/kathleenmschieffer/",
  },
  {
    name: "Bailey Glen, PhD",
    role: "Senior Bioinformatics Scientist and Director, Hollings Cancer Center, MUSC",
    focus: "Sequencing informatics, multi-omics architecture and reproducible pipelines.",
    training: "PhD, Clemson University",
    photo: "/mentorship/bailey-glen.jpg",
    linkedin: "https://www.linkedin.com/in/bailey-glen-24a65b85/",
  },
];

type Member = {
  name: string;
  role: string;
  photo: string;
  linkedin: string;
  tier?: "founder" | "cofounder";
  focus?: string;
};

const team: Member[] = [
  {
    name: "Azizbek Gayratov",
    role: "Lead Engineer",
    tier: "founder",
    focus: "object-top",
    photo: "/mentorship/founder.png",
    linkedin: "https://www.linkedin.com/in/azizbekgayratov/",
  },
  { name: "Muhammad Najmiddinov", role: "Growth Manager & Lead Machine Learning Engineer", tier: "cofounder", photo: "/team/muhammad-portrait.jpg", linkedin: "https://www.linkedin.com/in/alamiy/" },
  { name: "Bilolbek Yuldoshkhujayev", role: "Lead Software Engineer", photo: "/team/bilolbek-portrait.jpg", linkedin: "https://www.linkedin.com/in/bilolbek-yuldoshkhujayev/" },
  { name: "Asliddin Abdurakhimov", role: "Data Science & Machine Learning Engineer", photo: "/team/asliddin.jpg", linkedin: "https://www.linkedin.com/in/asliddin-abdurakhimov/" },
  { name: "Orzugul Mukhtorova", role: "Data Analytics Specialist", photo: "/team/orzugul.jpg", linkedin: "https://www.linkedin.com/in/orzugul-muxtorova-968373312/" },
  { name: "Maksat Babageldiyev", role: "Machine Learning Engineer", photo: "/team/maksat.jpg", linkedin: "https://www.linkedin.com/in/maksat-babageldiyev/" },
  { name: "Mirkomil Nozimkhojiyev", role: "Social Media & Community Lead", photo: "/team/mirkomil.jpg", linkedin: "https://www.linkedin.com/in/mirkomil-nozimkhojiev/" },
];

export default function AboutPage() {
  return (
    <div className={`relative isolate ${pageShell} pt-28 pb-24 sm:pt-32`}>
      <AmbientGlow />
      <header className="mx-auto max-w-3xl text-center animate-fade-up">
        <Eyebrow icon={Microscope}>Leadership &amp; Scientific Mentorship</Eyebrow>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          About <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">BioLayers SI</span>
        </h1>
        <p className="mx-auto mt-5 text-lg leading-relaxed text-ink">
          BioLayers SI started in Tashkent in 2026. Its founder read more than a hundred cancer
          papers and kept losing track of which mechanism came from which study, so he built the
          tool he was missing: one that keeps every claim tied to its source.
        </p>
      </header>

      <section aria-labelledby="team-heading" className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow icon={Microscope}>The team</Eyebrow>
          <h2 id="team-heading" className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The people building{" "}
            <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              BioLayers
            </span>
          </h2>
          <p className="mt-4 leading-relaxed text-graphite">
            Our founder and co-founders, with the engineers, data analysts and communicators who
            build alongside them.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <li
              key={member.name}
              className={`group flex flex-col items-center rounded-[24px] border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 text-center backdrop-blur transition-colors hover:border-emerald-300/50 ${
                member.tier === "founder"
                  ? "border-emerald-300/60"
                  : member.tier === "cofounder"
                    ? "border-emerald-300/40"
                    : "border-teal-300/20"
              } ${
                // Centre a lone last card when the final grid row has a single item.
                i === team.length - 1
                  ? `${team.length % 2 === 1 ? "sm:max-lg:col-span-2 sm:max-lg:mx-auto sm:max-lg:w-[calc(50%-0.75rem)]" : ""} ${team.length % 3 === 1 ? "lg:col-start-2" : ""}`
                  : ""
              }`}
            >
              <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-emerald-300/30 bg-slide shadow-[0_0_32px_-8px_rgba(52,211,153,0.5)]">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="144px"
                  className={`object-cover ${member.focus ?? ""}`}
                  priority={member.tier === "founder"}
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-snug">{member.name}</h3>
              {member.tier && (
                <span
                  className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${
                    member.tier === "founder"
                      ? "border-emerald-300/60 bg-emerald-300/20 text-emerald-100"
                      : "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                  }`}
                >
                  {member.tier === "founder" ? "Founder" : "Co-Founder"}
                </span>
              )}
              {member.role && (
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-emerald-200/80">{member.role}</p>
              )}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-teal-300/30 px-4 text-xs font-medium text-emerald-100 hover:border-emerald-300 hover:bg-emerald-300/10"
              >
                LinkedIn
                <span className="sr-only">: {member.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mentors-heading" className="mt-24">
        <div className="max-w-2xl">
          <h2 id="mentors-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Scientific mentors
          </h2>
          <p className="mt-4 leading-relaxed text-graphite">
            Physician-scientists and computational biologists who review our direction and our
            claims. Their guidance is personal: institutions are named for context and do not
            endorse BioLayers SI.
          </p>
        </div>

        <ul className="mt-10 divide-y divide-rule border-y border-rule">
          {mentors.map((person) => (
            <li key={person.name} className="grid gap-5 py-8 sm:grid-cols-[6rem_1fr]">
              <div className="relative h-24 w-24 overflow-hidden rounded-[20px] bg-slide">
                <Image
                  src={person.photo}
                  alt={person.name}
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{person.name}</h3>
                <p className="mt-1 text-graphite">{person.role}</p>
                <p className="mt-3 max-w-prose leading-relaxed text-ink">{person.focus}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <span className="text-graphite-soft">{person.training}</span>
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${textLink} inline-flex min-h-10 items-center`}
                  >
                    LinkedIn
                    <span className="sr-only">: {person.name}</span>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-graphite">
          We also work with partner organisations.{" "}
          <Link href="/partners" className={textLink}>
            See our partners
          </Link>
        </p>
      </section>

      <section id="privacy" aria-labelledby="privacy-heading" className="mt-24 scroll-mt-24 grid gap-8 lg:grid-cols-3">
        <h2 id="privacy-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          Privacy
        </h2>
        <div className="max-w-prose space-y-4 leading-relaxed text-ink lg:col-span-2">
          <p>
            When you create an account we store your email, name and avatar from your sign-in
            provider. For each mind map you save we store the map and the file name. We do not keep
            the text of the paper you uploaded.
          </p>
          <p>
            <strong className="text-ink-strong">Saved mind maps are public.</strong> Every map you
            save appears in the Library, where anyone can read it. There is no private option yet, so
            only map papers you are allowed to share. You can delete a saved map at any time from{" "}
            <Link href="/settings" className={textLink}>
              Settings
            </Link>
            .
          </p>
          <p>
            Your Gemini API key is encrypted with AES-256-GCM before it is stored, and it is used only
            to send your requests to Google Gemini. Those requests are covered by Google&rsquo;s terms.
            You can remove the key from Settings.
          </p>
          <p>
            We measure page visits with Vercel Analytics and Speed Insights. To delete your account
            and everything attached to it, email{" "}
            <a href="mailto:biolayers.ai@gmail.com" className={textLink}>
              biolayers.ai@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <section id="terms" aria-labelledby="terms-heading" className="mt-20 scroll-mt-24 grid gap-8 lg:grid-cols-3">
        <h2 id="terms-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          Terms
        </h2>
        <div className="max-w-prose space-y-4 leading-relaxed text-ink lg:col-span-2">
          <p>
            BioLayers SI is for research and education. It is not a medical device and must not be
            used to diagnose or treat anyone.
          </p>
          <p>
            Mind maps are generated by a language model and can be wrong. Each statement links to the
            sentence it came from: check it there before you rely on it.
          </p>
          <p>
            Atlas images keep the licence of the dataset they come from, shown on every record. Some
            are for non-commercial research only.
          </p>
          <p>
            Only upload papers you have the right to use. Anything you save is published to the
            Library under your name.
          </p>
        </div>
      </section>
    </div>
  );
}
