import { NextResponse } from "next/server";

import {
  createApiClient,
  getApiUserId,
  unauthorizedJson,
} from "../../../../lib/auth/api-auth";
import { listUserLibraryPapers, getUserProfile } from "../../../../lib/papers/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/library/user/[userId]
  Returns paginated list of papers for a specific user's library.
  Query params: limit (default 20), offset (default 0)
*/
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const supabase = await createApiClient();
  const userId = await getApiUserId(supabase);

  if (!userId) {
    return unauthorizedJson();
  }

  const { userId: targetUserId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10),
    50,
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") ?? "0", 10),
    0,
  );

  const [papers, profile] = await Promise.all([
    listUserLibraryPapers(supabase, targetUserId, { limit, offset }),
    getUserProfile(supabase, targetUserId),
  ]);

  if (!profile) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ papers, profile, limit, offset });
}