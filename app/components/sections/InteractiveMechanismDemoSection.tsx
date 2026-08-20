"use client";

import type React from "react";
import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  CircleDot,
  Dna,
  FlaskConical,
  GitBranch,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type DemoNode = {
  id: string;
  label: string;
  shortLabel: string;
  type: string;
  role: string;
  context: string;
  evidence: string;
  pmid: string;
  model: string;
  confidence: number;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
};

const nodes: DemoNode[] = [
  {
    id: "caf",
    label: "Cancer-associated fibroblast",
    shortLabel: "CAF",
    type: "Cell",
    role: "Tumor-microenvironment stromal cell",
    context:
      "Cancer-associated fibroblasts can influence tumor progression through secreted factors, extracellular-matrix remodeling and signaling interactions.",
    evidence: "Supported",
    pmid: "Demo evidence",
    model: "Tumor microenvironment",
    confidence: 94,
    accent: "cyan",
    icon: CircleDot,
  },
  {
    id: "tgfb",
    label: "Transforming growth factor beta",
    shortLabel: "TGF-β",
    type: "Ligand",
    role: "Secreted signaling molecule",
    context:
      "TGF-β signaling can regulate stromal behavior, epithelial plasticity, invasion and multiple tumor-associated transcriptional programs.",
    evidence: "Supported",
    pmid: "Demo evidence",
    model: "Cancer signaling",
    confidence: 92,
    accent: "violet",
    icon: Sparkles,
  },
  {
    id: "tgfbr",
    label: "TGF-β receptor complex",
    shortLabel: "TGFBR",
    type: "Receptor",
    role: "Cell-surface signaling receptor",
    context:
      "TGF-β binding activates its receptor complex and initiates downstream canonical and non-canonical signaling.",
    evidence: "Supported",
    pmid: "Demo evidence",
    model: "Receptor signaling",
    confidence: 96,
    accent: "purple",
    icon: Network,
  },
  {
    id: "smad",
    label: "SMAD2 / SMAD3",
    shortLabel: "SMAD2/3",
    type: "Protein",
    role: "Intracellular signaling mediators",
    context:
      "Activated SMAD2 and SMAD3 participate in transcriptional regulation downstream of canonical TGF-β signaling.",
    evidence: "Supported",
    pmid: "Demo evidence",
    model: "Signal transduction",
    confidence: 95,
    accent: "fuchsia",
    icon: Dna,
  },
  {
    id: "emt",
    label: "Epithelial–mesenchymal transition",
    shortLabel: "EMT",
    type: "Biological process",
    role: "Cell-state plasticity program",
    context:
      "EMT-associated programs can alter adhesion, polarity, motility and invasive potential in malignant cells.",
    evidence: "Context dependent",
    pmid: "Demo evidence",
    model: "Cancer cell plasticity",
    confidence: 86,
    accent: "pink",
    icon: FlaskConical,
  },
  {
    id: "invasion",
    label: "Tumor invasion",
    shortLabel: "Invasion",
    type: "Phenotype",
    role: "Acquisition of invasive behavior",
    context:
      "Tumor cells acquire the ability to cross local tissue boundaries and migrate through surrounding environments.",
    evidence: "Supported",
    pmid: "Demo evidence",
    model: "Tumor progression",
    confidence: 89,
    accent: "rose",
    icon: ArrowRight,
  },
  {
    id: "metastasis",
    label: "Metastatic phenotype",
    shortLabel: "Metastasis",
    type: "Disease mechanism",
    role: "Advanced malignant progression",
    context:
      "Metastatic progression emerges from multiple interacting cellular, molecular and microenvironmental mechanisms.",
    evidence: "Multifactorial",
    pmid: "Demo evidence",
    model: "Cancer progression",
    confidence: 82,
    accent: "orange",
    icon: ShieldCheck,
  },
];

const relationships = [
  "secretes",
  "binds",
  "activates",
  "induces",
  "promotes",
  "contributes to",
];

