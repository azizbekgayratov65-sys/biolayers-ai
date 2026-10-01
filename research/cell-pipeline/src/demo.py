"""
BioLayers AI demo — one command: microscopy in, annotated cells and linked biology out.

    python src/demo.py                         flagship: U373 time-lapse, sequence 02
    python src/demo.py --sequence 01
    python src/demo.py --fresh                 segment live on the GPU instead of using cached masks
    python src/demo.py --frames DIR --um-per-px 0.65 --min-per-frame 15 --cell-type glioma
    python src/demo.py --image data/BBBC039/images/<file>.tif

Writes to demo_output/<name>/ (or --out):
  time-lapse : overlays/tNNN.png (transparent RGBA), overlay.mp4, overlay_last_frame.png,
               masks/tNNN.png (16-bit track IDs),
               tracks.csv, cells.json, flagship.png
  image      : image.png, overlay_transparent.png (RGBA), overlay.png, mask.png (16-bit cell IDs),
               cells.csv, cells.json

Research and educational system. Not a clinical diagnostic.
"""
import argparse
import json
import os
import sys
import time
import warnings
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
os.chdir(REPO)
warnings.filterwarnings("ignore")

import cv2
import numpy as np
import pandas as pd
from skimage.io import imread

from track_phase2 import ROOT, UM_PER_PX, MIN_PER_FRAME, segment_sequence
from tracking import track, clean_tracks, centroids, migration_features
from phenotype import extract_phenotype_features
from classify import RULES_VERSION, RULES, classify_tracks, classify_static_nuclei
from provenance import (OBSERVED, INFERRED, LEVEL_TEXT, REPORTS, load_kb, model_cards,
                        statement, caveats_for)
from run_case_study import (cell_confidence, per_track_quality, track_morphology,
                            build_cell_record, draw_flagship)
from video import to_h264

DISCLAIMER = "Research and educational system. Not a clinical diagnostic."
MOTILITY = ("migrating", "quiescent", "indeterminate")
COLORS = {  # BGR
    "migrating": (0, 165, 255), "quiescent": (255, 170, 60), "indeterminate": (190, 190, 190),
    "apoptotic/dead": (60, 60, 255), "abnormal morphology": (0, 165, 255), "normal": (120, 220, 120),
    "edge": (110, 110, 110),
}
HEX = {k: "#%02x%02x%02x" % (r, g, b) for k, (b, g, r) in COLORS.items()}
_t0 = time.time()


def step(n, total, text):
    print(f"\n[{n}/{total}] {text}  (t+{time.time() - _t0:.0f}s)", flush=True)


def to_gray8(img):
    if img.ndim == 3:
        img = img[..., :3].mean(axis=2)
    img = img.astype(np.float32)
    lo, hi = np.percentile(img, (0.5, 99.8))
    return np.clip((img - lo) / max(hi - lo, 1e-6) * 255, 0, 255).astype(np.uint8)


def load_gray(path):
    img = imread(str(path))
    return img[..., :3].mean(axis=2).astype(np.float32) if img.ndim == 3 else img


def segment_live(model, frames):
    """Cellpose on every frame: masks plus mean cell probability per (frame, label)."""
    masks, rows = [], []
    for t, img in enumerate(frames):
        m, flows, _ = model.eval(img, diameter=None, channels=[0, 0])
        m = m.astype(np.int32)
        prob = 1 / (1 + np.exp(-flows[2]))
        rows += [dict(frame=t, label=int(l), cell_prob=float(prob[m == l].mean())) for l in np.unique(m)[1:]]
        masks.append(m)
        if (t + 1) % 25 == 0 or t + 1 == len(frames):
            print(f"      segmented {t + 1}/{len(frames)} frames", flush=True)
    return masks, pd.DataFrame(rows, columns=["frame", "label", "cell_prob"])


def to_json(obj):
    """JSON text with NaN written as null (NaN is not valid JSON)."""
    def clean(o):
        if isinstance(o, dict):
            return {k: clean(v) for k, v in o.items()}
        if isinstance(o, (list, tuple)):
            return [clean(v) for v in o]
        if isinstance(o, (float, np.floating)):
            return None if np.isnan(o) else float(o)
        if isinstance(o, np.integer):
            return int(o)
        return o
    return json.dumps(clean(obj), indent=2)


