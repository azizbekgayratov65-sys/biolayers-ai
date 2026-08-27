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

export default function MolecularField({ progress, reduced }: JourneyProps) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  const count = reduced ? 220 : 520;

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.randFloat(0.35, 8.2);
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = Math.sin(angle) * radius * 0.62;
      array[i * 3 + 2] = THREE.MathUtils.randFloat(-22, 5);
    }
    return array;
  }, [count]);

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const p = progress.get();
    const visibility = bell(p, 0.245, 0.31, 0.91, 0.995);

    const targetOpacity = visibility * THREE.MathUtils.lerp(0.5, 0.82, range(p, 0.4, 0.72));
    material.opacity = THREE.MathUtils.damp(material.opacity, targetOpacity, 7, delta);
    points.visible = visibility > 0.005;

    if (reduced || visibility < 0.005) return;

    const attribute = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const speed = THREE.MathUtils.lerp(1.3, 5.4, range(p, 0.32, 0.68));

    for (let i = 0; i < count; i++) {
      let z = attribute.getZ(i);
      z += delta * (speed + (i % 6) * 0.16);
      if (z > 5.5) {
        z = THREE.MathUtils.randFloat(-22, -13);
        const angle = Math.random() * Math.PI * 2;
        const radius = THREE.MathUtils.randFloat(0.3, 8.2);
        attribute.setX(i, Math.cos(angle) * radius);
        attribute.setY(i, Math.sin(angle) * radius * 0.62);
      }
      attribute.setZ(i, z);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#99F6E4"
        size={0.038}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}