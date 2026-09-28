# BioLayers AI — Architecture & Design System

## 1. System Architecture Overview
```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js 16 App Router                         │
├───────────────────┬───────────────────────────────┬────────────────────┤
│ Public Marketing  │ Scientific Workspaces         │ User Management    │
│ - / (Home Hero)   │ - /mindmap (Paper Mind Map)   │ - /settings (BYOK) │
│ - /about          │ - /cells (Cell Atlas & Cards) │ - /library         │
│ - /partners       │ - /cipher (Project Cipher)    │ - /login & /signup │
│ - /press          │ - /journey (3D Simulation)    │ - /reset-password  │
└─────────┬─────────┴───────────────┬───────────────┴──────────┬─────────┘
          │                         │                          │
          ▼                         ▼                          ▼
┌───────────────────┐     ┌───────────────────┐      ┌───────────────────┐
│ Global Backdrop   │     │ AI & Extraction   │      │ Supabase Auth & DB│
│ - BackgroundVideo │     │ - In-browser PDF  │      │ - PKCE Middleware │
│ - Semantic Stains │     │ - Gemini Fallback │      │ - Profiles & RLS  │
│ - Dark Field Flow │     │ - PubMed & OLS    │      │ - Encrypted Keys  │
└───────────────────┘     └───────────────────┘      └───────────────────┘
```

## 2. Design System Tokens (Tailwind v4)
- **Background Palette**:
  - `--background`: `#04070a` (Deep void, dark-field baseline)
  - `--background-elevated`: `#070b10` (Surface elevation 1)
  - `--background-panel`: `#0a0f16` (Surface elevation 2 / cards)
  - `--background-panel-strong`: `#0d141f` (Surface elevation 3 / active)
- **Fluorophore Semantic Channels**:
  - `DAPI` (Cyan / Azure `#4d8dff` / `#38bdf8`): Structural DNA, primary navigation, active selection.
  - `FITC` (Emerald `#2bff88` / `#00e46e`): Activation CTA, positive evidence, confirm actions.
  - `Cy5` (Violet `#a15cff` / `#8c34f7`): Transport mechanisms, citations, external knowledge links.
  - `YFP` (Amber `#ffc53d` / `#f59f13`): Hypotheses, warnings, API key configuration.
  - `RFP` (Rose `#ff3b5c` / `#f71943`): Inhibition pathways, destructive actions, errors.
- **Concentric Radii System**:
  - Outer Container: `24px` (`rounded-2xl` or `rounded-[24px]`)
  - Inner Card: `16px` (`rounded-xl`)
  - Button / Control: `12px` (`rounded-lg`)
  - Badge / Tag: `9999px` (`rounded-full`)
- **Elevation & Shadows**:
  - Layer 1 (Cards): `0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 36px rgba(0,0,0,0.35)`
  - Layer 2 (Modals/Overlays): `0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 72px rgba(0,0,0,0.6)`
  - Glow Accents: Diffuse fluorophore halos with `blur(24px)` to `blur(60px)` at 6–10% opacity.
