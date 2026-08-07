"use client";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  useMemo,
  useRef,
} from "react";

import {
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

import * as THREE from "three";

import DataRainUniverse from "./DataRainUniverse";
import LiquidSilkField from "./LiquidSilkField";
import AuroraField from "./AuroraField";
import CameraParallaxRig from "./CameraParallaxRig";
import EnergyStreams from "./EnergyStreams";
import HolographicRings from "./HolographicRings";
import LivingCellIntro from "./LivingCellIntro";
import ShockwavePulse from "./ShockwavePulse";
import PortalGate from "./PortalGate";
import PortalCamera from "./PortalCamera";
import SpaceWarp from "./SpaceWarp";

type CinematicTransitionEngineProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
};

type SceneProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

const COUNT = 950;

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

function makeCellPositions() {
  const data =
    new Float32Array(
      COUNT * 3,
    );

  for (
    let index = 0;
    index < COUNT;
    index += 1
  ) {
    const i =
      index * 3;

    const theta =
      seeded(
        index,
        1,
      ) *
      Math.PI *
      2;

    const phi =
      Math.acos(
        2 *
          seeded(
            index,
            2,
          ) -
          1,
      );

    const radius =
      2.1 +
      (seeded(
        index,
        3,
      ) -
        0.5) *
        0.55;

    data[i] =
      Math.sin(phi) *
      Math.cos(theta) *
      radius;

    data[i + 1] =
      Math.cos(phi) *
      radius;

    data[i + 2] =
      Math.sin(phi) *
      Math.sin(theta) *
      radius;
  }

  return data;
}

function makeDnaPositions() {
  const data =
    new Float32Array(
      COUNT * 3,
    );

  for (
    let index = 0;
    index < COUNT;
    index += 1
  ) {
    const i =
      index * 3;

    const t =
      index /
      COUNT;

    const branch =
      index % 2 === 0
        ? 0
        : Math.PI;

    const angle =
      t *
        Math.PI *
        11 +
      branch;

    const radius =
      1.25 +
      (seeded(
        index,
        5,
      ) -
        0.5) *
        0.12;

    data[i] =
      Math.cos(
        angle,
      ) * radius;

    data[i + 1] =
      (t - 0.5) *
      7.4;

    data[i + 2] =
      Math.sin(
        angle,
      ) * radius;
  }

  return data;
}

function makeGraphPositions() {
  const data =
    new Float32Array(
      COUNT * 3,
    );

  const centers = [
    [-2.8, 1.2, 0.5],
    [-0.8, 2.1, -0.3],
    [1.6, 1.5, 0.4],
    [3.0, -0.2, -0.5],
    [1.5, -2.0, 0.2],
    [-1.2, -1.8, -0.4],
    [-3.0, -0.4, 0.35],
    [0.0, 0.0, 0.0],
  ];

  for (
    let index = 0;
    index < COUNT;
    index += 1
  ) {
    const i =
      index * 3;

    const center =
      centers[
        index %
          centers.length
      ];

    const spread =
      index % 9 === 0
        ? 0.12
        : 0.55;

    data[i] =
      center[0] +
      (seeded(
        index,
        7,
      ) -
        0.5) *
        spread;

    data[i + 1] =
      center[1] +
      (seeded(
        index,
        8,
      ) -
        0.5) *
        spread;

    data[i + 2] =
      center[2] +
      (seeded(
        index,
        9,
      ) -
        0.5) *
        1.4;
  }

  return data;
}

