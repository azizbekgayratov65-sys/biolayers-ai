import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../../lib/auth/api-auth";
import { checkRateLimit } from "../../../lib/auth/rate-limit";
import {
  getAiSettingsStatus,
  getDecryptedGeminiKey,
  removeGeminiKey,
  saveGeminiKey,
} from "../../../lib/gemini/store";
import {
  looksLikeGeminiKey,
  validateGeminiKey,
} from "../../../lib/gemini/validation";
import { geminiKeyPostSchema } from "./validation";
import { handleValidationError } from "../../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(
  message: string,
  status = 400,
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status },
  );
}

/*
  GET /api/gemini/key
  Returns the user's Gemini connection status. Never returns the
  raw key — only a masked suffix.
*/
export async function GET() {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  const status = await getAiSettingsStatus(
    supabase,
    userId,
  );

  return NextResponse.json(
    {
      configured: status.configured,
      provider: status.provider,
      keyMasked: status.keyMasked,
      keyUpdatedAt: status.keyUpdatedAt,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

type KeyRequest = {
  action?: unknown;
  apiKey?: unknown;
};

/*
  POST /api/gemini/key
  action: "save" — validate and store a new API key.
  action: "test" — validate a provided key, or the stored key.
*/
export async function POST(request: Request) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("The request body must contain valid JSON.");
  }

  const parsed = geminiKeyPostSchema.safeParse(body);
  if (!parsed.success) {
    const { message, status } = handleValidationError(parsed.error);
    return jsonError(message, status);
  }

  const { action, apiKey: rawKey } = parsed.data;

  const rateLimitKey = `gemini-key:${userId}:${action}`;

  const rateLimit = checkRateLimit(
    rateLimitKey,
    10,
    10 * 60 * 1000,
  );

  if (!rateLimit.allowed) {
    return jsonError(
      "Too many attempts. Please wait a minute and try again.",
      429,
    );
  }

  if (action === "save") {
    if (!rawKey) {
      return jsonError(
        "Paste your Gemini API key before saving.",
      );
    }

    if (!looksLikeGeminiKey(rawKey)) {
      return jsonError(
        "That does not look like a valid Gemini API key. Copy the full key from Google AI Studio and try again.",
      );
    }

    const validation =
      await validateGeminiKey(rawKey);

    if (!validation.ok) {
      return jsonError(
        validation.reason,
      );
    }

    try {
      await saveGeminiKey(
        supabase,
        userId,
        rawKey,
      );
    } catch (error) {
      console.error(
        "[gemini/key] Failed to save key:",
        error,
      );
      return jsonError(
        "Could not save your Gemini API key. Please try again.",
        500,
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "Gemini API key connected.",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  // action === "test"
  if (rawKey) {
    if (!looksLikeGeminiKey(rawKey)) {
      return jsonError(
        "That does not look like a valid Gemini API key.",
      );
    }

    const validation =
      await validateGeminiKey(rawKey);

    if (!validation.ok) {
      return jsonError(validation.reason);
    }

    return NextResponse.json({
      ok: true,
      message:
        "Your Gemini API key works.",
    });
  }

  // Test the stored key.
  const storedKey =
    await getDecryptedGeminiKey(
      supabase,
      userId,
    );

  if (!storedKey) {
    return jsonError(
      "No Gemini API key is saved for your account. Save one first.",
      404,
    );
  }

  const validation =
    await validateGeminiKey(storedKey);

  if (!validation.ok) {
    return jsonError(validation.reason);
  }

  return NextResponse.json({
    ok: true,
    message:
      "Your saved Gemini API key works.",
  });
}

/*
  DELETE /api/gemini/key
  Securely removes the user's stored Gemini API key.
*/
export async function DELETE() {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  try {
    await removeGeminiKey(
      supabase,
      userId,
    );
  } catch (error) {
    console.error(
      "[gemini/key] Failed to remove key:",
      error,
    );
    return jsonError(
      "Could not remove your Gemini API key. Please try again.",
      500,
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "Gemini API key removed.",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}