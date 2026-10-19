# BioLayers AI: Plan vs. Current State, and Task Delegation

Source plan: "BioLayers Main Plan" (sprint 8 Sep – 1 Oct 2026, North Star: *Papers → Mechanisms → Real Microscopy → Phenotypes → AI → Evidence-backed Hypotheses*).
Audit date: 19 Oct 2026 (post-v1.0). Based on the repo at `main`, `research/cell-pipeline/`, and public pages (LinkedIn, HundrED, AI Business).

## 1. Scorecard

| Plan item | Target | Current state | Status |
|---|---|---|---|
| Cell Atlas schema + SQLite | Phase 1 | `data/cell_atlas/` SQLite with datasets, images, segmentation, tracking, evidence-link tables | Done |
| Curated catalog | 300–500 images, full provenance | 634 catalog records (BBBC039/021/018/020/007, CTC HeLa + MDA-MB-231, CAF/CXCL12 case), `is_ai_generated=False` on all | Over target on records, **unverified on real files** |
| Public `/cells` + `/cells/[cell_id]` | search, filters, cards, attribution | Implemented (`app/cells`, `app/api/cells`) | Done, needs QA |
| Real image files behind records | every record has a real image | `public/atlas/` holds only 6 images; first catalog rows differ only by ID | **Gap** |
| AI segmentation + metrics | honest benchmark | Cellpose zero-shot; BBBC039 IoU 0.942 / F1 0.972; U373 SEG 0.940 / 0.867 | Done |
| Tracking / time-lapse | minimal, for demo | Overlap tracker, 2 U373 sequences, 1–3 ID switches | Done (minimal) |
| Phenotype layer | morphology + migration | 22,675 nuclei measured; rule-based labels, no expert validation | Done, **unvalidated** |
| Flagship CAF → CXCL12 → CXCR4 → migration | 1 perfect case | Case study + 5 PubMed-verified papers, per-cell JSON atlas for U373 | Done, thin literature base |
| Evidence on every graph arrow (PMID/DOI/accession) | clickable "Why do we believe this?" | PMIDs shown on cell cards; no per-arrow evidence in the graph, no "View cellular evidence" button | **Gap** |
| Segmentation inside the web product | demo flow in-app | Pipeline is offline Python (`research/cell-pipeline`); site only renders results and `/validation` | **Gap** |
| New landing "From Papers to Living Cells" | headline change | `app/page.tsx` still says "Reconstruct cancer biology from…" | **Gap** |
| 90-second demo video | main sprint artifact | `research/results/biolayers_demo_90s.mp4` exists; no public posting found | Made, not published |
| CTC licensing check | before production | Audit doc exists; CTC data (133 records) and CC-BY-NC (15) are shown publicly with a commercial-use caveat | **Risk** |
| 2–3 researcher demos + written feedback | DoD | No testimonials or feedback in repo or online | **Gap** |
| Social KPI | 200+ LinkedIn, 100+ Telegram | LinkedIn 19 followers; Telegram channel not discoverable | **Far off** |

## 2. Social media: current state

