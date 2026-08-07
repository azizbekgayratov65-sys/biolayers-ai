"use client";

import { useEffect, useState } from "react";

export type PubMedPaper = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  authors: string[];
  doi: string | null;
  pubmedUrl: string;
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

export type PaperSort = "relevance" | "date";

type UsePubMedOptions = {
  selectedLabel?: string | null;
  pageSize?: number;
};

export default function usePubMed({
  selectedLabel,
  pageSize = 20,
}: UsePubMedOptions) {
  const [pubMedPapers, setPubMedPapers] =
    useState<PubMedPaper[]>([]);
  const [pubMedLoading, setPubMedLoading] =
    useState(false);
  const [pubMedError, setPubMedError] =
    useState("");
  const [pubMedTotal, setPubMedTotal] =
    useState(0);
  const [pubMedPage, setPubMedPage] =
    useState(0);
  const [pubMedHasMore, setPubMedHasMore] =
    useState(false);
  const [pubMedSort, setPubMedSort] =
    useState<PaperSort>("relevance");
  const [pubMedLoadingMore, setPubMedLoadingMore] =
    useState(false);
  const [comparedPapers, setComparedPapers] =
    useState<PubMedPaper[]>([]);

  useEffect(() => {
    if (!selectedLabel) {
      setPubMedPapers([]);
      setPubMedError("");
      setPubMedLoading(false);
      setPubMedTotal(0);
      setPubMedPage(0);
      setPubMedHasMore(false);
      setComparedPapers([]);
      return;
    }

    const label = selectedLabel;
    const controller = new AbortController();

    async function loadPubMedPapers() {
      setPubMedLoading(true);
      setPubMedError("");

      try {
        const response = await fetch(
          `/api/pubmed?q=${encodeURIComponent(
            label,
          )}&page=0&pageSize=${pageSize}&sort=${pubMedSort}`,
          { signal: controller.signal },
        );

        const result =
          (await response.json()) as PubMedResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not retrieve PubMed papers.",
          );
        }

        const papers = Array.isArray(result.papers)
          ? result.papers
          : [];

        setPubMedPapers(papers);
        setPubMedTotal(
          typeof result.total === "number"
            ? result.total
            : papers.length,
        );
        setPubMedPage(0);
        setPubMedHasMore(Boolean(result.hasMore));
        setComparedPapers([]);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
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
        if (!controller.signal.aborted) {
          setPubMedLoading(false);
        }
      }
    }

    void loadPubMedPapers();

    return () => {
      controller.abort();
    };
  }, [selectedLabel, pubMedSort, pageSize]);

  async function loadMorePubMed() {
    if (
      !selectedLabel ||
      pubMedLoadingMore ||
      !pubMedHasMore
    ) {
      return;
    }

    const nextPage = pubMedPage + 1;
    setPubMedLoadingMore(true);
    setPubMedError("");

    try {
      const response = await fetch(
        `/api/pubmed?q=${encodeURIComponent(
          selectedLabel,
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

      const incoming = Array.isArray(result.papers)
        ? result.papers
        : [];

      setPubMedPapers((current) => {
        const ids = new Set(
          current.map((paper) => paper.pmid),
        );

        return [
          ...current,
          ...incoming.filter(
            (paper) => !ids.has(paper.pmid),
          ),
        ];
      });

      setPubMedPage(nextPage);
      setPubMedHasMore(Boolean(result.hasMore));

      if (typeof result.total === "number") {
        setPubMedTotal(result.total);
      }
    } catch (error) {
      setPubMedError(
        error instanceof Error
          ? error.message
          : "Could not load more papers.",
      );
    } finally {
      setPubMedLoadingMore(false);
    }
  }

  function togglePaperComparison(
    paper: PubMedPaper,
  ) {
    setComparedPapers((current) => {
      if (
        current.some(
          (item) => item.pmid === paper.pmid,
        )
      ) {
        return current.filter(
          (item) => item.pmid !== paper.pmid,
        );
      }

      return current.length >= 2
        ? [current[1], paper]
        : [...current, paper];
    });
  }

  return {
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