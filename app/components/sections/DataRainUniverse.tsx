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

type DataRainUniverseProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

type DataKind =
  | "gene"
  | "protein"
  | "pathway"
  | "journal"
  | "evidence";

type RainItem = {
  id: number;
  label: string;
  sublabel?: string;
  kind: DataKind;
  x: number;
  y: number;
  z: number;
  speed: number;
  drift: number;
  scale: number;
  phase: number;
};

const DATA_ITEMS = [
  ["TP53", "tumor suppressor", "gene"],
  ["CXCL12", "chemokine signaling", "protein"],
  ["CAF", "cancer-associated fibroblast", "gene"],
  ["ECM", "matrix remodeling", "pathway"],
  ["IL6", "inflammatory signaling", "protein"],
  ["AKT1", "PI3K–AKT axis", "gene"],
  ["TGFβ", "stromal signaling", "protein"],
  ["FGF2", "growth signaling", "protein"],
  ["RUNX2", "bone metastasis", "gene"],
  ["MMP9", "matrix degradation", "protein"],
  ["CD44", "adhesion receptor", "protein"],
  ["STAT3", "transcriptional signaling", "gene"],
  ["COL1A1", "extracellular matrix", "gene"],
  ["MYC", "oncogenic transcription", "gene"],
  ["BRCA1", "DNA repair", "gene"],
  ["PI3K", "survival pathway", "pathway"],
  ["EMT", "cell-state transition", "pathway"],
  ["SMAD", "TGFβ signaling", "pathway"],
  ["Nature", "journal fragment", "journal"],
  ["Cancer Cell", "journal fragment", "journal"],
  ["Cell", "journal fragment", "journal"],
  ["Science", "journal fragment", "journal"],
  ["PMID 41238517", "evidence linked", "evidence"],
  ["PMID 40982104", "citation signal", "evidence"],
  ["Evidence 97%", "confidence", "evidence"],
  ["PubMed", "literature source", "journal"],
  ["DOI", "research record", "evidence"],
  ["Mechanism linked", "AI evidence", "evidence"],
] as const;

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

function palette(
  kind: DataKind,
) {
  if (kind === "gene") {
    return {
      primary: "#B8F6FF",
      secondary: "#67E8F9",
      border: "rgba(161,92,255,.42)",
      background:
        "rgba(3,17,29,.84)",
    };
  }

  if (kind === "protein") {
    return {
      primary: "#E4D9FF",
      secondary: "#A78BFA",
      border: "rgba(167,139,250,.42)",
      background:
        "rgba(14,10,32,.84)",
    };
  }

  if (kind === "pathway") {
    return {
      primary: "#F5E9FF",
      secondary: "#D8B4FE",
      border: "rgba(216,180,254,.34)",
      background:
        "rgba(22,10,35,.82)",
    };
  }

  if (kind === "journal") {
    return {
      primary: "#FFFFFF",
      secondary: "#93C5FD",
      border: "rgba(255,255,255,.28)",
      background:
        "rgba(7,11,22,.88)",
    };
  }

  return {
    primary: "#D1FAE5",
    secondary: "#6EE7B7",
    border: "rgba(110,231,183,.34)",
    background:
      "rgba(3,19,18,.84)",
  };
}

function buildTexture(
  label: string,
  sublabel: string | undefined,
  kind: DataKind,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = 768;
  canvas.height =
    kind === "journal"
      ? 270
      : 220;

  const context =
    canvas.getContext(
      "2d",
    );

  if (!context) {
    return null;
  }

  const colors =
    palette(kind);

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const radius = 34;
  const x = 8;
  const y = 8;
  const w =
    canvas.width - 16;
  const h =
    canvas.height - 16;

  context.beginPath();
  context.roundRect(
    x,
    y,
    w,
    h,
    radius,
  );

  context.fillStyle =
    colors.background;
  context.fill();

  context.strokeStyle =
    colors.border;
  context.lineWidth = 2;
  context.stroke();

  const gradient =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      0,
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,0)",
  );
  gradient.addColorStop(
    0.5,
    colors.secondary,
  );
  gradient.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  context.fillStyle =
    gradient;
  context.globalAlpha =
    0.55;

  context.fillRect(
    40,
    28,
    canvas.width - 80,
    2,
  );

  context.globalAlpha = 1;

  context.font =
    kind === "journal"
      ? "700 31px Inter, Arial, sans-serif"
      : "800 38px Inter, Arial, sans-serif";

  context.fillStyle =
    colors.primary;

  context.textAlign =
    "left";

  context.fillText(
    label,
    48,
    kind === "journal"
      ? 100
      : 90,
  );

  if (sublabel) {
    context.font =
      "600 19px Inter, Arial, sans-serif";

    context.fillStyle =
      colors.secondary;

    context.globalAlpha =
      0.8;

    context.fillText(
      sublabel.toUpperCase(),
      48,
      kind === "journal"
        ? 150
        : 138,
    );

    context.globalAlpha = 1;
  }

  context.font =
    "700 14px Inter, Arial, sans-serif";

  context.fillStyle =
    "rgba(226,232,240,.48)";

  context.fillText(
    kind.toUpperCase(),
    48,
    canvas.height - 42,
  );

  context.beginPath();
  context.arc(
    canvas.width - 56,
    52,
    8,
    0,
    Math.PI * 2,
  );

  context.fillStyle =
    colors.secondary;
  context.fill();

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

  texture.needsUpdate =
    true;

  return texture;
}

