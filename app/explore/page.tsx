"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { AnimatePresence, motion } from "framer-motion";

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
  ResearchEdgeData,
  ResearchEntityData,
} from "../lib/researchGraph";

import { layoutGraph } from "../lib/layoutGraph";
import WorkspaceReveal from "../components/workspace/WorkspaceReveal";
import LivingWorkspaceAtmosphere from "../components/workspace/LivingWorkspaceAtmosphere";
import CellAtlasPanel from "../components/workspace/CellAtlasPanel";
import PubMedPanel from "../components/workspace/PubMedPanel";
import EvidencePanel from "../components/workspace/EvidencePanel";
import InspectorPanel from "../components/workspace/InspectorPanel";
import EdgeInspectorPanel from "../components/workspace/EdgeInspectorPanel";
import CopilotPanel from "../components/workspace/CopilotPanel";
import PaperInspectorPanel from "../components/workspace/PaperInspectorPanel";
import WorkspaceCanvas, {
  type WorkspaceFlowInstance,
} from "../components/workspace/WorkspaceCanvas";
import NarrativeOverlay from "../components/workspace/NarrativeOverlay";
import DemoModeOverlay from "../components/workspace/DemoModeOverlay";
import FocusExpandControls from "../components/workspace/FocusExpandControls";
import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import ProjectSidebar from "../components/workspace/ProjectSidebar";
import GraphWorkspaceControls from "../components/workspace/GraphWorkspaceControls";
import InspectorSidebar from "../components/workspace/InspectorSidebar";
import MobileWorkspaceControls from "../components/workspace/MobileWorkspaceControls";
import TimelinePanel from "../components/workspace/TimelinePanel";
import usePubMed, {
  type PubMedPaper,
} from "../hooks/usePubMed";
import useWorkspace from "../hooks/useWorkspace";
import useCellOntology, {
  type CellOntologyTerm,
} from "../hooks/useCellOntology";
import BiologicalArtwork from "../components/workspace/BiologicalArtwork";

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
): EvidenceProfile {
  if (loading) {
    return {
      level: "Limited",
      score: 18,
      description: "Literature coverage is loading.",
      badgeClass:
        "border-slate-300/15 bg-slate-300/[0.05] text-slate-300",
      meterClass:
        "from-slate-500 via-cyan-300 to-violet-300",
    };
  }

  if (hasError || paperCount <= 0) {
    return {
      level: "No evidence",
      score: 8,
      description:
        "No matching PubMed metadata is currently loaded.",
      badgeClass:
        "border-rose-300/15 bg-rose-300/[0.05] text-rose-200",
      meterClass:
        "from-rose-400 via-rose-300 to-amber-300",
    };
  }

  if (paperCount === 1) {
    return {
      level: "Limited",
      score: 34,
      description:
        "One relevant PubMed record is currently linked.",
      badgeClass:
        "border-amber-300/15 bg-amber-300/[0.06] text-amber-200",
      meterClass:
        "from-amber-400 via-amber-300 to-cyan-300",
    };
  }

  if (paperCount <= 3) {
    return {
      level: "Moderate",
      score: 68,
      description:
        "Several relevant PubMed records are currently linked.",
      badgeClass:
        "border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200",
      meterClass:
        "from-cyan-400 via-cyan-300 to-violet-300",
    };
  }

  return {
    level: "Strong",
    score: 92,
    description:
      "Four or more relevant PubMed records are currently linked.",
    badgeClass:
      "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200",
    meterClass:
      "from-emerald-400 via-cyan-300 to-violet-300",
  };
}

