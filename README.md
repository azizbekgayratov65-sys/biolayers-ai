# BioLayers AI

**AI-Driven Computational Oncology Platform** — Bridging the gap between fragmented biomedical literature and actionable scientific discovery.

BioLayers AI transforms complex cancer research papers and scientific manuscripts into interactive, evidence-grounded mechanistic knowledge graphs, causal signaling networks, and biological exploration workspaces where every node and relationship is anchored to peer-reviewed provenance.

---

## 🔬 Key Capabilities

- **Paper to Mechanistic Knowledge Graph**: Upload scientific papers (PDF, DOCX) or fetch via PubMed/DOI. BioLayers AI extracts key biological entities, pathways, interventions, and causal interactions into interactive graphs using Google Gemini.
- **Evidence-Grounded Provenance**: Click on any node, edge, or pathway to view the exact citation and verbatim excerpt from the source publication.
- **Interactive Workspaces**:
  - **Mind Map Workspace (`/mindmap`)**: Dynamic node-link diagrams powered by `@xyflow/react` and Dagre for visualizing cancer signaling pathways, gene-protein interactions, and therapeutic targets.
  - **Cell Atlas (`/cells`)**: Explore cellular structures, phenotypes, and morphology integrated with the EMBL-EBI Cell Ontology (OLS).
  - **Project Cipher (`/cipher`)**: Causal inference and mechanistic hypothesis tracking across multi-step biological cascades.
  - **3D Cell Simulation (`/journey`)**: Immersive 3D cellular environment rendered via Three.js and React Three Fiber.
  - **Research Library (`/library`)**: Organize, search, and revisit previously processed manuscripts and synthesized knowledge graphs.
- **Gemini BYOK (Bring Your Own Key)**: Users can configure their own Gemini API key in Settings. Keys are encrypted server-side using AES-256-GCM before storage in Supabase.
- **Live Scientific Ontologies**: Built-in integrations with NCBI PubMed (E-Utilities) for literature lookups and EMBL-EBI Cell Ontology for standardized cell terminology.
- **Dark-Field Scientific UI**: Designed with Tailwind CSS v4 featuring dark-field microscopy aesthetics and semantic fluorophore color channels (DAPI cyan, FITC emerald, Cy5 violet, YFP amber, RFP rose).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Animation & 3D** | [Framer Motion](https://www.framer.com/motion/), [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/) |
| **Graph Visualization** | [@xyflow/react](https://reactflow.dev/) (React Flow) & [@dagrejs/dagre](https://github.com/dagrejs/dagre) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, PKCE Auth) |
| **AI & LLM** | [Google Gemini API](https://ai.google.dev/) (BYOK with AES-256-GCM encryption & model fallback ranking) |
| **Document Processing** | `pdf-parse`, `pdfjs-dist`, `mammoth` |
| **Ontologies & APIs** | NCBI PubMed E-Utilities, EMBL-EBI Ontology Lookup Service (OLS) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `20.x` or later
- **npm** (or `pnpm` / `yarn`)
- A **Supabase** project (for authentication and paper persistence)
- A **Google Gemini API key** (or set up BYOK directly in the user Settings UI)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/azizbekgayratov65-sys/biolayers-ai.git
   cd biolayers-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the project root based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in the required credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   SUPABASE_SECRET_KEY=your-supabase-secret-key
   SUPABASE_SECRET_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Encryption key for securing BYOK user API keys (32-byte hex string)
   GEMINI_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
   ```

4. **Run database migrations**:
   Apply the SQL migration file in your Supabase SQL editor:
   - `supabase/migrations/0001_init.sql`

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📁 Repository Structure

```
biolayers-ai/
├── app/
│   ├── (public)/          # Landing, about, partners, press, platform
│   ├── api/               # Next.js route handlers
│   │   ├── cells/         # Cell ontology lookups (EBI OLS)
│   │   ├── gemini/        # Gemini AI inference & BYOK key management
│   │   ├── mindmap/       # Graph generation & node operations
│   │   ├── papers/        # Paper persistence & metadata
│   │   └── pubmed/        # NCBI E-utilities integration
│   ├── cells/             # Cell Atlas interactive viewer
│   ├── cipher/            # Project Cipher causal reasoning workspace
│   ├── components/        # Reusable UI components & section layouts
│   ├── journey/           # 3D spatial cell simulation
│   ├── lib/               # Auth helpers, encryption, AI model orchestration
│   ├── library/           # Saved papers and knowledge graph library
│   ├── login/ & signup/   # Authentication pages (Supabase PKCE)
│   ├── mindmap/           # Interactive paper mind map workspace
│   └── settings/          # User preferences and encrypted Gemini BYOK key settings
├── public/                # Static assets, diagrams, and textures
├── supabase/
│   └── migrations/        # PostgreSQL schema, RLS policies, tables
├── proxy.ts               # Next.js 16 session proxy & route protection
└── package.json           # Scripts and dependencies
```

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: All user papers, graphs, and settings stored in Supabase are protected by PostgreSQL RLS policies; users can only access their own data.
- **BYOK Key Encryption**: User-provided Gemini API keys are never stored in plaintext. They are encrypted at rest using AES-256-GCM with a server-side encryption key (`GEMINI_ENCRYPTION_KEY`).
- **Client-Side Document Parsing**: Documents are parsed locally/server-side without transmitting raw files to unverified third parties.

---

## ⚠️ Disclaimer

BioLayers AI is designed strictly for scientific research, systems biology education, and academic hypothesis generation. It is **not a medical device** and is **not intended for clinical diagnosis, treatment planning, or medical decision-making**. All findings should be independently validated against primary literature and experimental assays.

---

## 📄 License

This project is licensed under the MIT License.
