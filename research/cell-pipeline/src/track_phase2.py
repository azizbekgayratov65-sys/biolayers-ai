"""
Phase 2 — Cell tracking on Cell Tracking Challenge PhC-C2DH-U373.

Segments every frame with Cellpose, links cells across frames, scores the
result against CTC ground truth, and measures per-cell migration.
Metrics are computed with our own CTC-style implementation (see
tracking.py), not the official CTC evaluation binaries.
"""
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import imageio.v2 as imageio
from skimage.io import imread
from cellpose import models

from tracking import (track, clean_tracks, division_events, centroids,
                      migration_features, evaluate_tracking, seg_score)

ROOT = Path("data/CTC/PhC-C2DH-U373")
CACHE = Path("data/processed")
RESULTS = Path("results")
REPORTS = Path("reports")
UM_PER_PX = 0.65
MIN_PER_FRAME = 15
SEQUENCES = ["01", "02"]

for d in (CACHE, RESULTS, REPORTS):
    d.mkdir(exist_ok=True, parents=True)


def segment_sequence(model, seq):
    cache = CACHE / f"u373_{seq}_masks.npz"
    frames = [imread(str(p)) for p in sorted((ROOT / seq).glob("t*.tif"))]
    if cache.exists():
        masks = list(np.load(cache)["masks"])
    else:
        masks = []
        for i, img in enumerate(frames):
            m, _, _ = model.eval(img, diameter=None, channels=[0, 0])
            masks.append(m.astype(np.int32))
            if (i + 1) % 25 == 0:
                print(f"  seq {seq}: segmented {i+1}/{len(frames)}")
        np.savez_compressed(cache, masks=np.stack(masks))
    return frames, masks


def gt_speeds(seq):
    gt = [imread(str(p)) for p in sorted((ROOT / f"{seq}_GT/TRA").glob("man_track*.tif"))]
    return gt, migration_features(centroids(gt), UM_PER_PX, MIN_PER_FRAME)


def draw_trajectories(frame, cents, out_path, title):
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.imshow(frame, cmap="gray")
    for tid, g in cents.groupby("track_id"):
        g = g.sort_values("frame")
        ax.plot(g["col"], g["row"], lw=1.8)
        ax.text(g["col"].iloc[-1], g["row"].iloc[-1], str(tid), color="yellow", fontsize=9)
    ax.set_title(title)
    ax.axis("off")
    plt.tight_layout()
    plt.savefig(out_path, dpi=130)
    plt.close(fig)


def make_gif(frames, tracked, cents, out_path, step=1):
    cmap = plt.get_cmap("tab20")
    images = []
    for t in range(0, len(frames), step):
        fig, ax = plt.subplots(figsize=(6.96, 5.2), dpi=80)
        ax.imshow(frames[t], cmap="gray")
        lab = tracked[t]
        overlay = np.zeros((*lab.shape, 4))
        for tid in np.unique(lab)[1:]:
            overlay[lab == tid] = (*cmap(tid % 20)[:3], 0.35)
        ax.imshow(overlay)
        past = cents[cents["frame"] <= t]
        for tid, g in past.groupby("track_id"):
            if tid in lab:
                ax.plot(g["col"], g["row"], color=cmap(tid % 20), lw=1.5)
        hours = t * MIN_PER_FRAME / 60
        ax.set_title(f"t = {hours:.1f} h   ({len(np.unique(lab)) - 1} cells tracked)", fontsize=10)
        ax.axis("off")
        fig.tight_layout()
        fig.canvas.draw()
        images.append(np.asarray(fig.canvas.buffer_rgba())[..., :3].copy())
        plt.close(fig)
    imageio.mimsave(out_path, images, duration=0.12, loop=0)


