export type NodeCategory = "trigger" | "mechanism" | "effect" | "therapy";

/* A peer-reviewed source. Every PMID here was checked against PubMed. */
export type Citation = {
  label: string; // "Hunter et al., Mol Cancer Res 2015"
  pmid: string;
  doi?: string;
  // What the paper actually shows, when it differs from the claim's setting
  context?: string;
};

export type CipherNode = {
  id: string;
  label: string;
  category: NodeCategory;
  // Student view
  plainTitle: string;
  plainExplanation: string; // Everyday analogy, deliberately simplified
  // Technical view: our own summary in field terms, not a quotation
  technical: string;
  pronunciation?: string;
  keyMolecules?: string[];
  sources?: Citation[];
  // For therapies: approved drugs differ from experimental ones
  drugStatus?: "approved" | "experimental";
  // Optional jump to related BioLayers content (cell atlas, validation report)
  link?: { href: string; label: string };
  // Observed directly in an image rather than taken from literature
  observed?: boolean;
};

export type CipherEdge = {
  source: string;
  target: string;
  label: string; // short verb phrase drawn on the arrow
  relationshipType: "activates" | "inhibits" | "transforms" | "targets";
  mechanismDetail: string; // why A leads to B, in one or two sentences
  evidence: Citation[]; // why BioLayers believes this arrow
  hypothesis?: boolean; // plausible from literature, not shown directly
};

export type GuidedTourStep = {
  nodeId: string;
  title: string;
  concept: string;
  questionPrompt?: string;
};

export type StudentQuiz = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string; // written to make sense whichever answer was picked
};

export type CipherDataset = {
  id: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedReadTime: string;
  oneLineSummary: string;
  primarySources: Citation[]; // the reviews or papers the whole map leans on
  reviewed: string; // when the content was last checked against its sources
  nodes: CipherNode[];
  edges: CipherEdge[];
  tour: GuidedTourStep[];
  quiz?: StudentQuiz;
};
