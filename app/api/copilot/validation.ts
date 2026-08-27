import { z } from "zod";

/**
 * POST /api/copilot request body
 */
const entityTypeSchema = z.enum(["cell", "protein", "pathway", "process", "disease"]);

const copilotModeSchema = z.enum(["explain", "mechanism", "hypothesis", "limitations", "simplify", "custom"]);

const copilotEntitySchema = z.object({
  id: z.string().max(100).optional(),
  label: z.string().min(1).max(200),
  type: entityTypeSchema,
  description: z.string().max(1000).optional(),
});

const copilotConnectionSchema = z.object({
  label: z.string().min(1).max(160),
  type: entityTypeSchema,
  relation: z.string().min(1).max(160),
  direction: z.enum(["incoming", "outgoing"]),
});

const copilotPaperSchema = z.object({
  pmid: z.string().min(1).max(30),
  title: z.string().min(1).max(500),
  journal: z.string().max(240).optional(),
  year: z.string().max(20).optional(),
  authors: z.array(z.string().max(120)).max(6).optional(),
  doi: z.string().max(200).nullable().optional(),
  pubmedUrl: z.string().max(500).optional(),
});

export const copilotRequestSchema = z.object({
  mode: copilotModeSchema.optional().default("custom"),
  question: z.string().max(1000).optional().default(""),
  sourceText: z.string().max(12000).optional().default(""),
  selectedEntity: copilotEntitySchema,
  connections: z.array(copilotConnectionSchema).max(30).optional().default([]),
  papers: z.array(copilotPaperSchema).max(8).optional().default([]),
});

export type CopilotRequestBody = z.infer<typeof copilotRequestSchema>;