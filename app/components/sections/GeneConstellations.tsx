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

import type {
  MotionValue,
} from "framer-motion";

import {
  useMouseGravity,
} from "./MouseGravityField";

type GeneConstellationsProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

type GeneNode = {
  label: string;
  color: string;
  position: THREE.Vector3;
};

const GENE_GROUPS = [
  [
    "TP53",
    "AKT1",
    "MYC",
    "STAT3",
  ],
  [
    "CXCL12",
    "CXCR4",
    "RUNX2",
    "MMP9",
  ],
  [
    "TGFβ",
    "SMAD3",
    "COL1A1",
    "ECM",
  ],
  [
    "BRCA1",
    "PI3K",
    "CD44",
    "IL6",
  ],
];

const COLORS = [
  "#67E8F9",
  "#A78BFA",
  "#F472B6",
  "#60A5FA",
];

function seeded(
  index: number,
  salt = 1,
) {
  const value =
    Math.sin(
      index * 12.9898 +
        salt * 78.233,
    ) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );
}

function createLabelTexture(
  text: string,
  color: string,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = 512;
  canvas.height = 160;

  const context =
    canvas.getContext(
      "2d",
    );

  if (!context) {
    return null;
  }

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const gradient =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      0,
    );

  gradient.addColorStop(
    0,
    "rgba(2,6,23,.0)",
  );

  gradient.addColorStop(
    0.2,
    "rgba(2,6,23,.78)",
  );

  gradient.addColorStop(
    0.8,
    "rgba(2,6,23,.78)",
  );

  gradient.addColorStop(
    1,
    "rgba(2,6,23,.0)",
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  context.font =
    "800 46px Inter, Arial, sans-serif";

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillStyle =
    "#FFFFFF";

  context.fillText(
    text,
    canvas.width / 2,
    72,
  );

  context.font =
    "700 15px Inter, Arial, sans-serif";

  context.fillStyle =
    color;

  context.fillText(
    "GENE CONSTELLATION",
    canvas.width / 2,
    118,
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

  return texture;
}

function GeneSprite({
  node,
  activeStrength,
}: {
  node: GeneNode;
  activeStrength: React.MutableRefObject<number>;
}) {
  const spriteRef =
    useRef<THREE.Sprite | null>(
      null,
    );

  const materialRef =
    useRef<THREE.SpriteMaterial | null>(
      null,
    );

  const texture =
    useMemo(
      () =>
        typeof document ===
        "undefined"
          ? null
          : createLabelTexture(
              node.label,
              node.color,
            ),
      [
        node.color,
        node.label,
      ],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const sprite =
        spriteRef.current;

      const material =
        materialRef.current;

      if (
        !sprite ||
        !material
      ) {
        return;
      }

      const time =
        state.clock
          .elapsedTime;

      const pulse =
        1 +
        Math.sin(
          time *
            2.2 +
            node.position.x,
        ) *
          0.035;

      sprite.scale.set(
        1.75 * pulse,
        0.54 * pulse,
        1,
      );

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          0.22 +
            activeStrength.current *
              0.68,
          5,
          delta,
        );
    },
  );

  return (
    <sprite
      ref={spriteRef}
      position={
        node.position
      }
    >
      <spriteMaterial
        ref={materialRef}
        map={
          texture ??
          undefined
        }
        transparent
        opacity={0}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </sprite>
  );
}

