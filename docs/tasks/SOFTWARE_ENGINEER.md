# Task Brief: Software Engineer

**Project:** BioLayers AI web app (Next.js 16, see `AGENTS.md` before coding). Full context: `docs/TEAM_TASKS.md`.
These items unblock the other roles.

## Status (19 Oct 2026, site redesign)
- Done: new headline and subheadline, footer social links (LinkedIn, GitHub, HundrED; Telegram still missing), licence and attribution on every cell card and catalogue row, honesty pass across all public pages.
- Done: atlas records with unverifiable provenance are marked "under review" (`app/lib/atlasIntegrity.ts`).
- Open: task 3 (evidence on graph arrows, "View cellular evidence"), task 5 (render pipeline output), a UI switch for making a saved map private (the API `/api/papers/[id]/publish` exists, nothing calls it).

## Tasks (in order)
1. **Landing copy:** change the headline in `app/page.tsx:83` ("Reconstruct cancer biology from...") to "From Papers to Living Cells". Subheadline: "BioLayers AI connects biomedical literature, biological mechanisms, real microscopy, and cellular phenotypes into evidence-grounded maps for computational oncology."
2. **Social links:** add LinkedIn, Telegram and YouTube to the footer once Social Media supplies the URLs (company LinkedIn: https://uz.linkedin.com/company/biolayers-ai).
3. **Evidence on the graph:** add a "View cellular evidence" action from a mechanism node to `/cells/[id]`, and make each arrow open its PMID/DOI or dataset accession ("Why does BioLayers believe this?"). Cell cards already show PMIDs (`app/cells/[cell_id]/page.tsx`).
4. **License and attribution:** show license and attribution on every cell card; flag CTC and CC-BY-NC items as research-only after the Data Collector's decision.
5. **Pipeline results:** when the AI Developer provides the per-cell JSON schema, render segmentation overlays and the time-lapse from stored results.
6. **Honesty pass:** keep demo or illustrative UI labelled; Reactome/UniProt/HPA/NCBI Gene stay "roadmap".

## Notes
- Pre-existing lint errors in `app/components/journey/BioJourney.tsx` are known; do not fix them inside unrelated work.
- Verify with `npx tsc --noEmit` and `npm run build`; there is no test suite.
- Commit directly to `main` and push, as set in `AGENTS.md`.
