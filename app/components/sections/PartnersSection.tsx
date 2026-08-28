"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  Layers,
  Globe2,
  TrendingUp,
  Handshake,
  Mail,
  ShieldCheck,
  Cpu,
  Database,
} from "lucide-react";
import Link from "next/link";

/* =========================================================
   PARTNERS DATA
   ========================================================= */

type PartnerItem = {
  id: string;
  name: string;
  category: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
  badge: string;
  pillars: {
    title: string;
    description: string;
    icon: typeof Sparkles;
  }[];
  highlights: string[];
};

const featuredPartner: PartnerItem = {
  id: "nxthorizon",
  name: "NXT Horizon",
  category: "Strategic Innovation Partner",
  role: "AI Strategy & Ecosystem Growth",
  tagline: "Empowering AI-Driven Oncology Innovation & Scalability",
  description:
    "NXT Horizon is a premier strategic innovation and market intelligence consultancy collaborating with BioLayers AI to accelerate AI-driven computational oncology breakthroughs, scale strategic partnerships, and expand biomedical ecosystem reach across global technology hubs.",
  url: "https://nxthorizon.ai",
  badge: "Featured Strategic Partner",
  pillars: [
    {
      title: "AI Ecosystem Strategy",
      description:
        "Guiding platform commercialization, AI positioning, and strategic roadmaps for computational oncology infrastructure.",
      icon: Cpu,
    },
    {
      title: "HealthTech & MedTech Outreach",
      description:
        "Connecting BioLayers AI with global life science networks, medical technology exhibitions, and venture catalysts.",
      icon: Globe2,
    },
    {
      title: "Market Intelligence & Growth",
      description:
        "Delivering market analytics and industry insights to accelerate researcher adoption of evidence-linked mechanism mapping.",
      icon: TrendingUp,
    },
  ],
  highlights: [
    "Strategic Innovation Catalyst",
    "Global HealthTech & AI Network",
    "Ecosystem Expansion & Advisory",
  ],
};

const ecosystemAreas = [
  {
    icon: Database,
    title: "Open Biomedical Data Standards",
    subtitle: "Literature & Ontology Infrastructure",
    description:
      "BioLayers AI leverages public biomedical repositories including NCBI PubMed and EMBL-EBI Cell Ontology (OLS) to ground cancer mechanism mapping in peer-reviewed scientific truth.",
    tags: ["PubMed / NCBI", "EMBL-EBI OLS", "Cell Ontology"],
  },
  {
    icon: Layers,
    title: "Translational Research Alliances",
    subtitle: "Mechanistic Validation",
    description:
      "Collaborating with academic oncology labs, computational biologists, and pathology researchers to validate AI-generated multi-paper evidence synthesis.",
    tags: ["Oncology Labs", "Multi-Paper Synthesis", "Hypothesis Testing"],
  },
  {
    icon: ShieldCheck,
    title: "Responsible AI & Security",
    subtitle: "Enterprise Governance",
    description:
      "Architected with Supabase row-level security, client-side BYOK encryption, and verifiable evidence citations ensuring research integrity and data sovereignty.",
    tags: ["BYOK Encryption", "RLS Data Sovereignty", "Verifiable Citations"],
  },
];

/* =========================================================
   PARTNERS SECTION
   ========================================================= */

