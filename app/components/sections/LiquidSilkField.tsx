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

type LiquidSilkFieldProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

const vertexShader = `
uniform float uTime;
uniform float uProgress;
uniform float uEnergy;

varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;

  vec3 p = position;

  float t = uTime * 0.55;

  float waveA =
    sin(p.x * 1.35 + t * 1.35 + uProgress * 8.0);

  float waveB =
    cos(p.y * 1.75 - t * 1.05 + uProgress * 5.0);

  float waveC =
    sin((p.x + p.y) * 0.85 + t * 0.8);

  float envelope =
    smoothstep(0.0, 0.18, uv.y) *
    smoothstep(1.0, 0.82, uv.y);

  float displacement =
    (waveA * 0.34 +
     waveB * 0.22 +
     waveC * 0.16) *
    envelope;

  p.z +=
    displacement *
    (0.7 + uEnergy * 1.4);

  p.x +=
    sin(
      p.y * 1.1 +
      t * 0.75
    ) *
    0.14 *
    (0.5 + uEnergy);

  vWave = displacement;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(p, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uProgress;
uniform float uEnergy;
uniform float uOpacity;

varying vec2 vUv;
varying float vWave;

float band(
  float value,
  float center,
  float width
) {
  return
    1.0 -
    smoothstep(
      width,
      width + 0.025,
      abs(value - center)
    );
}

void main() {
  float t =
    uTime * 0.14;

  float flow =
    sin(
      vUv.x * 9.0 +
      t * 6.0 +
      vUv.y * 3.0 +
      uProgress * 10.0
    ) * 0.5 + 0.5;

  float flow2 =
    cos(
      vUv.y * 13.0 -
      t * 5.0 +
      vUv.x * 2.0
    ) * 0.5 + 0.5;

  float edge =
    smoothstep(
      0.0,
      0.18,
      vUv.y
    ) *
    smoothstep(
      1.0,
      0.82,
      vUv.y
    );

  float ribbon =
    band(
      vUv.y +
      sin(
        vUv.x * 4.0 +
        t * 4.0
      ) * 0.055,
      0.5,
      0.28
    );

  vec3 cyan =
    vec3(
      0.40,
      0.91,
      0.98
    );

  vec3 violet =
    vec3(
      0.56,
      0.36,
      0.95
    );

  vec3 white =
    vec3(
      1.0,
      1.0,
      1.0
    );

  vec3 color =
    mix(
      violet,
      cyan,
      flow
    );

  color =
    mix(
      color,
      white,
      pow(flow2, 7.0) *
      0.35
    );

  float highlight =
    pow(
      max(
        0.0,
        1.0 -
        abs(vWave) * 1.8
      ),
      4.0
    );

  float alpha =
    ribbon *
    edge *
    (
      0.12 +
      flow * 0.22 +
      highlight * 0.24
    );

  alpha *=
    uOpacity *
    (
      0.75 +
      uEnergy * 0.7
    );

  gl_FragColor =
    vec4(
      color,
      alpha
    );
}
`;

export default function LiquidSilkField({
  progress,
  reduced,
}: LiquidSilkFieldProps) {
  const materialRef =
    useRef<THREE.ShaderMaterial | null>(
      null,
    );

  const groupRef =
    useRef<THREE.Group | null>(
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
        uEnergy: {
          value: 0,
        },
        uOpacity: {
          value: 0.9,
        },
      }),
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const material =
        materialRef.current;

      const group =
        groupRef.current;

      if (
        !material ||
        !group
      ) {
        return;
      }

      const p =
        reduced
          ? 0
          : progress.get();

      const stage =
        p * 4;

      const local =
        stage -
        Math.floor(stage);

      const energy =
        Math.sin(
          Math.min(
            Math.max(
              local,
              0
            ),
            1
          ) *
          Math.PI
        );

      material.uniforms.uTime.value =
        state.clock.elapsedTime;

      material.uniforms.uProgress.value =
        p;

      material.uniforms.uEnergy.value =
        THREE.MathUtils.damp(
          material.uniforms.uEnergy.value,
          energy,
          4.2,
          delta
        );

      material.uniforms.uOpacity.value =
        THREE.MathUtils.damp(
          material.uniforms.uOpacity.value,
          reduced
            ? 0.22
            : 0.95,
          3.5,
          delta
        );

      group.rotation.z =
        THREE.MathUtils.damp(
          group.rotation.z,
          Math.sin(
            p *
            Math.PI *
            2
          ) *
          0.12,
          2.4,
          delta
        );

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          -0.28 +
          Math.cos(
            p *
            Math.PI *
            3
          ) *
          0.12,
          2.2,
          delta
        );

      group.position.y =
        THREE.MathUtils.damp(
          group.position.y,
          Math.sin(
            p *
            Math.PI *
            4
          ) *
          0.45,
          2.4,
          delta
        );

      const scale =
        0.88 +
        energy *
        0.22;

      group.scale.set(
        scale,
        scale,
        scale
      );
    },
  );

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -1.8,
      ]}
    >
      <mesh>
        <planeGeometry
          args={[
            13,
            7.5,
            120,
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
            THREE.DoubleSide
          }
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.9,
          -0.75,
        ]}
        rotation={[
          0,
          0,
          Math.PI,
        ]}
        scale={[
          1.08,
          0.82,
          1,
        ]}
      >
        <planeGeometry
          args={[
            11,
            5.5,
            80,
            50,
          ]}
        />

        <shaderMaterial
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
            THREE.DoubleSide
          }
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}