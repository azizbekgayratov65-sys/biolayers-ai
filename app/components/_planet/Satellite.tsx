"use client";

import {
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type SatelliteProps = {
  radius: number;
  speed?: number;
  phase?: number;
  tilt?: number;
  color?: string;
  reduced?: boolean;
};

export default function Satellite({
  radius,
  speed = 0.16,
  phase = 0,
  tilt = 0,
  color = "#8EEBFF",
  reduced = false,
}: SatelliteProps) {
  const rootRef =
    useRef<THREE.Group | null>(
      null,
    );

  const bodyRef =
    useRef<THREE.Group | null>(
      null,
    );

  const glowRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const root =
        rootRef.current;

      const body =
        bodyRef.current;

      const glow =
        glowRef.current;

      if (
        !root ||
        !body ||
        !glow
      ) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      const angle =
        phase +
        time *
          (
            reduced
              ? 0
              : speed
          );

      /*
        Smooth orbital motion
      */

      root.position.set(
        Math.cos(
          angle,
        ) *
          radius,

        Math.sin(
          angle,
        ) *
          radius *
          0.62,

        Math.sin(
          angle *
            0.72 +
            tilt,
        ) *
          0.48,
      );

      /*
        Point satellite toward orbit direction
      */

      root.rotation.z =
        angle +
        tilt;

      root.rotation.x =
        Math.sin(
          angle * 0.45,
        ) *
        0.12;

      /*
        Slow body rotation
      */

      body.rotation.y +=
        reduced
          ? 0
          : delta *
            0.22;

      body.rotation.x =
        Math.sin(
          time * 0.18 +
            phase,
        ) *
        0.05;

      /*
        Tiny floating motion
      */

      const float =
        reduced
          ? 0
          : Math.sin(
              time *
                0.7 +
                phase,
            ) *
            0.025;

      body.position.y =
        float;

      /*
        Soft glow breathing
      */

      const glowScale =
        reduced
          ? 1
          : 1 +
            Math.sin(
              time *
                1.1 +
                phase,
            ) *
              0.08;

      glow.scale.setScalar(
        glowScale,
      );

      const glowMaterial =
        glow.material as THREE.MeshBasicMaterial;

      glowMaterial.opacity =
        reduced
          ? 0.08
          : 0.07 +
            Math.sin(
              time *
                0.8 +
                phase,
            ) *
              0.015;
    },
  );

  return (
    <group
      ref={rootRef}
    >
      <group
        ref={bodyRef}
        scale={0.82}
      >
        {/* Main pearl body */}
        <mesh>
          <boxGeometry
            args={[
              0.12,
              0.09,
              0.15,
            ]}
          />

          <meshBasicMaterial
            color="#F8FBFF"
            transparent
            opacity={0.58}
            toneMapped={false}
          />
        </mesh>

        {/* Left panel */}
        <mesh
          position={[
            -0.155,
            0,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.19,
              0.014,
              0.075,
            ]}
          />

          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.24}
            toneMapped={false}
          />
        </mesh>

        {/* Right panel */}
        <mesh
          position={[
            0.155,
            0,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.19,
              0.014,
              0.075,
            ]}
          />

          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.24}
            toneMapped={false}
          />
        </mesh>

        {/* Small antenna */}
        <mesh
          position={[
            0,
            0.085,
            0,
          ]}
        >
          <cylinderGeometry
            args={[
              0.007,
              0.007,
              0.08,
              8,
            ]}
          />

          <meshBasicMaterial
            color="#EAF7FF"
            transparent
            opacity={0.42}
            toneMapped={false}
          />
        </mesh>

        {/* Antenna pearl */}
        <mesh
          position={[
            0,
            0.13,
            0,
          ]}
        >
          <sphereGeometry
            args={[
              0.016,
              8,
              8,
            ]}
          />

          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.72}
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Soft halo */}
      <mesh
        ref={glowRef}
        scale={0.25}
      >
        <sphereGeometry
          args={[
            1,
            14,
            14,
          ]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Very soft local light */}
      <pointLight
        color={color}
        intensity={0.22}
        distance={0.8}
      />
    </group>
  );
}