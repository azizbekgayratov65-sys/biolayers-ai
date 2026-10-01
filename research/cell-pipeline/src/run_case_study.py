"""
Phases 4-6 — Flagship case study: U373 migration -> CXCL12/CXCR4 axis.

Image -> Cell -> Phenotype -> Biological Entity, on the CTC PhC-C2DH-U373
time-lapse data from Phase 2:
  1. segment + track every frame (cached Phase 2 masks, same clean-up)
  2. measure per-cell morphology and migration           (observed_directly_in_image)
  3. rule-based phenotype labels                          (inferred_by_model)
  4. curated literature links for the phenotype           (supported_by_literature)
  5. a per-cell hypothesis that is never presented as fact (inferred_by_model)
Every AI-derived value carries a model card (Phase 6). Also applies the
single-frame rules to the 22,675 BBBC039 nuclei from Phase 3.
"""
import json
import re
import textwrap
import warnings
from collections import Counter
from datetime import date

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from track_phase2 import ROOT, CACHE, RESULTS, REPORTS, UM_PER_PX, MIN_PER_FRAME, SEQUENCES, segment_sequence
from tracking import track, clean_tracks, centroids, migration_features, _match_markers
from phenotype import extract_phenotype_features
from classify import (RULES_VERSION, RULES, classify_tracks, classify_static_nuclei, motility_label)
from provenance import (OBSERVED, LITERATURE, INFERRED, LEVEL_TEXT, load_kb, model_cards,
                        statement, literature_links, caveats_for)
from skimage.io import imread

warnings.filterwarnings("ignore", category=FutureWarning)
BBBC_IMAGES = ROOT.parent.parent / "BBBC039" / "images"
LEVEL_COLORS = {OBSERVED: "#2e7d32", LITERATURE: "#1565c0", INFERRED: "#e65100"}


def cell_confidence(model, seq, frames, masks):
    """Mean Cellpose cell probability per (frame, label) of the cached masks."""
    cache = CACHE / f"u373_{seq}_cellconf.csv"
    if cache.exists():
        return pd.read_csv(cache)
    rows = []
    for t, (img, m) in enumerate(zip(frames, masks)):
        _, flows, _ = model.eval(img, diameter=None, channels=[0, 0])
        prob = 1 / (1 + np.exp(-flows[2]))
        for lab in np.unique(m)[1:]:
            rows.append(dict(frame=t, label=int(lab), cell_prob=float(prob[m == lab].mean())))
        if (t + 1) % 25 == 0:
            print(f"  seq {seq}: confidence {t+1}/{len(frames)}")
    df = pd.DataFrame(rows)
    df.to_csv(cache, index=False)
    return df


def per_track_quality(tracked, masks, conf):
    """Mean segmentation confidence and mean consecutive-frame mask IoU for every track."""
    conf = conf.set_index(["frame", "label"])["cell_prob"]
    seg, iou = {}, {}
    for t, lab in enumerate(tracked):
        for tid in np.unique(lab)[1:]:
            px = lab == tid
            raw = np.bincount(masks[t][px]).argmax()
            seg.setdefault(int(tid), []).append(conf.get((t, raw), np.nan))
            if t + 1 < len(tracked):
                nxt = tracked[t + 1] == tid
                if nxt.any():
                    iou.setdefault(int(tid), []).append((px & nxt).sum() / (px | nxt).sum())
    return ({k: round(float(np.nanmean(v)), 3) for k, v in seg.items()},
            {k: round(float(np.mean(v)), 3) for k, v in iou.items() if v})


def track_morphology(frames, tracked):
    parts = []
    for t, (img, lab) in enumerate(zip(frames, tracked)):
        df = extract_phenotype_features(img, lab)
        df.insert(0, "frame", t)
        parts.append(df)
    return pd.concat(parts, ignore_index=True)


