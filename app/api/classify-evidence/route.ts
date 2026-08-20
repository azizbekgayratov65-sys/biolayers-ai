import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../lib/auth/api-auth";
import { checkRateLimit } from "../../lib/auth/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
   ========================================================= */

type EvidenceClassification =
  | "supporting"
  | "contradicting"
  | "contextual"
  | "unrelated";

type EvidenceBasis =
  | "metadata_only"
  | "abstract_and_metadata"
  | "source_text_and_metadata"
  | "source_text_abstract_and_metadata";

type EvidencePaper = {
  pmid: string;
  title: string;

  /*
    New:
    abstract retrieved from PubMed EFetch.
  */
  abstract: string | null;

  journal: string;
  year: string;
  authors: string[];
  doi: string | null;
  pubmedUrl?: string;
};

type RelationshipInput = {
  source: string;
  relation: string;
  target: string;
  description?: string;
  sourceText?: string;
};

type EvidenceAssessment = {
  pmid: string;

  classification:
    EvidenceClassification;

  confidence: number;

  rationale: string;

  evidenceBasis:
    EvidenceBasis;
};

type EvidenceSummary = {
  totalCandidates: number;
  analyzed: number;

  withAbstract: number;
  withoutAbstract: number;

  supporting: number;
  contradicting: number;
  contextual: number;
  unrelated: number;

  strength:
    | "unassessed"
    | "limited"
    | "moderate"
    | "strong";
};

type ClassifyEvidenceResponse = {
  relationship: {
    source: string;
    relation: string;
    target: string;
  };

  assessments:
    EvidenceAssessment[];

  summary:
    EvidenceSummary;

  limitations:
    string[];

  meta?: {
    provider: string;
    model: string;
    analyzedPapers: number;
    abstractsAvailable: number;
  };

  error?: string;
};

type RequestBody = {
  relationship?: unknown;
  papers?: unknown;
};

type GroqResult = {
  assessments?: Array<{
    pmid?: unknown;
    classification?: unknown;
    confidence?: unknown;
    rationale?: unknown;
    evidenceBasis?: unknown;
  }>;

  summary?: {
    supporting?: number;
    contradicting?: number;
    contextual?: number;
    unrelated?: number;
    strength?: EvidenceSummary["strength"];
  };

  limitations?: unknown[];
};

/* =========================================================
   LIMITS
   ========================================================= */

const MAX_PAPERS =
  20;

const MAX_TITLE_LENGTH =
  600;

/*
  Limiting every abstract prevents an unexpectedly
  large request while still preserving enough scientific
  context for classification.
*/
const MAX_ABSTRACT_LENGTH =
  3_000;

const MAX_SOURCE_TEXT_LENGTH =
  4_000;

/*
  Evidence classification is deliberately split into small batches.
  This keeps each Groq request comfortably below request/token limits
  while preserving all candidate papers in the final BioLayers result.
*/
const EVIDENCE_BATCH_SIZE =
  4;

/* =========================================================
   HELPERS
   ========================================================= */

function cleanText(
  value: unknown,
  maxLength: number,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .replace(
      /\s+/g,
      " ",
    )
    .slice(
      0,
      maxLength,
    );
}

function clampConfidence(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0.5;
  }

  return Math.min(
    Math.max(
      value,
      0,
    ),
    1,
  );
}

function isClassification(
  value: unknown,
): value is EvidenceClassification {
  return (
    value === "supporting" ||
    value === "contradicting" ||
    value === "contextual" ||
    value === "unrelated"
  );
}

function isEvidenceBasis(
  value: unknown,
): value is EvidenceBasis {
  return (
    value === "metadata_only" ||
    value === "abstract_and_metadata" ||
    value === "source_text_and_metadata" ||
    value ===
      "source_text_abstract_and_metadata"
  );
}

/* =========================================================
   SANITIZE RELATIONSHIP
   ========================================================= */

