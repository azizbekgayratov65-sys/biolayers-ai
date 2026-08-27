import { z } from "zod";

/**
 * GET /api/platform-stats - no input validation needed (public endpoint)
 * This file exists for consistency with other routes
 */

export const platformStatsQuerySchema = z.object({});

export type PlatformStatsQuery = z.infer<typeof platformStatsQuerySchema>;