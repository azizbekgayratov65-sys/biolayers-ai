"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type OrbitalStationProps = {
  label: string;
  subtitle: string;
  radius: number;
  speed?: number;
  phase?: number;
  tilt?: number;
  color?: string;
  reduced?: boolean;
};

function createStationTexture(
  label: string,
  subtitle: string,
  color: string,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = 768;
  canvas.height = 300;

  const context =
    canvas.getContext(
      "2d",
    );

  if (!context) {
    return null;
  }

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  /*
    Soft cinematic glass
  */

  const background =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );

  background.addColorStop(
    0,
    "rgba(3,8,18,.72)",
  );

  background.addColorStop(
    0.45,
    "rgba(7,13,29,.50)",
  );

  background.addColorStop(
    1,
    "rgba(6,8,20,.30)",
  );

  context.fillStyle =
    background;

  context.beginPath();

  context.roundRect(
    12,
    12,
    canvas.width - 24,
    canvas.height - 24,
    42,
  );

  context.fill();

  /*
    Thin pearl border
  */

  const borderGradient =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      0,
    );

  borderGradient.addColorStop(
    0,
    "rgba(255,255,255,.05)",
  );

  borderGradient.addColorStop(
    0.5,
    color,
  );

  borderGradient.addColorStop(
    1,
    "rgba(255,255,255,.04)",
  );

  context.strokeStyle =
    borderGradient;

  context.globalAlpha =
    0.32;

  context.lineWidth = 2;

  context.stroke();

  context.globalAlpha = 1;

  /*
    Fine top light
  */

  const topLight =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      0,
    );

  topLight.addColorStop(
    0,
    "rgba(255,255,255,0)",
  );

  topLight.addColorStop(
    0.45,
    "rgba(238,248,255,.35)",
  );

  topLight.addColorStop(
    0.55,
    color,
  );

  topLight.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  context.fillStyle =
    topLight;

  context.globalAlpha =
    0.45;

  context.fillRect(
    46,
    30,
    canvas.width - 92,
    1,
  );

  context.globalAlpha = 1;

  /*
    Tiny status label
  */

  context.font =
    "700 16px Inter, Arial, sans-serif";

  context.fillStyle =
    color;

  context.globalAlpha =
    0.7;

  context.fillText(
    "BIOLAYERS MODULE",
    52,
    66,
  );

  context.globalAlpha = 1;

  /*
    Main title
  */

  context.font =
    "800 46px Inter, Arial, sans-serif";

  context.fillStyle =
    "#F8FBFF";

  context.fillText(
    label,
    52,
    142,
  );

  /*
    Subtitle
  */

  context.font =
    "600 22px Inter, Arial, sans-serif";

  context.fillStyle =
    "rgba(203,213,225,.72)";

  context.fillText(
    subtitle,
    52,
    188,
  );

  /*
    Footer
  */

  context.font =
    "700 13px Inter, Arial, sans-serif";

  context.fillStyle =
    "rgba(148,163,184,.35)";

  context.fillText(
    "GLOBAL RESEARCH NETWORK",
    52,
    238,
  );

  /*
    Small glow dot
  */

  const dotGradient =
    context.createRadialGradient(
      canvas.width - 72,
      62,
      0,
      canvas.width - 72,
      62,
      24,
    );

  dotGradient.addColorStop(
    0,
    "rgba(255,255,255,.95)",
  );

  dotGradient.addColorStop(
    0.25,
    color,
  );

  dotGradient.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  context.fillStyle =
    dotGradient;

  context.beginPath();

  context.arc(
    canvas.width - 72,
    62,
    24,
    0,
    Math.PI * 2,
  );

  context.fill();

  const texture =
    new THREE.CanvasTexture(
      canvas,
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.generateMipmaps =
    false;

  return texture;
}

export default function OrbitalStation({
  label,
  subtitle,
  radius,
  speed = 0.08,
  phase = 0,
  tilt = 0,
  color = "#8EEBFF",
  reduced = false,
}: OrbitalStationProps) {
  const rootRef =
    useRef<THREE.Group | null>(
      null,
    );

  const spriteRef =
    useRef<THREE.Sprite | null>(
      null,
    );

  const materialRef =
    useRef<THREE.SpriteMaterial | null>(
      null,
    );

  const ringRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const texture =
    useMemo(
      () =>
        typeof document ===
        "undefined"
          ? null
          : createStationTexture(
              label,
              subtitle,
              color,
            ),
      [
        label,
        subtitle,
        color,
      ],
    );

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  useFrame(
    (
      state,
      delta,
    ) => {
      const root =
        rootRef.current;

      const sprite =
        spriteRef.current;

      const material =
        materialRef.current;

      const ring =
        ringRef.current;

      if (
        !root ||
        !sprite ||
        !material ||
        !ring
      ) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      const angle =
        phase +
        time *
          (
            reduced
              ? 0
              : speed
          );

      /*
        Smooth elliptical orbit
  */

      root.position.set(
        Math.cos(
          angle,
        ) *
          radius,

        Math.sin(
          angle,
        ) *
          radius *
          0.58,

        Math.sin(
          angle *
            0.72 +
            tilt,
        ) *
          0.85,
      );

      /*
        Depth response
  */

      const depth =
        THREE.MathUtils.clamp(
          (
            root.position.z +
            1.2
          ) /
            2.4,
          0,
          1,
        );

      const depthScale =
        0.72 +
        depth * 0.20;

      /*
        Very subtle breathing
  */

      const float =
        reduced
          ? 1
          : 1 +
            Math.sin(
              time *
                0.65 +
                phase,
            ) *
              0.018;

      sprite.scale.set(
        2.18 *
          depthScale *
          float,

        0.84 *
          depthScale *
          float,

        1,
      );

      /*
        Fade based on depth
  */

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          0.28 +
            depth *
              0.48,
          4,
          delta,
        );

      /*
        Gentle orbit ring
  */

      ring.rotation.z +=
        reduced
          ? 0
          : delta *
            0.12;

      ring.scale.setScalar(
        0.94 +
        Math.sin(
          time *
            0.8 +
            phase,
        ) *
          0.04,
      );
    },
  );

  return (
    <group
      ref={rootRef}
    >
      <sprite
        ref={spriteRef}
      >
        <spriteMaterial
          ref={materialRef}
          map={
            texture ??
            undefined
          }
          transparent
          opacity={0}
          depthWrite={false}
          blending={
            THREE.NormalBlending
          }
          toneMapped={false}
        />
      </sprite>

      {/* Station energy ring */}
      <mesh
        ref={ringRef}
        position={[
          0,
          -0.53,
          0,
        ]}
      >
        <torusGeometry
          args={[
            0.20,
            0.008,
            8,
            72,
          ]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.20}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Pearl center */}
      <mesh
        position={[
          0,
          -0.53,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.028,
            8,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#F8FBFF"
          transparent
          opacity={0.8}
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