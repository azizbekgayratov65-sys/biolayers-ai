export type AiProvider = "gemini";

export type AiTarget = {
  provider: AiProvider;
  model: string;
};

export type AttemptOutcome =
  | "ok"
  | "rate_limited"
  | "unavailable"
  | "timeout"
  | "error"
  | "skipped";

export type AiAttempt = AiTarget & {
  outcome: AttemptOutcome;
};

export type AiFailureKind =
  | "rate_limited"
  | "unavailable"
  | "timeout"
  | "error";

/*
  Ranked list of usable text-out models. The preferred model is
  tried first for a user's own API key; if it fails, the next
  model in the rank is attempted.
*/
export const GEMINI_MODEL_RANK = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

export const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta";

import { getPreferredGeminiModel } from "./env";

export function getPreferredModel(): string {
  return getPreferredGeminiModel();
}

export function classifyAiFailure(
  error: unknown,
): AiFailureKind {
  const details = error as Error & {
    status?: number;
    rawMessage?: string;
  };

  if (details?.name === "AbortError") {
    return "timeout";
  }

  if (
    details?.status === 429 ||
    details?.status === 403
  ) {
    return "rate_limited";
  }

  if (
    details?.status === 404 ||
    details?.rawMessage?.includes(
      "no longer available",
    ) ||
    details?.rawMessage?.includes(
      "not found",
    )
  ) {
    return "unavailable";
  }

  return "error";
}

export function describeTarget(
  target: AiTarget,
): string {
  return target.model;
}

/*
  Calls the Gemini generateContent endpoint with a single user's
  API key. Returns the trimmed output text on success or throws an
  Error carrying a `status` and `rawMessage` for classification.
*/
export async function callGeminiGenerate({
  apiKey,
  model,
  prompt,
  responseSchema,
  maxOutputTokens = 65_536,
  controller,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  responseSchema?: unknown;
  maxOutputTokens?: number;
  controller?: AbortController;
}): Promise<string> {
  const generationConfig: Record<
    string,
    unknown
  > = {
    temperature: 0.2,
    maxOutputTokens,
  };

  if (responseSchema) {
    generationConfig.responseMimeType =
      "application/json";
    generationConfig.responseSchema =
      responseSchema;
  }

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
        generationConfig,
      }),
      signal: controller?.signal,
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

  const errorBody = await response.text();

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
      rawMessage = parsed.error.message;
    }
  } catch {
    // Keep the generic message.
  }

  const error = new Error(rawMessage);

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