def classifier_eval():
    path = REPORTS / "phase4_u373_gt_consistency.csv"
    if not path.exists():
        return None
    c = pd.read_csv(path)
    agree = int((c["label_on_gt_trajectory"] == c["label_on_our_trajectory"]).sum())
    return {"motility label agreement, rule applied to ground-truth vs our trajectories (U373)":
            f"{agree}/{len(c)} tracks",
            "note": "checks that tracking errors do not change the label; it does not validate the biology"}


def primary_label(labels):
    names = [l["label"] for l in labels]
    if "apoptotic/dead" in names:
        return "apoptotic/dead"
    return next(n for n in names if n in MOTILITY)


def transparent_overlay(label_img, colour_of, fill_alpha=70):
    """BGRA overlay at image resolution (opaque outline, translucent fill, transparent background)
    plus each cell's bounding box as [x0, y0, x1, y1]."""
    rgba = np.zeros((*label_img.shape, 4), np.uint8)
    boxes = {}
    for cid in (int(i) for i in np.unique(label_img) if i != 0):
        b, g, r = colour_of(cid)
        m = (label_img == cid).astype(np.uint8)
        rgba[m > 0] = (b, g, r, fill_alpha)
        cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(rgba, cnts, -1, (b, g, r, 255), 2)
        x, y, w, h = cv2.boundingRect(m)
        boxes[cid] = [int(x), int(y), int(x + w), int(y + h)]
    return rgba, boxes


def enrich_records(records, feats, morph, labels, primary, seg_conf, link_iou, boxes, um, mpf):
    """Adds machine-readable fields for the UI: colour, labels, metrics and per-frame coordinates."""
    feats = feats.set_index("track_id")
    for r in records:
        tid = r["track_id"]
        f = feats.loc[tid]
        g = morph[morph["cell_id"] == tid].sort_values("frame")
        r["color"] = HEX[primary[tid]]
        r["labels"] = [dict(label=l["label"], rule=l["rule"], confidence=l["confidence"], level=INFERRED)
                       for l in labels[tid]]
        r["metrics"] = dict(
            level=OBSERVED,
            n_frames=int(f.n_frames), duration_h=round((f.n_frames - 1) * mpf / 60, 2),
            net_displacement_um=round(f.net_displacement_um, 1), path_length_um=round(f.path_length_um, 1),
            mean_speed_um_per_min=round(f.mean_speed_um_per_min, 3), directionality=round(f.directionality, 2),
            median_area_px=round(float(g["area"].median()), 0),
            median_area_um2=round(float(g["area"].median()) * um * um, 1),
            median_circularity=round(float(g["circularity"].median()), 3),
            median_aspect_ratio=round(float(g["aspect_ratio"].median()), 2),
            median_solidity=round(float(g["solidity"].median()), 3),
            segmentation_confidence=seg_conf.get(tid), tracking_confidence=link_iou.get(tid))
        r["track"] = [dict(frame=int(row.frame), time_min=float(row.frame * mpf),
                           x_px=round(row.centroid_col, 1), y_px=round(row.centroid_row, 1),
                           x_um=round(row.centroid_col * um, 1), y_um=round(row.centroid_row * um, 1),
                           area_px=int(row.area), bbox=boxes.get((int(row.frame), tid)))
                      for row in g.itertuples()]


