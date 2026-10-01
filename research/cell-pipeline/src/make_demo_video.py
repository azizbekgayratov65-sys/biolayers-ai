"""
Builds the ~90-second demo video from real pipeline outputs.

Needs `python src/demo.py --sequence 02` and
`python src/demo.py --image <BBBC039 image> --out demo_output/bbbc039_sample`
to have been run. Writes results/biolayers_demo_90s.mp4 (1280x720).
All numbers on screen are read from the output files and metric CSVs.
"""
import json
import textwrap
from pathlib import Path

import cv2
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
from skimage.io import imread

from video import to_h264

REPO = Path(__file__).resolve().parent.parent
TL = REPO / "demo_output" / "u373_seq02"
IMG = REPO / "demo_output" / "bbbc039_sample"
FRAMES = REPO / "data" / "CTC" / "PhC-C2DH-U373" / "02"
OUT = REPO / "results" / "biolayers_demo_90s.mp4"
W, H, FPS = 1280, 720, 12
UM_PER_PX, MIN_PER_FRAME = 0.65, 15

BG, INK, MUTED, LINE = (15, 20, 25), (232, 236, 240), (150, 160, 172), (48, 56, 66)
GREEN, BLUE, ORANGE, RED, GREY = (102, 187, 106), (100, 170, 245), (255, 152, 60), (239, 83, 80), (170, 170, 170)
LEVEL = {"observed_directly_in_image": ("OBSERVED IN IMAGE", GREEN), "supported_by_literature": ("SUPPORTED BY LITERATURE", BLUE),
         "inferred_by_model": ("INFERRED BY MODEL", ORANGE)}
LABEL_RGB = {"migrating": ORANGE, "quiescent": BLUE, "indeterminate": GREY, "apoptotic/dead": RED}
STEPS = ["Segment", "Track", "Measure", "Classify", "Link"]
DISCLAIMER = "Research and educational system. Not a clinical diagnostic."


def font(size, bold=False):
    return ImageFont.truetype(f"C:/Windows/Fonts/segoeui{'b' if bold else ''}.ttf", size)


F = {k: font(*v) for k, v in dict(h1=(44, True), h2=(27, True), body=(20,), bodyb=(20, True), small=(16,),
                                  smallb=(16, True), tiny=(13,), tinyb=(13, True), num=(34, True)).items()}


def canvas(active=None):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((40, 22), "BioLayers AI", font=F["h2"], fill=INK)
    x = W - 40
    for i in range(len(STEPS) - 1, -1, -1):
        on = active is not None and i in active
        text = f"{i + 1} {STEPS[i]}"
        tw = d.textlength(text, font=F["smallb" if on else "small"])
        x -= tw
        d.text((x, 30), text, font=F["smallb" if on else "small"], fill=INK if on else (90, 100, 112))
        x -= 26
    d.line([(40, 70), (W - 40, 70)], fill=LINE, width=1)
    d.text((40, H - 32), DISCLAIMER, font=F["tiny"], fill=MUTED)
    return im, d


def wrap(d, xy, text, fnt, fill, width_px, gap=6):
    x, y = xy
    per = max(10, int(width_px / (fnt.size * 0.5)))
    for line in textwrap.wrap(text, per):
        d.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + gap
    return y


def tag(d, xy, level):
    text, color = LEVEL[level]
    x, y = xy
    w = d.textlength(text, font=F["tinyb"]) + 16
    d.rounded_rectangle([x, y, x + w, y + 22], 5, outline=color, width=1)
    d.text((x + 8, y + 3), text, font=F["tinyb"], fill=color)
    return y + 32


def gray8(img):
    img = img.astype(np.float32)
    lo, hi = np.percentile(img, (0.5, 99.8))
    return np.clip((img - lo) / max(hi - lo, 1e-6) * 255, 0, 255).astype(np.uint8)


def fit(arr_rgb, box_w, box_h):
    h, w = arr_rgb.shape[:2]
    s = min(box_w / w, box_h / h)
    return cv2.resize(arr_rgb, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_LINEAR), s


def hold(im, seconds):
    return [im] * int(seconds * FPS)


def scene_title():
    im, d = canvas()
    d.text((40, 210), "From a microscopy image", font=F["h1"], fill=INK)
    d.text((40, 268), "to linked biology", font=F["h1"], fill=INK)
    y = wrap(d, (40, 350), "Find the cells, follow them, measure them, label the phenotype, and connect it to "
                           "published literature, without presenting a model's guess as an experimental fact.",
             F["body"], MUTED, 760)
    y += 22
    for level in LEVEL:
        y = tag(d, (40, y), level)
    return hold(im, 6)


