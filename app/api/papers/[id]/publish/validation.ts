import { z } from "zod";

/**
 * POST /api/papers/:id/publish - params validation
 */
export const publishPaperParamsSchema = z.object({
  id: z.string().min(1, "A paper id is required."),
});

export type PublishPaperParams = z.infer<typeof publishPaperParamsSchema>;