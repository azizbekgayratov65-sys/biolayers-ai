"""
Phase 3 — Phenotype Extraction.

Segments each BBBC039 image with Cellpose, then extracts per-cell morphology,
intensity, and texture features. Migration distance/speed and division events
are NOT included here -- those require time-lapse tracking data (Phase 2).

Note: BBBC039 is a single-channel DNA/nucleus stain, so nuclear/cytoplasmic
ratio cannot be computed from this dataset -- that needs a paired
nucleus+cytoplasm channel image, which we don't have yet.
"""
import time
from pathlib import Path

import pandas as pd
from skimage.io import imread
from cellpose import models

from phenotype import extract_phenotype_features

IMAGES_DIR = Path("data/BBBC039/images")
REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)


def main():
    model = models.CellposeModel(gpu=True)
    image_paths = sorted(IMAGES_DIR.glob("*.tif"))
    print(f"Found {len(image_paths)} images")

    all_features = []
    t_start = time.time()
    for i, img_path in enumerate(image_paths):
        img = imread(str(img_path))
        pred_labels, flows, styles = model.eval(img, diameter=None, channels=[0, 0])
        df = extract_phenotype_features(img, pred_labels, image_name=img_path.name)
        all_features.append(df)

        if (i + 1) % 20 == 0 or i == 0:
            elapsed = time.time() - t_start
            print(f"[{i+1}/{len(image_paths)}] {img_path.name}: {len(df)} cells (elapsed {elapsed:.0f}s)")

    features = pd.concat(all_features, ignore_index=True)
    out_path = REPORTS_DIR / "phase3_phenotype_features.csv"
    features.to_csv(out_path, index=False)

    print(f"\nExtracted features for {len(features)} cells across {len(image_paths)} images")
    print(f"Saved to {out_path}")
    print("\n=== Feature summary (mean +/- std) ===")
    numeric_cols = ["area", "perimeter", "circularity", "eccentricity", "aspect_ratio",
                     "solidity", "mean_intensity", "std_intensity",
                     "glcm_contrast", "glcm_homogeneity", "glcm_energy", "glcm_correlation"]
    summary = features[numeric_cols].agg(["mean", "std"]).T
    print(summary)

    write_report(features, summary)


def write_report(features, summary):
    report = f"""# Phase 3 — Phenotype Extraction: Report

## What was extracted
Per-cell morphology, intensity, and texture features, computed on Cellpose
segmentation masks over all {features['image'].nunique()} BBBC039 images
({len(features)} total cells).

| Feature | Mean | Std |
|---|---|---|
"""
    for feat in summary.index:
        report += f"| {feat} | {summary.loc[feat, 'mean']:.3f} | {summary.loc[feat, 'std']:.3f} |\n"

    report += """
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
"""
    (REPORTS_DIR / "phase3_phenotype_report.md").write_text(report, encoding="utf-8")
    print(f"\nReport written to {REPORTS_DIR / 'phase3_phenotype_report.md'}")


if __name__ == "__main__":
    main()
