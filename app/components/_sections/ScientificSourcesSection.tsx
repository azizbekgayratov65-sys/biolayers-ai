"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Database,
  Dna,
  FileSearch,
  Layers3,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type SourceCard = {
  name: string;
  shortName: string;
  category: string;
  description: string;
  role: string;
  status: "live" | "roadmap";
  icon: React.ComponentType<{
    className?: string;
  }>;
};

const sources: SourceCard[] = [
  {
    name: "PubMed",
    shortName: "PM",
    category: "Literature",
    description:
      "Peer-reviewed biomedical literature used to trace mechanistic claims back to source papers.",
    role: "Claims · evidence sentences · citations",
    status: "live",
    icon: BookOpenText,
  },
  {
    name: "Cell Ontology",
    shortName: "CL",
    category: "Cells",
    description:
      "Structured cell-type terms used to label and compare cell states mentioned in the literature.",
    role: "Cell types · synonyms · identifiers",
    status: "live",
    icon: Network,
  },
  {
    name: "Reactome",
    shortName: "RX",
    category: "Pathways",
    description:
      "Curated biological pathways intended to contextualize signaling relationships and pathway-level mechanisms.",
    role: "Pathways · reactions · biological processes",
    status: "roadmap",
    icon: Layers3,
  },
  {
    name: "UniProt",
    shortName: "UP",
    category: "Proteins",
    description:
      "Protein-level annotation planned for names, functions, identifiers, and molecular context.",
    role: "Proteins · functions · identifiers",
    status: "roadmap",
    icon: FileSearch,
  },
  {
    name: "Human Protein Atlas",
    shortName: "HPA",
    category: "Expression",
    description:
      "Expression and tissue context planned to connect molecular mechanisms with biological and disease environments.",
    role: "Tissue · cell type · expression context",
    status: "roadmap",
    icon: Database,
  },
  {
    name: "NCBI Gene",
    shortName: "NG",
    category: "Genes",
    description:
      "Gene-level reference information planned to normalize entities and connect literature mentions to canonical genes.",
    role: "Genes · aliases · genomic context",
    status: "roadmap",
    icon: Dna,
  },
];

const provenanceSteps = [
  {
    step: "01",
    title: "Retrieve",
    text: "Find relevant biomedical literature and structured biological references.",
  },
  {
    step: "02",
    title: "Normalize",
    text: "Map mentions to consistent biological entities and identifiers.",
  },
  {
    step: "03",
    title: "Connect",
    text: "Reconstruct directional mechanistic relationships between entities.",
  },
  {
    step: "04",
    title: "Verify",
    text: "Attach evidence, source context, and uncertainty to each relationship.",
  },
];

