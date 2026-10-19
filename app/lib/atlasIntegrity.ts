/*
  Records whose stated provenance could not be verified (audit, 19 Oct 2026).

  - Dataset "BL-CASE-CAF-CXCL12" cites BioImage Archive S-BIAD823, which is an
    unrelated zebrafish haematopoiesis study (no fibroblasts, CXCL12 or chemotaxis).
  - The "caf-cxcl12" specimen shows /atlas/caf_specimen_reference.png, which is a
    BBBC039 U2OS nuclei image with a segmentation overlay, not CAFs.
  - The CAF migration time-lapse has no traceable source recording.

  The UI marks these as under review instead of presenting them as real data.
  Remove an entry from here only once its source has been verified.
*/

export const DATASETS_UNDER_REVIEW = new Set<string>(["BL-CASE-CAF-CXCL12"]);

export const CELL_TYPES_UNDER_REVIEW = new Set<string>(["caf-cxcl12"]);

export const REVIEW_NOTE =
  "Provenance under review. The cited source does not match this record, so do not cite it.";
