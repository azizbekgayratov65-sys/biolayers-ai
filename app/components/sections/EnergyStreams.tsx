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

type EnergyStreamsProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

type Stream = {
  curve: THREE.CatmullRomCurve3;
  color: string;
  phase: number;
};

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

  return value - Math.floor(value);
}

export default function EnergyStreams({
  progress,
  reduced,
}: EnergyStreamsProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const pulseRefs =
    useRef<Array<THREE.Mesh | null>>(
      [],
    );

  const streams =
    useMemo<Stream[]>(
      () =>
        Array.from(
          {
            length: 7,
          },
          (_, index) => {
            const y =
              -2.6 +
              index * 0.82;

            const z =
              -2.2 +
              seeded(
                index,
                71,
              ) *
                2.8;

            const curve =
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(
                  -6.5,
                  y,
                  z,
                ),
                new THREE.Vector3(
                  -2.4,
                  y +
                    Math.sin(
                      index,
                    ) *
                      0.7,
                  z + 0.8,
                ),
                new THREE.Vector3(
                  0,
                  y * 0.3,
                  z - 0.4,
                ),
                new THREE.Vector3(
                  2.6,
                  y +
                    Math.cos(
                      index,
                    ) *
                      0.65,
                  z + 0.65,
                ),
                new THREE.Vector3(
                  6.5,
                  y * 0.72,
                  z,
                ),
              ]);

            return {
              curve,
              color:
                index % 3 === 0
                  ? "#67E8F9"
                  : index % 3 === 1
                    ? "#A78BFA"
                    : "#F472B6",
              phase:
                seeded(
                  index,
                  72,
                ),
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
      const group =
        groupRef.current;

      if (!group) {
        return;
      }

      const p =
        reduced
          ? 0
          : progress.get();

      const time =
        state.clock.elapsedTime;

      const local =
        p * 4 -
        Math.floor(
          p * 4,
        );

      const energy =
        Math.sin(
          local *
            Math.PI,
        );

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          pointerLike(
            time,
            p,
          ),
          2,
          delta,
        );

      group.scale.setScalar(
        0.92 +
          energy * 0.14,
      );

      streams.forEach(
        (
          stream,
          index,
        ) => {
          const pulse =
            pulseRefs.current[
              index
            ];

          if (!pulse) {
            return;
          }

          const t =
            (
              time *
                (
                  0.08 +
                  index *
                    0.008
                ) +
              stream.phase +
              p * 0.45
            ) %
            1;

          stream.curve.getPoint(
            t,
            pulse.position,
          );

          const scale =
            0.04 +
            energy * 0.035;

          pulse.scale.setScalar(
            scale,
          );
        },
      );
    },
  );

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -0.8,
      ]}
    >
      {streams.map(
        (
          stream,
          index,
        ) => {
          const geometry =
            new THREE.TubeGeometry(
              stream.curve,
              64,
              0.008,
              5,
              false,
            );

          return (
            <group
              key={index}
            >
              <mesh
                geometry={
                  geometry
                }
              >
                <meshBasicMaterial
                  color={
                    stream.color
                  }
                  transparent
                  opacity={0.2}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              <mesh
                ref={(
                  node,
                ) => {
                  pulseRefs.current[
                    index
                  ] = node;
                }}
              >
                <sphereGeometry
                  args={[
                    1,
                    10,
                    10,
                  ]}
                />

                <meshBasicMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.88}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        },
      )}
    </group>
  );
}

function pointerLike(
  time: number,
  progress: number,
) {
  return (
    Math.sin(
      time * 0.08,
    ) *
      0.08 +
    Math.sin(
      progress *
        Math.PI *
        2,
    ) *
      0.08
  );
}