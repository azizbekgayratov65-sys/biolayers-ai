/*
  Illustrative tumour-response dynamics for the synthetic lung demo case.

  This is a teaching model, not a clinical prediction. Volumes are relative
  to baseline (1.0) and split into a drug-sensitive and a drug-resistant
  clone so the visual can show resistance emerging. Diameters follow from
  volume (d ∝ V^(1/3)), and the response label follows a simplified
  single-lesion RECIST 1.1 reading.
*/

export type ScenarioId = "untreated" | "osimertinib" | "chemo_io";

export type RecistLabel =
  | "Baseline"
  | "Partial response"
  | "Stable disease"
  | "Progressive disease";

export type TumorState = {
  month: number;
  diameterMm: number;
  relativeVolume: number;
  resistantFraction: number;
  changeFromBaselinePct: number;
  nadirMm: number;
  recist: RecistLabel;
};

export type Scenario = {
  id: ScenarioId;
  label: string;
  short: string;
  description: string;
};

export const BASELINE_DIAMETER_MM = 28;
export const MAX_MONTH = 24;

export const SCENARIOS: Scenario[] = [
  {
    id: "osimertinib",
    label: "Osimertinib (EGFR TKI)",
    short: "EGFR TKI",
    description:
      "Third-generation EGFR inhibitor. Sensitive cells die back fast; a small resistant clone keeps growing and drives progression late. The curve is tuned so progression lands near month 19, in line with the published FLAURA median.",
  },
  {
    id: "chemo_io",
    label: "Platinum chemo + immunotherapy",
    short: "Chemo-IO",
    description:
      "Shown for comparison. EGFR-mutant tumours tend to benefit less from immune checkpoint inhibitors, so the response is shallower and shorter here.",
  },
  {
    id: "untreated",
    label: "No treatment",
    short: "Untreated",
    description:
      "Natural growth with a volume doubling time of six months, a common figure for lung adenocarcinoma.",
  },
];

function cloneVolumes(id: ScenarioId, month: number): { sensitive: number; resistant: number } {
  const m = Math.max(0, month);
  switch (id) {
    case "untreated":
      return { sensitive: Math.pow(2, m / 6), resistant: 0 };
    case "osimertinib": {
      const r0 = 0.01;
      return {
        sensitive: (1 - r0) * (0.06 + 0.94 * Math.exp(-m / 1.8)),
        resistant: r0 * Math.pow(2, m / 4.2),
      };
    }
    case "chemo_io": {
      const r0 = 0.03;
      return {
        sensitive: (1 - r0) * (0.3 + 0.7 * Math.exp(-m / 2.5)),
        resistant: r0 * Math.pow(2, m / 4),
      };
    }
  }
}

export function diameterAt(id: ScenarioId, month: number): number {
  const { sensitive, resistant } = cloneVolumes(id, month);
  return BASELINE_DIAMETER_MM * Math.cbrt(sensitive + resistant);
}

export function tumorStateAt(id: ScenarioId, month: number): TumorState {
  const { sensitive, resistant } = cloneVolumes(id, month);
  const volume = sensitive + resistant;
  const diameterMm = BASELINE_DIAMETER_MM * Math.cbrt(volume);

  let nadirMm = BASELINE_DIAMETER_MM;
  for (let t = 0; t <= month; t += 0.25) {
    nadirMm = Math.min(nadirMm, diameterAt(id, t));
  }

  const change = (diameterMm - BASELINE_DIAMETER_MM) / BASELINE_DIAMETER_MM;
  let recist: RecistLabel;
  if (month <= 0) recist = "Baseline";
  else if (diameterMm >= nadirMm * 1.2 && diameterMm - nadirMm >= 5) recist = "Progressive disease";
  else if (change <= -0.3) recist = "Partial response";
  else recist = "Stable disease";

  return {
    month,
    diameterMm,
    relativeVolume: volume,
    resistantFraction: volume > 0 ? resistant / volume : 0,
    changeFromBaselinePct: change * 100,
    nadirMm,
    recist,
  };
}

/* First month at which the simplified RECIST reading turns progressive. */
export function progressionMonth(id: ScenarioId): number | null {
  for (let m = 0.5; m <= MAX_MONTH; m += 0.5) {
    if (tumorStateAt(id, m).recist === "Progressive disease") return m;
  }
  return null;
}

export function diameterSeries(id: ScenarioId, step = 0.5): { month: number; mm: number }[] {
  const out: { month: number; mm: number }[] = [];
  for (let m = 0; m <= MAX_MONTH + 1e-9; m += step) {
    out.push({ month: m, mm: diameterAt(id, m) });
  }
  return out;
}
