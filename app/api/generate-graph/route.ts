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

type GeneratedEntity = {
  id: string;
  label: string;
  type: EntityType;
  description: string;
};

type GeneratedRelation = {
  source: string;
  target: string;
  label: string;
};

type GeneratedGraph = {
  entities: GeneratedEntity[];
  relations: GeneratedRelation[];
};

const ALLOWED_ENTITY_TYPES: EntityType[] = [
  "cell",
  "protein",
  "pathway",
  "process",
  "disease",
];

const MAX_ENTITIES = 12;
const MAX_RELATIONS = 20;
const MAX_INPUT_LENGTH = 8000;

function normalizeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/β/g, "beta")
    .replace(/γ/g, "gamma")
    .replace(/α/g, "alpha")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isEntityType(
  value: unknown,
): value is EntityType {
  return (
    typeof value === "string" &&
    ALLOWED_ENTITY_TYPES.includes(
      value as EntityType,
    )
  );
}

function cleanText(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value.trim()
    : fallback;
}

function removeDuplicateEntities(
  entities: GeneratedEntity[],
): GeneratedEntity[] {
  const uniqueEntities = new Map<
    string,
    GeneratedEntity
  >();

  entities.forEach((entity, index) => {
    const label = cleanText(entity.label);

    if (!label) {
      return;
    }

    const normalizedId =
      normalizeId(entity.id || label) ||
      `entity-${index + 1}`;

    if (uniqueEntities.has(normalizedId)) {
      return;
    }

    uniqueEntities.set(normalizedId, {
      id: normalizedId,
      label,
      type: isEntityType(entity.type)
        ? entity.type
        : "process",
      description:
        cleanText(entity.description) ||
        `${label} is a biological entity identified in the submitted research paragraph.`,
    });
  });

  return Array.from(
    uniqueEntities.values(),
  ).slice(0, MAX_ENTITIES);
}

function removeDuplicateRelations(
  relations: GeneratedRelation[],
  validEntityIds: Set<string>,
): GeneratedRelation[] {
  const uniqueRelations = new Map<
    string,
    GeneratedRelation
  >();

  relations.forEach((relation) => {
    const source = normalizeId(
      cleanText(relation.source),
    );

    const target = normalizeId(
      cleanText(relation.target),
    );

    const label = cleanText(
      relation.label,
    ).toLowerCase();

    if (
      !source ||
      !target ||
      !label ||
      source === target ||
      !validEntityIds.has(source) ||
      !validEntityIds.has(target)
    ) {
      return;
    }

    const relationKey =
      `${source}:${label}:${target}`;

    if (!uniqueRelations.has(relationKey)) {
      uniqueRelations.set(relationKey, {
        source,
        target,
        label,
      });
    }
  });

  return Array.from(
    uniqueRelations.values(),
  ).slice(0, MAX_RELATIONS);
}

function sanitizeGraph(
  graph: GeneratedGraph,
): GeneratedGraph {
  const rawEntities = Array.isArray(
    graph.entities,
  )
    ? graph.entities
    : [];

  const rawRelations = Array.isArray(
    graph.relations,
  )
    ? graph.relations
    : [];

  const entities =
    removeDuplicateEntities(rawEntities);

  const entityIds = new Set(
    entities.map((entity) => entity.id),
  );

  const relations =
    removeDuplicateRelations(
      rawRelations,
      entityIds,
    );

  return {
    entities,
    relations,
  };
}

function getOpenAIErrorDetails(
  error: unknown,
): {
  message: string;
  status: number;
} {
  if (error instanceof OpenAI.AuthenticationError) {
    return {
      message:
        "The OpenAI API key is invalid or has been revoked.",
      status: 401,
    };
  }

  if (error instanceof OpenAI.RateLimitError) {
    return {
      message:
        "The OpenAI API rate limit or account quota has been reached.",
      status: 429,
    };
  }

  if (error instanceof OpenAI.BadRequestError) {
    return {
      message:
        error.message ||
        "OpenAI rejected the graph-generation request.",
      status: 400,
    };
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return {
      message:
        "Could not connect to the OpenAI API.",
      status: 502,
    };
  }

  if (error instanceof OpenAI.APIError) {
    return {
      message:
        error.message ||
        "The OpenAI API request failed.",
      status:
        error.status &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : 502,
    };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : "Failed to generate the biological graph.",
    status: 500,
  };
}

