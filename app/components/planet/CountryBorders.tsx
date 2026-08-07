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

import countries110m from "world-atlas/countries-110m.json";
import countriesData from "world-countries";

import {
  feature,
} from "topojson-client";

type CountryBordersProps = {
  radius?: number;
  reduced?: boolean;
};

type GeoGeometry = {
  type:
    | "Polygon"
    | "MultiPolygon";

  coordinates:
    | number[][][]
    | number[][][][];
};

type GeoFeature = {
  id?: string | number;
  geometry?: GeoGeometry;
};

type CountryDatasetItem = {
  cca2?: string;
  ccn3?: string;

  name?: {
    common?: string;
  };

  latlng?: number[];

  area?: number;
};

type CountryInfo = {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  area: number;
};

function normalizeId(
  value:
    | string
    | number
    | undefined,
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .padStart(
      3,
      "0",
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

function ringToPoints(
  ring: number[][],
  radius: number,
) {
  return ring.map(
    (
      [
        longitude,
        latitude,
      ],
    ) =>
      latLonToVector3(
        latitude,
        longitude,
        radius,
      ),
  );
}

function CountryLine({
  points,
  active,
  uzbekistan,
}: {
  points: THREE.Vector3[];
  active: boolean;
  uzbekistan: boolean;
}) {
  const line =
    useMemo(() => {
      const geometry =
        new THREE.BufferGeometry()
          .setFromPoints(
            points,
          );

      const material =
        new THREE.LineBasicMaterial({
          color:
            uzbekistan
              ? "#D8B4FE"
              : active
                ? "#F0ABFC"
                : "#8B7CC7",

          transparent:
            true,

          opacity:
            uzbekistan
              ? 0.95
              : active
                ? 1
                : 0.47,

          depthWrite:
            false,

          depthTest:
            true,

          blending:
            uzbekistan ||
            active
              ? THREE.AdditiveBlending
              : THREE.NormalBlending,

          toneMapped:
            false,
        });

      return new THREE.LineLoop(
        geometry,
        material,
      );
    }, [
      active,
      points,
      uzbekistan,
    ]);

  useEffect(() => {
    return () => {
      line.geometry.dispose();

      const material =
        line.material;

      if (
        Array.isArray(
          material,
        )
      ) {
        material.forEach(
          (item) =>
            item.dispose(),
        );
      } else {
        material.dispose();
      }
    };
  }, [line]);

  return (
    <primitive
      object={line}
    />
  );
}

function LocalFlag({
  country,
  radius,
  permanent,
  reduced,
}: {
  country: CountryInfo;
  radius: number;
  permanent: boolean;
  reduced: boolean;
}) {
  const rootRef =
    useRef<THREE.Group | null>(
      null,
    );

  const materialRef =
    useRef<THREE.MeshBasicMaterial | null>(
      null,
    );

  const [
    texture,
    setTexture,
  ] = useState<
    THREE.Texture | null
  >(null);

  const position =
    useMemo(
      () =>
        latLonToVector3(
          country.latitude,
          country.longitude,
          radius,
        ),
      [
        country.latitude,
        country.longitude,
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

  const flagUrl =
    `/flags-png/${country.code.toLowerCase()}.png`;

  useEffect(() => {
    let disposed =
      false;

    const loader =
      new THREE.TextureLoader();

    loader.load(
      flagUrl,

      (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }

        loadedTexture.colorSpace =
          THREE.SRGBColorSpace;

        loadedTexture.minFilter =
          THREE.LinearFilter;

        loadedTexture.magFilter =
          THREE.LinearFilter;

        loadedTexture.generateMipmaps =
          false;

        loadedTexture.needsUpdate =
          true;

        setTexture(
          loadedTexture,
        );
      },

      undefined,

      () => {
        console.warn(
          `Flag not found: ${flagUrl}`,
        );
      },
    );

    return () => {
      disposed = true;
    };
  }, [flagUrl]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  useFrame(
    (
      state,
      delta,
    ) => {
      const root =
        rootRef.current;

      const material =
        materialRef.current;

      if (
        !root ||
        !material
      ) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      const targetScale =
        texture
          ? 1
          : 0.01;

      root.scale.x =
        THREE.MathUtils.damp(
          root.scale.x,
          targetScale,
          12,
          delta,
        );

      root.scale.y =
        THREE.MathUtils.damp(
          root.scale.y,
          targetScale,
          12,
          delta,
        );

      root.scale.z =
        THREE.MathUtils.damp(
          root.scale.z,
          targetScale,
          12,
          delta,
        );

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          texture
            ? 1
            : 0,
          12,
          delta,
        );

      if (
        permanent &&
        !reduced &&
        texture
      ) {
        const pulse =
          1 +
          Math.sin(
            time * 2.1,
          ) *
            0.045;

        root.scale.multiplyScalar(
          pulse,
        );
      }
    },
  );

  const flagWidth =
    country.area >
    2_000_000
      ? 0.30
      : country.area >
          500_000
        ? 0.25
        : country.area >
            100_000
          ? 0.21
          : 0.17;

  const flagHeight =
    flagWidth * 0.67;

  return (
    <group
      ref={rootRef}
      position={position}
      quaternion={quaternion}
      scale={0.01}
    >
      <mesh
        position={[
          0,
          0,
          0.006,
        ]}
      >
        <planeGeometry
          args={[
            flagWidth,
            flagHeight,
          ]}
        />

        <meshBasicMaterial
          ref={materialRef}
          map={
            texture ??
            undefined
          }
          transparent
          opacity={0}
          side={
            THREE.DoubleSide
          }
          depthWrite={false}
          depthTest
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function CountryHitArea({
  country,
  radius,
  onEnter,
  onLeave,
}: {
  country: CountryInfo;
  radius: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const position =
    useMemo(
      () =>
        latLonToVector3(
          country.latitude,
          country.longitude,
          radius,
        ),
      [
        country.latitude,
        country.longitude,
        radius,
      ],
    );

  const hitRadius =
    country.area >
    4_000_000
      ? 0.28
      : country.area >
          1_000_000
        ? 0.23
        : country.area >
            300_000
          ? 0.19
          : country.area >
              80_000
            ? 0.15
            : 0.115;

  return (
    <mesh
      position={position}
      onPointerEnter={(
        event,
      ) => {
        event.stopPropagation();

        onEnter();
      }}
      onPointerLeave={(
        event,
      ) => {
        event.stopPropagation();

        onLeave();
      }}
    >
      <sphereGeometry
        args={[
          hitRadius,
          16,
          16,
        ]}
      />

      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        colorWrite={false}
      />
    </mesh>
  );
}

function UzbekistanPulse({
  radius,
  reduced,
}: {
  radius: number;
  reduced: boolean;
}) {
  const ringOneRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const ringTwoRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const position =
    useMemo(
      () =>
        latLonToVector3(
          41.3,
          64.6,
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

      return new THREE.Quaternion()
        .setFromUnitVectors(
          forward,
          normal,
        );
    }, [normal]);

  useFrame(
    (
      state,
    ) => {
      if (reduced) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      if (
        ringOneRef.current
      ) {
        const cycle =
          (
            time * 0.36
          ) %
          1;

        ringOneRef.current
          .scale
          .setScalar(
            1 +
              cycle *
                1.55,
          );

        const material =
          ringOneRef.current
            .material as THREE.MeshBasicMaterial;

        material.opacity =
          0.30 *
          (1 - cycle);
      }

      if (
        ringTwoRef.current
      ) {
        const cycle =
          (
            time * 0.36 +
            0.5
          ) %
          1;

        ringTwoRef.current
          .scale
          .setScalar(
            1 +
              cycle *
                1.55,
          );

        const material =
          ringTwoRef.current
            .material as THREE.MeshBasicMaterial;

        material.opacity =
          0.22 *
          (1 - cycle);
      }
    },
  );

  return (
    <group
      position={position}
      quaternion={quaternion}
    >
      <mesh
        ref={ringOneRef}
        position={[
          0,
          0,
          0.01,
        ]}
      >
        <ringGeometry
          args={[
            0.050,
            0.061,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#D8B4FE"
          transparent
          opacity={0.30}
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

      <mesh
        ref={ringTwoRef}
        position={[
          0,
          0,
          0.009,
        ]}
      >
        <ringGeometry
          args={[
            0.050,
            0.061,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#6366F1"
          transparent
          opacity={0.22}
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
    </group>
  );
}

export default function CountryBorders({
  radius = 2.305,
  reduced = false,
}: CountryBordersProps) {
  const [
    hoveredId,
    setHoveredId,
  ] = useState<
    string | null
  >(null);

  const countryInfoMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          CountryInfo
        >();

      (
        countriesData as CountryDatasetItem[]
      ).forEach(
        (country) => {
          if (
            !country.ccn3 ||
            !country.cca2 ||
            !country.name
              ?.common ||
            !country.latlng ||
            country.latlng
              .length <
              2
          ) {
            return;
          }

          const id =
            normalizeId(
              country.ccn3,
            );

          map.set(
            id,
            {
              id,

              code:
                country.cca2,

              name:
                country.name
                  .common,

              latitude:
                country
                  .latlng[0],

              longitude:
                country
                  .latlng[1],

              area:
                country.area ??
                0,
            },
          );
        },
      );

      return map;
    }, []);

  const countries =
    useMemo(() => {
      const topology =
        countries110m as unknown as {
          objects: {
            countries:
              unknown;
          };
        };

      const collection =
        feature(
          countries110m as never,

          topology.objects
            .countries as never,
        ) as unknown as {
          features:
            GeoFeature[];
        };

      return collection.features;
    }, []);

  const uzbekistan =
    useMemo(() => {
      return (
        Array.from(
          countryInfoMap.values(),
        ).find(
          (
            country,
          ) =>
            country.code ===
            "UZ",
        ) ??
        null
      );
    }, [
      countryInfoMap,
    ]);

  return (
    <group>
      {countries.map(
        (
          country,
          countryIndex,
        ) => {
          const geometry =
            country.geometry;

          if (!geometry) {
            return null;
          }

          const id =
            normalizeId(
              country.id,
            );

          const info =
            countryInfoMap.get(
              id,
            );

          const active =
            hoveredId ===
            id;

          const isUzbekistan =
            info?.code ===
              "UZ" ||
            id ===
              "860";

          const polygons:
            number[][][][] =
            geometry.type ===
            "Polygon"
              ? [
                  geometry.coordinates as number[][][],
                ]
              : geometry.coordinates as number[][][][];

          return (
            <group
              key={
                `${id}-${countryIndex}`
              }
            >
              {polygons.map(
                (
                  polygon,
                  polygonIndex,
                ) =>
                  polygon.map(
                    (
                      ring,
                      ringIndex,
                    ) => {
                      if (
                        !ring ||
                        ring.length <
                          2
                      ) {
                        return null;
                      }

                      return (
                        <CountryLine
                          key={
                            `${id}-${polygonIndex}-${ringIndex}`
                          }
                          points={
                            ringToPoints(
                              ring,
                              radius,
                            )
                          }
                          active={
                            active
                          }
                          uzbekistan={
                            isUzbekistan
                          }
                        />
                      );
                    },
                  ),
              )}

              {info && (
                <CountryHitArea
                  country={
                    info
                  }
                  radius={
                    radius +
                    0.075
                  }
                  onEnter={() => {
                    setHoveredId(
                      id,
                    );

                    document.body.style.cursor =
                      "pointer";
                  }}
                  onLeave={() => {
                    setHoveredId(
                      null,
                    );

                    document.body.style.cursor =
                      "grab";
                  }}
                />
              )}

              {info &&
                active &&
                !isUzbekistan && (
                  <LocalFlag
                    country={
                      info
                    }
                    radius={
                      radius +
                      0.09
                    }
                    permanent={
                      false
                    }
                    reduced={
                      reduced
                    }
                  />
                )}
            </group>
          );
        },
      )}

      <UzbekistanPulse
        radius={
          radius +
          0.035
        }
        reduced={
          reduced
        }
      />

      {uzbekistan && (
        <LocalFlag
          country={
            uzbekistan
          }
          radius={
            radius +
            0.095
          }
          permanent
          reduced={
            reduced
          }
        />
      )}
    </group>
  );
}