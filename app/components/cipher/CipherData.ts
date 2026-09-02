import type { CipherDataset } from "./CipherTypes";

export const CIPHER_DATASETS: CipherDataset[] = [
  {
    id: "kras-g12d",
    title: "KRAS G12D Oncogenic Signaling Cascade",
    subtitle: "From a Single DNA Letter Swap to Uncontrolled Tumor Proliferation",
    paperDoiOrPmc: "10.1016/j.cell.2023.08.012",
    difficulty: "Beginner",
    estimatedReadTime: "4 min exploration",
    oneLineSummary:
      "See how a single amino acid substitution locks a cellular molecular switch into the 'ALWAYS ON' state, triggering a domino effect of tumor growth.",
    tour: [
      {
        nodeId: "kras-mutation",
        stepNumber: 1,
        title: "Step 1: The Root Trigger",
        concept:
          "It all begins with a single typo in the KRAS gene at codon 12. A glycine is replaced with aspartate (G12D), physically jamming the cellular 'OFF switch'.",
        questionPrompt: "What happens when a molecular switch can't turn off?",
      },
      {
        nodeId: "gtp-jam",
        stepNumber: 2,
        title: "Step 2: Molecular Jamming",
        concept:
          "Normally, KRAS burns its GTP fuel and clicks shut. With the G12D mutation, water molecules cannot reach the fuel pocket, trapping KRAS in permanent hyperactive signaling.",
      },
      {
        nodeId: "mapk-cascade",
        stepNumber: 3,
        title: "Step 3: The Domino Chain (MAPK/ERK)",
        concept:
          "Hyperactive KRAS recruits RAF, which phosphorylates MEK, which activates ERK. Like a telephone chain, the panic signal multiplies 1000-fold as it rushes into the nucleus.",
      },
      {
        nodeId: "uncontrolled-division",
        stepNumber: 4,
        title: "Step 4: The Pathological Effect",
        concept:
          "Inside the cell nucleus, the flood of ERK signals forces cyclins to ramp up, instructing the cell to bypass normal safety checkpoints and divide continuously without stopping.",
      },
      {
        nodeId: "kras-inhibitor",
        stepNumber: 5,
        title: "Step 5: Precision Therapy (The Solution)",
        concept:
          "Modern oncology researchers designed miniature synthetic lock-picks (such as MRTX1133 and Sotorasib derivatives) that slip directly into the mutated pocket, turning the switch off chemically.",
      },
    ],
    quiz: {
      question: "Why is KRAS G12D constantly stuck in the active state?",
      options: [
        "It lacks a cell membrane to bind to",
        "The G12D mutation prevents GTP hydrolysis, so it cannot turn off its fuel",
        "It produces too many ribosomes",
        "It destroys all surrounding white blood cells",
      ],
      correctIndex: 1,
      explanation:
        "Correct! The G12D mutation replaces glycine with aspartic acid, sterically blocking water molecules from hydrolyzing GTP to GDP, trapping KRAS in the active signaling conformation.",
    },
    nodes: [
      {
        id: "kras-mutation",
        label: "KRAS G12D Mutation",
        category: "trigger",
        level: 1,
        weight: 5,
        plainTitle: "The Jammed Accelerator Pedal",
        plainExplanation:
          "Imagine a car's gas pedal welded to the floorboard. A single letter change in DNA replaces glycine with aspartate, turning a careful traffic cop into an unstoppable engine.",
        academicExcerpt:
          "The oncogenic KRAS G12D substitution impairs both intrinsic and GAP-mediated GTP hydrolysis, maintaining the GTPase in a constitutively active state.",
        pronunciation: "KAY-rass G-12-D",
        keyMolecules: ["KRAS", "Codon 12", "Aspartate"],
      },
      {
        id: "egfr-stimulus",
        label: "EGFR Extracellular Signal",
        category: "trigger",
        level: 1,
        weight: 3,
        plainTitle: "The Knock at the Door",
        plainExplanation:
          "Outside growth factors bind to cell-surface antennae, sending the initial electrical signal across the cell membrane.",
        academicExcerpt:
          "Epidermal growth factor receptor (EGFR) dimerization initiates downstream nucleotide exchange factors like SOS1 to activate RAS family proteins.",
        keyMolecules: ["EGF", "EGFR", "SOS1"],
      },
      {
        id: "gtp-jam",
        label: "Defective GTP Hydrolysis",
        category: "mechanism",
        level: 2,
        weight: 4,
        plainTitle: "Battery Won't Turn Off",
        plainExplanation:
          "Cells use energy packets called GTP to power switches. KRAS G12D refuses to let go of its battery, broadcasting a non-stop 'GROW' command.",
        academicExcerpt:
          "Structural sterics of the D12 side chain disrupt the catalytic water molecule orientation required for nucleophilic attack on the gamma-phosphate of GTP.",
        keyMolecules: ["GTP", "p21-Ras", "GAP"],
      },
      {
        id: "mapk-cascade",
        label: "RAF ➔ MEK ➔ ERK Cascade",
        category: "mechanism",
        level: 2,
        weight: 5,
        plainTitle: "The Megaphone Relay Chain",
        plainExplanation:
          "KRAS whispers to RAF, RAF shouts to MEK, and MEK uses a megaphone to alert ERK. Each step amplifies the signal so the cell cannot ignore it.",
        academicExcerpt:
          "RAS-GTP promotes RAF kinase dimerization, driving sequential dual-specificity phosphorylation of MEK1/2 and subsequent activation of ERK1/2 MAP kinases.",
        keyMolecules: ["BRAF", "MEK1", "ERK2"],
      },
      {
        id: "pi3k-survival",
        label: "PI3K-AKT-mTOR Axis",
        category: "mechanism",
        level: 2,
        weight: 4,
        plainTitle: "The 'Do Not Die' Shield",
        plainExplanation:
          "A secondary parallel pathway activates that forbids the damaged cell from initiating its built-in self-destruct mechanism.",
        academicExcerpt:
          "Active KRAS binds directly to the p110 catalytic subunit of PI3K, generating PIP3 second messengers that recruit and phosphorylate AKT at Thr308 and Ser473.",
        keyMolecules: ["PI3K", "AKT", "mTORC1"],
      },
      {
        id: "myc-activation",
        label: "MYC Transcription Reprogramming",
        category: "mechanism",
        level: 2,
        weight: 3,
        plainTitle: "The Factory Master Plan",
        plainExplanation:
          "ERK travels into the nucleus and wakes up MYC, a master gene regulator that orders the cell to construct new proteins and organelles 24/7.",
        academicExcerpt:
          "Phosphorylation of MYC at Ser62 stabilizes the oncoprotein, facilitating global transcriptional rewiring and ribosome biogenesis.",
        keyMolecules: ["c-MYC", "RNA Pol I", "Cyclin D1"],
      },
      {
        id: "uncontrolled-division",
        label: "Hyperactive Cell Division",
        category: "effect",
        level: 3,
        weight: 5,
        plainTitle: "Unchecked Tumor Growth",
        plainExplanation:
          "The cell skips normal rest intervals and divides rapidly, forming a solid tumor mass that crowds out healthy organ tissue.",
        academicExcerpt:
          "Hyperactivated Cyclin D-CDK4/6 complexes hyperphosphorylate the retinoblastoma (Rb) protein, unleashing E2F transcription factors to drive continuous S-phase entry.",
        keyMolecules: ["CDK4/6", "pRb", "E2F1"],
      },
      {
        id: "glycolysis-shift",
        label: "Warburg Metabolic Shift",
        category: "effect",
        level: 3,
        weight: 3,
        plainTitle: "Sugar-Addicted Cancer Cells",
        plainExplanation:
          "Cancer cells voraciously absorb glucose to fuel rapid construction, generating lactic acid waste that damages surrounding healthy tissue.",
        academicExcerpt:
          "KRAS rewires carbon flux into the non-oxidative pentose phosphate pathway (PPP) and upregulates GLUT1 glucose transporters to meet macromolecular synthesis demands.",
        keyMolecules: ["GLUT1", "LDHA", "Hexokinase 2"],
      },
      {
        id: "immune-evasion",
        label: "T-Cell Immune Exclusion",
        category: "effect",
        level: 3,
        weight: 4,
        plainTitle: "The Stealth Invisibility Cloak",
        plainExplanation:
          "The tumor pumps out chemical smokescreens that prevent immune hunter cells (cytotoxic T-lymphocytes) from entering the tumor boundary.",
        academicExcerpt:
          "Oncogenic KRAS induces immunosuppressive cytokine production (IL-6, CXCL8) and recruits myeloid-derived suppressor cells (MDSCs) to exclude CD8+ T cells.",
        keyMolecules: ["CD8+", "CXCL8", "MDSCs"],
      },
      {
        id: "kras-inhibitor",
        label: "Targeted KRAS-G12D Inhibitor",
        category: "therapy",
        level: 4,
        weight: 5,
        plainTitle: "The Precision Molecular Wedge",
        plainExplanation:
          "A custom-designed pill (like MRTX1133) slips into the tiny mutated cleft, locking the jammed switch back into an inactive state.",
        academicExcerpt:
          "Non-covalent, highly selective small molecules reversibly bind the Switch-II pocket of KRAS G12D, trapping the protein in its GDP-bound inactive conformation.",
        keyMolecules: ["MRTX1133", "Switch-II Pocket"],
      },
      {
        id: "mek-inhibitor",
        label: "MEK/ERK Targeted Blocker",
        category: "therapy",
        level: 4,
        weight: 3,
        plainTitle: "Cutting the Signal Wire",
        plainExplanation:
          "If the switch at the top cannot be turned off, doctors use drugs like Trametinib to cut the electrical wire further downstream.",
        academicExcerpt:
          "Allosteric MEK1/2 inhibitors (Trametinib) block ERK phosphorylation, preventing downstream nuclear transcriptional output.",
        keyMolecules: ["Trametinib", "MEK1/2"],
      },
    ],
    edges: [
      {
        source: "egfr-stimulus",
        target: "kras-mutation",
        label: "Transmits signal to",
        relationshipType: "activates",
        mechanismDetail:
          "EGFR recruits SOS1, attempting to cycle GDP for GTP on the mutant KRAS protein.",
      },
      {
        source: "kras-mutation",
        target: "gtp-jam",
        label: "Directly causes",
        relationshipType: "activates",
        mechanismDetail:
          "G12D mutation physically blocks water attack, freezing the molecule in the active GTP-bound form.",
      },
      {
        source: "gtp-jam",
        target: "mapk-cascade",
        label: "Hyperactivates",
        relationshipType: "activates",
        mechanismDetail:
          "Persistent GTP conformation exposes the effector binding loop that binds and unleashes RAF kinases.",
      },
      {
        source: "gtp-jam",
        target: "pi3k-survival",
        label: "Recruits & stimulates",
        relationshipType: "activates",
        mechanismDetail:
          "Direct physical interaction with the PI3K regulatory domain activates lipid kinase cascade.",
      },
      {
        source: "mapk-cascade",
        target: "myc-activation",
        label: "Phosphorylates & stabilizes",
        relationshipType: "activates",
        mechanismDetail:
          "Active ERK migrates into the nucleus and phosphorylates MYC, preventing its normal destruction.",
      },
      {
        source: "myc-activation",
        target: "uncontrolled-division",
        label: "Forces cycle into",
        relationshipType: "activates",
        mechanismDetail:
          "MYC directly transcribes Cyclin D, forcing the cell past the restriction point into mitosis.",
      },
      {
        source: "pi3k-survival",
        target: "uncontrolled-division",
        label: "Suppresses checkpoints for",
        relationshipType: "activates",
        mechanismDetail:
          "AKT blocks pro-apoptotic proteins Bad and Caspase-9, ensuring the mutant cell does not perish.",
      },
      {
        source: "gtp-jam",
        target: "glycolysis-shift",
        label: "Shifts metabolism to",
        relationshipType: "transforms",
        mechanismDetail:
          "KRAS activates hexokinase, diverting glucose toward fast building blocks rather than slow respiration.",
      },
      {
        source: "mapk-cascade",
        target: "immune-evasion",
        label: "Releases cytokines for",
        relationshipType: "transforms",
        mechanismDetail:
          "ERK signaling drives production of suppressive chemokines that blind incoming immune T-cells.",
      },
      {
        source: "kras-inhibitor",
        target: "gtp-jam",
        label: "Chemically locks & shuts off",
        relationshipType: "inhibits",
        mechanismDetail:
          "The drug binds Switch-II, stabilizing the off-state and depriving the cascade of its main spark.",
      },
      {
        source: "mek-inhibitor",
        target: "mapk-cascade",
        label: "Severely blocks",
        relationshipType: "inhibits",
        mechanismDetail:
          "Allosterically wedges inside MEK kinase, neutralizing signal before it reaches the cell nucleus.",
      },
    ],
  },
  {
    id: "hallmarks-dedifferentiation",
    title: "Epigenetic Rewiring & Cellular Dedifferentiation",
    subtitle: "Hallmarks of Cancer: When Mature Cells Forget Their Identity",
    paperDoiOrPmc: "10.1098/rsob.210358",
    difficulty: "Intermediate",
    estimatedReadTime: "5 min exploration",
    oneLineSummary:
      "Explore how tumors erase their cell identity (dedifferentiation) using epigenetic molecular tags to become untargetable shapeshifters.",
    tour: [
      {
        nodeId: "epigenetic-disruption",
        stepNumber: 1,
        title: "Step 1: The Epigenetic Scramble",
        concept:
          "DNA isn't just a code; it is wrapped on molecular spools called histones. Cancer enzymes chemically modify these spools to lock away normal tissue programs.",
      },
      {
        nodeId: "lineage-loss",
        stepNumber: 2,
        title: "Step 2: Identity Amnesia",
        concept:
          "As healthy identity markers turn off, a breast, lung, or skin cell forgets what organ it was built to serve.",
      },
      {
        nodeId: "stemness-acquisition",
        stepNumber: 3,
        title: "Step 3: Gaining Stem Cell Plasticity",
        concept:
          "Reverting into an embryonic-like 'cancer stem cell', it gains the terrifying superpower to morph into multiple cell types on demand.",
      },
      {
        nodeId: "chemo-resistance",
        stepNumber: 4,
        title: "Step 4: Therapy Resistance",
        concept:
          "Standard chemotherapies look for specific targets. Because these shapeshifting cells change form, chemotherapy bounces right off them.",
      },
      {
        nodeId: "epigenetic-therapy",
        stepNumber: 5,
        title: "Step 5: Epigenetic Re-education",
        concept:
          "By inhibiting chromatin silencers like EZH2, oncologists can force the mutant cell to re-learn its identity and regain sensitivity to drugs.",
      },
    ],
    quiz: {
      question: "What superpower does cellular dedifferentiation give to cancer cells?",
      options: [
        "It forces the tumor to generate healthy hemoglobin",
        "It erases adult cell identity and confers drug-resistant stem cell plasticity",
        "It locks the cancer cells permanently into apoptosis",
        "It makes the cell vulnerable to every known antibiotic",
      ],
      correctIndex: 1,
      explanation:
        "Correct! Dedifferentiation allows specialized cells to revert into plastic, stem-like states, letting them morph shapes, crawl into blood vessels, and survive toxic chemotherapies.",
    },
    nodes: [
      {
        id: "epigenetic-disruption",
        label: "Epigenetic Modifier Dysregulation",
        category: "trigger",
        level: 1,
        weight: 5,
        plainTitle: "The Scrambled Instruction Bookmarks",
        plainExplanation:
          "Think of DNA as a massive library. Epigenetics places bookmarks telling cells which pages to read. Cancer mutates the bookmarks so the cell reads the wrong pages.",
        academicExcerpt:
          "Alterations in histone methyltransferases (e.g. EZH2) and chromatin remodelers facilitate widespread genome-wide chromatin remodeling in carcinomas.",
        pronunciation: "ep-i-jen-ET-ik / ee-ZEE-aych-too",
        keyMolecules: ["EZH2", "DNMT3A", "H3K27me3"],
      },
      {
        id: "lineage-loss",
        label: "Loss of Tissue Lineage Markers",
        category: "mechanism",
        level: 2,
        weight: 4,
        plainTitle: "Cellular Amnesia",
        plainExplanation:
          "A specialized lung cell stops producing surfactant; a pancreatic cell stops producing enzymes. They forget their original specialty.",
        academicExcerpt:
          "Repression of terminal differentiation transcription factors causes loss of lineage fidelity, a hallmark of malignant progression.",
        keyMolecules: ["CDH1", "GATA3", "Cytokeratins"],
      },
      {
        id: "stemness-acquisition",
        label: "Stem Cell Plasticity & Oct4/Sox2",
        category: "mechanism",
        level: 2,
        weight: 5,
        plainTitle: "Reverting to Embryonic Stem State",
        plainExplanation:
          "The cell wakes up embryonic genes that are supposed to sleep after birth, granting the cancer cell infinite rejuvenation powers.",
        academicExcerpt:
          "Re-expression of pluripotency circuit transcription factors (OCT4, SOX2, NANOG) confers self-renewal capability and stem-like tumorigenicity.",
        keyMolecules: ["OCT4", "SOX2", "NANOG"],
      },
      {
        id: "emt-activation",
        label: "Epithelial-to-Mesenchymal Shift (EMT)",
        category: "mechanism",
        level: 2,
        weight: 4,
        plainTitle: "From Bricks to Mobile Crawlers",
        plainExplanation:
          "Cells usually stay locked together like building bricks. EMT unglues them, letting individual cancer cells crawl through blood vessels.",
        academicExcerpt:
          "SNAIL and TWIST induce loss of E-cadherin, promoting cytoskeleton reorganization and dynamic mesenchymal motility.",
        keyMolecules: ["SNAIL", "TWIST", "Vimentin"],
      },
      {
        id: "chemo-resistance",
        label: "Chemotherapeutic Drug Resistance",
        category: "effect",
        level: 3,
        weight: 5,
        plainTitle: "Chemotherapy Bounces Off",
        plainExplanation:
          "Because the cells can change their shape and hide in slow-cycling dormant states, conventional chemotherapies cannot find or kill them.",
        academicExcerpt:
          "Dedifferentiated cancer stem cells express high levels of ABC-family drug efflux pumps and maintain elevated antioxidant buffering.",
        keyMolecules: ["ABCB1", "ALDH1", "GSH"],
      },
      {
        id: "metastasis",
        label: "Distant Metastatic Seeding",
        category: "effect",
        level: 3,
        weight: 4,
        plainTitle: "Spreading to Other Organs",
        plainExplanation:
          "The unglued shapeshifting cells break into the bloodstream, travel to distant organs like the brain, liver, or bone, and form secondary colonies.",
        academicExcerpt:
          "Disseminated tumor cells colonize distant pre-metastatic niches, resisting detachment-induced apoptosis (anoikis).",
        keyMolecules: ["MMP9", "VEGF-A", "Integrins"],
      },
      {
        id: "epigenetic-therapy",
        label: "EZH2 / HDAC Epigenetic Inhibitor",
        category: "therapy",
        level: 4,
        weight: 4,
        plainTitle: "Re-educating the Cell",
        plainExplanation:
          "Drugs like Tazemetostat inhibit the enzymes that scrambled the bookmarks, forcing the cancer cell to mature and remember how to die.",
        academicExcerpt:
          "Selective EZH2 catalytic inhibition decreases repressive H3K27me3 marks, derepressing lineage-defining differentiation gene cassettes.",
        keyMolecules: ["Tazemetostat", "Vorinostat"],
      },
    ],
    edges: [
      {
        source: "epigenetic-disruption",
        target: "lineage-loss",
        label: "Silences identity genes",
        relationshipType: "transforms",
        mechanismDetail:
          "Hyper-methylation locks promoter regions of adult tissue differentiation markers.",
      },
      {
        source: "lineage-loss",
        target: "stemness-acquisition",
        label: "Releases barrier to",
        relationshipType: "activates",
        mechanismDetail:
          "Absence of lineage repressors derepresses primitive embryonic gene networks.",
      },
      {
        source: "stemness-acquisition",
        target: "emt-activation",
        label: "Drives migratory program",
        relationshipType: "activates",
        mechanismDetail:
          "Embryonic factors induce SNAIL and SLUG, dissolving tight junctions.",
      },
      {
        source: "stemness-acquisition",
        target: "chemo-resistance",
        label: "Confers multi-drug survival",
        relationshipType: "activates",
        mechanismDetail:
          "Plastic cells activate ABC transporters and slow their cell cycle to evade antimitotics.",
      },
      {
        source: "emt-activation",
        target: "metastasis",
        label: "Enables tissue invasion",
        relationshipType: "transforms",
        mechanismDetail:
          "Detached mesenchymal cells secrete collagenases and invade vascular walls.",
      },
      {
        source: "epigenetic-therapy",
        target: "epigenetic-disruption",
        label: "Blocks repressive methyltransferase",
        relationshipType: "inhibits",
        mechanismDetail:
          "Restores normal chromatin opening so cells resume standard programmed senescence.",
      },
    ],
  },
  {
    id: "p53-checkpoint",
    title: "p53 DNA Damage Checkpoint & Apoptosis",
    subtitle: "Guardian of the Genome: What Happens When the Smoke Detector Fails",
    paperDoiOrPmc: "10.1038/s41568-022-00508-3",
    difficulty: "Beginner",
    estimatedReadTime: "3 min exploration",
    oneLineSummary:
      "Witness how healthy cells use p53 to self-destruct when their DNA is damaged — and how cancer turns off this guardian to survive with scrambled chromosomes.",
    tour: [
      {
        nodeId: "dna-breaks",
        stepNumber: 1,
        title: "Step 1: Severe DNA Damage",
        concept:
          "Ultraviolet radiation, chemical carcinogens, or replication stress rip double-stranded cuts in DNA.",
      },
      {
        nodeId: "atm-sensor",
        stepNumber: 2,
        title: "Step 2: Sounding the Alarm",
        concept:
          "Sensor kinases ATM and ATR detect the broken ends and phosphorylate p53, preventing its normal recycling.",
      },
      {
        nodeId: "tp53-mutation",
        stepNumber: 3,
        title: "Step 3: The Broken Guardian (Cancer)",
        concept:
          "Over 50% of human cancers mutate TP53. The protein becomes a broken key that can no longer bind DNA.",
      },
      {
        nodeId: "apoptosis-failure",
        stepNumber: 4,
        title: "Step 4: Evading Self-Destruction",
        concept:
          "Without functional p53, death enzymes (BAX/BAK) are never ordered to poke holes in mitochondria. The damaged cell refuses to die.",
      },
      {
        nodeId: "mdm2-antagonist",
        stepNumber: 5,
        title: "Step 5: Awakening Dormant p53",
        concept:
          "In tumors where p53 is intact but suppressed by MDM2, molecular drugs called Nutlins pull off the suppressor to trigger tumor suicide.",
      },
    ],
    quiz: {
      question: "Under normal healthy conditions, what does p53 do when double-strand DNA breaks occur?",
      options: [
        "It speeds up cell division without fixing errors",
        "It halts the cell cycle to allow repair, or triggers apoptosis if damage is irreparable",
        "It suppresses white blood cells and immune surveillance",
        "It creates glucose molecules out of lactic acid",
      ],
      correctIndex: 1,
      explanation:
        "Correct! Known as the 'Guardian of the Genome', p53 holds the cell at the G1/S checkpoint to fix DNA or commands the cell to self-destruct (apoptosis) via BAX/PUMA if the damage is beyond repair.",
    },
    nodes: [
      {
        id: "dna-breaks",
        label: "Double-Strand DNA Breaks",
        category: "trigger",
        level: 1,
        weight: 5,
        plainTitle: "Ripped DNA Strands",
        plainExplanation:
          "UV light or toxic chemicals snap the double helix, like tearing a critical blueprint in half.",
        academicExcerpt:
          "Ionizing radiation and replication fork stalling induce DNA double-strand breaks (DSBs) exposing free DNA ends.",
        pronunciation: "D-N-A breaks",
        keyMolecules: ["DSB", "gamma-H2AX", "ROS"],
      },
      {
        id: "atm-sensor",
        label: "ATM / CHK2 Sensor Kinases",
        category: "mechanism",
        level: 2,
        weight: 4,
        plainTitle: "The Emergency Smoke Alarm",
        plainExplanation:
          "Patrolling security proteins clamp onto the broken DNA ends and immediately sound an alarm throughout the nucleus.",
        academicExcerpt:
          "Mre11-Rad50-Nbs1 (MRN) complex recruits ATM kinase, triggering autophosphorylation and activation of checkpoint kinase CHK2.",
        keyMolecules: ["ATM", "ATR", "CHK2"],
      },
      {
        id: "tp53-mutation",
        label: "p53 Guardian Activation / Loss",
        category: "mechanism",
        level: 2,
        weight: 5,
        plainTitle: "Guardian of the Genome",
        plainExplanation:
          "Healthy p53 halts cell division to fix DNA or orders suicide. When cancer mutates p53, the guardian is handcuffed.",
        academicExcerpt:
          "Phosphorylation at Ser15 and Ser20 prevents MDM2-mediated polyubiquitination, elevating p53 tetrameric transcription factor levels.",
        keyMolecules: ["TP53", "MDM2", "p21"],
      },
      {
        id: "bax-mitochondria",
        label: "BAX/PUMA Mitochondrial Perforation",
        category: "mechanism",
        level: 2,
        weight: 4,
        plainTitle: "The Self-Destruct Switch",
        plainExplanation:
          "p53 transcribes pore-forming proteins that punch microscopic holes into mitochondria, leaking Cytochrome C to begin apoptosis.",
        academicExcerpt:
          "p53 directly upregulates BH3-only proteins PUMA and NOXA, neutralizing BCL-2 and promoting BAX/BAK mitochondrial outer membrane permeabilization (MOMP).",
        keyMolecules: ["BAX", "PUMA", "Cytochrome C"],
      },
      {
        id: "apoptosis-failure",
        label: "Evasion of Programmed Cell Death",
        category: "effect",
        level: 3,
        weight: 5,
        plainTitle: "The Immortal Zombie Cell",
        plainExplanation:
          "Even with shredded DNA, the cancer cell continues living and dividing, accumulating catastrophic chromosomal errors.",
        academicExcerpt:
          "Loss of p53 eliminates the intrinsic apoptotic threshold, enabling propagation of structurally deranged, aneuploid genomes.",
        keyMolecules: ["Caspase-3", "Aneuploidy", "PARP"],
      },
      {
        id: "mdm2-antagonist",
        label: "MDM2-p53 Antagonist (Nutlins)",
        category: "therapy",
        level: 4,
        weight: 4,
        plainTitle: "Freeing the Handcuffed Guardian",
        plainExplanation:
          "In cancers where p53 is trapped by MDM2, Nutlins block the trap, allowing p53 to break free and trigger cancer death.",
        academicExcerpt:
          "Cis-imidazoline analogs (Nutlin-3a / Idasanutlin) competitively displace MDM2 from the transactivation domain of wild-type p53.",
        keyMolecules: ["Idasanutlin", "Nutlin-3a"],
      },
    ],
    edges: [
      {
        source: "dna-breaks",
        target: "atm-sensor",
        label: "Triggers kinase sensor",
        relationshipType: "activates",
        mechanismDetail:
          "Free DNA ends recruit the MRN complex, activating ATM autophosphorylation.",
      },
      {
        source: "atm-sensor",
        target: "tp53-mutation",
        label: "Phosphorylates & stabilizes",
        relationshipType: "activates",
        mechanismDetail:
          "Phosphorylation blocks MDM2 from tagging p53 for proteasomal destruction.",
      },
      {
        source: "tp53-mutation",
        target: "bax-mitochondria",
        label: "Transcribes death effectors",
        relationshipType: "activates",
        mechanismDetail:
          "Functional p53 binds PUMA promoters, causing mitochondrial outer membrane leakage.",
      },
      {
        source: "bax-mitochondria",
        target: "apoptosis-failure",
        label: "If intact: triggers death (If mutated: fails)",
        relationshipType: "inhibits",
        mechanismDetail:
          "When p53 is mutated or missing, BAX never opens, blocking caspase execution.",
      },
      {
        source: "mdm2-antagonist",
        target: "tp53-mutation",
        label: "Liberates from MDM2 suppression",
        relationshipType: "activates",
        mechanismDetail:
          "Displaces MDM2, allowing native p53 to accumulate and destroy the malignant cell.",
      },
    ],
  },
];
