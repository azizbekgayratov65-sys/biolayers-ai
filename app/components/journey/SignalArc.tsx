"use client";

import { useEffect, useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

type ResearchHub = {
  id: "uzbekistan" | "qatar" | "usa";
  label: string;
  city: string;
  latitude: number;
  longitude: number;
  color: string;
};

export default function SignalArc({ from, to }: { from: ResearchHub; to: ResearchHub }) {
  const headRef = useRef<THREE.Mesh | null>(null);

  const curve = useMemo(() => createSignalArc(hubPosition(from.latitude, from.longitude), hubPosition(to.latitude, to.longitude)), [from, to]);

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.012, 6, false), [curve]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const head = headRef.current;
    if (!head) return;

    const t = (state.clock.elapsedTime * 0.14 + from.longitude * 0.01) % 1;
    curve.getPoint(t, head.position);
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={to.color} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh ref={headRef}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={to.color} transparent opacity={0.95} depthWrite={false} />
      </mesh>
    </group>
  );
}

function hubPosition(latitude: number, longitude: number) {
  const x = ((longitude + 170) / 340) * 8.2 - 4.1;
  const z = ((-latitude + 70) / 140) * 5 - 2.5;
  return new THREE.Vector3(x, 0, z);
}

function createSignalArc(start: THREE.Vector3, end: THREE.Vector3) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  mid.y = start.distanceTo(end) * 0.28 + 0.16;
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}