"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Edge, Node } from "@xyflow/react";

import type { EntityType } from "../../lib/buildGraphFromText";
import type {
  ResearchEdgeData,
  ResearchEntityData,
} from "../../lib/researchGraph";

import type {
  BiologicalPathResult,
} from "./ConnectBiologyPanel";

type EntityNodeType = Node<ResearchEntityData, "entity">;

type HypothesisBuilderPanelProps = {
  nodes: EntityNodeType[];
  edges: Edge<ResearchEdgeData>[];
  selectedEntity: ResearchEntityData;
  activePath: BiologicalPathResult | null;
  open: boolean;
  onClose: () => void;
};

type HypothesisDraft = {
  question: string;
  hypothesis: string;
  rationale: string;
  perturbation: string;
  readouts: string[];
  evidenceGap: string;
  falsification: string;
  provenance: string;
};

function normalizeRelation(label: unknown) {
  if (typeof label === "string" && label.trim()) {
    return label.trim();
  }

  return "is connected to";
}

function perturbationForType(
  type: EntityType,
  label: string,
) {
  switch (type) {
    case "gene":
      return `Perturb ${label} expression or activity and compare the downstream molecular state with a matched control.`;
    case "protein":
      return `Alter ${label} activity or abundance and measure whether the predicted downstream state changes.`;
    case "pathway":
      return `Modulate ${label} activity and test whether the downstream path responds in the predicted direction.`;
    case "cell":
      return `Compare systems with altered ${label} abundance/state against matched controls, ideally in a context-preserving model.`;
    case "drug":
      return `Treat the model with ${label} and compare pathway and phenotype changes against vehicle/control conditions.`;
    case "disease":
      return `Compare biological states associated with ${label} against a relevant reference state and test the predicted mechanism.`;
    case "process":
      return `Perturb a tractable regulator of ${label} and test whether the downstream phenotype changes as predicted.`;
    default:
      return `Perturb ${label} and measure the predicted downstream biological response.`;
  }
}

function readoutsForPath(
  sourceType: EntityType,
  targetType: EntityType,
) {
  const result = [
    "Target-state change relative to matched controls",
    "Intermediate-node activity along the proposed mechanism",
  ];

  if (
    sourceType === "gene" ||
    targetType === "gene" ||
    sourceType === "protein" ||
    targetType === "protein"
  ) {
    result.push(
      "Expression or protein-level readout for key molecular intermediates",
    );
  }

  if (
    sourceType === "cell" ||
    targetType === "cell"
  ) {
    result.push(
      "Cell-state composition or single-cell response",
    );
  }

  result.push(
    "Independent validation using an orthogonal assay or dataset",
  );

  return result;
}

