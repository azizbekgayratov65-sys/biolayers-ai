import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EntityType =
  | "cell"
  | "protein"
  | "pathway"
  | "process"
  | "disease";

type CopilotMode =
  | "explain"
  | "mechanism"
  | "hypothesis"
  | "limitations"
  | "simplify"
  | "custom";

type CopilotEntity = {
  id?: string;
  label: string;
  type: EntityType;
  description?: string;
};

type CopilotConnection = {
  label: string;
  type: EntityType;
  relation: string;
  direction: "incoming" | "outgoing";
};

type CopilotPaper = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  authors: string[];
  doi: string | null;
  pubmedUrl?: string;
};

type CopilotRequestBody = {
  mode?: unknown;
  question?: unknown;
  sourceText?: unknown;
  selectedEntity?: unknown;
  connections?: unknown;
  papers?: unknown;
};

type CopilotCitation = {
  pmid: string;
  title: string;
  support: string;
};

type CopilotResult = {
  title: string;
  answer: string;
  keyPoints: string[];
  limitations: string[];
  followUpQuestions: string[];
  citations: CopilotCitation[];
};

const MAX_SOURCE_LENGTH = 12_000;
const MAX_QUESTION_LENGTH = 1_000;
const MAX_CONNECTIONS = 30;
const MAX_PAPERS = 8;

const ENTITY_TYPES: EntityType[] = [
  "cell",
  "protein",
  "pathway",
  "process",
  "disease",
];

const COPILOT_MODES: CopilotMode[] = [
  "explain",
  "mechanism",
  "hypothesis",
  "limitations",
  "simplify",
  "custom",
];

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

function isEntityType(
  value: unknown,
): value is EntityType {
  return (
    typeof value === "string" &&
    ENTITY_TYPES.includes(
      value as EntityType,
    )
  );
}

function isCopilotMode(
  value: unknown,
): value is CopilotMode {
  return (
    typeof value === "string" &&
    COPILOT_MODES.includes(
      value as CopilotMode,
    )
  );
}

function sanitizeEntity(
  value: unknown,
): CopilotEntity | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const item = value as Record<
    string,
    unknown
  >;

  const label = cleanText(
    item.label,
    200,
  );

  if (
    !label ||
    !isEntityType(item.type)
  ) {
    return null;
  }

  return {
    id: cleanText(item.id, 100),
    label,
    type: item.type,
    description: cleanText(
      item.description,
      1_000,
    ),
  };
}

function sanitizeConnections(
  value: unknown,
): CopilotConnection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: CopilotConnection[] =
    [];

  for (const entry of value) {
    if (
      !entry ||
      typeof entry !== "object"
    ) {
      continue;
    }

    const item = entry as Record<
      string,
      unknown
    >;

    const label = cleanText(
      item.label,
      160,
    );

    const relation = cleanText(
      item.relation,
      160,
    );

    const direction =
      item.direction;

    if (
      !label ||
      !relation ||
      !isEntityType(item.type) ||
      (direction !== "incoming" &&
        direction !== "outgoing")
    ) {
      continue;
    }

    result.push({
      label,
      type: item.type,
      relation,
      direction,
    });

    if (
      result.length >= MAX_CONNECTIONS
    ) {
      break;
    }
  }

  return result;
}

function sanitizePapers(
  value: unknown,
): CopilotPaper[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: CopilotPaper[] = [];

  for (const entry of value) {
    if (
      !entry ||
      typeof entry !== "object"
    ) {
      continue;
    }

    const item = entry as Record<
      string,
      unknown
    >;

    const pmid = cleanText(
      item.pmid,
      30,
    );

    const title = cleanText(
      item.title,
      500,
    );

    if (!pmid || !title) {
      continue;
    }

    const authors: string[] = [];

    if (Array.isArray(item.authors)) {
      for (const author of item.authors) {
        const cleanAuthor = cleanText(
          author,
          120,
        );

        if (cleanAuthor) {
          authors.push(cleanAuthor);
        }

        if (authors.length >= 6) {
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
          240,
        ) || "Unknown journal",
      year:
        cleanText(
          item.year,
          20,
        ) || "Unknown year",
      authors,
      doi:
        typeof item.doi === "string"
          ? cleanText(
              item.doi,
              200,
            ) || null
          : null,
      pubmedUrl:
        typeof item.pubmedUrl ===
        "string"
          ? cleanText(
              item.pubmedUrl,
              500,
            )
          : undefined,
    });

    if (
      result.length >= MAX_PAPERS
    ) {
      break;
    }
  }

  return result;
}

