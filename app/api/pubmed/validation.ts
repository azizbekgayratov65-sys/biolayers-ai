import { z } from "zod";

/**
 * GET /api/pubmed query parameters
 */
export const pubmedQuerySchema = z.object({
  q: z.string().min(2, "Enter at least 2 characters.").max(500),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(30).default(20),
  sort: z.enum(["relevance", "date"]).optional().default("relevance"),
});

export type PubMedQuery = z.infer<typeof pubmedQuerySchema>;