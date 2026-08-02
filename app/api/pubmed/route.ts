import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PubMedSearchResponse = {
  esearchresult?: {
    count?: string;
    idlist?: string[];
  };
};

type PubMedAuthor = {
  name?: string;
};

type PubMedArticleSummary = {
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

const NCBI_BASE_URL =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function yearOf(
  pubdate?: string,
  sortpubdate?: string,
): string {
  const match = (
    sortpubdate ||
    pubdate ||
    ""
  ).match(/\b(19|20)\d{2}\b/);

  return match?.[0] ?? "Unknown year";
}

function doiOf(
  articleIds?: PubMedArticleSummary["articleids"],
): string | null {
  if (!Array.isArray(articleIds)) {
    return null;
  }

  return (
    articleIds.find(
      (item) =>
        item.idtype?.toLowerCase() ===
        "doi",
    )?.value?.trim() || null
  );
}

function paramsOf(
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

function intParam(
  value: string | null,
  fallback: number,
): number {
  const parsed = Number.parseInt(
    value ?? "",
    10,
  );

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query =
      url.searchParams.get("q")?.trim() ??
      "";

    if (query.length < 2) {
      return NextResponse.json(
        {
          error:
            "Enter at least 2 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const page = Math.max(
      0,
      intParam(
        url.searchParams.get("page"),
        0,
      ),
    );

    const pageSize = Math.min(
      50,
      Math.max(
        1,
        intParam(
          url.searchParams.get(
            "pageSize",
          ),
          20,
        ),
      ),
    );

    const sort =
      url.searchParams.get("sort") ===
      "date"
        ? "pub_date"
        : "relevance";

    const retstart = page * pageSize;

    if (retstart > 9_999) {
      return NextResponse.json(
        {
          error:
            "The PubMed ESearch retrieval window has been reached. Refine the query or use a date filter.",
        },
        {
          status: 400,
        },
      );
    }

    const term =
      `("${query}"[Title/Abstract]) AND ` +
      `(cancer[Title/Abstract] OR tumor[Title/Abstract] OR oncology[Title/Abstract] OR neoplasm[Title/Abstract])`;

    const searchResponse = await fetch(
      `${NCBI_BASE_URL}/esearch.fcgi?${paramsOf(
        {
          db: "pubmed",
          term,
          retmode: "json",
          retstart: String(retstart),
          retmax: String(pageSize),
          sort,
        },
      ).toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!searchResponse.ok) {
      throw new Error(
        `PubMed search failed with status ${searchResponse.status}.`,
      );
    }

    const search =
      (await searchResponse.json()) as PubMedSearchResponse;

    const pmids =
      search.esearchresult?.idlist ?? [];

    const total =
      Number.parseInt(
        search.esearchresult?.count ??
          "0",
        10,
      ) || 0;

    if (pmids.length === 0) {
      return NextResponse.json({
        query,
        total,
        page,
        pageSize,
        loaded: 0,
        hasMore: false,
        sort:
          sort === "pub_date"
            ? "date"
            : "relevance",
        papers: [],
      });
    }

    const summaryResponse = await fetch(
      `${NCBI_BASE_URL}/esummary.fcgi?${paramsOf(
        {
          db: "pubmed",
          id: pmids.join(","),
          retmode: "json",
        },
      ).toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!summaryResponse.ok) {
      throw new Error(
        `PubMed summary failed with status ${summaryResponse.status}.`,
      );
    }

    const summary =
      (await summaryResponse.json()) as PubMedSummaryResponse;

    const papers = [];

    for (const pmid of pmids) {
      const record =
        summary.result?.[pmid];

      if (
        !record ||
        Array.isArray(record)
      ) {
        continue;
      }

      const authors: string[] = [];

      if (Array.isArray(record.authors)) {
        for (const author of record.authors) {
          const name =
            author.name?.trim();

          if (name) {
            authors.push(name);
          }

          if (authors.length >= 6) {
            break;
          }
        }
      }

      papers.push({
        pmid,
        title:
          record.title?.trim() ||
          "Untitled PubMed article",
        journal:
          record.fulljournalname?.trim() ||
          record.source?.trim() ||
          "Unknown journal",
        year: yearOf(
          record.pubdate,
          record.sortpubdate,
        ),
        authors,
        doi: doiOf(record.articleids),
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      });
    }

    return NextResponse.json({
      query,
      total,
      page,
      pageSize,
      loaded: papers.length,
      hasMore:
        retstart + pmids.length <
          total &&
        retstart + pmids.length <
          10_000,
      sort:
        sort === "pub_date"
          ? "date"
          : "relevance",
      papers,
    });
  } catch (error) {
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