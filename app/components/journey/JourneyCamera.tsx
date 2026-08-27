"use client";

import { useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

type JourneyProps = {
  progress: any;
  reduced: boolean;
};

function range(value: number, start: number, end: number) {
  if (end === start) return value >= end ? 1 : 0;
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

export default function JourneyCamera({ progress, reduced }: JourneyProps) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3());
  const focusAmount = useRef(0);

  useFrame((state, delta) => {
    const p = progress.get();

    let targetZ = 9.4;
    let targetY = 0.8;
    let targetX = 0;

    if (p < 0.215) {
      const t = range(p, 0.02, 0.215);
      targetZ = THREE.MathUtils.lerp(9.4, 7.15, t);
      targetY = THREE.MathUtils.lerp(0.8, 0.28, t);
    } else if (p < 0.315) {
      const t = range(p, 0.215, 0.315);
      targetZ = THREE.MathUtils.lerp(7.15, 4.45, t);
      targetY = THREE.MathUtils.lerp(0.28, 0.06, t);
    } else if (p < 0.455) {
      const t = range(p, 0.315, 0.455);
      targetZ = THREE.MathUtils.lerp(4.45, 2.75, t);
      targetY = THREE.MathUtils.lerp(0.06, 0, t);
      targetX = Math.sin(t * Math.PI) * 0.055;
    } else if (p < 0.67) {
      const t = range(p, 0.455, 0.67);
      targetZ = THREE.MathUtils.lerp(5.8, 3.75, t);
      targetX = Math.sin(t * Math.PI * 2) * 0.11;
      targetY = Math.sin(t * Math.PI) * 0.16;
    } else if (p < 0.86) {
      const t = range(p, 0.67, 0.86);
      targetZ = THREE.MathUtils.lerp(6.2, 3.65, t);
      targetY = THREE.MathUtils.lerp(0, -0.08, t);
    } else {
      const t = range(p, 0.86, 1);
      targetZ = THREE.MathUtils.lerp(5.3, 3.25, t);
      targetY = THREE.MathUtils.lerp(-0.08, 0, t);
    }

    const canFocus = false;

    focusAmount.current = THREE.MathUtils.damp(focusAmount.current, canFocus ? 1 : 0, reduced ? 20 : 4, delta);

    targetZ = THREE.MathUtils.lerp(targetZ, 5.35, focusAmount.current);
    targetY = THREE.MathUtils.lerp(targetY, 0.18, focusAmount.current);

    if (!reduced && !canFocus) {
      targetX += Math.sin(state.clock.elapsedTime * 0.18) * 0.032;
      targetY += Math.sin(state.clock.elapsedTime * 0.13) * 0.022;
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 5, delta);

    const targetLookY = canFocus ? 0.22 : 0;

    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, targetLookY, 5, delta);
    camera.lookAt(lookTarget.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      let targetFov = THREE.MathUtils.lerp(47, 44, range(p, 0, 0.215));
      if (p > 0.215 && p < 0.455) {
        targetFov = THREE.MathUtils.lerp(44, 36, range(p, 0.215, 0.455));
      } else if (p >= 0.455) {
        targetFov = THREE.MathUtils.lerp(48, 54, range(p, 0.455, 0.67));
      }
      if (p > 0.86) {
        targetFov = THREE.MathUtils.lerp(54, 48, range(p, 0.86, 1));
      }
      if (canFocus) {
        targetFov = THREE.MathUtils.lerp(targetFov, 32, focusAmount.current);
      }
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 5, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}