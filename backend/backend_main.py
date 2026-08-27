"""
SkinSight — dermoscopic lesion classifier with Grad-CAM attribution.

FastAPI service that:
  1. resolves a HAM10000/ISIC fine-tuned checkpoint from the HF Hub at startup,
  2. accepts a JPEG/PNG upload,
  3. runs 224x224 ImageNet-normalised inference,
  4. produces a Grad-CAM overlay for the winning class,
  5. returns labels, probabilities and base64 PNGs.

Research / educational use only. Not a medical device.
"""

from __future__ import annotations

import base64
import io
import logging
import math
import os
import threading
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any, Callable

import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from torchvision import transforms

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
log = logging.getLogger("skinsight.backend")


# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

IMAGE_SIZE = 224
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", 12 * 1024 * 1024))
ACCEPTED_MIME = {"image/jpeg", "image/jpg", "image/png"}
CAM_ALPHA = float(os.getenv("CAM_ALPHA", 0.5))

# Checkpoints are tried in order. The first one that downloads and instantiates
# wins. Override with MODEL_ID to pin a specific repo.
CANDIDATE_CHECKPOINTS: list[str] = [
    c.strip()
    for c in os.getenv(
        "MODEL_ID",
        "Anwarkh1/Skin_Cancer-Image_Classification,"
        "NeuronZero/SkinCancerClassifier,"
        "VRJBro/skin-cancer-detection",
    ).split(",")
    if c.strip()
]

# Last-resort backbone if the Hub is unreachable. ImageNet features + an
# untrained 7-way head: the app still runs end to end, but the numbers are
# meaningless and every response is flagged calibrated=false.
FALLBACK_TIMM_ARCH = os.getenv("FALLBACK_TIMM_ARCH", "efficientnet_b1")

DEVICE = torch.device(
    os.getenv("DEVICE") or ("cuda" if torch.cuda.is_available() else "cpu")
)


# --------------------------------------------------------------------------- #
# Lesion taxonomy (HAM10000 / ISIC)
# --------------------------------------------------------------------------- #

@dataclass(frozen=True)
class LesionClass:
    code: str
    name: str
    risk: str          # benign | premalignant | malignant | unknown
    note: str


TAXONOMY: dict[str, LesionClass] = {
    "akiec": LesionClass(
        "akiec",
        "Actinic keratosis / intraepithelial carcinoma",
        "premalignant",
        "Sun-damage lesion that can progress; commonly referred for review.",
    ),
    "bcc": LesionClass(
        "bcc",
        "Basal cell carcinoma",
        "malignant",
        "Most common skin cancer; locally invasive, rarely metastasises.",
    ),
    "bkl": LesionClass(
        "bkl",
        "Benign keratosis-like lesion",
        "benign",
        "Includes seborrhoeic keratoses and solar lentigines.",
    ),
    "df": LesionClass(
        "df", "Dermatofibroma", "benign", "Benign fibrous skin nodule."
    ),
    "mel": LesionClass(
        "mel",
        "Melanoma",
        "malignant",
        "Highest-priority class; any signal here warrants clinical review.",
    ),
    "nv": LesionClass(
        "nv", "Melanocytic nevus", "benign", "Ordinary mole."
    ),
    "vasc": LesionClass(
        "vasc",
        "Vascular lesion",
        "benign",
        "Angiomas, haemorrhage, pyogenic granuloma.",
    ),
    "scc": LesionClass(
        "scc", "Squamous cell carcinoma", "malignant", "Keratinocyte carcinoma."
    ),
    "unk": LesionClass("unk", "Unknown / other", "unknown", "Unmapped class."),
}

