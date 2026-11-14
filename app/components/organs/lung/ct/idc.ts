/*
  Real chest CT from the NCI Imaging Data Commons (IDC), read straight from
  the browser over DICOMweb.

  IDC hosts The Cancer Imaging Archive's public collections. Its public
  proxy is meant for viewing and light use (a few GB a day per user); for
  production traffic the same data is available through IDC's authenticated
  Google Healthcare endpoint or by mirroring a collection.
*/

export const IDC_DICOMWEB =
  "https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb";

export type Collection = {
  id: string;
  name: string;
  summary: string;
  patients: number;
  /* Builds the patient ID for case number n (1-based). */
  patientId: (n: number) => string;
  first: number;
  last: number;
  page: string;
};

const pad = (n: number, width: number) => String(n).padStart(width, "0");

export const COLLECTIONS: Collection[] = [
  {
    id: "lidc-idri",
    name: "LIDC-IDRI",
    summary: "Diagnostic and screening chest CT with lung nodules marked by up to four thoracic radiologists.",
    patients: 1010,
    patientId: (n) => `LIDC-IDRI-${pad(n, 4)}`,
    first: 1,
    last: 1012,
    page: "https://www.cancerimagingarchive.net/collection/lidc-idri/",
  },
  {
    id: "nsclc-radiomics",
    name: "NSCLC-Radiomics",
    summary: "Pre-treatment CT of non-small cell lung cancer, with the tumour outlined by a radiation oncologist.",
    patients: 422,
    patientId: (n) => `LUNG1-${pad(n, 3)}`,
    first: 1,
    last: 422,
    page: "https://www.cancerimagingarchive.net/collection/nsclc-radiomics/",
  },
  {
    id: "nsclc-radiogenomics",
    name: "NSCLC Radiogenomics",
    summary: "Thin-slice CT and PET/CT of NSCLC patients with matched genomic data such as EGFR and KRAS status.",
    patients: 211,
    patientId: (n) => `R01-${pad(n, 3)}`,
    first: 1,
    last: 163,
    page: "https://www.cancerimagingarchive.net/collection/nsclc-radiogenomics/",
  },
  {
    id: "lung-pet-ct-dx",
    name: "Lung-PET-CT-Dx",
    summary: "CT and PET/CT of patients with biopsy-confirmed lung adenocarcinoma, with tumour bounding boxes.",
    patients: 355,
    patientId: (n) => `Lung_Dx-A${pad(n, 4)}`,
    first: 1,
    last: 260,
    page: "https://www.cancerimagingarchive.net/collection/lung-pet-ct-dx/",
  },
];

export type SeriesInfo = {
  studyUid: string;
  seriesUid: string;
  description: string | null;
  instances: number;
};

export type CtVolume = {
  patientId: string;
  collection: string;
  studyUid: string;
  seriesUid: string;
  description: string | null;
  /* Hounsfield units, x fastest, then y (row), then z (slice, inferior → superior). */
  hu: Int16Array;
  width: number;
  height: number;
  depth: number;
  /* Millimetres per voxel along x, y, z. */
  spacing: [number, number, number];
  /* Which slices have arrived. */
  loaded: Uint8Array;
};

type DicomJson = Record<string, { vr: string; Value?: unknown[] }>;

const JSON_HEADERS = { Accept: "application/dicom+json" };

export class QuotaError extends Error {}

async function getJson(url: string, signal?: AbortSignal): Promise<DicomJson[]> {
  const res = await fetch(url, { headers: JSON_HEADERS, signal });
  if (res.status === 204) return [];
  if (res.status === 429 || res.status === 403) throw new QuotaError("The public archive's daily viewing quota was reached.");
  if (!res.ok) throw new Error(`Archive request failed (${res.status})`);
  return (await res.json()) as DicomJson[];
}

const str = (o: DicomJson, tag: string) => (o[tag]?.Value?.[0] as string | undefined) ?? null;
const num = (o: DicomJson, tag: string, fallback = 0) => {
  const v = o[tag]?.Value?.[0];
  return typeof v === "number" ? v : v !== undefined ? Number(v) : fallback;
};
const nums = (o: DicomJson, tag: string) => (o[tag]?.Value as number[] | undefined)?.map(Number) ?? null;

/* Lists a patient's CT series with their slice counts. */
export async function listCtSeries(patientId: string, signal?: AbortSignal): Promise<SeriesInfo[]> {
  const series = await getJson(
    `${IDC_DICOMWEB}/series?PatientID=${encodeURIComponent(patientId)}&Modality=CT&includefield=0008103E`,
    signal,
  );
  const out: SeriesInfo[] = [];
  for (const s of series) {
    const studyUid = str(s, "0020000D");
    const seriesUid = str(s, "0020000E");
    if (!studyUid || !seriesUid) continue;
    const instances = await getJson(
      `${IDC_DICOMWEB}/studies/${studyUid}/series/${seriesUid}/instances?includefield=00200013`,
      signal,
    );
    out.push({ studyUid, seriesUid, description: str(s, "0008103E"), instances: instances.length });
  }
  return out;
}

