"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import UzbekistanFlag from "./UzbekistanFlag";

type UzbekistanMarkerProps = {
  radius?: number;
  reduced?: boolean;
};

const LATITUDE = 41.3;
const LONGITUDE = 64.6;

function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number,
) {
  const lat =
    THREE.MathUtils.degToRad(
      latitude,
    );

  const lon =
    THREE.MathUtils.degToRad(
      longitude,
    );

  const x =
    radius *
    Math.cos(lat) *
    Math.sin(lon);

  const y =
    radius *
    Math.sin(lat);

  const z =
    radius *
    Math.cos(lat) *
    Math.cos(lon);

  return new THREE.Vector3(
    x,
    y,
    z,
  );
}

function createLabelTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = 820;
  canvas.height = 300;

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

  const background =
    context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );

  background.addColorStop(
    0,
    "rgba(10,5,28,.90)",
  );

  background.addColorStop(
    1,
    "rgba(29,12,63,.72)",
  );

  context.fillStyle =
    background;

  context.beginPath();

  context.roundRect(
    14,
    14,
    canvas.width - 28,
    canvas.height - 28,
    34,
  );

  context.fill();

  context.strokeStyle =
    "rgba(167,139,250,.34)";

  context.lineWidth = 2;
  context.stroke();

  context.fillStyle =
    "#A78BFA";

  context.font =
    "800 18px Inter, Arial, sans-serif";

  context.fillText(
    "BIOLAYERS AI",
    48,
    58,
  );

  context.fillStyle =
    "#FFFFFF";

  context.font =
    "900 50px Inter, Arial, sans-serif";

  context.fillText(
    "UZBEKISTAN",
    48,
    132,
  );

  context.fillStyle =
    "rgba(226,232,240,.82)";

  context.font =
    "700 24px Inter, Arial, sans-serif";

  context.fillText(
    "Tashkent · Central Asia",
    48,
    182,
  );

  context.fillStyle =
    "rgba(148,163,184,.62)";

  context.font =
    "700 15px Inter, Arial, sans-serif";

  context.fillText(
    "41.3° N · 64.6° E",
    48,
    232,
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

  texture.generateMipmaps =
    false;

  return texture;
}

