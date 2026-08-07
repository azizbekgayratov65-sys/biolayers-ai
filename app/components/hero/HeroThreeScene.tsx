"use client";

import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

const PARTICLE_COUNT = 11000;
const CYCLE_SECONDS = 15;

function getCycleState(time: number) {
  const normalized =
    (time % CYCLE_SECONDS) /
    CYCLE_SECONDS;

  const stageFloat =
    normalized * 5;

  return {
    stage:
      Math.floor(stageFloat) % 5,
    local:
      stageFloat -
      Math.floor(stageFloat),
    progress: stageFloat,
  };
}

type Palette = readonly [
  string,
  string,
  string,
];

const PALETTES: readonly Palette[] = [
  ["#33E6FF", "#8B5CF6", "#FF4FA3"],
  ["#6EE7FF", "#A78BFA", "#F8FAFC"],
  ["#60A5FA", "#C084FC", "#F472B6"],
  ["#22D3EE", "#8B5CF6", "#FB7185"],
  ["#7DD3FC", "#FFFFFF", "#C084FC"],
];

function random(
  min: number,
  max: number,
) {
  return (
    min + Math.random() * (max - min)
  );
}

function colorVector(hex: string) {
  return new THREE.Vector3(
    ...new THREE.Color(hex).toArray(),
  );
}

function createPortalRing(
  count: number,
) {
  const data =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const i = index * 3;

    const angle =
      random(0, Math.PI * 2);

    const radius =
      3.25 +
      random(-0.18, 0.18) +
      Math.sin(angle * 7) * 0.04;

    const verticalScale = 0.82;

    data[i] =
      Math.cos(angle) * radius;

    data[i + 1] =
      Math.sin(angle) *
        radius *
        verticalScale +
      random(-0.045, 0.045);

    data[i + 2] =
      random(-0.35, 0.35) +
      Math.sin(angle * 4) * 0.08;
  }

  return data;
}

function createVortex(
  count: number,
) {
  const data =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const i = index * 3;
    const t = index / count;

    const y =
      (t - 0.5) * 7.2;

    const pinch =
      0.22 +
      Math.pow(
        Math.abs(t - 0.5) * 2,
        1.5,
      ) *
        2.1;

    const angle =
      t * Math.PI * 42 +
      random(-0.6, 0.6);

    data[i] =
      Math.cos(angle) *
      pinch;

    data[i + 1] =
      y +
      random(-0.06, 0.06);

    data[i + 2] =
      Math.sin(angle) *
      pinch;
  }

  return data;
}

function createDNA(
  count: number,
) {
  const data =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const i = index * 3;
    const t = index / count;
    const strand =
      index % 2 === 0
        ? 0
        : Math.PI;

    const angle =
      t * Math.PI * 20 +
      strand;

    const y =
      (t - 0.5) * 7.4;

    const radius =
      1.28 +
      random(-0.055, 0.055);

    data[i] =
      Math.cos(angle) *
      radius;

    data[i + 1] =
      y +
      random(-0.04, 0.04);

    data[i + 2] =
      Math.sin(angle) *
      radius;

    // More particles form DNA rungs so the helix reads clearly.
    if (index % 6 === 0) {
      const bridge =
        random(-1, 1);

      data[i] =
        Math.cos(angle) *
        radius *
        bridge;

      data[i + 2] =
        Math.sin(angle) *
        radius *
        bridge;
    }
  }

  return data;
}

function createWave(
  count: number,
) {
  const data =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const i = index * 3;

    const x =
      random(-7.8, 7.8);

    const z =
      random(-1.9, 1.9);

    const y =
      Math.sin(
        x * 1.15 + z * 1.8,
      ) *
        0.34 +
      Math.sin(x * 2.8) *
        0.12 +
      random(-0.09, 0.09);

    data[i] = x;
    data[i + 1] = y - 1.8;
    data[i + 2] = z;
  }

  return data;
}

