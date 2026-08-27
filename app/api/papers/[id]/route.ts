import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../../lib/auth/api-auth";
import { paperIdParamsSchema } from "./validation";
import { handleValidationError } from "../../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  DELETE /api/papers/:id
  Deletes one of the authenticated user's saved papers. Ownership is
  enforced twice: the query filters on the session-derived user id,
  and Row Level Security blocks any cross-user access.
*/
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  const { id } = await context.params;

  const parsed = paperIdParamsSchema.safeParse({ id });
  if (!parsed.success) {
    const { message, status: statusCode } = handleValidationError(parsed.error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const { error, count } = await supabase
    .from("papers")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error(
      "[papers] Failed to delete paper:",
      error,
    );
    return NextResponse.json(
      { error: "Could not delete this paper." },
      { status: 500 },
    );
  }

  if ((count ?? 0) === 0) {
    return NextResponse.json(
      { error: "Paper not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}