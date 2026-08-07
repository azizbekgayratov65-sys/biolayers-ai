"use client";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  MotionValue,
} from "framer-motion";

type PortalCameraProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

export default function PortalCamera({
  progress,
  reduced,
}: PortalCameraProps) {
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
          ? 0
          : progress.get();

      const scaled =
        p * 4;

      const local =
        scaled -
        Math.floor(
          scaled,
        );

      const tunnel =
        Math.pow(
          Math.sin(
            local *
            Math.PI,
          ),
          5,
        );

      const time =
        state.clock.elapsedTime;

      const targetZ =
        9.3 -
        tunnel * 4.8;

      const targetX =
        pointer.x *
          (
            0.42 -
            tunnel * 0.22
          ) +
        Math.sin(
          time * 0.12,
        ) *
          0.12;

      const targetY =
        pointer.y *
          (
            0.28 -
            tunnel * 0.14
          ) +
        Math.cos(
          time * 0.1,
        ) *
          0.08;

      camera.position.z =
        THREE.MathUtils.damp(
          camera.position.z,
          targetZ,
          5.5,
          delta,
        );

      camera.position.x =
        THREE.MathUtils.damp(
          camera.position.x,
          targetX,
          3.5,
          delta,
        );

      camera.position.y =
        THREE.MathUtils.damp(
          camera.position.y,
          targetY,
          3.5,
          delta,
        );

      const lookZ =
        -tunnel * 1.8;

      camera.lookAt(
        pointer.x * 0.12,
        pointer.y * 0.08,
        lookZ,
      );

      camera.rotation.z =
        THREE.MathUtils.damp(
          camera.rotation.z,
          pointer.x *
            -0.012 +
            tunnel *
              Math.sin(
                local *
                  Math.PI *
                  2,
              ) *
              0.025,
          3,
          delta,
        );

      const targetFov =
        50 +
        tunnel * 10;

      if (
        camera instanceof
        THREE.PerspectiveCamera
      ) {
        camera.fov =
          THREE.MathUtils.damp(
            camera.fov,
            targetFov,
            5,
            delta,
          );

        camera.updateProjectionMatrix();
      }
    },
  );

  return null;
}