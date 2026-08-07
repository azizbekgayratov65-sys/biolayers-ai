"use client";

import { useCallback, useState } from "react";

export type WorkspaceView =
  | "graph"
  | "evidence"
  | "citations"
  | "timeline"
  | "cells"
  | "pubmed";

type UseWorkspaceOptions = {
  initialView?: WorkspaceView;
  initialCinematicFocus?: boolean;
};

export default function useWorkspace({
  initialView = "graph",
  initialCinematicFocus = false,
}: UseWorkspaceOptions = {}) {
  const [workspaceView, setWorkspaceView] =
    useState<WorkspaceView>(initialView);

  const [
    cinematicFocus,
    setCinematicFocus,
  ] = useState(initialCinematicFocus);

  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(null);

  const [
    selectedEdgeId,
    setSelectedEdgeId,
  ] = useState<string | null>(null);

  const [
    hoveredId,
    setHoveredId,
  ] = useState<string | null>(null);

  const changeWorkspaceView = useCallback(
    (view: WorkspaceView) => {
      setWorkspaceView(view);
    },
    [],
  );

  const toggleCinematicFocus =
    useCallback(() => {
      setCinematicFocus(
        (current) => !current,
      );
    }, []);

  const selectNode = useCallback(
    (nodeId: string | null) => {
      setSelectedId(nodeId);

      if (nodeId !== null) {
        setSelectedEdgeId(null);
      }
    },
    [],
  );

  const selectEdge = useCallback(
    (edgeId: string | null) => {
      setSelectedEdgeId(edgeId);

      if (edgeId !== null) {
        setSelectedId(null);
      }
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedEdgeId(null);
    setHoveredId(null);
  }, []);

  const resetWorkspaceUi =
    useCallback(() => {
      setWorkspaceView(initialView);
      setCinematicFocus(
        initialCinematicFocus,
      );
      setSelectedId(null);
      setSelectedEdgeId(null);
      setHoveredId(null);
    }, [
      initialView,
      initialCinematicFocus,
    ]);

  return {
    // Workspace navigation
    workspaceView,
    setWorkspaceView,
    changeWorkspaceView,

    // Cinematic mode
    cinematicFocus,
    setCinematicFocus,
    toggleCinematicFocus,

    // Selection
    selectedId,
    setSelectedId,
    selectedEdgeId,
    setSelectedEdgeId,
    hoveredId,
    setHoveredId,

    // Selection helpers
    selectNode,
    selectEdge,
    clearSelection,

    // Reset
    resetWorkspaceUi,
  };
}