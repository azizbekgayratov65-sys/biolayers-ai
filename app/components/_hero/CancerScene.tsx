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

const PARTICLE_COUNT = 7000;

const GLOBAL_POINTER = {
  x: 0,
  y: 0,
};

const POINTER_TARGET = {
  x: 0,
  y: 0,
};

let PAGE_VISIBLE = true;

type PaletteColor = readonly [
  number,
  number,
  number,
];

type ShapePalette = readonly [
  PaletteColor,
  PaletteColor,
  PaletteColor,
];

function rgb(hex: string): PaletteColor {
  const color = new THREE.Color(hex);

  return [
    color.r,
    color.g,
    color.b,
  ];
}

/*
  Палитры соответствуют пяти состояниям:

  0 — Cell
  1 — DNA
  2 — Wave
  3 — Vortex
  4 — Galaxy
*/
const SHAPE_PALETTES: readonly ShapePalette[] = [
  // Cell — биолюминесцентный океан
  [
    rgb("#00F5D4"),
    rgb("#B8FF5A"),
    rgb("#FF4FA3"),
  ],

  // DNA — ультрафиолетовый кристалл
  [
    rgb("#7C3CFF"),
    rgb("#5DE8FF"),
    rgb("#F8FBFF"),
  ],

  // Wave — электрическая аврора
  [
    rgb("#0066FF"),
    rgb("#39FF88"),
    rgb("#FFE66D"),
  ],

  // Vortex — сверхъестественное пламя
  [
    rgb("#FF2EA6"),
    rgb("#FF7A00"),
    rgb("#6D28D9"),
  ],

  // Galaxy — космическая плазма
  [
    rgb("#2563FF"),
    rgb("#FFFFFF"),
    rgb("#00E5FF"),
  ],
];

function randomBetween(
  minimum: number,
  maximum: number,
) {
  return (
    minimum +
    Math.random() * (maximum - minimum)
  );
}