def scene_segmentation(p1):
    img = cv2.imread(str(IMG / "image.png"), cv2.IMREAD_GRAYSCALE)
    mask = cv2.imread(str(IMG / "mask.png"), cv2.IMREAD_UNCHANGED)
    n = int(mask.max())
    rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    rng = np.random.default_rng(3)
    lut = np.vstack([[0, 0, 0], rng.integers(70, 255, (n, 3))]).astype(np.uint8)
    colour = lut[mask]
    edges = cv2.morphologyEx((mask > 0).astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0
    out = []
    total = int(11 * FPS)
    for i in range(total):
        a = float(np.clip((i - 2 * FPS) / (2 * FPS), 0, 1))
        view = rgb.copy()
        if a > 0:
            blend = (rgb * (1 - 0.45 * a) + colour * 0.45 * a).astype(np.uint8)
            view = np.where((mask > 0)[..., None], blend, rgb)
            view[edges] = (view[edges] * (1 - a) + 255 * a).astype(np.uint8)
        im, d = canvas({0})
        v, _ = fit(view, 760, 570)
        im.paste(Image.fromarray(v), (40, 92))
        x, y = 840, 96
        d.text((x, y), "Step 1  Segmentation", font=F["h2"], fill=INK)
        y = wrap(d, (x, y + 46), "Cellpose, pretrained, used zero-shot. No model was trained.", F["small"], MUTED, 400)
        if a > 0:
            y += 14
            d.text((x, y), f"{n}", font=F["num"], fill=INK)
            d.text((x + d.textlength(f"{n}", font=F["num"]) + 12, y + 14), "nuclei found in this image",
                   font=F["small"], fill=MUTED)
            y = tag(d, (x, y + 56), "observed_directly_in_image")
        if a >= 1:
            y += 8
            d.text((x, y), f"Benchmark: {len(p1)} hand-annotated images", font=F["smallb"], fill=INK)
            y += 32
            for name, val in (("Pixel IoU", p1.pixel_iou.mean()), ("Pixel Dice", p1.pixel_dice.mean()),
                              ("Precision", p1.precision.mean()), ("Recall", p1.recall.mean())):
                d.text((x, y), name, font=F["body"], fill=MUTED)
                d.text((x + 170, y), f"{val:.3f}", font=F["bodyb"], fill=INK)
                y += 32
            d.text((x, y + 6), "Dataset: BBBC039, U2OS nuclei", font=F["tiny"], fill=MUTED)
        out.append(im)
    return out


def scene_tracking(atlas, p2):
    paths = sorted(FRAMES.glob("t*.tif"))
    frames = [gray8(imread(str(p))) for p in paths]
    masks = [cv2.imread(str(p), cv2.IMREAD_UNCHANGED) for p in sorted((TL / "masks").glob("t*.png"))]
    tracks = pd.read_csv(TL / "tracks.csv").sort_values("frame")
    primary = {}
    for c in atlas["cells"]:
        names = [p["statement"].split("(rule")[0].replace("Phenotype:", "").strip().rstrip(".") for p in c["phenotype"]]
        primary[c["track_id"]] = ("apoptotic/dead" if "apoptotic/dead" in names else
                                  next(n for n in names if n in ("migrating", "quiescent", "indeterminate")))
    flag = next(c for c in atlas["cells"] if c["cell_id"] == atlas["flagship_cell"])
    ftid = flag["track_id"]
    fpos = tracks[tracks.track_id == ftid].set_index("frame")[["centroid_col", "centroid_row"]]
    seq = p2[p2.sequence == "02"].iloc[0]
    reveal = int(len(frames) * 0.62)
    out = []
    for t, (img, lab) in enumerate(zip(frames, masks)):
        classified = t >= reveal
        view = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        view, s = fit(view, 760, 570)
        ids = [int(i) for i in np.unique(lab) if i]
        for tid in ids:
            color = LABEL_RGB.get(primary.get(tid), GREY) if classified else (235, 235, 235)
            cnts, _ = cv2.findContours((lab == tid).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            cv2.drawContours(view, [(c * s).astype(np.int32) for c in cnts], -1, color, 2, cv2.LINE_AA)
            trail = tracks[(tracks.track_id == tid) & (tracks.frame <= t)][["centroid_col", "centroid_row"]].to_numpy()
            if len(trail) > 1:
                cv2.polylines(view, [(trail * s).astype(np.int32)], False, color, 2 if tid == ftid else 1, cv2.LINE_AA)
        im, d = canvas({3} if classified else {1, 2})
        im.paste(Image.fromarray(view), (40, 92))
        for tid in ids:
            row = tracks[(tracks.track_id == tid) & (tracks.frame == t)]
            if len(row) and (classified or tid == ftid):
                cx, cy = row.centroid_col.iloc[0] * s + 40, row.centroid_row.iloc[0] * s + 92
                text = f"T{tid} {primary.get(tid, '')}" if classified else f"T{tid}"
                tw = d.textlength(text, font=F["tinyb"])
                cx = float(np.clip(cx + 12, 44, 40 + view.shape[1] - tw - 8))
                cy = float(np.clip(cy - 26, 96, 92 + view.shape[0] - 22))
                d.rectangle([cx - 4, cy - 2, cx + tw + 4, cy + 18], fill=(0, 0, 0))
                d.text((cx, cy), text, font=F["tinyb"],
                       fill=LABEL_RGB.get(primary.get(tid), GREY) if classified else INK)
        x, y = 840, 96
        if not classified:
            d.text((x, y), "Steps 2-3  Track and measure", font=F["h2"], fill=INK)
            y = wrap(d, (x, y + 46), "Each cell is followed frame to frame and its path is measured.",
                     F["small"], MUTED, 400) + 12
        else:
            d.text((x, y), "Step 4  Phenotype labels", font=F["h2"], fill=INK)
            y = wrap(d, (x, y + 46), "Transparent rules, not a trained model. Example: migrating = moved at "
                                     "least one own cell diameter.", F["small"], MUTED, 400) + 12
        d.text((x, y), f"t = {t * MIN_PER_FRAME / 60:.1f} h", font=F["num"], fill=INK)
        d.text((x + 190, y + 14), f"{len(ids)} cells tracked", font=F["small"], fill=MUTED)
        y += 60
        if t in fpos.index and len(fpos.loc[:t]) > 1:
            pts = fpos.loc[:t].to_numpy() * UM_PER_PX
            net = float(np.linalg.norm(pts[-1] - pts[0]))
            d.text((x, y), f"Cell T{ftid}", font=F["bodyb"], fill=ORANGE if classified else INK)
            d.text((x, y + 30), f"net displacement {net:5.0f} um", font=F["body"], fill=INK)
            y = tag(d, (x, y + 64), "observed_directly_in_image")
        if classified:
            y += 4
            for name in ("migrating", "quiescent", "indeterminate"):
                k = sum(1 for v in primary.values() if v == name)
                d.ellipse([x, y + 5, x + 14, y + 19], fill=LABEL_RGB[name])
                d.text((x + 24, y), f"{name}: {k}", font=F["body"], fill=INK)
                y += 30
            y = tag(d, (x, y + 6), "inferred_by_model")
            y = wrap(d, (x, y), "Not validated against expert labels.", F["tiny"], MUTED, 400)
        else:
            y += 6
            d.text((x, y), "Benchmark vs ground-truth tracks", font=F["smallb"], fill=INK)
            y += 30
            for name, val in (("Link accuracy", f"{seq.link_accuracy:.3f}"),
                              ("Identity switches", f"{int(seq.identity_switches)}"),
                              ("Detection recall", f"{seq.detection_recall:.3f}")):
                d.text((x, y), name, font=F["body"], fill=MUTED)
                d.text((x + 190, y), val, font=F["bodyb"], fill=INK)
                y += 30
            d.text((x, y + 6), "Dataset: Cell Tracking Challenge PhC-C2DH-U373", font=F["tiny"], fill=MUTED)
        out += [im] * 3
    return out + hold(out[-1], 2)


def scene_chain(atlas):
    flag = next(c for c in atlas["cells"] if c["cell_id"] == atlas["flagship_cell"])
    fig = cv2.cvtColor(cv2.imread(str(TL / "overlay_last_frame.png")), cv2.COLOR_BGR2RGB)[28:-28]
    fig, _ = fit(fig, 470, 360)
    v = flag["observations"][1]["values"]
    lit = {l["link_id"]: l for l in flag["literature"]}

    def cite(l):
        c = l["citations"][0]
        return f"{c['citation'].split()[0]} et al., PMID {c['pmid']}"

    steps = [
        ("Image -> Cell", "observed_directly_in_image", f"Segmented in every frame. Mean cell probability "
                                               f"{flag['observations'][2]['confidence']}."),
        ("Cell -> Measured phenotype", "observed_directly_in_image",
         f"Net displacement {v['net_displacement_um']:.0f} um over 28.5 h, directionality {v['directionality']}."),
        ("Phenotype label", "inferred_by_model", "Migrating: moved more than one own cell diameter."),
        ("Biological entity: CXCL12 / CXCR4", "supported_by_literature",
         f"Glioma cells express CXCR4; CXCL12 drives their chemotaxis and invasion. ({cite(lit['L1'])}; {cite(lit['L2'])})"),
        ("Biological entity: CAFs", "supported_by_literature",
         f"Cancer-associated fibroblasts secrete CXCL12, acting through CXCR4. Shown in breast carcinoma. ({cite(lit['L4'])})"),
        ("Hypothesis", "inferred_by_model",
         "This cell's migration may involve CXCL12/CXCR4. Not tested: the images contain no CXCL12, CXCR4 or fibroblast signal."),
    ]
    out = []
    for k in range(1, len(steps) + 1):
        im, d = canvas({4})
        d.text((40, 92), "Step 5  Link to biology", font=F["h2"], fill=INK)
        d.text((40, 132), f"Flagship cell {flag['cell_id']}", font=F["small"], fill=MUTED)
        im.paste(Image.fromarray(fig), (40, 170))
        wrap(d, (40, 170 + fig.shape[0] + 14), "Three evidence levels, never shown as equivalent.", F["small"], MUTED, 460)
        y = 92
        for title, level, text in steps[:k]:
            color = LEVEL[level][1]
            lines = textwrap.wrap(text, 74)
            h = 34 + 21 * len(lines)
            d.rectangle([548, y, 1240, y + h], fill=(22, 28, 35))
            d.rectangle([548, y, 552, y + h], fill=color)
            d.text((564, y + 6), title, font=F["smallb"], fill=INK)
            lw = d.textlength(LEVEL[level][0], font=F["tinyb"])
            d.text((1230 - lw, y + 9), LEVEL[level][0], font=F["tinyb"], fill=color)
            for i, line in enumerate(lines):
                d.text((564, y + 30 + 21 * i), line, font=F["small"], fill=MUTED)
            y += h + 8
        out += hold(im, 3.4 if k < len(steps) else 6)
    return out


def scene_confidence(atlas):
    card = atlas["model_cards"]["segmentation"]
    im, d = canvas()
    d.text((40, 92), "Every AI result shows where it came from", font=F["h2"], fill=INK)
    y = 150
    metric = card["evaluation_metric"]
    rows = [("Model", card["model"]), ("Version", card["version"]), ("Confidence", card["confidence"]),
            ("Dataset", card["dataset"]),
            ("Evaluation metric", f"BBBC039 pixel IoU {metric['BBBC039 pixel IoU']}, precision "
                                  f"{metric['BBBC039 object precision @IoU0.5']}, recall "
                                  f"{metric['BBBC039 object recall @IoU0.5']}"),
            ("Limitations", card["limitations"][0])]
    for k, v in rows:
        d.text((40, y), k, font=F["bodyb"], fill=INK)
        y = wrap(d, (270, y), v, F["body"], MUTED, 940) + 12
    d.text((40, y + 8), "The same card exists for tracking, phenotype rules and literature links.", font=F["small"], fill=MUTED)
    return hold(im, 8)


def scene_limits():
    im, d = canvas()
    d.text((40, 92), "What this release does not show", font=F["h2"], fill=INK)
    y = 150
    for text in ("Public benchmark data only. U373 cells stand in for the flagship; no CAF or A549 images were available.",
                 "Phenotype labels are rules without expert validation. Division detection is unvalidated.",
                 "The literature link is a hypothesis for any individual cell, not a measurement.",
                 "Confidence values are model scores and rule margins, not calibrated probabilities."):
        d.ellipse([44, y + 10, 52, y + 18], fill=ORANGE)
        y = wrap(d, (68, y), text, F["body"], INK, 1120) + 14
    d.text((40, y + 26), "BioLayers AI  ·  AI layer release 1.0.0", font=F["bodyb"], fill=INK)
    d.text((40, y + 58), "Validation report, code and per-cell outputs are in the repository.", font=F["small"], fill=MUTED)
    return hold(im, 9)


def main():
    atlas = json.loads((TL / "cells.json").read_text(encoding="utf-8"))
    p1 = pd.read_csv(REPO / "reports" / "phase1_per_image_metrics.csv")
    p2 = pd.read_csv(REPO / "reports" / "phase2_tracking_metrics.csv", dtype={"sequence": str})
    scenes = (scene_title() + scene_segmentation(p1) + scene_tracking(atlas, p2) + scene_chain(atlas)
              + scene_confidence(atlas) + scene_limits())
    writer = cv2.VideoWriter(str(OUT), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (W, H))
    if not writer.isOpened():
        raise RuntimeError("could not open video writer")
    for im in scenes:
        writer.write(cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR))
    writer.release()
    to_h264(OUT)
    scenes[6 * FPS + 10 * FPS].save(REPO / "demo_output" / "video_check_segmentation.png")
    print(f"wrote {OUT} ({len(scenes) / FPS:.0f} s, {len(scenes)} frames)")


if __name__ == "__main__":
    main()