export default function InteractiveMechanismDemoSection() {
  const [selectedId, setSelectedId] = useState("smad");

  const selectedNode =
    nodes.find((node) => node.id === selectedId) ?? nodes[0];

  return (
    <section
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
        lg:py-40
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[45%]
          -z-10
          h-[900px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.04]
          blur-[200px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-220px]
          top-[25%]
          -z-10
          h-[520px]
          w-[520px]
          rounded-full
          bg-sky-400/[0.03]
          blur-[170px]
        "
      />

      <div className="mx-auto max-w-[1400px]">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-5xl"
        >
          <div
            className="
              mb-6
              text-sm
              font-medium
              uppercase
              tracking-[0.3em]
              text-teal-200/75
            "
          >
            Interactive mechanism demo
          </div>

          <h2
            className="
              text-4xl
              font-semibold
              leading-[1.04]
              tracking-[-0.045em]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Don&apos;t just read the evidence.

            <span
              className="
                mt-2
                block
                bg-gradient-to-r
                from-teal-200
                via-teal-300
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              Explore the mechanism.
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
            Move through a biological mechanism layer by layer. Select any
            entity to inspect its function, cancer context and evidence
            provenance.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* WORKSPACE                                        */}
        {/* ================================================= */}

        <div
          className="
            mt-16
            grid
            items-start
            gap-5
            xl:grid-cols-[minmax(0,1fr)_360px]
          "
        >
          {/* ================================================= */}
          {/* LEFT — MECHANISM MAP                              */}
          {/* ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              min-w-0
              overflow-hidden
              rounded-[26px]
              border
              border-teal-100/[0.085]
              bg-[#070b10]/88
              backdrop-blur-2xl
            "
          >
            {/* MAP HEADER */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-b
                border-teal-100/[0.065]
                px-6
                py-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div>
                <div
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-slate-500/85
                  "
                >
                  Cancer mechanism map
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-teal-50/80
                    md:text-base
                  "
                >
                  CAF → TGF-β → SMAD signaling → metastatic phenotype
                </div>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  shrink-0
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.055]
                  px-3
                  py-1.5
                  text-[11px]
                  font-medium
                  text-emerald-300/65
                "
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Evidence-linked
              </div>
            </div>

            {/* MAP AREA */}

            <div
              className="
                relative
                overflow-hidden
                px-5
                py-8
                md:px-7
                md:py-10
              "
            >
              {/* soft map glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[300px]
                  w-[700px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-teal-400/[0.035]
                  blur-[110px]
                "
              />

              {/* HORIZONTAL MECHANISM */}

              <div
                className="
                  relative
                  overflow-x-auto
                  pb-3
                  [scrollbar-color:rgba(255,255,255,0.12)_transparent]
                  [scrollbar-width:thin]
                "
              >
                <div
                  className="
                    flex
                    min-w-max
                    items-center
                    gap-2
                  "
                >
                  {nodes.map((node, index) => {
                    const Icon = node.icon;
                    const selected = node.id === selectedId;

                    return (
                      <Fragment key={node.id}>
                        <motion.button
                          type="button"
                          onClick={() => setSelectedId(node.id)}
                          whileHover={{
                            y: -4,
                          }}
                          whileTap={{
                            scale: 0.98,
                          }}
                          className={`
                            group/node
                            relative
                            w-[138px]
                            shrink-0
                            rounded-[18px]
                            border
                            p-4
                            text-left
                            transition-all
                            duration-300

                            ${
                              selected
                                ? "border-teal-200/30 bg-teal-300/[0.075] shadow-[0_0_35px_rgba(77,141,255,0.07)]"
                                : "border-teal-100/[0.065] bg-white/[0.022] hover:border-white/[0.14] hover:bg-white/[0.04]"
                            }
                          `}
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                            "
                          >
                            <div
                              className={`
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-xl
                                border

                                ${
                                  selected
                                    ? "border-teal-200/20 bg-teal-300/[0.08]"
                                    : "border-teal-100/[0.065] bg-teal-100/[0.02]"
                                }
                              `}
                            >
                              <Icon
                                className={`
                                  h-3.5
                                  w-3.5
                                  ${
                                    selected
                                      ? "text-teal-100"
                                      : "text-slate-400/85"
                                  }
                                `}
                              />
                            </div>

                            <span
                              className="
                                text-[8px]
                                font-semibold
                                uppercase
                                tracking-[0.11em]
                                text-slate-500/75
                              "
                            >
                              {node.type}
                            </span>
                          </div>

                          <div
                            className={`
                              mt-5
                              text-sm
                              font-medium
                              leading-5
                              ${
                                selected
                                  ? "text-white"
                                  : "text-slate-300/80"
                              }
                            `}
                          >
                            {node.shortLabel}
                          </div>

                          {selected && (
                            <motion.div
                              layoutId="selected-mechanism-node"
                              className="
                                absolute
                                bottom-0
                                left-5
                                right-5
                                h-px
                                bg-gradient-to-r
                                from-transparent
                                via-teal-300
                                to-transparent
                              "
                            />
                          )}
                        </motion.button>

                        {index < nodes.length - 1 && (
                          <div
                            className="
                              flex
                              w-[62px]
                              shrink-0
                              flex-col
                              items-center
                              justify-center
                            "
                          >
                            <span
                              className="
                                mb-1.5
                                whitespace-nowrap
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-[0.1em]
                                text-slate-500/75
                              "
                            >
                              {relationships[index]}
                            </span>

                            <div className="flex w-full items-center">
                              <div
                                className="
                                  h-px
                                  flex-1
                                  bg-gradient-to-r
                                  from-teal-100/[0.035]
                                  to-teal-300/25
                                "
                              />

                              <ArrowRight
                                className="
                                  -ml-px
                                  h-3.5
                                  w-3.5
                                  text-teal-300/35
                                "
                              />
                            </div>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              {/* THREE PRINCIPLES */}

              <div
                className="
                  mt-8
                  grid
                  gap-3
                  md:grid-cols-3
                "
              >
                <InfoCard
                  icon={GitBranch}
                  title="Directionality"
                  text="The relationship direction and biological action remain explicit."
                  accent="text-teal-200/70"
                />

                <InfoCard
                  icon={FlaskConical}
                  title="Context"
                  text="Experimental and disease context stay attached to each mechanism."
                  accent="text-sky-200/70"
                />

                <InfoCard
                  icon={BookOpenText}
                  title="Provenance"
                  text="Every important connection can lead back to supporting evidence."
                  accent="text-indigo-200/70"
                />
              </div>
            </div>
          </motion.div>

          {/* ================================================= */}
          {/* RIGHT — INSPECTOR                                  */}
          {/* ================================================= */}

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.8,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-teal-100/[0.085]
              bg-[#070b10]/88
              backdrop-blur-2xl
            "
          >
            <div
              className="
                border-b
                border-teal-100/[0.065]
                px-6
                py-5
              "
            >
              <div
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-slate-500/85
                "
              >
                Evidence inspector
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.22,
                }}
                className="p-6"
              >
                {/* ENTITY HEADER */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-teal-200/65
                      "
                    >
                      {selectedNode.type}
                    </div>

                    <h3
                      className="
                        mt-2
                        text-2xl
                        font-medium
                        leading-tight
                        tracking-[-0.03em]
                        text-white
                      "
                    >
                      {selectedNode.shortLabel}
                    </h3>

                    <div
                      className="
                        mt-1
                        max-w-[250px]
                        text-xs
                        leading-5
                        text-white/30
                      "
                    >
                      {selectedNode.label}
                    </div>
                  </div>

                  <div
                    className="
                      rounded-full
                      border
                      border-teal-200/10
                      bg-teal-300/[0.045]
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-teal-100/65
                    "
                  >
                    {selectedNode.confidence}%
                  </div>
                </div>

                {/* ROLE */}

                <InspectorBlock
                  label="Biological role"
                  value={selectedNode.role}
                />

                {/* CONTEXT */}

                <InspectorBlock
                  label="Cancer context"
                  value={selectedNode.context}
                />

                {/* META GRID */}

                <div
                  className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-2.5
                  "
                >
                  <MetaCard
                    label="Evidence"
                    value={selectedNode.evidence}
                  />

                  <MetaCard
                    label="Model"
                    value={selectedNode.model}
                  />

                  <MetaCard
                    label="Source"
                    value={selectedNode.pmid}
                  />

                  <MetaCard
                    label="Confidence"
                    value={`${selectedNode.confidence}%`}
                  />
                </div>

                {/* EVIDENCE SENTENCE */}

                <div
                  className="
                    mt-5
                    rounded-[18px]
                    border
                    border-teal-100/[0.065]
                    bg-black/15
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.15em]
                      text-slate-500/80
                    "
                  >
                    <BookOpenText className="h-3.5 w-3.5" />
                    Evidence sentence
                  </div>

                  <p
                    className="
                      mt-3
                      text-xs
                      leading-5
                      text-slate-400/85
                    "
                  >
                    Demo metadata only. In the BioLayers workspace, this
                    panel can display the exact evidence sentence, PMID or
                    DOI, experimental model and evidence classification.
                  </p>
                </div>

                {/* CTA */}

                <a
                  href="/explore"
                  className="
                    group
                    mt-5
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    border
                    border-teal-100/[0.10]
                    bg-teal-100/[0.045]
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-teal-50/80
                    transition
                    duration-300
                    hover:border-teal-200/20
                    hover:bg-teal-300/[0.06]
                    hover:text-white
                  "
                >
                  Open full workspace

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </a>
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </div>

        {/* ================================================= */}
        {/* BOTTOM STATEMENT                                 */}
        {/* ================================================= */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            mx-auto
            mt-8
            max-w-3xl
            text-center
            text-xs
            leading-6
            text-slate-500/80
          "
        >
          BioLayers is designed to expose the biological chain, the context
          behind it and the evidence supporting each important connection.
        </motion.p>
      </div>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function InfoCard({
  icon: Icon,
  title,
  text,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <div
      className="
        rounded-[18px]
        border
        border-teal-100/[0.065]
        bg-[#0a0f14]/44
        p-4
      "
    >
      <div
        className={`
          flex
          items-center
          gap-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          ${accent}
        `}
      >
        <Icon className="h-3.5 w-3.5" />

        {title}
      </div>

      <p
        className="
          mt-2
          text-xs
          leading-5
          text-slate-400/85
        "
      >
        {text}
      </p>
    </div>
  );
}

function InspectorBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        mt-5
        border-t
        border-teal-100/[0.065]
        pt-5
      "
    >
      <div
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-slate-500/80
        "
      >
        {label}
      </div>

      <p
        className="
          mt-2
          text-xs
          leading-5
          text-slate-400/90
        "
      >
        {value}
      </p>
    </div>
  );
}

function MetaCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-[15px]
        border
        border-teal-100/[0.065]
        bg-[#0a0f14]/44
        p-3
      "
    >
      <div
        className="
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-slate-500/75
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1.5
          truncate
          text-[11px]
          font-medium
          text-slate-300/75
        "
      >
        {value}
      </div>
    </div>
  );
}