"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
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
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paperParam = params.get("paper");
      if (paperParam && CIPHER_DATASETS.some((d) => d.id === paperParam)) {
        return paperParam;
      }
    }
    return "kras-g12d";
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nodeParam = params.get("node");
      if (nodeParam) {
        return nodeParam;
      }
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#04070a] text-slate-100">
      {/* TOP HEADER / INITIATIVE BANNER */}
      <header className="border-b border-teal-200/10 bg-[#070c14]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Initiative Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-400/[0.08] text-teal-300 shadow-[0_0_15px_rgba(77,141,255,0.25)]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                  Project Cipher
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/20 bg-teal-300/[0.06] px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-teal-200">
                  <Sparkles className="h-2.5 w-2.5 text-teal-300" />
                  NXT × BioLayers
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Making cancer research papers readable for students through interactive cause ➔ effect maps
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
                className="h-9 rounded-xl border border-teal-200/20 bg-[#0a121c] px-3 pr-8 text-xs font-semibold text-slate-200 focus:border-teal-400 focus:outline-none"
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
                className="group flex h-9 items-center gap-1.5 rounded-xl border border-teal-200/30 bg-teal-300/[0.1] px-3.5 text-xs font-bold text-teal-100 hover:border-teal-200/50 hover:bg-teal-300/[0.2] transition"
              >
                <Zap className="h-3.5 w-3.5 text-teal-300 transition-transform group-hover:scale-110" />
                <span>Guided Tour</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-teal-200/25 bg-teal-300/[0.08] px-2.5 py-1 text-xs">
                <span className="font-mono text-[10px] text-teal-200">
                  Step {tourStepIndex + 1}/{currentDataset.tour.length}
                </span>
                <button
                  type="button"
                  onClick={prevTourStep}
                  disabled={tourStepIndex === 0}
                  className="rounded px-1.5 py-0.5 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                  title="Previous Step"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={nextTourStep}
                  className="rounded px-1.5 py-0.5 text-teal-200 hover:bg-white/10"
                  title="Next Step"
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={stopTour}
                  className="ml-1 text-[10px] text-slate-400 hover:text-white"
                  title="Exit Tour"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Share Link Button */}
            <button
              type="button"
              onClick={copyShareLink}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-300 hover:text-white transition"
              title="Share Pathway Link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SUB-BAR: QUICK FILTERS, LAYER BREADCRUMB, & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-200/10 bg-[#060a10]/90 px-4 py-2 text-xs sm:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mr-1">
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
              className={`rounded-lg px-2.5 py-1 font-mono text-[10px] transition ${
                activeFilter === pill.id
                  ? "border border-teal-300/40 bg-teal-300/[0.15] font-bold text-teal-100"
                  : "border border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search genes, proteins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 w-full rounded-lg border border-white/10 bg-[#091018] pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-teal-400 focus:outline-none"
          />
        </div>
      </div>

      {/* MAIN BODY: SPLIT VIEW (CANVAS + CIPHER DECODER) */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">
        {/* LEFT/CENTER: INTERACTIVE CANVAS */}
        <div className="relative flex flex-col p-4">
          <div className="relative flex-1 min-h-[460px] lg:min-h-full">
            <CipherNetworkCanvas
              nodes={displayedNodes}
              edges={currentDataset.edges}
              selectedNodeId={selectedNodeId}
              activeFilter={activeFilter}
              onSelectNode={setSelectedNodeId}
            />
          </div>

          {/* Canvas Bottom Instruction Strip */}
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Click any node to trace upstream triggers & downstream effects</span>
            <span>Eco Mode available for low-power devices · Camera auto-focuses on selection</span>
          </div>
        </div>

        {/* RIGHT PANEL: CIPHER STUDENT DECODER */}
        <aside className="border-t border-teal-200/10 bg-[#070c14]/95 p-5 backdrop-blur-2xl lg:border-t-0 lg:border-l flex flex-col justify-between overflow-y-auto max-h-[85vh] lg:max-h-none">
          <div className="space-y-5">
            {/* Decoder Header & Mode Switcher */}
            <div className="flex items-center justify-between border-b border-teal-100/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-300" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-100">
                  Cipher Decoder
                </span>
              </div>

              {/* Mode Toggle: Plain English vs Academic Excerpt */}
              <div className="flex rounded-lg border border-teal-200/20 bg-[#04080e] p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setDecoderMode("plain")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                    decoderMode === "plain"
                      ? "bg-teal-400/[0.18] font-bold text-teal-200"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GraduationCap className="h-3 w-3" />
                  <span>Student View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecoderMode("academic")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                    decoderMode === "academic"
                      ? "bg-teal-400/[0.18] font-bold text-teal-200"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Microscope className="h-3 w-3" />
                  <span>Paper Excerpt</span>
                </button>
              </div>
            </div>

            {/* Visual Causal Domino Pipeline Indicator */}
            {activeNode && (
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2 text-[10px] font-mono">
                <div
                  className={`flex items-center gap-1 ${
                    activeNode.category === "trigger"
                      ? "font-bold text-rose-300"
                      : "text-slate-500"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>1. Trigger</span>
                </div>
                <span className="text-slate-600">➔</span>
                <div
                  className={`flex items-center gap-1 ${
                    activeNode.category === "mechanism"
                      ? "font-bold text-cyan-300"
                      : "text-slate-500"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>2. Relay</span>
                </div>
                <span className="text-slate-600">➔</span>
                <div
                  className={`flex items-center gap-1 ${
                    activeNode.category === "effect"
                      ? "font-bold text-purple-300"
                      : "text-slate-500"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>3. Cancer Growth</span>
                </div>
                <span className="text-slate-600">➔</span>
                <div
                  className={`flex items-center gap-1 ${
                    activeNode.category === "therapy"
                      ? "font-bold text-emerald-300"
                      : "text-slate-500"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>4. Therapy</span>
                </div>
              </div>
            )}

            {/* Guided Tour Step Card (if tour active) */}
            {tourStepIndex !== null && currentDataset.tour[tourStepIndex] && (
              <div className="rounded-xl border border-teal-300/30 bg-teal-400/[0.06] p-3.5 shadow-[0_0_20px_rgba(77,141,255,0.12)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-teal-300">
                    {currentDataset.tour[tourStepIndex].title}
                  </span>
                  <span className="rounded-full bg-teal-300/20 px-2 py-0.5 font-mono text-[8px] text-teal-200">
                    Step {tourStepIndex + 1} of {currentDataset.tour.length}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-200">
                  {currentDataset.tour[tourStepIndex].concept}
                </p>
                {currentDataset.tour[tourStepIndex].questionPrompt && (
                  <div className="mt-2.5 rounded-lg border border-teal-200/15 bg-[#0a141f] p-2 text-[11px] text-teal-200/90 font-medium">
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
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${
                          activeNode.category === "trigger"
                            ? "border border-rose-400/30 bg-rose-400/10 text-rose-300"
                            : activeNode.category === "mechanism"
                            ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                            : activeNode.category === "effect"
                            ? "border border-purple-400/30 bg-purple-400/10 text-purple-300"
                            : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {activeNode.category.toUpperCase()}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500">
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
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-slate-400 hover:text-teal-300 transition"
                      title="Listen to Pronunciation & Summary"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
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
              <div className="rounded-2xl border border-teal-200/20 bg-[#08111a]/80 p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Student Self-Check</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-white">
                  {currentDataset.quiz.question}
                </p>

                <div className="mt-3 space-y-1.5">
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
                        className={`w-full text-left rounded-lg border p-2 text-xs transition ${
                          showQuizResult
                            ? isCorrect
                              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 font-bold"
                              : isSelected
                              ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                              : "border-white/5 bg-white/[0.02] text-slate-400"
                            : isSelected
                            ? "border-teal-400/50 bg-teal-400/15 text-teal-200"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] opacity-60">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showQuizResult && (
                  <div className="mt-3 rounded-lg border border-teal-200/20 bg-teal-400/[0.06] p-2.5 text-xs text-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-teal-300">
                      <Award className="h-3.5 w-3.5" />
                      <span>
                        {selectedQuizAnswer === currentDataset.quiz.correctIndex
                          ? "Brilliant! You got it."
                          : "Almost! Review the explanation:"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                      {currentDataset.quiz.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Callout to Full MindMap Workspace */}
          <div className="mt-6 border-t border-teal-100/[0.06] pt-4 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono text-[9px] uppercase">
                Want to analyze a raw manuscript?
              </span>
              <Link
                href="/mindmap"
                className="inline-flex items-center gap-1 font-bold text-teal-300 hover:text-teal-100"
              >
                <span>Upload PDF to MindMap</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
