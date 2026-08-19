import "server-only";

import {
  GEMINI_BASE,
  GEMINI_MODEL_RANK,
  getPreferredModel,
} from "../aiModels";

const MIN_KEY_LENGTH = 20;
const MAX_KEY_LENGTH = 500;

/*
  Cheap format check before any network call. Gemini API keys are
  opaque strings; this only rejects obviously malformed input (too
  short, too long, whitespace inside, or garbage). The actual
  validity is confirmed against the API in validateGeminiKey.
*/
export function looksLikeGeminiKey(
  value: string,
): boolean {
  const trimmed = value.trim();

  if (
    trimmed.length < MIN_KEY_LENGTH ||
    trimmed.length > MAX_KEY_LENGTH
  ) {
    return false;
  }

  if (/\s/.test(trimmed)) {
    return false;
  }

  if (/^AIza[A-Za-z0-9_\-]{35}$/.test(trimmed)) {
    return true;
  }

  if (/^AQ\.[A-Za-z0-9_\-\.]+$/.test(trimmed)) {
    return true;
  }

  return /^[A-Za-z0-9_\-\.+=\/]{20,}$/.test(
    trimmed,
  );
}

export type KeyValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/*
  Verifies a Gemini API key before it is stored.

  First it calls the models list endpoint, which authenticates the key
  itself without depending on any specific model being available. If
  that endpoint is unavailable for another reason, it falls back to
  one minimal generateContent request per ranked model (a single token
  of input, capped output) and accepts the key as soon as any model
  responds. A valid key is therefore never rejected merely because a
  particular model name is not enabled on the user's account.
*/
export async function validateGeminiKey(
  apiKey: string,
): Promise<KeyValidationResult> {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    15_000,
  );

  try {
    // 1) The models list endpoint verifies the key itself without
    //    depending on any specific model being available. A valid
    //    key returns 200 with the model list; an invalid key is
    //    rejected with a 4xx + "API key not valid".
    const listResponse = await fetch(
      `${GEMINI_BASE}/models?pageSize=1`,
      {
        method: "GET",
        headers: {
          "X-goog-api-key": apiKey,
        },
        signal: controller.signal,
      },
    );

    const listBody =
      await listResponse.text();

    if (listResponse.ok) {
      return { ok: true };
    }

    if (
      /apiKeyInvalid|API key not valid|API_KEY_INVALID/i.test(
        listBody,
      )
    ) {
      return {
        ok: false,
        reason:
          "This does not look like a valid Gemini API key.",
      };
    }

    if (listResponse.status === 401) {
      return {
        ok: false,
        reason:
          "This Gemini API key is invalid or has been revoked.",
      };
    }

    if (listResponse.status === 403) {
      return {
        ok: false,
        reason:
          "Google rejected this API key. Check its permissions in Google AI Studio.",
      };
    }

    if (listResponse.status === 429) {
      return {
        ok: false,
        reason:
          "This Gemini API key is temporarily rate limited. Try again in a minute.",
      };
    }

    // 2) Fall back to probing ranked models. This confirms the key
    //    when the list endpoint is unavailable for another reason
    //    (e.g. API version differences) and accepts the key as soon
    //    as any ranked model responds.
    const preferred =
      getPreferredModel();

    const rank = [
      preferred,
      ...GEMINI_MODEL_RANK.filter(
        (model) => model !== preferred,
      ),
    ];

    let lastFailure: KeyValidationResult = {
      ok: false,
      reason: `Google returned an error for every available model. Try again shortly.`,
    };

    for (const model of rank) {
      try {
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
                  parts: [
                    { text: "Reply with OK." },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 8,
              },
            }),
            signal: controller.signal,
          },
        );

        if (response.ok) {
          const data =
            (await response.json()) as {
              candidates?: Array<{
                content?: {
                  parts?: Array<{
                    text?: string;
                  }>;
                };
              }>;
            };

          const text =
            data.candidates?.[0]
              ?.content?.parts?.[0]
              ?.text;

          if (
            typeof text === "string" &&
            text.trim().length > 0
          ) {
            return { ok: true };
          }

          return {
            ok: false,
            reason:
              "The API key responded, but returned an empty result. Try a different key.",
          };
        }

        const errorBody =
          await response.text();

        if (
          /apiKeyInvalid|API key not valid|API_KEY_INVALID/i.test(
            errorBody,
          )
        ) {
          return {
            ok: false,
            reason:
              "This does not look like a valid Gemini API key.",
          };
        }

        if (response.status === 401) {
          return {
            ok: false,
            reason:
              "This Gemini API key is invalid or has been revoked.",
          };
        }

        if (response.status === 403) {
          return {
            ok: false,
            reason:
              "Google rejected this API key. Check its permissions in Google AI Studio.",
          };
        }

        if (response.status === 429) {
          return {
            ok: false,
            reason:
              "This Gemini API key is temporarily rate limited. Try again in a minute.",
          };
        }

        // A 400 or 404 usually means the model name is unavailable
        // to this key/account. Record the failure and continue with
        // the next model in the rank before giving up.
        lastFailure = {
          ok: false,
          reason:
            response.status === 400
              ? "Google rejected the API key. Copy it again from Google AI Studio and retry."
              : `Model "${model}" is not available for this API key (HTTP ${response.status}).`,
        };
      } catch {
        // Aborted or network failure on this model — try the next.
      }
    }

    return lastFailure;
  } finally {
    clearTimeout(timeout);
  }
}