def main():
    model = models.CellposeModel(gpu=True)
    metric_rows, track_tables = [], []

    for seq in SEQUENCES:
        print(f"Sequence {seq}")
        frames, masks = segment_sequence(model, seq)
        raw_tracked, raw_lineage = track(masks)
        raw_tra = evaluate_tracking(*gt_speeds(seq)[:1], raw_tracked)
        tracked, lineage = clean_tracks(raw_tracked, raw_lineage)
        cents = centroids(tracked)
        feats = migration_features(cents, UM_PER_PX, MIN_PER_FRAME)
        feats.insert(0, "sequence", seq)
        track_tables.append(feats)

        gt_tra, gt_feats = gt_speeds(seq)
        tra = evaluate_tracking(gt_tra, tracked)

        seg_files = sorted((ROOT / f"{seq}_GT/SEG").glob("man_seg*.tif"))
        seg_scores = []
        for f in seg_files:
            t = int(f.stem.replace("man_seg", ""))
            seg_scores += seg_score(imread(str(f)), masks[t])

        gt_lin = pd.read_csv(ROOT / f"{seq}_GT/TRA/man_track.txt", sep=" ",
                             names=["track_id", "start", "end", "parent"])
        metric_rows.append(dict(
            sequence=seq,
            frames=len(frames),
            **tra,
            ctc_seg=float(np.mean(seg_scores)) if seg_scores else float("nan"),
            seg_gt_objects=len(seg_scores),
            raw_tracks=len(raw_lineage),
            raw_detection_precision=raw_tra["detection_precision"],
            raw_identity_switches=raw_tra["identity_switches"],
            raw_division_events=division_events(raw_lineage),
            pred_tracks=len(lineage),
            gt_tracks=len(gt_lin),
            pred_division_events=division_events(lineage),
            gt_division_events=division_events(gt_lin),
            pred_mean_speed_um_min=feats["mean_speed_um_per_min"].mean(),
            gt_mean_speed_um_min=gt_feats["mean_speed_um_per_min"].mean(),
        ))

        draw_trajectories(frames[-1], cents, RESULTS / f"phase2_trajectories_seq{seq}.png",
                          f"PhC-C2DH-U373 seq {seq}: cell trajectories over "
                          f"{len(frames) * MIN_PER_FRAME / 60:.0f} h")
        if seq == "01":
            make_gif(frames, tracked, cents, RESULTS / "phase2_tracking_seq01.gif")
        lineage.to_csv(REPORTS / f"phase2_lineage_seq{seq}.csv", index=False)

    metrics = pd.DataFrame(metric_rows)
    tracks = pd.concat(track_tables, ignore_index=True)
    metrics.to_csv(REPORTS / "phase2_tracking_metrics.csv", index=False)
    tracks.to_csv(REPORTS / "phase2_migration_per_track.csv", index=False)
    print(metrics.T.to_string())
    print(tracks.to_string())
    write_report(metrics, tracks)


def write_report(metrics, tracks):
    rows = "\n".join(
        f"| {r.sequence} | {r.frames} | {r.detection_precision:.3f} | {r.detection_recall:.3f} "
        f"| {r.link_accuracy:.3f} | {r.identity_switches} | {r.ctc_seg:.3f} "
        f"| {r.pred_division_events} / {r.gt_division_events} "
        f"| {r.pred_mean_speed_um_min:.3f} / {r.gt_mean_speed_um_min:.3f} |"
        for r in metrics.itertuples())
    report = f"""# Phase 2 — Cell Tracking: Validation Report

## Setup
- Dataset: Cell Tracking Challenge PhC-C2DH-U373 (glioblastoma-astrocytoma
  U373 cells on polyacrylamide, phase contrast), training sequences 01 and 02.
  Pixel size {UM_PER_PX} um, frame interval {MIN_PER_FRAME} min.
- Segmentation: Cellpose ({__import__('cellpose').version}, default cpsam_v2
  weights), zero-shot, every frame.
- Linking: Hungarian assignment on mask IoU between consecutive frames
  (min IoU 0.2); a new cell mostly inside a previous cell whose track
  continued is a division candidate.
- Clean-up: a division is kept only if both daughters survive >= 3 frames;
  orphan fragments shorter than 3 frames are dropped; a track that vanishes
  for up to 3 frames is reconnected to a new track starting within 30 px.

## Effect of clean-up

| Seq | Tracks raw -> clean | Det. precision raw -> clean | ID switches raw -> clean | Divisions raw -> clean |
|---|---|---|---|---|
""" + "\n".join(
        f"| {r.sequence} | {r.raw_tracks} -> {r.pred_tracks} (GT {r.gt_tracks}) "
        f"| {r.raw_detection_precision:.3f} -> {r.detection_precision:.3f} "
        f"| {r.raw_identity_switches} -> {r.identity_switches} "
        f"| {r.raw_division_events} -> {r.pred_division_events} (GT {r.gt_division_events}) |"
        for r in metrics.itertuples()) + f"""

## Results

| Seq | Frames | Det. precision | Det. recall | Link accuracy | ID switches | CTC SEG | Divisions pred / GT | Mean speed um/min pred / GT |
|---|---|---|---|---|---|---|---|---|
{rows}

- Detection: a ground-truth cell counts as found when one predicted cell
  covers >50% of its marker (CTC rule).
- Link accuracy: share of ground-truth frame-to-frame links where the same
  predicted track follows the cell. ID switches: links where it does not.
- CTC SEG: mean Jaccard index over gold-standard annotated objects.
- Speeds: mean over tracks of at least 5 frames, from track centroids.

## Limitations
- Metrics are our own CTC-style implementation, not scores from the official
  CTC evaluation software, so they are not directly comparable to the CTC
  leaderboard.
- Our mean speeds run ~12% below the ground truth. Speed is summed
  frame-to-frame path length over time, which grows with position jitter:
  ground-truth positions are hand-placed markers, ours are whole-mask
  centroids (smoother). The gap reflects both methods' noise, not a
  confirmed bias in either.
- Only one cell line (U373) and 2 sequences with 6-8 cells each; a single
  mis-link moves the link accuracy noticeably.
- These sequences contain no true division events (every ground-truth parent
  link is a single-child gap link), so division detection is only validated
  here for not producing false positives. It still needs a dividing-cell
  dataset (e.g. Fluo-N2DL-HeLa) to validate that real divisions are found.
- U373 is a stand-in for the flagship migration case study, not A549.
"""
    (REPORTS / "phase2_tracking_report.md").write_text(report, encoding="utf-8")


if __name__ == "__main__":
    main()
