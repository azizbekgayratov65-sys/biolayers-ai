"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import countriesData from "world-countries";

type CountryRecord = {
  cca2?: string;
  name?: {
    common?: string;
  };
  latlng?: number[];
  area?: number;
};

type CountryFlagsProps = {
  radius?: number;
  reduced?: boolean;
};

type FlagMarkerProps = {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  area: number;
  reduced: boolean;
};

function countryCodeToFlag(
  code: string,
) {
  return code
    .toUpperCase()
    .replace(
      /./g,
      (character) =>
        String.fromCodePoint(
          127397 +
            character.charCodeAt(
              0,
            ),
        ),
    );
}

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

function createFlagTexture(
  code: string,
) {
  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = 256;
  canvas.height = 192;

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

  /*
   * Tiny dark backing.
   * It makes white parts of flags
   * visible against bright coastlines.
   */

  context.fillStyle =
    "rgba(2,1,5,.72)";

  context.beginPath();

  context.roundRect(
    22,
    30,
    212,
    132,
    22,
  );

  context.fill();

  /*
   * National flag emoji.
   */

  const flag =
    countryCodeToFlag(
      code,
    );

  context.font =
    '112px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillText(
    flag,
    128,
    96,
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

  texture.needsUpdate =
    true;

  return texture;
}

function FlagMarker({
  code,
  name,
  latitude,
  longitude,
  radius,
  area,
  reduced,
}: FlagMarkerProps) {
  const groupRef =
    useRef<THREE.Group | null>(
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
          latitude,
          longitude,
          radius,
        ),
      [
        latitude,
        longitude,
        radius,
      ],
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

      return new THREE.Quaternion()
        .setFromUnitVectors(
          forward,
          normal,
        );
    }, [normal]);

  const texture =
    useMemo(
      () =>
        createFlagTexture(
          code,
        ),
      [code],
    );

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  /*
   * Large countries receive a
   * slightly larger marker.
   *
   * Tiny countries stay tiny so
   * Europe does not become a wall
   * of flags.
   */

  const baseSize =
    area >
    5_000_000
      ? 0.20
      : area >
          1_000_000
        ? 0.17
        : area >
            250_000
          ? 0.145
          : area >
              50_000
            ? 0.118
            : 0.09;

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
        state.clock.elapsedTime;

      const target =
        hovered
          ? 1.65
          : 1;

      group.scale.x =
        THREE.MathUtils.damp(
          group.scale.x,
          target,
          9,
          delta,
        );

      group.scale.y =
        THREE.MathUtils.damp(
          group.scale.y,
          target,
          9,
          delta,
        );

      group.scale.z =
        THREE.MathUtils.damp(
          group.scale.z,
          target,
          9,
          delta,
        );

      /*
       * Uzbekistan gets an extremely
       * subtle living pulse.
       */

      if (
        code === "UZ" &&
        !reduced &&
        !hovered
      ) {
        const pulse =
          1 +
          Math.sin(
            time * 2.1,
          ) *
            0.08;

        group.scale.multiplyScalar(
          pulse,
        );
      }
    },
  );

  return (
    <group
      ref={groupRef}
      position={
        position
      }
      quaternion={
        quaternion
      }
      name={name}
    >
      {/*
       * Flag sits almost directly
       * on Earth's surface.
       */}

      <mesh
        position={[
          0,
          0,
          0.012,
        ]}
        onPointerEnter={(
          event,
        ) => {
          event.stopPropagation();

          setHovered(
            true,
          );

          document.body.style.cursor =
            "pointer";
        }}
        onPointerLeave={(
          event,
        ) => {
          event.stopPropagation();

          setHovered(
            false,
          );

          document.body.style.cursor =
            "grab";
        }}
      >
        <planeGeometry
          args={[
            baseSize *
              1.28,
            baseSize *
              0.82,
          ]}
        />

        <meshBasicMaterial
          map={
            texture ??
            undefined
          }
          transparent
          opacity={
            hovered
              ? 1
              : code ===
                  "UZ"
                ? 0.98
                : 0.74
          }
          side={
            THREE.DoubleSide
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/*
       * Uzbekistan gets one subtle
       * violet outline so it remains
       * discoverable.
       */}

      {code ===
        "UZ" && (
        <mesh
          position={[
            0,
            0,
            0.006,
          ]}
        >
          <ringGeometry
            args={[
              baseSize *
                0.67,
              baseSize *
                0.72,
              48,
            ]}
          />

          <meshBasicMaterial
            color="#A78BFA"
            transparent
            opacity={
              hovered
                ? 0.65
                : 0.28
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
      )}
    </group>
  );
}

export default function CountryFlags({
  radius = 2.285,
  reduced = false,
}: CountryFlagsProps) {
  const countries =
    useMemo(() => {
      return (
        countriesData as CountryRecord[]
      )
        .filter(
          (
            country,
          ) =>
            Boolean(
              country.cca2,
            ) &&
            Boolean(
              country.name
                ?.common,
            ) &&
            Array.isArray(
              country.latlng,
            ) &&
            country
              .latlng!
              .length >=
              2,
        )
        .map(
          (
            country,
          ) => ({
            code:
              country.cca2!,

            name:
              country.name!
                .common!,

            latitude:
              country
                .latlng![0],

            longitude:
              country
                .latlng![1],

            area:
              country.area ??
              0,
          }),
        );
    }, []);

  return (
    <group>
      {countries.map(
        (
          country,
        ) => (
          <FlagMarker
            key={
              country.code
            }
            code={
              country.code
            }
            name={
              country.name
            }
            latitude={
              country.latitude
            }
            longitude={
              country.longitude
            }
            area={
              country.area
            }
            radius={
              radius
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