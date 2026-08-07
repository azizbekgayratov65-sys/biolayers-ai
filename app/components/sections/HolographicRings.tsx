"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  MotionValue,
} from "framer-motion";

type HolographicRingsProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

export default function HolographicRings({
  progress,
  reduced,
}: HolographicRingsProps) {
  const refs =
    useRef<Array<THREE.Mesh | null>>(
      [],
    );

  const rings =
    useMemo(
      () => [
        {
          position: [
            -3.6,
            1.7,
            -1.5,
          ] as const,
          radius: 0.74,
          color: "#67E8F9",
          speed: 0.22,
        },
        {
          position: [
            3.8,
            -1.2,
            -2.1,
          ] as const,
          radius: 1.05,
          color: "#A78BFA",
          speed: -0.17,
        },
        {
          position: [
            2.8,
            2.3,
            -3.2,
          ] as const,
          radius: 0.58,
          color: "#F472B6",
          speed: 0.28,
        },
        {
          position: [
            -4.2,
            -2.1,
            -3.6,
          ] as const,
          radius: 0.82,
          color: "#60A5FA",
          speed: -0.2,
        },
      ],
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const p =
        reduced
          ? 0
          : progress.get();

      const time =
        state.clock.elapsedTime;

      refs.current.forEach(
        (
          ring,
          index,
        ) => {
          if (!ring) {
            return;
          }

          const config =
            rings[index];

          ring.rotation.z +=
            config.speed *
            delta;

          ring.rotation.x =
            Math.sin(
              time *
                0.16 +
                index,
            ) *
              0.38 +
            p * 0.18;

          const material =
            ring.material as THREE.MeshBasicMaterial;

          material.opacity =
            0.1 +
            (
              Math.sin(
                time *
                  0.75 +
                  index *
                    1.6,
              ) *
                0.5 +
              0.5
            ) *
              0.16;

          const pulse =
            1 +
            Math.sin(
              time *
                0.9 +
                index,
            ) *
              0.08;

          ring.scale.setScalar(
            pulse,
          );
        },
      );
    },
  );

  return (
    <>
      {rings.map(
        (
          ring,
          index,
        ) => (
          <mesh
            key={index}
            ref={(
              node,
            ) => {
              refs.current[
                index
              ] = node;
            }}
            position={
              ring.position
            }
          >
            <ringGeometry
              args={[
                ring.radius,
                ring.radius +
                  0.018,
                96,
              ]}
            />

            <meshBasicMaterial
              color={
                ring.color
              }
              transparent
              opacity={0.16}
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
        ),
      )}
    </>
  );
}