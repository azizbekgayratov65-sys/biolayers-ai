# SkinSight

Dermoscopic lesion classification with Grad-CAM attribution.
FastAPI + PyTorch backend, Streamlit console, containerised.

**Not a medical device.** Research and education only. No clinical validation,
no regulatory clearance. A benign-looking result rules nothing out.

## Run

```bash
docker compose up --build
```

- Console: http://localhost:8501
- API docs: http://localhost:8000/docs
- Health:   http://localhost:8000/health

First boot downloads weights (a few hundred MB) into the `model-cache` volume.
The backend health check allows a 5-minute grace period for this; the Streamlit
sidebar shows `Model still downloading` until it finishes. Later boots are instant.

## Layout

```
requirements.txt            backend + full ML stack
requirements-frontend.txt   slim UI deps (no torch in the UI image)
backend/main.py             API, model resolution, preprocessing, Grad-CAM
frontend/app.py             Streamlit console
Dockerfile.backend
Dockerfile.frontend
docker-compose.yml
```

## Checkpoint resolution

`MODEL_ID` is a comma-separated fallback chain of Hugging Face repos, tried in
order. The first that downloads and instantiates wins. Pin your own:

```yaml
environment:
  MODEL_ID: "your-org/your-ham10000-checkpoint"
```

If every candidate fails (offline, repo moved, gated), the service starts an
ImageNet `efficientnet_b1` backbone with an **untrained** 7-way head so the
pipeline still runs end to end. Every response then carries
`model.calibrated: false`, and the UI replaces the results with a red warning.
Those numbers are noise — never read them as predictions.

## API

`POST /predict` — multipart `file` (JPEG/PNG, ≤12 MB)

```json
{
  "prediction": {"code": "mel", "label": "Melanoma", "risk": "malignant", "confidence": 0.83},
  "concern_score": 0.89,
  "probabilities": [{"code": "mel", "label": "Melanoma", "risk": "malignant", "probability": 0.83}],
  "original_png_base64": "...",
  "heatmap_png_base64": "...",
  "attention_peak": {"x": 118, "y": 96},
  "model": {"source": "...", "architecture": "vit", "calibrated": true, "device": "cpu"},
  "inference_ms": 412.7
}
```

`GET /health` — readiness. `GET /model-info` — checkpoint, classes, normalisation.

## Notes

- Preprocessing is fixed at 224×224 with ImageNet mean/std, matching the spec.
  If you pin a checkpoint trained on different statistics, change
  `IMAGENET_MEAN` / `IMAGENET_STD` in `backend/main.py` to match it.
- The Grad-CAM target layer is resolved automatically: the last transformer
  block norm (with token→grid reshape) for ViT/DeiT/Swin, otherwise the final
  convolution. Works across `timm` and `transformers` checkpoints.
- `pytorch-grad-cam` mutates hooks on the module, so CAM calls are serialised
  behind a lock and inference runs in a threadpool to keep the event loop free.
- GPU: set `DEVICE=cuda` and add a `deploy.resources.reservations.devices`
  block to the backend service.
