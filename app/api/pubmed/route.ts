import { NextResponse } from "next/server";

type PubMedSearchResponse = {
  esearchresult?: {
    idlist?: string[];
  };
};

type PubMedAuthor = {
  name?: string;
};

type PubMedArticleSummary = {
  uid?: string;
  title?: string;
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  sortpubdate?: string;
  authors?: PubMedAuthor[];
  articleids?: Array<{
    idtype?: string;
    value?: string;
  }>;
};

type PubMedSummaryResponse = {
  result?: {
    uids?: string[];
    [pmid: string]:
      | PubMedArticleSummary
      | string[]
      | undefined;
  };
};

export type PubMedPaper = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  authors: string[];
  doi: string | null;
  pubmedUrl: string;
};

const NCBI_BASE_URL =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

const MAX_RESULTS = 5;

function getYear(
  pubdate?: string,
  sortpubdate?: string,
): string {
  const source = sortpubdate || pubdate || "";
  const match = source.match(/\b(19|20)\d{2}\b/);

  return match?.[0] ?? "Unknown year";
}

function getDoi(
  articleIds?: PubMedArticleSummary["articleids"],
): string | null {
  if (!Array.isArray(articleIds)) {
    return null;
  }

  const doiEntry = articleIds.find(
    (item) =>
      item.idtype?.toLowerCase() === "doi",
  );

  return doiEntry?.value?.trim() || null;
}

function buildNcbiParams(
  values: Record<string, string>,
): URLSearchParams {
  const params = new URLSearchParams({
    ...values,
    tool: "biolayers-ai",
  });

  if (process.env.NCBI_EMAIL) {
    params.set(
      "email",
      process.env.NCBI_EMAIL,
    );
  }

  if (process.env.NCBI_API_KEY) {
    params.set(
      "api_key",
      process.env.NCBI_API_KEY,
    );
  }

  return params;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const rawQuery =
      requestUrl.searchParams.get("q");

    if (!rawQuery) {
      return NextResponse.json(
        {
          error:
            "Missing search query. Use /api/pubmed?q=CXCL12.",
        },
        {
          status: 400,
        },
      );
    }

    const query = rawQuery.trim();

    if (query.length < 2) {
      return NextResponse.json(
        {
          error:
            "The PubMed search query is too short.",
        },
        {
          status: 400,
        },
      );
    }

    if (query.length > 200) {
      return NextResponse.json(
        {
          error:
            "The PubMed search query is too long.",
        },
        {
          status: 400,
        },
      );
    }

    /*
      Search the selected biological entity in titles
      and abstracts, while prioritizing oncology content.
    */
    const pubmedTerm =
      `("${query}"[Title/Abstract]) AND ` +
      `(cancer[Title/Abstract] OR ` +
      `tumor[Title/Abstract] OR ` +
      `oncology[Title/Abstract] OR ` +
      `neoplasm[Title/Abstract])`;

    const searchParams = buildNcbiParams({
      db: "pubmed",
      term: pubmedTerm,
      retmode: "json",
      retmax: String(MAX_RESULTS),
      sort: "relevance",
    });

    const searchResponse = await fetch(
      `${NCBI_BASE_URL}/esearch.fcgi?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!searchResponse.ok) {
      throw new Error(
        `PubMed search failed with status ${searchResponse.status}.`,
      );
    }

    const searchData =
      (await searchResponse.json()) as PubMedSearchResponse;

    const pmids =
      searchData.esearchresult?.idlist ?? [];

    if (pmids.length === 0) {
      return NextResponse.json({
        query,
        total: 0,
        papers: [],
      });
    }

    const summaryParams = buildNcbiParams({
      db: "pubmed",
      id: pmids.join(","),
      retmode: "json",
    });

    const summaryResponse = await fetch(
      `${NCBI_BASE_URL}/esummary.fcgi?${summaryParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!summaryResponse.ok) {
      throw new Error(
        `PubMed summary request failed with status ${summaryResponse.status}.`,
      );
    }

    const summaryData =
      (await summaryResponse.json()) as PubMedSummaryResponse;

    const result = summaryData.result;

    const papers: PubMedPaper[] = pmids
      .map((pmid) => {
        const record = result?.[pmid];

        if (
          !record ||
          Array.isArray(record)
        ) {
          return null;
        }

        const title =
          record.title?.trim() ||
          "Untitled PubMed article";

        const journal =
          record.fulljournalname?.trim() ||
          record.source?.trim() ||
          "Unknown journal";

        const authors = Array.isArray(
          record.authors,
        )
          ? record.authors
              .map((author) =>
                author.name?.trim(),
              )
              .filter(
                (
                  name,
                ): name is string =>
                  Boolean(name),
              )
              .slice(0, 4)
          : [];

        return {
          pmid,
          title,
          journal,
          year: getYear(
            record.pubdate,
            record.sortpubdate,
          ),
          authors,
          doi: getDoi(record.articleids),
          pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        };
      })
      .filter(
        (
          paper,
        ): paper is PubMedPaper =>
          paper !== null,
      );

    return NextResponse.json({
      query,
      total: papers.length,
      papers,
    });
  } catch (error) {
    console.error(
      "PubMed API route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not retrieve PubMed papers.",
      },
      {
        status: 500,
      },
    );
  }
}