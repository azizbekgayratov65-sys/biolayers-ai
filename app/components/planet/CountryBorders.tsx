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

import {
  useCountryFocus,
} from "./CountryFocus";

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

/* ====================================================== */
/* HELPERS                                                */
/* ====================================================== */

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

  return String(value).padStart(
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

/* ====================================================== */
/* COUNTRY BORDER                                         */
/* ====================================================== */

function CountryLine({
  points,
  active,
  focused,
  uzbekistan,
}: {
  points: THREE.Vector3[];
  active: boolean;
  focused: boolean;
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
            focused
              ? "#F5D0FE"
              : uzbekistan
                ? "#D8B4FE"
                : active
                  ? "#F0ABFC"
                  : "#75679B",

          transparent:
            true,

          opacity:
            focused
              ? 1
              : uzbekistan
                ? 0.92
                : active
                  ? 1
                  : 0.42,

          depthWrite:
            false,

          depthTest:
            true,

          blending:
            focused ||
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
      focused,
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
      raycast={() => {}}
    />
  );
}

/* ====================================================== */
/* COUNTRY SURFACE                                        */
/* ====================================================== */

function CountrySurface({
  ring,
  radius,
  active,
  focused,
  uzbekistan,
}: {
  ring: number[][];
  radius: number;
  active: boolean;
  focused: boolean;
  uzbekistan: boolean;
}) {
  const geometry =
    useMemo(() => {
      if (
        ring.length <
        3
      ) {
        return null;
      }

      const contour =
        ring.map(
          (
            [
              longitude,
              latitude,
            ],
          ) =>
            new THREE.Vector2(
              longitude,
              latitude,
            ),
        );

      const triangles =
        THREE.ShapeUtils
          .triangulateShape(
            contour,
            [],
          );

      const positions:
        number[] = [];

      triangles.forEach(
        (triangle) => {
          triangle.forEach(
            (index) => {
              const coordinate =
                ring[index];

              if (!coordinate) {
                return;
              }

              const [
                longitude,
                latitude,
              ] =
                coordinate;

              const point =
                latLonToVector3(
                  latitude,
                  longitude,
                  radius,
                );

              positions.push(
                point.x,
                point.y,
                point.z,
              );
            },
          );
        },
      );

      if (
        positions.length ===
        0
      ) {
        return null;
      }

      const bufferGeometry =
        new THREE.BufferGeometry();

      bufferGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          positions,
          3,
        ),
      );

      bufferGeometry
        .computeVertexNormals();

      return bufferGeometry;
    }, [
      ring,
      radius,
    ]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  if (
    !geometry ||
    (
      !active &&
      !focused &&
      !uzbekistan
    )
  ) {
    return null;
  }

  return (
    <mesh
      geometry={geometry}
      renderOrder={3}
      raycast={() => {}}
    >
      <meshBasicMaterial
        color={
          focused
            ? "#D946EF"
            : uzbekistan
              ? "#8B5CF6"
              : "#C026D3"
        }
        transparent
        opacity={
          focused
            ? 0.24
            : uzbekistan
              ? 0.12
              : 0.16
        }
        side={
          THREE.DoubleSide
        }
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        depthTest
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-3}
        polygonOffsetUnits={-3}
      />
    </mesh>
  );
}

/* ====================================================== */
/* FLAG                                                   */
/* ====================================================== */

function SurfaceFlag({
  country,
  radius,
  permanent,
  focused,
  reduced,
}: {
  country: CountryInfo;
  radius: number;
  permanent: boolean;
  focused: boolean;
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
  ] =
    useState<THREE.Texture | null>(
      null,
    );

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
      disposed =
        true;
    };
  }, [
    flagUrl,
  ]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [
    texture,
  ]);

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
          ? focused
            ? 1.22
            : 1
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
        !focused &&
        !reduced &&
        texture
      ) {
        const pulse =
          1 +
          Math.sin(
            time * 1.9,
          ) *
            0.025;

        root.scale.multiplyScalar(
          pulse,
        );
      }
    },
  );

  const flagWidth =
    country.area >
    4_000_000
      ? 0.21
      : country.area >
          1_000_000
        ? 0.175
        : country.area >
            300_000
          ? 0.145
          : country.area >
              80_000
            ? 0.12
            : 0.095;

  const flagHeight =
    flagWidth *
    0.67;

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
          0.002,
        ]}
        renderOrder={6}
        raycast={() => {}}
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
          polygonOffset
          polygonOffsetFactor={-5}
          polygonOffsetUnits={-5}
        />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* COUNTRY HIT AREA                                       */
/* ====================================================== */

