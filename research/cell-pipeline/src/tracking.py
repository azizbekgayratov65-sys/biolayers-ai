"""
Overlap-based cell tracking, migration features, and CTC-style evaluation.

Linking: consecutive frames are matched by Hungarian assignment on mask IoU.
A new cell that sits mostly inside a previous cell whose track already
continued is treated as a division (parent track ends, two daughters start).
"""
import numpy as np
import pandas as pd
from scipy.optimize import linear_sum_assignment

from metrics import label_overlap, compute_iou_matrix


def track(label_frames, min_iou=0.2, division_overlap=0.3):
    """Returns (tracked_frames, lineage) where tracked_frames hold track IDs
    and lineage is a DataFrame of track_id, start, end, parent (CTC convention)."""
    lineage = {}
    tracked = []
    next_id = 1

    first = label_frames[0]
    local_to_track = {}
    for lab in range(1, first.max() + 1):
        local_to_track[lab] = next_id
        lineage[next_id] = dict(start=0, end=0, parent=0)
        next_id += 1
    tracked.append(_relabel(first, local_to_track))

    for t in range(1, len(label_frames)):
        prev, cur = label_frames[t - 1], label_frames[t]
        prev_map = local_to_track
        cur_map = {}
        n_prev, n_cur = prev.max(), cur.max()

        prev_to_cur = {}
        if n_prev > 0 and n_cur > 0:
            iou = compute_iou_matrix(prev, cur)[1:, 1:]
            rows, cols = linear_sum_assignment(-iou)
            for r, c in zip(rows, cols):
                if iou[r, c] >= min_iou:
                    prev_to_cur[r + 1] = c + 1

        overlap = label_overlap(prev, cur) if n_prev > 0 and n_cur > 0 else None
        matched_cur = set(prev_to_cur.values())

        for p, c in prev_to_cur.items():
            cur_map[c] = prev_map[p]

        for c in range(1, n_cur + 1):
            if c in matched_cur:
                continue
            parent_local = 0
            if overlap is not None and c < overlap.shape[1]:
                col = overlap[1:, c]
                area = overlap[:, c].sum()
                if col.size and area > 0 and col.max() / area >= division_overlap:
                    parent_local = int(col.argmax()) + 1

            if parent_local and parent_local in prev_to_cur:
                parent_track = prev_map[parent_local]
                sibling = prev_to_cur[parent_local]
                lineage[parent_track]["end"] = t - 1
                for daughter_local in (sibling, c):
                    cur_map[daughter_local] = next_id
                    lineage[next_id] = dict(start=t, end=t, parent=parent_track)
                    next_id += 1
            else:
                cur_map[c] = next_id
                lineage[next_id] = dict(start=t, end=t, parent=0)
                next_id += 1

        for tid in cur_map.values():
            lineage[tid]["end"] = t
        local_to_track = cur_map
        tracked.append(_relabel(cur, cur_map))

    lin = pd.DataFrame([dict(track_id=k, **v) for k, v in lineage.items()])
    return tracked, lin


def clean_tracks(tracked, lineage, min_len=3, max_gap=3, max_dist_px=30):
    """Undo segmentation-flicker artifacts: reject divisions where a daughter
    dies within min_len frames, drop short orphan fragments, and close gaps of
    up to max_gap frames between a track's end and a nearby new track."""
    tracked = [f.copy() for f in tracked]
    lin = lineage.set_index("track_id").to_dict("index")

    def length(t):
        return lin[t]["end"] - lin[t]["start"] + 1

    def merge(src, dst):
        for f in tracked:
            f[f == src] = dst
        lin[dst]["end"] = max(lin[dst]["end"], lin[src]["end"])
        for info in lin.values():
            if info["parent"] == src:
                info["parent"] = dst
        del lin[src]

    for parent in sorted({v["parent"] for v in lin.values() if v["parent"]}):
        kids = [t for t, v in lin.items() if v["parent"] == parent]
        if parent not in lin or len(kids) != 2:
            continue
        kids.sort(key=length, reverse=True)
        if length(kids[1]) < min_len:
            lin[kids[1]]["parent"] = 0
            lin[kids[0]]["parent"] = 0
            merge(kids[0], parent)

    has_kids = {v["parent"] for v in lin.values()}
    for t in [t for t, v in lin.items() if length(t) < min_len and v["parent"] == 0 and t not in has_kids]:
        for f in tracked:
            f[f == t] = 0
        del lin[t]

    cents = centroids(tracked).set_index(["track_id", "frame"])
    changed = True
    while changed:
        changed = False
        has_kids = {v["parent"] for v in lin.values()}
        for b in sorted(lin, key=lambda t: lin[t]["start"]):
            if lin[b]["parent"] or lin[b]["start"] == 0:
                continue
            b_xy = cents.loc[(b, lin[b]["start"]), ["row", "col"]].to_numpy()
            best, best_d = None, max_dist_px
            for a, info in lin.items():
                gap = lin[b]["start"] - info["end"]
                if a == b or a in has_kids or not 1 <= gap <= max_gap + 1:
                    continue
                d = np.linalg.norm(cents.loc[(a, info["end"]), ["row", "col"]].to_numpy() - b_xy)
                if d < best_d:
                    best, best_d = a, d
            if best is not None:
                merge(b, best)
                cents = centroids(tracked).set_index(["track_id", "frame"])
                changed = True
                break

    out = pd.DataFrame([dict(track_id=k, **v) for k, v in lin.items()])
    return tracked, out


