import { z } from "zod";

/**
 * POST /api/mindmap request body (both JSON and multipart)
 * JSON payload: { fileName: string, text: string }
 * Multipart: file field
 */
export const mindmapJsonPayloadSchema = z.object({
  fileName: z.string().min(1).max(255),
  text: z.string().min(1),
});

export const mindmapFileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => {
      const ext = file.name.toLowerCase().split(".").pop() ?? "";
      return ["pdf", "txt", "md", "markdown", "text", "plain", "docx"].includes(ext);
    },
    "Unsupported file type. Upload a PDF, TXT, Markdown or DOCX file."
  ),
});

export type MindmapJsonPayload = z.infer<typeof mindmapJsonPayloadSchema>;