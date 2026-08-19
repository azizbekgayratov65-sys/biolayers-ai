import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type SavedPaper = {
  id: string;
  fileName: string | null;
  fileType: string | null;
  title: string | null;
  characterCount: number | null;
  createdAt: string;
};

/*
  Persists a generated mind map to the authenticated user's account.
  Ownership is derived server-side from the session; the client never
  supplies a user id.
*/
export async function savePaper(
  supabase: SupabaseClient,
  userId: string,
  input: {
    fileName: string;
    fileType: string;
    title: string;
    mindmap: unknown;
    characterCount: number;
  },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("papers")
    .insert({
      user_id: userId,
      file_name: input.fileName,
      file_type: input.fileType,
      title: input.title,
      mindmap: input.mindmap,
      character_count: input.characterCount,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error(
      "[papers] Failed to save paper:",
      error,
    );
    return null;
  }

  return data.id;
}

export async function listPapers(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavedPaper[]> {
  const { data, error } = await supabase
    .from("papers")
    .select(
      "id, file_name, file_type, title, character_count, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[papers] Failed to list papers:",
      error,
    );
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    fileName: (row.file_name as string) ?? null,
    fileType: (row.file_type as string) ?? null,
    title: (row.title as string) ?? null,
    characterCount:
      (row.character_count as number) ?? null,
    createdAt:
      (row.created_at as string) ?? "",
  }));
}

export async function deletePaper(
  supabase: SupabaseClient,
  userId: string,
  paperId: string,
): Promise<{ ok: boolean; notFound: boolean }> {
  const { error, count } = await supabase
    .from("papers")
    .delete({ count: "exact" })
    .eq("id", paperId)
    .eq("user_id", userId);

  if (error) {
    console.error(
      "[papers] Failed to delete paper:",
      error,
    );
    return { ok: false, notFound: false };
  }

  return {
    ok: true,
    notFound: (count ?? 0) === 0,
  };
}