# Raw label text -> canonical code. Keys are lowercased and stripped.
LABEL_ALIASES: dict[str, str] = {
    "akiec": "akiec",
    "actinic keratoses": "akiec",
    "actinic keratosis": "akiec",
    "actinic keratoses and intraepithelial carcinomae": "akiec",
    "actinic keratoses and intraepithelial carcinoma": "akiec",
    "bcc": "bcc",
    "basal cell carcinoma": "bcc",
    "bkl": "bkl",
    "benign keratosis": "bkl",
    "benign keratosis-like lesions": "bkl",
    "pigmented benign keratosis": "bkl",
    "seborrheic keratosis": "bkl",
    "df": "df",
    "dermatofibroma": "df",
    "mel": "mel",
    "melanoma": "mel",
    "nv": "nv",
    "nevus": "nv",
    "melanocytic nevi": "nv",
    "melanocytic nevus": "nv",
    "vasc": "vasc",
    "vascular lesion": "vasc",
    "vascular lesions": "vasc",
    "scc": "scc",
    "squamous cell carcinoma": "scc",
}

HAM10000_ORDER = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]


def canonicalise(raw_label: str) -> LesionClass:
    key = str(raw_label).strip().lower().replace("_", " ")
    if key in LABEL_ALIASES:
        return TAXONOMY[LABEL_ALIASES[key]]
    for alias, code in LABEL_ALIASES.items():
        if alias in key:
            return TAXONOMY[code]
    return LesionClass(key or "unk", raw_label, "unknown", "Unmapped class.")


# --------------------------------------------------------------------------- #
# Model wrappers and loading
# --------------------------------------------------------------------------- #

class HFLogitsWrapper(nn.Module):
    """transformers models return a ModelOutput; Grad-CAM needs a raw tensor."""

    def __init__(self, model: nn.Module) -> None:
        super().__init__()
        self.model = model

    def forward(self, pixel_values: torch.Tensor) -> torch.Tensor:
        return self.model(pixel_values=pixel_values).logits


@dataclass
class ModelBundle:
    module: nn.Module
    labels: list[LesionClass]
    source: str
    architecture: str
    calibrated: bool
    cam_layers: list[nn.Module] = field(default_factory=list)
    reshape: Callable[[torch.Tensor], torch.Tensor] | None = None


def _vit_reshape(tensor: torch.Tensor) -> torch.Tensor:
    """(B, tokens, dim) -> (B, dim, H, W), dropping any CLS/distill tokens."""
    if tensor.dim() == 4:  # already spatial (Swin stage output, CNN feature map)
        return tensor
    batch, tokens, dim = tensor.shape
    side = int(math.isqrt(tokens))
    if side * side != tokens:
        prefix = tokens - int(math.isqrt(tokens - 1)) ** 2
        tensor = tensor[:, prefix:, :]
        tokens = tensor.shape[1]
        side = int(math.isqrt(tokens))
    grid = tensor.reshape(batch, side, side, dim)
    return grid.permute(0, 3, 1, 2).contiguous()


def resolve_cam_target(
    module: nn.Module,
) -> tuple[list[nn.Module], Callable[[torch.Tensor], torch.Tensor] | None]:
    """Pick the deepest layer that still carries spatial structure."""
    transformer_norms: list[nn.Module] = []
    for name, sub in module.named_modules():
        if isinstance(sub, nn.LayerNorm) and (
            "layernorm_before" in name or name.endswith(".norm1")
        ):
            transformer_norms.append(sub)
    if transformer_norms:
        log.info("Grad-CAM target: final transformer block norm (+ reshape)")
        return [transformer_norms[-1]], _vit_reshape

    convs = [m for m in module.modules() if isinstance(m, nn.Conv2d)]
    if convs:
        log.info("Grad-CAM target: final convolution")
        return [convs[-1]], None

    raise RuntimeError("No usable Grad-CAM target layer found in this model.")


def _labels_from_config(config: Any) -> list[LesionClass]:
    id2label = getattr(config, "id2label", None) or {}
    if not id2label:
        return [TAXONOMY[c] for c in HAM10000_ORDER]
    ordered = sorted(id2label.items(), key=lambda kv: int(kv[0]))
    resolved = [canonicalise(v) for _, v in ordered]

    # Some checkpoints ship generic LABEL_0..LABEL_6 heads. When nothing maps and
    # the head is 7-wide, assume the standard alphabetical HAM10000 ordering that
    # ImageFolder / sorted() produce.
    if len(resolved) == len(HAM10000_ORDER) and all(
        c.risk == "unknown" for c in resolved
    ):
        log.warning(
            "Checkpoint exposes generic labels %s — assuming alphabetical "
            "HAM10000 ordering %s.",
            [v for _, v in ordered],
            HAM10000_ORDER,
        )
        return [TAXONOMY[c] for c in HAM10000_ORDER]
    return resolved


