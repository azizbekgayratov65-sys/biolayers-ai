"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

export default function SiteMarker({ hub, index }: { hub: ResearchHub; index: number }) {
  const haloRef = useRef<THREE.Mesh | null>(null);

  const position = useMemo(
    () => {
      const x = ((hub.longitude + 170) / 340) * 8.2 - 4.1;
      const z = ((-hub.latitude + 70) / 140) * 5 - 2.5;
      return new THREE.Vector3(x, 0, z);
    },
    [hub.latitude, hub.longitude],
  );

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  const role =
    hub.id === "uzbekistan"
      ? "ORIGIN · CASE"
      : hub.id === "qatar"
        ? "PROCESSING · EVIDENCE"
        : "SIGNAL · MODEL";

  useEffect(() => {
    if (typeof document === "undefined") return;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 56;

    const context = canvas.getContext("2d");
    if (!context) return;

    drawSiteLabel(context, hub.color, hub.city, role);

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.needsUpdate = true;

    setTexture(nextTexture);

    return () => {
      nextTexture.dispose();
    };
  }, [hub.color, hub.city, role]);

  useFrame((state) => {
    const halo = haloRef.current;
    if (!halo) return;

    const pulse = Math.sin(state.clock.elapsedTime * 1.3 + index * 1.7) * 0.5 + 0.5;
    halo.scale.setScalar(0.34 + pulse * 0.14);
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshBasicMaterial color={hub.color} />
      </mesh>

      <mesh ref={haloRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color={hub.color}
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {texture && (
        <sprite position={[0.62, 0.34, 0]} scale={[1.5, 0.33, 1]}>
          <spriteMaterial
            map={texture}
            transparent
            opacity={0.94}
            depthWrite={false}
          />
        </sprite>
      )}
    </group>
  );
}

function drawSiteLabel(
  context: CanvasRenderingContext2D,
  color: string,
  city: string,
  role: string,
) {
  const width = 256;
  const height = 56;

  context.save();

  context.fillStyle = "rgba(4,7,10,0.68)";
  context.strokeStyle = "rgba(141,178,255,0.16)";
  context.lineWidth = 1;

  context.beginPath();
  context.roundRect(0, 0, width, height, 10);
  context.fill();
  context.stroke();

  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = 16;

  context.font = "700 24px Arial";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(city, 14, 18);

  context.shadowBlur = 0;
  context.fillStyle = "rgba(232,237,242,0.55)";
  context.font = "600 13px Arial";
  context.fillText(role, 14, 40);

  context.restore();
}