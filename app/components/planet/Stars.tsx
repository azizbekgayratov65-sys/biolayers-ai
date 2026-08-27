"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type StarsProps = {
  reduced?: boolean;
};

function getStarCount(reduced: boolean) {
  return reduced ? 900 : 1400;
}

function getDustCount(reduced: boolean) {
  return reduced ? 400 : 700;
}

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

export default function Stars({
  reduced = false,
}: StarsProps) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const dustRef =
    useRef<THREE.Points | null>(
      null,
    );

  const starCount = getStarCount(reduced);
  const dustCount = getDustCount(reduced);

  const positions =
    useMemo(
      () => {
        const data =
          new Float32Array(
            starCount * 3,
          );

        for (
          let index = 0;
          index < starCount;
          index += 1
        ) {
          const i =
            index * 3;

          const theta =
            seeded(
              index,
              41,
            ) *
            Math.PI *
            2;

          const phi =
            Math.acos(
              2 *
                seeded(
                  index,
                  42,
                ) -
                1,
            );

          const radius =
            12 +
            seeded(
              index,
              43,
            ) *
              22;

          data[i] =
            Math.sin(
              phi,
            ) *
            Math.cos(
              theta,
            ) *
            radius;

          data[i + 1] =
            Math.cos(
              phi,
            ) *
            radius;

          data[i + 2] =
            Math.sin(
              phi,
            ) *
            Math.sin(
              theta,
            ) *
            radius;
        }

        return data;
      },
      [starCount],
    );

  const dustPositions =
    useMemo(
      () => {
        const data =
          new Float32Array(
            dustCount * 3,
          );

        for (
          let index = 0;
          index < dustCount;
          index += 1
        ) {
          const i =
            index * 3;

          data[i] =
            (
              seeded(
                index,
                61,
              ) -
              0.5
            ) *
            26;

          data[i + 1] =
            (
              seeded(
                index,
                62,
              ) -
              0.5
            ) *
            16;

          data[i + 2] =
            -4 -
            seeded(
              index,
              63,
            ) *
              18;
        }

        return data;
      },
      [dustCount],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const points =
        pointsRef.current;

      const dust =
        dustRef.current;

      const time =
        state.clock.elapsedTime;

      if (points) {
        points.rotation.y +=
          reduced
            ? 0
            : delta *
              0.0017;

        points.rotation.x =
          Math.sin(
            time * 0.025,
          ) *
          0.012;

        const material =
          points.material as THREE.PointsMaterial;

        material.opacity =
          reduced
            ? 0.42
            : 0.40 +
              Math.sin(
                time * 0.35,
              ) *
                0.035;
      }

      if (dust) {
        dust.rotation.z +=
          reduced
            ? 0
            : delta *
              0.001;

        dust.position.y =
          reduced
            ? 0
            : Math.sin(
                time * 0.06,
              ) *
              0.18;

        const material =
          dust.material as THREE.PointsMaterial;

        material.opacity =
          reduced
            ? 0.10
            : 0.08 +
              Math.sin(
                time * 0.22,
              ) *
                0.018;
      }
    },
  );

  return (
    <>
      {/* Distant stars */}
      <points
        ref={pointsRef}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              positions,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#F4F8FF"
          size={0.026}
          transparent
          opacity={0.42}
          sizeAttenuation
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Very soft near-space dust */}
      <points
        ref={dustRef}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              dustPositions,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#A8DFFF"
          size={0.012}
          transparent
          opacity={0.09}
          sizeAttenuation
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </>
  );
}