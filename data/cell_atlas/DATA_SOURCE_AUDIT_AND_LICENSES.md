# BioLayers Cell Atlas — Data Source Legal Audit & License Registry
**Document ID:** BL-LEG-AUDIT-2026-v1  
**Curator:** BioLayers Data Collection & Bioimage Curation Team  
**Sprint:** 8 September – 1 October 2026  
**Audience:** Founders, Software Engineers, Legal Advisors, AI Researchers

---

## 1. Executive Summary & Legal Charter

The BioLayers Cell Atlas operates under a foundational non-negotiable rule:
> **"Никогда не загружать изображение в BioLayers без записи provenance и прав использования. No AI-generated microscopy images in the primary scientific database."**

Every image and frame served on the platform (or utilized by internal AI segmentation/tracking models) is subjected to an exhaustive legal audit verifying:
1. Exact intellectual property (IP) license type and governing jurisdiction.
2. Permissibility of commercial exploitation and SaaS platform hosting.
3. Rights of digital redistribution, derivative work generation, and public exhibition.
4. Mandatory attribution requirements and citation formatting.
5. Specific restrictions on redistribution format, third-party benchmark challenges, and medical device disclaimers.

---

## 2. Comprehensive Source Audit

### 2.1. Tier 1: Broad Bioimage Benchmark Collection (BBBC)
* **Governing Body:** Broad Institute of MIT and Harvard (Imaging Platform, Anne E. Carpenter Lab).
* **Official URL:** `https://bbbc.broadinstitute.org`
* **License Designation:** **Creative Commons Zero (CC0 1.0 Universal) Public Domain Dedication**.
* **Legal Assessment:**
  - **Commercial Use:** **Unconditionally Permitted**. No restrictions on commercialization, enterprise access, or incorporation into closed-source software products.
  - **Redistribution:** **Unconditionally Permitted**. Images, metadata, and ground truth annotations can be redistributed, sublicensed, and modified without copyright claims.
  - **Attribution Requirement:** Although CC0 waives copyright-based attribution obligations, **academic ethics and BioLayers standard protocol require formal citation** of both the dataset accession and original founding publication.
  - **Production Deployment Status:** **TIER 1 GREEN — FULL PRODUCTION READY**. BBBC datasets (BBBC039, BBBC021, BBBC018, BBBC007, BBBC020, BBBC041, BBBC026, BBBC006) form the bedrock of the BioLayers Cell Atlas public database.

---

### 2.2. Tier 2: Cell Tracking Challenge (CTC)
* **Governing Body:** Cell Tracking Challenge Consortium (University of Heidelberg, Masaryk University, Erasmus MC, Institut Pasteur).
* **Official URL:** `https://celltrackingchallenge.net`
* **Conditions of Use Specification:**
  The Cell Tracking Challenge data sets are contributed by diverse international biological imaging laboratories under specific Challenge Participation and Data Access Terms:
  1. **Academic & Challenge Use:** Freely accessible for participating in the ongoing Cell Tracking Challenge and for non-commercial academic research.
  2. **Non-CTC Scientific Publication:** Permitted provided that:
     - The benchmark summary paper (*Ulman et al., Nature Methods 2017* or *Maška et al., Bioinformatics 2014*) is formally cited.
     - The original experimental lab that generated the dataset is credited in the acknowledgments/methods section.
  3. **Commercial & Public Non-CTC Deployment:**
     - CTC terms explicitly state: *"If you intend to use the data for commercial purposes or for public benchmarking outside the official challenge framework, explicit written permission must be obtained from the respective dataset contributors."*
* **BioLayers Production Strategy & Compliance:**
  - For the **BioLayers v1.0 Launch (1 October 2026)**, CTC datasets (e.g. `Fluo-N2DL-HeLa`, `DIC-C2DH-HeLa`, `Fluo-N2DH-GOWT1`, `Fluo-C2DL-Huh7`) are classified as **Research & Educational Benchmark (Tier 2)**.
  - **Public Display:** Rendered under fair academic attribution with interactive disclaimer: *"Sourced from Cell Tracking Challenge under Academic Research Terms. Contributed by Heidelberg University / Masaryk University. Non-commercial scientific evaluation."*
  - **Commercial Tier Separation:** Any enterprise API querying CTC-derived frames directly will route through our fully open CC-BY / CC0 equivalents (e.g., BioImage Archive S-BIAD collections) unless explicit commercial clearance is signed with the dataset contributor.
  - **Production Deployment Status:** **TIER 2 AMBER — ACADEMIC / BENCHMARK READY (Commercial access restricted)**.

---

### 2.3. Tier 3: Allen Cell Explorer
* **Governing Body:** Allen Institute for Cell Science (Seattle, WA, USA).
* **Official URL:** `https://www.allencell.org`
* **License Designation:** **Creative Commons Attribution-NonCommercial 4.0 International (CC-BY-NC 4.0)** / Allen Institute Open Science Terms.
* **Legal Assessment:**
  - **Commercial Use:** **Non-Commercial Only** without bilateral enterprise licensing. Commercial sale or charging paywalls for the raw Allen images is prohibited.
  - **Redistribution:** Permitted for educational, scientific, and non-commercial visualization platforms provided clear attribution is given: *"Data courtesy of the Allen Institute for Cell Science."*
  - **Viewer Benchmark:** Using the Allen Cell Explorer 3D data formats, OME-Zarr coordinates, and visual layouts as an UX benchmark or reference standard is fully compliant.
  - **Production Deployment Status:** **TIER 3 BLUE — NON-COMMERCIAL EDUCATIONAL & 3D BENCHMARK READY**.

