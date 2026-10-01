"""
Builds the compact validation report for the website: model, version, metrics,
limitations. Writes reports/VALIDATION_REPORT.md, a self-contained
docs/validation_report.html, and docs/validation_report.json (the same content as
structured blocks, for the website's /validation route). Every number is read from the benchmark outputs.
"""
import html
import json
import re
from datetime import date
from pathlib import Path

import pandas as pd

from classify import RULES_VERSION
from provenance import LEVEL_TEXT, REPORTS, ROOT, load_kb, model_cards

RELEASE = "1.0.0"


def build():
    p1 = pd.read_csv(REPORTS / "phase1_per_image_metrics.csv")
    p2 = pd.read_csv(REPORTS / "phase2_tracking_metrics.csv", dtype={"sequence": str})
    p3 = pd.read_csv(REPORTS / "phase3_phenotype_features.csv", usecols=["image"])
    lab = pd.read_csv(REPORTS / "phase4_u373_labels.csv")
    cons = pd.read_csv(REPORTS / "phase4_u373_gt_consistency.csv")
    qc = pd.read_csv(REPORTS / "phase4_bbbc039_flag_qc.csv", index_col=0)
    kb = load_kb()
    agree = int((cons["label_on_gt_trajectory"] == cons["label_on_our_trajectory"]).sum())
    cards = model_cards(RULES_VERSION, f"{agree}/{len(cons)} motility labels unchanged when the rule is applied "
                                       "to ground-truth trajectories")
    abn = qc[qc.index.str.startswith("abnormal")]
    merge, one = "merge of >=2 real nuclei", "one real nucleus (IoU>=0.5)"
    base = qc.loc["not assessable (single frame)"]
    counts = lab.groupby("label")["cell_id"].nunique()
    stability = REPORTS / "release_stability_check.md"
    stab_rows = []
    if stability.exists():
        for line in stability.read_text(encoding="utf-8").splitlines():
            cells = [c.strip() for c in line.strip("|").split("|")]
            if line.startswith("|") and cells[0] in ("01", "02"):
                stab_rows.append(cells)

    S = []  # list of (kind, payload): h1/h2/p/ul/table
    S.append(("h1", "BioLayers AI: Validation Report"))
    S.append(("p", f"Release {RELEASE}, {date.today():%d %B %Y}. Research and educational system. "
                   "**Not a clinical diagnostic.**"))
    S.append(("p", "BioLayers AI takes a microscopy image or time-lapse, finds and outlines the cells, follows "
                   "them over time, measures their shape and movement, assigns rule-based phenotype labels, and "
                   "links the observed phenotype to published literature. It uses proven pretrained models; no "
                   "model was trained for this release."))

    S.append(("h2", "Models and versions"))
    S.append(("table", (["Component", "Model", "Version", "Confidence reported"],
                        [[n.replace("_", " "), c["model"], c["version"], c["confidence"]] for n, c in cards.items()])))

    S.append(("h2", "Metrics"))
    S.append(("p", f"**Segmentation, nuclei.** BBBC039, {len(p1)} fluorescence images of U2OS nuclei with "
                   "hand-annotated masks. Zero-shot (no fine-tuning). Objects matched at IoU >= 0.5."))
    S.append(("table", (["Pixel IoU", "Pixel Dice", "Precision", "Recall", "F1", "Correct / false / missed nuclei"],
                        [[f"{p1.pixel_iou.mean():.3f}", f"{p1.pixel_dice.mean():.3f}", f"{p1.precision.mean():.3f}",
                          f"{p1.recall.mean():.3f}", f"{p1.f1.mean():.3f}",
                          f"{p1.tp.sum():,} / {p1.fp.sum():,} / {p1.fn.sum():,}"]])))
    S.append(("p", "**Segmentation and tracking, whole cells.** Cell Tracking Challenge PhC-C2DH-U373, "
                   f"phase-contrast glioblastoma-astrocytoma cells, {len(p2)} sequences of {int(p2.frames.iloc[0])} "
                   "frames with ground-truth tracks."))
    S.append(("table", (["Sequence", "SEG (mean Jaccard)", "Detection precision", "Detection recall",
                         "Link accuracy", "Identity switches", "Divisions found / real"],
                        [[r.sequence, f"{r.ctc_seg:.3f}", f"{r.detection_precision:.3f}", f"{r.detection_recall:.3f}",
                          f"{r.link_accuracy:.3f}", str(int(r.identity_switches)),
                          f"{int(r.pred_division_events)} / {int(r.gt_division_events)}"] for r in p2.itertuples()])))
    S.append(("p", f"**Phenotype measurement.** {len(p3):,} nuclei measured: area, perimeter, circularity, "
                   "eccentricity, aspect ratio, solidity, intensity, texture. For tracked cells: migration distance, "
                   "speed, directionality, division events. Nuclear/cytoplasmic ratio is **not** available (it "
                   "needs two imaging channels)."))
    S.append(("p", f"**Phenotype classification.** Transparent threshold rules (version {RULES_VERSION}), not a "
                   f"trained model. On {lab.cell_id.nunique()} tracked U373 cells: "
                   + ", ".join(f"{v} {k}" for k, v in counts.items()) + " (a cell can carry several labels). "
                   f"There are no expert labels to score against. Indirect checks: {agree} of {len(cons)} motility "
                   "labels are unchanged when the rule is applied to the ground-truth trajectories; "
                   f"{abn[one].sum() / abn['All'].sum():.0%} of abnormal-morphology flags on BBBC039 are a single "
                   f"real nucleus, while {abn[merge].sum() / abn['All'].sum():.1%} are merged nuclei "
                   f"(against {base[merge] / base['All']:.1%} of unflagged nuclei)."))
    S.append(("p", f"**Biological linking.** Curated knowledge base (version {kb['version']}): {len(kb['papers'])} "
                   f"papers, {len(kb['links'])} phenotype-to-entity links, each statement checked against its PubMed "
                   "abstract. Flagship case study: glioblastoma cell migration linked to the CXCL12/CXCR4 axis, with "
                   "cancer-associated fibroblasts as a CXCL12 source."))
    if stab_rows:
        ok = sum(r[2] == "ok" for r in stab_rows)
        S.append(("p", f"**Stability.** The end-to-end demo completed in {ok} of {len(stab_rows)} release runs "
                       "(cached masks and repeated fresh GPU segmentation)."))
        S.append(("table", (["Sequence", "Run", "Status", "Seconds", "Cells", "Compared with cached run",
                             "Flagship cell"], stab_rows)))

    S.append(("h2", "Evidence levels"))
    S.append(("p", "Every statement the system makes carries exactly one level. They are never presented as equivalent."))
    S.append(("table", (["Level", "Meaning"], [[f"`{k}`", v] for k, v in LEVEL_TEXT.items()])))

    S.append(("h2", "Limitations"))
    S.append(("ul", [
        "**Public benchmark data only.** No proprietary or patient data was used. The flagship case study runs on "
        "U373 cells as a stand-in; no A549 or fibroblast co-culture images were available.",
        "**The biological link is a hypothesis for any individual cell.** The images contain no CXCL12, CXCR4 or "
        "fibroblast signal. Literature describes the cell type and pathway in general.",
        "**Phenotype labels are unvalidated rules.** No expert-labelled cells exist to measure their accuracy.",
        "**Division detection is unvalidated.** The benchmark sequences contain no real divisions, and the detector "
        "reports one false division per sequence, so 'proliferating' labels on this data are false positives.",
        "**Abnormal-morphology flags include segmentation errors** (merged touching nuclei) as well as real shapes.",
        "**Tracking metrics are our own implementation** of the Cell Tracking Challenge definitions, not the "
        "official evaluation software, and are not comparable to its leaderboard.",
        "**Measured speeds are about 12% below ground truth** (mask centroids versus hand-placed markers).",
        "**Two datasets, two cell lines.** Performance on other stains, magnifications and cell types is unmeasured.",
        "**Confidence values are not calibrated probabilities.** Cell probability is the model's own score; rule "
        "margin is a distance from a threshold.",
        "**Cell line identity.** Many stocks labelled U-373 are U-251 (Torsvik et al. 2014, PMID 24810477).",
    ]))

    S.append(("h2", "Licences and data sources"))
    S.append(("ul", [
        "Cellpose code: BSD-3-Clause. The Cellpose project states that all its pretrained models are trained on "
        "data licensed **CC-BY-NC (non-commercial)**. Commercial use needs a licence review first.",
        "BBBC039: Broad Bioimage Benchmark Collection, CC0.",
        "PhC-C2DH-U373: Cell Tracking Challenge training data, used under the challenge's terms with citation.",
    ]))

    S.append(("h2", "Reproduce"))
    S.append(("ul", ["`python src/benchmark_phase1.py` (segmentation benchmark)",
                     "`python src/track_phase2.py` (tracking benchmark)",
                     "`python src/run_case_study.py` (phenotype labels, literature links, model cards)",
                     "`python src/demo.py` (end-to-end demo on the flagship time-lapse)"]))
    return S


