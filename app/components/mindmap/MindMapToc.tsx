"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, ListOrdered } from "lucide-react";

import type {
  MindMapSection,
} from "../../lib/mindmapTypes";

type MindMapTocProps = {
  sections: MindMapSection[];
  authorUsername?: string | null;
};

export default function MindMapToc({
  sections,
  authorUsername,
}: MindMapTocProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0,
            );
            setActive(index);
          }
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
      },
    );

    sections.forEach((_, index) => {
      const element = document.getElementById(`mm-section-${index}`);
      if (element) {
        element.dataset.index = String(index);
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  function jumpTo(index: number) {
    const element = document.getElementById(`mm-section-${index}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActive(index);
    }
  }

  return (
    <nav
      className="
        sticky
        top-24
        hidden
        max-h-[calc(100vh-8rem)]
        w-[230px]
        shrink-0
        overflow-y-auto
        pr-3
        xl:block
      "
      aria-label="Table of Contents"
    >
      <div className="mb-3 flex items-center gap-1.5 px-2.5">
        <ListOrdered className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Table of Contents
        </p>
      </div>

      <ol className="space-y-1">
        {sections.map((section, index) => {
          const isActive = active === index;

          return (
            <li key={section.name}>
              <button
                type="button"
                onClick={() => jumpTo(index)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Jump to Section ${index + 1}: ${section.name}`}
                className={`
                  group
                  flex
                  min-h-[44px]
                  w-full
                  items-center
                  gap-2.5
                  rounded-[10px]
                  border-l-2
                  px-2.5
                  py-2
                  text-left
                  text-[12px]
                  leading-snug
                  transition-[background-color,border-color,color]
                  duration-150
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#8db2ff]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#04070a]
                  ${
                    isActive
                      ? "border-emerald-400 bg-emerald-400/[0.09] font-bold text-white shadow-[0_0_12px_rgba(43,255,136,0.12)]"
                      : "border-transparent text-slate-400 hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-200"
                  }
                `}
              >
                <span
                  className={`
                    shrink-0
                    font-mono
                    text-[9.5px]
                    font-bold
                    tabular-nums
                    ${isActive ? "text-emerald-300" : "text-slate-500 group-hover:text-slate-400"}
                  `}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 line-clamp-2">
                  {section.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {authorUsername && (
        <div className="mt-6 border-t border-white/[0.08] pt-4 flex flex-col gap-2">
          <p className="px-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Author Attribution
          </p>
          <Link
            href={`/library/${authorUsername}`}
            aria-label={`View author profile: @${authorUsername}`}
            className="
              inline-flex
              min-h-[44px]
              items-center
              gap-2
              rounded-[12px]
              border
              border-teal-200/25
              bg-teal-300/[0.07]
              px-3
              py-2
              text-xs
              font-bold
              text-teal-200
              transition-[border-color,background-color]
              duration-150
              hover:border-teal-200/45
              hover:bg-teal-300/[0.14]
              hover:text-white
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#8db2ff]
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[#04070a]
            "
          >
            <User className="h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
            <span className="truncate">@{authorUsername}</span>
          </Link>
          <p className="px-2.5 text-[10px] text-slate-500">
            View published papers
          </p>
        </div>
      )}
    </nav>
  );
}