function createGalaxy(
  count: number,
) {
  const data =
    new Float32Array(count * 3);

  const arms = 4;

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const i = index * 3;

    const radius =
      Math.pow(
        Math.random(),
        0.58,
      ) * 5.6;

    const arm =
      index % arms;

    const angle =
      (arm / arms) *
        Math.PI *
        2 +
      radius * 1.5 +
      random(-0.42, 0.42);

    data[i] =
      Math.cos(angle) * radius;

    data[i + 1] =
      random(-0.18, 0.18) *
      (1 + radius * 0.08);

    data[i + 2] =
      Math.sin(angle) * radius;

    if (
      index <
      count * 0.16
    ) {
      data[i] =
        random(-0.72, 0.72);

      data[i + 1] =
        random(-0.24, 0.24);

      data[i + 2] =
        random(-0.72, 0.72);
    }
  }

  return data;
}

function createProgress(
  count: number,
) {
  const data =
    new Float32Array(count);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    data[index] =
      index /
      Math.max(
        count - 1,
        1,
      );
  }

  return data;
}

function ParticleMorph() {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const shapes = useMemo(
    () => [
      createPortalRing(
        PARTICLE_COUNT,
      ),
      createVortex(
        PARTICLE_COUNT,
      ),
      createDNA(
        PARTICLE_COUNT,
      ),
      createWave(
        PARTICLE_COUNT,
      ),
      createGalaxy(
        PARTICLE_COUNT,
      ),
    ],
    [],
  );

  const particleProgress =
    useMemo(
      () =>
        createProgress(
          PARTICLE_COUNT,
        ),
      [],
    );

  const geometry =
    useMemo(() => {
      const next =
        new THREE.BufferGeometry();

      next.setAttribute(
        "position",
        new THREE.BufferAttribute(
          shapes[0],
          3,
        ),
      );

      next.setAttribute(
        "aShape1",
        new THREE.BufferAttribute(
          shapes[1],
          3,
        ),
      );

      next.setAttribute(
        "aShape2",
        new THREE.BufferAttribute(
          shapes[2],
          3,
        ),
      );

      next.setAttribute(
        "aShape3",
        new THREE.BufferAttribute(
          shapes[3],
          3,
        ),
      );

      next.setAttribute(
        "aShape4",
        new THREE.BufferAttribute(
          shapes[4],
          3,
        ),
      );

      next.setAttribute(
        "aParticleProgress",
        new THREE.BufferAttribute(
          particleProgress,
          1,
        ),
      );

      next.computeBoundingSphere();

      return next;
    }, [
      particleProgress,
      shapes,
    ]);

  const material =
    useMemo(() => {
      const uniforms: Record<
        string,
        THREE.IUniform
      > = {
        uTime: {
          value: 0,
        },
        uProgress: {
          value: 0,
        },
        uPointSize: {
          value: 3.8,
        },
        uOpacity: {
          value: 0.98,
        },
      };

      PALETTES.forEach(
        (
          palette,
          paletteIndex,
        ) => {
          uniforms[
            `uPalette${paletteIndex}A`
          ] = {
            value:
              colorVector(
                palette[0],
              ),
          };

          uniforms[
            `uPalette${paletteIndex}B`
          ] = {
            value:
              colorVector(
                palette[1],
              ),
          };

          uniforms[
            `uPalette${paletteIndex}C`
          ] = {
            value:
              colorVector(
                palette[2],
              ),
          };
        },
      );

      return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending:
          THREE.AdditiveBlending,
        toneMapped: false,
        uniforms,

        vertexShader: `
          uniform float uTime;
          uniform float uProgress;
          uniform float uPointSize;

          uniform vec3 uPalette0A;
          uniform vec3 uPalette0B;
          uniform vec3 uPalette0C;
          uniform vec3 uPalette1A;
          uniform vec3 uPalette1B;
          uniform vec3 uPalette1C;
          uniform vec3 uPalette2A;
          uniform vec3 uPalette2B;
          uniform vec3 uPalette2C;
          uniform vec3 uPalette3A;
          uniform vec3 uPalette3B;
          uniform vec3 uPalette3C;
          uniform vec3 uPalette4A;
          uniform vec3 uPalette4B;
          uniform vec3 uPalette4C;

          attribute vec3 aShape1;
          attribute vec3 aShape2;
          attribute vec3 aShape3;
          attribute vec3 aShape4;
          attribute float aParticleProgress;

          varying vec3 vColor;
          varying float vAlpha;

          vec3 shapeAt(float index) {
            if (index < 0.5) return position;
            if (index < 1.5) return aShape1;
            if (index < 2.5) return aShape2;
            if (index < 3.5) return aShape3;
            return aShape4;
          }

          vec3 paletteA(float index) {
            if (index < 0.5) return uPalette0A;
            if (index < 1.5) return uPalette1A;
            if (index < 2.5) return uPalette2A;
            if (index < 3.5) return uPalette3A;
            return uPalette4A;
          }

          vec3 paletteB(float index) {
            if (index < 0.5) return uPalette0B;
            if (index < 1.5) return uPalette1B;
            if (index < 2.5) return uPalette2B;
            if (index < 3.5) return uPalette3B;
            return uPalette4B;
          }

          vec3 paletteC(float index) {
            if (index < 0.5) return uPalette0C;
            if (index < 1.5) return uPalette1C;
            if (index < 2.5) return uPalette2C;
            if (index < 3.5) return uPalette3C;
            return uPalette4C;
          }

          float ease(float x) {
            return x * x * (3.0 - 2.0 * x);
          }

          void main() {
            float startIndex = floor(uProgress);
            float endIndex = mod(startIndex + 1.0, 5.0);
            float local = fract(uProgress);
            float e = ease(local);

            vec3 p0 = shapeAt(startIndex);
            vec3 p1 = shapeAt(endIndex);
            vec3 p = mix(p0, p1, e);

            float pulse =
              sin(
                uTime * 1.65 +
                aParticleProgress * 38.0
              ) * 0.025;

            float breathing =
              cos(
                uTime * 0.8 +
                p.x * 1.2 +
                p.y * 0.7
              ) * 0.014;

            p +=
              normalize(
                p + vec3(0.0001)
              ) *
              (pulse + breathing);

            float lightWave =
              0.5 +
              0.5 *
              sin(
                aParticleProgress * 48.0 +
                uTime * 1.15 +
                p.x * 0.55
              );

            float accent =
              pow(
                lightWave,
                6.0
              );

            vec3 base0 =
              mix(
                paletteA(startIndex),
                paletteB(startIndex),
                lightWave
              );

            vec3 base1 =
              mix(
                paletteA(endIndex),
                paletteB(endIndex),
                lightWave
              );

            vec3 base =
              mix(
                base0,
                base1,
                e
              );

            vec3 accentColor =
              mix(
                paletteC(startIndex),
                paletteC(endIndex),
                e
              );

            vColor =
              mix(
                base,
                accentColor,
                accent
              ) *
              (
                1.0 +
                accent * 1.15
              );

            vAlpha =
              0.72 +
              accent * 0.28;

            vec4 mv =
              modelViewMatrix *
              vec4(
                p,
                1.0
              );

            gl_Position =
              projectionMatrix *
              mv;

            gl_PointSize =
              uPointSize *
              (
                8.0 /
                max(
                  -mv.z,
                  0.1
                )
              );
          }
        `,

        fragmentShader: `
          uniform float uOpacity;

          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            float d =
              distance(
                gl_PointCoord,
                vec2(0.5)
              );

            float glow =
              1.0 -
              smoothstep(
                0.05,
                0.5,
                d
              );

            float core =
              1.0 -
              smoothstep(
                0.0,
                0.13,
                d
              );

            vec3 color =
              vColor *
              (
                glow * 1.85 +
                core * 3.7
              );

            gl_FragColor =
              vec4(
                color,
                glow *
                vAlpha *
                uOpacity
              );
          }
        `,
      });
    }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [
    geometry,
    material,
  ]);

  useFrame(
    (state, delta) => {
      const points =
        pointsRef.current;

      if (!points) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      const cycle =
        (time %
          CYCLE_SECONDS) /
        CYCLE_SECONDS;

      const target =
        cycle * 5;

      material.uniforms.uTime.value =
        time;

      material.uniforms.uProgress.value =
        target;

      points.rotation.y =
        THREE.MathUtils.damp(
          points.rotation.y,
          Math.sin(time * 0.11) *
            0.08,
          1.6,
          delta,
        );

      points.rotation.x =
        THREE.MathUtils.damp(
          points.rotation.x,
          Math.sin(time * 0.08) *
            0.04,
          1.6,
          delta,
        );

      const stage =
        Math.floor(target) % 5;

      const desiredY =
        stage === 3
          ? 1.25
          : 0;

      points.position.y =
        THREE.MathUtils.damp(
          points.position.y,
          desiredY,
          2.1,
          delta,
        );

      const desiredScale =
        stage === 0
          ? 1.05
          : stage === 4
            ? 1.1
            : 1;

      const nextScale =
        THREE.MathUtils.damp(
          points.scale.x,
          desiredScale,
          2.2,
          delta,
        );

      points.scale.setScalar(
        nextScale,
      );
    },
  );

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}

