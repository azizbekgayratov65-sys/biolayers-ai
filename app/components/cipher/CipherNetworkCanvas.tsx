"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CipherNode, CipherEdge } from "./CipherTypes";

type Point = { x: number; y: number };

type Particle = {
  edgeIndex: number;
  progress: number; // 0 to 1
  speed: number;
};

type CanvasProps = {
  nodes: CipherNode[];
  edges: CipherEdge[];
  selectedNodeId: string | null;
  activeFilter: string | null;
  onSelectNode: (nodeId: string | null) => void;
};

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; glow: string; text: string }> = {
  trigger: {
    fill: "#1f1218",
    stroke: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.45)",
    text: "#fecdd3",
  },
  mechanism: {
    fill: "#091724",
    stroke: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.45)",
    text: "#cffafe",
  },
  effect: {
    fill: "#171024",
    stroke: "#a855f7",
    glow: "rgba(168, 85, 247, 0.45)",
    text: "#f3e8ff",
  },
  therapy: {
    fill: "#091f18",
    stroke: "#10b981",
    glow: "rgba(16, 185, 129, 0.45)",
    text: "#d1fae5",
  },
};

export default function CipherNetworkCanvas({
  nodes,
  edges,
  selectedNodeId,
  activeFilter,
  onSelectNode,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport transforms (pan & zoom)
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1,
  });

  // Node runtime state (positions & velocities)
  const nodePositions = useRef<Map<string, { x: number; y: number; vx: number; vy: number; radius: number }>>(
    new Map(),
  );

  // Interaction tracking
  const isDraggingCanvas = useRef(false);
  const isDraggingNode = useRef<string | null>(null);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const hoveredNodeId = useRef<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);

  // Initialize node layout positions in a balanced, organic constellation
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 900;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const map = new Map<string, { x: number; y: number; vx: number; vy: number; radius: number }>();

    // Layer-based spread: Triggers on left (level 1), Mechanisms in center (level 2),
    // Effects on right (level 3), Therapies bottom/adjacent (level 4)
    nodes.forEach((node, i) => {
      const radius = 16 + (node.weight || 3) * 3;
      let targetX = centerX;
      let targetY = centerY;

      if (node.category === "trigger") {
        targetX = centerX - width * 0.32 + ((i % 2) * 50 - 25);
        targetY = centerY - 140 + i * 110;
      } else if (node.category === "mechanism") {
        targetX = centerX - 60 + ((i % 3) - 1) * 120;
        targetY = centerY - 160 + i * 85;
      } else if (node.category === "effect") {
        targetX = centerX + width * 0.28 + ((i % 2) * 40 - 20);
        targetY = centerY - 130 + (i % 3) * 110;
      } else if (node.category === "therapy") {
        targetX = centerX - 80 + i * 160;
        targetY = centerY + 180;
      }

      // Add small natural jitter
      targetX += (Math.random() - 0.5) * 40;
      targetY += (Math.random() - 0.5) * 40;

      map.set(node.id, {
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        radius,
      });
    });

    nodePositions.current = map;

    // Initialize edge particles for directional causality flows
    const newParticles: Particle[] = [];
    edges.forEach((_, idx) => {
      // 2-3 particles per edge
      newParticles.push({
        edgeIndex: idx,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.005,
      });
      newParticles.push({
        edgeIndex: idx,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.005,
      });
    });
    particlesRef.current = newParticles;
  }, [nodes, edges]);

  // Compute upstream causes and downstream effects for active highlighting
  const activePathway = useCallback(() => {
    if (!selectedNodeId) return null;

    const upstream = new Set<string>();
    const downstream = new Set<string>();
    const activeEdges = new Set<string>();

    edges.forEach((edge) => {
      if (edge.target === selectedNodeId) {
        upstream.add(edge.source);
        activeEdges.add(`${edge.source}->${edge.target}`);
      }
      if (edge.source === selectedNodeId) {
        downstream.add(edge.target);
        activeEdges.add(`${edge.source}->${edge.target}`);
      }
    });

    return { upstream, downstream, activeEdges };
  }, [selectedNodeId, edges]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear dark universe background
      ctx.fillStyle = "#04070a";
      ctx.fillRect(0, 0, width, height);

      // Subtle background constellation grid
      ctx.save();
      ctx.strokeStyle = "rgba(77, 141, 255, 0.035)";
      ctx.lineWidth = 1;
      const gridSize = 48 * transform.scale;
      const offsetX = transform.x % gridSize;
      const offsetY = transform.y % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // Apply Pan & Zoom
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const pathway = activePathway();
      const posMap = nodePositions.current;

      // Soft physics: gentle node repulsion to prevent overlaps while stabilizing
      const posList = Array.from(posMap.values());
      for (let i = 0; i < posList.length; i++) {
        for (let j = i + 1; j < posList.length; j++) {
          const a = posList[i];
          const b = posList[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = a.radius + b.radius + 35;
          if (dist < minDist) {
            const force = (minDist - dist) * 0.02;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (isDraggingNode.current !== nodes[i]?.id) {
              a.x -= fx;
              a.y -= fy;
            }
            if (isDraggingNode.current !== nodes[j]?.id) {
              b.x += fx;
              b.y += fy;
            }
          }
        }
      }

      // 1. DRAW EDGES
      edges.forEach((edge) => {
        const sourcePos = posMap.get(edge.source);
        const targetPos = posMap.get(edge.target);
        if (!sourcePos || !targetPos) return;

        const isEdgeActive = pathway
          ? pathway.activeEdges.has(`${edge.source}->${edge.target}`)
          : true;

        const isFiltered =
          activeFilter &&
          nodes.find((n) => n.id === edge.source)?.category !== activeFilter &&
          nodes.find((n) => n.id === edge.target)?.category !== activeFilter;

        const alpha = isFiltered ? 0.08 : isEdgeActive ? (pathway ? 0.95 : 0.35) : 0.12;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);

        if (edge.relationshipType === "inhibits") {
          ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
          ctx.setLineDash([4, 4]);
        } else if (edge.relationshipType === "transforms") {
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.setLineDash([6, 3]);
        } else {
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.setLineDash([]);
        }

        ctx.lineWidth = isEdgeActive && pathway ? 2.5 : 1.5;
        ctx.stroke();
        ctx.restore();

        // Edge label (on hover or active)
        if (isEdgeActive && pathway) {
          const midX = (sourcePos.x + targetPos.x) / 2;
          const midY = (sourcePos.y + targetPos.y) / 2;
          ctx.save();
          ctx.font = "9px 'IBM Plex Mono', monospace";
          ctx.fillStyle = "rgba(203, 213, 225, 0.85)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(edge.label, midX, midY - 6);
          ctx.restore();
        }
      });

      // 2. DRAW FLOW PARTICLES (Cause ➔ Effect Directional Glow)
      particlesRef.current.forEach((particle) => {
        particle.progress += particle.speed;
        if (particle.progress > 1) particle.progress = 0;

        const edge = edges[particle.edgeIndex];
        if (!edge) return;

        const sourcePos = posMap.get(edge.source);
        const targetPos = posMap.get(edge.target);
        if (!sourcePos || !targetPos) return;

        const px = sourcePos.x + (targetPos.x - sourcePos.x) * particle.progress;
        const py = sourcePos.y + (targetPos.y - sourcePos.y) * particle.progress;

        const isEdgeActive = pathway
          ? pathway.activeEdges.has(`${edge.source}->${edge.target}`)
          : true;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, isEdgeActive ? 2.8 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle =
          edge.relationshipType === "inhibits"
            ? "rgba(251, 113, 133, 0.9)"
            : "rgba(34, 211, 238, 0.9)";
        ctx.shadowColor =
          edge.relationshipType === "inhibits" ? "#f43f5e" : "#06b6d4";
        ctx.shadowBlur = isEdgeActive ? 8 : 4;
        ctx.fill();
        ctx.restore();
      });

      // 3. DRAW NODES
      nodes.forEach((node) => {
        const pos = posMap.get(node.id);
        if (!pos) return;

        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId.current === node.id;
        const isUpstream = pathway?.upstream.has(node.id);
        const isDownstream = pathway?.downstream.has(node.id);

        const isHighlighted =
          !pathway || isSelected || isHovered || isUpstream || isDownstream;

        const isFilteredOut = activeFilter && node.category !== activeFilter;

        const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.mechanism;
        const baseAlpha = isFilteredOut ? 0.15 : isHighlighted ? 1 : 0.22;

        ctx.save();

        // Node Glow Halo
        if ((isSelected || isHovered || isUpstream || isDownstream) && !isFilteredOut) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.radius + (isSelected ? 10 : 6), 0, Math.PI * 2);
          ctx.fillStyle = colors.glow;
          ctx.shadowColor = colors.stroke;
          ctx.shadowBlur = isSelected ? 22 : 12;
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.globalAlpha = baseAlpha;
        ctx.fill();

        // Border Stroke
        ctx.strokeStyle = isSelected ? "#ffffff" : colors.stroke;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Center Indicator Pin
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.stroke;
        ctx.fill();

        // Node Label
        ctx.globalAlpha = isFilteredOut ? 0.2 : isHighlighted ? 1 : 0.35;
        ctx.font = isSelected
          ? "bold 11px 'Instrument Sans', sans-serif"
          : "500 10px 'Instrument Sans', sans-serif";
        ctx.fillStyle = isSelected ? "#ffffff" : colors.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Truncate label for clean display
        const displayLabel =
          node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label;
        ctx.fillText(displayLabel, pos.x, pos.y + pos.radius + 6);

        // Subtitle badge tag (Trigger, Mechanism, Effect, Therapy)
        if (isSelected || isHovered) {
          ctx.font = "bold 8px 'IBM Plex Mono', monospace";
          ctx.fillStyle = colors.stroke;
          ctx.fillText(node.category.toUpperCase(), pos.x, pos.y + pos.radius + 20);
        }

        ctx.restore();
      });

      ctx.restore();
      ctx.restore();

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [nodes, edges, transform, selectedNodeId, activeFilter, activePathway]);

  // Coordinate helper: Canvas screen coords to graph space
  const screenToGraph = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - transform.x) / transform.scale,
        y: (screenY - transform.y) / transform.scale,
      };
    },
    [transform],
  );

  // Mouse / Touch Event Handlers for Panning, Zooming, and Node Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const graphPt = screenToGraph(screenX, screenY);

    // Check if pointer hit a node
    let hitNodeId: string | null = null;
    nodePositions.current.forEach((pos, id) => {
      const dx = graphPt.x - pos.x;
      const dy = graphPt.y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= pos.radius + 6) {
        hitNodeId = id;
      }
    });

    if (hitNodeId) {
      isDraggingNode.current = hitNodeId;
      onSelectNode(hitNodeId);
      dragStart.current = { x: graphPt.x, y: graphPt.y };
    } else {
      isDraggingCanvas.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const graphPt = screenToGraph(screenX, screenY);

    // Node dragging
    if (isDraggingNode.current) {
      const nodePos = nodePositions.current.get(isDraggingNode.current);
      if (nodePos) {
        nodePos.x = graphPt.x;
        nodePos.y = graphPt.y;
      }
      return;
    }

    // Canvas panning
    if (isDraggingCanvas.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTransform((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover detection
    let hit: string | null = null;
    nodePositions.current.forEach((pos, id) => {
      const dx = graphPt.x - pos.x;
      const dy = graphPt.y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= pos.radius + 6) {
        hit = id;
      }
    });

    if (hoveredNodeId.current !== hit) {
      hoveredNodeId.current = hit;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hit ? "pointer" : "grab";
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingNode.current = null;
    isDraggingCanvas.current = false;
  };

  // Smooth Zoom with Wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.4), 2.8);

    setTransform((prev) => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
      y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
    }));
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const zoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 2.8) }));
  };

  const zoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.4) }));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden rounded-2xl border border-teal-200/15 bg-[#04070a]"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Floating Canvas Controls (Zoom, Reset) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-xl border border-teal-200/20 bg-[#070d14]/85 p-1.5 backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={zoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-200/20 bg-teal-300/[0.08] text-xs font-bold text-teal-200 hover:bg-teal-300/[0.2] transition"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-200/20 bg-teal-300/[0.08] text-xs font-bold text-teal-200 hover:bg-teal-300/[0.2] transition"
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetView}
          className="flex h-7 px-2.5 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-[10px] font-semibold text-slate-300 hover:text-white transition"
          title="Reset Camera"
        >
          Reset
        </button>
      </div>

      {/* Mini Legend Overlay */}
      <div className="absolute top-4 left-4 hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-[#070c14]/85 px-3 py-1.5 text-[10px] font-mono backdrop-blur-xl">
        <span className="flex items-center gap-1 text-rose-300">
          <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
          Trigger
        </span>
        <span className="flex items-center gap-1 text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          Mechanism
        </span>
        <span className="flex items-center gap-1 text-purple-300">
          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          Effect
        </span>
        <span className="flex items-center gap-1 text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          Therapy
        </span>
      </div>
    </div>
  );
}
