"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type EnergyOrbitProps = {
  radius: number;
  tilt?: number;
  color?: string;
  speed?: number;
  phase?: number;
  reduced?: boolean;
};

export default function EnergyOrbit({
  radius,
  tilt = 0,
  color = "#8EEBFF",
  speed = 0.13,
  phase = 0,
  reduced = false,
}: EnergyOrbitProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const pulseRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const lineObject =
    useMemo(() => {
      const curve =
        new THREE.EllipseCurve(
          0,
          0,
          radius,
          radius * 0.62,
          0,
          Math.PI * 2,
          false,
          0,
        );

      const points =
        curve
          .getPoints(220)
          .map(
            (point) =>
              new THREE.Vector3(
                point.x,
                point.y,
                0,
              ),
          );

      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          points,
        );

      const material =
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.12,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });

      return new THREE.LineLoop(
        geometry,
        material,
      );
    }, [
      color,
      radius,
    ]);

  useEffect(() => {
    return () => {
      lineObject.geometry.dispose();

      (
        lineObject.material as THREE.LineBasicMaterial
      ).dispose();
    };
  }, [lineObject]);

  useFrame(
    (
      state,
      delta,
    ) => {
      const group =
        groupRef.current;

      const pulse =
        pulseRef.current;

      if (
        !group ||
        !pulse
      ) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      const t =
        (
          phase +
          time *
            (
              reduced
                ? 0
                : speed
            )
        ) %
        1;

      const angle =
        t *
        Math.PI *
        2;

      pulse.position.set(
        Math.cos(
          angle,
        ) *
          radius,

        Math.sin(
          angle,
        ) *
          radius *
          0.62,

        0,
      );

      const pulseScale =
        reduced
          ? 0.028
          : 0.026 +
            Math.sin(
              time * 1.4 +
                phase * 4,
            ) *
              0.006;

      pulse.scale.setScalar(
        pulseScale,
      );

      /*
        Entire orbit gently drifts.
      */

      group.rotation.z =
        THREE.MathUtils.damp(
          group.rotation.z,
          phase * 0.22 +
            Math.sin(
              time * 0.08 +
                phase,
            ) *
              0.025,
          2,
          delta,
        );

      /*
        Very subtle depth breathing.
      */

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          tilt +
            Math.sin(
              time * 0.06 +
                phase,
            ) *
              0.016,
          2,
          delta,
        );

      /*
        Orbit line opacity breathes slightly.
      */

      const material =
        lineObject.material as THREE.LineBasicMaterial;

      material.opacity =
        reduced
          ? 0.11
          : 0.10 +
            Math.sin(
              time * 0.45 +
                phase,
            ) *
              0.018;
    },
  );

  return (
    <group
      ref={groupRef}
      rotation={[
        tilt,
        0,
        phase * 0.45,
      ]}
    >
      <primitive
        object={lineObject}
      />

      {/* Main pearl pulse */}
      <mesh
        ref={pulseRef}
      >
        <sphereGeometry
          args={[
            1,
            10,
            10,
          ]}
        />

        <meshBasicMaterial
          color="#F8FBFF"
          transparent
          opacity={0.72}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Soft glow halo around pulse */}
      <mesh
        position={[
          0,
          0,
          0,
        ]}
        scale={0.045}
      >
        <sphereGeometry
          args={[
            1,
            10,
            10,
          ]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
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