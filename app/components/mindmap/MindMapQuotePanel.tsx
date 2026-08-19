"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Check,
  Copy,
  FileText,
  X,
} from "lucide-react";

import { findQuoteInText } from "../../lib/findQuoteInText";
import {
  levelColor,
  sectionColor,
  type MindMapFlowNode,
} from "./mindMapFlow";

type MindMapQuotePanelProps = {
  node: MindMapFlowNode;
  extractedText: string;
  onClose: () => void;
};

export default function MindMapQuotePanel({
  node,
  extractedText,
  onClose,
}: MindMapQuotePanelProps) {
  const [copied, setCopied] =
    useState(false);

  const match = useMemo(
    () =>
      node.data.quote
        ? findQuoteInText(
            node.data.quote,
            extractedText,
          )
        : null,
    [node.data.quote, extractedText],
  );

  const accent = sectionColor(
    node.data.section,
  );

  const levelBadgeColor = levelColor(
    node.data.level,
  );

  async function copyQuote() {
    try {
      await navigator.clipboard.writeText(
        node.data.quote,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      // Clipboard unavailable.
    }
  }

  return (
    <div
      className="
        flex
        h-full
        w-full
        flex-col
        border-l
        border-teal-100/[0.07]
        bg-[#081722]
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
          border-b
          border-teal-100/[0.07]
          px-5
          py-4
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="
                rounded-full
                border
                px-2
                py-0.5
                font-mono
                text-[8px]
                font-bold
                uppercase
                tracking-[0.15em]
              "
              style={{
                color: levelBadgeColor,
                borderColor: `color-mix(in srgb, ${levelBadgeColor} 30%, transparent)`,
              }}
            >
              Level {node.data.level}
            </span>

            {node.data.section && (
              <span
                className="
                  max-w-[130px]
                  truncate
                  rounded-full
                  border
                  px-2
                  py-0.5
                  font-mono
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                "
                style={{
                  color: accent,
                  borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
                }}
              >
                {node.data.section}
              </span>
            )}
          </div>

          <h3
            className="
              mt-2
              text-base
              font-bold
              leading-snug
              tracking-[-0.01em]
              text-white
            "
          >
            {node.data.label}
          </h3>
        </div>

        <button
          type="button"
          aria-label="Close node details"
          onClick={onClose}
          className="
            shrink-0
            rounded-lg
            border
            border-white/[0.08]
            bg-white/[0.03]
            p-2
            text-slate-400
            transition
            hover:border-white/[0.16]
            hover:text-white
          "
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {node.data.description && (
          <section>
            <SectionLabel>
              Summary
            </SectionLabel>
            <p className="text-sm leading-relaxed text-slate-300">
              {node.data.description}
            </p>
          </section>
        )}

        {!node.data.quote ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-8 text-center">
            <FileText className="h-6 w-6 text-slate-600" />
            <p className="text-xs leading-relaxed text-slate-500">
              {node.data.kind === "section"
                ? "This is a section overview. Click an idea node inside it to see the exact source excerpt from the paper."
                : "This node has no source quote attached."}
            </p>
          </div>
        ) : (
        <>
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <SectionLabel>
              Source excerpt
            </SectionLabel>

            <button
              type="button"
              onClick={copyQuote}
              className="
                flex
                shrink-0
                items-center
                gap-1.5
                rounded-md
                border
                border-teal-200/15
                bg-teal-300/[0.06]
                px-2
                py-1
                text-[10px]
                font-semibold
                text-teal-100/80
                transition
                hover:border-teal-200/30
                hover:text-teal-50
              "
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied
                ? "Copied"
                : "Copy quote"}
            </button>
          </div>

          <div
            className="
              max-h-72
              overflow-y-auto
              rounded-xl
              border
              border-white/[0.07]
              bg-black/25
              p-4
            "
          >
            {match?.found ? (
              <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-300">
                {match.contextBefore}
                <mark
                  className="
                    rounded-[4px]
                    px-0.5
                    text-white
                  "
                  style={{
                    backgroundColor:
                      "rgba(94,234,212,0.22)",
                    boxShadow:
                      "0 0 0 1.5px rgba(94,234,212,0.35)",
                  }}
                >
                  {extractedText.slice(
                    match.start,
                    match.end,
                  )}
                </mark>
                {match.contextAfter}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <FileText className="h-6 w-6 text-slate-600" />
                <p className="text-xs leading-relaxed text-slate-500">
                  The exact source text could
                  not be located automatically.
                </p>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  match?.found
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }
              `}
            />

            <p className="text-[10px] font-medium text-slate-500">
              {match?.found
                ? "Matched verbatim against the uploaded paper"
                : "Approximate match — verbatim text unavailable"}
            </p>
          </div>
        </section>

        <section>
          <SectionLabel>
            Node quote
          </SectionLabel>
          <blockquote
            className="
              border-l-2
              pl-3
              text-[12px]
              italic
              leading-relaxed
              text-slate-400
            "
            style={{
              borderColor: accent,
            }}
          >
            &ldquo;{node.data.quote}&rdquo;
          </blockquote>
        </section>
        </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </p>
  );
}