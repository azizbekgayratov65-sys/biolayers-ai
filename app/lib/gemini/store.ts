import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  decryptApiKey,
  encryptApiKey,
  maskApiKey,
} from "./crypto";

/*
  Stores a user's Gemini API key. The key is encrypted with
  AES-256-GCM before it touches the database; only a masked
  display helper (e.g. "••••••••••••••••ABCD") is stored in
  plaintext alongside it.
*/
export async function saveGeminiKey(
  supabase: SupabaseClient,
  userId: string,
  apiKey: string,
): Promise<void> {
  const encrypted = encryptApiKey(apiKey);
  const masked = maskApiKey(apiKey);

  const { error } = await supabase
    .from("user_ai_settings")
    .upsert(
      {
        user_id: userId,
        provider: "gemini",
        encrypted_api_key: encrypted,
        key_masked: masked,
        key_updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    throw new Error(
      "Could not save your Gemini API key. Please try again.",
    );
  }
}

export async function removeGeminiKey(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_ai_settings")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      "Could not remove your Gemini API key. Please try again.",
    );
  }
}

export async function getDecryptedGeminiKey(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_ai_settings")
    .select("encrypted_api_key, key_masked")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.encrypted_api_key) {
    return null;
  }

  try {
    return decryptApiKey(
      data.encrypted_api_key,
    );
  } catch {
    // Corrupt or unreadable payload — treat as not configured.
    return null;
  }
}

export async function getAiSettingsStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  configured: boolean;
  provider: string | null;
  keyMasked: string | null;
  keyUpdatedAt: string | null;
}> {
  const { data } = await supabase
    .from("user_ai_settings")
    .select(
      "provider, key_masked, key_updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  return {
    configured: Boolean(data?.key_masked),
    provider: data?.provider ?? null,
    keyMasked: data?.key_masked ?? null,
    keyUpdatedAt: data?.key_updated_at ?? null,
  };
}