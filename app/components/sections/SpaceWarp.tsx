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

type SpaceWarpProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

const COUNT = 420;

function seeded(
  index: number,
  salt = 1,
) {
  const value =
    Math.sin(
      index * 12.9898 +
        salt * 78.233,
    ) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );
}

export default function SpaceWarp({
  progress,
  reduced,
}: SpaceWarpProps) {
  const linesRef =
    useRef<THREE.InstancedMesh | null>(
      null,
    );

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      [],
    );

  const streaks =
    useMemo(
      () =>
        Array.from(
          {
            length: COUNT,
          },
          (_, index) => ({
            angle:
              seeded(
                index,
                81,
              ) *
              Math.PI *
              2,
            radius:
              0.7 +
              seeded(
                index,
                82,
              ) *
                6.5,
            z:
              -8 +
              seeded(
                index,
                83,
              ) *
                15,
            speed:
              0.3 +
              seeded(
                index,
                84,
              ) *
                0.9,
            scale:
              0.015 +
              seeded(
                index,
                85,
              ) *
                0.035,
          })),
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const mesh =
        linesRef.current;

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

      const warp =
        Math.pow(
          Math.sin(
            local *
              Math.PI,
          ),
          6,
        );

      const time =
        state.clock.elapsedTime;

      streaks.forEach(
        (
          streak,
          index,
        ) => {
          const z =
            (
              (
                streak.z +
                time *
                  streak.speed *
                  (
                    0.35 +
                    warp * 6.5
                  ) +
                8
              ) %
                16 +
              16
            ) %
              16 -
            8;

          const radius =
            streak.radius *
            (
              1 +
              warp * 0.2
            );

          dummy.position.set(
            Math.cos(
              streak.angle,
            ) *
              radius,
            Math.sin(
              streak.angle,
            ) *
              radius,
            z,
          );

          dummy.rotation.set(
            0,
            0,
            streak.angle,
          );

          dummy.scale.set(
            streak.scale *
              (
                1 +
                warp * 7
              ),
            streak.scale,
            streak.scale *
              (
                8 +
                warp * 80
              ),
          );

          dummy.updateMatrix();

          mesh.setMatrixAt(
            index,
            dummy.matrix,
          );
        },
      );

      mesh.instanceMatrix.needsUpdate =
        true;

      const material =
        mesh.material as THREE.MeshBasicMaterial;

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          0.05 +
            warp * 0.38,
          7,
          delta,
        );
    },
  );

  return (
    <instancedMesh
      ref={linesRef}
      args={[
        undefined,
        undefined,
        COUNT,
      ]}
    >
      <boxGeometry
        args={[
          1,
          1,
          1,
        ]}
      />

      <meshBasicMaterial
        color="#B8F6FF"
        transparent
        opacity={0.05}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}