def write_overlay_video(frames, tracked, cents, primary, out_path, min_per_frame, fps=8, scale=1.5):
    h, w = frames[0].shape[:2]
    size = (int(w * scale), int(h * scale) + 56)
    writer = cv2.VideoWriter(str(out_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, size)
    if not writer.isOpened():
        raise RuntimeError(f"could not open video writer for {out_path}")
    cents = cents.sort_values("frame")
    font = cv2.FONT_HERSHEY_SIMPLEX
    canvas = None
    for t, (img, lab) in enumerate(zip(frames, tracked)):
        view = cv2.resize(cv2.cvtColor(to_gray8(img), cv2.COLOR_GRAY2BGR), (size[0], size[1] - 56),
                          interpolation=cv2.INTER_LINEAR)
        ids = [int(i) for i in np.unique(lab) if i != 0]
        for tid in ids:
            color = COLORS.get(primary.get(tid, "indeterminate"), COLORS["indeterminate"])
            cnts, _ = cv2.findContours((lab == tid).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            cv2.drawContours(view, [(c * scale).astype(np.int32) for c in cnts], -1, color, 2, cv2.LINE_AA)
            trail = cents[(cents["track_id"] == tid) & (cents["frame"] <= t)][["col", "row"]].to_numpy()
            if len(trail) > 1:
                cv2.polylines(view, [(trail * scale).astype(np.int32)], False, color, 1, cv2.LINE_AA)
            if len(trail):
                x, y = (trail[-1] * scale).astype(int)
                text = f"T{tid} {primary.get(tid, '')}"
                (tw, th), _ = cv2.getTextSize(text, font, 0.45, 1)
                x = int(np.clip(x + 10, 2, view.shape[1] - tw - 6))
                y = int(np.clip(y - 12, th + 4, view.shape[0] - 6))
                cv2.rectangle(view, (x - 3, y - th - 3), (x + tw + 3, y + 4), (0, 0, 0), -1)
                cv2.putText(view, text, (x, y), font, 0.45, color, 1, cv2.LINE_AA)
        canvas = np.zeros((size[1], size[0], 3), np.uint8)
        canvas[28:28 + view.shape[0]] = view
        cv2.putText(canvas, f"BioLayers AI   t = {t * min_per_frame / 60:4.1f} h   {len(ids)} cells tracked",
                    (8, 19), font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
        x = 8
        for name in ("migrating", "quiescent", "indeterminate", "apoptotic/dead"):
            cv2.circle(canvas, (x + 6, size[1] - 14), 6, COLORS[name], -1, cv2.LINE_AA)
            cv2.putText(canvas, name, (x + 18, size[1] - 9), font, 0.45, (230, 230, 230), 1, cv2.LINE_AA)
            x += 40 + 9 * len(name)
        cv2.putText(canvas, "labels: inferred by rule, research use only", (size[0] - 330, size[1] - 9),
                    font, 0.42, (160, 160, 160), 1, cv2.LINE_AA)
        writer.write(canvas)
    writer.release()
    to_h264(Path(out_path))
    return canvas


def run_timelapse(args, kb, out):
    total = 5
    if args.frames:
        paths = sorted(p for p in Path(args.frames).iterdir()
                       if p.suffix.lower() in (".tif", ".tiff", ".png", ".jpg", ".jpeg"))
        if len(paths) < 2:
            sys.exit(f"Need at least 2 frames in {args.frames}, found {len(paths)}.")
        name, prefix, seq = Path(args.frames).name, Path(args.frames).name, "00"
        um, mpf, cell_type = args.um_per_px, args.min_per_frame, args.cell_type
        dataset = dict(name=f"user time-lapse: {args.frames}", cell_type=cell_type, caveats=[])
    else:
        seq = args.sequence
        paths = sorted((ROOT / seq).glob("t*.tif"))
        if not paths:
            sys.exit(f"Dataset not found at {ROOT / seq}. Download CTC PhC-C2DH-U373 (see README).")
        name, prefix, um, mpf, cell_type = f"u373_seq{seq}", "U373", UM_PER_PX, MIN_PER_FRAME, "glioma"
        dataset = dict(name=f"Cell Tracking Challenge PhC-C2DH-U373, training sequence {seq}",
                       cell_type=cell_type, caveats=caveats_for("U373", kb))
    dataset.update(pixel_size_um=um, frame_interval_min=mpf, frames=len(paths))

    print(f"BioLayers AI demo: {dataset['name']}")
    print(f"{len(paths)} frames, {mpf} min/frame, {um} um/px. {DISCLAIMER}")

    step(1, total, "Segmenting cells in every frame (Cellpose, pretrained, zero-shot)")
    from cellpose import models
    model = models.CellposeModel(gpu=True)
    cached = not args.frames and not args.fresh
    if cached:
        frames, masks = segment_sequence(model, seq)
        conf = cell_confidence(model, seq, frames, masks)
        print("      used cached masks from the Phase 2 benchmark run (pass --fresh to segment live)")
    else:
        frames = [load_gray(p) for p in paths]
        masks, conf = segment_live(model, frames)
    n_cells = [len(np.unique(m)) - 1 for m in masks]
    print(f"      {sum(n_cells)} cell masks, {np.mean(n_cells):.1f} per frame")
    if sum(n_cells) == 0:
        sys.exit("No cells were detected in any frame; nothing to track.")

    step(2, total, "Tracking cells across frames")
    tracked, lineage = clean_tracks(*track(masks))
    cents = centroids(tracked)
    feats = migration_features(cents, um, mpf)
    print(f"      {len(lineage)} tracks, {len(feats)} of at least 5 frames")
    if feats.empty:
        sys.exit("No cell was tracked for 5 or more frames; nothing to measure.")

    step(3, total, "Measuring morphology and migration (observed in image)")
    morph = track_morphology(frames, tracked)
    seg_conf, link_iou = per_track_quality(tracked, masks, conf)

    step(4, total, "Classifying phenotypes with transparent rules (inferred by model)")
    labels = classify_tracks(feats, morph, lineage, um)

    step(5, total, "Linking phenotypes to curated literature and tagging evidence levels")
    records = [build_cell_record(seq, f.track_id, f, labels[f.track_id], seg_conf.get(f.track_id, float("nan")),
                                 link_iou.get(f.track_id), kb, prefix=prefix, cell_type=cell_type,
                                 min_per_frame=mpf)
               for f in feats.itertuples()]
    linked = [r for r in records if r["literature"]]
    flagship = max(linked, key=lambda r: r["observations"][1]["values"]["net_displacement_um"]) if linked else None
    if not linked:
        print(f"      no curated literature links for cell type '{cell_type}'; none were invented")

    out.mkdir(parents=True, exist_ok=True)
    (out / "masks").mkdir(exist_ok=True)
    (out / "overlays").mkdir(exist_ok=True)
    primary = {tid: primary_label(l) for tid, l in labels.items()}
    boxes = {}
    for t, lab in enumerate(tracked):
        cv2.imwrite(str(out / "masks" / f"t{t:03d}.png"), lab.astype(np.uint16))
        rgba, frame_boxes = transparent_overlay(lab, lambda tid: COLORS[primary.get(tid, "indeterminate")])
        cv2.imwrite(str(out / "overlays" / f"t{t:03d}.png"), rgba)
        boxes.update({(t, tid): b for tid, b in frame_boxes.items()})
    enrich_records(records, feats, morph, labels, primary, seg_conf, link_iou, boxes, um, mpf)
    last = write_overlay_video(frames, tracked, cents, primary, out / "overlay.mp4", mpf)
    cv2.imwrite(str(out / "overlay_last_frame.png"), last)
    morph.rename(columns={"cell_id": "track_id"}).drop(columns=["image"]).to_csv(out / "tracks.csv", index=False)
    if flagship:
        draw_flagship(frames[-1], cents, flagship, out / "flagship.png")
    atlas = dict(title=f"BioLayers AI cell atlas: {name}", generated=str(date.today()), disclaimer=DISCLAIMER,
                 dataset=dataset, evidence_levels=LEVEL_TEXT,
                 image=dict(width=int(frames[0].shape[1]), height=int(frames[0].shape[0]),
                            coordinates="x = column, y = row, origin top-left, pixels"),
                 overlays=dict(pattern="overlays/t{frame:03d}.png", masks="masks/t{frame:03d}.png",
                               format="RGBA PNG at image resolution; opaque outline, translucent fill, "
                                      "transparent background; colour = primary phenotype label"),
                 label_colors={k: HEX[k] for k in ("migrating", "quiescent", "indeterminate", "apoptotic/dead")},
                 model_cards=model_cards(RULES_VERSION, classifier_eval()),
                 flagship_cell=flagship["cell_id"] if flagship else None, cells=records)
    (out / "cells.json").write_text(to_json(atlas), encoding="utf-8")

    wid = max(len(r["cell_id"]) for r in records) + 2
    print("\n" + "=" * 78)
    print(f"{'cell':<{wid}}{'frames':>7}{'net um':>9}{'um/min':>8}{'direct.':>9}  labels (rule margin)")
    print("-" * 78)
    for f in feats.itertuples():
        tags = ", ".join(l["label"] + (f" ({l['confidence']})" if l["confidence"] is not None else "")
                         for l in labels[f.track_id])
        print(f"{prefix + '-' + seq + '-T' + str(f.track_id):<{wid}}{f.n_frames:>7}{f.net_displacement_um:>9.1f}"
              f"{f.mean_speed_um_per_min:>8.3f}{f.directionality:>9.2f}  {tags}")
    print("=" * 78)
    print("Labels are rule-based inferences, not validated against expert annotation.")
    if any(l["label"] == "proliferating" for ls in labels.values() for l in ls):
        print("'proliferating' relies on division detection, which is unvalidated and is known to "
              "produce false divisions on this dataset (its ground truth has none).")
    if flagship:
        print(f"\nFlagship cell {flagship['cell_id']}: Image -> Cell -> Phenotype -> Biological Entity")
        for s in (flagship["observations"] + flagship["phenotype"] + flagship["literature"]
                  + flagship["hypothesis"]):
            cite = "".join(f" [PMID {c['pmid']}]" for c in s.get("citations", []))
            print(f"  [{s['level']}] {s['statement']}{cite}")
    for c in dataset["caveats"]:
        print(f"\nDataset caveat [{c['level']}]: {c['statement']} [PMID {c['citations'][0]['pmid']}]")
    print(f"\nDone in {time.time() - _t0:.0f}s. Outputs in {out.resolve()}")
    print(DISCLAIMER)


def run_image(args, kb, out):
    total = 4
    path = Path(args.image)
    if not path.exists():
        sys.exit(f"Image not found: {path}")
    img = load_gray(path)
    print(f"BioLayers AI demo: single image {path.name}  ({img.shape[1]}x{img.shape[0]} px)")
    print(DISCLAIMER)

    step(1, total, "Segmenting cells (Cellpose, pretrained, zero-shot)")
    from cellpose import models
    model = models.CellposeModel(gpu=True)
    masks, conf = segment_live(model, [img])
    mask = masks[0]
    if mask.max() == 0:
        sys.exit("No cells were detected in this image.")
    print(f"      {mask.max()} cells")

    step(2, total, "Measuring morphology, intensity and texture (observed in image)")
    feats = extract_phenotype_features(img, mask, image_name=path.name)
    feats = feats.merge(conf.rename(columns={"label": "cell_id"})[["cell_id", "cell_prob"]], on="cell_id")

    step(3, total, "Flagging phenotypes with transparent rules (inferred by model)")
    feats = classify_static_nuclei(feats, img.shape[:2])

    step(4, total, "Tagging evidence levels and writing outputs")
    out.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out / "mask.png"), mask.astype(np.uint16))
    cv2.imwrite(str(out / "image.png"), to_gray8(img))
    view = cv2.cvtColor(to_gray8(img), cv2.COLOR_GRAY2BGR)
    keys = {int(r.cell_id): ("edge" if "edge" in r.label else r.label if r.label in COLORS else "normal")
            for r in feats.itertuples()}
    rgba, boxes = transparent_overlay(mask, lambda cid: COLORS[keys[cid]])
    cv2.imwrite(str(out / "overlay_transparent.png"), rgba)
    cells = []
    for r in feats.itertuples():
        key = keys[int(r.cell_id)]
        cnts, _ = cv2.findContours((mask == r.cell_id).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(view, cnts, -1, COLORS[key], 1, cv2.LINE_AA)
        obs = [statement(OBSERVED, f"Area {r.area:.0f} px, circularity {r.circularity:.2f}, "
                                   f"solidity {r.solidity:.2f}, mean intensity {r.mean_intensity:.0f}.",
                         source="segmentation", confidence=round(r.cell_prob, 3))]
        pheno = ([statement(INFERRED, f"Phenotype: {r.label} (rule {r.rule}: {RULES[r.rule]}).",
                            source="phenotype_rules", confidence=r.confidence)] if r.rule else
                 [statement(INFERRED, f"Phenotype: {r.label}. Migration and proliferation need time-lapse.",
                            source="phenotype_rules")])
        cells.append(dict(
            cell_id=int(r.cell_id), color=HEX[key],
            x_px=round(r.centroid_col, 1), y_px=round(r.centroid_row, 1), bbox=boxes.get(int(r.cell_id)),
            contour=max(cnts, key=len)[:, 0, :].tolist() if cnts else [],
            labels=[dict(label=r.label, rule=r.rule or None, confidence=r.confidence, level=INFERRED)],
            metrics=dict(level=OBSERVED, area_px=int(r.area), perimeter_px=round(r.perimeter, 1),
                         circularity=round(r.circularity, 3), eccentricity=round(r.eccentricity, 3),
                         aspect_ratio=round(r.aspect_ratio, 2), solidity=round(r.solidity, 3),
                         mean_intensity=round(r.mean_intensity, 1),
                         segmentation_confidence=round(r.cell_prob, 3)),
            observations=obs, phenotype=pheno, literature=[]))
    cv2.imwrite(str(out / "overlay.png"), cv2.resize(view, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
                if max(img.shape) < 900 else view)
    feats.to_csv(out / "cells.csv", index=False)
    doc = dict(title=f"BioLayers AI cells: {path.name}", generated=str(date.today()), disclaimer=DISCLAIMER,
               image=dict(file=path.name, height=int(img.shape[0]), width=int(img.shape[1]),
                          coordinates="x = column, y = row, origin top-left, pixels"),
               overlays=dict(transparent="overlay_transparent.png", mask="mask.png", base="image.png",
                             format="RGBA PNG at image resolution; opaque outline, translucent fill, "
                                    "transparent background; colour = label"),
               label_colors={"no flag": HEX["normal"], "abnormal morphology": HEX["abnormal morphology"],
                             "apoptotic/dead": HEX["apoptotic/dead"], "cut by image edge": HEX["edge"]},
               evidence_levels=LEVEL_TEXT, model_cards=model_cards(RULES_VERSION, classifier_eval()),
               note="Rules R-ABN and R-PYK were designed for nuclear-stain images. No literature links are "
                    "attached to single-frame flags in this release.",
               cells=cells)
    (out / "cells.json").write_text(to_json(doc), encoding="utf-8")

    print("\n" + "=" * 60)
    print(f"cells: {len(feats)}   mean cell probability: {feats['cell_prob'].mean():.3f}")
    for c in ("area", "circularity", "eccentricity", "aspect_ratio", "solidity"):
        print(f"  {c:<14} {feats[c].mean():8.2f} +/- {feats[c].std():.2f}")
    print("labels:")
    for k, v in feats["label"].value_counts().items():
        print(f"  {v:>5}  {k}")
    print("=" * 60)
    print(f"\nDone in {time.time() - _t0:.0f}s. Outputs in {out.resolve()}")
    print(DISCLAIMER)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sequence", default="02", choices=["01", "02"], help="U373 sequence (default 02)")
    ap.add_argument("--fresh", action="store_true", help="segment live instead of using cached masks")
    ap.add_argument("--frames", help="folder of time-lapse frames (sorted by file name)")
    ap.add_argument("--um-per-px", type=float, default=UM_PER_PX)
    ap.add_argument("--min-per-frame", type=float, default=MIN_PER_FRAME)
    ap.add_argument("--cell-type", default="unknown",
                    help="cell type of --frames; literature is only linked for curated types (glioma)")
    ap.add_argument("--image", help="single image instead of a time-lapse")
    ap.add_argument("--out", help="output folder (default demo_output/<name>)")
    args = ap.parse_args()
    kb = load_kb()
    if args.image:
        run_image(args, kb, Path(args.out or f"demo_output/{Path(args.image).stem[:40]}"))
    else:
        name = Path(args.frames).name if args.frames else f"u373_seq{args.sequence}"
        run_timelapse(args, kb, Path(args.out or f"demo_output/{name}"))


if __name__ == "__main__":
    main()
