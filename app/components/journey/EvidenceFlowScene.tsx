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

const EVIDENCE_FLOW_NODES = [
  { x: -1.85, y: 0.72, z: -0.15, color: "#4d8dff", kind: "support" },
  { x: -0.75, y: 1.18, z: 0.05, color: "#34D399", kind: "support" },
  { x: 0.45, y: 0.86, z: 0.12, color: "#8db2ff", kind: "support" },
  { x: 1.58, y: 0.18, z: 0.05, color: "#F59E0B", kind: "limited" },
  { x: 0.82, y: -0.92, z: 0.12, color: "#FB7185", kind: "conflict" },
  { x: -0.72, y: -1.08, z: -0.04, color: "#4d8dff", kind: "support" },
] as const;

const EVIDENCE_FLOW_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
  [1, 4],
] as const;

export default function EvidenceFlowScene({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const pulseRefs = useRef<Array<THREE.Mesh | null>>([]);

  const edgeData = useMemo(
    () =>
      EVIDENCE_FLOW_EDGES.map(([sourceIndex, targetIndex]) => {
        const source = EVIDENCE_FLOW_NODES[sourceIndex];
        const target = EVIDENCE_FLOW_NODES[targetIndex];
        const start = new THREE.Vector3(source.x, source.y, source.z);
        const end = new THREE.Vector3(target.x, target.y, target.z);
        const direction = end.clone().sub(start);
        const distance = direction.length();
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize(),
        );
        return { start, end, midpoint, distance, quaternion, sourceIndex, targetIndex };
      }),
    [],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progress.get();
    const visibility = bell(p, 0.61, 0.655, 0.79, 0.835);
    const contradiction = range(p, 0.705, 0.79);

    group.visible = visibility > 0.004;

    const targetScale = THREE.MathUtils.lerp(0.7, 1.12, range(p, 0.62, 0.75));
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, reduced ? 20 : 7, delta));

    if (!reduced) {
      group.rotation.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.05;
      group.rotation.z = Math.sin(state.clock.elapsedTime * 0.11) * 0.025;
    }

    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;
      const edge = edgeData[index];
      const phase = (state.clock.elapsedTime * (index === 4 ? 0.07 : 0.11) + index * 0.17) % 1;
      pulse.position.lerpVectors(edge.start, edge.end, phase);

      const conflictEdge = index === 3 || index === 4;
      const activeOpacity = conflictEdge ? THREE.MathUtils.lerp(0.42, 1, contradiction) : 0.86;

      if (pulse.material instanceof THREE.MeshBasicMaterial) {
        pulse.material.opacity = visibility * activeOpacity;
      }
      pulse.visible = visibility > 0.02;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -2.6]}>
      {EVIDENCE_FLOW_NODES.map((node, index) => (
        <group key={`evidence-node-${index}`} position={[node.x, node.y, node.z]}>
          <mesh>
            <sphereGeometry args={[node.kind === "conflict" ? 0.13 : 0.105, 18, 18]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={node.kind === "conflict" ? 0.88 : 0.76}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[node.kind === "conflict" ? 0.22 : 0.17, 16, 16]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={node.kind === "conflict" ? 0.1 : 0.055}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {edgeData.map((edge, index) => {
        const conflictEdge = index === 3 || index === 4;
        return (
          <group key={`evidence-edge-${index}`}>
            <mesh position={edge.midpoint} quaternion={edge.quaternion}>
              <cylinderGeometry
                args={[
                  conflictEdge ? 0.014 : 0.009,
                  conflictEdge ? 0.014 : 0.009,
                  edge.distance,
                  6,
                ]}
              />
              <meshBasicMaterial
                color={conflictEdge ? "#FB7185" : index === 2 ? "#FBBF24" : "#4d8dff"}
                transparent
                opacity={conflictEdge ? 0.34 : 0.22}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            {!reduced && (
              <mesh
                ref={(mesh) => { pulseRefs.current[index] = mesh; }}
              >
                <sphereGeometry args={[conflictEdge ? 0.032 : 0.025, 12, 12]} />
                <meshBasicMaterial
                  color={conflictEdge ? "#FFF1F2" : "#FFFFFF"}
                  transparent
                  opacity={0}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}