"use client";

import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "./env";

/*
  Browser Supabase client. Uses the publishable key, so Row Level
  Security is enforced. Persists the session in cookies (managed by
  @supabase/ssr) so authentication survives navigation and refreshes.
*/
export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
}