function makeHumanNetworkPositions() {
  const data =
    new Float32Array(
      COUNT * 3,
    );

  for (
    let index = 0;
    index < COUNT;
    index += 1
  ) {
    const i =
      index * 3;

    const left =
      index %
        2 ===
      0;

    const baseX =
      left
        ? -2.0
        : 2.0;

    const angle =
      seeded(
        index,
        10,
      ) *
      Math.PI *
      2;

    const radius =
      seeded(
        index,
        11,
      ) *
        1.3;

    data[i] =
      baseX +
      Math.cos(
        angle,
      ) *
        radius;

    data[i + 1] =
      Math.sin(
        angle,
      ) *
        radius *
        1.3;

    data[i + 2] =
      (seeded(
        index,
        12,
      ) -
        0.5) *
      1.8;

    if (
      index % 11 ===
      0
    ) {
      data[i] =
        (seeded(
          index,
          13,
        ) -
          0.5) *
        1.1;

      data[i + 1] =
        (seeded(
          index,
          14,
        ) -
          0.5) *
        1.1;

      data[i + 2] =
        (seeded(
          index,
          15,
        ) -
          0.5) *
        1.1;
    }
  }

  return data;
}

function makeUniversePositions() {
  const data =
    new Float32Array(
      COUNT * 3,
    );

  for (
    let index = 0;
    index < COUNT;
    index += 1
  ) {
    const i =
      index * 3;

    const angle =
      seeded(
        index,
        16,
      ) *
      Math.PI *
      2;

    const radius =
      Math.pow(
        seeded(
          index,
          17,
        ),
        0.7,
      ) *
      5.8;

    data[i] =
      Math.cos(
        angle,
      ) *
      radius;

    data[i + 1] =
      (seeded(
        index,
        18,
      ) -
        0.5) *
      5.6;

    data[i + 2] =
      Math.sin(
        angle,
      ) *
        radius;
  }

  return data;
}

function lerp(
  a: number,
  b: number,
  t: number,
) {
  return (
    a +
    (b - a) * t
  );
}

function smoothstep(
  value: number,
) {
  const t =
    Math.min(
      Math.max(
        value,
        0,
      ),
      1,
    );

  return (
    t *
    t *
    (3 - 2 * t)
  );
}

function MorphParticles({
  progress,
  reduced,
}: SceneProps) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const materialRef =
    useRef<THREE.PointsMaterial | null>(
      null,
    );

  const current =
    useMemo(
      () =>
        new Float32Array(
          COUNT * 3,
        ),
      [],
    );

  const stages =
    useMemo(
      () => [
        makeCellPositions(),
        makeDnaPositions(),
        makeGraphPositions(),
        makeHumanNetworkPositions(),
        makeUniversePositions(),
      ],
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const points =
        pointsRef.current;

      const material =
        materialRef.current;

      if (
        !points ||
        !material
      ) {
        return;
      }

      const raw =
        reduced
          ? 0
          : progress.get();

      const scaled =
        Math.min(
          raw * 4,
          3.999,
        );

      const stage =
        Math.floor(
          scaled,
        );

      const local =
        smoothstep(
          scaled -
            stage,
        );

      const from =
        stages[
          stage
        ];

      const to =
        stages[
          Math.min(
            stage + 1,
            stages.length -
              1,
          )
        ];

      for (
        let i = 0;
        i <
        current.length;
        i += 1
      ) {
        current[i] =
          lerp(
            from[i],
            to[i],
            local,
          );
      }

      const geometry =
        points.geometry;

      const attribute =
        geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;

      attribute.array.set(
        current,
      );

      attribute.needsUpdate =
        true;

      const time =
        state.clock
          .elapsedTime;

      points.rotation.y =
        THREE.MathUtils.damp(
          points.rotation.y,
          Math.sin(
            time *
              0.16,
          ) *
            0.22 +
            raw *
              0.9,
          2.2,
          delta,
        );

      points.rotation.x =
        THREE.MathUtils.damp(
          points.rotation.x,
          Math.cos(
            time *
              0.13,
          ) *
            0.08,
          2,
          delta,
        );

      const pulse =
        0.032 +
        Math.sin(
          time * 2.2,
        ) *
          0.006;

      material.size =
        pulse;

      material.opacity =
        0.58 +
        Math.sin(
          time * 1.5,
        ) *
          0.08;
    },
  );

  return (
    <points
      ref={pointsRef}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            current,
            3,
          ]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#9BE7FF"
        transparent
        opacity={0.68}
        size={0.038}
        sizeAttenuation
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

