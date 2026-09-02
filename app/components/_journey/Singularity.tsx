"use client";

import { useEffect, useRef } from "react";

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

export default function Singularity({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const core = coreRef.current;
    if (!group || !core) return;

    const p = progress.get();
    const visibility = bell(p, 0.23, 0.3, 0.85, 0.92);

    group.visible = visibility > 0.005;

    const collapse = range(p, 0.92, 0.995);

    const targetScale =
      THREE.MathUtils.lerp(0.44, 1.35, range(p, 0.25, 0.76)) *
      THREE.MathUtils.lerp(1, 3.0, collapse);

    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 6, delta));

    if (!reduced) {
      group.rotation.z += delta * 0.13;
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.12;
    core.scale.setScalar(pulse);

    group.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        child.material.opacity = visibility * (child === core ? 0.95 : 0.25);
      }
    });
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.18, 28, 28]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[1.1, 0.1, 0]}>
        <torusGeometry args={[1.2, 0.016, 8, 120]} />
        <meshBasicMaterial
          color="#8db2ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[0.2, 1, 0.5]}>
        <torusGeometry args={[1.86, 0.01, 8, 140]} />
        <meshBasicMaterial
          color="#4d8dff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}