function CountryHitArea({
  country,
  radius,
  onEnter,
  onLeave,
  onClick,
}: {
  country: CountryInfo;
  radius: number;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
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

  /*
   * Bigger than visual country center.
   *
   * Important:
   * these hit spheres live outside
   * the invisible drag sphere.
   */

  const hitRadius =
    country.area >
    4_000_000
      ? 0.30
      : country.area >
          1_000_000
        ? 0.245
        : country.area >
            300_000
          ? 0.20
          : country.area >
              80_000
            ? 0.155
            : 0.115;

  return (
    <mesh
      position={position}
      renderOrder={20}
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
      onPointerDown={(
        event,
      ) => {
        /*
         * Prevent drag sphere
         * from starting a drag.
         */

        event.stopPropagation();
      }}
      onClick={(
        event,
      ) => {
        event.stopPropagation();

        onClick();
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
        depthTest={false}
        colorWrite={false}
      />
    </mesh>
  );
}

/* ====================================================== */
/* UZBEKISTAN PULSE                                       */
/* ====================================================== */

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
            time *
            0.32
          ) %
          1;

        ringOneRef.current
          .scale
          .setScalar(
            1 +
              cycle *
                1.45,
          );

        const material =
          ringOneRef.current
            .material as THREE.MeshBasicMaterial;

        material.opacity =
          0.20 *
          (
            1 -
            cycle
          );
      }

      if (
        ringTwoRef.current
      ) {
        const cycle =
          (
            time *
              0.32 +
            0.5
          ) %
          1;

        ringTwoRef.current
          .scale
          .setScalar(
            1 +
              cycle *
                1.45,
          );

        const material =
          ringTwoRef.current
            .material as THREE.MeshBasicMaterial;

        material.opacity =
          0.14 *
          (
            1 -
            cycle
          );
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
          0.003,
        ]}
        raycast={() => {}}
      >
        <ringGeometry
          args={[
            0.038,
            0.047,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#D8B4FE"
          transparent
          opacity={0.20}
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
          0.002,
        ]}
        raycast={() => {}}
      >
        <ringGeometry
          args={[
            0.038,
            0.047,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#6366F1"
          transparent
          opacity={0.14}
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

/* ====================================================== */
/* MAIN                                                   */
/* ====================================================== */

export default function CountryBorders({
  radius = 2.305,
  reduced = false,
}: CountryBordersProps) {
  const [
    hoveredId,
    setHoveredId,
  ] =
    useState<string | null>(
      null,
    );

  const {
    focusedCountry,
    focusCountry,
  } =
    useCountryFocus();

  /* ==================================================== */
  /* COUNTRY METADATA                                     */
  /* ==================================================== */

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
        (
          country,
        ) => {
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

  /* ==================================================== */
  /* ATLAS                                                */
  /* ==================================================== */

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

      return collection
        .features;
    }, []);

  /* ==================================================== */
  /* UZBEKISTAN                                           */
  /* ==================================================== */

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

  /* ==================================================== */
  /* RENDER                                               */
  /* ==================================================== */

  return (
    <group>
      {countries.map(
        (
          country,
          countryIndex,
        ) => {
          const geometry =
            country.geometry;

          if (
            !geometry
          ) {
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

          const isFocused =
            Boolean(
              info &&
              focusedCountry?.code ===
                info.code,
            );

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
                ) => {
                  const outerRing =
                    polygon[0];

                  return (
                    <group
                      key={
                        `${id}-${polygonIndex}`
                      }
                    >
                      {outerRing && (
                        <CountrySurface
                          ring={
                            outerRing
                          }
                          radius={
                            radius +
                            0.004
                          }
                          active={
                            active
                          }
                          focused={
                            isFocused
                          }
                          uzbekistan={
                            isUzbekistan
                          }
                        />
                      )}

                      {polygon.map(
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
                                  radius +
                                    0.006,
                                )
                              }
                              active={
                                active
                              }
                              focused={
                                isFocused
                              }
                              uzbekistan={
                                isUzbekistan
                              }
                            />
                          );
                        },
                      )}
                    </group>
                  );
                },
              )}

              {info && (
                <CountryHitArea
                  country={
                    info
                  }

                  /*
                   * IMPORTANT FIX:
                   *
                   * Was +0.028.
                   *
                   * Now the interaction
                   * layer is clearly
                   * outside the planet.
                   */

                  radius={
                    radius +
                    0.055
                  }
                  onEnter={() => {
                    setHoveredId(
                      id,
                    );

                    if (
                      typeof document !==
                      "undefined"
                    ) {
                      document.body.style.cursor =
                        "pointer";
                    }
                  }}
                  onLeave={() => {
                    setHoveredId(
                      null,
                    );

                    if (
                      typeof document !==
                      "undefined"
                    ) {
                      document.body.style.cursor =
                        focusedCountry
                          ? "default"
                          : "grab";
                    }
                  }}
                  onClick={() => {
                    /*
                     * Select country.
                     */

                    console.log(
                      "[CountryFocus] CLICK:",
                      info.name,
                      info.code,
                    );

                    focusCountry({
                      code:
                        info.code,

                      name:
                        info.name,

                      latitude:
                        info.latitude,

                      longitude:
                        info.longitude,
                    });
                  }}
                />
              )}

              {info &&
                (
                  active ||
                  isFocused
                ) &&
                !isUzbekistan && (
                  <SurfaceFlag
                    country={
                      info
                    }
                    radius={
                      radius +
                      0.010
                    }
                    permanent={
                      false
                    }
                    focused={
                      isFocused
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

      {/* Uzbekistan permanent pulse */}

      <UzbekistanPulse
        radius={
          radius +
          0.008
        }
        reduced={
          reduced
        }
      />

      {/* Uzbekistan permanent flag */}

      {uzbekistan && (
        <SurfaceFlag
          country={
            uzbekistan
          }
          radius={
            radius +
            0.011
          }
          permanent
          focused={
            focusedCountry?.code ===
            "UZ"
          }
          reduced={
            reduced
          }
        />
      )}
    </group>
  );
}