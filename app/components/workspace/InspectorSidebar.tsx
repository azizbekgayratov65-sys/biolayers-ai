"use client";

import type {
  ReactNode,
} from "react";
import {
  AnimatePresence,
} from "framer-motion";
import type {
  Edge,
  Node,
} from "@xyflow/react";

import type {
  EntityType,
} from "../../lib/buildGraphFromText";
import type {
  ResearchEdgeData,
  ResearchEntityData,
} from "../../lib/researchGraph";
import type {
  PubMedPaper,
} from "../../hooks/usePubMed";

import EdgeInspectorPanel from "./EdgeInspectorPanel";
import InspectorPanel from "./InspectorPanel";

type EntityNodeType = Node<
  ResearchEntityData,
  "entity"
>;

type EvidenceProfile = {
  level:
    | "No evidence"
    | "Limited"
    | "Moderate"
    | "Strong";
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
  direction:
    | "incoming"
    | "outgoing";
};

type InspectorSidebarProps = {
  selectedEdge:
    | Edge<ResearchEdgeData>
    | undefined;
  selectedEdgeSource:
    | EntityNodeType
    | undefined;
  selectedEdgeTarget:
    | EntityNodeType
    | undefined;
  selectedEdgeLabel: string;
  selectedEntity: ResearchEntityData;
  selectedConnectionCount: number;
  evidenceProfile: EvidenceProfile;
  relatedConnections: RelatedConnection[];
  pubMedLoading: boolean;
  pubMedError: string;
  pubMedPapers: PubMedPaper[];
  focusNode: (
    nodeId: string,
  ) => Promise<void>;
  openPaperInspector: (
    paper: PubMedPaper,
  ) => void;
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
  return (
    <aside className="hidden overflow-y-auto border-l border-white/[0.08] bg-[#050814]/82 p-5 backdrop-blur-2xl lg:block">
      <div className="flex items-center justify-between">
        <WorkspaceSectionLabel>
          {selectedEdge
            ? "Selected relationship"
            : "Selected entity"}
        </WorkspaceSectionLabel>

        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
          {selectedEdge
            ? "Edge inspector"
            : "Node inspector"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {selectedEdge &&
        selectedEdgeSource &&
        selectedEdgeTarget ? (
          <EdgeInspectorPanel
            selectedEdgeId={
              selectedEdge.id
            }
            selectedEdgeSource={
              selectedEdgeSource
            }
            selectedEdgeTarget={
              selectedEdgeTarget
            }
            selectedEdgeLabel={
              selectedEdgeLabel
            }
            selectedEdgeData={
              selectedEdge.data
            }
            evidenceProfile={
              evidenceProfile
            }
            pubMedPapers={
              pubMedPapers
            }
            focusNode={focusNode}
            openPaperInspector={
              openPaperInspector
            }
          />
        ) : (
          <InspectorPanel
            selectedEntity={
              selectedEntity
            }
            selectedConnectionCount={
              selectedConnectionCount
            }
            evidenceProfile={
              evidenceProfile
            }
            relatedConnections={
              relatedConnections
            }
            pubMedLoading={
              pubMedLoading
            }
            pubMedError={
              pubMedError
            }
            pubMedPapers={
              pubMedPapers
            }
            focusNode={focusNode}
            openPaperInspector={
              openPaperInspector
            }
            onAskCopilot={
              onAskCopilot
            }
          />
        )}
      </AnimatePresence>
    </aside>
  );
}

function WorkspaceSectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-600">
      {children}
    </p>
  );
}