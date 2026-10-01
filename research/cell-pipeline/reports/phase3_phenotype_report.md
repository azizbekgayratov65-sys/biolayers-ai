# Phase 3 — Phenotype Extraction: Report

## What was extracted
Per-cell morphology, intensity, and texture features, computed on Cellpose
segmentation masks over all 197 BBBC039 images
(22675 total cells).

| Feature | Mean | Std |
|---|---|---|
| area | 627.331 | 256.269 |
| perimeter | 94.979 | 23.585 |
| circularity | 0.830 | 0.092 |
| eccentricity | 0.746 | 0.138 |
| aspect_ratio | 1.706 | 0.610 |
| solidity | 0.958 | 0.025 |
| mean_intensity | 648.037 | 217.276 |
| std_intensity | 119.499 | 78.911 |
| glcm_contrast | 1017.238 | 1219.611 |
| glcm_homogeneity | 0.251 | 0.072 |
| glcm_energy | 0.219 | 0.067 |
| glcm_correlation | 0.907 | 0.096 |

## Feature definitions
- **area / perimeter**: pixel count / boundary length of the segmented region.
- **circularity**: 4*pi*Area/Perimeter^2 -- 1.0 is a perfect circle, lower is
  more irregular/elongated.
- **eccentricity**: 0 (circle) to 1 (line segment), from the best-fit ellipse.
- **aspect_ratio**: major/minor axis length of the best-fit ellipse.
- **solidity**: area / convex-hull area -- lower values indicate concave,
  irregular boundaries (possible membrane blebbing, apoptotic morphology).
- **mean/std_intensity**: raw pixel intensity statistics inside the mask.
- **glcm_* (texture)**: gray-level co-occurrence matrix features (contrast,
  homogeneity, energy, correlation), averaged over 4 pixel-offset directions,
  computed only on in-mask pixels.

## NOT included in this phase (explicitly, not silently)
- **Nuclear/cytoplasmic ratio**: BBBC039 is a single-channel DNA/nucleus
  stain. This ratio requires a paired nucleus + cytoplasm channel image,
  which is not available in this dataset. Will be computed once a
  multi-channel dataset (e.g. the flagship case study, if provided) is
  available.
- **Migration distance/speed, cell division events**: these require
  time-lapse tracking, covered separately in the Phase 2 tracking benchmark.

## Confidence level
All values in this report are **directly observed** measurements computed
from segmented pixels -- not literature-derived or model-inferred estimates.
