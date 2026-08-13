import Groq from "groq-sdk";
import { NextResponse } from "next/server";

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

type EvidencePaper = {
  pmid: string;
  title: string;
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
  classification: EvidenceClassification;
  confidence: number;
  rationale: string;
  evidenceBasis:
    | "metadata_only"
    | "source_text_and_metadata";
};

type EvidenceSummary = {
  totalCandidates: number;
  analyzed: number;

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

  assessments: EvidenceAssessment[];

  summary: EvidenceSummary;

  limitations: string[];

  meta?: {
    provider: string;
    model: string;
    analyzedPapers: number;
  };

  error?: string;
};

type RequestBody = {
  relationship?: unknown;
  papers?: unknown;
};

type GroqResult = {
  assessments?: EvidenceAssessment[];

  summary?: {
    supporting?: number;
    contradicting?: number;
    contextual?: number;
    unrelated?: number;
    strength?: EvidenceSummary["strength"];
  };

  limitations?: string[];
};

/* =========================================================
   LIMITS
   ========================================================= */

const MAX_PAPERS = 20;
const MAX_TITLE_LENGTH = 600;
const MAX_SOURCE_TEXT_LENGTH = 12_000;

/* =========================================================
   HELPERS
   ========================================================= */

function cleanText(
  value: unknown,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
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
    Math.max(value, 0),
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
  if (!Array.isArray(value)) {
    return [];
  }

  const result:
    EvidencePaper[] = [];

  for (const entry of value) {
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

        if (cleanAuthor) {
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
            ) || null
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
        ) =>
          `${index + 1}. PMID ${paper.pmid}
Title: ${paper.title}
Journal: ${paper.journal}
Year: ${paper.year}${
            paper.doi
              ? `\nDOI: ${paper.doi}`
              : ""
          }`,
      )
      .join(
        "\n\n",
      );

  return `
BIOLOGICAL RELATIONSHIP

Source:
${relationship.source}

Relation:
${relationship.relation}

Target:
${relationship.target}

Relationship description:
${
  relationship.description ||
  "No additional relationship description supplied."
}

SOURCE TEXT FROM THE USER'S GRAPH INPUT

${
  relationship.sourceText ||
  "No source paragraph supplied."
}

CANDIDATE PUBMED RECORDS

${papersText}
`;
}

/* =========================================================
   SYSTEM PROMPT
   ========================================================= */

const SYSTEM_PROMPT = `
You are the BioLayers Evidence Classification Engine.

Your job is to classify PubMed candidate records relative to ONE explicit biological relationship.

Scientific rules:

1. Use ONLY the information supplied in the request.

2. You are usually given PubMed metadata such as titles, journals, years and identifiers.
Do NOT pretend you have read an abstract, full paper, methods, results or supplementary data unless that information is explicitly supplied.

3. A paper title mentioning both entities does NOT automatically prove that the source causes, activates, secretes, inhibits, promotes, regulates or otherwise affects the target.

4. Classification meanings:

supporting:
The supplied information explicitly supports the selected relationship with the same biological direction or mechanism.

contradicting:
The supplied information explicitly opposes, reverses or challenges the selected relationship.

contextual:
The record is scientifically relevant to one or both entities or to the disease/mechanistic context, but the supplied information does not directly establish the selected relationship.

unrelated:
The supplied information does not provide meaningful evidence or context for the selected relationship.

5. Because metadata alone is weak evidence, prefer "contextual" over "supporting" whenever the relationship is not explicit.

6. Be conservative.

7. Confidence measures confidence in YOUR classification based on supplied information only.
It is NOT confidence that the biological claim is true.

8. Never invent quotations.

9. Never invent findings.

10. Never use outside knowledge to upgrade a paper from contextual to supporting.

11. Return exactly one assessment for every supplied PMID.

12. Return ONLY valid JSON.

The JSON structure must be:

{
  "assessments": [
    {
      "pmid": "string",
      "classification": "supporting | contradicting | contextual | unrelated",
      "confidence": 0.0,
      "rationale": "short explanation",
      "evidenceBasis": "metadata_only | source_text_and_metadata"
    }
  ],
  "summary": {
    "supporting": 0,
    "contradicting": 0,
    "contextual": 0,
    "unrelated": 0,
    "strength": "unassessed | limited | moderate | strong"
  },
  "limitations": [
    "string"
  ]
}
`;

