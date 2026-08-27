import { z } from "zod";

/**
 * POST /api/gemini/key request body
 */
export const geminiKeyPostSchema = z.object({
  action: z.enum(["save", "test"], {
    message: 'Provide an action of "save" or "test".',
  }),
  apiKey: z.string().trim().optional().default(""),
});

export type GeminiKeyPostBody = z.infer<typeof geminiKeyPostSchema>;