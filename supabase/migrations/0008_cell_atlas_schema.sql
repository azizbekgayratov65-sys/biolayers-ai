-- BioLayers AI — Migration 0008: Cell Atlas & Microscopy Infrastructure
-- Phase 1 Foundation: Cell Atlas Schema, Provenance Metadata, Morphology & Evidence Boundaries

-- 1. Create enum types for biological classifications & evidence boundaries
DO $$ BEGIN
    CREATE TYPE microscopy_modality_type AS ENUM (
        'confocal',
        'fluorescence',
        'brightfield',
        'phase_contrast',
        'two_photon',
        'electron',
        'super_resolution'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_level_type AS ENUM (
        'observed_directly_in_image',
        'supported_by_literature',
        'inferred_by_model'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Cell Types & Cell Lines (Catalog entries)
CREATE TABLE IF NOT EXISTS public.cell_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    ontology_id TEXT, -- e.g. CL:0000057 (Cell Ontology) or CLO:0000001 (Cell Line Ontology)
    ontology_label TEXT,
    organism TEXT NOT NULL DEFAULT 'Homo sapiens',
    tissue TEXT NOT NULL,
    disease TEXT, -- Associated primary cancer or pathology
    lineage TEXT,
    biological_context TEXT NOT NULL,
    synonyms TEXT[] DEFAULT '{}',
    is_cancer_associated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Microscopy Images (Master image records with strict 15-field provenance metadata)
CREATE TABLE IF NOT EXISTS public.microscopy_images (
    id TEXT PRIMARY KEY,
    cell_type_id TEXT NOT NULL REFERENCES public.cell_types(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Mandatory provenance metadata
    cell_line TEXT NOT NULL,
    organism TEXT NOT NULL DEFAULT 'Homo sapiens',
    tissue TEXT NOT NULL,
    disease TEXT,
    microscopy_modality microscopy_modality_type NOT NULL DEFAULT 'fluorescence',
    microscope TEXT NOT NULL,
    objective TEXT NOT NULL, -- e.g. '20x / 0.75 NA', '63x oil'
    pixel_size_um NUMERIC(8, 4) NOT NULL, -- e.g. 0.2400 or 0.1080
    time_interval_sec NUMERIC(10, 2), -- Interval for time-lapse (e.g. 300.00 for 5 min)
    staining TEXT NOT NULL, -- e.g. 'Hoechst 33342' or 'DAPI / Alexa Fluor 488 / Cy5'
    treatment TEXT NOT NULL DEFAULT 'Untreated control', -- e.g. '+10 ng/mL TGF-beta1 (48h)'
    source TEXT NOT NULL, -- e.g. 'Broad Bioimage Benchmark Collection (BBBC039)', 'BioImage Archive'
    doi_pmid TEXT, -- e.g. 'PMID: 15882617' or '10.1016/j.cell.2005.02.034'
    dataset_accession TEXT NOT NULL, -- e.g. 'BBBC039v1', 'S-BIAD823', 'CTC-Fluo-N2DH-GOWT1'
    license TEXT NOT NULL DEFAULT 'CC-BY 4.0',
    attribution TEXT NOT NULL,
    
    -- Asset URLs & Dimensions
    image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    dzi_path TEXT, -- Deep Zoom Image descriptor path (.dzi)
    width_px INTEGER NOT NULL,
    height_px INTEGER NOT NULL,
    channel_count INTEGER NOT NULL DEFAULT 1,
    z_stack_slices INTEGER DEFAULT 1,
    time_points INTEGER DEFAULT 1,
    
    is_flagship BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Image Channels (Multi-channel fluorescence metadata)
CREATE TABLE IF NOT EXISTS public.image_channels (
    id TEXT PRIMARY KEY,
    image_id TEXT NOT NULL REFERENCES public.microscopy_images(id) ON DELETE CASCADE,
    channel_index INTEGER NOT NULL,
    name TEXT NOT NULL, -- e.g. 'DNA / Nucleus', 'F-actin', 'alpha-SMA'
    fluorophore TEXT NOT NULL, -- e.g. 'Hoechst 33342', 'DAPI', 'Alexa Fluor 488'
    emission_wavelength_nm INTEGER,
    assigned_color TEXT NOT NULL DEFAULT '#38bdf8', -- Hex code for pseudocolor
    default_intensity NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (image_id, channel_index)
);

-- 5. Nuclear & Cellular Morphology Metrics (Pre-computed from StarDist / Cellpose)
CREATE TABLE IF NOT EXISTS public.morphology_metrics (
    id TEXT PRIMARY KEY,
    image_id TEXT NOT NULL REFERENCES public.microscopy_images(id) ON DELETE CASCADE,
    cell_index INTEGER NOT NULL,
    object_type TEXT NOT NULL DEFAULT 'nucleus',
    centroid_x NUMERIC(8, 2) NOT NULL,
    centroid_y NUMERIC(8, 2) NOT NULL,
    bbox_x0 INTEGER NOT NULL,
    bbox_y0 INTEGER NOT NULL,
    bbox_x1 INTEGER NOT NULL,
    bbox_y1 INTEGER NOT NULL,
    
    -- Geometric features
    area_px2 NUMERIC(10, 2) NOT NULL,
    area_um2 NUMERIC(10, 2),
    perimeter_px NUMERIC(10, 2) NOT NULL,
    circularity NUMERIC(6, 4) NOT NULL, -- 4*pi*area / perimeter^2
    aspect_ratio NUMERIC(6, 4) NOT NULL, -- major / minor axis
    eccentricity NUMERIC(6, 4),
    
    -- Intensity & texture features
    mean_intensity NUMERIC(10, 2),
    median_intensity NUMERIC(10, 2),
    intensity_std NUMERIC(10, 2),
    texture_entropy_bits NUMERIC(6, 4),
    
    -- Model & validation provenance
    model_name TEXT NOT NULL DEFAULT 'StarDist2D',
    model_version TEXT NOT NULL DEFAULT '0.9.1',
    confidence NUMERIC(6, 4),
    evidence_level evidence_level_type NOT NULL DEFAULT 'observed_directly_in_image',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (image_id, cell_index)
);

-- 6. Cell Card Biological Context & Graph Junctions
-- Maps cell types to Associated Genes, Associated Proteins, Pathways, Diseases, and Phenotypes
CREATE TABLE IF NOT EXISTS public.cell_card_entities (
    id TEXT PRIMARY KEY,
    cell_type_id TEXT NOT NULL REFERENCES public.cell_types(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL CHECK (block_type IN ('gene', 'protein', 'pathway', 'disease', 'phenotype', 'literature')),
    identifier TEXT NOT NULL, -- e.g. 'ACTA2', 'CXCL12', 'TGF-beta signaling', 'PDAC', 'Contractile'
    label TEXT NOT NULL,
    description TEXT,
    external_ref TEXT, -- e.g. 'UniProt:P62736', 'Reactome:R-HSA-170834', 'NCBI:6387'
    evidence_level evidence_level_type NOT NULL DEFAULT 'supported_by_literature',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Evidence Records (Multi-source literature & empirical image validation)
CREATE TABLE IF NOT EXISTS public.evidence_records (
    id TEXT PRIMARY KEY,
    cell_type_id TEXT REFERENCES public.cell_types(id) ON DELETE SET NULL,
    image_id TEXT REFERENCES public.microscopy_images(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    evidence_level evidence_level_type NOT NULL,
    biological_entity TEXT,
    entity_type TEXT,
    context_scope TEXT NOT NULL, -- 'this_specimen', 'external_experiment', 'contextual_hypothesis'
    causal_claim_established BOOLEAN NOT NULL DEFAULT false,
    measurement_basis TEXT,
    
    -- Literature references (array of JSON objects)
    literature_sources JSONB DEFAULT '[]'::jsonb,
    
    -- Model provenance (for inferred or observed items)
    provenance JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.cell_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microscopy_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.morphology_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cell_card_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;

-- 9. Public Read Policies (Cell Atlas is freely discoverable for researchers)
CREATE POLICY "Public read cell_types" ON public.cell_types FOR SELECT USING (true);
CREATE POLICY "Public read microscopy_images" ON public.microscopy_images FOR SELECT USING (true);
CREATE POLICY "Public read image_channels" ON public.image_channels FOR SELECT USING (true);
CREATE POLICY "Public read morphology_metrics" ON public.morphology_metrics FOR SELECT USING (true);
CREATE POLICY "Public read cell_card_entities" ON public.cell_card_entities FOR SELECT USING (true);
CREATE POLICY "Public read evidence_records" ON public.evidence_records FOR SELECT USING (true);

-- 10. Performance Indexes for Search & Facet Filtering
CREATE INDEX IF NOT EXISTS idx_cell_types_organism ON public.cell_types(organism);
CREATE INDEX IF NOT EXISTS idx_cell_types_tissue ON public.cell_types(tissue);
CREATE INDEX IF NOT EXISTS idx_cell_types_disease ON public.cell_types(disease);
CREATE INDEX IF NOT EXISTS idx_microscopy_images_cell_type ON public.microscopy_images(cell_type_id);
CREATE INDEX IF NOT EXISTS idx_microscopy_images_modality ON public.microscopy_images(microscopy_modality);
CREATE INDEX IF NOT EXISTS idx_microscopy_images_dataset ON public.microscopy_images(dataset_accession);
CREATE INDEX IF NOT EXISTS idx_morphology_metrics_image ON public.morphology_metrics(image_id);
CREATE INDEX IF NOT EXISTS idx_cell_card_entities_lookup ON public.cell_card_entities(cell_type_id, block_type);
CREATE INDEX IF NOT EXISTS idx_evidence_records_lookup ON public.evidence_records(cell_type_id, evidence_level);
