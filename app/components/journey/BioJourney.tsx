"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import Earth from "../planet/Earth";
import Atmosphere from "../planet/Atmosphere";
import Clouds from "../planet/Clouds";
import CityLights from "../planet/CityLights";
import CountryBorders from "../planet/CountryBorders";
import OrbitSystem from "../planet/OrbitSystem";
import Stars from "../planet/Stars";

import {
  CountryFocusProvider,
  useCountryFocus,
} from "../planet/CountryFocus";

/* ====================================================== */
/* TYPES                                                  */
/* ====================================================== */

type JourneyProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

type GraphNode = {
  id: string;
  label: string;
  kind: "gene" | "pathway" | "cancer" | "evidence";
  x: number;
  y: number;
  size: number;
};

type GraphEdge = {
  from: string;
  to: string;
};

/* ====================================================== */
/* TIMELINE                                               */
/* ====================================================== */

/*
  0.00 - 0.24   Earth
  0.22 - 0.34   Atmospheric entry
  0.30 - 0.46   8.2 billion lives
  0.40 - 0.62   Molecular tunnel
  0.54 - 0.72   Gene universe
  0.66 - 0.84   DNA formation
  0.78 - 0.96   Cancer knowledge graph
  0.93 - 1.00   Collapse into About
*/

function range(
  value: number,
  start: number,
  end: number,
) {
  if (end === start) {
    return value >= end ? 1 : 0;
  }

  return THREE.MathUtils.clamp(
    (value - start) /
      (end - start),
    0,
    1,
  );
}

function bell(
  value: number,
  start: number,
  peakStart: number,
  peakEnd: number,
  end: number,
) {
  if (value <= start) {
    return 0;
  }

  if (value < peakStart) {
    return range(
      value,
      start,
      peakStart,
    );
  }

  if (value <= peakEnd) {
    return 1;
  }

  if (value < end) {
    return (
      1 -
      range(
        value,
        peakEnd,
        end,
      )
    );
  }

  return 0;
}

/* ====================================================== */
/* INTERACTIVE EARTH                                      */
/* ====================================================== */

function JourneyEarth({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const draggingRef =
    useRef(false);

  const pointerRef =
    useRef({
      x: 0,
      y: 0,
    });

  const rotationRef =
    useRef({
      x: 0.08,
      y: -0.55,
    });

  const velocityRef =
    useRef({
      x: 0,
      y: 0,
    });

  const {
    focusedCountry,
  } =
    useCountryFocus();

  /*
   * Robust globe dragging:
   * listen on the actual canvas at DOM capture level so country hit areas
   * cannot block drag initiation.
   */
  useEffect(() => {
    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (
        event.button !== 0 ||
        progress.get() >= 0.34 ||
        focusedCountry
      ) {
        return;
      }

      draggingRef.current = true;

      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      velocityRef.current = {
        x: 0,
        y: 0,
      };

      document.body.style.cursor =
        "grabbing";
    };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      if (
        !draggingRef.current ||
        progress.get() >= 0.34 ||
        focusedCountry
      ) {
        return;
      }

      const deltaX =
        event.clientX -
        pointerRef.current.x;

      const deltaY =
        event.clientY -
        pointerRef.current.y;

      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      rotationRef.current.y +=
        deltaX * 0.006;

      rotationRef.current.x +=
        deltaY * 0.005;

      rotationRef.current.x =
        THREE.MathUtils.clamp(
          rotationRef.current.x,
          -1.15,
          1.15,
        );

      velocityRef.current.x =
        THREE.MathUtils.clamp(
          deltaX * 0.055,
          -2,
          2,
        );

      velocityRef.current.y =
        THREE.MathUtils.clamp(
          deltaY * 0.05,
          -1.5,
          1.5,
        );
    };

    const handlePointerUp = () => {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      document.body.style.cursor =
        "default";
    };

    window.addEventListener(
      "pointerdown",
      handlePointerDown,
      true,
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      true,
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
      true,
    );

    window.addEventListener(
      "pointercancel",
      handlePointerUp,
      true,
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
        true,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp,
        true,
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerUp,
        true,
      );
    };
  }, [
    focusedCountry,
    progress,
  ]);

  useFrame(
    (
      _state,
      delta,
    ) => {
      const group =
        groupRef.current;

      if (!group) {
        return;
      }

      const p =
        progress.get();

      const exit =
        range(
          p,
          0.215,
          0.335,
        );

      const targetScale =
        THREE.MathUtils.lerp(
          1,
          2.05,
          exit,
        );

      const targetZ =
        THREE.MathUtils.lerp(
          0,
          3.55,
          exit,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          targetZ,
          6,
          delta,
        );

      group.visible =
        p < 0.345;

      if (
        focusedCountry &&
        p < 0.215
      ) {
        draggingRef.current =
          false;

        const targetY =
          THREE.MathUtils.degToRad(
            -focusedCountry.longitude,
          );

        const targetX =
          THREE.MathUtils.degToRad(
            focusedCountry.latitude,
          );

        let deltaAngle =
          targetY -
          rotationRef.current.y;

        deltaAngle =
          THREE.MathUtils.euclideanModulo(
            deltaAngle +
              Math.PI,
            Math.PI * 2,
          ) -
          Math.PI;

        rotationRef.current.y =
          THREE.MathUtils.damp(
            rotationRef.current.y,
            rotationRef.current.y +
              deltaAngle,
            reduced
              ? 25
              : 4.5,
            delta,
          );

        rotationRef.current.x =
          THREE.MathUtils.damp(
            rotationRef.current.x,
            targetX,
            reduced
              ? 25
              : 4.5,
            delta,
          );
      } else {
        if (
          !draggingRef.current
        ) {
          rotationRef.current.y +=
            velocityRef.current.x *
            delta *
            4;

          rotationRef.current.x +=
            velocityRef.current.y *
            delta *
            4;

          velocityRef.current.x =
            THREE.MathUtils.damp(
              velocityRef.current.x,
              0,
              3.6,
              delta,
            );

          velocityRef.current.y =
            THREE.MathUtils.damp(
              velocityRef.current.y,
              0,
              3.6,
              delta,
            );

          if (p < 0.34) {
            rotationRef.current.y +=
              delta * 0.055;
          }
        }

        rotationRef.current.x =
          THREE.MathUtils.clamp(
            rotationRef.current.x,
            -1.15,
            1.15,
          );
      }

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          rotationRef.current.x,
          8,
          delta,
        );

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          rotationRef.current.y,
          8,
          delta,
        );
    },
  );

  function endDrag() {
    draggingRef.current =
      false;

    if (
      typeof document !==
      "undefined"
    ) {
      document.body.style.cursor =
        "default";
    }
  }

  return (
    <group
      ref={groupRef}
      rotation={[
        0.08,
        -0.55,
        0,
      ]}
    >
      <mesh
        onPointerDown={(
          event,
        ) => {
          if (
            progress.get() >=
            0.34
          ) {
            return;
          }

          event.stopPropagation();

          draggingRef.current =
            true;

          pointerRef.current = {
            x:
              event.clientX,
            y:
              event.clientY,
          };

          velocityRef.current = {
            x: 0,
            y: 0,
          };

          if (
            typeof document !==
            "undefined"
          ) {
            document.body.style.cursor =
              "grabbing";
          }
        }}
        onPointerMove={(
          event,
        ) => {
          if (
            !draggingRef.current ||
            progress.get() >=
              0.34
          ) {
            return;
          }

          event.stopPropagation();

          const deltaX =
            event.clientX -
            pointerRef.current.x;

          const deltaY =
            event.clientY -
            pointerRef.current.y;

          pointerRef.current = {
            x:
              event.clientX,
            y:
              event.clientY,
          };

          rotationRef.current.y +=
            deltaX *
            0.006;

          rotationRef.current.x +=
            deltaY *
            0.005;

          rotationRef.current.x =
            THREE.MathUtils.clamp(
              rotationRef.current.x,
              -1.15,
              1.15,
            );

          velocityRef.current.x =
            THREE.MathUtils.clamp(
              deltaX *
                0.055,
              -2,
              2,
            );

          velocityRef.current.y =
            THREE.MathUtils.clamp(
              deltaY *
                0.05,
              -1.5,
              1.5,
            );
        }}
        onPointerUp={(
          event,
        ) => {
          event.stopPropagation();
          endDrag();
        }}
        onPointerCancel={
          endDrag
        }
        onPointerLeave={() => {
          if (
            !draggingRef.current &&
            typeof document !==
              "undefined"
          ) {
            document.body.style.cursor =
              "default";
          }
        }}
      >
        <sphereGeometry
          args={[
            2.27,
            40,
            40,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          colorWrite={false}
          depthWrite={false}
        />
      </mesh>

      <Earth
        reduced={true}
      />

      <CountryBorders
        reduced={reduced}
      />

      <Clouds
        reduced={true}
      />

      <CityLights
        reduced={true}
      />

      <Atmosphere
        reduced={true}
      />
    </group>
  );
}

/* ====================================================== */
/* PERSISTENT PARTICLE FIELD                              */
/* ====================================================== */

function MolecularField({
  progress,
  reduced,
}: JourneyProps) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const materialRef =
    useRef<THREE.PointsMaterial | null>(
      null,
    );

  const count =
    reduced
      ? 220
      : 520;

  const positions =
    useMemo(() => {
      const array =
        new Float32Array(
          count * 3,
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const angle =
          Math.random() *
          Math.PI *
          2;

        const radius =
          THREE.MathUtils.randFloat(
            0.35,
            8.2,
          );

        array[
          i * 3
        ] =
          Math.cos(angle) *
          radius;

        array[
          i * 3 + 1
        ] =
          Math.sin(angle) *
          radius *
          0.62;

        array[
          i * 3 + 2
        ] =
          THREE.MathUtils.randFloat(
            -22,
            5,
          );
      }

      return array;
    }, [count]);

  useFrame(
    (
      _state,
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

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.245,
          0.31,
          0.91,
          0.995,
        );

      const targetOpacity =
        visibility *
        THREE.MathUtils.lerp(
          0.5,
          0.82,
          range(
            p,
            0.4,
            0.72,
          ),
        );

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          targetOpacity,
          7,
          delta,
        );

      points.visible =
        visibility >
        0.005;

      if (
        reduced ||
        visibility <
          0.005
      ) {
        return;
      }

      const attribute =
        points.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;

      const speed =
        THREE.MathUtils.lerp(
          1.3,
          5.4,
          range(
            p,
            0.32,
            0.68,
          ),
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        let z =
          attribute.getZ(i);

        z +=
          delta *
          (
            speed +
            (i % 6) *
              0.16
          );

        if (z > 5.5) {
          z =
            THREE.MathUtils.randFloat(
              -22,
              -13,
            );

          const angle =
            Math.random() *
            Math.PI *
            2;

          const radius =
            THREE.MathUtils.randFloat(
              0.3,
              8.2,
            );

          attribute.setX(
            i,
            Math.cos(angle) *
              radius,
          );

          attribute.setY(
            i,
            Math.sin(angle) *
              radius *
              0.62,
          );
        }

        attribute.setZ(
          i,
          z,
        );
      }

      attribute.needsUpdate =
        true;
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
            positions,
            3,
          ]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#D8CCFF"
        size={0.038}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </points>
  );
}

