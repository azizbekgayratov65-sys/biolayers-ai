"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import { Html } from "@react-three/drei";

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
/* GENES                                                  */
/* ====================================================== */

const GENES = [
  "TP53",
  "BRCA1",
  "BRCA2",
  "PTEN",
  "AKT1",
  "MYC",
  "CXCL12",
  "TGFβ",
  "IL6",
  "STAT3",
  "RUNX2",
  "MMP9",
  "CD44",
  "FGF2",
  "COL1A1",
  "PIK3CA",
  "EGFR",
  "KRAS",
  "AR",
  "VEGFA",
  "SMAD3",
  "MAPK1",
  "BCL2",
  "CASP3",
];

type GeneParticle = {
  gene: string;
  position: THREE.Vector3;
  speed: number;
  scale: number;
  opacity: number;
  phase: number;
  driftX: number;
  driftY: number;
};

/* ====================================================== */
/* GENE LABEL                                             */
/* ====================================================== */

function GeneLabel({
  particle,
  reduced,
}: {
  particle: GeneParticle;
  reduced: boolean;
}) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const currentPosition =
    useRef(
      particle.position.clone(),
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

      const time =
        state.clock.elapsedTime;

      if (!reduced) {
        currentPosition.current.z +=
          delta *
          particle.speed;
      }

      if (
        currentPosition.current.z >
        7
      ) {
        currentPosition.current.z =
          -18 -
          Math.random() *
            12;

        currentPosition.current.x =
          THREE.MathUtils.randFloat(
            -8,
            8,
          );

        currentPosition.current.y =
          THREE.MathUtils.randFloat(
            -5,
            5,
          );
      }

      const driftX =
        Math.sin(
          time *
            0.55 +
            particle.phase,
        ) *
        particle.driftX;

      const driftY =
        Math.cos(
          time *
            0.42 +
            particle.phase,
        ) *
        particle.driftY;

      group.position.set(
        currentPosition.current.x +
          driftX,

        currentPosition.current.y +
          driftY,

        currentPosition.current.z,
      );

      group.rotation.z =
        Math.sin(
          time *
            0.35 +
            particle.phase,
        ) *
        0.08;

      const depthFactor =
        THREE.MathUtils.clamp(
          THREE.MathUtils.mapLinear(
            currentPosition.current.z,
            -18,
            7,
            0.4,
            1.8,
          ),
          0.4,
          1.8,
        );

      const targetScale =
        particle.scale *
        depthFactor;

      group.scale.x =
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          7,
          delta,
        );

      group.scale.y =
        THREE.MathUtils.damp(
          group.scale.y,
          targetScale,
          7,
          delta,
        );

      group.scale.z =
        THREE.MathUtils.damp(
          group.scale.z,
          targetScale,
          7,
          delta,
        );
    },
  );

  return (
    <group
      ref={groupRef}
      position={
        particle.position
      }
      scale={
        particle.scale
      }
    >
      <Html
        transform
        center
        distanceFactor={9}
        sprite
        style={{
          pointerEvents:
            "none",
        }}
      >
        <div
          className="
            select-none
            whitespace-nowrap
            font-mono
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-violet-200/70
            drop-shadow-[0_0_8px_rgba(167,139,250,.45)]
          "
          style={{
            opacity:
              particle.opacity,
          }}
        >
          {particle.gene}
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* DATA PARTICLES                                         */
/* ====================================================== */

function DataParticles({
  reduced,
}: {
  reduced: boolean;
}) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const count = 850;

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
        array[i * 3] =
          THREE.MathUtils.randFloat(
            -10,
            10,
          );

        array[
          i * 3 + 1
        ] =
          THREE.MathUtils.randFloat(
            -6,
            6,
          );

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
      const points =
        pointsRef.current;

      if (
        !points ||
        reduced
      ) {
        return;
      }

      const attribute =
        points.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;

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
            1.35 +
            (i % 5) *
              0.15
          );

        if (z > 7) {
          z =
            -22 -
            Math.random() *
              8;

          attribute.setX(
            i,
            THREE.MathUtils.randFloat(
              -10,
              10,
            ),
          );

          attribute.setY(
            i,
            THREE.MathUtils.randFloat(
              -6,
              6,
            ),
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
        color="#A78BFA"
        size={0.028}
        transparent
        opacity={0.48}
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

  const helix =
    useMemo(() => {
      return Array.from({
        length: 38,
      }).map(
        (
          _,
          index,
        ) => {
          const y =
            (index - 18.5) *
            0.24;

          const angle =
            index * 0.48;

          const radius =
            1.15;

          const a =
            new THREE.Vector3(
              Math.cos(angle) *
                radius,
              y,
              Math.sin(angle) *
                radius,
            );

          const b =
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
            );

          return {
            a,
            b,
          };
        },
      );
    }, []);

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

      groupRef.current.rotation.y +=
        delta * 0.22;

      groupRef.current.rotation.z =
        Math.sin(
          state.clock.elapsedTime *
            0.3,
        ) *
        0.08;
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
      scale={0.78}
    >
      {helix.map(
        (
          pair,
          index,
        ) => {
          const strandColor =
            index % 2 === 0
              ? "#A78BFA"
              : "#D8B4FE";

          return (
            <group
              key={index}
            >
              {/* STRAND A */}

              <mesh
                position={
                  pair.a
                }
              >
                <sphereGeometry
                  args={[
                    0.055,
                    12,
                    12,
                  ]}
                />

                <meshBasicMaterial
                  color={
                    strandColor
                  }
                  transparent
                  opacity={0.8}
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
                  pair.b
                }
              >
                <sphereGeometry
                  args={[
                    0.055,
                    12,
                    12,
                  ]}
                />

                <meshBasicMaterial
                  color="#C084FC"
                  transparent
                  opacity={0.7}
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
                position={[
                  (
                    pair.a.x +
                    pair.b.x
                  ) /
                    2,

                  pair.a.y,

                  (
                    pair.a.z +
                    pair.b.z
                  ) /
                    2,
                ]}
              >
                <cylinderGeometry
                  args={[
                    0.012,
                    0.012,
                    pair.a.distanceTo(
                      pair.b,
                    ),
                    6,
                  ]}
                />

                <meshBasicMaterial
                  color="#8B5CF6"
                  transparent
                  opacity={0.18}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={
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
/* MOUSE FIELD                                            */
/* ====================================================== */

function MouseGravityField() {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const { pointer } =
    useThree();

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

      const targetX =
        pointer.x *
        0.45;

      const targetY =
        pointer.y *
        0.28;

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          targetX,
          3,
          delta,
        );

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          -targetY,
          3,
          delta,
        );
    },
  );

  return (
    <group ref={groupRef}>
      <DataStormContent />
    </group>
  );
}

/* ====================================================== */
/* DATA CONTENT                                           */
/* ====================================================== */

function DataStormContent() {
  const reduced =
    Boolean(
      useReducedMotion(),
    );

  const particles =
    useMemo<
      GeneParticle[]
    >(
      () =>
        Array.from({
          length: 48,
        }).map(
          (
            _,
            index,
          ) => ({
            gene:
              GENES[
                index %
                  GENES.length
              ],

            position:
              new THREE.Vector3(
                THREE.MathUtils.randFloat(
                  -7.5,
                  7.5,
                ),

                THREE.MathUtils.randFloat(
                  -4.4,
                  4.4,
                ),

                THREE.MathUtils.randFloat(
                  -20,
                  4,
                ),
              ),

            speed:
              THREE.MathUtils.randFloat(
                0.75,
                2,
              ),

            scale:
              THREE.MathUtils.randFloat(
                0.7,
                1.4,
              ),

            opacity:
              THREE.MathUtils.randFloat(
                0.35,
                0.95,
              ),

            phase:
              Math.random() *
              Math.PI *
              2,

            driftX:
              THREE.MathUtils.randFloat(
                0.05,
                0.35,
              ),

            driftY:
              THREE.MathUtils.randFloat(
                0.04,
                0.28,
              ),
          }),
        ),
      [],
    );

  return (
    <>
      <DataParticles
        reduced={
          reduced
        }
      />

      {particles.map(
        (
          particle,
          index,
        ) => (
          <GeneLabel
            key={`${particle.gene}-${index}`}
            particle={
              particle
            }
            reduced={
              reduced
            }
          />
        ),
      )}
    </>
  );
}

/* ====================================================== */
/* STORM SCENE                                            */
/* ====================================================== */

function StormScene() {
  return (
    <>
      <ambientLight
        intensity={0.1}
      />

      <pointLight
        position={[
          0,
          2,
          6,
        ]}
        intensity={1}
        color="#8B5CF6"
      />

      <pointLight
        position={[
          -4,
          -2,
          1,
        ]}
        intensity={0.35}
        color="#C026D3"
      />

      <MouseGravityField />
    </>
  );
}

/* ====================================================== */
/* MAIN                                                   */
/* ====================================================== */

export default function GeneDataStorm() {
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
        stiffness: 90,
        damping: 28,
        mass: 0.45,
      },
    );

  /* MAIN COPY */

  const copyOpacity =
    useTransform(
      progress,
      [
        0.02,
        0.12,
        0.54,
        0.67,
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
        0.67,
      ],
      [
        28,
        0,
        -32,
      ],
    );

  /* DATA UNIVERSE */

  const tunnelOpacity =
    useTransform(
      progress,
      [
        0,
        0.12,
        0.66,
        0.94,
      ],
      [
        0.25,
        0.8,
        0.65,
        0.08,
      ],
    );

  /* DNA TRANSITION */

  const dnaOpacity =
    useTransform(
      progress,
      [
        0.5,
        0.64,
        0.86,
        0.98,
      ],
      [
        0,
        1,
        1,
        0.25,
      ],
    );

  const dnaScale =
    useTransform(
      progress,
      [
        0.52,
        0.74,
        0.98,
      ],
      [
        0.45,
        1,
        1.65,
      ],
    );

  const dnaY =
    useTransform(
      progress,
      [
        0.52,
        0.78,
        1,
      ],
      [
        100,
        0,
        -70,
      ],
    );

  const dnaCopyOpacity =
    useTransform(
      progress,
      [
        0.58,
        0.7,
        0.88,
        0.98,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const dnaCopyY =
    useTransform(
      progress,
      [
        0.58,
        0.75,
        0.98,
      ],
      [
        28,
        0,
        -26,
      ],
    );

  const finalGlow =
    useTransform(
      progress,
      [
        0.58,
        0.82,
        1,
      ],
      [
        0,
        0.18,
        0,
      ],
    );

  return (
    <section
      ref={sectionRef}
      aria-label="BioLayers Molecular Data Storm"
      className="
        relative
        h-[125vh]
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
        {/* BACKGROUND */}

        <div
          className="
            absolute
            inset-0
            bg-[#020105]
          "
        />

        {/* DATA GLOW */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              tunnelOpacity,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[1]
            h-[58vw]
            w-[58vw]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(88,28,135,.13)_0%,rgba(76,29,149,.065)_24%,rgba(30,27,75,.03)_42%,transparent_70%)]
            blur-[115px]
          "
        />

        {/* 3D DATA UNIVERSE */}

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
              fov: 52,
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
                1;
            }}
          >
            <StormScene />
          </Canvas>
        </div>

        {/* MAIN COPY */}

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
            top-[10vh]
            z-20
            mx-auto
            max-w-5xl
            px-6
            text-center
          "
        >
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.4em]
              text-violet-300/55
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
              lg:text-[76px]
            "
          >
            Biology is not static.

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
              It is a data universe.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-slate-400
              sm:text-base
            "
          >
            Genes, pathways, signals and molecular evidence
            move through a shared computational space.
          </p>

          <p
            className="
              mt-3
              text-[9px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-violet-300/25
            "
          >
            Move your mouse through the data
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* DNA TRANSITION                                    */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              finalGlow,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-10%]
            left-1/2
            z-[6]
            h-[52vw]
            w-[52vw]
            min-h-[480px]
            min-w-[480px]
            -translate-x-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(139,92,246,.14)_0%,rgba(126,34,206,.065)_28%,transparent_68%)]
            blur-[90px]
          "
        />

        <motion.div
          style={{
            opacity:
              dnaOpacity,

            scale:
              dnaScale,

            y:
              dnaY,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[13vh]
            left-1/2
            z-[12]
            h-[230px]
            w-[650px]
            max-w-[90vw]
            -translate-x-1/2
          "
        >
          <Canvas
            camera={{
              position: [
                0,
                0,
                7,
              ],
              fov: 48,
            }}
            dpr={[
              1,
              1.25,
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
            }}
          >
            <DNAHelix
              reduced={
                reduced
              }
            />
          </Canvas>
        </motion.div>

        {/* DNA COPY */}

        <motion.div
          style={{
            opacity:
              dnaCopyOpacity,

            y:
              dnaCopyY,
          }}
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-[7vh]
            z-20
            mx-auto
            max-w-3xl
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
              text-violet-300/45
            "
          >
            From signal to structure
          </p>

          <h3
            className="
              mt-3
              text-xl
              font-black
              tracking-[-0.04em]
              text-white/90
              sm:text-3xl
            "
          >
            Decode the layers of life.
          </h3>
        </motion.div>

        {/* SIDE COORDINATES */}

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
            tracking-[0.24em]
            text-violet-300/15
            lg:block
          "
        >
          GENOMIC SPACE / 10⁻⁹ M
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
            tracking-[0.24em]
            text-violet-300/15
            lg:block
          "
        >
          BIOLOGICAL SIGNAL / ACTIVE
        </div>

        {/* BOTTOM CONNECTION */}

        <motion.div
          aria-hidden="true"
          animate={
            reduced
              ? undefined
              : {
                  opacity: [
                    0.1,
                    0.38,
                    0.1,
                  ],

                  scaleX: [
                    0.65,
                    1,
                    0.65,
                  ],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease:
              "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            z-[25]
            h-px
            w-[66vw]
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-violet-300/35
            to-transparent
            shadow-[0_0_20px_rgba(167,139,250,.25)]
          "
        />
      </div>
    </section>
  );
}