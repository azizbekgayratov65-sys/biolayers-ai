"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  FileUp,
  Loader2,
  Sparkles,
  BookMarked,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react";

const ACCEPTED = ".pdf,.txt,.md,.markdown,.text,.docx";

export type SamplePaper = {
  id: string;
  tag: string;
  title: string;
  journal: string;
  fileName: string;
  description: string;
  text: string;
};

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    id: "kras-pdac",
    tag: "KRAS G12D",
    title: "KRAS G12D Oncogenic Signalling & Stroma Remodeling in PDAC",
    journal: "Nature Cancer 2024",
    fileName: "nature-cancer-kras-g12d-pdac.txt",
    description: "Mechanistic evaluation of MRTX1133 small-molecule inhibition in pancreatic ductal adenocarcinoma xenografts.",
    text: `KRAS G12D Oncogenic Signalling & Stroma Remodeling in Pancreatic Ductal Adenocarcinoma

Abstract & Introduction:
Pancreatic ductal adenocarcinoma (PDAC) is driven by activating mutations in the KRAS oncogene in over 90% of cases, with the G12D substitution being the most prevalent variant. KRAS(G12D) cycles constitutively in the GTP-bound active conformation, triggering hyperactivation of downstream effectors including the RAF-MEK-ERK mitogen-activated protein kinase (MAPK) cascade and the PI3K-AKT-mTOR pathway.

Mechanistic Findings:
1. Target Engagement: Recent development of MRTX1133, a high-affinity non-covalent small molecule inhibitor, enables direct targeting of KRAS(G12D) in its active switch-II pocket.
2. Downstream Signaling Cascade: In preclinical patient-derived xenograft models, MRTX1133 administration leads to dramatic tumor regression, marked suppression of phosphorylated ERK1/2 (p-ERK), and significant downregulation of MYC transcriptional targets within 4 hours of treatment.
3. Desmoplastic Stroma Remodeling: Concomitantly, inhibition of KRAS(G12D) remodels the dense desmoplastic tumor stroma, reducing alpha-smooth muscle actin (alpha-SMA) positive cancer-associated fibroblasts and facilitating cytotoxic CD8+ T-cell infiltration into the tumor core.
4. Acquired Resistance Mechanisms: Resistance mechanisms emerge primarily through secondary KRAS mutations (such as Y96D) or receptor tyrosine kinase amplification including MET and EGFR, underscoring the necessity of combination therapeutic strategies.`,
  },
  {
    id: "egfr-t790m",
    tag: "EGFR T790M",
    title: "EGFR T790M Resistance Mutations & Third-Generation TKIs in NSCLC",
    journal: "Cancer Discovery 2024",
    fileName: "cancer-discovery-egfr-t790m-nsclc.txt",
    description: "Structural basis of osimertinib selectivity, gatekeeper mutations, and tertiary C797S resistance mechanisms.",
    text: `EGFR T790M Resistance Mutations and Third-Generation TKIs in Non-Small Cell Lung Cancer

Introduction & Clinical Context:
In non-small cell lung cancer (NSCLC) harboring activating epidermal growth factor receptor (EGFR) mutations (exon 19 deletions or L858R), first- and second-generation tyrosine kinase inhibitors (TKIs) provide substantial initial clinical benefit. However, disease progression invariably occurs within 9 to 14 months, predominantly driven by the emergence of the secondary gatekeeper mutation T790M in exon 20 in approximately 50-60% of patients.

Key Discoveries:
1. Gatekeeper Mechanism: The T790M mutation increases the ATP affinity of the kinase domain, sterically hindering the binding of reversible inhibitors like gefitinib and erlotinib.
2. Third-Generation Selectivity: Osimertinib (AZD9291), an irreversible, mutant-selective third-generation EGFR TKI, was engineered to overcome T790M-mediated resistance while sparing wild-type EGFR, thereby minimizing dermatologic and gastrointestinal toxicities.
3. Clinical Outcomes: In clinical trials, osimertinib demonstrated superior progression-free survival compared to platinum-pemetrexed chemotherapy in T790M-positive cohorts.
4. Tertiary Resistance: Tertiary resistance to third-generation inhibitors frequently involves the C797S mutation in exon 20, which disrupts the covalent bond formation between the inhibitor and the cysteine 797 residue, or alternative bypass activation of the MET and HER2 pathways.`,
  },
  {
    id: "pd1-tnbc",
    tag: "PD-L1 / TNBC",
    title: "Immune Checkpoint Blockade & PD-L1 Expression in Triple-Negative Breast Cancer",
    journal: "Lancet Oncology 2024",
    fileName: "lancet-pd1-pembrolizumab-tnbc.txt",
    description: "Predictive significance of Combined Positive Score (CPS >= 10) and cytotoxic T lymphocyte activation.",
    text: `Immune Checkpoint Blockade and PD-L1 Expression in Triple-Negative Breast Cancer

Background & Rationale:
Triple-negative breast cancer (TNBC) represents an aggressive subtype characterized by the lack of estrogen receptor (ER), progesterone receptor (PR), and HER2 amplification, leaving conventional cytotoxic chemotherapy as the primary systemic standard of care. Due to higher tumor mutational burden and prominent lymphocytic infiltrate relative to other breast malignancies, TNBC exhibits pronounced immunogenicity.

Findings & Immune Mechanisms:
1. Biomarker Validation: Programmed death-ligand 1 (PD-L1) expression on tumor-infiltrating immune cells serves as a predictive biomarker for response to immune checkpoint blockade.
2. Clinical Trial Evidence: The KEYNOTE-355 phase 3 trial established that adding the anti-PD-1 monoclonal antibody pembrolizumab to chemotherapy significantly prolongs progression-free survival and overall survival among patients with metastatic TNBC whose tumors express PD-L1 with a combined positive score (CPS) of 10 or greater.
3. Signaling Disruption: Mechanistically, PD-1/PD-L1 engagement delivers an inhibitory signal to cytotoxic T lymphocytes via recruitment of SHP-2 phosphatase, impairing TCR signaling and cytokine secretion.
4. Antitumor Immunity Restoration: Checkpoint inhibition restores antitumor T-cell cytotoxicity, promotes clonal expansion of tumor-reactive CD8+ T cells, and triggers systemic immune activation, although immune-related adverse events require careful clinical vigilance.`,
  },
];

