"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import {
  MarkerType,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  buildGraphFromText,
  type EntityType,
} from "../lib/buildGraphFromText";

import type {
  ApiGraphResponse,
  EvidencePaperAssessment,
  EvidenceSummary,
  ResearchEdgeData,
  ResearchEntityData,
} from "../lib/researchGraph";

import { layoutGraph } from "../lib/layoutGraph";
import dynamic from "next/dynamic";
import WorkspaceReveal from "../components/workspace/WorkspaceReveal";
import LivingWorkspaceAtmosphere from "../components/workspace/LivingWorkspaceAtmosphere";
import type { WorkspaceFlowInstance } from "../components/workspace/WorkspaceCanvas";
import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import GraphWorkspaceControls from "../components/workspace/GraphWorkspaceControls";
import FocusExpandControls from "../components/workspace/FocusExpandControls";
import MobileWorkspaceControls from "../components/workspace/MobileWorkspaceControls";
import InspectorSidebar from "../components/workspace/InspectorSidebar";
import usePubMed, {
  type PubMedPaper,
} from "../hooks/usePubMed";
import useWorkspace from "../hooks/useWorkspace";
import useCellOntology, {
  type CellOntologyTerm,
} from "../hooks/useCellOntology";
import type { BiologicalPathResult } from "../components/workspace/ConnectBiologyPanel";
import type { EvidenceLensMode } from "../components/workspace/EvidenceLensPanel";

const CellAtlasPanel = dynamic(() => import("../components/workspace/CellAtlasPanel"), { ssr: false });
const PubMedPanel = dynamic(() => import("../components/workspace/PubMedPanel"), { ssr: false });
const EvidencePanel = dynamic(() => import("../components/workspace/EvidencePanel"), { ssr: false });
const InspectorPanel = dynamic(() => import("../components/workspace/InspectorPanel"), { ssr: false });
const EdgeInspectorPanel = dynamic(() => import("../components/workspace/EdgeInspectorPanel"), { ssr: false });
const CopilotPanel = dynamic(() => import("../components/workspace/CopilotPanel"), { ssr: false });
const PaperInspectorPanel = dynamic(() => import("../components/workspace/PaperInspectorPanel"), { ssr: false });
const NarrativeOverlay = dynamic(() => import("../components/workspace/NarrativeOverlay"), { ssr: false });
const DemoModeOverlay = dynamic(() => import("../components/workspace/DemoModeOverlay"), { ssr: false });
const ProjectSidebar = dynamic(() => import("../components/workspace/ProjectSidebar"), { ssr: false });
const TimelinePanel = dynamic(() => import("../components/workspace/TimelinePanel"), { ssr: false });
const ConnectBiologyPanel = dynamic(() => import("../components/workspace/ConnectBiologyPanel"), { ssr: false });
const EvidenceLensPanel = dynamic(() => import("../components/workspace/EvidenceLensPanel"), { ssr: false });
const HypothesisBuilderPanel = dynamic(() => import("../components/workspace/HypothesisBuilderPanel"), { ssr: false });
const WorkspaceCanvas = dynamic(() => import("../components/workspace/WorkspaceCanvas"), { ssr: false });

import {
  deleteBioLayersProject,
  hasSavedBioLayersProject,
  loadBioLayersProject,
  saveBioLayersProject,
} from "../lib/projectStorage";



type LayerState = Record<EntityType, boolean>;
type LayoutDirection = "TB" | "LR";

type GenerationMode =
  | "loading"
  | "ai"
  | "fallback"
  | "saved"
  | "error";

type EntityNodeType = Node<ResearchEntityData, "entity">;
type FlowInstance = WorkspaceFlowInstance;


type RelatedConnection = {
  nodeId: string;
  label: string;
  type: EntityType;
  relation: string;
  direction: "incoming" | "outgoing";
};

type WorkspaceView =
  | "graph"
  | "evidence"
  | "citations"
  | "timeline"
  | "cells"
  | "pubmed";

type NarrativeStep = {
  id: string;
  nodeId: string;
  edgeId: string | null;
  title: string;
  relation: string;
  explanation: string;
};

type DemoScene =
  | "problem"
  | "mechanism"
  | "evidence"
  | "cells"
  | "vision";

type CopilotMode =
  | "explain"
  | "mechanism"
  | "hypothesis"
  | "limitations"
  | "simplify"
  | "custom";

type CopilotCitation = {
  pmid: string;
  title: string;
  support: string;
};

type CopilotResponse = {
  title: string;
  answer: string;
  keyPoints: string[];
  limitations: string[];
  followUpQuestions: string[];
  citations: CopilotCitation[];
  error?: string;
};

type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  keyPoints?: string[];
  limitations?: string[];
  followUpQuestions?: string[];
  citations?: CopilotCitation[];
};

type EvidenceLevel =
  | "No evidence"
  | "Limited"
  | "Moderate"
  | "Strong";

type EvidenceProfile = {
  level: EvidenceLevel;
  score: number;
  description: string;
  badgeClass: string;
  meterClass: string;
};

function getEvidenceProfile(
  paperCount: number,
  loading = false,
  hasError = false,
  summary?: EvidenceSummary,
): EvidenceProfile {
  /*
    Once PubMed papers have been classified, the evidence
    profile must come from the classification result — never
    from retrieval volume.
  */
  if (
    summary &&
    summary.analyzed > 0
  ) {
    if (
      summary.strength === "strong"
    ) {
      return {
        level: "Strong",
        score: 92,
        description:
          `${summary.supporting} supporting, ${summary.contextual} contextual, ` +
          `${summary.contradicting} contradicting and ${summary.unrelated} unrelated ` +
          `publication${summary.analyzed === 1 ? "" : "s"} were classified.`,
        badgeClass:
          "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200",
        meterClass:
          "from-emerald-300 via-teal-300 to-sky-300",
      };
    }

    if (
      summary.strength === "moderate"
    ) {
      return {
        level: "Moderate",
        score: 72,
        description:
          `${summary.supporting} supporting, ${summary.contextual} contextual and ` +
          `${summary.contradicting} contradicting publication${
            summary.analyzed === 1 ? "" : "s"
          } were classified.`,
        badgeClass:
          "border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-200",
        meterClass:
          "from-teal-300 via-cyan-300 to-sky-300",
      };
    }

    if (
      summary.strength === "limited"
    ) {
      return {
        level: "Limited",
        score: 48,
        description:
          `The Evidence Engine found ${summary.supporting} direct supporting ` +
          `publication${summary.supporting === 1 ? "" : "s"} among ${summary.analyzed} analyzed records.`,
        badgeClass:
          "border-amber-300/20 bg-amber-300/[0.07] text-amber-200",
        meterClass:
          "from-amber-300 via-teal-300 to-sky-300",
      };
    }

    return {
      level: "No evidence",
      score: 20,
      description:
        `${summary.analyzed} publications were classified, but none currently establish direct support strongly enough to raise the aggregate evidence level.`,
      badgeClass:
        "border-slate-300/15 bg-slate-300/[0.05] text-slate-200",
      meterClass:
        "from-slate-500 via-slate-400 to-teal-300",
    };
  }

  if (loading) {
    return {
      level: "Limited",
      score: 20,
      description:
        "Candidate literature is currently being retrieved from PubMed.",
      badgeClass:
        "border-slate-300/15 bg-slate-300/[0.05] text-slate-200",
      meterClass:
        "from-slate-500 via-teal-300 to-sky-300",
    };
  }

  if (hasError) {
    return {
      level: "No evidence",
      score: 8,
      description:
        "PubMed retrieval failed. Evidence status has not been assessed.",
      badgeClass:
        "border-rose-300/15 bg-rose-300/[0.05] text-rose-200",
      meterClass:
        "from-rose-300 via-orange-300 to-amber-300",
    };
  }

  if (paperCount <= 0) {
    return {
      level: "No evidence",
      score: 8,
      description:
        "No candidate PubMed publications are currently loaded. This does not prove that the biological relationship lacks evidence.",
      badgeClass:
        "border-slate-300/15 bg-slate-300/[0.05] text-slate-200",
      meterClass:
        "from-slate-500 via-slate-400 to-teal-300",
    };
  }

  return {
    level: "Limited",
    score: 42,
    description:
      `${paperCount} candidate PubMed publication${
        paperCount === 1 ? "" : "s"
      } ${paperCount === 1 ? "is" : "are"} currently loaded. ` +
      "These records are candidates until the Evidence Engine classifies their abstracts.",
    badgeClass:
      "border-amber-300/15 bg-amber-300/[0.06] text-amber-200",
    meterClass:
      "from-amber-300 via-teal-300 to-sky-300",
  };
}

const nodeClassNames: Record<EntityType, string> = {
  cell: "bg-teal-400",
  protein: "bg-violet-400",
  gene: "bg-emerald-400",
  drug: "bg-orange-400",
  pathway: "bg-amber-400",
  process: "bg-blue-400",
  disease: "bg-rose-400",
};






function convertApiGraphToFlowGraph(
  graph: ApiGraphResponse,
) {
  const nodes: EntityNodeType[] =
    graph.entities.map((entity) => ({
      id: entity.id,
      type: "entity",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        label: entity.label,
        type: entity.type,
        description: entity.description,
        aliases: entity.aliases,
        confidence: entity.confidence,
        evidenceQuote:
          entity.evidenceQuote,
      },
    }));

  const validNodeIds = new Set(
    nodes.map((node) => node.id),
  );

  const edges: Edge<ResearchEdgeData>[] =
    graph.relations
      .filter(
        (relation) =>
          validNodeIds.has(
            relation.source,
          ) &&
          validNodeIds.has(
            relation.target,
          ) &&
          relation.source !==
            relation.target,
      )
      .map((relation, index) => ({
        id: `${relation.source}-${relation.target}-${index}`,
        source: relation.source,
        target: relation.target,
        label: relation.label,
        type: "biological",
        data: {
          relationType:
            relation.relationType,
          description:
            relation.description,
          confidence:
            relation.confidence,
          evidenceQuote:
            relation.evidenceQuote,
          directionality:
            relation.directionality,
        },
      }));

  return {
    nodes,
    edges,
  };
}


