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
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

/* ====================================================== */
/* CONFIG                                                 */
/* ====================================================== */

const PARTICLE_COUNT = 1200;
const RING_COUNT = 8;

/* ====================================================== */
/* WARP PARTICLES                                         */
/* ====================================================== */

function WarpParticles({
  reduced,
}: {
  reduced: boolean;
}) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const positions =
    useMemo(() => {
      const array =
        new Float32Array(
          PARTICLE_COUNT * 3,
        );

      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {
        const angle =
          Math.random() *
          Math.PI *
          2;

        const radius =
          THREE.MathUtils.randFloat(
            0.5,
            8.5,
          );

        array[i * 3] =
          Math.cos(angle) *
          radius;

        array[
          i * 3 + 1
        ] =
          Math.sin(angle) *
          radius *
          0.65;

        array[
          i * 3 + 2
        ] =
          THREE.MathUtils.randFloat(
            -22,
            6,
          );
      }

      return array;
    }, []);

  useFrame(
    (
      _state,
      delta,
    ) => {
      if (
        reduced ||
        !pointsRef.current
      ) {
        return;
      }

      const attribute =
        pointsRef.current.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;

      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {
        let z =
          attribute.getZ(i);

        z +=
          delta *
          (
            2.8 +
            (i % 7) *
              0.38
          );

        if (z > 6) {
          const angle =
            Math.random() *
            Math.PI *
            2;

          const radius =
            THREE.MathUtils.randFloat(
              0.5,
              8.5,
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
              0.65,
          );

          z =
            THREE.MathUtils.randFloat(
              -22,
              -14,
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
        size={0.036}
        color="#C4B5FD"
        transparent
        opacity={0.65}
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
/* ENERGY RINGS                                           */
/* ====================================================== */

function EnergyRings({
  reduced,
}: {
  reduced: boolean;
}) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const rings =
    useMemo(
      () =>
        Array.from({
          length:
            RING_COUNT,
        }).map(
          (
            _,
            index,
          ) => ({
            radius:
              1 +
              index *
                0.72,

            z:
              -2 -
              index *
                1.5,

            rotation:
              index *
              0.3,
          }),
        ),
      [],
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
        delta * 0.035;

      groupRef.current.rotation.y =
        Math.sin(
          state.clock.elapsedTime *
            0.22,
        ) *
        0.08;
    },
  );

  return (
    <group
      ref={groupRef}
    >
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
              1.15,
              0,
              ring.rotation,
            ]}
          >
            <torusGeometry
              args={[
                ring.radius,
                0.014,
                8,
                120,
              ]}
            />

            <meshBasicMaterial
              color={
                index % 3 === 0
                  ? "#C084FC"
                  : index % 3 === 1
                    ? "#7C3AED"
                    : "#22D3EE"
              }
              transparent
              opacity={
                0.22 -
                index *
                  0.014
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
/* ENERGY LINES                                           */
/* ====================================================== */

function EnergyLines({
  reduced,
}: {
  reduced: boolean;
}) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const lines =
    useMemo(() => {
      return Array.from({
        length: 38,
      }).map(
        (
          _,
          index,
        ) => {
          const angle =
            (
              index /
              38
            ) *
            Math.PI *
            2;

          const radius =
            THREE.MathUtils.randFloat(
              2.5,
              8,
            );

          const start =
            new THREE.Vector3(
              Math.cos(angle) *
                radius,

              Math.sin(angle) *
                radius *
                0.65,

              THREE.MathUtils.randFloat(
                -16,
                -5,
              ),
            );

          const end =
            new THREE.Vector3(
              Math.cos(angle) *
                0.22,

              Math.sin(angle) *
                0.16,

              THREE.MathUtils.randFloat(
                1,
                4,
              ),
            );

          const geometry =
            new THREE.BufferGeometry()
              .setFromPoints([
                start,
                end,
              ]);

          return {
            geometry,
            index,
          };
        },
      );
    }, []);

  useEffect(() => {
    return () => {
      lines.forEach(
        ({ geometry }) => {
          geometry.dispose();
        },
      );
    };
  }, [lines]);

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
        delta * 0.02;

      groupRef.current.rotation.x =
        Math.sin(
          state.clock.elapsedTime *
            0.18,
        ) *
        0.05;
    },
  );

  return (
    <group
      ref={groupRef}
    >
      {lines.map(
        (
          item,
          index,
        ) => {
          const material =
            new THREE.LineBasicMaterial({
              color:
                index %
                    3 ===
                  0
                  ? "#C084FC"
                  : index %
                        3 ===
                      1
                    ? "#6366F1"
                    : "#22D3EE",

              transparent:
                true,

              opacity:
                0.1 +
                (
                  index %
                  5
                ) *
                  0.03,

              blending:
                THREE.AdditiveBlending,

              depthWrite:
                false,

              toneMapped:
                false,
            });

          const line =
            new THREE.Line(
              item.geometry,
              material,
            );

          return (
            <primitive
              key={index}
              object={line}
            />
          );
        },
      )}
    </group>
  );
}

/* ====================================================== */
/* CORE                                                   */
/* ====================================================== */

function PortalCore({
  reduced,
}: {
  reduced: boolean;
}) {
  const coreRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const ringA =
    useRef<THREE.Mesh | null>(
      null,
    );

  const ringB =
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
        coreRef.current
      ) {
        const pulse =
          reduced
            ? 1
            : 1 +
              Math.sin(
                time *
                  2.6,
              ) *
                0.12;

        coreRef.current.scale.setScalar(
          THREE.MathUtils.damp(
            coreRef.current.scale.x,
            pulse,
            8,
            delta,
          ),
        );
      }

      if (
        !reduced &&
        ringA.current
      ) {
        ringA.current.rotation.z +=
          delta * 0.42;
      }

      if (
        !reduced &&
        ringB.current
      ) {
        ringB.current.rotation.z -=
          delta * 0.3;
      }
    },
  );

  return (
    <group>
      <mesh
        ref={coreRef}
      >
        <sphereGeometry
          args={[
            0.22,
            36,
            36,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={1}
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
          1.1,
          0.2,
          0,
        ]}
      >
        <torusGeometry
          args={[
            1.25,
            0.02,
            10,
            160,
          ]}
        />

        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.4}
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
            1.95,
            0.012,
            10,
            180,
          ]}
        />

        <meshBasicMaterial
          color="#22D3EE"
          transparent
          opacity={0.18}
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
/* WORLD                                                  */
/* ====================================================== */