type MindMapUploaderProps = {
  busy: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
};

export default function MindMapUploader({
  busy,
  error,
  onFileSelected,
}: MindMapUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (busy) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        inputRef.current?.click();
      }
    },
    [busy],
  );

  const handleSampleSelected = useCallback(
    (sample: SamplePaper) => {
      if (busy) return;
      const file = new File([sample.text], sample.fileName, {
        type: "text/plain",
      });
      onFileSelected(file);
    },
    [busy, onFileSelected],
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          STAGE 1: Accessible Drag-and-Drop Zone
          Concentric nested radii:
          Outer container: rounded-[28px], padding p-1.5 (6px) -> Inner button: rounded-[22px]
          ========================================================================= */}
      <div
        className={`
          relative
          mx-auto
          w-full
          max-w-2xl
          rounded-[28px]
          border
          bg-[#0a0f14]/80
          p-1.5
          backdrop-blur-xl
          transition-[border-color,background-color]
          duration-200
          ${
            dragging
              ? "border-emerald-300/60 shadow-[0_0_30px_rgba(43,255,136,0.18)]"
              : "border-teal-100/[0.09]"
          }
        `}
      >
        {/* Dark-field fluorescence ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 left-1/2 h-44 w-80 -translate-x-1/2 rounded-full bg-emerald-400/[0.07] blur-[90px]"
        />

        <div
          role="button"
          tabIndex={busy ? -1 : 0}
          aria-disabled={busy}
          aria-label="Upload research paper: click or drag file here"
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            group
            relative
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-4
            rounded-[22px]
            border-2
            border-dashed
            px-6
            py-12
            text-center
            transition-[border-color,background-color]
            duration-200
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#2bff88]
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#04070a]
            ${
              dragging
                ? "border-emerald-400 bg-emerald-400/[0.08]"
                : "border-white/[0.12] hover:border-emerald-300/40 hover:bg-emerald-300/[0.03]"
            }
            ${busy ? "cursor-wait opacity-70" : "cursor-pointer"}
          `}
        >
          {/* Accessible file input */}
          <input
            ref={inputRef}
            id="mindmap-file-input"
            type="file"
            accept={ACCEPTED}
            aria-label="Select research paper file (PDF, TXT, MD, DOCX)"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {/* Icon container: concentric inner radius */}
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-[14px]
              border
              border-emerald-300/30
              bg-emerald-300/[0.08]
              transition-transform
              duration-200
              group-hover:scale-105
              group-hover:border-emerald-300/50
            "
          >
            {busy ? (
              <Loader2 className="h-7 w-7 animate-spin text-emerald-300" aria-hidden="true" />
            ) : (
              <FileUp className="h-7 w-7 text-emerald-300" aria-hidden="true" />
            )}
          </div>

          <div className="max-w-md">
            <p className="text-base font-bold tracking-[-0.01em] text-white sm:text-lg">
              {busy
                ? "Reading and mapping your paper…"
                : "Drop your research paper here"}
            </p>

            <p className="mt-1.5 text-xs text-slate-300/85">
              or click to browse — PDF, TXT, Markdown, or DOCX
            </p>

            {/* Clear Format and Size Guidance */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Info className="h-3.5 w-3.5 text-teal-300/80 shrink-0" aria-hidden="true" />
              <span>
                DOCX &le; 4 MB · PDF/Text &le; 500,000 characters
              </span>
            </div>

            <p className="mt-1 text-[10.5px] text-slate-500">
              PDF, TXT, and Markdown are parsed locally in-browser to bypass server payload limits.
            </p>
          </div>

          {/* Format pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {["PDF (Browser OCR)", "TXT", "MARKDOWN", "DOCX (&le; 4MB)"].map((format) => (
              <span
                key={format}
                className="
                  rounded-full
                  border
                  border-teal-100/[0.12]
                  bg-white/[0.03]
                  px-2.5
                  py-1
                  font-mono
                  text-[9px]
                  font-bold
                  tracking-wider
                  text-teal-100/75
                "
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="mt-3 rounded-[14px] border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-center text-xs font-semibold text-rose-200"
          >
            {error}
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-2 pb-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <Sparkles className="h-3 w-3 text-emerald-300/70" aria-hidden="true" />
          Evidence-grounded mind map · zero information loss
        </div>
      </div>

      {/* =========================================================================
          PRELOADED SAMPLE PAPERS CAROUSEL
          Touch targets >= 44px on all interactive buttons
          ========================================================================= */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300/90">
            <BookMarked className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
            Preloaded Sample Oncology Papers
          </span>
          <span className="text-[10px] text-slate-500">
            Instant 1-click test
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {SAMPLE_PAPERS.map((paper) => (
            <button
              key={paper.id}
              type="button"
              disabled={busy}
              onClick={() => handleSampleSelected(paper)}
              aria-label={`Load sample paper: ${paper.title}`}
              className="
                group
                flex
                min-h-[110px]
                flex-col
                justify-between
                rounded-[16px]
                border
                border-white/[0.08]
                bg-[#0a0f14]/70
                p-3.5
                text-left
                backdrop-blur-sm
                transition-[border-color,background-color,transform]
                duration-150
                hover:-translate-y-0.5
                hover:border-emerald-300/40
                hover:bg-[#0d151d]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#2bff88]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#04070a]
                disabled:cursor-wait
                disabled:opacity-60
              "
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[8.5px] font-bold text-emerald-300">
                    {paper.tag}
                  </span>
                  <span className="font-mono text-[8.5px] text-slate-500">
                    {paper.journal}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-100 group-hover:text-emerald-100">
                  {paper.title}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2 text-[10px] font-semibold text-emerald-300 group-hover:text-emerald-200">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  Load Paper
                </span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}