function getModeInstruction(
  mode: CopilotMode,
): string {
  if (mode === "explain") {
    return `
Explain the selected entity and its role in the supplied oncology context.
Separate direct evidence from cautious interpretation.
`;
  }

  if (mode === "mechanism") {
    return `
Describe the mechanistic chain involving the selected entity. Make the
direction of each relationship clear and do not invent missing steps.
`;
  }

  if (mode === "hypothesis") {
    return `
Generate one testable research hypothesis grounded in the supplied context.
Clearly label it as a proposal and include a brief way it could be tested.
`;
  }

  if (mode === "limitations") {
    return `
Assess evidence limitations, missing causal support, uncertainty and
overinterpretation risks in the supplied context.
`;
  }

  if (mode === "simplify") {
    return `
Explain the selected entity in accurate plain language for a motivated
high-school or first-year undergraduate student.
`;
  }

  return `
Answer the user's custom question using only the supplied context. If the
context is insufficient, state what information is missing.
`;
}

function buildContext({
  mode,
  question,
  sourceText,
  selectedEntity,
  connections,
  papers,
}: {
  mode: CopilotMode;
  question: string;
  sourceText: string;
  selectedEntity: CopilotEntity;
  connections: CopilotConnection[];
  papers: CopilotPaper[];
}): string {
  const connectionText =
    connections.length > 0
      ? connections
          .map(
            (connection, index) =>
              `${index + 1}. ${
                connection.direction ===
                "outgoing"
                  ? "Selected entity →"
                  : "Selected entity ←"
              } ${connection.label} (${connection.type}); relation: ${connection.relation}`,
          )
          .join("\n")
      : "No direct graph connections supplied.";

  const paperText =
    papers.length > 0
      ? papers
          .map(
            (paper, index) =>
              `${index + 1}. PMID ${paper.pmid}; ${paper.title}; ${paper.journal}; ${paper.year}${
                paper.doi
                  ? `; DOI ${paper.doi}`
                  : ""
              }`,
          )
          .join("\n")
      : "No PubMed metadata supplied.";

  return `
MODE
${mode}

USER QUESTION
${question || "No custom question supplied."}

SELECTED ENTITY
Label: ${selectedEntity.label}
Type: ${selectedEntity.type}
Description: ${
    selectedEntity.description ||
    "No description supplied."
  }

SOURCE PARAGRAPH
${sourceText}

DIRECT GRAPH CONNECTIONS
${connectionText}

PUBMED METADATA
${paperText}
`;
}

function getOpenAIError(
  error: unknown,
): {
  status: number;
  message: string;
} {
  if (
    error instanceof
    OpenAI.AuthenticationError
  ) {
    return {
      status: 401,
      message:
        "The OpenAI API key is invalid.",
    };
  }

  if (
    error instanceof
    OpenAI.RateLimitError
  ) {
    return {
      status: 429,
      message:
        "The OpenAI quota or rate limit has been reached.",
    };
  }

  if (
    error instanceof
    OpenAI.BadRequestError
  ) {
    return {
      status: 400,
      message:
        error.message ||
        "OpenAI rejected the request.",
    };
  }

  if (
    error instanceof
    OpenAI.APIConnectionError
  ) {
    return {
      status: 502,
      message:
        "Could not connect to OpenAI.",
    };
  }

  if (
    error instanceof OpenAI.APIError
  ) {
    return {
      status:
        typeof error.status ===
          "number" &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : 502,
      message:
        error.message ||
        "The OpenAI request failed.",
    };
  }

  return {
    status: 500,
    message:
      error instanceof Error
        ? error.message
        : "BioLayers Copilot failed.",
  };
}