function StarField() {
  const ref =
    useRef<THREE.Points | null>(
      null,
    );

  const geometry =
    useMemo(() => {
      const positions =
        new Float32Array(
          2200 * 3,
        );

      const colors =
        new Float32Array(
          2200 * 3,
        );

      const cyan =
        new THREE.Color(
          "#38BDF8",
        );
      const violet =
        new THREE.Color(
          "#A855F7",
        );
      const pink =
        new THREE.Color(
          "#F472B6",
        );

      for (
        let index = 0;
        index < 2200;
        index += 1
      ) {
        const i = index * 3;

        positions[i] =
          random(-18, 18);
        positions[i + 1] =
          random(-11, 11);
        positions[i + 2] =
          random(-17, 1);

        const color =
          index % 3 === 0
            ? cyan
            : index % 3 === 1
              ? violet
              : pink;

        const brightness =
          random(0.3, 1.2);

        colors[i] =
          color.r *
          brightness;
        colors[i + 1] =
          color.g *
          brightness;
        colors[i + 2] =
          color.b *
          brightness;
      }

      const next =
        new THREE.BufferGeometry();

      next.setAttribute(
        "position",
        new THREE.BufferAttribute(
          positions,
          3,
        ),
      );

      next.setAttribute(
        "color",
        new THREE.BufferAttribute(
          colors,
          3,
        ),
      );

      return next;
    }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame(
    (state) => {
      if (!ref.current) {
        return;
      }

      ref.current.rotation.y =
        state.clock.elapsedTime *
        0.004;
    },
  );

  return (
    <points
      ref={ref}
      geometry={geometry}
    >
      <pointsMaterial
        vertexColors
        size={0.025}
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </points>
  );
}

function PortalCore() {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const outerMaterialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  const innerMaterialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  useFrame((state) => {
    const group =
      groupRef.current;

    if (!group) {
      return;
    }

    const {
      stage,
      local,
    } = getCycleState(
      state.clock.elapsedTime,
    );

    group.visible = stage === 0;

    if (!group.visible) {
      return;
    }

    group.rotation.z =
      state.clock.elapsedTime *
      0.055;

    const pulse =
      1 +
      Math.sin(
        state.clock.elapsedTime *
          2.2,
      ) *
        0.018;

    group.scale.setScalar(
      pulse,
    );

    if (
      outerMaterialRef.current
    ) {
      outerMaterialRef.current.opacity =
        0.2 +
        Math.sin(
          local * Math.PI,
        ) *
          0.28;
    }

    if (
      innerMaterialRef.current
    ) {
      innerMaterialRef.current.opacity =
        0.62 +
        Math.sin(
          state.clock.elapsedTime *
            2.8,
        ) *
          0.16;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, -0.2]}
    >
      {/* Dark portal center */}
      <mesh position={[0, 0, -0.08]}>
        <circleGeometry
          args={[2.72, 160]}
        />

        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.94}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Diffuse outer halo */}
      <mesh>
        <ringGeometry
          args={[
            2.72,
            3.42,
            220,
          ]}
        />

        <meshBasicMaterial
          ref={
            outerMaterialRef
          }
          color="#7C3CFF"
          transparent
          opacity={0.34}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Hot cyan rim */}
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry
          args={[
            2.92,
            3.035,
            220,
          ]}
        />

        <meshBasicMaterial
          ref={
            innerMaterialRef
          }
          color="#A5F3FC"
          transparent
          opacity={0.78}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Magenta secondary rim */}
      <mesh
        position={[0, 0, -0.01]}
        rotation={[
          0,
          0,
          Math.PI / 8,
        ]}
      >
        <ringGeometry
          args={[
            3.08,
            3.13,
            220,
          ]}
        />

        <meshBasicMaterial
          color="#F472B6"
          transparent
          opacity={0.42}
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

