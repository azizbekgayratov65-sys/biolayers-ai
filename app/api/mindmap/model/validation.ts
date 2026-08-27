import { z } from "zod";

/**
 * GET /api/mindmap/model - no input validation needed (auth-only)
 * This file exists for consistency with other routes
 */

export const mindmapModelQuerySchema = z.object({});

export type MindmapModelQuery = z.infer<typeof mindmapModelQuerySchema>;