export async function POST(
  request: Request,
) {
  try {
    let body: {
      text?: unknown;
    };

    try {
      body = (await request.json()) as {
        text?: unknown;
      };
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

    if (typeof body.text !== "string") {
      return NextResponse.json(
        {
          error:
            "Text must be provided as a string.",
        },
        {
          status: 400,
        },
      );
    }

    const text = body.text.trim();

    if (text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Please provide a research paragraph containing at least 20 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        {
          error:
            `The submitted text is too long. The maximum length is ${MAX_INPUT_LENGTH} characters.`,
        },
        {
          status: 400,
        },
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      console.error(
        "OPENAI_API_KEY is missing from the server environment.",
      );

      return NextResponse.json(
        {
          error:
            "AI generation is not configured. Add OPENAI_API_KEY to .env.local and restart the server.",
        },
        {
          status: 503,
        },
      );
    }

    const model =
      process.env.OPENAI_MODEL?.trim() ||
      "gpt-5-mini";

    const client = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const response =
      await client.responses.create({
        model,

        store: false,

        instructions: `
You are a computational oncology knowledge-graph extractor.

Convert the submitted scientific paragraph into a concise directed biological
knowledge graph.

Rules:

1. Extract only entities and relationships that are explicitly supported by
   the submitted paragraph.
2. Do not invent genes, proteins, pathways, drugs, mechanisms, publications,
   results or evidence.
3. Return between 2 and 12 entities.
4. Prefer the most biologically important entities.
5. Allowed entity types:
   - cell
   - protein
   - pathway
   - process
   - disease
6. Entity IDs must use lowercase kebab-case.
7. Entity labels must be short and readable.
8. Every entity description must be one concise scientific sentence.
9. Relationship labels must be short verbs or verb phrases such as:
   activates, inhibits, promotes, secretes, recruits, binds, regulates,
   remodels, supports, spreads-to or interacts-with.
10. Every relation source and target must exactly match an entity ID.
11. Do not create self-relations.
12. Preserve uncertainty when the paragraph uses uncertain language.
13. Do not return markdown or explanatory prose outside the required JSON.
`,

        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text,
              },
            ],
          },
        ],

        text: {
          format: {
            type: "json_schema",
            name: "oncology_knowledge_graph",
            description:
              "A directed biological knowledge graph extracted from an oncology research paragraph.",
            strict: true,

            schema: {
              type: "object",
              additionalProperties: false,

              properties: {
                entities: {
                  type: "array",
                  minItems: 2,
                  maxItems: MAX_ENTITIES,

                  items: {
                    type: "object",
                    additionalProperties:
                      false,

                    properties: {
                      id: {
                        type: "string",
                        minLength: 1,
                      },

                      label: {
                        type: "string",
                        minLength: 1,
                      },

                      type: {
                        type: "string",
                        enum: ALLOWED_ENTITY_TYPES,
                      },

                      description: {
                        type: "string",
                        minLength: 1,
                      },
                    },

                    required: [
                      "id",
                      "label",
                      "type",
                      "description",
                    ],
                  },
                },

                relations: {
                  type: "array",
                  maxItems: MAX_RELATIONS,

                  items: {
                    type: "object",
                    additionalProperties:
                      false,

                    properties: {
                      source: {
                        type: "string",
                        minLength: 1,
                      },

                      target: {
                        type: "string",
                        minLength: 1,
                      },

                      label: {
                        type: "string",
                        minLength: 1,
                      },
                    },

                    required: [
                      "source",
                      "target",
                      "label",
                    ],
                  },
                },
              },

              required: [
                "entities",
                "relations",
              ],
            },
          },
        },

        max_output_tokens: 3000,
      });

    const outputText =
      response.output_text?.trim();

    if (!outputText) {
      console.error(
        "OpenAI response contained no output text.",
        {
          responseId: response.id,
          status: response.status,
        },
      );

      return NextResponse.json(
        {
          error:
            "The AI returned an empty response.",
        },
        {
          status: 502,
        },
      );
    }

    let parsedGraph: GeneratedGraph;

    try {
      parsedGraph = JSON.parse(
        outputText,
      ) as GeneratedGraph;
    } catch {
      console.error(
        "Could not parse OpenAI graph JSON:",
        outputText,
      );

      return NextResponse.json(
        {
          error:
            "The AI returned an invalid graph format.",
        },
        {
          status: 502,
        },
      );
    }

    const graph =
      sanitizeGraph(parsedGraph);

    if (graph.entities.length < 2) {
      return NextResponse.json(
        {
          error:
            "The AI could not identify enough biological entities.",
        },
        {
          status: 422,
        },
      );
    }

    return NextResponse.json(
      graph,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const errorDetails =
      getOpenAIErrorDetails(error);

    console.error(
      "Generate graph API error:",
      error,
    );

    return NextResponse.json(
      {
        error: errorDetails.message,
      },
      {
        status: errorDetails.status,
      },
    );
  }
}