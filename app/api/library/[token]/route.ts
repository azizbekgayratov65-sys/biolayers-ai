import { NextResponse } from "next/server";

import {
  createPublicClient,
} from "../../../lib/auth/api-auth";
import { getPublicPaperByToken } from "../../../lib/papers/store";
import { libraryTokenParamsSchema } from "../validation";
import { handleValidationError } from "../../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/library/:token
  Fetches a published mind map by its share token.
  RLS allows reading published rows for any caller.
*/
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  const parsed = libraryTokenParamsSchema.safeParse({ token });
  if (!parsed.success) {
    const { message, status: statusCode } = handleValidationError(parsed.error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const supabase = createPublicClient();
  const paper = await getPublicPaperByToken(supabase, token);

  if (!paper) {
    return NextResponse.json(
      { error: "This mind map is not available or has been unpublished." },
      { status: 404 },
    );
  }

  return NextResponse.json({ paper });
}
