import type {
  EntityData,
  EntityType,
} from "./buildGraphFromText";

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

export type ResearchEntityData =
  EntityData & {
    aliases?: string[];
    confidence?: number;
    evidenceQuote?: string;
  };

export type ResearchEdgeData = {
  relationType?: RelationType;
  description?: string;
  confidence?: number;
  evidenceQuote?: string;
  directionality?: RelationDirectionality;
  evidenceCount?: number;
};

export type ApiEntity = {
  id: string;
  label: string;
  type: EntityType;
  description: string;
  aliases: string[];
  confidence: number;
  evidenceQuote: string;
};

export type ApiRelation = {
  source: string;
  target: string;
  label: string;
  relationType: RelationType;
  description: string;
  confidence: number;
  evidenceQuote: string;
  directionality: RelationDirectionality;
};

export type GraphSummary = {
  title: string;
  oneSentenceMechanism: string;
  limitations: string[];
};

export type GraphMeta = {
  provider?: string;
  model?: string;
  entityCount?: number;
  relationCount?: number;
};

export type ApiGraphResponse = {
  entities: ApiEntity[];
  relations: ApiRelation[];
  summary?: GraphSummary;
  meta?: GraphMeta;
  error?: string;
};