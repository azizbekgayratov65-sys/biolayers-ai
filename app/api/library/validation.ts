import { z } from "zod";

/**
 * GET /api/library - no input validation needed (public endpoint)
 * GET /api/library/:token - params validation
 * GET /api/library/paper/:paperId - params validation
 */

export const libraryQuerySchema = z.object({});

export const libraryTokenParamsSchema = z.object({
  token: z.string().min(1, "A share token is required."),
});

export const libraryPaperParamsSchema = z.object({
  paperId: z.string().uuid("Invalid paper ID format."),
});

export type LibraryQuery = z.infer<typeof libraryQuerySchema>;
export type LibraryTokenParams = z.infer<typeof libraryTokenParamsSchema>;
export type LibraryPaperParams = z.infer<typeof libraryPaperParamsSchema>;