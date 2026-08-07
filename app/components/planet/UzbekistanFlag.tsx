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

type UzbekistanFlagProps = {
  visible: boolean;
  reduced?: boolean;
};

const vertexShader = `
uniform float uTime;
uniform float uWaveStrength;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 transformed =
    position;

  float horizontalWave =
    sin(
      position.x * 6.5 +
      uTime * 2.2
    );

  float secondaryWave =
    sin(
      position.x * 10.0 -
      uTime * 1.4 +
      position.y * 3.0
    );

  float edgeFactor =
    smoothstep(
      -0.75,
      0.75,
      position.x
    );

  transformed.z +=
    (
      horizontalWave * 0.075 +
      secondaryWave * 0.025
    ) *
    edgeFactor *
    uWaveStrength;

  transformed.y +=
    sin(
      position.x * 5.0 +
      uTime * 1.6
    ) *
    0.012 *
    edgeFactor *
    uWaveStrength;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(
      transformed,
      1.0
    );
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec4 textureColor =
    texture2D(
      uTexture,
      vUv
    );

  gl_FragColor =
    vec4(
      textureColor.rgb,
      textureColor.a *
      uOpacity
    );
}
`;

function drawStar(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) {
  context.beginPath();

  for (
    let point = 0;
    point < 10;
    point += 1
  ) {
    const angle =
      -Math.PI / 2 +
      point *
        Math.PI /
        5;

    const currentRadius =
      point % 2 === 0
        ? radius
        : radius * 0.42;

    const x =
      centerX +
      Math.cos(
        angle,
      ) *
        currentRadius;

    const y =
      centerY +
      Math.sin(
        angle,
      ) *
        currentRadius;

    if (point === 0) {
      context.moveTo(
        x,
        y,
      );
    } else {
      context.lineTo(
        x,
        y,
      );
    }
  }

  context.closePath();
  context.fill();
}

function createUzbekistanFlagTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = 1200;
  canvas.height = 600;

  const context =
    canvas.getContext(
      "2d",
    );

  if (!context) {
    return null;
  }

  const width =
    canvas.width;

  const height =
    canvas.height;

  /*
   * Uzbekistan flag proportions.
   */

  const blueHeight =
    height * 0.32;

  const redHeight =
    height * 0.02;

  const whiteHeight =
    height * 0.28;

  const greenStart =
    blueHeight +
    redHeight +
    whiteHeight +
    redHeight;

  /*
   * Blue field
   */

  context.fillStyle =
    "#1EB4E9";

  context.fillRect(
    0,
    0,
    width,
    blueHeight,
  );

  /*
   * First red separator
   */

  context.fillStyle =
    "#CE1126";

  context.fillRect(
    0,
    blueHeight,
    width,
    redHeight,
  );

  /*
   * White field
   */

  context.fillStyle =
    "#FFFFFF";

  context.fillRect(
    0,
    blueHeight +
      redHeight,
    width,
    whiteHeight,
  );

  /*
   * Second red separator
   */

  context.fillStyle =
    "#CE1126";

  context.fillRect(
    0,
    blueHeight +
      redHeight +
      whiteHeight,
    width,
    redHeight,
  );

  /*
   * Green field
   */

  context.fillStyle =
    "#1EB53A";

  context.fillRect(
    0,
    greenStart,
    width,
    height -
      greenStart,
  );

  /*
   * Crescent
   */

  const crescentX =
    142;

  const crescentY =
    105;

  const crescentRadius =
    60;

  context.fillStyle =
    "#FFFFFF";

  context.beginPath();

  context.arc(
    crescentX,
    crescentY,
    crescentRadius,
    0,
    Math.PI * 2,
  );

  context.fill();

  /*
   * Cutout using blue.
   */

  context.fillStyle =
    "#1EB4E9";

  context.beginPath();

  context.arc(
    crescentX + 25,
    crescentY - 3,
    crescentRadius * 0.82,
    0,
    Math.PI * 2,
  );

  context.fill();

  /*
   * Twelve stars.
   */

  context.fillStyle =
    "#FFFFFF";

  const starRadius =
    12;

  const rows = [
    {
      count: 3,
      startX: 250,
      y: 62,
    },
    {
      count: 4,
      startX: 220,
      y: 105,
    },
    {
      count: 5,
      startX: 190,
      y: 148,
    },
  ];

  rows.forEach(
    (row) => {
      for (
        let index = 0;
        index <
        row.count;
        index += 1
      ) {
        drawStar(
          context,
          row.startX +
            index * 48,
          row.y,
          starRadius,
        );
      }
    },
  );

  /*
   * Tiny soft highlight.
   */

  const highlight =
    context.createLinearGradient(
      0,
      0,
      width,
      0,
    );

  highlight.addColorStop(
    0,
    "rgba(255,255,255,.08)",
  );

  highlight.addColorStop(
    0.35,
    "rgba(255,255,255,.02)",
  );

  highlight.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  context.fillStyle =
    highlight;

  context.fillRect(
    0,
    0,
    width,
    height,
  );

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

