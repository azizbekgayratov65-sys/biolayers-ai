import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "../../lib/auth/require-user";
import { getPaper, getPaperForLibrary } from "../../lib/papers/store";
import {
  sanitizeMindMap,
  type MindMapResponse,
} from "../../lib/mindmapTypes";
import SavedMindMapClient from "../../components/mindmap/SavedMindMapClient";

export const metadata: Metadata = {
  title: "Saved Mind Map",
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

/*
  Re-opens a previously saved paper's mind map.
  If the user owns the paper, they can view it regardless of public status.
  If the paper is public (is_public = true), anyone can view it.
  The original source text is not persisted, so the
  verbatim quotes render without in-context highlighting.
*/
export default async function SavedMindMapPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase, user } = await requireUser(
    `/mindmap/${id}`,
  );

  // First try to get the paper as the owner
  let paper = await getPaper(supabase, user.id, id);
  let authorUsername: string | null = null;
  let authorId: string | null = null;

  if (!paper?.mindmap) {
    // Not the owner, try to fetch as public paper
    const publicPaper = await getPaperForLibrary(supabase, id);
    if (!publicPaper?.mindmap) {
      notFound();
    }
    paper = publicPaper;
    authorUsername = publicPaper.username;
    authorId = publicPaper.userId;
  } else {
    // Owner viewing their own paper - fetch their profile for author info
    const { data: profile } = await supabase.rpc("get_public_profile", {
      p_user_id: user.id,
    }) as { data: Array<{ id: string; username: string | null; full_name: string | null; avatar_url: string | null }> | null; error: Error | null };
    authorUsername = profile?.[0]?.username ?? null;
    authorId = user.id;
  }

  const mindmap = sanitizeMindMap(
    paper.mindmap,
  );

  if (!mindmap) {
    notFound();
  }

  const response: MindMapResponse = {
    mindmap,
    extractedText: "",
    meta: {
      provider: "BioLayers",
      model: "saved",
      fileName:
        paper.fileName ?? "Saved paper",
      fileType:
        paper.fileType ?? "document",
      nodeCount: mindmap.nodes.length,
      linkCount: mindmap.links.length,
      characterCount:
        paper.characterCount ?? 0,
      paperId: paper.id,
      authorUsername,
      authorId,
    },
  };

  return <SavedMindMapClient response={response} />;
}