function sanitizeRelationship(
  value: unknown,
): RelationshipInput | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const item =
    value as Record<
      string,
      unknown
    >;

  const source =
    cleanText(
      item.source,
      250,
    );

  const relation =
    cleanText(
      item.relation,
      150,
    );

  const target =
    cleanText(
      item.target,
      250,
    );

  if (
    !source ||
    !relation ||
    !target
  ) {
    return null;
  }

  return {
    source,
    relation,
    target,

    description:
      cleanText(
        item.description,
        2_000,
      ),

    sourceText:
      cleanText(
        item.sourceText,
        MAX_SOURCE_TEXT_LENGTH,
      ),
  };
}

/* =========================================================
   SANITIZE PAPERS
   ========================================================= */

function sanitizePapers(
  value: unknown,
): EvidencePaper[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  const result:
    EvidencePaper[] = [];

  for (
    const entry of value
  ) {
    if (
      !entry ||
      typeof entry !==
        "object"
    ) {
      continue;
    }

    const item =
      entry as Record<
        string,
        unknown
      >;

    const pmid =
      cleanText(
        item.pmid,
        30,
      );

    const title =
      cleanText(
        item.title,
        MAX_TITLE_LENGTH,
      );

    if (
      !pmid ||
      !title
    ) {
      continue;
    }

    const abstract =
      cleanText(
        item.abstract,
        MAX_ABSTRACT_LENGTH,
      );

    const authors:
      string[] = [];

    if (
      Array.isArray(
        item.authors,
      )
    ) {
      for (
        const author of
        item.authors
      ) {
        const cleanAuthor =
          cleanText(
            author,
            120,
          );

        if (
          cleanAuthor
        ) {
          authors.push(
            cleanAuthor,
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

    result.push({
      pmid,

      title,

      abstract:
        abstract ||
        null,

      journal:
        cleanText(
          item.journal,
          250,
        ) ||
        "Unknown journal",

      year:
        cleanText(
          item.year,
          20,
        ) ||
        "Unknown year",

      authors,

      doi:
        typeof item.doi ===
          "string"
          ? cleanText(
              item.doi,
              220,
            ) ||
            null
          : null,

      pubmedUrl:
        typeof item.pubmedUrl ===
          "string"
          ? cleanText(
              item.pubmedUrl,
              600,
            )
          : undefined,
    });

    if (
      result.length >=
      MAX_PAPERS
    ) {
      break;
    }
  }

  return result;
}

/* =========================================================
   BUILD CONTEXT
   ========================================================= */

function buildContext({
  relationship,
  papers,
}: {
  relationship:
    RelationshipInput;

  papers:
    EvidencePaper[];
}) {
  const papersText =
    papers
      .map(
        (
          paper,
          index,
        ) => {
          const abstractText =
            paper.abstract
              ? paper.abstract
              : "NO ABSTRACT AVAILABLE";

          return `
PAPER ${index + 1}

PMID:
${paper.pmid}

TITLE:
${paper.title}

ABSTRACT:
${abstractText}

JOURNAL:
${paper.journal}

YEAR:
${paper.year}

DOI:
${paper.doi ?? "Not available"}
`.trim();
        },
      )
      .join(
        "\n\n==============================\n\n",
      );

  return `
SELECTED BIOLOGICAL RELATIONSHIP

SOURCE:
${relationship.source}

RELATION:
${relationship.relation}

TARGET:
${relationship.target}

RELATIONSHIP DESCRIPTION:
${
  relationship.description ||
  "No additional relationship description supplied."
}

ORIGINAL BIOLAYERS SOURCE TEXT

${
  relationship.sourceText ||
  "No source paragraph supplied."
}

IMPORTANT:
The source text above defines the user's graph context.
Do not treat it as independent PubMed evidence.

CANDIDATE PUBMED RECORDS

${papersText}
`;
}

/* =========================================================
   SYSTEM PROMPT
   ========================================================= */

const SYSTEM_PROMPT = `
You are the BioLayers Evidence Classification Engine.

You classify PubMed records relative to ONE explicit biological relationship.

The relationship always has this structure:

SOURCE -> RELATION -> TARGET

Example:

Cancer-associated fibroblasts -> secretes -> CXCL12


SCIENTIFIC RULES

1. Use ONLY the information supplied in the request.

2. When an abstract is available, use the ABSTRACT as the primary evidence for classifying the PubMed paper.

3. The paper title, journal, DOI, year and authors are metadata. Metadata can provide context but normally cannot establish a biological mechanism by itself.

4. The BioLayers source paragraph describes the user's graph context. It MUST NOT be treated as independent evidence that a PubMed paper supports the relationship.

5. Do not claim to have read full text, figures, supplementary data, methods or results beyond information explicitly present in the supplied abstract.

6. Never invent findings.

7. Never invent quotations.

8. Never use outside biological knowledge to upgrade a candidate paper to supporting evidence.

9. A paper may mention both SOURCE and TARGET but still fail to support the exact RELATION.

For example:

SOURCE = cancer-associated fibroblasts
RELATION = secretes
TARGET = CXCL12

A paper discussing fibroblasts and CXCL12 is NOT automatically supporting.

The abstract must provide evidence consistent with fibroblasts producing, releasing, secreting, expressing, or otherwise generating CXCL12 in a manner compatible with the selected relationship.


CLASSIFICATIONS

SUPPORTING

Use "supporting" only when the supplied abstract or explicit supplied evidence directly supports the selected biological relationship and direction.

Examples of suitable evidence:
- SOURCE secretes TARGET
- SOURCE produces TARGET
- SOURCE increases TARGET secretion
- experimental evidence directly establishes the requested mechanism

Do not classify as supporting merely because both entities occur in the same abstract.


CONTRADICTING

Use "contradicting" when the abstract explicitly reports evidence opposing the selected relationship.

Examples:
- SOURCE does not produce TARGET
- inhibition experiments challenge the selected mechanism
- evidence supports an opposite direction or mechanism


CONTEXTUAL

Use "contextual" when the paper is scientifically relevant but does not directly establish or oppose the relationship.

Examples:
- both entities appear in the same disease context
- the pathway is discussed but directionality is unclear
- SOURCE and TARGET participate in related processes
- abstract suggests an association without establishing the selected relation


UNRELATED

Use "unrelated" when the paper provides no meaningful evidence or useful scientific context for the selected relationship.


CONFIDENCE

confidence represents confidence in YOUR CLASSIFICATION based on the supplied information.

It is NOT confidence that the biological claim itself is universally true.

Suggested interpretation:

0.90-1.00
Very clear classification from the abstract.

0.75-0.89
Strongly indicated.

0.55-0.74
Reasonable but some ambiguity remains.

0.35-0.54
Weak information.

Do not use high confidence when no abstract is available unless the title is exceptionally explicit.


EVIDENCE BASIS

Return exactly one of:

"metadata_only"

Use when no abstract is available and classification relies on title/metadata.

"abstract_and_metadata"

Use when an abstract is available and classification is based on it.

"source_text_and_metadata"

Use only when no abstract exists but source context materially helps interpret metadata.

"source_text_abstract_and_metadata"

Use when both source graph context and PubMed abstract materially contribute to interpretation.


OUTPUT REQUIREMENTS

Return exactly ONE assessment for EVERY supplied PMID.

Return ONLY valid JSON.

Required structure:

{
  "assessments": [
    {
      "pmid": "12345678",
      "classification": "supporting",
      "confidence": 0.91,
      "rationale": "The abstract directly reports that the source cell population produces the target molecule.",
      "evidenceBasis": "abstract_and_metadata"
    }
  ],

  "summary": {
    "supporting": 0,
    "contradicting": 0,
    "contextual": 0,
    "unrelated": 0,
    "strength": "unassessed"
  },

  "limitations": [
    "The analysis uses abstracts rather than complete primary full text."
  ]
}

strength must be one of:

"unassessed"
"limited"
"moderate"
"strong"

Do not assign strong evidence solely because many papers were retrieved.

Be conservative.
`;

/* =========================================================
   BATCH CLASSIFICATION
   ========================================================= */

async function classifyEvidenceBatch({
  groq,
  model,
  relationship,
  papers,
}: {
  groq: Groq;
  model: string;
  relationship: RelationshipInput;
  papers: EvidencePaper[];
}): Promise<GroqResult> {
  const completion =
    await groq.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens: 2_500,

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildContext({
            relationship,
            papers,
          }),
        },
      ],
    });

  const outputText =
    completion.choices[0]
      ?.message
      ?.content
      ?.trim();

  if (!outputText) {
    throw new Error(
      "Groq returned an empty evidence-classification response.",
    );
  }

  try {
    return JSON.parse(
      outputText,
    ) as GroqResult;
  } catch {
    throw new Error(
      "Groq returned invalid JSON.",
    );
  }
}

