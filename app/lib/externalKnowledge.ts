export type CellOntologyTerm = {
  id: string;
  iri: string;
  label: string;
  description: string;
  synonyms: string[];
  ontology: "cl" | "clo";
  ontologyLabel:
    | "Cell Ontology"
    | "Cell Line Ontology";
};

export type CellSearchResponse = {
  query?: string;
  ontology?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  terms?: CellOntologyTerm[];
  error?: string;
};

export function mergeUniqueById<T extends {
  id: string;
}>(
  current: T[],
  incoming: T[],
): T[] {
  const map = new Map<string, T>();

  for (const item of current) {
    map.set(item.id, item);
  }

  for (const item of incoming) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

export async function searchCells({
  query,
  page = 0,
  pageSize = 20,
  ontology = "cl",
  signal,
}: {
  query: string;
  page?: number;
  pageSize?: number;
  ontology?: "cl" | "clo" | "all";
  signal?: AbortSignal;
}): Promise<CellSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    pageSize: String(pageSize),
    ontology,
  });

  const response = await fetch(
    `/api/cells?${params.toString()}`,
    {
      signal,
    },
  );

  const result =
    (await response.json()) as CellSearchResponse;

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Could not search cell ontologies.",
    );
  }

  return result;
}