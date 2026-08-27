# Fix: Hero text collisions at effective-zoom widths

## Context
User reports "text overlaps / collides" in the homepage hero at default 100% zoom (Chrome), i.e., with OS display scaling active. Verified with Playwright geometry audits.

## Findings (verified)
- Full multi-width audit (14 routes x 12 widths, 1920->480): the ONLY text collisions on the site are in the homepage hero, at effective viewport widths 1024-768 (= ~125-175% OS/Chrome scaling on 1080-1440p displays - the user's default setup).
- **Collision A - stage block vs pipeline labels (1024 & 960):**
  `app/components/hero/HeroStageNarrative.tsx` uses `<AnimatePresence mode="wait">` (lines 352-440) with a keyed motion.div per stage. When the auto-cycling stage changes (CYCLE_SECONDS=20, 5 stages, 50ms rAF progress re-renders), the previous stage block FAILS to be removed (framer-motion bug under frequent parent re-renders). Both blocks render stacked in-flow at full opacity; the lower block's eyebrow ("Evidence") overlaps the card's pipeline labels ("Paper / Research map"). Persists at every sample 0.8-6.0s. Confirmed visible (op=1 on both).
- **Collision B - card overlaps hero entities row (768):** below `lg` the bottom-anchored story card (420px, x~308-728) horizontally overlaps the now-centered hero content (max-w-[760px] fills the md width); the card's pipeline labels land on the hero's wrapped "Processes / Evidence" entity chips.

## Fixes
1. **HeroStageNarrative.tsx (lines 352-440):** remove the AnimatePresence key-swap. Replace with a single keyed motion.div (`key={activeStage.key}`) using only entrance animation (initial opacity/y/blur -> animate to 0). A plain keyed motion.div remounts and can never leave a stale sibling, so no stacking / push-down / collision at any width. Keep the `mt-4 min-h-[120px]` container. (Loses the fade-out half of the transition; entrance effect preserved.)
2. **Hide the decorative story card below `lg`** (`hidden lg:block` on card wrapper, lines 227-237): removes Collision B at 768 and cleans up small screens. Card is pointer-events-none decoration.
   - Alternative (if the card must stay on tablet): narrow hero content at md (e.g. `max-w-[560px]`) to reserve the card gutter.

## Verification
- Playwright multi-width text-overlap audit on the home route, all 14 widths, PLUS focused samples at 1024/960/768 (the previously failing widths): expect 0 overlaps; no horizontal overflow.
- Re-check other hero AnimatePresence mode="wait" text swaps (MorphStageOverlay.tsx:120-163, CinematicStageTitle.tsx:94-134) for the same stale-block symptom; apply the same single-keyed-div pattern if any overlap appears.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean.
- Commit to main and push (Vercel auto-deploy).