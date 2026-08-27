import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../lib/auth/api-auth";
import { savePaper } from "../../lib/papers/store";
import { papersPostSchema } from "./validation";
import { handleValidationError } from "../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  POST /api/papers
  Saves a mind map from the explore workspace to the user's account.
  Body: { title, mindmap, characterCount }
  Returns: { id } on success.
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
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = papersPostSchema.safeParse(body);
  if (!parsed.success) {
    const { message, status: statusCode } = handleValidationError(parsed.error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const { title, mindmap, characterCount } = parsed.data;

  const id = await savePaper(supabase, userId, {
    fileName: title,
    fileType: "Mind Map",
    title,
    mindmap,
    characterCount: characterCount ?? 0,
  });

  if (!id) {
    return NextResponse.json(
      { error: "Could not save paper." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id });
}
