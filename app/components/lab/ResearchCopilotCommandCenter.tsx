"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";

type CopilotAnswer = {
  query: string;
  title: string;
  summary: string;
  confidence: number;
  genes: string[];
  pathways: string[];
  mechanisms: {
    title: string;
    text: string;
    score: number;
  }[];
  evidence: {
    title: string;
    source: string;
    score: number;
  }[];
  followUps: string[];
};

const presets = [
  "Why does PTEN loss promote prostate cancer progression?",
  "How can CAFs support prostate cancer bone metastasis?",
  "What is the role of CXCL12 in metastatic bone homing?",
  "How does BRCA2 loss create therapeutic vulnerability?",
];

const answers: CopilotAnswer[] = [
  {
    query: "pten",
    title: "PTEN loss can amplify survival and growth signaling",
    summary:
      "Loss of PTEN removes a major inhibitory constraint on PI3K signaling. This can increase AKT pathway activity, alter survival programs, support tumor-cell fitness, and interact with other oncogenic states in advanced prostate cancer.",
    confidence: 92,
    genes: ["PTEN", "PIK3CA", "AKT1", "MTOR", "FOXO3"],
    pathways: ["PI3K–AKT", "mTOR", "Cell survival"],
    mechanisms: [
      {
        title: "Loss of pathway restraint",
        text: "PTEN normally opposes PI3K signaling. Reduced PTEN activity can therefore increase downstream pathway activation.",
        score: 96,
      },
      {
        title: "Enhanced survival signaling",
        text: "AKT-associated signaling can support proliferation, metabolic adaptation, and resistance to cell death.",
        score: 91,
      },
      {
        title: "Therapy adaptation",
        text: "Persistent pathway activity may provide alternative survival programs under treatment pressure.",
        score: 78,
      },
    ],
    evidence: [
      {
        title: "PTEN and prostate cancer progression",
        source: "Cancer genomics evidence",
        score: 94,
      },
      {
        title: "PI3K/AKT pathway activation",
        source: "Pathway literature",
        score: 92,
      },
      {
        title: "Therapeutic vulnerability",
        source: "Translational evidence",
        score: 81,
      },
    ],
    followUps: [
      "How does PTEN loss interact with AR signaling?",
      "Which therapies target PI3K/AKT signaling?",
      "How could PTEN loss affect metastatic evolution?",
    ],
  },
  {
    query: "caf",
    title: "CAFs can reshape the metastatic tumor ecosystem",
    summary:
      "Cancer-associated fibroblasts can influence tumor progression through extracellular-matrix remodeling, growth-factor and cytokine signaling, immune modulation, and interactions with metastatic niches.",
    confidence: 90,
    genes: ["TGFB1", "CXCL12", "IL6", "COL1A1", "CXCR4"],
    pathways: ["TGF-β", "CXCL12/CXCR4", "ECM remodeling"],
    mechanisms: [
      {
        title: "Extracellular matrix remodeling",
        text: "Activated fibroblasts can reorganize matrix architecture and alter the physical environment surrounding tumor cells.",
        score: 94,
      },
      {
        title: "Paracrine signaling",
        text: "CAF-derived cytokines and chemokines can modify migration, survival, inflammation, and cell-state transitions.",
        score: 91,
      },
      {
        title: "Metastatic niche support",
        text: "Stromal signaling may help disseminated tumor cells interact with permissive microenvironments such as bone.",
        score: 84,
      },
    ],
    evidence: [
      {
        title: "CAF-mediated tumor progression",
        source: "Tumor microenvironment literature",
        score: 93,
      },
      {
        title: "CXCL12 signaling",
        source: "Mechanistic evidence",
        score: 88,
      },
      {
        title: "Bone metastatic niche",
        source: "Metastasis research",
        score: 82,
      },
    ],
    followUps: [
      "Which CAF subtypes are most relevant?",
      "How does TGF-β activate fibroblasts?",
      "Can CAF signaling become a therapeutic target?",
    ],
  },
  {
    query: "cxcl12",
    title: "CXCL12 can contribute to directional metastatic signaling",
    summary:
      "The CXCL12/CXCR4 axis can influence chemotaxis, survival, adhesion, and tissue homing. In metastatic biology, these signals may help tumor cells interact with CXCL12-rich environments, including bone marrow niches.",
    confidence: 88,
    genes: ["CXCL12", "CXCR4", "CXCR7", "ITGB1"],
    pathways: ["Chemokine signaling", "Cell migration", "Bone homing"],
    mechanisms: [
      {
        title: "Chemotactic signaling",
        text: "CXCL12 gradients can provide directional migratory signals to cells expressing compatible receptors.",
        score: 94,
      },
      {
        title: "Adhesion and survival",
        text: "Receptor activation can interact with pathways controlling adhesion, persistence, and survival.",
        score: 86,
      },
      {
        title: "Bone niche interaction",
        text: "CXCL12-rich marrow environments may contribute to the attraction and retention of disseminated tumor cells.",
        score: 84,
      },
    ],
    evidence: [
      {
        title: "CXCL12/CXCR4 axis",
        source: "Chemokine biology",
        score: 94,
      },
      {
        title: "Metastatic homing",
        source: "Metastasis literature",
        score: 86,
      },
      {
        title: "Bone marrow niche",
        source: "Microenvironment evidence",
        score: 84,
      },
    ],
    followUps: [
      "What cells produce CXCL12 in bone?",
      "How does CXCR4 activation change tumor-cell behavior?",
      "Could CXCL12/CXCR4 inhibition reduce bone homing?",
    ],
  },
  {
    query: "brca2",
    title: "BRCA2 loss can create DNA-repair dependency",
    summary:
      "BRCA2 is central to homologous recombination repair. Loss of functional BRCA2 can impair accurate double-strand break repair, increase genomic instability, and generate vulnerabilities to therapies that exploit DNA-repair defects.",
    confidence: 95,
    genes: ["BRCA2", "RAD51", "PARP1", "ATM", "ATR"],
    pathways: ["Homologous recombination", "DNA repair", "PARP response"],
    mechanisms: [
      {
        title: "Homologous recombination failure",
        text: "BRCA2 dysfunction can impair RAD51-mediated high-fidelity DNA repair.",
        score: 98,
      },
      {
        title: "Genomic instability",
        text: "Unresolved DNA lesions can increase chromosomal alterations and tumor evolution.",
        score: 93,
      },
      {
        title: "Synthetic-lethal vulnerability",
        text: "DNA-repair-deficient cells may become disproportionately dependent on alternative repair pathways.",
        score: 96,
      },
    ],
    evidence: [
      {
        title: "BRCA2 and homologous recombination",
        source: "Molecular genetics",
        score: 98,
      },
      {
        title: "PARP inhibitor sensitivity",
        source: "Clinical evidence",
        score: 96,
      },
      {
        title: "Advanced prostate cancer",
        source: "Cancer genomics",
        score: 91,
      },
    ],
    followUps: [
      "Why are PARP inhibitors effective in HRD tumors?",
      "How does RAD51 depend on BRCA2?",
      "What resistance mechanisms can emerge?",
    ],
  },
];

