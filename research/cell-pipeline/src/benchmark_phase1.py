"""
Phase 1 — Cell Segmentation benchmark.

Runs Cellpose across all 200 BBBC039 images and scores predictions against
the ground-truth nucleus masks: pixel-level IoU/Dice (overall segmentation
quality) and object-level precision/recall/F1 at IoU>=0.5 (detection quality,
Hungarian-matched).
"""
import time
from pathlib import Path

import numpy as np
import pandas as pd
from skimage.io import imread, imsave
from cellpose import models

from metrics import decode_bbbc039_mask, match_instances, pixel_iou_dice

DATA_DIR = Path("data/BBBC039")
IMAGES_DIR = DATA_DIR / "images"
MASKS_DIR = DATA_DIR / "masks"
RESULTS_DIR = Path("results")
REPORTS_DIR = Path("reports")
RESULTS_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

MODEL_TYPE = "cpsam_v2"  # Cellpose 4.x default pretrained foundation model
IOU_THRESHOLD = 0.5

CELLPOSE_VERSION = __import__("cellpose").version


def main():
    model = models.CellposeModel(gpu=True)

    image_paths = sorted(IMAGES_DIR.glob("*.tif"))
    print(f"Found {len(image_paths)} images")

    rows = []
    t_start = time.time()
    for i, img_path in enumerate(image_paths):
        mask_path = MASKS_DIR / (img_path.stem + ".png")
        img = imread(str(img_path))
        gt_rgba = imread(str(mask_path))
        gt_labels = decode_bbbc039_mask(gt_rgba)

        t0 = time.time()
        pred_labels, flows, styles = model.eval(img, diameter=None, channels=[0, 0])
        infer_ms = (time.time() - t0) * 1000

        pixel_iou, pixel_dice = pixel_iou_dice(gt_labels, pred_labels)
        obj = match_instances(gt_labels, pred_labels, iou_threshold=IOU_THRESHOLD)

        rows.append(dict(
            image=img_path.name,
            n_true=int(gt_labels.max()),
            n_pred=int(pred_labels.max()),
            pixel_iou=pixel_iou,
            pixel_dice=pixel_dice,
            precision=obj["precision"],
            recall=obj["recall"],
            f1=obj["f1"],
            mean_matched_iou=obj["mean_matched_iou"],
            tp=obj["tp"], fp=obj["fp"], fn=obj["fn"],
            infer_ms=infer_ms,
        ))

        if (i + 1) % 20 == 0 or i == 0:
            elapsed = time.time() - t_start
            print(f"[{i+1}/{len(image_paths)}] {img_path.name} "
                  f"IoU={pixel_iou:.3f} Dice={pixel_dice:.3f} "
                  f"P={obj['precision']:.3f} R={obj['recall']:.3f} "
                  f"(elapsed {elapsed:.0f}s)")

        # Save a handful of qualitative overlays for the handoff/report
        if i in (0, 1, 2):
            save_overlay(img, gt_labels, pred_labels, RESULTS_DIR / f"phase1_bbbc039_{img_path.stem}.png")

    df = pd.DataFrame(rows)
    df.to_csv(REPORTS_DIR / "phase1_per_image_metrics.csv", index=False)

    summary = {
        "n_images": len(df),
        "pixel_iou_mean": df["pixel_iou"].mean(),
        "pixel_iou_std": df["pixel_iou"].std(),
        "pixel_dice_mean": df["pixel_dice"].mean(),
        "pixel_dice_std": df["pixel_dice"].std(),
        "precision_mean": df["precision"].mean(),
        "recall_mean": df["recall"].mean(),
        "f1_mean": df["f1"].mean(),
        "mean_matched_iou": df["mean_matched_iou"].mean(),
        "total_tp": int(df["tp"].sum()),
        "total_fp": int(df["fp"].sum()),
        "total_fn": int(df["fn"].sum()),
        "mean_infer_ms": df["infer_ms"].mean(),
    }
    print("\n=== SUMMARY ===")
    for k, v in summary.items():
        print(f"{k}: {v}")

    write_report(summary, df)


def save_overlay(img, gt_labels, pred_labels, out_path):
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    axes[0].imshow(img, cmap="gray")
    axes[0].set_title("Input")
    axes[0].axis("off")
    axes[1].imshow(img, cmap="gray")
    axes[1].imshow(np.ma.masked_where(gt_labels == 0, gt_labels), cmap="jet", alpha=0.5)
    axes[1].set_title(f"Ground truth ({gt_labels.max()} nuclei)")
    axes[1].axis("off")
    axes[2].imshow(img, cmap="gray")
    axes[2].imshow(np.ma.masked_where(pred_labels == 0, pred_labels), cmap="jet", alpha=0.5)
    axes[2].set_title(f"Cellpose prediction ({pred_labels.max()} nuclei)")
    axes[2].axis("off")
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close(fig)


def write_report(summary, df):
    import torch
    report = f"""# Phase 1 — Cell Segmentation: Validation Report

## Model
- Model: Cellpose ({MODEL_TYPE} pretrained model)
- Cellpose version: {CELLPOSE_VERSION}
- PyTorch version: {torch.__version__}
- Device: {"GPU (CUDA)" if torch.cuda.is_available() else "CPU"}
- No fine-tuning performed — off-the-shelf pretrained weights only.

## Dataset
- BBBC039 (Broad Bioimage Benchmark Collection): 200 fluorescence microscopy
  images of U2OS cell nuclei (Hoechst stain), CC0 license.
  https://bbbc.broadinstitute.org/BBBC039
- Ground truth: manually annotated nucleus masks, decoded from the dataset's
  four-color touching-object encoding into per-instance labels.
- Evaluated on all 200 images (no train/test split applied — this is a
  zero-shot benchmark of the pretrained model, not a trained/tested split).

## Metrics (mean over {summary['n_images']} images)

| Metric | Value |
|---|---|
| Pixel IoU | {summary['pixel_iou_mean']:.3f} +/- {summary['pixel_iou_std']:.3f} |
| Pixel Dice | {summary['pixel_dice_mean']:.3f} +/- {summary['pixel_dice_std']:.3f} |
| Object precision (IoU>={IOU_THRESHOLD}) | {summary['precision_mean']:.3f} |
| Object recall (IoU>={IOU_THRESHOLD}) | {summary['recall_mean']:.3f} |
| Object F1 (IoU>={IOU_THRESHOLD}) | {summary['f1_mean']:.3f} |
| Mean matched-instance IoU | {summary['mean_matched_iou']:.3f} |
| Mean inference time | {summary['mean_infer_ms']:.0f} ms/image |

Totals across all images: {summary['total_tp']} true positives,
{summary['total_fp']} false positives, {summary['total_fn']} false negatives
(object-level, Hungarian-matched at IoU >= {IOU_THRESHOLD}).

Pixel IoU/Dice measure overall segmentation quality (how well predicted
foreground pixels overlap ground truth, ignoring instance identity).
Precision/recall/F1 measure per-nucleus detection quality: whether each
individual predicted nucleus corresponds to a real one, matched via the
Hungarian algorithm on the IoU matrix and thresholded at {IOU_THRESHOLD}.

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
"""
    (REPORTS_DIR / "phase1_validation_report.md").write_text(report, encoding="utf-8")
    print(f"\nReport written to {REPORTS_DIR / 'phase1_validation_report.md'}")


if __name__ == "__main__":
    main()
