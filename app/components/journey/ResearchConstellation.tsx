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

export default function ResearchConstellation({ progress, reduced }: JourneyProps) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  const positions = useMemo(() => {
    const count = 90;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const arm = i % 5;
      const radius = 0.6 + (i / count) * 5.2;
      const angle = radius * 1.35 + arm * ((Math.PI * 2) / 5);
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = Math.sin(angle) * radius * 0.58;
      array[i * 3 + 2] = -1.5 + Math.sin(i * 0.73) * 1.2;
    }
    return array;
  }, []);

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const p = progress.get();
    const visibility = bell(p, 0.885, 0.92, 0.975, 1);

    material.opacity = THREE.MathUtils.damp(material.opacity, visibility * 0.72, reduced ? 20 : 8, delta);
    points.visible = visibility > 0.004;

    const scale = THREE.MathUtils.lerp(0.58, 1.28, range(p, 0.89, 0.985));
    points.scale.setScalar(THREE.MathUtils.damp(points.scale.x, scale, reduced ? 20 : 6, delta));

    if (!reduced) {
      points.rotation.z += delta * 0.025;
      points.rotation.y += delta * 0.012;
    }
  });

  return (
    <points ref={pointsRef} position={[0, 0, -5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#a15cff"
        size={0.055}
        transparent
        opacity={0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}