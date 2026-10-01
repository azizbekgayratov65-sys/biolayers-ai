"""
Phase 4 — Rule-based phenotype classification.

There is no labelled training data for the five target classes, so these are
transparent threshold rules over measured features, not a learned model.
Every label carries the rule that fired and a rule-margin score: how far the
deciding feature sits from its threshold, scaled to 0.5 (on the line) .. 0.99.
The margin is NOT a calibrated probability.

Classes: proliferating, migrating, apoptotic/dead, quiescent, abnormal morphology.
"quiescent" is used operationally (not migrating, no division observed); true
cell-cycle quiescence (G0) cannot be seen in phase contrast.
"""
import numpy as np
import pandas as pd

RULES_VERSION = "0.1.0"

MIN_TRACK_FRAMES = 20        # 5 h at 15 min/frame; shorter tracks are too brief to call motility
MIGRATING_DIAMETERS = 1.0    # net displacement >= one own cell diameter
QUIESCENT_DIAMETERS = 0.5    # net displacement < half a cell diameter
MIN_DAUGHTER_FRAMES = 3      # both daughters must persist 45 min for a division to count
DEATH_WINDOW = 8             # last 2 h of a track
DEATH_AREA_RATIO = 0.6       # shrinks to <= 60% of its median area...
DEATH_CIRCULARITY = 0.85     # ...and rounds up
OUTLIER_Z = 3.5              # robust z-score for abnormal morphology
PYKNOTIC_AREA_RATIO = 0.5    # static nuclei: <= half the median nucleus area...
PYKNOTIC_INTENSITY_Q = 0.95  # ...and brighter than 95% of nuclei in the same image

RULES = {
    "R-MIG": f"net displacement >= {MIGRATING_DIAMETERS} cell diameter over >= {MIN_TRACK_FRAMES} frames",
    "R-QUI": f"net displacement < {QUIESCENT_DIAMETERS} cell diameter over >= {MIN_TRACK_FRAMES} frames, no division",
    "R-PRO": f"track is the parent of a division whose daughters both persist >= {MIN_DAUGHTER_FRAMES} frames",
    "R-DEAD": f"over the last {DEATH_WINDOW} frames, area <= {DEATH_AREA_RATIO:.0%} of the track median "
              f"and circularity >= {DEATH_CIRCULARITY}",
    "R-ABN": f"median area, circularity or solidity has |robust z| >= {OUTLIER_Z} against the population",
    "R-PYK": f"nucleus area <= {PYKNOTIC_AREA_RATIO:.0%} of dataset median and intensity above the "
             f"{PYKNOTIC_INTENSITY_Q:.0%} quantile of its image (pyknotic-like)",
}


def margin(x, threshold):
    """Relative distance from a threshold, mapped to 0.5 (on the line) .. 0.99."""
    return round(0.5 + 0.49 * min(abs(x - threshold) / threshold, 1.0), 3)


def robust_z(values):
    values = np.asarray(values, dtype=float)
    med = np.median(values)
    mad = np.median(np.abs(values - med)) * 1.4826
    return (values - med) / mad if mad > 0 else np.zeros_like(values)


def _label(name, rule, confidence, **evidence):
    return dict(label=name, rule=rule, rule_text=RULES.get(rule, rule),
                confidence=confidence, evidence=evidence)


def motility_label(n_frames, net_um, diameter_um, divided=False):
    """Migrating / quiescent / indeterminate from one track's displacement."""
    if n_frames < MIN_TRACK_FRAMES:
        return _label("indeterminate", f"track shorter than {MIN_TRACK_FRAMES} frames", None,
                      n_frames=int(n_frames))
    ratio = net_um / diameter_um
    ev = dict(net_displacement_diameters=round(float(ratio), 2))
    if ratio >= MIGRATING_DIAMETERS:
        return _label("migrating", "R-MIG", margin(ratio, MIGRATING_DIAMETERS), **ev)
    if ratio < QUIESCENT_DIAMETERS and not divided:
        return _label("quiescent", "R-QUI", margin(ratio, QUIESCENT_DIAMETERS), **ev)
    return _label("indeterminate", "net displacement between 0.5 and 1 cell diameter", None, **ev)


