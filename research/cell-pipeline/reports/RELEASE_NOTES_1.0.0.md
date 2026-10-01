# BioLayers AI: AI layer release 1.0.0

1 October 2026. Research and educational system. Not a clinical diagnostic.

## What is in this release

- **One-command demo:** `python src/demo.py` runs the flagship case study end to end (segment, track, measure, classify, link) and writes an overlay video, label masks, a per-cell JSON atlas and the flagship figure. It also accepts any folder of time-lapse frames or a single image.
- **Flagship case study:** U373 glioblastoma cell migration linked to the CXCL12/CXCR4 axis, with cancer-associated fibroblasts as a CXCL12 source. Every statement is tagged as observed in the image, supported by literature, or inferred by a model.
- **Validation report for the website:** `reports/VALIDATION_REPORT.md` and a self-contained page, `docs/validation_report.html`.
- **Handoff package for the Software team:** `handoff/` holds sample outputs and the format spec (`handoff/README.md`).
- **Demo video:** `results/biolayers_demo_90s.mp4` (87 s, 1280x720), built from real pipeline outputs.

## Validated

| What | Result |
|---|---|
| Segmentation, BBBC039 (200 images) | Pixel IoU 0.942, Dice 0.970, precision 0.980, recall 0.966 |
| Tracking, CTC PhC-C2DH-U373 (2 sequences) | Link accuracy 0.999 / 0.995, identity switches 1 / 3, SEG 0.940 / 0.867 |
| Demo stability | 6 of 6 runs completed; fresh GPU segmentation reproduced the cached results exactly |

## Not validated (stated in the validation report)

- Phenotype labels are transparent rules with no expert-labelled data to score them.
- Division detection: the benchmark sequences contain no real divisions, and the detector reports one false division per sequence.
- The literature link is a hypothesis for any individual cell. The images contain no CXCL12, CXCR4 or fibroblast signal.
- Nuclear/cytoplasmic ratio is not computed (needs two-channel images).
- All results use public benchmark data; U373 stands in for the flagship because no A549 or CAF images were available.

## Before commercial use

Cellpose's code is BSD-3-Clause, but the Cellpose project states that all its pretrained models are trained on CC-BY-NC (non-commercial) data. Licensing needs review before any commercial deployment.

## Open items for the team

- Publish `docs/validation_report.html` (or the Markdown version) on the website.
- Software team: confirm the formats in `handoff/README.md` cover what the frontend needs.
- Provide A549 or CAF co-culture imaging, if available, to replace the stand-in data.
