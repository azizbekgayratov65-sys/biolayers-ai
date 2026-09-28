# BioLayers AI — Requirements & Guidelines

## 1. Core Directives
1. **Frontend Redesign From Zero**: Complete first-principles design elevation of the entire visual and interaction layer across every page and component.
2. **Zero Backend Changes**: Backend routes (`/api/*`), database schemas, Supabase migrations, authentication proxy (`proxy.ts`), and Gemini key encryption must remain 100% untouched.
3. **No Feature Removal**: All existing features, capabilities, tools, and endpoints must be strictly preserved:
   - Mind Map Workspace (upload, streaming analysis, document viewer, table of contents, quote locator)
   - Project Cipher (interactive causal network canvas, plain/academic decoder, pronunciation audio, guided tours, filters, quizzes)
   - Cell Atlas (specimen catalog, multi-channel microscopy viewer, fluorescence channel controls, cell card deep-dives)
   - 3D Journey (interactive molecular walkthrough)
   - Research Library (collective community knowledge, infinite scrolling, author profiles)
   - Settings & Profile (BYOK Gemini API key management, account info, saved papers)
   - Authentication (sign in, sign up, password reset, account menu)
   - Strategic Alliances & Leadership (Partners, About & Mentorship, Press & HundrED spotlights)
4. **Enhanced Navigation**: Full overhaul of Navbar and global layout for optimal clarity, accessibility, and modern desktop/mobile ergonomics.

## 2. Design System Guidelines
### Figma 7 Core UI Principles
- **Hierarchy**: Strategic typographic scale (Spectral serif display, Instrument Sans interface, IBM Plex Mono data), distinctive section chapter headers, and prominent CTA contrast.
- **Progressive Disclosure**: Break down complex actions into sequential stages; contextual drawers and inspector panels that reveal detail on demand.
- **Consistency**: Unified design tokens for radiuses (nested concentric curves `R_inner = R_outer - padding`), borders, padding, elevation, and fluorophore channel color semantic tokens.
- **Contrast**: High-contrast ratios meeting WCAG AA and APCA requirements; distinct primary vs secondary vs destructive (rose) action buttons.
- **Accessibility**: ARIA labels on all icon buttons, skip-to-content links, visible keyboard focus rings (`:focus-visible`), minimum 24px desktop and 44px mobile touch targets, and mobile input fonts >= 16px to prevent iOS auto-zoom.
- **Proximity**: Co-located interactive controls and their immediate visual feedback; explicit grouped card regions.
- **Alignment**: Strict 12-column grid alignment, optical centering for icon-text lockups, and baseline typographic grid.

### Vercel Design System Rules
- **Keyboard works everywhere**: Full keyboard operability and WAI-ARIA authoring compliance.
- **Clear & Managed Focus**: Unobscured focus rings with `:focus-visible`, focus trapping in modals/drawers, and return focus on close.
- **Hydration-Safe & Reliable Inputs**: No losing input values or focus on hydration; no paste blocking.
- **Loading & State**: Loading indicators maintain original button labels; ellipsis character (`…`) for pending actions; minimum visible time to prevent flicker.
- **URL as State**: Sync filters, active tabs, and inspected nodes with URL search parameters.
- **Animations**: Prefer GPU-accelerated CSS properties (`transform`, `opacity`); never `transition: all`; strict `prefers-reduced-motion` alternatives.
- **Copywriting**: Active voice, Chicago Title Case on headings & buttons, sentence case on marketing copy, positive problem-solving error messages that guide exit.

### Laws of UX
- **Aesthetic-Usability Effect**: A hyper-refined dark-field microscopy aesthetic that conveys precision and scientific authority.
- **Hick's Law & Choice Overload**: Reduce decision fatigue by highlighting one primary recommended action per screen.
- **Fitts's Law**: Generous hit targets for primary interactions, reachable mobile navigation.
- **Jakob's Law**: Standard web conventions for search inputs, tabs, user menus, and back navigation.
- **Miller's Law & Chunking**: Information split into bite-sized 5–7 item clusters.
- **Doherty Threshold**: Instant interactive feedback (<400ms) with optimistic UI states.
- **Peak-End Rule & Zeigarnik Effect**: Clear progress indicators and celebratory completion badges.
