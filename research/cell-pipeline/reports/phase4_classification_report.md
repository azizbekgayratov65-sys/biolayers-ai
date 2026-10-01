# Phase 4 — Phenotype Classification: Report

## Method
Rule-based, not learned: there is no labelled data for the five target
classes, so each class is a transparent threshold rule over Phase 2-3
measurements. Rules version 0.1.0.

| Rule | Definition |
|---|---|
| R-MIG | net displacement >= 1.0 cell diameter over >= 20 frames |
| R-QUI | net displacement < 0.5 cell diameter over >= 20 frames, no division |
| R-PRO | track is the parent of a division whose daughters both persist >= 3 frames |
| R-DEAD | over the last 8 frames, area <= 60% of the track median and circularity >= 0.85 |
| R-ABN | median area, circularity or solidity has |robust z| >= 3.5 against the population |
| R-PYK | nucleus area <= 50% of dataset median and intensity above the 95% quantile of its image (pyknotic-like) |

Confidence is a **rule margin**: how far the deciding feature is from its
threshold, mapped to 0.5 (on the line) .. 0.99. It is not a probability.
Thresholds are set in cell-size units (e.g. "moved one own diameter"), not
fitted to these data.

## Time-lapse cells (U373, 22 tracks of >= 5 frames)

| Label | Cells |
|---|---|
| abnormal morphology | 4 |
| apoptotic/dead | 1 |
| indeterminate | 10 |
| migrating | 10 |
| proliferating | 1 |
| quiescent | 2 |

| Cell | Label | Rule | Confidence |
|---|---|---|---|
| U373-01-T1 | migrating | R-MIG | 0.578 |
| U373-01-T2 | migrating | R-MIG | 0.852 |
| U373-01-T3 | indeterminate | net displacement between 0.5 and 1 cell diameter |  |
| U373-01-T4 | quiescent | R-QUI | 0.554 |
| U373-01-T4 | abnormal morphology | R-ABN | 0.561 |
| U373-01-T5 | migrating | R-MIG | 0.637 |
| U373-01-T6 | migrating | R-MIG | 0.99 |
| U373-01-T10 | migrating | R-MIG | 0.704 |
| U373-01-T30 | indeterminate | track shorter than 20 frames |  |
| U373-01-T32 | indeterminate | net displacement between 0.5 and 1 cell diameter |  |
| U373-01-T32 | apoptotic/dead | R-DEAD | 0.775 |
| U373-01-T32 | abnormal morphology | R-ABN | 0.57 |
| U373-02-T2 | migrating | R-MIG | 0.849 |
| U373-02-T3 | quiescent | R-QUI | 0.941 |
| U373-02-T4 | migrating | R-MIG | 0.559 |
| U373-02-T5 | indeterminate | net displacement between 0.5 and 1 cell diameter |  |
| U373-02-T6 | proliferating | R-PRO | 0.99 |
| U373-02-T6 | migrating | R-MIG | 0.671 |
| U373-02-T7 | migrating | R-MIG | 0.99 |
| U373-02-T9 | indeterminate | track shorter than 20 frames |  |
| U373-02-T10 | indeterminate | track shorter than 20 frames |  |
| U373-02-T10 | abnormal morphology | R-ABN | 0.672 |
| U373-02-T13 | indeterminate | track shorter than 20 frames |  |
| U373-02-T13 | abnormal morphology | R-ABN | 0.508 |
| U373-02-T16 | migrating | R-MIG | 0.666 |
| U373-02-T17 | indeterminate | track shorter than 20 frames |  |
| U373-02-T24 | indeterminate | net displacement between 0.5 and 1 cell diameter |  |
| U373-02-T30 | indeterminate | track shorter than 20 frames |  |

**Known false positives:** the ground truth for these sequences has no cell divisions, so the 1 'proliferating' label(s) above come from false division detections (see Phase 2). They are kept, not hidden, because the rule fired.

## Consistency check against ground-truth trajectories
Applying the same motility rule to the hand-annotated CTC trajectories gives
the same label as our tracked trajectories for **10/14**
matched cells (mismatches: seq 01 GT cell 7 -> our T10: indeterminate vs migrating; seq 02 GT cell 1 -> our T4: indeterminate vs migrating; seq 02 GT cell 14 -> our T16: quiescent vs migrating; seq 02 GT cell 18 -> our T16: indeterminate vs migrating. Our track(s) seq 02 T16 follow more than one real cell (an identity switch), which merges two trajectories and can change the label).
So tracking errors changed the motility label for 4 of 14
cells (causes listed above). This check does **not** show the
labels are biologically right; that needs expert-labelled cells.

## Single-frame nuclei (BBBC039, 22675 nuclei)
Only morphology-based classes can be assessed from one frame.

| Label | Nuclei |
|---|---|
| not assessable (single frame) | 15730 |
| not assessable (cut by image edge) | 4430 |
| abnormal morphology | 2102 |
| apoptotic/dead | 413 |

### Are the flags real? Check against hand-annotated nuclei
Each flagged nucleus (fresh Cellpose run, `src/qc_static_flags.py`) compared with the BBBC039 ground truth:

| Label | merge of >=2 real nuclei | no matching real nucleus | one real nucleus (IoU>=0.5) | Total |
|---|---|---|---|---|
| abnormal morphology (area) | 7 | 79 | 385 | 471 |
| abnormal morphology (circularity) | 1 | 0 | 33 | 34 |
| abnormal morphology (solidity) | 134 | 63 | 1400 | 1597 |
| apoptotic/dead | 13 | 35 | 365 | 413 |
| not assessable (cut by image edge) | 34 | 200 | 4196 | 4430 |
| not assessable (single frame) | 74 | 53 | 15603 | 15730 |
| All | 263 | 430 | 21982 | 22675 |

86% of abnormal-morphology flags are a single real nucleus, so most flags are genuine shapes. But 6.8% of flags are merges of two or more real nuclei, against 0.5% of unflagged nuclei: the flag is 14x enriched for segmentation errors. 'Abnormal' here means unusual for this population, not a pathology call; 2102 of 18245 interior nuclei are flagged, mostly for low solidity (concave outline).


## Limitations
- No biological ground truth; the rules are unvalidated against expert labels.
- "quiescent" is operational (not migrating, not seen dividing). Cell-cycle
  quiescence is not observable in phase contrast.
- "proliferating" depends on division detection, whose recall is unmeasured
  (Phase 2 sequences contain no real divisions).
- Abnormal-morphology flags are population outliers; with ~10 cells per U373
  sequence the population is small.
- Per-cell labels: reports/phase4_u373_labels.csv, reports/phase4_bbbc039_labels.csv.
