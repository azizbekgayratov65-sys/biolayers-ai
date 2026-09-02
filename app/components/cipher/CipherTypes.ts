export type NodeCategory = "trigger" | "mechanism" | "effect" | "therapy";

export type CipherNode = {
  id: string;
  label: string;
  category: NodeCategory;
  level: number; // 1 = Trigger/Root Cause, 2 = Signaling Cascade, 3 = Phenotype/Effect, 4 = Clinical/Therapy
  weight: number; // 1-5 (controls visual radius and gravitational mass)
  // Student Decoder content
  plainTitle: string;
  plainExplanation: string; // Everyday student analogy
  academicExcerpt: string; // Real scientific quote / formal mechanism
  keyMolecules?: string[]; // e.g. ["KRAS", "GTP", "RAF"]
  // Physics / position hints
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

export type CipherEdge = {
  source: string;
  target: string;
  label: string; // e.g. "Hyperactivates", "Phosphorylates", "Blocks", "Induces"
  relationshipType: "activates" | "inhibits" | "transforms" | "targets";
  mechanismDetail: string; // Concise explanation of why A causes B
};

export type GuidedTourStep = {
  nodeId: string;
  stepNumber: number;
  title: string;
  concept: string;
  questionPrompt?: string;
};

export type CipherDataset = {
  id: string;
  title: string;
  subtitle: string;
  paperDoiOrPmc?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedReadTime: string;
  oneLineSummary: string;
  nodes: CipherNode[];
  edges: CipherEdge[];
  tour: GuidedTourStep[];
};
