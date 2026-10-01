"""
Phase 4 QC — are single-frame phenotype flags biology or segmentation errors?

Re-segments BBBC039, applies the single-frame rules, and checks every flagged
nucleus against the hand-annotated ground truth: does it cover one real
nucleus (a genuine shape), several (a merge), or none (a false detection)?
"""
from pathlib import Path

import numpy as np
import pandas as pd
from skimage.io import imread
from skimage.measure import regionprops_table
from cellpose import models

from metrics import decode_bbbc039_mask, compute_iou_matrix, label_overlap
from classify import classify_static_nuclei

DATA = Path("data/BBBC039")
REPORTS = Path("reports")


def nucleus_table(img, pred, gt, name):
    props = pd.DataFrame(regionprops_table(
        pred, intensity_image=img,
        properties=("label", "area", "perimeter", "solidity", "intensity_mean", "centroid",
                    "axis_major_length")))
    props = props.rename(columns={"label": "cell_id", "intensity_mean": "mean_intensity",
                                  "centroid-0": "centroid_row", "centroid-1": "centroid_col",
                                  "axis_major_length": "major_axis_length"})
    props["circularity"] = np.minimum(4 * np.pi * props["area"] / np.maximum(props["perimeter"], 1e-6) ** 2, 1)
    props.insert(0, "image", name)

    ov = label_overlap(gt, pred)
    iou = compute_iou_matrix(gt, pred)
    gt_area = ov.sum(axis=1)
    n_gt, best = [], []
    for p in props["cell_id"]:
        if p < ov.shape[1]:
            covered = (ov[1:, p] > 0.5 * np.maximum(gt_area[1:], 1)).sum()
            n_gt.append(int(covered))
            best.append(float(iou[1:, p].max()) if iou.shape[0] > 1 else 0.0)
        else:
            n_gt.append(0)
            best.append(0.0)
    props["gt_nuclei_covered"] = n_gt
    props["best_gt_iou"] = best
    return props


def main():
    model = models.CellposeModel(gpu=True)
    parts = []
    paths = sorted((DATA / "images").glob("*.tif"))
    for i, p in enumerate(paths):
        img = imread(str(p))
        gt = decode_bbbc039_mask(imread(str(DATA / "masks" / (p.stem + ".png"))))
        pred, _, _ = model.eval(img, diameter=None, channels=[0, 0])
        parts.append(nucleus_table(img, pred, gt, p.name))
        if (i + 1) % 50 == 0:
            print(f"{i+1}/{len(paths)}")
    f = pd.concat(parts, ignore_index=True)
    f = classify_static_nuclei(f, img.shape)

    def verdict(r):
        if r.gt_nuclei_covered >= 2:
            return "merge of >=2 real nuclei"
        if r.best_gt_iou < 0.5:
            return "no matching real nucleus"
        return "one real nucleus (IoU>=0.5)"

    f["gt_verdict"] = f.apply(verdict, axis=1)
    f["label_detail"] = f["label"] + np.where(f["feature"] != "", " (" + f["feature"] + ")", "")
    table = pd.crosstab(f["label_detail"], f["gt_verdict"], margins=True)
    print(table.to_string())
    table.to_csv(REPORTS / "phase4_bbbc039_flag_qc.csv")


if __name__ == "__main__":
    main()
