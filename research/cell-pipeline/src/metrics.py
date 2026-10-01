"""
Instance segmentation evaluation utilities.

BBBC039 ground truth masks use a four-color graph-coloring scheme (only
touching nuclei are guaranteed different colors -- see decode_bbbc039_mask),
not globally unique per-nucleus IDs. Decoding requires connected-component
labeling within each color class.
"""
import numpy as np
from scipy import ndimage as ndi
from scipy.sparse import coo_matrix
from scipy.optimize import linear_sum_assignment


def decode_bbbc039_mask(mask_rgba, min_size=20):
    """Convert a BBBC039 4-color RGBA mask into a per-instance label image."""
    class_map = mask_rgba[..., 0].astype(np.int32)
    instance_label = np.zeros_like(class_map, dtype=np.int32)
    next_id = 1
    for class_val in np.unique(class_map):
        if class_val == 0:
            continue
        class_mask = class_map == class_val
        labeled, n = ndi.label(class_mask)
        if n == 0:
            continue
        labeled[labeled > 0] += next_id - 1
        instance_label[class_mask] = labeled[class_mask]
        next_id += n

    if min_size > 0:
        sizes = ndi.sum(np.ones_like(instance_label), instance_label,
                         index=np.arange(1, instance_label.max() + 1))
        small_ids = np.where(sizes < min_size)[0] + 1
        instance_label[np.isin(instance_label, small_ids)] = 0
        instance_label = renumber(instance_label)

    return instance_label


def renumber(label_img):
    """Relabel instance IDs to be contiguous starting at 1."""
    ids = np.unique(label_img)
    ids = ids[ids != 0]
    remap = np.zeros(label_img.max() + 1, dtype=np.int32)
    remap[ids] = np.arange(1, len(ids) + 1)
    return remap[label_img]


def label_overlap(x, y):
    """Pixel-count contingency table between two label images."""
    x = x.ravel()
    y = y.ravel()
    overlap = coo_matrix((np.ones_like(x), (x, y))).toarray()
    return overlap


def compute_iou_matrix(masks_true, masks_pred):
    overlap = label_overlap(masks_true, masks_pred)
    n_pixels_pred = overlap.sum(axis=0, keepdims=True)
    n_pixels_true = overlap.sum(axis=1, keepdims=True)
    union = n_pixels_pred + n_pixels_true - overlap
    iou = overlap / np.maximum(union, 1e-9)
    iou[0, :] = 0
    iou[:, 0] = 0
    return iou


def match_instances(masks_true, masks_pred, iou_threshold=0.5):
    """Hungarian-matched object-level precision/recall/F1 at a given IoU threshold."""
    iou = compute_iou_matrix(masks_true, masks_pred)
    n_true = masks_true.max()
    n_pred = masks_pred.max()

    if n_true == 0 and n_pred == 0:
        return dict(tp=0, fp=0, fn=0, precision=1.0, recall=1.0, f1=1.0, mean_matched_iou=1.0)
    if n_true == 0:
        return dict(tp=0, fp=int(n_pred), fn=0, precision=0.0, recall=1.0, f1=0.0, mean_matched_iou=0.0)
    if n_pred == 0:
        return dict(tp=0, fp=0, fn=int(n_true), precision=1.0, recall=0.0, f1=0.0, mean_matched_iou=0.0)

    cost = -iou[1:, 1:]
    row_ind, col_ind = linear_sum_assignment(cost)
    matched_iou = iou[1:, 1:][row_ind, col_ind]
    is_tp = matched_iou >= iou_threshold

    tp = int(is_tp.sum())
    fp = int(n_pred - tp)
    fn = int(n_true - tp)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    mean_matched_iou = float(matched_iou[is_tp].mean()) if tp > 0 else 0.0

    return dict(tp=tp, fp=fp, fn=fn, precision=precision, recall=recall,
                f1=f1, mean_matched_iou=mean_matched_iou)


def pixel_iou_dice(masks_true, masks_pred):
    """Pixel-level foreground-vs-background IoU and Dice, ignoring instance identity."""
    fg_true = masks_true > 0
    fg_pred = masks_pred > 0
    intersection = np.logical_and(fg_true, fg_pred).sum()
    union = np.logical_or(fg_true, fg_pred).sum()
    iou = intersection / union if union > 0 else 1.0
    dice = 2 * intersection / (fg_true.sum() + fg_pred.sum()) if (fg_true.sum() + fg_pred.sum()) > 0 else 1.0
    return float(iou), float(dice)