def _try_load_hf(repo_id: str) -> ModelBundle:
    from transformers import AutoConfig, AutoModelForImageClassification

    log.info("Attempting checkpoint %s", repo_id)
    config = AutoConfig.from_pretrained(repo_id)
    hf_model = AutoModelForImageClassification.from_pretrained(repo_id)
    module = HFLogitsWrapper(hf_model).to(DEVICE).eval()
    layers, reshape = resolve_cam_target(module)
    return ModelBundle(
        module=module,
        labels=_labels_from_config(config),
        source=repo_id,
        architecture=getattr(config, "model_type", "unknown"),
        calibrated=True,
        cam_layers=layers,
        reshape=reshape,
    )


def _load_fallback() -> ModelBundle:
    import timm

    log.warning(
        "No fine-tuned checkpoint could be fetched. Falling back to %s with an "
        "UNTRAINED classification head — predictions are not diagnostic.",
        FALLBACK_TIMM_ARCH,
    )
    module = timm.create_model(
        FALLBACK_TIMM_ARCH, pretrained=True, num_classes=len(HAM10000_ORDER)
    )
    module = module.to(DEVICE).eval()
    layers, reshape = resolve_cam_target(module)
    return ModelBundle(
        module=module,
        labels=[TAXONOMY[c] for c in HAM10000_ORDER],
        source=f"timm://{FALLBACK_TIMM_ARCH} (ImageNet backbone, random head)",
        architecture=FALLBACK_TIMM_ARCH,
        calibrated=False,
        cam_layers=layers,
        reshape=reshape,
    )


def load_model() -> ModelBundle:
    errors: list[str] = []
    for repo in CANDIDATE_CHECKPOINTS:
        try:
            bundle = _try_load_hf(repo)
            log.info(
                "Loaded %s (%s) on %s with %d classes",
                bundle.source,
                bundle.architecture,
                DEVICE,
                len(bundle.labels),
            )
            return bundle
        except Exception as exc:  # noqa: BLE001 — try the next candidate
            errors.append(f"{repo}: {exc}")
            log.warning("Checkpoint %s unavailable (%s)", repo, exc)
    for err in errors:
        log.warning("  rejected -> %s", err)
    return _load_fallback()


# --------------------------------------------------------------------------- #
# Preprocessing
# --------------------------------------------------------------------------- #

PREPROCESS = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ]
)