export default function PartnersSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.04]
        bg-[#04070a]
        px-6
        py-24
        sm:px-10
        sm:py-28
        lg:px-16
        lg:py-36
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND ATMOSPHERE                             */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[20%]
          -z-20
          h-[800px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.035]
          blur-[190px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          top-[45%]
          -z-20
          h-[600px]
          w-[600px]
          rounded-full
          bg-sky-400/[0.03]
          blur-[160px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          opacity-[0.025]
          [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]
          bg-[linear-gradient(rgba(141,178,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,.10)_1px,transparent_1px)]
          bg-[size:80px_80px]
        "
      />

      <div className="mx-auto max-w-6xl">
        {/* ================================================= */}
        {/* SECTION HEADER                                    */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 24,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2.5
              rounded-full
              border
              border-teal-200/15
              bg-teal-300/[0.04]
              px-4
              py-2
              backdrop-blur-xl
            "
          >
            <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(77,141,255,.7)]" />
            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.24em]
                text-teal-100/80
              "
            >
              Ecosystem & Alliances
            </span>
          </div>

          <h1
            id="partners-heading"
            className="
              text-4xl
              font-semibold
              leading-[1.05]
              tracking-[-0.045em]
              text-white
              sm:text-5xl
              lg:text-6xl
            "
          >
            Alliances driving{" "}
            <span
              className="
                bg-gradient-to-r
                from-teal-200
                via-cyan-200
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              computational oncology
            </span>
          </h1>

          <p
            className="
              mt-6
              text-base
              leading-relaxed
              text-slate-300/80
              sm:text-lg
            "
          >
            BioLayers AI collaborates with strategic innovation catalysts,
            leading life science networks, and open biomedical standards to
            transform fragmented cancer literature into structured, explorable
            mechanistic intelligence.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* FEATURED PARTNER: NXT HORIZON                     */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 32,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.85,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            group
            relative
            mt-14
            overflow-hidden
            rounded-[32px]
            border
            border-teal-200/20
            bg-gradient-to-b
            from-[#0c141d]/85
            via-[#080d14]/75
            to-[#05080d]/90
            p-8
            shadow-[0_25px_80px_rgba(0,0,0,0.5)]
            backdrop-blur-2xl
            transition-all
            duration-500
            hover:border-teal-200/35
            sm:p-10
            lg:p-12
          "
        >
          {/* Ambient Glows Inside Card */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-80
              w-80
              rounded-full
              bg-teal-400/[0.08]
              blur-[100px]
              transition-all
              duration-700
              group-hover:bg-teal-300/[0.14]
            "
          />
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -left-20
              -bottom-20
              h-72
              w-72
              rounded-full
              bg-sky-400/[0.06]
              blur-[100px]
            "
          />

          <div className="relative">
            {/* Top Bar / Category Tag */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-teal-200/25
                    bg-teal-300/[0.08]
                    text-teal-200
                    shadow-[0_0_20px_rgba(77,141,255,0.15)]
                  "
                >
                  <Sparkles className="h-6 w-6 text-teal-300" />
                </div>
                <div>
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-emerald-300/25
                      bg-emerald-400/[0.08]
                      px-3
                      py-1
                      font-mono
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-emerald-200
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    {featuredPartner.badge}
                  </span>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {featuredPartner.category}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <a
                href={featuredPartner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group/btn
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-[14px]
                  border
                  border-teal-200/25
                  bg-teal-300/[0.08]
                  px-5
                  py-2.5
                  text-xs
                  font-bold
                  text-teal-50
                  transition
                  duration-300
                  hover:border-teal-200/40
                  hover:bg-teal-300/[0.16]
                  hover:text-white
                "
              >
                <span>Visit nxthorizon.ai</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </a>
            </div>

            {/* Main Headline & Description */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2
                  className="
                    text-3xl
                    font-black
                    tracking-[-0.03em]
                    text-white
                    sm:text-4xl
                  "
                >
                  {featuredPartner.name}
                </h2>
                <p className="mt-2 text-base font-semibold text-teal-200/90 sm:text-lg">
                  {featuredPartner.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300/85 sm:text-base sm:leading-7">
                  {featuredPartner.description}
                </p>

                {/* Highlights pill tags */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {featuredPartner.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="
                        rounded-lg
                        border
                        border-teal-100/10
                        bg-white/[0.025]
                        px-3
                        py-1.5
                        font-mono
                        text-[10px]
                        font-semibold
                        tracking-wider
                        text-slate-300
                      "
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual Monogram & Status Block */}
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-teal-100/[0.08]
                  bg-[#080e14]/70
                  p-6
                  backdrop-blur-xl
                "
              >
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-300/70">
                  Strategic Scope
                </div>
                <div className="mt-3 text-xl font-bold tracking-tight text-teal-50">
                  Accelerating AI & Life Sciences Convergence
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Connecting computational oncology algorithms with actionable
                  market intelligence, global healthtech exhibitions, and
                  pioneering bio-innovation networks.
                </p>

                <div className="mt-6 border-t border-teal-100/[0.06] pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400">
                      Collaboration
                    </span>
                    <span className="font-mono text-[10px] font-bold text-teal-200">
                      Active Multi-Year
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400">
                      Domain
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-200">
                      AI / HealthTech / Growth
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Pillars Grid */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPartner.pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="
                      relative
                      overflow-hidden
                      rounded-[20px]
                      border
                      border-teal-100/[0.07]
                      bg-[#060b10]/60
                      p-5
                      transition-colors
                      duration-300
                      hover:border-teal-100/[0.14]
                      hover:bg-[#0a1118]/70
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-teal-200/15
                          bg-teal-300/[0.05]
                          text-teal-300
                        "
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-teal-50">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* COLLABORATIVE ECOSYSTEM PILLARS                   */}
        {/* ================================================= */}

        <div className="mt-20">
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 20,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-center"
          >
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-teal-300/60">
              Ecosystem Architecture
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Foundation of our scientific collaborations
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ecosystemAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.title}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 24,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.6,
                    delay: reduceMotion ? 0 : index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
                    relative
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-teal-100/[0.06]
                    bg-[#080d14]/40
                    p-6
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:border-teal-100/[0.12]
                    hover:bg-[#0c141d]/50
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-teal-200/15
                      bg-teal-300/[0.05]
                      text-teal-300
                    "
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {area.title}
                  </h3>
                  <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-teal-200/60">
                    {area.subtitle}
                  </div>

                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    {area.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-teal-100/[0.05] pt-4">
                    {area.tags.map((tag) => (
                      <span
                        key={tag}
                        className="
                          rounded-md
                          border
                          border-white/[0.06]
                          bg-white/[0.02]
                          px-2
                          py-1
                          font-mono
                          text-[9px]
                          text-slate-400
                        "
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================================================= */}
        {/* PARTNER WITH US CTA                               */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 24,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            relative
            mt-20
            overflow-hidden
            rounded-[28px]
            border
            border-teal-100/[0.08]
            bg-gradient-to-r
            from-[#070e16]/80
            via-[#0a131e]/70
            to-[#070e16]/80
            p-8
            text-center
            backdrop-blur-2xl
            sm:p-12
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-72
              w-96
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-teal-400/[0.05]
              blur-[120px]
            "
          />

          <div className="relative mx-auto max-w-2xl">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-teal-200/15
                bg-teal-300/[0.04]
                px-3.5
                py-1.5
                font-mono
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-teal-200/80
              "
            >
              <Handshake className="h-3.5 w-3.5 text-teal-300" />
              Collaborate with BioLayers
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Partner with us to redefine cancer research
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-300/85 sm:text-base">
              Whether you are an academic research laboratory, biopharma
              organization, or technology innovation group, we welcome
              collaborations to expand verifiable mechanism intelligence.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:contact@biolayers.ai?subject=Partnership%20Inquiry%20-%20BioLayers%20AI"
                className="
                  group
                  flex
                  items-center
                  gap-2.5
                  rounded-[14px]
                  border
                  border-teal-200/30
                  bg-teal-300/[0.1]
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-teal-50
                  transition
                  duration-300
                  hover:border-teal-200/50
                  hover:bg-teal-300/[0.18]
                  hover:text-white
                "
              >
                <Mail className="h-4 w-4 text-teal-300" />
                Contact Partnerships
              </a>

              <Link
                href="/platform"
                className="
                  group
                  flex
                  items-center
                  gap-2.5
                  rounded-[14px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  duration-300
                  hover:border-white/20
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                Explore Platform
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
