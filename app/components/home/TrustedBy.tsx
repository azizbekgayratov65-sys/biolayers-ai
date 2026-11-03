"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

type Org = { name: string; role: string; logo?: string; dark?: boolean; zoom?: boolean; caption?: boolean };

// Only organisations already named on /about, /partners or /press.
const orgs: Org[] = [
  { name: "MD Anderson Cancer Center", role: "Mentor", logo: "/mentorship/md-anderson.png" },
  { name: "Weill Cornell Medicine", role: "Mentor", logo: "/mentorship/weill-cornell-medicine.png" },
  { name: "Nationwide Children's Hospital", role: "Mentor", logo: "/branding/nch-logo.svg" },
  { name: "The Ohio State University", role: "Mentor", logo: "/branding/osu-logo.svg" },
  { name: "Hollings Cancer Center, MUSC", role: "Mentor" },
  { name: "NXT Horizon", role: "Partner", logo: "/branding/nxthorizon-logo.png" },
  { name: "STEMise", role: "Partner", logo: "/branding/stemise-logo.png", zoom: true },
  { name: "BioMedizone", role: "Partner", logo: "/branding/biomedizone-logo.png" },
  { name: "Computational Biologists Society at UCLA", role: "Partner", logo: "/branding/ucla-logo.svg" },
  { name: "HundrED", role: "Featured by", logo: "/branding/hundred-logo.svg", dark: true },
  { name: "AI Business", role: "Featured by", logo: "/branding/aibusiness-logo.png", dark: true, caption: true },
];

function Tile({ org }: { org: Org }) {
  return (
    <li
      className={`group relative flex h-28 w-60 shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 px-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(45,212,191,0.35)] ${
        org.dark ? "bg-slate-900" : "bg-white/[0.96]"
      }`}
    >
      {org.logo ? (
        <Image
          src={org.logo}
          alt={org.name}
          width={160}
          height={56}
          loading="eager"
          className={`w-auto max-w-[11rem] object-contain ${org.zoom ? "max-h-20 scale-[1.6]" : "max-h-14"}`}
        />
      ) : (
        <span className="text-center text-sm font-bold leading-tight text-slate-800">{org.name}</span>
      )}
      {org.logo && org.caption && (
        <span className="-mt-1 text-sm font-semibold leading-none text-white">{org.name}</span>
      )}
      <span
        className={`font-mono text-[9px] font-bold uppercase tracking-[0.2em] ${
          org.dark ? "text-teal-300" : "text-teal-700"
        }`}
      >
        {org.role}
      </span>
    </li>
  );
}

export default function TrustedBy() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section className="relative mx-auto mt-24 w-full max-w-[100vw]" aria-labelledby="trusted-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.08] blur-[120px]"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="px-6 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/25 bg-teal-300/[0.07] px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-teal-100">
          <BadgeCheck className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
          Trusted by
        </span>
        <h2
          id="trusted-heading"
          className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl"
        >
          Guided by{" "}
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">
            leading cancer researchers
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-graphite">
          Mentors, partners and press behind BioLayers SI.
        </p>
      </motion.div>

      <div
        className="relative mt-10 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        role="group"
        aria-label="Organisations that mentor, partner with or feature BioLayers SI"
      >
        {reduceMotion ? (
          <ul className="flex flex-wrap justify-center gap-4 px-6">
            {orgs.map((org) => (
              <Tile key={org.name} org={org} />
            ))}
          </ul>
        ) : (
          <motion.ul
            className="flex w-max gap-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 45, ease: "linear", repeat: Infinity }}
          >
            {[...orgs, ...orgs].map((org, i) => (
              <Tile key={`${org.name}-${i}`} org={org} />
            ))}
          </motion.ul>
        )}
      </div>

      <p className="mt-5 px-6 text-center text-xs text-graphite">
        Mentors are affiliated with these institutions as individuals. Listing does not imply
        institutional endorsement.
      </p>
    </section>
  );
}
