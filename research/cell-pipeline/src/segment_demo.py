"""
Phase 1 smoke test: run Cellpose on a real microscopy image and save a mask overlay.

Uses skimage's bundled 'human_mitosis' image (real fluorescence microscopy of
HL60 cells) so this runs with zero downloads, just to prove the GPU pipeline
works end to end. Real benchmark datasets (BBBC / Cell Tracking Challenge)
come next.
"""
import numpy as np
from skimage import data
from skimage.io import imsave
from cellpose import models
import matplotlib.pyplot as plt

img = data.human_mitosis()  # 2D grayscale fluorescence image, real cells

model = models.CellposeModel(gpu=True)
masks, flows, styles = model.eval(img, diameter=None, channels=[0, 0])

n_cells = masks.max()
print(f"Detected {n_cells} cells")
print(f"Image shape: {img.shape}, dtype: {img.dtype}")

fig, axes = plt.subplots(1, 2, figsize=(10, 5))
axes[0].imshow(img, cmap="gray")
axes[0].set_title("Input microscopy image")
axes[0].axis("off")

axes[1].imshow(img, cmap="gray")
axes[1].imshow(np.ma.masked_where(masks == 0, masks), cmap="jet", alpha=0.5)
axes[1].set_title(f"Cellpose segmentation ({n_cells} cells)")
axes[1].axis("off")

plt.tight_layout()
plt.savefig("results/phase1_smoke_test.png", dpi=150)
print("Saved overlay to results/phase1_smoke_test.png")