/* =========================================================
   GROQ ERROR
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

    if (status === 401) {
      return {
        status: 401,
        message:
          "The Groq API key is invalid.",
      };
    }

    if (status === 403) {
      return {
        status: 403,
        message:
          "This Groq model is not available for the current project.",
      };
    }

    if (status === 429) {
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

    if (!relationship) {
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
      papers.length === 0
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

    /* =====================================================
       GROQ CONFIG
       ===================================================== */

    const apiKey =
      process.env
        .GROQ_API_KEY
        ?.trim();

    if (!apiKey) {
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
       CLASSIFICATION
       ===================================================== */

    const completion =
      await groq.chat.completions.create({
        model,

        temperature: 0.1,

        max_tokens: 4_000,

        response_format: {
          type:
            "json_object",
        },

        messages: [
          {
            role:
              "system",

            content:
              SYSTEM_PROMPT,
          },

          {
            role:
              "user",

            content:
              buildContext({
                relationship,
                papers,
              }),
          },
        ],
      });

    const outputText =
      completion.choices[0]
        ?.message?.content
        ?.trim();

    if (!outputText) {
      return NextResponse.json(
        {
          error:
            "Groq returned an empty evidence-classification response.",
        },
        {
          status: 502,
        },
      );
    }

    /* =====================================================
       PARSE JSON
       ===================================================== */

    let aiResult:
      GroqResult;

    try {
      aiResult =
        JSON.parse(
          outputText,
        ) as GroqResult;
    } catch {
      return NextResponse.json(
        {
          error:
            "Groq returned invalid JSON.",
        },
        {
          status: 502,
        },
      );
    }

    /* =====================================================
       VALID PMIDS
       ===================================================== */

    const validPaperIds =
      new Set(
        papers.map(
          (paper) =>
            paper.pmid,
        ),
      );

    const assessmentMap =
      new Map<
        string,
        EvidenceAssessment
      >();

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

      if (
        !validPaperIds.has(
          assessment.pmid,
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

      assessmentMap.set(
        assessment.pmid,
        {
          pmid:
            assessment.pmid,

          classification:
            assessment.classification,

          confidence:
            clampConfidence(
              assessment.confidence,
            ),

          rationale:
            cleanText(
              assessment.rationale,
              800,
            ) ||
            "No classification rationale was returned.",

          evidenceBasis:
            assessment.evidenceBasis ===
            "source_text_and_metadata"
              ? "source_text_and_metadata"
              : "metadata_only",
        },
      );
    }

    /* =====================================================
       GUARANTEE ONE RESULT PER PAPER
       ===================================================== */

    const assessments:
      EvidenceAssessment[] =
      papers.map(
        (paper) =>
          assessmentMap.get(
            paper.pmid,
          ) ?? {
            pmid:
              paper.pmid,

            classification:
              "contextual",

            confidence:
              0.35,

            rationale:
              "The model did not return a valid assessment for this PMID, so BioLayers conservatively treated it as contextual rather than supporting evidence.",

            evidenceBasis:
              "metadata_only",
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
       CONSERVATIVE EVIDENCE STRENGTH
       ===================================================== */

    let strength:
      EvidenceSummary["strength"] =
      "unassessed";

    if (
      supporting === 1
    ) {
      strength =
        "limited";
    } else if (
      supporting >= 2 &&
      contradicting === 0
    ) {
      strength =
        "moderate";
    }

    /*
      Important:
      title/metadata-only analysis never automatically
      produces STRONG evidence.
    */

    /* =====================================================
       LIMITATIONS
       ===================================================== */

    const limitations =
      Array.isArray(
        aiResult.limitations,
      )
        ? aiResult.limitations
            .filter(
              (
                item,
              ): item is string =>
                typeof item ===
                "string" &&
                item.trim().length >
                  0,
            )
            .slice(
              0,
              5,
            )
        : [];

    if (
      limitations.length ===
      0
    ) {
      limitations.push(
        "Classification is based primarily on PubMed metadata and does not replace review of abstracts or primary full-text literature.",
      );
    }

    /* =====================================================
       RESPONSE
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
        },
      };

    return NextResponse.json(
      result,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
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