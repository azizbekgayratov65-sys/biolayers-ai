"use client";

import {
  FileText,
} from "lucide-react";

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

export default function MindMapSection({
  index,
  section,
  ideas,
  extractedText,
}: MindMapSectionProps) {
  const accent = sectionColor(
    section.name,
  );

  return (
    <section
      id={`mm-section-${index}`}
      className="scroll-mt-24"
    >
      <header
        className="
          flex
          items-start
          gap-4
          border-t
          border-white/[0.06]
          pt-8
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            font-mono
            text-[12px]
            font-bold
          "
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
            backgroundColor:
              sectionSoftColor(
                section.name,
              ),
          }}
        >
          {String(index + 1).padStart(
            2,
            "0",
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-white">
            {section.name}
          </h2>

          {section.summary && (
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
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
            border-white/[0.08]
            px-2.5
            py-1
            font-mono
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-500
          "
        >
          <FileText className="h-3 w-3" />
          {ideas.length}{" "}
          {ideas.length === 1
            ? "idea"
            : "ideas"}
        </span>
      </header>

      <ol className="mt-5">
        {ideas.map((idea, ideaIndex) => (
          <MindMapIdea
            key={idea.id}
            idea={idea}
            index={ideaIndex}
            sectionName={
              section.name
            }
            extractedText={
              extractedText
            }
          />
        ))}
      </ol>
    </section>
  );
}