import { NextResponse } from "next/server";

import {
  getNcbiApiKey,
  getNcbiTool,
  getNcbiEmail,
} from "../../lib/env";
import { pubmedQuerySchema } from "./validation";
import { handleValidationError } from "../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
   ========================================================= */

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

type PubMedPaper = {
  pmid: string;

  title: string;

  abstract: string | null;

  journal: string;

  year: string;

  authors: string[];

  doi: string | null;

  pubmedUrl: string;
};

type CachedPubMedResponse = {
  expiresAt: number;

  data: {
    query: string;

    total: number;

    page: number;

    pageSize: number;

    loaded: number;

    hasMore: boolean;

    sort:
      | "relevance"
      | "date";

    papers: PubMedPaper[];
  };
};

/* =========================================================
   CONFIG
   ========================================================= */

const NCBI_BASE_URL =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

const CACHE_TTL_MS =
  5 * 60 * 1000;

/*
  Without an NCBI API key, keep requests spaced out.

  An uncached BioLayers PubMed request performs:

  1. ESearch
  2. ESummary
  3. EFetch
*/
const NCBI_REQUEST_GAP_MS =
  getNcbiApiKey()
    ? 120
    : 380;

const MAX_ABSTRACT_LENGTH =
  12_000;

/* =========================================================
   CACHE
   ========================================================= */

const pubMedCache =
  new Map<
    string,
    CachedPubMedResponse
  >();

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function sleep(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

function intParam(
  value: string | null,
  fallback: number,
): number {
  const parsed =
    Number.parseInt(
      value ?? "",
      10,
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : fallback;
}

function yearOf(
  pubdate?: string,
  sortpubdate?: string,
): string {
  const value =
    sortpubdate ||
    pubdate ||
    "";

  const match =
    value.match(
      /\b(19|20)\d{2}\b/,
    );

  return (
    match?.[0] ??
    "Unknown year"
  );
}

function doiOf(
  articleIds?: PubMedArticleSummary["articleids"],
): string | null {
  if (
    !Array.isArray(
      articleIds,
    )
  ) {
    return null;
  }

  const doi =
    articleIds.find(
      (item) =>
        item.idtype
          ?.toLowerCase() ===
        "doi",
    );

  return (
    doi?.value
      ?.trim() ||
    null
  );
}

/* =========================================================
   NCBI PARAMETERS
   ========================================================= */

function paramsOf(
  values: Record<
    string,
    string
  >,
) {
  const params =
    new URLSearchParams({
      ...values,

      tool:
        getNcbiTool() ||
        "biolayers-ai",
    });

  const ncbiEmail = getNcbiEmail();
  if (ncbiEmail) {
    params.set(
      "email",
      ncbiEmail,
    );
  }

  const ncbiApiKey = getNcbiApiKey();
  if (ncbiApiKey) {
    params.set(
      "api_key",
      ncbiApiKey,
    );
  }

  return params;
}

/* =========================================================
   QUERY NORMALIZATION
   ========================================================= */

function buildPubMedTerm(
  rawQuery: string,
) {
  const query =
    rawQuery.trim();

  const looksStructured =
    /\b(AND|OR|NOT)\b/i.test(
      query,
    ) ||
    query.includes(
      "[",
    );

  let biologicalQuery =
    "";

  if (
    looksStructured
  ) {
    biologicalQuery =
      query;
  } else {
    const cleaned =
      query.replace(
        /"/g,
        "",
      );

    biologicalQuery =
      `"${cleaned}"[Title/Abstract]`;
  }

  /*
    Keep retrieval oncology-focused.
  */
  return (
    `(${biologicalQuery}) AND (` +
    `cancer[Title/Abstract] OR ` +
    `tumor[Title/Abstract] OR ` +
    `tumour[Title/Abstract] OR ` +
    `oncology[Title/Abstract] OR ` +
    `neoplasm[Title/Abstract] OR ` +
    `neoplasms[Title/Abstract]` +
    `)`
  );
}

/* =========================================================
   CACHE HELPERS
   ========================================================= */

function cacheKeyOf({
  query,
  page,
  pageSize,
  sort,
}: {
  query: string;
  page: number;
  pageSize: number;
  sort: string;
}) {
  return [
    query.toLowerCase(),
    page,
    pageSize,
    sort,
  ].join(
    "::",
  );
}

function getCached(
  key: string,
) {
  const entry =
    pubMedCache.get(
      key,
    );

  if (!entry) {
    return null;
  }

  if (
    Date.now() >
    entry.expiresAt
  ) {
    pubMedCache.delete(
      key,
    );

    return null;
  }

  return entry.data;
}

/* =========================================================
   NCBI FETCH WITH RETRY
   ========================================================= */

async function fetchNcbi(
  url: string,
  options: {
    accept?: string;
    signal?: AbortSignal;
  } = {},
) {
  const {
    accept =
      "application/json",
    signal,
  } = options;

  const maxAttempts =
    4;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt += 1
  ) {
    const response =
      await fetch(
        url,
        {
          headers: {
            Accept:
              accept,
          },

          cache:
            "no-store",

          signal,
        },
      );

    if (
      response.status !==
      429
    ) {
      return response;
    }

    const retryAfter =
      response.headers.get(
        "retry-after",
      );

    const retryAfterSeconds =
      retryAfter
        ? Number.parseFloat(
            retryAfter,
          )
        : NaN;

    const waitMs =
      Number.isFinite(
        retryAfterSeconds,
      )
        ? Math.max(
            500,

            retryAfterSeconds *
              1000,
          )
        : Math.min(
            5_000,

            700 *
              2 ** attempt,
          );

    await sleep(
      waitMs,
    );
  }

  throw new Error(
    "PubMed rate limit is still active. Please wait a few seconds and try again.",
  );
}

/* =========================================================
   XML HELPERS
   ========================================================= */

function decodeXmlEntities(
  value: string,
) {
  return value

    /* hexadecimal entities */

    .replace(
      /&#x([0-9a-fA-F]+);/g,
      (
        _,
        hexadecimal: string,
      ) => {
        const code =
          Number.parseInt(
            hexadecimal,
            16,
          );

        if (
          !Number.isFinite(
            code,
          )
        ) {
          return "";
        }

        try {
          return String.fromCodePoint(
            code,
          );
        } catch {
          return "";
        }
      },
    )

    /* decimal entities */

    .replace(
      /&#([0-9]+);/g,
      (
        _,
        decimal: string,
      ) => {
        const code =
          Number.parseInt(
            decimal,
            10,
          );

        if (
          !Number.isFinite(
            code,
          )
        ) {
          return "";
        }

        try {
          return String.fromCodePoint(
            code,
          );
        } catch {
          return "";
        }
      },
    )

    .replace(
      /&quot;/g,
      '"',
    )

    .replace(
      /&apos;/g,
      "'",
    )

    .replace(
      /&lt;/g,
      "<",
    )

    .replace(
      /&gt;/g,
      ">",
    )

    .replace(
      /&amp;/g,
      "&",
    );
}

function stripXmlTags(
  value: string,
) {
  return value

    .replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      "$1",
    )

    .replace(
      /<br\s*\/?>/gi,
      " ",
    )

    .replace(
      /<\/p>/gi,
      " ",
    )

    .replace(
      /<[^>]+>/g,
      "",
    );
}

