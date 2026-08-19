import {
  MAX_FILE_SIZE,
  MAX_TEXT_LENGTH,
  sanitizeMindMap,
} from "../../lib/mindmapTypes";

import {
  buildAiChain,
  classifyAiFailure,
  clearTargetCooldown,
  describeTarget,
  getCachedEffectiveTarget,
  getGeminiKeys,
  getPreferredModel,
  isTargetCoolingDown,
  markTargetFailure,
  resolveEffectiveTarget,
  type AiAttempt,
  type AiTarget,
} from "../../lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta";

const ALLOWED_EXTENSIONS: Record<
  string,
  string
> = {
  pdf: "PDF",
  txt: "Text",
  md: "Markdown",
  markdown: "Markdown",
  text: "Text",
  plain: "Text",
  docx: "Word",
};

function getFileType(
  fileName: string,
): string | null {
  const extension =
    fileName
      .toLowerCase()
      .split(".")
      .pop() ?? "";

  return (
    ALLOWED_EXTENSIONS[extension] ??
    null
  );
}

function normalizePaperText(
  text: string,
): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/(\w)-\n(\w)/g, "$1$2")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractTextFromFile(
  file: File,
  fileName: string,
): Promise<{
  text: string;
  pages: number;
}> {
  const fileType = getFileType(fileName);

  if (!fileType) {
    throw new Error(
      "Unsupported file type. Upload a PDF, TXT, Markdown or DOCX file.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "The uploaded file is too large. The maximum allowed size is 25 MB.",
    );
  }

  const extension =
    fileName
      .toLowerCase()
      .split(".")
      .pop() ?? "";

  if (extension === "pdf") {
    console.info(
      "[mindmap] Parsing PDF with pdf-parse (local, no AI involved)…",
    );

    const { PDFParse } = await import(
      "pdf-parse"
    );

    const parser = new PDFParse({
      data: new Uint8Array(
        await file.arrayBuffer(),
      ),
    });

    try {
      const result =
        await parser.getText();

      return {
        text: result.pages
          .map((page) => page.text)
          .join("\n\n"),
        pages: result.pages.length,
      };
    } finally {
      await parser.destroy();
    }
  }

  if (extension === "docx") {
    console.info(
      "[mindmap] Extracting text from DOCX with mammoth…",
    );

    const mammoth = await import(
      "mammoth"
    );

    const result =
      await mammoth.extractRawText({
        buffer: Buffer.from(
          await file.arrayBuffer(),
        ),
      });

    return {
      text: result.value,
      pages: 0,
    };
  }

  console.info(
    "[mindmap] Reading plain text file…",
  );

  return {
    text: Buffer.from(
      await file.arrayBuffer(),
    ).toString("utf-8"),
    pages: 0,
  };
}

function buildPrompt(paperText: string): string {
  return `
You are an expert scientific summarizer and knowledge-mapping assistant.

A full research paper is provided below inside PAPER-START and PAPER-END
markers. Your job is to convert it into a single hierarchical MIND MAP shaped
as a SECTION-CLUSTERED TREE that is easy to scan and follow:

STRUCTURE OF THE MIND MAP
1. Root node (level 1, kind "section"): the paper title, shortened to a short
   readable label.
2. Section nodes (level 2, kind "section"): 4 to 8 major themes or sections of
   the paper (its chapter structure, or the dominant concepts if the paper is
   not sectioned). Give each a name ("section") and a one-line "description"
   that summarizes what that theme covers. Section nodes MUST NOT have a
   "quote" (leave it empty).
3. Idea nodes (level 3, kind "idea"): 3 to 6 concrete ideas, findings,
   mechanisms, methods, datasets, statistics or conclusions under each section
   node. Every idea node MUST have a "quote" and a "weight".

RULES
- "label": a short NOUN-PHRASE claim, maximum 8 words (~60 characters), never
  a full sentence. Example: "PPARγ + MEK inhibitor drives adipogenesis".
- Every idea node must include a "quote": one or more consecutive sentences
  copied EXACTLY and VERBATIM from the paper (character-for-character,
  punctuation included) that support that node. Do NOT paraphrase quotes.
  Keep quotes short but complete, up to about 220 characters.
- "section" on every node: the name of the level-2 section node it belongs to.
  The level-2 section nodes themselves carry their own name as "section".
- "weight": importance of the idea on a scale of 1 to 5 (5 = most important).
- "description": one concise sentence (max ~40 words) in your own words. For
  section nodes this is the one-line section summary.
- "id": a unique lowercase kebab-case slug.
- "level": 1 for root, 2 for sections, 3 for ideas. Do not go deeper than 3.
- A section node must have at most 6 idea children. If a theme has more ideas,
  keep the 6 most important and fold the rest into their descriptions.
- "links" connect every non-root node to its parent using the exact node ids.
- "sections": a top-level array with one entry per level-2 section node:
  { "name": ..., "summary": one-line summary }.
- Preserve numbers, percentages, genes, proteins, drugs, methods and
  uncertainty qualifiers in labels, descriptions and quotes.
- Never invent facts, quotes or findings that are not in the paper. If a
  quote is impossible to copy verbatim, use the closest exact sentence.
- Return ONLY a JSON object. No markdown, no commentary.

PAPER-START
${paperText}
PAPER-END
`;
}

