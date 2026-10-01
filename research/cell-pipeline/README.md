# BioLayers AI: microscopy AI layer

Takes a microscopy image or time-lapse and returns segmented cells, tracks,
per-cell measurements, rule-based phenotype labels, and links from the
observed phenotype to published literature. Every statement is tagged as
**observed in the image**, **supported by literature**, or **inferred by a
model**, and every AI-derived value carries a model card.

Research and educational system. **Not a clinical diagnostic.**

Release 1.0.0 (1 October 2026). Built on pretrained models (Cellpose); nothing
was trained for this release.

## Quick start

```
python -m venv .venv
.venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
pip install -r requirements.txt

python src/demo.py
```

`demo.py` runs the flagship case study end to end (about 25 s with cached
masks, about 2 min with `--fresh` GPU segmentation) and writes an overlay
video, label masks, a per-cell JSON atlas and the flagship figure to
`demo_output/`.

```
python src/demo.py --sequence 01          # the other U373 sequence
python src/demo.py --fresh                # segment live instead of using cached masks
python src/demo.py --image <file.tif>     # single image: segmentation + morphology + flags
python src/demo.py --frames <dir> --um-per-px 0.65 --min-per-frame 15 --cell-type glioma
```

Literature is only linked for cell types in the curated knowledge base
(currently glioma). For any other `--cell-type` the demo reports
measurements and labels and attaches no literature.

## Data

Raw datasets are not in the repository. Download and unpack them to:

| Dataset | Location | Source |
|---|---|---|
| BBBC039 (images + masks) | `data/BBBC039/images`, `data/BBBC039/masks` | https://bbbc.broadinstitute.org/BBBC039 (CC0) |
| PhC-C2DH-U373 (training) | `data/CTC/PhC-C2DH-U373/` | https://celltrackingchallenge.net/2d-datasets/ |

## Results

| Phase | Result |
|---|---|
| 1. Segmentation | BBBC039, 200 images, zero-shot: pixel IoU 0.942, Dice 0.970, precision 0.980, recall 0.966 |
| 2. Tracking | U373, 2 sequences: link accuracy 0.999 / 0.995, 1 / 3 identity switches, CTC SEG 0.940 / 0.867 |
| 3. Phenotype extraction | 22,675 nuclei: area, perimeter, circularity, eccentricity, aspect ratio, solidity, intensity, texture; migration distance and speed for tracked cells |
| 4. Classification | Transparent rules for migrating, quiescent, proliferating, apoptotic/dead, abnormal morphology. Not validated against expert labels. |
| 5. Biological linking | Flagship: U373 migration -> CXCL12/CXCR4 axis (CAF-derived CXCL12). 5 PubMed-verified papers. Per-cell link is a hypothesis. |
| 6. AI confidence | Model card per component: model, version, confidence, dataset, metric, limitations |

Full numbers and limitations: [reports/VALIDATION_REPORT.md](reports/VALIDATION_REPORT.md)
(website version: [docs/validation_report.html](docs/validation_report.html)).

## Layout

```
src/demo.py                    one-command end-to-end demo
src/benchmark_phase1.py        segmentation benchmark (BBBC039)
src/track_phase2.py            tracking benchmark (CTC U373)
src/extract_phenotypes_phase3.py   per-cell features
src/run_case_study.py          phases 4-6 on the flagship case study
src/qc_static_flags.py         checks single-frame flags against ground truth
src/stability_check.py         release stability runs of the demo
src/build_validation_report.py builds the website validation report
src/classify.py, tracking.py, phenotype.py, metrics.py, provenance.py   library code
knowledge/literature.json      curated, PubMed-verified knowledge base
reports/                       per-phase reports, metrics, per-cell outputs
handoff/                       sample outputs + format spec for the Software team
docs/validation_report.html    self-contained page for the website
```

## Known limitations

- Public benchmark data only; the flagship uses U373 cells as a stand-in (no A549 or CAF images were available).
- Phenotype labels are rules without expert validation; division detection is unvalidated.
- Nuclear/cytoplasmic ratio needs two-channel images and is not computed.
- Cellpose's pretrained models are trained on CC-BY-NC (non-commercial) data. Review licensing before any commercial use.

See the validation report for the complete list.
