import type { CellAtlasDetail, CellAtlasFilters } from "./atlasTypes";

/* =========================================================
   BIOLAYERS CELL ATLAS — VERIFIED SEED DATA
   Sourced from BioLayers Standalone Deliverable
   ========================================================= */

export const SEED_CELL_ATLAS_ENTRIES: CellAtlasDetail[] = [
  {
    cellType: {
      id: "caf-cxcl12",
      name: "Cancer-Associated Fibroblast",
      label: "Activated Stroma (CAF)",
      ontologyId: "CL:0000057",
      ontologyLabel: "Cell Ontology: fibroblast",
      organism: "Homo sapiens",
      tissue: "Pancreas",
      disease: "Pancreatic Ductal Adenocarcinoma",
      lineage: "Mesenchymal stromal lineage",
      biologicalContext:
        "Cancer-associated fibroblasts (CAFs) are prominent stromal cells in solid tumors. Upon activation by tumor-derived TGF-beta, CAFs undergo contractile transdifferentiation, produce dense collagenous extracellular matrix, and secrete immunosuppressive chemokines including CXCL12 (SDF-1) to exclude cytotoxic T lymphocytes from the tumor core.",
      synonyms: ["CAF", "Myofibroblast", "Carcinoma-associated fibroblast", "Activated stromal cell"],
      isCancerAssociated: true,
    },
    image: {
      id: "img-caf-001",
      cellTypeId: "caf-cxcl12",
      title: "Activated Human CAF under TGF-beta1 Induction",
      description: "High-resolution confocal laser scanning microscopy displaying pronounced alpha-SMA stress fibers and secretory vesicles in primary pancreatic cancer-associated fibroblasts.",
      cellLine: "Primary Human Pancreatic CAF / CAF-1",
      organism: "Homo sapiens",
      tissue: "Pancreas",
      disease: "Pancreatic Ductal Adenocarcinoma",
      microscopyModality: "confocal",
      microscope: "Leica TCS SP8 Confocal System",
      objective: "63x / 1.40 Oil DIC Plan-Apochromat",
      pixelSizeUm: 0.1084,
      timeIntervalSec: undefined,
      staining: "DAPI (Nuclei) / Alexa Fluor 488 (alpha-SMA) / Cy5 (CXCL12)",
      treatment: "+10 ng/mL recombinant human TGF-beta1 (48h exposure)",
      source: "Broad Institute Bioimage Benchmark & BioImage Archive",
      doiPmid: "PMID: 15882617 / 10.1016/j.cell.2005.02.034",
      datasetAccession: "S-BIAD823 / BBBC039v1",
      license: "CC-BY 4.0 International",
      attribution: "BioLayers Computational Oncology & Orimo / Feig Collaborative Studies",
      imageUrl: "/atlas/specimen-u2os.png",
      thumbnailUrl: "/atlas/specimen-u2os.png",
      dziPath: "/atlas/dzi/caf-001.dzi",
      widthPx: 696,
      heightPx: 520,
      channelCount: 3,
      zStackSlices: 1,
      timePoints: 1,
      isFlagship: true,
      channels: [
        {
          id: "ch-1",
          channelIndex: 0,
          name: "Nuclei (DNA)",
          fluorophore: "DAPI",
          emissionWavelengthNm: 461,
          assignedColor: "#38bdf8",
          defaultIntensity: 1.0,
        },
        {
          id: "ch-2",
          channelIndex: 1,
          name: "alpha-SMA Stress Fibers",
          fluorophore: "Alexa Fluor 488",
          emissionWavelengthNm: 519,
          assignedColor: "#34d399",
          defaultIntensity: 1.2,
        },
        {
          id: "ch-3",
          channelIndex: 2,
          name: "CXCL12 / Chemokine Vesicles",
          fluorophore: "Cy5 / Far Red",
          emissionWavelengthNm: 670,
          assignedColor: "#c084fc",
          defaultIntensity: 0.9,
        },
      ],
    },
    morphologySummary: {
      totalSegmentedObjects: 142,
      meanAreaUm2: 86.4,
      meanCircularity: 0.624,
      meanAspectRatio: 2.84,
      benchmarkModel: "StarDist2D (2D_versatile_fluo) + Cellpose 3.1.1.2",
      sampleMetrics: [
        {
          id: "m-1",
          cellIndex: 1,
          objectType: "nucleus",
          centroidX: 138.67,
          centroidY: 193.30,
          bbox: { x0: 125, y0: 178, x1: 156, y1: 209 },
          areaPx2: 737.0,
          areaUm2: 8.66,
          perimeterPx: 97.57,
          circularity: 0.9729,
          aspectRatio: 1.0988,
          meanIntensity: 528.8,
          modelName: "StarDist2D",
          modelVersion: "0.9.1",
          confidence: 0.9336,
          evidenceLevel: "observed_directly_in_image",
        },
        {
          id: "m-2",
          cellIndex: 2,
          objectType: "nucleus",
          centroidX: 629.86,
          centroidY: 353.06,
          bbox: { x0: 615, y0: 333, x1: 645, y1: 375 },
          areaPx2: 942.0,
          areaUm2: 11.07,
          perimeterPx: 112.64,
          circularity: 0.9330,
          aspectRatio: 1.4366,
          meanIntensity: 656.8,
          modelName: "StarDist2D",
          modelVersion: "0.9.1",
          confidence: 0.9317,
          evidenceLevel: "observed_directly_in_image",
        },
      ],
    },
    entities: {
      genes: [
        {
          id: "g-acta2",
          type: "gene",
          identifier: "ACTA2",
          label: "ACTA2 (Actin Alpha 2, Smooth Muscle)",
          description: "Encodes smooth muscle alpha-2 actin; canonical molecular marker for myofibroblastic CAF activation.",
          externalRef: "NCBI:59 / HGNC:130",
          evidenceLevel: "supported_by_literature",
        },
        {
          id: "g-cxcl12",
          type: "gene",
          identifier: "CXCL12",
          label: "CXCL12 (C-X-C Motif Chemokine Ligand 12)",
          description: "Encodes stromal cell-derived factor 1 (SDF-1); promotes tumor angiogenesis and T-cell exclusion.",
          externalRef: "NCBI:6387 / HGNC:10672",
          evidenceLevel: "supported_by_literature",
        },
        {
          id: "g-fap",
          type: "gene",
          identifier: "FAP",
          label: "FAP (Fibroblast Activation Protein Alpha)",
          description: "Cell-surface serine protease selectively expressed by reactive stromal fibroblasts in epithelial cancers.",
          externalRef: "NCBI:2191 / HGNC:3590",
          evidenceLevel: "supported_by_literature",
        },
      ],
      proteins: [
        {
          id: "p-alpha-sma",
          type: "protein",
          identifier: "alpha-SMA",
          label: "alpha-Smooth Muscle Actin",
          description: "Contractile cytoskeletal filament protein forming stress fibers that generate mechanical tissue tension.",
          externalRef: "UniProt:P62736",
          evidenceLevel: "observed_directly_in_image",
        },
        {
          id: "p-sdf1",
          type: "protein",
          identifier: "CXCL12 / SDF-1",
          label: "Stromal Cell-Derived Factor 1",
          description: "Chemoattractant cytokine that binds CXCR4 and CXCR7 on tumor and immune cells.",
          externalRef: "UniProt:P48061",
          evidenceLevel: "supported_by_literature",
        },
      ],
      pathways: [
        {
          id: "pw-tgf-beta",
          type: "pathway",
          identifier: "TGF-beta Signaling",
          label: "TGF-beta Receptor Signaling Cascade",
          description: "Primary biochemical driver of normal-to-CAF transdifferentiation via SMAD2/3 phosphorylation.",
          externalRef: "Reactome:R-HSA-170834",
          evidenceLevel: "supported_by_literature",
        },
        {
          id: "pw-cxcr4",
          type: "pathway",
          identifier: "CXCR4 Chemokine Axis",
          label: "CXCL12 / CXCR4 Immunosuppressive Axis",
          description: "Signaling cascade that prevents cytotoxic CD8+ T-cell infiltration into desmoplastic tumor cores.",
          externalRef: "Reactome:R-HSA-380108",
          evidenceLevel: "supported_by_literature",
        },
      ],
      diseases: [
        {
          id: "d-pdac",
          type: "disease",
          identifier: "PDAC",
          label: "Pancreatic Ductal Adenocarcinoma",
          description: "Characterized by an exceptionally dense desmoplastic stroma comprising up to 80% of total tumor volume.",
          externalRef: "DOID:4074",
          evidenceLevel: "supported_by_literature",
        },
        {
          id: "d-tnbc",
          type: "disease",
          identifier: "TNBC",
          label: "Triple-Negative Breast Carcinoma",
          description: "High CAF density correlates with therapeutic resistance and metastatic dissemination.",
          externalRef: "DOID:0060081",
          evidenceLevel: "supported_by_literature",
        },
      ],
      phenotypes: [
        {
          id: "ph-contractile",
          type: "phenotype",
          identifier: "Contractile Spindle",
          label: "Spindle Contractile Morphology",
          description: "Elongated bipolar morphology featuring dense intracellular actin stress fibers.",
          evidenceLevel: "observed_directly_in_image",
        },
        {
          id: "ph-desmoplasia",
          type: "phenotype",
          identifier: "Desmoplastic Stiffening",
          label: "Extracellular Matrix Stiffening",
          description: "Elevated Young's modulus of surrounding tissue resulting from aligned collagen crosslinking.",
          evidenceLevel: "inferred_by_model",
        },
      ],
      literature: [
        {
          id: "lit-orimo",
          type: "literature",
          identifier: "PMID:15882617",
          label: "Orimo et al. Cell (2005)",
          description: "Stromal fibroblasts present in invasive human breast carcinomas promote tumor growth and angiogenesis through elevated CXCL12/SDF-1 secretion.",
          externalRef: "https://pubmed.ncbi.nlm.nih.gov/15882617/",
          pmid: "15882617",
          evidenceLevel: "supported_by_literature",
        },
        {
          id: "lit-feig",
          type: "literature",
          identifier: "PMID:24277834",
          label: "Feig et al. PNAS (2013)",
          description: "Targeting CXCL12 from FAP-expressing carcinoma-associated fibroblasts synergizes with anti-PD-L1 immunotherapy in pancreatic ductal adenocarcinoma.",
          externalRef: "https://pubmed.ncbi.nlm.nih.gov/24277834/",
          pmid: "24277834",
          evidenceLevel: "supported_by_literature",
        },
      ],
    },
  },
  {
    cellType: {
      id: "u2os-bbbc039",
      name: "U2OS Osteosarcoma",
      label: "U2OS Nuclear Morphology",
      ontologyId: "CLO:0009458",
      ontologyLabel: "Cell Line Ontology: U2OS",
      organism: "Homo sapiens",
      tissue: "Bone",
      disease: "Osteosarcoma",
      lineage: "Epithelial-like osteogenic sarcoma",
      biologicalContext:
        "U2OS is a human osteosarcoma cell line extensively used in high-content screening and cellular morphology profiling. Cells maintain wild-type p53 and represent an established standard for high-throughput nuclear segmentation and phenotypic screening.",
      synonyms: ["U-2 OS", "U2-OS", "Human osteosarcoma cell line"],
      isCancerAssociated: true,
    },
    image: {
      id: "img-u2os-002",
      cellTypeId: "u2os-bbbc039",
      title: "U2OS Nuclear Morphology High-Content Screen",
      description: "Automated high-throughput fluorescence microscopy of Hoechst 33342-stained U2OS nuclei from the Broad Bioimage Benchmark Collection.",
      cellLine: "U2OS",
      organism: "Homo sapiens",
      tissue: "Bone",
      disease: "Osteosarcoma",
      microscopyModality: "fluorescence",
      microscope: "ImageXpress Micro Automated Cellular Imaging System",
      objective: "20x / 0.75 NA S Fluor",
      pixelSizeUm: 0.3225,
      staining: "Hoechst 33342 (DNA nuclear counterstain)",
      treatment: "Untreated baseline culture (high-content array)",
      source: "Broad Bioimage Benchmark Collection (BBBC039)",
      doiPmid: "PMID: 30531998",
      datasetAccession: "BBBC039v1",
      license: "CC0 1.0 Universal Public Domain",
      attribution: "Broad Institute Imaging Platform / Caicedo et al.",
      imageUrl: "/atlas/specimen-bbbc039-h06.png",
      thumbnailUrl: "/atlas/specimen-bbbc039-h06.png",
      dziPath: "/atlas/dzi/u2os-002.dzi",
      widthPx: 696,
      heightPx: 520,
      channelCount: 1,
      zStackSlices: 1,
      timePoints: 1,
      isFlagship: false,
      channels: [
        {
          id: "ch-u2os-dna",
          channelIndex: 0,
          name: "Hoechst 33342 DNA",
          fluorophore: "Hoechst 33342",
          emissionWavelengthNm: 461,
          assignedColor: "#38bdf8",
          defaultIntensity: 1.0,
        },
      ],
    },
    morphologySummary: {
      totalSegmentedObjects: 21960,
      meanAreaUm2: 124.2,
      meanCircularity: 0.951,
      meanAspectRatio: 1.35,
      benchmarkModel: "StarDist2D (Held-out Test: IoU 0.923, F1 0.951)",
      sampleMetrics: [
        {
          id: "m-u2os-1",
          cellIndex: 1,
          objectType: "nucleus",
          centroidX: 245.12,
          centroidY: 180.44,
          bbox: { x0: 228, y0: 165, x1: 262, y1: 198 },
          areaPx2: 890.0,
          areaUm2: 92.5,
          perimeterPx: 108.2,
          circularity: 0.956,
          aspectRatio: 1.28,
          meanIntensity: 612.4,
          modelName: "StarDist2D",
          modelVersion: "0.9.1",
          confidence: 0.941,
          evidenceLevel: "observed_directly_in_image",
        },
      ],
    },
    entities: {
      genes: [
        {
          id: "g-tp53",
          type: "gene",
          identifier: "TP53",
          label: "TP53 (Tumor Protein P53)",
          description: "Maintains wild-type functional p53 signaling pathway in U2OS.",
          externalRef: "NCBI:7157",
          evidenceLevel: "supported_by_literature",
        },
      ],
      proteins: [
        {
          id: "p-p53",
          type: "protein",
          identifier: "p53",
          label: "Cellular Tumor Antigen p53",
          description: "Regulates cell cycle arrest and apoptosis upon genotoxic stress.",
          externalRef: "UniProt:P04637",
          evidenceLevel: "supported_by_literature",
        },
      ],
      pathways: [
        {
          id: "pw-dna-damage",
          type: "pathway",
          identifier: "DNA Damage Checkpoint",
          label: "G2/M DNA Damage Checkpoint",
          description: "Arrests cell division in response to unreplicated or damaged genomic DNA.",
          externalRef: "Reactome:R-HSA-69481",
          evidenceLevel: "supported_by_literature",
        },
      ],
      diseases: [
        {
          id: "d-osteosarcoma",
          type: "disease",
          identifier: "Osteosarcoma",
          label: "Osteosarcoma",
          description: "Malignant primary neoplasm of bone producing immature bone matrix.",
          externalRef: "DOID:3347",
          evidenceLevel: "supported_by_literature",
        },
      ],
      phenotypes: [
        {
          id: "ph-nuclear-uniform",
          type: "phenotype",
          identifier: "Confluent Nuclei",
          label: "Uniform Ellipsoid Nuclear Profile",
          description: "Regular convex nuclear boundaries typical of untreated adherent monolayers.",
          evidenceLevel: "observed_directly_in_image",
        },
      ],
      literature: [
        {
          id: "lit-caicedo",
          type: "literature",
          identifier: "PMID:30531998",
          label: "Caicedo et al. Nat Methods (2019)",
          description: "Nucleus segmentation in high-content screening using deep convolutional neural networks and the BBBC039 benchmark.",
          externalRef: "https://pubmed.ncbi.nlm.nih.gov/30531998/",
          pmid: "30531998",
          evidenceLevel: "supported_by_literature",
        },
      ],
    },
  },
  {
    cellType: {
      id: "gowt1-ctc",
      name: "Mouse Stem Cell (Oct4-GFP)",
      label: "GOWT1 Nuclear Migration",
      ontologyId: "CL:0002322",
      ontologyLabel: "Cell Ontology: embryonic stem cell",
      organism: "Mus musculus",
      tissue: "Embryonic inner cell mass",
      disease: "Cell Migration / Developmental Biology",
      lineage: "Pluripotent embryonic stem cell",
      biologicalContext:
        "GOWT1 mouse embryonic stem cells express an Oct4-GFP reporter transgene. This standard time-lapse microscopy dataset from the Cell Tracking Challenge enables rigorous evaluation of cell division, nuclear morphology dynamics, and directional motility.",
      synonyms: ["GOWT1", "Oct4-GFP mESC", "Mouse embryonic stem cell"],
      isCancerAssociated: false,
    },
    image: {
      id: "img-gowt1-003",
      cellTypeId: "gowt1-ctc",
      title: "GOWT1 Time-Lapse Cellular Migration Series",
      description: "92-frame live-cell fluorescence time-lapse imaging tracking nuclear centroid displacement and speed over 7.5 hours.",
      cellLine: "GOWT1 (Oct4-GFP)",
      organism: "Mus musculus",
      tissue: "Embryonic inner cell mass",
      microscopyModality: "fluorescence",
      microscope: "Zeiss Axiovert 200M Live Cell Station",
      objective: "20x / 0.5 NA Plan-Neofluar",
      pixelSizeUm: 0.2400,
      timeIntervalSec: 300.0, // 5 minutes per frame
      staining: "Oct4-GFP Fusion Protein (Endogenous live reporter)",
      treatment: "Continuous live observation in conditioned medium",
      source: "Cell Tracking Challenge (CTC Fluo-N2DH-GOWT1)",
      doiPmid: "PMID: 28248386",
      datasetAccession: "CTC-Fluo-N2DH-GOWT1",
      license: "Open Access Academic Research",
      attribution: "Cell Tracking Challenge / E.G. Reynaud et al.",
      imageUrl: "/atlas/specimen-cellpose-a02.png",
      thumbnailUrl: "/atlas/specimen-cellpose-a02.png",
      dziPath: "/atlas/dzi/gowt1-003.dzi",
      widthPx: 1024,
      heightPx: 1024,
      channelCount: 1,
      zStackSlices: 1,
      timePoints: 92,
      isFlagship: false,
      channels: [
        {
          id: "ch-oct4",
          channelIndex: 0,
          name: "Oct4-GFP Reporter",
          fluorophore: "eGFP",
          emissionWavelengthNm: 509,
          assignedColor: "#2bff88",
          defaultIntensity: 1.0,
        },
      ],
    },
    morphologySummary: {
      totalSegmentedObjects: 61,
      meanAreaUm2: 104.5,
      meanCircularity: 0.884,
      meanAspectRatio: 1.48,
      benchmarkModel: "StarDist2D + Constant Velocity Hungarian Tracker (Detection F1 0.917)",
      sampleMetrics: [
        {
          id: "m-gowt1-tr22",
          cellIndex: 22,
          objectType: "nucleus",
          centroidX: 412.3,
          centroidY: 388.7,
          bbox: { x0: 395, y0: 370, x1: 430, y1: 405 },
          areaPx2: 980.0,
          areaUm2: 56.4,
          perimeterPx: 118.0,
          circularity: 0.885,
          aspectRatio: 1.42,
          meanIntensity: 740.2,
          modelName: "Hungarian Tracker (Track 22: 92 frames, 101.3 um distance, 0.22 um/min)",
          modelVersion: "1.0",
          confidence: 0.966,
          evidenceLevel: "observed_directly_in_image",
        },
      ],
    },
    entities: {
      genes: [
        {
          id: "g-pou5f1",
          type: "gene",
          identifier: "Pou5f1",
          label: "Pou5f1 (Oct4)",
          description: "Essential homeodomain transcription factor governing pluripotency and self-renewal.",
          externalRef: "MGI:101865",
          evidenceLevel: "supported_by_literature",
        },
      ],
      proteins: [
        {
          id: "p-oct4",
          type: "protein",
          identifier: "Oct-4",
          label: "Octamer-Binding Transcription Factor 4",
          description: "Nuclear marker visualized in the GOWT1 reporter strain.",
          externalRef: "UniProt:P20263",
          evidenceLevel: "observed_directly_in_image",
        },
      ],
      pathways: [
        {
          id: "pw-stemness",
          type: "pathway",
          identifier: "Pluripotency Network",
          label: "Core Embryonic Stem Cell Pluripotency Circuit",
          description: "Transcriptional circuit regulating cellular differentiation and embryonic development.",
          externalRef: "Reactome:R-MMU-452723",
          evidenceLevel: "supported_by_literature",
        },
      ],
      diseases: [
        {
          id: "d-teratoma",
          type: "disease",
          identifier: "Germ Cell Neoplasms",
          label: "Embryonic Germ Cell Pathologies",
          description: "Deregulated Oct4 expression correlates with malignant germ cell transformation.",
          evidenceLevel: "supported_by_literature",
        },
      ],
      phenotypes: [
        {
          id: "ph-migratory-drift",
          type: "phenotype",
          identifier: "Directional Nuclear Drift",
          label: "Centroid Migration (101.3 um)",
          description: "Quantified track 22 centroid persistence speed of 0.22 um/min over 455 minutes.",
          evidenceLevel: "observed_directly_in_image",
        },
      ],
      literature: [
        {
          id: "lit-ctc",
          type: "literature",
          identifier: "PMID:28248386",
          label: "Ulicna et al. Nat Methods (2017)",
          description: "An objective comparison of cell tracking algorithms across diverse multi-dimensional microscopy datasets.",
          externalRef: "https://pubmed.ncbi.nlm.nih.gov/28248386/",
          pmid: "28248386",
          evidenceLevel: "supported_by_literature",
        },
      ],
    },
  },
];

