"""
Release stability check for the demo.

Runs the demo with fresh GPU segmentation several times per sequence and
compares every run with the cached-mask run: did it finish, and did any
cell's measurements or labels change?
"""
import json
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "demo_output"
RUNS = 2


def summary(path):
    atlas = json.loads((path / "cells.json").read_text(encoding="utf-8"))
    cells = {}
    for c in atlas["cells"]:
        labels = sorted(p["statement"].split("(rule")[0].replace("Phenotype:", "").strip() for p in c["phenotype"])
        cells[c["cell_id"]] = (c["observations"][1]["values"]["net_displacement_um"], labels)
    return atlas["flagship_cell"], cells


def run(args, out):
    t = time.time()
    r = subprocess.run([sys.executable, str(REPO / "src" / "demo.py"), *args, "--out", str(out)],
                       capture_output=True, text=True)
    return r.returncode, time.time() - t, r.stderr[-400:]


def main():
    rows, failed = [], False
    for seq in ("01", "02"):
        code, secs, err = run(["--sequence", seq], OUT / f"u373_seq{seq}")
        if code:
            sys.exit(f"cached run failed for seq {seq}: {err}")
        ref_flag, ref = summary(OUT / f"u373_seq{seq}")
        rows.append(f"| {seq} | cached | ok | {secs:.0f} | {len(ref)} | reference | {ref_flag} |")
        for i in range(1, RUNS + 1):
            out = OUT / f"_stability_seq{seq}_run{i}"
            code, secs, err = run(["--sequence", seq, "--fresh"], out)
            if code:
                failed = True
                rows.append(f"| {seq} | fresh {i} | FAILED | {secs:.0f} | | {err.strip().splitlines()[-1]} | |")
                continue
            flag, cells = summary(out)
            same_ids = set(cells) == set(ref)
            label_diff = [c for c in cells if c in ref and cells[c][1] != ref[c][1]]
            max_d = max((abs(cells[c][0] - ref[c][0]) for c in cells if c in ref), default=0.0)
            verdict = ("identical" if same_ids and not label_diff and max_d == 0 else
                       f"{'same' if same_ids else 'different'} cell set, {len(label_diff)} label change(s), "
                       f"max net-displacement difference {max_d:.1f} um")
            rows.append(f"| {seq} | fresh {i} | ok | {secs:.0f} | {len(cells)} | {verdict} | {flag} |")
    table = ("| Seq | Run | Status | Seconds | Cells | vs cached run | Flagship cell |\n|---|---|---|---|---|---|---|\n"
             + "\n".join(rows))
    print(table)
    (REPO / "reports" / "release_stability_check.md").write_text(
        "# Release stability check\n\n`python src/stability_check.py`: the demo run on cached masks, then "
        f"{RUNS} times per sequence with fresh GPU segmentation.\n\n" + table + "\n", encoding="utf-8")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
