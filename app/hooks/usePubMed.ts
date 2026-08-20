"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
   ========================================================= */

export type PubMedPaper = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  authors: string[];
  doi: string | null;
  pubmedUrl: string;

  // PubMed abstract retrieved through EFetch.
  // null means PubMed did not provide an abstract.
  abstract: string | null;
};

export type PubMedResponse = {
  query?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  loaded?: number;
  hasMore?: boolean;
  sort?: "relevance" | "date";
  papers?: PubMedPaper[];
  error?: string;
};

export type PaperSort =
  | "relevance"
  | "date";

/* =========================================================
   OPTIONS
   ========================================================= */

type UsePubMedOptions = {
  /*
    Node-based search.

    Example:
    CXCL12
  */
  selectedLabel?: string | null;

  /*
    Explicit query.
    This has priority over selectedLabel.

    Example:
    "Cancer-associated fibroblasts" AND "CXCL12"
  */
  searchQuery?: string | null;

  pageSize?: number;

  /*
    Lets us disable PubMed requests if needed.
  */
  enabled?: boolean;
};

/* =========================================================
   HELPERS
   ========================================================= */

function cleanQuery(
  value?: string | null,
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* =========================================================
   HOOK
   ========================================================= */

export default function usePubMed({
  selectedLabel,
  searchQuery,
  pageSize = 20,
  enabled = true,
}: UsePubMedOptions) {
  const [
    pubMedPapers,
    setPubMedPapers,
  ] = useState<PubMedPaper[]>(
    [],
  );

  const [
    pubMedLoading,
    setPubMedLoading,
  ] = useState(false);

  const [
    pubMedError,
    setPubMedError,
  ] = useState("");

  const [
    pubMedTotal,
    setPubMedTotal,
  ] = useState(0);

  const [
    pubMedPage,
    setPubMedPage,
  ] = useState(0);

  const [
    pubMedHasMore,
    setPubMedHasMore,
  ] = useState(false);

  const [
    pubMedSort,
    setPubMedSort,
  ] = useState<PaperSort>(
    "relevance",
  );

  const [
    pubMedLoadingMore,
    setPubMedLoadingMore,
  ] = useState(false);

  const [
    comparedPapers,
    setComparedPapers,
  ] = useState<PubMedPaper[]>(
    [],
  );

  /* =======================================================
     ACTIVE QUERY
     ======================================================= */

  const activeQuery =
    useMemo(() => {
      const explicitQuery =
        cleanQuery(
          searchQuery,
        );

      if (explicitQuery) {
        return explicitQuery;
      }

      return cleanQuery(
        selectedLabel,
      );
    }, [
      searchQuery,
      selectedLabel,
    ]);

  /* =======================================================
     RESET
     ======================================================= */

  function resetResults() {
    setPubMedPapers([]);
    setPubMedError("");
    setPubMedLoading(false);
    setPubMedTotal(0);
    setPubMedPage(0);
    setPubMedHasMore(false);
    setComparedPapers([]);
  }

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    if (
      !enabled ||
      !activeQuery
    ) {
      resetResults();
      return;
    }

    const controller =
      new AbortController();

    async function loadPubMedPapers() {
      setPubMedLoading(true);
      setPubMedError("");

      try {
        const response =
          await fetch(
            `/api/pubmed?q=${encodeURIComponent(
              activeQuery,
            )}&page=0&pageSize=${pageSize}&sort=${pubMedSort}`,
            {
              signal:
                controller.signal,
            },
          );

        const result =
          (await response.json()) as PubMedResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not retrieve PubMed papers.",
          );
        }

        const papers =
          Array.isArray(
            result.papers,
          )
            ? result.papers
            : [];

        setPubMedPapers(
          papers,
        );

        setPubMedTotal(
          typeof result.total ===
            "number"
            ? result.total
            : papers.length,
        );

        setPubMedPage(0);

        setPubMedHasMore(
          Boolean(
            result.hasMore,
          ),
        );

        setComparedPapers(
          [],
        );
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setPubMedPapers([]);
        setPubMedTotal(0);
        setPubMedHasMore(false);
        setComparedPapers([]);

        setPubMedError(
          error instanceof Error
            ? error.message
            : "Could not retrieve PubMed papers.",
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setPubMedLoading(
            false,
          );
        }
      }
    }

    /*
      Debounce rapid query changes (e.g. hovering across graph
      nodes) so only the settled query triggers a PubMed request.
    */
    const debounceTimer =
      window.setTimeout(() => {
        void loadPubMedPapers();
      }, 250);

    return () => {
      window.clearTimeout(
        debounceTimer,
      );

      controller.abort();
    };
  }, [
    activeQuery,
    pubMedSort,
    pageSize,
    enabled,
  ]);

  /* =======================================================
     LOAD MORE
     ======================================================= */

  async function loadMorePubMed() {
    if (
      !enabled ||
      !activeQuery ||
      pubMedLoadingMore ||
      !pubMedHasMore
    ) {
      return;
    }

    const nextPage =
      pubMedPage + 1;

    setPubMedLoadingMore(
      true,
    );

    setPubMedError("");

    try {
      const response =
        await fetch(
          `/api/pubmed?q=${encodeURIComponent(
            activeQuery,
          )}&page=${nextPage}&pageSize=${pageSize}&sort=${pubMedSort}`,
        );

      const result =
        (await response.json()) as PubMedResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not load more papers.",
        );
      }

      const incoming =
        Array.isArray(
          result.papers,
        )
          ? result.papers
          : [];

      setPubMedPapers(
        (current) => {
          const ids =
            new Set(
              current.map(
                (paper) =>
                  paper.pmid,
              ),
            );

          return [
            ...current,

            ...incoming.filter(
              (paper) =>
                !ids.has(
                  paper.pmid,
                ),
            ),
          ];
        },
      );

      setPubMedPage(
        nextPage,
      );

      setPubMedHasMore(
        Boolean(
          result.hasMore,
        ),
      );

      if (
        typeof result.total ===
        "number"
      ) {
        setPubMedTotal(
          result.total,
        );
      }
    } catch (error) {
      setPubMedError(
        error instanceof Error
          ? error.message
          : "Could not load more papers.",
      );
    } finally {
      setPubMedLoadingMore(
        false,
      );
    }
  }

  /* =======================================================
     PAPER COMPARISON
     ======================================================= */

  function togglePaperComparison(
    paper: PubMedPaper,
  ) {
    setComparedPapers(
      (current) => {
        if (
          current.some(
            (item) =>
              item.pmid ===
              paper.pmid,
          )
        ) {
          return current.filter(
            (item) =>
              item.pmid !==
              paper.pmid,
          );
        }

        return current.length >=
          2
          ? [
              current[1],
              paper,
            ]
          : [
              ...current,
              paper,
            ];
      },
    );
  }

  /* =======================================================
     RETURN
     ======================================================= */

  return {
    /*
      The exact query currently used.
    */
    pubMedQuery:
      activeQuery,

    pubMedPapers,
    pubMedLoading,
    pubMedError,
    pubMedTotal,
    pubMedPage,
    pubMedHasMore,

    pubMedSort,
    setPubMedSort,

    pubMedLoadingMore,

    comparedPapers,
    setComparedPapers,

    loadMorePubMed,

    togglePaperComparison,
  };
}