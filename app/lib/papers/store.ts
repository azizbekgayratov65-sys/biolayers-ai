import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "../auth/api-auth";

export type SavedPaper = {
  id: string;
  fileName: string | null;
  fileType: string | null;
  title: string | null;
  characterCount: number | null;
  createdAt: string;
};

export type LibraryPaper = SavedPaper & {
  userId: string;
  userFullName: string | null;
  userAvatarUrl: string | null;
  username: string | null;
};

/*
  Generates a SHA-256 hash of the mindmap for deduplication.
  Runs on the server (Node.js crypto).
*/
async function generateMindmapHash(mindmap: unknown): Promise<string> {
  const crypto = await import("crypto");
  const normalized = JSON.stringify(mindmap, Object.keys(mindmap as object).sort());
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/*
  Persists a generated mind map to the authenticated user's account.
  Uses deduplication: identical mind maps share the same storage.
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
  const mindmap = input.mindmap as Record<string, unknown>;
  const nodeCount = Array.isArray(mindmap.nodes) ? mindmap.nodes.length : 0;
  const linkCount = Array.isArray(mindmap.links) ? mindmap.links.length : 0;

  // Get or create deduplicated mindmap entry
  const { data: mindmapId, error: mindmapError } = await supabase.rpc(
    "get_or_create_mindmap",
    {
      p_mindmap: input.mindmap,
      p_node_count: nodeCount,
      p_link_count: linkCount,
    },
  );

  if (mindmapError || !mindmapId) {
    console.error(
      "[papers] Failed to get/create mindmap:",
      mindmapError,
    );
    return null;
  }

  const contentHash = await generateMindmapHash(input.mindmap);

  const { data, error } = await supabase
    .from("papers")
    .insert({
      user_id: userId,
      file_name: input.fileName,
      file_type: input.fileType,
      title: input.title,
      mindmap: input.mindmap,
      mindmap_id: mindmapId,
      content_hash: contentHash,
      character_count: input.characterCount,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error(
      "[papers] Failed to save paper:",
      error,
    );
    // Rollback: decrement reference count on failure
    await supabase.rpc("release_mindmap", { p_mindmap_id: mindmapId });
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

/*
  Fetches PUBLIC papers for the collective library view with user profile info.
  Supports pagination for memory efficiency.
  Only returns papers where is_public = true.
*/
export async function listLibraryPapers(
  supabase: SupabaseClient,
  options: {
    limit?: number;
    offset?: number;
  } = {},
): Promise<LibraryPaper[]> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  // First get papers (using public client so is_public filter works)
  const { data: papers, error } = await supabase
    .from("papers")
    .select(
      `
      id,
      file_name,
      file_type,
      title,
      character_count,
      created_at,
      user_id
    `,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(
      "[papers] Failed to list library papers:",
      error,
    );
    return [];
  }

  if (!papers || papers.length === 0) {
    return [];
  }

  // Then get profiles for those user_ids using the public profiles function
  // which bypasses RLS for safe fields only
  const userIds = [...new Set(papers.map((p) => p.user_id).filter(Boolean))];
  const { data: profiles, error: profilesError } = await supabase.rpc(
    "get_public_profiles",
    { p_user_ids: userIds },
  ) as { data: Array<{ id: string; username: string | null; full_name: string | null; avatar_url: string | null }> | null; error: Error | null };

  if (profilesError) {
    console.error(
      "[papers] Failed to fetch public profiles:",
      profilesError,
    );
  }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  return papers.map((row) => {
    const profile = profileMap.get(row.user_id);
    const displayName = profile?.full_name ?? profile?.username ?? row.user_id.slice(0, 8);
    const username = profile?.username ?? row.user_id.slice(0, 8);
    return {
      id: row.id as string,
      fileName: (row.file_name as string) ?? null,
      fileType: (row.file_type as string) ?? null,
      title: (row.title as string) ?? null,
      characterCount:
        (row.character_count as number) ?? null,
      createdAt: (row.created_at as string) ?? "",
      userId: row.user_id as string,
      userFullName: displayName,
      userAvatarUrl: profile?.avatar_url ?? null,
      username,
    };
  });
}

/*
  Fetches papers for a specific user's library view.
  Supports pagination for memory efficiency.
*/
export async function listUserLibraryPapers(
  supabase: SupabaseClient,
  targetUserId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {},
): Promise<SavedPaper[]> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const { data, error } = await supabase
    .from("papers")
    .select(
      "id, file_name, file_type, title, character_count, created_at",
    )
    .eq("user_id", targetUserId)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(
      "[papers] Failed to list user library papers:",
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
    createdAt: (row.created_at as string) ?? "",
  }));
}

/*
  Gets user profile info for the library header (public version).
*/
export async function getPublicUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  username: string | null;
} | null> {
  const { data, error } = await supabase.rpc("get_public_profile", {
    p_user_id: userId,
  }) as { data: Array<{ id: string; username: string | null; full_name: string | null; avatar_url: string | null }> | null; error: Error | null };

  if (error || !data || data.length === 0) {
    return null;
  }

  return {
    id: data[0].id,
    fullName: data[0].full_name,
    avatarUrl: data[0].avatar_url,
    username: data[0].username,
  };
}

