"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Compass,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Microscope,
  Zap,
  Search,
  Volume2,
  Share2,
  Check,
  HelpCircle,
  Award,
} from "lucide-react";

import { CIPHER_DATASETS } from "./CipherData";
import CipherNetworkCanvas from "./CipherNetworkCanvas";
import type { CipherDataset, CipherNode } from "./CipherTypes";

export default function CipherWorkspace() {
  const searchParams = useSearchParams();
  const initialPaper = searchParams?.get("paper");
  const initialNode = searchParams?.get("node");

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(() => {
    if (initialPaper && CIPHER_DATASETS.some((d) => d.id === initialPaper)) {
      return initialPaper;
    }
    return "kras-g12d";
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    if (initialNode) {
      return initialNode;
    }
    return "kras-mutation";
  });
  const [decoderMode, setDecoderMode] = useState<"plain" | "academic">("plain");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [tourStepIndex, setTourStepIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Update URL without full page reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("paper", selectedDatasetId);
    if (selectedNodeId) {
      url.searchParams.set("node", selectedNodeId);
    } else {
      url.searchParams.delete("node");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedDatasetId, selectedNodeId]);

  const currentDataset: CipherDataset = useMemo(() => {
    return (
      CIPHER_DATASETS.find((d) => d.id === selectedDatasetId) ??
      CIPHER_DATASETS[0]
    );
  }, [selectedDatasetId]);

  // Active selected node
  const activeNode: CipherNode | undefined = useMemo(() => {
    return currentDataset.nodes.find((n) => n.id === selectedNodeId);
  }, [currentDataset, selectedNodeId]);

  // Upstream & Downstream causal relationships for the active node
  const causalChain = useMemo(() => {
    if (!selectedNodeId) return { upstream: [], downstream: [] };

    const upstream = currentDataset.edges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => ({
        edge: e,
        node: currentDataset.nodes.find((n) => n.id === e.source),
      }))
      .filter((item): item is { edge: typeof item.edge; node: CipherNode } => Boolean(item.node));

    const downstream = currentDataset.edges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => ({
        edge: e,
        node: currentDataset.nodes.find((n) => n.id === e.target),
      }))
      .filter((item): item is { edge: typeof item.edge; node: CipherNode } => Boolean(item.node));

    return { upstream, downstream };
  }, [currentDataset, selectedNodeId]);

  // Text-To-Speech Pronunciation Aid (Free native browser Web Speech API)
  const speakPronunciation = useCallback((textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Guided Tour Navigation
  const startTour = () => {
    setTourStepIndex(0);
    const firstStep = currentDataset.tour[0];
    if (firstStep) {
      setSelectedNodeId(firstStep.nodeId);
    }
  };

  const nextTourStep = () => {
    if (tourStepIndex === null) return;
    const nextIdx = tourStepIndex + 1;
    if (nextIdx < currentDataset.tour.length) {
      setTourStepIndex(nextIdx);
      setSelectedNodeId(currentDataset.tour[nextIdx].nodeId);
    } else {
      setTourStepIndex(null); // End of tour
    }
  };

  const prevTourStep = () => {
    if (tourStepIndex === null || tourStepIndex <= 0) return;
    const prevIdx = tourStepIndex - 1;
    setTourStepIndex(prevIdx);
    setSelectedNodeId(currentDataset.tour[prevIdx].nodeId);
  };

  const stopTour = () => {
    setTourStepIndex(null);
  };

  // Copy shareable link
  const copyShareLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    });
  };

  // Filtered nodes based on search and category
  const displayedNodes = useMemo(() => {
    if (!searchQuery.trim()) return currentDataset.nodes;
    const query = searchQuery.toLowerCase();
    return currentDataset.nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(query) ||
        n.plainTitle.toLowerCase().includes(query) ||
        n.keyMolecules?.some((m) => m.toLowerCase().includes(query)),
    );
  }, [currentDataset, searchQuery]);

  return (
    <div className="flex h-full max-h-full w-full flex-col overflow-hidden bg-[#04070a] text-slate-100">
      {/* TOP HEADER / INITIATIVE BANNER */}
      <header className="border-b border-teal-200/10 bg-[#070c14]/85 px-4 py-2 backdrop-blur-xl sm:px-5">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Initiative Branding */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-400/[0.08] text-teal-300 shadow-[0_0_15px_rgba(77,141,255,0.25)]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold tracking-tight text-white sm:text-sm">
                  Project Cipher
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/20 bg-teal-300/[0.06] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-teal-200">
                  <Sparkles className="h-2 w-2 text-teal-300" />
                  NXT × BioLayers
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Making cancer research papers readable through interactive cause ➔ effect maps
              </p>
            </div>
          </div>

          {/* Right: Dataset Selector, Guided Tour & Share */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedDatasetId}
                onChange={(e) => {
                  setSelectedDatasetId(e.target.value);
                  setSelectedNodeId(null);
                  setTourStepIndex(null);
                  setSelectedQuizAnswer(null);
                  setShowQuizResult(false);
                }}
                style={{ colorScheme: "dark", touchAction: "manipulation" }}
                className="min-h-[38px] rounded-[12px] border border-teal-200/25 bg-[#0a121c] px-3 pr-8 text-xs font-semibold text-slate-100 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                aria-label="Select Cancer Mechanism Paper"
              >
                {CIPHER_DATASETS.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.title} ({dataset.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {tourStepIndex === null ? (
              <button
                type="button"
                onClick={startTour}
                style={{ touchAction: "manipulation" }}
                className="group flex min-h-[38px] items-center gap-2 rounded-[12px] border border-teal-200/35 bg-teal-300/[0.12] px-3.5 text-xs font-bold text-teal-100 hover:border-teal-200/50 hover:bg-teal-300/[0.22] transition-[background-color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <Zap className="h-3.5 w-3.5 text-teal-300 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span>Guided Tour</span>
              </button>
            ) : (
              <div className="flex min-h-[38px] items-center gap-2 rounded-[12px] border border-teal-200/30 bg-teal-300/[0.1] px-2.5 py-1 text-xs">
                <span className="font-mono text-[10px] font-bold text-teal-100 tabular-nums">
                  Step {tourStepIndex + 1}/{currentDataset.tour.length}
                </span>
                <button
                  type="button"
                  onClick={prevTourStep}
                  disabled={tourStepIndex === 0}
                  style={{ touchAction: "manipulation" }}
                  className="flex min-h-[28px] min-w-[28px] items-center justify-center rounded-lg p-1 text-slate-200 hover:bg-white/10 disabled:opacity-30 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={nextTourStep}
                  style={{ touchAction: "manipulation" }}
                  className="flex min-h-[28px] min-w-[28px] items-center justify-center rounded-lg p-1 text-teal-200 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                  aria-label="Next step"
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={stopTour}
                  style={{ touchAction: "manipulation" }}
                  className="flex min-h-[28px] min-w-[28px] items-center justify-center rounded-lg p-1 text-[11px] font-bold text-slate-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                  aria-label="Exit guided tour"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Share Link Button */}
            <button
              type="button"
              onClick={copyShareLink}
              style={{ touchAction: "manipulation" }}
              className="flex min-h-[38px] items-center gap-1.5 rounded-[12px] border border-white/15 bg-white/[0.05] px-3 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.1] transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              aria-label="Share Pathway Link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-300 text-[11px] font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline text-[11px]">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SUB-BAR: QUICK FILTERS & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200/10 bg-[#060a10]/95 px-4 py-2 text-xs sm:px-5">
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Layer filters">
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Filter:
          </span>
          {[
            { id: null, label: "All Layers" },
            { id: "trigger", label: "Causes / Triggers" },
            { id: "mechanism", label: "Signaling Cascades" },
            { id: "effect", label: "Cancer Effects" },
            { id: "therapy", label: "Therapies" },
          ].map((pill) => (
            <button
              key={pill.id ?? "all"}
              type="button"
              onClick={() => setActiveFilter(pill.id)}
              style={{ touchAction: "manipulation" }}
              className={`min-h-[28px] rounded-[8px] px-2.5 py-1 font-mono text-[9.5px] transition-[background-color,border-color,color] ${
                activeFilter === pill.id
                  ? "border border-teal-300/45 bg-teal-300/[0.18] font-bold text-teal-100 shadow-[0_0_10px_rgba(77,141,255,0.15)]"
                  : "border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative w-48 sm:w-60">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search genes, molecules…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search genes and molecules in network"
            className="min-h-[32px] w-full rounded-[10px] border border-white/15 bg-[#091018] pl-8 pr-3 text-base sm:text-xs text-slate-100 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
        </div>
      </div>

      {/* MAIN BODY: SPLIT VIEW (CANVAS + CIPHER DECODER) */}
      <div className="grid flex-1 min-h-0 w-full grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] overflow-hidden">
        {/* LEFT/CENTER: INTERACTIVE CANVAS */}
        <div className="relative flex flex-col p-2.5 min-h-0 h-full overflow-hidden">
          <div className="relative flex-1 min-h-0 w-full overflow-hidden">
            <CipherNetworkCanvas
              nodes={displayedNodes}
              edges={currentDataset.edges}
              selectedNodeId={selectedNodeId}
              activeFilter={activeFilter}
              isTourActive={tourStepIndex !== null}
              onSelectNode={setSelectedNodeId}
            />
          </div>

          {/* Canvas Bottom Instruction Strip */}
          <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-500 shrink-0">
            <span>Click any node to trace upstream triggers & downstream effects</span>
            <span>Drag nodes · Scroll to zoom · Eco mode for low battery</span>
          </div>
        </div>

        {/* RIGHT PANEL: CIPHER STUDENT DECODER */}
        <aside className="border-t border-teal-200/10 bg-[#070c14]/95 p-4 backdrop-blur-2xl lg:border-t-0 lg:border-l flex flex-col justify-between overflow-y-auto min-h-0 h-full">
          <div className="space-y-4">
            {/* Decoder Header & Mode Switcher */}
            <div className="flex items-center justify-between border-b border-teal-100/[0.08] pb-2.5">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-teal-300" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-teal-100">
                  Cipher Decoder
                </span>
              </div>

              {/* Mode Toggle: Plain English vs Academic Excerpt */}
              <div className="flex rounded-[10px] border border-teal-200/25 bg-[#04080e] p-1 text-[10px] font-mono" role="tablist" aria-label="Decoder perspective">
                <button
                  type="button"
                  role="tab"
                  aria-selected={decoderMode === "plain"}
                  onClick={() => setDecoderMode("plain")}
                  style={{ touchAction: "manipulation" }}
                  className={`flex min-h-[30px] items-center gap-1.5 rounded-[7px] px-2.5 py-1 transition-[background-color,color] ${
                    decoderMode === "plain"
                      ? "bg-teal-400/25 font-bold text-teal-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
                >
                  <GraduationCap className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                  <span>Student View</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={decoderMode === "academic"}
                  onClick={() => setDecoderMode("academic")}
                  style={{ touchAction: "manipulation" }}
                  className={`flex min-h-[30px] items-center gap-1.5 rounded-[7px] px-2.5 py-1 transition-[background-color,color] ${
                    decoderMode === "academic"
                      ? "bg-teal-400/25 font-bold text-teal-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
                >
                  <Microscope className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                  <span>Paper Excerpt</span>
                </button>
              </div>
            </div>

            {/* Visual Causal Domino Pipeline Indicator */}
            {activeNode && (
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.03] p-2.5 text-[10.5px] font-mono shadow-inner">
                <div
                  className={`flex items-center gap-1.5 ${
                    activeNode.category === "trigger"
                      ? "font-bold text-rose-300"
                      : "text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_#ff3b5c]" aria-hidden="true" />
                  <span>1. Trigger</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">➔</span>
                <div
                  className={`flex items-center gap-1.5 ${
                    activeNode.category === "mechanism"
                      ? "font-bold text-sky-300"
                      : "text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" aria-hidden="true" />
                  <span>2. Relay</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">➔</span>
                <div
                  className={`flex items-center gap-1.5 ${
                    activeNode.category === "effect"
                      ? "font-bold text-purple-300"
                      : "text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" aria-hidden="true" />
                  <span>3. Growth</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">➔</span>
                <div
                  className={`flex items-center gap-1.5 ${
                    activeNode.category === "therapy"
                      ? "font-bold text-emerald-300"
                      : "text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" aria-hidden="true" />
                  <span>4. Therapy</span>
                </div>
              </div>
            )}

            {/* Guided Tour Step Card (if tour active) */}
            {tourStepIndex !== null && currentDataset.tour[tourStepIndex] && (
              <div className="rounded-[16px] border border-teal-300/35 bg-teal-400/[0.08] p-4 shadow-[0_0_24px_rgba(77,141,255,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-teal-200">
                    {currentDataset.tour[tourStepIndex].title}
                  </span>
                  <span className="rounded-full bg-teal-300/20 px-2.5 py-0.5 font-mono text-[9px] font-bold text-teal-100 tabular-nums">
                    Step {tourStepIndex + 1} of {currentDataset.tour.length}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-100">
                  {currentDataset.tour[tourStepIndex].concept}
                </p>
                {currentDataset.tour[tourStepIndex].questionPrompt && (
                  <div className="mt-3 rounded-[10px] border border-teal-200/20 bg-[#0a141f] p-2.5 text-xs text-teal-200/90 font-medium">
                    💡 <em>Thought experiment:</em> {currentDataset.tour[tourStepIndex].questionPrompt}
                  </div>
                )}
              </div>
            )}

            {/* Active Node Detail Card */}
            {activeNode ? (
              <div className="space-y-4">
                {/* Node Title, Pronunciation & Category Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[8.5px] font-bold uppercase tracking-wider ${
                          activeNode.category === "trigger"
                            ? "border border-rose-400/40 bg-rose-400/15 text-rose-200"
                            : activeNode.category === "mechanism"
                            ? "border border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
                            : activeNode.category === "effect"
                            ? "border border-purple-400/40 bg-purple-400/15 text-purple-200"
                            : "border border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                        {activeNode.category.toUpperCase()}
                      </span>
                      <span className="font-mono text-[9.5px] font-semibold text-slate-400">
                        Significance: {activeNode.weight}/5
                      </span>
                    </div>

                    {/* Audio Pronounce Button */}
                    <button
                      type="button"
                      onClick={() =>
                        speakPronunciation(
                          `${activeNode.label}. ${activeNode.plainExplanation}`,
                        )
                      }
                      style={{ touchAction: "manipulation" }}
                      className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.05] text-slate-300 hover:text-teal-200 hover:border-teal-300/40 transition-[color,border-color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                      aria-label={`Listen to pronunciation and summary of ${activeNode.label}`}
                    >
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
                    {activeNode.label}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[11px] text-teal-300/90">
                      {activeNode.plainTitle}
                    </p>
                    {activeNode.pronunciation && (
                      <span className="font-mono text-[9px] text-slate-400 italic">
                        [{activeNode.pronunciation}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Plain English vs Academic View */}
                {decoderMode === "plain" ? (
                  <div className="rounded-2xl border border-teal-200/15 bg-[#09121a]/90 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-teal-300">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span className="font-bold uppercase tracking-wider">
                        Plain English Analogy:
                      </span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-200">
                      {activeNode.plainExplanation}
                    </p>

                    {activeNode.keyMolecules && activeNode.keyMolecules.length > 0 && (
                      <div className="mt-3.5 border-t border-teal-100/[0.06] pt-3">
                        <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                          Key Molecular Players:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {activeNode.keyMolecules.map((mol) => (
                            <span
                              key={mol}
                              className="rounded-md border border-teal-200/15 bg-teal-300/[0.05] px-2 py-0.5 font-mono text-[10px] font-semibold text-teal-200"
                            >
                              {mol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#0a0f16]/90 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-sky-300">
                      <Microscope className="h-3.5 w-3.5" />
                      <span className="font-bold uppercase tracking-wider">
                        Academic Literature Excerpt:
                      </span>
                    </div>
                    <blockquote className="mt-2 border-l-2 border-sky-400/40 pl-3 text-xs leading-relaxed italic text-slate-300">
                      &ldquo;{activeNode.academicExcerpt}&rdquo;
                    </blockquote>
                    {currentDataset.paperDoiOrPmc && (
                      <div className="mt-3 font-mono text-[9px] text-slate-500">
                        Reference DOI: {currentDataset.paperDoiOrPmc}
                      </div>
                    )}
                  </div>
                )}

                {/* CAUSAL CHAIN BREADCRUMB INSPECTOR */}
                <div className="space-y-3 pt-2">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Causal Pathway Chain
                  </div>

                  {/* Upstream Causes */}
                  {causalChain.upstream.length > 0 && (
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                        Upstream Causes (What triggers this):
                      </span>
                      <div className="mt-2 space-y-2">
                        {causalChain.upstream.map(({ edge, node }) => (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-white/5 transition"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                            <div>
                              <div className="text-xs font-bold text-slate-200 hover:text-teal-300">
                                {node.label}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {edge.label}: {edge.mechanismDetail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Downstream Effects */}
                  {causalChain.downstream.length > 0 && (
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                        Downstream Effects (What this causes next):
                      </span>
                      <div className="mt-2 space-y-2">
                        {causalChain.downstream.map(({ edge, node }) => (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-white/5 transition"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                            <div>
                              <div className="text-xs font-bold text-slate-200 hover:text-teal-300">
                                {node.label}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {edge.label}: {edge.mechanismDetail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-teal-200/20 p-8 text-center">
                <Compass className="mx-auto h-8 w-8 text-teal-300/50" />
                <h3 className="mt-3 text-sm font-bold text-white">
                  Explore the Causal Network
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Select any node in the constellation, or start the Guided Tour to trace how genetic mutations cascade into clinical cancer.
                </p>
                <button
                  type="button"
                  onClick={startTour}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-200/30 bg-teal-300/[0.1] px-4 py-2 text-xs font-bold text-teal-100 hover:bg-teal-300/[0.2] transition"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Start Guided Walkthrough</span>
                </button>
              </div>
            )}

            {/* STUDENT SELF-CHECK QUIZ CARD */}
            {currentDataset.quiz && (
              <div className="rounded-[18px] border border-teal-200/25 bg-[#08111a]/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Student Self-Check</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white leading-relaxed">
                  {currentDataset.quiz.question}
                </p>

                <div className="mt-3.5 space-y-2">
                  {currentDataset.quiz.options.map((option, idx) => {
                    const isSelected = selectedQuizAnswer === idx;
                    const isCorrect = idx === currentDataset.quiz?.correctIndex;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedQuizAnswer(idx);
                          setShowQuizResult(true);
                        }}
                        style={{ touchAction: "manipulation" }}
                        className={`w-full min-h-[40px] text-left rounded-[12px] border p-2.5 text-xs transition-[background-color,border-color,color] ${
                          showQuizResult
                            ? isCorrect
                              ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-100 font-bold shadow-[0_0_12px_rgba(43,255,136,0.15)]"
                              : isSelected
                              ? "border-rose-500/60 bg-rose-500/20 text-rose-100 font-semibold"
                              : "border-white/5 bg-white/[0.02] text-slate-400"
                            : isSelected
                            ? "border-teal-400/60 bg-teal-400/20 text-teal-100 font-semibold"
                            : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20 hover:bg-white/[0.06]"
                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] font-bold opacity-75">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showQuizResult && (
                  <div className="mt-3.5 rounded-[12px] border border-teal-200/25 bg-teal-400/[0.08] p-3 text-xs text-slate-100 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-teal-200">
                      <Award className="h-4 w-4 text-teal-300" aria-hidden="true" />
                      <span>
                        {selectedQuizAnswer === currentDataset.quiz.correctIndex
                          ? "Brilliant! You got it."
                          : "Almost! Review the explanation:"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">
                      {currentDataset.quiz.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Callout to Full MindMap Workspace */}
          <div className="mt-6 border-t border-teal-100/[0.08] pt-4 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono text-[9.5px] uppercase tracking-wider">
                Want to analyze a raw manuscript?
              </span>
              <Link
                href="/mindmap"
                style={{ touchAction: "manipulation" }}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-teal-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <span>Upload PDF to MindMap</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
