"""
Per-cell phenotype / morphology feature extraction from a segmented image.

Operates on any (intensity_image, instance_label_image) pair, independent of
which dataset or segmentation model produced the labels.
"""
import numpy as np
import pandas as pd
from skimage.measure import regionprops
from skimage.feature import graycomatrix, graycoprops


def _texture_features(intensity_crop, mask_crop):
    """GLCM texture features computed only over the masked (in-cell) pixels."""
    vals = intensity_crop[mask_crop]
    if vals.max() == vals.min() or vals.size < 4:
        return dict(glcm_contrast=0.0, glcm_homogeneity=1.0, glcm_energy=1.0, glcm_correlation=0.0)

    # Normalize to uint8 for GLCM; zero out background so it doesn't pollute co-occurrence stats
    norm = np.zeros_like(intensity_crop, dtype=np.uint8)
    scaled = (intensity_crop.astype(np.float32) - vals.min()) / (vals.max() - vals.min())
    norm[mask_crop] = np.clip(scaled[mask_crop] * 255, 0, 255).astype(np.uint8)

    glcm = graycomatrix(norm, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
                         levels=256, symmetric=True, normed=True)
    return dict(
        glcm_contrast=float(graycoprops(glcm, "contrast").mean()),
        glcm_homogeneity=float(graycoprops(glcm, "homogeneity").mean()),
        glcm_energy=float(graycoprops(glcm, "energy").mean()),
        glcm_correlation=float(np.nan_to_num(graycoprops(glcm, "correlation")).mean()),
    )


def extract_phenotype_features(intensity_image, label_image, image_name=""):
    """Returns one row per detected cell/nucleus with morphology, intensity, and texture features."""
    rows = []
    for region in regionprops(label_image, intensity_image=intensity_image):
        perimeter = region.perimeter if region.perimeter > 0 else 1e-6
        circularity = 4 * np.pi * region.area / (perimeter ** 2)
        aspect_ratio = (region.axis_major_length / region.axis_minor_length
                         if region.axis_minor_length > 0 else np.nan)

        minr, minc, maxr, maxc = region.bbox
        intensity_crop = intensity_image[minr:maxr, minc:maxc]
        mask_crop = region.image
        texture = _texture_features(intensity_crop, mask_crop)

        rows.append(dict(
            image=image_name,
            cell_id=region.label,
            area=region.area,
            perimeter=region.perimeter,
            circularity=min(circularity, 1.0),
            eccentricity=region.eccentricity,
            aspect_ratio=aspect_ratio,
            major_axis_length=region.axis_major_length,
            minor_axis_length=region.axis_minor_length,
            solidity=region.solidity,
            extent=region.extent,
            mean_intensity=region.intensity_mean,
            std_intensity=float(np.std(intensity_image[region.coords[:, 0], region.coords[:, 1]])),
            centroid_row=region.centroid[0],
            centroid_col=region.centroid[1],
            **texture,
        ))
    return pd.DataFrame(rows)
