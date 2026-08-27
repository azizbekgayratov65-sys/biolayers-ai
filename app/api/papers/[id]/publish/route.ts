import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../../../lib/auth/api-auth";
import { togglePublishPaper } from "../../../../lib/papers/store";
import { publishPaperParamsSchema } from "./validation";
import { handleValidationError } from "../../../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  POST /api/papers/:id/publish
  Toggles the public visibility of a mind map.
  Returns { published, shareToken }.
*/
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  const { id } = await context.params;

  const parsed = publishPaperParamsSchema.safeParse({ id });
  if (!parsed.success) {
    const { message, status: statusCode } = handleValidationError(parsed.error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const result = await togglePublishPaper(
    supabase,
    userId,
    id,
  );

  if (!result.shareToken) {
    return NextResponse.json(
      { error: "Could not toggle publish status." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    published: result.published,
    shareToken: result.shareToken,
    shareUrl: result.published
      ? `/library/${result.shareToken}`
      : null,
  });
}
