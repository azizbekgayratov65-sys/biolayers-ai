# Release stability check

`python src/stability_check.py`: the demo run on cached masks, then 2 times per sequence with fresh GPU segmentation.

| Seq | Run | Status | Seconds | Cells | vs cached run | Flagship cell |
|---|---|---|---|---|---|---|
| 01 | cached | ok | 26 | 9 | reference | U373-01-T6 |
| 01 | fresh 1 | ok | 114 | 9 | identical | U373-01-T6 |
| 01 | fresh 2 | ok | 118 | 9 | identical | U373-01-T6 |
| 02 | cached | ok | 27 | 13 | reference | U373-02-T7 |
| 02 | fresh 1 | ok | 110 | 13 | identical | U373-02-T7 |
| 02 | fresh 2 | ok | 112 | 13 | identical | U373-02-T7 |
