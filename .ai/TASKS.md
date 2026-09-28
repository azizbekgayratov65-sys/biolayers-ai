# BioLayers AI — Task Graph

## Milestone 1: Design Tokens, Typography & Global Layout
- [x] **TASK-001**: Elevate `app/globals.css` with unified design tokens (concentric radii, APCA-compliant foregrounds, fluorophore semantic stains, dual-layer shadows, smooth scroll, focus rings). [Agent: frontend]
- [x] **TASK-002**: Redesign `app/components/Navbar.tsx` with hierarchical navigation, active indicator pill, keyboard shortcuts, mobile drawer focus trap, and touch-target padding >= 44px. [Agent: frontend]
- [x] **TASK-003**: Refine `app/layout.tsx` (skip link, theme color, safe-area padding, accessible landmark structure). [Agent: frontend]

## Milestone 2: Core Workspace Overhauls
- [x] **TASK-004**: Redesign `app/page.tsx` (Hero landing) using Figma Hierarchy, Fitts's Law, and Hick's Law (clear primary action, progressive feature reveals, partner trust badges). [Agent: frontend]
- [x] **TASK-005**: Redesign `app/mindmap/page.tsx` & `MindMapUploader.tsx` (progressive disclosure for upload, capacity cards, clean animated progress indicator, accessible file dropzone). [Agent: frontend]
- [x] **TASK-006**: Redesign `MindMapDocument.tsx`, `MindMapToc.tsx`, `MindMapSection.tsx` (sticky table of contents, typographic contrast, quote citation links, reading progress bar). [Agent: frontend]

## Milestone 3: Scientific Explorers (Cell Atlas, Cipher, Library)
- [x] **TASK-007**: Redesign `app/cells/page.tsx` & `app/cells/[cell_id]/page.tsx` (Cell Atlas catalog, modality chips, specimen preview modal, high-contrast microscopy viewer controls). [Agent: frontend]
- [x] **TASK-008**: Redesign `app/components/cipher/CipherWorkspace.tsx` (Project Cipher causal canvas header, plain/academic decoder toggle, audio pronunciation widget, guided tour pill, quiz results). [Agent: frontend]
- [x] **TASK-009**: Redesign `app/library/page.tsx` & `UserLibraryClient.tsx` (accessible cards, stable skeletons, tabular numbers, clean infinite scroll sentinel). [Agent: frontend]

## Milestone 4: Settings, Authentication & Information Pages
- [x] **TASK-010**: Redesign `app/settings/page.tsx` & panels (account info, BYOK Gemini key card, masked key reveal, status feedback, confirm modal for key removal). [Agent: frontend]
- [x] **TASK-011**: Redesign `app/login/page.tsx`, `app/signup/page.tsx`, `app/reset-password/page.tsx`, and `AuthShell.tsx` (hydration-safe inputs, no dead zones, password manager autofill support). [Agent: frontend]
- [x] **TASK-012**: Redesign `app/about/page.tsx`, `app/partners/page.tsx`, `app/press/page.tsx` (editorial typography, leadership dossiers, institutional partner grids). [Agent: frontend]

## Milestone 5: Verification, Accessibility Audit & Delivery
- [x] **TASK-013**: Run TypeScript verification (`npx tsc --noEmit`) and Turbopack build (`npm run build`). [Agent: tester]
- [x] **TASK-014**: Audit accessibility (ARIA labels, focus-visible, keyboard navigation, contrast checks, mobile hit targets). [Agent: reviewer]
- [x] **TASK-015**: Document final changes in `.ai/STATE.md` and generate walkthrough report. [Agent: team-lead]
