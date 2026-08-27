import { z } from "zod";

/**
 * GET /api/cells query parameters
 */
export const cellsQuerySchema = z.object({
  q: z.string().min(2, "Enter at least 2 characters to search cell ontologies.").max(200),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  ontology: z.enum(["cl", "clo", "all"]).optional().default("cl"),
});

export type CellsQuery = z.infer<typeof cellsQuerySchema>;