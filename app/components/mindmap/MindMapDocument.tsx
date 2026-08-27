"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowUp,
  Bot,
  FileText,
  RefreshCcw,
  Workflow,
} from "lucide-react";

import type {
  MindMapNode,
  MindMapResponse,
} from "../../lib/mindmapTypes";

import MindMapToc from "./MindMapToc";
import MindMapSection from "./MindMapSection";

type MindMapDocumentProps = {
  response: MindMapResponse;
  onReset: () => void;
};

type IdeaGroup = {
  name: string;
  summary: string;
  ideas: MindMapNode[];
};

export default function MindMapDocument({
  response,
  onReset,
}: MindMapDocumentProps) {
  const {
    mindmap,
    extractedText,
    meta,
  } = response;

  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    let frame: number | null = null;

    const onScroll = () => {
      if (frame !== null) {
        return;
      }

      frame = window.requestAnimationFrame(
        () => {
          frame = null;

          const max =
            document.documentElement
              .scrollHeight -
            window.innerHeight;

          setProgress(
            max > 0
              ? Math.min(
                  window.scrollY / max,
                  1,
                )
              : 0,
          );
        },
      );
    };

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true },
    );

    onScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll,
      );

      if (frame !== null) {
        window.cancelAnimationFrame(
          frame,
        );
      }
    };
  }, []);

  const groups = useMemo<IdeaGroup[]>(
    () => {
      const result: IdeaGroup[] =
        [];
      const byName = new Map<
        string,
        IdeaGroup
      >();

      for (const section of mindmap.sections) {
        const group: IdeaGroup = {
          name: section.name,
          summary: section.summary,
          ideas: [],
        };

        result.push(group);
        byName.set(
          section.name,
          group,
        );
      }

      for (const node of mindmap.nodes) {
        if (node.kind !== "idea") {
          continue;
        }

        let group = byName.get(
          node.section ?? "",
        );

        if (!group) {
          group = {
            name:
              node.section ??
              "Key ideas",
            summary: "",
            ideas: [],
          };

          byName.set(
            group.name,
            group,
          );

          result.push(group);
        }

        group.ideas.push(node);
      }

      return result.filter(
        (group) =>
          group.ideas.length > 0,
      );
    },
    [mindmap],
  );

  const hops = useMemo(
    () =>
      (meta.attempts ?? []).filter(
        (attempt) =>
          attempt.outcome !==
            "ok" &&
          attempt.outcome !==
            "skipped",
      ),
    [meta.attempts],
  );

  const hopTrail = useMemo(
    () =>
      hops.length > 0
        ? [
            ...hops.map(
              (attempt) =>
                `${attempt.model} (key ${attempt.keyIndex + 1}) ${attempt.outcome}`,
            ),
            meta.model,
          ].join(" → ")
        : null,
    [hops, meta.model],
  );

  const totalIdeas =
    mindmap.nodes.filter(
      (node) =>
        node.kind === "idea",
    ).length;

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div
        className="
          fixed
          inset-x-0
          top-0
          z-40
          h-[2px]
          bg-white/[0.04]
        "
        aria-hidden
      >
        <div
          className="
            h-full
            bg-gradient-to-r
            from-teal-400
            via-cyan-300
            to-teal-400
            transition-[width]
            duration-100
          "
          style={{
            width: `${progress * 100}%`,
          }}
        />
      </div>

      <div
        className="
          mx-auto
          grid
          max-w-[1180px]
          gap-10
          px-5
          pb-24
          pt-8
          xl:grid-cols-[220px_minmax(0,1fr)]
        "
      >
        <MindMapToc
          sections={groups}
        />

        <main
          className="
            mx-auto
            w-full
            max-w-[820px]
          "
        >
          <header style={{ scrollMarginTop: '100px' }}>
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    font-mono
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-teal-300/70
                  "
                >
                  <Workflow className="h-3.5 w-3.5" />
                  Paper guide
                </p>

                <h1
                  className="
                    text-2xl
                    font-bold
                    leading-tight
                    tracking-[-0.02em]
                    text-white
                    sm:text-3xl
                  "
                >
                  {mindmap.title}
                </h1>
              </div>

              <button
                type="button"
                onClick={onReset}
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-teal-200/20
                  bg-teal-300/[0.07]
                  px-3.5
                  py-2
                  text-xs
                  font-bold
                  text-teal-50
                  transition
                  hover:border-teal-200/35
                  hover:bg-teal-300/[0.11]
                "
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                New paper
              </button>
            </div>

            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-1.5
              "
            >
              <MetaChip
                icon={
                  <FileText className="h-3 w-3" />
                }
                label={
                  meta.fileName
                }
              />
              <MetaChip
                icon={
                  <Bot className="h-3 w-3" />
                }
                label={`${totalIdeas} ideas · ${meta.characterCount.toLocaleString()} chars · ${meta.model}`}
              />

              {hopTrail && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-amber-300/25
                    bg-amber-300/[0.07]
                    px-2.5
                    py-0.5
                    font-mono
                    text-[9px]
                    font-bold
                    text-amber-200/90
                  "
                  title={hopTrail}
                >
                  {hopTrail}
                </span>
              )}
            </div>

            {mindmap.summary && (
              <p
                className="
                  mt-5
                  max-w-[720px]
                  rounded-2xl
                  border
                  border-teal-100/[0.08]
                  bg-teal-300/[0.04]
                  px-5
                  py-4
                  text-[13px]
                  leading-relaxed
                  text-slate-300
                "
              >
                {mindmap.summary}
              </p>
            )}
          </header>

          <div className="mt-10 space-y-4">
            {groups.map(
              (group, index) => (
                <MindMapSection
                  key={group.name}
                  index={index}
                  section={group}
                  ideas={group.ideas}
                  extractedText={
                    extractedText
                  }
                />
              ),
            )}
          </div>

          <footer
            className="
              mt-14
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              border-t
              border-white/[0.06]
              pt-6
            "
          >
            <p
              className="
                font-mono
                text-[10px]
                text-slate-500
              "
            >
              Generated with {meta.provider}{" "}
              {meta.model} ·{" "}
              {mindmap.nodes.length}{" "}
              points across{" "}
              {groups.length}{" "}
              sections
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              className="
                flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-white/[0.08]
                px-3
                py-1.5
                text-[11px]
                font-bold
                text-slate-400
                transition
                hover:border-white/[0.16]
                hover:text-white
              "
            >
              <ArrowUp className="h-3 w-3" />
              Back to top
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="
        inline-flex
        max-w-full
        items-center
        gap-1.5
        rounded-full
        border
        border-white/[0.08]
        bg-white/[0.03]
        px-2.5
        py-1
        text-[10px]
        font-semibold
        text-slate-300
      "
    >
      <span className="shrink-0 text-teal-300/70">
        {icon}
      </span>
      <span className="truncate">
        {label}
      </span>
    </span>
  );
}