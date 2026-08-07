"use client";

import { useState } from "react";

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

export type CellOntologyScope =
  | "cl"
  | "clo"
  | "all";

type CellSearchResponse = {
  query?: string;
  ontology?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  terms?: CellOntologyTerm[];
  error?: string;
};

function mergeUniqueById<T extends { id: string }>(
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

async function searchCells({
  query,
  page = 0,
  pageSize = 20,
  ontology = "cl",
  signal,
}: {
  query: string;
  page?: number;
  pageSize?: number;
  ontology?: CellOntologyScope;
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
    { signal },
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

export default function useCellOntology() {
  const [cellQuery, setCellQuery] =
    useState("");

  const [cellTerms, setCellTerms] =
    useState<CellOntologyTerm[]>([]);

  const [cellTotal, setCellTotal] =
    useState(0);

  const [cellPage, setCellPage] =
    useState(0);

  const [cellHasMore, setCellHasMore] =
    useState(false);

  const [cellLoading, setCellLoading] =
    useState(false);

  const [cellError, setCellError] =
    useState("");

  const [cellScope, setCellScope] =
    useState<CellOntologyScope>("cl");

  const [
    selectedAtlasTerm,
    setSelectedAtlasTerm,
  ] = useState<CellOntologyTerm | null>(null);

  const [
    favoriteCellIds,
    setFavoriteCellIds,
  ] = useState<string[]>([]);

  function toggleFavoriteCell(
    term: CellOntologyTerm,
  ) {
    setFavoriteCellIds((current) =>
      current.includes(term.id)
        ? current.filter(
            (id) => id !== term.id,
          )
        : [...current, term.id],
    );
  }

  function openCellAtlasTerm(
    term: CellOntologyTerm,
  ) {
    setSelectedAtlasTerm(term);
  }

  async function searchCellPreset(
    query: string,
  ) {
    setCellQuery(query);
    setCellLoading(true);
    setCellError("");

    try {
      const result = await searchCells({
        query,
        page: 0,
        pageSize: 20,
        ontology: cellScope,
      });

      const incoming = Array.isArray(
        result.terms,
      )
        ? result.terms
        : [];

      setCellTerms(incoming);
      setCellTotal(
        typeof result.total === "number"
          ? result.total
          : incoming.length,
      );
      setCellPage(0);
      setCellHasMore(
        Boolean(result.hasMore),
      );
    } catch (error) {
      setCellError(
        error instanceof Error
          ? error.message
          : "Could not search cells.",
      );
    } finally {
      setCellLoading(false);
    }
  }

  async function runCellSearch(
    page = 0,
    append = false,
  ) {
    const query = cellQuery.trim();

    if (query.length < 2) {
      setCellError(
        "Enter at least 2 characters.",
      );
      return;
    }

    setCellLoading(true);
    setCellError("");

    try {
      const result = await searchCells({
        query,
        page,
        pageSize: 20,
        ontology: cellScope,
      });

      const incoming = Array.isArray(
        result.terms,
      )
        ? result.terms
        : [];

      setCellTerms((current) =>
        append
          ? mergeUniqueById(
              current,
              incoming,
            )
          : incoming,
      );

      setCellTotal(
        typeof result.total === "number"
          ? result.total
          : incoming.length,
      );
      setCellPage(page);
      setCellHasMore(
        Boolean(result.hasMore),
      );
    } catch (error) {
      setCellError(
        error instanceof Error
          ? error.message
          : "Could not search cells.",
      );
    } finally {
      setCellLoading(false);
    }
  }

  return {
    cellQuery,
    setCellQuery,
    cellTerms,
    setCellTerms,
    cellTotal,
    cellPage,
    cellHasMore,
    cellLoading,
    cellError,
    setCellError,
    cellScope,
    setCellScope,
    selectedAtlasTerm,
    setSelectedAtlasTerm,
    favoriteCellIds,
    setFavoriteCellIds,
    toggleFavoriteCell,
    openCellAtlasTerm,
    searchCellPreset,
    runCellSearch,
  };
}