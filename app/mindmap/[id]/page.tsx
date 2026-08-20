import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "../../lib/auth/require-user";
import { getPaper } from "../../lib/papers/store";
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
  Re-opens a previously saved paper's mind map from the user's
  library. The original source text is not persisted, so the
  verbatim quotes render without in-context highlighting.
*/
export default async function SavedMindMapPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase, user } = await requireUser(
    `/mindmap/${id}`,
  );

  const paper = await getPaper(
    supabase,
    user.id,
    id,
  );

  if (!paper?.mindmap) {
    notFound();
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
    },
  };

  return <SavedMindMapClient response={response} />;
}