function getResponseSchema() {
  return {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
      },
      summary: {
        type: "STRING",
      },
      sections: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            summary: { type: "STRING" },
          },
          required: ["name", "summary"],
        },
      },
      nodes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            label: { type: "STRING" },
            level: { type: "INTEGER" },
            kind: { type: "STRING" },
            section: { type: "STRING" },
            weight: { type: "INTEGER" },
            description: {
              type: "STRING",
            },
            quote: { type: "STRING" },
          },
          required: [
            "id",
            "label",
            "level",
            "kind",
            "description",
          ],
        },
      },
      links: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            source: { type: "STRING" },
            target: { type: "STRING" },
            label: { type: "STRING" },
          },
          required: [
            "source",
            "target",
          ],
        },
      },
    },
    required: [
      "title",
      "summary",
      "sections",
      "nodes",
      "links",
    ],
  };
}

function friendlyModelError(
  status: number,
  rawMessage: string,
): string {
  if (
    status === 401 ||
    status === 403
  ) {
    return "The Gemini API key is invalid or lacks access to this model.";
  }

  if (status === 429) {
    return "The Gemini API rate limit was reached. Try again shortly.";
  }

  if (
    rawMessage.toLowerCase().includes(
      "does not support pdf input",
    )
  ) {
    return [
      "The AI model could not read this file directly (it does not accept",
      "PDF input). The paper text was extracted locally and sent as text,",
      "but the model still rejected the request. Please try a different",
      "model configuration or contact the BioLayers team.",
    ].join(" ");
  }

  if (
    rawMessage.toLowerCase().includes(
      "no longer available",
    ) ||
    rawMessage.toLowerCase().includes(
      "not found",
    )
  ) {
    return "The requested AI model is not available for this API key.";
  }

  return rawMessage || "Gemini rejected the request.";
}

