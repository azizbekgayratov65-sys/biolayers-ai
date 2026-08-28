/* =========================================================
   CAPACITY
   ========================================================= */

export const MAX_FILE_SIZE =
  25 * 1024 * 1024;

export const MAX_TEXT_LENGTH = 500_000;

/* =========================================================
   MIND MAP NODE
   ========================================================= */

export type MindMapNode = {
  id: string;

  /*
    Short, readable label for the node (root = paper title).
  */
  label: string;

  /*
    Hierarchy depth. 1 = root, 2 = section headers, 3 = ideas.
  */
  level: number;

  /*
    "section" = level-2 theme header (has a summary, no quote).
    "idea" = concrete finding under a section (has a verbatim quote).
  */
  kind: "section" | "idea";

  /*
    Name of the section this node belongs to (color key).
  */
  section?: string;

  /*
    Importance 1-5 (5 = most important); drives node emphasis.
  */
  weight?: number;

  /*
    One concise sentence describing what this node covers.
    For section nodes this doubles as the one-line section summary.
  */
  description: string;

  /*
    Verbatim excerpt copied from the paper that supports this node.
    Required on idea nodes; empty on section nodes.
  */
  quote: string;
};

/* =========================================================
   MIND MAP LINK
   ========================================================= */

export type MindMapLink = {
  source: string;
  target: string;
  label?: string;
};

/* =========================================================
   MIND MAP
   ========================================================= */

export type MindMapSection = {
  name: string;
  summary: string;
};

export type MindMap = {
  title: string;

  summary: string;

  sections: MindMapSection[];

  nodes: MindMapNode[];

  links: MindMapLink[];
};

/* =========================================================
   API RESPONSE
   ========================================================= */

export type MindMapResponse = {
  mindmap: MindMap;

  /*
    Full extracted paper text, returned so the client can
    locate each node's quote and highlight it in context.
  */
  extractedText: string;

  meta: {
    provider: string;
    model: string;

    /*
      The model that was asked for before any fallback.
    */
    requestedModel?: string;

    /*
      Every (provider, model, key) attempt and its outcome.
    */
    attempts?: Array<{
      provider: string;
      model: string;
      keyIndex: number;
      outcome: string;
    }>;

    fileName: string;
    fileType: string;
    nodeCount: number;
    linkCount: number;
    characterCount: number;

    /*
      Id of the saved paper row in the authenticated user's library
      (present when the paper was persisted server-side).
    */
    paperId?: string | null;

    /*
      Author's username (when viewing a public paper from library).
    */
    authorUsername?: string | null;

    /*
      Author's user ID (when viewing a public paper from library).
    */
    authorId?: string | null;
  };

  error?: string;
};

/* =========================================================
   SANITIZATION
   ========================================================= */

function cleanText(
  value: unknown,
  fallback = "",
  maxLength: number,
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .slice(0, maxLength);
}

function normalizeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function safeLevel(value: unknown): number {
  if (typeof value !== "number") {
    return 2;
  }

  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.min(
    Math.max(Math.round(value), 1),
    6,
  );
}

function safeWeight(value: unknown): number {
  if (typeof value !== "number") {
    return 3;
  }

  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(
    Math.max(Math.round(value), 1),
    5,
  );
}

function sanitizeNode(
  value: unknown,
  index: number,
): MindMapNode | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<
    string,
    unknown
  >;

  const label = cleanText(
    item.label,
    "",
    120,
  );

  if (!label) {
    return null;
  }

  const id =
    normalizeId(
      cleanText(item.id, "", 80),
    ) || `node-${index + 1}`;

  const kind =
    item.kind === "section"
      ? "section"
      : "idea";

  const quote = cleanText(
    item.quote,
    "",
    400,
  );

  if (kind === "idea" && quote.length < 20) {
    return null;
  }

  return {
    id,
    label,
    level: safeLevel(item.level),
    kind,
    section: cleanText(
      item.section,
      "",
      60,
    ) || undefined,
    weight: safeWeight(item.weight),
    description: cleanText(
      item.description,
      "",
      300,
    ),
    quote,
  };
}

function sanitizeLink(
  value: unknown,
  validIds: Set<string>,
): MindMapLink | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<
    string,
    unknown
  >;

  const source = normalizeId(
    cleanText(item.source, "", 80),
  );

  const target = normalizeId(
    cleanText(item.target, "", 80),
  );

  if (
    !source ||
    !target ||
    source === target ||
    !validIds.has(source) ||
    !validIds.has(target)
  ) {
    return null;
  }

  return {
    source,
    target,
    label: cleanText(
      item.label,
      "",
      80,
    ) || undefined,
  };
}

export function sanitizeMindMap(
  value: unknown,
): MindMap | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<
    string,
    unknown
  >;

  const title = cleanText(
    raw.title,
    "",
    200,
  );

  if (!title) {
    return null;
  }

  const rawNodes = Array.isArray(
    raw.nodes,
  )
    ? raw.nodes
    : [];

  const nodes: MindMapNode[] = [];
  const seenIds = new Set<string>();

  rawNodes.forEach((rawNode, index) => {
    const node = sanitizeNode(
      rawNode,
      index,
    );

    if (!node) {
      return;
    }

    if (seenIds.has(node.id)) {
      return;
    }

    seenIds.add(node.id);
    nodes.push(node);
  });

  if (nodes.length < 2) {
    return null;
  }

  const rawSections = Array.isArray(
    raw.sections,
  )
    ? raw.sections
    : [];

  const sections: MindMapSection[] = [];

  const seenSections = new Set<string>();

  rawSections.forEach(
    (rawSection) => {
      if (
        !rawSection ||
        typeof rawSection !== "object"
      ) {
        return;
      }

      const section =
        rawSection as Record<
          string,
          unknown
        >;

      const name = cleanText(
        section.name,
        "",
        60,
      );

      if (
        !name ||
        seenSections.has(name)
      ) {
        return;
      }

      seenSections.add(name);

      sections.push({
        name,
        summary: cleanText(
          section.summary,
          "",
          300,
        ),
      });
    },
  );

  if (sections.length === 0) {
    const sectionNames = new Set<string>();

    nodes.forEach((node) => {
      if (
        node.kind === "section" &&
        node.section
      ) {
        sectionNames.add(
          node.section,
        );
      }
    });

    sectionNames.forEach(
      (name) => {
        const header = nodes.find(
          (node) =>
            node.section === name &&
            node.kind === "section",
        );

        sections.push({
          name,
          summary:
            header?.description ??
            "",
        });
      },
    );
  }

  const links: MindMapLink[] = [];
  const rawLinks = Array.isArray(
    raw.links,
  )
    ? raw.links
    : [];

  rawLinks.forEach((rawLink) => {
    const link = sanitizeLink(
      rawLink,
      seenIds,
    );

    if (!link) {
      return;
    }

    const key = `${link.source}->${link.target}`;

    if (!links.some(
      (existing) =>
        `${existing.source}->${existing.target}` ===
        key,
    )) {
      links.push(link);
    }
  });

  return {
    title,
    summary: cleanText(
      raw.summary,
      "",
      600,
    ),
    sections,
    nodes,
    links,
  };
}