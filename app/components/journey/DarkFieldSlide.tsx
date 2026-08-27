"use client";

import { useEffect, useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import SiteMarker from "./SiteMarker";
import SignalArc from "./SignalArc";

const RESEARCH_HUBS = [
  {
    id: "uzbekistan",
    label: "UZBEKISTAN",
    city: "TASHKENT",
    latitude: 41.2995,
    longitude: 69.2401,
    color: "#4d8dff",
  },
  {
    id: "qatar",
    label: "QATAR",
    city: "DOHA",
    latitude: 25.2854,
    longitude: 51.531,
    color: "#a15cff",
  },
  {
    id: "usa",
    label: "USA",
    city: "BALTIMORE",
    latitude: 39.2904,
    longitude: -76.6122,
    color: "#2bff88",
  },
] as const;

const RESEARCH_ROUTES = [
  ["uzbekistan", "qatar"],
  ["qatar", "usa"],
  ["uzbekistan", "usa"],
] as const;

type JourneyProps = {
  progress: any;
  reduced: boolean;
};

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

function SlideFade({
  progress,
  children,
}: {
  progress: any;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const baseOpacities = useRef(new Map<string, number>());

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const value = THREE.MathUtils.clamp(progress.get(), 0, 1);

    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh) && !(child instanceof THREE.Sprite)) return;

      const materials =
        child instanceof THREE.Mesh && Array.isArray(child.material)
          ? child.material
          : [child.material];

      for (const material of materials) {
        if (!material.transparent) continue;

        if (!baseOpacities.current.has(material.uuid)) {
          baseOpacities.current.set(material.uuid, material.opacity);
        }

        material.opacity = value * baseOpacities.current.get(material.uuid)!;
      }
    });

    group.visible = value > 0.012;
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function DarkFieldSlide({ progress, reduced }: JourneyProps) {
  const plateGeometry = useMemo(() => new THREE.PlaneGeometry(8.4, 5.2), []);
  const gridGeometry = useMemo(
    () => new THREE.PlaneGeometry(8.4, 5.2, 14, 8),
    [],
  );
  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(plateGeometry),
    [plateGeometry],
  );

  useEffect(
    () => () => {
      plateGeometry.dispose();
      gridGeometry.dispose();
      edgesGeometry.dispose();
    },
    [plateGeometry, gridGeometry, edgesGeometry],
  );

  return (
    <group scale={[0.55, 0.55, 0.55]}>
      <SlideFade progress={progress}>
        <mesh
          position={[0, -0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={plateGeometry}
        >
          <meshBasicMaterial
            color="#0a0f14"
            transparent
            opacity={0.94}
            depthWrite={false}
          />
        </mesh>

        <mesh
          position={[0, -0.018, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={gridGeometry}
        >
          <meshBasicMaterial
            color="#141b33"
            wireframe
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>

        <lineSegments
          position={[0, 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={edgesGeometry}
        >
          <lineBasicMaterial color="#4d8dff" transparent opacity={0.4} />
        </lineSegments>

        {RESEARCH_ROUTES.map(([fromId, toId]) => {
          const from = RESEARCH_HUBS.find((hub) => hub.id === fromId)!;
          const to = RESEARCH_HUBS.find((hub) => hub.id === toId)!;
          return <SignalArc key={`${fromId}-${toId}`} from={from} to={to} />;
        })}

        {RESEARCH_HUBS.map((hub, index) => (
          <SiteMarker key={hub.id} hub={hub} index={index} />
        ))}
      </SlideFade>
    </group>
  );
}