function GalaxyCore() {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const hotRingRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  useFrame((state) => {
    const group =
      groupRef.current;

    if (!group) {
      return;
    }

    const {
      stage,
    } = getCycleState(
      state.clock.elapsedTime,
    );

    group.visible = stage === 4;

    if (!group.visible) {
      return;
    }

    group.rotation.z =
      state.clock.elapsedTime *
      0.11;

    group.rotation.x =
      Math.PI / 2.45;

    if (hotRingRef.current) {
      hotRingRef.current.opacity =
        0.32 +
        Math.sin(
          state.clock.elapsedTime *
            2.4,
        ) *
          0.09;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Wide violet accretion disk */}
      <mesh>
        <ringGeometry
          args={[
            0.62,
            2.55,
            180,
          ]}
        />

        <meshBasicMaterial
          color="#A855F7"
          transparent
          opacity={0.11}
          side={
            THREE.DoubleSide
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* White-hot inner disk */}
      <mesh
        position={[0, 0, 0.025]}
      >
        <ringGeometry
          args={[
            0.56,
            1.18,
            180,
          ]}
        />

        <meshBasicMaterial
          ref={hotRingRef}
          color="#F8FAFC"
          transparent
          opacity={0.36}
          side={
            THREE.DoubleSide
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Cyan lensing rim */}
      <mesh
        position={[0, 0, 0.045]}
      >
        <ringGeometry
          args={[
            0.47,
            0.61,
            180,
          ]}
        />

        <meshBasicMaterial
          color="#67E8F9"
          transparent
          opacity={0.68}
          side={
            THREE.DoubleSide
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Singularity */}
      <mesh
        position={[0, 0, 0.07]}
      >
        <circleGeometry
          args={[
            0.49,
            140,
          ]}
        />

        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={1}
          side={
            THREE.DoubleSide
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ShockwaveRing({
  delay = 0,
  color = "#67E8F9",
}: {
  delay?: number;
  color?: string;
}) {
  const meshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const materialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  useFrame((state) => {
    const mesh =
      meshRef.current;

    const material =
      materialRef.current;

    if (!mesh || !material) {
      return;
    }

    const {
      local,
    } = getCycleState(
      state.clock.elapsedTime,
    );

    const raw =
      (local -
        (0.7 + delay)) /
      0.28;

    const progress =
      THREE.MathUtils.clamp(
        raw,
        0,
        1,
      );

    const opacity =
      Math.sin(
        progress * Math.PI,
      );

    mesh.visible =
      progress > 0 &&
      progress < 1;

    const scale =
      THREE.MathUtils.lerp(
        0.45,
        7.4,
        progress,
      );

    mesh.scale.setScalar(
      scale,
    );

    material.opacity =
      opacity * 0.36;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -0.08]}
    >
      <ringGeometry
        args={[
          0.93,
          1,
          180,
        ]}
      />

      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function EnergyTrails() {
  const ref =
    useRef<THREE.LineSegments | null>(
      null,
    );

  const materialRef =
    useRef<THREE.LineBasicMaterial | null>(
      null,
    );

  const geometry =
    useMemo(() => {
      const streaks = 1200;

      const positions =
        new Float32Array(
          streaks * 2 * 3,
        );

      for (
        let index = 0;
        index < streaks;
        index += 1
      ) {
        const offset =
          index * 6;

        const angle =
          random(
            0,
            Math.PI * 2,
          );

        const radius =
          random(0.4, 6.2);

        const length =
          random(0.14, 0.72);

        const flatten =
          random(0.38, 0.78);

        const x =
          Math.cos(angle) *
          radius;

        const y =
          Math.sin(angle) *
          radius *
          flatten;

        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] =
          random(-0.8, 0.8);

        positions[offset + 3] =
          Math.cos(angle) *
          (radius + length);

        positions[offset + 4] =
          Math.sin(angle) *
          (radius + length) *
          flatten;

        positions[offset + 5] =
          positions[offset + 2];
      }

      const next =
        new THREE.BufferGeometry();

      next.setAttribute(
        "position",
        new THREE.BufferAttribute(
          positions,
          3,
        ),
      );

      return next;
    }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const lines =
      ref.current;

    const material =
      materialRef.current;

    if (!lines || !material) {
      return;
    }

    const {
      local,
    } = getCycleState(
      state.clock.elapsedTime,
    );

    const transition =
      THREE.MathUtils.smoothstep(
        local,
        0.66,
        1,
      );

    material.opacity =
      transition * 0.48;

    lines.rotation.z =
      state.clock.elapsedTime *
      0.03;

    lines.scale.setScalar(
      1 +
        transition * 0.18,
    );
  });

  return (
    <lineSegments
      ref={ref}
      geometry={geometry}
    >
      <lineBasicMaterial
        ref={materialRef}
        color="#A5F3FC"
        transparent
        opacity={0}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function TransitionFlash() {
  const meshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const materialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  useFrame((state) => {
    const mesh =
      meshRef.current;

    const material =
      materialRef.current;

    if (!mesh || !material) {
      return;
    }

    const {
      local,
      stage,
    } = getCycleState(
      state.clock.elapsedTime,
    );

    const flashStart = 0.91;
    const flashEnd = 0.995;

    const raw =
      (local - flashStart) /
      (flashEnd - flashStart);

    const p =
      THREE.MathUtils.clamp(
        raw,
        0,
        1,
      );

    const intensity =
      Math.sin(
        p * Math.PI,
      );

    mesh.visible =
      intensity > 0.001;

    material.opacity =
      intensity *
      (stage === 4
        ? 0.34
        : 0.22);

    const scale =
      THREE.MathUtils.lerp(
        0.65,
        5.6,
        p,
      );

    mesh.scale.setScalar(
      scale,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 1.2]}
    >
      <circleGeometry
        args={[
          1,
          96,
        ]}
      />

      <meshBasicMaterial
        ref={materialRef}
        color="#F8FAFC"
        transparent
        opacity={0}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ChromaticRings() {
  const redRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const blueRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const redMaterialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  const blueMaterialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  useFrame((state) => {
    const {
      local,
    } = getCycleState(
      state.clock.elapsedTime,
    );

    const strength =
      THREE.MathUtils.smoothstep(
        local,
        0.84,
        1,
      );

    const offset =
      strength * 0.06;

    if (redRef.current) {
      redRef.current.position.x =
        offset;
      redRef.current.scale.setScalar(
        1 + strength * 0.16,
      );
      redRef.current.rotation.z =
        state.clock.elapsedTime *
        0.04;
    }

    if (blueRef.current) {
      blueRef.current.position.x =
        -offset;
      blueRef.current.scale.setScalar(
        1 + strength * 0.12,
      );
      blueRef.current.rotation.z =
        -state.clock.elapsedTime *
        0.035;
    }

    if (redMaterialRef.current) {
      redMaterialRef.current.opacity =
        strength * 0.11;
    }

    if (blueMaterialRef.current) {
      blueMaterialRef.current.opacity =
        strength * 0.11;
    }
  });

  return (
    <group position={[0, 0, -0.05]}>
      <mesh ref={redRef}>
        <ringGeometry
          args={[
            2.95,
            3.04,
            180,
          ]}
        />
        <meshBasicMaterial
          ref={redMaterialRef}
          color="#FB7185"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={blueRef}>
        <ringGeometry
          args={[
            2.95,
            3.04,
            180,
          ]}
        />
        <meshBasicMaterial
          ref={blueMaterialRef}
          color="#60A5FA"
          transparent
          opacity={0}
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

function CameraRig() {
  const { camera } =
    useThree();

  useFrame(
    (state, delta) => {
      const time =
        state.clock.elapsedTime;

      const {
        stage,
        local,
      } = getCycleState(
        time,
      );

      let targetZ = 8.7;

      if (stage === 0) {
        targetZ =
          THREE.MathUtils.lerp(
            9.15,
            8.45,
            local,
          );
      }

      if (stage === 1) {
        targetZ =
          THREE.MathUtils.lerp(
            8.45,
            7.85,
            local,
          );
      }

      if (stage === 2) {
        targetZ =
          7.82 +
          Math.sin(
            local * Math.PI,
          ) *
            -0.28;
      }

      if (stage === 3) {
        targetZ =
          THREE.MathUtils.lerp(
            8.05,
            9.05,
            local,
          );
      }

      if (stage === 4) {
        targetZ =
          THREE.MathUtils.lerp(
            9.0,
            8.18,
            local,
          );
      }

      camera.position.z =
        THREE.MathUtils.damp(
          camera.position.z,
          targetZ,
          2.4,
          delta,
        );

      camera.position.x =
        THREE.MathUtils.damp(
          camera.position.x,
          Math.sin(
            time * 0.13,
          ) *
            0.1,
          1.7,
          delta,
        );

      camera.position.y =
        THREE.MathUtils.damp(
          camera.position.y,
          Math.cos(
            time * 0.11,
          ) *
            0.07,
          1.7,
          delta,
        );

      const targetX =
        stage === 2
          ? 0.08
          : 0;

      camera.lookAt(
        targetX,
        stage === 3
          ? -0.18
          : 0,
        0,
      );
    },
  );

  return null;
}

function PostFX() {
  return (
    <EffectComposer
      multisampling={0}
      enableNormalPass={false}
    >
      <Bloom
        intensity={4.15}
        luminanceThreshold={0.03}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      <Noise opacity={0.012} />

      <Vignette
        eskil={false}
        offset={0.11}
        darkness={0.93}
      />
    </EffectComposer>
  );
}

export default function HeroThreeScene() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{
          position: [
            0,
            0,
            8.7,
          ],
          fov: 47,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference:
            "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        <color
          attach="background"
          args={["#01030B"]}
        />

        <fog
          attach="fog"
          args={[
            "#01030B",
            9,
            24,
          ]}
        />

        <StarField />
        <EnergyTrails />
        <ShockwaveRing />
        <ShockwaveRing
          delay={0.06}
          color="#C084FC"
        />
        <ChromaticRings />
        <TransitionFlash />
        <PortalCore />
        <GalaxyCore />
        <ParticleMorph />
        <CameraRig />
        <PostFX />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,3,10,.02)_42%,rgba(1,3,10,.58)_80%,#01030a_100%)]" />
    </div>
  );
}