import { NextResponse } from "next/server";

import { cellsQuerySchema } from "./validation";
import { handleValidationError } from "../../lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OlsSelectDocument = {
  iri?: string;
  ontology_name?: string;
  ontology_prefix?: string;
  short_form?: string;
  obo_id?: string;
  label?: string;
  description?: string[];
  synonym?: string[];
  type?: string;
  is_obsolete?: boolean;
};

type OlsSelectResponse = {
  response?: {
    numFound?: number;
    start?: number;
    docs?: OlsSelectDocument[];
  };
};

type CellOntologyTerm = {
  id: string;
  iri: string;
  label: string;
  description: string;
  synonyms: string[];
  ontology: "cl" | "clo";
  ontologyLabel:
    | "Cell Ontology"
    | "Cell Line Ontology";
};

const OLS_SELECT_URL =
  "https://www.ebi.ac.uk/ols4/api/select";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const REQUEST_TIMEOUT_MS = 8_000;

/*
  Local fallback terms keep Cell Atlas usable when the
  EMBL-EBI service is slow, blocked, or temporarily unavailable.

  These records are intentionally concise and are marked by their
  standard CL identifiers. The remote OLS response is still preferred.
*/
const LOCAL_CELL_TERMS: CellOntologyTerm[] = [
  {
    id: "CL:0000057",
    iri: "http://purl.obolibrary.org/obo/CL_0000057",
    label: "fibroblast",
    description:
      "A connective tissue cell that synthesizes extracellular matrix components.",
    synonyms: [
      "fibrocyte",
      "connective tissue fibroblast",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0002551",
    iri: "http://purl.obolibrary.org/obo/CL_0002551",
    label: "fibroblast of bone marrow",
    description:
      "A fibroblast associated with bone marrow stromal tissue.",
    synonyms: [
      "bone marrow fibroblast",
      "marrow stromal fibroblast",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000235",
    iri: "http://purl.obolibrary.org/obo/CL_0000235",
    label: "macrophage",
    description:
      "A phagocytic mononuclear cell involved in innate immunity, tissue repair, and inflammatory regulation.",
    synonyms: [
      "histiocyte",
      "tissue macrophage",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000084",
    iri: "http://purl.obolibrary.org/obo/CL_0000084",
    label: "T cell",
    description:
      "A lymphocyte that expresses a T-cell receptor and participates in adaptive immune responses.",
    synonyms: [
      "T lymphocyte",
      "T-cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000624",
    iri: "http://purl.obolibrary.org/obo/CL_0000624",
    label: "CD4-positive, alpha-beta T cell",
    description:
      "An alpha-beta T cell that expresses the CD4 coreceptor.",
    synonyms: [
      "CD4 T cell",
      "helper T lymphocyte",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000625",
    iri: "http://purl.obolibrary.org/obo/CL_0000625",
    label: "CD8-positive, alpha-beta T cell",
    description:
      "An alpha-beta T cell that expresses the CD8 coreceptor.",
    synonyms: [
      "CD8 T cell",
      "cytotoxic T lymphocyte",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000115",
    iri: "http://purl.obolibrary.org/obo/CL_0000115",
    label: "endothelial cell",
    description:
      "A cell that lines the interior surface of blood vessels or lymphatic vessels.",
    synonyms: [
      "vascular endothelial cell",
      "endotheliocyte",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000062",
    iri: "http://purl.obolibrary.org/obo/CL_0000062",
    label: "osteoblast",
    description:
      "A bone-forming cell that produces osteoid and supports mineralization.",
    synonyms: [
      "bone-forming cell",
      "osteogenic cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000092",
    iri: "http://purl.obolibrary.org/obo/CL_0000092",
    label: "osteoclast",
    description:
      "A multinucleated cell specialized for bone resorption.",
    synonyms: [
      "bone-resorbing cell",
      "osteoclast cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000066",
    iri: "http://purl.obolibrary.org/obo/CL_0000066",
    label: "epithelial cell",
    description:
      "A cell that is part of an epithelium and contributes to barrier, absorptive, secretory, or glandular functions.",
    synonyms: [
      "epitheliocyte",
      "epithelial tissue cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000034",
    iri: "http://purl.obolibrary.org/obo/CL_0000034",
    label: "stem cell",
    description:
      "A relatively undifferentiated cell capable of self-renewal and differentiation.",
    synonyms: [
      "tissue stem cell",
      "self-renewing cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000775",
    iri: "http://purl.obolibrary.org/obo/CL_0000775",
    label: "neutrophil",
    description:
      "A granulocyte specialized for rapid innate immune responses and microbial killing.",
    synonyms: [
      "neutrophilic granulocyte",
      "polymorphonuclear neutrophil",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000786",
    iri: "http://purl.obolibrary.org/obo/CL_0000786",
    label: "plasma cell",
    description:
      "A terminally differentiated B-lineage cell specialized for antibody secretion.",
    synonyms: [
      "plasmacyte",
      "antibody-secreting cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
  {
    id: "CL:0000542",
    iri: "http://purl.obolibrary.org/obo/CL_0000542",
    label: "lymphocyte",
    description:
      "A leukocyte involved in adaptive or innate immune recognition.",
    synonyms: [
      "lymphoid cell",
      "lymphocytic cell",
    ],
    ontology: "cl",
    ontologyLabel: "Cell Ontology",
  },
];

function parseInteger(
  value: string | null,
  fallback: number,
): number {
  const parsed = Number.parseInt(
    value ?? "",
    10,
  );

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function normalizeSearchText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getLocalMatches(
  query: string,
  page: number,
  pageSize: number,
): {
  total: number;
  terms: CellOntologyTerm[];
} {
  const normalizedQuery =
    normalizeSearchText(query);

  const matches = LOCAL_CELL_TERMS.filter(
    (term) => {
      const searchable = [
        term.label,
        term.description,
        ...term.synonyms,
      ]
        .map(normalizeSearchText)
        .join(" ");

      return searchable.includes(
        normalizedQuery,
      );
    },
  );

  const start = page * pageSize;

  return {
    total: matches.length,
    terms: matches.slice(
      start,
      start + pageSize,
    ),
  };
}

function firstText(
  value?: string[],
): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return (
    value
      .map((item) => item.trim())
      .find(Boolean) ?? ""
  );
}

function uniqueTexts(
  value?: string[],
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 10);
}

function mapOlsDocuments(
  documents: OlsSelectDocument[],
): CellOntologyTerm[] {
  const terms: CellOntologyTerm[] = [];

  for (const document of documents) {
    if (
      document.is_obsolete ||
      !document.iri ||
      !document.label
    ) {
      continue;
    }

    const ontologyName =
      document.ontology_name
        ?.trim()
        .toLowerCase();

    const ontologyPrefix =
      document.ontology_prefix
        ?.trim()
        .toLowerCase();

    const isCellLine =
      ontologyName === "clo" ||
      ontologyPrefix === "clo";

    terms.push({
      id:
        document.obo_id?.trim() ||
        document.short_form?.trim() ||
        document.iri,
      iri: document.iri,
      label: document.label.trim(),
      description: firstText(
        document.description,
      ),
      synonyms: uniqueTexts(
        document.synonym,
      ),
      ontology: isCellLine
        ? "clo"
        : "cl",
      ontologyLabel: isCellLine
        ? "Cell Line Ontology"
        : "Cell Ontology",
    });
  }

  return terms;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const queryParams = {
      q: requestUrl.searchParams.get("q") ?? "",
      page: requestUrl.searchParams.get("page") ?? "0",
      pageSize: requestUrl.searchParams.get("pageSize") ?? "20",
      ontology: requestUrl.searchParams.get("ontology") ?? "cl",
    };

    const parsed = cellsQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      const { message, status } = handleValidationError(parsed.error);
      return NextResponse.json({ error: message }, { status });
    }

    const { q: query, page, pageSize, ontology } = parsed.data;

    const ontologyValue =
      ontology === "clo"
        ? "clo"
        : ontology === "all"
          ? "cl,clo"
          : "cl";

    const localResult =
      getLocalMatches(
        query,
        page,
        pageSize,
      );

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    /*
      /api/select is optimized by OLS for selecting ontology terms
      and is typically faster than the full /api/search endpoint.
    */
    const params = new URLSearchParams({
      q: query,
      ontology,
      type: "class",
      rows: String(pageSize),
      start: String(page),
      local: "true",
      obsoletes: "false",
      fieldList:
        "iri,label,short_form,obo_id,ontology_name,ontology_prefix,description,synonym,type,is_obsolete",
    });

    try {
      const response = await fetch(
        `${OLS_SELECT_URL}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "BioLayers-AI/1.0",
          },
          cache: "no-store",
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`OLS returned status ${response.status}.`);
      }

      const raw = await response.text();
      const data = JSON.parse(raw) as OlsSelectResponse;

      const remoteTerms = mapOlsDocuments(data.response?.docs ?? []);
      const remoteTotal = data.response?.numFound ?? 0;

      if (remoteTerms.length === 0 && localResult.terms.length > 0) {
        return NextResponse.json({
          query,
          ontology,
          page,
          pageSize,
          total: localResult.total,
          hasMore: (page + 1) * pageSize < localResult.total,
          source: "local-fallback",
          warning:
            "The remote ontology service returned no records, so BioLayers used its local verified cell catalog.",
          terms: localResult.terms,
        });
      }

      return NextResponse.json({
        query,
        ontology,
        page,
        pageSize,
        total: remoteTotal,
        hasMore: (page + 1) * pageSize < remoteTotal,
        source: "ols",
        terms: remoteTerms,
      });
    } catch (error) {
      console.warn("OLS unavailable; using local Cell Atlas fallback:", error);

      return NextResponse.json({
        query,
        ontology,
        page,
        pageSize,
        total: localResult.total,
        hasMore: (page + 1) * pageSize < localResult.total,
        source: "local-fallback",
        warning:
          error instanceof Error && error.name === "AbortError"
            ? "The remote ontology service timed out. BioLayers used its local verified cell catalog."
            : "The remote ontology service was unavailable. BioLayers used its local verified cell catalog.",
        terms: localResult.terms,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Cell search error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while searching cell ontologies." },
      { status: 500 }
    );
  }
}