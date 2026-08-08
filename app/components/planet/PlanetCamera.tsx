"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import type {
  MotionValue,
} from "framer-motion";

import * as THREE from "three";

import {
  useCountryFocus,
} from "./CountryFocus";

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
  } =
    useThree();

  const {
    focusedCountry,
    clearFocus,
  } =
    useCountryFocus();

  /* ==================================================== */
  /* BASE CAMERA                                          */
  /* ==================================================== */

  const baseLookTarget =
    useMemo(
      () =>
        new THREE.Vector3(
          0,
          0,
          0,
        ),
      [],
    );

  const targetPositionRef =
    useRef(
      new THREE.Vector3(
        0,
        0.8,
        9.4,
      ),
    );

  const currentLookTargetRef =
    useRef(
      new THREE.Vector3(
        0,
        0,
        0,
      ),
    );

  const targetLookRef =
    useRef(
      new THREE.Vector3(
        0,
        0,
        0,
      ),
    );

  const focusAmountRef =
    useRef(0);

  const cinematicDriftRef =
    useRef(
      new THREE.Vector3(),
    );

  /* ==================================================== */
  /* ESC                                                  */
  /* ==================================================== */

  useEffect(() => {
    const handleKeyDown =
      (
        event:
          KeyboardEvent,
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          clearFocus();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    clearFocus,
  ]);

  /* ==================================================== */
  /* CAMERA LOOP                                          */
  /* ==================================================== */

  useFrame(
    (
      state,
      delta,
    ) => {
      const scroll =
        progress.get();

      /* ================================================= */
      /* NORMAL SCROLL CAMERA                              */
      /* ================================================= */

      const scrollProgress =
        THREE.MathUtils.smoothstep(
          scroll,
          0.08,
          0.78,
        );

      const normalZ =
        THREE.MathUtils.lerp(
          9.4,
          7.25,
          scrollProgress,
        );

      const normalY =
        THREE.MathUtils.lerp(
          0.8,
          0.32,
          scrollProgress,
        );

      const normalX =
        0;

      /* ================================================= */
      /* CINEMATIC DRIFT                                   */
      /* ================================================= */

      if (
        !reduced &&
        !focusedCountry
      ) {
        const time =
          state.clock
            .elapsedTime;

        cinematicDriftRef
          .current
          .set(
            Math.sin(
              time * 0.18,
            ) *
              0.045,

            Math.sin(
              time * 0.13,
            ) *
              0.03,

            0,
          );
      } else {
        cinematicDriftRef
          .current
          .set(
            0,
            0,
            0,
          );
      }

      /* ================================================= */
      /* FOCUS AMOUNT                                      */
      /* ================================================= */

      const targetFocus =
        focusedCountry
          ? 1
          : 0;

      focusAmountRef.current =
        THREE.MathUtils.damp(
          focusAmountRef.current,
          targetFocus,
          reduced
            ? 20
            : 3.8,
          delta,
        );

      /* ================================================= */
      /* COUNTRY FOCUS CAMERA                              */
      /* ================================================= */

      /*
       * Important:
       *
       * Earth itself rotates the selected
       * country toward +Z/front.
       *
       * Camera therefore only needs to move
       * toward the center.
       */

      const focusPosition =
        new THREE.Vector3(
          0,
          0.18,
          5.35,
        );

      /*
       * Blend between normal camera
       * and focus camera.
       */

      targetPositionRef
        .current
        .set(
          normalX,
          normalY,
          normalZ,
        );

      targetPositionRef
        .current
        .add(
          cinematicDriftRef
            .current,
        );

      targetPositionRef
        .current
        .lerp(
          focusPosition,
          focusAmountRef
            .current,
        );

      /* ================================================= */
      /* LOOK TARGET                                       */
      /* ================================================= */

      /*
       * During focus look slightly above
       * center so selected country sits
       * closer to visual center instead
       * of underneath the title.
       */

      targetLookRef
        .current
        .copy(
          baseLookTarget,
        );

      if (
        focusedCountry
      ) {
        targetLookRef
          .current
          .set(
            0,
            0.22,
            0,
          );
      }

      currentLookTargetRef
        .current.x =
        THREE.MathUtils.damp(
          currentLookTargetRef
            .current.x,
          targetLookRef
            .current.x,
          5,
          delta,
        );

      currentLookTargetRef
        .current.y =
        THREE.MathUtils.damp(
          currentLookTargetRef
            .current.y,
          targetLookRef
            .current.y,
          5,
          delta,
        );

      currentLookTargetRef
        .current.z =
        THREE.MathUtils.damp(
          currentLookTargetRef
            .current.z,
          targetLookRef
            .current.z,
          5,
          delta,
        );

      /* ================================================= */
      /* APPLY POSITION                                    */
      /* ================================================= */

      const damping =
        focusedCountry
          ? 4.6
          : 5.4;

      camera.position.x =
        THREE.MathUtils.damp(
          camera.position.x,
          targetPositionRef
            .current.x,
          damping,
          delta,
        );

      camera.position.y =
        THREE.MathUtils.damp(
          camera.position.y,
          targetPositionRef
            .current.y,
          damping,
          delta,
        );

      camera.position.z =
        THREE.MathUtils.damp(
          camera.position.z,
          targetPositionRef
            .current.z,
          damping,
          delta,
        );

      camera.lookAt(
        currentLookTargetRef
          .current,
      );

      /* ================================================= */
      /* FOV                                               */
      /* ================================================= */

      if (
        camera instanceof
        THREE.PerspectiveCamera
      ) {
        const normalFov =
          THREE.MathUtils.lerp(
            47,
            44,
            scrollProgress,
          );

        /*
         * Narrower FOV during focus
         * gives more cinematic compression.
         */

        const focusFov =
          32;

        const targetFov =
          THREE.MathUtils.lerp(
            normalFov,
            focusFov,
            focusAmountRef
              .current,
          );

        camera.fov =
          THREE.MathUtils.damp(
            camera.fov,
            targetFov,
            4.8,
            delta,
          );

        camera
          .updateProjectionMatrix();
      }
    },
  );

  return null;
}