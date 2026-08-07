"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

type GravityState = {
  screen: THREE.Vector2;
  world: THREE.Vector3;
  strength: number;
  active: boolean;
};

type MouseGravityContextValue = {
  stateRef: React.MutableRefObject<GravityState>;
};

const MouseGravityContext =
  createContext<MouseGravityContextValue | null>(
    null,
  );

export function useMouseGravity() {
  const context =
    useContext(
      MouseGravityContext,
    );

  if (!context) {
    throw new Error(
      "useMouseGravity must be used inside MouseGravityField.",
    );
  }

  return context;
}

type MouseGravityFieldProps = {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
};

export default function MouseGravityField({
  children,
  strength = 1.1,
  radius = 4.6,
}: MouseGravityFieldProps) {
  const {
    camera,
    gl,
  } = useThree();

  const pointerTarget =
    useRef(
      new THREE.Vector2(
        0,
        0,
      ),
    );

  const pointerSmooth =
    useRef(
      new THREE.Vector2(
        0,
        0,
      ),
    );

  const activeRef =
    useRef(false);

  const plane =
    useMemo(
      () =>
        new THREE.Plane(
          new THREE.Vector3(
            0,
            0,
            1,
          ),
          0,
        ),
      [],
    );

  const raycaster =
    useMemo(
      () =>
        new THREE.Raycaster(),
      [],
    );

  const tempWorld =
    useMemo(
      () =>
        new THREE.Vector3(),
      [],
    );

  const stateRef =
    useRef<GravityState>({
      screen:
        new THREE.Vector2(),
      world:
        new THREE.Vector3(),
      strength: 0,
      active: false,
    });

  useEffect(() => {
    const element =
      gl.domElement;

    function handlePointerMove(
      event: PointerEvent,
    ) {
      const rect =
        element.getBoundingClientRect();

      const x =
        ((event.clientX -
          rect.left) /
          rect.width) *
          2 -
        1;

      const y =
        -(
          ((event.clientY -
            rect.top) /
            rect.height) *
            2 -
          1
        );

      pointerTarget.current.set(
        x,
        y,
      );

      activeRef.current =
        true;
    }

    function handlePointerLeave() {
      activeRef.current =
        false;
    }

    element.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    element.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    return () => {
      element.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      element.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  }, [gl]);

  useFrame(
    (
      _state,
      delta,
    ) => {
      const smooth =
        pointerSmooth.current;

      const target =
        pointerTarget.current;

      smooth.x =
        THREE.MathUtils.damp(
          smooth.x,
          activeRef.current
            ? target.x
            : 0,
          5.6,
          delta,
        );

      smooth.y =
        THREE.MathUtils.damp(
          smooth.y,
          activeRef.current
            ? target.y
            : 0,
          5.6,
          delta,
        );

      raycaster.setFromCamera(
        smooth,
        camera,
      );

      raycaster.ray.intersectPlane(
        plane,
        tempWorld,
      );

      stateRef.current.screen.copy(
        smooth,
      );

      stateRef.current.world.lerp(
        tempWorld,
        1 -
          Math.exp(
            -6 * delta,
          ),
      );

      stateRef.current.active =
        activeRef.current;

      const desiredStrength =
        activeRef.current
          ? strength
          : 0;

      stateRef.current.strength =
        THREE.MathUtils.damp(
          stateRef.current
            .strength,
          desiredStrength,
          4.5,
          delta,
        );

      const distanceFromCenter =
        smooth.length();

      stateRef.current.strength *=
        THREE.MathUtils.clamp(
          1.15 -
            distanceFromCenter *
              0.18,
          0.75,
          1.15,
        );

      stateRef.current.world.z =
        THREE.MathUtils.damp(
          stateRef.current
            .world.z,
          0,
          7,
          delta,
        );

      stateRef.current.world.x =
        THREE.MathUtils.clamp(
          stateRef.current
            .world.x,
          -radius,
          radius,
        );

      stateRef.current.world.y =
        THREE.MathUtils.clamp(
          stateRef.current
            .world.y,
          -radius,
          radius,
        );
    },
  );

  const value =
    useMemo(
      () => ({
        stateRef,
      }),
      [],
    );

  return (
    <MouseGravityContext.Provider
      value={value}
    >
      {children}
    </MouseGravityContext.Provider>
  );
}