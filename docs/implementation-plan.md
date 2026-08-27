# BioLayers AI — Implementation Plan

> Solo developer. Build right. Make it faster and better.

---

## Table of Contents

- [Phase 0: Foundation](#phase-0-foundation-5h)
- [Phase 1: Architecture Decomposition](#phase-1-architecture-decomposition-25h)
- [Phase 2: Performance & Bundle Optimization](#phase-2-performance--bundle-optimization-15h)
- [Phase 3: Security & Data Integrity](#phase-3-security--data-integrity-10h)
- [Phase 4: AI Layer Modernization](#phase-4-ai-layer-modernization-15h)
- [Phase 5: Observability & Operations](#phase-5-observability--operations-8h)
- [Phase 6: Documentation & Polish](#phase-6-documentation--polish-8h)
- [Timeline](#timeline)
- [Decision Log](#decision-log)

---

## Phase 0: Foundation (5h)

> Safety net for everything that follows. Do first.

### 0.1 Add Vitest + React Testing Library

**Why:** Solo dev needs confidence before refactoring 3,800-line files.

**Install:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Create `vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
```

**Create `tests/setup.ts`:**
```ts
import '@testing-library/jest-dom/vitest';
```

**Update `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Priority test targets (write first):**
- `app/lib/buildGraphFromText.ts` — entity detection, edge generation
- `app/lib/layoutGraph.ts` — dagre layout correctness
- `app/lib/extractTextClient.ts` — PDF/text extraction logic
- `app/lib/auth/rate-limit.ts` — rate limit logic
- `app/lib/findQuoteInText.ts` — quote matching

### 0.2 CI Pipeline (GitHub Actions)

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Test
        run: npm run test:run

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }}
          GEMINI_ENCRYPTION_KEY: ${{ secrets.GEMINI_ENCRYPTION_KEY }}
```

### 0.3 ESLint + Prettier + Husky

**Install:**
```bash
npm install -D prettier eslint-config-prettier husky lint-staged
```

**Update `eslint.config.mjs`:**
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
```

**Create `.prettierrc`:**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80
}
```

**Husky setup:**
```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

**Add to `package.json`:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### 0.4 Bundle Analyzer

**Install:**
```bash
npm install -D @next/bundle-analyzer
```

**Update `next.config.ts`:**
```ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "mammoth",
  ],
};

export default withBundleAnalyzer(nextConfig);
```

**Verify:**
```bash
ANALYZE=true npm run build
```

---

## Phase 1: Architecture Decomposition (25h)

> Split `app/explore/page.tsx` (3,800 lines) into testable, maintainable units.

### Target Structure

```
app/explore/
├── page.tsx                    # Server shell (~50 lines)
├── ExploreClient.tsx           # Client wrapper (~300 lines)
├── components/
│   ├── GraphViewport.tsx       # ReactFlow canvas + controls + minimap
│   ├── NarrativeController.tsx # Step reveal + timeline scrubber
│   ├── ProjectToolbar.tsx      # Layer toggles + save/restore/publish
│   ├── EvidencePanel.tsx       # EvidenceLens + classifications
│   ├── CopilotPanel.tsx        # AI chat + citations
│   ├── HypothesisBuilder.tsx   # Hypothesis generation UI
│   ├── PubMedSidebar.tsx       # Search + results
│   ├── CellAtlasSidebar.tsx    # Cell ontology browser
│   ├── InspectorSidebar.tsx    # Node/edge details
│   └── WorkspaceHeader.tsx     # Title + view switcher
├── hooks/
│   ├── useGraphState.ts        # nodes/edges/selection/layout/layers
│   ├── useNarrative.ts         # narrativeSteps, index, reveal, timer
│   ├── useProjectStorage.ts    # localStorage save/restore/delete
│   ├── useCopilot.ts           # AI chat state + streaming
│   ├── useEvidence.ts          # Evidence classification state
│   ├── usePubMed.ts            # (exists) + caching layer
│   └── useCellOntology.ts      # (exists) + caching layer
├── types/
│   └── explore.ts              # NarrativeStep, CopilotMode, etc.
└── utils/
    └── graphHelpers.ts         # layoutGraph wrapper, buildGraph wrapper
```

### Extraction Order

**Step 1: Extract types (1h)**
- Move `NarrativeStep`, `CopilotMode`, `CopilotResponse`, `CopilotCitation`, `RelatedConnection`, `DemoScene`, `WorkspaceView` to `types/explore.ts`
- Replace all inline type definitions in `page.tsx` with imports

**Step 2: Extract `useGraphState` hook (4h)**
```ts
// hooks/useGraphState.ts
export function useGraphState(initialNodes: EntityNodeType[], initialEdges: Edge[]) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerState>({...});
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>("TB");

  // All node/edge manipulation: addNode, removeNode, updateNodeData,
  // relayout, applyLayerFilters, clearSelection, etc.

  return { nodes, edges, selectedId, hoveredId, layers, ... };
}
```

**Test:**
- Initial state shape
- Layer toggle filters correct nodes
- Layout direction change triggers relayout
- Selection/deselection

**Step 3: Extract `GraphViewport` (3h)**
```tsx
// components/GraphViewport.tsx
export default function GraphViewport({
  nodes, edges, onInit, onNodesChange,
  onSelectNode, onSelectEdge, onPaneClick,
  onNodeEnter, onNodeLeave,
  narrativeRevealActive, revealedNodeIds,
}: GraphViewportProps) {
  // ReactFlow canvas, Background, MiniMap, Controls, corner decorations
}
```

**Step 4: Extract `useNarrative` hook (3h)**
```ts
// hooks/useNarrative.ts
export function useNarrative(narrativeSteps: NarrativeStep[]) {
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [narrativePlaying, setNarrativePlaying] = useState(false);
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [narrativeRevealActive, setNarrativeRevealActive] = useState(false);
  const [revealedNodeIds, setRevealedNodeIds] = useState<Set<string>>(new Set());

  const activeStep = narrativeSteps[narrativeIndex] ?? null;
  const previousStep = narrativeSteps[narrativeIndex - 1] ?? null;

  // start, pause, resume, next, prev, restart, close
  // Auto-advance timer (4200ms)
  // Reveal logic (add node to revealedNodeIds on step change)

  return { narrativeOpen, narrativePlaying, narrativeIndex, activeStep, revealedNodeIds, ... };
}
```

**Test:**
- Step progression
- Auto-advance timer
- Reveal state accumulation
- Close resets everything

**Step 5: Extract `NarrativeController` (2h)**
- Renders `NarrativeOverlay` + `TimelineScrubber`
- Connects to `useNarrative` hook

**Step 6: Extract panels one at a time (8h)**
Each panel extracted as:
1. Read the relevant code from `page.tsx`
2. Create the component file
3. Move state into a hook or pass as props
4. Add to `ExploreClient.tsx`
5. Verify functionality

Order: `EvidencePanel` → `CopilotPanel` → `HypothesisBuilder` → `PubMedSidebar` → `CellAtlasSidebar` → `InspectorSidebar`

**Step 7: Verify (4h)**
- All existing functionality works
- `tsc --noEmit` clean
- `npm run lint` — no new errors
- `npm run build` succeeds
- Manual smoke test: upload PDF → generate mindmap → explore workspace → narrative → publish

---

## Phase 2: Performance & Bundle Optimization (15h)

> Make it measurably faster.

### 2.1 Optimize Package Imports

**Update `next.config.ts`:**
```ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@react-three/fiber",
      "@react-three/postprocessing",
      "three",
      "framer-motion",
      "@xyflow/react",
      "lucide-react",
    ],
  },
  serverExternalPackages: [
    "@napi-rs/canvas",
    "mammoth",
  ],
};
```

**Verify:** Bundle analyzer shows smaller chunks.

### 2.2 Remove pdfjs-dist from serverExternalPackages

**Current:** In `serverExternalPackages` but also loaded client-side via dynamic import.
**Action:** Remove from array. Keep `pdf-parse` for server extraction only.
**Test:** Client PDF extraction still works.

### 2.3 TanStack Query for API Caching

**Install:**
```bash
npm install @tanstack/react-query
```

**Create `app/providers/QueryClientProvider.tsx`:**
```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 min
        gcTime: 30 * 60 * 1000,    // 30 min
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Update `app/layout.tsx`:**
```tsx
import Providers from "./providers/QueryClientProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Refactor hooks to use query:**
```ts
// hooks/usePubMed.ts — replace fetch with useQuery
import { useQuery } from "@tanstack/react-query";

export function usePubMedSearch(query: string) {
  return useQuery({
    queryKey: ["pubmed", query],
    queryFn: () => fetchPubMedPapers(query),
    enabled: query.length > 2,
  });
}
```

### 2.4 Graph Undo/Redo

**Add to `useGraphState`:**
```ts
const [history, setHistory] = useState<Array<{ nodes: EntityNodeType[]; edges: Edge[] }>>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

function snapshot() {
  setHistory((prev) => {
    const trimmed = prev.slice(0, historyIndex + 1);
    return [...trimmed, { nodes: structuredClone(nodes), edges: structuredClone(edges) }].slice(-50);
  });
  setHistoryIndex((prev) => Math.min(prev + 1, 49));
}

function undo() {
  if (historyIndex <= 0) return;
  const prev = history[historyIndex - 1];
  setNodes(prev.nodes);
  setEdges(prev.edges);
  setHistoryIndex((prev) => prev - 1);
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  const next = history[historyIndex + 1];
  setNodes(next.nodes);
  setEdges(next.edges);
  setHistoryIndex((prev) => prev + 1);
}
```

**Keyboard shortcut:** `Ctrl+Z` undo, `Ctrl+Shift+Z` redo.

### 2.5 ReactFlow Keyboard Navigation

**Enable in `WorkspaceCanvas`:**
```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  keyboardNavigationMode="ierarchical"
  onNodeKeyDown={(event, node) => {
    if (event.key === "Delete") {
      // remove selected node
    }
    if (event.key === "Enter" || event.key === " ") {
      onSelectNode(node.id);
    }
  }}
  ...
/>
```

### 2.6 Performance Targets

| Metric | Current (est.) | Target |
|--------|----------------|--------|
| First Load JS (main) | ~350KB | < 200KB |
| LCP (`/explore`) | > 3s | < 2.5s |
| FID | > 100ms | < 50ms |
| Duplicate chunks | 2-3 | 0 |

---

## Phase 3: Security & Data Integrity (10h)

> Protect data, harden API.

### 3.1 Migration: Gemini Key Versioning

**Create `supabase/migrations/0005_key_versioning.sql`:**
```sql
-- Add key version for rotation support
ALTER TABLE public.user_ai_settings
  ADD COLUMN IF NOT EXISTS key_version integer DEFAULT 1;

COMMENT ON COLUMN public.user_ai_settings.key_version IS
  'Encryption key version. v1 = original GEMINI_ENCRYPTION_KEY, v2 = rotated.';
```

**Update `app/lib/gemini/store.ts`:**
```ts
// Store with version prefix
export async function storeEncryptedKey(supabase, userId, encrypted, keyVersion = 1) {
  const payload = `v${keyVersion}:${encrypted}`;
  // ... upsert
}

// Decrypt with version detection
export async function getDecryptedGeminiKey(supabase, userId) {
  // Fetch encrypted_api_key, key_version
  // If v1: use current GEMINI_ENCRYPTION_KEY
  // If v2: use GEMINI_ENCRYPTION_KEY_V2
  // Fallback: try v1 then v2
}
```

### 3.2 Migration: Column-Restricted RLS

**Create `supabase/migrations/0006_papers_rls_restrict.sql`:**
```sql
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Users can update own papers" ON public.papers;

-- Restrict to specific columns only
CREATE POLICY "Users can update own papers"
  ON public.papers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
  );

-- Add check constraint for immutable columns
ALTER TABLE public.papers
  ADD CONSTRAINT papers_immutable_columns
  CHECK (
    user_id = (SELECT user_id FROM public.papers WHERE id = papers.id)
  );
```

### 3.3 Migration: Soft Delete

**Create `supabase/migrations/0007_soft_delete.sql`:**
```sql
ALTER TABLE public.papers
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS papers_deleted_at_idx
  ON public.papers (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Update existing policies to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own papers" ON public.papers;
CREATE POLICY "Users can view own papers"
  ON public.papers FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete own papers" ON public.papers;
CREATE POLICY "Users can delete own papers"
  ON public.papers FOR DELETE
  USING (auth.uid() = user_id);

-- Soft delete function
CREATE OR REPLACE FUNCTION public.soft_delete_paper(paper_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.papers
  SET deleted_at = now()
  WHERE id = paper_id AND user_id = auth.uid();
END;
$$;
```

**Update `app/lib/papers/store.ts`:**
```ts
export async function deletePaper(supabase, userId, paperId) {
  const { error } = await supabase
    .from("papers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", paperId)
    .eq("user_id", userId)
    .is("deleted_at", null);
  // ...
}
```

### 3.4 Migration: Full-Text Search

**Create `supabase/migrations/0008_full_text_search.sql`:**
```sql
-- Add generated tsvector column
ALTER TABLE public.papers
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(file_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(mindmap::text, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS papers_search_idx
  ON public.papers USING GIN (search_vector);

-- Search function
CREATE OR REPLACE FUNCTION public.search_papers(
  search_query text,
  result_limit integer DEFAULT 20,
  result_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  file_name text,
  rank real
)
LANGUAGE sql STABLE
AS $$
  SELECT id, title, file_name,
         ts_rank(search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM public.papers
  WHERE search_vector @@ plainto_tsquery('english', search_query)
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  ORDER BY rank DESC
  LIMIT result_limit
  OFFSET result_offset;
$$;
```

### 3.5 Rate Limiting on All API Routes

**Update `app/lib/auth/rate-limit.ts`:**
```ts
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  maxRequests = 10,
  windowMs = 60_000,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= maxRequests) return false;

  await supabase.from("rate_limits").insert({
    user_id: userId,
    action,
  });

  return true;
}
```

**Apply to routes:**
| Route | Max Requests | Window |
|-------|-------------|--------|
| `/api/mindmap` | 5 | 60s |
| `/api/copilot` | 20 | 60s |
| `/api/classify-evidence` | 10 | 60s |
| `/api/papers` (POST) | 10 | 60s |
| `/api/papers/[id]/publish` | 5 | 60s |
| `/api/generate-graph` | 10 | 60s |

---

## Phase 4: AI Layer Modernization (15h)

> Clean abstraction, better prompts, safer parsing.

### 4.1 Provider Abstraction

**Create `app/lib/aiProviders.ts`:**
```ts
export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  generateContent(params: {
    apiKey: string;
    model: string;
    prompt: string;
    responseSchema?: unknown;
    maxOutputTokens?: number;
    controller?: AbortController;
  }): Promise<string>;
  validateKey(key: string): Promise<boolean>;
}

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini",
  models: GEMINI_MODEL_RANK,
  generateContent: callGeminiGenerate,
  validateKey: async (key) => {
    try {
      const res = await fetch(`${GEMINI_BASE}/models?key=${key}`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
```

### 4.2 Dynamic Model Discovery

**Add to `app/lib/aiProviders.ts`:**
```ts
let cachedModels: string[] | null = null;
let cacheExpiry = 0;

export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  if (cachedModels && Date.now() < cacheExpiry) return cachedModels;

  try {
    const res = await fetch(`${GEMINI_BASE}/models?key=${apiKey}`);
    const data = await res.json();

    cachedModels = data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => m.name.replace("models/", ""))
      .sort((a: string, b: string) => b.localeCompare(a));

    cacheExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24h
    return cachedModels;
  } catch {
    return GEMINI_MODEL_RANK;
  }
}
```

### 4.3 Externalize Prompts

**Create `prompts/mindmap/system.md`:**
```markdown
You are an expert scientific summarizer and knowledge-mapping assistant.

Convert a research paper into a hierarchical mind map.
...
```

**Load at runtime:**
```ts
import { readFile } from "fs/promises";
import path from "path";

async function loadPrompt(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), "prompts", `${name}.md`);
  return readFile(filePath, "utf-8");
}
```

**Prompt structure:**
```
prompts/
├── mindmap/
│   ├── system.md          # Core instructions
│   ├── structure.md       # Node hierarchy rules
│   ├── quotes.md          # Quote extraction rules
│   └── format.md          # JSON output schema
├── copilot/
│   ├── explain.md
│   ├── mechanism.md
│   └── hypothesis.md
└── evidence/
    └── classify.md
```

### 4.4 Zod Schemas for AI Responses

**Install:**
```bash
npm install zod
```

**Create `app/lib/schemas/mindmap.ts`:**
```ts
import { z } from "zod";

export const MindMapNodeSchema = z.object({
  id: z.string(),
  label: z.string().max(60),
  kind: z.enum(["section", "idea"]),
  section: z.string().optional(),
  description: z.string().optional(),
  quote: z.string().max(220).optional(),
  weight: z.number().min(0).max(1).optional(),
});

export const MindMapSchema = z.object({
  title: z.string(),
  summary: z.string(),
  nodes: z.array(MindMapNodeSchema),
  sections: z.array(z.object({
    name: z.string(),
    summary: z.string(),
  })),
});
```

**Use in route handler:**
```ts
const parsed = MindMapSchema.safeParse(JSON.parse(aiOutput));
if (!parsed.success) {
  // Log validation errors, retry or fallback
}
```

---

## Phase 5: Observability & Operations (8h)

> See what's happening, fix fast.

### 5.1 Structured Logging (Pino)

**Install:**
```bash
npm install pino
```

**Create `app/lib/logger.ts`:**
```ts
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

// Usage:
// const log = createLogger({ userId, paperId });
// log.info("Mindmap generated");
// log.error({ err: error }, "AI call failed");
```

### 5.2 Sentry Integration

**Install:**
```bash
npx @sentry/wizard@latest -i nextjs
```

**Create `sentry.client.config.ts`:**
```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});
```

### 5.3 Supabase Migrations via GitHub Action

**Create `.github/workflows/db-migrate.yml`:**
```yaml
name: Database Migrate

on:
  push:
    branches: [main]
    paths: ["supabase/migrations/**"]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

### 5.4 Health Check Endpoint

**Create `app/api/health/route.ts`:**
```ts
import { NextResponse } from "next/server";
import { createPublicClient } from "../../lib/auth/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Database
  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("papers").select("id", { count: "exact", head: true });
    checks.database = error ? "error" : "ok";
  } catch {
    checks.database = "error";
  }

  // AI
  checks.ai = process.env.GEMINI_API_KEY ? "configured" : "byok";

  const status = Object.values(checks).every((s) => s === "ok" || s === "configured" || s === "byok")
    ? 200 : 503;

  return NextResponse.json(
    {
      status: status === 200 ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
    },
    { status },
  );
}
```

---

## Phase 6: Documentation & Polish (8h)

> Make it understandable.

### 6.1 README.md

**Replace boilerplate with:**
```markdown
# BioLayers AI

AI-driven computational oncology platform: paper → mind map → research workspace.

## Quick Start

1. Clone & install:
   ```bash
   git clone https://github.com/azizbekgayratov65-sys/biolayers-ai.git
   cd biolayers-ai
   npm install
   ```

2. Environment:
   ```bash
   cp .env.example .env.local
   # Fill in Supabase + Gemini credentials
   ```

3. Run:
   ```bash
   npm run dev
   ```

## Architecture

- **Framework:** Next.js 16.2.12 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth (PKCE)
- **AI:** Gemini API (BYOK)
- **Graph:** React Flow + dagre layout
- **3D:** Three.js + React Three Fiber (hero only)
- **Animations:** Framer Motion

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npm run test` | Vitest (watch) |
| `npm run test:run` | Vitest (single run) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |
| `SUPABASE_SECRET_KEY` | No | Service role key (server only) |
| `GEMINI_ENCRYPTION_KEY` | Yes | AES-256 key for API key encryption |
| `GEMINI_API_KEY` | No | Global Gemini key (users bring their own) |

## Deploy

Push to `main` → Vercel auto-deploys.
Database migrations: `supabase db push` or GitHub Action.
```

### 6.2 API Documentation (OpenAPI)

**Install:**
```bash
npm install @asteasolutions/zod-to-openapi swagger-ui-react
```

**Create `app/api/docs/route.ts`:**
```ts
import { NextResponse } from "next/server";
import { getSwaggerDocument } from "../../lib/api-docs";

export const runtime = "nodejs";

export async function GET() {
  const doc = getSwaggerDocument();
  return NextResponse.json(doc);
}
```

**Create `app/docs/page.tsx`:**
```tsx
"use client";
import dynamic from "next/dynamic";
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  return <SwaggerUI url="/api/docs" />;
}
```

### 6.3 Storybook (Optional)

```bash
npx storybook@latest init --builder @storybook/builder-vite
```

Priority stories:
- `EntityNode` — all entity types
- `BiologicalEdge` — all relation types
- `ProjectToolbar` — layer toggles
- `TimelineScrubber` — step states
- `MindMapDocument` — sections + ideas

---

## Timeline

| Week | Phase | Hours | Deliverable |
|------|-------|-------|-------------|
| 1 | 0: Foundation | 5 | Tests + CI + Lint + Analyzer |
| 2-3 | 1: Architecture | 25 | Split explore/page.tsx |
| 3-4 | 2: Performance | 15 | Bundle < 200KB, LCP < 2.5s |
| 4-5 | 3: Security | 10 | Key rotation, RLS, FTS, soft delete |
| 5-6 | 4: AI Layer | 15 | Provider abstraction, Zod schemas |
| 6-7 | 5: Observability | 8 | Pino, Sentry, health check |
| 7-8 | 6: Docs | 8 | README, API docs, Storybook |
| **Total** | | **~86h** | |

---

## Decision Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Testing framework | Vitest | Fast, native TS, zero config |
| E2E testing | Skip Playwright | Solo dev, unit tests sufficient |
| Caching | TanStack Query | Free, replaces custom fetch logic |
| Sentry | Free tier | 5k errors/mo, solo project |
| Storybook | Optional | Low ROI for solo dev, skip if time-constrained |
| Supabase migrations | `supabase db push` in CI | Automated, version-controlled |
| Package optimization | `optimizePackageImports` | Built-in Next.js, no extra deps |
| Prompt versioning | External `.md` files | Git-friendly, easy to iterate |
| Key rotation | Version prefix (`v1:`, `v2:`) | Simple, backward compatible |
| Soft delete | `deleted_at` column | Standard pattern, easy to query |
| Full-text search | `tsvector` + GIN | Native Postgres, no extensions needed |
| Logging | Pino | Fast, structured, JSON output |