function quotePubMedTerm(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const cleaned = value
    .trim()
    .replace(/"/g, "");

  if (!cleaned) {
    return "";
  }

  return `"${cleaned}"`;
}

function buildEdgePubMedQuery({
  source,
  relation,
  target,
}: {
  source?: string | null;
  relation?: string | null;
  target?: string | null;
}) {
  const sourceTerm = quotePubMedTerm(source);
  const targetTerm = quotePubMedTerm(target);

  const relationTerm = relation
    ?.trim()
    .replace(/[_-]+/g, " ")
    .replace(/"/g, "");

  if (!sourceTerm || !targetTerm) {
    return "";
  }

  const baseQuery = `${sourceTerm} AND ${targetTerm}`;

  if (!relationTerm || relationTerm === "connected to") {
    return baseQuery;
  }

  return baseQuery;
}

export default function ExplorePage() {
  const reduceMotion = Boolean(useReducedMotion());

  const [showWorkspaceReveal, setShowWorkspaceReveal] =
    useState(true);

  const graphContainerRef =
    useRef<HTMLDivElement | null>(null);

  const {
    workspaceView,
    setWorkspaceView,
    cinematicFocus,
    setCinematicFocus,
    selectedId,
    setSelectedId,
    selectedEdgeId,
    setSelectedEdgeId,
    hoveredId,
    setHoveredId,
  } = useWorkspace();

  const {
    cellQuery,
    setCellQuery,
    cellTerms,
    cellTotal,
    cellPage,
    cellHasMore,
    cellLoading,
    cellError,
    setCellError,
    cellScope,
    setCellScope,
    selectedAtlasTerm,
    setSelectedAtlasTerm,
    favoriteCellIds,
    toggleFavoriteCell,
    openCellAtlasTerm,
    searchCellPreset,
    runCellSearch,
  } = useCellOntology();

  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(50);

  const cursorSpringX = useSpring(
    cursorX,
    reduceMotion
      ? { duration: 0 }
      : {
          stiffness: 90,
          damping: 24,
          mass: 0.55,
        },
  );

  const cursorSpringY = useSpring(
    cursorY,
    reduceMotion
      ? { duration: 0 }
      : {
          stiffness: 90,
          damping: 24,
          mass: 0.55,
        },
  );

  const [demoMode, setDemoMode] =
    useState(false);

  const [narrativeOpen, setNarrativeOpen] =
    useState(false);

  const [narrativePlaying, setNarrativePlaying] =
    useState(false);

  const [narrativeIndex, setNarrativeIndex] =
    useState(0);

  const [demoScene, setDemoScene] =
    useState<DemoScene>("mechanism");

  const narrativeTimerRef =
    useRef<number | null>(null);

  const [sourceText, setSourceText] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchError, setSearchError] =
    useState("");

  const [layoutDirection, setLayoutDirection] =
    useState<LayoutDirection>("TB");

  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("loading");

  const [
    generationMessage,
    setGenerationMessage,
  ] = useState(
    "Analyzing research paragraph...",
  );

  const [apiError, setApiError] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState("");

  const [exportMenuOpen, setExportMenuOpen] =
    useState(false);

  const [expandingGraph, setExpandingGraph] =
    useState(false);

  const [hasSavedProject, setHasSavedProject] =
    useState<boolean>(() =>
      hasSavedBioLayersProject(),
    );

  const [saveMessage, setSaveMessage] =
    useState("");

  const [flowInstance, setFlowInstance] =
    useState<FlowInstance | null>(null);

  const [copilotOpen, setCopilotOpen] =
    useState(false);

  const [copilotMode, setCopilotMode] =
    useState<CopilotMode>("explain");

  const [copilotQuestion, setCopilotQuestion] =
    useState("");

  const [copilotLoading, setCopilotLoading] =
    useState(false);

  const [copilotError, setCopilotError] =
    useState("");

  const [copilotMessages, setCopilotMessages] =
    useState<CopilotMessage[]>([]);

  const [connectBiologyOpen, setConnectBiologyOpen] =
    useState(false);

  const [activeMechanisticPath, setActiveMechanisticPath] =
    useState<BiologicalPathResult | null>(null);

  const [evidenceLensOpen, setEvidenceLensOpen] =
    useState(false);

  const [evidenceLensMode, setEvidenceLensMode] =
    useState<EvidenceLensMode>("all");

  const [hypothesisBuilderOpen, setHypothesisBuilderOpen] =
    useState(false);



  const [selectedPaper, setSelectedPaper] =
    useState<PubMedPaper | null>(null);

  const [paperCopyMessage, setPaperCopyMessage] =
    useState("");

  const [nodes, setNodes, onNodesChange] =
    useNodesState<EntityNodeType>([]);

  const [edges, setEdges] =
    useState<Edge<ResearchEdgeData>[]>([]);

  const [layers, setLayers] =
    useState<LayerState>({
      cell: true,
      protein: true,
      pathway: true,
      process: true,
      disease: true,
      gene: true,
drug: true,
    });

  useEffect(() => {
    const controller = new AbortController();

    async function generateGraph() {
      const savedText =
        sessionStorage.getItem(
          "biolayers-input",
        ) ??
        "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and ECM remodeling.";

      setSourceText(savedText);
      setGenerationMode("loading");
      setGenerationMessage(
        "Analyzing research paragraph...",
      );
      setApiError("");

      const openAiEnabled =
        process.env
          .NEXT_PUBLIC_ENABLE_OPENAI ===
        "true";

      if (!openAiEnabled) {
        const fallbackGraph =
          buildGraphFromText(savedText);

        const layoutedFallback =
          layoutGraph(
            fallbackGraph.nodes,
            fallbackGraph.edges,
            "TB",
          );

        setNodes(
          layoutedFallback.nodes as EntityNodeType[],
        );
        setEdges(layoutedFallback.edges);

        if (
          layoutedFallback.nodes.length > 0
        ) {
          setSelectedId(
            layoutedFallback.nodes[0].id,
          );
        }

        setGenerationMode("fallback");
        setGenerationMessage(
          "Local analysis mode",
        );

        return;
      }

      try {
        const response = await fetch(
          "/api/generate-graph",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              text: savedText,
            }),
            signal: controller.signal,
          },
        );

        const result =
          (await response.json()) as ApiGraphResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "The AI graph request failed.",
          );
        }

        if (
          !Array.isArray(result.entities) ||
          result.entities.length < 2
        ) {
          throw new Error(
            "The AI did not return enough biological entities.",
          );
        }

        setGenerationMessage(
          "Building the interactive graph...",
        );

        const flowGraph =
          convertApiGraphToFlowGraph(result);

        const layoutedGraph = layoutGraph(
          flowGraph.nodes,
          flowGraph.edges,
          "TB",
        );

        setNodes(
          layoutedGraph.nodes as EntityNodeType[],
        );
        setEdges(layoutedGraph.edges);

        if (layoutedGraph.nodes.length > 0) {
          setSelectedId(
            layoutedGraph.nodes[0].id,
          );
        }

        setGenerationMode("ai");
        setGenerationMessage(
          "AI-generated knowledge graph",
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "AI generation failed.";

        setApiError(message);

        const fallbackGraph =
          buildGraphFromText(savedText);

        const layoutedFallback =
          layoutGraph(
            fallbackGraph.nodes,
            fallbackGraph.edges,
            "TB",
          );

        setNodes(
          layoutedFallback.nodes as EntityNodeType[],
        );
        setEdges(layoutedFallback.edges);

        if (
          layoutedFallback.nodes.length > 0
        ) {
          setSelectedId(
            layoutedFallback.nodes[0].id,
          );
        }

        setGenerationMode("fallback");
        setGenerationMessage(
          "Local knowledge graph",
        );
      }
    }

    void generateGraph();

    return () => {
      controller.abort();
    };
  }, [setNodes]);

  useEffect(() => {
    if (
      !flowInstance ||
      nodes.length === 0 ||
      generationMode === "loading"
    ) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        void flowInstance.fitView({
          padding: 0.12,
          minZoom: 0.52,
          maxZoom: 1.24,
          duration: 600,
        });
      },
      120,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    flowInstance,
    nodes.length,
    generationMode,
  ]);

  const visibleNodes = useMemo(() => {
    return nodes.filter(
      (node) => layers[node.data.type],
    );
  }, [nodes, layers]);

  const visibleNodeIds = useMemo(() => {
    return new Set(
      visibleNodes.map((node) => node.id),
    );
  }, [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) &&
        visibleNodeIds.has(edge.target),
    );
  }, [edges, visibleNodeIds]);

  const connectedNodeIds = useMemo(() => {
    if (!hoveredId) {
      return new Set<string>();
    }

    const relatedIds = new Set<string>([
      hoveredId,
    ]);

    visibleEdges.forEach((edge) => {
      if (edge.source === hoveredId) {
        relatedIds.add(edge.target);
      }

      if (edge.target === hoveredId) {
        relatedIds.add(edge.source);
      }
    });

    return relatedIds;
  }, [hoveredId, visibleEdges]);

  const mechanisticPathNodeIds = useMemo(
    () =>
      new Set(
        activeMechanisticPath?.nodes.map(
          (item) => item.nodeId,
        ) ?? [],
      ),
    [activeMechanisticPath],
  );

  const mechanisticPathEdgeIds = useMemo(
    () =>
      new Set(
        activeMechanisticPath?.edges.map(
          (item) => item.edgeId,
        ) ?? [],
      ),
    [activeMechanisticPath],
  );

  const displayNodes = useMemo(() => {
    return visibleNodes.map((node) => {
      const isRelated =
        !hoveredId ||
        connectedNodeIds.has(node.id);

      const pathActive =
        mechanisticPathNodeIds.size > 0;

      const onMechanisticPath =
        mechanisticPathNodeIds.has(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          opacity: pathActive
            ? onMechanisticPath
              ? 1
              : 0.1
            : isRelated
              ? 1
              : 0.22,
          filter:
            pathActive && onMechanisticPath
              ? "drop-shadow(0 0 16px rgba(77,141,255,.20))"
              : undefined,
          transition:
            "opacity 180ms ease, filter 180ms ease",
        },
      };
    });
  }, [
    visibleNodes,
    hoveredId,
    connectedNodeIds,
    mechanisticPathNodeIds,
    cinematicFocus,
    narrativeOpen,
    demoMode,
  ]);

  const {
    selectedNode,
    selectedEdge,
    selectedEdgeSource,
    selectedEdgeTarget,
  } = useMemo(() => {
    const node = nodes.find(
      (item) => item.id === selectedId,
    );

    const edge = edges.find(
      (item) => item.id === selectedEdgeId,
    );

    return {
      selectedNode: node,
      selectedEdge: edge,
      selectedEdgeSource: edge
        ? nodes.find(
            (item) => item.id === edge.source,
          )
        : undefined,
      selectedEdgeTarget: edge
        ? nodes.find(
            (item) => item.id === edge.target,
          )
        : undefined,
    };
  }, [
    nodes,
    edges,
    selectedId,
    selectedEdgeId,
  ]);

  const selectedEdgeLabel =
    selectedEdge &&
    typeof selectedEdge.label === "string"
      ? selectedEdge.label
      : "connected to";

  const edgePubMedQuery = useMemo(() => {
    if (
      !selectedEdge ||
      !selectedEdgeSource ||
      !selectedEdgeTarget
    ) {
      return "";
    }

    return buildEdgePubMedQuery({
      source: selectedEdgeSource.data.label,
      relation: selectedEdgeLabel,
      target: selectedEdgeTarget.data.label,
    });
  }, [
    selectedEdge,
    selectedEdgeSource,
    selectedEdgeTarget,
    selectedEdgeLabel,
  ]);

  const selectedEntity: ResearchEntityData =
    selectedNode
      ? selectedNode.data
      : {
          label: "Nothing selected",
          type: "process",
          description:
            "Click a node in the graph to inspect its biological role.",
          aliases: [],
          confidence: undefined,
          evidenceQuote: "",
        };

  const {
    pubMedPapers,
    pubMedLoading,
    pubMedError,
    pubMedTotal,
    pubMedPage,
    pubMedHasMore,
    pubMedSort,
    setPubMedSort,
    pubMedLoadingMore,
    comparedPapers,
    setComparedPapers,
    loadMorePubMed,
    togglePaperComparison,
  } = usePubMed({
    selectedLabel: selectedNode?.data.label,
    searchQuery: selectedEdgeId
      ? edgePubMedQuery
      : null,
  });

  useEffect(() => {
    if (!selectedEdgeId || pubMedLoading) {
      return;
    }

    setEdges((current) => {
      let changed = false;

      const next = current.map((edge) => {
        if (edge.id !== selectedEdgeId) {
          return edge;
        }

        if (
          edge.data?.evidenceCount ===
          pubMedPapers.length
        ) {
          return edge;
        }

        changed = true;

        return {
          ...edge,
          data: {
            ...(edge.data ?? {}),
            evidenceCount: pubMedPapers.length,
          },
        };
      });

      return changed ? next : current;
    });
  }, [
    selectedEdgeId,
    pubMedPapers.length,
    pubMedLoading,
  ]);

  function handleEvidenceAnalyzed(result: {
    assessments:
      EvidencePaperAssessment[];

    summary:
      EvidenceSummary;

    limitations:
      string[];

    provider:
      string;

    model:
      string;

    analyzedAt:
      string;
  }) {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((current) =>
      current.map((edge) => {
        if (
          edge.id !==
          selectedEdgeId
        ) {
          return edge;
        }

        return {
          ...edge,

          data: {
            ...(edge.data ?? {}),

            evidenceCount:
              result.summary
                .totalCandidates,

            literatureQuery:
              edgePubMedQuery,

            paperAssessments:
              result.assessments.map(
                (assessment) => ({
                  ...assessment,
                  analyzedAt:
                    result.analyzedAt,
                }),
              ),

            evidenceSummary:
              result.summary,

            evidenceAnalyzedAt:
              result.analyzedAt,
          },
        };
      }),
    );
  }

  function getEdgeEvidenceLevel(
    edge: Edge<ResearchEdgeData>,
  ): Exclude<EvidenceLensMode, "all"> {
    const summary =
      edge.data?.evidenceSummary;

    if (
      summary &&
      summary.analyzed > 0
    ) {
      if (
        summary.strength === "strong"
      ) {
        return "established";
      }

      if (
        summary.strength === "moderate"
      ) {
        return "supported";
      }

      if (
        summary.strength === "limited"
      ) {
        return "emerging";
      }

      return "hypothesis";
    }

    /*
      Extraction confidence and candidate PubMed retrieval
      are not literature evidence. A quote from the submitted
      source can make an edge "emerging", but not established.
    */
    const hasSourceEvidence =
      typeof edge.data?.evidenceQuote ===
        "string" &&
      edge.data.evidenceQuote.trim().length >
        0;

    if (hasSourceEvidence) {
      return "emerging";
    }

    return "hypothesis";
  }

  const displayEdges = useMemo(() => {
    const pathActive =
      mechanisticPathEdgeIds.size > 0;

    return visibleEdges.map((edge) => {
      const isConnected =
        hoveredId === edge.source ||
        hoveredId === edge.target;

      const isSelected =
        selectedEdgeId === edge.id;

      const onMechanisticPath =
        mechanisticPathEdgeIds.has(edge.id);

      const evidenceLevel =
        getEdgeEvidenceLevel(edge);

      const passesEvidenceLens =
        evidenceLensMode === "all" ||
        evidenceLevel === evidenceLensMode;

      const shouldDim = pathActive
        ? !onMechanisticPath
        : !passesEvidenceLens ||
          (Boolean(hoveredId) &&
            !isConnected) ||
          (Boolean(selectedEdgeId) &&
            !isSelected);

      const highlighted =
        onMechanisticPath ||
        isConnected ||
        isSelected;

      return {
        ...edge,
        type: "biological",
        data: {
          ...(typeof edge.data === "object" &&
          edge.data !== null
            ? edge.data
            : {}),
          evidenceCount:
            typeof edge.data?.evidenceCount === "number"
              ? edge.data.evidenceCount
              : typeof edge.data?.evidenceQuote === "string" &&
                  edge.data.evidenceQuote.trim().length > 0
                ? 1
                : 0,
        },

        animated:
          onMechanisticPath ||
          (evidenceLensMode !== "all" &&
            passesEvidenceLens),

        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: onMechanisticPath
            ? "#4d8dff"
            : highlighted
              ? "#8db2ff"
              : "#64748b",
        },

        style: {
          stroke: onMechanisticPath
            ? "#4d8dff"
            : highlighted
              ? "#8db2ff"
              : "#64748b",
          strokeWidth: onMechanisticPath
            ? 4.4
            : isSelected
              ? 4.2
              : isConnected
                ? 3.4
                : 2.2,
          opacity: shouldDim
            ? evidenceLensMode !== "all" &&
              !passesEvidenceLens
              ? 0.025
              : 0.08
            : 1,
          cursor: "pointer",
          filter: onMechanisticPath
            ? "drop-shadow(0 0 7px rgba(77,141,255,.50))"
            : undefined,
        },

        labelStyle: {
          fill: onMechanisticPath
            ? "#dbe7ff"
            : highlighted
              ? "#d9bdfe"
              : "#94a3b8",
          fontSize:
            onMechanisticPath || isSelected
              ? 13
              : 12,
          fontWeight: 700,
        },

        labelBgStyle: {
          fill: "#070b10",
          fillOpacity: shouldDim
            ? 0.12
            : 0.94,
        },

        labelBgPadding: [6, 4] as [
          number,
          number,
        ],

        labelBgBorderRadius: 8,
      };
    });
  }, [
    visibleEdges,
    hoveredId,
    selectedEdgeId,
    mechanisticPathEdgeIds,
    evidenceLensMode,
  ]);

  const relatedConnections =
    useMemo<RelatedConnection[]>(() => {
      if (!selectedNode) {
        return [];
      }

      const related: RelatedConnection[] = [];

      visibleEdges.forEach((edge) => {
        if (edge.source === selectedNode.id) {
          const targetNode = nodes.find(
            (node) => node.id === edge.target,
          );

          if (targetNode) {
            related.push({
              nodeId: targetNode.id,
              label: targetNode.data.label,
              type: targetNode.data.type,
              relation:
                typeof edge.label === "string"
                  ? edge.label
                  : "connected to",
              direction: "outgoing",
            });
          }
        }

        if (edge.target === selectedNode.id) {
          const sourceNode = nodes.find(
            (node) => node.id === edge.source,
          );

          if (sourceNode) {
            related.push({
              nodeId: sourceNode.id,
              label: sourceNode.data.label,
              type: sourceNode.data.type,
              relation:
                typeof edge.label === "string"
                  ? edge.label
                  : "connected to",
              direction: "incoming",
            });
          }
        }
      });

      return related;
    }, [selectedNode, visibleEdges, nodes]);

  const narrativeSteps =
    useMemo<NarrativeStep[]>(() => {
      if (nodes.length === 0) {
        return [];
      }

      const nodeById = new Map(
        nodes.map((node) => [
          node.id,
          node,
        ]),
      );

      const outgoing = new Map<
        string,
        Edge[]
      >();

      for (const edge of edges) {
        const current =
          outgoing.get(edge.source) ?? [];

        current.push(edge);
        outgoing.set(
          edge.source,
          current,
        );
      }

      const startNode =
        nodes.find((node) =>
          node.data.label
            .toLowerCase()
            .includes("fibroblast"),
        ) ??
        nodes.find(
          (node) =>
            node.data.type === "cell",
        ) ??
        nodes[0];

      const steps: NarrativeStep[] = [];
      const visited = new Set<string>();
      let currentNodeId = startNode?.id;

      for (
        let index = 0;
        index < Math.min(
          nodes.length,
          7,
        );
        index += 1
      ) {
        if (!currentNodeId) {
          break;
        }

        const currentNode =
          nodeById.get(currentNodeId);

        if (
          !currentNode ||
          visited.has(currentNode.id)
        ) {
          break;
        }

        visited.add(currentNode.id);

        const outgoingEdge =
          (outgoing.get(
            currentNode.id,
          ) ?? []).find(
            (edge) =>
              !visited.has(edge.target),
          );

        const incomingEdge =
          edges.find(
            (edge) =>
              edge.target ===
                currentNode.id &&
              !visited.has(edge.source),
          );

        const nextEdge =
          outgoingEdge ?? incomingEdge;

        const relation =
          nextEdge &&
          typeof nextEdge.label ===
            "string"
            ? nextEdge.label
            : "biological role";

        steps.push({
          id: `narrative-${currentNode.id}-${index}`,
          nodeId: currentNode.id,
          edgeId:
            nextEdge?.id ?? null,
          title:
            currentNode.data.label,
          relation,
          explanation:
            currentNode.data.description ||
            `${currentNode.data.label} participates in the current biological mechanism.`,
        });

        if (!nextEdge) {
          break;
        }

        currentNodeId =
          nextEdge.source ===
          currentNode.id
            ? nextEdge.target
            : nextEdge.source;
      }

      return steps;
    }, [nodes, edges]);

  const activeNarrativeStep =
    narrativeSteps[
      Math.min(
        narrativeIndex,
        Math.max(
          narrativeSteps.length - 1,
          0,
        ),
      )
    ];

  useEffect(() => {
    if (
      !narrativePlaying ||
      narrativeSteps.length === 0
    ) {
      if (
        narrativeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          narrativeTimerRef.current,
        );
        narrativeTimerRef.current =
          null;
      }

      return;
    }

    narrativeTimerRef.current =
      window.setTimeout(() => {
        setNarrativeIndex(
          (current) => {
            if (
              current >=
              narrativeSteps.length - 1
            ) {
              setNarrativePlaying(
                false,
              );
              return current;
            }

            return current + 1;
          },
        );
      }, 4200);

    return () => {
      if (
        narrativeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          narrativeTimerRef.current,
        );
        narrativeTimerRef.current =
          null;
      }
    };
  }, [
    narrativePlaying,
    narrativeIndex,
    narrativeSteps.length,
  ]);

  useEffect(() => {
    if (
      !narrativeOpen ||
      !activeNarrativeStep
    ) {
      return;
    }

    const node = nodes.find(
      (item) =>
        item.id ===
        activeNarrativeStep.nodeId,
    );

    if (!node || !flowInstance) {
      return;
    }

    setSelectedId(node.id);
    setSelectedEdgeId(
      activeNarrativeStep.edgeId,
    );
    setHoveredId(node.id);
    setCinematicFocus(true);

    const width =
      node.measured?.width ?? 292;
    const height =
      node.measured?.height ?? 170;

    void flowInstance.setCenter(
      node.position.x + width / 2,
      node.position.y + height / 2,
      {
        zoom: demoMode
          ? 1.7
          : 1.5,
        duration: 1050,
      },
    );
  }, [
    narrativeOpen,
    narrativeIndex,
    activeNarrativeStep,
    nodes,
    flowInstance,
    demoMode,
  ]);

  useEffect(() => {
    return () => {
      if (
        narrativeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          narrativeTimerRef.current,
        );
      }
    };
  }, []);


  async function focusMechanisticPath(
    result: BiologicalPathResult,
  ) {
    setActiveMechanisticPath(result);
    setConnectBiologyOpen(false);
    setWorkspaceView("graph");
    setSelectedEdgeId(null);
    setHoveredId(null);
    setCinematicFocus(false);
    setNarrativeOpen(false);
    setNarrativePlaying(false);

    const pathNodes = result.nodes
      .map((item) =>
        nodes.find(
          (node) => node.id === item.nodeId,
        ),
      )
      .filter(
        (
          node,
        ): node is EntityNodeType =>
          Boolean(node),
      );

    if (pathNodes.length === 0) {
      return;
    }

    setSelectedId(pathNodes[0].id);

    if (!flowInstance) {
      return;
    }

    const centers = pathNodes.map((node) => ({
      x:
        node.position.x +
        (node.measured?.width ?? 220) / 2,
      y:
        node.position.y +
        (node.measured?.height ?? 100) / 2,
    }));

    const minX = Math.min(
      ...centers.map((item) => item.x),
    );
    const maxX = Math.max(
      ...centers.map((item) => item.x),
    );
    const minY = Math.min(
      ...centers.map((item) => item.y),
    );
    const maxY = Math.max(
      ...centers.map((item) => item.y),
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const span = Math.max(
      maxX - minX,
      maxY - minY,
    );

    const zoom =
      span < 320
        ? 1.25
        : span < 650
          ? 0.95
          : span < 1000
            ? 0.72
            : 0.55;

    await flowInstance.setCenter(
      centerX,
      centerY,
      {
        zoom,
        duration: 950,
      },
    );
  }

  async function clearMechanisticPath() {
    setActiveMechanisticPath(null);

    await flowInstance?.fitView({
      padding: 0.12,
      minZoom: 0.5,
      maxZoom: 1.22,
      duration: 700,
    });
  }

  async function focusNode(nodeId: string) {
    const targetNode = nodes.find(
      (node) => node.id === nodeId,
    );

    if (!targetNode || !flowInstance) {
      return;
    }

    setSelectedId(targetNode.id);
    setSelectedEdgeId(null);
    setHoveredId(null);

    const width =
      targetNode.measured?.width ?? 292;

    const height =
      targetNode.measured?.height ?? 230;

    await flowInstance.setCenter(
      targetNode.position.x + width / 2,
      targetNode.position.y + height / 2,
      {
        zoom: 1.35,
        duration: 650,
      },
    );
  }

  async function askCopilot(
    requestedMode: CopilotMode = copilotMode,
    questionOverride?: string,
  ) {
    if (!selectedNode) {
      setCopilotError(
        "Select an entity before asking BioLayers Copilot.",
      );
      setCopilotOpen(true);
      return;
    }

    const question =
      typeof questionOverride === "string"
        ? questionOverride.trim()
        : copilotQuestion.trim();

    if (
      requestedMode === "custom" &&
      question.length < 3
    ) {
      setCopilotError(
        "Enter a question containing at least 3 characters.",
      );
      setCopilotOpen(true);
      return;
    }

    setCopilotOpen(true);
    setCopilotLoading(true);
    setCopilotError("");

    const userText =
      requestedMode === "custom"
        ? question
        : {
            explain:
              "Explain this entity in the current cancer-biology context.",
            mechanism:
              "Describe the mechanism involving this entity.",
            hypothesis:
              "Generate one grounded, testable research hypothesis.",
            limitations:
              "Assess the limitations of the available evidence.",
            simplify:
              "Explain this entity in accurate, simple language.",
          }[requestedMode];

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
    };

    setCopilotMessages((current) => [
      ...current,
      userMessage,
    ]);

    try {
      const response = await fetch(
        "/api/copilot",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            mode: requestedMode,
            question,
            sourceText,
            selectedEntity: {
              id: selectedNode.id,
              label:
                selectedEntity.label,
              type:
                selectedEntity.type,
              description:
                selectedEntity.description,
              aliases:
                selectedEntity.aliases ?? [],
              confidence:
                selectedEntity.confidence,
              evidenceQuote:
                selectedEntity.evidenceQuote ?? "",
            },
            connections:
              relatedConnections,
            papers: pubMedPapers.slice(0, 8),
          }),
        },
      );

      const result =
        (await response.json()) as CopilotResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "BioLayers Copilot could not answer.",
        );
      }

      const assistantMessage: CopilotMessage =
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          title: result.title,
          content: result.answer,
          keyPoints: Array.isArray(
            result.keyPoints,
          )
            ? result.keyPoints
            : [],
          limitations: Array.isArray(
            result.limitations,
          )
            ? result.limitations
            : [],
          followUpQuestions:
            Array.isArray(
              result.followUpQuestions,
            )
              ? result.followUpQuestions
              : [],
          citations: Array.isArray(
            result.citations,
          )
            ? result.citations
            : [],
        };

      setCopilotMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setCopilotQuestion("");
      setCopilotMode(requestedMode);
    } catch (error) {
      setCopilotError(
        error instanceof Error
          ? error.message
          : "BioLayers Copilot could not answer.",
      );
    } finally {
      setCopilotLoading(false);
    }
  }

  async function addCellToGraph(
    term: CellOntologyTerm,
  ) {
    const nodeId =
      term.id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `cell-${Date.now()}`;

    const existing = nodes.find(
      (node) =>
        node.id === nodeId ||
        node.data.label.toLowerCase() ===
          term.label.toLowerCase(),
    );

    if (existing) {
      setWorkspaceView("graph");
      await focusNode(existing.id);
      return;
    }

    const anchorNode =
      selectedNode ?? nodes[0];

    const newNode: EntityNodeType = {
      id: nodeId,
      type: "entity",
      position: {
        x:
          (anchorNode?.position.x ??
            0) + 280,
        y:
          (anchorNode?.position.y ??
            0) + 120,
      },
      data: {
        label: term.label,
        type: "cell",
        description:
          term.description ||
          `${term.label} is a standardized class from ${term.ontologyLabel} (${term.id}).`,
        aliases: [],
        confidence: 1,
        evidenceQuote: "",
      },
    };

    setNodes((current) => [
      ...current,
      newNode,
    ]);

    /*
      Importing an ontology class establishes the node identity only.
      It must not create a biological relationship to the currently
      selected entity unless that relationship is supported separately.
    */

    setSelectedId(nodeId);
    setSelectedEdgeId(null);
    setWorkspaceView("graph");
  }

  function openPaperInspector(
    paper: PubMedPaper,
  ) {
    setSelectedPaper(paper);
    setPaperCopyMessage("");
  }

  async function copyPaperIdentifier(
    value: string,
    label: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setPaperCopyMessage(
        `${label} copied`,
      );

      window.setTimeout(() => {
        setPaperCopyMessage("");
      }, 1800);
    } catch {
      setPaperCopyMessage(
        `Could not copy ${label}`,
      );
    }
  }

  function startNarrative() {
    if (narrativeSteps.length === 0) {
      return;
    }

    setWorkspaceView("graph");
    setNarrativeIndex(0);
    setNarrativeOpen(true);
    setNarrativePlaying(true);
    setDemoScene("mechanism");
  }

  function pauseNarrative() {
    setNarrativePlaying(false);
  }

  function resumeNarrative() {
    if (
      narrativeSteps.length === 0
    ) {
      return;
    }

    if (
      narrativeIndex >=
      narrativeSteps.length - 1
    ) {
      setNarrativeIndex(0);
    }

    setNarrativePlaying(true);
  }

  function nextNarrativeStep() {
    setNarrativePlaying(false);
    setNarrativeIndex(
      (current) =>
        Math.min(
          current + 1,
          Math.max(
            narrativeSteps.length - 1,
            0,
          ),
        ),
    );
  }

  function previousNarrativeStep() {
    setNarrativePlaying(false);
    setNarrativeIndex(
      (current) =>
        Math.max(current - 1, 0),
    );
  }

  function restartNarrative() {
    setNarrativeIndex(0);
    setNarrativePlaying(true);
  }

  async function closeNarrative() {
    setNarrativePlaying(false);
    setNarrativeOpen(false);
    setSelectedEdgeId(null);
    setHoveredId(null);
    setCinematicFocus(false);

    await flowInstance?.fitView({
      padding: 0.12,
      minZoom: 0.5,
      maxZoom: 1.22,
      duration: 850,
    });
  }

  async function toggleDemoMode() {
    const next = !demoMode;

    setDemoMode(next);

    if (next) {
      setWorkspaceView("graph");

      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      await flowInstance?.fitView({
        padding: 0.16,
        minZoom: 0.42,
        maxZoom: 1.2,
        duration: 850,
      });
    }
  }

  function activateDemoScene(
    scene: DemoScene,
  ) {
    setDemoScene(scene);

    if (scene === "problem") {
      setWorkspaceView("pubmed");
      setNarrativePlaying(false);
      return;
    }

    if (scene === "mechanism") {
      startNarrative();
      return;
    }

    if (scene === "evidence") {
      setWorkspaceView("evidence");
      setNarrativePlaying(false);
      return;
    }

    if (scene === "cells") {
      setWorkspaceView("cells");
      setNarrativePlaying(false);
      return;
    }

    setWorkspaceView("graph");
    setNarrativePlaying(false);
    setNarrativeOpen(false);
  }

  async function enterCinematicFocus() {
    if (!selectedNode || !flowInstance) {
      return;
    }

    setCinematicFocus(true);
    setSelectedEdgeId(null);
    setHoveredId(selectedNode.id);

    const width =
      selectedNode.measured?.width ??
      244;

    const height =
      selectedNode.measured?.height ??
      170;

    await flowInstance.setCenter(
      selectedNode.position.x +
        width / 2,
      selectedNode.position.y +
        height / 2,
      {
        zoom: 1.65,
        duration: 1200,
      },
    );
  }

  async function exitCinematicFocus() {
    setCinematicFocus(false);
    setHoveredId(null);

    await flowInstance?.fitView({
      padding: 0.12,
      minZoom: 0.5,
      maxZoom: 1.22,
      duration: 950,
    });
  }

  function toggleLayer(type: EntityType) {
    setLayers((currentLayers) => ({
      ...currentLayers,
      [type]: !currentLayers[type],
    }));
  }

  function saveCurrentProject() {
    if (nodes.length === 0) {
      setSaveMessage(
        "There is no graph to save.",
      );
      return;
    }

    saveBioLayersProject({
      version: 1,
      name: `BioLayers project — ${new Date().toLocaleDateString()}`,
      sourceText,
      nodes,
      edges,
      layers,
      layoutDirection,
      selectedId: selectedId ?? "",
      savedAt: new Date().toISOString(),
    });

    setHasSavedProject(true);
    setSaveMessage("Project saved.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  }

  async function restoreSavedProject() {
    const project = loadBioLayersProject();

    if (!project) {
      setSaveMessage(
        "No valid saved project was found.",
      );
      return;
    }

    setHoveredId(null);
    setSelectedEdgeId(null);
    setSourceText(project.sourceText);
    setNodes(
      project.nodes as EntityNodeType[],
    );
    setEdges(project.edges);
    setLayers(project.layers);
    setLayoutDirection(
      project.layoutDirection,
    );
    setSelectedId(project.selectedId);

    sessionStorage.setItem(
      "biolayers-input",
      project.sourceText,
    );

    setGenerationMode("saved");
    setGenerationMessage(
      "Restored saved project",
    );
    setApiError("");
    setSaveMessage("Project restored.");

    await new Promise((resolve) =>
      setTimeout(resolve, 120),
    );

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.4,
      maxZoom: 1.15,
      duration: 650,
    });
  }

  function deleteSavedProject() {
    deleteBioLayersProject();
    setHasSavedProject(false);
    setSaveMessage("Saved project deleted.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  }

  async function findEntity() {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      setSearchError(
        "Enter an entity name.",
      );
      return;
    }

    const matchedNode = nodes.find(
      (node) =>
        node.data.label
          .toLowerCase()
          .includes(normalizedQuery),
    );

    if (!matchedNode || !flowInstance) {
      setSearchError(
        "No matching entity was found.",
      );
      return;
    }

    setSearchError("");
    setSelectedEdgeId(null);
    setSelectedId(matchedNode.id);

    const width =
      matchedNode.measured?.width ?? 220;

    const height =
      matchedNode.measured?.height ?? 80;

    await flowInstance.setCenter(
      matchedNode.position.x + width / 2,
      matchedNode.position.y + height / 2,
      {
        zoom: 1.35,
        duration: 650,
      },
    );
  }

  async function resetView() {
    setHoveredId(null);
    setSelectedEdgeId(null);
    setSearchQuery("");
    setSearchError("");

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.4,
      maxZoom: 1.15,
      duration: 650,
    });
  }

  async function changeLayout(
    nextDirection: LayoutDirection,
  ) {
    if (
      nextDirection === layoutDirection
    ) {
      return;
    }

    setHoveredId(null);
    setSelectedEdgeId(null);
    setLayoutDirection(nextDirection);

    const layoutedGraph = layoutGraph(
      nodes,
      edges,
      nextDirection,
    );

    setNodes(
      layoutedGraph.nodes as EntityNodeType[],
    );
    setEdges(layoutedGraph.edges);

    await new Promise((resolve) =>
      setTimeout(resolve, 120),
    );

    await flowInstance?.fitView({
      padding: 0.22,
      minZoom: 0.4,
      maxZoom: 1.15,
      duration: 650,
    });
  }

  async function exportGraphAsPng() {
    if (
      !graphContainerRef.current ||
      !flowInstance
    ) {
      setExportError(
        "The graph is not ready yet.",
      );
      return;
    }

    try {
      setExporting(true);
      setExportError("");
      setHoveredId(null);

      await flowInstance.fitView({
        padding: 0.16,
        minZoom: 0.4,
        maxZoom: 1.1,
        duration: 300,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 380),
      );

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(
        graphContainerRef.current,
        {
          backgroundColor: "#070b10",
          cacheBust: true,
          pixelRatio: 2,
          filter: (element) => {
            if (
              !(element instanceof HTMLElement)
            ) {
              return true;
            }

            return (
              element.dataset.exportIgnore !==
              "true"
            );
          },
        },
      );

      const link =
        document.createElement("a");

      link.download = `biolayers-graph-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExportMenuOpen(false);
    } catch {
      setExportError(
        "Could not export the graph.",
      );
    } finally {
      setExporting(false);
    }
  }

  function downloadTextFile(
    filename: string,
    content: string,
    mimeType: string,
  ) {
    const blob = new Blob([content], {
      type: mimeType,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function exportGraphAsJson() {
    const payload = {
      schema: "biolayers-knowledge-graph/v1",
      exportedAt: new Date().toISOString(),
      sourceText,
      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.data.label,
        type: node.data.type,
        description:
          node.data.description,
        aliases:
          node.data.aliases ?? [],
        confidence:
          node.data.confidence ?? null,
        evidenceQuote:
          node.data.evidenceQuote ?? "",
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label:
          typeof edge.label === "string"
            ? edge.label
            : "connected-to",
        relationType:
          edge.data?.relationType ?? null,
        description:
          edge.data?.description ?? "",
        confidence:
          edge.data?.confidence ?? null,
        evidenceQuote:
          edge.data?.evidenceQuote ?? "",
        directionality:
          edge.data?.directionality ??
          "directed",
        evidenceCount:
          edge.data?.evidenceCount ?? 0,
        literatureQuery:
          edge.data?.literatureQuery ?? "",
        paperAssessments:
          edge.data?.paperAssessments ?? [],
        evidenceSummary:
          edge.data?.evidenceSummary ?? null,
        evidenceAnalyzedAt:
          edge.data?.evidenceAnalyzedAt ?? null,
      })),
      evidence: {
        selectedEntity:
          selectedNode?.data.label ??
          null,
        loadedPubMedRecords:
          pubMedPapers.length,
        papers: pubMedPapers,
      },
    };

    downloadTextFile(
      `biolayers-graph-${Date.now()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );

    setExportMenuOpen(false);
  }

  function escapeXml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function exportGraphAsGraphMl() {
    const nodeXml = nodes
      .map(
        (node) => `    <node id="${escapeXml(
          node.id,
        )}">
      <data key="label">${escapeXml(
        node.data.label,
      )}</data>
      <data key="type">${escapeXml(
        node.data.type,
      )}</data>
      <data key="description">${escapeXml(
        node.data.description,
      )}</data>
      <data key="aliases">${escapeXml(
        (node.data.aliases ?? []).join(
          " | ",
        ),
      )}</data>
      <data key="confidence">${
        typeof node.data.confidence ===
        "number"
          ? node.data.confidence
          : ""
      }</data>
      <data key="evidenceQuote">${escapeXml(
        node.data.evidenceQuote ?? "",
      )}</data>
    </node>`,
      )
      .join("\\n");

    const edgeXml = edges
      .map(
        (edge) => `    <edge id="${escapeXml(
          edge.id,
        )}" source="${escapeXml(
          edge.source,
        )}" target="${escapeXml(
          edge.target,
        )}">
      <data key="relation">${escapeXml(
        typeof edge.label === "string"
          ? edge.label
          : "connected-to",
      )}</data>
      <data key="relationType">${escapeXml(
        edge.data?.relationType ??
          "other",
      )}</data>
      <data key="description">${escapeXml(
        edge.data?.description ?? "",
      )}</data>
      <data key="confidence">${
        typeof edge.data?.confidence ===
        "number"
          ? edge.data.confidence
          : ""
      }</data>
      <data key="evidenceQuote">${escapeXml(
        edge.data?.evidenceQuote ?? "",
      )}</data>
      <data key="directionality">${escapeXml(
        edge.data?.directionality ??
          "directed",
      )}</data>
    </edge>`,
      )
      .join("\\n");

    const graphMl = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="description" for="node" attr.name="description" attr.type="string"/>
  <key id="aliases" for="node" attr.name="aliases" attr.type="string"/>
  <key id="confidence" for="node" attr.name="confidence" attr.type="double"/>
  <key id="evidenceQuote" for="node" attr.name="evidenceQuote" attr.type="string"/>
  <key id="relation" for="edge" attr.name="relation" attr.type="string"/>
  <key id="relationType" for="edge" attr.name="relationType" attr.type="string"/>
  <key id="edgeDescription" for="edge" attr.name="description" attr.type="string"/>
  <key id="edgeConfidence" for="edge" attr.name="confidence" attr.type="double"/>
  <key id="edgeEvidenceQuote" for="edge" attr.name="evidenceQuote" attr.type="string"/>
  <key id="directionality" for="edge" attr.name="directionality" attr.type="string"/>
  <graph id="BioLayers" edgedefault="directed">
${nodeXml}
${edgeXml}
  </graph>
</graphml>`;

    downloadTextFile(
      `biolayers-graph-${Date.now()}.graphml`,
      graphMl,
      "application/graphml+xml",
    );

    setExportMenuOpen(false);
  }

  async function expandSelectedEntity() {
    if (!selectedNode || expandingGraph) {
      return;
    }

    setExpandingGraph(true);

    const normalized =
      selectedNode.data.label.toLowerCase();

    const templates: Array<{
      label: string;
      type: EntityType;
      relation: string;
      description: string;
    }> = normalized.includes("fibroblast")
      ? [
          {
            label: "Extracellular matrix",
            type: "process",
            relation: "remodels",
            description:
              "The extracellular matrix provides structural and signaling context for tumor progression.",
          },
          {
            label: "TGF-beta signaling",
            type: "pathway",
            relation: "activated-by",
            description:
              "TGF-beta signaling is commonly associated with fibroblast activation and stromal remodeling.",
          },
          {
            label: "CXCR4",
            type: "protein",
            relation: "signals-through",
            description:
              "CXCR4 is a chemokine receptor that can respond to CXCL12 signaling.",
          },
        ]
      : normalized.includes("bone")
        ? [
            {
              label: "Osteoblast",
              type: "cell",
              relation: "forms",
              description:
                "Osteoblasts produce bone matrix and regulate mineralization.",
            },
            {
              label: "Osteoclast",
              type: "cell",
              relation: "resorbs",
              description:
                "Osteoclasts are specialized cells responsible for bone resorption.",
            },
            {
              label: "Bone remodeling",
              type: "process",
              relation: "undergoes",
              description:
                "Bone remodeling coordinates formation and resorption in the skeletal niche.",
            },
          ]
        : normalized.includes("cxcl12")
          ? [
              {
                label: "CXCR4",
                type: "protein",
                relation: "binds",
                description:
                  "CXCR4 is a principal receptor for the chemokine CXCL12.",
              },
              {
                label: "Cell migration",
                type: "process",
                relation: "promotes",
                description:
                  "Chemokine gradients can guide directional cell migration.",
              },
              {
                label: "Chemotaxis",
                type: "process",
                relation: "regulates",
                description:
                  "Chemotaxis is directed cellular movement along a chemical gradient.",
              },
            ]
          : [
              {
                label: `${selectedNode.data.label} signaling`,
                type: "pathway",
                relation: "participates-in",
                description:
                  `A contextual signaling layer connected to ${selectedNode.data.label}.`,
              },
              {
                label: `${selectedNode.data.label} regulation`,
                type: "process",
                relation: "regulates",
                description:
                  `A regulatory process associated with ${selectedNode.data.label}.`,
              },
            ];

    const existingLabels = new Set(
      nodes.map((node) =>
        node.data.label.toLowerCase(),
      ),
    );

    const additions = templates.filter(
      (item) =>
        !existingLabels.has(
          item.label.toLowerCase(),
        ),
    );

    if (additions.length === 0) {
      setExpandingGraph(false);
      return;
    }

    const radius = 340;
    const newNodes: EntityNodeType[] =
      additions.map((item, index) => {
        const angle =
          (Math.PI * 2 * index) /
            additions.length -
          Math.PI / 2;

        const id = `${item.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}-${Date.now()}-${index}`;

        return {
          id,
          type: "entity",
          position: {
            x:
              selectedNode.position.x +
              Math.cos(angle) * radius,
            y:
              selectedNode.position.y +
              Math.sin(angle) * radius,
          },
          data: {
            label: item.label,
            type: item.type,
            description:
              item.description,
            aliases: [],
            confidence: 0.65,
            evidenceQuote: "",
          },
        };
      });

    const newEdges: Edge<ResearchEdgeData>[] =
      newNodes.map((node, index) => ({
        id: `${selectedNode.id}-${node.id}`,
        source: selectedNode.id,
        target: node.id,
        label:
          additions[index].relation,
        type: "biological",
        data: {
          relationType: "other",
          description:
            `Contextual expansion: ${selectedNode.data.label} ${additions[index].relation} ${additions[index].label}.`,
          confidence: 0.65,
          evidenceQuote: "",
          directionality: "directed",
        },
      }));

    setNodes((current) => [
      ...current,
      ...newNodes,
    ]);
    setEdges((current) => [
      ...current,
      ...newEdges,
    ]);

    await new Promise((resolve) =>
      window.setTimeout(resolve, 140),
    );

    await flowInstance?.fitView({
      padding: 0.14,
      minZoom: 0.44,
      maxZoom: 1.14,
      duration: 900,
    });

    setExpandingGraph(false);
  }

  const evidenceProfile = useMemo(
    () =>
      getEvidenceProfile(
        pubMedPapers.length,
        pubMedLoading,
        Boolean(pubMedError),
        selectedEdge?.data?.evidenceSummary,
      ),
    [
      pubMedPapers.length,
      pubMedLoading,
      pubMedError,
      selectedEdge?.data?.evidenceSummary,
    ],
  );


  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent,
    ) {
      const target =
        event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const key =
        event.key.toLowerCase();

      if (key === "g") {
        setWorkspaceView("graph");
      }

      if (key === "e") {
        setWorkspaceView("evidence");
      }

      if (key === "c") {
        setWorkspaceView("citations");
      }

      if (key === "t") {
        setWorkspaceView("timeline");
      }

      if (key === "p") {
        setWorkspaceView("pubmed");
      }

      if (key === "f") {
        void resetView();
      }

      if (event.key === "Escape") {
        setSelectedPaper(null);
        setCopilotOpen(false);
        setConnectBiologyOpen(false);
        setEvidenceLensOpen(false);
        setHypothesisBuilderOpen(false);
        setSelectedEdgeId(null);

        if (narrativeOpen) {
          void closeNarrative();
        } else if (cinematicFocus) {
          void exitCinematicFocus();
        }

        if (demoMode) {
          setDemoMode(false);
        }
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [
    flowInstance,
    cinematicFocus,
  ]);

  const selectedConnectionCount = selectedNode
    ? visibleEdges.filter(
        (edge) =>
          edge.source === selectedNode.id ||
          edge.target === selectedNode.id,
      ).length
    : 0;

  const activeLayerCount = Object.values(
    layers,
  ).filter(Boolean).length;

  return (
    <>
      <AnimatePresence>
        {showWorkspaceReveal && (
          <WorkspaceReveal
            active={showWorkspaceReveal}
            onComplete={() =>
              setShowWorkspaceReveal(false)
            }
          />
        )}
      </AnimatePresence>

      <main
        className={`relative h-[100dvh] overflow-hidden bg-[#05080d] text-[#eaf7f5] transition-all duration-1000 ${
          showWorkspaceReveal
            ? "scale-[1.025] opacity-0 blur-xl"
            : "scale-100 opacity-100 blur-0"
        }`}
      >
        {/* BioLayers scientific atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#05080d_0%,#091b27_42%,#071822_72%,#04070a_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(77,141,255,.14),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_38%,rgba(141,178,255,.12),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_53%_48%,rgba(77,141,255,.055),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(141,178,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,.5)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="pointer-events-none absolute left-[15%] right-[15%] top-0 h-px bg-gradient-to-r from-transparent via-teal-300/30 to-transparent" />

        <WorkspaceHeader
          demoMode={demoMode}
          generationMode={generationMode}
          generationMessage={generationMessage}
          workspaceView={workspaceView}
          setWorkspaceView={setWorkspaceView}
          saveCurrentProject={saveCurrentProject}
          exporting={exporting}
          exportMenuOpen={exportMenuOpen}
          setExportMenuOpen={setExportMenuOpen}
          exportGraphAsPng={exportGraphAsPng}
          exportGraphAsJson={exportGraphAsJson}
          exportGraphAsGraphMl={exportGraphAsGraphMl}
        />

        <section
          className={`relative z-20 grid grid-cols-1 ${
            demoMode
              ? "h-[100dvh] lg:grid-cols-1"
              : "h-[calc(100dvh-72px)] lg:grid-cols-[176px_minmax(0,1fr)_232px] xl:grid-cols-[184px_minmax(0,1fr)_242px] 2xl:grid-cols-[192px_minmax(0,1fr)_252px]"
          }`}
        >
          <ProjectSidebar
            demoMode={demoMode}
            nodeCount={nodes.length}
            edgeCount={edges.length}
            activeLayerCount={activeLayerCount}
            sourceText={sourceText}
            layers={layers}
            toggleLayer={toggleLayer}
            saveCurrentProject={saveCurrentProject}
            restoreSavedProject={restoreSavedProject}
            deleteSavedProject={deleteSavedProject}
            hasSavedProject={hasSavedProject}
            saveMessage={saveMessage}
            apiError={apiError}
          />

          {/* GRAPH CANVAS */}
          <section
            ref={graphContainerRef}
            onMouseMove={(event) => {
              const bounds =
                event.currentTarget.getBoundingClientRect();

              cursorX.set(
                ((event.clientX -
                  bounds.left) /
                  bounds.width) *
                  100,
              );

              cursorY.set(
                ((event.clientY -
                  bounds.top) /
                  bounds.height) *
                  100,
              );
            }}
            className="relative min-h-0 min-w-0 overflow-hidden bg-[#070b10]"
          >
            <LivingWorkspaceAtmosphere
              view={workspaceView}
            />
            <motion.div
              style={{
                left: cursorSpringX,
                top: cursorSpringY,
              }}
              className="pointer-events-none absolute z-[2] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(77,141,255,.10),rgba(141,178,255,.045)_38%,transparent_70%)] blur-[18px]"
            />
            {/* Scientific depth */}
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_45%,rgba(77,141,255,.07),transparent_31%),radial-gradient(circle_at_90%_12%,rgba(141,178,255,.065),transparent_28%),radial-gradient(circle_at_8%_90%,rgba(20,184,166,.05),transparent_26%)]" />

            {/* Molecular dot field */}
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.18] [background-image:radial-gradient(circle,rgba(141,178,255,.55)_1px,transparent_1.4px)] [background-size:48px_48px]" />

            {/* Fine grid */}
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.035] [background-image:linear-gradient(rgba(141,178,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(141,178,255,.6)_1px,transparent_1px)] [background-size:96px_96px]" />

            {/* Canvas vignette */}
            <div className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_120px_rgba(2,12,18,.55)]" />

            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      backgroundPosition: [
                        "0px 0px",
                        "96px 54px",
                      ],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 22,
                      repeat: Infinity,
                      ease: "linear",
                    }
              }
              className="pointer-events-none absolute inset-0 z-[1] opacity-[0.09] [background-image:linear-gradient(115deg,transparent_42%,rgba(161,92,255,.4)_50%,transparent_58%)] [background-size:220px_220px]"
            />

            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: [-30, 45, -30],
                      y: [-20, 24, -20],
                      opacity: [0.05, 0.11, 0.05],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="pointer-events-none absolute left-[20%] top-[18%] z-[1] h-80 w-80 rounded-full bg-teal-300/15 blur-[130px]"
            />

            {workspaceView === "graph" && !demoMode && (
              <div
                data-export-ignore="true"
                className="absolute left-4 top-20 z-[42] flex flex-col items-start gap-2"
              >
                <div className="flex flex-col gap-1 rounded-[16px] border border-teal-100/[0.075] bg-[#0a0f14]/90 p-1.5 shadow-[0_18px_55px_rgba(1,8,15,.34)] backdrop-blur-2xl">
                  <button
                    type="button"
                    onClick={() =>
                      setConnectBiologyOpen(true)
                    }
                    className="group flex w-[154px] items-center gap-2.5 rounded-[11px] border border-transparent px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.09em] text-teal-100 transition duration-300 hover:border-teal-200/[0.12] hover:bg-teal-200/[0.045]"
                    title="Trace a mechanistic path between two entities"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_9px_rgba(77,141,255,.65)]" />
                    Connect
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEvidenceLensOpen(true)
                    }
                    className="group flex w-[154px] items-center gap-2.5 rounded-[11px] border border-transparent px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.09em] text-sky-100 transition duration-300 hover:border-sky-200/[0.12] hover:bg-sky-200/[0.04]"
                    title="Filter the graph by evidence strength"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_9px_rgba(141,178,255,.6)]" />
                    Evidence
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHypothesisBuilderOpen(true)
                    }
                    className="group flex w-[154px] items-center gap-2.5 rounded-[11px] border border-transparent px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.09em] text-cyan-100 transition duration-300 hover:border-cyan-200/[0.12] hover:bg-cyan-200/[0.04]"
                    title="Turn graph context into a testable hypothesis"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(161,92,255,.55)]" />
                    Hypothesis
                  </button>

                  {activeMechanisticPath && (
                    <button
                      type="button"
                      onClick={() => {
                        void clearMechanisticPath();
                      }}
                      className="w-[154px] rounded-[10px] px-3 py-2 text-left font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-slate-200 transition hover:bg-white/[0.04] hover:text-white"
                    >
                      Clear path
                    </button>
                  )}
                </div>

                {(evidenceLensMode !== "all" ||
                  activeMechanisticPath) && (
                  <div className="pointer-events-none flex max-w-[220px] flex-col gap-1 rounded-[10px] border border-white/[0.055] bg-[#091821]/88 px-3 py-2 backdrop-blur-xl">
                    {activeMechanisticPath && (
                      <span className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-teal-300">
                        Path · {activeMechanisticPath.nodes.length} entities
                      </span>
                    )}

                    {evidenceLensMode !== "all" && (
                      <span className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-sky-300">
                        Lens · {evidenceLensMode}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {workspaceView === "graph" && (
              <GraphWorkspaceControls
                demoMode={demoMode}
                narrativeStepCount={narrativeSteps.length}
                layoutDirection={layoutDirection}
                toggleDemoMode={toggleDemoMode}
                startNarrative={startNarrative}
                changeLayout={changeLayout}
                resetView={resetView}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchError={searchError}
                setSearchError={setSearchError}
                exportError={exportError}
                findEntity={findEntity}
              />
            )}

            {workspaceView === "graph" && (
              <DemoModeOverlay
                demoMode={demoMode}
                demoScene={demoScene}
                activateDemoScene={activateDemoScene}
              />
            )}

            {workspaceView === "graph" && (
              <FocusExpandControls
                demoMode={demoMode}
                cinematicFocus={cinematicFocus}
                hasSelectedNode={Boolean(selectedNode)}
                expandingGraph={expandingGraph}
                enterCinematicFocus={enterCinematicFocus}
                exitCinematicFocus={exitCinematicFocus}
                expandSelectedEntity={expandSelectedEntity}
              />
            )}

            <AnimatePresence mode="wait">
              {workspaceView !== "graph" && (
                <motion.div
                  key={workspaceView}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 18,
                          filter: "blur(10px)",
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: -12,
                          filter: "blur(10px)",
                        }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 z-[25] overflow-y-auto bg-[linear-gradient(145deg,rgba(7,19,31,.97),rgba(9,27,39,.95),rgba(6,17,26,.98))] p-5 backdrop-blur-3xl sm:p-7 xl:p-9"
                >
                  <LivingWorkspaceAtmosphere
                    view={workspaceView}
                  />
                  <div className="relative z-10 mx-auto w-full max-w-[1480px] pb-24">
                    <div className="flex flex-col gap-4 border-b border-teal-100/[0.065] pb-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                          {workspaceView === "evidence"
                            ? "Evidence explorer"
                            : workspaceView === "citations"
                              ? "Citation network"
                              : workspaceView === "timeline"
                                ? "Research timeline"
                                : workspaceView === "cells"
                                  ? "Cell atlas"
                                  : "PubMed literature"}
                        </p>

                        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.045em] text-[#eef4ff] sm:text-[42px]">
                          {selectedEntity.label}
                        </h2>

                        <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-400">
                          {workspaceView === "evidence"
                            ? "Inspect mechanistic connections, evidence coverage and the scientific context surrounding the selected biological entity."
                            : workspaceView === "citations"
                              ? "Explore the loaded literature records connected to the selected entity."
                              : workspaceView === "timeline"
                                ? "Review loaded publications chronologically."
                                : workspaceView === "cells"
                                  ? "Search Cell Ontology and Cell Line Ontology, then add selected cells to the graph."
                                  : "Review paginated oncology-focused publications retrieved from PubMed."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setWorkspaceView("graph")
                        }
                        className="self-start rounded-[12px] border border-teal-100/[0.07] bg-white/[0.018] px-4 py-2.5 text-[11px] font-semibold text-slate-300 transition duration-300 hover:border-teal-200/[0.12] hover:bg-teal-200/[0.035] hover:text-teal-50 sm:self-auto"
                      >
                        Back to graph
                      </button>
                    </div>

                    {workspaceView ===
                    "evidence" ? (
                      <EvidencePanel
                        selectedEntity={selectedEntity}
                        relatedConnections={relatedConnections}
                        pubMedLoading={pubMedLoading}
                        pubMedPaperCount={pubMedPapers.length}
                        evidenceProfile={evidenceProfile}
                        focusNode={focusNode}
                        showGraph={() =>
                          setWorkspaceView("graph")
                        }
                        showPubMed={() =>
                          setWorkspaceView("pubmed")
                        }
                      />
                    ) : workspaceView ===
                      "timeline" ? (
                      <TimelinePanel
                        pubMedPapers={pubMedPapers}
                        pubMedTotal={pubMedTotal}
                        pubMedHasMore={pubMedHasMore}
                        pubMedLoadingMore={pubMedLoadingMore}
                        loadMorePubMed={loadMorePubMed}
                        openPaperInspector={openPaperInspector}
                      />
                    ) : workspaceView ===
                      "cells" ? (
                      <CellAtlasPanel
                        cellQuery={cellQuery}
                        setCellQuery={setCellQuery}
                        cellTerms={cellTerms}
                        cellTotal={cellTotal}
                        cellPage={cellPage}
                        cellHasMore={cellHasMore}
                        cellLoading={cellLoading}
                        cellError={cellError}
                        setCellError={setCellError}
                        cellScope={cellScope}
                        setCellScope={setCellScope}
                        selectedAtlasTerm={selectedAtlasTerm}
                        setSelectedAtlasTerm={setSelectedAtlasTerm}
                        favoriteCellIds={favoriteCellIds}
                        toggleFavoriteCell={toggleFavoriteCell}
                        openCellAtlasTerm={openCellAtlasTerm}
                        searchCellPreset={searchCellPreset}
                        runCellSearch={runCellSearch}
                        addCellToGraph={addCellToGraph}
                      />
                    ) : workspaceView ===
                      "citations" ? (
                      <section className="mt-7">
                        <div className="rounded-[24px] border border-teal-100/[0.07] bg-[radial-gradient(circle_at_50%_26%,rgba(77,141,255,.055),transparent_34%),rgba(10,27,38,.44)] p-5 shadow-[0_18px_52px_rgba(1,8,15,.12)] sm:p-7">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                                Entity-to-paper map
                              </p>
                              <h3 className="mt-2 text-[19px] font-semibold text-[#eef4ff]">
                                Literature connected to {selectedEntity.label}
                              </h3>
                            </div>

                            <EvidenceBadge
                              profile={evidenceProfile}
                            />
                          </div>

                          <div className="relative mt-8">
                            <div className="mx-auto max-w-md rounded-[20px] border border-teal-200/[0.12] bg-[linear-gradient(145deg,rgba(77,141,255,.07),rgba(8,23,34,.92))] p-5 text-center shadow-[0_18px_48px_rgba(1,8,15,.22)]">
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">
                                {selectedEntity.type}
                              </p>
                              <h4 className="mt-3 text-[22px] font-semibold text-[#eef4ff]">
                                {selectedEntity.label}
                              </h4>
                              <p className="mx-auto mt-3 max-w-sm text-[11px] leading-6 text-slate-400">
                                {selectedEntity.description}
                              </p>
                            </div>

                            <div className="mx-auto h-10 w-px bg-gradient-to-b from-teal-300/55 to-sky-300/15" />

                            {pubMedLoading ? (
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {[0, 1, 2, 3, 4].map(
                                  (item) => (
                                    <div
                                      key={item}
                                      className={`rounded-[24px] border border-teal-100/[0.07] bg-teal-100/[0.025] p-5 ${
                                          reduceMotion ? "" : "animate-pulse"
                                        }`}
                                    >
                                      <div className="h-2.5 w-1/3 rounded-full bg-teal-100/[0.08]" />
                                      <div className="mt-4 h-3 w-full rounded-full bg-teal-100/[0.06]" />
                                      <div className="mt-2 h-3 w-4/5 rounded-full bg-teal-100/[0.06]" />
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : pubMedPapers.length === 0 ? (
                              <div className="rounded-[24px] border border-dashed border-teal-100/[0.1] bg-teal-100/[0.02] p-8 text-center">
                                <p className="text-sm text-slate-200">
                                  No PubMed records are currently connected to this entity.
                                </p>
                              </div>
                            ) : (
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {pubMedPapers.map(
                                  (paper, index) => (
                                    <motion.button
                                      key={`citation-${paper.pmid}`}
                                      type="button"
                                      initial={
                                        reduceMotion
                                          ? false
                                          : {
                                              opacity: 0,
                                              y: 18,
                                            }
                                      }
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                      }}
                                      transition={{
                                        delay: reduceMotion
                                          ? 0
                                          : index * 0.06,
                                        duration: reduceMotion ? 0 : 0.4,
                                      }}
                                      whileHover={
                                        reduceMotion
                                          ? undefined
                                          : {
                                              y: -5,
                                              scale: 1.01,
                                            }
                                      }
                                      onClick={() =>
                                        openPaperInspector(
                                          paper,
                                        )
                                      }
                                      className="group relative overflow-hidden rounded-[18px] border border-teal-100/[0.055] bg-[#0a0f14]/46 p-4 text-left shadow-[0_14px_40px_rgba(1,8,15,.14)] transition duration-300 hover:border-teal-200/[0.12] hover:bg-teal-200/[0.025]"
                                    >
                                      <div className="pointer-events-none absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 -translate-y-full bg-gradient-to-b from-teal-300/08 to-teal-300/45" />
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="rounded-full border border-teal-200/[0.09] bg-teal-200/[0.03] px-2.5 py-1 font-mono text-[10px] text-teal-200">
                                          PMID {paper.pmid}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-500 transition group-hover:text-teal-300">
                                          Inspect ↗
                                        </span>
                                      </div>

                                      <h4 className="mt-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-100">
                                        {paper.title}
                                      </h4>

                                      <p className="mt-4 text-[11px] leading-5 text-slate-500">
                                        {paper.journal} · {paper.year}
                                      </p>

                                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-teal-300/15 to-transparent" />

                                      <p className="mt-3 text-[9px] uppercase tracking-[0.13em] text-slate-500">
                                        Connected to {selectedEntity.label}
                                      </p>
                                    </motion.button>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    ) : (
                      <PubMedPanel
  pubMedTotal={pubMedTotal}
  pubMedPapers={pubMedPapers}
  pubMedSort={pubMedSort}
  setPubMedSort={setPubMedSort}
  comparedPapers={comparedPapers}
  pubMedLoading={pubMedLoading}
  pubMedError={pubMedError}
  pubMedHasMore={pubMedHasMore}
  pubMedLoadingMore={pubMedLoadingMore}
  togglePaperComparison={togglePaperComparison}
  loadMorePubMed={loadMorePubMed}
  openPaperInspector={openPaperInspector}

  mode={
    selectedEdgeId
      ? "relationship"
      : "entity"
  }

  entityLabel={
    selectedNode?.data.label ??
    null
  }

  relationshipSource={
    selectedEdgeSource?.data.label ??
    null
  }

  relationshipTarget={
    selectedEdgeTarget?.data.label ??
    null
  }

  relationshipLabel={
    selectedEdgeId
      ? selectedEdgeLabel
      : null
  }

  pubMedQuery={
    selectedEdgeId
      ? edgePubMedQuery
      : selectedNode?.data.label ??
        null
  }

  sourceText={sourceText}

  onEvidenceAnalyzed={
    handleEvidenceAnalyzed
  }
/>                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <NarrativeOverlay
              narrativeOpen={narrativeOpen}
              activeNarrativeStep={activeNarrativeStep}
              narrativeIndex={narrativeIndex}
              narrativeSteps={narrativeSteps}
              narrativePlaying={narrativePlaying}
              demoMode={demoMode}
              closeNarrative={closeNarrative}
              previousNarrativeStep={previousNarrativeStep}
              pauseNarrative={pauseNarrative}
              resumeNarrative={resumeNarrative}
              nextNarrativeStep={nextNarrativeStep}
              restartNarrative={restartNarrative}
              enterDemoMode={() => setDemoMode(true)}
            />

            <AnimatePresence>
              {workspaceView === "graph" && cinematicFocus && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-[8] bg-[radial-gradient(circle_at_50%_50%,transparent_24%,rgba(2,11,18,.18)_52%,rgba(2,11,18,.72)_100%)]"
                />
              )}
            </AnimatePresence>

            {workspaceView === "graph" && (
              <WorkspaceCanvas
                nodes={displayNodes}
                edges={displayEdges}
                onInit={setFlowInstance}
                onNodesChange={onNodesChange}
                onSelectNode={(nodeId) => {
                  setSelectedEdgeId(null);
                  setSelectedId(nodeId);
                  setHoveredId(null);
                }}
                onSelectEdge={(edgeId) => {
                  setHoveredId(null);
                  setSelectedEdgeId(edgeId);
                }}
                onPaneClick={() => {
                  setHoveredId(null);
                  setSelectedEdgeId(null);
                }}
                onNodeEnter={(nodeId) => {
                  setHoveredId(nodeId);
                  setSelectedId(nodeId);
                }}
                onNodeLeave={() =>
                  setHoveredId(null)
                }
              />
            )}

            {generationMode === "loading" && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-[12] flex items-center justify-center bg-[#070b10]/35"
              >
                <div className="flex items-center gap-3 rounded-full border border-teal-200/[0.16] bg-[#0a1118]/85 px-5 py-3 shadow-[0_12px_40px_rgba(1,8,15,.35)] backdrop-blur-md">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-300/25 border-t-teal-300" />
                  <p className="text-xs font-medium text-slate-100">
                    Building knowledge graph…
                  </p>
                </div>
              </div>
            )}

            {workspaceView === "graph" && (
              <ConnectBiologyPanel
                nodes={nodes}
                edges={edges}
                open={connectBiologyOpen}
                onClose={() =>
                  setConnectBiologyOpen(false)
                }
                onFocusPath={(result) => {
                  void focusMechanisticPath(result);
                }}
              />
            )}

            {workspaceView === "graph" && (
              <EvidenceLensPanel
                edges={edges}
                open={evidenceLensOpen}
                mode={evidenceLensMode}
                onClose={() =>
                  setEvidenceLensOpen(false)
                }
                onChangeMode={(mode) => {
                  setEvidenceLensMode(mode);
                  setEvidenceLensOpen(false);
                  setActiveMechanisticPath(null);
                }}
              />
            )}

            {workspaceView === "graph" && (
              <HypothesisBuilderPanel
                nodes={nodes}
                edges={edges}
                selectedEntity={selectedEntity}
                activePath={activeMechanisticPath}
                open={hypothesisBuilderOpen}
                onClose={() =>
                  setHypothesisBuilderOpen(false)
                }
              />
            )}
          </section>

          <InspectorSidebar
            selectedEdge={selectedEdge}
            selectedEdgeSource={selectedEdgeSource}
            selectedEdgeTarget={selectedEdgeTarget}
            selectedEdgeLabel={selectedEdgeLabel}
            selectedEntity={selectedEntity}
            selectedConnectionCount={selectedConnectionCount}
            evidenceProfile={evidenceProfile}
            relatedConnections={relatedConnections}
            pubMedLoading={pubMedLoading}
            pubMedError={pubMedError}
            pubMedPapers={pubMedPapers}
            focusNode={focusNode}
            openPaperInspector={openPaperInspector}
            onAskCopilot={() => {
              setCopilotOpen(true);
              setCopilotMode("explain");
            }}
          />
        </section>

        <CopilotPanel
          demoMode={demoMode}
          copilotOpen={copilotOpen}
          setCopilotOpen={setCopilotOpen}
          copilotMode={copilotMode}
          setCopilotMode={setCopilotMode}
          copilotQuestion={copilotQuestion}
          setCopilotQuestion={setCopilotQuestion}
          copilotLoading={copilotLoading}
          copilotError={copilotError}
          setCopilotError={setCopilotError}
          copilotMessages={copilotMessages}
          selectedEntity={selectedEntity}
          relatedConnectionCount={relatedConnections.length}
          pubMedPaperCount={pubMedPapers.length}
          askCopilot={askCopilot}
        />

        <PaperInspectorPanel
          selectedPaper={selectedPaper}
          setSelectedPaper={setSelectedPaper}
          selectedEntity={selectedEntity}
          paperCopyMessage={paperCopyMessage}
          copyPaperIdentifier={copyPaperIdentifier}
        />

        <MobileWorkspaceControls
          demoMode={demoMode}
          workspaceView={workspaceView}
          setWorkspaceView={setWorkspaceView}
          selectedEntity={selectedEntity}
          selectedConnectionCount={selectedConnectionCount}
          resetView={resetView}
        />
      </main>
    </>
  );
}


function EvidenceBadge({
  profile,
}: {
  profile: EvidenceProfile;
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.13em] ${profile.badgeClass}`}
    >
      {profile.level}
    </span>
  );
}