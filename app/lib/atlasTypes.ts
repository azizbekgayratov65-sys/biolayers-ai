/* =========================================================
   BIOLAYERS CELL ATLAS — DOMAIN TYPES
   Phase 1 Foundation: Provenance, Morphology, Evidence
   ========================================================= */

export type MicroscopyModality =
  | "confocal"
  | "fluorescence"
  | "brightfield"
  | "phase_contrast"
  | "two_photon"
  | "electron"
  | "super_resolution";

export const MODALITY_LABELS: Record<MicroscopyModality, string> = {
  confocal: "Confocal Laser Scanning",
  fluorescence: "Widefield Fluorescence",
  brightfield: "Brightfield",
  phase_contrast: "Phase Contrast",
  two_photon: "Two-Photon Multi-Photon",
  electron: "Electron Microscopy",
  super_resolution: "Super-Resolution (STED/SIM)",
};

export type EvidenceLevel =
  | "observed_directly_in_image"
  | "supported_by_literature"
  | "inferred_by_model";

export const EVIDENCE_BADGES: Record<
  EvidenceLevel,
  { symbol: string; label: string; tone: string; description: string }
> = {
  observed_directly_in_image: {
    symbol: "□",
    label: "Observed in image",
    tone: "border-teal-400/40 bg-teal-500/10 text-teal-200",
    description: "Quantitative measurement derived directly from pixel data with verified units.",
  },
  supported_by_literature: {
    symbol: "▤",
    label: "Supported by literature",
    tone: "border-sky-400/40 bg-sky-500/10 text-sky-200",
    description: "Peer-reviewed published experimental finding with citation and defined experimental scope.",
  },
  inferred_by_model: {
    symbol: "◇",
    label: "Inferred by model",
    tone: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    description: "Hypothesis or association suggested by an AI model; not independently verified.",
  },
};

/* =========================================================
   MANDATORY PROVENANCE METADATA (PRIORITY 1)
   ========================================================= */
export type MicroscopyProvenance = {
  cellLine: string;
  organism: string;
  tissue: string;
  disease?: string;
  microscopyModality: MicroscopyModality;
  microscope: string;
  objective: string;
  pixelSizeUm: number;
  timeIntervalSec?: number;
  staining: string;
  treatment: string;
  source: string;
  doiPmid?: string;
  datasetAccession: string;
  license: string;
  attribution: string;
};

/* =========================================================
   IMAGE CHANNELS (FLUOROPHORES & SPECTRAL BANDS)
   ========================================================= */
export type ImageChannel = {
  id: string;
  channelIndex: number;
  name: string;
  fluorophore: string;
  emissionWavelengthNm?: number;
  assignedColor: string; // Hex color string
  defaultIntensity: number; // 0.0 to 2.0
};

/* =========================================================
   CELLULAR & NUCLEAR MORPHOMETRICS
   ========================================================= */
export type MorphologyMetric = {
  id: string;
  cellIndex: number;
  objectType: "nucleus" | "whole_cell" | "membrane";
  centroidX: number;
  centroidY: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  areaPx2: number;
  areaUm2?: number;
  perimeterPx: number;
  circularity: number; // 4 * pi * area / perimeter^2
  aspectRatio: number; // major axis / minor axis
  eccentricity?: number;
  meanIntensity?: number;
  medianIntensity?: number;
  intensityStd?: number;
  textureEntropyBits?: number;
  modelName: string;
  modelVersion: string;
  confidence?: number;
  evidenceLevel: EvidenceLevel;
};

/* =========================================================
   10-BLOCK CELL CARD ENTITIES (PRIORITY 2)
   ========================================================= */
export type CellCardBlockType =
  | "microscopy_image"
  | "metadata"
  | "biological_context"
  | "associated_genes"
  | "associated_proteins"
  | "pathways"
  | "diseases"
  | "phenotypes"
  | "literature_evidence"
  | "dataset_source";

export type AssociatedBiologicalEntity = {
  id: string;
  type: "gene" | "protein" | "pathway" | "disease" | "phenotype" | "literature";
  identifier: string;
  label: string;
  description: string;
  externalRef?: string;
  evidenceLevel: EvidenceLevel;
  pmid?: string;
};

/* =========================================================
   MASTER CELL ATLAS RECORD
   ========================================================= */
export type MicroscopyImageRecord = MicroscopyProvenance & {
  id: string;
  cellTypeId: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  dziPath?: string;
  widthPx: number;
  heightPx: number;
  channelCount: number;
  zStackSlices: number;
  timePoints: number;
  isFlagship: boolean;
  channels: ImageChannel[];
};

export type CellTypeRecord = {
  id: string;
  name: string;
  label: string;
  ontologyId?: string;
  ontologyLabel?: string;
  organism: string;
  tissue: string;
  disease?: string;
  lineage?: string;
  biologicalContext: string;
  synonyms: string[];
  isCancerAssociated: boolean;
};

export type CellAtlasDetail = {
  cellType: CellTypeRecord;
  image: MicroscopyImageRecord;
  morphologySummary: {
    totalSegmentedObjects: number;
    meanAreaUm2?: number;
    meanCircularity: number;
    meanAspectRatio: number;
    benchmarkModel: string;
    sampleMetrics: MorphologyMetric[];
  };
  entities: {
    genes: AssociatedBiologicalEntity[];
    proteins: AssociatedBiologicalEntity[];
    pathways: AssociatedBiologicalEntity[];
    diseases: AssociatedBiologicalEntity[];
    phenotypes: AssociatedBiologicalEntity[];
    literature: AssociatedBiologicalEntity[];
  };
};

/* =========================================================
   CATALOG FILTERS (PRIORITY 1)
   ========================================================= */
export type CellAtlasFilters = {
  search?: string;
  cellLine?: string;
  cancerType?: string;
  tissue?: string;
  organism?: string;
  modality?: MicroscopyModality | "all";
  phenotype?: string;
  dataset?: string;
  condition?: string;
  page?: number;
  pageSize?: number;
};
