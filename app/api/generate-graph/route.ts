import OpenAI from "openai";
import { NextResponse } from "next/server";

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

const allowedEntityTypes: EntityType[] = [
  "cell",
  "protein",
  "pathway",
  "process",
  "disease",
];

function normalizeId(value: string) {
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

function removeDuplicateEntities(entities: GeneratedEntity[]) {
  const uniqueEntities = new Map<string, GeneratedEntity>();

  entities.forEach((entity) => {
    const normalizedId =
      normalizeId(entity.id || entity.label) ||
      `entity-${uniqueEntities.size + 1}`;

    if (!uniqueEntities.has(normalizedId)) {
      uniqueEntities.set(normalizedId, {
        ...entity,
        id: normalizedId,
        label: entity.label.trim(),
        description: entity.description.trim(),
      });
    }
  });

  return Array.from(uniqueEntities.values());
}

function sanitizeGraph(graph: GeneratedGraph): GeneratedGraph {
  const entities = removeDuplicateEntities(graph.entities).slice(0, 12);
  const entityIds = new Set(entities.map((entity) => entity.id));

  const relations = graph.relations
    .map((relation) => ({
      source: normalizeId(relation.source),
      target: normalizeId(relation.target),
      label: relation.label.trim().toLowerCase(),
    }))
    .filter(
      (relation) =>
        entityIds.has(relation.source) &&
        entityIds.has(relation.target) &&
        relation.source !== relation.target &&
        relation.label.length > 0,
    )
    .slice(0, 20);

  return {
    entities,
    relations,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: unknown;
    };

    if (typeof body.text !== "string") {
      return NextResponse.json(
        {
          error: "Text must be a string.",
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
          error: "Please provide a longer research paragraph.",
        },
        {
          status: 400,
        },
      );
    }

    if (text.length > 8000) {
      return NextResponse.json(
        {
          error: "The submitted text is too long.",
        },
        {
          status: 400,
        },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to .env.local before using AI generation.",
        },
        {
          status: 503,
        },
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",

      instructions: `
You are a computational oncology knowledge-graph extractor.

Your task is to convert one scientific paragraph into a concise biological
knowledge graph.

Rules:

1. Extract only entities and relationships supported by the submitted text.
2. Do not invent genes, proteins, pathways, drugs, mechanisms, or evidence.
3. Return between 2 and 12 entities.
4. Prefer the most biologically important entities.
5. Allowed entity types:
   - cell
   - protein
   - pathway
   - process
   - disease
6. Entity IDs must be lowercase kebab-case.
7. Entity labels must be short and readable.
8. Descriptions must contain one concise scientific sentence.
9. Relationship labels must be short verbs or verb phrases, such as:
   activates, inhibits, promotes, secretes, recruits, binds, regulates,
   remodels, supports, spreads-to, or interacts-with.
10. Every relation source and target must match an entity ID.
11. Do not create self-relations.
12. If the paragraph is uncertain, preserve that uncertainty instead of
    presenting speculation as fact.
`,

      input: text,

      text: {
        format: {
          type: "json_schema",
          name: "oncology_knowledge_graph",
          description:
            "Entities and directed biological relationships extracted from an oncology research paragraph.",
          strict: true,

          schema: {
            type: "object",
            additionalProperties: false,

            properties: {
              entities: {
                type: "array",
                minItems: 2,
                maxItems: 12,

                items: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    id: {
                      type: "string",
                    },

                    label: {
                      type: "string",
                    },

                    type: {
                      type: "string",
                      enum: allowedEntityTypes,
                    },

                    description: {
                      type: "string",
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
                maxItems: 20,

                items: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    source: {
                      type: "string",
                    },

                    target: {
                      type: "string",
                    },

                    label: {
                      type: "string",
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
    });

    if (!response.output_text) {
      return NextResponse.json(
        {
          error: "The AI returned an empty response.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedGraph = JSON.parse(
      response.output_text,
    ) as GeneratedGraph;

    const graph = sanitizeGraph(parsedGraph);

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

    return NextResponse.json(graph);
  } catch (error) {
    console.error("Generate graph API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate the biological graph.",
      },
      {
        status: 500,
      },
    );
  }
}