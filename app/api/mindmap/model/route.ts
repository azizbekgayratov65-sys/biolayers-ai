import { NextResponse } from "next/server";

import {
  GEMINI_MODEL_RANK,
  getPreferredModel,
} from "../../../lib/aiModels";
import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../../lib/auth/api-auth";
import { getAiSettingsStatus } from "../../../lib/gemini/store";
import { mindmapModelQuerySchema } from "./validation";
import { handleValidationError } from "../../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/mindmap/model
  Reports whether the authenticated user has connected a Gemini API
  key and which model will be used. Never probes the model or leaks
  any key material.
*/
export async function GET(request: Request) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  // Validate query parameters (none expected, but validates empty query)
  const parsed = mindmapModelQuerySchema.safeParse({});
  if (!parsed.success) {
    const { message, status: statusCode } = handleValidationError(parsed.error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const status = await getAiSettingsStatus(
    supabase,
    userId,
  );

  const preferred =
    getPreferredModel();

  return NextResponse.json(
    {
      configured: status.configured,
      provider: "gemini",
      model: status.configured
        ? preferred
        : null,
      preferred,
      fallback:
        GEMINI_MODEL_RANK[1] ??
        GEMINI_MODEL_RANK[0],
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}