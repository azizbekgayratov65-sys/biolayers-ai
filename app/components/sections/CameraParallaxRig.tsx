"use client";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  MotionValue,
} from "framer-motion";

type CameraParallaxRigProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

export default function CameraParallaxRig({
  progress,
  reduced,
}: CameraParallaxRigProps) {
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

      const time =
        state.clock.elapsedTime;

      const transition =
        Math.sin(
          (
            p * 4 -
            Math.floor(p * 4)
          ) *
            Math.PI,
        );

      const targetX =
        pointer.x * 0.48 +
        Math.sin(
          time * 0.12,
        ) *
          0.16;

      const targetY =
        pointer.y * 0.3 +
        Math.cos(
          time * 0.1,
        ) *
          0.12;

      const targetZ =
        9.4 -
        transition * 1.25 -
        Math.sin(
          p *
            Math.PI *
            2,
        ) *
          0.35;

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
          2.8,
          delta,
        );

      const lookX =
        pointer.x * 0.18;

      const lookY =
        pointer.y * 0.11;

      camera.lookAt(
        lookX,
        lookY,
        0,
      );

      camera.rotation.z =
        THREE.MathUtils.damp(
          camera.rotation.z,
          pointer.x * -0.012 +
            Math.sin(
              p *
                Math.PI *
                2,
            ) *
              0.008,
          2.2,
          delta,
        );
    },
  );

  return null;
}