function EnergyCore({
  progress,
  reduced,
}: SceneProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  useFrame(
    (state) => {
      const group =
        groupRef.current;

      if (!group) {
        return;
      }

      const p =
        reduced
          ? 0
          : progress.get();

      group.rotation.z =
        state.clock
          .elapsedTime *
        (0.16 +
          p * 0.22);

      const stagePulse =
        0.7 +
        Math.sin(
          p *
            Math.PI *
            8,
        ) *
          0.25;

      group.scale.setScalar(
        stagePulse,
      );
    },
  );

  return (
    <group
      ref={groupRef}
    >
      <mesh>
        <ringGeometry
          args={[
            2.7,
            2.74,
            180,
          ]}
        />

        <meshBasicMaterial
          color="#67E8F9"
          transparent
          opacity={0.18}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          0,
          0,
          Math.PI / 3,
        ]}
      >
        <ringGeometry
          args={[
            3.4,
            3.43,
            180,
          ]}
        />

        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.11}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function DataFragments({
  progress,
  reduced,
}: SceneProps) {
  const meshRef =
    useRef<THREE.InstancedMesh | null>(
      null,
    );

  const dummy =
    useMemo(
      () => new THREE.Object3D(),
      [],
    );

  const fragmentCount = 72;

  const fragments =
    useMemo(
      () =>
        Array.from(
          {
            length:
              fragmentCount,
          },
          (
            _,
            index,
          ) => ({
            angle:
              seeded(
                index,
                31,
              ) *
              Math.PI *
              2,
            radius:
              2.8 +
              seeded(
                index,
                32,
              ) *
                5.2,
            y:
              (seeded(
                index,
                33,
              ) -
                0.5) *
              7.5,
            z:
              (seeded(
                index,
                34,
              ) -
                0.5) *
              7.8,
            speed:
              0.12 +
              seeded(
                index,
                35,
              ) *
                0.22,
            size:
              0.05 +
              seeded(
                index,
                36,
              ) *
                0.18,
            tilt:
              seeded(
                index,
                37,
              ) *
              Math.PI,
            phase:
              seeded(
                index,
                38,
              ) *
              Math.PI *
              2,
          }),
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

      const p =
        reduced
          ? 0
          : progress.get();

      const time =
        state.clock
          .elapsedTime;

      const stagePosition =
        p * 4;

      const local =
        stagePosition -
        Math.floor(
          stagePosition,
        );

      const transitionEnergy =
        Math.sin(
          Math.min(
            Math.max(
              local,
              0,
            ),
            1,
          ) *
            Math.PI,
        );

      for (
        let index = 0;
        index <
        fragments.length;
        index += 1
      ) {
        const fragment =
          fragments[
            index
          ];

        const orbit =
          fragment.angle +
          time *
            fragment.speed +
          p *
            Math.PI *
            3;

        const radius =
          fragment.radius *
          (
            1 +
            transitionEnergy *
              0.22
          );

        const flyThrough =
          Math.sin(
            time *
              0.3 +
              fragment.phase,
          ) *
          0.9;

        dummy.position.set(
          Math.cos(
            orbit,
          ) *
            radius,
          fragment.y +
            Math.sin(
              time *
                0.55 +
                fragment.phase,
            ) *
              0.34,
          fragment.z +
            flyThrough -
            transitionEnergy *
              1.4,
        );

        dummy.rotation.set(
          fragment.tilt +
            time *
              0.35,
          orbit *
            0.55 +
            time *
              0.22,
          time *
              0.28 +
            fragment.phase,
        );

        const scale =
          fragment.size *
          (
            1 +
            transitionEnergy *
              1.5
          );

        dummy.scale.set(
          scale *
            (
              0.75 +
              seeded(
                index,
                39,
              ) *
                1.3
            ),
          scale,
          scale *
            0.24,
        );

        dummy.updateMatrix();

        mesh.setMatrixAt(
          index,
          dummy.matrix,
        );
      }

      mesh.instanceMatrix.needsUpdate =
        true;

      mesh.rotation.z =
        THREE.MathUtils.damp(
          mesh.rotation.z,
          Math.sin(
            time *
              0.08,
          ) *
            0.08,
          1.4,
          delta,
        );
    },
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        undefined,
        undefined,
        fragmentCount,
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
        color="#A7F3FF"
        transparent
        opacity={0.34}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
        wireframe
      />
    </instancedMesh>
  );
}

