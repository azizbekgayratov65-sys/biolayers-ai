"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  BookOpenText,
  CircleHelp,
  GitBranch,
  Lightbulb,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type CopilotPrompt = {
  id: string;
  question: string;
  category: string;
  answer: string;
  reasoning: string;
  evidence: string;
  uncertainty: string;
  nextQuestion: string;
};

const prompts: CopilotPrompt[] = [
  {
    id: "edge",
    question: "Why does TGF-β connect to EMT?",
    category: "Mechanistic explanation",
    answer:
      "TGF-β signaling can activate SMAD-dependent transcriptional programs that alter epithelial identity and promote EMT-associated phenotypes.",
    reasoning:
      "The pathway is not a single direct jump. TGF-β binds its receptor complex, activates intracellular SMAD signaling, and changes transcriptional regulation linked to cell-state plasticity.",
    evidence:
      "BioLayers can surface the papers and evidence sentences supporting each intermediate relationship rather than presenting only the final association.",
    uncertainty:
      "The strength and biological consequence of TGF-β-driven EMT can vary by cancer type, experimental model, mutation background, and microenvironment.",
    nextQuestion:
      "Which cancer contexts show the strongest evidence for TGF-β-driven EMT?",
  },

  {
    id: "conflict",
    question: "Show conflicting evidence.",
    category: "Evidence conflict",
    answer:
      "Some studies support EMT-associated programs as important contributors to invasion and metastasis, while others show that metastatic dissemination can occur without a complete canonical EMT.",
    reasoning:
      "This suggests that EMT should be represented as context-dependent biology rather than a universal binary mechanism.",
    evidence:
      "A multi-paper evidence layer can group supporting, conflicting, and model-specific findings around the same mechanistic edge.",
    uncertainty:
      "Differences in experimental definitions of EMT, lineage tracing, tumor type, and model systems can produce apparently contradictory conclusions.",
    nextQuestion:
      "Which experimental models are responsible for the strongest disagreement?",
  },

  {
    id: "weakest",
    question: "Which connection is weakest?",
    category: "Evidence strength",
    answer:
      "In this demonstration, the transition from EMT-associated changes to a complete metastatic phenotype carries the greatest uncertainty.",
    reasoning:
      "Metastasis is a multistep process involving invasion, survival, circulation, colonization, and adaptation. One transcriptional program rarely explains the entire phenotype.",
    evidence:
      "BioLayers can compare evidence density, directness, experimental context, and contradictory findings for each mechanistic edge.",
    uncertainty:
      "A low-confidence edge does not mean the relationship is false. It means current evidence may be indirect, heterogeneous, or context-dependent.",
    nextQuestion:
      "What intermediate mechanisms could explain the gap between EMT and metastasis?",
  },

  {
    id: "gap",
    question: "What mechanism is still uncertain?",
    category: "Mechanistic gap",
    answer:
      "A major unresolved step may be how molecular signaling changes translate into successful metastatic colonization at a distant organ.",
    reasoning:
      "Many studies explain early signaling and invasion, but the transition from dissemination to organ-specific colonization requires additional stromal, immune, and metabolic interactions.",
    evidence:
      "BioLayers can identify where a mechanistic chain contains dense evidence on both sides but weak direct evidence connecting the intermediate steps.",
    uncertainty:
      "The missing link may represent incomplete literature integration rather than a truly unknown biological mechanism.",
    nextQuestion:
      "Search for evidence connecting SMAD signaling to organ-specific metastatic colonization.",
  },
];

const mechanism = [
  "CAF",
  "TGF-β",
  "TGFBR",
  "SMAD2/3",
  "EMT",
  "Invasion",
  "Metastasis",
];

