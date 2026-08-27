import { z } from "zod";

/**
 * POST /api/generate-graph request body
 */
export const generateGraphRequestSchema = z.object({
  text: z.string().min(20, "Please provide a research paragraph containing at least 20 characters.").max(8000, "The submitted text is too long. The maximum length is 8000 characters."),
});

export type GenerateGraphRequestBody = z.infer<typeof generateGraphRequestSchema>;