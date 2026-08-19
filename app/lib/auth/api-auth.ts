import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "../supabase/env";

/*
  Creates a Supabase client bound to the incoming request's session
  cookies for use inside route handlers. Auth cookies are refreshed
  by the proxy on navigation; route handlers only need to read the
  session to authenticate the caller.
*/
export async function createApiClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: {
        flowType: "pkce",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            // Ignore — the proxy refreshes sessions.
          }
        },
      },
    },
  );
}

/*
  Authenticates the current request and returns the user id. Returns
  null when the caller is not authenticated.
*/
export async function getApiUserId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export function unauthorizedJson(): NextResponse {
  return NextResponse.json(
    { error: "Authentication required." },
    { status: 401 },
  );
}

export function forbiddenJson(
  message = "You are not allowed to perform this action.",
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 },
  );
}