def gt_consistency(seq, tracked, feats, labels):
    """Apply the motility rule to ground-truth trajectories and compare with ours.
    Measures pipeline consistency (would perfect tracking change the label?), not biology."""
    gt = [imread(str(p)) for p in sorted((ROOT / f"{seq}_GT/TRA").glob("man_track*.tif"))]
    # CTC splits one cell's track at every gap (single-child parent link); rejoin the pieces.
    gt_lin = pd.read_csv(ROOT / f"{seq}_GT/TRA/man_track.txt", sep=" ",
                         names=["track_id", "start", "end", "parent"])
    n_kids = gt_lin.loc[gt_lin["parent"] > 0, "parent"].value_counts()
    root = {}
    for r in gt_lin.sort_values("start").itertuples():
        root[r.track_id] = root.get(r.parent, r.parent) if n_kids.get(r.parent, 0) == 1 else r.track_id
    lut = np.arange(max(root) + 1)
    for k, v in root.items():
        lut[k] = v
    gt = [lut[g] for g in gt]
    gt_feats = migration_features(centroids(gt), UM_PER_PX, MIN_PER_FRAME).set_index("track_id")
    votes = {}
    for g_frame, p_frame in zip(gt, tracked):
        for g, p in _match_markers(g_frame, p_frame).items():
            votes.setdefault(g, Counter())[p] += 1
    rows = []
    for g, c in votes.items():
        p = c.most_common(1)[0][0]
        if g not in gt_feats.index or p not in labels:
            continue
        ours = next(l for l in labels[p] if l["label"] in ("migrating", "quiescent", "indeterminate"))
        diameter = ours["evidence"]["cell_diameter_um"]
        gr = gt_feats.loc[g]
        theirs = motility_label(gr.n_frames, gr.net_displacement_um, diameter)
        rows.append(dict(sequence=seq, gt_track=int(g), pred_track=int(p),
                         label_on_gt_trajectory=theirs["label"], label_on_our_trajectory=ours["label"]))
    return pd.DataFrame(rows)


def build_cell_record(seq, tid, feat, labels, seg_conf, link_iou, kb,
                      prefix="U373", cell_type="glioma", min_per_frame=MIN_PER_FRAME):
    obs = [
        statement(OBSERVED, f"Cell tracked for {feat.n_frames} frames "
                            f"({(feat.n_frames - 1) * min_per_frame / 60:.1f} h).",
                  source="tracking", confidence=link_iou),
        statement(OBSERVED, f"Net displacement {feat.net_displacement_um:.1f} um, path length "
                            f"{feat.path_length_um:.1f} um, mean speed {feat.mean_speed_um_per_min:.3f} um/min, "
                            f"directionality {feat.directionality:.2f}.",
                  source="tracking", confidence=link_iou,
                  values=dict(net_displacement_um=round(feat.net_displacement_um, 1),
                              path_length_um=round(feat.path_length_um, 1),
                              mean_speed_um_per_min=round(feat.mean_speed_um_per_min, 3),
                              directionality=round(feat.directionality, 2))),
        statement(OBSERVED, f"Segmented in every tracked frame; mean cell probability {seg_conf:.3f}.",
                  source="segmentation", confidence=seg_conf),
    ]
    inferred = [
        statement(INFERRED, f"Phenotype: {l['label']} (rule {l['rule']}: {l['rule_text']}).",
                  source="phenotype_rules", confidence=l["confidence"], evidence=l["evidence"])
        for l in labels
    ]
    links, hypothesis = [], []
    if any(l["label"] == "migrating" for l in labels):
        links = literature_links("migrating", kb, cell_type)
    if links:
        hypothesis = [statement(
            INFERRED,
            "Hypothesis only: this cell's migration may involve CXCL12/CXCR4 signalling, possibly "
            "with CXCL12 supplied by stromal cells such as CAFs. Not tested here: the movie contains no "
            "CXCL12 gradient, no CXCR4 label and no fibroblasts, and a single persistent cell in an "
            "unstimulated 2D culture is not evidence of chemotaxis.",
            source="literature_linker",
            how_to_test="Repeat the time-lapse with a CXCL12 gradient and with a CXCR4 antagonist, "
                        "and compare net displacement and directionality against untreated cells.")]
    return dict(cell_id=f"{prefix}-{seq}-T{tid}", sequence=seq, track_id=int(tid),
                observations=obs, phenotype=inferred, literature=links, hypothesis=hypothesis)


