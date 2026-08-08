"use client";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  motion,
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
import CountryBorders from "./CountryBorders";

import {
  CountryFocusProvider,
  useCountryFocus,
} from "./CountryFocus";

import OrbitSystem from "./OrbitSystem";
import PlanetCamera from "./PlanetCamera";
import Stars from "./Stars";

/* ====================================================== */
/* TYPES                                                  */
/* ====================================================== */

type SceneProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

/* ====================================================== */
/* INTERACTIVE EARTH                                      */
/* ====================================================== */

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

      /* ================================================== */
      /* COUNTRY FOCUS                                     */
      /* ================================================== */

      if (
        focusedCountry
      ) {
        draggingRef.current =
          false;

        velocityRef.current.x =
          THREE.MathUtils.damp(
            velocityRef.current.x,
            0,
            10,
            delta,
          );

        velocityRef.current.y =
          THREE.MathUtils.damp(
            velocityRef.current.y,
            0,
            10,
            delta,
          );

        const targetY =
          THREE.MathUtils.degToRad(
            -focusedCountry.longitude,
          );

        const targetX =
          THREE.MathUtils.degToRad(
            focusedCountry.latitude,
          );

        const currentY =
          rotationRef.current.y;

        let deltaAngle =
          targetY -
          currentY;

        deltaAngle =
          THREE.MathUtils.euclideanModulo(
            deltaAngle +
              Math.PI,
            Math.PI * 2,
          ) -
          Math.PI;

        const resolvedTargetY =
          currentY +
          deltaAngle;

        rotationRef.current.y =
          THREE.MathUtils.damp(
            rotationRef.current.y,
            resolvedTargetY,
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
        /* ================================================ */
        /* NORMAL DRAG / INERTIA                            */
        /* ================================================ */

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

          if (!reduced) {
            rotationRef.current.y +=
              delta *
              0.028;
          }
        }

        rotationRef.current.x =
          THREE.MathUtils.clamp(
            rotationRef.current.x,
            -1.15,
            1.15,
          );
      }

      /* ================================================== */
      /* APPLY ROTATION                                    */
      /* ================================================== */

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          rotationRef.current.x,
          focusedCountry
            ? 7
            : 9,
          delta,
        );

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          rotationRef.current.y,
          focusedCountry
            ? 7
            : 9,
          delta,
        );

      group.rotation.z =
        THREE.MathUtils.damp(
          group.rotation.z,
          0,
          5,
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
        focusedCountry
          ? "default"
          : "grab";
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
      {/* ================================================= */}
      {/* INVISIBLE DRAG SPHERE                             */}
      {/* ================================================= */}

      <mesh
        onPointerDown={(
          event,
        ) => {
          if (
            focusedCountry
          ) {
            return;
          }

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
            focusedCountry ||
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

          pointerRef.current.x =
            currentX;

          pointerRef.current.y =
            currentY;

          const horizontalSensitivity =
            0.006;

          const verticalSensitivity =
            0.005;

          rotationRef.current.y +=
            deltaX *
            horizontalSensitivity;

          rotationRef.current.x +=
            deltaY *
            verticalSensitivity;

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
            focusedCountry
          ) {
            document.body.style.cursor =
              "default";

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
            48,
            48,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          colorWrite={false}
          depthWrite={false}
        />
      </mesh>

      {/* ================================================= */}
      {/* EARTH SYSTEM                                     */}
      {/* ================================================= */}

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
/* THREE SCENE                                            */
/* ====================================================== */

function Scene({
  progress,
  reduced,
}: SceneProps) {
  return (
    <CountryFocusProvider>
      <ambientLight
        intensity={0.09}
      />

      <directionalLight
        position={[
          5,
          2,
          6,
        ]}
        intensity={1.15}
        color="#EDE9FE"
      />

      <pointLight
        position={[
          -4,
          -2,
          3,
        ]}
        intensity={0.34}
        color="#4F46E5"
      />

      <pointLight
        position={[
          4,
          1,
          1,
        ]}
        intensity={0.3}
        color="#C026D3"
      />

      <pointLight
        position={[
          0,
          -4,
          5,
        ]}
        intensity={0.22}
        color="#22D3EE"
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
    </CountryFocusProvider>
  );
}

/* ====================================================== */
/* CSS WARP PARTICLES                                     */
/* ====================================================== */

function WarpParticles({
  reduced,
}: {
  reduced: boolean;
}) {
  const particles =
    Array.from({
      length: 22,
    });

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        z-[12]
        overflow-hidden
      "
    >
      {particles.map(
        (
          _,
          index,
        ) => {
          const left =
            8 +
            (
              index *
              37
            ) %
              84;

          const delay =
            (
              index %
              8
            ) *
            0.17;

          const duration =
            1.8 +
            (
              index %
              5
            ) *
              0.24;

          const height =
            45 +
            (
              index %
              7
            ) *
              18;

          return (
            <motion.span
              key={index}
              animate={
                reduced
                  ? undefined
                  : {
                      y: [
                        "-20vh",
                        "120vh",
                      ],

                      opacity: [
                        0,
                        0.75,
                        0.35,
                        0,
                      ],

                      scaleY: [
                        0.3,
                        1.4,
                        2,
                      ],
                    }
              }
              transition={{
                duration,
                repeat:
                  Infinity,
                delay,
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
                via-violet-200/75
                to-cyan-300/10
                shadow-[0_0_8px_rgba(167,139,250,.45)]
              "
              style={{
                left: `${left}%`,
                height,
              }}
            />
          );
        },
      )}
    </div>
  );
}

/* ====================================================== */
/* PLANET SCENE                                           */
/* ====================================================== */

export default function PlanetScene() {
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
      "start end",
      "end start",
    ],
  });

  const progress =
    useSpring(
      scrollYProgress,
      {
        stiffness: 88,
        damping: 25,
        mass: 0.4,
      },
    );

  /* ==================================================== */
  /* MAIN HEADING                                         */
  /* ==================================================== */

  const copyOpacity =
    useTransform(
      progress,
      [
        0.05,
        0.15,
        0.5,
        0.66,
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
        0.05,
        0.22,
        0.66,
      ],
      [
        40,
        0,
        -36,
      ],
    );

  /* ==================================================== */
  /* CANVAS EXIT                                          */
  /* ==================================================== */

  const planetOpacity =
    useTransform(
      progress,
      [
        0,
        0.72,
        0.96,
        1,
      ],
      [
        1,
        1,
        0.45,
        0.1,
      ],
    );

  const planetScale =
    useTransform(
      progress,
      [
        0,
        0.7,
        1,
      ],
      [
        1,
        1,
        1.1,
      ],
    );

  /* ==================================================== */
  /* BACKGROUND AURAS                                     */
  /* ==================================================== */

  const auraOpacity =
    useTransform(
      progress,
      [
        0,
        0.18,
        0.58,
        0.82,
        1,
      ],
      [
        0.1,
        0.28,
        0.34,
        0.5,
        0.28,
      ],
    );

  const cyanAuraOpacity =
    useTransform(
      progress,
      [
        0.35,
        0.62,
        0.84,
        1,
      ],
      [
        0,
        0.08,
        0.22,
        0.1,
      ],
    );

  /* ==================================================== */
  /* CORE COLLAPSE                                        */
  /* ==================================================== */

  const coreOpacity =
    useTransform(
      progress,
      [
        0.5,
        0.62,
        0.82,
        0.97,
      ],
      [
        0,
        0.35,
        0.9,
        0,
      ],
    );

  const coreScale =
    useTransform(
      progress,
      [
        0.5,
        0.72,
        0.9,
        1,
      ],
      [
        0.2,
        0.8,
        1.8,
        5.5,
      ],
    );

  /* ==================================================== */
  /* ENERGY BEAM                                          */
  /* ==================================================== */

  const beamOpacity =
    useTransform(
      progress,
      [
        0.52,
        0.64,
        0.88,
        1,
      ],
      [
        0,
        0.35,
        0.8,
        0,
      ],
    );

  const beamScaleY =
    useTransform(
      progress,
      [
        0.52,
        0.72,
        1,
      ],
      [
        0.05,
        0.55,
        1.5,
      ],
    );

  /* ==================================================== */
  /* SHOCKWAVES                                           */
  /* ==================================================== */

  const shockOpacity =
    useTransform(
      progress,
      [
        0.64,
        0.73,
        0.89,
        1,
      ],
      [
        0,
        0.55,
        0.24,
        0,
      ],
    );

  const shockScale =
    useTransform(
      progress,
      [
        0.63,
        0.8,
        1,
      ],
      [
        0.35,
        1.2,
        3.5,
      ],
    );

  /* ==================================================== */
  /* EXIT COPY                                            */
  /* ==================================================== */

  const exitCopyOpacity =
    useTransform(
      progress,
      [
        0.62,
        0.72,
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

  const exitCopyY =
    useTransform(
      progress,
      [
        0.62,
        0.78,
        0.98,
      ],
      [
        28,
        0,
        -28,
      ],
    );

  /* ==================================================== */
  /* PORTAL                                               */
  /* ==================================================== */

  const portalOpacity =
    useTransform(
      progress,
      [
        0.6,
        0.74,
        0.96,
        1,
      ],
      [
        0,
        0.45,
        0.9,
        0.3,
      ],
    );

  const portalScale =
    useTransform(
      progress,
      [
        0.58,
        0.8,
        1,
      ],
      [
        0.45,
        1,
        2.8,
      ],
    );

  /* ==================================================== */
  /* WARP PARTICLES                                       */
  /* ==================================================== */

  const warpOpacity =
    useTransform(
      progress,
      [
        0.58,
        0.7,
        0.94,
        1,
      ],
      [
        0,
        0.55,
        0.8,
        0,
      ],
    );

  /* ==================================================== */
  /* FINAL FLASH                                          */
  /* ==================================================== */

  const flashOpacity =
    useTransform(
      progress,
      [
        0.82,
        0.93,
        1,
      ],
      [
        0,
        0.16,
        0,
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
        h-[175vh]
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
          bg-[#020105]
        "
      >
        {/* ================================================= */}
        {/* DEEP BACKGROUND                                   */}
        {/* ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[#020105]
          "
        />

        {/* ================================================= */}
        {/* PRIMARY VIOLET NEBULA                             */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              auraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[52%]
            z-[1]
            h-[68vw]
            w-[68vw]
            min-h-[650px]
            min-w-[650px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(124,58,237,.22)_0%,rgba(91,33,182,.12)_22%,rgba(76,29,149,.055)_42%,transparent_70%)]
            blur-[105px]
          "
        />

        {/* ================================================= */}
        {/* CYAN NEBULA                                       */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              cyanAuraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            right-[-12vw]
            top-[20%]
            z-[1]
            h-[48vw]
            w-[48vw]
            min-h-[480px]
            min-w-[480px]
            rounded-full
            bg-[radial-gradient(circle,rgba(34,211,238,.16)_0%,rgba(59,130,246,.07)_30%,transparent_68%)]
            blur-[130px]
          "
        />

        {/* ================================================= */}
        {/* MAGENTA NEBULA                                    */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              auraOpacity,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-20vw]
            left-[-12vw]
            z-[1]
            h-[52vw]
            w-[52vw]
            min-h-[500px]
            min-w-[500px]
            rounded-full
            bg-[radial-gradient(circle,rgba(217,70,239,.12)_0%,rgba(126,34,206,.055)_32%,transparent_70%)]
            blur-[140px]
          "
        />

        {/* ================================================= */}
        {/* SPACE DEPTH                                       */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[radial-gradient(circle_at_50%_48%,transparent_0%,rgba(28,16,50,.08)_30%,rgba(3,2,8,.2)_74%,rgba(2,1,5,.4)_100%)]
          "
        />

        {/* ================================================= */}
        {/* THREE CANVAS                                      */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              planetOpacity,
            scale:
              planetScale,
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
                0.8,
                9.4,
              ],
              fov: 47,
              near: 0.1,
              far: 80,
            }}
            dpr={[
              1,
              1.4,
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
                1.05;
            }}
          >
            <Scene
              progress={progress}
              reduced={reduced}
            />
          </Canvas>
        </motion.div>

        {/* ================================================= */}
        {/* MAIN HEADING                                      */}
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
            top-14
            z-20
            mx-auto
            max-w-5xl
            px-6
            text-center
            sm:top-20
          "
        >
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.38em]
              text-violet-200/65
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
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-slate-300/65
              sm:text-base
            "
          >
            Research, artificial intelligence,
            engineering and medicine orbit a
            shared BioLayers core.
          </p>

          <p
            className="
              mt-3
              text-[9px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-violet-200/30
            "
          >
            Drag to explore · Click a country to focus
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* HORIZONTAL ENERGY PLANE                           */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              beamOpacity,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[7]
            h-px
            w-[88vw]
            -translate-x-1/2
            -translate-y-1/2
            bg-gradient-to-r
            from-transparent
            via-cyan-300/10
            via-50%
            to-transparent
            shadow-[0_0_35px_rgba(139,92,246,.3)]
          "
        />

        {/* ================================================= */}
        {/* VERTICAL MOLECULAR BEAM                           */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              beamOpacity,

            scaleY:
              beamScaleY,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-10%]
            left-1/2
            z-[9]
            h-[72vh]
            w-[2px]
            origin-bottom
            -translate-x-1/2
            bg-gradient-to-t
            from-fuchsia-300/10
            via-violet-200/80
            to-transparent
            shadow-[0_0_12px_rgba(196,181,253,.85),0_0_40px_rgba(139,92,246,.55)]
          "
        />

        {/* ================================================= */}
        {/* CORE                                             */}
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
            z-[10]
            h-28
            w-28
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-violet-200/25
            bg-white/[0.025]
            shadow-[0_0_35px_rgba(255,255,255,.2),0_0_85px_rgba(139,92,246,.35),0_0_180px_rgba(217,70,239,.18)]
            backdrop-blur-xl
          "
        >
          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    rotate:
                      360,
                  }
            }
            transition={{
              duration: 7,
              repeat:
                Infinity,
              ease:
                "linear",
            }}
            className="
              absolute
              -inset-5
              rounded-full
              border
              border-dashed
              border-violet-200/20
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
              duration: 12,
              repeat:
                Infinity,
              ease:
                "linear",
            }}
            className="
              absolute
              -inset-12
              rounded-full
              border
              border-fuchsia-300/10
            "
          />

          <div
            className="
              absolute
              inset-[42px]
              rounded-full
              bg-white
              shadow-[0_0_14px_rgba(255,255,255,.95),0_0_40px_rgba(167,139,250,.9),0_0_90px_rgba(217,70,239,.45)]
            "
          />
        </motion.div>

        {/* ================================================= */}
        {/* SHOCKWAVE 01                                      */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              shockOpacity,

            scale:
              shockScale,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[8]
            h-[38vmin]
            w-[38vmin]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-violet-300/20
            shadow-[0_0_40px_rgba(139,92,246,.14)]
          "
        />

        {/* ================================================= */}
        {/* SHOCKWAVE 02                                      */}
        {/* ================================================= */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              shockOpacity,

            scale:
              shockScale,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[8]
            h-[58vmin]
            w-[58vmin]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-cyan-300/[0.07]
          "
        />

        {/* ================================================= */}
        {/* MOLECULAR PORTAL                                  */}
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
            bottom-[-14vmin]
            left-1/2
            z-[11]
            h-[28vmin]
            w-[72vmin]
            -translate-x-1/2
            rounded-[50%]
            border
            border-violet-200/25
            bg-[radial-gradient(ellipse,rgba(196,181,253,.18)_0%,rgba(139,92,246,.12)_24%,rgba(217,70,239,.055)_44%,transparent_72%)]
            shadow-[0_0_45px_rgba(167,139,250,.3),0_0_120px_rgba(126,34,206,.22)]
            blur-[0.2px]
          "
        />

        {/* ================================================= */}
        {/* WARP PARTICLES                                    */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              warpOpacity,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            z-[12]
          "
        >
          <WarpParticles
            reduced={reduced}
          />
        </motion.div>

        {/* ================================================= */}
        {/* EXIT COPY                                         */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              exitCopyOpacity,

            y:
              exitCopyY,
          }}
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-[11vh]
            z-[22]
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
              tracking-[0.44em]
              text-cyan-200/45
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
              text-white/90
              sm:text-4xl
            "
          >
            Leave the planet.
            Enter the biology.
          </h3>

          <div
            className="
              mx-auto
              mt-5
              h-px
              w-24
              bg-gradient-to-r
              from-transparent
              via-violet-200/50
              to-transparent
            "
          />
        </motion.div>

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
            bg-[radial-gradient(circle_at_50%_68%,rgba(255,255,255,.58)_0%,rgba(196,181,253,.16)_10%,rgba(34,211,238,.06)_24%,rgba(126,34,206,.045)_38%,transparent_64%)]
          "
        />

        {/* ================================================= */}
        {/* SCROLL CUE                                        */}
        {/* ================================================= */}

        <motion.div
          style={{
            opacity:
              copyOpacity,
          }}
          className="
            pointer-events-none
            absolute
            bottom-6
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
              text-violet-200/35
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
                      0.25,
                      0.85,
                      0.25,
                    ],
                  }
            }
            transition={{
              duration: 1.5,
              repeat:
                Infinity,
              ease:
                "easeInOut",
            }}
            className="
              mx-auto
              mt-3
              h-8
              w-px
              bg-gradient-to-b
              from-violet-200/80
              to-transparent
            "
          />
        </motion.div>
      </div>
    </section>
  );
}