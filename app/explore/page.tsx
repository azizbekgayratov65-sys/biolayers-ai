"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { AnimatePresence } from "framer-motion";

import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  buildGraphFromText,
  type EntityData,
  type EntityType,
} from "../lib/buildGraphFromText";

import { layoutGraph } from "../lib/layoutGraph";
import WorkspaceReveal from "../components/workspace/WorkspaceReveal";

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

type EntityNodeType = Node<EntityData, "entity">;
type FlowInstance = ReactFlowInstance<
  EntityNodeType,
  Edge
>;

type ApiEntity = {
  id: string;
  label: string;
  type: EntityType;
  description: string;
};

type ApiRelation = {
  source: string;
  target: string;
  label: string;
};

type ApiGraphResponse = {
  entities: ApiEntity[];
  relations: ApiRelation[];
  error?: string;
};

const nodeClassNames: Record<EntityType, string> = {
  cell:
    "border-teal-300 bg-teal-50 text-teal-950",
  protein:
    "border-violet-300 bg-violet-50 text-violet-950",
  pathway:
    "border-amber-300 bg-amber-50 text-amber-950",
  process:
    "border-blue-300 bg-blue-50 text-blue-950",
  disease:
    "border-rose-300 bg-rose-50 text-rose-950",
};

const miniMapColors: Record<EntityType, string> = {
  cell: "#2dd4bf",
  protein: "#a78bfa",
  pathway: "#fbbf24",
  process: "#60a5fa",
  disease: "#fb7185",
};

const layerLabels: Array<{
  key: EntityType;
  label: string;
}> = [
  { key: "cell", label: "Cells" },
  { key: "protein", label: "Proteins" },
  { key: "pathway", label: "Pathways" },
  { key: "process", label: "Processes" },
  { key: "disease", label: "Diseases" },
];

const legendItems: Array<{
  key: EntityType;
  label: string;
  colorClass: string;
}> = [
  {
    key: "cell",
    label: "Cell",
    colorClass: "bg-teal-400",
  },
  {
    key: "protein",
    label: "Protein",
    colorClass: "bg-violet-400",
  },
  {
    key: "pathway",
    label: "Pathway",
    colorClass: "bg-amber-400",
  },
  {
    key: "process",
    label: "Process",
    colorClass: "bg-blue-400",
  },
  {
    key: "disease",
    label: "Disease",
    colorClass: "bg-rose-400",
  },
];

