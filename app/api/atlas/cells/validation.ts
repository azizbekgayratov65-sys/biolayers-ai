import { z } from "zod";

export const atlasQuerySchema = z.object({
  search: z.string().max(200).optional().default(""),
  cellLine: z.string().max(100).optional(),
  cancerType: z.string().max(100).optional(),
  tissue: z.string().max(100).optional(),
  organism: z.string().max(100).optional(),
  modality: z
    .enum([
      "all",
      "confocal",
      "fluorescence",
      "brightfield",
      "phase_contrast",
      "two_photon",
      "electron",
      "super_resolution",
    ])
    .optional()
    .default("all"),
  phenotype: z.string().max(100).optional(),
  dataset: z.string().max(100).optional(),
  condition: z.string().max(100).optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type AtlasQuery = z.infer<typeof atlasQuerySchema>;
