/*
  NOTE: NEXT_PUBLIC_* variables are inlined into the client bundle
  by Next.js ONLY when referenced with static dot-access. Dynamic
  lookup (process.env[name]) returns undefined in the browser, so
  these accessors use explicit property reads.
*/
function readEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Add it to your environment variables.",
    );
  }

  return value;
}

/*
  Prefer the current publishable-key name and fall back to the
  legacy anon-key name for older Supabase projects.
*/
export function getSupabasePublishableKey(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing. Add it to your environment variables.",
    );
  }

  return value;
}

/*
  Server-only trusted key. This key bypasses Row Level Security,
  so it must NEVER be used for user-facing queries. Only use it in
  genuinely trusted server-side operations.
*/
export function getSupabaseSecretKey(): string | null {
  return (
    readEnv("SUPABASE_SECRET_KEY") ||
    readEnv("SUPABASE_SECRET_SERVICE_ROLE_KEY") ||
    null
  );
}