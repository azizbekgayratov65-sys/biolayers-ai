"use client";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import {
  useRef,
} from "react";

import * as THREE from "three";

import Earth from "./Earth";
import Atmosphere from "./Atmosphere";
import Clouds from "./Clouds";
import CityLights from "./CityLights";
import OrbitSystem from "./OrbitSystem";
import PlanetCamera from "./PlanetCamera";
import Stars from "./Stars";
import CountryBorders from "./CountryBorders";

type SceneProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

function RotatingEarthSystem({
  reduced,
}: {
  reduced: boolean;
}) {
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
      x:
        THREE.MathUtils.degToRad(
          -11,
        ),

      y:
        THREE.MathUtils.degToRad(
          -64.6,
        ),
    });

  const velocityRef =
    useRef({
      x: 0,
      y: 0,
    });

  const lastMoveTimeRef =
    useRef(0);

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

      /*
       * Slow automatic rotation.
       */

      if (
        !draggingRef.current &&
        !reduced
      ) {
        rotationRef.current.y +=
          delta * 0.026;
      }

      /*
       * Momentum after mouse release.
       */

      if (
        !draggingRef.current &&
        !reduced
      ) {
        rotationRef.current.y +=
          velocityRef.current.y *
          delta;

        rotationRef.current.x +=
          velocityRef.current.x *
          delta;

        velocityRef.current.y =
          THREE.MathUtils.damp(
            velocityRef.current.y,
            0,
            4.4,
            delta,
          );

        velocityRef.current.x =
          THREE.MathUtils.damp(
            velocityRef.current.x,
            0,
            4.4,
            delta,
          );
      }

      /*
       * Prevent vertical flipping.
       */

      rotationRef.current.x =
        THREE.MathUtils.clamp(
          rotationRef.current.x,

          THREE.MathUtils.degToRad(
            -68,
          ),

          THREE.MathUtils.degToRad(
            68,
          ),
        );

      /*
       * Tiny cinematic breathing.
       */

      const livingRoll =
        reduced ||
        draggingRef.current
          ? 0
          : Math.sin(
              time * 0.055,
            ) *
            0.006;

      /*
       * Apply rotation smoothly.
       */

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          rotationRef.current.x,
          draggingRef.current
            ? 17
            : 8,
          delta,
        );

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          rotationRef.current.y,
          draggingRef.current
            ? 17
            : 8,
          delta,
        );

      group.rotation.z =
        THREE.MathUtils.damp(
          group.rotation.z,
          livingRoll,
          3,
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
        "grab";
    }
  }

  return (
    <group
      ref={groupRef}
    >
      {/*
       * Invisible interaction sphere.
       */}

      <mesh
        onPointerDown={(
          event,
        ) => {
          event.stopPropagation();

          draggingRef.current =
            true;

          pointerRef.current.x =
            event.clientX;

          pointerRef.current.y =
            event.clientY;

          velocityRef.current.x =
            0;

          velocityRef.current.y =
            0;

          lastMoveTimeRef.current =
            performance.now();

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
            !draggingRef.current
          ) {
            return;
          }

          event.stopPropagation();

          const currentX =
            event.clientX;

          const currentY =
            event.clientY;

          const deltaX =
            currentX -
            pointerRef.current.x;

          const deltaY =
            currentY -
            pointerRef.current.y;

          const now =
            performance.now();

          const elapsed =
            Math.max(
              8,
              now -
                lastMoveTimeRef.current,
            );

          pointerRef.current.x =
            currentX;

          pointerRef.current.y =
            currentY;

          lastMoveTimeRef.current =
            now;

          /*
           * Drag sensitivity.
           */

          const horizontalSpeed =
            0.006;

          const verticalSpeed =
            0.005;

          rotationRef.current.y +=
            deltaX *
            horizontalSpeed;

          rotationRef.current.x +=
            deltaY *
            verticalSpeed;

          /*
           * Inertia velocity.
           */

          const frameScale =
            16.67 /
            elapsed;

          velocityRef.current.y =
            THREE.MathUtils.clamp(
              deltaX *
                0.11 *
                frameScale,
              -2.2,
              2.2,
            );

          velocityRef.current.x =
            THREE.MathUtils.clamp(
              deltaY *
                0.085 *
                frameScale,
              -1.6,
              1.6,
            );
        }}
        onPointerUp={(
          event,
        ) => {
          event.stopPropagation();

          endDrag();
        }}
        onPointerCancel={() => {
          endDrag();
        }}
        onPointerEnter={() => {
          if (
            typeof document ===
            "undefined"
          ) {
            return;
          }

          if (
            !draggingRef.current
          ) {
            document.body.style.cursor =
              "grab";
          }
        }}
        onPointerLeave={() => {
          if (
            typeof document ===
            "undefined"
          ) {
            return;
          }

          if (
            !draggingRef.current
          ) {
            document.body.style.cursor =
              "default";
          }
        }}
      >
        <sphereGeometry
          args={[
            2.54,
            48,
            48,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>

      {/*
       * Planet surface.
       *
       * Individual layers no longer
       * rotate independently because
       * this parent group controls
       * the whole planet.
       */}

      <Earth
        reduced={true}
      />

      {/*
       * Real country boundaries.
       *
       * This replaces CountryFlags
       * and UzbekistanMarker.
       */}

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

function Scene({
  progress,
  reduced,
}: SceneProps) {
  return (
    <>
      <ambientLight
        intensity={0.075}
      />

      <directionalLight
        position={[
          5,
          2,
          6,
        ]}
        intensity={1.08}
        color="#EDE9FE"
      />

      <pointLight
        position={[
          -4,
          -2,
          3,
        ]}
        intensity={0.23}
        color="#4F46E5"
      />

      <pointLight
        position={[
          4,
          1,
          1,
        ]}
        intensity={0.18}
        color="#A21CAF"
      />

      <Stars
        reduced={reduced}
      />

      <RotatingEarthSystem
        reduced={reduced}
      />

      <OrbitSystem
        reduced={reduced}
      />

      <PlanetCamera
        progress={progress}
        reduced={reduced}
      />
    </>
  );
}

export default function PlanetScene() {
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
        stiffness: 72,
        damping: 26,
        mass: 0.48,
      },
    );

  /*
   * Heading
   */

  const copyOpacity =
    useTransform(
      progress,

      [
        0.08,
        0.22,
        0.58,
        0.78,
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
        0.08,
        0.28,
        0.72,
      ],

      [
        40,
        0,
        -24,
      ],
    );

  /*
   * Core transition.
   */

  const coreOpacity =
    useTransform(
      progress,

      [
        0.56,
        0.7,
        0.94,
      ],

      [
        0,
        0.78,
        0,
      ],
    );

  const coreScale =
    useTransform(
      progress,

      [
        0.56,
        0.76,
        1,
      ],

      [
        0.2,
        1,
        4.2,
      ],
    );

  /*
   * Background atmosphere.
   */

  const violetAuraOpacity =
    useTransform(
      progress,

      [
        0.1,
        0.45,
        0.8,
      ],

      [
        0.10,
        0.32,
        0.14,
      ],
    );

  const magentaAuraOpacity =
    useTransform(
      progress,

      [
        0.22,
        0.56,
        0.86,
      ],

      [
        0,
        0.18,
        0.05,
      ],
    );

  /*
   * Energy horizon.
   */

  const beamOpacity =
    useTransform(
      progress,

      [
        0.58,
        0.69,
        0.82,
        0.94,
      ],

      [
        0,
        0.26,
        0.12,
        0,
      ],
    );

  const beamScaleX =
    useTransform(
      progress,

      [
        0.58,
        0.72,
        0.92,
      ],

      [
        0.08,
        1,
        1.2,
      ],
    );

  /*
   * Core orbit rotation.
   */

  const ringRotate =
    useTransform(
      progress,

      [
        0,
        1,
      ],

      [
        0,
        360,
      ],
    );

  return (
    <section
      ref={sectionRef}
      id="team"
      aria-label="BioLayers Planetary Network"
      className="
        relative
        z-40
        min-h-[190vh]
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
        {/*
         * Dark base.
         */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[#020105]
          "
        />

        {/*
         * Restrained indigo atmosphere.
         */}

        <motion.div
          style={{
            opacity:
              violetAuraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            -left-[20vw]
            top-[6vh]
            z-[1]
            h-[64vw]
            w-[64vw]
            rounded-full
            bg-indigo-700/[0.08]
            blur-[190px]
          "
        />

        {/*
         * Restrained magenta atmosphere.
         */}

        <motion.div
          style={{
            opacity:
              magentaAuraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            -right-[18vw]
            top-[18vh]
            z-[1]
            h-[60vw]
            w-[60vw]
            rounded-full
            bg-fuchsia-700/[0.06]
            blur-[200px]
          "
        />

        {/*
         * Center depth.
         */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[radial-gradient(circle_at_50%_52%,rgba(76,29,149,.055),transparent_25%,rgba(30,27,75,.035)_42%,transparent_72%)]
          "
        />

        {/*
         * Three.js world.
         */}

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
              far: 80,
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
          >
            <Scene
              progress={progress}
              reduced={reduced}
            />
          </Canvas>
        </div>

        {/*
         * Main heading.
         */}

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
            top-20
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
              tracking-[0.38em]
              text-violet-300/50
            "
          >
            BioLayers Planetary Network
          </p>

          <h2
            className="
              mt-5
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
                from-indigo-300
                via-violet-200
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
              mt-6
              max-w-2xl
              text-sm
              leading-7
              text-slate-400/75
              sm:text-base
            "
          >
            Research, artificial intelligence,
            engineering and medicine orbit a
            shared BioLayers core.
          </p>

          <p
            className="
              mx-auto
              mt-4
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-violet-300/28
            "
          >
            Drag the planet to explore
          </p>
        </motion.div>

        {/*
         * Fine horizon line.
         */}

        <motion.div
          style={{
            opacity:
              beamOpacity,

            scaleX:
              beamScaleX,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[8]
            h-px
            w-[76vw]
            -translate-x-1/2
            -translate-y-1/2
            bg-gradient-to-r
            from-transparent
            via-violet-300/35
            to-transparent
            shadow-[0_0_12px_rgba(167,139,250,.22)]
          "
        />

        {/*
         * Transition core.
         */}

        <motion.div
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
            z-10
            h-36
            w-36
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-violet-400/15
            bg-violet-950/[0.12]
            shadow-[0_0_28px_rgba(124,58,237,.18),0_0_70px_rgba(168,85,247,.11)]
            backdrop-blur-lg
          "
        >
          <motion.div
            style={{
              rotate:
                ringRotate,
            }}
            className="
              absolute
              -inset-6
              rounded-full
              border
              border-dashed
              border-indigo-400/16
            "
          />

          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    rotate:
                      -360,
                  }
            }
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              inset-3
              rounded-full
              border
              border-fuchsia-300/12
            "
          />

          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    scale: [
                      0.9,
                      1.06,
                      0.9,
                    ],

                    opacity: [
                      0.5,
                      0.78,
                      0.5,
                    ],
                  }
            }
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              inset-[50px]
              rounded-full
              bg-violet-200/85
              shadow-[0_0_12px_rgba(221,214,254,.6),0_0_30px_rgba(167,139,250,.28),0_0_58px_rgba(126,34,206,.16)]
            "
          />
        </motion.div>

        {/*
         * Scroll cue.
         */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-8
            left-1/2
            z-20
            -translate-x-1/2
            text-center
          "
        >
          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-violet-300/30
            "
          >
            Scroll to enter the core
          </p>

          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    y: [
                      0,
                      7,
                      0,
                    ],

                    opacity: [
                      0.18,
                      0.52,
                      0.18,
                    ],
                  }
            }
            transition={{
              duration: 2.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              mx-auto
              mt-3
              h-8
              w-px
              bg-gradient-to-b
              from-violet-300/38
              via-fuchsia-300/20
              to-transparent
            "
          />
        </div>
      </div>
    </section>
  );
}