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

type PortalGateProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

const vertexShader = `
uniform float uTime;
uniform float uEnergy;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 p = position;

  float ripple =
    sin(
      atan(p.y, p.x) * 9.0 +
      uTime * 1.4
    ) *
    0.04 *
    uEnergy;

  p.xy *=
    1.0 + ripple;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(p, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uEnergy;

varying vec2 vUv;

void main() {
  vec2 uv =
    vUv - 0.5;

  float radius =
    length(uv);

  float ring =
    1.0 -
    smoothstep(
      0.19,
      0.22,
      abs(radius - 0.35)
    );

  float glow =
    1.0 -
    smoothstep(
      0.0,
      0.42,
      abs(radius - 0.35)
    );

  float flow =
    sin(
      atan(uv.y, uv.x) * 11.0 -
      uTime * 2.2
    ) * 0.5 + 0.5;

  vec3 cyan =
    vec3(
      0.40,
      0.91,
      0.98
    );

  vec3 violet =
    vec3(
      0.58,
      0.43,
      0.95
    );

  vec3 color =
    mix(
      violet,
      cyan,
      flow
    );

  float alpha =
    ring *
    (
      0.32 +
      0.6 *
      uEnergy
    ) +
    glow *
    0.08 *
    uEnergy;

  gl_FragColor =
    vec4(
      color,
      alpha
    );
}
`;

export default function PortalGate({
  progress,
  reduced,
}: PortalGateProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const shaderRef =
    useRef<THREE.ShaderMaterial | null>(
      null,
    );

  const uniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },
        uEnergy: {
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
      const group =
        groupRef.current;

      const shader =
        shaderRef.current;

      if (
        !group ||
        !shader
      ) {
        return;
      }

      const p =
        reduced
          ? 0
          : progress.get();

      const scaled =
        p * 4;

      const local =
        scaled -
        Math.floor(
          scaled,
        );

      const pulse =
        Math.pow(
          Math.sin(
            local *
            Math.PI,
          ),
          2.2,
        );

      shader.uniforms.uTime.value =
        state.clock.elapsedTime;

      shader.uniforms.uEnergy.value =
        THREE.MathUtils.damp(
          shader.uniforms.uEnergy.value,
          pulse,
          6,
          delta,
        );

      const targetScale =
        0.25 +
        pulse * 2.7;

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          5,
          delta,
        ),
      );

      group.rotation.z +=
        delta *
        (
          0.18 +
          pulse * 0.55
        );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          1.8 -
          pulse * 4.3,
          5,
          delta,
        );
    },
  );

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        1.8,
      ]}
    >
      <mesh>
        <planeGeometry
          args={[
            5.8,
            5.8,
            1,
            1,
          ]}
        />

        <shaderMaterial
          ref={shaderRef}
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
          side={
            THREE.DoubleSide
          }
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <torusGeometry
          args={[
            2.05,
            0.025,
            14,
            160,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.38}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          0,
          0,
          Math.PI / 4,
        ]}
      >
        <torusGeometry
          args={[
            2.3,
            0.014,
            12,
            140,
          ]}
        />

        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.18}
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