/*
  Получает движение мыши по всему окну,
  включая область над текстом и формой.
*/
function GlobalPointerTracker() {
  useEffect(() => {
    function handlePointerMove(
      event: PointerEvent,
    ) {
      POINTER_TARGET.x =
        (event.clientX / window.innerWidth) *
          2 -
        1;

      POINTER_TARGET.y =
        -(
          (event.clientY /
            window.innerHeight) *
            2 -
          1
        );
    }

    function handlePointerLeave() {
      POINTER_TARGET.x = 0;
      POINTER_TARGET.y = 0;
    }

    function handleVisibilityChange() {
      PAGE_VISIBLE =
        document.visibilityState ===
        "visible";
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    document.addEventListener(
      "mouseleave",
      handlePointerLeave,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      document.removeEventListener(
        "mouseleave",
        handlePointerLeave,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  useFrame((_, delta) => {
    if (!PAGE_VISIBLE) {
      return;
    }

    GLOBAL_POINTER.x =
      THREE.MathUtils.damp(
        GLOBAL_POINTER.x,
        POINTER_TARGET.x,
        11,
        delta,
      );

    GLOBAL_POINTER.y =
      THREE.MathUtils.damp(
        GLOBAL_POINTER.y,
        POINTER_TARGET.y,
        11,
        delta,
      );
  });

  return null;
}

function createCellShape(count: number) {
  const positions =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;

    const phi = Math.acos(
      randomBetween(-1, 1),
    );

    const theta = randomBetween(
      0,
      Math.PI * 2,
    );

    const surfaceNoise =
      Math.sin(theta * 6) * 0.12 +
      Math.cos(phi * 8) * 0.09 +
      Math.sin(theta * 11 + phi * 4) *
        0.04;

    const radius =
      2.15 +
      surfaceNoise +
      randomBetween(-0.12, 0.12);

    positions[offset] =
      radius *
      Math.sin(phi) *
      Math.cos(theta);

    positions[offset + 1] =
      radius *
      Math.sin(phi) *
      Math.sin(theta);

    positions[offset + 2] =
      radius * Math.cos(phi);
  }

  return positions;
}

function createDnaShape(count: number) {
  const positions =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;
    const progress = index / count;

    const angle =
      progress * Math.PI * 20;

    const y =
      (progress - 0.5) * 7;

    const strand =
      index % 2 === 0 ? 1 : -1;

    const radius =
      1.05 +
      randomBetween(-0.07, 0.07);

    positions[offset] =
      Math.cos(angle) *
      radius *
      strand;

    positions[offset + 1] =
      y +
      randomBetween(-0.05, 0.05);

    positions[offset + 2] =
      Math.sin(angle) *
      radius *
      strand;

    /*
      Некоторые частицы создают
      горизонтальные перемычки ДНК.
    */
    if (index % 12 === 0) {
      const bridge =
        randomBetween(-1, 1);

      positions[offset] =
        Math.cos(angle) *
        radius *
        bridge;

      positions[offset + 2] =
        Math.sin(angle) *
        radius *
        bridge;
    }
  }

  return positions;
}

function createWaveShape(count: number) {
  const positions =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;

    const x = randomBetween(
      -6.5,
      6.5,
    );

    const z = randomBetween(
      -2.5,
      2.5,
    );

    const distance = Math.sqrt(
      x * x + z * z,
    );

    const y =
      Math.sin(
        x * 1.3 + z * 0.75,
      ) *
        0.5 +
      Math.cos(distance * 1.7) *
        0.24;

    positions[offset] = x;

    positions[offset + 1] =
      y +
      randomBetween(-0.11, 0.11);

    positions[offset + 2] = z;
  }

  return positions;
}

function createVortexShape(count: number) {
  const positions =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;
    const progress = index / count;

    const angle =
      progress * Math.PI * 38 +
      randomBetween(-0.35, 0.35);

    const height =
      (progress - 0.5) * 7.4;

    const radius =
      0.2 +
      Math.abs(progress - 0.5) *
        4.6 +
      randomBetween(-0.12, 0.12);

    positions[offset] =
      Math.cos(angle) * radius;

    positions[offset + 1] =
      height +
      Math.sin(angle * 0.4) *
        0.14;

    positions[offset + 2] =
      Math.sin(angle) * radius;
  }

  return positions;
}

function createGalaxyShape(count: number) {
  const positions =
    new Float32Array(count * 3);

  const arms = 4;

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;

    const radius =
      Math.pow(
        Math.random(),
        0.62,
      ) * 5.2;

    const arm = index % arms;

    const baseAngle =
      (arm / arms) *
      Math.PI *
      2;

    const angle =
      baseAngle +
      radius * 1.45 +
      randomBetween(-0.38, 0.38);

    positions[offset] =
      Math.cos(angle) * radius;

    positions[offset + 1] =
      randomBetween(-0.2, 0.2) *
      (1 + radius * 0.1);

    positions[offset + 2] =
      Math.sin(angle) * radius;

    /*
      Создаём яркое плотное ядро.
    */
    if (index < count * 0.14) {
      positions[offset] =
        randomBetween(-0.72, 0.72);

      positions[offset + 1] =
        randomBetween(-0.42, 0.42);

      positions[offset + 2] =
        randomBetween(-0.72, 0.72);
    }
  }

  return positions;
}

function createInitialColors(
  count: number,
) {
  const colors =
    new Float32Array(count * 3);

  const palette =
    SHAPE_PALETTES[0];

  for (
    let particleIndex = 0;
    particleIndex < count;
    particleIndex += 1
  ) {
    const offset =
      particleIndex * 3;

    const progress =
      particleIndex /
      Math.max(count - 1, 1);

    const blend =
      0.5 +
      Math.sin(
        progress * Math.PI * 12,
      ) *
        0.5;

    colors[offset] =
      THREE.MathUtils.lerp(
        palette[0][0],
        palette[1][0],
        blend,
      );

    colors[offset + 1] =
      THREE.MathUtils.lerp(
        palette[0][1],
        palette[1][1],
        blend,
      );

    colors[offset + 2] =
      THREE.MathUtils.lerp(
        palette[0][2],
        palette[1][2],
        blend,
      );
  }

  return colors;
}


function createParticleProgress(
  count: number,
) {
  const progress =
    new Float32Array(count);

  const denominator =
    Math.max(count - 1, 1);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    progress[index] =
      index / denominator;
  }

  return progress;
}

function paletteVector(
  paletteIndex: number,
  colorIndex: number,
) {
  const color =
    SHAPE_PALETTES[paletteIndex][
      colorIndex
    ];

  return new THREE.Vector3(
    color[0],
    color[1],
    color[2],
  );
}

