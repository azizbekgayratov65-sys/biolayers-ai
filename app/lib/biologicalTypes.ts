export const BIOLOGICAL_ENTITY_TYPES = [
  "cell",
  "cellLine",
  "protein",
  "gene",
  "pathway",
  "process",
  "disease",
  "drug",
  "chemical",
  "tissue",
  "organ",
  "anatomicalStructure",
  "complex",
  "reaction",
  "publication",
] as const;

export type BiologicalEntityType =
  (typeof BIOLOGICAL_ENTITY_TYPES)[number];

export type ExternalKnowledgeSource =
  | "Cell Ontology"
  | "Cell Line Ontology"
  | "PubMed"
  | "Reactome"
  | "UniProt"
  | "NCBI Gene"
  | "ChEBI"
  | "Uberon";

export type ExternalEntityReference = {
  id: string;
  iri?: string;
  label: string;
  description: string;
  type: BiologicalEntityType;
  source: ExternalKnowledgeSource;
  synonyms?: string[];
};

export const BIOLOGICAL_TYPE_LABELS: Record<
  BiologicalEntityType,
  string
> = {
  cell: "Cell",
  cellLine: "Cell line",
  protein: "Protein",
  gene: "Gene",
  pathway: "Pathway",
  process: "Process",
  disease: "Disease",
  drug: "Drug",
  chemical: "Chemical",
  tissue: "Tissue",
  organ: "Organ",
  anatomicalStructure:
    "Anatomical structure",
  complex: "Molecular complex",
  reaction: "Reaction",
  publication: "Publication",
};