function World({
  reduced,
}: {
  reduced: boolean;
}) {
  const ref =
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
      if (!ref.current) {
        return;
      }

      ref.current.rotation.y =
        THREE.MathUtils.damp(
          ref.current.rotation.y,
          pointer.x *
            0.08,
          3,
          delta,
        );

      ref.current.rotation.x =
        THREE.MathUtils.damp(
          ref.current.rotation.x,
          -pointer.y *
            0.05,
          3,
          delta,
        );
    },
  );

  return (
    <group ref={ref}>
      <WarpParticles
        reduced={reduced}
      />

      <EnergyRings
        reduced={reduced}
      />

      <EnergyLines
        reduced={reduced}
      />

      <PortalCore
        reduced={reduced}
      />
    </group>
  );
}

/* ====================================================== */
/* THREE SCENE                                            */
/* ====================================================== */

function Scene({
  reduced,
}: {
  reduced: boolean;
}) {
  return (
    <>
      <ambientLight
        intensity={0.09}
      />

      <pointLight
        position={[
          0,
          0,
          5,
        ]}
        intensity={1.2}
        color="#8B5CF6"
      />

      <pointLight
        position={[
          3,
          1,
          2,
        ]}
        intensity={0.4}
        color="#22D3EE"
      />

      <World
        reduced={reduced}
      />
    </>
  );
}

