import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "../../lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PlatformStats = {
  users: number;
  papers: number;
  entities: number;
};

/*
  Public platform-wide aggregate stats for the marketing page.
  get_platform_stats() is SECURITY DEFINER (it reads RLS-protected
  tables), so it must not be callable with the anon key. This route
  calls it server-side with the service-role key and returns the
  plain aggregate object.
*/
export async function GET() {
  const secretKey = getSupabaseSecretKey();

  if (!secretKey) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  const supabase = createClient(
    getSupabaseUrl(),
    secretKey,
  );

  const { data, error } =
    await supabase.rpc("get_platform_stats");

  if (error) {
    return NextResponse.json(
      { error: "Failed to load platform stats." },
      { status: 500 },
    );
  }

  const row = Array.isArray(data)
    ? data[0]
    : data;

  const stats: PlatformStats = {
    users: row?.users ?? 0,
    papers: row?.papers ?? 0,
    entities: row?.entities ?? 0,
  };

  return NextResponse.json(stats);
}