function EnergyGates({
  progress,
  reduced,
}: SceneProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
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
        state.clock
          .elapsedTime;

      group.rotation.z =
        THREE.MathUtils.damp(
          group.rotation.z,
          Math.sin(
            p *
              Math.PI *
              3,
          ) *
            0.12 +
            Math.sin(
              time *
                0.11,
            ) *
              0.04,
          2,
          delta,
        );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          -1.5 +
            Math.sin(
              p *
                Math.PI *
                8,
            ) *
              1.2,
          2.2,
          delta,
        );
    },
  );

  return (
    <group
      ref={groupRef}
    >
      {[
        4.9,
        6.5,
        8.2,
      ].map(
        (
          size,
          index,
        ) => (
          <mesh
            key={size}
            rotation={[
              0,
              0,
              index *
                0.18,
            ]}
          >
            <planeGeometry
              args={[
                size,
                size,
              ]}
            />

            <meshBasicMaterial
              color={
                index %
                    2 ===
                  0
                  ? "#67E8F9"
                  : "#A78BFA"
              }
              transparent
              opacity={
                index === 0
                  ? 0.035
                  : 0.018
              }
              wireframe
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
    </group>
  );
}


function CameraMotion({
  progress,
  reduced,
}: SceneProps) {
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
        state.clock
          .elapsedTime;

      const targetZ =
        9.6 -
        Math.sin(
          p *
            Math.PI *
            4,
        ) *
          1.4;

      state.camera.position.z =
        THREE.MathUtils.damp(
          state.camera
            .position.z,
          targetZ,
          2.8,
          delta,
        );

      state.camera.position.x =
        THREE.MathUtils.damp(
          state.camera
            .position.x,
          Math.sin(
            time * 0.12,
          ) *
            0.35 +
            Math.sin(
              p *
                Math.PI *
                2,
            ) *
              0.42,
          2,
          delta,
        );

      state.camera.position.y =
        THREE.MathUtils.damp(
          state.camera
            .position.y,
          Math.cos(
            time * 0.1,
          ) *
            0.22,
          2,
          delta,
        );

      state.camera.lookAt(
        0,
        0,
        0,
      );
    },
  );

  return null;
}

function TransitionScene({
  progress,
  reduced,
}: SceneProps) {
  return (
    <>
      <AuroraField
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <SpaceWarp
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <PortalGate
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <LivingCellIntro
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <MorphParticles
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <EnergyStreams
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <HolographicRings
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <ShockwavePulse
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <DataRainUniverse
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <LiquidSilkField
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <EnergyCore
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <DataFragments
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <EnergyGates
        progress={
          progress
        }
        reduced={
          reduced
        }
      />

      <PortalCamera
        progress={
          progress
        }
        reduced={
          reduced
        }
      />
    </>
  );
}

export default function CinematicTransitionEngine({
  containerRef,
}: CinematicTransitionEngineProps) {
  const reduced =
    Boolean(
      useReducedMotion(),
    );

  const {
    scrollYProgress,
  } = useScroll({
    target:
      containerRef,
    offset: [
      "start start",
      "end end",
    ],
  });

  const smooth =
    useSpring(
      scrollYProgress,
      {
        stiffness: 80,
        damping: 24,
        mass: 0.4,
      },
    );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] opacity-75 mix-blend-screen"
    >
      <Canvas
        camera={{
          position: [
            0,
            0,
            9.6,
          ],
          fov: 50,
          near: 0.1,
          far: 60,
        }}
        dpr={[1, 1.35]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference:
            "high-performance",
        }}
      >
        <TransitionScene
          progress={
            smooth
          }
          reduced={
            reduced
          }
        />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_45%,rgba(1,3,10,.18)_72%,rgba(1,3,10,.45)_100%)]" />
    </div>
  );
}