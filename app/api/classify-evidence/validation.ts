import { z } from "zod";

/**
 * POST /api/classify-evidence request body
 */
const evidenceClassificationSchema = z.enum(["supporting", "contradicting", "contextual", "unrelated"]);
const evidenceBasisSchema = z.enum(["metadata_only", "abstract_and_metadata", "source_text_and_metadata", "source_text_abstract_and_metadata"]);

const relationshipInputSchema = z.object({
  source: z.string().min(1).max(250),
  relation: z.string().min(1).max(150),
  target: z.string().min(1).max(250),
  description: z.string().max(2000).optional(),
  sourceText: z.string().max(4000).optional(),
});

const evidencePaperSchema = z.object({
  pmid: z.string().min(1).max(30),
  title: z.string().min(1).max(600),
  abstract: z.string().max(3000).nullable().optional(),
  journal: z.string().max(250).optional(),
  year: z.string().max(20).optional(),
  authors: z.array(z.string().max(120)).max(6).optional(),
  doi: z.string().max(220).nullable().optional(),
  pubmedUrl: z.string().max(600).optional(),
});

export const classifyEvidenceRequestSchema = z.object({
  relationship: relationshipInputSchema,
  papers: z.array(evidencePaperSchema).min(1, "At least one valid PubMed candidate paper is required.").max(20),
});

export type ClassifyEvidenceRequestBody = z.infer<typeof classifyEvidenceRequestSchema>;