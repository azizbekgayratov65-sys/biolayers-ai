"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Edge, Node } from "@xyflow/react";

import type { EntityType } from "../../lib/buildGraphFromText";
import type { ResearchEntityData } from "../../lib/researchGraph";
import type { PubMedPaper } from "../../hooks/usePubMed";

import EdgeInspectorPanel from "./EdgeInspectorPanel";
import InspectorPanel from "./InspectorPanel";

type EntityNodeType = Node<ResearchEntityData, "entity">;

type EvidenceProfile = {
  level: "No evidence" | "Limited" | "Moderate" | "Strong";
  score: number;
  description: string;
  badgeClass: string;
  meterClass: string;
};

type RelatedConnection = {
  nodeId: string;
  label: string;
  type: EntityType;
  relation: string;
  direction: "incoming" | "outgoing";
};

type InspectorSidebarProps = {
  selectedEdge: Edge | undefined;
  selectedEdgeSource: EntityNodeType | undefined;
  selectedEdgeTarget: EntityNodeType | undefined;
  selectedEdgeLabel: string;
  selectedEntity: ResearchEntityData;
  selectedConnectionCount: number;
  evidenceProfile: EvidenceProfile;
  relatedConnections: RelatedConnection[];
  pubMedLoading: boolean;
  pubMedError: string;
  pubMedPapers: PubMedPaper[];
  focusNode: (nodeId: string) => Promise<void>;
  openPaperInspector: (paper: PubMedPaper) => void;
  onAskCopilot: () => void;
};

export default function InspectorSidebar({
  selectedEdge,
  selectedEdgeSource,
  selectedEdgeTarget,
  selectedEdgeLabel,
  selectedEntity,
  selectedConnectionCount,
  evidenceProfile,
  relatedConnections,
  pubMedLoading,
  pubMedError,
  pubMedPapers,
  focusNode,
  openPaperInspector,
  onAskCopilot,
}: InspectorSidebarProps) {
  const inspectingEdge =
    Boolean(
      selectedEdge &&
        selectedEdgeSource &&
        selectedEdgeTarget,
    );

  return (
    <aside className="relative hidden overflow-y-auto border-l border-teal-100/[0.075] bg-[#081722]/82 px-4 py-4 shadow-[-20px_0_55px_rgba(2,8,15,.09)] backdrop-blur-[28px] lg:block">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_70%_0%,rgba(56,189,248,.065),transparent_64%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-[radial-gradient(circle,rgba(45,212,191,.035),transparent_70%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 border-b border-teal-100/[0.06] pb-3.5">
          <div>
            <WorkspaceSectionLabel>
              {inspectingEdge
                ? "Relationship"
                : "Entity"}
            </WorkspaceSectionLabel>

            <p className="mt-2 text-[13px] font-semibold tracking-[-0.02em] text-[#edf9f7]">
              {inspectingEdge
                ? "Connection inspector"
                : "Biology inspector"}
            </p>
          </div>

          <span className="flex items-center gap-1.5 rounded-full border border-teal-100/[0.07] bg-white/[0.02] px-2 py-1">
            <motion.span
              className={`h-1.5 w-1.5 rounded-full ${
                inspectingEdge
                  ? "bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,.75)]"
                  : "bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,.75)]"
              }`}
              animate={{
                opacity: [0.65, 1, 0.65],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.13em] text-slate-500">
              {inspectingEdge ? "Edge" : "Node"}
            </span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {selectedEdge &&
          selectedEdgeSource &&
          selectedEdgeTarget ? (
            <motion.div
              key={`edge-${selectedEdge.id}`}
              initial={{
                opacity: 0,
                x: 12,
                filter: "blur(7px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: -10,
                filter: "blur(7px)",
              }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <EdgeInspectorPanel
                selectedEdgeId={selectedEdge.id}
                selectedEdgeSource={selectedEdgeSource}
                selectedEdgeTarget={selectedEdgeTarget}
                selectedEdgeLabel={selectedEdgeLabel}
                evidenceProfile={evidenceProfile}
                pubMedPapers={pubMedPapers}
                focusNode={focusNode}
                openPaperInspector={openPaperInspector}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`node-${selectedEntity.label}`}
              initial={{
                opacity: 0,
                x: 12,
                filter: "blur(7px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: -10,
                filter: "blur(7px)",
              }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <InspectorPanel
                selectedEntity={selectedEntity}
                selectedConnectionCount={selectedConnectionCount}
                evidenceProfile={evidenceProfile}
                relatedConnections={relatedConnections}
                pubMedLoading={pubMedLoading}
                pubMedError={pubMedError}
                pubMedPapers={pubMedPapers}
                focusNode={focusNode}
                openPaperInspector={openPaperInspector}
                onAskCopilot={onAskCopilot}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

function WorkspaceSectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
      <span className="h-px w-3 bg-teal-200/[0.22]" />
      <span>{children}</span>
    </div>
  );
}