| Channel | Finding |
|---|---|
| LinkedIn company page ([uz.linkedin.com/company/biolayers-ai](https://uz.linkedin.com/company/biolayers-ai)) | 19 followers (plan baseline said 9; target 200+). Only 3 posts, all about 2 months old, 0–2 reactions each. Nothing about the Cell Atlas, validation, partners, or mentors. |
| Drafted post | `linkedin_post.txt` ("A Monumental Month…": 4 partners, 3 mentors, Project Cipher) is not visible on the page, so it appears **unposted**. |
| Telegram | HundrED and the LinkedIn posts say a channel exists, but no handle could be found by search and **the website links to no Telegram, X, YouTube or Instagram**. |
| Founder | [linkedin.com/in/azizbekgayratov](https://www.linkedin.com/in/azizbekgayratov/) is linked from the site. |
| Third-party proof | [HundrED listing](https://hundred.org/en/innovations/biolayers-ai), [AI Business article](https://aibusiness.vc/startups/biolayers-ai-cancer-literature-maps). Both are underused in posts. |
| Assets in hand | 90 s demo video, validation figures (`research/cell-pipeline/results/`), partner and mentor logos/portraits, validation report. |
| Misfiled | `pitch.md` is a BidTide logo prompt, unrelated to BioLayers. |

## 3. Tasks

### Social Media / Scientific Communication
1. **Unblock channels (day 1):** confirm Telegram handle, add Telegram and LinkedIn links to the site footer (hand the exact URLs to Software). Create a YouTube channel for the demo.
2. **Publish the backlog:** post `linkedin_post.txt` (check the claims against the "no institutional endorsement" wording), then the 90 s demo video on LinkedIn, Telegram and YouTube.
3. **Post cadence (3/week for 4 weeks):** (a) validation results in plain language ("IoU 0.94 on 200 images, zero-shot, limits included"); (b) CAF → CXCL12 → CXCR4 story with the flagship figure; (c) "real microscopy only, with provenance" principle; (d) partner and mentor spotlights; (e) HundrED and AI Business coverage.
4. **Outreach:** shortlist 15 researchers/labs (BBBC, CTC, Allen, partners NXT Horizon, STEMise, UCLA CBS, BioMedizone). Goal: 2–3 recorded demos and written feedback quotes (the missing DoD item).
5. **KPI to report weekly:** LinkedIn followers (19 → 200), Telegram subscribers (→ 100), demos booked, feedback quotes collected.
6. **Rules:** no clinical claims; do not present Reactome/UniProt/HPA/NCBI Gene as live (roadmap only); label mentors as guidance, not endorsement.

### Data Collector / Bioimage Curator
1. **Verify catalog integrity (highest priority):** for all 634 records confirm a real image file or a resolvable source accession (BBBC/CTC file ID) exists. Many rows are identical apart from `image_id`; fix or drop any record that does not map to a real image.
2. **Provenance completeness audit:** per record check organism, cell line, modality, pixel size, magnification, time interval, staining, treatment, DOI/PMID, accession, license. Report % complete per column.
3. **Licensing triage:** 133 CTC records and 15 CC-BY-NC records are shown publicly. Either get written permission from dataset contributors, or flag them research-only in the UI/catalog. Record the outcome in `DATA_SOURCE_AUDIT_AND_LICENSES.md`.
4. **Expand carefully:** add Allen Cell Explorer and Human Protein Atlas (Tier 3/4) only after their licenses are audited. Add 1–2 more cancer-relevant live-cell sets, ideally with CXCL12/CXCR4 or migration context.
5. **Literature base:** the knowledge base has 5 papers. Extend to 20+ PubMed-verified papers (PMID + abstract checked) around CAF/CXCL12/CXCR4, in the format of `research/cell-pipeline/knowledge/literature.json`.
6. **Expert labels:** obtain 50–100 expert-labelled cells (migrating / quiescent / dividing) so AI can validate the rule-based phenotypes.

### AI Model Developer
1. **Validate phenotypes:** score the rule-based labels against the expert labels from the Data Collector; publish precision/recall and thresholds. Keep the label "not clinically validated".
2. **Second dataset:** repeat segmentation and tracking on a cancer-relevant set (MDA-MB-231 and HeLa are already in the catalog) so the benchmark is not a single dataset.
3. **Tracking quality:** investigate the false division calls (1 found vs 0 real, in both U373 sequences) and the 3 identity switches in sequence 02. Add a two-channel nuclear/cytoplasmic ratio where data allows.
4. **Serve the pipeline:** wrap `src/demo.py` as an API/job (batch precompute and store masks + per-cell JSON), so the website can show segmentation without a laptop. Agree the JSON schema with Software.
5. **Model cards:** keep one per component with version, dataset, metric and limitation. Add calibration for the Cellpose confidence ("saturates near 0.95–0.97").
6. **Stability:** keep the 6-of-6 stability check in CI-like form (script already in `src/stability_check.py`).

### Software Engineer (not requested, listed because it blocks the others)
- Landing headline "From Papers to Living Cells" and subheadline from the plan.
- "View cellular evidence" button from the graph node to `/cells/[id]`; click on each graph arrow opens PMID/DOI or dataset accession.
- Social links in footer; render per-image license and attribution on every card.
- Known: pre-existing lint errors in `BioJourney.tsx`.

## 4. Open questions for the founder
1. Which Telegram handle is official?
2. Was `linkedin_post.txt` posted anywhere?
3. Are the 634 catalog records backed by image files stored somewhere outside the repo?
4. Is the public product allowed to show CTC data under the current (non-commercial) terms?