def draw_flagship(frame, cents, record, out_path):
    tid = record["track_id"]
    fig = plt.figure(figsize=(15, 8.6))
    ax = fig.add_axes([0.01, 0.04, 0.46, 0.88])
    ax.imshow(frame, cmap="gray")
    for other, g in cents.groupby("track_id"):
        g = g.sort_values("frame")
        if other == tid:
            continue
        ax.plot(g["col"], g["row"], color="white", lw=1, alpha=0.45)
    g = cents[cents["track_id"] == tid].sort_values("frame")
    ax.plot(g["col"], g["row"], color="#ffb300", lw=2.6)
    ax.scatter(*g[["col", "row"]].iloc[0], s=70, c="#00e5ff", zorder=3, label="start")
    ax.scatter(*g[["col", "row"]].iloc[-1], s=70, c="#ff1744", zorder=3, label="end")
    bar_px = 50 / UM_PER_PX
    ax.plot([20, 20 + bar_px], [frame.shape[0] - 20] * 2, color="white", lw=3)
    ax.text(20 + bar_px / 2, frame.shape[0] - 30, "50 um", color="white", ha="center", fontsize=9)
    ax.legend(loc="upper right", fontsize=8)
    ax.set_title(f"{record['cell_id']}: trajectory over {len(g)} frames (15 min/frame)", fontsize=11)
    ax.axis("off")

    steps = [("IMAGE -> CELL", record["observations"][2]),
             ("CELL -> MEASURED PHENOTYPE", record["observations"][1]),
             ("PHENOTYPE LABEL", record["phenotype"][0])]
    steps += [("BIOLOGICAL ENTITY: " + s["entity"], s) for s in record["literature"]]
    steps += [("HYPOTHESIS", h) for h in record["hypothesis"]]
    y = 0.96
    for title, s in steps:
        color = LEVEL_COLORS[s["level"]]
        body = s["statement"]
        for c in s.get("citations", []):
            year = re.search(r"\.\s(\d{4})[;.]", c["citation"]).group(1)
            body += f"  [{c['citation'].split()[0]} et al. {year}, PMID {c['pmid']}]"
        wrapped = textwrap.fill(body, 96)
        n = wrapped.count("\n") + 1
        h = 0.03 + 0.021 * n
        fig.patches.append(plt.Rectangle((0.49, y - h), 0.5, h, transform=fig.transFigure,
                                         facecolor=color, alpha=0.1, edgecolor=color, lw=1.2))
        conf = f"   confidence {s['confidence']}" if s.get("confidence") is not None else ""
        fig.text(0.5, y - 0.012, f"{title}   [{s['level']}]{conf}", fontsize=8.5,
                 weight="bold", color=color, va="top")
        fig.text(0.5, y - 0.032, wrapped, fontsize=8, va="top", family="monospace")
        y -= h + 0.01
    fig.text(0.49, 0.01, "Green: observed in image.  Blue: supported by literature.  "
                         "Orange: inferred by model.  Research/education use only, not a diagnosis.",
             fontsize=8, style="italic")
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def main():
    from cellpose import models
    model = models.CellposeModel(gpu=True)
    kb = load_kb()
    records, consistency, all_labels, frames_by_seq = [], [], [], {}

    for seq in SEQUENCES:
        print(f"Sequence {seq}")
        frames, masks = segment_sequence(model, seq)
        tracked, lineage = clean_tracks(*track(masks))
        cents = centroids(tracked)
        feats = migration_features(cents, UM_PER_PX, MIN_PER_FRAME)
        conf = cell_confidence(model, seq, frames, masks)
        seg_conf, link_iou = per_track_quality(tracked, masks, conf)
        morph = track_morphology(frames, tracked)
        labels = classify_tracks(feats, morph, lineage, UM_PER_PX)
        consistency.append(gt_consistency(seq, tracked, feats, labels))
        frames_by_seq[seq] = (frames[-1], cents)

        for feat in feats.itertuples():
            rec = build_cell_record(seq, feat.track_id, feat, labels[feat.track_id],
                                    seg_conf[feat.track_id], link_iou.get(feat.track_id), kb)
            records.append(rec)
            for l in labels[feat.track_id]:
                all_labels.append(dict(cell_id=rec["cell_id"], label=l["label"], rule=l["rule"],
                                       confidence=l["confidence"], **{k: v for k, v in l["evidence"].items()
                                                                      if not isinstance(v, list)}))

    consistency = pd.concat(consistency, ignore_index=True)
    agree = (consistency["label_on_gt_trajectory"] == consistency["label_on_our_trajectory"])
    classifier_eval = {
        "motility label agreement, rule applied to ground-truth vs our trajectories":
            f"{int(agree.sum())}/{len(agree)} tracks",
        "note": "checks that tracking errors do not change the label; it does not validate the biology",
    }
    cards = model_cards(RULES_VERSION, classifier_eval)

    # Flagship cell: the most confidently migrating track across both sequences.
    migrating = [r for r in records if any("migrating" in p["statement"] for p in r["phenotype"])]
    flagship = max(migrating, key=lambda r: r["observations"][1]["values"]["net_displacement_um"])
    frame, cents = frames_by_seq[flagship["sequence"]]
    draw_flagship(frame, cents, flagship, RESULTS / "phase5_flagship_cell.png")

    atlas = dict(
        title="BioLayers AI cell atlas: U373 migration case study",
        generated=str(date.today()),
        disclaimer="Research and educational system. Not a clinical diagnostic.",
        dataset=dict(name="Cell Tracking Challenge PhC-C2DH-U373, training sequences 01 and 02",
                     pixel_size_um=UM_PER_PX, frame_interval_min=MIN_PER_FRAME,
                     caveats=caveats_for("U373", kb)),
        evidence_levels=LEVEL_TEXT,
        model_cards=cards,
        flagship_cell=flagship["cell_id"],
        cells=records,
    )
    (REPORTS / "phase5_cell_atlas_u373.json").write_text(json.dumps(atlas, indent=2, default=float),
                                                          encoding="utf-8")
    labels_df = pd.DataFrame(all_labels)
    labels_df.to_csv(REPORTS / "phase4_u373_labels.csv", index=False)
    consistency.to_csv(REPORTS / "phase4_u373_gt_consistency.csv", index=False)

    static = classify_static_nuclei(pd.read_csv(REPORTS / "phase3_phenotype_features.csv"),
                                    image_shape=imread(str(next(BBBC_IMAGES.glob("*.tif")))).shape)
    static[["image", "cell_id", "label", "rule", "feature", "confidence"]].to_csv(
        REPORTS / "phase4_bbbc039_labels.csv", index=False)

    print(labels_df.to_string())
    print(consistency.to_string())
    print(static["label"].value_counts())
    print("Flagship:", flagship["cell_id"])
    write_reports(labels_df, consistency, static, flagship, cards, kb)


