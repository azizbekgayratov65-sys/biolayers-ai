"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  MotionValue,
} from "framer-motion";

type AuroraFieldProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uProgress;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  float wave1 =
    sin(
      uv.x * 8.0 +
      uTime * 0.32 +
      uv.y * 4.0
    );

  float wave2 =
    sin(
      uv.x * 13.0 -
      uTime * 0.22 +
      uv.y * 7.0 +
      1.8
    );

  float wave3 =
    cos(
      uv.x * 5.0 +
      uTime * 0.16 -
      uv.y * 10.0
    );

  float field =
    (
      wave1 +
      wave2 * 0.65 +
      wave3 * 0.5
    ) / 2.15;

  float ribbon =
    exp(
      -pow(
        (
          uv.y -
          0.5 -
          field * 0.09
        ) *
        6.0,
        2.0
      )
    );

  float ribbon2 =
    exp(
      -pow(
        (
          uv.y -
          0.36 +
          wave2 * 0.05
        ) *
        7.5,
        2.0
      )
    );

  vec3 cyan =
    vec3(
      0.12,
      0.78,
      0.92
    );

  vec3 violet =
    vec3(
      0.48,
      0.27,
      0.92
    );

  vec3 blue =
    vec3(
      0.12,
      0.38,
      0.85
    );

  vec3 color =
    mix(
      violet,
      cyan,
      uv.x
    );

  color =
    mix(
      color,
      blue,
      0.28 +
      sin(
        uProgress *
        6.283
      ) * 0.1
    );

  float edge =
    smoothstep(
      0.0,
      0.12,
      uv.x
    ) *
    smoothstep(
      1.0,
      0.88,
      uv.x
    );

  float alpha =
    (
      ribbon * 0.18 +
      ribbon2 * 0.11
    ) *
    edge;

  gl_FragColor =
    vec4(
      color,
      alpha
    );
}
`;

export default function AuroraField({
  progress,
  reduced,
}: AuroraFieldProps) {
  const materialRef =
    useRef<THREE.ShaderMaterial | null>(
      null,
    );

  const uniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },
        uProgress: {
          value: 0,
        },
      }),
      [],
    );

  useFrame(
    (state) => {
      const material =
        materialRef.current;

      if (!material) {
        return;
      }

      material.uniforms.uTime.value =
        reduced
          ? 0
          : state.clock.elapsedTime;

      material.uniforms.uProgress.value =
        reduced
          ? 0
          : progress.get();
    },
  );

  return (
    <mesh
      position={[
        0,
        0.8,
        -7,
      ]}
      rotation={[
        -0.05,
        0,
        0,
      ]}
    >
      <planeGeometry
        args={[
          18,
          10,
          1,
          1,
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
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </mesh>
  );
}