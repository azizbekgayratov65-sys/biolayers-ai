# Task Brief: Data Collector / Bioimage Curator

**Project:** BioLayers AI. **Hard rule:** no AI-generated microscopy images in the primary database; every image needs provenance and rights.
Full context: `docs/TEAM_TASKS.md`.

## Current state (audited 19 Oct 2026)
- Catalog: `data/cell_atlas/cell_atlas_master_catalog.csv` (634 records) + `cell_atlas_database.sqlite`. All rows `is_ai_generated=False`.
- Mix: BBBC039 120, BBBC021 90, CTC HeLa 48, CTC MDA-MB-231 48, CAF/CXCL12 case 48, BBBC018 40, BBBC020 40, BBBC007 30, others.
- Licenses: CC0 370, CTC research license 133, CC-BY 96, CC-BY-SA 20, **CC-BY-NC 15**.
- Only 6 image files live in `public/atlas/`. Early rows differ only by `image_id`, so **it is unclear that each record maps to a real image**.
- Literature base `research/cell-pipeline/knowledge/literature.json` has only 5 papers.
- Legal audit: `data/cell_atlas/DATA_SOURCE_AUDIT_AND_LICENSES.md`.

## Tasks (in order)
1. **Catalog integrity (top priority):** for each of the 634 records confirm a real image file or a resolvable source accession (BBBC/CTC file ID). Fix or drop records that do not map to one. Deliver a table: record, source file/accession, verified yes/no.
2. **Provenance completeness:** per column (organism, cell line, tissue, disease, modality, magnification, pixel size, time interval, staining, treatment, DOI/PMID, accession, license) report % filled. Fill gaps from the dataset papers.
3. **Licensing triage:** the 133 CTC and 15 CC-BY-NC records are shown publicly. Either get written permission from dataset contributors (CTC terms require it for non-challenge public use) or mark them research-only and tell Software to flag them. Update the audit doc with the outcome.
4. **Expert labels for AI:** obtain 50-100 expert-labelled cells (migrating / quiescent / dividing) from a mentor or lab. Deliver as CSV: cell ID, dataset, frame, label, labeller.
5. **Literature:** extend the knowledge base from 5 to 20+ papers on CAF / CXCL12 / CXCR4 / migration. Each entry needs a PMID and a statement checked against the abstract, same format as the existing file.
6. **Expand only after audit:** Allen Cell Explorer and Human Protein Atlas (Tier 3/4) need a license audit first. Prefer 1-2 more cancer live-cell sets with migration context.

## Done when
All 634 records verified or removed, provenance gaps reported, license decisions recorded, expert labels and 20+ papers delivered.
