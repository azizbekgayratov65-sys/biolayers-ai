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

export default function HypothesisBirthScene({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, index) => {
        const angle = (index / 24) * Math.PI * 2;
        const radius = 1.6 + (index % 5) * 0.23;
        return {
          start: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, -0.6 + (index % 6) * 0.22),
          phase: (index % 7) / 7,
        };
      }),
    [],
  );

  const particleRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const core = coreRef.current;
    if (!group || !core) return;

    const p = progress.get();
    const visibility = bell(p, 0.77, 0.815, 0.91, 0.95);
    const convergence = range(p, 0.79, 0.89);

    group.visible = visibility > 0.004;

    particleRefs.current.forEach((particle, index) => {
      if (!particle) return;
      const data = particles[index];
      const local = THREE.MathUtils.clamp(convergence * 1.18 - data.phase * 0.18, 0, 1);
      particle.position.lerpVectors(data.start, new THREE.Vector3(0, 0, 0), local);
      const scale = THREE.MathUtils.lerp(1, 0.42, local);
      particle.scale.setScalar(scale);
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        particle.material.opacity = visibility * THREE.MathUtils.lerp(0.65, 0.08, local);
      }
    });

    const targetCoreScale = THREE.MathUtils.lerp(0.3, 1.4, convergence);
    core.scale.setScalar(THREE.MathUtils.damp(core.scale.x, targetCoreScale, reduced ? 20 : 8, delta));

    if (core.material instanceof THREE.MeshBasicMaterial) {
      core.material.opacity = visibility * THREE.MathUtils.lerp(0.18, 0.96, convergence);
    }

    if (!reduced) {
      group.rotation.z += delta * 0.09;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.07;
      core.scale.multiplyScalar(pulse);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2.25]}>
      {particles.map((data, index) => (
        <mesh
          key={`hypothesis-particle-${index}`}
          ref={(mesh) => { particleRefs.current[index] = mesh; }}
          position={data.start}
        >
          <sphereGeometry args={[0.035 + (index % 3) * 0.008, 10, 10]} />
          <meshBasicMaterial
            color={
              index % 4 === 0
                ? "#34D399"
                : index % 4 === 1
                  ? "#4d8dff"
                  : index % 4 === 2
                    ? "#8db2ff"
                    : "#FBBF24"
            }
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 30, 30]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <torusGeometry args={[0.72, 0.012, 8, 100]} />
        <meshBasicMaterial
          color="#4d8dff"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[1.05, 0.3, 0.2]}>
        <torusGeometry args={[1.05, 0.008, 8, 110]} />
        <meshBasicMaterial
          color="#8db2ff"
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}