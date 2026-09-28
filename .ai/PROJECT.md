# BioLayers AI — Project Summary

## Executive Summary
BioLayers AI is an AI-driven computational oncology platform designed to bridge the gap between fragmented biomedical literature and actionable scientific insight. The platform converts complex cancer research manuscripts into interactive, evidence-grounded mechanistic knowledge graphs, cause-and-effect causal networks (Project Cipher), and multi-channel microscopy cell atlases.

## Core Purpose
Accelerate precision cancer research and systems biology education by transforming dense, unstructured scientific text into explorable, verified visual biological networks where every node and relationship is anchored to peer-reviewed provenance.

## Tech Stack
- **Framework**: Next.js 16.2.12 (App Router with Turbopack)
- **Language**: TypeScript 5.x (Strict mode)
- **UI & Styling**: Tailwind CSS v4, PostCSS, Lucide React icons
- **Motion & Interaction**: Framer Motion 12.x, native CSS compositor animations
- **3D & Visualization**: Three.js, @react-three/fiber, @react-three/postprocessing, Canvas API
- **Backend & Auth**: Supabase (PostgreSQL, Row Level Security, PKCE Auth, encrypted Gemini BYOK API keys)
- **AI Processing**: Gemini API (User-supplied BYOK encrypted keys, with fallback ranking)
- **Scientific Ontologies**: PubMed NCBI E-Utilities, Cell Ontology (EBI OLS), calibrated microscopy atlas
- **Document Processing**: In-browser client-side extraction (`pdf-parse`, `pdfjs-dist`, `mammoth`)
- **Hosting & Deployment**: Vercel (Edge network, Analytics, Speed Insights)

## User Personas
1. **Translational Oncologist & Cancer Biologist**: Investigating drug resistance mechanisms, target pathways, and novel hypotheses across recent literature.
2. **Bioinformatics & Computational Biology Student**: Learning molecular signaling cascades and gene-protein interactions through visual causal graphs.
3. **Clinical Investigator & Physician-Scientist**: Evaluating patient-specific biomarkers and cross-referencing cell morphology with molecular phenotypes.
4. **Academic Educator & Research Mentor**: Leading workshops and seminar series in computational genomics and systems biology.