function DataRainSprite({
  item,
  progress,
  reduced,
}: {
  item: RainItem;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const spriteRef =
    useRef<THREE.Sprite | null>(
      null,
    );

  const materialRef =
    useRef<THREE.SpriteMaterial | null>(
      null,
    );

  useEffect(() => {
    const material =
      materialRef.current;

    if (!material) {
      return;
    }

    const texture =
      buildTexture(
        item.label,
        item.sublabel,
        item.kind,
      );

    if (!texture) {
      return;
    }

    material.map =
      texture;

    material.needsUpdate =
      true;

    return () => {
      texture.dispose();
    };
  }, [
    item.kind,
    item.label,
    item.sublabel,
  ]);

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

      const p =
        reduced
          ? 0
          : progress.get();

      const stage =
        p * 4;

      const stageLocal =
        stage -
        Math.floor(stage);

      const transitionEnergy =
        Math.sin(
          Math.min(
            Math.max(
              stageLocal,
              0,
            ),
            1,
          ) *
            Math.PI,
        );

      let nextZ =
        item.z +
        time *
          item.speed;

      const loopSpan = 16;

      nextZ =
        (
          (
            nextZ +
            loopSpan / 2
          ) %
            loopSpan +
          loopSpan
        ) %
          loopSpan -
        loopSpan / 2;

      sprite.position.z =
        nextZ;

      sprite.position.x =
        item.x +
        Math.sin(
          time *
            0.35 +
            item.phase,
        ) *
          item.drift +
        Math.sin(
          p *
            Math.PI *
            2 +
            item.phase,
        ) *
          0.35;

      sprite.position.y =
        item.y +
        Math.cos(
          time *
            0.28 +
            item.phase,
        ) *
          item.drift *
          0.45;

      const depthFactor =
        THREE.MathUtils.clamp(
          1 -
            Math.abs(
              nextZ,
            ) /
              9,
          0.18,
          1,
        );

      const pulse =
        1 +
        Math.sin(
          time *
            1.1 +
            item.phase,
        ) *
          0.045;

      const boost =
        1 +
        transitionEnergy *
          0.22;

      sprite.scale.set(
        item.scale *
          2.8 *
          pulse *
          boost,
        item.scale *
          (
            item.kind ===
            "journal"
              ? 1.0
              : 0.78
          ) *
          pulse *
          boost,
        1,
      );

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          (
            0.14 +
            depthFactor *
              0.48
          ) *
            (
              0.86 +
              transitionEnergy *
                0.18
            ),
          4,
          delta,
        );

      sprite.material.rotation =
        Math.sin(
          time *
            0.16 +
            item.phase,
        ) *
        0.035;
    },
  );

  return (
    <sprite
      ref={spriteRef}
      position={[
        item.x,
        item.y,
        item.z,
      ]}
    >
      <spriteMaterial
        ref={materialRef}
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

export default function DataRainUniverse({
  progress,
  reduced,
}: DataRainUniverseProps) {
  const items =
    useMemo<RainItem[]>(
      () =>
        DATA_ITEMS.map(
          (
            entry,
            index,
          ) => ({
            id: index,
            label:
              entry[0],
            sublabel:
              entry[1],
            kind:
              entry[2] as DataKind,
            x:
              (seeded(
                index,
                41,
              ) -
                0.5) *
              12,
            y:
              (seeded(
                index,
                42,
              ) -
                0.5) *
              7,
            z:
              (seeded(
                index,
                43,
              ) -
                0.5) *
              14,
            speed:
              0.18 +
              seeded(
                index,
                44,
              ) *
                0.42,
            drift:
              0.12 +
              seeded(
                index,
                45,
              ) *
                0.4,
            scale:
              0.42 +
              seeded(
                index,
                46,
              ) *
                0.42,
            phase:
              seeded(
                index,
                47,
              ) *
              Math.PI *
              2,
          }),
        ),
      [],
    );

  return (
    <group>
      {items.map(
        (item) => (
          <DataRainSprite
            key={
              item.id
            }
            item={
              item
            }
            progress={
              progress
            }
            reduced={
              reduced
            }
          />
        ),
      )}
    </group>
  );
}