---

### 2.4. Tier 4: Human Protein Atlas (HPA Cell Atlas)
* **Governing Body:** Science for Life Laboratory (SciLifeLab, KTH Royal Institute of Technology, Stockholm, Sweden).
* **Official URL:** `https://www.proteinatlas.org/about/licence`
* **License Designation:** **Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)** / CC-BY 3.0.
* **Legal Assessment:**
  - **Commercial Use:** **Permitted** provided that derivative databases or modifications are shared under compatible open-science licenses (ShareAlike clause) and appropriate attribution is preserved.
  - **Redistribution:** Permitted.
  - **Attribution Clause:** Must cite *Thul et al., Science 2017* and *Uhlén et al., Science 2015* and include a link to the corresponding Protein Atlas entry URL.
  - **Production Deployment Status:** **TIER 4 PURPLE — FULL MOLECULAR LAYER READY (ShareAlike compliant)**.

---

### 2.5. BioImage Archive (EMBL-EBI) & Flagship Study
* **Governing Body:** European Molecular Biology Laboratory - European Bioinformatics Institute (EMBL-EBI, Hinxton, UK).
* **Official URL:** `https://www.ebi.ac.uk/bioimage-archive/`
* **License Designation:** **Creative Commons Attribution 4.0 International (CC-BY 4.0)** / CC0 depending on study submission accession (e.g., S-BIAD823).
* **Legal Assessment:**
  - **Commercial Use:** **Permitted**.
  - **Redistribution:** **Permitted**.
  - **Attribution Clause:** Retain author attribution (*Orimo et al. / Feig et al.*) and accession ID.
  - **Production Deployment Status:** **TIER 1 GREEN — FULL PRODUCTION READY**.

---

## 3. License & Attribution Registry Matrix

| Dataset ID | Provider | Primary License | Commercial Use | Redistribution | Required Citation | Compliance Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BBBC039v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Caicedo et al., Nat Methods 2019 | Approved for Production |
| **BBBC021v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Caie et al., Chem Biol 2010 | Approved for Production |
| **BBBC018v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Moffat et al., Cell 2006 | Approved for Production |
| **BBBC007v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Jones et al., J Biomol Screen 2008 | Approved for Production |
| **BBBC020v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Ljosa et al., BBBC 2012 | Approved for Production |
| **BBBC041v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Ljosa et al., BBBC 2012 | Approved for Production |
| **BBBC026v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Carpenter et al., Genome Biol 2006| Approved for Production |
| **BBBC006v1** | Broad Institute | CC0 1.0 Universal | **Permitted** | **Unrestricted** | Logan et al., BioTechniques 2016 | Approved for Production |
| **CTC-Fluo-HeLa**| Heidelberg/CTC | CTC Academic Lic.| Restricted | Permitted (Acad.)| Maška et al., Bioinformatics 2014| Academic Demo Mode |
| **CTC-DIC-HeLa** | Heidelberg/CTC | CTC Academic Lic.| Restricted | Permitted (Acad.)| Ulman et al., Nat Methods 2017 | Academic Demo Mode |
| **CTC-GOWT1** | MPI / CTC | Academic Open | Restricted | Permitted (Acad.)| Schöler / Maška et al., 2014 | Academic Demo Mode |
| **CTC-Huh7** | CTC Consortium | CTC Academic Lic.| Restricted | Permitted (Acad.)| Ulman et al., Nat Methods 2017 | Academic Demo Mode |
| **CTC-MDA-MB231**| BioImage Archive | CC-BY 4.0 | **Permitted** | **Permitted (Attrib.)**| Simpson et al., Nat Cell Biol 2008| Approved for Production |
| **ACS-WTC11-3D** | Allen Institute | CC-BY-NC 4.0 | Non-Commercial | Permitted (NC) | Viana et al., Nature 2023 | Non-Commercial Ready |
| **HPA-Atlas-v23** | SciLifeLab / HPA | CC-BY-SA 4.0 | **Permitted (SA)**| **Permitted (SA)** | Thul et al., Science 2017 | ShareAlike Production |
| **BL-CASE-CAF** | BioImage / BBBC | CC-BY 4.0 | **Permitted** | **Permitted (Attrib.)**| Orimo et al., Cell 2005; Feig 2013 | **Flagship Core Approved** |

---

## 4. Software Enforcement & Verification Hooks

To prevent accidental license violations in future commits, the following automated safeguards are deployed:
1. **Schema Check:** Every image record must contain a valid `license`, `commercial_use`, and `redistribution_allowed` field matching our predefined enumerations.
2. **API Filtering:** The BioLayers `/api/cells` endpoint exposes a query parameter `?commercial_only=true` which automatically filters out datasets bearing `Non-Commercial Only` or `Restricted` tags.
3. **UI Badging:** All cards on `/cells` display a verified shield icon with license label (`CC0`, `CC-BY 4.0`, `Academic Benchmark`, `CC-BY-NC`) linked to the canonical license text.