async function generateWithModel(
  model: string,
  prompt: string,
  apiKey: string,
  controller: AbortController,
): Promise<string> {
  const response = await fetch(
    `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 65_536,
          responseMimeType:
            "application/json",
          responseSchema:
            getResponseSchema(),
        },
      }),
      signal: controller.signal,
    },
  );

  if (response.ok) {
    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const outputText =
      data.candidates?.[0]?.content
        ?.parts?.[0]?.text;

    if (outputText) {
      return outputText.trim();
    }
  }

  const errorBody =
    await response.text();

  let rawMessage =
    "Gemini rejected the request.";

  try {
    const parsed = JSON.parse(
      errorBody,
    ) as {
      error?: {
        message?: string;
      };
    };

    if (parsed.error?.message) {
      rawMessage =
        parsed.error.message;
    }
  } catch {
    // Keep the generic message.
  }

  const error = new Error(
    friendlyModelError(
      response.status,
      rawMessage,
    ),
  );

  (error as Error & {
    status?: number;
    rawMessage?: string;
  }).status = response.status;

  (error as Error & {
    status?: number;
    rawMessage?: string;
  }).rawMessage = rawMessage;

  throw error;
}

async function callAiWithFallback(
  prompt: string,
  controller: AbortController,
): Promise<{
  text: string;
  target: AiTarget;
  attempts: AiAttempt[];
}> {
  const chain = buildAiChain();

  if (chain.length === 0) {
    throw new Error(
      "AI generation is not configured. Add GEMINI_API_KEY to .env.local and restart the server.",
    );
  }

  const keys = getGeminiKeys();

  const cachedTarget =
    getCachedEffectiveTarget();

  let ordered = chain;

  if (cachedTarget) {
    ordered = [
      cachedTarget,
      ...chain.filter(
        (target) =>
          target.model !==
            cachedTarget.model ||
          target.keyIndex !==
            cachedTarget.keyIndex,
      ),
    ];
  }

  const attempts: AiAttempt[] = [];
  let lastError: unknown =
    new Error("AI request failed.");

  for (const target of ordered) {
    if (
      isTargetCoolingDown(target)
    ) {
      attempts.push({
        ...target,
        outcome: "skipped",
      });
      continue;
    }

    console.info(
      `[mindmap] Calling Gemini model "${target.model}" (key ${target.keyIndex + 1})…`,
    );

    try {
      const text =
        await generateWithModel(
          target.model,
          prompt,
          keys[target.keyIndex],
          controller,
        );

      clearTargetCooldown(target);

      attempts.push({
        ...target,
        outcome: "ok",
      });

      return {
        text,
        target,
        attempts,
      };
    } catch (error) {
      lastError = error;

      const kind =
        classifyAiFailure(error);

      attempts.push({
        ...target,
        outcome: kind,
      });

      markTargetFailure(
        target,
        kind,
      );

      const details =
        error as Error;

      const remaining = ordered.filter(
        (candidate) =>
          candidate.model !==
            target.model ||
          candidate.keyIndex !==
            target.keyIndex,
      );

      const next = remaining.find(
        (candidate) =>
          !isTargetCoolingDown(
            candidate,
          ),
      );

      console.warn(
        `[mindmap] ${describeTarget(target)} failed (${kind}: ${details.message}).${next ? ` Trying ${describeTarget(next)}.` : ""}`,
      );
    }
  }

  throw lastError;
}

function jsonLine(
  value: unknown,
): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(
    JSON.stringify(value) + "\n",
  ) as Uint8Array<ArrayBuffer>;
}

export async function POST(
  request: Request,
) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return new Response(
      jsonLine({
        type: "error",
        message:
          "The request body must be multipart form data containing a file.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type":
            "application/x-ndjson",
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }

  const file = formData.get(
    "file",
  ) as File | null;

  if (!file || !(file instanceof File)) {
    return new Response(
      jsonLine({
        type: "error",
        message:
          "A file must be uploaded as the 'file' form field.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type":
            "application/x-ndjson",
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }

  const fileName =
    file.name.trim() || "paper.pdf";

  const fileType = getFileType(fileName);

  if (!fileType) {
    return new Response(
      jsonLine({
        type: "error",
        message:
          "Unsupported file type. Upload a PDF, TXT, Markdown or DOCX file.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type":
            "application/x-ndjson",
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return new Response(
      jsonLine({
        type: "error",
        message:
          "The uploaded file is too large. The maximum allowed size is 25 MB.",
      }),
      {
        status: 413,
        headers: {
          "Content-Type":
            "application/x-ndjson",
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (
        value: unknown,
      ) => {
        try {
          controller.enqueue(
            jsonLine(value),
          );
        } catch {
          // Stream already closed.
        }
      };

      const now = Date.now();

      const progress = (
        step: number,
        label: string,
        message: string,
      ) => {
        const entry = {
          type: "progress",
          step,
          label,
          message,
          ts: Date.now() - now,
        };

        console.info(
          `[mindmap] step ${step}/${label}: ${message}`,
        );

        send(entry);
      };

      try {
        progress(
          1,
          "Upload received",
          `${fileName} · ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        );

        const keys = getGeminiKeys();

        if (keys.length === 0) {
          console.error(
            "[mindmap] No Gemini API key is configured in the server environment.",
          );

          send({
            type: "error",
            message:
              "AI generation is not configured. Add GEMINI_API_KEY to .env.local and restart the server.",
          });
          return;
        }

        const effective =
          await resolveEffectiveTarget();

        if (!effective) {
          console.error(
            "[mindmap] No usable AI model found for the configured keys.",
          );

          send({
            type: "error",
            message:
              "No usable AI model is available for the configured API keys. Check the API key limits in Google AI Studio and try again later.",
          });
          return;
        }

        const {
          text: rawText,
          pages,
        } =
          await extractTextFromFile(
            file,
            fileName,
          );

        const paperText =
          normalizePaperText(rawText);

        console.info(
          `[mindmap] Extracted ${paperText.length} characters${pages > 0 ? ` from ${pages} pages` : ""}.`,
        );

        progress(
          2,
          "Text extracted",
          pages > 0
            ? `${pages} pages · ${paperText.length.toLocaleString()} characters`
            : `${paperText.length.toLocaleString()} characters`,
        );

        if (
          paperText.length < 50
        ) {
          const message = pages > 0
            ? "Not enough readable text could be extracted from this PDF. It may be a scanned or image-based document. Try a text-based PDF or run OCR first."
            : "Not enough text could be extracted from this file. It may be empty or unreadable.";

          console.warn(
            `[mindmap] ${message}`,
          );

          send({
            type: "error",
            message,
          });
          return;
        }

        if (
          paperText.length >
          MAX_TEXT_LENGTH
        ) {
          send({
            type: "error",
            message:
              "The extracted text is longer than the current processing limit of 500,000 characters. Upload a shorter paper.",
          });
          return;
        }

        progress(
          3,
          "Analyzing with Gemini",
          `Sending ${paperText.length.toLocaleString()} characters to the AI…`,
        );

        const controller =
          new AbortController();

        const timeout = setTimeout(
          () => controller.abort(),
          240_000,
        );

        const {
          text: outputText,
          target,
          attempts,
        } = await callAiWithFallback(
          buildPrompt(paperText),
          controller,
        );

        clearTimeout(timeout);

        const preferred =
          getPreferredModel();

        console.info(
          `[mindmap] Gemini response received (model: ${describeTarget(target)}).`,
        );

        const failedAttempts =
          attempts.filter(
            (attempt) =>
              attempt.outcome !==
                "ok" &&
              attempt.outcome !==
                "skipped",
          );

        progress(
          4,
          "Mind map generated",
          failedAttempts.length === 0
            ? `Model ${describeTarget(target)} returned the mind map`
            : `${failedAttempts
                .map(
                  (attempt) =>
                    `${describeTarget(attempt)} ${attempt.outcome}`,
                )
                .join(" → ")} → ${describeTarget(target)}`,
        );

        let parsedValue: unknown;

        const tryParse = (
          text: string,
        ): unknown => {
          try {
            return JSON.parse(text);
          } catch {
            return undefined;
          }
        };

        parsedValue =
          tryParse(outputText);

        if (parsedValue === undefined) {
          console.warn(
            "[mindmap] Gemini JSON was truncated or invalid. Retrying with a compactness instruction…",
          );

          progress(
            4,
            "Retrying with compact output",
            "Response was cut off — asking the model to compress quotes and labels",
          );

          const retryPrompt =
            buildPrompt(paperText) +
            "\nIMPORTANT: Your previous response was cut off or invalid. " +
            "Return ONLY a complete, valid JSON object. Keep labels to 6 words, " +
            "descriptions to one short sentence, and quotes to at most 140 characters. " +
            "Do not drop any idea from the paper.\n";

          const retry =
            await callAiWithFallback(
              retryPrompt,
              controller,
            );

          parsedValue =
            tryParse(retry.text);

          if (parsedValue === undefined) {
            console.error(
              "[mindmap] Compact retry also returned invalid JSON:",
              retry.text.slice(0, 500),
            );

            send({
              type: "error",
              message:
                "The AI returned an invalid mind map format even after a retry.",
            });
            return;
          }
        }

        const mindmap =
          sanitizeMindMap(parsedValue);

        if (!mindmap) {
          send({
            type: "error",
            message:
              "The AI could not produce a usable mind map from this paper.",
          });
          return;
        }

        console.info(
          `[mindmap] Sanitized mind map: ${mindmap.nodes.length} nodes, ${mindmap.links.length} links.`,
        );

        progress(
          5,
          "Finalizing",
          `${mindmap.nodes.length} ideas · ${mindmap.links.length} connections`,
        );

        send({
          type: "result",
          mindmap,
          extractedText: paperText,
          meta: {
            provider: "gemini",
            model: target.model,
            requestedModel:
              preferred,
            attempts: attempts.map(
              (attempt) => ({
                provider:
                  attempt.provider,
                model:
                  attempt.model,
                keyIndex:
                  attempt.keyIndex,
                outcome:
                  attempt.outcome,
              }),
            ),
            fileName,
            fileType,
            nodeCount:
              mindmap.nodes.length,
            linkCount:
              mindmap.links.length,
            characterCount:
              paperText.length,
          },
        });
      } catch (error) {
        console.error(
          "[mindmap] Pipeline error:",
          error,
        );

        const message =
          error instanceof Error &&
          error.name === "AbortError"
            ? "The AI request timed out. The paper may be too long."
            : error instanceof Error
              ? error.message
              : "Failed to generate the mind map.";

        send({
          type: "error",
          message,
        });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type":
        "application/x-ndjson",
      "Cache-Control":
        "no-store, max-age=0",
    },
  });
}