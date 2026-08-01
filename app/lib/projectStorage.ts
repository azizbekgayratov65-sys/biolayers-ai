import type { Edge, Node } from "@xyflow/react";

import type {
  EntityData,
  EntityType,
} from "./buildGraphFromText";

export type SavedLayoutDirection = "TB" | "LR";

export type SavedLayerState = Record<
  EntityType,
  boolean
>;

export type SavedEntityNode = Node<
  EntityData,
  "entity"
>;

export type SavedBioLayersProject = {
  version: 1;
  name: string;
  sourceText: string;
  nodes: SavedEntityNode[];
  edges: Edge[];
  layers: SavedLayerState;
  layoutDirection: SavedLayoutDirection;
  selectedId: string;
  savedAt: string;
};

const STORAGE_KEY = "biolayers-saved-project";

export function saveBioLayersProject(
  project: SavedBioLayersProject,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(project),
  );
}

export function loadBioLayersProject():
  | SavedBioLayersProject
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedProject =
    window.localStorage.getItem(STORAGE_KEY);

  if (!storedProject) {
    return null;
  }

  try {
    const parsedProject = JSON.parse(
      storedProject,
    ) as Partial<SavedBioLayersProject>;

    if (
      parsedProject.version !== 1 ||
      typeof parsedProject.name !== "string" ||
      typeof parsedProject.sourceText !==
        "string" ||
      !Array.isArray(parsedProject.nodes) ||
      !Array.isArray(parsedProject.edges) ||
      !parsedProject.layers ||
      (parsedProject.layoutDirection !==
        "TB" &&
        parsedProject.layoutDirection !==
          "LR") ||
      typeof parsedProject.selectedId !==
        "string" ||
      typeof parsedProject.savedAt !== "string"
    ) {
      return null;
    }

    return parsedProject as SavedBioLayersProject;
  } catch (error) {
    console.error(
      "Could not read the saved BioLayers project:",
      error,
    );

    return null;
  }
}

export function deleteBioLayersProject() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedBioLayersProject() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(
    STORAGE_KEY,
  ) !== null;
}