def division_events(lineage):
    """Parents with two or more daughters (single-child links are CTC gap links, not divisions)."""
    counts = lineage.loc[lineage["parent"] > 0, "parent"].value_counts()
    return int((counts >= 2).sum())


def _relabel(labels, mapping):
    lut = np.zeros(labels.max() + 1, dtype=np.int32)
    for local, tid in mapping.items():
        lut[local] = tid
    return lut[labels]


def centroids(tracked_frames):
    """Long table: frame, track_id, row, col (pixels)."""
    rows = []
    for t, frame in enumerate(tracked_frames):
        ids = np.unique(frame)
        ids = ids[ids != 0]
        for tid in ids:
            rr, cc = np.nonzero(frame == tid)
            rows.append(dict(frame=t, track_id=int(tid), row=rr.mean(), col=cc.mean()))
    return pd.DataFrame(rows)


def migration_features(cents, um_per_px, min_per_frame, min_frames=5):
    """Per-track path length, net displacement, speed, directionality."""
    out = []
    for tid, g in cents.groupby("track_id"):
        g = g.sort_values("frame")
        if len(g) < min_frames:
            continue
        xy = g[["col", "row"]].to_numpy() * um_per_px
        steps = np.linalg.norm(np.diff(xy, axis=0), axis=1)
        path = steps.sum()
        net = np.linalg.norm(xy[-1] - xy[0])
        minutes = (g["frame"].iloc[-1] - g["frame"].iloc[0]) * min_per_frame
        out.append(dict(
            track_id=int(tid),
            n_frames=len(g),
            path_length_um=path,
            net_displacement_um=net,
            mean_speed_um_per_min=path / minutes if minutes > 0 else 0.0,
            directionality=net / path if path > 0 else 0.0,
        ))
    return pd.DataFrame(out)


def _match_markers(gt, pred):
    """CTC rule: a GT object is detected by the pred object covering >50% of it."""
    ov = label_overlap(gt, pred)
    matches = {}
    for g in range(1, ov.shape[0]):
        area = ov[g].sum()
        if area == 0 or ov.shape[1] < 2:
            continue
        p = int(ov[g, 1:].argmax()) + 1
        if ov[g, p] > 0.5 * area:
            matches[g] = p
    return matches


def evaluate_tracking(gt_frames, pred_frames):
    """Detection precision/recall, link accuracy, and identity switches against GT markers."""
    n_gt = n_pred = gt_hit = pred_hit = 0
    per_frame = []
    for gt, pr in zip(gt_frames, pred_frames):
        m = _match_markers(gt, pr)
        per_frame.append(m)
        gt_ids = set(np.unique(gt)) - {0}
        pr_ids = set(np.unique(pr)) - {0}
        n_gt += len(gt_ids)
        n_pred += len(pr_ids)
        gt_hit += sum(1 for g in m if g in gt_ids)
        pred_hit += len(set(m.values()) & pr_ids)

    links_total = links_correct = switches = 0
    for t in range(1, len(per_frame)):
        for g, p in per_frame[t].items():
            if g in per_frame[t - 1]:
                links_total += 1
                if per_frame[t - 1][g] == p:
                    links_correct += 1
                else:
                    switches += 1

    return dict(
        detection_recall=gt_hit / n_gt if n_gt else 0.0,
        detection_precision=pred_hit / n_pred if n_pred else 0.0,
        link_accuracy=links_correct / links_total if links_total else 0.0,
        identity_switches=switches,
        gt_links=links_total,
    )


def seg_score(gt, pred):
    """CTC SEG: mean Jaccard over GT objects, matched by the >50% rule (unmatched = 0)."""
    ov = label_overlap(gt, pred)
    scores = []
    for g in range(1, ov.shape[0]):
        area_g = ov[g].sum()
        if area_g == 0:
            continue
        if ov.shape[1] < 2:
            scores.append(0.0)
            continue
        p = int(ov[g, 1:].argmax()) + 1
        inter = ov[g, p]
        if inter > 0.5 * area_g:
            scores.append(inter / (area_g + ov[:, p].sum() - inter))
        else:
            scores.append(0.0)
    return scores
