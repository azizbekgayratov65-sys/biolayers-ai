# Change Requests & Refactor History

## CR-001: Autonomous Full Frontend Redesign (First-Principles)
- **Requested By**: User
- **Scope**: Complete visual and interaction overhaul of the entire application frontend while keeping all backend APIs, database schemas, and existing features 100% intact.
- **Directives & Guidelines**:
  - Figma 7 Core Principles (Hierarchy, Progressive Disclosure, Consistency, Contrast, Accessibility, Proximity, Alignment).
  - Vercel Design Guidelines (Keyboard accessible everywhere, clear focus, mobile input font >= 16px, touch targets >= 44px, no dead zones, concentric nested radii, active voice, Chicago Title Case).
  - Laws of UX (Aesthetic-Usability Effect, Fitts's Law, Hick's Law, Jakob's Law, Miller's Law, Doherty Threshold < 400ms, Peak-End Rule, Zeigarnik Effect).
- **Impact Assessment**:
  - Affected layers: `app/globals.css`, `app/layout.tsx`, `app/components/Navbar.tsx`, `app/page.tsx`, `app/mindmap/*`, `app/cells/*`, `app/components/cipher/*`, `app/library/*`, `app/settings/*`, `app/components/auth/*`, `app/about/*`, `app/partners/*`, `app/press/*`.
  - Unaffected layers: `app/api/*`, `app/lib/auth/*`, `app/lib/gemini/*`, `app/lib/papers/*`, `app/lib/supabase/*`, `proxy.ts`, `supabase/migrations/*`.
