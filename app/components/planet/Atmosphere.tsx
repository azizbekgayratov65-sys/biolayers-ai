"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type AtmosphereProps = {
  reduced?: boolean;
};

const vertexShader = `
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;

  vNormal =
    normalize(
      normalMatrix *
      normal
    );

  vec4 worldPosition =
    modelMatrix *
    vec4(
      position,
      1.0
    );

  vWorldPosition =
    worldPosition.xyz;

  gl_Position =
    projectionMatrix *
    viewMatrix *
    worldPosition;
}
`;

const fragmentShader = `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec3 viewDirection =
    normalize(
      cameraPosition -
      vWorldPosition
    );

  vec3 normal =
    normalize(
      vNormal
    );

  float fresnel =
    pow(
      1.0 -
      max(
        dot(
          normal,
          viewDirection
        ),
        0.0
      ),
      2.6
    );

  float outerGlow =
    pow(
      fresnel,
      1.25
    );

  float softGlow =
    pow(
      fresnel,
      3.1
    );

  /*
    Reference palette:
    icy cyan
    pearl white
    soft lavender
  */

  vec3 deepCyan =
    vec3(
      0.12,
      0.48,
      0.62
    );

  vec3 icyCyan =
    vec3(
      0.48,
      0.82,
      0.95
    );

  vec3 pearl =
    vec3(
      0.92,
      0.97,
      1.0
    );

  vec3 lavender =
    vec3(
      0.55,
      0.42,
      0.76
    );

  float verticalMix =
    smoothstep(
      0.05,
      0.95,
      vUv.y
    );

  vec3 atmosphereColor =
    mix(
      lavender,
      icyCyan,
      verticalMix
    );

  atmosphereColor =
    mix(
      deepCyan,
      atmosphereColor,
      outerGlow
    );

  atmosphereColor =
    mix(
      atmosphereColor,
      pearl,
      softGlow *
      0.28
    );

  /*
    Very slow living shimmer.
    Barely visible.
  */

  float shimmer =
    sin(
      vUv.y *
      13.0 +
      vUv.x *
      8.0 +
      uTime *
      0.12
    ) *
    0.5 +
    0.5;

  atmosphereColor +=
    pearl *
    shimmer *
    outerGlow *
    0.025;

  float alpha =
    outerGlow *
    0.34 +
    softGlow *
    0.10;

  alpha =
    clamp(
      alpha,
      0.0,
      0.48
    );

  gl_FragColor =
    vec4(
      atmosphereColor,
      alpha
    );
}
`;

export default function Atmosphere({
  reduced = false,
}: AtmosphereProps) {
  const meshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

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
      }),
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const mesh =
        meshRef.current;

      const material =
        materialRef.current;

      if (
        !mesh ||
        !material
      ) {
        return;
      }

      material.uniforms.uTime.value =
        reduced
          ? 0
          : state.clock.elapsedTime;

      mesh.rotation.y +=
        reduced
          ? 0
          : delta *
            0.012;

      mesh.rotation.z =
        THREE.MathUtils.damp(
          mesh.rotation.z,
          Math.sin(
            state.clock.elapsedTime *
              0.04,
          ) *
            0.025,
          2,
          delta,
        );
    },
  );

  return (
    <mesh
      ref={meshRef}
      scale={1.072}
    >
      <sphereGeometry
        args={[
          2.25,
          80,
          80,
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
        side={
          THREE.BackSide
        }
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </mesh>
  );
}