function ParticleUniverse() {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const smoothProgressRef =
    useRef(0);

  const shapes = useMemo(
    () => [
      createCellShape(
        PARTICLE_COUNT,
      ),
      createDnaShape(
        PARTICLE_COUNT,
      ),
      createWaveShape(
        PARTICLE_COUNT,
      ),
      createVortexShape(
        PARTICLE_COUNT,
      ),
      createGalaxyShape(
        PARTICLE_COUNT,
      ),
    ],
    [],
  );

  const particleProgress = useMemo(
    () =>
      createParticleProgress(
        PARTICLE_COUNT,
      ),
    [],
  );

  const geometry = useMemo(() => {
    const nextGeometry =
      new THREE.BufferGeometry();

    const attributes = [
      ["position", shapes[0], 3],
      ["aShape1", shapes[1], 3],
      ["aShape2", shapes[2], 3],
      ["aShape3", shapes[3], 3],
      ["aShape4", shapes[4], 3],
      [
        "aParticleProgress",
        particleProgress,
        1,
      ],
    ] as const;

    for (
      const [
        name,
        array,
        itemSize,
      ] of attributes
    ) {
      const attribute =
        new THREE.BufferAttribute(
          array,
          itemSize,
        );

      attribute.setUsage(
        THREE.StaticDrawUsage,
      );

      nextGeometry.setAttribute(
        name,
        attribute,
      );
    }

    nextGeometry.computeBoundingSphere();

    return nextGeometry;
  }, [particleProgress, shapes]);

  const material = useMemo(() => {
    const uniforms: Record<
      string,
      THREE.IUniform
    > = {
      uTime: {
        value: 0,
      },
      uPointSize: {
        value: 3.3,
      },
      uOpacity: {
        value: 0.96,
      },
      uProgress: {
        value: 0,
      },
      uPointerY: {
        value: 0,
      },
    };

    for (
      let paletteIndex = 0;
      paletteIndex < 5;
      paletteIndex += 1
    ) {
      uniforms[
        `uPalette${paletteIndex}A`
      ] = {
        value: paletteVector(
          paletteIndex,
          0,
        ),
      };

      uniforms[
        `uPalette${paletteIndex}B`
      ] = {
        value: paletteVector(
          paletteIndex,
          1,
        ),
      };

      uniforms[
        `uPalette${paletteIndex}C`
      ] = {
        value: paletteVector(
          paletteIndex,
          2,
        ),
      };
    }

    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending:
        THREE.AdditiveBlending,
      toneMapped: false,
      uniforms,

      vertexShader: `
        uniform float uTime;
        uniform float uPointSize;
        uniform float uProgress;
        uniform float uPointerY;

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

        vec3 getShape(float index) {
          if (index < 0.5) {
            return position;
          }

          if (index < 1.5) {
            return aShape1;
          }

          if (index < 2.5) {
            return aShape2;
          }

          if (index < 3.5) {
            return aShape3;
          }

          return aShape4;
        }

        vec3 getPaletteA(float index) {
          if (index < 0.5) {
            return uPalette0A;
          }

          if (index < 1.5) {
            return uPalette1A;
          }

          if (index < 2.5) {
            return uPalette2A;
          }

          if (index < 3.5) {
            return uPalette3A;
          }

          return uPalette4A;
        }

        vec3 getPaletteB(float index) {
          if (index < 0.5) {
            return uPalette0B;
          }

          if (index < 1.5) {
            return uPalette1B;
          }

          if (index < 2.5) {
            return uPalette2B;
          }

          if (index < 3.5) {
            return uPalette3B;
          }

          return uPalette4B;
        }

        vec3 getPaletteC(float index) {
          if (index < 0.5) {
            return uPalette0C;
          }

          if (index < 1.5) {
            return uPalette1C;
          }

          if (index < 2.5) {
            return uPalette2C;
          }

          if (index < 3.5) {
            return uPalette3C;
          }

          return uPalette4C;
        }

        void main() {
          float startIndex =
            floor(uProgress);

          float endIndex =
            min(
              startIndex + 1.0,
              4.0
            );

          float localProgress =
            uProgress - startIndex;

          float easedProgress =
            localProgress *
            localProgress *
            (
              3.0 -
              2.0 * localProgress
            );

          vec3 morphedPosition =
            mix(
              getShape(startIndex),
              getShape(endIndex),
              easedProgress
            );

          float pulse =
            sin(
              uTime * 1.4 +
              morphedPosition.x * 1.7 +
              morphedPosition.y * 1.2
            ) * 0.022;

          float secondaryPulse =
            cos(
              uTime * 0.8 +
              morphedPosition.z * 2.0
            ) * 0.012;

          vec3 animatedPosition =
            morphedPosition +
            normalize(
              morphedPosition +
              vec3(0.0001)
            ) *
            (
              pulse +
              secondaryPulse
            );

          float lightWave =
            0.5 +
            sin(
              aParticleProgress * 34.0 +
              uTime * 0.75 +
              morphedPosition.x * 0.8 +
              morphedPosition.y * 0.45
            ) * 0.5;

          float accentStrength =
            pow(
              lightWave,
              7.0
            );

          vec3 firstBase =
            mix(
              getPaletteA(startIndex),
              getPaletteB(startIndex),
              lightWave
            );

          vec3 secondBase =
            mix(
              getPaletteA(endIndex),
              getPaletteB(endIndex),
              lightWave
            );

          vec3 baseColor =
            mix(
              firstBase,
              secondBase,
              easedProgress
            );

          vec3 accentColor =
            mix(
              getPaletteC(startIndex),
              getPaletteC(endIndex),
              easedProgress
            );

          vec3 finalParticleColor =
            mix(
              baseColor,
              accentColor,
              accentStrength
            );

          float temperatureShift =
            uPointerY * 0.12;

          finalParticleColor.r =
            clamp(
              finalParticleColor.r -
                temperatureShift,
              0.0,
              1.7
            );

          finalParticleColor.b =
            clamp(
              finalParticleColor.b +
                temperatureShift,
              0.0,
              1.7
            );

          float brightness =
            0.82 +
            lightWave * 0.55 +
            accentStrength * 0.75;

          vColor =
            finalParticleColor *
            brightness;

          vec4 modelPosition =
            modelMatrix *
            vec4(
              animatedPosition,
              1.0
            );

          vec4 viewPosition =
            viewMatrix *
            modelPosition;

          gl_Position =
            projectionMatrix *
            viewPosition;

          gl_PointSize =
            uPointSize *
            (
              8.5 /
              max(
                -viewPosition.z,
                0.1
              )
            );
        }
      `,

      fragmentShader: `
        uniform float uOpacity;

        varying vec3 vColor;

        void main() {
          float distanceToCenter =
            distance(
              gl_PointCoord,
              vec2(0.5)
            );

          float glow =
            1.0 -
            smoothstep(
              0.0,
              0.5,
              distanceToCenter
            );

          float core =
            1.0 -
            smoothstep(
              0.0,
              0.12,
              distanceToCenter
            );

          vec3 finalColor =
            vColor *
            (
              glow * 1.8 +
              core * 3.3
            );

          gl_FragColor =
            vec4(
              finalColor,
              glow * uOpacity
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
  }, [geometry, material]);

  useFrame((state, delta) => {
    if (!PAGE_VISIBLE) {
      return;
    }

    const points =
      pointsRef.current;

    if (!points) {
      return;
    }

    const time =
      state.clock.elapsedTime;

    const targetProgress =
      THREE.MathUtils.clamp(
        (GLOBAL_POINTER.x + 1) / 2,
        0,
        1,
      ) *
      (shapes.length - 1);

    smoothProgressRef.current =
      THREE.MathUtils.damp(
        smoothProgressRef.current,
        targetProgress,
        5.1,
        delta,
      );

    material.uniforms.uTime.value =
      time;

    material.uniforms.uProgress.value =
      smoothProgressRef.current;

    material.uniforms.uPointerY.value =
      GLOBAL_POINTER.y;

    points.rotation.x =
      THREE.MathUtils.damp(
        points.rotation.x,
        GLOBAL_POINTER.y * 0.28,
        2.45,
        delta,
      );

    points.rotation.y =
      THREE.MathUtils.damp(
        points.rotation.y,
        GLOBAL_POINTER.x * 0.2 +
          time * 0.012,
        2.15,
        delta,
      );

    points.rotation.z =
      THREE.MathUtils.damp(
        points.rotation.z,
        GLOBAL_POINTER.x *
          GLOBAL_POINTER.y *
          0.1,
        2.15,
        delta,
      );

    points.position.x =
      THREE.MathUtils.damp(
        points.position.x,
        1.2 +
          GLOBAL_POINTER.x * 0.4,
        2.45,
        delta,
      );

    points.position.y =
      THREE.MathUtils.damp(
        points.position.y,
        GLOBAL_POINTER.y * 0.25,
        2.45,
        delta,
      );

    const targetScale =
      1 +
      Math.abs(
        GLOBAL_POINTER.y,
      ) *
        0.055;

    const nextScale =
      THREE.MathUtils.damp(
        points.scale.x,
        targetScale,
        2.45,
        delta,
      );

    points.scale.setScalar(
      nextScale,
    );
  });

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
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const geometry = useMemo(() => {
    const positions =
      new Float32Array(
        1800 * 3,
      );

    const colors =
      new Float32Array(
        1800 * 3,
      );

    const cyan =
      new THREE.Color("#38BDF8");

    const violet =
      new THREE.Color("#A855F7");

    const pink =
      new THREE.Color("#F472B6");

    for (
      let index = 0;
      index < 1800;
      index += 1
    ) {
      const offset = index * 3;

      positions[offset] =
        randomBetween(-18, 18);

      positions[offset + 1] =
        randomBetween(-11, 11);

      positions[offset + 2] =
        randomBetween(-16, 1);

      const baseColor =
        index % 3 === 0
          ? cyan
          : index % 3 === 1
            ? violet
            : pink;

      const brightness =
        randomBetween(0.35, 1.2);

      colors[offset] =
        baseColor.r * brightness;

      colors[offset + 1] =
        baseColor.g * brightness;

      colors[offset + 2] =
        baseColor.b * brightness;
    }

    const nextGeometry =
      new THREE.BufferGeometry();

    nextGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    nextGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3,
      ),
    );

    return nextGeometry;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    if (!PAGE_VISIBLE) {
      return;
    }

    const points =
      pointsRef.current;

    if (!points) {
      return;
    }

    points.rotation.y =
      state.clock.elapsedTime *
        0.004 +
      GLOBAL_POINTER.x * 0.03;

    points.rotation.x =
      GLOBAL_POINTER.y * 0.025;

    points.position.x =
      THREE.MathUtils.damp(
        points.position.x,
        GLOBAL_POINTER.x * -0.22,
        1.52,
        delta,
      );

    points.position.y =
      THREE.MathUtils.damp(
        points.position.y,
        GLOBAL_POINTER.y * -0.14,
        1.52,
        delta,
      );
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
    >
      <pointsMaterial
        vertexColors
        size={0.03}
        transparent
        opacity={0.78}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </points>
  );
}

function CameraRig() {
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (!PAGE_VISIBLE) {
      return;
    }

    camera.position.x =
      THREE.MathUtils.damp(
        camera.position.x,
        GLOBAL_POINTER.x * 0.48,
        1.83,
        delta,
      );

    camera.position.y =
      THREE.MathUtils.damp(
        camera.position.y,
        GLOBAL_POINTER.y * 0.34,
        1.83,
        delta,
      );

    camera.position.z =
      THREE.MathUtils.damp(
        camera.position.z,
        8.7 -
          Math.abs(
            GLOBAL_POINTER.y,
          ) *
            0.25 +
          Math.sin(
            state.clock.elapsedTime *
              0.2,
          ) *
            0.08,
        1.83,
        delta,
      );

    camera.lookAt(
      0.55,
      0,
      0,
    );
  });

  return null;
}

function PostProcessing() {
  return (
    <EffectComposer
      multisampling={0}
      enableNormalPass={false}
    >
      <Bloom
        intensity={2.8}
        luminanceThreshold={0.08}
        luminanceSmoothing={0.88}
        mipmapBlur
      />

      <Noise opacity={0.018} />

      <Vignette
        eskil={false}
        offset={0.14}
        darkness={0.94}
      />
    </EffectComposer>
  );
}

export default function CancerScene() {
  return (
    /*
      Canvas не блокирует форму и кнопки.
      Движение мыши читается через window.
    */
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{
          position: [0, 0, 8.7],
          fov: 47,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{
          min: 0.5,
          max: 1,
          debounce: 200,
        }}
      >
        <GlobalPointerTracker />

        <color
          attach="background"
          args={["#01030B"]}
        />

        <fog
          attach="fog"
          args={[
            "#01030B",
            8,
            22,
          ]}
        />

        <StarField />
        <ParticleUniverse />
        <CameraRig />
        <PostProcessing />
      </Canvas>
    </div>
  );
}