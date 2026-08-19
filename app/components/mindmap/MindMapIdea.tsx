"use client";

import {
  useMemo,
} from "react";

import {
  CheckCircle2,
  Quote,
} from "lucide-react";

import {
  findQuoteInText,
} from "../../lib/findQuoteInText";

import type {
  MindMapNode,
} from "../../lib/mindmapTypes";

import {
  sectionColor,
} from "./mindMapTheme";

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
    <span className="flex shrink-0 items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map(
        (dot) => (
          <span
            key={dot}
            className="h-[5px] w-[5px] rounded-full"
            style={{
              backgroundColor:
                dot <= weight
                  ? accent
                  : "rgba(148,163,184,0.25)",
            }}
          />
        ),
      )}
    </span>
  );
}

export default function MindMapIdea({
  idea,
  index,
  sectionName,
  extractedText,
}: MindMapIdeaProps) {
  const accent = sectionColor(
    sectionName,
  );

  const match = useMemo(
    () =>
      idea.quote
        ? findQuoteInText(
            idea.quote,
            extractedText,
          )
        : null,
    [idea.quote, extractedText],
  );

  return (
    <li className="group relative flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className="
            mt-[7px]
            h-2
            w-2
            shrink-0
            rounded-full
            border
            transition
            group-hover:bg-white/20
          "
          style={{
            borderColor: accent,
          }}
        />
        <span
          className="
            mt-1
            w-px
            flex-1
            bg-white/[0.06]
          "
        />
      </div>

      <div className="min-w-0 flex-1 pb-8">
        <div className="flex items-start gap-3">
          <span
            className="
              mt-[3px]
              shrink-0
              font-mono
              text-[10px]
              font-bold
              tabular-nums
              text-slate-500
            "
          >
            {String(index + 1).padStart(
              2,
              "0",
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[14px] font-bold leading-snug tracking-[-0.01em] text-white">
                {idea.label}
              </p>

              {idea.weight &&
                idea.weight > 0 && (
                  <WeightDots
                    weight={idea.weight}
                    accent={accent}
                  />
                )}
            </div>

            {idea.description && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
                {idea.description}
              </p>
            )}
          </div>
        </div>

        <div
          className="
            mt-3
            ml-7
            overflow-hidden
            rounded-xl
            border
            border-white/[0.06]
            bg-black/25
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              border-b
              border-white/[0.05]
              px-4
              py-2
            "
          >
            <Quote
              className="h-3 w-3 shrink-0"
              style={{ color: accent }}
            />
            <span
              className="
                font-mono
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-500
              "
            >
              Exact source
            </span>

            {match?.found && (
              <span
                className="
                  ml-auto
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  font-mono
                  text-[9px]
                  font-bold
                  text-emerald-300/80
                "
              >
                <CheckCircle2 className="h-3 w-3" />
                verbatim
              </span>
            )}
          </div>

          <div className="px-4 py-3">
            {match?.found ? (
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-300">
                {match.contextBefore}
                <mark
                  className="
                    rounded-[3px]
                    px-0.5
                    text-white
                  "
                  style={{
                    backgroundColor:
                      "rgba(94,234,212,0.20)",
                    boxShadow:
                      "0 0 0 1px rgba(94,234,212,0.30)",
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
              <p className="text-[11.5px] italic leading-relaxed text-slate-400">
                &ldquo;{idea.quote}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}