def classify_tracks(tracks, morph, lineage, um_per_px):
    """
    tracks:  migration_features() rows (track_id, n_frames, net_displacement_um, ...)
    morph:   per-frame morphology of tracked cells (frame, cell_id=track_id, area, circularity, solidity)
    lineage: cleaned lineage (track_id, start, end, parent)
    Returns {track_id: [label dicts]}.
    """
    per_track = morph.groupby("cell_id")[["area", "circularity", "solidity"]].median()
    z = per_track.apply(robust_z)
    kids = lineage.loc[lineage["parent"] > 0].groupby("parent")["track_id"].apply(list)
    lengths = (lineage.set_index("track_id")["end"] - lineage.set_index("track_id")["start"] + 1)

    out = {}
    for r in tracks.itertuples():
        tid = r.track_id
        m = morph[morph["cell_id"] == tid].sort_values("frame")
        diameter_um = 2 * np.sqrt(per_track.loc[tid, "area"] / np.pi) * um_per_px
        labels = []

        daughters = kids.get(tid, [])
        shortest = int(min(lengths[d] for d in daughters)) if len(daughters) >= 2 else 0
        divided = shortest >= MIN_DAUGHTER_FRAMES
        if divided:
            labels.append(_label("proliferating", "R-PRO", margin(shortest, MIN_DAUGHTER_FRAMES),
                                 daughters=[int(d) for d in daughters], shortest_daughter_frames=shortest))

        labels.append(motility_label(r.n_frames, r.net_displacement_um, diameter_um, divided))

        tail = m.tail(DEATH_WINDOW)
        if len(m) >= 2 * DEATH_WINDOW:
            area_ratio = tail["area"].mean() / m["area"].median()
            circ = tail["circularity"].mean()
            if area_ratio <= DEATH_AREA_RATIO and circ >= DEATH_CIRCULARITY:
                labels.append(_label("apoptotic/dead", "R-DEAD", margin(area_ratio, DEATH_AREA_RATIO),
                                     area_ratio=round(float(area_ratio), 2), circularity=round(float(circ), 2)))

        zs = z.loc[tid]
        worst = zs.abs().idxmax()
        if abs(zs[worst]) >= OUTLIER_Z:
            labels.append(_label("abnormal morphology", "R-ABN", margin(abs(zs[worst]), OUTLIER_Z),
                                 feature=worst, robust_z=round(float(zs[worst]), 2)))

        for lab in labels:
            lab["evidence"]["cell_diameter_um"] = round(float(diameter_um), 1)
        out[int(tid)] = labels
    return out


def touches_border(f, image_shape):
    """Approximate: the best-fit ellipse's major radius reaches the image edge."""
    r = f["major_axis_length"] / 2
    h, w = image_shape
    return ((f["centroid_row"] - r < 1) | (f["centroid_col"] - r < 1)
            | (f["centroid_row"] + r > h - 1) | (f["centroid_col"] + r > w - 1))


def classify_static_nuclei(features, image_shape):
    """
    Single-frame nuclei (BBBC039): only morphology-based classes are assessable.
    Motility and proliferation need time-lapse and are reported as not assessable;
    nuclei cut by the image edge have a truncated shape and are not classified.
    Returns features with label / rule / confidence / feature columns (one primary label per nucleus).
    """
    f = features.copy()
    edge = touches_border(f, image_shape)
    inner = f[~edge]
    z = pd.DataFrame(index=f.index)
    for c in ("area", "circularity", "solidity"):  # reference = interior nuclei, so edge-cut shapes don't skew it
        med = inner[c].median()
        mad = np.median(np.abs(inner[c] - med)) * 1.4826
        z[c] = (f[c] - med) / mad if mad > 0 else 0.0
    worst = z.abs().max(axis=1)
    median_area = inner["area"].median()
    img_q = f.groupby("image")["mean_intensity"].transform(lambda s: s.quantile(PYKNOTIC_INTENSITY_Q))
    area_ratio = f["area"] / median_area
    pyknotic = (area_ratio <= PYKNOTIC_AREA_RATIO) & (f["mean_intensity"] > img_q) & ~edge

    f["label"] = "not assessable (single frame)"
    f["rule"] = ""
    f["confidence"] = np.nan
    f["feature"] = ""
    f.loc[edge, "label"] = "not assessable (cut by image edge)"
    abn = (worst >= OUTLIER_Z) & ~edge
    f.loc[abn, "feature"] = z.abs().idxmax(axis=1)[abn]
    f.loc[abn, ["label", "rule"]] = ["abnormal morphology", "R-ABN"]
    f.loc[abn, "confidence"] = [margin(v, OUTLIER_Z) for v in worst[abn]]
    f.loc[pyknotic, ["label", "rule", "feature"]] = ["apoptotic/dead", "R-PYK", ""]
    f.loc[pyknotic, "confidence"] = [margin(v, PYKNOTIC_AREA_RATIO) for v in area_ratio[pyknotic]]
    return f
