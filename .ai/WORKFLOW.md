# BioLayers AI — Engineering Workflow

## 1. Local Development
- Start development server: `npm run dev` (Turbopack, port 3000)
- Environment requirements: `.env.local` with Supabase and Gemini settings

## 2. Verification Commands
- Typecheck: `npx tsc --noEmit`
- Production Build: `npm run build`
- Scoped Lint: `npx eslint <target_file>`
  - Note: `app/components/journey/BioJourney.tsx` has pre-existing upstream lint issues; do not touch unless explicitly instructed.

## 3. Deployment Protocol
- Remote repository: `https://github.com/azizbekgayratov65-sys/biolayers-ai.git`
- Branch: `main`
- Automatic deployment: Vercel triggers on pushes to `main`