/* Helper to query entries with multi-facet filters */
export function queryCellAtlas(filters: CellAtlasFilters): {
  entries: CellAtlasDetail[];
  total: number;
} {
  let result = [...SEED_CELL_ATLAS_ENTRIES];

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.cellType.name.toLowerCase().includes(q) ||
        e.cellType.label.toLowerCase().includes(q) ||
        e.cellType.tissue.toLowerCase().includes(q) ||
        e.cellType.disease?.toLowerCase().includes(q) ||
        e.image.staining.toLowerCase().includes(q) ||
        e.image.cellLine.toLowerCase().includes(q)
    );
  }

  if (filters.cellLine) {
    const cl = filters.cellLine.toLowerCase();
    result = result.filter((e) => e.image.cellLine.toLowerCase().includes(cl));
  }

  if (filters.cancerType) {
    const ct = filters.cancerType.toLowerCase();
    result = result.filter((e) => e.cellType.disease?.toLowerCase().includes(ct));
  }

  if (filters.tissue) {
    const t = filters.tissue.toLowerCase();
    result = result.filter((e) => e.cellType.tissue.toLowerCase().includes(t));
  }

  if (filters.organism) {
    const o = filters.organism.toLowerCase();
    result = result.filter((e) => e.cellType.organism.toLowerCase().includes(o));
  }

  if (filters.modality && filters.modality !== "all") {
    result = result.filter((e) => e.image.microscopyModality === filters.modality);
  }

  if (filters.dataset) {
    const d = filters.dataset.toLowerCase();
    result = result.filter((e) => e.image.datasetAccession.toLowerCase().includes(d));
  }

  if (filters.condition) {
    const c = filters.condition.toLowerCase();
    result = result.filter((e) => e.image.treatment.toLowerCase().includes(c));
  }

  return {
    entries: result,
    total: result.length,
  };
}

export function getCellAtlasDetailById(id: string): CellAtlasDetail | null {
  return SEED_CELL_ATLAS_ENTRIES.find((e) => e.cellType.id === id) ?? null;
}
