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

export default function CinematicCellDive({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const membraneRef = useRef<THREE.Mesh | null>(null);
  const nucleusRef = useRef<THREE.Mesh | null>(null);

  const tissueCells = useMemo(
    () =>
      Array.from({ length: 13 }).map((_, index) => {
        const angle = (index / 13) * Math.PI * 2;
        const radius = index % 3 === 0 ? 2.9 : index % 2 === 0 ? 2.35 : 1.9;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.62,
          z: -0.6 - (index % 5) * 0.22,
          scale: 0.44 + (index % 4) * 0.055,
          color:
            index % 3 === 0
              ? "#4d8dff"
              : index % 3 === 1
                ? "#8db2ff"
                : "#a15cff",
        };
      }),
    [],
  );

  const organelles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => {
        const angle = index * 2.399963229728653;
        const radius = 0.7 + (index % 5) * 0.11;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.72,
          z: -0.35 + (index % 6) * 0.12,
          size: 0.035 + (index % 3) * 0.012,
        };
      }),
    [],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progress.get();
    const visibility = bell(p, 0.225, 0.27, 0.42, 0.49);
    const tissueFormation = range(p, 0.225, 0.315);
    const cellFocus = range(p, 0.29, 0.405);
    const dive = range(p, 0.365, 0.49);

    group.visible = visibility > 0.004;

    const targetScale =
      THREE.MathUtils.lerp(0.36, 1.08, tissueFormation) *
      THREE.MathUtils.lerp(1, 3.8, dive);

    group.scale.setScalar(
      THREE.MathUtils.damp(group.scale.x, targetScale, reduced ? 20 : 6.5, delta),
    );

    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      THREE.MathUtils.lerp(-5.7, 1.85, dive),
      reduced ? 20 : 6,
      delta,
    );

    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      THREE.MathUtils.lerp(-0.12, 0, cellFocus),
      6,
      delta,
    );

    if (!reduced) {
      group.rotation.z = Math.sin(state.clock.elapsedTime * 0.17) * 0.025;
      group.rotation.y = Math.sin(state.clock.elapsedTime * 0.13) * 0.05;
    }

    const membrane = membraneRef.current;
    if (membrane && membrane.material instanceof THREE.MeshBasicMaterial) {
      membrane.material.opacity =
        visibility * THREE.MathUtils.lerp(0.16, 0.42, cellFocus);
    }

    const nucleus = nucleusRef.current;
    if (nucleus && nucleus.material instanceof THREE.MeshBasicMaterial) {
      nucleus.material.opacity =
        visibility * THREE.MathUtils.lerp(0.2, 0.82, cellFocus);

      if (!reduced) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.04;
        nucleus.scale.setScalar(pulse);
      }
    }

    group.children.forEach((child, index) => {
      if (
        index < tissueCells.length &&
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshBasicMaterial
      ) {
        const fade = 1 - range(p, 0.315, 0.405);
        child.material.opacity = visibility * fade * 0.22;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, -0.12, -5.7]}>
      {tissueCells.map((cell, index) => (
        <mesh
          key={`tissue-${index}`}
          position={[cell.x, cell.y, cell.z]}
          scale={cell.scale}
        >
          <sphereGeometry args={[1, 26, 26]} />
          <meshBasicMaterial
            color={cell.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh ref={membraneRef}>
        <sphereGeometry args={[1.45, 48, 48]} />
        <meshBasicMaterial
          color="#4d8dff"
          wireframe
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.5, 40, 40]} />
        <meshBasicMaterial
          color="#67E8F9"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={nucleusRef} position={[0.15, 0.05, 0.05]}>
        <sphereGeometry args={[0.48, 36, 36]} />
        <meshBasicMaterial
          color="#a15cff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0.15, 0.05, 0.04]}>
        <sphereGeometry args={[0.64, 26, 26]} />
        <meshBasicMaterial
          color="#8db2ff"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {organelles.map((organelle, index) => (
        <mesh key={`organelle-${index}`} position={[organelle.x, organelle.y, organelle.z]}>
          <sphereGeometry args={[organelle.size, 10, 10]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#99F6E4" : "#8db2ff"}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh rotation={[1.18, 0.18, 0.1]}>
        <torusGeometry args={[0.82, 0.012, 8, 90]} />
        <meshBasicMaterial
          color="#4d8dff"
          transparent
          opacity={0.24}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[0.32, 1.12, 0.42]}>
        <torusGeometry args={[1.05, 0.008, 8, 100]} />
        <meshBasicMaterial
          color="#8db2ff"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}