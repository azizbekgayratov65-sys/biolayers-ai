"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type CityLightsProps = {
  reduced?: boolean;
};

const COUNT = 150;

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

export default function CityLights({
  reduced = false,
}: CityLightsProps) {
  const meshRef =
    useRef<THREE.InstancedMesh | null>(
      null,
    );

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      [],
    );

  const points =
    useMemo(
      () =>
        Array.from(
          {
            length: COUNT,
          },
          (_, index) => {
            const theta =
              seeded(
                index,
                21,
              ) *
              Math.PI *
              2;

            const phi =
              Math.acos(
                2 *
                  seeded(
                    index,
                    22,
                  ) -
                  1,
              );

            return {
              theta,
              phi,

              size:
                0.007 +
                seeded(
                  index,
                  23,
                ) *
                  0.014,

              phase:
                seeded(
                  index,
                  24,
                ) *
                Math.PI *
                2,

              intensity:
                0.45 +
                seeded(
                  index,
                  25,
                ) *
                  0.4,
            };
          },
        ),
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const mesh =
        meshRef.current;

      if (!mesh) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      points.forEach(
        (
          point,
          index,
        ) => {
          const radius =
            2.263;

          const x =
            Math.sin(
              point.phi,
            ) *
            Math.cos(
              point.theta,
            ) *
            radius;

          const y =
            Math.cos(
              point.phi,
            ) *
            radius;

          const z =
            Math.sin(
              point.phi,
            ) *
            Math.sin(
              point.theta,
            ) *
            radius;

          dummy.position.set(
            x,
            y,
            z,
          );

          dummy.lookAt(
            0,
            0,
            0,
          );

          const shimmer =
            reduced
              ? 1
              : 1 +
                Math.sin(
                  time *
                    0.9 +
                    point.phase,
                ) *
                  0.18;

          const scale =
            point.size *
            point.intensity *
            shimmer;

          dummy.scale.setScalar(
            scale,
          );

          dummy.updateMatrix();

          mesh.setMatrixAt(
            index,
            dummy.matrix,
          );
        },
      );

      mesh.rotation.y +=
        reduced
          ? 0
          : delta * 0.042;

      mesh.instanceMatrix.needsUpdate =
        true;

      const material =
        mesh.material as THREE.MeshBasicMaterial;

      material.opacity =
        reduced
          ? 0.22
          : 0.20 +
            Math.sin(
              time * 0.5,
            ) *
              0.025;
    },
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        undefined,
        undefined,
        COUNT,
      ]}
    >
      <sphereGeometry
        args={[
          1,
          6,
          6,
        ]}
      />

      <meshBasicMaterial
        color="#EAF7FF"
        transparent
        opacity={0.22}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}