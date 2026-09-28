"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  ArrowUp,
  Bot,
  FileText,
  RefreshCcw,
  Workflow,
  Download,
  FileDown,
  Copy,
  Check,
  Share2,
} from "lucide-react";

import type {
  MindMapNode,
  MindMapResponse,
} from "../../lib/mindmapTypes";

import MindMapToc from "./MindMapToc";
import MindMapSectionComponent from "./MindMapSection";

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

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Top reading progress indicator
  useEffect(() => {
    let frame: number | null = null;

    const onScroll = () => {
      if (frame !== null) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;
        const max =
          document.documentElement.scrollHeight - window.innerHeight;

        setProgress(
          max > 0
            ? Math.min(window.scrollY / max, 1)
            : 0,
        );
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  // Group ideas into sections
  const groups = useMemo<IdeaGroup[]>(() => {
    const result: IdeaGroup[] = [];
    const byName = new Map<string, IdeaGroup>();

    for (const section of mindmap.sections) {
      const group: IdeaGroup = {
        name: section.name,
        summary: section.summary,
        ideas: [],
      };
      result.push(group);
      byName.set(section.name, group);
    }

    for (const node of mindmap.nodes) {
      if (node.kind !== "idea") continue;

      let group = byName.get(node.section ?? "");

      if (!group) {
        group = {
          name: node.section ?? "Key findings",
          summary: "",
          ideas: [],
        };
        byName.set(group.name, group);
        result.push(group);
      }

      group.ideas.push(node);
    }

    return result.filter((group) => group.ideas.length > 0);
  }, [mindmap]);

  const hops = useMemo(
    () =>
      (meta.attempts ?? []).filter(
        (attempt) =>
          attempt.outcome !== "ok" && attempt.outcome !== "skipped",
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

  const totalIdeas = mindmap.nodes.filter((node) => node.kind === "idea").length;

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Export handlers
  const handleExportJson = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(mindmap, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${(mindmap.title || "biolayers-mindmap").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [mindmap]);

  const handleExportMarkdown = useCallback(() => {
    let md = `# ${mindmap.title}\n\n`;
    if (mindmap.summary) {
      md += `> ${mindmap.summary}\n\n`;
    }

    groups.forEach((group, gIdx) => {
      md += `## ${String(gIdx + 1).padStart(2, "0")}. ${group.name}\n\n`;
      if (group.summary) {
        md += `${group.summary}\n\n`;
      }

      group.ideas.forEach((idea, iIdx) => {
        md += `### ${gIdx + 1}.${iIdx + 1} ${idea.label}\n\n`;
        if (idea.description) {
          md += `${idea.description}\n\n`;
        }
        if (idea.quote) {
          md += `> "${idea.quote}"\n\n`;
        }
      });
    });

    const dataStr =
      "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${(mindmap.title || "biolayers-mindmap").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [mindmap, groups]);

  const handleCopyFormatted = useCallback(async () => {
    let text = `${mindmap.title}\n\n`;
    if (mindmap.summary) {
      text += `EXECUTIVE SUMMARY:\n${mindmap.summary}\n\n`;
    }

    groups.forEach((group, gIdx) => {
      text += `[Section ${gIdx + 1}: ${group.name}]\n`;
      if (group.summary) text += `${group.summary}\n`;
      group.ideas.forEach((idea, iIdx) => {
        text += `  • ${idea.label}: ${idea.description}\n`;
        if (idea.quote) text += `    Quote: "${idea.quote}"\n`;
      });
      text += "\n";
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed
    }
  }, [mindmap, groups]);

  return (
    <div className="relative">
      {/* Top Reading Progress Bar (Fixed) */}
      <div
        className="fixed inset-x-0 top-0 z-40 h-[3px] bg-white/[0.05]"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 shadow-[0_0_8px_rgba(43,255,136,0.6)] transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div
        className="
          mx-auto
          grid
          max-w-[1200px]
          gap-10
          px-4
          pb-24
          pt-28
          sm:px-6
          lg:px-8
          xl:grid-cols-[230px_minmax(0,1fr)]
        "
      >
        {/* Sticky Table of Contents with Scrollspy */}
        <MindMapToc
          sections={groups}
          authorUsername={meta.authorUsername}
        />

        {/* Main Document Content */}
        <main className="mx-auto w-full max-w-[840px]">
          <header className="border-b border-white/[0.08] pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/20 bg-teal-300/[0.06] px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-200">
                    <Workflow className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                    Evidence Map
                  </span>
                  <span className="font-mono text-[9.5px] text-slate-500">
                    {meta.nodeCount} graph nodes
                  </span>
                </div>

                <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
                  {mindmap.title}
                </h1>
              </div>

              {/* Top Action: New Paper Button */}
              <button
                type="button"
                onClick={onReset}
                aria-label="Upload a new paper and reset workspace"
                className="
                  inline-flex
                  min-h-[44px]
                  shrink-0
                  items-center
                  gap-2
                  rounded-[12px]
                  border
                  border-teal-200/25
                  bg-teal-300/[0.08]
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-teal-50
                  transition-[border-color,background-color]
                  duration-150
                  hover:border-teal-200/40
                  hover:bg-teal-300/[0.14]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#8db2ff]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#04070a]
                "
              >
                <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Paper</span>
              </button>
            </div>

            {/* Document Metadata Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <MetaChip
                icon={<FileText className="h-3 w-3" aria-hidden="true" />}
                label={meta.fileName}
              />
              <MetaChip
                icon={<Bot className="h-3 w-3" aria-hidden="true" />}
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

            {/* =========================================================================
                EXPORT TOOLS: JSON, Markdown, Copy formatted text
                Touch targets >= 44px, :focus-visible rings
                ========================================================================= */}
            <div
              className="mt-6 flex flex-wrap items-center gap-2.5 rounded-[16px] border border-white/[0.08] bg-[#0a0f14]/60 p-2.5 backdrop-blur-sm"
              role="toolbar"
              aria-label="Export and sharing tools"
            >
              <span className="flex items-center gap-1.5 px-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
                <Share2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Export
              </span>

              <button
                type="button"
                onClick={handleExportJson}
                aria-label="Export mind map as JSON file"
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  rounded-[10px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-3.5
                  py-2
                  text-xs
                  font-semibold
                  text-slate-200
                  transition-[background-color,border-color,color]
                  duration-150
                  hover:border-emerald-400/40
                  hover:bg-emerald-400/[0.08]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#8db2ff]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#04070a]
                "
              >
                <Download className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={handleExportMarkdown}
                aria-label="Export mind map as Markdown document"
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  rounded-[10px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-3.5
                  py-2
                  text-xs
                  font-semibold
                  text-slate-200
                  transition-[background-color,border-color,color]
                  duration-150
                  hover:border-teal-400/40
                  hover:bg-teal-400/[0.08]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#8db2ff]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#04070a]
                "
              >
                <FileDown className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                <span>Markdown</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFormatted}
                aria-label="Copy formatted summary to clipboard"
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  rounded-[10px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-3.5
                  py-2
                  text-xs
                  font-semibold
                  text-slate-200
                  transition-[background-color,border-color,color]
                  duration-150
                  hover:border-sky-400/40
                  hover:bg-sky-400/[0.08]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#8db2ff]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#04070a]
                "
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    <span className="text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
            </div>

            {/* Paper Summary Box */}
            {mindmap.summary && (
              <div className="mt-6 rounded-[20px] border border-teal-100/[0.1] bg-teal-300/[0.04] p-5 backdrop-blur-sm">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300/80">
                  Synthesis & Biological Overview
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-200">
                  {mindmap.summary}
                </p>
              </div>
            )}
          </header>

          {/* Hierarchical sections list */}
          <div className="mt-8 space-y-6">
            {groups.map((group, index) => (
              <MindMapSectionComponent
                key={group.name}
                index={index}
                section={group}
                ideas={group.ideas}
                extractedText={extractedText}
              />
            ))}
          </div>

          {/* Document Footer */}
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
            <p className="font-mono text-[10px] text-slate-500">
              Synthesized with {meta.provider} {meta.model} · {mindmap.nodes.length} nodes across {groups.length} themes
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to the top of the paper"
              className="
                inline-flex
                min-h-[44px]
                items-center
                gap-2
                rounded-[10px]
                border
                border-white/[0.1]
                bg-white/[0.03]
                px-4
                py-2
                text-xs
                font-bold
                text-slate-300
                transition-[background-color,border-color,color]
                duration-150
                hover:border-white/25
                hover:bg-white/[0.07]
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#8db2ff]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#04070a]
              "
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Top</span>
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
        px-3
        py-1
        text-[10.5px]
        font-semibold
        text-slate-300
      "
    >
      <span className="shrink-0 text-emerald-300/80">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}