function buildDraft(
  nodes: EntityNodeType[],
  edges: Edge<ResearchEdgeData>[],
  selectedEntity: ResearchEntityData,
  activePath: BiologicalPathResult | null,
): HypothesisDraft {
  if (
    activePath &&
    activePath.nodes.length >= 2
  ) {
    const source = activePath.nodes[0];
    const target =
      activePath.nodes[
        activePath.nodes.length - 1
      ];

    const intermediates =
      activePath.nodes
        .slice(1, -1)
        .map((item) => item.label);

    const weakestEdge =
      [...activePath.edges].sort(
        (a, b) =>
          a.confidence - b.confidence,
      )[0];

    const mechanismText =
      activePath.edges.length > 0
        ? activePath.edges
            .map((edge, index) => {
              const from =
                activePath.nodes[index]?.label ??
                edge.source;
              const to =
                activePath.nodes[index + 1]?.label ??
                edge.target;

              return `${from} ${normalizeRelation(
                edge.relation,
              )} ${to}`;
            })
            .join("; ")
        : `${source.label} is linked to ${target.label}`;

    return {
      question:
        `Does ${source.label} influence ${target.label} through the mechanistic path represented in this BioLayers graph?`,

      hypothesis:
        `${source.label} contributes to changes in ${target.label}${
          intermediates.length
            ? ` through ${intermediates.join(
                " → ",
              )}`
            : ""
        }, such that perturbing the source should produce a measurable downstream change in the target.`,

      rationale:
        `The current graph encodes the following path: ${mechanismText}. This is a graph-derived research hypothesis rather than a claim of established causality.`,

      perturbation:
        perturbationForType(
          source.type,
          source.label,
        ),

      readouts: readoutsForPath(
        source.type,
        target.type,
      ),

      evidenceGap: weakestEdge
        ? `The weakest represented transition is "${weakestEdge.relation}" at ${Math.round(
            weakestEdge.confidence * 100,
          )}% confidence. This step should be prioritized for literature review or experimental validation.`
        : "The graph does not yet contain enough edge-level evidence to identify a specific weak transition.",

      falsification:
        `The hypothesis would be weakened if perturbing ${source.label} does not reproducibly alter the predicted intermediate states or ${target.label}, despite adequate target engagement and assay sensitivity.`,

      provenance:
        `Generated from ${activePath.nodes.length} graph entities and ${activePath.edges.length} graph relationships currently loaded in BioLayers.`,
    };
  }

  const selectedNode = nodes.find(
    (node) =>
      node.data.label ===
      selectedEntity.label,
  );

  const connectedEdges = selectedNode
    ? edges.filter(
        (edge) =>
          edge.source === selectedNode.id ||
          edge.target === selectedNode.id,
      )
    : [];

  const neighborIds = new Set(
    connectedEdges.map((edge) =>
      edge.source === selectedNode?.id
        ? edge.target
        : edge.source,
    ),
  );

  const neighbors = nodes
    .filter((node) =>
      neighborIds.has(node.id),
    )
    .slice(0, 3);

  const neighborText =
    neighbors.length > 0
      ? neighbors
          .map((node) => node.data.label)
          .join(", ")
      : "its connected molecular context";

  return {
    question:
      `Which biological mechanisms connect ${selectedEntity.label} to its surrounding cancer network?`,

    hypothesis:
      `${selectedEntity.label} influences a measurable cancer-related state through one or more of its represented connections, particularly ${neighborText}.`,

    rationale:
      `${selectedEntity.label} currently has ${connectedEdges.length} graph connection${
        connectedEdges.length === 1
          ? ""
          : "s"
      }. BioLayers can turn one of these relationships into a testable mechanistic path before stronger conclusions are made.`,

    perturbation:
      perturbationForType(
        selectedEntity.type,
        selectedEntity.label,
      ),

    readouts: [
      "Direct measurement of the selected entity",
      "Downstream pathway or cell-state response",
      "Phenotypic effect relevant to the cancer model",
      "Independent replication or orthogonal validation",
    ],

    evidenceGap:
      "Select two entities with Connect the Biology to identify a specific mechanistic bridge and automatically locate its weakest evidence step.",

    falsification:
      `The hypothesis would be weakened if a well-controlled perturbation of ${selectedEntity.label} produces no reproducible downstream change in the proposed mechanism.`,

    provenance:
      `Generated from the currently selected BioLayers entity and ${connectedEdges.length} local graph relationships.`,
  };
}

