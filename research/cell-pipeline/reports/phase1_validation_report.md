# Phase 1 — Cell Segmentation: Validation Report

## Model
- Model: Cellpose (cpsam_v2 pretrained model)
- Cellpose version: 4.2.1.1
- PyTorch version: 2.11.0+cu128
- Device: GPU (CUDA)
- No fine-tuning performed — off-the-shelf pretrained weights only.

## Dataset
- BBBC039 (Broad Bioimage Benchmark Collection): 200 fluorescence microscopy
  images of U2OS cell nuclei (Hoechst stain), CC0 license.
  https://bbbc.broadinstitute.org/BBBC039
- Ground truth: manually annotated nucleus masks, decoded from the dataset's
  four-color touching-object encoding into per-instance labels.
- Evaluated on all 200 images (no train/test split applied — this is a
  zero-shot benchmark of the pretrained model, not a trained/tested split).

## Metrics (mean over 200 images)

| Metric | Value |
|---|---|
| Pixel IoU | 0.942 +/- 0.017 |
| Pixel Dice | 0.970 +/- 0.009 |
| Object precision (IoU>=0.5) | 0.980 |
| Object recall (IoU>=0.5) | 0.966 |
| Object F1 (IoU>=0.5) | 0.972 |
| Mean matched-instance IoU | 0.928 |
| Mean inference time | 723 ms/image |

Totals across all images: 22212 true positives,
463 false positives, 766 false negatives
(object-level, Hungarian-matched at IoU >= 0.5).

Pixel IoU/Dice measure overall segmentation quality (how well predicted
foreground pixels overlap ground truth, ignoring instance identity).
Precision/recall/F1 measure per-nucleus detection quality: whether each
individual predicted nucleus corresponds to a real one, matched via the
Hungarian algorithm on the IoU matrix and thresholded at 0.5.

## Limitations
- Evaluated using Cellpose's general-purpose pretrained model with no
  domain-specific fine-tuning on this cell type/stain.
- Ground-truth decoding assumes the documented four-color touching-object
  encoding; instances smaller than 20px are treated as annotation noise and
  discarded from ground truth before scoring.
- This benchmark uses only BBBC039 (nucleus/DNA-stain images). It does not
  yet establish performance on brightfield/phase-contrast whole-cell images,
  which is a distinct segmentation problem evaluated separately in the
  Phase 2 tracking benchmark.
- Per-image results (for outlier inspection) are in
  reports/phase1_per_image_metrics.csv.
