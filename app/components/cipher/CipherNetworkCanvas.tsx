"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dagre from "@dagrejs/dagre";
import { Camera, Maximize2, Minimize2, Minus, Plus, ScanSearch } from "lucide-react";

import type { CipherEdge, CipherNode, NodeCategory } from "./CipherTypes";

export type CipherSelection = { kind: "node"; id: string } | { kind: "edge"; key: string } | null;

export const edgeKey = (edge: Pick<CipherEdge, "source" | "target">) => `${edge.source}->${edge.target}`;

type Props = {
  nodes: CipherNode[];
  edges: CipherEdge[];
  selection: CipherSelection;
  focusNodeId: string | null; // the camera glides here (guided tour)
  activeFilter: NodeCategory | null;
  searchMatches: Set<string> | null; // null = no search running
  onSelect: (selection: CipherSelection) => void;
};

type Box = { x: number; y: number; w: number; h: number; lines: string[] };
type Point = { x: number; y: number };

export const CATEGORY_COLORS: Record<NodeCategory, { fill: string; stroke: string; text: string; dot: string }> = {
  trigger: { fill: "#1d0f15", stroke: "#f43f5e", text: "#ffe4e9", dot: "#fb7185" },
  mechanism: { fill: "#071822", stroke: "#22d3ee", text: "#e0fbff", dot: "#67e8f9" },
  effect: { fill: "#160f22", stroke: "#a855f7", text: "#f3e8ff", dot: "#c084fc" },
  therapy: { fill: "#081c15", stroke: "#10b981", text: "#d1fae5", dot: "#34d399" },
};

const EDGE_COLORS: Record<CipherEdge["relationshipType"], string> = {
  activates: "103, 232, 249",
  targets: "103, 232, 249",
  inhibits: "251, 113, 133",
  transforms: "192, 132, 252",
};

const NODE_WIDTH = 176;
const LINE_HEIGHT = 15;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2.6;

/* Word-wrap a label into at most two lines that fit the node. */
function wrapLabel(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width <= maxWidth || !current) {
      current = attempt;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return lines;
  let second = lines.slice(1).join(" ");
  while (ctx.measureText(`${second}…`).width > maxWidth && second.length > 1) {
    second = second.slice(0, -1);
  }
  return [lines[0], `${second}…`];
}

/* Where the line from a box's centre towards `toward` leaves the box. */
function boxExit(box: Box, toward: Point): Point {
  const dx = toward.x - box.x;
  const dy = toward.y - box.y;
  if (dx === 0 && dy === 0) return { x: box.x, y: box.y };
  const sx = Math.abs(dx) / (box.w / 2 + 4);
  const sy = Math.abs(dy) / (box.h / 2 + 4);
  const s = Math.max(sx, sy);
  return { x: box.x + dx / s, y: box.y + dy / s };
}

function distanceToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export default function CipherNetworkCanvas({
  nodes,
  edges,
  selection,
  focusNodeId,
  activeFilter,
  searchMatches,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Narrow containers (phones) lay the flow out top to bottom so it fits
  const [narrow, setNarrow] = useState(false);

  const transform = useRef({ x: 0, y: 0, scale: 1 });
  const cameraTarget = useRef<{ x: number; y: number; scale: number } | null>(null);
  const boxes = useRef<Map<string, Box>>(new Map());
  const edgePaths = useRef<Map<string, Point[]>>(new Map());
  const hovered = useRef<{ node: string | null; edge: string | null }>({ node: null, edge: null });
  const pointers = useRef<Map<number, Point>>(new Map());
  const gesture = useRef<{
    mode: "none" | "pan" | "node" | "pinch";
    nodeId?: string;
    last?: Point;
    moved?: boolean;
    pinchDistance?: number;
  }>({ mode: "none" });
  const frame = useRef<number | null>(null);
  const particleClock = useRef(0);
  const fontFamily = useRef("sans-serif");

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  // Which nodes and edges sit on the selected node's or edge's path
  const related = useMemo(() => {
    const nodeIds = new Set<string>();
    const edgeKeys = new Set<string>();
    if (selection?.kind === "node") {
      nodeIds.add(selection.id);
      for (const edge of edges) {
        if (edge.source === selection.id || edge.target === selection.id) {
          edgeKeys.add(edgeKey(edge));
          nodeIds.add(edge.source);
          nodeIds.add(edge.target);
        }
      }
    } else if (selection?.kind === "edge") {
      edgeKeys.add(selection.key);
      const [source, target] = selection.key.split("->");
      nodeIds.add(source);
      nodeIds.add(target);
    }
    return { nodeIds, edgeKeys, active: Boolean(selection) };
  }, [selection, edges]);

  const scheduleDraw = useRef<() => void>(() => {});

  /* ---------------- Layout ---------------- */

  const fitToView = useCallback((animate: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas || boxes.current.size === 0) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const box of boxes.current.values()) {
      minX = Math.min(minX, box.x - box.w / 2);
      maxX = Math.max(maxX, box.x + box.w / 2);
      minY = Math.min(minY, box.y - box.h / 2);
      maxY = Math.max(maxY, box.y + box.h / 2);
    }
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 48;
    const scale = Math.max(
      MIN_SCALE,
      Math.min(1.3, (width - padding * 2) / (maxX - minX), (height - padding * 2) / (maxY - minY)),
    );
    const target = {
      x: width / 2 - ((minX + maxX) / 2) * scale,
      y: height / 2 - ((minY + maxY) / 2) * scale,
      scale,
    };
    if (animate && !reducedMotion) {
      cameraTarget.current = target;
    } else {
      transform.current = target;
      cameraTarget.current = null;
    }
    scheduleDraw.current();
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    fontFamily.current = getComputedStyle(document.body).fontFamily || "sans-serif";
    ctx.font = `600 12px ${fontFamily.current}`;

    const nodeWidth = narrow ? 140 : NODE_WIDTH;
    const measured = new Map<string, Box>();
    for (const node of nodes) {
      const lines = wrapLabel(ctx, node.label, nodeWidth - 32);
      measured.set(node.id, { x: 0, y: 0, w: nodeWidth, h: 22 + lines.length * LINE_HEIGHT, lines });
    }

    // Lay out the causal flow left to right; therapies hang below their target.
    const g = new dagre.graphlib.Graph();
    g.setGraph(
      narrow
        ? { rankdir: "TB", nodesep: 24, ranksep: 64, marginx: 16, marginy: 16 }
        : { rankdir: "LR", nodesep: 34, ranksep: 96, marginx: 20, marginy: 20 },
    );
    g.setDefaultEdgeLabel(() => ({}));
    const flowNodes = nodes.filter((node) => node.category !== "therapy");
    for (const node of flowNodes) {
      const box = measured.get(node.id)!;
      g.setNode(node.id, { width: box.w, height: box.h });
    }
    for (const edge of edges) {
      if (g.hasNode(edge.source) && g.hasNode(edge.target)) g.setEdge(edge.source, edge.target);
    }
    dagre.layout(g);

    for (const node of flowNodes) {
      const placed = g.node(node.id);
      const box = measured.get(node.id)!;
      box.x = placed.x;
      box.y = placed.y;
    }

    // Treatments sit beside the flow: below it on wide screens, to its right on narrow ones
    let lowest = -Infinity;
    let rightmost = -Infinity;
    for (const node of flowNodes) {
      const box = measured.get(node.id)!;
      lowest = Math.max(lowest, box.y + box.h / 2);
      rightmost = Math.max(rightmost, box.x + box.w / 2);
    }
    const used: number[] = [];
    for (const node of nodes.filter((n) => n.category === "therapy")) {
      const target = edges.find((edge) => edge.source === node.id)?.target;
      const targetBox = target ? measured.get(target) : undefined;
      const box = measured.get(node.id)!;
      if (narrow) {
        let y = targetBox?.y ?? 0;
        while (used.some((uy) => Math.abs(uy - y) < box.h + 14)) y += box.h + 14;
        used.push(y);
        box.x = rightmost + 56 + box.w / 2;
        box.y = y;
      } else {
        let x = targetBox?.x ?? 0;
        while (used.some((ux) => Math.abs(ux - x) < nodeWidth + 16)) x += nodeWidth + 16;
        used.push(x);
        box.x = x;
        box.y = lowest + 70 + box.h / 2;
      }
    }

    boxes.current = measured;

    const paths = new Map<string, Point[]>();
    for (const edge of edges) {
      const from = measured.get(edge.source);
      const to = measured.get(edge.target);
      if (!from || !to) continue;
      const routed = g.hasEdge(edge.source, edge.target) ? g.edge(edge.source, edge.target)?.points : undefined;
      const inner = routed && routed.length > 2 ? routed.slice(1, -1) : [];
      const start = boxExit(from, inner[0] ?? to);
      const end = boxExit(to, inner[inner.length - 1] ?? from);
      paths.set(edgeKey(edge), [start, ...inner, end]);
    }
    edgePaths.current = paths;

    fitToView(false);
  }, [nodes, edges, fitToView, narrow]);

  // Refit when the container changes size, and switch layout direction on phones
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < 560);
      fitToView(false);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fitToView]);

  // Guided tour: glide to the step's node
  useEffect(() => {
    if (!focusNodeId) return;
    const box = boxes.current.get(focusNodeId);
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const scale = Math.max(transform.current.scale, 1);
    const target = {
      x: canvas.clientWidth / 2 - box.x * scale,
      y: canvas.clientHeight / 2 - box.y * scale,
      scale,
    };
    if (reducedMotion) {
      transform.current = target;
    } else {
      cameraTarget.current = target;
    }
    scheduleDraw.current();
  }, [focusNodeId, reducedMotion]);

  /* ---------------- Drawing ---------------- */

  const draw = useCallback(() => {
    frame.current = null;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    let keepAnimating = false;
    if (cameraTarget.current) {
      const t = cameraTarget.current;
      const c = transform.current;
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      c.scale += (t.scale - c.scale) * 0.12;
      if (Math.abs(c.x - t.x) < 0.5 && Math.abs(c.y - t.y) < 0.5 && Math.abs(c.scale - t.scale) < 0.002) {
        transform.current = { ...t };
        cameraTarget.current = null;
      } else {
        keepAnimating = true;
      }
    }

    const { x, y, scale } = transform.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#04070a";
    ctx.fillRect(0, 0, width, height);

    // Faint grid
    ctx.strokeStyle = "rgba(77, 141, 255, 0.035)";
    ctx.lineWidth = 1;
    const grid = 44 * scale;
    ctx.beginPath();
    for (let gx = x % grid; gx < width; gx += grid) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
    }
    for (let gy = y % grid; gy < height; gy += grid) {
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
    }
    ctx.stroke();

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * x, dpr * y);

    const isDimmedNode = (node: CipherNode) =>
      (activeFilter !== null && node.category !== activeFilter) ||
      (searchMatches !== null && !searchMatches.has(node.id)) ||
      (related.active && !related.nodeIds.has(node.id));

    // Edges
    for (const edge of edges) {
      const key = edgeKey(edge);
      const path = edgePaths.current.get(key);
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      if (!path || !source || !target) continue;

      const highlighted = related.edgeKeys.has(key) || hovered.current.edge === key;
      const dimmed =
        (related.active && !related.edgeKeys.has(key)) ||
        (activeFilter !== null && source.category !== activeFilter && target.category !== activeFilter) ||
        (searchMatches !== null && !searchMatches.has(edge.source) && !searchMatches.has(edge.target));
      const alpha = highlighted ? 0.95 : dimmed ? 0.1 : 0.45;
      const rgb = EDGE_COLORS[edge.relationshipType];

      ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.lineWidth = (highlighted ? 2.4 : 1.4) / Math.max(scale, 0.6);
      ctx.setLineDash(edge.hypothesis ? [6, 5] : []);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      if (path.length > 2) {
        for (let i = 1; i < path.length - 1; i++) {
          const mid = { x: (path[i].x + path[i + 1].x) / 2, y: (path[i].y + path[i + 1].y) / 2 };
          ctx.quadraticCurveTo(path[i].x, path[i].y, mid.x, mid.y);
        }
      }
      const end = path[path.length - 1];
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow end: a head for "causes", a flat bar for "blocks"
      const before = path[path.length - 2];
      const angle = Math.atan2(end.y - before.y, end.x - before.x);
      ctx.save();
      ctx.translate(end.x, end.y);
      ctx.rotate(angle);
      if (edge.relationshipType === "inhibits") {
        ctx.lineWidth = 3 / Math.max(scale, 0.6);
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(0, 7);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        if (edge.relationshipType === "transforms") {
          ctx.lineWidth = 1.5 / Math.max(scale, 0.6);
          ctx.stroke();
        } else {
          ctx.fill();
        }
      }
      ctx.restore();

      // Signal pulse along highlighted edges
      if (highlighted && !reducedMotion) {
        keepAnimating = true;
        const t = (particleClock.current / 1600) % 1;
        const a = path[0];
        const b = end;
        ctx.fillStyle = `rgba(${rgb}, 1)`;
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nodes
    for (const node of nodes) {
      const box = boxes.current.get(node.id);
      if (!box) continue;
      const colors = CATEGORY_COLORS[node.category];
      const isSelected = selection?.kind === "node" && selection.id === node.id;
      const isHovered = hovered.current.node === node.id;
      const dimmed = isDimmedNode(node) && !isSelected;
      const left = box.x - box.w / 2;
      const top = box.y - box.h / 2;

      ctx.globalAlpha = dimmed ? 0.28 : 1;

      if (isSelected || isHovered) {
        ctx.fillStyle = `${colors.stroke}33`;
        ctx.beginPath();
        ctx.roundRect(left - 5, top - 5, box.w + 10, box.h + 10, 16);
        ctx.fill();
      }

      ctx.fillStyle = colors.fill;
      ctx.strokeStyle = isSelected ? "#ffffff" : colors.stroke;
      ctx.lineWidth = isSelected ? 2 : 1.2;
      ctx.setLineDash(node.observed ? [4, 3] : []);
      ctx.beginPath();
      ctx.roundRect(left, top, box.w, box.h, 12);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.dot;
      ctx.beginPath();
      ctx.arc(left + 14, box.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isSelected ? "#ffffff" : colors.text;
      ctx.font = `${isSelected ? 700 : 600} 12px ${fontFamily.current}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      const firstLineY = box.y - ((box.lines.length - 1) * LINE_HEIGHT) / 2;
      box.lines.forEach((line, i) => ctx.fillText(line, left + 26, firstLineY + i * LINE_HEIGHT));

      ctx.globalAlpha = 1;
    }

    // Labels on highlighted edges, drawn last so they sit on top
    ctx.font = `500 11px ${fontFamily.current}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const edge of edges) {
      const key = edgeKey(edge);
      if (!related.edgeKeys.has(key) && hovered.current.edge !== key) continue;
      const path = edgePaths.current.get(key);
      if (!path) continue;
      const mid = path.length > 2 ? path[Math.floor(path.length / 2)] : {
        x: (path[0].x + path[1].x) / 2,
        y: (path[0].y + path[1].y) / 2,
      };
      const text = edge.hypothesis ? `${edge.label} (hypothesis)` : edge.label;
      const w = ctx.measureText(text).width + 14;
      ctx.fillStyle = "rgba(4, 7, 10, 0.92)";
      ctx.strokeStyle = `rgba(${EDGE_COLORS[edge.relationshipType]}, 0.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(mid.x - w / 2, mid.y - 10, w, 20, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e8edf2";
      ctx.fillText(text, mid.x, mid.y + 0.5);
    }

    if (keepAnimating) {
      particleClock.current += 16;
      scheduleDraw.current();
    }
  }, [nodes, edges, nodeById, selection, related, activeFilter, searchMatches, reducedMotion]);

  useEffect(() => {
    scheduleDraw.current = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(draw);
    };
    scheduleDraw.current();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [draw]);

  /* ---------------- Interaction ---------------- */

  const toGraph = (clientX: number, clientY: number): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { x, y, scale } = transform.current;
    return { x: (clientX - rect.left - x) / scale, y: (clientY - rect.top - y) / scale };
  };

  const hitTest = (point: Point): { node: string | null; edge: string | null } => {
    for (const [id, box] of boxes.current) {
      if (Math.abs(point.x - box.x) <= box.w / 2 && Math.abs(point.y - box.y) <= box.h / 2) {
        return { node: id, edge: null };
      }
    }
    const tolerance = 7 / transform.current.scale;
    for (const [key, path] of edgePaths.current) {
      for (let i = 0; i < path.length - 1; i++) {
        if (distanceToSegment(point, path[i], path[i + 1]) <= tolerance) return { node: null, edge: key };
      }
    }
    return { node: null, edge: null };
  };

  const zoomAt = (factor: number, screen: Point) => {
    const c = transform.current;
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, c.scale * factor));
    c.x = screen.x - (screen.x - c.x) * (scale / c.scale);
    c.y = screen.y - (screen.y - c.y) * (scale / c.scale);
    c.scale = scale;
    cameraTarget.current = null;
    scheduleDraw.current();
  };

  // Wheel zoom needs a non-passive listener to stop the page scrolling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? 1.1 : 0.9, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { mode: "pinch", pinchDistance: Math.hypot(a.x - b.x, a.y - b.y) };
      return;
    }

    const hit = hitTest(toGraph(event.clientX, event.clientY));
    gesture.current = hit.node
      ? { mode: "node", nodeId: hit.node, last: { x: event.clientX, y: event.clientY }, moved: false }
      : { mode: "pan", last: { x: event.clientX, y: event.clientY }, moved: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    const g = gesture.current;

    if (g.mode === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = canvasRef.current!.getBoundingClientRect();
      zoomAt(distance / (g.pinchDistance || distance), {
        x: (a.x + b.x) / 2 - rect.left,
        y: (a.y + b.y) / 2 - rect.top,
      });
      g.pinchDistance = distance;
      return;
    }

    if ((g.mode === "pan" || g.mode === "node") && g.last) {
      const dx = event.clientX - g.last.x;
      const dy = event.clientY - g.last.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;
      if (!g.moved) return;
      g.last = { x: event.clientX, y: event.clientY };
      if (g.mode === "pan") {
        transform.current.x += dx;
        transform.current.y += dy;
        cameraTarget.current = null;
      } else if (g.nodeId) {
        const box = boxes.current.get(g.nodeId);
        if (box) {
          box.x += dx / transform.current.scale;
          box.y += dy / transform.current.scale;
          // Re-route the node's edges as straight lines while dragging
          for (const edge of edges) {
            if (edge.source !== g.nodeId && edge.target !== g.nodeId) continue;
            const from = boxes.current.get(edge.source);
            const to = boxes.current.get(edge.target);
            if (from && to) edgePaths.current.set(edgeKey(edge), [boxExit(from, to), boxExit(to, from)]);
          }
        }
      }
      scheduleDraw.current();
      return;
    }

    // Hover feedback
    const hit = hitTest(toGraph(event.clientX, event.clientY));
    if (hit.node !== hovered.current.node || hit.edge !== hovered.current.edge) {
      hovered.current = hit;
      if (canvasRef.current) canvasRef.current.style.cursor = hit.node || hit.edge ? "pointer" : "grab";
      scheduleDraw.current();
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(event.pointerId);
    const g = gesture.current;
    if (g.mode === "node" && !g.moved && g.nodeId) {
      onSelect({ kind: "node", id: g.nodeId });
    } else if (g.mode === "pan" && !g.moved) {
      const hit = hitTest(toGraph(event.clientX, event.clientY));
      onSelect(hit.edge ? { kind: "edge", key: hit.edge } : null);
    }
    gesture.current = { mode: pointers.current.size === 1 ? "pan" : "none", last: [...pointers.current.values()][0] };
  };

  const zoomButton = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    zoomAt(factor, { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else containerRef.current.requestFullscreen().catch(() => {});
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "biolayers-cipher-map.png";
    link.click();
  };

  const controlClass =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-teal-200/30 hover:bg-teal-300/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8db2ff]";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden rounded-2xl border border-teal-200/15 bg-[#04070a]"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Cause and effect map with ${nodes.length} steps and ${edges.length} links. Use the outline view for a text version.`}
        className="h-full w-full cursor-grab touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          if (hovered.current.node || hovered.current.edge) {
            hovered.current = { node: null, edge: null };
            scheduleDraw.current();
          }
        }}
        onDoubleClick={() => fitToView(true)}
      />

      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl border border-teal-200/20 bg-[#070d14]/90 p-1.5 shadow-lg backdrop-blur-xl">
        <button type="button" onClick={() => zoomButton(1.2)} aria-label="Zoom in" className={controlClass}>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => zoomButton(1 / 1.2)} aria-label="Zoom out" className={controlClass}>
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => fitToView(true)} aria-label="Fit the whole map" className={controlClass}>
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
        </button>
        <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-white/10" />
        <button type="button" onClick={downloadImage} aria-label="Download the map as an image" className={controlClass}>
          <Camera className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          className={controlClass}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 hidden flex-col gap-1 rounded-xl border border-white/10 bg-[#070c14]/85 px-3 py-2 font-mono text-[10px] text-slate-300 backdrop-blur-xl md:flex"
      >
        <span className="flex items-center gap-2">
          <svg width="26" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#67e8f9" strokeWidth="1.6" /><path d="M26 4 L18 0 L18 8 Z" fill="#67e8f9" /></svg>
          Causes
        </span>
        <span className="flex items-center gap-2">
          <svg width="26" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#fb7185" strokeWidth="1.6" /><line x1="25" y1="0" x2="25" y2="10" stroke="#fb7185" strokeWidth="2.4" /></svg>
          Blocks
        </span>
        <span className="flex items-center gap-2">
          <svg width="26" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#c084fc" strokeWidth="1.6" /><path d="M26 4 L18 0 L18 8 Z" fill="none" stroke="#c084fc" strokeWidth="1.2" /></svg>
          Reshapes
        </span>
        <span className="flex items-center gap-2">
          <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#cbd5e1" strokeWidth="1.6" strokeDasharray="4 3" /></svg>
          Hypothesis
        </span>
      </div>
    </div>
  );
}