export default function ResearchCopilotSection() {
  const [selectedPromptId, setSelectedPromptId] =
    React.useState("edge");

  const selectedPrompt =
    prompts.find((prompt) => prompt.id === selectedPromptId) ??
    prompts[0];

  return (
    <section
      id="research-copilot"
      aria-labelledby="research-copilot-heading"
      className="
        relative
        isolate
        overflow-hidden
        px-6
        py-28
        md:px-10
        md:py-36
        lg:px-16
        lg:py-44
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[1000px]
          w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500/[0.04]
          blur-[210px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-[-160px]
          top-[15%]
          -z-10
          h-[500px]
          w-[500px]
          rounded-full
          bg-purple-500/[0.04]
          blur-[170px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-200px]
          right-[-120px]
          -z-10
          h-[520px]
          w-[520px]
          rounded-full
          bg-fuchsia-500/[0.045]
          blur-[170px]
        "
      />

      <div className="mx-auto max-w-7xl">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 22,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-5xl"
        >
          <div
            className="
              mb-6
              text-sm
              font-medium
              uppercase
              tracking-[0.3em]
              text-purple-300/70
            "
          >
            Mechanism-aware research copilot
          </div>

          <h2
            id="research-copilot-heading"
            className="
              text-4xl
              font-semibold
              leading-[1.04]
              tracking-[-0.045em]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Ask the mechanism,

            <span
              className="
                ml-3
                bg-gradient-to-r
                from-cyan-300
                via-purple-300
                to-fuchsia-300
                bg-clip-text
                text-transparent
              "
            >
              not just the chatbot.
            </span>
          </h2>

          <p
            className="
              mt-8
              max-w-4xl
              text-base
              leading-8
              text-white/50
              md:text-lg
              md:leading-9
            "
          >
            BioLayers Copilot is designed to reason over the current
            biological map, evidence, and uncertainty — so researchers
            can ask why a connection exists, where it is weak, and what
            should be investigated next.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* WORKSPACE                                        */}
        {/* ================================================= */}

        <div
          className="
            mt-16
            grid
            items-start
            gap-6
            xl:grid-cols-[420px_minmax(0,1fr)]
          "
        >
          {/* ================================================= */}
          {/* LEFT — MECHANISM CONTEXT                         */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              rounded-[30px]
              border
              border-white/[0.09]
              bg-white/[0.022]
              p-6
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-white/26
              "
            >
              <GitBranch className="h-4 w-4" />

              Active mechanism context
            </div>

            <div className="mt-6 space-y-2">
              {mechanism.map((node, index) => (
                <React.Fragment key={node}>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.05,
                    }}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-[16px]
                      border
                      border-white/[0.07]
                      bg-white/[0.02]
                      px-4
                      py-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-cyan-300/10
                        bg-cyan-300/[0.04]
                        text-[10px]
                        font-semibold
                        text-cyan-200/55
                      "
                    >
                      {index + 1}
                    </div>

                    <div
                      className="
                        text-sm
                        font-medium
                        text-white/62
                      "
                    >
                      {node}
                    </div>
                  </motion.div>

                  {index < mechanism.length - 1 && (
                    <div
                      className="
                        ml-[13px]
                        h-4
                        w-px
                        bg-gradient-to-b
                        from-cyan-300/20
                        to-purple-300/10
                      "
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* CONTEXT CARD */}

            <div
              className="
                mt-6
                rounded-[18px]
                border
                border-white/[0.07]
                bg-black/20
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-cyan-300/45
                "
              >
                <BrainCircuit className="h-3.5 w-3.5" />

                Copilot context
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-white/34
                "
              >
                The assistant can reason over the selected mechanism,
                evidence states, biological directionality, and unresolved
                gaps.
              </p>
            </div>
          </motion.div>

          {/* ================================================= */}
          {/* RIGHT — COPILOT                                  */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.8,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              overflow-hidden
              rounded-[30px]
              border
              border-white/[0.09]
              bg-white/[0.022]
              backdrop-blur-xl
            "
          >
            {/* ================================================= */}
            {/* COPILOT HEADER                                    */}
            {/* ================================================= */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-b
                border-white/[0.07]
                px-6
                py-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-white/26
                  "
                >
                  <MessageSquareText className="h-4 w-4" />

                  Research Copilot
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/45
                  "
                >
                  Ask questions grounded in the current mechanism.
                </div>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-purple-300/10
                  bg-purple-300/[0.04]
                  px-3
                  py-1.5
                  text-[10px]
                  font-medium
                  text-purple-200/55
                "
              >
                <Sparkles className="h-3.5 w-3.5" />

                Mechanism aware
              </div>
            </div>

            {/* ================================================= */}
            {/* QUICK QUESTIONS                                  */}
            {/* ================================================= */}

            <div
              className="
                border-b
                border-white/[0.07]
                px-6
                py-5
              "
            >
              <div
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white/22
                "
              >
                Ask
              </div>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {prompts.map((prompt) => {
                  const selected =
                    prompt.id === selectedPromptId;

                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() =>
                        setSelectedPromptId(prompt.id)
                      }
                      className={`
                        rounded-full
                        border
                        px-3.5
                        py-2
                        text-xs
                        font-medium
                        transition
                        duration-300

                        ${
                          selected
                            ? "border-cyan-300/20 bg-cyan-300/[0.065] text-cyan-100/80"
                            : "border-white/[0.07] bg-white/[0.02] text-white/38 hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white/60"
                        }
                      `}
                    >
                      {prompt.question}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================================= */}
            {/* RESPONSE                                         */}
            {/* ================================================= */}

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPrompt.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="p-6"
              >
                {/* QUESTION */}

                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-purple-300/10
                      bg-purple-300/[0.045]
                    "
                  >
                    <BrainCircuit
                      className="
                        h-4
                        w-4
                        text-purple-200/60
                      "
                    />
                  </div>

                  <div>
                    <div
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-purple-300/45
                      "
                    >
                      {selectedPrompt.category}
                    </div>

                    <div
                      className="
                        mt-1
                        text-lg
                        font-medium
                        text-white/80
                      "
                    >
                      {selectedPrompt.question}
                    </div>
                  </div>
                </div>

                {/* STRUCTURED ANSWER */}

                <div className="mt-7 space-y-3">
                  <CopilotBlock
                    icon={MessageSquareText}
                    label="Answer"
                    value={selectedPrompt.answer}
                    accent="text-cyan-300/55"
                  />

                  <CopilotBlock
                    icon={GitBranch}
                    label="Mechanistic reasoning"
                    value={selectedPrompt.reasoning}
                    accent="text-purple-300/55"
                  />

                  <CopilotBlock
                    icon={BookOpenText}
                    label="Evidence"
                    value={selectedPrompt.evidence}
                    accent="text-fuchsia-300/55"
                  />

                  <CopilotBlock
                    icon={ShieldAlert}
                    label="Uncertainty"
                    value={selectedPrompt.uncertainty}
                    accent="text-amber-300/55"
                  />
                </div>

                {/* ================================================= */}
                {/* NEXT RESEARCH QUESTION                            */}
                {/* ================================================= */}

                <div
                  className="
                    mt-6
                    rounded-[20px]
                    border
                    border-cyan-300/10
                    bg-cyan-300/[0.035]
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.15em]
                      text-cyan-300/45
                    "
                  >
                    <CircleHelp className="h-3.5 w-3.5" />

                    Next research question
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-white/52
                    "
                  >
                    {selectedPrompt.nextQuestion}
                  </p>
                </div>

                {/* ================================================= */}
                {/* HYPOTHESIS CTA                                   */}
                {/* ================================================= */}

                <a
                  href="#hypothesis-builder"
                  className="
                    group
                    mt-5
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    border
                    border-white/[0.1]
                    bg-white/[0.045]
                    px-5
                    py-3.5
                    text-sm
                    font-medium
                    text-white/72
                    transition
                    duration-300
                    hover:border-fuchsia-300/20
                    hover:bg-fuchsia-300/[0.05]
                    hover:text-white
                  "
                >
                  <Lightbulb className="h-4 w-4" />

                  Build hypothesis from this gap

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </a>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM NOTE                                      */}
        {/* ================================================= */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            mx-auto
            mt-8
            max-w-3xl
            text-center
            text-xs
            leading-6
            text-white/24
          "
        >
          This homepage interaction is illustrative. In the full
          workspace, Copilot responses can be grounded in the actual
          mechanism graph, papers, and evidence attached to the active
          research project.
        </motion.p>
      </div>
    </section>
  );
}

/* =========================================================
   COPILOT RESPONSE BLOCK
   ========================================================= */

function CopilotBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="
        rounded-[18px]
        border
        border-white/[0.07]
        bg-white/[0.018]
        p-5
      "
    >
      <div
        className={`
          flex
          items-center
          gap-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          ${accent}
        `}
      >
        <Icon className="h-3.5 w-3.5" />

        {label}
      </div>

      <p
        className="
          mt-3
          text-sm
          leading-6
          text-white/43
        "
      >
        {value}
      </p>
    </div>
  );
}