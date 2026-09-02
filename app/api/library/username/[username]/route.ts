import { NextResponse } from "next/server";

import {
  createPublicClient,
} from "../../../../lib/auth/api-auth";
import { listUserLibraryPapers, getPublicUserProfileByUsername } from "../../../../lib/papers/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/library/username/[username]
  Returns paginated list of papers for a specific user's public library by username.
  Public access using public client to avoid 401 on public profiles.
  Query params: limit (default 20), offset (default 0)
*/
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const supabase = createPublicClient();

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