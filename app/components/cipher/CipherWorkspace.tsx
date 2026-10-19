"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  ListTree,
  Microscope,
  Network,
  Search,
  Share2,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import { CIPHER_DATASETS } from "./CipherData";
import CipherNetworkCanvas, { CATEGORY_COLORS, edgeKey, type CipherSelection } from "./CipherNetworkCanvas";
import type { Citation, CipherDataset, CipherEdge, CipherNode, NodeCategory } from "./CipherTypes";

const CATEGORY_LABELS: Record<NodeCategory, { one: string; many: string }> = {
  trigger: { one: "Cause", many: "Causes" },
  mechanism: { one: "Mechanism", many: "Mechanisms" },
  effect: { one: "Effect", many: "Effects" },
  therapy: { one: "Treatment", many: "Treatments" },
};

const CATEGORY_ORDER: NodeCategory[] = ["trigger", "mechanism", "effect", "therapy"];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]";

function CitationList({ citations, title = "Sources" }: { citations: Citation[]; title?: string }) {
  if (citations.length === 0) return null;
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <ul className="mt-2 space-y-2.5">
        {citations.map((citation) => (
          <li key={citation.pmid} className="text-xs leading-relaxed">
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold text-teal-300 hover:text-teal-100 ${focusRing} rounded-sm`}
            >
              {citation.label}
            </a>
            <span className="ml-2 font-mono text-[10px] text-slate-500">PMID {citation.pmid}</span>
            {citation.context && <p className="mt-0.5 text-slate-400">{citation.context}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryChip({ category }: { category: NodeCategory }) {
  const colors = CATEGORY_COLORS[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
      style={{ borderColor: `${colors.stroke}66`, background: `${colors.stroke}1f`, color: colors.text }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: colors.dot }} />
      {CATEGORY_LABELS[category].one}
    </span>
  );
}

export default function CipherWorkspace() {
  const searchParams = useSearchParams();

  const [datasetId, setDatasetId] = useState(() => {
    const requested = searchParams?.get("paper");
    return requested && CIPHER_DATASETS.some((d) => d.id === requested) ? requested : CIPHER_DATASETS[0].id;
  });
  const dataset: CipherDataset = useMemo(
    () => CIPHER_DATASETS.find((d) => d.id === datasetId) ?? CIPHER_DATASETS[0],
    [datasetId],
  );

  const [selection, setSelection] = useState<CipherSelection>(() => {
    const node = searchParams?.get("node");
    const edge = searchParams?.get("edge");
    if (edge) return { kind: "edge", key: edge };
    if (node) return { kind: "node", id: node };
    return null;
  });
  const [view, setView] = useState<"map" | "outline">("map");
  const [decoderMode, setDecoderMode] = useState<"plain" | "technical">("plain");
  const [activeFilter, setActiveFilter] = useState<NodeCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const nodeById = useMemo(() => new Map(dataset.nodes.map((node) => [node.id, node])), [dataset]);
  const edgeByKey = useMemo(() => new Map(dataset.edges.map((edge) => [edgeKey(edge), edge])), [dataset]);

  // Drop a selection that does not exist in this dataset (stale link)
  const activeNode: CipherNode | undefined =
    selection?.kind === "node" ? nodeById.get(selection.id) : undefined;
  const activeEdge: CipherEdge | undefined =
    selection?.kind === "edge" ? edgeByKey.get(selection.key) : undefined;

  const evidenceCount = useMemo(() => {
    const pmids = new Set<string>();
    dataset.primarySources.forEach((c) => pmids.add(c.pmid));
    dataset.nodes.forEach((n) => n.sources?.forEach((c) => pmids.add(c.pmid)));
    dataset.edges.forEach((e) => e.evidence.forEach((c) => pmids.add(c.pmid)));
    return pmids.size;
  }, [dataset]);

  const searchMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    return new Set(
      dataset.nodes
        .filter((node) =>
          [node.label, node.plainTitle, node.technical, ...(node.keyMolecules ?? [])].some((text) =>
            text.toLowerCase().includes(query),
          ),
        )
        .map((node) => node.id),
    );
  }, [dataset, searchQuery]);

  // Keep the address shareable
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("paper", datasetId);
    url.searchParams.delete("node");
    url.searchParams.delete("edge");
    if (activeNode) url.searchParams.set("node", activeNode.id);
    if (activeEdge) url.searchParams.set("edge", edgeKey(activeEdge));
    window.history.replaceState({}, "", url.toString());
  }, [datasetId, activeNode, activeEdge]);

  const selectNode = useCallback((id: string) => setSelection({ kind: "node", id }), []);

  const changeDataset = (id: string) => {
    setDatasetId(id);
    setSelection(null);
    setTourIndex(null);
    setQuizAnswer(null);
    setSearchQuery("");
    setActiveFilter(null);
  };

  const goToStep = useCallback(
    (index: number | null) => {
      setTourIndex(index);
      if (index !== null) {
        const step = dataset.tour[index];
        if (step) setSelection({ kind: "node", id: step.nodeId });
      }
    },
    [dataset],
  );

  // Arrow keys move through the tour
  useEffect(() => {
    if (tourIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToStep(tourIndex + 1 < dataset.tour.length ? tourIndex + 1 : null);
      } else if (event.key === "ArrowLeft" && tourIndex > 0) {
        event.preventDefault();
        goToStep(tourIndex - 1);
      } else if (event.key === "Escape") {
        goToStep(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourIndex, dataset, goToStep]);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const upstream = activeNode
    ? dataset.edges.filter((e) => e.target === activeNode.id)
    : [];
  const downstream = activeNode
    ? dataset.edges.filter((e) => e.source === activeNode.id)
    : [];

  const tourStep = tourIndex !== null ? dataset.tour[tourIndex] : null;

  const relationRow = (edge: CipherEdge, direction: "up" | "down") => {
    const other = nodeById.get(direction === "up" ? edge.source : edge.target);
    if (!other) return null;
    return (
      <li key={edgeKey(edge)} className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => selectNode(other.id)}
          className={`flex-1 rounded-lg p-2 text-left transition hover:bg-white/[0.05] ${focusRing}`}
        >
          <span className="block text-xs font-bold text-slate-100">{other.label}</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">
            {edge.label}
            {edge.hypothesis ? " (hypothesis)" : ""}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSelection({ kind: "edge", key: edgeKey(edge) })}
          className={`mt-1 shrink-0 rounded-lg border border-white/10 px-2 py-1.5 font-mono text-[10px] text-teal-200 transition hover:border-teal-200/40 hover:bg-teal-300/[0.1] ${focusRing}`}
          aria-label={`Why we believe: ${edge.label}, ${nodeById.get(edge.source)?.label} to ${nodeById.get(edge.target)?.label}`}
        >
          Why? {edge.evidence.length}
        </button>
      </li>
    );
  };

  return (
    <div className="flex w-full flex-col bg-[#04070a] text-slate-100 lg:h-full lg:max-h-full lg:overflow-hidden">
      {/* Header */}
      <header className="border-b border-teal-200/10 bg-[#070c14]/85 px-4 py-3 backdrop-blur-xl sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-400/[0.08] text-teal-300">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-sm font-bold tracking-tight text-white">
                Project Cipher
                <span className="rounded-full border border-teal-200/20 bg-teal-300/[0.06] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-teal-200">
                  NXT × BioLayers
                </span>
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Cancer research turned into cause-and-effect maps, with a source behind every arrow
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <label className="sr-only" htmlFor="cipher-dataset">
              Choose a map
            </label>
            <select
              id="cipher-dataset"
              value={datasetId}
              onChange={(event) => changeDataset(event.target.value)}
              style={{ colorScheme: "dark" }}
              className="min-h-[40px] w-full rounded-[12px] border border-teal-200/25 bg-[#0a121c] px-3 text-sm font-semibold text-slate-100 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 sm:w-auto"
            >
              {CIPHER_DATASETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.difficulty})
                </option>
              ))}
            </select>

            {tourIndex === null ? (
              <button
                type="button"
                onClick={() => goToStep(0)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-[12px] border border-emerald-400/40 bg-emerald-400/15 px-3.5 text-sm font-bold text-emerald-100 shadow-[0_0_20px_rgba(43,255,136,0.18)] transition hover:border-emerald-300 hover:bg-emerald-400/25 ${focusRing}`}
              >
                <Zap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Guided tour
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(null)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-[12px] border border-white/15 bg-white/[0.05] px-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] ${focusRing}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                End tour
              </button>
            )}

            <button
              type="button"
              onClick={copyLink}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] border border-white/15 bg-white/[0.05] px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white ${focusRing}`}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-teal-200/10 bg-[#060a10]/95 px-4 py-2 sm:px-5">
        <div className="flex rounded-[10px] border border-teal-200/20 bg-[#04080e] p-0.5" role="group" aria-label="View">
          {(
            [
              { id: "map", label: "Map", icon: Network },
              { id: "outline", label: "Outline", icon: ListTree },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              onClick={() => setView(option.id)}
              className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-[8px] px-3 text-xs font-semibold transition ${
                view === option.id ? "bg-teal-400/25 text-teal-50" : "text-slate-400 hover:text-slate-200"
              } ${focusRing}`}
            >
              <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>

        <div
          className="flex max-w-full items-center gap-1.5 overflow-x-auto"
          role="group"
          aria-label="Show only one kind of step"
        >
          {[null, ...CATEGORY_ORDER].map((category) => {
            const active = activeFilter === category;
            const label = category ? CATEGORY_LABELS[category].many : "Everything";
            return (
              <button
                key={category ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveFilter(category)}
                className={`inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-[8px] border px-2.5 text-xs transition ${
                  active
                    ? "border-teal-300/45 bg-teal-300/[0.18] font-bold text-teal-50"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
                } ${focusRing}`}
              >
                {category && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ background: CATEGORY_COLORS[category].dot }}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchMatches && searchMatches.size > 0) {
                selectNode([...searchMatches][0]);
              }
            }}
            placeholder="Find a gene, protein or drug"
            aria-label="Find a gene, protein or drug in this map"
            className="min-h-[36px] w-full rounded-[10px] border border-white/15 bg-[#091018] pl-8 pr-3 text-base text-slate-100 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 sm:text-sm"
          />
          {searchMatches && (
            <p className="sr-only" aria-live="polite">
              {searchMatches.size} matching steps
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid w-full grid-cols-1 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_400px] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="relative h-[58vh] min-h-[360px] p-2.5 lg:h-full lg:min-h-0">
          {view === "map" && (
            <p className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-white/10 bg-[#070c14]/85 px-3 py-1 text-[11px] text-slate-300 backdrop-blur md:hidden">
              Pinch to zoom, or use Outline for text
            </p>
          )}
          {view === "map" ? (
            <CipherNetworkCanvas
              nodes={dataset.nodes}
              edges={dataset.edges}
              selection={activeNode || activeEdge ? selection : null}
              focusNodeId={tourStep?.nodeId ?? null}
              activeFilter={activeFilter}
              searchMatches={searchMatches}
              onSelect={(next) => {
                setSelection(next);
                if (tourIndex !== null && (next?.kind !== "node" || next.id !== tourStep?.nodeId)) setTourIndex(null);
              }}
            />
          ) : (
            <div className="h-full overflow-y-auto rounded-2xl border border-teal-200/15 bg-[#070c14]/80 p-5">
              <h2 className="text-lg font-bold text-white">{dataset.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{dataset.subtitle}</p>
              {CATEGORY_ORDER.map((category) => {
                const group = dataset.nodes.filter(
                  (node) => node.category === category && (!activeFilter || activeFilter === category),
                );
                if (group.length === 0) return null;
                return (
                  <section key={category} className="mt-6">
                    <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {CATEGORY_LABELS[category].many}
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {group.map((node) => (
                        <li key={node.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          <button
                            type="button"
                            onClick={() => selectNode(node.id)}
                            className={`text-left text-sm font-bold text-slate-100 hover:text-teal-200 ${focusRing} rounded-sm ${
                              searchMatches?.has(node.id) ? "underline decoration-teal-300 underline-offset-4" : ""
                            }`}
                          >
                            {node.label}
                          </button>
                          {dataset.edges.filter((e) => e.source === node.id).length > 0 && (
                            <ul className="mt-1.5 space-y-1">
                              {dataset.edges
                                .filter((e) => e.source === node.id)
                                .map((edge) => (
                                  <li key={edgeKey(edge)} className="text-xs text-slate-400">
                                    <span aria-hidden="true">→ </span>
                                    {edge.label}{" "}
                                    <button
                                      type="button"
                                      onClick={() => selectNode(edge.target)}
                                      className={`font-semibold text-slate-200 hover:text-teal-200 ${focusRing} rounded-sm`}
                                    >
                                      {nodeById.get(edge.target)?.label}
                                    </button>
                                    {edge.hypothesis ? " (hypothesis)" : ""}{" "}
                                    <button
                                      type="button"
                                      onClick={() => setSelection({ kind: "edge", key: edgeKey(edge) })}
                                      className={`text-teal-300 hover:text-teal-100 ${focusRing} rounded-sm`}
                                    >
                                      why?
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <aside
          aria-label="Details"
          className="flex flex-col border-t border-teal-200/10 bg-[#070c14]/95 p-4 backdrop-blur-2xl lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0"
        >
          <div className="space-y-5">
            {tourStep && tourIndex !== null && (
              <div className="rounded-[16px] border border-teal-300/35 bg-teal-400/[0.08] p-4" aria-live="polite">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-200">
                    Tour step {tourIndex + 1} of {dataset.tour.length}
                  </span>
                </div>
                <h2 className="mt-1.5 text-base font-bold text-white">{tourStep.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-100">{tourStep.concept}</p>
                {tourStep.questionPrompt && (
                  <p className="mt-3 rounded-[10px] border border-teal-200/20 bg-[#0a141f] p-2.5 text-xs text-teal-100">
                    <span className="font-semibold">Think about it:</span> {tourStep.questionPrompt}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={tourIndex === 0}
                    onClick={() => goToStep(tourIndex - 1)}
                    className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-30 ${focusRing}`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back
                  </button>
                  <span className="text-[11px] text-slate-400">Arrow keys work too</span>
                  <button
                    type="button"
                    onClick={() => goToStep(tourIndex + 1 < dataset.tour.length ? tourIndex + 1 : null)}
                    className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-teal-100 transition hover:bg-white/10 ${focusRing}`}
                  >
                    {tourIndex + 1 < dataset.tour.length ? "Next" : "Finish"}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {activeEdge ? (
              /* ---------- Arrow detail: why do we believe this? ---------- */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Why we believe this link
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelection(null)}
                    aria-label="Close link details"
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white ${focusRing}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <h2 className="text-lg font-bold leading-snug text-white">
                  <button type="button" onClick={() => selectNode(activeEdge.source)} className={`text-left hover:text-teal-200 ${focusRing} rounded-sm`}>
                    {nodeById.get(activeEdge.source)?.label}
                  </button>
                  <span className="mx-1.5 text-slate-500" aria-hidden="true">→</span>
                  <span className="sr-only"> {activeEdge.label} </span>
                  <button type="button" onClick={() => selectNode(activeEdge.target)} className={`text-left hover:text-teal-200 ${focusRing} rounded-sm`}>
                    {nodeById.get(activeEdge.target)?.label}
                  </button>
                </h2>
                <p className="font-mono text-xs font-semibold text-teal-200">{activeEdge.label}</p>
                {activeEdge.hypothesis && (
                  <p className="rounded-[12px] border border-amber-400/30 bg-amber-400/[0.08] p-3 text-xs leading-relaxed text-amber-100">
                    Hypothesis. The papers below make this link plausible, but it has not been shown
                    directly.
                  </p>
                )}
                <p className="text-sm leading-relaxed text-slate-200">{activeEdge.mechanismDetail}</p>
                <CitationList citations={activeEdge.evidence} title="Evidence" />
              </div>
            ) : activeNode ? (
              /* ---------- Node detail ---------- */
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryChip category={activeNode.category} />
                    {activeNode.drugStatus && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                          activeNode.drugStatus === "approved"
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                            : "border-amber-400/40 bg-amber-400/10 text-amber-200"
                        }`}
                      >
                        <FlaskConical className="h-3 w-3" aria-hidden="true" />
                        {activeNode.drugStatus === "approved" ? "Approved drug" : "Experimental"}
                      </span>
                    )}
                    {activeNode.observed && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-sky-200">
                        <Microscope className="h-3 w-3" aria-hidden="true" />
                        Observed in an image
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(`${activeNode.label}. ${activeNode.pronunciation ? `${activeNode.pronunciation}. ` : ""}${decoderMode === "plain" ? activeNode.plainExplanation : activeNode.technical}`)}
                    aria-label={`Read ${activeNode.label} aloud`}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.05] text-slate-300 transition hover:border-teal-300/40 hover:text-teal-200 ${focusRing}`}
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">{activeNode.label}</h2>
                  <p className="mt-0.5 text-sm text-teal-300/90">
                    {activeNode.plainTitle}
                    {activeNode.pronunciation && (
                      <span className="ml-2 text-xs italic text-slate-400">say: {activeNode.pronunciation}</span>
                    )}
                  </p>
                </div>

                <div>
                  <div
                    className="flex rounded-[10px] border border-teal-200/25 bg-[#04080e] p-1 text-xs"
                    role="tablist"
                    aria-label="Explanation level"
                  >
                    {(
                      [
                        { id: "plain", label: "For students", icon: GraduationCap },
                        { id: "technical", label: "Technical", icon: BookOpen },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        id={`cipher-tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={decoderMode === tab.id}
                        aria-controls="cipher-tabpanel"
                        onClick={() => setDecoderMode(tab.id)}
                        className={`flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-[7px] px-2.5 font-semibold transition ${
                          decoderMode === tab.id ? "bg-teal-400/25 text-teal-50" : "text-slate-400 hover:text-slate-200"
                        } ${focusRing}`}
                      >
                        <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div
                    id="cipher-tabpanel"
                    role="tabpanel"
                    aria-labelledby={`cipher-tab-${decoderMode}`}
                    className="mt-2 rounded-2xl border border-teal-200/15 bg-[#09121a]/90 p-4"
                  >
                    <p className="text-sm leading-relaxed text-slate-200">
                      {decoderMode === "plain" ? activeNode.plainExplanation : activeNode.technical}
                    </p>
                    {decoderMode === "technical" && (
                      <p className="mt-2 text-[11px] text-slate-500">Our summary of the sources below, not a quotation.</p>
                    )}
                    {activeNode.keyMolecules && activeNode.keyMolecules.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-teal-100/[0.06] pt-3">
                        {activeNode.keyMolecules.map((molecule) => (
                          <span
                            key={molecule}
                            className="rounded-md border border-teal-200/15 bg-teal-300/[0.05] px-2 py-0.5 font-mono text-[11px] font-semibold text-teal-200"
                          >
                            {molecule}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {activeNode.link && (
                  <Link
                    href={activeNode.link.href}
                    className={`inline-flex min-h-[40px] items-center gap-2 rounded-[12px] border border-sky-400/25 bg-sky-400/[0.06] px-3.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-400/[0.12] ${focusRing}`}
                  >
                    <Microscope className="h-4 w-4 text-sky-300" aria-hidden="true" />
                    {activeNode.link.label}
                  </Link>
                )}

                {upstream.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">What leads here</p>
                    <ul className="mt-1.5 space-y-1">{upstream.map((edge) => relationRow(edge, "up"))}</ul>
                  </div>
                )}
                {downstream.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">What this leads to</p>
                    <ul className="mt-1.5 space-y-1">{downstream.map((edge) => relationRow(edge, "down"))}</ul>
                  </div>
                )}

                <CitationList citations={activeNode.sources ?? []} />
              </div>
            ) : (
              /* ---------- Map introduction ---------- */
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-300/80">
                    {dataset.difficulty} · {dataset.estimatedReadTime}
                  </span>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-white">{dataset.title}</h2>
                  <p className="mt-1 text-sm text-teal-200/80">{dataset.subtitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{dataset.oneLineSummary}</p>
                </div>
                <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-slate-300">
                  Built from {evidenceCount} peer-reviewed papers, each checked against PubMed. Click
                  any step to read about it, or any arrow to see why we believe it. Content reviewed{" "}
                  {dataset.reviewed}.
                </p>
                <button
                  type="button"
                  onClick={() => goToStep(0)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-[14px] border-2 border-emerald-400/50 bg-emerald-400/15 px-5 text-sm font-bold text-emerald-100 shadow-[0_0_24px_rgba(43,255,136,0.2)] transition hover:border-emerald-300 hover:bg-emerald-400/25 ${focusRing}`}
                >
                  <Zap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  Start the guided tour
                </button>
                <CitationList citations={dataset.primarySources} title="Main sources" />
              </div>
            )}

            {/* Self-check */}
            {dataset.quiz && (
              <details className="group rounded-[18px] border border-teal-200/25 bg-[#08111a]/90 p-4" open={quizAnswer !== null}>
                <summary className={`flex cursor-pointer list-none items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-teal-300 ${focusRing} rounded-sm`}>
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  Check your understanding
                </summary>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-white">{dataset.quiz.question}</p>
                <div className="mt-3 space-y-2" role="group" aria-label="Answers">
                  {dataset.quiz.options.map((option, index) => {
                    const answered = quizAnswer !== null;
                    const isCorrect = index === dataset.quiz?.correctIndex;
                    const isChosen = quizAnswer === index;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={answered}
                        onClick={() => setQuizAnswer(index)}
                        className={`flex w-full min-h-[44px] items-start gap-2.5 rounded-[12px] border p-2.5 text-left text-xs transition ${
                          answered
                            ? isCorrect
                              ? "border-emerald-500/60 bg-emerald-500/15 font-bold text-emerald-100"
                              : isChosen
                                ? "border-rose-500/60 bg-rose-500/15 text-rose-100"
                                : "border-white/5 bg-white/[0.02] text-slate-500"
                            : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20 hover:bg-white/[0.06]"
                        } ${focusRing}`}
                      >
                        <span className="font-mono font-bold opacity-75">{String.fromCharCode(65 + index)}.</span>
                        <span className="leading-snug">{option}</span>
                      </button>
                    );
                  })}
                </div>
                {quizAnswer !== null && (
                  <div className="mt-3 rounded-[12px] border border-teal-200/25 bg-teal-400/[0.08] p-3 text-xs" aria-live="polite">
                    <p className="font-bold text-teal-100">
                      {quizAnswer === dataset.quiz.correctIndex ? "Correct." : "Not quite."}
                    </p>
                    <p className="mt-1 leading-relaxed text-slate-200">{dataset.quiz.explanation}</p>
                    <button
                      type="button"
                      onClick={() => setQuizAnswer(null)}
                      className={`mt-2 font-semibold text-teal-300 hover:text-teal-100 ${focusRing} rounded-sm`}
                    >
                      Try again
                    </button>
                  </div>
                )}
              </details>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-teal-100/[0.08] pt-4 text-xs text-slate-400">
            <span>Have a paper of your own?</span>
            <Link
              href="/mindmap"
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 font-bold text-teal-300 transition hover:text-white ${focusRing}`}
            >
              Map it in the mind map
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
