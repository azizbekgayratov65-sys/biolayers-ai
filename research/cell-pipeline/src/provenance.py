"""
Phase 5-6 — Evidence levels, provenance, and literature linking.

Every statement the system makes is tagged with exactly one evidence level,
and every AI-derived value carries a model card: model, version, confidence,
dataset, evaluation metric, limitations. Benchmark numbers are read from the
Phase 1/2 metric CSVs, never typed in by hand.
"""
import json
import subprocess
from pathlib import Path

import pandas as pd

OBSERVED = "observed_directly_in_image"  # matches the web app's EvidenceLevel type
LITERATURE = "supported_by_literature"
INFERRED = "inferred_by_model"
LEVEL_TEXT = {
    OBSERVED: "Observed directly in the image (measured from segmented pixels)",
    LITERATURE: "Supported by published literature (not observed in this image)",
    INFERRED: "Inferred by a model or rule (not an experimental fact)",
}

ROOT = Path(__file__).resolve().parent.parent
KB_PATH = ROOT / "knowledge" / "literature.json"
REPORTS = ROOT / "reports"


def code_version():
    try:
        return subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT,
                                       text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return "unknown"


def load_kb():
    return json.loads(KB_PATH.read_text(encoding="utf-8"))


def model_cards(rules_version, classifier_eval=None):
    import cellpose
    p1 = pd.read_csv(REPORTS / "phase1_per_image_metrics.csv")
    p2 = pd.read_csv(REPORTS / "phase2_tracking_metrics.csv", dtype={"sequence": str})
    kb = load_kb()
    ctc = {f"seq{r.sequence}": round(r.ctc_seg, 3) for r in p2.itertuples()}
    code = code_version()

    return {
        "segmentation": dict(
            model="Cellpose, pretrained cpsam_v2 weights (zero-shot, no fine-tuning)",
            version=f"cellpose {cellpose.version}",
            confidence="per cell: mean Cellpose cell probability inside the mask (uncalibrated, "
                       "tends to saturate near 0.95-0.97)",
            dataset="BBBC039 (200 images, U2OS nuclei, Hoechst) and CTC PhC-C2DH-U373 (2 sequences)",
            evaluation_metric={
                "BBBC039 pixel IoU": round(p1["pixel_iou"].mean(), 3),
                "BBBC039 pixel Dice": round(p1["pixel_dice"].mean(), 3),
                "BBBC039 object precision @IoU0.5": round(p1["precision"].mean(), 3),
                "BBBC039 object recall @IoU0.5": round(p1["recall"].mean(), 3),
                "U373 CTC SEG (mean Jaccard)": ctc,
            },
            limitations=[
                "Benchmarked on two public datasets only; performance on other stains, "
                "magnifications or cell types is unmeasured.",
                "The cell probability is the model's own score, not a calibrated error rate.",
            ],
        ),
        "tracking": dict(
            model="BioLayers overlap tracker (Hungarian assignment on mask IoU + gap/flicker clean-up)",
            version=f"code {code}",
            confidence="per track: mean IoU between the cell's masks in consecutive frames",
            dataset="CTC PhC-C2DH-U373, training sequences 01 and 02 (230 frames)",
            evaluation_metric={
                f"seq{r.sequence}": {
                    "link accuracy": round(r.link_accuracy, 4),
                    "identity switches": int(r.identity_switches),
                    "detection precision": round(r.detection_precision, 3),
                    "detection recall": round(r.detection_recall, 3),
                } for r in p2.itertuples()
            },
            limitations=[
                "Own CTC-style metrics, not the official CTC evaluation software.",
                "Division detection is only shown not to invent divisions; these sequences "
                "contain no real divisions, so its recall is unmeasured.",
                "Mean speeds run ~12% below ground truth (centroid vs hand-placed marker jitter).",
            ],
        ),
        "phenotype_rules": dict(
            model="Rule-based phenotype classifier (transparent thresholds, not a learned model)",
            version=f"rules {rules_version}, code {code}",
            confidence="per label: rule margin, the deciding feature's distance from its threshold "
                       "mapped to 0.5-0.99 (not a probability)",
            dataset="no labelled phenotype data exists for these classes; thresholds set from "
                    "cell-size units, not fitted to data",
            evaluation_metric=classifier_eval or "none available",
            limitations=[
                "No biological ground truth: the rules have not been validated against expert labels.",
                "'quiescent' means not migrating and not seen dividing; cell-cycle quiescence (G0) "
                "is not observable in phase contrast.",
                "Abnormal-morphology flags are population outliers, so they depend on which cells "
                "are in the population.",
            ],
        ),
        "literature_linker": dict(
            model="Curated knowledge base, manual curation (no text mining, no language model)",
            version=f"knowledge base {kb['version']} ({kb['curated']})",
            confidence="not scored: each link cites the PubMed-verified paper it rests on",
            dataset=f"{len(kb['papers'])} papers, {len(kb['links'])} phenotype-entity links",
            evaluation_metric="each statement checked against its PubMed abstract",
            limitations=[
                "Links describe what is known about the cell type or pathway in general; they are "
                "never evidence about the specific cell in the image.",
                "Only the 'migrating' phenotype has curated links in this release.",
            ],
        ),
    }


def statement(level, text, source=None, confidence=None, **extra):
    assert level in LEVEL_TEXT
    out = dict(level=level, statement=text)
    if source:
        out["source"] = source
    if confidence is not None:
        out["confidence"] = confidence
    out.update(extra)
    return out


def literature_links(phenotype, kb, cell_type):
    """Curated literature statements for a phenotype in a given cell type, each with its citations.
    A link is only returned for the cell type it was curated for."""
    papers = kb["papers"]
    return [
        statement(LITERATURE, link["statement"], source="literature_linker",
                  entity=link["entity"], entity_type=link["entity_type"], link_id=link["id"],
                  context=link["context"],
                  citations=[dict(key=k, **papers[k]) for k in link["papers"]])
        for link in kb["links"]
        if link["phenotype"] == phenotype and cell_type in link["cell_types"]
    ]


def caveats_for(cell_line, kb):
    papers = kb["papers"]
    return [
        statement(LITERATURE, c["statement"], source="literature_linker", caveat_id=c["id"],
                  citations=[dict(key=k, **papers[k]) for k in c["papers"]])
        for c in kb["caveats"] if c["applies_to"] == cell_line
    ]
