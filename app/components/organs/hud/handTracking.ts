/*
  Webcam hand tracking with Google MediaPipe Hand Landmarker, loaded from a
  CDN at runtime so it adds nothing to the site bundle. Video frames stay in
  the browser; nothing is uploaded.
*/

const VERSION = "0.10.14";
const BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;
const MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export type Landmark = { x: number; y: number; z: number };

export type HandFrame = {
  /* Palm centre in mirrored image coordinates, 0..1. */
  x: number;
  y: number;
  /* Apparent hand size (wrist to middle knuckle), grows as the hand comes closer. */
  size: number;
  /* True when pinching or making a fist. */
  grab: boolean;
  landmarks: Landmark[];
};

type HandLandmarker = {
  detectForVideo: (video: HTMLVideoElement, time: number) => { landmarks?: Landmark[][] };
  close: () => void;
};

type VisionModule = {
  FilesetResolver: { forVisionTasks: (path: string) => Promise<unknown> };
  HandLandmarker: {
    createFromOptions: (fileset: unknown, options: Record<string, unknown>) => Promise<HandLandmarker>;
  };
};

declare global {
  interface Window {
    __blVision?: VisionModule;
  }
}

let loading: Promise<VisionModule> | null = null;

function loadVision(): Promise<VisionModule> {
  if (window.__blVision) return Promise.resolve(window.__blVision);
  if (loading) return loading;
  loading = new Promise<VisionModule>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Hand tracking library took too long to load.")), 30000);
    window.addEventListener(
      "bl-vision-ready",
      () => {
        window.clearTimeout(timer);
        if (window.__blVision) resolve(window.__blVision);
        else reject(new Error("Hand tracking library failed to load."));
      },
      { once: true },
    );
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `import * as v from "${BASE}/vision_bundle.mjs"; window.__blVision = v; window.dispatchEvent(new Event("bl-vision-ready"));`;
    script.onerror = () => reject(new Error("Hand tracking library failed to load."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
}

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

function toFrame(lm: Landmark[]): HandFrame {
  const palm = [0, 5, 9, 13, 17].map((k) => lm[k]);
  const x = 1 - palm.reduce((t, p) => t + p.x, 0) / palm.length; // mirror like a selfie
  const y = palm.reduce((t, p) => t + p.y, 0) / palm.length;
  const size = dist(lm[0], lm[9]);
  const pinch = dist(lm[4], lm[8]) / Math.max(1e-4, size);
  const curl = [8, 12, 16, 20].reduce((t, k) => t + dist(lm[k], lm[0]), 0) / 4 / Math.max(1e-4, size);
  return { x, y, size, grab: pinch < 0.45 || curl < 1.15, landmarks: lm };
}

/* Starts the camera and calls onFrame for every video frame (null when no hand is seen). */
export async function startHandTracking(
  video: HTMLVideoElement,
  onFrame: (frame: HandFrame | null) => void,
): Promise<() => void> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser cannot open the camera.");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
    audio: false,
  });
  let landmarker: HandLandmarker | null = null;
  try {
    const vision = await loadVision();
    const fileset = await vision.FilesetResolver.forVisionTasks(`${BASE}/wasm`);
    const options = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: "VIDEO",
      numHands: 1,
    });
    try {
      landmarker = await vision.HandLandmarker.createFromOptions(fileset, options("GPU"));
    } catch {
      landmarker = await vision.HandLandmarker.createFromOptions(fileset, options("CPU"));
    }
  } catch (error) {
    stream.getTracks().forEach((t) => t.stop());
    throw error;
  }

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  let frame = 0;
  let lastTime = -1;
  const loop = () => {
    frame = requestAnimationFrame(loop);
    if (!landmarker || video.readyState < 2 || video.currentTime === lastTime) return;
    lastTime = video.currentTime;
    const result = landmarker.detectForVideo(video, performance.now());
    const lm = result.landmarks?.[0];
    onFrame(lm && lm.length >= 21 ? toFrame(lm) : null);
  };
  loop();

  return () => {
    cancelAnimationFrame(frame);
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    landmarker?.close();
    landmarker = null;
  };
}

/* Bones between landmarks, for drawing the hand skeleton. */
export const HAND_BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];