export default function ScientificSourcesSection() {
  const reduceMotion =
    Boolean(useReducedMotion());

  return (
    <section
      id="scientific-sources"
      aria-labelledby="scientific-sources-heading"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.04]
        bg-[#04070a]
        px-6
        py-28
        md:px-10
        md:py-36
        lg:px-16
        lg:py-44
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[38%]
          -z-20
          h-[900px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.035]
          blur-[210px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[-180px]
          top-[12%]
          -z-20
          h-[480px]
          w-[480px]
          rounded-full
          bg-sky-400/[0.03]
          blur-[170px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          opacity-[0.28]
          [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]
          bg-[linear-gradient(rgba(141,178,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,.018)_1px,transparent_1px)]
          bg-[size:84px_84px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 22,
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
            duration: reduceMotion
              ? 0
              : 0.75,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="max-w-5xl"
        >
          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-teal-200/15
              bg-teal-300/[0.04]
              px-4
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-teal-100/75
            "
          >
            <Database className="h-3.5 w-3.5" />
            Scientific data infrastructure
          </div>

          <h2
            id="scientific-sources-heading"
            className="
              max-w-5xl
              text-4xl
              font-semibold
              leading-[1.04]
              tracking-[-0.05em]
              text-teal-50
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Every mechanism needs
            <span
              className="
                ml-3
                bg-gradient-to-r
                from-teal-200
                via-cyan-200
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              scientific grounding.
            </span>
          </h2>

          <p
            className="
              mt-8
              max-w-4xl
              text-base
              leading-8
              text-slate-300/80
              md:text-lg
              md:leading-9
            "
          >
            BioLayers is built to connect
            mechanistic reasoning with
            biomedical literature and curated
            biological resources — so users can
            move from a relationship on the map
            back to the evidence and biological
            context behind it. PubMed and cell
            ontology lookups are live in the
            workspace today; additional curated
            resources are on the roadmap.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* SOURCE CARDS                                     */}
        {/* ================================================= */}

        <div
          className="
            mt-16
            grid
            gap-4
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-6
          "
        >
          {sources.map(
            (source, index) => {
              const Icon =
                source.icon;

              return (
                <motion.article
                  key={source.name}
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
                    duration:
                      reduceMotion
                        ? 0
                        : 0.58,
                    delay:
                      reduceMotion
                        ? 0
                        : index *
                          0.06,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -4,
                        }
                  }
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-teal-100/[0.07]
                    bg-[#0a0f14]/50
                    p-5
                    shadow-[0_18px_55px_rgba(1,8,15,.16)]
                    backdrop-blur-2xl
                    transition-colors
                    duration-300
                    hover:border-teal-100/[0.14]
                    hover:bg-[#10161d]/62
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-36
                      w-36
                      rounded-full
                      bg-teal-300/[0.045]
                      blur-[60px]
                      transition
                      duration-500
                      group-hover:bg-teal-300/[0.075]
                    "
                  />

                  <div
                    className="
                      relative
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-[14px]
                        border
                        border-teal-100/[0.08]
                        bg-teal-100/[0.035]
                      "
                    >
                      <Icon className="h-4 w-4 text-teal-200/70" />
                    </div>

                    <div
                      className={`
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-2.5
                        py-1
                        font-mono
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.14em]

                        ${
                          source.status === "live"
                            ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200/90"
                            : "border-white/[0.08] bg-white/[0.03] text-slate-500"
                        }
                      `}
                    >
                      <span
                        className={
                          source.status === "live"
                            ? "h-1.5 w-1.5 rounded-full bg-emerald-300"
                            : "h-1.5 w-1.5 rounded-full bg-slate-600"
                        }
                      />
                      {source.status === "live"
                        ? "Live"
                        : "Roadmap"}
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.18em]
                          text-teal-200/55
                        "
                      >
                        {source.category}
                      </p>

                      <span
                        className="
                          font-mono
                          text-[9px]
                          font-bold
                          text-slate-500
                        "
                      >
                        {source.shortName}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-2
                        text-xl
                        font-semibold
                        tracking-[-0.035em]
                        text-teal-50
                      "
                    >
                      {source.name}
                    </h3>

                    <p
                      className="
                        mt-3
                        text-sm
                        leading-6
                        text-slate-400/90
                      "
                    >
                      {
                        source.description
                      }
                    </p>
                  </div>

                  <div
                    className="
                      relative
                      mt-6
                      border-t
                      border-teal-100/[0.055]
                      pt-4
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-slate-500
                      "
                    >
                      {source.role}
                    </p>
                  </div>
                </motion.article>
              );
            },
          )}
        </div>

        {/* ================================================= */}
        {/* PROVENANCE WORKFLOW                              */}
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
            duration:
              reduceMotion
                ? 0
                : 0.75,
          }}
          className="
            relative
            mt-8
            overflow-hidden
            rounded-[28px]
            border
            border-teal-100/[0.08]
            bg-[#0a0f14]/48
            p-6
            backdrop-blur-2xl
            md:p-8
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-x-20
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-teal-200/25
              to-transparent
            "
          />

          <div
            className="
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-teal-200/60
                "
              >
                <ShieldCheck className="h-4 w-4" />
                Provenance pipeline
              </div>

              <h3
                className="
                  mt-4
                  max-w-3xl
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                  text-teal-50
                  sm:text-3xl
                "
              >
                From source data to
                traceable biological
                relationships.
              </h3>
            </div>

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-emerald-300/12
                bg-emerald-300/[0.035]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                text-emerald-200/70
              "
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Evidence-aware by design
            </div>
          </div>

          <div
            className="
              mt-8
              grid
              gap-3
              lg:grid-cols-4
            "
          >
            {provenanceSteps.map(
              (item, index) => (
                <motion.div
                  key={item.step}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 14,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration:
                      reduceMotion
                        ? 0
                        : 0.5,
                    delay:
                      reduceMotion
                        ? 0
                        : index *
                          0.06,
                  }}
                  className="
                    relative
                    rounded-[18px]
                    border
                    border-teal-100/[0.06]
                    bg-teal-100/[0.022]
                    p-5
                  "
                >
                  <span
                    className="
                      font-mono
                      text-[9px]
                      font-bold
                      tracking-[0.16em]
                      text-teal-200/45
                    "
                  >
                    {item.step}
                  </span>

                  <h4
                    className="
                      mt-4
                      text-base
                      font-semibold
                      text-teal-50/90
                    "
                  >
                    {item.title}
                  </h4>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-6
                      text-slate-400/90
                    "
                  >
                    {item.text}
                  </p>
                </motion.div>
              ),
            )}
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* EXAMPLE EVIDENCE TRACE                            */}
        {/* ================================================= */}

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
            duration:
              reduceMotion
                ? 0
                : 0.68,
          }}
          className="
            mt-5
            grid
            gap-4
            lg:grid-cols-[1.15fr_.85fr]
          "
        >
          <div
            className="
              rounded-[24px]
              border
              border-teal-100/[0.065]
              bg-[#0a0f14]/42
              p-6
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.17em]
                text-teal-200/60
              "
            >
              <FileSearch className="h-4 w-4" />
              Example evidence trace
            </div>

            <div
              className="
                mt-6
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <EntityPill label="TGF-β" />
              <ArrowRight className="h-4 w-4 text-teal-200/35" />
              <RelationPill label="activates" />
              <ArrowRight className="h-4 w-4 text-teal-200/35" />
              <EntityPill label="SMAD2/3" />
            </div>

            <p
              className="
                mt-6
                max-w-3xl
                text-sm
                leading-7
                text-slate-300/80
              "
            >
              A relationship should not
              exist as an isolated edge.
              BioLayers is designed to keep
              the supporting literature,
              biological context, and source
              provenance attached to the
              mechanism.
            </p>
          </div>

          <div
            className="
              rounded-[24px]
              border
              border-teal-100/[0.065]
              bg-[#0a0f14]/42
              p-6
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.17em]
                text-sky-200/65
              "
            >
              <Sparkles className="h-4 w-4" />
              Research principle
            </div>

            <p
              className="
                mt-5
                text-lg
                font-semibold
                leading-8
                tracking-[-0.02em]
                text-teal-50/88
              "
            >
              No black-box mechanism.
            </p>

            <p
              className="
                mt-3
                text-sm
                leading-7
                text-slate-400/90
              "
            >
              Every important relationship
              should remain inspectable:
              where it came from, what
              supports it, where it applies,
              and where uncertainty remains.
            </p>

            <a
              href="#multi-paper-evidence"
              className="
                group
                mt-6
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-teal-200/75
                transition
                hover:text-teal-100
              "
            >
              See evidence synthesis

              <ArrowRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EntityPill({
  label,
}: {
  label: string;
}) {
  return (
    <span
      className="
        rounded-[13px]
        border
        border-teal-200/12
        bg-teal-300/[0.045]
        px-4
        py-2
        text-sm
        font-semibold
        text-teal-50
      "
    >
      {label}
    </span>
  );
}

function RelationPill({
  label,
}: {
  label: string;
}) {
  return (
    <span
      className="
        rounded-full
        border
        border-sky-200/10
        bg-sky-200/[0.035]
        px-3
        py-1.5
        text-[10px]
        font-bold
        uppercase
        tracking-[0.14em]
        text-sky-100/70
      "
    >
      {label}
    </span>
  );
}