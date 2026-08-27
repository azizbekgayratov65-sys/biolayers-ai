"use client";

import { useEffect, useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

type JourneyProps = {
  progress: any;
  reduced: boolean;
};

function bell(
  value: number,
  start: number,
  peakStart: number,
  peakEnd: number,
  end: number,
) {
  if (value <= start) return 0;
  if (value < peakStart) return THREE.MathUtils.clamp((value - start) / (peakStart - start), 0, 1);
  if (value <= peakEnd) return 1;
  if (value < end) return 1 - THREE.MathUtils.clamp((value - peakEnd) / (end - peakEnd), 0, 1);
  return 0;
}

function range(value: number, start: number, end: number) {
  if (end === start) return value >= end ? 1 : 0;
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

export default function EnergyTunnel({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  const rings = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, index) => ({
        radius: 1.05 + index * 0.68,
        z: -1.2 - index * 1.35,
      })),
    [],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progress.get();
    const visibility = bell(p, 0.325, 0.395, 0.585, 0.67);

    group.visible = visibility > 0.01;

    const targetScale = THREE.MathUtils.lerp(0.62, 1.6, range(p, 0.38, 0.64));
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 6, delta));

    if (!reduced) {
      group.rotation.z += delta * 0.11;
      group.rotation.y = Math.sin(state.clock.elapsedTime * 0.23) * 0.09;
    }

    group.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        child.material.opacity = visibility * (0.32 - index * 0.018);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, index) => (
        <mesh key={index} position={[0, 0, ring.z]} rotation={[1.12, index * 0.04, index * 0.21]}>
          <torusGeometry args={[ring.radius, 0.017, 8, 100]} />
          <meshBasicMaterial
            color={
              index % 3 === 0 ? "#4d8dff" : index % 3 === 1 ? "#8db2ff" : "#a15cff"
            }
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