import type {
  EntityData,
  EntityType,
} from "./buildGraphFromText";

/* =========================================================
   RELATION TYPES
   ========================================================= */

export type RelationType =
  | "activates"
  | "inhibits"
  | "promotes"
  | "suppresses"
  | "expresses"
  | "secretes"
  | "recruits"
  | "remodels"
  | "associated_with"
  | "metastasizes_to"
  | "regulates"
  | "interacts_with"
  | "other";

export type RelationDirectionality =
  | "directed"
  | "undirected";

/* =========================================================
   EVIDENCE CLASSIFICATION
   ========================================================= */

export type EvidenceClassification =
  | "supporting"
  | "contradicting"
  | "contextual"
  | "unrelated"
  | "unclassified";

export type EvidenceStrength =
  | "unassessed"
  | "limited"
  | "moderate"
  | "strong";

export type EvidenceBasis =
  | "metadata_only"
  | "abstract_and_metadata"
  | "source_text_and_metadata"
  | "source_text_abstract_and_metadata";

export type EvidencePaperAssessment = {
  pmid: string;

  classification:
    EvidenceClassification;

  /*
    Confidence in the paper classification.
    This is NOT confidence that the biological
    relationship is universally true.
  */
  confidence?: number;

  rationale?: string;

  /*
    What information the classifier actually used.
  */
  evidenceBasis?:
    EvidenceBasis;

  /*
    Only populate this with real source text.
    Never generate a quotation.
  */
  evidenceQuote?: string;

  analyzedAt?: string;
};

export type EvidenceSummary = {
  totalCandidates: number;
  analyzed: number;

  withAbstract?: number;
  withoutAbstract?: number;

  supporting: number;
  contradicting: number;
  contextual: number;
  unrelated: number;
  unclassified: number;

  strength:
    EvidenceStrength;
};

/* =========================================================
   ENTITY DATA
   ========================================================= */

export type ResearchEntityData =
  EntityData & {
    aliases?: string[];

    /*
      Confidence of entity extraction from
      the submitted source text.
    */
    confidence?: number;

    /*
      Exact or near-exact supporting text
      from the submitted source material.
    */
    evidenceQuote?: string;
  };

/* =========================================================
   EDGE DATA
   ========================================================= */

export type ResearchEdgeData = {
  relationType?: RelationType;

  description?: string;

  /*
    Confidence of relation extraction.
    This is NOT biological truth confidence.
  */
  confidence?: number;

  /*
    Evidence extracted directly from the
    user's submitted source text.
  */
  evidenceQuote?: string;

  directionality?:
    RelationDirectionality;

  /*
    Number of candidate PubMed papers
    currently retrieved.

    IMPORTANT:
    This is retrieval volume, not the number
    of verified supporting papers.
  */
  evidenceCount?: number;

  /*
    Explicit PubMed query used for this edge.
  */
  literatureQuery?: string;

  /*
    Paper-level PubMed evidence classification.
  */
  paperAssessments?:
    EvidencePaperAssessment[];

  /*
    Aggregated PubMed evidence classification.
  */
  evidenceSummary?:
    EvidenceSummary;

  /*
    Timestamp of the latest evidence analysis.
  */
  evidenceAnalyzedAt?: string;
};

/* =========================================================
   API GRAPH ENTITY
   ========================================================= */

export type ApiEntity = {
  id: string;

  label: string;

  type: EntityType;

  description: string;

  aliases: string[];

  confidence: number;

  evidenceQuote: string;
};

/* =========================================================
   API GRAPH RELATION
   ========================================================= */

export type ApiRelation = {
  source: string;

  target: string;

  label: string;

  relationType:
    RelationType;

  description: string;

  confidence: number;

  evidenceQuote: string;

  directionality:
    RelationDirectionality;
};

/* =========================================================
   GRAPH SUMMARY
   ========================================================= */

export type GraphSummary = {
  title: string;

  oneSentenceMechanism: string;

  limitations: string[];
};

/* =========================================================
   GRAPH META
   ========================================================= */

export type GraphMeta = {
  provider?: string;

  model?: string;

  entityCount?: number;

  relationCount?: number;
};

/* =========================================================
   GRAPH RESPONSE
   ========================================================= */

export type ApiGraphResponse = {
  entities: ApiEntity[];

  relations: ApiRelation[];

  summary?: GraphSummary;

  meta?: GraphMeta;

  error?: string;
};