def write_reports(labels_df, consistency, static, flagship, cards, kb):
    counts = labels_df.groupby("label")["cell_id"].nunique()
    n_cells = labels_df["cell_id"].nunique()
    agree = (consistency["label_on_gt_trajectory"] == consistency["label_on_our_trajectory"])
    track_rows = "\n".join(
        f"| {r.cell_id} | {r.label} | {r.rule} | {'' if pd.isna(r.confidence) else r.confidence} |"
        for r in labels_df.itertuples())
    static_counts = static["label"].value_counts()
    rules = "\n".join(f"| {k} | {v} |" for k, v in RULES.items())
    p2 = pd.read_csv(REPORTS / "phase2_tracking_metrics.csv")
    n_pro = int(counts.get("proliferating", 0))
    pro_note = ""
    if n_pro and p2["gt_division_events"].sum() == 0:
        pro_note = (f"\n**Known false positives:** the ground truth for these sequences has no cell "
                    f"divisions, so the {n_pro} 'proliferating' label(s) above come from false division "
                    f"detections (see Phase 2). They are kept, not hidden, because the rule fired.\n")
    qc_path = REPORTS / "phase4_bbbc039_flag_qc.csv"
    qc_md = ""
    if qc_path.exists():
        qc = pd.read_csv(qc_path, index_col=0)
        cols = [c for c in qc.columns if c != "All"]
        abn = qc[qc.index.str.startswith("abnormal")]
        merge_col, one_col = "merge of >=2 real nuclei", "one real nucleus (IoU>=0.5)"
        flagged_merge = abn[merge_col].sum() / abn["All"].sum()
        unflagged = qc.loc["not assessable (single frame)"]
        base_merge = unflagged[merge_col] / unflagged["All"]
        qc_takeaway = (
            f"\n{abn[one_col].sum() / abn['All'].sum():.0%} of abnormal-morphology flags are a single real "
            f"nucleus, so most flags are genuine shapes. But {flagged_merge:.1%} of flags are merges of two or "
            f"more real nuclei, against {base_merge:.1%} of unflagged nuclei: the flag is "
            f"{flagged_merge / base_merge:.0f}x enriched for segmentation errors. 'Abnormal' here means "
            f"unusual for this population, not a pathology call; {int(abn['All'].sum())} of "
            f"{int(qc['All'].iloc[-1] - qc.loc['not assessable (cut by image edge)', 'All'])} interior "
            f"nuclei are flagged, mostly for low solidity (concave outline).\n")
        qc_md = ("\n\n### Are the flags real? Check against hand-annotated nuclei\n"
                 "Each flagged nucleus (fresh Cellpose run, `src/qc_static_flags.py`) compared with the "
                 "BBBC039 ground truth:\n\n| Label | " + " | ".join(cols) + " | Total |\n|---|"
                 + "---|" * (len(cols) + 1) + "\n"
                 + "\n".join(f"| {i} | " + " | ".join(str(int(r[c])) for c in cols) + f" | {int(r['All'])} |"
                             for i, r in qc.iterrows()) + "\n" + qc_takeaway)
    mismatches = consistency[~agree]
    mismatch_text = ("none" if mismatches.empty else "; ".join(
        f"seq {r.sequence} GT cell {r.gt_track} -> our T{r.pred_track}: "
        f"{r.label_on_gt_trajectory} vs {r.label_on_our_trajectory}"
        for r in mismatches.itertuples()))
    shared = consistency.groupby(["sequence", "pred_track"])["gt_track"].nunique()
    shared = shared[shared > 1]
    if not shared.empty:
        mismatch_text += (". Our track(s) " + ", ".join(f"seq {s} T{t}" for s, t in shared.index)
                          + " follow more than one real cell (an identity switch), which merges two "
                            "trajectories and can change the label")

    phase4 = f"""# Phase 4 — Phenotype Classification: Report

## Method
Rule-based, not learned: there is no labelled data for the five target
classes, so each class is a transparent threshold rule over Phase 2-3
measurements. Rules version {RULES_VERSION}.

| Rule | Definition |
|---|---|
{rules}

Confidence is a **rule margin**: how far the deciding feature is from its
threshold, mapped to 0.5 (on the line) .. 0.99. It is not a probability.
Thresholds are set in cell-size units (e.g. "moved one own diameter"), not
fitted to these data.

## Time-lapse cells (U373, {n_cells} tracks of >= 5 frames)

| Label | Cells |
|---|---|
""" + "\n".join(f"| {k} | {v} |" for k, v in counts.items()) + f"""

| Cell | Label | Rule | Confidence |
|---|---|---|---|
{track_rows}
{pro_note}
## Consistency check against ground-truth trajectories
Applying the same motility rule to the hand-annotated CTC trajectories gives
the same label as our tracked trajectories for **{int(agree.sum())}/{len(agree)}**
matched cells (mismatches: {mismatch_text}).
So tracking errors changed the motility label for {len(agree) - int(agree.sum())} of {len(agree)}
cells (causes listed above). This check does **not** show the
labels are biologically right; that needs expert-labelled cells.

## Single-frame nuclei (BBBC039, {len(static)} nuclei)
Only morphology-based classes can be assessed from one frame.

| Label | Nuclei |
|---|---|
""" + "\n".join(f"| {k} | {v} |" for k, v in static_counts.items()) + qc_md + """

## Limitations
- No biological ground truth; the rules are unvalidated against expert labels.
- "quiescent" is operational (not migrating, not seen dividing). Cell-cycle
  quiescence is not observable in phase contrast.
- "proliferating" depends on division detection, whose recall is unmeasured
  (Phase 2 sequences contain no real divisions).
- Abnormal-morphology flags are population outliers; with ~10 cells per U373
  sequence the population is small.
- Per-cell labels: reports/phase4_u373_labels.csv, reports/phase4_bbbc039_labels.csv.
"""
    (REPORTS / "phase4_classification_report.md").write_text(phase4, encoding="utf-8")

    def card_md(name, c):
        metric = c["evaluation_metric"]
        metric = json.dumps(metric, indent=None) if not isinstance(metric, str) else metric
        lim = "\n".join(f"  - {l}" for l in c["limitations"])
        return (f"### {name}\n- **Model:** {c['model']}\n- **Version:** {c['version']}\n"
                f"- **Confidence:** {c['confidence']}\n- **Dataset:** {c['dataset']}\n"
                f"- **Evaluation metric:** `{metric}`\n- **Limitations:**\n{lim}\n")

    def stmt_md(s):
        conf = f" (confidence {s['confidence']})" if s.get("confidence") is not None else ""
        cites = "".join(f" [{c['citation']} PMID {c['pmid']}]" for c in s.get("citations", []))
        return f"- **[{s['level']}]** {s['statement']}{conf}{cites}"

    chain = "\n".join(stmt_md(s) for s in
                      flagship["observations"] + flagship["phenotype"] + flagship["literature"]
                      + flagship["hypothesis"])
    caveat = "\n".join(stmt_md(s) for s in caveats_for("U373", kb))
    phase56 = f"""# Phases 5-6 — Biological Linking and AI Confidence: Flagship Case Study

**U373 glioblastoma cell migration -> CXCL12/CXCR4 axis (CAF-derived CXCL12)**

Research and educational system. Not a clinical diagnostic.

## Why this case study
The sprint plan names CAF/CXCL12 as the flagship. We have no CAF or A549
imaging data, so the chain is built on the public CTC U373 migration movies
from Phase 2. The literature on CXCL12/CXCR4 in glioma migration makes this
a direct fit, and the link to CAFs is kept at its real strength: it comes
from breast carcinoma, not glioma.

## Evidence levels
Every statement carries exactly one level, and they are never merged:

| Level | Meaning |
|---|---|
""" + "\n".join(f"| `{k}` | {v} |" for k, v in LEVEL_TEXT.items()) + f"""

## Flagship cell: {flagship['cell_id']}
![flagship](../results/phase5_flagship_cell.png)

{chain}

## Dataset caveat
{caveat}

## Phase 6 — model cards
Every AI-derived value in the atlas points to one of these cards. Metrics are
read from the Phase 1-2 benchmark outputs.

""" + "\n".join(card_md(k, c) for k, c in cards.items()) + """
## Outputs
- `reports/phase5_cell_atlas_u373.json`: every tracked cell with observations,
  phenotype labels, literature links and hypotheses, each tagged with its
  evidence level and source model card.
- `results/phase5_flagship_cell.png`: the flagship chain as one figure.
- `knowledge/literature.json`: the curated, PubMed-verified knowledge base.

## Limitations
- The literature describes glioma cells and CAFs in general. Nothing in these
  movies measures CXCL12, CXCR4 or fibroblasts, so no link is evidence about
  a specific imaged cell; per-cell statements are hypotheses.
- Only the migrating phenotype has curated links in this release.
- The A549 -> migration -> EGFR example from the brief is not covered; it
  needs A549 time-lapse data and its own curated entries.
"""
    (REPORTS / "phase5_6_case_study_report.md").write_text(phase56, encoding="utf-8")


if __name__ == "__main__":
    main()
