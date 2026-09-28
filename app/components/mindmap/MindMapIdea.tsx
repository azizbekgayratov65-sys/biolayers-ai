"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Quote,
  FileCheck,
} from "lucide-react";

import { findQuoteInText } from "../../lib/findQuoteInText";
import type { MindMapNode } from "../../lib/mindmapTypes";
import { sectionColor } from "./mindMapTheme";

type MindMapIdeaProps = {
  idea: MindMapNode;
  index: number;
  sectionName: string;
  extractedText: string;
};

function WeightDots({
  weight,
  accent,
}: {
  weight: number;
  accent: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-[3px]"
      title={`Mechanism significance: ${weight} of 5`}
      aria-label={`Mechanism significance: ${weight} of 5`}
    >
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className="h-[5px] w-[5px] rounded-full transition-colors"
          style={{
            backgroundColor:
              dot <= weight
                ? accent
                : "rgba(148,163,184,0.22)",
          }}
        />
      ))}
    </span>
  );
}

export default function MindMapIdea({
  idea,
  index,
  sectionName,
  extractedText,
}: MindMapIdeaProps) {
  const accent = sectionColor(sectionName);

  // 2-tier citation grounding:
  // Tier 1: Search in-browser extracted text when available
  // Tier 2: Graceful fallback when extractedText is empty (saved DB papers) or quote is not found
  const match = useMemo(() => {
    if (!idea.quote || !extractedText || extractedText.trim() === "") {
      return null;
    }
    return findQuoteInText(idea.quote, extractedText);
  }, [idea.quote, extractedText]);

  const isSavedPaperWithoutSourceText = !extractedText || extractedText.trim() === "";

  return (
    <li className="group relative flex gap-4">
      {/* Vertical spine timeline */}
      <div className="flex flex-col items-center">
        <span
          className="
            mt-[7px]
            h-2.5
            w-2.5
            shrink-0
            rounded-full
            border-2
            transition-transform
            duration-150
            group-hover:scale-125
          "
          style={{
            borderColor: accent,
            backgroundColor: `${accent}22`,
          }}
          aria-hidden="true"
        />
        <span
          className="mt-1 w-px flex-1 bg-white/[0.08]"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1 pb-8">
        <div className="flex items-start gap-3">
          <span
            className="
              mt-[2px]
              shrink-0
              font-mono
              text-[10.5px]
              font-bold
              tabular-nums
              text-slate-400
            "
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-[14.5px] font-bold leading-snug tracking-[-0.01em] text-white">
                {idea.label}
              </h3>

              {idea.weight && idea.weight > 0 && (
                <WeightDots weight={idea.weight} accent={accent} />
              )}
            </div>

            {idea.description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300/85">
                {idea.description}
              </p>
            )}
          </div>
        </div>

        {/* =========================================================================
            2-TIER VERBATIM MANUSCRIPT CITATION CONTAINER
            Concentric nested radii: Outer rounded-[14px], padding p-3 -> inner rounded-[4px]
            ========================================================================= */}
        {idea.quote && (
          <div
            className="
              mt-3.5
              ml-7
              overflow-hidden
              rounded-[14px]
              border
              border-white/[0.08]
              bg-[#060a0f]/80
              backdrop-blur-sm
              shadow-[0_4px_20px_rgba(0,0,0,0.3)]
            "
          >
            {/* Citation Header */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/[0.05]
                bg-white/[0.02]
                px-4
                py-2
              "
            >
              <div className="flex items-center gap-2">
                <Quote
                  className="h-3 w-3 shrink-0"
                  style={{ color: accent }}
                  aria-hidden="true"
                />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {match?.found
                    ? "Manuscript Evidence Anchor"
                    : isSavedPaperWithoutSourceText
                    ? "Manuscript Citation (Saved Paper)"
                    : "Manuscript Citation"}
                </span>
              </div>

              {match?.found ? (
                <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] font-bold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                  Verbatim Match
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] text-slate-400">
                  <FileCheck className="h-3 w-3 text-teal-300/70" aria-hidden="true" />
                  Source Grounded
                </span>
              )}
            </div>

            {/* Citation Content: Tier 1 highlighted or Tier 2 graceful fallback */}
            <div className="px-4 py-3">
              {match?.found ? (
                <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-300">
                  <span className="text-slate-400">{match.contextBefore}</span>
                  <mark
                    className="
                      rounded-[4px]
                      px-1
                      py-0.5
                      font-medium
                      text-white
                      shadow-[0_0_0_1px_rgba(77,141,255,0.40)]
                    "
                    style={{
                      backgroundColor: "rgba(77,141,255,0.22)",
                    }}
                  >
                    {extractedText.slice(match.start, match.end)}
                  </mark>
                  <span className="text-slate-400">{match.contextAfter}</span>
                </p>
              ) : (
                <blockquote className="border-l-2 border-emerald-400/30 pl-3 text-[12px] italic leading-relaxed text-slate-300/90">
                  &ldquo;{idea.quote}&rdquo;
                </blockquote>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}