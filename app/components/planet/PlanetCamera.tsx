"use client";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  MotionValue,
} from "framer-motion";

type PlanetCameraProps = {
  progress: MotionValue<number>;
  reduced?: boolean;
};

export default function PlanetCamera({
  progress,
  reduced = false,
}: PlanetCameraProps) {
  const {
    camera,
    pointer,
  } = useThree();

  useFrame(
    (
      state,
      delta,
    ) => {
      const p =
        reduced
          ? 0.45
          : progress.get();

      const time =
        state.clock.elapsedTime;

      /*
        Scene reveal.
        Starts wide and cinematic.
      */

      const reveal =
        THREE.MathUtils.clamp(
          p / 0.28,
          0,
          1,
        );

      /*
        Core dive starts late
        and stays smooth.
      */

      const exit =
        THREE.MathUtils.clamp(
          (
            p - 0.72
          ) /
            0.28,
          0,
          1,
        );

      const easedExit =
        exit *
        exit *
        (
          3 -
          2 * exit
        );

      /*
        Slow orbital movement.
      */

      const orbitAngle =
        -0.46 +
        p * 0.88 +
        Math.sin(
          time * 0.055,
        ) *
          0.045;

      const radius =
        9.6 -
        reveal * 1.25 -
        easedExit * 2.5;

      /*
        Gentle mouse parallax.
      */

      const pointerX =
        reduced
          ? 0
          : pointer.x * 0.22;

      const pointerY =
        reduced
          ? 0
          : pointer.y * 0.16;

      const targetX =
        Math.sin(
          orbitAngle,
        ) *
          1.15 +
        pointerX;

      const targetY =
        0.72 +
        Math.cos(
          orbitAngle * 0.68,
        ) *
          0.48 +
        pointerY -
        easedExit * 0.5;

      const targetZ =
        radius;

      camera.position.x =
        THREE.MathUtils.damp(
          camera.position.x,
          targetX,
          2.6,
          delta,
        );

      camera.position.y =
        THREE.MathUtils.damp(
          camera.position.y,
          targetY,
          2.6,
          delta,
        );

      camera.position.z =
        THREE.MathUtils.damp(
          camera.position.z,
          targetZ,
          3.0,
          delta,
        );

      /*
        Look point slowly shifts
        toward the core.
      */

      const lookX =
        pointerX * 0.15;

      const lookY =
        -easedExit * 0.18 +
        pointerY * 0.08;

      const lookZ =
        -easedExit * 0.55;

      camera.lookAt(
        lookX,
        lookY,
        lookZ,
      );

      /*
        Very subtle cinematic roll.
      */

      camera.rotation.z =
        THREE.MathUtils.damp(
          camera.rotation.z,
          Math.sin(
            time * 0.045,
          ) *
            0.006 +
          pointer.x *
            -0.004,
          2.4,
          delta,
        );

      /*
        FOV expansion during core dive.
        Kept restrained.
      */

      if (
        camera instanceof
        THREE.PerspectiveCamera
      ) {
        const targetFov =
          47 +
          easedExit * 5.5;

        camera.fov =
          THREE.MathUtils.damp(
            camera.fov,
            targetFov,
            3.2,
            delta,
          );

        camera.updateProjectionMatrix();
      }
    },
  );

  return null;
}