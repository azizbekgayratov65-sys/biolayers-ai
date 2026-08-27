import { z } from "zod";

/**
 * DELETE /api/papers/:id - params validation
 */
export const paperIdParamsSchema = z.object({
  id: z.string().min(1, "A paper id is required."),
});

export type PaperIdParams = z.infer<typeof paperIdParamsSchema>;