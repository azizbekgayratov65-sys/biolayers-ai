import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../../../lib/auth/api-auth";
import { listUserLibraryPapers, getPublicUserProfileByUsername } from "../../../../lib/papers/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/library/username/[username]
  Returns paginated list of papers for a specific user's library by username.
  Query params: limit (default 20), offset (default 0)
*/
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10),
    50,
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") ?? "0", 10),
    0,
  );

  // First get the profile by username to get the user ID
  const profile = await getPublicUserProfileByUsername(supabase, username);

  if (!profile) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 },
    );
  }

  const papers = await listUserLibraryPapers(supabase, profile.id, { limit, offset });

  return NextResponse.json({ papers, profile, limit, offset });
}