import type { Citation, CipherDataset } from "./CipherTypes";

/*
  Project Cipher content.

  Every citation below was checked against PubMed (October 2026): the PMID,
  title and DOI match. Plain-language text simplifies on purpose; the
  technical text is our own summary in field terms, not a quotation.
  When you add or change a claim, add the paper that supports it.
*/

const ref = (label: string, pmid: string, doi?: string, context?: string): Citation => ({
  label,
  pmid,
  doi,
  context,
});

const C = {
  // RAS / KRAS
  simanshu2017: ref("Simanshu et al., Cell 2017 (review)", "28666118", "10.1016/j.cell.2017.06.009"),
  hunter2015: ref("Hunter et al., Mol Cancer Res 2015", "26037647", "10.1158/1541-7786.MCR-15-0203"),
  rodriguezViciana1994: ref("Rodriguez-Viciana et al., Nature 1994", "8052307", "10.1038/370527a0"),
  datta1997: ref("Datta et al., Cell 1997", "9346240", "10.1016/s0092-8674(00)80405-5"),
  sears2000: ref("Sears et al., Genes Dev 2000", "11018017", "10.1101/gad.836800"),
  ying2012: ref(
    "Ying et al., Cell 2012",
    "22541435",
    "10.1016/j.cell.2012.01.058",
    "Mouse models of pancreatic cancer.",
  ),
  pylayevaGupta2012: ref(
    "Pylayeva-Gupta et al., Cancer Cell 2012",
    "22698407",
    "10.1016/j.ccr.2012.04.024",
    "Mouse models of pancreatic cancer.",
  ),
  wang2022: ref("Wang et al., J Med Chem 2022", "34889605", "10.1021/acs.jmedchem.1c01688"),
  hallin2022: ref(
    "Hallin et al., Nat Med 2022",
    "36216931",
    "10.1038/s41591-022-02007-7",
    "Cell lines and mouse tumour models, not patients.",
  ),
  canon2019: ref("Canon et al., Nature 2019", "31666701", "10.1038/s41586-019-1694-1"),
  blumenschein2015: ref(
    "Blumenschein et al., Ann Oncol 2015",
    "25722381",
    "10.1093/annonc/mdv072",
    "Randomised phase II trial in KRAS-mutant lung cancer.",
  ),
  hanahan2022: ref("Hanahan, Cancer Discov 2022 (review)", "35022204", "10.1158/2159-8290.CD-21-1059"),

  // Plasticity / dedifferentiation
  senga2021: ref("Senga & Grose, Open Biol 2021 (review)", "33465324", "10.1098/rsob.200358"),
  kim2016: ref("Kim & Roberts, Nat Med 2016 (review)", "26845405", "10.1038/nm.4036"),
  cao2008: ref("Cao et al., Oncogene 2008", "18806826", "10.1038/onc.2008.333"),
  thiery2009: ref("Thiery et al., Cell 2009 (review)", "19945376", "10.1016/j.cell.2009.11.007"),
  mani2008: ref("Mani et al., Cell 2008", "18485877", "10.1016/j.cell.2008.03.027"),
  benPorath2008: ref(
    "Ben-Porath et al., Nat Genet 2008",
    "18443585",
    "10.1038/ng.127",
    "An association in patient tumours, not a demonstrated cause.",
  ),
  dean2005: ref("Dean et al., Nat Rev Cancer 2005 (review)", "15803154", "10.1038/nrc1590"),
  gounder2020: ref(
    "Gounder et al., Lancet Oncol 2020",
    "33035459",
    "10.1016/S1470-2045(20)30451-4",
    "Phase 2 trial in epithelioid sarcoma with INI1 loss.",
  ),

  // p53
  leePaull2005: ref("Lee & Paull, Science 2005", "15790808", "10.1126/science.1108297"),
  banin1998: ref("Banin et al., Science 1998", "9733514", "10.1126/science.281.5383.1674"),
  shieh1997: ref("Shieh et al., Cell 1997", "9363941", "10.1016/s0092-8674(00)80416-x"),
  elDeiry1993: ref("el-Deiry et al., Cell 1993", "8242752", "10.1016/0092-8674(93)90500-p"),
  nakano2001: ref("Nakano & Vousden, Mol Cell 2001", "11463392", "10.1016/s1097-2765(01)00214-3"),
  chipuk2004: ref("Chipuk et al., Science 2004", "14963330", "10.1126/science.1092734"),
  olivier2010: ref("Olivier et al., Cold Spring Harb Perspect Biol 2010 (review)", "20182602", "10.1101/cshperspect.a001008"),
  kandoth2013: ref("Kandoth et al., Nature 2013", "24132290", "10.1038/nature12634"),
  vassilev2004: ref(
    "Vassilev et al., Science 2004",
    "14704432",
    "10.1126/science.1092472",
    "Cell lines and mouse tumour models.",
  ),

  // Flagship: CAF / CXCL12 / CXCR4 (from research/cell-pipeline/knowledge/literature.json)
  orimo2005: ref(
    "Orimo et al., Cell 2005",
    "15882617",
    "10.1016/j.cell.2005.02.034",
    "Human breast carcinoma fibroblasts in a co-implantation mouse model; not glioma.",
  ),
  rempel2000: ref(
    "Rempel et al., Clin Cancer Res 2000",
    "10656438",
    undefined,
    "Immunohistochemistry of human astrocytoma tissue, grades II to IV.",
  ),
  zhou2002: ref(
    "Zhou et al., J Biol Chem 2002",
    "12388552",
    "10.1074/jbc.M206222200",
    "16 human glioma cell lines and 6 resected gliomas, in vitro.",
  ),
  ehtesham2006: ref(
    "Ehtesham et al., Oncogene 2006",
    "16407848",
    "10.1038/sj.onc.1209302",
    "Malignant glioma cells, in vitro invasion assays and in vivo.",
  ),
  rubin2003: ref(
    "Rubin et al., PNAS 2003",
    "14595012",
    "10.1073/pnas.2235846100",
    "Mouse models of brain tumours.",
  ),
  torsvik2014: ref("Torsvik et al., Cancer Med 2014", "24810477", "10.1002/cam4.219"),
};