def decode_upload(raw: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(400, f"File is not a readable image: {exc}") from exc
    image = ImageOps.exif_transpose(image)
    return image.convert("RGB")


def to_tensor(image: Image.Image) -> tuple[torch.Tensor, np.ndarray]:
    """Returns (normalised NCHW batch, float RGB canvas in [0,1] for overlay)."""
    tensor = PREPROCESS(image).unsqueeze(0).to(DEVICE)
    canvas = np.asarray(
        image.resize((IMAGE_SIZE, IMAGE_SIZE), Image.BILINEAR), dtype=np.float32
    ) / 255.0
    return tensor, canvas


def png_b64(array: np.ndarray) -> str:
    buffer = io.BytesIO()
    Image.fromarray(array.astype(np.uint8)).save(buffer, format="PNG", optimize=True)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


# --------------------------------------------------------------------------- #
# Inference + attribution
# --------------------------------------------------------------------------- #

STATE: dict[str, Any] = {"model": None}
CAM_LOCK = threading.Lock()  # pytorch-grad-cam mutates hooks; serialise access


def run_pipeline(image: Image.Image) -> dict[str, Any]:
    bundle: ModelBundle = STATE["model"]
    started = time.perf_counter()
    tensor, canvas = to_tensor(image)

    with torch.no_grad():
        logits = bundle.module(tensor)
        probabilities = torch.softmax(logits, dim=1)[0].cpu().numpy()

    top_index = int(np.argmax(probabilities))

    with CAM_LOCK:
        with GradCAM(
            model=bundle.module,
            target_layers=bundle.cam_layers,
            reshape_transform=bundle.reshape,
        ) as cam:
            grayscale = cam(
                input_tensor=tensor,
                targets=[ClassifierOutputTarget(top_index)],
                eigen_smooth=False,
                aug_smooth=False,
            )[0]

    grayscale = np.nan_to_num(grayscale, nan=0.0)
    span = float(grayscale.max() - grayscale.min())
    if span > 1e-8:
        grayscale = (grayscale - grayscale.min()) / span
    overlay = show_cam_on_image(canvas, grayscale, use_rgb=True, image_weight=1 - CAM_ALPHA)

    ranked = sorted(
        (
            {
                "code": bundle.labels[i].code,
                "label": bundle.labels[i].name,
                "risk": bundle.labels[i].risk,
                "note": bundle.labels[i].note,
                "probability": round(float(probabilities[i]), 6),
            }
            for i in range(len(bundle.labels))
        ),
        key=lambda item: item["probability"],
        reverse=True,
    )

    winner = bundle.labels[top_index]
    malignant_mass = sum(
        row["probability"] for row in ranked if row["risk"] in {"malignant", "premalignant"}
    )

    return {
        "prediction": {
            "code": winner.code,
            "label": winner.name,
            "risk": winner.risk,
            "note": winner.note,
            "confidence": round(float(probabilities[top_index]), 6),
        },
        "concern_score": round(float(malignant_mass), 6),
        "probabilities": ranked,
        "original_png_base64": png_b64(canvas * 255.0),
        "heatmap_png_base64": png_b64(overlay),
        "attention_peak": {
            "x": int(np.argmax(grayscale) % IMAGE_SIZE),
            "y": int(np.argmax(grayscale) // IMAGE_SIZE),
        },
        "model": {
            "source": bundle.source,
            "architecture": bundle.architecture,
            "calibrated": bundle.calibrated,
            "device": str(DEVICE),
        },
        "inference_ms": round((time.perf_counter() - started) * 1000, 1),
    }


# --------------------------------------------------------------------------- #
# Application
# --------------------------------------------------------------------------- #

@asynccontextmanager
async def lifespan(app: FastAPI):
    STATE["model"] = await run_in_threadpool(load_model)
    yield
    STATE.clear()


app = FastAPI(
    title="SkinSight API",
    version="1.0.0",
    description="Dermoscopic lesion classification with Grad-CAM attribution. "
    "Research and education only — not a diagnostic device.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    bundle: ModelBundle | None = STATE.get("model")
    return {
        "status": "ready" if bundle else "loading",
        "device": str(DEVICE),
        "model_loaded": bundle is not None,
    }


@app.get("/model-info")
def model_info() -> dict[str, Any]:
    bundle: ModelBundle | None = STATE.get("model")
    if bundle is None:
        raise HTTPException(503, "Model is still loading. Retry shortly.")
    return {
        "source": bundle.source,
        "architecture": bundle.architecture,
        "calibrated": bundle.calibrated,
        "device": str(DEVICE),
        "input_size": [IMAGE_SIZE, IMAGE_SIZE],
        "normalisation": {"mean": list(IMAGENET_MEAN), "std": list(IMAGENET_STD)},
        "classes": [
            {"code": c.code, "label": c.name, "risk": c.risk} for c in bundle.labels
        ],
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, Any]:
    if STATE.get("model") is None:
        raise HTTPException(503, "Model is still loading. Retry shortly.")

    if file.content_type not in ACCEPTED_MIME:
        raise HTTPException(
            415, f"Unsupported type {file.content_type!r}. Upload a JPEG or PNG."
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Uploaded file is empty.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            413, f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit."
        )

    image = decode_upload(raw)
    result = await run_in_threadpool(run_pipeline, image)
    result["filename"] = file.filename
    result["source_resolution"] = list(image.size)
    result["disclaimer"] = (
        "Automated output for research and education only. This is not a medical "
        "diagnosis. Consult a qualified dermatologist about any skin lesion."
    )
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=bool(os.getenv("RELOAD")),
    )
