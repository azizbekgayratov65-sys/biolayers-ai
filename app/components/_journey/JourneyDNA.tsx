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

export default function JourneyDNA({ progress, reduced }: JourneyProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  const nodes = useMemo(() => {
    return Array.from({ length: 28 }).map((_, index) => {
      const y = (index - 13.5) * 0.24;
      const angle = index * 0.52;
      return {
        a: new THREE.Vector3(Math.cos(angle) * 1.1, y, Math.sin(angle) * 1.1),
        b: new THREE.Vector3(Math.cos(angle + Math.PI) * 1.1, y, Math.sin(angle + Math.PI) * 1.1),
      };
    });
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progress.get();
    const visibility = bell(p, 0.625, 0.69, 0.82, 0.895);

    group.visible = visibility > 0.01;

    const formation = range(p, 0.64, 0.76);
    const exit = range(p, 0.82, 0.895);

    const targetScale =
      THREE.MathUtils.lerp(0.34, 1.35, formation) *
      THREE.MathUtils.lerp(1, 2.4, exit);

    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 6, delta));

    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      THREE.MathUtils.lerp(-3.8, 1.5, formation),
      6,
      delta,
    );

    if (!reduced) {
      group.rotation.y += delta * (0.12 + visibility * 0.2);
      group.rotation.z = Math.sin(state.clock.elapsedTime * 0.28) * 0.08;
    }

    group.children.forEach((child) => {
      if (child instanceof THREE.Group) {
        child.children.forEach((mesh) => {
          if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.MeshBasicMaterial) {
            mesh.material.opacity = visibility * 0.92;
          }
        });
      }
    });
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 2]}>
      {nodes.map((node, index) => {
        const direction = node.b.clone().sub(node.a);
        const distance = direction.length();
        const midpoint = node.a.clone().add(node.b).multiplyScalar(0.5);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize(),
        );

        return (
          <group key={index}>
            <mesh position={node.a}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshBasicMaterial
                color="#99F6E4"
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            <mesh position={node.b}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshBasicMaterial
                color="#8db2ff"
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            <mesh position={midpoint} quaternion={quaternion}>
              <cylinderGeometry args={[0.012, 0.012, distance, 6]} />
              <meshBasicMaterial
                color="#8db2ff"
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}