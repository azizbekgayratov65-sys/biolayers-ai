/*
  Centralized environment variable access with validation.

  NEXT_PUBLIC_* variables are inlined into the client bundle by Next.js
  ONLY when referenced with static dot-access. Dynamic lookup
  (process.env[name]) returns undefined in the browser, so these
  accessors use explicit property reads.

  Server-only variables must be accessed from modules that import "server-only".
*/

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim();
}

function readRequiredEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(
      `${name} is missing from the environment. Add it to your environment variables.`
    );
  }
  return value;
}

function readOptionalEnv(name: string, fallback: string): string {
  return readEnv(name) ?? fallback;
}

/* Explicit accessors for NEXT_PUBLIC_* vars — enables Next.js static inlining */
function getNextPublicSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

function getNextPublicSupabasePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
}

function getNextPublicSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

function getNextPublicSiteUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim();
}

function getNextPublicEnableOpenAI(): string | undefined {
  return process.env.NEXT_PUBLIC_ENABLE_OPENAI?.trim();
}

function getNodeEnvValue(): string | undefined {
  return process.env.NODE_ENV?.trim();
}

/* ============================================================
   SUPABASE (public + server)
   ============================================================ */

export function getSupabaseUrl(): string {
  const value = getNextPublicSupabaseUrl();
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing from the environment. Add it to your environment variables."
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
    getNextPublicSupabasePublishableKey() ??
    getNextPublicSupabaseAnonKey();

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing. Add it to your environment variables."
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
  return readEnv("SUPABASE_SECRET_KEY") ?? readEnv("SUPABASE_SECRET_SERVICE_ROLE_KEY") ?? null;
}

/* ============================================================
   SITE / APP (public)
   ============================================================ */

export function getSiteUrl(): string {
  return getNextPublicSiteUrl() ?? "http://localhost:3000";
}

/* ============================================================
   GEMINI (server-only)
   ============================================================ */

export function getGeminiEncryptionKey(): string {
  return readRequiredEnv("GEMINI_ENCRYPTION_KEY");
}

export function getPreferredGeminiModel(): string {
  return readOptionalEnv("GEMINI_MODEL", "gemini-3.6-flash");
}

/* ============================================================
   OPENAI (server-only)
   ============================================================ */

export function getOpenAIApiKey(): string {
  return readRequiredEnv("OPENAI_API_KEY");
}

export function getOpenAIModel(): string {
  return readOptionalEnv("OPENAI_MODEL", "gpt-5-mini");
}

export function getOpenAICopilotModel(): string {
  return (
    readEnv("OPENAI_COPILOT_MODEL") ??
    readEnv("OPENAI_MODEL") ??
    "gpt-5-mini"
  );
}

/* ============================================================
   NCBI / PUBMED (server-only)
   ============================================================ */

export function getNcbiApiKey(): string | undefined {
  return readEnv("NCBI_API_KEY");
}

export function getNcbiTool(): string {
  return readOptionalEnv("NCBI_TOOL", "biolayers-ai");
}

export function getNcbiEmail(): string | undefined {
  return readEnv("NCBI_EMAIL");
}

/* ============================================================
   FEATURE FLAGS (public)
   ============================================================ */

export function getEnableOpenAI(): boolean {
  return getNextPublicEnableOpenAI() === "true";
}

/* ============================================================
   NODE ENV (public - used in auth callback)
   ============================================================ */

export function getNodeEnv(): string {
  return getNodeEnvValue() ?? "development";
}

export function isDevelopment(): boolean {
  return getNodeEnv() === "development";
}