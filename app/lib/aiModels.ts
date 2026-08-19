export type AiProvider = "gemini";

export type AiTarget = {
  provider: AiProvider;
  model: string;
  keyIndex: number;
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
  Ranked list of usable text-out models (verified 200 on both
  keys). Models returning 404 for this account (gemini-2.5-flash,
  gemini-3-flash, gemini-2.5-flash-lite) and 0/0-quota models are
  intentionally excluded.
*/
export const GEMINI_MODEL_RANK = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta";

const PROBE_CACHE_TTL_MS = 5 * 60 * 1000;
const RATE_COOLDOWN_MS = 60_000;
const HARD_COOLDOWN_MS = 5 * 60 * 1000;

const cooldowns = new Map<string, number>();

let cached:
  | {
      at: number;
      target: AiTarget | null;
    }
  | null = null;

function targetKey(
  target: AiTarget,
): string {
  return `${target.provider}:${target.model}:${target.keyIndex}`;
}

export function getGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY?.trim(),
    process.env.GEMINI_API_KEY_2?.trim(),
  ].filter(
    (key): key is string =>
      Boolean(key),
  );
}

export function getPreferredModel(): string {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    GEMINI_MODEL_RANK[0]
  );
}

/*
  Model-outer, key-inner ordering: each model is tried on every
  API key before moving to the next model, so the best model is
  kept for as long as possible while rotating keys.
*/
export function buildAiChain(): AiTarget[] {
  const keys = getGeminiKeys();

  if (keys.length === 0) {
    return [];
  }

  const preferred =
    getPreferredModel();

  const rank = [
    preferred,
    ...GEMINI_MODEL_RANK.filter(
      (model) =>
        model !== preferred,
    ),
  ];

  const chain: AiTarget[] = [];

  for (const model of rank) {
    keys.forEach(
      (_, keyIndex) => {
        chain.push({
          provider: "gemini",
          model,
          keyIndex,
        });
      },
    );
  }

  return chain;
}

export function isTargetCoolingDown(
  target: AiTarget,
): boolean {
  const until = cooldowns.get(
    targetKey(target),
  );

  return Boolean(
    until && until > Date.now(),
  );
}

export function markTargetFailure(
  target: AiTarget,
  kind: AiFailureKind,
): void {
  const milliseconds =
    kind === "rate_limited"
      ? RATE_COOLDOWN_MS
      : HARD_COOLDOWN_MS;

  cooldowns.set(
    targetKey(target),
    Date.now() + milliseconds,
  );
}

export function clearTargetCooldown(
  target: AiTarget,
): void {
  cooldowns.delete(
    targetKey(target),
  );
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
  return `${target.model} (key ${target.keyIndex + 1})`;
}

export function getCachedEffectiveTarget(): AiTarget | null {
  if (
    cached &&
    Date.now() - cached.at <
      PROBE_CACHE_TTL_MS
  ) {
    return cached.target;
  }

  return null;
}

async function geminiResponds(
  model: string,
  apiKey: string,
): Promise<AiFailureKind | null> {
  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    15_000,
  );

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
              parts: [{ text: "OK" }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 256,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (
        response.status === 429 ||
        response.status === 403
      ) {
        return "rate_limited";
      }

      if (
        response.status === 404
      ) {
        return "unavailable";
      }

      return "error";
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    if (!data.candidates?.[0]?.content) {
      return "error";
    }

    return null;
  } catch {
    return "timeout";
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveEffectiveTarget(): Promise<AiTarget | null> {
  const cachedTarget =
    getCachedEffectiveTarget();

  if (cachedTarget) {
    return cachedTarget;
  }

  const keys = getGeminiKeys();

  if (keys.length === 0) {
    return null;
  }

  for (const target of buildAiChain()) {
    if (isTargetCoolingDown(target)) {
      continue;
    }

    const failure =
      await geminiResponds(
        target.model,
        keys[target.keyIndex],
      );

    if (failure === null) {
      cached = {
        at: Date.now(),
        target,
      };

      console.info(
        `[mindmap] Effective AI target resolved: ${describeTarget(target)}.`,
      );

      return target;
    }

    markTargetFailure(
      target,
      failure,
    );

    console.warn(
      `[mindmap] Probe failed for ${describeTarget(target)} (${failure}).`,
    );
  }

  cached = {
    at: Date.now(),
    target: null,
  };

  return null;
}