function ConnectionLine({
  start,
  end,
  color,
  activeStrength,
  index,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  activeStrength: React.MutableRefObject<number>;
  index: number;
}) {
  const lineRef =
    useRef<
      THREE.Line<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      > | null
    >(null);

  const pulseRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const lineObject =
    useMemo(
      () => {
        const geometry =
          new THREE.BufferGeometry().setFromPoints([
            start,
            end,
          ]);

        const material =
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            blending:
              THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          });

        return new THREE.Line(
          geometry,
          material,
        );
      },
      [
        start,
        end,
        color,
      ],
    );

  useEffect(() => {
    return () => {
      lineObject.geometry.dispose();
      lineObject.material.dispose();
    };
  }, [lineObject]);

  useFrame(
    (
      state,
      delta,
    ) => {
      const line =
        lineRef.current;

      const pulse =
        pulseRef.current;

      if (
        !line ||
        !pulse
      ) {
        return;
      }

      line.material.opacity =
        THREE.MathUtils.damp(
          line.material.opacity,
          activeStrength.current *
            0.48,
          5,
          delta,
        );

      const t =
        (
          state.clock
            .elapsedTime *
            (
              0.18 +
              index *
                0.025
            ) +
          index *
            0.19
        ) %
        1;

      pulse.position.lerpVectors(
        start,
        end,
        t,
      );

      const scale =
        0.03 +
        activeStrength.current *
          0.055;

      pulse.scale.setScalar(
        scale,
      );
    },
  );

  return (
    <>
      <primitive
        ref={lineRef}
        object={lineObject}
      />

      <mesh
        ref={pulseRef}
      >
        <sphereGeometry
          args={[
            1,
            10,
            10,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.9}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

export default function GeneConstellations({
  progress,
  reduced,
}: GeneConstellationsProps) {
  const {
    stateRef,
  } = useMouseGravity();

  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const activeStrength =
    useRef(0);

  const activeGroupIndex =
    useRef(0);

  const genes =
    useMemo<GeneNode[]>(
      () => {
        const group =
          GENE_GROUPS[0];

        return group.map(
          (
            label,
            index,
          ) => {
            const angle =
              (
                index /
                group.length
              ) *
                Math.PI *
                2 +
              0.35;

            const radius =
              2.25 +
              seeded(
                index,
                55,
              ) *
                0.8;

            return {
              label,
              color:
                COLORS[
                  index %
                    COLORS.length
                ],
              position:
                new THREE.Vector3(
                  Math.cos(
                    angle,
                  ) *
                    radius,
                  Math.sin(
                    angle,
                  ) *
                    radius *
                    0.72,
                  (
                    seeded(
                      index,
                      56,
                    ) -
                    0.5
                  ) *
                    1.1,
                ),
            };
          },
        );
      },
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const group =
        groupRef.current;

      if (!group) {
        return;
      }

      const time =
        state.clock
          .elapsedTime;

      const p =
        reduced
          ? 0
          : progress.get();

      const cycle =
        Math.floor(
          time / 7.5,
        );

      const cycleLocal =
        (
          time %
          7.5
        ) /
        7.5;

      activeGroupIndex.current =
        cycle %
        GENE_GROUPS.length;

      const showWindow =
        Math.sin(
          Math.min(
            Math.max(
              (
                cycleLocal -
                0.08
              ) /
                0.78,
              0,
            ),
            1,
          ) *
            Math.PI,
        );

      const transitionBoost =
        Math.sin(
          (
            p *
              4 -
            Math.floor(
              p * 4,
            )
          ) *
            Math.PI,
        );

      activeStrength.current =
        THREE.MathUtils.damp(
          activeStrength.current,
          reduced
            ? 0
            : THREE.MathUtils.clamp(
                showWindow *
                  (
                    0.72 +
                    transitionBoost *
                      0.38
                  ),
                0,
                1,
              ),
          4,
          delta,
        );

      const gravity =
        stateRef.current;

      group.position.x =
        THREE.MathUtils.damp(
          group.position.x,
          gravity.active
            ? gravity.world.x *
                0.12
            : 0,
          3.8,
          delta,
        );

      group.position.y =
        THREE.MathUtils.damp(
          group.position.y,
          gravity.active
            ? gravity.world.y *
                0.12
            : 0,
          3.8,
          delta,
        );

      group.rotation.z =
        THREE.MathUtils.damp(
          group.rotation.z,
          Math.sin(
            time *
              0.2,
          ) *
            0.07,
          2,
          delta,
        );

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          Math.cos(
            time *
              0.16,
          ) *
            0.09 +
            p *
              0.25,
          2,
          delta,
        );
    },
  );

  return (
    <group
      ref={groupRef}
    >
      {genes.map(
        (
          gene,
          index,
        ) => (
          <GeneSprite
            key={
              gene.label
            }
            node={{
              ...gene,
              label:
                GENE_GROUPS[
                  activeGroupIndex.current
                ]?.[
                  index
                ] ??
                gene.label,
            }}
            activeStrength={
              activeStrength
            }
          />
        ),
      )}

      {genes.map(
        (
          gene,
          index,
        ) => {
          const next =
            genes[
              (
                index +
                1
              ) %
                genes.length
            ];

          return (
            <ConnectionLine
              key={`${gene.label}-${next.label}`}
              start={
                gene.position
              }
              end={
                next.position
              }
              color={
                gene.color
              }
              activeStrength={
                activeStrength
              }
              index={
                index
              }
            />
          );
        },
      )}

      <ConnectionLine
        start={
          genes[0]
            .position
        }
        end={
          genes[2]
            .position
        }
        color="#FFFFFF"
        activeStrength={
          activeStrength
        }
        index={6}
      />
    </group>
  );
}