/* ====================================================== */
/* CSS SPEED STREAKS                                      */
/* ====================================================== */

function SpeedStreaks({
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
        z-[8]
        overflow-hidden
      "
    >
      {Array.from({
        length: 26,
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
                      "-15vh",
                      "115vh",
                    ],

                    opacity: [
                      0,
                      0.75,
                      0.4,
                      0,
                    ],

                    scaleY: [
                      0.3,
                      1,
                      1.8,
                    ],
                  }
            }
            transition={{
              duration:
                1.7 +
                (
                  index %
                  6
                ) *
                  0.2,

              repeat:
                Infinity,

              delay:
                (
                  index %
                  9
                ) *
                0.14,

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
              via-violet-100/70
              to-cyan-300/10
              shadow-[0_0_9px_rgba(196,181,253,.42)]
            "
            style={{
              left: `${
                6 +
                (
                  index *
                  29
                ) %
                  88
              }%`,

              height:
                55 +
                (
                  index %
                  7
                ) *
                  17,
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

export default function GlobalToMolecular() {
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
        stiffness: 95,
        damping: 26,
        mass: 0.38,
      },
    );

  /* ==================================================== */
  /* FIRST COPY                                           */
  /* ==================================================== */

  const firstOpacity =
    useTransform(
      progress,
      [
        0.02,
        0.1,
        0.36,
        0.48,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const firstY =
    useTransform(
      progress,
      [
        0.02,
        0.18,
        0.48,
      ],
      [
        24,
        0,
        -28,
      ],
    );

  /* ==================================================== */
  /* SECOND COPY                                          */
  /* ==================================================== */

  const secondOpacity =
    useTransform(
      progress,
      [
        0.35,
        0.48,
        0.75,
        0.91,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const secondY =
    useTransform(
      progress,
      [
        0.35,
        0.58,
        0.91,
      ],
      [
        26,
        0,
        -30,
      ],
    );

  /* ==================================================== */
  /* BACKGROUND                                           */
  /* ==================================================== */

  const violetOpacity =
    useTransform(
      progress,
      [
        0,
        0.22,
        0.72,
        1,
      ],
      [
        0.25,
        0.55,
        0.45,
        0.2,
      ],
    );

  const cyanOpacity =
    useTransform(
      progress,
      [
        0.1,
        0.45,
        0.8,
        1,
      ],
      [
        0,
        0.16,
        0.28,
        0.08,
      ],
    );

  /* ==================================================== */
  /* CORE                                                 */
  /* ==================================================== */

  const coreScale =
    useTransform(
      progress,
      [
        0,
        0.58,
        0.94,
      ],
      [
        0.75,
        1,
        4,
      ],
    );

  const coreOpacity =
    useTransform(
      progress,
      [
        0,
        0.12,
        0.82,
        0.97,
      ],
      [
        0.3,
        1,
        0.85,
        0,
      ],
    );

  /* ==================================================== */
  /* STREAKS                                              */
  /* ==================================================== */

  const streakOpacity =
    useTransform(
      progress,
      [
        0,
        0.16,
        0.84,
        1,
      ],
      [
        0.2,
        0.8,
        0.8,
        0,
      ],
    );

  /* ==================================================== */
  /* FLASH                                                */
  /* ==================================================== */

  const flashOpacity =
    useTransform(
      progress,
      [
        0.74,
        0.86,
        0.95,
      ],
      [
        0,
        0.22,
        0,
      ],
    );

  return (
    <section
      ref={sectionRef}
      aria-label="Global to Molecular transition"
      className="
        relative
        h-[105vh]
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
        {/* BASE                                              */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-[#020105]
          "
        />

        {/* ================================================= */}
        {/* VIOLET AURORA                                     */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              violetOpacity,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[1]
            h-[76vw]
            w-[76vw]
            min-h-[680px]
            min-w-[680px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(124,58,237,.25)_0%,rgba(91,33,182,.15)_22%,rgba(76,29,149,.065)_42%,transparent_70%)]
            blur-[100px]
          "
        />

        {/* ================================================= */}
        {/* CYAN AURORA                                       */}
        {/* ================================================= */}

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
            top-[14%]
            z-[1]
            h-[52vw]
            w-[52vw]
            min-h-[520px]
            min-w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(34,211,238,.22)_0%,rgba(59,130,246,.08)_30%,transparent_68%)]
            blur-[125px]
          "
        />

        {/* ================================================= */}
        {/* MAGENTA AURORA                                    */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              violetOpacity,
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
            bg-[radial-gradient(circle,rgba(217,70,239,.17)_0%,rgba(126,34,206,.065)_30%,transparent_68%)]
            blur-[140px]
          "
        />

        {/* ================================================= */}
        {/* THREE.JS WARP TUNNEL                              */}
        {/* ================================================= */}

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
                0,
                8,
              ],
              fov: 50,
              near: 0.1,
              far: 100,
            }}
            dpr={[
              1,
              1.35,
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
            <Scene
              reduced={reduced}
            />
          </Canvas>
        </div>

        {/* ================================================= */}
        {/* CSS SPEED STREAKS                                 */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              streakOpacity,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            z-[6]
          "
        >
          <SpeedStreaks
            reduced={reduced}
          />
        </motion.div>

        {/* ================================================= */}
        {/* CORE AURA                                         */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              coreOpacity,

            scale:
              coreScale,
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
            border-violet-200/20
            bg-white/[0.018]
            shadow-[0_0_35px_rgba(255,255,255,.18),0_0_85px_rgba(167,139,250,.38),0_0_170px_rgba(34,211,238,.12)]
            backdrop-blur-xl
          "
        />

        {/* ================================================= */}
        {/* FIRST MESSAGE                                     */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              firstOpacity,

            y:
              firstY,
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

          <div
            className="
              mx-auto
              mt-5
              h-px
              w-28
              bg-gradient-to-r
              from-transparent
              via-violet-200/55
              to-transparent
            "
          />
        </motion.div>

        {/* ================================================= */}
        {/* SECOND MESSAGE                                    */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              secondOpacity,

            y:
              secondY,
          }}
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-[56vh]
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
              tracking-[0.44em]
              text-fuchsia-200/50
            "
          >
            To molecular scale
          </p>

          <h3
            className="
              mt-4
              text-3xl
              font-black
              tracking-[-0.055em]
              text-white
              sm:text-5xl
              lg:text-[62px]
            "
          >
            One biological language.
          </h3>

          <p
            className="
              mx-auto
              mt-5
              max-w-xl
              text-sm
              leading-7
              text-slate-300/75
            "
          >
            Every tumor is different.
            Every signal leaves data.
            Every layer can be connected.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* SIDE HUD                                          */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-7
            left-7
            z-20
            hidden
            font-mono
            text-[7px]
            uppercase
            tracking-[0.3em]
            text-cyan-200/25
            lg:block
          "
        >
          SCALE SHIFT / ACTIVE
        </div>

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-7
            right-7
            z-20
            hidden
            font-mono
            text-[7px]
            uppercase
            tracking-[0.3em]
            text-fuchsia-200/20
            lg:block
          "
        >
          MOLECULAR CHANNEL / OPEN
        </div>

        {/* ================================================= */}
        {/* FINAL FLASH                                       */}
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
            bg-[radial-gradient(circle_at_50%_52%,rgba(255,255,255,.64)_0%,rgba(196,181,253,.18)_10%,rgba(34,211,238,.08)_22%,rgba(161,92,255,.05)_38%,transparent_62%)]
          "
        />

        {/* ================================================= */}
        {/* BOTTOM SEAM                                       */}
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
            w-[72vw]
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-cyan-200/22
            via-violet-200/35
            to-transparent
            shadow-[0_0_24px_rgba(167,139,250,.26)]
          "
        />
      </div>
    </section>
  );
}