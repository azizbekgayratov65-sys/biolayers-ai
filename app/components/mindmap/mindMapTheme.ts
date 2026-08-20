const SECTION_COLORS = [
  "#4d8dff",
  "#a15cff",
  "#ffc53d",
  "#ff3b5c",
  "#c095fd",
  "#2bff88",
  "#ffc53d",
  "#8db2ff",
  "#a15cff",
  "#c095fd",
];

const SECTION_SOFT_COLORS = [
  "rgba(77,141,255,0.10)",
  "rgba(161,92,255,0.10)",
  "rgba(255,197,61,0.10)",
  "rgba(255,59,92,0.10)",
  "rgba(192,149,253,0.10)",
  "rgba(43,255,136,0.10)",
  "rgba(255,197,61,0.10)",
  "rgba(141,178,255,0.10)",
  "rgba(161,92,255,0.10)",
  "rgba(192,149,253,0.10)",
];

function hashOf(value: string): number {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) >>>
      0;
  }

  return hash;
}

export function sectionColor(
  section?: string,
): string {
  if (!section) {
    return SECTION_COLORS[0];
  }

  return SECTION_COLORS[
    hashOf(section) %
      SECTION_COLORS.length
  ];
}

export function sectionSoftColor(
  section?: string,
): string {
  if (!section) {
    return SECTION_SOFT_COLORS[0];
  }

  return SECTION_SOFT_COLORS[
    hashOf(section) %
      SECTION_SOFT_COLORS.length
  ];
}