"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const credentials = [
  {
    label: "Clinical training",
    title: "Hematology & Medical Oncology",
    institution: "Weill Cornell Medicine · NewYork-Presbyterian",
    logo: "/mentorship/weill-cornell-medicine.png",
    logoAlt: "Weill Cornell Medicine",
  },
  {
    label: "MD / PhD training",
    title: "M.D. · Ph.D. in Biomedical Engineering",
    institution: "Johns Hopkins University",
    logo: "/mentorship/johns-hopkins-school-of-medicine.png",
    logoAlt: "Johns Hopkins School of Medicine",
  },
];

export default function ResearchMentorshipSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="research-mentorship"
      aria-labelledby="research-mentorship-heading"
      className="relative isolate overflow-hidden border-t border-teal-100/[0.05] bg-[#04070a] px-6 py-28 sm:px-8 lg:px-10 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-300/[0.025] to-transparent"
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-[420px] w-[420px] rounded-full bg-teal-400/[0.055] blur-[130px]" />
        <div className="absolute right-[8%] top-[18%] h-[380px] w-[380px] rounded-full bg-sky-400/[0.045] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(141,178,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <div className="relative mx-auto max-w-[1440px]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/15 bg-teal-300/[0.045] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(77,141,255,.7)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-100/75">
              Scientific mentorship
            </span>
          </div>

          <h2
            id="research-mentorship-heading"
            className="mt-7 text-4xl font-semibold tracking-[-0.05em] text-teal-50 sm:text-5xl lg:text-6xl">
            Building BioLayers at the intersection of{" "}
            <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              AI and precision oncology.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300/82 sm:text-lg">
            BioLayers AI is being developed with scientific mentorship that
            connects computational biology, cancer genomics, translational
            research, and evidence-aware AI.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-5 lg:grid-cols-[1fr_140px_1.18fr] lg:items-stretch">
          <ProfileCard
            eyebrow="Founder"
            image="/mentorship/founder.png"
            imageAlt="Founder of BioLayers AI"
            name="Azizbek Gayratov"
            role="Founder of BioLayers AI"
            description="Developing an AI-native research environment for reconstructing cancer mechanisms from fragmented biomedical evidence."
            reduceMotion={reduceMotion}
            linkedin="https://www.linkedin.com/in/azizbekgayratov/"
          />

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-teal-300/10 via-teal-200/65 to-sky-300/10" />
            <motion.div
              initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-teal-100/15 bg-[#0a0f14] shadow-[0_0_45px_rgba(77,141,255,.12)]"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-teal-200 shadow-[0_0_18px_rgba(77,141,255,.85)]" />
              {!reduceMotion && (
                <span className="absolute h-9 w-9 animate-ping rounded-full border border-teal-200/15" />
              )}
            </motion.div>
          </div>

          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="overflow-hidden rounded-[28px] border border-teal-100/[0.08] bg-[#0a0f14]/68 shadow-[0_30px_100px_rgba(0,0,0,.22)] backdrop-blur-2xl"
          >
            <div className="grid min-h-full md:grid-cols-[0.82fr_1.18fr]">
              <div className="relative min-h-[390px] overflow-hidden md:min-h-full">
                <Image
                  src="/mentorship/john-william-sidhom.png"
                  alt="John-William Sidhom, M.D., Ph.D."
                  fill
                  sizes="(max-width: 768px) 100vw, 34vw"
                  className="object-cover object-center"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b10] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0a0f14]/35" />
              </div>

              <div className="flex flex-col p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-200/65">
                  Scientific mentor
                </p>

                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-teal-50 sm:text-3xl">
                  John-William Sidhom, M.D., Ph.D.
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300/80">
                  Physician-scientist working across hematology & medical
                  oncology, cancer genomics, deep learning, and precision
                  oncology.
                </p>

                <div className="mt-7 space-y-3">
                  {credentials.map((credential) => (
                    <div
                      key={credential.label}
                      className="grid grid-cols-[64px_1fr] gap-4 rounded-[18px] border border-teal-100/[0.065] bg-teal-100/[0.025] p-3.5"
                    >
                      <div className="relative flex min-h-16 items-center justify-center overflow-hidden rounded-[13px] bg-white p-2">
                        <Image
                          src={credential.logo}
                          alt={credential.logoAlt}
                          width={110}
                          height={70}
                          className="h-auto max-h-12 w-auto object-contain"
                        />
                      </div>

                      <div className="self-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-teal-200/55">
                          {credential.label}
                        </p>
                        <p className="mt-1 text-[13px] font-semibold leading-5 text-teal-50/90">
                          {credential.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-slate-400">
                          {credential.institution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-7">
                  <a
                    href="https://www.linkedin.com/in/john-william-sidhom-md-phd-b685abb/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-[14px] border border-teal-200/15 bg-teal-300/[0.055] px-4 py-2.5 text-xs font-semibold text-teal-50 transition hover:border-teal-200/30 hover:bg-teal-300/[0.10]"
                  >
                    View professional profile
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.article>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="mt-6 rounded-[24px] border border-teal-100/[0.065] bg-[#0a0f14]/50 p-6 backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-200/60">
                Mentorship focus
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-teal-50">
                From biological evidence to clinically meaningful reasoning.
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Computational oncology",
                "Cancer genomics",
                "Precision oncology",
                "Translational AI",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[16px] border border-teal-100/[0.055] bg-teal-100/[0.02] px-4 py-3"
                >
                  <span className="font-mono text-[10px] text-teal-200/45">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="mx-auto mt-7 max-w-4xl text-center text-[10px] leading-5 text-slate-500">
          Institutional names and affiliations are presented solely as
          biographical context for the mentor and do not imply institutional
          sponsorship, endorsement, or partnership with BioLayers AI.
        </p>
      </div>
    </section>
  );
}

function ProfileCard({
  eyebrow,
  image,
  imageAlt,
  name,
  role,
  description,
  reduceMotion,
  linkedin,
}: {
  eyebrow: string;
  image: string;
  imageAlt: string;
  name: string;
  role: string;
  description: string;
  reduceMotion: boolean;
  linkedin?: string;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      className="overflow-hidden rounded-[28px] border border-teal-100/[0.08] bg-[#0a0f14]/68 shadow-[0_30px_100px_rgba(0,0,0,.22)] backdrop-blur-2xl"
    >
      <div className="relative aspect-[1.08/1] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 38vw"
          className="object-cover object-center"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-transparent" />
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-200/65">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-teal-50 sm:text-3xl">
          {name}
        </h3>
        <p className="mt-2 text-sm font-semibold text-teal-100/75">{role}</p>
        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300/78">
          {description}
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {["AI", "Cancer biology", "Knowledge graphs"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-teal-100/[0.07] bg-teal-100/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>

        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-[14px] border border-teal-200/15 bg-teal-300/[0.055] px-4 py-2.5 text-xs font-semibold text-teal-50 transition hover:border-teal-200/30 hover:bg-teal-300/[0.10]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
            </svg>
            LinkedIn profile
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </motion.article>
  );
}