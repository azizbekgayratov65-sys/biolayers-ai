import { z } from "zod";

/**
 * POST /api/papers request body
 */
export const papersPostSchema = z.object({
  title: z.string().min(1).max(500),
  mindmap: z.unknown(), // Validated by sanitizeMindMap in the route
  characterCount: z.number().int().nonnegative().optional().default(0),
});

export type PapersPostBody = z.infer<typeof papersPostSchema>;