export default function UzbekistanMarker({
  radius = 2.31,
  reduced = false,
}: UzbekistanMarkerProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const beaconRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const pulseOneRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const pulseTwoRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const labelMaterialRef =
    useRef<THREE.SpriteMaterial | null>(
      null,
    );

  const [
    hovered,
    setHovered,
  ] = useState(false);

  const position =
    useMemo(
      () =>
        latLonToVector3(
          LATITUDE,
          LONGITUDE,
          radius,
        ),
      [radius],
    );

  const normal =
    useMemo(
      () =>
        position
          .clone()
          .normalize(),
      [position],
    );

  const quaternion =
    useMemo(() => {
      const forward =
        new THREE.Vector3(
          0,
          0,
          1,
        );

      return new THREE.Quaternion().setFromUnitVectors(
        forward,
        normal,
      );
    }, [normal]);

  const labelTexture =
    useMemo(
      () =>
        typeof document ===
        "undefined"
          ? null
          : createLabelTexture(),
      [],
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const time =
        state.clock.elapsedTime;

      const group =
        groupRef.current;

      if (group) {
        const targetScale =
          hovered
            ? 1.28
            : 1;

        group.scale.x =
          THREE.MathUtils.damp(
            group.scale.x,
            targetScale,
            6,
            delta,
          );

        group.scale.y =
          THREE.MathUtils.damp(
            group.scale.y,
            targetScale,
            6,
            delta,
          );

        group.scale.z =
          THREE.MathUtils.damp(
            group.scale.z,
            targetScale,
            6,
            delta,
          );
      }

      if (
        beaconRef.current &&
        !reduced
      ) {
        beaconRef.current.scale.y =
          1 +
          Math.sin(
            time * 1.7,
          ) *
            0.06;
      }

      if (
        pulseOneRef.current
      ) {
        const cycle =
          reduced
            ? 0
            : (
                time * 0.42
              ) %
              1;

        const scale =
          1 +
          cycle *
            2.8;

        pulseOneRef.current.scale.setScalar(
          scale,
        );

        const material =
          pulseOneRef.current
            .material as THREE.MeshBasicMaterial;

        material.opacity =
          0.42 *
          (1 - cycle);
      }

      if (
        pulseTwoRef.current
      ) {
        const cycle =
          reduced
            ? 0
            : (
                time * 0.42 +
                0.5
              ) %
              1;

        const scale =
          1 +
          cycle *
            2.8;

        pulseTwoRef.current.scale.setScalar(
          scale,
        );

        const material =
          pulseTwoRef.current
            .material as THREE.MeshBasicMaterial;

        material.opacity =
          0.30 *
          (1 - cycle);
      }

      if (
        labelMaterialRef.current
      ) {
        labelMaterialRef.current.opacity =
          THREE.MathUtils.damp(
            labelMaterialRef.current
              .opacity,
            hovered
              ? 0.98
              : 0.22,
            6,
            delta,
          );
      }
    },
  );

  return (
    <group
      ref={groupRef}
      position={position}
      quaternion={quaternion}
      onPointerEnter={(event) => {
        event.stopPropagation();

        setHovered(true);

        document.body.style.cursor =
          "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();

        setHovered(false);

        document.body.style.cursor =
          "default";
      }}
    >
      {/* Large invisible hover target */}
      <mesh>
        <sphereGeometry
          args={[
            0.28,
            20,
            20,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Main glowing point */}
      <mesh
        position={[
          0,
          0,
          0.035,
        ]}
      >
        <sphereGeometry
          args={[
            0.06,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#E9D5FF"
          transparent
          opacity={0.95}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Core halo */}
      <mesh
        position={[
          0,
          0,
          0.028,
        ]}
      >
        <ringGeometry
          args={[
            0.09,
            0.14,
            72,
          ]}
        />

        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={
            hovered
              ? 0.62
              : 0.34
          }
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

      {/* Pulse ring 1 */}
      <mesh
        ref={pulseOneRef}
        position={[
          0,
          0,
          0.022,
        ]}
      >
        <ringGeometry
          args={[
            0.11,
            0.125,
            72,
          ]}
        />

        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.42}
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

      {/* Pulse ring 2 */}
      <mesh
        ref={pulseTwoRef}
        position={[
          0,
          0,
          0.021,
        ]}
      >
        <ringGeometry
          args={[
            0.11,
            0.125,
            72,
          ]}
        />

        <meshBasicMaterial
          color="#60A5FA"
          transparent
          opacity={0.3}
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

      {/* Vertical beacon */}
      <mesh
        ref={beaconRef}
        position={[
          0,
          0,
          0.34,
        ]}
      >
        <cylinderGeometry
          args={[
            0.008,
            0.018,
            0.62,
            12,
          ]}
        />

        <meshBasicMaterial
          color="#C4B5FD"
          transparent
          opacity={
            hovered
              ? 0.85
              : 0.42
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Beacon cap */}
      <mesh
        position={[
          0,
          0,
          0.68,
        ]}
      >
        <sphereGeometry
          args={[
            0.025,
            16,
            16,
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

      {/* Flag now always visible */}
      <UzbekistanFlag
        visible={true}
        reduced={reduced}
      />

      {/* Label always faint, bright on hover */}
      <sprite
        position={[
          0.95,
          0.72,
          0.72,
        ]}
        scale={[
          1.9,
          0.7,
          1,
        ]}
      >
        <spriteMaterial
          ref={labelMaterialRef}
          map={
            labelTexture ??
            undefined
          }
          transparent
          opacity={0.22}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}