function chunkPapers(
  papers: EvidencePaper[],
  size: number,
): EvidencePaper[][] {
  const chunks: EvidencePaper[][] = [];

  for (
    let index = 0;
    index < papers.length;
    index += size
  ) {
    chunks.push(
      papers.slice(
        index,
        index + size,
      ),
    );
  }

  return chunks;
}

/* =========================================================
   GROQ ERROR HANDLING
   ========================================================= */

function getGroqError(
  error: unknown,
): {
  status: number;
  message: string;
} {
  if (
    error &&
    typeof error ===
      "object"
  ) {
    const record =
      error as {
        status?: unknown;
        message?: unknown;
      };

    const status =
      typeof record.status ===
        "number"
        ? record.status
        : 500;

    if (
      status === 401
    ) {
      return {
        status: 401,

        message:
          "The Groq API key is invalid.",
      };
    }

    if (
      status === 403
    ) {
      return {
        status: 403,

        message:
          "This Groq model is not available for the current project.",
      };
    }

    if (
      status === 429
    ) {
      return {
        status: 429,

        message:
          "The Groq free-tier rate limit has been reached. Please wait and try again.",
      };
    }

    if (
      typeof record.message ===
        "string" &&
      record.message.trim()
    ) {
      return {
        status:
          status >= 400 &&
          status <= 599
            ? status
            : 500,

        message:
          record.message,
      };
    }
  }

  return {
    status: 500,

    message:
      error instanceof Error
        ? error.message
        : "BioLayers Evidence Engine failed.",
  };
}

