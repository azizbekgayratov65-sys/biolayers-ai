# Phase 2 — Cell Tracking: Validation Report

## Setup
- Dataset: Cell Tracking Challenge PhC-C2DH-U373 (glioblastoma-astrocytoma
  U373 cells on polyacrylamide, phase contrast), training sequences 01 and 02.
  Pixel size 0.65 um, frame interval 15 min.
- Segmentation: Cellpose (4.2.1.1, default cpsam_v2
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
| 01 | 47 -> 10 (GT 8) | 0.896 -> 0.928 | 7 -> 1 | 6 -> 1 (GT 0) |
| 02 | 31 -> 13 (GT 12) | 0.842 -> 0.857 | 6 -> 3 | 2 -> 1 (GT 0) |

## Results

| Seq | Frames | Det. precision | Det. recall | Link accuracy | ID switches | CTC SEG | Divisions pred / GT | Mean speed um/min pred / GT |
|---|---|---|---|---|---|---|---|---|
| 01 | 115 | 0.928 | 0.999 | 0.999 | 1 | 0.940 | 1 / 0 | 0.183 / 0.205 |
| 02 | 115 | 0.857 | 0.987 | 0.995 | 3 | 0.867 | 1 / 0 | 0.137 / 0.158 |

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