export default function HypothesisBuilderPanel({
  nodes,
  edges,
  selectedEntity,
  activePath,
  open,
  onClose,
}: HypothesisBuilderPanelProps) {
  const [copied, setCopied] =
    useState(false);

  const draft = useMemo(
    () =>
      buildDraft(
        nodes,
        edges,
        selectedEntity,
        activePath,
      ),
    [
      nodes,
      edges,
      selectedEntity,
      activePath,
    ],
  );

  async function copyDraft() {
    const text = [
      "BIOLAYERS RESEARCH HYPOTHESIS",
      "",
      `Question: ${draft.question}`,
      "",
      `Hypothesis: ${draft.hypothesis}`,
      "",
      `Rationale: ${draft.rationale}`,
      "",
      `Perturbation concept: ${draft.perturbation}`,
      "",
      "Suggested readouts:",
      ...draft.readouts.map(
        (item) => `- ${item}`,
      ),
      "",
      `Evidence gap: ${draft.evidenceGap}`,
      "",
      `Falsification criterion: ${draft.falsification}`,
      "",
      `Provenance: ${draft.provenance}`,
      "",
      "Research planning only — not a clinical conclusion.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(
        text,
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1600,
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close Hypothesis Builder"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[64] bg-[#030403]/60 backdrop-blur-sm"
          />

          <motion.section
            initial={{
              opacity: 0,
              y: 36,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 36,
              scale: 0.985,
            }}
            transition={{
              duration: 0.34,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-5 left-1/2 top-5 z-[67] flex w-[min(760px,calc(100vw-40px))] -translate-x-1/2 flex-col overflow-hidden rounded-[24px] border border-[#4a4435] bg-[#11110d]/98 shadow-[0_34px_130px_rgba(0,0,0,.68)]"
          >
            <header className="border-b border-[#383326] bg-[#17160f] px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.21em] text-[#a99d78]">
                    BL-HYP / Research notebook
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#f0ead7]">
                    Hypothesis Builder
                  </h2>

                  <p className="mt-2 max-w-xl text-xs leading-6 text-[#aaa38f]">
                    Convert the current graph context into a falsifiable
                    research question, a mechanistic hypothesis, and an
                    evidence-gap checklist.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[10px] border border-[#484231] bg-[#0f0f0b] px-3 py-2 font-mono text-[10px] text-[#9a927d] transition hover:border-[#77705c] hover:text-white"
                >
                  ESC
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <NotebookBlock
                index="01"
                label="Research question"
                text={draft.question}
              />

              <NotebookBlock
                index="02"
                label="Testable hypothesis"
                text={draft.hypothesis}
                emphasized
              />

              <NotebookBlock
                index="03"
                label="Graph rationale"
                text={draft.rationale}
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <NotebookBlock
                  index="04"
                  label="Perturbation concept"
                  text={draft.perturbation}
                />

                <NotebookBlock
                  index="05"
                  label="Falsification criterion"
                  text={draft.falsification}
                />
              </div>

              <section className="mt-5 border border-[#3a3528] bg-[#15140e]">
                <div className="flex items-center justify-between border-b border-[#302c22] px-4 py-3">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#77705e]">
                      06 / Suggested readouts
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#ded7c2]">
                      What would you actually measure?
                    </p>
                  </div>

                  <span className="font-mono text-[9px] text-[#716b59]">
                    {draft.readouts.length} READOUTS
                  </span>
                </div>

                <div className="divide-y divide-[#2c291f]">
                  {draft.readouts.map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex gap-4 px-4 py-3"
                      >
                        <span className="font-mono text-[9px] text-[#756f5c]">
                          {String(
                            index + 1,
                          ).padStart(2, "0")}
                        </span>

                        <p className="text-xs leading-6 text-[#aaa38f]">
                          {item}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section className="mt-5 border border-[#5a3c30] bg-[#1c120e] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#c57e61]">
                  07 / Evidence gap
                </p>

                <p className="mt-2 text-sm leading-7 text-[#e0b9a7]">
                  {draft.evidenceGap}
                </p>
              </section>

              <section className="mt-5 border border-[#363226] bg-[#12110c] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#77705e]">
                  Graph provenance
                </p>

                <p className="mt-2 text-xs leading-6 text-[#918a77]">
                  {draft.provenance}
                </p>
              </section>
            </div>

            <footer className="flex flex-col gap-3 border-t border-[#383326] bg-[#16150f] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-[10px] leading-5 text-[#7f7866]">
                Research planning aid only. Graph relationships and
                confidence values do not establish causality or clinical
                validity.
              </p>

              <button
                type="button"
                onClick={() => {
                  void copyDraft();
                }}
                className="rounded-[11px] border border-[#d7c9a4]/30 bg-[#e8d9b5] px-4 py-2.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[#17150f] transition hover:brightness-110"
              >
                {copied
                  ? "Copied"
                  : "Copy research brief"}
              </button>
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

function NotebookBlock({
  index,
  label,
  text,
  emphasized = false,
}: {
  index: string;
  label: string;
  text: string;
  emphasized?: boolean;
}) {
  return (
    <section
      className={`border p-4 ${
        emphasized
          ? "border-[#d7c9a4]/30 bg-[#1b1a12]"
          : "border-[#39352a] bg-[#14130e]"
      }`}
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#77705e]">
        {index} / {label}
      </p>

      <p
        className={`mt-3 leading-7 ${
          emphasized
            ? "text-base font-medium text-[#f0ead7]"
            : "text-sm text-[#aaa38f]"
        }`}
      >
        {text}
      </p>
    </section>
  );
}