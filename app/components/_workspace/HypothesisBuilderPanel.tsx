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
            className="absolute inset-0 z-[64] bg-[#030507]/62 backdrop-blur-[6px]"
          />

          <motion.section
            initial={{ opacity: 0, y: 34, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 34, scale: 0.985, filter: "blur(8px)" }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-5 left-1/2 top-5 z-[67] flex w-[min(820px,calc(100vw-40px))] -translate-x-1/2 flex-col overflow-hidden rounded-[26px] border border-teal-100/[0.08] bg-[#070b10]/98 shadow-[0_34px_130px_rgba(1,8,15,.64)] backdrop-blur-3xl"
          >
            <header className="relative overflow-hidden border-b border-teal-100/[0.065] px-5 py-5 sm:px-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-teal-300/[0.045] blur-3xl" />
              <div className="pointer-events-none absolute -left-20 bottom-[-110px] h-56 w-56 rounded-full bg-sky-300/[0.025] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/[0.18] to-transparent" />

              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_9px_rgba(77,141,255,.8)]"
                      animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.22, 1] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                      BL-HYP / Research Engine
                    </p>
                  </div>

                  <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#eef4ff] sm:text-[30px]">
                    Hypothesis Builder
                  </h2>

                  <p className="mt-2 max-w-xl text-[12px] leading-6 text-slate-400">
                    Convert the current graph context into a falsifiable research
                    question, mechanistic hypothesis, experimental direction,
                    and evidence-gap checklist.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[11px] border border-teal-100/[0.07] bg-white/[0.018] px-3 py-2 font-mono text-[10px] text-slate-400 transition duration-300 hover:bg-white/[0.04] hover:text-slate-100"
                >
                  ESC
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <StatusMetric label="Mode" value={activePath ? "Path" : "Entity"} />
                <StatusMetric label="Entities" value={String(activePath?.nodes.length ?? 1)} />
                <StatusMetric label="Relations" value={String(activePath?.edges.length ?? 0)} />
                <StatusMetric label="Readouts" value={String(draft.readouts.length)} />
              </div>

              <NotebookBlock index="01" label="Research question" text={draft.question} />
              <NotebookBlock index="02" label="Testable hypothesis" text={draft.hypothesis} emphasized />
              <NotebookBlock index="03" label="Graph rationale" text={draft.rationale} />

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <NotebookBlock index="04" label="Perturbation concept" text={draft.perturbation} />
                <NotebookBlock index="05" label="Falsification criterion" text={draft.falsification} />
              </div>

              <section className="mt-3 overflow-hidden rounded-[16px] border border-teal-100/[0.055] bg-[#0a0f14]/46">
                <div className="flex items-center justify-between border-b border-teal-100/[0.05] px-4 py-3.5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-sky-300">
                      06 / Suggested readouts
                    </p>
                    <p className="mt-1.5 text-[13px] font-semibold text-slate-100">
                      What would you actually measure?
                    </p>
                  </div>
                  <span className="rounded-full border border-sky-200/[0.08] bg-sky-200/[0.025] px-2.5 py-1 font-mono text-[9px] text-sky-200/70">
                    {draft.readouts.length} readouts
                  </span>
                </div>

                <div className="divide-y divide-teal-100/[0.045]">
                  {draft.readouts.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.035 }}
                      className="group flex gap-4 px-4 py-3.5 transition hover:bg-white/[0.015]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border border-sky-200/[0.08] bg-sky-200/[0.025] font-mono text-[8px] text-sky-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[11px] leading-6 text-slate-400 group-hover:text-slate-300">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="mt-3 rounded-[16px] border border-amber-200/[0.08] bg-amber-200/[0.025] p-4">
                <div className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.35)]" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-amber-300">
                      07 / Evidence gap
                    </p>
                    <p className="mt-2 text-[12px] leading-6 text-amber-100/75">
                      {draft.evidenceGap}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-3 rounded-[16px] border border-teal-100/[0.055] bg-black/[0.08] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-slate-500">
                  Graph provenance
                </p>
                <p className="mt-2 text-[11px] leading-6 text-slate-500">
                  {draft.provenance}
                </p>
              </section>
            </div>

            <footer className="flex flex-col gap-3 border-t border-teal-100/[0.065] bg-[#070b10]/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex max-w-lg gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <p className="text-[10px] leading-5 text-slate-500">
                  Research planning aid only. Graph relationships and confidence
                  values do not establish causality or clinical validity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void copyDraft()}
                className="group relative overflow-hidden rounded-[13px] border border-teal-200/[0.16] bg-[linear-gradient(135deg,#8db2ff,#a15cff)] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#04070a] shadow-[0_10px_26px_rgba(77,141,255,.11)] transition duration-300 hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.34)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
                <span className="relative">{copied ? "Copied ✓" : "Copy research brief"}</span>
              </button>
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[13px] border border-teal-100/[0.05] bg-black/[0.08] px-3 py-3">
      <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-slate-600">{label}</p>
      <p className="mt-1.5 font-mono text-[12px] font-semibold text-teal-100">{value}</p>
    </div>
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
    <motion.section
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-3 rounded-[16px] border p-4 transition duration-300 ${
        emphasized
          ? "border-teal-200/[0.13] bg-teal-200/[0.035] shadow-[0_12px_38px_rgba(77,141,255,.035)]"
          : "border-teal-100/[0.055] bg-[#0a0f14]/46"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[9px] font-bold ${emphasized ? "text-teal-300" : "text-slate-600"}`}>
          {index}
        </span>
        <span className="h-px w-5 bg-teal-100/[0.08]" />
        <p className={`text-[9px] font-bold uppercase tracking-[0.16em] ${emphasized ? "text-teal-300" : "text-slate-500"}`}>
          {label}
        </p>
      </div>

      <p className={`mt-3 leading-7 ${
        emphasized
          ? "text-[15px] font-medium text-[#effcf9]"
          : "text-[12px] text-slate-400"
      }`}>
        {text}
      </p>
    </motion.section>
  );
}