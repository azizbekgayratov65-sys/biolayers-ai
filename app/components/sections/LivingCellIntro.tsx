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

type LivingCellIntroProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

type Organelle = {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  color: string;
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

export default function LivingCellIntro({
  progress,
  reduced,
}: LivingCellIntroProps) {
  const rootRef =
    useRef<THREE.Group | null>(
      null,
    );

  const organelleRefs =
    useRef<Array<THREE.Mesh | null>>(
      [],
    );

  const receptorRefs =
    useRef<Array<THREE.Mesh | null>>(
      [],
    );

  const organelles =
    useMemo<Organelle[]>(
      () =>
        Array.from(
          {
            length: 8,
          },
          (_, index) => {
            const angle =
              seeded(
                index,
                91,
              ) *
              Math.PI *
              2;

            const radius =
              0.7 +
              seeded(
                index,
                92,
              ) *
                1.15;

            return {
              position:
                new THREE.Vector3(
                  Math.cos(
                    angle,
                  ) *
                    radius,
                  (
                    seeded(
                      index,
                      93,
                    ) -
                    0.5
                  ) *
                    2.3,
                  Math.sin(
                    angle,
                  ) *
                    radius *
                    0.7,
                ),
              scale:
                new THREE.Vector3(
                  0.36 +
                    seeded(
                      index,
                      94,
                    ) *
                      0.26,
                  0.15,
                  0.18,
                ),
              rotation:
                new THREE.Euler(
                  seeded(
                    index,
                    95,
                  ) *
                    Math.PI,
                  seeded(
                    index,
                    96,
                  ) *
                    Math.PI,
                  seeded(
                    index,
                    97,
                  ) *
                    Math.PI,
                ),
              color:
                index % 2 === 0
                  ? "#67E8F9"
                  : "#A78BFA",
            };
          },
        ),
      [],
    );

  const receptors =
    useMemo(
      () =>
        Array.from(
          {
            length: 24,
          },
          (_, index) => {
            const theta =
              seeded(
                index,
                101,
              ) *
              Math.PI *
              2;

            const phi =
              Math.acos(
                2 *
                  seeded(
                    index,
                    102,
                  ) -
                  1,
              );

            return new THREE.Vector3(
              Math.sin(
                phi,
              ) *
                Math.cos(
                  theta,
                ) *
                2.2,
              Math.cos(
                phi,
              ) *
                2.2,
              Math.sin(
                phi,
              ) *
                Math.sin(
                  theta,
                ) *
                2.2,
            );
          },
        ),
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const root =
        rootRef.current;

      if (!root) {
        return;
      }

      const p =
        reduced
          ? 0
          : progress.get();

      const intro =
        THREE.MathUtils.clamp(
          1 -
            p / 0.24,
          0,
          1,
        );

      const time =
        state.clock.elapsedTime;

      root.rotation.y =
        THREE.MathUtils.damp(
          root.rotation.y,
          time * 0.08 +
            p * 0.45,
          2,
          delta,
        );

      root.rotation.x =
        Math.sin(
          time * 0.13,
        ) *
        0.08;

      root.scale.setScalar(
        0.75 +
          intro * 0.3,
      );

      root.position.z =
        -0.6 +
        (1 - intro) *
          -1.8;

      organelleRefs.current.forEach(
        (
          mesh,
          index,
        ) => {
          if (!mesh) {
            return;
          }

          const base =
            organelles[index];

          const burst =
            1 +
            (1 - intro) *
              1.8;

          mesh.position.lerp(
            base.position
              .clone()
              .multiplyScalar(
                burst,
              ),
            0.08,
          );

          mesh.rotation.x +=
            delta *
            (
              0.12 +
              index *
                0.01
            );

          mesh.rotation.y +=
            delta * 0.1;
        },
      );

      receptorRefs.current.forEach(
        (
          receptor,
          index,
        ) => {
          if (!receptor) {
            return;
          }

          const base =
            receptors[index];

          receptor.position.copy(
            base
              .clone()
              .multiplyScalar(
                1 +
                  (1 - intro) *
                    1.3,
              ),
          );

          receptor.scale.setScalar(
            0.045 +
              intro * 0.025,
          );
        },
      );
    },
  );

  return (
    <group
      ref={rootRef}
      position={[
        0,
        0,
        -0.6,
      ]}
    >
      <mesh>
        <sphereGeometry
          args={[
            2.15,
            64,
            64,
          ]}
        />

        <meshPhysicalMaterial
          color="#67E8F9"
          transparent
          opacity={0.075}
          roughness={0.2}
          metalness={0.05}
          transmission={0.32}
          thickness={0.45}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            2.19,
            42,
            42,
          ]}
        />

        <meshBasicMaterial
          color="#67E8F9"
          transparent
          opacity={0.13}
          wireframe
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            0.72,
            42,
            42,
          ]}
        />

        <meshBasicMaterial
          color="#C4B5FD"
          transparent
          opacity={0.28}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            0.22,
            28,
            28,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.85}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {organelles.map(
        (
          organelle,
          index,
        ) => (
          <mesh
            key={index}
            ref={(
              node,
            ) => {
              organelleRefs.current[
                index
              ] = node;
            }}
            position={
              organelle.position
            }
            rotation={
              organelle.rotation
            }
            scale={
              organelle.scale
            }
          >
            <sphereGeometry
              args={[
                1,
                20,
                20,
              ]}
            />

            <meshBasicMaterial
              color={
                organelle.color
              }
              transparent
              opacity={0.32}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ),
      )}

      {receptors.map(
        (
          receptor,
          index,
        ) => (
          <mesh
            key={index}
            ref={(
              node,
            ) => {
              receptorRefs.current[
                index
              ] = node;
            }}
            position={
              receptor
            }
          >
            <sphereGeometry
              args={[
                1,
                8,
                8,
              ]}
            />

            <meshBasicMaterial
              color={
                index % 3 === 0
                  ? "#F472B6"
                  : "#67E8F9"
              }
              transparent
              opacity={0.55}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ),
      )}
    </group>
  );
}