const SECTION_COLORS = [
  "#5eead4",
  "#67e8f9",
  "#fcd34d",
  "#fda4af",
  "#c4b5fd",
  "#86efac",
  "#fdba74",
  "#7dd3fc",
  "#f0abfc",
  "#a5f3fc",
];

const SECTION_SOFT_COLORS = [
  "rgba(94,234,212,0.10)",
  "rgba(103,232,249,0.10)",
  "rgba(252,211,77,0.10)",
  "rgba(253,164,175,0.10)",
  "rgba(196,181,253,0.10)",
  "rgba(134,239,172,0.10)",
  "rgba(253,186,116,0.10)",
  "rgba(125,211,252,0.10)",
  "rgba(240,171,252,0.10)",
  "rgba(165,243,252,0.10)",
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