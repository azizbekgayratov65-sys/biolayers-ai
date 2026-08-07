"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
  useLoader,
} from "@react-three/fiber";

import * as THREE from "three";

type EarthProps = {
  reduced?: boolean;
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  vec4 worldPosition =
    modelMatrix *
    vec4(
      position,
      1.0
    );

  vWorldPosition =
    worldPosition.xyz;

  vNormal =
    normalize(
      mat3(modelMatrix) *
      normal
    );

  gl_Position =
    projectionMatrix *
    viewMatrix *
    worldPosition;
}
`;

const fragmentShader = `
uniform sampler2D uMap;
uniform vec3 uLightDirection;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 normal =
    normalize(
      vNormal
    );

  vec3 lightDirection =
    normalize(
      uLightDirection
    );

  vec3 viewDirection =
    normalize(
      cameraPosition -
      vWorldPosition
    );

  float light =
    max(
      dot(
        normal,
        lightDirection
      ),
      0.0
    );

  vec4 mapSample =
    texture2D(
      uMap,
      vUv
    );

  /*
    Dark reference-video treatment.
  */

  vec3 surface =
    mapSample.rgb;

  /*
    Shadow side remains almost black.
  */

  float illumination =
    0.22 +
    pow(
      light,
      0.85
    ) *
    0.86;

  surface *=
    illumination;

  /*
    Cold violet / indigo grading.
  */

  vec3 indigo =
    vec3(
      0.08,
      0.045,
      0.18
    );

  vec3 violet =
    vec3(
      0.23,
      0.12,
      0.42
    );

  float landBrightness =
    max(
      max(
        mapSample.r,
        mapSample.g
      ),
      mapSample.b
    );

  surface +=
    mix(
      indigo,
      violet,
      landBrightness
    ) *
    landBrightness *
    0.35;

  /*
    Fresnel rim.
  */

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
      3.4
    );

  vec3 rimColor =
    mix(
      vec3(
        0.20,
        0.16,
        0.62
      ),
      vec3(
        0.48,
        0.20,
        0.78
      ),
      vUv.y
    );

  surface +=
    rimColor *
    fresnel *
    0.22;

  /*
    Very subtle living shimmer.
  */

  float shimmer =
    sin(
      vUv.x *
      18.0 +
      vUv.y *
      10.0 +
      uTime *
      0.14
    ) *
    0.5 +
    0.5;

  surface +=
    vec3(
      0.16,
      0.10,
      0.30
    ) *
    shimmer *
    light *
    0.018;

  gl_FragColor =
    vec4(
      surface,
      1.0
    );
}
`;

export default function Earth({
  reduced = false,
}: EarthProps) {
  const meshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const materialRef =
    useRef<THREE.ShaderMaterial | null>(
      null,
    );

  const texture =
    useLoader(
      THREE.TextureLoader,
      "/textures/earth-continents.png",
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.wrapS =
    THREE.RepeatWrapping;

  texture.wrapT =
    THREE.ClampToEdgeWrapping;

  texture.anisotropy = 8;

  const uniforms =
    useMemo(
      () => ({
        uMap: {
          value: texture,
        },

        uLightDirection: {
          value:
            new THREE.Vector3(
              3.2,
              1.5,
              4.5,
            ).normalize(),
        },

        uTime: {
          value: 0,
        },
      }),
      [texture],
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
          : delta * 0.035;

      mesh.rotation.x =
        THREE.MathUtils.damp(
          mesh.rotation.x,
          -0.12,
          3,
          delta,
        );
    },
  );

  return (
    <mesh
      ref={meshRef}
      castShadow={false}
      receiveShadow={false}
    >
      <sphereGeometry
        args={[
          2.25,
          128,
          128,
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
        toneMapped={false}
      />
    </mesh>
  );
}