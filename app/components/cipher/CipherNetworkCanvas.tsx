"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Minimize2, Leaf, Camera } from "lucide-react";
import type { CipherNode, CipherEdge } from "./CipherTypes";

type Point = { x: number; y: number };

type Particle = {
  edgeIndex: number;
  progress: number;
  speed: number;
};

type CanvasProps = {
  nodes: CipherNode[];
  edges: CipherEdge[];
  selectedNodeId: string | null;
  activeFilter: string | null;
  onSelectNode: (nodeId: string | null) => void;
};

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; halo: string; text: string; dot: string }> = {
  trigger: {
    fill: "#1f1015",
    stroke: "#f43f5e",
    halo: "rgba(244, 63, 94, 0.22)",
    text: "#fecdd3",
    dot: "#fb7185",
  },
  mechanism: {
    fill: "#081622",
    stroke: "#06b6d4",
    halo: "rgba(6, 182, 212, 0.22)",
    text: "#cffafe",
    dot: "#22d3ee",
  },
  effect: {
    fill: "#150e20",
    stroke: "#a855f7",
    halo: "rgba(168, 85, 247, 0.22)",
    text: "#f3e8ff",
    dot: "#c084fc",
  },
  therapy: {
    fill: "#091c16",
    stroke: "#10b981",
    halo: "rgba(16, 185, 129, 0.22)",
    text: "#d1fae5",
    dot: "#34d399",
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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ecoMode, setEcoMode] = useState(false);

  // Node runtime state (positions & velocities)
  const nodePositions = useRef<Map<string, { x: number; y: number; vx: number; vy: number; radius: number }>>(
    new Map(),
  );

  // Simulation & Power State
  const simulationEnergy = useRef<number>(1.0); // Decays to 0 to sleep physics
  const isVisibleRef = useRef<boolean>(true); // IntersectionObserver tracking
  const isTabActiveRef = useRef<boolean>(true); // visibilitychange tracking
  const cameraTarget = useRef<{ x: number; y: number; scale: number; active: boolean }>({
    x: 0,
    y: 0,
    scale: 1,
    active: false,
  });

  // Interaction tracking
  const isDraggingCanvas = useRef(false);
  const isDraggingNode = useRef<string | null>(null);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const hoveredNodeId = useRef<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Initialize node layout positions in an organic, balanced constellation
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 900;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const map = new Map<string, { x: number; y: number; vx: number; vy: number; radius: number }>();

    // Layer-based spread: Triggers left, Mechanisms center, Effects right, Therapies bottom
    nodes.forEach((node, i) => {
      const radius = 16 + (node.weight || 3) * 3;
      let targetX = centerX;
      let targetY = centerY;

      if (node.category === "trigger") {
        targetX = centerX - width * 0.32 + ((i % 2) * 50 - 25);
        targetY = centerY - 140 + i * 115;
      } else if (node.category === "mechanism") {
        targetX = centerX - 60 + ((i % 3) - 1) * 125;
        targetY = centerY - 160 + i * 85;
      } else if (node.category === "effect") {
        targetX = centerX + width * 0.28 + ((i % 2) * 40 - 20);
        targetY = centerY - 130 + (i % 3) * 110;
      } else if (node.category === "therapy") {
        targetX = centerX - 80 + i * 160;
        targetY = centerY + 180;
      }

      // Small jitter for natural spacing
      targetX += (Math.random() - 0.5) * 30;
      targetY += (Math.random() - 0.5) * 30;

      map.set(node.id, {
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        radius,
      });
    });

    nodePositions.current = map;
    simulationEnergy.current = 1.0; // Wake up physics simulation for initial settling

    // Initialize edge particles
    const newParticles: Particle[] = [];
    edges.forEach((_, idx) => {
      newParticles.push({
        edgeIndex: idx,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.004,
      });
    });
    particlesRef.current = newParticles;
  }, [nodes, edges]);

  // Smooth Camera Fly-To when selectedNodeId changes
  useEffect(() => {
    if (!selectedNodeId) return;
    const pos = nodePositions.current.get(selectedNodeId);
    const canvas = canvasRef.current;
    if (!pos || !canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const targetScale = Math.max(transform.scale, 1.05);

    cameraTarget.current = {
      x: width / 2 - pos.x * targetScale,
      y: height / 2 - pos.y * targetScale,
      scale: targetScale,
      active: true,
    };
  }, [selectedNodeId, transform.scale]);

  // Low-Power Lifecycle Observers: Pause when offscreen or tab hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  // Compute upstream & downstream for selected node
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

  // Main High-Performance, Low-Power 60FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const render = (now: number) => {
      if (!running) return;

      // Throttle for Eco Mode or Low Power (skip frames if ecoMode active to save battery)
      const delta = now - lastFrameTime.current;
      if (ecoMode && delta < 33) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }
      lastFrameTime.current = now;

      // Zero CPU if tab hidden or offscreen
      if (!isVisibleRef.current || !isTabActiveRef.current) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      // Camera Lerp Animation
      if (cameraTarget.current.active) {
        const tgt = cameraTarget.current;
        const lerpFactor = 0.09;
        setTransform((prev) => {
          const nx = prev.x + (tgt.x - prev.x) * lerpFactor;
          const ny = prev.y + (tgt.y - prev.y) * lerpFactor;
          const ns = prev.scale + (tgt.scale - prev.scale) * lerpFactor;
          if (
            Math.abs(nx - tgt.x) < 1 &&
            Math.abs(ny - tgt.y) < 1 &&
            Math.abs(ns - tgt.scale) < 0.01
          ) {
            cameraTarget.current.active = false;
          }
          return { x: nx, y: ny, scale: ns };
        });
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep Space Background
      ctx.fillStyle = "#04070a";
      ctx.fillRect(0, 0, width, height);

      // Background Grid (subtle cosmic coordinates)
      ctx.save();
      ctx.strokeStyle = "rgba(77, 141, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 44 * transform.scale;
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

      // Camera Transform
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const pathway = activePathway();
      const posMap = nodePositions.current;

      // PHYSICS SIMULATION WITH COOLING / SLEEP (Zero CPU once settled)
      if (simulationEnergy.current > 0.02 || isDraggingNode.current) {
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
              const force = (minDist - dist) * 0.025;
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
        if (!isDraggingNode.current) {
          simulationEnergy.current *= 0.96; // Smooth thermal decay
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

        const alpha = isFiltered ? 0.06 : isEdgeActive ? (pathway ? 0.95 : 0.3) : 0.1;

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

        ctx.lineWidth = isEdgeActive && pathway ? 2.5 : 1.2;
        ctx.stroke();
        ctx.restore();

        // Edge label (illuminated pathway)
        if (isEdgeActive && pathway) {
          const midX = (sourcePos.x + targetPos.x) / 2;
          const midY = (sourcePos.y + targetPos.y) / 2;
          ctx.save();
          ctx.font = "9px 'IBM Plex Mono', monospace";
          ctx.fillStyle = "rgba(203, 213, 225, 0.9)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(edge.label, midX, midY - 6);
          ctx.restore();
        }
      });

      // 2. DIRECTIONAL PARTICLES (Low-Power Hardware-Accelerated Pulse)
      if (!ecoMode) {
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

          // Zero-cost concentric alpha halos (no costly shadowBlur!)
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, isEdgeActive ? 2.6 : 1.8, 0, Math.PI * 2);
          ctx.fillStyle =
            edge.relationshipType === "inhibits"
              ? "rgba(251, 113, 133, 0.9)"
              : "rgba(34, 211, 238, 0.9)";
          ctx.fill();
          ctx.restore();
        });
      }

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

        ctx.save();

        // Hardware-Accelerated Glow Rings (avoids battery-draining Gaussian blur)
        if ((isSelected || isHovered || isUpstream || isDownstream) && !isFilteredOut) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.radius + (isSelected ? 9 : 5), 0, Math.PI * 2);
          ctx.fillStyle = colors.halo;
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.globalAlpha = isFilteredOut ? 0.15 : isHighlighted ? 1 : 0.22;
        ctx.fill();

        // High-Contrast Border Stroke
        ctx.strokeStyle = isSelected ? "#ffffff" : colors.stroke;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Center Molecular Pin
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.dot;
        ctx.fill();

        // Node Label
        ctx.globalAlpha = isFilteredOut ? 0.2 : isHighlighted ? 1 : 0.35;
        ctx.font = isSelected
          ? "bold 11px 'Instrument Sans', sans-serif"
          : "500 10px 'Instrument Sans', sans-serif";
        ctx.fillStyle = isSelected ? "#ffffff" : colors.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const displayLabel =
          node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label;
        ctx.fillText(displayLabel, pos.x, pos.y + pos.radius + 6);

        // Category Tag on Hover or Select
        if (isSelected || isHovered) {
          ctx.font = "bold 8px 'IBM Plex Mono', monospace";
          ctx.fillStyle = colors.stroke;
          ctx.fillText(node.category.toUpperCase(), pos.x, pos.y + pos.radius + 19);
        }

        ctx.restore();
      });

      ctx.restore(); // Restore camera transform

      // 4. MINI-MAP (Radar HUD in bottom-right corner)
      const mmWidth = 110;
      const mmHeight = 70;
      const mmPadding = 12;
      const mmX = width - mmWidth - mmPadding;
      const mmY = height - mmHeight - mmPadding;

      ctx.save();
      // Mini-map background
      ctx.fillStyle = "rgba(7, 12, 20, 0.75)";
      ctx.strokeStyle = "rgba(77, 141, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(mmX, mmY, mmWidth, mmHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Mini-map node dots
      const scaleX = mmWidth / width;
      const scaleY = mmHeight / height;
      nodes.forEach((n) => {
        const p = posMap.get(n.id);
        if (!p) return;
        const mx = mmX + p.x * scaleX;
        const my = mmY + p.y * scaleY;
        ctx.beginPath();
        ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = CATEGORY_COLORS[n.category]?.dot || "#22d3ee";
        ctx.fill();
      });

      // Viewport Wireframe
      const vpLeft = mmX - (transform.x / width) * mmWidth;
      const vpTop = mmY - (transform.y / height) * mmHeight;
      const vpW = (mmWidth / transform.scale) * 0.75;
      const vpH = (mmHeight / transform.scale) * 0.75;

      ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        Math.max(mmX, vpLeft),
        Math.max(mmY, vpTop),
        Math.min(mmWidth, vpW),
        Math.min(mmHeight, vpH),
      );
      ctx.restore();

      ctx.restore(); // Restore dpr scale

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [nodes, edges, transform, selectedNodeId, activeFilter, activePathway, ecoMode]);

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

  // Pointer Interaction Handlers
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
      simulationEnergy.current = 1.0; // Wake up physics on interaction
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
        simulationEnergy.current = 0.8;
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const snapshotGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `biolayers-cipher-network-${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full select-none overflow-hidden rounded-2xl border border-teal-200/15 bg-[#04070a] contain-intrinsic-size-[auto_none_auto_600px] ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
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

      {/* Floating Canvas Controls (Zoom, Reset, Fullscreen, Eco Mode, Snapshot) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-xl border border-teal-200/20 bg-[#070d14]/90 p-1.5 backdrop-blur-xl shadow-lg">
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

        <div className="h-4 w-px bg-white/10" />

        {/* Eco Mode / Low Power Toggle */}
        <button
          type="button"
          onClick={() => setEcoMode(!ecoMode)}
          className={`flex h-7 items-center gap-1 px-2 rounded-lg border text-[10px] font-mono font-medium transition ${
            ecoMode
              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Eco / Low Power Mode"
        >
          <Leaf className="h-3 w-3" />
          <span className="hidden sm:inline">Eco</span>
        </button>

        {/* Snapshot / Download */}
        <button
          type="button"
          onClick={snapshotGraph}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white transition"
          title="Download PNG Snapshot"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Mini Legend Overlay */}
      <div className="absolute top-4 left-4 hidden sm:flex items-center gap-3 rounded-xl border border-white/10 bg-[#070c14]/85 px-3 py-1.5 text-[10px] font-mono backdrop-blur-xl">
        <span className="flex items-center gap-1.5 text-rose-300">
          <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
          Trigger
        </span>
        <span className="flex items-center gap-1.5 text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          Mechanism
        </span>
        <span className="flex items-center gap-1.5 text-purple-300">
          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          Effect
        </span>
        <span className="flex items-center gap-1.5 text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          Therapy
        </span>
      </div>
    </div>
  );
}
