# BioLayers AI

Next.js 16.2.12 App Router (Turbopack default) + TypeScript + Tailwind v4 + Supabase. AI-driven computational oncology platform (paper → mind map → research workspace). Vercel deploy, remote `origin` = `https://github.com/azizbekgayratov65-sys/biolayers-ai.git`, branch `main`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Non-obvious Next.js 16 facts (verified in this repo)
- Middleware is now `proxy.ts` at repo root (`app/lib/supabase/middleware.ts` exports `updateSession`). Don't create `middleware.ts`.
- Dynamic route `params` is a **Promise** — must `await params` in pages and `await context.params` in route handlers (see `app/mindmap/[id]/page.tsx`, `app/api/papers/[id]/route.ts`).
- API routes set `export const runtime = "nodejs"` and `dynamic = "force-dynamic"`. The mindmap/explore pages are client components (`"use client"`) unless they call `requireUser`.
- Version-matched docs ship in `node_modules/next/dist/docs/`. Consult them before writing code.

## Commands
- `npm run dev` — needs `.env.local` (Supabase creds; `env.ts` throws if missing).
- `npx tsc --noEmit` — typecheck. `npm run build` already runs TypeScript + Turbopack build.
- `npm run lint` (eslint, flat config `eslint.config.mjs`). Scoped: `npx eslint <file>`.
- No test framework/suite exists. Don't invent one; verify via `tsc` + `build`.
- **Known pre-existing lint errors** in `app/components/journey/BioJourney.tsx` (react-hooks/immutability, purity, set-state-in-effect, ~8 errors) — present on clean checkout, not caused by new work. Don't "fix" them as part of unrelated edits.

## Architecture
- **Auth**: Supabase PKCE. `proxy.ts` refreshes session and guards `/mindmap*`, `/explore*`, `/settings*` (redirects to `/login?next=...`). 
  - Server pages/components: `requireUser(nextPath?)` from `app/lib/auth/require-user.ts` (imports `"server-only"`).
  - API routes: `createApiClient()` + `getApiUserId()` + `unauthorizedJson()` from `app/lib/auth/api-auth.ts`.
  - Server-only lib modules start with `import "server-only"` (papers store, auth, rate-limit, gemini store).
- **DB**: `supabase/migrations/0001_init.sql` — `profiles`, `user_ai_settings` (AES-256-GCM encrypted Gemini keys via `GEMINI_ENCRYPTION_KEY`), `papers` (columns incl. `mindmap jsonb`). RLS owns all rows; session user id is always derived server-side, never trusted from the client.
- **Gemini BYOK**: users supply their own Gemini key (stored encrypted); per-user key decrypt + model fallback rank in `app/lib/aiModels.ts`. `GEMINI_API_KEY` is NOT a global requirement.
- **`papers.mindmap` stores only the JSONB map, NOT the source text.** Reopened saved papers pass `extractedText: ""`, so verbatim quotes render without highlight (see `app/mindmap/[id]/page.tsx`). `MindMapDocument` needs `onReset` → server can't pass a function; use a client wrapper (`app/components/mindmap/SavedMindMapClient.tsx`).
- **Integrations actually wired**: PubMed (`/api/pubmed`, NCBI eutils) and Cell Ontology (`/api/cells`, EBI OLS). Reactome/UniProt/HPA/NCBI Gene are **marketing roadmap only** — don't present them as live in copy.
- **Marketing truth**: homepage sections (`app/components/sections/`, `hero/`, `journey/`) overclaim vs the product. Keep claims aligned with actual features; label demo/illustrative UI explicitly.
- **PDF/DOCX**: `pdf-parse` + `mammoth` are `serverExternalPackages` in `next.config.ts`; pdfjs worker is warmed before parsing for Vercel. `pdf.worker.mjs`/DOMMatrix fixes are deliberate.

## Gotchas
- `@/*` alias exists in `tsconfig.json` but app code uses **relative imports** — follow that.
- Stray untracked files at repo root (`logo.jpg`, `rsob-11-200358.pdf`, `session-ses_fe48.md`) — not app assets, don't commit.
- `README.md` is default create-next-app boilerplate; not a source of truth.
- Deploy is Vercel; commit directly to `main` and push (no PR workflow, no CI, no branch protections).