/* Picks the axial diagnostic series: skips scouts and reformats, prefers more slices. */
export function pickBestSeries(series: SeriesInfo[]): SeriesInfo | null {
  const skip = /scout|localizer|topogram|coronal|sagittal|fusion|mip|dose/i;
  const usable = series.filter((s) => s.instances >= 40 && !skip.test(s.description ?? ""));
  const pool = usable.length ? usable : series.filter((s) => s.instances >= 20);
  if (!pool.length) return null;
  return [...pool].sort((a, b) => b.instances - a.instances)[0];
}

/* Extracts the first part's body from a multipart/related response. */
function firstPart(buffer: ArrayBuffer): Uint8Array {
  const bytes = new Uint8Array(buffer);
  // Header block ends at the first blank line.
  let start = -1;
  for (let i = 0; i < Math.min(bytes.length - 3, 4096); i++) {
    if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10) {
      start = i + 4;
      break;
    }
  }
  if (start < 0) return bytes;
  // Body ends before the closing "\r\n--boundary".
  let end = bytes.length;
  for (let i = bytes.length - 4; i > start; i--) {
    if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 45 && bytes[i + 3] === 45) {
      end = i;
      break;
    }
  }
  return bytes.subarray(start, end);
}

export const MAX_SLICES = 260;

export async function loadVolume(
  collection: Collection,
  patientId: string,
  series: SeriesInfo,
  onProgress: (volume: CtVolume, done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<CtVolume> {
  const meta = await getJson(`${IDC_DICOMWEB}/studies/${series.studyUid}/series/${series.seriesUid}/metadata`, signal);
  const slices = meta
    .map((m) => ({
      sop: str(m, "00080018"),
      z: nums(m, "00200032")?.[2] ?? num(m, "00201041"),
      rows: num(m, "00280010"),
      cols: num(m, "00280011"),
      slope: num(m, "00281053", 1),
      intercept: num(m, "00281052", 0),
      signed: num(m, "00280103") === 1,
      spacing: nums(m, "00280030") ?? [0.7, 0.7],
      frames: num(m, "00280008", 1),
    }))
    .filter((s) => s.sop && s.rows > 0 && s.cols > 0 && s.frames === 1);
  if (!slices.length) throw new Error("This series has no readable CT slices.");

  // Keep the most common matrix size and sort inferior → superior.
  const size = slices[0].rows;
  let ordered = slices.filter((s) => s.rows === size && s.cols === slices[0].cols).sort((a, b) => a.z - b.z);
  if (ordered.length > MAX_SLICES) {
    const step = ordered.length / MAX_SLICES;
    ordered = Array.from({ length: MAX_SLICES }, (_, k) => ordered[Math.floor(k * step)]);
  }

  const width = ordered[0].cols;
  const height = ordered[0].rows;
  const depth = ordered.length;
  const gaps = ordered.slice(1).map((s, k) => Math.abs(s.z - ordered[k].z)).sort((a, b) => a - b);
  const dz = gaps.length ? gaps[Math.floor(gaps.length / 2)] || 1 : 1;

  const volume: CtVolume = {
    patientId,
    collection: collection.name,
    studyUid: series.studyUid,
    seriesUid: series.seriesUid,
    description: series.description,
    hu: new Int16Array(width * height * depth).fill(-1024),
    width,
    height,
    depth,
    spacing: [ordered[0].spacing[1], ordered[0].spacing[0], dz],
    loaded: new Uint8Array(depth),
  };

  const sliceSize = width * height;
  let done = 0;
  let next = 0;
  // Load from the middle outwards so the first slices on screen show the lungs.
  const order = Array.from({ length: depth }, (_, k) => k).sort(
    (a, b) => Math.abs(a - depth / 2) - Math.abs(b - depth / 2),
  );

  const worker = async () => {
    while (next < order.length) {
      const k = order[next++];
      const s = ordered[k];
      const res = await fetch(
        `${IDC_DICOMWEB}/studies/${series.studyUid}/series/${series.seriesUid}/instances/${s.sop}/frames/1`,
        {
          headers: { Accept: 'multipart/related; type="application/octet-stream"; transfer-syntax=1.2.840.10008.1.2.1' },
          signal,
        },
      );
      if (res.status === 429 || res.status === 403) throw new QuotaError("The public archive's daily viewing quota was reached.");
      if (!res.ok) throw new Error(`Slice request failed (${res.status})`);
      const body = firstPart(await res.arrayBuffer());
      const pixels = Math.min(sliceSize, Math.floor(body.byteLength / 2));
      const view = new DataView(body.buffer, body.byteOffset, pixels * 2);
      const offset = k * sliceSize;
      for (let i = 0; i < pixels; i++) {
        const raw = s.signed ? view.getInt16(i * 2, true) : view.getUint16(i * 2, true);
        const hu = raw * s.slope + s.intercept;
        volume.hu[offset + i] = hu < -1024 ? -1024 : hu > 3071 ? 3071 : hu;
      }
      volume.loaded[k] = 1;
      done++;
      onProgress(volume, done, depth);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  return volume;
}

export function idcViewerUrl(studyUid: string) {
  return `https://viewer.imaging.datacommons.cancer.gov/v3/viewer/?StudyInstanceUIDs=${studyUid}`;
}