export async function POST(
  request: Request,
) {
  try {
    let body: CopilotRequestBody;

    try {
      body =
        (await request.json()) as CopilotRequestBody;
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

    const mode = isCopilotMode(
      body.mode,
    )
      ? body.mode
      : "custom";

    const question = cleanText(
      body.question,
      MAX_QUESTION_LENGTH,
    );

    const sourceText = cleanText(
      body.sourceText,
      MAX_SOURCE_LENGTH,
    );

    const selectedEntity =
      sanitizeEntity(
        body.selectedEntity,
      );

    if (!selectedEntity) {
      return NextResponse.json(
        {
          error:
            "A valid selected biological entity is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      mode === "custom" &&
      question.length < 3
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a question containing at least 3 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (sourceText.length < 20) {
      return NextResponse.json(
        {
          error:
            "The source paragraph is missing or too short.",
        },
        {
          status: 400,
        },
      );
    }

    const connections =
      sanitizeConnections(
        body.connections,
      );

    const papers = sanitizePapers(
      body.papers,
    );

    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing from the server environment.",
        },
        {
          status: 503,
        },
      );
    }

    const model =
      process.env.OPENAI_COPILOT_MODEL?.trim() ||
      process.env.OPENAI_MODEL?.trim() ||
      "gpt-5-mini";

    const client = new OpenAI({
      apiKey,
      timeout: 60_000,
      maxRetries: 2,
    });

    const response =
      await client.responses.create({
        model,
        store: false,
        max_output_tokens: 2_400,

        instructions: `
You are BioLayers Copilot, a careful scientific assistant for computational
oncology and precision medicine.

Rules:
1. Use only the supplied context.
2. Do not invent genes, mechanisms, experiments, article findings, statistics,
   abstracts or quotations.
3. PubMed titles and metadata alone are limited evidence.
4. Separate direct source facts, graph-derived relationships, cautious
   interpretation and proposed hypotheses.
5. Preserve uncertainty.
6. Never provide diagnosis, treatment instructions or individualized medical
   advice.
7. Return only the required JSON object.

${getModeInstruction(mode)}
`,

        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildContext({
                  mode,
                  question,
                  sourceText,
                  selectedEntity,
                  connections,
                  papers,
                }),
              },
            ],
          },
        ],

        text: {
          format: {
            type: "json_schema",
            name: "biolayers_copilot_response",
            description:
              "A grounded scientific response from BioLayers Copilot.",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: {
                  type: "string",
                  minLength: 1,
                  maxLength: 160,
                },
                answer: {
                  type: "string",
                  minLength: 1,
                  maxLength: 6_000,
                },
                keyPoints: {
                  type: "array",
                  minItems: 1,
                  maxItems: 6,
                  items: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                  },
                },
                limitations: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                  },
                },
                followUpQuestions: {
                  type: "array",
                  minItems: 2,
                  maxItems: 4,
                  items: {
                    type: "string",
                    minLength: 1,
                    maxLength: 240,
                  },
                },
                citations: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "object",
                    additionalProperties:
                      false,
                    properties: {
                      pmid: {
                        type: "string",
                        minLength: 1,
                        maxLength: 30,
                      },
                      title: {
                        type: "string",
                        minLength: 1,
                        maxLength: 500,
                      },
                      support: {
                        type: "string",
                        minLength: 1,
                        maxLength: 500,
                      },
                    },
                    required: [
                      "pmid",
                      "title",
                      "support",
                    ],
                  },
                },
              },
              required: [
                "title",
                "answer",
                "keyPoints",
                "limitations",
                "followUpQuestions",
                "citations",
              ],
            },
          },
        },
      });

    const outputText =
      response.output_text?.trim();

    if (!outputText) {
      return NextResponse.json(
        {
          error:
            "BioLayers Copilot returned an empty response.",
        },
        {
          status: 502,
        },
      );
    }

    let result: CopilotResult;

    try {
      result = JSON.parse(
        outputText,
      ) as CopilotResult;
    } catch {
      return NextResponse.json(
        {
          error:
            "BioLayers Copilot returned invalid JSON.",
        },
        {
          status: 502,
        },
      );
    }

    const validPaperIds = new Set(
      papers.map((paper) => paper.pmid),
    );

    const safeCitations: CopilotCitation[] =
      [];

    if (
      Array.isArray(
        result.citations,
      )
    ) {
      for (const citation of result.citations) {
        if (
          citation &&
          typeof citation ===
            "object" &&
          validPaperIds.has(
            citation.pmid,
          )
        ) {
          safeCitations.push(
            citation,
          );
        }
      }
    }

    return NextResponse.json(
      {
        ...result,
        citations: safeCitations,
        meta: {
          mode,
          entity:
            selectedEntity.label,
          connectionCount:
            connections.length,
          paperCount: papers.length,
          model,
        },
      },
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
      getOpenAIError(error);

    console.error(
      "BioLayers Copilot API error:",
      error,
    );

    return NextResponse.json(
      {
        error: details.message,
      },
      {
        status: details.status,
      },
    );
  }
}