def to_md(S):
    out = []
    for kind, x in S:
        if kind == "h1":
            out.append(f"# {x}\n")
        elif kind == "h2":
            out.append(f"\n## {x}\n")
        elif kind == "p":
            out.append(x + "\n")
        elif kind == "ul":
            out.append("\n".join(f"- {i}" for i in x) + "\n")
        elif kind == "table":
            head, rows = x
            out.append("| " + " | ".join(head) + " |\n|" + "---|" * len(head) + "\n"
                       + "\n".join("| " + " | ".join(map(str, r)) + " |" for r in rows) + "\n")
    return "\n".join(out)


def inline(text):
    text = html.escape(str(text))
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return re.sub(r"`(.+?)`", r"<code>\1</code>", text)


def to_html(S):
    body = []
    for kind, x in S:
        if kind in ("h1", "h2", "p"):
            body.append(f"<{kind}>{inline(x)}</{kind}>")
        elif kind == "ul":
            body.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in x) + "</ul>")
        elif kind == "table":
            head, rows = x
            body.append("<div class=\"tw\"><table><thead><tr>" + "".join(f"<th>{inline(h)}</th>" for h in head)
                        + "</tr></thead><tbody>"
                        + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
                        + "</tbody></table></div>")
    css = """
:root{--bg:#fff;--ink:#1b1f24;--muted:#5b6470;--line:#dde1e6;--soft:#f4f6f8;--accent:#0f4c81}
@media (prefers-color-scheme:dark){:root{--bg:#14171b;--ink:#e6e9ed;--muted:#9aa4b1;--line:#2c333b;--soft:#1d2228;--accent:#7db7ee}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "Segoe UI",system-ui,Arial,sans-serif}
main{max-width:860px;margin:0 auto;padding:32px 16px 56px}h1{font-size:1.7rem;color:var(--accent);margin:0 0 8px}
h2{font-size:1.2rem;color:var(--accent);border-bottom:2px solid var(--accent);padding-bottom:4px;margin:32px 0 12px}
p{margin:8px 0}li{margin:6px 0}code{background:var(--soft);padding:1px 5px;border-radius:4px;font-size:.88em}
.tw{overflow-x:auto;margin:10px 0}table{border-collapse:collapse;width:100%;font-size:.9rem}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}th{background:var(--soft)}
"""
    return ("<!DOCTYPE html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
            "<title>BioLayers AI Validation Report</title><style>" + css + "</style></head><body><main>\n"
            + "\n".join(body) + "\n</main></body></html>\n")


if __name__ == "__main__":
    S = build()
    repo = ROOT
    (REPORTS / "VALIDATION_REPORT.md").write_text(to_md(S), encoding="utf-8")
    (repo / "docs").mkdir(exist_ok=True)
    (repo / "docs" / "validation_report.html").write_text(to_html(S), encoding="utf-8")
    blocks = [dict(type=k, **({"head": x[0], "rows": x[1]} if k == "table" else
                              {"items": x} if k == "ul" else {"text": x})) for k, x in S]
    (repo / "docs" / "validation_report.json").write_text(
        json.dumps(dict(release=RELEASE, generated=str(date.today()), blocks=blocks), indent=2), encoding="utf-8")
    print("wrote reports/VALIDATION_REPORT.md, docs/validation_report.html and docs/validation_report.json")
