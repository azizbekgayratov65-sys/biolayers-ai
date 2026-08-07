"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

type CloudsProps = {
  reduced?: boolean;
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

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

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

float hash(vec2 p) {
  p =
    fract(
      p *
      vec2(
        123.34,
        456.21
      )
    );

  p +=
    dot(
      p,
      p + 45.32
    );

  return
    fract(
      p.x *
      p.y
    );
}

float noise(vec2 p) {
  vec2 i =
    floor(p);

  vec2 f =
    fract(p);

  f =
    f * f *
    (3.0 - 2.0 * f);

  float a =
    hash(i);

  float b =
    hash(
      i +
      vec2(
        1.0,
        0.0
      )
    );

  float c =
    hash(
      i +
      vec2(
        0.0,
        1.0
      )
    );

  float d =
    hash(
      i +
      vec2(
        1.0,
        1.0
      )
    );

  return
    mix(
      mix(
        a,
        b,
        f.x
      ),
      mix(
        c,
        d,
        f.x
      ),
      f.y
    );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (
    int i = 0;
    i < 5;
    i++
  ) {
    value +=
      noise(p) *
      amplitude;

    p *= 2.03;

    amplitude *=
      0.5;
  }

  return value;
}

void main() {
  vec2 uv =
    vUv;

  /*
    Slow movement.
    We do not want "storm clouds".
  */

  uv.x +=
    uTime *
    0.0027;

  uv.y +=
    sin(
      uTime *
      0.035
    ) *
    0.004;

  float largeNoise =
    fbm(
      uv *
      vec2(
        7.0,
        3.5
      )
    );

  float fineNoise =
    fbm(
      uv *
      vec2(
        19.0,
        9.5
      )
    );

  float cloudField =
    largeNoise *
    0.72 +
    fineNoise *
    0.28;

  /*
    Softer threshold than before.
  */

  float cloud =
    smoothstep(
      0.57,
      0.73,
      cloudField
    );

  /*
    Break clouds up slightly
    so they do not become one
    solid shell.
  */

  float breakup =
    smoothstep(
      0.38,
      0.68,
      fineNoise
    );

  cloud *=
    mix(
      0.55,
      1.0,
      breakup
    );

  /*
    Camera-facing edge logic.
    Clouds become slightly more
    visible near the illuminated rim.
  */

  vec3 viewDirection =
    normalize(
      cameraPosition -
      vWorldPosition
    );

  float fresnel =
    pow(
      1.0 -
      max(
        dot(
          normalize(
            vNormal
          ),
          viewDirection
        ),
        0.0
      ),
      2.5
    );

  vec3 pearl =
    vec3(
      0.90,
      0.96,
      1.0
    );

  vec3 ice =
    vec3(
      0.56,
      0.82,
      0.94
    );

  vec3 lavender =
    vec3(
      0.68,
      0.60,
      0.82
    );

  float colorShift =
    smoothstep(
      0.0,
      1.0,
      vUv.y
    );

  vec3 cloudColor =
    mix(
      lavender,
      ice,
      colorShift
    );

  cloudColor =
    mix(
      cloudColor,
      pearl,
      0.55
    );

  /*
    Subtle pulsing light.
  */

  float shimmer =
    sin(
      vUv.x *
      14.0 +
      vUv.y *
      9.0 +
      uTime *
      0.12
    ) *
    0.5 +
    0.5;

  cloudColor +=
    pearl *
    shimmer *
    0.025;

  float alpha =
    cloud *
    (
      0.055 +
      fresnel *
      0.095
    );

  alpha =
    clamp(
      alpha,
      0.0,
      0.16
    );

  gl_FragColor =
    vec4(
      cloudColor,
      alpha
    );
}
`;

export default function Clouds({
  reduced = false,
}: CloudsProps) {
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
            0.052;

      mesh.rotation.z =
        THREE.MathUtils.damp(
          mesh.rotation.z,
          Math.sin(
            state.clock.elapsedTime *
              0.035,
          ) *
            0.018,
          2,
          delta,
        );
    },
  );

  return (
    <mesh
      ref={meshRef}
      scale={1.018}
    >
      <sphereGeometry
        args={[
          2.25,
          72,
          72,
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
          THREE.NormalBlending
        }
        side={
          THREE.FrontSide
        }
        toneMapped={false}
      />
    </mesh>
  );
}