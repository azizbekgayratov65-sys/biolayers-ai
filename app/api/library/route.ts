import { NextResponse } from "next/server";

import {
  createPublicClient,
} from "../../lib/auth/api-auth";
import { listLibraryPapers } from "../../lib/papers/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/library
  Returns paginated list of PUBLIC papers with user info for the library view.
  No auth required - uses public client to bypass RLS.
  Query params: limit (default 20), offset (default 0)
*/
export async function GET(request: Request) {
  const supabase = createPublicClient();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10),
    50,
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") ?? "0", 10),
    0,
  );

  const papers = await listLibraryPapers(supabase, { limit, offset });

  return NextResponse.json({ papers, limit, offset });
}