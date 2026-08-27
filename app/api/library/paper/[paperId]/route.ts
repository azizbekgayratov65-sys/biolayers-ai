import { NextResponse } from "next/server";

import {
  createPublicClient,
} from "../../../../lib/auth/api-auth";
import { getPaperForLibrary } from "../../../../lib/papers/store";
import { libraryPaperParamsSchema } from "../../validation";
import { handleValidationError } from "../../../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/library/paper/:paperId
  Fetches a published mind map by its ID for the library view.
  RLS allows reading published rows for any caller.
*/
export async function GET(
  _request: Request,
  context: { params: Promise<{ paperId: string }> },
) {
  const { paperId } = await context.params;

  const parsed = libraryPaperParamsSchema.safeParse({ paperId });
  if (!parsed.success) {
    const { message, status: statusCode } = handleValidationError(parsed.error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const supabase = createPublicClient();
  const paper = await getPaperForLibrary(supabase, paperId);

  if (!paper) {
    return NextResponse.json(
      { error: "This mind map is not available or has been unpublished." },
      { status: 404 },
    );
  }

  return NextResponse.json({ paper });
}