export default function UzbekistanFlag({
  visible,
  reduced = false,
}: UzbekistanFlagProps) {
  const rootRef =
    useRef<THREE.Group | null>(
      null,
    );

  const materialRef =
    useRef<THREE.ShaderMaterial | null>(
      null,
    );

  const poleMaterialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  const texture =
    useMemo(
      () =>
        typeof document ===
        "undefined"
          ? null
          : createUzbekistanFlagTexture(),
      [],
    );

  const uniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },

        uWaveStrength: {
          value:
            reduced
              ? 0
              : 1,
        },

        uOpacity: {
          value: 0,
        },

        uTexture: {
          value:
            texture,
        },
      }),
      [
        reduced,
        texture,
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

      const material =
        materialRef.current;

      if (
        !root ||
        !material
      ) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      material.uniforms.uTime.value =
        reduced
          ? 0
          : time;

      material.uniforms.uWaveStrength.value =
        THREE.MathUtils.damp(
          material.uniforms
            .uWaveStrength
            .value,
          visible
            ? 1
            : 0.25,
          5,
          delta,
        );

      material.uniforms.uOpacity.value =
        THREE.MathUtils.damp(
          material.uniforms
            .uOpacity
            .value,
          visible
            ? 1
            : 0,
          7,
          delta,
        );

      const targetScale =
        visible
          ? 1
          : 0.35;

      root.scale.x =
        THREE.MathUtils.damp(
          root.scale.x,
          targetScale,
          7,
          delta,
        );

      root.scale.y =
        THREE.MathUtils.damp(
          root.scale.y,
          targetScale,
          7,
          delta,
        );

      root.scale.z =
        THREE.MathUtils.damp(
          root.scale.z,
          targetScale,
          7,
          delta,
        );

      root.position.z =
        THREE.MathUtils.damp(
          root.position.z,
          visible
            ? 0.55
            : 0.28,
          6,
          delta,
        );

      /*
       * Tiny floating animation.
       */

      if (
        !reduced &&
        visible
      ) {
        root.position.y =
          Math.sin(
            time * 1.2,
          ) *
          0.018;
      } else {
        root.position.y =
          THREE.MathUtils.damp(
            root.position.y,
            0,
            5,
            delta,
          );
      }

      if (
        poleMaterialRef.current
      ) {
        poleMaterialRef.current.opacity =
          THREE.MathUtils.damp(
            poleMaterialRef.current
              .opacity,
            visible
              ? 0.72
              : 0,
            6,
            delta,
          );
      }
    },
  );

  return (
    <group
      ref={rootRef}
      position={[
        0,
        0,
        0.28,
      ]}
      scale={0.35}
    >
      {/*
        Pole
      */}

      <mesh
        position={[
          -0.58,
          -0.05,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.012,
            0.012,
            1.05,
            10,
          ]}
        />

        <meshBasicMaterial
          ref={poleMaterialRef}
          color="#E9E7FF"
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/*
        Small glowing pole top
      */}

      <mesh
        position={[
          -0.58,
          0.485,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.025,
            12,
            12,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={
            visible
              ? 0.8
              : 0
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/*
        Waving flag
      */}

      <mesh
        position={[
          0.02,
          0.19,
          0,
        ]}
      >
        <planeGeometry
          args={[
            1.18,
            0.59,
            42,
            18,
          ]}
        />

        <shaderMaterial
          ref={materialRef}
          vertexShader={
            vertexShader
          }
          fragmentShader={
            fragmentShader
          }
          uniforms={
            uniforms
          }
          transparent
          side={
            THREE.DoubleSide
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/*
        Glow behind flag
      */}

      <mesh
        position={[
          0.02,
          0.19,
          -0.025,
        ]}
        scale={[
          1.1,
          1.15,
          1,
        ]}
      >
        <planeGeometry
          args={[
            1.2,
            0.61,
          ]}
        />

        <meshBasicMaterial
          color="#6D5CFF"
          transparent
          opacity={
            visible
              ? 0.045
              : 0
          }
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