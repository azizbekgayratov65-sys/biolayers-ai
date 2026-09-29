import masterCatalogRaw from "../../data/cell_atlas/cell_atlas_master_catalog.json";
import timeLapseSeriesRaw from "../../data/cell_atlas/time_lapse_migration_series.json";
import type { MasterCatalogRecord, TrajectoryPoint, CellAtlasFilters } from "./atlasTypes";

export const MASTER_CATALOG_RECORDS: MasterCatalogRecord[] = masterCatalogRaw as MasterCatalogRecord[];
export const FLAGSHIP_TRAJECTORY_POINTS: TrajectoryPoint[] = timeLapseSeriesRaw as TrajectoryPoint[];

export type MasterCatalogQueryResult = {
  records: MasterCatalogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    organisms: { value: string; count: number }[];
    modalities: { value: string; count: number }[];
    datasets: { value: string; count: number }[];
    tissues: { value: string; count: number }[];
    commercialCount: number;
  };
};

export function queryMasterCatalog(filters: CellAtlasFilters = {}): MasterCatalogQueryResult {
  let result = [...MASTER_CATALOG_RECORDS];

  // Text search
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.cell_line.toLowerCase().includes(q) ||
        (r.disease && r.disease.toLowerCase().includes(q)) ||
        r.tissue.toLowerCase().includes(q) ||
        r.phenotype.toLowerCase().includes(q) ||
        r.staining.toLowerCase().includes(q) ||
        r.dataset_id.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
    );
  }

  // Modality filter
  if (filters.modality && filters.modality !== "all") {
    result = result.filter((r) => r.microscopy_type === filters.modality);
  }

  // Organism filter
  if (filters.organism && filters.organism !== "all") {
    result = result.filter((r) => r.organism === filters.organism);
  }

  // Tissue filter
  if (filters.tissue && filters.tissue !== "all") {
    result = result.filter((r) => r.tissue === filters.tissue);
  }

  // Dataset filter
  if (filters.dataset && filters.dataset !== "all") {
    result = result.filter((r) => r.dataset_id.toLowerCase().includes(filters.dataset!.toLowerCase()));
  }

  // Commercial use only
  if (filters.commercialOnly) {
    result = result.filter((r) => r.commercial_use === "Permitted");
  }

  // Calculate facets from full catalog
  const organismsMap = new Map<string, number>();
  const modalitiesMap = new Map<string, number>();
  const datasetsMap = new Map<string, number>();
  const tissuesMap = new Map<string, number>();
  let commercialCount = 0;

  for (const r of MASTER_CATALOG_RECORDS) {
    organismsMap.set(r.organism, (organismsMap.get(r.organism) || 0) + 1);
    modalitiesMap.set(r.microscopy_type, (modalitiesMap.get(r.microscopy_type) || 0) + 1);
    datasetsMap.set(r.dataset_id, (datasetsMap.get(r.dataset_id) || 0) + 1);
    tissuesMap.set(r.tissue, (tissuesMap.get(r.tissue) || 0) + 1);
    if (r.commercial_use === "Permitted") commercialCount++;
  }

  const page = Math.max(0, filters.page ?? 0);
  const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 24));
  const total = result.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedRecords = result.slice(page * pageSize, (page + 1) * pageSize);

  return {
    records: paginatedRecords,
    total,
    page,
    pageSize,
    totalPages,
    facets: {
      organisms: Array.from(organismsMap.entries()).map(([value, count]) => ({ value, count })),
      modalities: Array.from(modalitiesMap.entries()).map(([value, count]) => ({ value, count })),
      datasets: Array.from(datasetsMap.entries()).map(([value, count]) => ({ value, count })),
      tissues: Array.from(tissuesMap.entries()).map(([value, count]) => ({ value, count })),
      commercialCount,
    },
  };
}

export function getMasterCatalogRecordById(id: string): MasterCatalogRecord | null {
  return MASTER_CATALOG_RECORDS.find((r) => r.image_id === id) ?? null;
}

export function getFlagshipTrajectories(): TrajectoryPoint[] {
  return FLAGSHIP_TRAJECTORY_POINTS;
}
