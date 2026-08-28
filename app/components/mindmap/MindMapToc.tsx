"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

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
  const [active, setActive] =
    useState(0);

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          for (
            const entry of entries
          ) {
            if (
              entry.isIntersecting
            ) {
              const index =
                Number(
                  (
                    entry
                      .target as HTMLElement
                  ).dataset.index ??
                    0,
                );

              setActive(index);
            }
          }
        },
        {
          rootMargin:
            "-30% 0px -60% 0px",
        },
      );

    sections.forEach(
      (_, index) => {
        const element =
          document.getElementById(
            `mm-section-${index}`,
          );

        if (element) {
          observer.observe(
            element,
          );
        }
      },
    );

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  function jumpTo(index: number) {
    document
      .getElementById(
        `mm-section-${index}`,
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <nav
      className="
        sticky
        top-24
        hidden
        max-h-[calc(100vh-8rem)]
        w-[220px]
        shrink-0
        overflow-y-auto
        pr-3
        xl:block
      "
      aria-label="Paper contents"
    >
      <p
        className="
          mb-3
          px-2.5
          font-mono
          text-[9px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-slate-500
        "
      >
        Contents
      </p>

      <ol className="space-y-1">
        {sections.map(
          (section, index) => {
            const isActive =
              active === index;

            return (
              <li key={section.name}>
                <button
                  type="button"
                  onClick={() =>
                    jumpTo(index)
                  }
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-lg
                    border-l-2
                    px-2.5
                    py-1.5
                    text-left
                    text-[11.5px]
                    leading-snug
                    transition

                    ${
                      isActive
                        ? "border-teal-300/60 bg-teal-300/[0.07] font-bold text-white"
                        : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                    }
                  `}
                >
                  <span
                    className="
                      shrink-0
                      font-mono
                      text-[9px]
                      font-bold
                      tabular-nums
                      text-slate-500
                    "
                  >
                    {String(
                      index + 1,
                    ).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 truncate">
                    {section.name}
                  </span>
                </button>
              </li>
            );
          },
        )}
      </ol>

        {authorUsername && (
          <div
            className="
              mt-6 pt-4
              border-t border-white/[0.06]
              flex flex-col gap-2
            "
          >
            <p className="px-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Author
            </p>
            <Link
              href={`/library/${authorUsername}`}
              className="
                flex items-center gap-2
                px-2.5 py-2
                rounded-lg
                border border-teal-200/20
                bg-teal-300/[0.07]
                text-teal-300/90
                font-semibold text-sm
                transition
                hover:border-teal-200/40
                hover:bg-teal-300/[0.12]
                hover:text-teal-200
              "
            >
              <User className="h-4 w-4" />
              <span className="truncate">@{authorUsername}</span>
            </Link>
            <p className="px-2.5 text-[10px] text-slate-500/70">
              View all papers
            </p>
          </div>
        )}
      </nav>
  );
}