/*
  Gets public user profile by username.
*/
export async function getPublicUserProfileByUsername(
  supabase: SupabaseClient,
  username: string,
): Promise<{
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  username: string | null;
} | null> {
  // Use admin client to bypass profiles RLS (which only allows owner SELECT)
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .ilike("username", username)
    .maybeSingle();

  if (!error && data) {
    return {
      id: data.id as string,
      fullName: data.full_name as string | null,
      avatarUrl: data.avatar_url as string | null,
      username: data.username as string | null,
    };
  }

  // Fallback to provided client
  const { data: fallbackData } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .ilike("username", username)
    .maybeSingle();

  if (!fallbackData) {
    return null;
  }

  return {
    id: fallbackData.id as string,
    fullName: fallbackData.full_name as string | null,
    avatarUrl: fallbackData.avatar_url as string | null,
    username: fallbackData.username as string | null,
  };
}

/*
  Gets user profile info for the library header (includes email for own profile).
*/
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  username: string | null;
} | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, username")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id as string,
    email: data.email as string | null,
    fullName: data.full_name as string | null,
    avatarUrl: data.avatar_url as string | null,
    username: data.username as string | null,
  };
}

export async function getPaper(
  supabase: SupabaseClient,
  userId: string,
  paperId: string,
): Promise<(SavedPaper & { mindmap: unknown }) | null> {
  const { data, error } = await supabase
    .from("papers")
    .select(
      "id, file_name, file_type, title, character_count, created_at, mindmap",
    )
    .eq("id", paperId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "[papers] Failed to get paper:",
      error,
    );
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    fileName: (data.file_name as string) ?? null,
    fileType: (data.file_type as string) ?? null,
    title: (data.title as string) ?? null,
    characterCount:
      (data.character_count as number) ?? null,
    createdAt: (data.created_at as string) ?? "",
    mindmap: data.mindmap,
  };
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

export async function listPublishedPapers(
  supabase: SupabaseClient,
): Promise<SavedPaper[]> {
  const { data, error } = await supabase
    .from("papers")
    .select(
      "id, file_name, file_type, title, character_count, created_at",
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[papers] Failed to list published papers:",
      error,
    );
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    fileName: (row.file_name as string) ?? null,
    fileType: (row.file_type as string) ?? null,
    title: (row.title as string) ?? null,
    characterCount: (row.character_count as number) ?? null,
    createdAt: (row.created_at as string) ?? "",
  }));
}

export async function getPublicPaperByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<(SavedPaper & { mindmap: unknown }) | null> {
  const { data, error } = await supabase
    .from("papers")
    .select(
      "id, file_name, file_type, title, character_count, created_at, mindmap",
    )
    .eq("published", true)
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error(
      "[papers] Failed to get public paper:",
      error,
    );
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    fileName: (data.file_name as string) ?? null,
    fileType: (data.file_type as string) ?? null,
    title: (data.title as string) ?? null,
    characterCount: (data.character_count as number) ?? null,
    createdAt: (data.created_at as string) ?? "",
    mindmap: data.mindmap,
  };
}

/*
  Fetches a paper by ID for the library view.
  Only returns papers that are published (publicly accessible).
  Uses the public client which can read published papers via RLS.
*/
export async function getPaperForLibrary(
  supabase: SupabaseClient,
  paperId: string,
): Promise<(SavedPaper & { mindmap: unknown; userId: string; username: string | null }) | null> {
  const { data, error } = await supabase
    .from("papers")
    .select(
      "id, file_name, file_type, title, character_count, created_at, mindmap, user_id",
    )
    .eq("is_public", true)
    .eq("id", paperId)
    .maybeSingle();

  if (error) {
    console.error(
      "[papers] Failed to get library paper:",
      error,
    );
    return null;
  }

  if (!data) {
    return null;
  }

  // Fetch author profile using public profile function
  const { data: profile } = await supabase.rpc("get_public_profile", {
    p_user_id: data.user_id,
  }) as { data: Array<{ id: string; username: string | null; full_name: string | null; avatar_url: string | null }> | null; error: Error | null };

  return {
    id: data.id as string,
    fileName: (data.file_name as string) ?? null,
    fileType: (data.file_type as string) ?? null,
    title: (data.title as string) ?? null,
    characterCount: (data.character_count as number) ?? null,
    createdAt: (data.created_at as string) ?? "",
    mindmap: data.mindmap,
    userId: data.user_id as string,
    username: profile?.[0]?.username ?? null,
  };
}

export async function togglePublishPaper(
  supabase: SupabaseClient,
  userId: string,
  paperId: string,
): Promise<{ ok: boolean; published: boolean; shareToken?: string }> {
  const { data, error } = await supabase
    .from("papers")
    .select("published, share_token")
    .eq("id", paperId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "[papers] Failed to read paper publish state:",
      error,
    );
    return { ok: false, published: false };
  }

  const current = data?.published ?? false;
  const shareToken = data?.share_token ?? null;

  const { error: updateError } = await supabase
    .from("papers")
    .update({ published: !current })
    .eq("id", paperId)
    .eq("user_id", userId);

  if (updateError) {
    console.error(
      "[papers] Failed to update paper publish state:",
      updateError,
    );
    return { ok: false, published: current };
  }

  return { ok: true, published: !current, shareToken: shareToken ?? undefined };
}