const nodeClassNames: Record<EntityType, string> = {
  cell:
    "border-teal-300/45 bg-[linear-gradient(145deg,rgba(20,184,166,.22),rgba(4,12,24,.96))] text-teal-50 shadow-[0_18px_55px_rgba(20,184,166,.14)]",
  protein:
    "border-violet-300/45 bg-[linear-gradient(145deg,rgba(139,92,246,.23),rgba(4,12,24,.96))] text-violet-50 shadow-[0_18px_55px_rgba(139,92,246,.16)]",
  pathway:
    "border-amber-300/45 bg-[linear-gradient(145deg,rgba(245,158,11,.2),rgba(4,12,24,.96))] text-amber-50 shadow-[0_18px_55px_rgba(245,158,11,.13)]",
  process:
    "border-blue-300/45 bg-[linear-gradient(145deg,rgba(59,130,246,.22),rgba(4,12,24,.96))] text-blue-50 shadow-[0_18px_55px_rgba(59,130,246,.15)]",
  disease:
    "border-rose-300/45 bg-[linear-gradient(145deg,rgba(244,63,94,.22),rgba(4,12,24,.96))] text-rose-50 shadow-[0_18px_55px_rgba(244,63,94,.15)]",
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

export default function ExplorePage() {
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

  const [
    cursorPosition,
    setCursorPosition,
  ] = useState({
    x: 50,
    y: 50,
  });

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
    useState(false);

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
    });

  useEffect(() => {
    setHasSavedProject(
      hasSavedBioLayersProject(),
    );
  }, []);

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
          padding: 0.22,
          minZoom: 0.4,
          maxZoom: 1.15,
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

  const displayNodes = useMemo(() => {
    return visibleNodes.map((node) => {
      const isRelated =
        !hoveredId ||
        connectedNodeIds.has(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isRelated ? 1 : 0.22,
          transition:
            "opacity 180ms ease",
        },
      };
    });
  }, [
    visibleNodes,
    hoveredId,
    connectedNodeIds,
    cinematicFocus,
    narrativeOpen,
    demoMode,
  ]);

  const selectedNode = nodes.find(
    (node) => node.id === selectedId,
  );

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
  });

  const displayEdges = useMemo(() => {
    return visibleEdges.map((edge) => {
      const isConnected =
        hoveredId === edge.source ||
        hoveredId === edge.target;

      const isSelected =
        selectedEdgeId === edge.id;

      const shouldDim =
        (Boolean(hoveredId) &&
          !isConnected) ||
        (Boolean(selectedEdgeId) &&
          !isSelected);

      const highlighted =
        isConnected || isSelected;

      return {
        ...edge,
        type: "biological",
        data: {
          ...(typeof edge.data === "object" &&
          edge.data !== null
            ? edge.data
            : {}),
          evidenceCount:
            pubMedPapers.length,
        },

        animated: false,

        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: highlighted
            ? "#67e8f9"
            : "#64748b",
        },

        style: {
          stroke: highlighted
            ? "#67e8f9"
            : "#64748b",
          strokeWidth: isSelected
            ? 4.2
            : isConnected
              ? 3.4
              : 2.2,
          opacity: shouldDim ? 0.1 : 1,
          cursor: "pointer",
        },

        labelStyle: {
          fill: highlighted
            ? "#a5f3fc"
            : "#94a3b8",
          fontSize: isSelected ? 13 : 12,
          fontWeight: 700,
        },

        labelBgStyle: {
          fill: "#07111f",
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
    pubMedPapers.length,
  ]);

  const selectedEdge = edges.find(
    (edge) => edge.id === selectedEdgeId,
  );

  const selectedEdgeSource = selectedEdge
    ? nodes.find(
        (node) =>
          node.id === selectedEdge.source,
      )
    : undefined;

  const selectedEdgeTarget = selectedEdge
    ? nodes.find(
        (node) =>
          node.id === selectedEdge.target,
      )
    : undefined;

  const selectedEdgeLabel =
    selectedEdge &&
    typeof selectedEdge.label === "string"
      ? selectedEdge.label
      : "connected to";

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
      node.measured?.width ?? 244;
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
      targetNode.measured?.width ?? 220;

    const height =
      targetNode.measured?.height ?? 80;

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
            papers: pubMedPapers,
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
        evidenceQuote:
          `Imported from ${term.ontologyLabel} (${term.id}).`,
      },
    };

    setNodes((current) => [
      ...current,
      newNode,
    ]);

    if (anchorNode) {
      setEdges((current) => [
        ...current,
        {
          id: `${anchorNode.id}-${nodeId}-ontology`,
          source: anchorNode.id,
          target: nodeId,
          label: "related-cell-type",
          type: "biological",
          data: {
            relationType:
              "associated_with",
            description:
              "Cell Ontology-derived relationship added by the user.",
            confidence: 1,
            evidenceQuote: "",
            directionality:
              "undirected",
          },
        },
      ]);
    }

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
      padding: 0.22,
      minZoom: 0.38,
      maxZoom: 1.12,
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
      padding: 0.22,
      minZoom: 0.38,
      maxZoom: 1.12,
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

      const dataUrl = await toPng(
        graphContainerRef.current,
        {
          backgroundColor: "#050816",
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
      padding: 0.18,
      minZoom: 0.35,
      maxZoom: 1.08,
      duration: 900,
    });

    setExpandingGraph(false);
  }

  const evidenceProfile = getEvidenceProfile(
    pubMedPapers.length,
    pubMedLoading,
    Boolean(pubMedError),
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
        className={`relative h-[100dvh] overflow-hidden bg-[#030610] text-white transition-all duration-1000 ${
          showWorkspaceReveal
            ? "scale-[1.025] opacity-0 blur-xl"
            : "scale-100 opacity-100 blur-0"
        }`}
      >
        {/* Global workspace atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_-10%,rgba(34,211,238,.11),transparent_36%),radial-gradient(circle_at_90%_45%,rgba(139,92,246,.1),transparent_34%),linear-gradient(180deg,#050914_0%,#02040b_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.38)_1px,transparent_1px)] [background-size:64px_64px]" />

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
              : "h-[calc(100dvh-72px)] lg:grid-cols-[278px_minmax(0,1fr)_332px]"
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

              setCursorPosition({
                x:
                  ((event.clientX -
                    bounds.left) /
                    bounds.width) *
                  100,
                y:
                  ((event.clientY -
                    bounds.top) /
                    bounds.height) *
                  100,
              });
            }}
            className="relative min-h-0 overflow-hidden bg-[#050816]"
          >
            <LivingWorkspaceAtmosphere
              view={workspaceView}
            />
            <motion.div
              animate={{
                left: `${cursorPosition.x}%`,
                top: `${cursorPosition.y}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 24,
                mass: 0.55,
              }}
              className="pointer-events-none absolute z-[2] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,.11),rgba(139,92,246,.055)_35%,transparent_68%)] blur-[12px]"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,.07),transparent_30%),radial-gradient(circle_at_82%_15%,rgba(139,92,246,.065),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(236,72,153,.04),transparent_28%)]" />

            <div className="pointer-events-none absolute inset-0 z-[1] opacity-35 [background-image:radial-gradient(circle,rgba(103,232,249,.42)_1px,transparent_1.5px),radial-gradient(circle,rgba(196,181,253,.28)_1px,transparent_1.5px)] [background-position:0_0,22px_18px] [background-size:54px_54px,72px_72px]" />

            <motion.div
              animate={{
                backgroundPosition: [
                  "0px 0px",
                  "96px 54px",
                ],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute inset-0 z-[1] opacity-[0.09] [background-image:linear-gradient(115deg,transparent_42%,rgba(103,232,249,.4)_50%,transparent_58%)] [background-size:220px_220px]"
            />

            <motion.div
              animate={{
                x: [-30, 45, -30],
                y: [-20, 24, -20],
                opacity: [0.05, 0.11, 0.05],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-[20%] top-[18%] z-[1] h-80 w-80 rounded-full bg-cyan-400/20 blur-[130px]"
            />

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

            <DemoModeOverlay
              demoMode={demoMode}
              demoScene={demoScene}
              activateDemoScene={activateDemoScene}
            />

            <FocusExpandControls
              demoMode={demoMode}
              cinematicFocus={cinematicFocus}
              hasSelectedNode={Boolean(selectedNode)}
              expandingGraph={expandingGraph}
              enterCinematicFocus={enterCinematicFocus}
              exitCinematicFocus={exitCinematicFocus}
              expandSelectedEntity={expandSelectedEntity}
            />

            <AnimatePresence mode="wait">
              {workspaceView !== "graph" && (
                <motion.div
                  key={workspaceView}
                  initial={{
                    opacity: 0,
                    y: 18,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -12,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 z-[25] overflow-y-auto bg-[linear-gradient(145deg,rgba(2,6,23,.95),rgba(6,8,24,.92),rgba(3,7,18,.96))] p-5 backdrop-blur-3xl sm:p-8"
                >
                  <LivingWorkspaceAtmosphere
                    view={workspaceView}
                  />
                  <div className="relative z-10 mx-auto max-w-6xl pb-24">
                    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
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

                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
                          {selectedEntity.label}
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
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
                        className="self-start rounded-[14px] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white sm:self-auto"
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
                        <div className="rounded-[30px] border border-white/[0.08] bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,.09),transparent_36%),rgba(255,255,255,.018)] p-5 sm:p-8">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                                Entity-to-paper map
                              </p>
                              <h3 className="mt-2 text-xl font-semibold text-white">
                                Literature connected to {selectedEntity.label}
                              </h3>
                            </div>

                            <EvidenceBadge
                              profile={evidenceProfile}
                            />
                          </div>

                          <div className="relative mt-8">
                            <div className="mx-auto max-w-md rounded-[26px] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(34,211,238,.14),rgba(5,8,20,.96))] p-5 text-center shadow-[0_0_65px_rgba(34,211,238,.14)]">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                                {selectedEntity.type}
                              </p>
                              <h4 className="mt-3 text-2xl font-semibold text-white">
                                {selectedEntity.label}
                              </h4>
                              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-slate-400">
                                {selectedEntity.description}
                              </p>
                            </div>

                            <div className="mx-auto h-10 w-px bg-gradient-to-b from-cyan-300/65 to-violet-300/20" />

                            {pubMedLoading ? (
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {[0, 1, 2, 3, 4].map(
                                  (item) => (
                                    <div
                                      key={item}
                                      className="animate-pulse rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5"
                                    >
                                      <div className="h-2.5 w-1/3 rounded-full bg-white/[0.08]" />
                                      <div className="mt-4 h-3 w-full rounded-full bg-white/[0.06]" />
                                      <div className="mt-2 h-3 w-4/5 rounded-full bg-white/[0.06]" />
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : pubMedPapers.length === 0 ? (
                              <div className="rounded-[24px] border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
                                <p className="text-sm text-slate-500">
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
                                      initial={{
                                        opacity: 0,
                                        y: 18,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                      }}
                                      transition={{
                                        delay:
                                          index * 0.06,
                                        duration: 0.4,
                                      }}
                                      whileHover={{
                                        y: -5,
                                        scale: 1.01,
                                      }}
                                      onClick={() =>
                                        openPaperInspector(
                                          paper,
                                        )
                                      }
                                      className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 text-left shadow-[0_18px_55px_rgba(0,0,0,.2)] transition hover:border-violet-300/25 hover:bg-violet-300/[0.04]"
                                    >
                                      <div className="pointer-events-none absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 -translate-y-full bg-gradient-to-b from-violet-300/10 to-violet-300/65" />
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-2.5 py-1 font-mono text-[8px] text-violet-200">
                                          PMID {paper.pmid}
                                        </span>
                                        <span className="text-[9px] font-semibold text-slate-600 transition group-hover:text-cyan-300">
                                          Inspect ↗
                                        </span>
                                      </div>

                                      <h4 className="mt-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-100">
                                        {paper.title}
                                      </h4>

                                      <p className="mt-4 text-[10px] leading-5 text-slate-500">
                                        {paper.journal} · {paper.year}
                                      </p>

                                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-violet-300/20 to-transparent" />

                                      <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-slate-600">
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
              {cinematicFocus && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="pointer-events-none absolute inset-0 z-[8] bg-[radial-gradient(circle_at_50%_50%,transparent_24%,rgba(2,6,23,.22)_52%,rgba(2,6,23,.72)_100%)]"
                />
              )}
            </AnimatePresence>

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
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] ${profile.badgeClass}`}
    >
      {profile.level}
    </span>
  );
}