function EntityNode({
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}: NodeProps<EntityNodeType>) {
  return (
    <div
      className={`relative rounded-2xl transition duration-200 ${
        selected
          ? "scale-[1.03] ring-4 ring-teal-400/30"
          : "hover:scale-[1.02]"
      }`}
    >
      <Handle
        type="target"
        position={targetPosition}
        style={{
          width: 9,
          height: 9,
          background: "#64748b",
          border: "2px solid white",
        }}
      />

      <div
        className={`min-w-44 rounded-2xl border px-4 py-3 shadow-md ${
          nodeClassNames[data.type]
        }`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
          {data.type}
        </p>

        <p className="mt-1 text-sm font-semibold">
          {data.label}
        </p>
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        style={{
          width: 9,
          height: 9,
          background: "#64748b",
          border: "2px solid white",
        }}
      />
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
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
      },
    }));

  const validNodeIds = new Set(
    nodes.map((node) => node.id),
  );

  const edges: Edge[] = graph.relations
    .filter(
      (relation) =>
        validNodeIds.has(relation.source) &&
        validNodeIds.has(relation.target) &&
        relation.source !== relation.target,
    )
    .map((relation, index) => ({
      id: `${relation.source}-${relation.target}-${index}`,
      source: relation.source,
      target: relation.target,
      label: relation.label,
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

  const [sourceText, setSourceText] =
    useState("");

  const [selectedId, setSelectedId] =
    useState("");

  const [hoveredId, setHoveredId] =
    useState<string | null>(null);

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

  const [hasSavedProject, setHasSavedProject] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [flowInstance, setFlowInstance] =
    useState<FlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<EntityNodeType>([]);

  const [edges, setEdges] =
    useState<Edge[]>([]);

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
  ]);

  const displayEdges = useMemo(() => {
    return visibleEdges.map((edge) => {
      const isConnected =
        hoveredId === edge.source ||
        hoveredId === edge.target;

      const shouldDim =
        Boolean(hoveredId) &&
        !isConnected;

      return {
        ...edge,

        animated:
          Boolean(hoveredId) &&
          isConnected,

        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isConnected
            ? "#0f766e"
            : "#64748b",
        },

        style: {
          stroke: isConnected
            ? "#0f766e"
            : "#64748b",
          strokeWidth: isConnected
            ? 3.4
            : 2.2,
          opacity: shouldDim ? 0.12 : 1,
        },

        labelStyle: {
          fill: isConnected
            ? "#0f766e"
            : "#334155",
          fontSize: 12,
          fontWeight: 600,
        },

        labelBgStyle: {
          fill: "#ffffff",
          fillOpacity: shouldDim
            ? 0.2
            : 0.94,
        },

        labelBgPadding: [6, 4] as [
          number,
          number,
        ],

        labelBgBorderRadius: 8,
      };
    });
  }, [visibleEdges, hoveredId]);

  const selectedNode = nodes.find(
    (node) => node.id === selectedId,
  );

  const selectedEntity: EntityData =
    selectedNode
      ? selectedNode.data
      : {
          label: "Nothing selected",
          type: "process",
          description:
            "Click a node in the graph to inspect its biological role.",
        };

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
      selectedId,
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
          backgroundColor: "#f7faf9",
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
    } catch {
      setExportError(
        "Could not export the graph.",
      );
    } finally {
      setExporting(false);
    }
  }

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
        className={`h-screen overflow-hidden bg-slate-950 text-white transition-all duration-1000 ${
          showWorkspaceReveal
            ? "scale-[1.03] opacity-0 blur-xl"
            : "scale-100 opacity-100 blur-0"
        }`}
      >
      <header className="flex h-[68px] items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400 text-sm font-bold text-slate-950"
          >
            BL
          </Link>

          <div>
            <p className="font-semibold">
              BioLayers Workspace
            </p>

            <p className="text-xs text-slate-400">
              Interactive cancer biology map
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          ← New map
        </Link>
      </header>

      <section className="grid h-[calc(100vh-68px)] grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="overflow-y-auto border-r border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Source paragraph
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm leading-6 text-slate-300">
              {sourceText}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={saveCurrentProject}
              className="rounded-xl bg-teal-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() =>
                void restoreSavedProject()
              }
              disabled={!hasSavedProject}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Restore
            </button>

            <button
              type="button"
              onClick={deleteSavedProject}
              disabled={!hasSavedProject}
              className="col-span-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete save
            </button>
          </div>

          {saveMessage && (
            <p className="mt-2 text-xs text-teal-300">
              {saveMessage}
            </p>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {generationMode === "ai"
                ? "AI generation"
                : generationMode === "saved"
                  ? "Saved project"
                  : generationMode === "fallback"
                    ? "Local fallback"
                    : "Generating"}
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {generationMessage}
            </p>

            {apiError && (
              <p className="mt-2 text-xs text-amber-300">
                {apiError}
              </p>
            )}
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Visible layers
          </p>

          <div className="mt-3 space-y-1">
            {layerLabels.map((layer) => (
              <label
                key={layer.key}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={
                    layers[layer.key]
                  }
                  onChange={() =>
                    toggleLayer(layer.key)
                  }
                  className="h-4 w-4 accent-teal-400"
                />

                {layer.label}
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Legend
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {legendItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.colorClass}`}
                  />

                  <span className="text-xs text-slate-300">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section
          ref={graphContainerRef}
          className="relative bg-[#f7faf9]"
        >
          <div
            data-export-ignore="true"
            className="absolute left-5 top-5 z-10 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
              Generated knowledge graph
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Hover over a node to reveal its connections.
            </p>
          </div>

          <div
            data-export-ignore="true"
            className="absolute right-5 top-5 z-10 flex items-start gap-2"
          >
            <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  void changeLayout("TB")
                }
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  layoutDirection === "TB"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600"
                }`}
              >
                Top ↓
              </button>

              <button
                type="button"
                onClick={() =>
                  void changeLayout("LR")
                }
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  layoutDirection === "LR"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600"
                }`}
              >
                Left →
              </button>
            </div>

            <button
              type="button"
              onClick={() => void resetView()}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() =>
                void exportGraphAsPng()
              }
              disabled={exporting}
              className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              {exporting
                ? "Exporting..."
                : "Export PNG"}
            </button>

            <div className="flex w-[250px] rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(
                    event.target.value,
                  );
                  setSearchError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void findEntity();
                  }
                }}
                placeholder="Search entity..."
                className="min-w-0 flex-1 px-2 text-sm text-slate-900 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  void findEntity()
                }
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Find
              </button>
            </div>
          </div>

          {(searchError || exportError) && (
            <p className="absolute right-5 top-24 z-20 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs text-red-600">
              {searchError || exportError}
            </p>
          )}

          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            onInit={setFlowInstance}
            onNodesChange={onNodesChange}
            onNodeClick={(_, node) =>
              setSelectedId(node.id)
            }
            onNodeMouseEnter={(_, node) => {
              setHoveredId(node.id);
              setSelectedId(node.id);
            }}
            onNodeMouseLeave={() =>
              setHoveredId(null)
            }
            fitView
            nodesDraggable
            nodesConnectable={false}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type:
                  MarkerType.ArrowClosed,
                color: "#64748b",
              },
            }}
          >
            <Background
              gap={24}
              size={1}
              color="#cbd5e1"
            />

            <MiniMap
              nodeColor={(node) =>
                miniMapColors[
                  node.data
                    .type as EntityType
                ]
              }
            />

            <Controls />
          </ReactFlow>
        </section>

        <aside className="overflow-y-auto border-l border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">
            {selectedEntity.type}
          </p>

          <h2 className="mt-3 text-2xl font-semibold">
            {selectedEntity.label}
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            {selectedEntity.description}
          </p>

          <div className="mt-7 space-y-3">
            <DetailCard
              title="Biological role"
              text="This entity contributes to the biological mechanism represented in the submitted paragraph."
            />

            <DetailCard
              title="Evidence"
              text="Scientific citations and evidence scores will be connected in a later version."
            />

            <DetailCard
              title="Related papers"
              text="Future PubMed integration will surface supporting and conflicting studies."
            />
          </div>
        </aside>
      </section>
      </main>
    </>
  );
}

function DetailCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-medium">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}