/* ====================================================== */
/* ENERGY TUNNEL                                          */
/* ====================================================== */

function EnergyTunnel({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const rings =
    useMemo(
      () =>
        Array.from({
          length: 8,
        }).map(
          (
            _,
            index,
          ) => ({
            radius:
              1.05 +
              index *
                0.68,
            z:
              -1.2 -
              index *
                1.35,
          }),
        ),
      [],
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
        progress.get();

      const visibility =
        bell(
          p,
          0.325,
          0.395,
          0.585,
          0.67,
        );

      group.visible =
        visibility >
        0.01;

      const targetScale =
        THREE.MathUtils.lerp(
          0.62,
          1.6,
          range(
            p,
            0.38,
            0.64,
          ),
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      if (!reduced) {
        group.rotation.z +=
          delta *
          0.11;

        group.rotation.y =
          Math.sin(
            state.clock.elapsedTime *
              0.23,
          ) *
          0.09;
      }

      group.children.forEach(
        (
          child,
          index,
        ) => {
          if (
            child instanceof
              THREE.Mesh &&
            child.material instanceof
              THREE.MeshBasicMaterial
          ) {
            child.material.opacity =
              visibility *
              (
                0.32 -
                index *
                  0.018
              );
          }
        },
      );
    },
  );

  return (
    <group ref={groupRef}>
      {rings.map(
        (
          ring,
          index,
        ) => (
          <mesh
            key={index}
            position={[
              0,
              0,
              ring.z,
            ]}
            rotation={[
              1.12,
              index *
                0.04,
              index *
                0.21,
            ]}
          >
            <torusGeometry
              args={[
                ring.radius,
                0.017,
                8,
                100,
              ]}
            />

            <meshBasicMaterial
              color={
                index %
                    3 ===
                  0
                  ? "#22D3EE"
                  : index %
                        3 ===
                      1
                    ? "#A78BFA"
                    : "#F0ABFC"
              }
              transparent
              opacity={0}
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

/* ====================================================== */
/* DNA                                                    */
/* ====================================================== */

function JourneyDNA({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const nodes =
    useMemo(() => {
      return Array.from({
        length: 28,
      }).map(
        (
          _,
          index,
        ) => {
          const y =
            (
              index -
              13.5
            ) *
            0.24;

          const angle =
            index *
            0.52;

          return {
            a:
              new THREE.Vector3(
                Math.cos(angle) *
                  1.1,
                y,
                Math.sin(angle) *
                  1.1,
              ),

            b:
              new THREE.Vector3(
                Math.cos(
                  angle +
                    Math.PI,
                ) *
                  1.1,
                y,
                Math.sin(
                  angle +
                    Math.PI,
                ) *
                  1.1,
              ),
          };
        },
      );
    }, []);

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
        progress.get();

      const visibility =
        bell(
          p,
          0.625,
          0.69,
          0.82,
          0.895,
        );

      group.visible =
        visibility >
        0.01;

      const formation =
        range(
          p,
          0.64,
          0.76,
        );

      const exit =
        range(
          p,
          0.82,
          0.895,
        );

      const targetScale =
        THREE.MathUtils.lerp(
          0.34,
          1.35,
          formation,
        ) *
        THREE.MathUtils.lerp(
          1,
          2.4,
          exit,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          THREE.MathUtils.lerp(
            -3.8,
            1.5,
            formation,
          ),
          6,
          delta,
        );

      if (!reduced) {
        group.rotation.y +=
          delta *
          (
            0.12 +
            visibility *
              0.2
          );

        group.rotation.z =
          Math.sin(
            state.clock.elapsedTime *
              0.28,
          ) *
          0.08;
      }

      group.children.forEach(
        (child) => {
          if (
            child instanceof
            THREE.Group
          ) {
            child.children.forEach(
              (mesh) => {
                if (
                  mesh instanceof
                    THREE.Mesh &&
                  mesh.material instanceof
                    THREE.MeshBasicMaterial
                ) {
                  mesh.material.opacity =
                    visibility *
                    0.92;
                }
              },
            );
          }
        },
      );
    },
  );

  return (
    <group
      ref={groupRef}
      rotation={[
        0,
        0,
        Math.PI / 2,
      ]}
    >
      {nodes.map(
        (
          node,
          index,
        ) => {
          const direction =
            node.b
              .clone()
              .sub(
                node.a,
              );

          const distance =
            direction.length();

          const midpoint =
            node.a
              .clone()
              .add(
                node.b,
              )
              .multiplyScalar(
                0.5,
              );

          const quaternion =
            new THREE.Quaternion()
              .setFromUnitVectors(
                new THREE.Vector3(
                  0,
                  1,
                  0,
                ),
                direction
                  .clone()
                  .normalize(),
              );

          return (
            <group
              key={index}
            >
              <mesh
                position={
                  node.a
                }
              >
                <sphereGeometry
                  args={[
                    0.075,
                    10,
                    10,
                  ]}
                />

                <meshBasicMaterial
                  color="#D8B4FE"
                  transparent
                  opacity={0}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              <mesh
                position={
                  node.b
                }
              >
                <sphereGeometry
                  args={[
                    0.075,
                    10,
                    10,
                  ]}
                />

                <meshBasicMaterial
                  color="#67E8F9"
                  transparent
                  opacity={0}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              <mesh
                position={
                  midpoint
                }
                quaternion={
                  quaternion
                }
              >
                <cylinderGeometry
                  args={[
                    0.012,
                    0.012,
                    distance,
                    6,
                  ]}
                />

                <meshBasicMaterial
                  color="#A78BFA"
                  transparent
                  opacity={0}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        },
      )}
    </group>
  );
}

/* ====================================================== */
/* SINGULARITY                                            */
/* ====================================================== */

function Singularity({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const coreRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const group =
        groupRef.current;

      const core =
        coreRef.current;

      if (
        !group ||
        !core
      ) {
        return;
      }

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.23,
          0.3,
          0.91,
          0.995,
        );

      group.visible =
        visibility >
        0.005;

      const collapse =
        range(
          p,
          0.92,
          0.995,
        );

      const targetScale =
        THREE.MathUtils.lerp(
          0.44,
          1.35,
          range(
            p,
            0.25,
            0.76,
          ),
        ) *
        THREE.MathUtils.lerp(
          1,
          5.5,
          collapse,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      if (!reduced) {
        group.rotation.z +=
          delta *
          0.13;
      }

      const pulse =
        1 +
        Math.sin(
          state.clock.elapsedTime *
            2.5,
        ) *
          0.12;

      core.scale.setScalar(
        pulse,
      );

      group.children.forEach(
        (child) => {
          if (
            child instanceof
              THREE.Mesh &&
            child.material instanceof
              THREE.MeshBasicMaterial
          ) {
            child.material.opacity =
              visibility *
              (
                child ===
                  core
                  ? 0.95
                  : 0.25
              );
          }
        },
      );
    },
  );

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry
          args={[
            0.18,
            28,
            28,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          1.1,
          0.1,
          0,
        ]}
      >
        <torusGeometry
          args={[
            1.2,
            0.016,
            8,
            120,
          ]}
        />

        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          0.2,
          1,
          0.5,
        ]}
      >
        <torusGeometry
          args={[
            1.86,
            0.01,
            8,
            140,
          ]}
        />

        <meshBasicMaterial
          color="#22D3EE"
          transparent
          opacity={0}
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

/* ====================================================== */
/* CAMERA                                                 */
/* ====================================================== */

function JourneyCamera({
  progress,
  reduced,
}: JourneyProps) {
  const {
    camera,
  } =
    useThree();

  const {
    focusedCountry,
  } =
    useCountryFocus();

  const lookTarget =
    useRef(
      new THREE.Vector3(),
    );

  const focusAmount =
    useRef(0);

  useFrame(
    (
      state,
      delta,
    ) => {
      const p =
        progress.get();

      let targetZ = 9.4;
      let targetY = 0.8;
      let targetX = 0;

      if (p < 0.215) {
        const t =
          range(
            p,
            0.02,
            0.215,
          );

        targetZ =
          THREE.MathUtils.lerp(
            9.4,
            7.15,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0.8,
            0.28,
            t,
          );
      } else if (
        p < 0.35
      ) {
        const t =
          range(
            p,
            0.215,
            0.35,
          );

        targetZ =
          THREE.MathUtils.lerp(
            7.15,
            3.35,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0.28,
            0,
            t,
          );
      } else if (
        p < 0.67
      ) {
        const t =
          range(
            p,
            0.35,
            0.67,
          );

        targetZ =
          THREE.MathUtils.lerp(
            6.4,
            3.75,
            t,
          );

        targetX =
          Math.sin(
            t *
              Math.PI *
              2,
          ) *
          0.11;

        targetY =
          Math.sin(
            t *
              Math.PI,
          ) *
          0.16;
      } else if (
        p < 0.86
      ) {
        const t =
          range(
            p,
            0.67,
            0.86,
          );

        targetZ =
          THREE.MathUtils.lerp(
            6.2,
            3.65,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0,
            -0.08,
            t,
          );
      } else {
        const t =
          range(
            p,
            0.86,
            1,
          );

        targetZ =
          THREE.MathUtils.lerp(
            5.3,
            3.25,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            -0.08,
            0,
            t,
          );
      }

      const canFocus =
        Boolean(
          focusedCountry,
        ) &&
        p < 0.215;

      focusAmount.current =
        THREE.MathUtils.damp(
          focusAmount.current,
          canFocus
            ? 1
            : 0,
          reduced
            ? 20
            : 4,
          delta,
        );

      targetZ =
        THREE.MathUtils.lerp(
          targetZ,
          5.35,
          focusAmount.current,
        );

      targetY =
        THREE.MathUtils.lerp(
          targetY,
          0.18,
          focusAmount.current,
        );

      if (
        !reduced &&
        !canFocus
      ) {
        targetX +=
          Math.sin(
            state.clock.elapsedTime *
              0.18,
          ) *
          0.032;

        targetY +=
          Math.sin(
            state.clock.elapsedTime *
              0.13,
          ) *
          0.022;
      }

      camera.position.x =
        THREE.MathUtils.damp(
          camera.position.x,
          targetX,
          5,
          delta,
        );

      camera.position.y =
        THREE.MathUtils.damp(
          camera.position.y,
          targetY,
          5,
          delta,
        );

      camera.position.z =
        THREE.MathUtils.damp(
          camera.position.z,
          targetZ,
          5,
          delta,
        );

      const targetLookY =
        canFocus
          ? 0.22
          : 0;

      lookTarget.current.y =
        THREE.MathUtils.damp(
          lookTarget.current.y,
          targetLookY,
          5,
          delta,
        );

      camera.lookAt(
        lookTarget.current,
      );

      if (
        camera instanceof
        THREE.PerspectiveCamera
      ) {
        let targetFov =
          THREE.MathUtils.lerp(
            47,
            44,
            range(
              p,
              0,
              0.215,
            ),
          );

        if (p > 0.215) {
          targetFov =
            THREE.MathUtils.lerp(
              44,
              54,
              range(
                p,
                0.215,
                0.67,
              ),
            );
        }

        if (p > 0.86) {
          targetFov =
            THREE.MathUtils.lerp(
              54,
              48,
              range(
                p,
                0.86,
                1,
              ),
            );
        }

        if (canFocus) {
          targetFov =
            THREE.MathUtils.lerp(
              targetFov,
              32,
              focusAmount.current,
            );
        }

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

/* ====================================================== */
/* WORLD                                                  */
/* ====================================================== */

function JourneyWorld({
  progress,
  reduced,
}: JourneyProps) {
  return (
    <CountryFocusProvider>
      <ambientLight
        intensity={0.1}
      />

      <directionalLight
        position={[
          5,
          2,
          6,
        ]}
        intensity={1.1}
        color="#EDE9FE"
      />

      <pointLight
        position={[
          -4,
          -2,
          3,
        ]}
        intensity={0.3}
        color="#4F46E5"
      />

      <pointLight
        position={[
          4,
          1,
          2,
        ]}
        intensity={0.3}
        color="#22D3EE"
      />

      <Stars
        reduced={reduced}
      />

      <JourneyEarth
        progress={progress}
        reduced={reduced}
      />

      <OrbitSystem
        reduced={reduced}
      />

      <MolecularField
        progress={progress}
        reduced={reduced}
      />

      <EnergyTunnel
        progress={progress}
        reduced={reduced}
      />

      <JourneyDNA
        progress={progress}
        reduced={reduced}
      />

      <Singularity
        progress={progress}
        reduced={reduced}
      />

      <JourneyCamera
        progress={progress}
        reduced={reduced}
      />
    </CountryFocusProvider>
  );
}

/* ====================================================== */
/* TEXT                                                   */
/* ====================================================== */

function JourneyCopy({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const earthOpacity =
    useTransform(
      progress,
      [
        0.01,
        0.045,
        0.19,
        0.235,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const transitionOpacity =
    useTransform(
      progress,
      [
        0.205,
        0.245,
        0.315,
        0.355,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const livesOpacity =
    useTransform(
      progress,
      [
        0.305,
        0.35,
        0.425,
        0.47,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const biologyOpacity =
    useTransform(
      progress,
      [
        0.46,
        0.515,
        0.635,
        0.69,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const dnaOpacity =
    useTransform(
      progress,
      [
        0.655,
        0.705,
        0.805,
        0.855,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  return (
    <>
      <motion.div
        style={{
          opacity:
            earthOpacity,
        }}
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-[8vh]
          z-20
          mx-auto
          max-w-5xl
          px-6
          text-center
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.4em]
            text-violet-200/60
          "
        >
          BioLayers Planetary Network
        </p>

        <h2
          className="
            mt-4
            text-4xl
            font-black
            tracking-[-0.06em]
            text-white
            sm:text-6xl
            lg:text-[76px]
          "
        >
          One system.

          <span
            className="
              block
              bg-gradient-to-r
              from-violet-400
              via-white
              to-fuchsia-300
              bg-clip-text
              text-transparent
            "
          >
            Global intelligence.
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-sm
            leading-7
            text-slate-300/65
          "
        >
          Drag the planet. Click a country.
          Explore a shared research network.
        </p>
      </motion.div>

      <motion.div
        style={{
          opacity:
            transitionOpacity,
        }}
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-[10vh]
          z-20
          px-6
          text-center
        "
      >
        <p
          className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.44em]
            text-cyan-200/50
          "
        >
          Scale transition initiated
        </p>

        <h3
          className="
            mt-3
            text-2xl
            font-black
            tracking-[-0.05em]
            text-white
            sm:text-4xl
          "
        >
          Leave the planet.
          Enter the biology.
        </h3>
      </motion.div>

      <motion.div
        style={{
          opacity:
            livesOpacity,
        }}
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-[15vh]
          z-20
          px-6
          text-center
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.44em]
            text-cyan-200/50
          "
        >
          From planetary scale
        </p>

        <h2
          className="
            mt-4
            text-4xl
            font-black
            tracking-[-0.06em]
            text-white
            sm:text-6xl
            lg:text-[76px]
          "
        >
          8.2 billion lives.
        </h2>
      </motion.div>

      <motion.div
        style={{
          opacity:
            biologyOpacity,
        }}
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-[17vh]
          z-20
          px-6
          text-center
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.42em]
            text-violet-300/60
          "
        >
          Molecular Intelligence Layer
        </p>

        <h2
          className="
            mt-4
            text-4xl
            font-black
            tracking-[-0.06em]
            text-white
            sm:text-6xl
            lg:text-[72px]
          "
        >
          Biology is not static.

          <span
            className="
              block
              bg-gradient-to-r
              from-violet-400
              via-white
              to-cyan-300
              bg-clip-text
              text-transparent
            "
          >
            It is a data universe.
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-xl
            text-sm
            leading-7
            text-slate-300/70
          "
        >
          Genes, pathways, evidence and biological
          signals move through one computational space.
        </p>
      </motion.div>

      <motion.div
        style={{
          opacity:
            dnaOpacity,
        }}
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-[10vh]
          z-20
          px-6
          text-center
        "
      >
        <p
          className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.44em]
            text-fuchsia-200/50
          "
        >
          From signal to structure
        </p>

        <h3
          className="
            mt-3
            text-2xl
            font-black
            tracking-[-0.045em]
            text-white
            sm:text-4xl
          "
        >
          Decode the layers of life.
        </h3>
      </motion.div>
    </>
  );
}

/* ====================================================== */
/* ATMOSPHERIC ENTRY                                      */
/* ====================================================== */

function AtmosphericEntry({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.205,
        0.235,
        0.305,
        0.35,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const shockScale =
    useTransform(
      progress,
      [
        0.215,
        0.33,
      ],
      [
        0.18,
        3.2,
      ],
    );

  const beamScale =
    useTransform(
      progress,
      [
        0.21,
        0.32,
      ],
      [
        0.15,
        1,
      ],
    );

  return (
    <motion.div
      style={{
        opacity,
      }}
      className="
        pointer-events-none
        absolute
        inset-0
        z-[12]
        overflow-hidden
      "
    >
      <motion.div
        style={{
          scale:
            shockScale,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[36vmin]
          w-[36vmin]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-cyan-100/35
          shadow-[0_0_45px_rgba(103,232,249,.2),0_0_100px_rgba(139,92,246,.22)]
        "
      />

      <motion.div
        style={{
          scaleY:
            beamScale,
        }}
        className="
          absolute
          bottom-[-10vh]
          left-1/2
          h-[85vh]
          w-[2px]
          origin-bottom
          -translate-x-1/2
          bg-gradient-to-t
          from-cyan-200/10
          via-white/80
          to-transparent
          shadow-[0_0_18px_rgba(255,255,255,.8),0_0_58px_rgba(103,232,249,.45)]
        "
      />

      {!reduced &&
        Array.from({
          length: 16,
        }).map(
          (
            _,
            index,
          ) => (
            <motion.span
              key={index}
              animate={{
                y: [
                  "-15vh",
                  "115vh",
                ],
                opacity: [
                  0,
                  0.85,
                  0.35,
                  0,
                ],
                scaleY: [
                  0.2,
                  1.2,
                  2.3,
                ],
              }}
              transition={{
                duration:
                  1.55 +
                  (
                    index %
                    5
                  ) *
                    0.22,
                repeat:
                  Infinity,
                delay:
                  (
                    index %
                    8
                  ) *
                  0.13,
                ease:
                  "linear",
              }}
              className="
                absolute
                top-0
                w-px
                rounded-full
                bg-gradient-to-b
                from-transparent
                via-cyan-100/80
                to-violet-300/10
                shadow-[0_0_10px_rgba(103,232,249,.5)]
              "
              style={{
                left: `${
                  7 +
                  (
                    index *
                    37
                  ) %
                    86
                }%`,
                height:
                  58 +
                  (
                    index %
                    6
                  ) *
                    16,
              }}
            />
          ),
        )}
    </motion.div>
  );
}

/* ====================================================== */
/* GENE MATERIALIZATION                                   */
/* ====================================================== */

function GeneMaterialization({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.515,
        0.56,
        0.69,
        0.755,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const genes = [
    {
      name: "TP53",
      x: "15%",
      y: "38%",
    },
    {
      name: "BRCA1",
      x: "72%",
      y: "28%",
    },
    {
      name: "PTEN",
      x: "78%",
      y: "64%",
    },
    {
      name: "EGFR",
      x: "21%",
      y: "69%",
    },
    {
      name: "KRAS",
      x: "61%",
      y: "78%",
    },
    {
      name: "PIK3CA",
      x: "8%",
      y: "82%",
    },
    {
      name: "MYC",
      x: "87%",
      y: "42%",
    },
    {
      name: "AKT1",
      x: "32%",
      y: "27%",
    },
  ];

  return (
    <motion.div
      style={{
        opacity,
      }}
      className="
        pointer-events-none
        absolute
        inset-0
        z-[14]
      "
    >
      {genes.map(
        (
          gene,
          index,
        ) => (
          <motion.div
            key={
              gene.name
            }
            initial={
              reduced
                ? false
                : {
                    scale: 0.7,
                    opacity: 0,
                    filter:
                      "blur(8px)",
                  }
            }
            animate={
              reduced
                ? undefined
                : {
                    y: [
                      -5,
                      5,
                      -5,
                    ],
                  }
            }
            whileInView={{
              scale: 1,
              opacity: 1,
              filter:
                "blur(0px)",
            }}
            transition={{
              duration:
                0.75,
              delay:
                index *
                0.045,
            }}
            className="
              absolute
              -translate-x-1/2
              -translate-y-1/2
            "
            style={{
              left:
                gene.x,
              top:
                gene.y,
            }}
          >
            <div
              className="
                relative
                rounded-full
                border
                border-violet-200/20
                bg-violet-300/[0.055]
                px-3
                py-1.5
                font-mono
                text-[9px]
                font-black
                uppercase
                tracking-[0.24em]
                text-violet-100/80
                shadow-[0_0_24px_rgba(167,139,250,.12)]
                backdrop-blur-xl
              "
            >
              <span
                className="
                  absolute
                  -left-1
                  top-1/2
                  h-2
                  w-2
                  -translate-y-1/2
                  rounded-full
                  bg-cyan-200
                  shadow-[0_0_12px_rgba(103,232,249,.8)]
                "
              />

              {gene.name}
            </div>
          </motion.div>
        ),
      )}
    </motion.div>
  );
}


/* ====================================================== */
/* DNA → GRAPH FORMATION                                  */
/* ====================================================== */

function DNAToGraphBridge({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.735,
        0.775,
        0.835,
        0.875,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const ringScale =
    useTransform(
      progress,
      [
        0.745,
        0.82,
        0.875,
      ],
      [
        0.55,
        1.15,
        2.4,
      ],
    );

  const particles =
    useMemo(
      () =>
        Array.from({
          length: 22,
        }).map(
          (
            _,
            index,
          ) => ({
            left:
              12 +
              (
                index *
                37
              ) %
                76,

            top:
              18 +
              (
                index *
                29
              ) %
                64,

            delay:
              (
                index %
                8
              ) *
              0.04,

            size:
              2 +
              (
                index %
                3
              ),
          }),
        ),
      [],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
      }}
      className="
        pointer-events-none
        absolute
        inset-0
        z-[16]
        overflow-hidden
      "
    >
      {/* expanding molecular shockwave */}

      <motion.div
        style={{
          scale:
            ringScale,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[28vmin]
          w-[28vmin]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-violet-200/25
          shadow-[0_0_45px_rgba(167,139,250,.18),0_0_110px_rgba(34,211,238,.10)]
        "
      />

      <motion.div
        style={{
          scale:
            ringScale,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[46vmin]
          w-[46vmin]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-cyan-200/10
        "
      />

      {/* molecular fragments */}

      {particles.map(
        (
          particle,
          index,
        ) => (
          <motion.span
            key={index}
            initial={
              reduced
                ? false
                : {
                    left: "50%",
                    top: "50%",
                    opacity: 0,
                    scale: 0.3,
                  }
            }
            animate={
              reduced
                ? undefined
                : {
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    opacity: [
                      0,
                      0.9,
                      0.55,
                    ],
                    scale: [
                      0.35,
                      1.2,
                      0.8,
                    ],
                  }
            }
            transition={{
              duration:
                1.15,
              delay:
                particle.delay,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              absolute
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-gradient-to-br
              from-white
              via-violet-200
              to-cyan-300
              shadow-[0_0_12px_rgba(196,181,253,.75)]
            "
            style={{
              width:
                particle.size,
              height:
                particle.size,
            }}
          />
        ),
      )}

      {/* temporary connective web */}

      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {[
          [50, 50, 20, 28],
          [50, 50, 22, 68],
          [50, 50, 78, 26],
          [50, 50, 80, 67],
          [50, 50, 38, 46],
          [50, 50, 62, 46],
          [50, 50, 50, 18],
        ].map(
          (
            line,
            index,
          ) => (
            <motion.line
              key={index}
              x1={
                line[0]
              }
              y1={
                line[1]
              }
              x2={
                line[2]
              }
              y2={
                line[3]
              }
              stroke={
                index %
                    2 ===
                  0
                  ? "rgba(196,181,253,.38)"
                  : "rgba(103,232,249,.32)"
              }
              strokeWidth="0.22"
              vectorEffect="non-scaling-stroke"
              initial={
                reduced
                  ? false
                  : {
                      pathLength: 0,
                      opacity: 0,
                    }
              }
              animate={
                reduced
                  ? undefined
                  : {
                      pathLength: 1,
                      opacity: [
                        0,
                        0.8,
                        0.25,
                      ],
                    }
              }
              transition={{
                duration:
                  0.9,
                delay:
                  0.12 +
                  index *
                    0.045,
              }}
            />
          ),
        )}
      </svg>

      <motion.div
        initial={
          reduced
            ? false
            : {
                opacity: 0,
                scale: 0.7,
              }
        }
        animate={
          reduced
            ? undefined
            : {
                opacity: [
                  0,
                  1,
                  0.2,
                ],
                scale: [
                  0.7,
                  1.15,
                  1,
                ],
              }
        }
        transition={{
          duration:
            1.1,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-3
          w-3
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white
          shadow-[0_0_18px_rgba(255,255,255,.95),0_0_55px_rgba(167,139,250,.75),0_0_95px_rgba(34,211,238,.35)]
        "
      />
    </motion.div>
  );
}

/* ====================================================== */
/* KNOWLEDGE GRAPH                                        */
/* ====================================================== */

const GRAPH_NODES: GraphNode[] = [
  {
    id: "tp53",
    label: "TP53",
    kind: "gene",
    x: 20,
    y: 28,
    size: 1,
  },
  {
    id: "pten",
    label: "PTEN",
    kind: "gene",
    x: 22,
    y: 68,
    size: 1,
  },
  {
    id: "egfr",
    label: "EGFR",
    kind: "gene",
    x: 78,
    y: 26,
    size: 1,
  },
  {
    id: "kras",
    label: "KRAS",
    kind: "gene",
    x: 80,
    y: 67,
    size: 1,
  },
  {
    id: "pi3k",
    label: "PI3K / AKT",
    kind: "pathway",
    x: 38,
    y: 46,
    size: 1.2,
  },
  {
    id: "mapk",
    label: "MAPK",
    kind: "pathway",
    x: 62,
    y: 46,
    size: 1.1,
  },
  {
    id: "cancer",
    label: "Tumor State",
    kind: "cancer",
    x: 50,
    y: 58,
    size: 1.55,
  },
  {
    id: "evidence",
    label: "Evidence",
    kind: "evidence",
    x: 50,
    y: 18,
    size: 1.05,
  },
];

const GRAPH_EDGES: GraphEdge[] = [
  {
    from: "tp53",
    to: "cancer",
  },
  {
    from: "pten",
    to: "pi3k",
  },
  {
    from: "pi3k",
    to: "cancer",
  },
  {
    from: "egfr",
    to: "mapk",
  },
  {
    from: "kras",
    to: "mapk",
  },
  {
    from: "mapk",
    to: "cancer",
  },
  {
    from: "evidence",
    to: "tp53",
  },
  {
    from: "evidence",
    to: "egfr",
  },
  {
    from: "evidence",
    to: "cancer",
  },
];

const GRAPH_INFO: Record<
  string,
  {
    title: string;
    subtitle: string;
    detail: string;
  }
> = {
  tp53: {
    title: "TP53",
    subtitle: "Tumor suppressor",
    detail:
      "A central genomic checkpoint connected to DNA damage response, apoptosis and tumor-state control.",
  },

  pten: {
    title: "PTEN",
    subtitle: "Tumor suppressor",
    detail:
      "A negative regulator of PI3K–AKT signaling that helps constrain growth and survival signaling.",
  },

  egfr: {
    title: "EGFR",
    subtitle: "Receptor signaling",
    detail:
      "A membrane receptor that can propagate growth signals into MAPK and other downstream pathways.",
  },

  kras: {
    title: "KRAS",
    subtitle: "Oncogenic signaling",
    detail:
      "A signaling switch that can drive persistent proliferative activity when dysregulated.",
  },

  pi3k: {
    title: "PI3K / AKT",
    subtitle: "Survival pathway",
    detail:
      "A pathway layer linking upstream signals to cellular growth, metabolism and survival.",
  },

  mapk: {
    title: "MAPK",
    subtitle: "Growth pathway",
    detail:
      "A signaling cascade connecting receptor activity to transcriptional and proliferative programs.",
  },

  cancer: {
    title: "Tumor State",
    subtitle: "Integrated phenotype",
    detail:
      "The emergent biological state produced by interacting genomic, signaling and environmental layers.",
  },

  evidence: {
    title: "Evidence",
    subtitle: "Scientific literature",
    detail:
      "Research evidence anchors biological relationships so every connection can be traced back to a source layer.",
  },
};


function KnowledgeGraph({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const [
    hoveredNode,
    setHoveredNode,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedNode,
    setSelectedNode,
  ] =
    useState<string | null>(
      null,
    );

  const activeNode =
    selectedNode ??
    hoveredNode;

  const opacity =
    useTransform(
      progress,
      [
        0.77,
        0.815,
        0.925,
        0.985,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const scale =
    useTransform(
      progress,
      [
        0.77,
        0.835,
        0.94,
        0.99,
      ],
      [
        0.82,
        1,
        1.03,
        0.4,
      ],
    );

  const nodeMap =
    useMemo(
      () =>
        new Map(
          GRAPH_NODES.map(
            (node) => [
              node.id,
              node,
            ],
          ),
        ),
      [],
    );

  const connectedIds =
    useMemo(() => {
      if (!activeNode) {
        return new Set<string>();
      }

      const ids =
        new Set<string>([
          activeNode,
        ]);

      GRAPH_EDGES.forEach(
        (edge) => {
          if (
            edge.from ===
            activeNode
          ) {
            ids.add(
              edge.to,
            );
          }

          if (
            edge.to ===
            activeNode
          ) {
            ids.add(
              edge.from,
            );
          }
        },
      );

      return ids;
    }, [activeNode]);

  const activeInfo =
    activeNode
      ? GRAPH_INFO[
          activeNode
        ]
      : null;

  return (
    <motion.div
      style={{
        opacity,
        scale,
      }}
      className="
        absolute
        inset-0
        z-[18]
        origin-center
      "
    >
      {/* TITLE */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[9vh]
          -translate-x-1/2
          text-center
        "
      >
        <p
          className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.42em]
            text-cyan-200/50
          "
        >
          Cancer Knowledge Graph
        </p>

        <h3
          className="
            mt-3
            text-3xl
            font-black
            tracking-[-0.05em]
            text-white
            sm:text-5xl
          "
        >
          Connect the evidence.
        </h3>

        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-sm
            leading-7
            text-slate-300/65
          "
        >
          Trace a relationship.
          Lock a node. Follow the biology.
        </p>
      </div>

      {/* GRAPH */}

      <div
        className="
          absolute
          left-1/2
          top-[57%]
          h-[46vh]
          w-[86vw]
          max-w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <svg
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
          "
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {GRAPH_EDGES.map(
            (
              edge,
              index,
            ) => {
              const from =
                nodeMap.get(
                  edge.from,
                );

              const to =
                nodeMap.get(
                  edge.to,
                );

              if (
                !from ||
                !to
              ) {
                return null;
              }

              const isActive =
                !activeNode ||
                edge.from ===
                  activeNode ||
                edge.to ===
                  activeNode;

              return (
                <motion.line
                  key={`${edge.from}-${edge.to}`}
                  x1={
                    from.x
                  }
                  y1={
                    from.y
                  }
                  x2={
                    to.x
                  }
                  y2={
                    to.y
                  }
                  stroke={
                    isActive
                      ? index %
                            2 ===
                          0
                        ? "rgba(103,232,249,.75)"
                        : "rgba(216,180,254,.72)"
                      : "rgba(148,163,184,.08)"
                  }
                  strokeWidth={
                    isActive
                      ? "0.34"
                      : "0.15"
                  }
                  vectorEffect="non-scaling-stroke"
                  initial={
                    reduced
                      ? false
                      : {
                          pathLength: 0,
                          opacity: 0,
                        }
                  }
                  whileInView={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  animate={
                    !reduced &&
                    isActive &&
                    activeNode
                      ? {
                          opacity: [
                            0.55,
                            1,
                            0.55,
                          ],
                        }
                      : undefined
                  }
                  transition={{
                    pathLength: {
                      duration:
                        0.8,
                      delay:
                        index *
                        0.05,
                    },

                    opacity: {
                      duration:
                        1.4,
                      repeat:
                        activeNode
                          ? Infinity
                          : 0,
                    },
                  }}
                />
              );
            },
          )}
        </svg>

        {GRAPH_NODES.map(
          (
            node,
            index,
          ) => {
            const isSelected =
              selectedNode ===
              node.id;

            const isHovered =
              hoveredNode ===
              node.id;

            const isConnected =
              !activeNode ||
              connectedIds.has(
                node.id,
              );

            return (
              <motion.button
                type="button"
                key={
                  node.id
                }
                aria-pressed={
                  isSelected
                }
                aria-label={`Explore ${node.label}`}
                onMouseEnter={() => {
                  setHoveredNode(
                    node.id,
                  );
                }}
                onMouseLeave={() => {
                  setHoveredNode(
                    null,
                  );
                }}
                onFocus={() => {
                  setHoveredNode(
                    node.id,
                  );
                }}
                onBlur={() => {
                  setHoveredNode(
                    null,
                  );
                }}
                onClick={() => {
                  setSelectedNode(
                    (
                      current,
                    ) =>
                      current ===
                      node.id
                        ? null
                        : node.id,
                  );
                }}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.5,
                        filter:
                          "blur(10px)",
                      }
                }
                whileInView={{
                  opacity:
                    isConnected
                      ? 1
                      : 0.22,

                  scale:
                    node.size,

                  filter:
                    isConnected
                      ? "blur(0px)"
                      : "blur(1px)",
                }}
                whileHover={
                  reduced
                    ? undefined
                    : {
                        scale:
                          node.size *
                          1.12,
                        zIndex: 20,
                      }
                }
                transition={{
                  duration:
                    0.45,
                  delay:
                    index *
                    0.045,
                }}
                className="
                  absolute
                  -translate-x-1/2
                  -translate-y-1/2
                  cursor-pointer
                  rounded-full
                  outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-200/70
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#020105]
                "
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
              >
                <div
                  className={`
                    relative
                    flex
                    min-h-12
                    min-w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    px-4
                    text-center
                    font-mono
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    ${
                      node.kind ===
                      "cancer"
                        ? "border-fuchsia-200/35 bg-fuchsia-400/[0.10] text-white shadow-[0_0_48px_rgba(217,70,239,.24)]"
                        : node.kind ===
                            "pathway"
                          ? "border-violet-200/30 bg-violet-400/[0.08] text-violet-100 shadow-[0_0_32px_rgba(139,92,246,.18)]"
                          : node.kind ===
                              "evidence"
                            ? "border-cyan-200/30 bg-cyan-300/[0.08] text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,.16)]"
                            : "border-white/15 bg-white/[0.05] text-slate-100"
                    }

                    ${
                      isSelected ||
                      isHovered
                        ? "border-white/55 bg-white/[0.10] shadow-[0_0_32px_rgba(255,255,255,.18),0_0_70px_rgba(103,232,249,.16)]"
                        : ""
                    }
                  `}
                >
                  {!reduced && (
                    <>
                      <motion.span
                        animate={{
                          scale: [
                            1,
                            1.8,
                            1,
                          ],

                          opacity: [
                            0.35,
                            0.95,
                            0.35,
                          ],
                        }}
                        transition={{
                          duration:
                            2 +
                            (
                              index %
                              4
                            ) *
                              0.25,

                          repeat:
                            Infinity,

                          ease:
                            "easeInOut",
                        }}
                        className="
                          absolute
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-white
                          shadow-[0_0_12px_rgba(255,255,255,.8)]
                        "
                      />

                      {(isSelected ||
                        isHovered) && (
                        <motion.span
                          initial={{
                            scale:
                              0.4,
                            opacity:
                              0,
                          }}
                          animate={{
                            scale: [
                              0.7,
                              1.8,
                            ],

                            opacity: [
                              0.55,
                              0,
                            ],
                          }}
                          transition={{
                            duration:
                              1.4,

                            repeat:
                              Infinity,

                            ease:
                              "easeOut",
                          }}
                          className="
                            absolute
                            -inset-3
                            rounded-full
                            border
                            border-cyan-200/30
                          "
                        />
                      )}
                    </>
                  )}

                  <span
                    className="
                      relative
                      z-10
                    "
                  >
                    {node.label}
                  </span>
                </div>
              </motion.button>
            );
          },
        )}
      </div>

      {/* DETAIL PANEL */}

      <motion.div
        animate={{
          opacity:
            activeInfo
              ? 1
              : 0,

          y:
            activeInfo
              ? 0
              : 14,
        }}
        transition={{
          duration:
            0.28,
        }}
        className="
          pointer-events-none
          absolute
          bottom-[5.5vh]
          left-1/2
          z-30
          w-[min(92vw,620px)]
          -translate-x-1/2
        "
      >
        {activeInfo && (
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-black/55
              px-5
              py-4
              shadow-[0_0_55px_rgba(76,29,149,.14)]
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    font-mono
                    text-[7px]
                    font-black
                    uppercase
                    tracking-[0.3em]
                    text-cyan-200/45
                  "
                >
                  {
                    activeInfo.subtitle
                  }
                </p>

                <h4
                  className="
                    mt-1
                    text-lg
                    font-black
                    tracking-[-0.03em]
                    text-white
                  "
                >
                  {
                    activeInfo.title
                  }
                </h4>
              </div>

              {selectedNode && (
                <span
                  className="
                    rounded-full
                    border
                    border-violet-200/15
                    bg-violet-300/[0.05]
                    px-3
                    py-1
                    font-mono
                    text-[7px]
                    uppercase
                    tracking-[0.2em]
                    text-violet-200/50
                  "
                >
                  Locked
                </span>
              )}
            </div>

            <p
              className="
                mt-3
                text-xs
                leading-6
                text-slate-300/70
                sm:text-sm
              "
            >
              {
                activeInfo.detail
              }
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ====================================================== */
/* COLLAPSE INTO ABOUT                                    */
/* ====================================================== */

function AboutCollapse({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.925,
        0.965,
        1,
      ],
      [
        0,
        1,
        0,
      ],
    );

  const scale =
    useTransform(
      progress,
      [
        0.925,
        1,
      ],
      [
        0.1,
        7,
      ],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
        scale,
      }}
      className="
        pointer-events-none
        absolute
        left-1/2
        top-1/2
        z-[28]
        h-28
        w-28
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        border
        border-white/25
        bg-white/[0.04]
        shadow-[0_0_40px_rgba(255,255,255,.35),0_0_100px_rgba(196,181,253,.45),0_0_220px_rgba(34,211,238,.16)]
      "
    />
  );
}

/* ====================================================== */
/* MAIN                                                   */
/* ====================================================== */

export default function BioJourney() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null,
    );

  const reduced = false;

  const {
    scrollYProgress,
  } = useScroll({
    target:
      sectionRef,
    offset: [
      "start start",
      "end end",
    ],
  });

  const progress =
    useSpring(
      scrollYProgress,
      {
        stiffness: 78,
        damping: 24,
        mass: 0.34,
      },
    );

  const violetAura =
    useTransform(
      progress,
      [
        0,
        0.22,
        0.5,
        0.78,
        1,
      ],
      [
        0.3,
        0.46,
        0.58,
        0.48,
        0.28,
      ],
    );

  const cyanAura =
    useTransform(
      progress,
      [
        0.16,
        0.36,
        0.68,
        0.92,
        1,
      ],
      [
        0.06,
        0.24,
        0.34,
        0.2,
        0.06,
      ],
    );

  const magentaAura =
    useTransform(
      progress,
      [
        0.42,
        0.66,
        0.9,
        1,
      ],
      [
        0.03,
        0.18,
        0.28,
        0.08,
      ],
    );

  const flash =
    useTransform(
      progress,
      [
        0.25,
        0.29,
        0.335,
        0.91,
        0.965,
        0.995,
      ],
      [
        0,
        0.22,
        0,
        0,
        0.26,
        0,
      ],
    );

  return (
    <section
      ref={sectionRef}
      id="bio-journey"
      className="
        relative
        h-[620vh]
        bg-[#020105]
      "
    >
      <div
        className="
          sticky
          top-0
          h-screen
          overflow-hidden
          bg-[#020105]
        "
      >
        {/* BASE */}

        <div
          className="
            absolute
            inset-0
            bg-[#020105]
          "
        />

        {/* ALWAYS-ON DEPTH */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[radial-gradient(circle_at_50%_52%,rgba(45,24,82,.18)_0%,rgba(15,8,30,.12)_38%,rgba(2,1,5,.25)_100%)]
          "
        />

        {/* VIOLET AURA */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              violetAura,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[1]
            h-[82vw]
            w-[82vw]
            min-h-[720px]
            min-w-[720px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(124,58,237,.30)_0%,rgba(91,33,182,.16)_24%,rgba(76,29,149,.06)_46%,transparent_72%)]
            blur-[105px]
          "
        />

        {/* CYAN AURA */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              cyanAura,
          }}
          className="
            pointer-events-none
            absolute
            right-[-16vw]
            top-[10%]
            z-[1]
            h-[58vw]
            w-[58vw]
            min-h-[540px]
            min-w-[540px]
            rounded-full
            bg-[radial-gradient(circle,rgba(34,211,238,.23)_0%,rgba(59,130,246,.08)_30%,transparent_68%)]
            blur-[130px]
          "
        />

        {/* MAGENTA AURA */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              magentaAura,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-22vw]
            left-[-14vw]
            z-[1]
            h-[60vw]
            w-[60vw]
            min-h-[560px]
            min-w-[560px]
            rounded-full
            bg-[radial-gradient(circle,rgba(217,70,239,.18)_0%,rgba(126,34,206,.07)_32%,transparent_70%)]
            blur-[140px]
          "
        />

        {/* SINGLE WEBGL CANVAS */}

        <div
          className="
            absolute
            inset-0
            z-[2]
          "
        >
          <Canvas
            camera={{
              position: [
                0,
                0.8,
                9.4,
              ],
              fov: 47,
              near: 0.1,
              far: 100,
            }}
            dpr={[
              1,
              1.1,
            ]}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference:
                "high-performance",
            }}
            onCreated={({
              gl,
            }) => {
              gl.setClearColor(
                0x000000,
                0,
              );

              gl.outputColorSpace =
                THREE.SRGBColorSpace;

              gl.toneMapping =
                THREE.ACESFilmicToneMapping;

              gl.toneMappingExposure =
                1.08;
            }}
          >
            <JourneyWorld
              progress={
                progress
              }
              reduced={
                reduced
              }
            />
          </Canvas>
        </div>

        {/* DOM EFFECTS */}

        <AtmosphericEntry
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <GeneMaterialization
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <DNAToGraphBridge
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <KnowledgeGraph
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <JourneyCopy
          progress={
            progress
          }
        />

        <AboutCollapse
          progress={
            progress
          }
        />

        {/* FLASH */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              flash,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            z-30
            bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,.70)_0%,rgba(196,181,253,.20)_10%,rgba(34,211,238,.08)_26%,transparent_62%)]
          "
        />

        {/* HUD */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-5
            left-1/2
            z-40
            flex
            w-[54vw]
            max-w-[720px]
            -translate-x-1/2
            items-center
            gap-4
          "
        >
          <span
            className="
              font-mono
              text-[7px]
              uppercase
              tracking-[0.28em]
              text-violet-200/25
            "
          >
            Macro
          </span>

          <div
            className="
              relative
              h-px
              flex-1
              overflow-hidden
              bg-white/[0.06]
            "
          >
            <motion.div
              style={{
                scaleX:
                  progress,
              }}
              className="
                h-full
                w-full
                origin-left
                bg-gradient-to-r
                from-violet-400
                via-cyan-300
                to-fuchsia-300
                shadow-[0_0_14px_rgba(167,139,250,.7)]
              "
            />
          </div>

          <span
            className="
              font-mono
              text-[7px]
              uppercase
              tracking-[0.28em]
              text-cyan-200/25
            "
          >
            Molecular
          </span>
        </div>
      </div>
    </section>
  );
}