/* =========================================================
   ROUTE
   ========================================================= */

export async function POST(
  request: Request,
) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  const rateLimit = checkRateLimit(
    `classify-evidence:${userId}`,
    30,
    60 * 1000,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil(
              rateLimit.retryAfterMs / 1000,
            ),
          ),
        },
      },
    );
  }

  try {
    let body:
      RequestBody;

    try {
      body =
        (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "The request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       RELATIONSHIP
       ===================================================== */

    const relationship =
      sanitizeRelationship(
        body.relationship,
      );

    if (
      !relationship
    ) {
      return NextResponse.json(
        {
          error:
            "A valid biological relationship is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       PAPERS
       ===================================================== */

    const papers =
      sanitizePapers(
        body.papers,
      );

    if (
      papers.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one valid PubMed candidate paper is required.",
        },
        {
          status: 400,
        },
      );
    }

    const withAbstract =
      papers.filter(
        (paper) =>
          Boolean(
            paper.abstract,
          ),
      ).length;

    const withoutAbstract =
      papers.length -
      withAbstract;

    /* =====================================================
       GROQ
       ===================================================== */

    const apiKey =
      process.env
        .GROQ_API_KEY
        ?.trim();

    if (
      !apiKey
    ) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is missing from the server environment.",
        },
        {
          status: 503,
        },
      );
    }

    const model =
      process.env
        .GROQ_EVIDENCE_MODEL
        ?.trim() ||
      "llama-3.3-70b-versatile";

    const groq =
      new Groq({
        apiKey,
      });

    /* =====================================================
       CLASSIFICATION — BATCHED
       ===================================================== */

    const batches =
      chunkPapers(
        papers,
        EVIDENCE_BATCH_SIZE,
      );

    const batchResults:
      GroqResult[] = [];

    /*
      Run batches concurrently with a small concurrency limit so
      large paper sets (up to 5 batches) finish in ~1 round instead
      of serially, while staying polite to the Groq rate limits.
    */
    const BATCH_CONCURRENCY = 3;

    for (
      let start = 0;
      start < batches.length;
      start += BATCH_CONCURRENCY
    ) {
      const slice = batches.slice(
        start,
        start + BATCH_CONCURRENCY,
      );

      const results =
        await Promise.all(
          slice.map((batch) =>
            classifyEvidenceBatch({
              groq,
              model,
              relationship,
              papers: batch,
            }),
          ),
        );

      batchResults.push(
        ...results,
      );
    }

    /*
      Merge only paper-level model output here.
      Aggregate counts and strength are recalculated below
      from the validated assessments, so the model cannot
      inflate the final evidence summary.
    */
    const aiResult:
      GroqResult = {
        assessments:
          batchResults.flatMap(
            (result) =>
              result.assessments ??
              [],
          ),

        limitations:
          batchResults.flatMap(
            (result) =>
              result.limitations ??
              [],
          ),
      };

    /* =====================================================
       VALID PMID SET
       ===================================================== */

    const validPaperIds =
      new Set(
        papers.map(
          (paper) =>
            paper.pmid,
        ),
      );

    const paperByPmid =
      new Map(
        papers.map(
          (paper) => [
            paper.pmid,
            paper,
          ],
        ),
      );

    const assessmentMap =
      new Map<
        string,
        EvidenceAssessment
      >();

    /* =====================================================
       VALIDATE MODEL OUTPUT
       ===================================================== */

    for (
      const assessment of
      aiResult.assessments ??
      []
    ) {
      if (
        !assessment ||
        typeof assessment !==
          "object"
      ) {
        continue;
      }

      const pmid =
        cleanText(
          assessment.pmid,
          30,
        );

      if (
        !validPaperIds.has(
          pmid,
        )
      ) {
        continue;
      }

      if (
        !isClassification(
          assessment.classification,
        )
      ) {
        continue;
      }

      const paper =
        paperByPmid.get(
          pmid,
        );

      let evidenceBasis:
        EvidenceBasis;

      if (
        isEvidenceBasis(
          assessment.evidenceBasis,
        )
      ) {
        evidenceBasis =
          assessment.evidenceBasis;
      } else if (
        paper?.abstract
      ) {
        evidenceBasis =
          "abstract_and_metadata";
      } else {
        evidenceBasis =
          "metadata_only";
      }

      /*
        Safety correction:

        If PubMed supplied no abstract, the model cannot
        claim abstract-based classification.
      */
      if (
        !paper?.abstract &&
        (
          evidenceBasis ===
            "abstract_and_metadata" ||
          evidenceBasis ===
            "source_text_abstract_and_metadata"
        )
      ) {
        evidenceBasis =
          relationship.sourceText
            ? "source_text_and_metadata"
            : "metadata_only";
      }

      assessmentMap.set(
        pmid,
        {
          pmid,

          classification:
            assessment.classification,

          confidence:
            clampConfidence(
              assessment.confidence,
            ),

          rationale:
            cleanText(
              assessment.rationale,
              1_200,
            ) ||
            "No classification rationale was returned.",

          evidenceBasis,
        },
      );
    }

    /* =====================================================
       GUARANTEE ONE ASSESSMENT PER PAPER
       ===================================================== */

    const assessments:
      EvidenceAssessment[] =
      papers.map(
        (paper) => {
          const existing =
            assessmentMap.get(
              paper.pmid,
            );

          if (
            existing
          ) {
            return existing;
          }

          return {
            pmid:
              paper.pmid,

            classification:
              paper.abstract
                ? "contextual"
                : "unrelated",

            confidence:
              paper.abstract
                ? 0.35
                : 0.3,

            rationale:
              paper.abstract
                ? "The model did not return a valid classification for this PMID, so BioLayers conservatively treated the record as contextual rather than direct supporting evidence."
                : "No abstract or valid model assessment was available, so BioLayers conservatively did not treat this record as supporting evidence.",

            evidenceBasis:
              paper.abstract
                ? "abstract_and_metadata"
                : "metadata_only",
          };
        },
      );

    /* =====================================================
       COUNTS
       ===================================================== */

    const supporting =
      assessments.filter(
        (item) =>
          item.classification ===
          "supporting",
      ).length;

    const contradicting =
      assessments.filter(
        (item) =>
          item.classification ===
          "contradicting",
      ).length;

    const contextual =
      assessments.filter(
        (item) =>
          item.classification ===
          "contextual",
      ).length;

    const unrelated =
      assessments.filter(
        (item) =>
          item.classification ===
          "unrelated",
      ).length;

    /* =====================================================
       EVIDENCE STRENGTH

       Important:
       This remains conservative because abstracts still
       do not equal complete primary literature review.
       ===================================================== */

    let strength:
      EvidenceSummary["strength"] =
      "unassessed";

    if (
      supporting === 1
    ) {
      strength =
        "limited";
    }

    if (
      supporting >= 2 &&
      contradicting === 0
    ) {
      strength =
        "moderate";
    }

    /*
      Strong requires more than simple paper count.

      We require:
      - at least 4 supporting abstracts
      - no contradiction
      - at least 3 high-confidence supporting classifications
      - abstracts actually available
    */
    const highConfidenceSupporting =
      assessments.filter(
        (assessment) =>
          assessment.classification ===
            "supporting" &&
          assessment.confidence >=
            0.85 &&
          (
            assessment.evidenceBasis ===
              "abstract_and_metadata" ||
            assessment.evidenceBasis ===
              "source_text_abstract_and_metadata"
          ),
      ).length;

    if (
      supporting >= 4 &&
      contradicting === 0 &&
      highConfidenceSupporting >=
        3
    ) {
      strength =
        "strong";
    }

    /*
      Contradiction lowers confidence in aggregate strength.
    */
    if (
      contradicting > 0
    ) {
      if (
        supporting <=
        contradicting
      ) {
        strength =
          supporting > 0
            ? "limited"
            : "unassessed";
      } else if (
        strength ===
        "strong"
      ) {
        strength =
          "moderate";
      }
    }

    /* =====================================================
       LIMITATIONS
       ===================================================== */

    const limitations =
      Array.isArray(
        aiResult.limitations,
      )
        ? Array.from(
            new Set(
              aiResult.limitations
                .filter(
                  (
                    item,
                  ): item is string =>
                    typeof item ===
                      "string" &&
                    item.trim().length >
                      0,
                )
                .map(
                  (item) =>
                    cleanText(
                      item,
                      500,
                    ),
                ),
            ),
          ).slice(
            0,
            5,
          )
        : [];

    if (
      limitations.length ===
      0
    ) {
      limitations.push(
        "Evidence classification uses PubMed abstracts and metadata rather than complete primary full-text articles.",
      );
    }

    if (
      withoutAbstract >
      0
    ) {
      limitations.push(
        `${withoutAbstract} of ${papers.length} candidate publication${
          withoutAbstract === 1
            ? ""
            : "s"
        } had no PubMed abstract available and therefore received a more limited assessment.`,
      );
    }

    /* =====================================================
       FINAL RESPONSE
       ===================================================== */

    const result:
      ClassifyEvidenceResponse =
      {
        relationship: {
          source:
            relationship.source,

          relation:
            relationship.relation,

          target:
            relationship.target,
        },

        assessments,

        summary: {
          totalCandidates:
            papers.length,

          analyzed:
            assessments.length,

          withAbstract,

          withoutAbstract,

          supporting,

          contradicting,

          contextual,

          unrelated,

          strength,
        },

        limitations,

        meta: {
          provider:
            "groq",

          model,

          analyzedPapers:
            assessments.length,

          abstractsAvailable:
            withAbstract,
        },
      };

    return NextResponse.json(
      result,
      {
        status:
          200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    const details =
      getGroqError(
        error,
      );

    console.error(
      "BioLayers Groq Evidence API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          details.message,
      },
      {
        status:
          details.status,
      },
    );
  }
}