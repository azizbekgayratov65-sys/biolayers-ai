"use client";

import {
  Canvas,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type {
  Edge,
  Node,
} from "@xyflow/react";

import type {
  EntityType,
} from "../../lib/buildGraphFromText";

import type {
  ResearchEntityData,
} from "../../lib/researchGraph";

type EntityNodeType = Node<
  ResearchEntityData,
  "entity"
>;

type KnowledgeGraph3DProps = {
  nodes: EntityNodeType[];
  edges: Edge[];
  onSelectNode: (
    nodeId: string,
  ) => void;
  onSelectEdge: (
    edgeId: string,
  ) => void;
  onPaneClick: () => void;
};

type WorldNode = {
  id: string;
  label: string;
  type: EntityType;
  position: THREE.Vector3;
};

type WorldEdge = {
  id: string;
  source: WorldNode;
  target: WorldNode;
  label: string;
};

const NODE_COLORS: Record<EntityType, string> = {
  cell: "#4d8dff",
  protein: "#a15cff",
  gene: "#2bff88",
  drug: "#ff3b5c",
  pathway: "#ffc53d",
  process: "#8db2ff",
  disease: "#ff3b5c",
};

function normalizeGraph(
  nodes: EntityNodeType[],
  edges: Edge[],
) {
  if (nodes.length === 0) {
    return {
      nodes: [] as WorldNode[],
      edges: [] as WorldEdge[],
    };
  }

  const xs = nodes.map(
    (node) =>
      node.position?.x ?? 0,
  );

  const ys = nodes.map(
    (node) =>
      node.position?.y ?? 0,
  );

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX =
    Math.max(maxX - minX, 1);
  const rangeY =
    Math.max(maxY - minY, 1);

  const worldNodes =
    nodes.map(
      (node, index) => {
        const nx =
          ((node.position.x -
            minX) /
            rangeX -
            0.5) *
          10.5;

        const ny =
          -(
            (node.position.y -
              minY) /
              rangeY -
            0.5
          ) * 7.2;

        const nz =
          Math.sin(
            index * 1.71,
          ) *
            1.35 +
          Math.cos(
            index * 0.93,
          ) *
            0.8;

        return {
          id: node.id,
          label: node.data.label,
          type:
            node.data.type,
          position:
            new THREE.Vector3(
              nx,
              ny,
              nz,
            ),
        };
      },
    );

  const nodeMap =
    new Map(
      worldNodes.map(
        (node) => [
          node.id,
          node,
        ],
      ),
    );

  const worldEdges =
    edges
      .map((edge) => {
        const source =
          nodeMap.get(
            edge.source,
          );

        const target =
          nodeMap.get(
            edge.target,
          );

        if (
          !source ||
          !target
        ) {
          return null;
        }

        return {
          id: edge.id,
          source,
          target,
          label:
            typeof edge.label ===
            "string"
              ? edge.label
              : "connected-to",
        };
      })
      .filter(
        (
          edge,
        ): edge is WorldEdge =>
          Boolean(edge),
      );

  return {
    nodes: worldNodes,
    edges: worldEdges,
  };
}

function ControlsRig() {
  const {
    camera,
    gl,
  } = useThree();

  useEffect(() => {
    const controls =
      new OrbitControls(
        camera,
        gl.domElement,
      );

    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = true;
    controls.panSpeed = 0.7;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.75;
    controls.minDistance = 5.5;
    controls.maxDistance = 24;

    return () => {
      controls.dispose();
    };
  }, [
    camera,
    gl,
  ]);

  useFrame(() => {
    // OrbitControls updates itself
    // from DOM interaction.
  });

  return null;
}

function NodeOrb({
  node,
  hovered,
  selected,
  onHover,
  onLeave,
  onSelect,
}: {
  node: WorldNode;
  hovered: boolean;
  selected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const meshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const haloRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const color =
    NODE_COLORS[
      node.type
    ];

  useFrame(
    (state, delta) => {
      const mesh =
        meshRef.current;

      const halo =
        haloRef.current;

      if (!mesh || !halo) {
        return;
      }

      const pulse =
        1 +
        Math.sin(
          state.clock.elapsedTime *
            2.1 +
            node.position.x,
        ) *
          0.035;

      const targetScale =
        selected
          ? 1.35
          : hovered
            ? 1.2
            : pulse;

      const next =
        THREE.MathUtils.damp(
          mesh.scale.x,
          targetScale,
          5.5,
          delta,
        );

      mesh.scale.setScalar(
        next,
      );

      const haloTarget =
        selected
          ? 1.5
          : hovered
            ? 1.3
            : 1;

      const haloScale =
        THREE.MathUtils.damp(
          halo.scale.x,
          haloTarget,
          4.5,
          delta,
        );

      halo.scale.setScalar(
        haloScale,
      );
    },
  );

  function stop(
    event: ThreeEvent<MouseEvent>,
  ) {
    event.stopPropagation();
  }

  return (
    <group
      position={
        node.position
      }
    >
      <mesh
        ref={haloRef}
      >
        <sphereGeometry
          args={[
            0.42,
            24,
            24,
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={
            selected
              ? 0.18
              : hovered
                ? 0.13
                : 0.075
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={meshRef}
        onPointerOver={(
          event,
        ) => {
          stop(event);
          onHover();
          document.body.style.cursor =
            "pointer";
        }}
        onPointerOut={(
          event,
        ) => {
          stop(event);
          onLeave();
          document.body.style.cursor =
            "";
        }}
        onClick={(
          event,
        ) => {
          stop(event);
          onSelect();
        }}
      >
        <sphereGeometry
          args={[
            0.23,
            32,
            32,
          ]}
        />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={
            selected
              ? 4.5
              : hovered
                ? 3.2
                : 1.9
          }
          roughness={0.25}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function EdgeTube({
  edge,
  selected,
  onSelect,
}: {
  edge: WorldEdge;
  selected: boolean;
  onSelect: () => void;
}) {
  const midpoint =
    useMemo(
      () =>
        edge.source.position
          .clone()
          .add(
            edge.target
              .position,
          )
          .multiplyScalar(
            0.5,
          ),
      [
        edge.source
          .position,
        edge.target
          .position,
      ],
    );

  const direction =
    useMemo(
      () =>
        edge.target.position
          .clone()
          .sub(
            edge.source
              .position,
          ),
      [
        edge.source
          .position,
        edge.target
          .position,
      ],
    );

  const length =
    direction.length();

  const quaternion =
    useMemo(() => {
      const q =
        new THREE.Quaternion();

      q.setFromUnitVectors(
        new THREE.Vector3(
          0,
          1,
          0,
        ),
        direction
          .clone()
          .normalize(),
      );

      return q;
    }, [direction]);

  return (
    <mesh
      position={midpoint}
      quaternion={quaternion}
      onClick={(
        event,
      ) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <cylinderGeometry
        args={[
          selected
            ? 0.025
            : 0.012,
          selected
            ? 0.025
            : 0.012,
          length,
          8,
        ]}
      />

      <meshBasicMaterial
        color={
          selected
            ? "#ffffff"
            : "#64748b"
        }
        transparent
        opacity={
          selected
            ? 0.85
            : 0.34
        }
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function EvidencePulse({
  edge,
  offset,
}: {
  edge: WorldEdge;
  offset: number;
}) {
  const ref =
    useRef<THREE.Mesh | null>(
      null,
    );

  useFrame((state) => {
    const mesh =
      ref.current;

    if (!mesh) {
      return;
    }

    const t =
      (
        state.clock
          .elapsedTime *
          0.22 +
        offset
      ) %
      1;

    mesh.position.lerpVectors(
      edge.source.position,
      edge.target.position,
      t,
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry
        args={[
          0.045,
          12,
          12,
        ]}
      />

      <meshBasicMaterial
        color="#8db2ff"
        transparent
        opacity={0.95}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Scene({
  nodes,
  edges,
  hoveredId,
  selectedNodeId,
  selectedEdgeId,
  setHoveredId,
  setHoveredLabel,
  setSelectedNodeId,
  setSelectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onPaneClick,
}: {
  nodes: WorldNode[];
  edges: WorldEdge[];
  hoveredId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  setHoveredId: (
    value: string | null,
  ) => void;
  setHoveredLabel: (
    value: string,
  ) => void;
  setSelectedNodeId: (
    value: string | null,
  ) => void;
  setSelectedEdgeId: (
    value: string | null,
  ) => void;
  onSelectNode: (
    nodeId: string,
  ) => void;
  onSelectEdge: (
    edgeId: string,
  ) => void;
  onPaneClick: () => void;
}) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  useFrame(
    (state, delta) => {
      if (!groupRef.current) {
        return;
      }

      groupRef.current.rotation.y =
        THREE.MathUtils.damp(
          groupRef.current
            .rotation.y,
          Math.sin(
            state.clock
              .elapsedTime *
              0.08,
          ) * 0.06,
          1.4,
          delta,
        );
    },
  );

  return (
    <>
      <ambientLight
        intensity={0.35}
      />

      <pointLight
        position={[
          4,
          6,
          8,
        ]}
        intensity={24}
        color="#a15cff"
        distance={30}
      />

      <pointLight
        position={[
          -5,
          -3,
          6,
        ]}
        intensity={18}
        color="#4d8dff"
        distance={30}
      />

      <group
        ref={groupRef}
        onClick={() => {
          setSelectedNodeId(
            null,
          );
          setSelectedEdgeId(
            null,
          );
          onPaneClick();
        }}
      >
        {edges.map(
          (
            edge,
            index,
          ) => (
            <group
              key={
                edge.id
              }
            >
              <EdgeTube
                edge={edge}
                selected={
                  edge.id ===
                  selectedEdgeId
                }
                onSelect={() => {
                  setSelectedEdgeId(
                    edge.id,
                  );
                  setSelectedNodeId(
                    null,
                  );
                  onSelectEdge(
                    edge.id,
                  );
                }}
              />

              <EvidencePulse
                edge={edge}
                offset={
                  (index %
                    7) /
                  7
                }
              />
            </group>
          ),
        )}

        {nodes.map(
          (node) => (
            <NodeOrb
              key={node.id}
              node={node}
              hovered={
                node.id ===
                hoveredId
              }
              selected={
                node.id ===
                selectedNodeId
              }
              onHover={() => {
                setHoveredId(
                  node.id,
                );
                setHoveredLabel(
                  node.label,
                );
              }}
              onLeave={() => {
                setHoveredId(
                  null,
                );
                setHoveredLabel(
                  "",
                );
              }}
              onSelect={() => {
                setSelectedNodeId(
                  node.id,
                );
                setSelectedEdgeId(
                  null,
                );
                onSelectNode(
                  node.id,
                );
              }}
            />
          ),
        )}
      </group>

      <ControlsRig />
    </>
  );
}

export default function KnowledgeGraph3D({
  nodes,
  edges,
  onSelectNode,
  onSelectEdge,
  onPaneClick,
}: KnowledgeGraph3DProps) {
  const [hoveredId, setHoveredId] =
    useState<string | null>(
      null,
    );

  const [
    hoveredLabel,
    setHoveredLabel,
  ] = useState("");

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState<
    string | null
  >(null);

  const [
    selectedEdgeId,
    setSelectedEdgeId,
  ] = useState<
    string | null
  >(null);

  const graph =
    useMemo(
      () =>
        normalizeGraph(
          nodes,
          edges,
        ),
      [
        nodes,
        edges,
      ],
    );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#030507]">
      <Canvas
        camera={{
          position: [
            0,
            0,
            13.5,
          ],
          fov: 48,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference:
            "high-performance",
        }}
      >
        <color
          attach="background"
          args={[
            "#030507",
          ]}
        />

        <fog
          attach="fog"
          args={[
            "#030507",
            12,
            30,
          ]}
        />

        <Scene
          nodes={
            graph.nodes
          }
          edges={
            graph.edges
          }
          hoveredId={
            hoveredId
          }
          selectedNodeId={
            selectedNodeId
          }
          selectedEdgeId={
            selectedEdgeId
          }
          setHoveredId={
            setHoveredId
          }
          setHoveredLabel={
            setHoveredLabel
          }
          setSelectedNodeId={
            setSelectedNodeId
          }
          setSelectedEdgeId={
            setSelectedEdgeId
          }
          onSelectNode={
            onSelectNode
          }
          onSelectEdge={
            onSelectEdge
          }
          onPaneClick={
            onPaneClick
          }
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,5,7,.08)_46%,rgba(3,5,7,.7)_100%)]" />

      <div className="pointer-events-none absolute left-5 top-5 rounded-[16px] border border-white/[0.08] bg-[#0a0f14]/72 px-4 py-3 backdrop-blur-xl">
        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-teal-300">
          3D Knowledge Graph
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          Drag to rotate · Scroll to zoom
        </p>
      </div>

      {hoveredLabel && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.08] bg-[#0a0f14]/86 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,.35)] backdrop-blur-xl">
          {hoveredLabel}
        </div>
      )}
    </div>
  );
}