function cleanXmlText(
  value: string,
) {
  return decodeXmlEntities(
    stripXmlTags(
      value,
    ),
  )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function extractAttribute(
  attributes: string,
  name: string,
) {
  const regex =
    new RegExp(
      `${name}\\s*=\\s*["']([^"']*)["']`,
      "i",
    );

  return (
    attributes.match(
      regex,
    )?.[1] ??
    ""
  );
}

/* =========================================================
   ABSTRACT EXTRACTION
   ========================================================= */

function extractAbstractsFromPubMedXml(
  xml: string,
) {
  const abstracts =
    new Map<
      string,
      string
    >();

  const articleRegex =
    /<PubmedArticle\b[\s\S]*?<\/PubmedArticle>/gi;

  const articles =
    xml.match(
      articleRegex,
    ) ?? [];

  for (
    const articleXml of
    articles
  ) {
    /* -----------------------------------------------------
       PMID
       ----------------------------------------------------- */

    const pmidMatch =
      articleXml.match(
        /<PMID\b[^>]*>([\s\S]*?)<\/PMID>/i,
      );

    if (
      !pmidMatch
    ) {
      continue;
    }

    const pmid =
      cleanXmlText(
        pmidMatch[1],
      );

    if (
      !pmid
    ) {
      continue;
    }

    /* -----------------------------------------------------
       ABSTRACT SECTIONS
       ----------------------------------------------------- */

    const sections:
      string[] = [];

    const abstractRegex =
      /<AbstractText\b([^>]*)>([\s\S]*?)<\/AbstractText>/gi;

    let match:
      RegExpExecArray | null =
      null;

    while (
      (
        match =
          abstractRegex.exec(
            articleXml,
          )
      ) !== null
    ) {
      const attributes =
        match[1] ??
        "";

      const rawText =
        match[2] ??
        "";

      const text =
        cleanXmlText(
          rawText,
        );

      if (
        !text
      ) {
        continue;
      }

      const label =
        cleanXmlText(
          extractAttribute(
            attributes,
            "Label",
          ),
        );

      if (
        label
      ) {
        sections.push(
          `${label}: ${text}`,
        );
      } else {
        sections.push(
          text,
        );
      }
    }

    if (
      sections.length ===
      0
    ) {
      continue;
    }

    const abstract =
      sections
        .join(
          "\n\n",
        )
        .slice(
          0,
          MAX_ABSTRACT_LENGTH,
        )
        .trim();

    if (
      abstract
    ) {
      abstracts.set(
        pmid,
        abstract,
      );
    }
  }

  return abstracts;
}

/* =========================================================
   GET ROUTE
   ========================================================= */

export async function GET(
  request: Request,
) {
  try {
    const url =
      new URL(
        request.url,
      );

    const queryParams = {
      q: url.searchParams.get("q") ?? "",
      page: url.searchParams.get("page") ?? "0",
      pageSize: url.searchParams.get("pageSize") ?? "20",
      sort: url.searchParams.get("sort") ?? "relevance",
    };

    const parsed = pubmedQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      const { message, status: statusCode } = handleValidationError(parsed.error);
      return NextResponse.json({ error: message }, { status: statusCode });
    }

    const { q: query, page, pageSize, sort } = parsed.data;

    const sortValue = sort === "date" ? "pub_date" : "relevance";
    const responseSort: "relevance" | "date" = sortValue === "pub_date" ? "date" : "relevance";

    const retstart =
      page *
      pageSize;

    if (
      retstart >
      9_999
    ) {
      return NextResponse.json(
        {
          error:
            "The PubMed retrieval window has been reached. Refine the query or use a date filter.",
        },
        {
          status:
            400,
        },
      );
    }

    /* =====================================================
       CACHE
       ===================================================== */

    const cacheKey =
      cacheKeyOf({
        query,
        page,
        pageSize,
        sort,
      });

    const cached =
      getCached(
        cacheKey,
      );

    if (
      cached
    ) {
      return NextResponse.json(
        {
          ...cached,

          cached:
            true,
        },
      );
    }

    /* =====================================================
       SEARCH TERM
       ===================================================== */

    const term =
      buildPubMedTerm(
        query,
      );

    /* =====================================================
       1 — ESEARCH
       ===================================================== */

    const searchUrl =
      `${NCBI_BASE_URL}/esearch.fcgi?${paramsOf(
        {
          db:
            "pubmed",

          term,

          retmode:
            "json",

          retstart:
            String(
              retstart,
            ),

          retmax:
            String(
              pageSize,
            ),

          sort,
        },
      ).toString()}`;

    const searchResponse =
      await fetchNcbi(
        searchUrl,
      );

    if (
      !searchResponse.ok
    ) {
      throw new Error(
        `PubMed search failed with status ${searchResponse.status}.`,
      );
    }

    const search =
      (await searchResponse.json()) as PubMedSearchResponse;

    const pmids =
      search
        .esearchresult
        ?.idlist ??
      [];

    const total =
      Number.parseInt(
        search
          .esearchresult
          ?.count ??
          "0",
        10,
      ) || 0;

    /* =====================================================
       NO RESULTS
       ===================================================== */

    if (
      pmids.length ===
      0
    ) {
      const data = {
        query,

        total,

        page,

        pageSize,

        loaded:
          0,

        hasMore:
          false,

        sort:
          responseSort,

        papers:
          [] as PubMedPaper[],
      };

      pubMedCache.set(
        cacheKey,
        {
          expiresAt:
            Date.now() +
            CACHE_TTL_MS,

          data,
        },
      );

      return NextResponse.json(
        data,
      );
    }

    /* =====================================================
       GAP
       ===================================================== */

    await sleep(
      NCBI_REQUEST_GAP_MS,
    );

    /* =====================================================
       2 — ESUMMARY + EFETCH (in parallel)
       ESummary and EFetch both depend only on the ESearch
       pmids, so a single gap before the pair keeps the NCBI
       politeness window without serializing them.
       ===================================================== */

    const summaryUrl =
      `${NCBI_BASE_URL}/esummary.fcgi?${paramsOf(
        {
          db:
            "pubmed",

          id:
            pmids.join(
              ",",
            ),

          retmode:
            "json",
        },
      ).toString()}`;

    const fetchUrl =
      `${NCBI_BASE_URL}/efetch.fcgi?${paramsOf(
        {
          db:
            "pubmed",

          id:
            pmids.join(
              ",",
            ),

          retmode:
            "xml",
        },
      ).toString()}`;

    const [
      summaryResponse,
      fetchResponse,
    ] = await Promise.all([
      fetchNcbi(
        summaryUrl,
      ),
      fetchNcbi(
        fetchUrl,
        {
          accept:
            "application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      ),
    ]);

    if (
      !summaryResponse.ok
    ) {
      throw new Error(
        `PubMed summary failed with status ${summaryResponse.status}.`,
      );
    }

    const summary =
      (await summaryResponse.json()) as PubMedSummaryResponse;

    let abstractMap =
      new Map<
        string,
        string
      >();

    if (
      fetchResponse.ok
    ) {
      const xml =
        await fetchResponse.text();

      abstractMap =
        extractAbstractsFromPubMedXml(
          xml,
        );
    } else {
      /*
        Do not make the whole PubMed page fail
        only because abstracts were temporarily
        unavailable.

        Metadata from ESummary remains useful.
      */
      console.warn(
        `PubMed EFetch failed with status ${fetchResponse.status}. Returning metadata without abstracts.`,
      );
    }

    /* =====================================================
       BUILD PAPERS
       ===================================================== */

    const papers:
      PubMedPaper[] = [];

    for (
      const pmid of
      pmids
    ) {
      const record =
        summary
          .result
          ?.[pmid];

      if (
        !record ||
        Array.isArray(
          record,
        )
      ) {
        continue;
      }

      const authors:
        string[] = [];

      if (
        Array.isArray(
          record.authors,
        )
      ) {
        for (
          const author of
          record.authors
        ) {
          const name =
            author.name
              ?.trim();

          if (
            name
          ) {
            authors.push(
              name,
            );
          }

          if (
            authors.length >=
            6
          ) {
            break;
          }
        }
      }

      papers.push({
        pmid,

        title:
          record.title
            ?.trim() ||
          "Untitled PubMed article",

        abstract:
          abstractMap.get(
            pmid,
          ) ??
          null,

        journal:
          record
            .fulljournalname
            ?.trim() ||
          record.source
            ?.trim() ||
          "Unknown journal",

        year:
          yearOf(
            record.pubdate,
            record.sortpubdate,
          ),

        authors,

        doi:
          doiOf(
            record.articleids,
          ),

        pubmedUrl:
          `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      });
    }

    /* =====================================================
       FINAL DATA
       ===================================================== */

    const data = {
      query,

      total,

      page,

      pageSize,

      loaded:
        papers.length,

      hasMore:
        retstart +
          pmids.length <
          total &&
        retstart +
          pmids.length <
          10_000,

      sort:
        responseSort,

      papers,
    };

    /* =====================================================
       SAVE CACHE
       ===================================================== */

    pubMedCache.set(
      cacheKey,
      {
        expiresAt:
          Date.now() +
          CACHE_TTL_MS,

        data,
      },
    );

    /*
      Prevent dev-server cache from growing forever.
    */
    if (
      pubMedCache.size >
      200
    ) {
      const oldestKey =
        pubMedCache
          .keys()
          .next()
          .value;

      if (
        typeof oldestKey ===
        "string"
      ) {
        pubMedCache.delete(
          oldestKey,
        );
      }
    }

    return NextResponse.json(
      data,
    );
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not retrieve PubMed papers.";

    const rateLimited =
      message
        .toLowerCase()
        .includes(
          "rate limit",
        ) ||
      message.includes(
        "status 429",
      );

    return NextResponse.json(
      {
        error:
          message,
      },
      {
        status:
          rateLimited
            ? 429
            : 500,
      },
    );
  }
}