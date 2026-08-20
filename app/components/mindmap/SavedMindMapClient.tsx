"use client";

import { useRouter } from "next/navigation";

import type {
  MindMapResponse,
} from "../../lib/mindmapTypes";

import MindMapDocument from "./MindMapDocument";

/*
  Client-side bridge between the server-loaded saved paper and the
  interactive MindMapDocument. The server cannot pass an onReset
  callback, so this wrapper wires "New paper" to navigate back to
  the mind map uploader.
*/
export default function SavedMindMapClient({
  response,
}: {
  response: MindMapResponse;
}) {
  const router = useRouter();

  return (
    <MindMapDocument
      response={response}
      onReset={() => router.push("/mindmap")}
    />
  );
}