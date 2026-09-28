# Architectural Decision Records (ADRs)

## ADR 001: First-Principles Frontend Redesign without Touching Backend
- **Context**: The user requested a complete frontend redesign from zero while explicitly specifying not to touch backend routes, APIs, database schemas, or remove any functionality.
- **Decision**: Preserve all existing API endpoints, Supabase queries, and client data hooks. Systematically elevate the UI layer: global design tokens, responsive layout grid, typographic hierarchy, a11y focus rings, touch targets, loading states, and ergonomic component patterns.
- **Rationale**: Keeps existing backend contracts 100% stable while delivering a world-class, accessible, and high-performance user experience.

## ADR 002: Concentric Radii and Layered Glassmorphism
- **Context**: Previous design had arbitrary border radii and inconsistent dark background values causing cognitive friction.
- **Decision**: Standardize on a strict concentric radius formula (`R_inner = R_outer - padding`) and a tiered dark-field palette with semi-transparent frosted glass (`backdrop-blur-xl`) and dual-light ambient shadows.
- **Rationale**: Eliminates visual awkwardness, adheres to Vercel and Figma design guidelines, and reinforces the scientific instrument aesthetic.

## ADR 003: Accessible Micro-Interactions & Motion Preference
- **Context**: Web animation must be smooth and non-disorienting, with full support for accessibility standards.
- **Decision**: Restrict transitions to compositor-friendly `transform` and `opacity` properties; never use `transition: all`. Provide instantaneous, non-animated equivalents whenever `prefers-reduced-motion` is active. Ensure all hit targets satisfy >=24px (desktop) and >=44px (mobile).
- **Rationale**: Guarantees 60fps performance on low-power devices and ensures accessibility for users with vestibular disorders.
