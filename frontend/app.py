"""
SkinSight — Streamlit console for the lesion classification API.

Reads BACKEND_URL (default http://backend:8000) and talks to /health,
/model-info and /predict.
"""

from __future__ import annotations

import base64
import io
import os
from typing import Any

import requests
import streamlit as st
from PIL import Image

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000").rstrip("/")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 180))

RISK_STYLE = {
    "malignant": ("#FF6B57", "Malignant"),
    "premalignant": ("#FFB020", "Pre-malignant"),
    "benign": ("#3FBF9F", "Benign"),
    "unknown": ("#7C8BA1", "Unclassified"),
}

st.set_page_config(
    page_title="SkinSight — lesion analysis console",
    page_icon="◎",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  html, body, [class*="css"] { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
  .stApp { background: #0E1620; color: #DCE3EC; }
  section[data-testid="stSidebar"] { background: #0A1017; border-right: 1px solid #1D2937; }

  .sx-eyebrow {
    font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #5E7A93; }
  .sx-title { font-size: 2.35rem; font-weight: 700; letter-spacing: -0.02em;
              margin: 0.1rem 0 0.25rem 0; color: #F2F6FA; }
  .sx-sub { color: #8B9BAD; font-size: 0.95rem; margin-bottom: 0.4rem; }

  .sx-rule { height: 1px; background: linear-gradient(90deg,#24E0C5 0%, #1D2937 55%, transparent 100%);
             margin: 1.1rem 0 1.4rem 0; }

  .sx-card { background: #131E2A; border: 1px solid #1F2C3B; border-radius: 10px;
             padding: 1.05rem 1.2rem; }
  .sx-verdict-code { font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem;
                     letter-spacing: 0.16em; text-transform: uppercase; }
  .sx-verdict-label { font-size: 1.55rem; font-weight: 700; line-height: 1.25;
                      margin: 0.3rem 0 0.15rem 0; color: #F2F6FA; }
  .sx-verdict-note { color: #93A3B5; font-size: 0.9rem; }

  .sx-meter-row { display:flex; justify-content:space-between; align-items:baseline;
                  font-size:0.88rem; margin-bottom:0.15rem; }
  .sx-meter-name { color:#C6D2DF; }
  .sx-meter-val { font-family:'IBM Plex Mono', monospace; color:#8B9BAD; }
  .sx-track { height:7px; background:#1B2735; border-radius:99px; overflow:hidden; margin-bottom:0.75rem; }
  .sx-fill { height:100%; border-radius:99px; }

  .sx-disclaimer { background:#1C1410; border:1px solid #4A2E1C; border-left:3px solid #FFB020;
                   border-radius:8px; padding:0.9rem 1.1rem; color:#E8D9C6; font-size:0.9rem;
                   line-height:1.55; }
  .sx-caption { font-family:'IBM Plex Mono', monospace; font-size:0.72rem; letter-spacing:0.12em;
                text-transform:uppercase; color:#5E7A93; margin-bottom:0.35rem; }
  .sx-meta { font-family:'IBM Plex Mono', monospace; font-size:0.76rem; color:#5E7A93; }
  [data-testid="stFileUploaderDropzone"] { background:#131E2A; border:1px dashed #2B3B4D; }
</style>
""",
    unsafe_allow_html=True,
)


# --------------------------------------------------------------------------- #
# API helpers
# --------------------------------------------------------------------------- #

@st.cache_data(ttl=20, show_spinner=False)
def fetch_health() -> dict[str, Any] | None:
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=8)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None


@st.cache_data(ttl=60, show_spinner=False)
def fetch_model_info() -> dict[str, Any] | None:
    try:
        response = requests.get(f"{BACKEND_URL}/model-info", timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None


def request_prediction(name: str, payload: bytes, mime: str) -> dict[str, Any]:
    response = requests.post(
        f"{BACKEND_URL}/predict",
        files={"file": (name, payload, mime)},
        timeout=REQUEST_TIMEOUT,
    )
    if response.status_code >= 400:
        try:
            detail = response.json().get("detail", response.text)
        except ValueError:
            detail = response.text
        raise RuntimeError(f"{response.status_code} — {detail}")
    return response.json()


def decode_png(encoded: str) -> Image.Image:
    return Image.open(io.BytesIO(base64.b64decode(encoded)))


def meter(name: str, value: float, colour: str) -> None:
    st.markdown(
        f"""
        <div class="sx-meter-row">
          <span class="sx-meter-name">{name}</span>
          <span class="sx-meter-val">{value * 100:.1f}%</span>
        </div>
        <div class="sx-track">
          <div class="sx-fill" style="width:{max(value * 100, 0.6):.2f}%; background:{colour};"></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# --------------------------------------------------------------------------- #
# Sidebar
# --------------------------------------------------------------------------- #

with st.sidebar:
    st.markdown('<div class="sx-eyebrow">System</div>', unsafe_allow_html=True)
    st.markdown("### SkinSight")

    health = fetch_health()
    if health is None:
        st.error("Backend unreachable. Check that the API container is running.")
    elif health.get("model_loaded"):
        st.success(f"Model ready · {health.get('device', 'cpu')}")
    else:
        st.warning("Model still downloading. Refresh in a moment.")

    info = fetch_model_info() if health and health.get("model_loaded") else None
    if info:
        st.markdown(
            f'<div class="sx-meta">CHECKPOINT<br>{info["source"]}</div>',
            unsafe_allow_html=True,
        )
        st.markdown(
            f'<div class="sx-meta" style="margin-top:0.6rem">ARCH · {info["architecture"]}'
            f'<br>INPUT · {info["input_size"][0]}×{info["input_size"][1]}'
            f'<br>CLASSES · {len(info["classes"])}</div>',
            unsafe_allow_html=True,
        )
        if not info["calibrated"]:
            st.error(
                "Running on an uncalibrated fallback backbone. Output is "
                "structurally valid but numerically meaningless."
            )

    st.divider()
    st.caption(f"Endpoint: {BACKEND_URL}")
    if st.button("Refresh status", use_container_width=True):
        st.cache_data.clear()
        st.rerun()


# --------------------------------------------------------------------------- #
# Header
# --------------------------------------------------------------------------- #

st.markdown('<div class="sx-eyebrow">Dermoscopic image analysis</div>', unsafe_allow_html=True)
st.markdown('<div class="sx-title">SkinSight</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sx-sub">Upload a lesion photograph. The model returns a class '
    'distribution and a Grad-CAM map showing which pixels drove that answer.</div>',
    unsafe_allow_html=True,
)
st.markdown('<div class="sx-rule"></div>', unsafe_allow_html=True)

st.markdown(
    """
<div class="sx-disclaimer">
<strong>This tool cannot diagnose anything.</strong> It is a research and education
demonstration of image classification, not a medical device, and it has not been
clinically validated or approved by any regulator. A benign-looking result does not
rule out cancer. Have any new, changing, bleeding, or asymmetric lesion examined by a
qualified dermatologist. If you are worried about a mole, book an appointment — do not
wait on this output.
</div>
""",
    unsafe_allow_html=True,
)
st.write("")


# --------------------------------------------------------------------------- #
# Upload + analysis
# --------------------------------------------------------------------------- #

upload = st.file_uploader(
    "Drag a dermoscopic or close-up photograph here",
    type=["jpg", "jpeg", "png"],
    help="JPEG or PNG. Fill the frame with the lesion and use even lighting.",
)

if upload is None:
    st.markdown(
        '<div class="sx-meta">Awaiting an image. Nothing is stored — the file is held in '
        'memory for the duration of the request.</div>',
        unsafe_allow_html=True,
    )
    st.stop()

mime = "image/png" if upload.name.lower().endswith(".png") else "image/jpeg"
payload = upload.getvalue()

with st.spinner("Running inference and computing attribution…"):
    try:
        result = request_prediction(upload.name, payload, mime)
    except RuntimeError as exc:
        st.error(f"Analysis failed: {exc}")
        st.stop()
    except requests.RequestException as exc:
        st.error(f"Could not reach the backend: {exc}")
        st.stop()

if not result["model"]["calibrated"]:
    st.error(
        "The backend is serving an uncalibrated fallback model. Treat every number "
        "below as placeholder output, not a prediction."
    )

prediction = result["prediction"]
colour, risk_text = RISK_STYLE.get(prediction["risk"], RISK_STYLE["unknown"])

left, right = st.columns(2, gap="medium")
with left:
    st.markdown('<div class="sx-caption">Input · 224×224</div>', unsafe_allow_html=True)
    st.image(decode_png(result["original_png_base64"]), use_container_width=True)
with right:
    st.markdown('<div class="sx-caption">Grad-CAM attribution</div>', unsafe_allow_html=True)
    st.image(decode_png(result["heatmap_png_base64"]), use_container_width=True)

st.markdown(
    '<div class="sx-meta">Warm regions carry the most weight for the predicted class. '
    'If the heat sits on skin, hair, ruler marks or the frame edge rather than the '
    'lesion, distrust the result.</div>',
    unsafe_allow_html=True,
)
st.write("")

verdict, distribution = st.columns([1, 1.15], gap="medium")

with verdict:
    st.markdown(
        f"""
        <div class="sx-card">
          <div class="sx-verdict-code" style="color:{colour}">{risk_text} · {prediction['code'].upper()}</div>
          <div class="sx-verdict-label">{prediction['label']}</div>
          <div class="sx-verdict-note">{prediction['note']}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.write("")
    st.markdown('<div class="sx-caption">Top-1 confidence</div>', unsafe_allow_html=True)
    st.progress(min(max(prediction["confidence"], 0.0), 1.0))
    st.markdown(
        f'<div class="sx-meta">{prediction["confidence"] * 100:.1f}% · combined malignant / '
        f'pre-malignant mass {result["concern_score"] * 100:.1f}%</div>',
        unsafe_allow_html=True,
    )

with distribution:
    st.markdown('<div class="sx-caption">Class distribution</div>', unsafe_allow_html=True)
    for row in result["probabilities"]:
        bar_colour, _ = RISK_STYLE.get(row["risk"], RISK_STYLE["unknown"])
        meter(row["label"], row["probability"], bar_colour)

st.markdown('<div class="sx-rule"></div>', unsafe_allow_html=True)
st.markdown(
    f'<div class="sx-meta">{result["filename"]} · source '
    f'{result["source_resolution"][0]}×{result["source_resolution"][1]} · '
    f'{result["model"]["architecture"]} on {result["model"]["device"]} · '
    f'{result["inference_ms"]} ms</div>',
    unsafe_allow_html=True,
)

with st.expander("Raw API response"):
    st.json(
        {
            k: v
            for k, v in result.items()
            if k not in {"original_png_base64", "heatmap_png_base64"}
        }
    )

st.write("")
st.markdown(
    '<div class="sx-disclaimer">Reminder: this output is not a diagnosis and carries no '
    'clinical weight. Any lesion that concerns you should be seen by a dermatologist, '
    'regardless of what this screen says.</div>',
    unsafe_allow_html=True,
)
