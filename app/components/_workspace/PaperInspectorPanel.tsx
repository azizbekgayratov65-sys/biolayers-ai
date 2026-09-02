"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { EntityData } from "../../lib/buildGraphFromText";
import type { PubMedPaper } from "../../hooks/usePubMed";

type PaperInspectorPanelProps = {
  selectedPaper: PubMedPaper | null;
  setSelectedPaper: (paper: PubMedPaper | null) => void;
  selectedEntity: EntityData;
  paperCopyMessage: string;
  copyPaperIdentifier: (
    value: string,
    label: string,
  ) => Promise<void>;
};

export default function PaperInspectorPanel({
  selectedPaper,
  setSelectedPaper,
  selectedEntity,
  paperCopyMessage,
  copyPaperIdentifier,
}: PaperInspectorPanelProps) {
  return (
    <AnimatePresence>
      {selectedPaper && (
        <>
          <motion.button
            type="button"
            aria-label="Close paper inspector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPaper(null)}
            className="fixed inset-0 z-[110] bg-[#030507]/62 backdrop-blur-[5px]"
          />

          <motion.aside
            initial={{
              opacity: 0,
              x: 72,
              scale: 0.985,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              x: 72,
              scale: 0.985,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.36,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed bottom-0 right-0 top-0 z-[120] flex w-full flex-col overflow-hidden border-l border-teal-100/[0.08] bg-[#070b10]/98 shadow-[-34px_0_110px_rgba(1,8,15,.5)] backdrop-blur-3xl sm:w-[580px]"
          >
            {/* Header */}
            <div className="relative overflow-hidden border-b border-teal-100/[0.065] px-5 py-5 sm:px-6">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-300/[0.045] blur-3xl" />
              <div className="pointer-events-none absolute -left-20 bottom-[-100px] h-52 w-52 rounded-full bg-sky-300/[0.025] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/[0.17] to-transparent" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_9px_rgba(77,141,255,.8)]"
                      animate={{
                        opacity: [0.55, 1, 0.55],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                      Paper inspector
                    </p>
                  </div>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    PMID {selectedPaper.pmid}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPaper(null)}
                  className="rounded-[11px] border border-teal-100/[0.07] bg-white/[0.018] px-3 py-2 text-[10px] font-semibold text-slate-400 transition duration-300 hover:bg-white/[0.04] hover:text-slate-100"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Paper hero */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[22px] border border-teal-100/[0.07] bg-[linear-gradient(150deg,rgba(14,45,55,.62),rgba(9,29,40,.62),rgba(6,20,30,.7))] p-5 shadow-[0_20px_58px_rgba(1,8,15,.2)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-teal-300/[0.035] blur-3xl" />

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-teal-200/[0.11] bg-teal-200/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-teal-200">
                      {selectedPaper.journal}
                    </span>

                    <span className="rounded-full border border-white/[0.05] bg-black/[0.1] px-2.5 py-1 text-[9px] font-semibold text-slate-400">
                      {selectedPaper.year}
                    </span>
                  </div>

                  <h2 className="mt-4 text-[25px] font-semibold leading-[1.24] tracking-[-0.038em] text-[#eef4ff] sm:text-[29px]">
                    {selectedPaper.title}
                  </h2>

                  {selectedPaper.authors.length > 0 && (
                    <p className="mt-4 text-[12px] leading-6 text-slate-400">
                      {selectedPaper.authors.join(", ")}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <PaperMetric
                  label="PMID"
                  value={selectedPaper.pmid}
                />

                <PaperMetric
                  label="Publication year"
                  value={selectedPaper.year}
                />
              </div>

              {/* Why this matters */}
              <PaperSection
                eyebrow="Relevance to current graph"
                tone="teal"
              >
                <p className="text-[13px] leading-6 text-slate-300">
                  This paper was retrieved by PubMed for{" "}
                  <span className="font-semibold text-slate-100">
                    {selectedEntity.label}
                  </span>
                  . Its title and metadata provide literature context
                  for the selected entity, but they do not by themselves
                  establish that every graph relationship is experimentally
                  proven.
                </p>
              </PaperSection>

              {/* Context */}
              <PaperSection
                eyebrow="Context in BioLayers"
                tone="sky"
              >
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <ContextCard
                    label="Selected entity"
                    value={selectedEntity.label}
                    meta={selectedEntity.type}
                    tone="teal"
                  />

                  <ContextCard
                    label="Evidence source"
                    value="PubMed"
                    meta="Live literature metadata"
                    tone="sky"
                  />
                </div>
              </PaperSection>

              {/* Evidence status */}
              <PaperSection
                eyebrow="Evidence status"
                tone="violet"
              >
                <div className="rounded-[14px] border border-violet-200/[0.08] bg-violet-200/[0.025] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,.55)]" />
                    <p className="text-[11px] font-semibold text-violet-100">
                      Literature candidate
                    </p>
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    This record provides literature context. Mechanistic
                    support still requires review of the abstract, results
                    and/or full text.
                  </p>
                </div>
              </PaperSection>

              {/* Evidence limits */}
              <PaperSection
                eyebrow="Evidence limits"
                tone="amber"
              >
                <div className="space-y-2">
                  {[
                    "The current PubMed route supplies title, journal, year, authors, PMID and DOI metadata.",
                    "Abstract, methods, results and full-text claims are not yet loaded into BioLayers.",
                    "The paper should be opened and reviewed before using it to support a mechanistic conclusion.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-[13px] border border-amber-200/[0.07] bg-amber-200/[0.02] p-3"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                      <p className="text-[10px] leading-5 text-slate-500">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </PaperSection>

              {/* Identifiers */}
              <PaperSection
                eyebrow="Article identifiers"
                tone="slate"
              >
                <div className="space-y-2">
                  <IdentifierButton
                    label="PMID"
                    value={selectedPaper.pmid}
                    onCopy={() =>
                      void copyPaperIdentifier(
                        selectedPaper.pmid,
                        "PMID",
                      )
                    }
                    accent="teal"
                  />

                  {selectedPaper.doi && (
                    <IdentifierButton
                      label="DOI"
                      value={selectedPaper.doi}
                      onCopy={() =>
                        void copyPaperIdentifier(
                          selectedPaper.doi || "",
                          "DOI",
                        )
                      }
                      accent="violet"
                    />
                  )}
                </div>

                {paperCopyMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-[10px] font-semibold text-emerald-300"
                  >
                    {paperCopyMessage}
                  </motion.p>
                )}
              </PaperSection>
            </div>

            {/* Footer actions */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-teal-100/[0.065] bg-[#070b10]/95 p-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedPaper(null)}
                className="rounded-[13px] border border-teal-100/[0.07] bg-white/[0.018] px-4 py-3 text-[11px] font-semibold text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04]"
              >
                Back
              </button>

              <a
                href={selectedPaper.pubmedUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-[13px] border border-teal-200/[0.16] bg-[linear-gradient(135deg,#8db2ff,#a15cff)] px-4 py-3 text-center text-[11px] font-extrabold text-[#04070a] shadow-[0_10px_26px_rgba(77,141,255,.11)] transition duration-300 hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
                <span className="relative">
                  Open PubMed ↗
                </span>
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PaperMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-teal-100/[0.055] bg-black/[0.09] p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </p>

      <p className="mt-1.5 truncate text-[14px] font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function PaperSection({
  eyebrow,
  tone,
  children,
}: {
  eyebrow: string;
  tone: "teal" | "sky" | "violet" | "amber" | "slate";
  children: React.ReactNode;
}) {
  const toneClass = {
    teal: "text-teal-300",
    sky: "text-sky-300",
    violet: "text-violet-300",
    amber: "text-amber-300",
    slate: "text-slate-400",
  }[tone];

  return (
    <section className="mt-4 rounded-[16px] border border-teal-100/[0.055] bg-[#0a0f14]/44 p-4">
      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${toneClass}`}>
        {eyebrow}
      </p>

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}

function ContextCard({
  label,
  value,
  meta,
  tone,
}: {
  label: string;
  value: string;
  meta: string;
  tone: "teal" | "sky";
}) {
  const toneClass =
    tone === "teal"
      ? "text-teal-300"
      : "text-sky-300";

  return (
    <div className="rounded-[13px] border border-teal-100/[0.045] bg-black/[0.09] p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-[12px] font-semibold text-slate-100">
        {value}
      </p>

      <p className={`mt-1 text-[10px] capitalize ${toneClass}`}>
        {meta}
      </p>
    </div>
  );
}

function IdentifierButton({
  label,
  value,
  onCopy,
  accent,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  accent: "teal" | "violet";
}) {
  const accentClass =
    accent === "teal"
      ? "group-hover:border-teal-200/[0.13] group-hover:bg-teal-200/[0.025]"
      : "group-hover:border-violet-200/[0.13] group-hover:bg-violet-200/[0.025]";

  const copyClass =
    accent === "teal"
      ? "text-teal-300/80"
      : "text-violet-300/80";

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`group flex w-full items-center justify-between gap-4 rounded-[13px] border border-teal-100/[0.05] bg-black/[0.09] px-3.5 py-3 text-left transition duration-300 ${accentClass}`}
    >
      <span className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
          {label}
        </span>

        <span className="mt-1 block truncate font-mono text-[11px] text-slate-300">
          {value}
        </span>
      </span>

      <span className={`shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] ${copyClass}`}>
        Copy
      </span>
    </button>
  );
}