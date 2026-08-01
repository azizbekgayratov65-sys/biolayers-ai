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
      GLOBAL_POINTER.x =
        (event.clientX / window.innerWidth) *
          2 -
        1;

      GLOBAL_POINTER.y =
        -(
          (event.clientY /
            window.innerHeight) *
            2 -
          1
        );
    }

    function handlePointerLeave() {
      GLOBAL_POINTER.x = 0;
      GLOBAL_POINTER.y = 0;
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

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      document.removeEventListener(
        "mouseleave",
        handlePointerLeave,
      );
    };
  }, []);

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

function ParticleUniverse() {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  /*
    Значения прогресса:

    0 — Cell
    1 — DNA
    2 — Wave
    3 — Vortex
    4 — Galaxy
  */
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

  const colors = useMemo(
    () =>
      createInitialColors(
        PARTICLE_COUNT,
      ),
    [],
  );

  const geometry = useMemo(() => {
    const nextGeometry =
      new THREE.BufferGeometry();

    nextGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(
          shapes[0],
        ),
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
  }, [colors, shapes]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexColors: true,

        blending:
          THREE.AdditiveBlending,

        uniforms: {
          uTime: {
            value: 0,
          },

          uPointSize: {
            value: 3.3,
          },

          uOpacity: {
            value: 0.96,
          },
        },

        vertexShader: `
          uniform float uTime;
          uniform float uPointSize;

          varying vec3 vColor;

          void main() {
            vColor = color;

            vec3 animatedPosition =
              position;

            float pulse =
              sin(
                uTime * 1.4 +
                position.x * 1.7 +
                position.y * 1.2
              ) * 0.022;

            float secondaryPulse =
              cos(
                uTime * 0.8 +
                position.z * 2.0
              ) * 0.012;

            animatedPosition +=
              normalize(
                position + 0.0001
              ) *
              (
                pulse +
                secondaryPulse
              );

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
              (8.5 / -viewPosition.z);
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
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    const points =
      pointsRef.current;

    if (!points) {
      return;
    }

    const time =
      state.clock.elapsedTime;

    material.uniforms.uTime.value =
      time;

    /*
      Положение курсора по горизонтали:

      -1.0 — Cell
      -0.5 — DNA
       0.0 — Wave
       0.5 — Vortex
       1.0 — Galaxy
    */
    const targetProgress =
      THREE.MathUtils.clamp(
        (GLOBAL_POINTER.x + 1) /
          2,
        0,
        1,
      ) *
      (shapes.length - 1);

    smoothProgressRef.current =
      THREE.MathUtils.lerp(
        smoothProgressRef.current,
        targetProgress,
        0.075,
      );

    const progress =
      smoothProgressRef.current;

    const startShapeIndex =
      Math.floor(progress);

    const endShapeIndex = Math.min(
      startShapeIndex + 1,
      shapes.length - 1,
    );

    const localProgress =
      progress - startShapeIndex;

    /*
      Smoothstep для мягкого морфинга.
    */
    const easedProgress =
      localProgress *
      localProgress *
      (3 - 2 * localProgress);

    const positionAttribute =
      geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;

    const currentPositions =
      positionAttribute.array as Float32Array;

    const firstShape =
      shapes[startShapeIndex];

    const secondShape =
      shapes[endShapeIndex];

    for (
      let index = 0;
      index <
      currentPositions.length;
      index += 1
    ) {
      currentPositions[index] =
        THREE.MathUtils.lerp(
          firstShape[index],
          secondShape[index],
          easedProgress,
        );
    }

    positionAttribute.needsUpdate =
      true;

    /*
      Цвет также плавно переходит
      между палитрами каждой формы.
    */
    const colorAttribute =
      geometry.getAttribute(
        "color",
      ) as THREE.BufferAttribute;

    const currentColors =
      colorAttribute.array as Float32Array;

    const firstPalette =
      SHAPE_PALETTES[
        startShapeIndex
      ];

    const secondPalette =
      SHAPE_PALETTES[
        endShapeIndex
      ];

    /*
      Курсор вверх делает палитру
      холоднее, вниз — теплее.
    */
    const temperatureShift =
      GLOBAL_POINTER.y * 0.12;

    for (
      let offset = 0;
      offset < currentColors.length;
      offset += 3
    ) {
      const particleIndex =
        offset / 3;

      const particleProgress =
        particleIndex /
        Math.max(
          PARTICLE_COUNT - 1,
          1,
        );

      /*
        Световая волна проходит
        через весь объект.
      */
      const lightWave =
        0.5 +
        Math.sin(
          particleProgress * 34 +
            time * 0.75 +
            currentPositions[offset] *
              0.8 +
            currentPositions[
              offset + 1
            ] *
              0.45,
        ) *
          0.5;

      /*
        Некоторые частицы получают
        яркий третий акцентный цвет.
      */
      const accentStrength =
        Math.pow(lightWave, 7);

      const firstRed =
        THREE.MathUtils.lerp(
          firstPalette[0][0],
          firstPalette[1][0],
          lightWave,
        );

      const firstGreen =
        THREE.MathUtils.lerp(
          firstPalette[0][1],
          firstPalette[1][1],
          lightWave,
        );

      const firstBlue =
        THREE.MathUtils.lerp(
          firstPalette[0][2],
          firstPalette[1][2],
          lightWave,
        );

      const secondRed =
        THREE.MathUtils.lerp(
          secondPalette[0][0],
          secondPalette[1][0],
          lightWave,
        );

      const secondGreen =
        THREE.MathUtils.lerp(
          secondPalette[0][1],
          secondPalette[1][1],
          lightWave,
        );

      const secondBlue =
        THREE.MathUtils.lerp(
          secondPalette[0][2],
          secondPalette[1][2],
          lightWave,
        );

      let red =
        THREE.MathUtils.lerp(
          firstRed,
          secondRed,
          easedProgress,
        );

      let green =
        THREE.MathUtils.lerp(
          firstGreen,
          secondGreen,
          easedProgress,
        );

      let blue =
        THREE.MathUtils.lerp(
          firstBlue,
          secondBlue,
          easedProgress,
        );

      const accentRed =
        THREE.MathUtils.lerp(
          firstPalette[2][0],
          secondPalette[2][0],
          easedProgress,
        );

      const accentGreen =
        THREE.MathUtils.lerp(
          firstPalette[2][1],
          secondPalette[2][1],
          easedProgress,
        );

      const accentBlue =
        THREE.MathUtils.lerp(
          firstPalette[2][2],
          secondPalette[2][2],
          easedProgress,
        );

      red =
        THREE.MathUtils.lerp(
          red,
          accentRed,
          accentStrength,
        );

      green =
        THREE.MathUtils.lerp(
          green,
          accentGreen,
          accentStrength,
        );

      blue =
        THREE.MathUtils.lerp(
          blue,
          accentBlue,
          accentStrength,
        );

      red = THREE.MathUtils.clamp(
        red - temperatureShift,
        0,
        1.7,
      );

      blue = THREE.MathUtils.clamp(
        blue + temperatureShift,
        0,
        1.7,
      );

      const brightness =
        0.82 +
        lightWave * 0.55 +
        accentStrength * 0.75;

      currentColors[offset] =
        red * brightness;

      currentColors[offset + 1] =
        green * brightness;

      currentColors[offset + 2] =
        blue * brightness;
    }

    colorAttribute.needsUpdate =
      true;

    /*
      Поворот и параллакс.
    */
    points.rotation.x =
      THREE.MathUtils.lerp(
        points.rotation.x,
        GLOBAL_POINTER.y * 0.28,
        0.04,
      );

    points.rotation.y =
      THREE.MathUtils.lerp(
        points.rotation.y,
        GLOBAL_POINTER.x * 0.2 +
          time * 0.012,
        0.035,
      );

    points.rotation.z =
      THREE.MathUtils.lerp(
        points.rotation.z,
        GLOBAL_POINTER.x *
          GLOBAL_POINTER.y *
          0.1,
        0.035,
      );

    points.position.x =
      THREE.MathUtils.lerp(
        points.position.x,
        1.2 +
          GLOBAL_POINTER.x * 0.4,
        0.04,
      );

    points.position.y =
      THREE.MathUtils.lerp(
        points.position.y,
        GLOBAL_POINTER.y * 0.25,
        0.04,
      );

    const targetScale =
      1 +
      Math.abs(
        GLOBAL_POINTER.y,
      ) *
        0.055;

    const nextScale =
      THREE.MathUtils.lerp(
        points.scale.x,
        targetScale,
        0.04,
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

  useFrame((state) => {
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
      THREE.MathUtils.lerp(
        points.position.x,
        GLOBAL_POINTER.x * -0.22,
        0.025,
      );

    points.position.y =
      THREE.MathUtils.lerp(
        points.position.y,
        GLOBAL_POINTER.y * -0.14,
        0.025,
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

function MouseLight() {
  const lightRef =
    useRef<THREE.PointLight | null>(
      null,
    );

  useFrame(() => {
    const light =
      lightRef.current;

    if (!light) {
      return;
    }

    light.position.x =
      THREE.MathUtils.lerp(
        light.position.x,
        GLOBAL_POINTER.x * 5,
        0.06,
      );

    light.position.y =
      THREE.MathUtils.lerp(
        light.position.y,
        GLOBAL_POINTER.y * 3,
        0.06,
      );

    light.intensity =
      THREE.MathUtils.lerp(
        light.intensity,
        17 +
          Math.abs(
            GLOBAL_POINTER.x,
          ) *
            5,
        0.04,
      );

    const normalizedProgress =
      THREE.MathUtils.clamp(
        (GLOBAL_POINTER.x + 1) /
          2,
        0,
        1,
      );

    const paletteIndex =
      Math.round(
        normalizedProgress *
          (SHAPE_PALETTES.length - 1),
      );

    const targetColor =
      SHAPE_PALETTES[
        paletteIndex
      ][0];

    light.color.setRGB(
      targetColor[0],
      targetColor[1],
      targetColor[2],
    );
  });

  return (
    <pointLight
      ref={lightRef}
      color="#7DD3FC"
      intensity={18}
      distance={9}
      position={[0, 0, 3]}
    />
  );
}

function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    camera.position.x =
      THREE.MathUtils.lerp(
        camera.position.x,
        GLOBAL_POINTER.x * 0.48,
        0.03,
      );

    camera.position.y =
      THREE.MathUtils.lerp(
        camera.position.y,
        GLOBAL_POINTER.y * 0.34,
        0.03,
      );

    camera.position.z =
      THREE.MathUtils.lerp(
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
        0.03,
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
    <EffectComposer multisampling={0}>
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

        <ambientLight
          intensity={0.08}
        />

        <StarField />
        <ParticleUniverse />
        <MouseLight />
        <CameraRig />
        <PostProcessing />
      </Canvas>
    </div>
  );
}