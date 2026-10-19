# Task Brief: AI Model Developer

**Project:** BioLayers AI microscopy layer, code in `research/cell-pipeline/` (read its README and `reports/VALIDATION_REPORT.md` first).
Full context: `docs/TEAM_TASKS.md`.

## Current state (audited 19 Oct 2026)
- Segmentation: Cellpose (cpsam_v2), zero-shot, no training. BBBC039 (200 images): IoU 0.942, Dice 0.970, F1 0.972.
- Tracking: own overlap tracker (Hungarian on mask IoU). U373 seq 01/02: SEG 0.940 / 0.867, link accuracy 0.999 / 0.995, identity switches 1 / 3. **Finds 1 division in each sequence where ground truth has 0.**
- Phenotype: 22,675 nuclei measured; labels (migrating, quiescent, proliferating, apoptotic/dead, abnormal) come from **transparent rules, not validated against experts**.
- Confidence: Cellpose probability saturates near 0.95-0.97, so it is uncalibrated.
- Linking: curated knowledge base, 5 papers.
- Runs offline in Python (about 25 s cached, about 2 min fresh on GPU). The website only shows results.
- Stability: 6 of 6 release runs identical (`src/stability_check.py`).

## Tasks (in order)
1. **Validate phenotypes:** when the Data Collector delivers expert labels, score the rules (precision / recall per class), tune thresholds on a held-out part, and publish results in the validation report. Keep "not clinically validated".
2. **Second dataset:** repeat segmentation and tracking on a cancer-relevant set already in the catalog (MDA-MB-231 or HeLa from Cell Tracking Challenge) so the benchmark is not one dataset. Report metrics honestly, including failures.
3. **Tracking quality:** find why false divisions appear and why seq 02 has 3 identity switches; fix or document. Add nuclear/cytoplasmic ratio where a second channel exists.
4. **Serve the pipeline:** wrap `src/demo.py` as a batch job that precomputes masks and per-cell JSON and writes them to storage. Agree the JSON schema with the Software Engineer (current example: `reports/phase5_cell_atlas_u373.json`). Do not require a GPU at request time.
5. **Model cards and calibration:** keep one card per component (model, version, dataset, metric, limitation). Add a calibration check for the segmentation confidence.
6. **Keep stability:** rerun `stability_check.py` after every change; results must stay identical.

## Rules
- Every statement keeps one evidence level: observed_directly_in_image, supported_by_literature, inferred_by_model.
- No clinical diagnostic claims.
- Do not train on or redistribute data whose license is unresolved (see Data Collector brief).

## Done when
Phenotype rules scored on expert labels, a second-dataset benchmark published, tracking issues explained or fixed, and the pipeline outputs consumable by the website without a laptop.
