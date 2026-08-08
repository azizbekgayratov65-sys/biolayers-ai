"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

/* ====================================================== */
/* DNA PARTICLE TYPE                                      */
/* ====================================================== */

type HelixNode = {
  a: THREE.Vector3;
  b: THREE.Vector3;
  phase: number;
};

/* ====================================================== */
/* DNA HELIX                                              */
/* ====================================================== */

function DNAHelix({
  reduced,
}: {
  reduced: boolean;
}) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const nodes =
    useMemo<HelixNode[]>(
      () =>
        Array.from({
          length: 52,
        }).map(
          (
            _,
            index,
          ) => {
            const y =
              (index - 25.5) *
              0.22;

            const angle =
              index *
              0.46;

            const radius =
              1.22;

            return {
              a:
                new THREE.Vector3(
                  Math.cos(
                    angle,
                  ) *
                    radius,

                  y,

                  Math.sin(
                    angle,
                  ) *
                    radius,
                ),

              b:
                new THREE.Vector3(
                  Math.cos(
                    angle +
                      Math.PI,
                  ) *
                    radius,

                  y,

                  Math.sin(
                    angle +
                      Math.PI,
                  ) *
                    radius,
                ),

              phase:
                Math.random() *
                Math.PI *
                2,
            };
          },
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

      if (!reduced) {
        group.rotation.y +=
          delta *
          0.18;

        group.rotation.z =
          Math.sin(
            state.clock.elapsedTime *
              0.24,
          ) *
          0.08;
      }
    },
  );

  return (
    <group
      ref={groupRef}
      rotation={[
        0,
        0,
        Math.PI /
          2,
      ]}
    >
      {nodes.map(
        (
          node,
          index,
        ) => {
          const center =
            node.a
              .clone()
              .add(
                node.b,
              )
              .multiplyScalar(
                0.5,
              );

          const distance =
            node.a.distanceTo(
              node.b,
            );

          const direction =
            node.b
              .clone()
              .sub(
                node.a,
              )
              .normalize();

          const quaternion =
            new THREE.Quaternion()
              .setFromUnitVectors(
                new THREE.Vector3(
                  0,
                  1,
                  0,
                ),
                direction,
              );

          return (
            <group
              key={
                index
              }
            >
              {/* STRAND A */}

              <mesh
                position={
                  node.a
                }
              >
                <sphereGeometry
                  args={[
                    0.07,
                    14,
                    14,
                  ]}
                />

                <meshBasicMaterial
                  color={
                    index %
                        3 ===
                      0
                      ? "#C4B5FD"
                      : "#8B5CF6"
                  }
                  transparent
                  opacity={0.96}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={
                    false
                  }
                  toneMapped={
                    false
                  }
                />
              </mesh>

              {/* STRAND B */}

              <mesh
                position={
                  node.b
                }
              >
                <sphereGeometry
                  args={[
                    0.07,
                    14,
                    14,
                  ]}
                />

                <meshBasicMaterial
                  color={
                    index %
                        3 ===
                      0
                      ? "#F0ABFC"
                      : "#C084FC"
                  }
                  transparent
                  opacity={0.9}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={
                    false
                  }
                  toneMapped={
                    false
                  }
                />
              </mesh>

              {/* BASE PAIR */}

              <mesh
                position={
                  center
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
                  opacity={0.34}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={
                    false
                  }
                  toneMapped={
                    false
                  }
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
/* ENERGY PARTICLES                                       */
/* ====================================================== */

function EnergyParticles({
  reduced,
}: {
  reduced: boolean;
}) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const count = 1450;

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
        const radius =
          THREE.MathUtils.randFloat(
            0.5,
            7,
          );

        const angle =
          Math.random() *
          Math.PI *
          2;

        array[
          i * 3
        ] =
          Math.cos(
            angle,
          ) *
          radius;

        array[
          i * 3 +
            1
        ] =
          THREE.MathUtils.randFloat(
            -5,
            5,
          );

        array[
          i * 3 +
            2
        ] =
          Math.sin(
            angle,
          ) *
          radius;
      }

      return array;
    }, []);

  useFrame(
    (
      state,
      delta,
    ) => {
      if (
        !pointsRef.current ||
        reduced
      ) {
        return;
      }

      const positionsAttribute =
        pointsRef.current
          .geometry
          .getAttribute(
            "position",
          ) as THREE.BufferAttribute;

      const time =
        state.clock.elapsedTime;

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const x =
          positionsAttribute
            .getX(
              i,
            );

        const y =
          positionsAttribute
            .getY(
              i,
            );

        const z =
          positionsAttribute
            .getZ(
              i,
            );

        const radius =
          Math.sqrt(
            x *
              x +
              z *
                z,
          );

        const angle =
          Math.atan2(
            z,
            x,
          ) +
          delta *
            (
              0.06 +
              (
                i %
                5
              ) *
                0.012
            );

        const breathing =
          1 +
          Math.sin(
            time *
              0.5 +
              i *
                0.1,
          ) *
            0.01;

        positionsAttribute.setXYZ(
          i,

          Math.cos(
            angle,
          ) *
            radius *
            breathing,

          y,

          Math.sin(
            angle,
          ) *
            radius *
            breathing,
        );
      }

      positionsAttribute.needsUpdate =
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
        color="#C4B5FD"
        size={0.034}
        transparent
        opacity={0.58}
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

/* ====================================================== */
/* CENTER PORTAL                                          */
/* ====================================================== */

function CenterPortal({
  reduced,
}: {
  reduced: boolean;
}) {
  const ringA =
    useRef<THREE.Mesh | null>(
      null,
    );

  const ringB =
    useRef<THREE.Mesh | null>(
      null,
    );

  const core =
    useRef<THREE.Mesh | null>(
      null,
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const time =
        state.clock.elapsedTime;

      if (
        !reduced &&
        ringA.current
      ) {
        ringA.current.rotation.z +=
          delta *
          0.3;
      }

      if (
        !reduced &&
        ringB.current
      ) {
        ringB.current.rotation.z -=
          delta *
          0.22;
      }

      if (
        core.current
      ) {
        const pulse =
          reduced
            ? 1
            : 1 +
              Math.sin(
                time *
                  2.2,
              ) *
                0.1;

        core.current.scale.setScalar(
          THREE.MathUtils.damp(
            core.current.scale.x,
            pulse,
            8,
            delta,
          ),
        );
      }
    },
  );

  return (
    <group>
      <mesh
        ref={core}
      >
        <sphereGeometry
          args={[
            0.18,
            36,
            36,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.95}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={ringA}
        rotation={[
          1.2,
          0.1,
          0,
        ]}
      >
        <torusGeometry
          args={[
            1.5,
            0.016,
            10,
            160,
          ]}
        />

        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.42}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={ringB}
        rotation={[
          0.2,
          1.1,
          0.5,
        ]}
      >
        <torusGeometry
          args={[
            2.2,
            0.01,
            10,
            180,
          ]}
        />

        <meshBasicMaterial
          color="#D946EF"
          transparent
          opacity={0.24}
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
/* CHROMATIC HALO                                         */
/* ====================================================== */

function ChromaticHalo({
  reduced,
}: {
  reduced: boolean;
}) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      if (
        !groupRef.current ||
        reduced
      ) {
        return;
      }

      groupRef.current.rotation.z +=
        delta * 0.12;

      groupRef.current.rotation.x =
        Math.sin(
          state.clock.elapsedTime *
            0.22,
        ) * 0.08;
    },
  );

  return (
    <group ref={groupRef}>
      {Array.from({
        length: 7,
      }).map(
        (
          _,
          index,
        ) => (
          <mesh
            key={index}
            position={[
              0,
              0,
              -0.6 -
                index * 0.55,
            ]}
            rotation={[
              1.15 +
                index * 0.035,
              index * 0.12,
              index * 0.2,
            ]}
          >
            <torusGeometry
              args={[
                1.55 +
                  index * 0.46,
                0.012 +
                  (index % 2) *
                    0.004,
                8,
                160,
              ]}
            />

            <meshBasicMaterial
              color={
                index % 3 === 0
                  ? "#22D3EE"
                  : index % 3 === 1
                    ? "#A78BFA"
                    : "#F0ABFC"
              }
              transparent
              opacity={
                0.2 -
                index * 0.018
              }
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
/* MOUSE WORLD                                            */
/* ====================================================== */

function World({
  reduced,
}: {
  reduced: boolean;
}) {
  const root =
    useRef<THREE.Group | null>(
      null,
    );

  const {
    pointer,
  } =
    useThree();

  useFrame(
    (
      _state,
      delta,
    ) => {
      if (!root.current) {
        return;
      }

      root.current.rotation.y =
        THREE.MathUtils.damp(
          root.current
            .rotation.y,

          pointer.x *
            0.08,

          3,

          delta,
        );

      root.current.rotation.x =
        THREE.MathUtils.damp(
          root.current
            .rotation.x,

          -pointer.y *
            0.05,

          3,

          delta,
        );
    },
  );

  return (
    <group ref={root}>
      <EnergyParticles
        reduced={
          reduced
        }
      />

      <DNAHelix
        reduced={
          reduced
        }
      />

      <CenterPortal
        reduced={
          reduced
        }
      />

      <ChromaticHalo
        reduced={
          reduced
        }
      />
    </group>
  );
}

/* ====================================================== */
/* SCENE                                                  */
/* ====================================================== */

function Scene({
  reduced,
}: {
  reduced: boolean;
}) {
  return (
    <>
      <ambientLight
        intensity={0.07}
      />

      <pointLight
        position={[
          0,
          0,
          5,
        ]}
        intensity={1.3}
        color="#8B5CF6"
      />

      <pointLight
        position={[
          3,
          2,
          3,
        ]}
        intensity={0.42}
        color="#22D3EE"
      />

      <pointLight
        position={[
          -3,
          -1,
          2,
        ]}
        intensity={0.34}
        color="#F0ABFC"
      />

      <World
        reduced={
          reduced
        }
      />
    </>
  );
}


/* ====================================================== */
/* LIGHT STREAKS                                          */
/* ====================================================== */

function LightStreaks({
  reduced,
}: {
  reduced: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        z-[7]
        overflow-hidden
      "
    >
      {Array.from({
        length: 24,
      }).map(
        (
          _,
          index,
        ) => (
          <motion.span
            key={index}
            animate={
              reduced
                ? undefined
                : {
                    y: [
                      "-18vh",
                      "118vh",
                    ],

                    opacity: [
                      0,
                      0.82,
                      0.28,
                      0,
                    ],

                    scaleY: [
                      0.25,
                      1.2,
                      2.2,
                    ],
                  }
            }
            transition={{
              duration:
                1.8 +
                (index % 6) *
                  0.22,

              repeat:
                Infinity,

              delay:
                (index % 10) *
                0.12,

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
              via-violet-100/75
              to-cyan-300/10
              shadow-[0_0_10px_rgba(196,181,253,.5)]
            "
            style={{
              left: `${
                5 +
                (index * 31) %
                  90
              }%`,

              height:
                52 +
                (index % 8) *
                  18,
            }}
          />
        ),
      )}
    </div>
  );
}

/* ====================================================== */
/* MAIN                                                   */
/* ====================================================== */

export default function DNASingularity() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null,
    );

  const reduced =
    Boolean(
      useReducedMotion(),
    );

  const {
    scrollYProgress,
  } = useScroll({
    target:
      sectionRef,

    offset: [
      "start end",
      "end start",
    ],
  });

  const progress =
    useSpring(
      scrollYProgress,
      {
        stiffness: 85,
        damping: 26,
        mass: 0.42,
      },
    );

  /* ==================================================== */
  /* TEXT                                                  */
  /* ==================================================== */

  const copyOpacity =
    useTransform(
      progress,
      [
        0.02,
        0.14,
        0.55,
        0.68,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const copyY =
    useTransform(
      progress,
      [
        0.02,
        0.18,
        0.68,
      ],
      [
        28,
        0,
        -34,
      ],
    );

  /* ==================================================== */
  /* DNA                                                   */
  /* ==================================================== */

  const dnaScale =
    useTransform(
      progress,
      [
        0.02,
        0.55,
        0.92,
      ],
      [
        0.65,
        1.15,
        4.8,
      ],
    );

  const dnaOpacity =
    useTransform(
      progress,
      [
        0,
        0.12,
        0.76,
        0.96,
      ],
      [
        0,
        1,
        0.8,
        0,
      ],
    );

  /* ==================================================== */
  /* PORTAL                                                */
  /* ==================================================== */

  const portalScale =
    useTransform(
      progress,
      [
        0.42,
        0.72,
        0.98,
      ],
      [
        0.45,
        1,
        6.5,
      ],
    );

  const portalOpacity =
    useTransform(
      progress,
      [
        0.35,
        0.65,
        0.9,
        1,
      ],
      [
        0,
        0.5,
        0.8,
        0,
      ],
    );

  /* ==================================================== */
  /* ABOUT REVEAL                                         */
  /* ==================================================== */

  const finalMessageOpacity =
    useTransform(
      progress,
      [
        0.62,
        0.76,
        0.9,
        0.99,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const finalMessageY =
    useTransform(
      progress,
      [
        0.62,
        0.78,
        0.99,
      ],
      [
        28,
        0,
        -25,
      ],
    );

  const auroraOpacity =
    useTransform(
      progress,
      [
        0,
        0.18,
        0.72,
        1,
      ],
      [
        0.25,
        0.62,
        0.5,
        0.18,
      ],
    );

  const cyanOpacity =
    useTransform(
      progress,
      [
        0.08,
        0.38,
        0.82,
        1,
      ],
      [
        0,
        0.22,
        0.34,
        0.08,
      ],
    );

  const streakOpacity =
    useTransform(
      progress,
      [
        0.06,
        0.24,
        0.86,
        1,
      ],
      [
        0,
        0.72,
        0.85,
        0,
      ],
    );

  const flashOpacity =
    useTransform(
      progress,
      [
        0.82,
        0.92,
        0.98,
      ],
      [
        0,
        0.32,
        0,
      ],
    );

  return (
    <section
      ref={sectionRef}
      aria-label="DNA singularity transition"
      className="
        relative
        h-[110vh]
        overflow-hidden
        bg-[#020105]
      "
    >
      <div
        className="
          sticky
          top-0
          h-screen
          overflow-hidden
        "
      >
        {/* ================================================= */}
        {/* BACKGROUND                                        */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-[#020105]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[radial-gradient(circle_at_50%_50%,rgba(109,40,217,.18)_0%,rgba(88,28,135,.08)_25%,transparent_68%)]
          "
        />

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              auroraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[1]
            h-[74vw]
            w-[74vw]
            min-h-[680px]
            min-w-[680px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(124,58,237,.28)_0%,rgba(168,85,247,.15)_24%,rgba(76,29,149,.07)_44%,transparent_72%)]
            blur-[105px]
          "
        />

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              cyanOpacity,
          }}
          className="
            pointer-events-none
            absolute
            right-[-16vw]
            top-[12%]
            z-[1]
            h-[54vw]
            w-[54vw]
            min-h-[520px]
            min-w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(34,211,238,.22)_0%,rgba(59,130,246,.08)_30%,transparent_68%)]
            blur-[125px]
          "
        />

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              auroraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-24vw]
            left-[-14vw]
            z-[1]
            h-[58vw]
            w-[58vw]
            min-h-[540px]
            min-w-[540px]
            rounded-full
            bg-[radial-gradient(circle,rgba(240,171,252,.16)_0%,rgba(217,70,239,.08)_30%,transparent_68%)]
            blur-[140px]
          "
        />

        {/* ================================================= */}
        {/* THREE SCENE                                       */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              dnaOpacity,

            scale:
              dnaScale,
          }}
          className="
            absolute
            inset-0
            z-[2]
            origin-center
          "
        >
          <Canvas
            camera={{
              position: [
                0,
                0,
                8,
              ],
              fov: 48,
              near: 0.1,
              far: 100,
            }}
            dpr={[
              1,
              1.3,
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
                1.12;
            }}
          >
            <Scene
              reduced={
                reduced
              }
            />
          </Canvas>
        </motion.div>

        <motion.div
          style={{
            opacity:
              streakOpacity,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            z-[7]
          "
        >
          <LightStreaks
            reduced={
              reduced
            }
          />
        </motion.div>

        {/* ================================================= */}
        {/* MAIN COPY                                         */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              copyOpacity,

            y:
              copyY,
          }}
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-[13vh]
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
              tracking-[0.42em]
              text-violet-300/45
            "
          >
            Molecular Structure
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
            Data becomes structure.
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-xl
              text-sm
              leading-7
              text-slate-400/75
            "
          >
            Signals converge into biological patterns
            that can be modeled, interpreted and acted upon.
          </p>
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              portalOpacity,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-8vh]
            left-1/2
            z-[8]
            h-[68vh]
            w-[2px]
            -translate-x-1/2
            bg-gradient-to-t
            from-cyan-200/10
            via-violet-100/80
            to-transparent
            shadow-[0_0_14px_rgba(237,233,254,.85),0_0_48px_rgba(139,92,246,.55)]
          "
        />

        {/* ================================================= */}
        {/* PORTAL AURA                                       */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              portalOpacity,

            scale:
              portalScale,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[8]
            h-48
            w-48
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-violet-100/20
            bg-white/[0.035]
            shadow-[0_0_45px_rgba(255,255,255,.28),0_0_100px_rgba(196,181,253,.48),0_0_210px_rgba(34,211,238,.16)]
          "
        />

        <motion.div
          style={{
            opacity:
              finalMessageOpacity,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[29vh]
            left-1/2
            z-20
            -translate-x-1/2
            whitespace-nowrap
            font-mono
            text-[7px]
            font-bold
            uppercase
            tracking-[0.34em]
            text-cyan-200/35
          "
        >
          MODEL SPACE / CONVERGENCE ACTIVE
        </motion.div>

        {/* ================================================= */}
        {/* FINAL MESSAGE                                     */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              finalMessageOpacity,

            y:
              finalMessageY,
          }}
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-[14vh]
            z-20
            mx-auto
            max-w-4xl
            px-6
            text-center
          "
        >
          <p
            className="
              text-[8px]
              font-black
              uppercase
              tracking-[0.42em]
              text-fuchsia-300/40
            "
          >
            Intelligence emerges
          </p>

          <h3
            className="
              mt-3
              text-2xl
              font-black
              tracking-[-0.045em]
              text-white/90
              sm:text-4xl
            "
          >
            From molecular complexity
            to human understanding.
          </h3>
        </motion.div>

        {/* ================================================= */}
        {/* FLASH INTO ABOUT                                  */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              flashOpacity,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            z-30
            bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,.6)_0%,rgba(221,214,254,.18)_10%,rgba(139,92,246,.06)_28%,transparent_60%)]
          "
        />

        {/* ================================================= */}
        {/* BOTTOM BRIDGE                                     */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            z-20
            h-px
            w-[64vw]
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-violet-200/28
            to-transparent
            shadow-[0_0_18px_rgba(196,181,253,.22)]
          "
        />
      </div>
    </section>
  );
}