export default function ResearchCopilotCommandCenter() {
  const [question, setQuestion] = useState(presets[0]);
  const [submittedQuestion, setSubmittedQuestion] = useState(presets[0]);
  const [loading, setLoading] = useState(false);
  const [selectedMechanism, setSelectedMechanism] = useState(0);

  const answer = useMemo(() => {
    const query = submittedQuestion.toLowerCase();

    if (query.includes("caf") || query.includes("fibroblast")) {
      return answers[1];
    }

    if (query.includes("cxcl12") || query.includes("cxcr4")) {
      return answers[2];
    }

    if (query.includes("brca2") || query.includes("parp")) {
      return answers[3];
    }

    return answers[0];
  }, [submittedQuestion]);

  function runQuery(value?: string) {
    const nextQuestion = (value ?? question).trim();

    if (!nextQuestion || loading) {
      return;
    }

    setQuestion(nextQuestion);
    setLoading(true);
    setSelectedMechanism(0);

    window.setTimeout(() => {
      setSubmittedQuestion(nextQuestion);
      setLoading(false);
    }, 1500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runQuery();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030507] text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-[1720px] px-4 pb-20 pt-8 md:px-8">
        <header className="mb-6 rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(161,92,255,.9)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-200/70">
                  BioLayers Research Intelligence
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                Research Copilot
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
                Ask a cancer-biology question and explore the answer across
                genes, pathways, mechanisms, evidence, and research directions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusChip label="Context" value="Oncology" />
              <StatusChip label="Evidence" value="Layered" />
              <StatusChip label="Mode" value="Research" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <span className="h-2 w-2 block rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,.8)]" />
              </div>

              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="h-14 w-full rounded-2xl border border-white/[0.08] bg-black/25 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/25 focus:bg-black/35"
                placeholder="Ask a computational oncology question..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative min-w-[190px] overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] px-6 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/[0.13]"
            >
              <span className="relative z-10">
                {loading ? "Analyzing..." : "Ask BioLayers"}
              </span>

              {loading && (
                <motion.div
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: [-100, 320],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => runQuery(preset)}
                className="rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] text-white/35 transition hover:border-white/[0.12] hover:text-white/65"
              >
                {preset}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={answer.title}
            initial={{
              opacity: 0,
              y: 10,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: loading ? 0.35 : 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -8,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.45,
            }}
          >
            <section className="grid gap-6 xl:grid-cols-[0.78fr_1.15fr_.82fr]">
              <aside className="space-y-6">
                <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
                  <PanelHeader eyebrow="Query context" title="Research Question" />

                  <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <p className="text-sm leading-6 text-white/55">
                      {submittedQuestion}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoTile label="Confidence" value={`${answer.confidence}%`} />
                    <InfoTile label="Mechanisms" value={String(answer.mechanisms.length)} />
                    <InfoTile label="Genes" value={String(answer.genes.length)} />
                    <InfoTile label="Pathways" value={String(answer.pathways.length)} />
                  </div>
                </section>

                <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
                  <PanelHeader eyebrow="Entity layer" title="Genes & Molecules" />

                  <div className="mt-5 flex flex-wrap gap-2">
                    {answer.genes.map((gene, index) => (
                      <motion.div
                        key={gene}
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          delay: index * 0.06,
                        }}
                        className="rounded-xl border border-emerald-300/[0.12] bg-emerald-300/[0.045] px-3 py-2 font-mono text-xs text-emerald-200"
                      >
                        {gene}
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
                  <PanelHeader eyebrow="Pathway layer" title="Biological Programs" />

                  <div className="mt-5 space-y-2">
                    {answer.pathways.map((pathway, index) => (
                      <motion.div
                        key={pathway}
                        initial={{
                          opacity: 0,
                          x: -8,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.07,
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                      >
                        <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,.7)]" />

                        <span className="text-xs text-white/55">
                          {pathway}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </aside>

              <section className="relative min-h-[790px] overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#040812]/88 backdrop-blur-xl">
                <div className="border-b border-white/[0.07] px-6 py-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/45">
                    Copilot synthesis
                  </div>

                  <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight md:text-3xl">
                    {answer.title}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="relative overflow-hidden rounded-[26px] border border-cyan-300/[0.1] bg-cyan-300/[0.025] p-6">
                    <div className="absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full bg-cyan-400/[0.07] blur-3xl" />

                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-300" />

                        <span className="text-[10px] uppercase tracking-[0.26em] text-cyan-100/40">
                          Integrated interpretation
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">
                        {answer.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                          Mechanism graph
                        </div>

                        <h3 className="mt-1 text-lg font-semibold">
                          Mechanistic Reasoning
                        </h3>
                      </div>

                      <div className="font-mono text-xs text-white/25">
                        {answer.mechanisms.length} layers
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-cyan-300/40 via-violet-300/30 to-transparent" />

                      <div className="space-y-3">
                        {answer.mechanisms.map((mechanism, index) => {
                          const active = index === selectedMechanism;

                          return (
                            <button
                              key={mechanism.title}
                              onClick={() => setSelectedMechanism(index)}
                              className={`relative z-10 w-full rounded-[22px] border p-4 text-left transition ${
                                active
                                  ? "border-cyan-300/20 bg-cyan-300/[0.055]"
                                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ${
                                    active
                                      ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                                      : "border-white/10 bg-[#070a11] text-white/30"
                                  }`}
                                >
                                  0{index + 1}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-4">
                                    <h4 className="text-sm font-semibold text-white/80">
                                      {mechanism.title}
                                    </h4>

                                    <span className="font-mono text-[10px] text-white/35">
                                      {mechanism.score}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-xs leading-6 text-white/35">
                                    {mechanism.text}
                                  </p>

                                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                                    <motion.div
                                      initial={{
                                        width: 0,
                                      }}
                                      animate={{
                                        width: `${mechanism.score}%`,
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        delay: index * 0.08,
                                      }}
                                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[26px] border border-white/[0.07] bg-black/20 p-5">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/25">
                      Active reasoning layer
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedMechanism}
                        initial={{
                          opacity: 0,
                          y: 6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -6,
                        }}
                        className="mt-4"
                      >
                        <div className="text-xl font-semibold">
                          {answer.mechanisms[selectedMechanism]?.title}
                        </div>

                        <p className="mt-3 text-sm leading-7 text-white/45">
                          {answer.mechanisms[selectedMechanism]?.text}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {loading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#040812]/80 backdrop-blur-md">
                    <div className="text-center">
                      <motion.div
                        className="mx-auto h-20 w-20 rounded-full border border-cyan-300/20 border-t-cyan-300"
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />

                      <div className="mt-5 text-xs uppercase tracking-[0.28em] text-cyan-100/50">
                        Cross-layer reasoning
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <aside className="space-y-6">
                <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
                  <PanelHeader eyebrow="Evidence layer" title="Evidence Stack" />

                  <div className="mt-5 space-y-3">
                    {answer.evidence.map((item, index) => (
                      <motion.article
                        key={item.title}
                        initial={{
                          opacity: 0,
                          x: 8,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-semibold leading-5 text-white/70">
                              {item.title}
                            </div>

                            <div className="mt-1 text-[10px] text-white/30">
                              {item.source}
                            </div>
                          </div>

                          <span className="font-mono text-xs text-emerald-300/70">
                            {item.score}
                          </span>
                        </div>

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-emerald-300"
                            style={{
                              width: `${item.score}%`,
                            }}
                          />
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </section>

                <section className="rounded-[30px] border border-white/[0.08] bg-[#070b10]/85 p-5 backdrop-blur-xl">
                  <PanelHeader eyebrow="Next questions" title="Research Directions" />

                  <div className="mt-5 space-y-2">
                    {answer.followUps.map((followUp) => (
                      <button
                        key={followUp}
                        onClick={() => runQuery(followUp)}
                        className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left text-xs leading-5 text-white/40 transition hover:border-cyan-300/[0.12] hover:bg-cyan-300/[0.035] hover:text-white/65"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-[30px] border border-violet-300/[0.12] bg-violet-300/[0.035] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/[0.08]">
                      <span className="h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_14px_rgba(221,214,254,.9)]" />
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-violet-100/40">
                        Copilot confidence
                      </div>

                      <div className="mt-1 text-2xl font-semibold">
                        {answer.confidence}%
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-white/35">
                    Confidence represents the internal demo synthesis across
                    molecular, pathway, and evidence layers.
                  </p>
                </section>
              </aside>
            </section>
          </motion.div>
        </AnimatePresence>

        <section className="mt-6 rounded-[34px] border border-white/[0.08] bg-[#040812]/80 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                BioLayers research workflow
              </div>

              <h2 className="mt-2 text-2xl font-medium">
                Question → Biology → Mechanism → Evidence
              </h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              RESEARCH MODE ACTIVE
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <WorkflowCard index="01" title="Question" text="Define the biological problem." />
            <WorkflowCard index="02" title="Entities" text="Resolve genes, proteins, cells, and pathways." />
            <WorkflowCard index="03" title="Mechanism" text="Trace biological relationships and causal hypotheses." />
            <WorkflowCard index="04" title="Evidence" text="Connect interpretation to scientific support." />
          </div>
        </section>

        <footer className="py-6 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
          BioLayers AI · research exploration interface · not clinical decision support
        </footer>
      </div>
    </main>
  );
}

function PanelHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/25">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-lg font-semibold text-white/90">
        {title}
      </h2>
    </div>
  );
}

function StatusChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
      <span className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </span>

      <span className="ml-2 text-xs font-medium text-white/65">
        {value}
      </span>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>

      <div className="mt-2 font-mono text-sm text-white/65">
        {value}
      </div>
    </div>
  );
}

function WorkflowCard({
  index,
  title,
  text,
}: {
  index: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="font-mono text-[10px] text-cyan-300/60">
        {index}
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/30">
        {text}
      </p>
    </article>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-14%] top-[-18%] h-[700px] w-[700px] rounded-full bg-cyan-500/[0.055] blur-[180px]" />

      <div className="absolute right-[-12%] top-[15%] h-[660px] w-[660px] rounded-full bg-violet-500/[0.06] blur-[180px]" />

      <div className="absolute bottom-[-15%] left-[34%] h-[520px] w-[520px] rounded-full bg-emerald-500/[0.035] blur-[160px]" />

      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />

      {Array.from({ length: 38 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-px w-px rounded-full bg-white"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 59) % 100}%`,
          }}
          animate={{
            opacity: [0.05, 0.48, 0.05],
          }}
          transition={{
            duration: 2.5 + (index % 7),
            repeat: Infinity,
            delay: index * 0.08,
          }}
        />
      ))}
    </div>
  );
}