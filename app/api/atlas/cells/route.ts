import { NextResponse } from "next/server";
import { atlasQuerySchema } from "./validation";
import { handleValidationError } from "../../../lib/validation/schemas";
import { queryCellAtlas } from "../../../lib/atlasSeedData";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? "",
      cellLine: url.searchParams.get("cellLine") || undefined,
      cancerType: url.searchParams.get("cancerType") || undefined,
      tissue: url.searchParams.get("tissue") || undefined,
      organism: url.searchParams.get("organism") || undefined,
      modality: url.searchParams.get("modality") || "all",
      phenotype: url.searchParams.get("phenotype") || undefined,
      dataset: url.searchParams.get("dataset") || undefined,
      condition: url.searchParams.get("condition") || undefined,
      page: url.searchParams.get("page") ?? "0",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const parsed = atlasQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      const { message, status } = handleValidationError(parsed.error);
      return NextResponse.json({ error: message }, { status });
    }

    const filters = parsed.data;

    // Try Supabase first
    try {
      const supabase = await createClient();
      let query = supabase
        .from("microscopy_images")
        .select(`
          *,
          cell_type:cell_types(*),
          channels:image_channels(*)
        `);

      if (filters.modality && filters.modality !== "all") {
        query = query.eq("microscopy_modality", filters.modality);
      }
      if (filters.cellLine) {
        query = query.ilike("cell_line", `%${filters.cellLine}%`);
      }
      if (filters.organism) {
        query = query.ilike("organism", `%${filters.organism}%`);
      }
      if (filters.tissue) {
        query = query.ilike("tissue", `%${filters.tissue}%`);
      }

      const { data: dbData, error: dbError } = await query;

      if (!dbError && dbData && dbData.length > 0) {
        return NextResponse.json({
          source: "supabase",
          total: dbData.length,
          entries: dbData,
        });
      }
    } catch {
      // Fallback to verified local seed catalog if remote database table is not yet migrated
    }

    // Fallback to verified seed catalog
    const localResult = queryCellAtlas(filters);

    return NextResponse.json({
      source: "verified-seed-catalog",
      total: localResult.total,
      entries: localResult.entries,
    });
  } catch (error) {
    console.error("Cell Atlas API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while retrieving Cell Atlas records." },
      { status: 500 }
    );
  }
}