export const CIPHER_DATASETS: CipherDataset[] = [
  /* ---------------------------------------------------------------
     KRAS G12D
     --------------------------------------------------------------- */
  {
    id: "kras-g12d",
    title: "KRAS G12D signalling",
    subtitle: "How one changed amino acid keeps a growth switch turned on",
    difficulty: "Beginner",
    estimatedReadTime: "4 min",
    oneLineSummary:
      "A single change in the KRAS protein stops it switching itself off, so growth and survival signals keep firing.",
    primarySources: [C.simanshu2017, C.hunter2015],
    reviewed: "October 2026",
    tour: [
      {
        nodeId: "kras-mutation",
        title: "The root cause",
        concept:
          "KRAS is a switch protein. In the G12D mutation, the amino acid at position 12 changes from glycine to aspartic acid, and the switch becomes very hard to turn off.",
        questionPrompt: "What happens when a switch that should turn itself off cannot?",
      },
      {
        nodeId: "gtp-jam",
        title: "Stuck in the on position",
        concept:
          "KRAS is on while it holds GTP and off once it breaks GTP down to GDP. The mutant protein breaks GTP down far more slowly, and helper proteins that normally speed this up no longer work on it.",
      },
      {
        nodeId: "mapk-cascade",
        title: "The relay to the nucleus",
        concept:
          "Active KRAS switches on RAF, which switches on MEK, which switches on ERK. ERK carries the growth message into the nucleus.",
      },
      {
        nodeId: "uncontrolled-division",
        title: "The effect: division without pause",
        concept:
          "ERK signals push the cell past the checkpoint that normally decides whether it should divide, so it keeps dividing.",
      },
      {
        nodeId: "kras-inhibitor",
        title: "Treating the cause",
        concept:
          "MRTX1133 was designed to fit a pocket on KRAS G12D and switch it off. It shrinks tumours in mouse models but is still experimental. Sotorasib, an approved drug, targets a different mutation (G12C), not G12D.",
      },
    ],
    quiz: {
      question: "Why does KRAS G12D stay switched on?",
      options: [
        "It cannot attach to the cell membrane",
        "It breaks down GTP far more slowly, so it stays in its active form",
        "It makes too many ribosomes",
        "It destroys nearby immune cells",
      ],
      correctIndex: 1,
      explanation:
        "The answer is B. KRAS is active while bound to GTP. The G12D change slows both its own GTP breakdown and the speed-up normally provided by helper proteins (GAPs), so the protein stays active.",
    },
    nodes: [
      {
        id: "egfr-stimulus",
        label: "Growth-factor signal (EGFR)",
        category: "trigger",
        plainTitle: "The knock at the door",
        plainExplanation:
          "Growth signals from outside the cell land on receptors such as EGFR at its surface, and the receptor passes the message inside.",
        technical:
          "Ligand-bound EGFR recruits the adaptor GRB2 and the exchange factor SOS1, which swaps GDP for GTP on RAS proteins.",
        keyMolecules: ["EGF", "EGFR", "SOS1"],
        sources: [C.simanshu2017],
      },
      {
        id: "kras-mutation",
        label: "KRAS G12D mutation",
        category: "trigger",
        plainTitle: "A switch that sticks",
        plainExplanation:
          "One DNA letter change swaps glycine for aspartic acid at position 12 of KRAS. KRAS should switch itself off after each signal; this version barely can.",
        technical:
          "The G12D substitution impairs both intrinsic and GAP-stimulated GTP hydrolysis, so KRAS accumulates in its active, GTP-bound state.",
        pronunciation: "KAY-rass, G-twelve-D",
        keyMolecules: ["KRAS", "Codon 12", "Aspartic acid"],
        sources: [C.hunter2015],
      },
      {
        id: "gtp-jam",
        label: "KRAS stuck in the GTP-bound state",
        category: "mechanism",
        plainTitle: "The on light stays lit",
        plainExplanation:
          "KRAS is on while holding a GTP molecule and off after breaking it down. The mutant breaks GTP down so slowly that it spends most of its time on.",
        technical:
          "Reduced GTPase activity and insensitivity to GAPs such as NF1 keep KRAS-GTP high, leaving its effector-binding regions available to RAF and PI3K.",
        keyMolecules: ["GTP", "GDP", "GAPs"],
        sources: [C.hunter2015, C.simanshu2017],
      },
      {
        id: "mapk-cascade",
        label: "RAF → MEK → ERK cascade",
        category: "mechanism",
        plainTitle: "The relay chain",
        plainExplanation:
          "KRAS switches on RAF, RAF switches on MEK, and MEK switches on ERK. Each step passes the message along until it reaches the nucleus.",
        technical:
          "KRAS-GTP recruits RAF kinases to the membrane. RAF phosphorylates MEK1/2, which phosphorylates ERK1/2; active ERK enters the nucleus and phosphorylates transcription factors.",
        keyMolecules: ["RAF", "MEK1/2", "ERK1/2"],
        sources: [C.simanshu2017],
      },
      {
        id: "pi3k-survival",
        label: "PI3K → AKT survival signal",
        category: "mechanism",
        plainTitle: "The do-not-die signal",
        plainExplanation:
          "A second pathway switched on by KRAS tells the cell to stay alive, even when it would normally self-destruct.",
        technical:
          "KRAS-GTP binds the p110 catalytic subunit of PI3K directly, raising PIP3 and activating AKT. AKT phosphorylates the pro-death protein BAD and blocks it.",
        keyMolecules: ["PI3K p110", "AKT", "BAD"],
        sources: [C.rodriguezViciana1994, C.datta1997],
      },
      {
        id: "myc-activation",
        label: "MYC stabilised",
        category: "mechanism",
        plainTitle: "The master growth gene",
        plainExplanation:
          "ERK protects MYC, a protein that switches on hundreds of genes for growth, so more of it stays in the cell.",
        technical:
          "ERK phosphorylates MYC on Ser62, which stabilises the protein; MYC then drives genes for cell growth and cell-cycle entry.",
        keyMolecules: ["MYC", "Ser62"],
        sources: [C.sears2000],
      },
      {
        id: "uncontrolled-division",
        label: "Continuous cell division",
        category: "effect",
        plainTitle: "Growth without a pause",
        plainExplanation:
          "The cell skips the checkpoint that decides whether it should divide, and keeps dividing.",
        technical:
          "Sustained MAPK signalling raises cyclin D–CDK4/6 activity, which inactivates RB and frees E2F to push cells into S phase.",
        keyMolecules: ["Cyclin D", "CDK4/6", "RB", "E2F"],
        sources: [C.simanshu2017, C.hanahan2022],
      },
      {
        id: "cell-survival",
        label: "Damaged cells avoid death",
        category: "effect",
        plainTitle: "Cells that should die, don't",
        plainExplanation:
          "Cells carrying dangerous changes keep living instead of switching on their self-destruct programme.",
        technical:
          "AKT-driven inhibition of pro-apoptotic proteins raises the threshold for apoptosis in KRAS-mutant cells.",
        keyMolecules: ["AKT", "BAD"],
        sources: [C.datta1997],
      },
      {
        id: "glycolysis-shift",
        label: "Glucose-hungry metabolism",
        category: "effect",
        plainTitle: "Burning sugar for building blocks",
        plainExplanation:
          "Tumour cells take in extra sugar and use it to build new cell parts quickly.",
        technical:
          "In pancreatic tumour models, mutant KRAS raises glucose uptake (GLUT1) and hexokinase expression and channels glucose into the non-oxidative pentose phosphate pathway.",
        keyMolecules: ["GLUT1", "Hexokinase", "Pentose phosphate pathway"],
        sources: [C.ying2012],
      },
      {
        id: "immune-evasion",
        label: "Immune attack held back",
        category: "effect",
        plainTitle: "Calling in the wrong guards",
        plainExplanation:
          "The tumour releases a signal that attracts immune cells which calm the immune system down, so killer T cells do less damage to the tumour.",
        technical:
          "In pancreatic models, oncogenic KRAS induces GM-CSF secretion, recruiting immunosuppressive myeloid cells that inhibit CD8+ T cells.",
        keyMolecules: ["GM-CSF", "Myeloid cells", "CD8+ T cells"],
        sources: [C.pylayevaGupta2012],
      },
      {
        id: "kras-inhibitor",
        label: "KRAS G12D inhibitor (MRTX1133)",
        category: "therapy",
        drugStatus: "experimental",
        plainTitle: "A key cut for the broken lock",
        plainExplanation:
          "A drug molecule designed to fit a pocket on the mutant KRAS protein and stop it signalling. It works in lab and mouse models but is not yet an approved treatment.",
        technical:
          "MRTX1133 binds the switch-II pocket of KRAS G12D non-covalently and selectively, suppresses downstream signalling and causes tumour regression in pancreatic cancer models.",
        keyMolecules: ["MRTX1133", "Switch-II pocket"],
        sources: [C.wang2022, C.hallin2022, C.canon2019],
      },
      {
        id: "mek-inhibitor",
        label: "MEK inhibitor (trametinib)",
        category: "therapy",
        drugStatus: "approved",
        plainTitle: "Cutting the relay",
        plainExplanation:
          "Blocks the relay further down the chain. Trametinib is approved for some BRAF-mutant cancers, but on its own it did not beat chemotherapy in KRAS-mutant lung cancer.",
        technical:
          "Trametinib is an allosteric MEK1/2 inhibitor. In a randomised phase II trial in KRAS-mutant non-small-cell lung cancer, its progression-free survival was similar to docetaxel.",
        keyMolecules: ["Trametinib", "MEK1/2"],
        sources: [C.blumenschein2015],
      },
    ],
    edges: [
      {
        source: "egfr-stimulus",
        target: "gtp-jam",
        label: "Loads GTP onto KRAS",
        relationshipType: "activates",
        mechanismDetail: "SOS1, recruited by active EGFR, swaps GDP for GTP on KRAS.",
        evidence: [C.simanshu2017],
      },
      {
        source: "kras-mutation",
        target: "gtp-jam",
        label: "Slows GTP breakdown",
        relationshipType: "activates",
        mechanismDetail: "G12D reduces both intrinsic and GAP-stimulated GTP hydrolysis.",
        evidence: [C.hunter2015],
      },
      {
        source: "gtp-jam",
        target: "mapk-cascade",
        label: "Recruits RAF",
        relationshipType: "activates",
        mechanismDetail: "GTP-bound KRAS binds RAF and brings it to the membrane, where RAF is activated.",
        evidence: [C.simanshu2017],
      },
      {
        source: "gtp-jam",
        target: "pi3k-survival",
        label: "Binds PI3K",
        relationshipType: "activates",
        mechanismDetail: "GTP-bound RAS binds the p110 catalytic subunit of PI3K directly.",
        evidence: [C.rodriguezViciana1994],
      },
      {
        source: "mapk-cascade",
        target: "myc-activation",
        label: "Stabilises MYC",
        relationshipType: "activates",
        mechanismDetail: "ERK phosphorylates MYC on Ser62, protecting it from rapid breakdown.",
        evidence: [C.sears2000],
      },
      {
        source: "mapk-cascade",
        target: "uncontrolled-division",
        label: "Drives cell-cycle entry",
        relationshipType: "activates",
        mechanismDetail: "ERK signalling raises cyclin D, which starts the chain that releases E2F.",
        evidence: [C.simanshu2017],
      },
      {
        source: "myc-activation",
        target: "uncontrolled-division",
        label: "Switches on growth genes",
        relationshipType: "activates",
        mechanismDetail: "MYC drives genes for growth and cell-cycle entry, a hallmark of sustained proliferation.",
        evidence: [C.hanahan2022],
      },
      {
        source: "pi3k-survival",
        target: "cell-survival",
        label: "Blocks death signals",
        relationshipType: "inhibits",
        mechanismDetail: "AKT phosphorylates BAD, preventing it from promoting apoptosis.",
        evidence: [C.datta1997],
      },
      {
        source: "gtp-jam",
        target: "glycolysis-shift",
        label: "Rewires glucose use",
        relationshipType: "transforms",
        mechanismDetail: "Mutant KRAS raises glucose uptake and sends glucose into building-block pathways.",
        evidence: [C.ying2012],
      },
      {
        source: "gtp-jam",
        target: "immune-evasion",
        label: "Recruits suppressive cells",
        relationshipType: "transforms",
        mechanismDetail: "KRAS-induced GM-CSF attracts myeloid cells that suppress CD8+ T cells.",
        evidence: [C.pylayevaGupta2012],
      },
      {
        source: "kras-inhibitor",
        target: "gtp-jam",
        label: "Blocks mutant KRAS",
        relationshipType: "inhibits",
        mechanismDetail: "MRTX1133 occupies the switch-II pocket of KRAS G12D and stops it signalling.",
        evidence: [C.wang2022, C.hallin2022],
      },
      {
        source: "mek-inhibitor",
        target: "mapk-cascade",
        label: "Blocks MEK",
        relationshipType: "inhibits",
        mechanismDetail: "Trametinib binds MEK1/2 allosterically and stops it activating ERK.",
        evidence: [C.blumenschein2015],
      },
    ],
  },

  /* ---------------------------------------------------------------
     Dedifferentiation and plasticity
     --------------------------------------------------------------- */
  {
    id: "hallmarks-dedifferentiation",
    title: "Dedifferentiation and cell plasticity",
    subtitle: "How tumour cells lose their identity and gain stem-like traits",
    difficulty: "Intermediate",
    estimatedReadTime: "5 min",
    oneLineSummary:
      "Epigenetic changes silence the genes that keep a cell specialised, opening the way to stem-like, mobile and drug-resistant states.",
    primarySources: [C.senga2021, C.hanahan2022],
    reviewed: "October 2026",
    tour: [
      {
        nodeId: "epigenetic-disruption",
        title: "Scrambled bookmarks",
        concept:
          "Epigenetic marks tell a cell which genes to read. When regulators such as EZH2 go wrong, genes that keep the cell specialised get switched off.",
      },
      {
        nodeId: "lineage-loss",
        title: "Losing identity",
        concept:
          "With those genes silenced, a breast or lung cell stops behaving like one. EZH2, for example, switches off E-cadherin, a protein that holds epithelial cells together.",
      },
      {
        nodeId: "emt-activation",
        title: "From sheet to wanderer",
        concept:
          "In the epithelial-to-mesenchymal transition (EMT), cells loosen their connections and start to move.",
      },
      {
        nodeId: "stemness-acquisition",
        title: "Stem-like traits",
        concept:
          "EMT can give cells stem-like abilities, and the most aggressive tumours carry gene signatures resembling embryonic stem cells.",
      },
      {
        nodeId: "chemo-resistance",
        title: "Surviving treatment",
        concept:
          "Stem-like tumour cells can pump drugs out and divide slowly, which helps them survive chemotherapy.",
      },
      {
        nodeId: "epigenetic-therapy",
        title: "A drug against the cause",
        concept:
          "Tazemetostat blocks EZH2. It is approved for a rare sarcoma; whether drugs like it can make other tumours re-differentiate is still being studied.",
      },
    ],
    quiz: {
      question: "What does EMT do to an epithelial cell?",
      options: [
        "It makes the cell divide faster without moving",
        "It loosens the cell's connections and lets it move, and can give it stem-like traits",
        "It locks the cell permanently into apoptosis",
        "It makes the cell produce red blood cells",
      ],
      correctIndex: 1,
      explanation:
        "The answer is B. During EMT, epithelial cells lose junction proteins such as E-cadherin, become motile, and in experiments can acquire stem-like properties.",
    },
    nodes: [
      {
        id: "epigenetic-disruption",
        label: "Epigenetic regulators go wrong",
        category: "trigger",
        plainTitle: "Scrambled bookmarks",
        plainExplanation:
          "Think of DNA as a library and epigenetic marks as bookmarks saying which pages to read. In cancer the bookmarks move, and the cell reads the wrong pages.",
        technical:
          "Non-mutational epigenetic reprogramming, for example overactive EZH2 depositing repressive H3K27me3, silences genes that maintain differentiation.",
        pronunciation: "E-Z-H-2",
        keyMolecules: ["EZH2", "H3K27me3", "DNA methylation"],
        sources: [C.hanahan2022, C.kim2016],
      },
      {
        id: "lineage-loss",
        label: "Loss of cell identity genes",
        category: "mechanism",
        plainTitle: "Forgetting the job",
        plainExplanation:
          "A specialised cell stops making the proteins of its tissue and forgets what it was built to do.",
        technical:
          "Silencing of differentiation programmes erodes lineage identity. EZH2 directly represses E-cadherin (CDH1), a core epithelial gene.",
        keyMolecules: ["CDH1 (E-cadherin)", "Lineage transcription factors"],
        sources: [C.hanahan2022, C.cao2008],
      },
      {
        id: "emt-activation",
        label: "Epithelial-to-mesenchymal transition (EMT)",
        category: "mechanism",
        plainTitle: "From bricks to wanderers",
        plainExplanation:
          "Cells that normally sit together like bricks loosen their grip and start crawling on their own.",
        technical:
          "EMT transcription factors such as SNAIL and TWIST repress E-cadherin, so epithelial cells lose junctions, reorganise their cytoskeleton and become motile.",
        keyMolecules: ["SNAIL", "TWIST", "Vimentin"],
        sources: [C.thiery2009],
      },
      {
        id: "stemness-acquisition",
        label: "Stem-cell-like state",
        category: "mechanism",
        plainTitle: "Turning the clock back",
        plainExplanation:
          "Some tumour cells switch on genes usually used by embryonic stem cells, which lets them renew themselves and change form.",
        technical:
          "EMT can confer stem-like properties, and poorly differentiated aggressive tumours show embryonic stem cell–like expression signatures (NANOG, OCT4, SOX2 targets).",
        keyMolecules: ["OCT4", "SOX2", "NANOG"],
        sources: [C.mani2008, C.benPorath2008],
      },
      {
        id: "chemo-resistance",
        label: "Resistance to chemotherapy",
        category: "effect",
        plainTitle: "Treatment slides off",
        plainExplanation:
          "Stem-like cells pump drugs back out and divide slowly, so treatments that target fast-dividing cells miss them.",
        technical:
          "Stem-like tumour cells can resist chemotherapy through ABC-family efflux pumps and slow cycling.",
        keyMolecules: ["ABCB1", "ABCG2"],
        sources: [C.dean2005],
      },
      {
        id: "metastasis",
        label: "Spread to other organs",
        category: "effect",
        plainTitle: "Leaving home",
        plainExplanation:
          "Mobile tumour cells enter blood vessels, travel and form new tumours in other organs.",
        technical:
          "EMT-driven motility and invasion help carcinoma cells disseminate, although how often a full EMT is needed in patients is still debated.",
        keyMolecules: ["MMPs", "Integrins"],
        sources: [C.thiery2009],
      },
      {
        id: "epigenetic-therapy",
        label: "EZH2 inhibitor (tazemetostat)",
        category: "therapy",
        drugStatus: "approved",
        plainTitle: "Resetting the bookmarks",
        plainExplanation:
          "Blocks EZH2. It is approved for a rare sarcoma whose tumours depend on EZH2; using it to make other tumours re-differentiate is still being studied.",
        technical:
          "Tazemetostat inhibits EZH2 catalytic activity and lowers H3K27me3. It produced responses in epithelioid sarcoma with INI1 loss in a phase 2 trial.",
        keyMolecules: ["Tazemetostat", "EZH2"],
        sources: [C.gounder2020, C.kim2016],
      },
    ],
    edges: [
      {
        source: "epigenetic-disruption",
        target: "lineage-loss",
        label: "Silences identity genes",
        relationshipType: "inhibits",
        mechanismDetail: "Repressive marks such as H3K27me3 switch off differentiation genes, including E-cadherin.",
        evidence: [C.hanahan2022, C.cao2008],
      },
      {
        source: "lineage-loss",
        target: "emt-activation",
        label: "Opens the door to EMT",
        relationshipType: "transforms",
        mechanismDetail: "Losing E-cadherin and epithelial programmes is a core step of EMT.",
        evidence: [C.thiery2009],
      },
      {
        source: "lineage-loss",
        target: "stemness-acquisition",
        label: "Goes with stem-like signatures",
        relationshipType: "activates",
        mechanismDetail: "Poorly differentiated tumours carry embryonic stem cell–like gene signatures.",
        evidence: [C.benPorath2008],
        hypothesis: true,
      },
      {
        source: "emt-activation",
        target: "stemness-acquisition",
        label: "Gives stem-like traits",
        relationshipType: "activates",
        mechanismDetail: "Inducing EMT in mammary epithelial cells gave them stem cell properties.",
        evidence: [C.mani2008],
      },
      {
        source: "stemness-acquisition",
        target: "chemo-resistance",
        label: "Helps survive drugs",
        relationshipType: "activates",
        mechanismDetail: "Stem-like cells express drug efflux pumps and cycle slowly.",
        evidence: [C.dean2005],
      },
      {
        source: "emt-activation",
        target: "metastasis",
        label: "Enables invasion",
        relationshipType: "transforms",
        mechanismDetail: "Motile mesenchymal-like cells invade tissue and enter vessels.",
        evidence: [C.thiery2009],
      },
      {
        source: "epigenetic-therapy",
        target: "epigenetic-disruption",
        label: "Blocks EZH2",
        relationshipType: "inhibits",
        mechanismDetail: "Tazemetostat inhibits EZH2 and lowers repressive H3K27me3 marks.",
        evidence: [C.gounder2020, C.kim2016],
      },
    ],
  },

  /* ---------------------------------------------------------------
     p53
     --------------------------------------------------------------- */
  {
    id: "p53-checkpoint",
    title: "p53 and the DNA damage checkpoint",
    subtitle: "What a healthy cell does with broken DNA, and what happens when p53 is lost",
    difficulty: "Beginner",
    estimatedReadTime: "4 min",
    oneLineSummary:
      "Healthy cells use p53 to pause for repair or self-destruct after DNA damage. Tumours that lose p53 keep dividing with damaged DNA.",
    primarySources: [C.olivier2010, C.kandoth2013],
    reviewed: "October 2026",
    tour: [
      {
        nodeId: "dna-breaks",
        title: "Broken DNA",
        concept:
          "Radiation, some chemicals and errors while copying DNA can break both strands of the double helix.",
      },
      {
        nodeId: "atm-sensor",
        title: "The alarm",
        concept:
          "A protein complex finds the broken ends and switches on the ATM kinase, which marks p53 so it is no longer destroyed.",
      },
      {
        nodeId: "p53-activation",
        title: "The guardian decides",
        concept:
          "Stable p53 switches on genes that either pause the cell cycle for repair (p21) or start self-destruction (PUMA).",
        questionPrompt: "Why might a cell choose death over repair?",
      },
      {
        nodeId: "tp53-mutation",
        title: "The guardian is lost",
        concept:
          "TP53 is the most frequently mutated gene in human cancer. Most mutations stop p53 binding DNA, so neither repair nor self-destruction is ordered.",
      },
      {
        nodeId: "mdm2-antagonist",
        title: "Freeing p53",
        concept:
          "In tumours whose p53 is intact but held down by MDM2, experimental drugs called nutlins can release it. They cannot help tumours whose p53 is mutated.",
      },
    ],
    quiz: {
      question: "What does healthy p53 do after DNA double-strand breaks?",
      options: [
        "Speeds up division without fixing the DNA",
        "Pauses the cell cycle for repair, or triggers apoptosis if the damage is too great",
        "Suppresses the immune system",
        "Turns lactic acid back into glucose",
      ],
      correctIndex: 1,
      explanation:
        "The answer is B. Activated p53 switches on p21 to pause the cell cycle and PUMA to start apoptosis, depending on the damage.",
    },
    nodes: [
      {
        id: "dna-breaks",
        label: "DNA double-strand breaks",
        category: "trigger",
        plainTitle: "A torn blueprint",
        plainExplanation:
          "Radiation, some chemicals and copying errors can snap both strands of DNA, like tearing a blueprint in two.",
        technical:
          "Double-strand breaks arise from ionising radiation, some chemotherapies and collapsed replication forks; the MRN complex binds the broken ends.",
        keyMolecules: ["DSB", "MRN complex", "γH2AX"],
        sources: [C.leePaull2005],
      },
      {
        id: "atm-sensor",
        label: "ATM alarm kinase",
        category: "mechanism",
        plainTitle: "The smoke alarm",
        plainExplanation:
          "Sensor proteins grab the broken DNA ends and switch on an alarm protein, ATM, which alerts p53.",
        technical:
          "MRN recruits and activates ATM at double-strand breaks. ATM phosphorylates p53 on Ser15.",
        keyMolecules: ["ATM", "CHK2"],
        sources: [C.leePaull2005, C.banin1998],
      },
      {
        id: "p53-activation",
        label: "p53 activated",
        category: "mechanism",
        plainTitle: "The guardian wakes up",
        plainExplanation:
          "Normally p53 is destroyed as fast as it is made. After the alarm, it stops being destroyed and builds up.",
        technical:
          "Phosphorylation weakens p53 binding to MDM2, its main inhibitor, so p53 accumulates and activates target genes such as p21 and PUMA.",
        keyMolecules: ["p53", "MDM2"],
        sources: [C.shieh1997],
      },
      {
        id: "cell-cycle-arrest",
        label: "Cell cycle paused for repair",
        category: "effect",
        plainTitle: "Stop and fix",
        plainExplanation: "The cell stops dividing so the DNA can be repaired first.",
        technical: "p53 induces p21 (WAF1/CIP1), a CDK inhibitor that halts the cell cycle.",
        keyMolecules: ["p21", "CDK2"],
        sources: [C.elDeiry1993],
      },
      {
        id: "bax-mitochondria",
        label: "PUMA and BAX open mitochondria",
        category: "mechanism",
        plainTitle: "The self-destruct switch",
        plainExplanation:
          "p53 switches on proteins that punch holes in the cell's power stations, which starts self-destruction.",
        technical:
          "p53 induces the BH3-only protein PUMA and can activate BAX directly, leading to mitochondrial outer membrane permeabilisation.",
        keyMolecules: ["PUMA", "BAX", "Cytochrome c"],
        sources: [C.nakano2001, C.chipuk2004],
      },
      {
        id: "apoptosis",
        label: "Damaged cell self-destructs",
        category: "effect",
        plainTitle: "A safe ending",
        plainExplanation: "A cell with DNA too damaged to fix removes itself before it can become a tumour.",
        technical: "Cytochrome c release activates caspases and the cell undergoes apoptosis.",
        keyMolecules: ["Caspase-9", "Caspase-3"],
        sources: [C.chipuk2004],
      },
      {
        id: "tp53-mutation",
        label: "TP53 mutation",
        category: "trigger",
        plainTitle: "The broken guardian",
        plainExplanation:
          "The most commonly mutated gene in cancer. A mutated p53 usually cannot read DNA, so it cannot give any orders.",
        technical:
          "TP53 is the most frequently mutated gene across human cancers; most mutations hit the DNA-binding domain and abolish transcriptional activity.",
        keyMolecules: ["TP53", "DNA-binding domain"],
        sources: [C.kandoth2013, C.olivier2010],
      },
      {
        id: "survival-damaged",
        label: "Damaged cells keep dividing",
        category: "effect",
        plainTitle: "Errors pile up",
        plainExplanation:
          "Without p53, cells with broken DNA neither stop nor die, so mistakes build up with every division.",
        technical:
          "Loss of p53 lets cells with DNA damage avoid arrest and apoptosis, allowing genomic instability to accumulate.",
        keyMolecules: ["Aneuploidy"],
        sources: [C.olivier2010],
      },
      {
        id: "mdm2-antagonist",
        label: "MDM2 blocker (nutlin)",
        category: "therapy",
        drugStatus: "experimental",
        plainTitle: "Releasing the guardian",
        plainExplanation:
          "In tumours where p53 is healthy but held down by MDM2, these drugs pull MDM2 off. They do nothing if p53 itself is mutated, and none is approved yet.",
        technical:
          "Nutlins bind the p53 pocket of MDM2, stabilising wild-type p53 and activating its pathway in tumour models.",
        keyMolecules: ["Nutlin-3", "MDM2"],
        sources: [C.vassilev2004],
      },
    ],
    edges: [
      {
        source: "dna-breaks",
        target: "atm-sensor",
        label: "Activates ATM",
        relationshipType: "activates",
        mechanismDetail: "Broken DNA ends recruit the MRN complex, which activates ATM.",
        evidence: [C.leePaull2005],
      },
      {
        source: "atm-sensor",
        target: "p53-activation",
        label: "Phosphorylates p53",
        relationshipType: "activates",
        mechanismDetail: "ATM phosphorylates p53, which weakens MDM2 binding so p53 is no longer destroyed.",
        evidence: [C.banin1998, C.shieh1997],
      },
      {
        source: "p53-activation",
        target: "cell-cycle-arrest",
        label: "Switches on p21",
        relationshipType: "activates",
        mechanismDetail: "p53 induces p21, a CDK inhibitor that pauses the cell cycle.",
        evidence: [C.elDeiry1993],
      },
      {
        source: "p53-activation",
        target: "bax-mitochondria",
        label: "Switches on PUMA",
        relationshipType: "activates",
        mechanismDetail: "p53 induces PUMA and can activate BAX directly.",
        evidence: [C.nakano2001, C.chipuk2004],
      },
      {
        source: "bax-mitochondria",
        target: "apoptosis",
        label: "Starts apoptosis",
        relationshipType: "activates",
        mechanismDetail: "Permeabilised mitochondria release cytochrome c, activating caspases.",
        evidence: [C.chipuk2004],
      },
      {
        source: "tp53-mutation",
        target: "p53-activation",
        label: "Disables p53",
        relationshipType: "inhibits",
        mechanismDetail: "Mutant p53 cannot bind its target genes, so the response never starts.",
        evidence: [C.olivier2010],
      },
      {
        source: "tp53-mutation",
        target: "survival-damaged",
        label: "Lets damaged cells survive",
        relationshipType: "transforms",
        mechanismDetail: "Without p53, damaged cells avoid both arrest and apoptosis.",
        evidence: [C.olivier2010],
      },
      {
        source: "mdm2-antagonist",
        target: "p53-activation",
        label: "Frees p53 from MDM2",
        relationshipType: "activates",
        mechanismDetail: "Nutlins displace MDM2, so intact p53 accumulates and acts.",
        evidence: [C.vassilev2004],
      },
    ],
  },

  /* ---------------------------------------------------------------
     Flagship: CAF → CXCL12 → CXCR4 → migration
     --------------------------------------------------------------- */
  {
    id: "caf-cxcl12-migration",
    title: "CAF → CXCL12 → CXCR4 → migration",
    subtitle: "The BioLayers flagship: from published papers to a cell we tracked ourselves",
    difficulty: "Intermediate",
    estimatedReadTime: "4 min",
    oneLineSummary:
      "Fibroblasts release a guidance signal, glioma cells sense it, and invasion follows. The last link is a real tracked cell, and the map says exactly what is hypothesis.",
    primarySources: [C.orimo2005, C.zhou2002, C.ehtesham2006, C.rempel2000],
    reviewed: "October 2026",
    tour: [
      {
        nodeId: "cafs",
        title: "The neighbours",
        concept:
          "Fibroblasts inside tumours release CXCL12. This was shown in breast cancer, so for brain tumours it is a borrowed idea worth testing.",
      },
      {
        nodeId: "cxcl12",
        title: "The guidance signal",
        concept:
          "CXCL12 is a chemokine: a signal that cells follow. In human astrocytomas, it rises with tumour grade.",
      },
      {
        nodeId: "cxcr4",
        title: "The receiver",
        concept:
          "Most glioma cell lines carry CXCR4, the receptor for CXCL12, and move towards CXCL12 in the lab.",
      },
      {
        nodeId: "invasion",
        title: "Invasion",
        concept:
          "Glioma cells with more CXCR4 invade more, and blocking CXCR4 reduces invasion in experiments.",
      },
      {
        nodeId: "observed-migration",
        title: "A real cell",
        concept:
          "We tracked glioblastoma cell U373-02-T7 for 28.5 hours and measured its migration. We did not measure CXCR4 in it, so the link to this pathway is a hypothesis.",
        questionPrompt: "What experiment would turn this hypothesis into evidence?",
      },
    ],
    quiz: {
      question: "Which part of this map is a hypothesis rather than a published finding?",
      options: [
        "That fibroblasts in breast tumours secrete CXCL12",
        "That most glioma cell lines carry CXCR4",
        "That the migration we tracked in cell U373-02-T7 is driven by CXCR4",
        "That CXCL12 rises with astrocytoma grade",
      ],
      correctIndex: 2,
      explanation:
        "The answer is C. We measured how cell U373-02-T7 moved, but not its CXCR4 or the CXCL12 around it, so linking its migration to this pathway is a hypothesis. The other three are published findings.",
    },
    nodes: [
      {
        id: "cafs",
        label: "Cancer-associated fibroblasts",
        category: "trigger",
        plainTitle: "The tumour's neighbours",
        plainExplanation:
          "Support cells inside a tumour that, instead of keeping order, release signals that help the tumour.",
        technical:
          "Carcinoma-associated fibroblasts secrete elevated SDF-1/CXCL12, which promotes tumour growth through CXCR4 on carcinoma cells.",
        keyMolecules: ["CAFs", "α-SMA"],
        sources: [C.orimo2005],
      },
      {
        id: "cxcl12",
        label: "CXCL12 (SDF-1)",
        category: "mechanism",
        plainTitle: "A scent trail",
        plainExplanation: "A signal molecule that cells follow, like a scent getting stronger towards its source.",
        technical:
          "A chemokine that directs cell migration along its gradient. In human astrocytoma, CXCL12 and CXCR4 rise with grade and co-localise in regions of necrosis and angiogenesis.",
        pronunciation: "C-X-C-L-twelve",
        keyMolecules: ["CXCL12", "SDF-1"],
        sources: [C.rempel2000],
      },
      {
        id: "cxcr4",
        label: "CXCR4 on glioma cells",
        category: "mechanism",
        plainTitle: "The nose that follows the scent",
        plainExplanation: "A receptor on the tumour cell's surface that senses CXCL12 and points the cell towards it.",
        technical:
          "CXCR4 is the predominant chemokine receptor on human glioma cell lines (13 of 16), and CXCL12 induces their chemotaxis.",
        pronunciation: "C-X-C-R-four",
        keyMolecules: ["CXCR4"],
        sources: [C.zhou2002],
      },
      {
        id: "invasion",
        label: "Glioma cell invasion",
        category: "effect",
        plainTitle: "Moving into healthy brain",
        plainExplanation: "Tumour cells crawl away from the main tumour into surrounding brain tissue.",
        technical:
          "Invasive glioma cell populations overexpress CXCR4, and blocking CXCR4 impairs their invasion in vitro.",
        keyMolecules: ["CXCR4"],
        sources: [C.ehtesham2006],
      },
      {
        id: "observed-migration",
        label: "Tracked cell U373-02-T7 migrates",
        category: "effect",
        observed: true,
        plainTitle: "A cell we watched move",
        plainExplanation:
          "In a real phase-contrast time-lapse, this glioblastoma cell moved 175.9 µm in 28.5 hours. Our pipeline measured that directly from the images.",
        technical:
          "Cell Tracking Challenge PhC-C2DH-U373, sequence 02. Net displacement 175.9 µm, mean speed 0.193 µm/min, directionality 0.53; labelled migrating by rule R-MIG. Many U-373 stocks are in fact U-251.",
        keyMolecules: ["U373", "Phase contrast"],
        sources: [C.torsvik2014],
        link: { href: "/validation", label: "See the tracking in the validation report" },
      },
      {
        id: "cxcr4-antagonist",
        label: "CXCR4 blocker (AMD3100)",
        category: "therapy",
        drugStatus: "experimental",
        plainTitle: "Blocking the receiver",
        plainExplanation:
          "A drug that blocks CXCR4. It slowed brain tumour growth in mice. As plerixafor it is approved for collecting stem cells, not for treating brain tumours.",
        technical:
          "AMD3100 (plerixafor) is a CXCR4 antagonist; it inhibited intracranial growth of primary brain tumour models in mice.",
        keyMolecules: ["AMD3100", "Plerixafor"],
        sources: [C.rubin2003],
      },
    ],
    edges: [
      {
        source: "cafs",
        target: "cxcl12",
        label: "Secrete",
        relationshipType: "activates",
        mechanismDetail: "Carcinoma-associated fibroblasts release elevated CXCL12.",
        evidence: [C.orimo2005],
      },
      {
        source: "cxcl12",
        target: "cxcr4",
        label: "Binds and activates",
        relationshipType: "activates",
        mechanismDetail: "CXCL12 is the ligand for CXCR4 and induces glioma cell chemotaxis.",
        evidence: [C.zhou2002],
      },
      {
        source: "cxcr4",
        target: "invasion",
        label: "Drives invasion",
        relationshipType: "activates",
        mechanismDetail: "Blocking CXCR4 reduces glioma cell invasion towards CXCL12.",
        evidence: [C.ehtesham2006],
      },
      {
        source: "invasion",
        target: "observed-migration",
        label: "May explain",
        relationshipType: "transforms",
        mechanismDetail:
          "We observed migration in this cell but did not measure CXCR4 or CXCL12 in it. The literature makes the link plausible; it is not shown.",
        evidence: [C.zhou2002, C.ehtesham2006],
        hypothesis: true,
      },
      {
        source: "cxcr4-antagonist",
        target: "cxcr4",
        label: "Blocks CXCR4",
        relationshipType: "inhibits",
        mechanismDetail: "AMD3100 binds CXCR4 and prevents CXCL12 signalling.",
        evidence: [C.rubin2003],
      },
    ],
  },
];
