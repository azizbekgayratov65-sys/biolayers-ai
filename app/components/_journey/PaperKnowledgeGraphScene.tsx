"use client";

import { useEffect, useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

type JourneyProps = {
  progress: any;
  reduced: boolean;
};

function range(value: number, start: number, end: number) {
  if (end === start) return value >= end ? 1 : 0;
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

function bell(
  value: number,
  start: number,
  peakStart: number,
  peakEnd: number,
  end: number,
) {
  if (value <= start) return 0;
  if (value < peakStart) return range(value, start, peakStart);
  if (value <= peakEnd) return 1;
  if (value < end) return 1 - range(value, peakEnd, end);
  return 0;
}

const PAPER_GRAPH_ENTITIES = [
  { label: "CAF", x: -1.75, y: 0.75, color: "#4d8dff" },
  { label: "TGF-β", x: -0.55, y: 1.28, color: "#a15cff" },
  { label: "CXCL12", x: 0.72, y: 0.72, color: "#8db2ff" },
  { label: "CXCR4", x: 1.72, y: -0.08, color: "#99F6E4" },
  { label: "Tumor cell", x: 0.45, y: -1.05, color: "#67E8F9" },
  { label: "Bone niche", x: -1.2, y: -0.9, color: "#BAE6FD" },
] as const;

const PAPER_GRAPH_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 5],
] as const;

export default function PaperKnowledgeGraphScene({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const paperRef = useRef<THREE.Mesh | null>(null);
  const nodeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const edgeRefs = useRef<Array<THREE.Mesh | null>>([]);

  const edgeData = useMemo(
    () =>
      PAPER_GRAPH_EDGES.map(([sourceIndex, targetIndex]) => {
        const source = PAPER_GRAPH_ENTITIES[sourceIndex];
        const target = PAPER_GRAPH_ENTITIES[targetIndex];
        const start = new THREE.Vector3(source.x, source.y, 0);
        const end = new THREE.Vector3(target.x, target.y, 0);
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        const length = start.distanceTo(end);
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        return { midpoint, length, angle };
      }),
    [],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progress.get();
    const visibility = bell(p, 0.47, 0.505, 0.655, 0.705);
    const extraction = range(p, 0.515, 0.605);
    const graphFormation = range(p, 0.57, 0.665);

    group.visible = visibility > 0.004;

    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      THREE.MathUtils.lerp(-4.5, -1.7, graphFormation),
      reduced ? 20 : 6,
      delta,
    );

    if (!reduced) {
      group.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.035;
    }

    const paper = paperRef.current;
    if (paper && paper.material instanceof THREE.MeshBasicMaterial) {
      paper.material.opacity = visibility * (1 - extraction) * 0.24;
      paper.scale.setScalar(THREE.MathUtils.lerp(1, 0.86, extraction));
    }

    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      const entity = PAPER_GRAPH_ENTITIES[index];
      const localReveal = range(graphFormation, index * 0.08, Math.min(1, index * 0.08 + 0.34));
      node.visible = localReveal > 0.01;
      node.position.x = THREE.MathUtils.damp(node.position.x, THREE.MathUtils.lerp(0, entity.x, localReveal), reduced ? 20 : 8, delta);
      node.position.y = THREE.MathUtils.damp(node.position.y, THREE.MathUtils.lerp(0, entity.y, localReveal), reduced ? 20 : 8, delta);
      const scale = THREE.MathUtils.lerp(0.15, 1, localReveal);
      node.scale.setScalar(scale);
      if (node.material instanceof THREE.MeshBasicMaterial) {
        node.material.opacity = visibility * localReveal * 0.92;
      }
    });

    edgeRefs.current.forEach((edge, index) => {
      if (!edge || !(edge.material instanceof THREE.MeshBasicMaterial)) return;
      const localReveal = range(graphFormation, 0.34 + index * 0.06, 0.62 + index * 0.06);
      edge.visible = localReveal > 0.01;
      edge.material.opacity = visibility * localReveal * 0.42;
      edge.scale.x = localReveal;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -4.5]}>
      <mesh ref={paperRef}>
        <planeGeometry args={[4.9, 3.05]} />
        <meshBasicMaterial
          color="#DFFBFF"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {Array.from({ length: 11 }).map((_, index) => (
        <mesh
          key={`paper-line-${index}`}
          position={[-0.45 + (index % 3) * 0.12, 1.05 - index * 0.19, 0.025]}
          scale={[1.65 - (index % 4) * 0.17, 1, 1]}
        >
          <planeGeometry args={[1, 0.025]} />
          <meshBasicMaterial
            color={index === 2 || index === 5 || index === 8 ? "#4d8dff" : "#64748B"}
            transparent
            opacity={index === 2 || index === 5 || index === 8 ? 0.52 : 0.22}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {PAPER_GRAPH_ENTITIES.map((entity, index) => (
        <mesh
          key={entity.label}
          ref={(node) => { nodeRefs.current[index] = node; }}
          position={[0, 0, 0.16]}
          visible={false}
        >
          <sphereGeometry args={[0.12, 20, 20]} />
          <meshBasicMaterial
            color={entity.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
          <pointLight color={entity.color} intensity={0.16} distance={0.7} decay={2} />
        </mesh>
      ))}

      {edgeData.map((edge, index) => (
        <mesh
          key={`paper-edge-${index}`}
          ref={(mesh) => { edgeRefs.current[index] = mesh; }}
          position={[edge.midpoint.x, edge.midpoint.y, 0.08]}
          rotation={[0, 0, edge.angle]}
          visible={false}
        >
          <planeGeometry args={[edge.length, 0.018]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#4d8dff" : "#8db2ff"}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}