"use client";

import {
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  MotionValue,
} from "framer-motion";

type ShockwavePulseProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

export default function ShockwavePulse({
  progress,
  reduced,
}: ShockwavePulseProps) {
  const meshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  useFrame(
    (
      _state,
      delta,
    ) => {
      const mesh =
        meshRef.current;

      if (!mesh) {
        return;
      }

      const p =
        reduced
          ? 0
          : progress.get();

      const scaled =
        p * 4;

      const local =
        scaled -
        Math.floor(
          scaled,
        );

      const strength =
        Math.pow(
          Math.sin(
            local *
              Math.PI,
          ),
          9,
        );

      const scale =
        0.2 +
        strength * 7.5;

      mesh.scale.setScalar(
        THREE.MathUtils.damp(
          mesh.scale.x,
          scale,
          8,
          delta,
        ),
      );

      const material =
        mesh.material as THREE.MeshBasicMaterial;

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          strength * 0.52,
          9,
          delta,
        );
    },
  );

  return (
    <mesh
      ref={meshRef}
      position={[
        0,
        0,
        0.4,
      ]}
    >
      <ringGeometry
        args={[
          0.86,
          0.9,
          128,
        ]}
      />

      <meshBasicMaterial
        color="#DFFBFF"
        transparent
        opacity={0}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        side={
          THREE.DoubleSide
        }
        toneMapped={false}
      />
    </mesh>
  );
}