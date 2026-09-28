"use client";

import { FileText } from "lucide-react";

import type {
  MindMapNode,
  MindMapSection,
} from "../../lib/mindmapTypes";

import {
  sectionColor,
  sectionSoftColor,
} from "./mindMapTheme";

import MindMapIdea from "./MindMapIdea";

type MindMapSectionProps = {
  index: number;
  section: MindMapSection;
  ideas: MindMapNode[];
  extractedText: string;
};

export default function MindMapSectionComponent({
  index,
  section,
  ideas,
  extractedText,
}: MindMapSectionProps) {
  const accent = sectionColor(section.name);

  return (
    <section
      id={`mm-section-${index}`}
      className="scroll-mt-28"
      aria-labelledby={`mm-heading-${index}`}
    >
      <header className="flex items-start gap-4 border-t border-white/[0.08] pt-8">
        {/* Concentric section number marker */}
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[14px]
            border
            font-mono
            text-[12px]
            font-bold
            tabular-nums
            shadow-[0_4px_16px_rgba(0,0,0,0.3)]
          "
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
            backgroundColor: sectionSoftColor(section.name),
          }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={`mm-heading-${index}`}
            className="text-lg font-bold tracking-[-0.01em] text-white sm:text-xl"
          >
            {section.name}
          </h2>

          {section.summary && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300/85">
              {section.summary}
            </p>
          )}
        </div>

        <span
          className="
            mt-1
            inline-flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            border-white/[0.09]
            bg-white/[0.03]
            px-3
            py-1
            font-mono
            text-[9.5px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-400
          "
        >
          <FileText className="h-3 w-3 text-teal-300/70" aria-hidden="true" />
          {ideas.length} {ideas.length === 1 ? "concept" : "concepts"}
        </span>
      </header>

      <ol className="mt-6" aria-label={`Ideas in ${section.name}`}>
        {ideas.map((idea, ideaIndex) => (
          <MindMapIdea
            key={idea.id}
            idea={idea}
            index={ideaIndex}
            sectionName={section.name}
            extractedText={extractedText}
          />
        ))}
      </ol>
    </section>
  );
}