/*
  The three evidence levels used across BioLayers. They are never
  presented as equivalent, so each has its own stain colour.
*/

export type EvidenceLevel = "observed" | "literature" | "inferred";

const LEVELS: Record<EvidenceLevel, { label: string; dot: string; text: string }> = {
  observed: {
    label: "Observed in the image",
    dot: "bg-stain-dapi",
    text: "text-stain-dapi-bright",
  },
  literature: {
    label: "From published literature",
    dot: "bg-stain-cy5",
    text: "text-stain-cy5-bright",
  },
  inferred: {
    label: "Inferred by a rule or model",
    dot: "bg-stain-yfp",
    text: "text-stain-yfp-bright",
  },
};

// The pipeline and atlas data use long names for the same three levels.
export function fromPipelineLevel(
  level: "observed_directly_in_image" | "supported_by_literature" | "inferred_by_model",
): EvidenceLevel {
  if (level === "observed_directly_in_image") return "observed";
  if (level === "supported_by_literature") return "literature";
  return "inferred";
}

export default function EvidenceTag({ level }: { level: EvidenceLevel }) {
  const style = LEVELS[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${style.text}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
