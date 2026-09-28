# BioLayers AI — Coding Conventions

## 1. File Structure & Imports
- **Relative Imports**: All local imports use relative paths (`../`, `./`) rather than `@/*` aliases, matching existing repository convention.
- **Client vs Server Components**:
  - Add `"use client"` directive only when using React hooks, browser APIs, or event listeners.
  - Server components remain async, using `"server-only"` where appropriate.
  - Dynamic route parameters must be awaited: `const { id } = await params;`.

## 2. Accessibility Conventions
- Every interactive element has an accessible name (`aria-label`, visible text, or associated `<label>`).
- Interactive buttons and inputs have `:focus-visible` styling with a luminous outline offset.
- Form inputs specify `autoComplete`, `inputMode`, and have font size >= 16px on mobile.
- Decorative SVGs and background graphics include `aria-hidden="true"`.
- Loading states retain the original button label alongside a spinner and end in an ellipsis (`…`).

## 3. Styling & CSS Rules
- Never use `transition: all`. Explicitly enumerate animated properties: `transition-[transform,opacity] duration-200`.
- Text on dark backgrounds must meet WCAG AA (>= 4.5:1 for body, >= 3:1 for large text).
- Avoid straight quotes; use curly quotes (“ ”) and typographic apostrophes (’), and non-breaking spaces `&nbsp;` for units.
- Respect safe areas (`env(safe-area-inset-top)`, etc.).
