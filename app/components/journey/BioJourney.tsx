"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import Earth from "../planet/Earth";
import Atmosphere from "../planet/Atmosphere";
import Clouds from "../planet/Clouds";
import CityLights from "../planet/CityLights";
import CountryBorders from "../planet/CountryBorders";
import OrbitSystem from "../planet/OrbitSystem";
import Stars from "../planet/Stars";

import {
  CountryFocusProvider,
  useCountryFocus,
} from "../planet/CountryFocus";

/* ====================================================== */
/* TYPES                                                  */
/* ====================================================== */

type JourneyProps = {
  progress: MotionValue<number>;
  reduced: boolean;
};

type BiologicalLayer =
  | "cell"
  | "ligand"
  | "receptor"
  | "gene"
  | "protein"
  | "pathway"
  | "process"
  | "phenotype"
  | "disease"
  | "evidence";

type GraphNode = {
  id: string;
  label: string;
  kind: BiologicalLayer;
  x: number;
  y: number;
  size: number;
};

type GraphEdge = {
  from: string;
  to: string;
};

/* ====================================================== */
/* TIMELINE                                               */
/* ====================================================== */

/*
  0.00 - 0.24   Planetary scale / life in layers
  0.22 - 0.34   Atmospheric entry
  0.30 - 0.46   Cellular layer
  0.40 - 0.62   Molecular signaling layer
  0.54 - 0.72   Gene / protein universe
  0.66 - 0.84   DNA formation
  0.78 - 0.96   Biological layer map
  0.93 - 1.00   Collapse into About
*/

function range(
  value: number,
  start: number,
  end: number,
) {
  if (end === start) {
    return value >= end ? 1 : 0;
  }

  return THREE.MathUtils.clamp(
    (value - start) /
      (end - start),
    0,
    1,
  );
}

function bell(
  value: number,
  start: number,
  peakStart: number,
  peakEnd: number,
  end: number,
) {
  if (value <= start) {
    return 0;
  }

  if (value < peakStart) {
    return range(
      value,
      start,
      peakStart,
    );
  }

  if (value <= peakEnd) {
    return 1;
  }

  if (value < end) {
    return (
      1 -
      range(
        value,
        peakEnd,
        end,
      )
    );
  }

  return 0;
}


/* ====================================================== */
/* GLOBAL RESEARCH LINKS                                  */
/* ====================================================== */

type ResearchHub = {
  id: "uzbekistan" | "qatar" | "usa";
  label: string;
  city: string;
  latitude: number;
  longitude: number;
  color: string;
};

const RESEARCH_HUBS: ResearchHub[] = [
  {
    id: "uzbekistan",
    label: "UZBEKISTAN",
    city: "TASHKENT",
    latitude: 41.2995,
    longitude: 69.2401,
    color: "#5EEAD4",
  },
  {
    id: "qatar",
    label: "QATAR",
    city: "DOHA",
    latitude: 25.2854,
    longitude: 51.5310,
    color: "#A5F3FC",
  },
  {
    id: "usa",
    label: "USA",
    city: "BALTIMORE",
    latitude: 39.2904,
    longitude: -76.6122,
    color: "#7DD3FC",
  },
];

const RESEARCH_ROUTES = [
  ["uzbekistan", "qatar"],
  ["qatar", "usa"],
  ["uzbekistan", "usa"],
] as const;

function latLonToSphere(
  latitude: number,
  longitude: number,
  radius: number,
) {
  const lat =
    THREE.MathUtils.degToRad(latitude);
  const lon =
    THREE.MathUtils.degToRad(longitude);

  return new THREE.Vector3(
    radius *
      Math.cos(lat) *
      Math.sin(lon),
    radius * Math.sin(lat),
    radius *
      Math.cos(lat) *
      Math.cos(lon),
  );
}

function createResearchArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
) {
  const angle =
    start.angleTo(end);

  const midpointDirection =
    start
      .clone()
      .normalize()
      .add(end.clone().normalize())
      .normalize();

  const lift =
    THREE.MathUtils.lerp(
      0.42,
      1.05,
      THREE.MathUtils.clamp(
        angle / Math.PI,
        0,
        1,
      ),
    );

  const midpoint =
    midpointDirection.multiplyScalar(
      2.33 + lift,
    );

  return new THREE.QuadraticBezierCurve3(
    start,
    midpoint,
    end,
  );
}



function drawResearchFlag(
  context: CanvasRenderingContext2D,
  hubId: ResearchHub["id"],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.save();

  const radius = 8;

  context.beginPath();
  context.roundRect(
    x,
    y,
    width,
    height,
    radius,
  );

  context.clip();

  if (hubId === "uzbekistan") {
    const stripe = height / 3;

    context.fillStyle = "#1EB7E8";
    context.fillRect(
      x,
      y,
      width,
      stripe,
    );

    context.fillStyle = "#FFFFFF";
    context.fillRect(
      x,
      y + stripe,
      width,
      stripe,
    );

    context.fillStyle = "#20B96B";
    context.fillRect(
      x,
      y + stripe * 2,
      width,
      stripe,
    );

    context.fillStyle = "#D7263D";
    context.fillRect(
      x,
      y + stripe - 3,
      width,
      3,
    );
    context.fillRect(
      x,
      y + stripe * 2,
      width,
      3,
    );

    context.fillStyle = "#FFFFFF";

    context.beginPath();
    context.arc(
      x + width * 0.18,
      y + height * 0.2,
      height * 0.11,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.fillStyle = "#1EB7E8";

    context.beginPath();
    context.arc(
      x + width * 0.21,
      y + height * 0.2,
      height * 0.09,
      0,
      Math.PI * 2,
    );
    context.fill();
  } else if (hubId === "qatar") {
    context.fillStyle = "#FFFFFF";
    context.fillRect(
      x,
      y,
      width * 0.28,
      height,
    );

    context.fillStyle = "#8A1538";
    context.fillRect(
      x + width * 0.28,
      y,
      width * 0.72,
      height,
    );

    context.fillStyle = "#FFFFFF";

    const teeth = 9;
    const toothHeight =
      height / teeth;

    context.beginPath();
    context.moveTo(
      x + width * 0.28,
      y,
    );

    for (
      let i = 0;
      i <= teeth;
      i++
    ) {
      const yy =
        y + i * toothHeight;

      context.lineTo(
        x + width * 0.39,
        yy - toothHeight / 2,
      );

      context.lineTo(
        x + width * 0.28,
        yy,
      );
    }

    context.lineTo(
      x,
      y + height,
    );
    context.lineTo(
      x,
      y,
    );
    context.closePath();
    context.fill();
  } else {
    const stripeHeight =
      height / 13;

    for (
      let i = 0;
      i < 13;
      i++
    ) {
      context.fillStyle =
        i % 2 === 0
          ? "#B22234"
          : "#FFFFFF";

      context.fillRect(
        x,
        y + i * stripeHeight,
        width,
        stripeHeight + 0.5,
      );
    }

    context.fillStyle = "#3C3B6E";
    context.fillRect(
      x,
      y,
      width * 0.42,
      stripeHeight * 7,
    );

    context.fillStyle =
      "rgba(255,255,255,.92)";

    for (
      let row = 0;
      row < 4;
      row++
    ) {
      for (
        let col = 0;
        col < 5;
        col++
      ) {
        context.beginPath();

        context.arc(
          x +
            width * 0.05 +
            col * width * 0.075,
          y +
            stripeHeight * 0.65 +
            row * stripeHeight * 1.45,
          1.35,
          0,
          Math.PI * 2,
        );

        context.fill();
      }
    }
  }

  context.restore();

  context.strokeStyle =
    "rgba(236,254,255,.28)";
  context.lineWidth = 1.5;

  context.beginPath();
  context.roundRect(
    x,
    y,
    width,
    height,
    radius,
  );
  context.stroke();
}

function ResearchHubLabel({
  hub,
  reduced,
}: {
  hub: ResearchHub;
  reduced: boolean;
}) {
  const spriteRef =
    useRef<THREE.Sprite | null>(
      null,
    );

  const {
    camera,
  } =
    useThree();

  const [texture, setTexture] =
    useState<THREE.CanvasTexture | null>(
      null,
    );

  const position =
    useMemo(
      () =>
        latLonToSphere(
          hub.latitude,
          hub.longitude,
          2.58,
        ),
      [hub.latitude, hub.longitude],
    );

  const localNormal =
    useMemo(
      () =>
        position
          .clone()
          .normalize(),
      [position],
    );

  const worldNormal =
    useRef(
      new THREE.Vector3(),
    );

  const worldPosition =
    useRef(
      new THREE.Vector3(),
    );

  const cameraDirection =
    useRef(
      new THREE.Vector3(),
    );

  const parentQuaternion =
    useRef(
      new THREE.Quaternion(),
    );

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width = 768;
    canvas.height = 220;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
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
      "rgba(94,234,212,0)",
    );

    gradient.addColorStop(
      0.22,
      "rgba(94,234,212,0.12)",
    );

    gradient.addColorStop(
      0.78,
      "rgba(125,211,252,0.10)",
    );

    gradient.addColorStop(
      1,
      "rgba(125,211,252,0)",
    );

    context.fillStyle =
      gradient;

    context.fillRect(
      60,
      32,
      canvas.width - 120,
      156,
    );

    context.strokeStyle =
      "rgba(153,246,228,0.22)";

    context.lineWidth = 2;

    context.beginPath();

    context.moveTo(
      120,
      172,
    );

    context.lineTo(
      canvas.width - 120,
      172,
    );

    context.stroke();

    drawResearchFlag(
      context,
      hub.id,
      132,
      68,
      88,
      54,
    );

    context.textAlign =
      "left";

    context.textBaseline =
      "middle";

    context.font =
      "700 50px Arial";

    context.fillStyle =
      "#ECFEFF";

    context.shadowColor =
      hub.color;

    context.shadowBlur = 22;

    context.fillText(
      hub.label,
      246,
      91,
    );

    context.shadowBlur = 0;

    context.font =
      "600 24px Arial";

    context.fillStyle =
      "rgba(165,243,252,0.72)";

    context.fillText(
      hub.city,
      246,
      139,
    );

    const nextTexture =
      new THREE.CanvasTexture(
        canvas,
      );

    nextTexture.colorSpace =
      THREE.SRGBColorSpace;

    nextTexture.needsUpdate =
      true;

    setTexture(
      nextTexture,
    );

    return () => {
      nextTexture.dispose();
    };
  }, [
    hub.label,
    hub.city,
    hub.color,
  ]);

  useFrame(
    (
      _state,
      delta,
    ) => {
      const sprite =
        spriteRef.current;

      if (
        !sprite ||
        !texture
      ) {
        return;
      }

      sprite.getWorldPosition(
        worldPosition.current,
      );

      const parent =
        sprite.parent;

      if (parent) {
        parent.getWorldQuaternion(
          parentQuaternion.current,
        );

        worldNormal.current
          .copy(localNormal)
          .applyQuaternion(
            parentQuaternion.current,
          )
          .normalize();
      }

      cameraDirection.current
        .copy(camera.position)
        .sub(worldPosition.current)
        .normalize();

      const facing =
        worldNormal.current.dot(
          cameraDirection.current,
        );

      const targetOpacity =
        THREE.MathUtils.smoothstep(
          facing,
          -0.02,
          0.22,
        ) *
        0.92;

      const material =
        sprite.material;

      material.opacity =
        reduced
          ? targetOpacity
          : THREE.MathUtils.damp(
              material.opacity,
              targetOpacity,
              8,
              delta,
            );

      sprite.visible =
        material.opacity >
        0.015;

      const targetScale =
        THREE.MathUtils.lerp(
          0.88,
          1,
          THREE.MathUtils.clamp(
            targetOpacity / 0.92,
            0,
            1,
          ),
        );

      const currentX =
        sprite.scale.x;

      const nextX =
        reduced
          ? 1.12 * targetScale
          : THREE.MathUtils.damp(
              currentX,
              1.12 * targetScale,
              8,
              delta,
            );

      sprite.scale.set(
        nextX,
        0.32 *
          (nextX / 1.12),
        1,
      );
    },
  );

  if (!texture) {
    return null;
  }

  return (
    <sprite
      ref={spriteRef}
      position={position}
      scale={[
        1.12,
        0.32,
        1,
      ]}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={0}
        depthTest
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

function ResearchHubMarker({
  hub,
  reduced,
}: {
  hub: ResearchHub;
  reduced: boolean;
}) {
  const groupRef =
    useRef<THREE.Group | null>(null);

  const {
    camera,
  } = useThree();

  const visibilityRef =
    useRef(1);

  const worldPositionRef =
    useRef(new THREE.Vector3());

  const worldNormalRef =
    useRef(new THREE.Vector3());

  const cameraDirectionRef =
    useRef(new THREE.Vector3());

  const parentQuaternionRef =
    useRef(new THREE.Quaternion());

  const position =
    useMemo(
      () =>
        latLonToSphere(
          hub.latitude,
          hub.longitude,
          2.34,
        ),
      [hub.latitude, hub.longitude],
    );

  useFrame((state, delta) => {
    const group =
      groupRef.current;

    if (!group) {
      return;
    }

    group.getWorldPosition(
      worldPositionRef.current,
    );

    const parent =
      group.parent;

    if (parent) {
      parent.getWorldQuaternion(
        parentQuaternionRef.current,
      );

      worldNormalRef.current
        .copy(position)
        .normalize()
        .applyQuaternion(
          parentQuaternionRef.current,
        )
        .normalize();
    }

    cameraDirectionRef.current
      .copy(camera.position)
      .sub(worldPositionRef.current)
      .normalize();

    const facing =
      worldNormalRef.current.dot(
        cameraDirectionRef.current,
      );

    const targetVisibility =
      THREE.MathUtils.smoothstep(
        facing,
        -0.06,
        0.16,
      );

    visibilityRef.current =
      reduced
        ? targetVisibility
        : THREE.MathUtils.damp(
            visibilityRef.current,
            targetVisibility,
            10,
            delta,
          );

    group.visible =
      visibilityRef.current >
      0.015;

    const pulse =
      reduced
        ? 1
        : 1 +
          Math.sin(
            state.clock.elapsedTime *
              2.3 +
              hub.longitude *
                0.02,
          ) *
            0.12;

    group.scale.setScalar(
      pulse *
        THREE.MathUtils.lerp(
          0.86,
          1,
          visibilityRef.current,
        ),
    );
  });

  return (
    <group
      ref={groupRef}
      position={position}
    >
      <mesh>
        <sphereGeometry
          args={[0.045, 18, 18]}
        />
        <meshBasicMaterial
          color={hub.color}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[0.085, 16, 16]}
        />
        <meshBasicMaterial
          color={hub.color}
          transparent
          opacity={0.16}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <ringGeometry
          args={[
            0.09,
            0.125,
            36,
          ]}
        />
        <meshBasicMaterial
          color={hub.color}
          transparent
          opacity={0.32}
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

      <pointLight
        color={hub.color}
        intensity={0.32}
        distance={0.75}
        decay={2}
      />
    </group>
  );
}

function ResearchRoute({
  from,
  to,
  index,
  reduced,
  progress,
}: {
  from: ResearchHub;
  to: ResearchHub;
  index: number;
  reduced: boolean;
  progress: MotionValue<number>;
}) {
  const pulseOneRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const pulseTwoRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const pulseThreeRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const routeColor =
    index === 0
      ? "#5EEAD4"
      : index === 1
        ? "#A5F3FC"
        : "#7DD3FC";

  const {
    curve,
    lineGeometry,
    glowGeometry,
    lineObject,
    glowLineObject,
    pointCount,
  } = useMemo(() => {
    const startPoint =
      latLonToSphere(
        from.latitude,
        from.longitude,
        2.35,
      );

    const endPoint =
      latLonToSphere(
        to.latitude,
        to.longitude,
        2.35,
      );

    const nextCurve =
      createResearchArc(
        startPoint,
        endPoint,
      );

    const points =
      nextCurve.getPoints(110);

    const nextLineGeometry =
      new THREE.BufferGeometry()
        .setFromPoints(points);

    const nextGlowGeometry =
      new THREE.BufferGeometry()
        .setFromPoints(points);

    nextLineGeometry.setDrawRange(
      0,
      0,
    );

    nextGlowGeometry.setDrawRange(
      0,
      0,
    );

    const nextLineMaterial =
      new THREE.LineBasicMaterial({
        color: routeColor,
        transparent: true,
        opacity:
          index === 2
            ? 0.34
            : 0.78,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });

    const nextGlowMaterial =
      new THREE.LineBasicMaterial({
        color: routeColor,
        transparent: true,
        opacity:
          index === 2
            ? 0.1
            : 0.18,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });

    const nextLineObject =
      new THREE.Line(
        nextLineGeometry,
        nextLineMaterial,
      );

    const nextGlowLineObject =
      new THREE.Line(
        nextGlowGeometry,
        nextGlowMaterial,
      );

    nextLineObject.frustumCulled =
      false;

    nextGlowLineObject.frustumCulled =
      false;

    return {
      curve: nextCurve,
      lineGeometry:
        nextLineGeometry,
      glowGeometry:
        nextGlowGeometry,
      lineObject:
        nextLineObject,
      glowLineObject:
        nextGlowLineObject,
      pointCount:
        points.length,
    };
  }, [
    from,
    to,
    index,
    routeColor,
  ]);

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      glowGeometry.dispose();

      const lineMaterial =
        lineObject.material;

      const glowMaterial =
        glowLineObject.material;

      if (
        lineMaterial instanceof
        THREE.Material
      ) {
        lineMaterial.dispose();
      }

      if (
        glowMaterial instanceof
        THREE.Material
      ) {
        glowMaterial.dispose();
      }
    };
  }, [
    lineGeometry,
    glowGeometry,
    lineObject,
    glowLineObject,
  ]);

  useFrame((state) => {
    const p =
      progress.get();

    const revealStart =
      0.035 +
      index * 0.035;

    const revealEnd =
      revealStart +
      0.07;

    const reveal =
      range(
        p,
        revealStart,
        revealEnd,
      );

    const visibleCount =
      Math.max(
        0,
        Math.floor(
          pointCount *
            reveal,
        ),
      );

    lineGeometry.setDrawRange(
      0,
      visibleCount,
    );

    glowGeometry.setDrawRange(
      0,
      visibleCount,
    );

    lineObject.visible =
      reveal > 0.002;

    glowLineObject.visible =
      reveal > 0.002;

    if (reduced) {
      return;
    }

    const elapsed =
      state.clock.elapsedTime;

    const speed =
      index === 2
        ? 0.07
        : 0.11;

    const pulsePhase =
      (
        elapsed *
          speed +
        index *
          0.23
      ) %
      1;

    const pulsePhaseTwo =
      (
        pulsePhase +
        0.34
      ) %
      1;

    const pulsePhaseThree =
      (
        pulsePhase +
        0.68
      ) %
      1;

    const applyPulse = (
      mesh:
        | THREE.Mesh
        | null,
      phase: number,
    ) => {
      if (!mesh) {
        return;
      }

      const visible =
        reveal >
          0.98 &&
        phase <= reveal;

      mesh.visible =
        visible;

      if (visible) {
        mesh.position.copy(
          curve.getPointAt(
            phase,
          ),
        );
      }
    };

    applyPulse(
      pulseOneRef.current,
      pulsePhase,
    );

    applyPulse(
      pulseTwoRef.current,
      pulsePhaseTwo,
    );

    applyPulse(
      pulseThreeRef.current,
      pulsePhaseThree,
    );
  });

  return (
    <group>
      <primitive
        object={glowLineObject}
      />

      <primitive
        object={lineObject}
      />

      {!reduced && (
        <>
          <mesh
            ref={pulseOneRef}
            visible={false}
          >
            <sphereGeometry
              args={[
                0.038,
                14,
                14,
              ]}
            />

            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.96}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          <mesh
            ref={pulseTwoRef}
            visible={false}
          >
            <sphereGeometry
              args={[
                0.026,
                12,
                12,
              ]}
            />

            <meshBasicMaterial
              color={routeColor}
              transparent
              opacity={0.78}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          <mesh
            ref={pulseThreeRef}
            visible={false}
          >
            <sphereGeometry
              args={[
                0.018,
                10,
                10,
              ]}
            />

            <meshBasicMaterial
              color={routeColor}
              transparent
              opacity={0.5}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

function GlobalResearchLinks({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(null);

  const hubsById =
    useMemo(
      () =>
        Object.fromEntries(
          RESEARCH_HUBS.map(
            (hub) => [
              hub.id,
              hub,
            ],
          ),
        ) as Record<
          ResearchHub["id"],
          ResearchHub
        >,
      [],
    );

  useFrame((_state, delta) => {
    const group =
      groupRef.current;

    if (!group) {
      return;
    }

    const p = progress.get();

    const targetOpacity =
      bell(
        p,
        0.015,
        0.045,
        0.185,
        0.235,
      );

    group.visible =
      targetOpacity > 0.005;

    group.children.forEach(
      (child) => {
        child.visible =
          targetOpacity > 0.005;
      },
    );

    group.scale.setScalar(
      THREE.MathUtils.damp(
        group.scale.x,
        targetOpacity > 0.01
          ? 1
          : 0.96,
        reduced ? 20 : 7,
        delta,
      ),
    );
  });

  return (
    <group ref={groupRef}>
      {RESEARCH_HUBS.map(
        (hub) => (
          <group key={hub.id}>
            <ResearchHubMarker
              hub={hub}
              reduced={reduced}
            />

            <ResearchHubLabel
              hub={hub}
              reduced={reduced}
            />
          </group>
        ),
      )}

      {RESEARCH_ROUTES.map(
        ([fromId, toId], index) => (
          <ResearchRoute
            key={`${fromId}-${toId}`}
            from={hubsById[fromId]}
            to={hubsById[toId]}
            index={index}
            reduced={reduced}
            progress={progress}
          />
        ),
      )}
    </group>
  );
}


/* ====================================================== */
/* INTERACTIVE EARTH                                      */
/* ====================================================== */

function JourneyEarth({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const draggingRef =
    useRef(false);

  const pointerRef =
    useRef({
      x: 0,
      y: 0,
    });

  const rotationRef =
    useRef({
      x: 0.08,
      y: -0.55,
    });

  const velocityRef =
    useRef({
      x: 0,
      y: 0,
    });

  const {
    focusedCountry,
  } =
    useCountryFocus();

  /*
   * Robust globe dragging:
   * listen on the actual canvas at DOM capture level so country hit areas
   * cannot block drag initiation.
   */
  useEffect(() => {
    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (
        event.button !== 0 ||
        progress.get() >= 0.34 ||
        focusedCountry
      ) {
        return;
      }

      draggingRef.current = true;

      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      velocityRef.current = {
        x: 0,
        y: 0,
      };

      document.body.style.cursor =
        "grabbing";
    };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      if (
        !draggingRef.current ||
        progress.get() >= 0.34 ||
        focusedCountry
      ) {
        return;
      }

      const deltaX =
        event.clientX -
        pointerRef.current.x;

      const deltaY =
        event.clientY -
        pointerRef.current.y;

      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      rotationRef.current.y +=
        deltaX * 0.006;

      rotationRef.current.x +=
        deltaY * 0.005;

      rotationRef.current.x =
        THREE.MathUtils.clamp(
          rotationRef.current.x,
          -1.15,
          1.15,
        );

      velocityRef.current.x =
        THREE.MathUtils.clamp(
          deltaX * 0.055,
          -2,
          2,
        );

      velocityRef.current.y =
        THREE.MathUtils.clamp(
          deltaY * 0.05,
          -1.5,
          1.5,
        );
    };

    const handlePointerUp = () => {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      document.body.style.cursor =
        "default";
    };

    window.addEventListener(
      "pointerdown",
      handlePointerDown,
      true,
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      true,
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
      true,
    );

    window.addEventListener(
      "pointercancel",
      handlePointerUp,
      true,
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
        true,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp,
        true,
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerUp,
        true,
      );

      if (
        typeof document !==
        "undefined"
      ) {
        document.body.style.cursor =
          "default";
      }
    };
  }, [
    focusedCountry,
    progress,
  ]);

  useFrame(
    (
      _state,
      delta,
    ) => {
      const group =
        groupRef.current;

      if (!group) {
        return;
      }

      const p =
        progress.get();

      const exit =
        range(
          p,
          0.215,
          0.335,
        );

      const targetScale =
        THREE.MathUtils.lerp(
          1,
          2.05,
          exit,
        );

      const targetZ =
        THREE.MathUtils.lerp(
          0,
          3.55,
          exit,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          targetZ,
          6,
          delta,
        );

      group.visible =
        p < 0.345;

      if (
        focusedCountry &&
        p < 0.215
      ) {
        draggingRef.current =
          false;

        const targetY =
          THREE.MathUtils.degToRad(
            -focusedCountry.longitude,
          );

        const targetX =
          THREE.MathUtils.degToRad(
            focusedCountry.latitude,
          );

        let deltaAngle =
          targetY -
          rotationRef.current.y;

        deltaAngle =
          THREE.MathUtils.euclideanModulo(
            deltaAngle +
              Math.PI,
            Math.PI * 2,
          ) -
          Math.PI;

        rotationRef.current.y =
          THREE.MathUtils.damp(
            rotationRef.current.y,
            rotationRef.current.y +
              deltaAngle,
            reduced
              ? 25
              : 4.5,
            delta,
          );

        rotationRef.current.x =
          THREE.MathUtils.damp(
            rotationRef.current.x,
            targetX,
            reduced
              ? 25
              : 4.5,
            delta,
          );
      } else {
        if (
          !draggingRef.current
        ) {
          rotationRef.current.y +=
            velocityRef.current.x *
            delta *
            4;

          rotationRef.current.x +=
            velocityRef.current.y *
            delta *
            4;

          velocityRef.current.x =
            THREE.MathUtils.damp(
              velocityRef.current.x,
              0,
              3.6,
              delta,
            );

          velocityRef.current.y =
            THREE.MathUtils.damp(
              velocityRef.current.y,
              0,
              3.6,
              delta,
            );

          if (p < 0.34) {
            rotationRef.current.y +=
              delta * 0.055;
          }
        }

        rotationRef.current.x =
          THREE.MathUtils.clamp(
            rotationRef.current.x,
            -1.15,
            1.15,
          );
      }

      group.rotation.x =
        THREE.MathUtils.damp(
          group.rotation.x,
          rotationRef.current.x,
          8,
          delta,
        );

      group.rotation.y =
        THREE.MathUtils.damp(
          group.rotation.y,
          rotationRef.current.y,
          8,
          delta,
        );
    },
  );

  function endDrag() {
    draggingRef.current =
      false;

    if (
      typeof document !==
      "undefined"
    ) {
      document.body.style.cursor =
        "default";
    }
  }

  return (
    <group
      ref={groupRef}
      rotation={[
        0.08,
        -0.55,
        0,
      ]}
    >
      <mesh
        onPointerDown={(
          event,
        ) => {
          if (
            progress.get() >=
            0.34
          ) {
            return;
          }

          event.stopPropagation();

          draggingRef.current =
            true;

          pointerRef.current = {
            x:
              event.clientX,
            y:
              event.clientY,
          };

          velocityRef.current = {
            x: 0,
            y: 0,
          };

          if (
            typeof document !==
            "undefined"
          ) {
            document.body.style.cursor =
              "grabbing";
          }
        }}
        onPointerMove={(
          event,
        ) => {
          if (
            !draggingRef.current ||
            progress.get() >=
              0.34
          ) {
            return;
          }

          event.stopPropagation();

          const deltaX =
            event.clientX -
            pointerRef.current.x;

          const deltaY =
            event.clientY -
            pointerRef.current.y;

          pointerRef.current = {
            x:
              event.clientX,
            y:
              event.clientY,
          };

          rotationRef.current.y +=
            deltaX *
            0.006;

          rotationRef.current.x +=
            deltaY *
            0.005;

          rotationRef.current.x =
            THREE.MathUtils.clamp(
              rotationRef.current.x,
              -1.15,
              1.15,
            );

          velocityRef.current.x =
            THREE.MathUtils.clamp(
              deltaX *
                0.055,
              -2,
              2,
            );

          velocityRef.current.y =
            THREE.MathUtils.clamp(
              deltaY *
                0.05,
              -1.5,
              1.5,
            );
        }}
        onPointerUp={(
          event,
        ) => {
          event.stopPropagation();
          endDrag();
        }}
        onPointerCancel={
          endDrag
        }
        onPointerLeave={() => {
          if (
            !draggingRef.current &&
            typeof document !==
              "undefined"
          ) {
            document.body.style.cursor =
              "default";
          }
        }}
      >
        <sphereGeometry
          args={[
            2.27,
            40,
            40,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          colorWrite={false}
          depthWrite={false}
        />
      </mesh>

      <Earth
        reduced={true}
      />

      <CountryBorders
        reduced={reduced}
      />

      <Clouds
        reduced={true}
      />

      <CityLights
        reduced={true}
      />

      <Atmosphere
        reduced={true}
      />

      <GlobalResearchLinks
        progress={progress}
        reduced={reduced}
      />
    </group>
  );
}


/* ====================================================== */
/* EARTH → TISSUE → CELL CINEMATIC                        */
/* ====================================================== */

function CinematicCellDive({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const membraneRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const nucleusRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const tissueCells =
    useMemo(
      () =>
        Array.from({
          length: 13,
        }).map(
          (
            _,
            index,
          ) => {
            const angle =
              (
                index /
                13
              ) *
              Math.PI *
              2;

            const radius =
              index % 3 === 0
                ? 2.9
                : index % 2 === 0
                  ? 2.35
                  : 1.9;

            return {
              x:
                Math.cos(angle) *
                radius,
              y:
                Math.sin(angle) *
                radius *
                0.62,
              z:
                -0.6 -
                (
                  index %
                  5
                ) *
                  0.22,
              scale:
                0.44 +
                (
                  index %
                  4
                ) *
                  0.055,
              color:
                index % 3 === 0
                  ? "#5EEAD4"
                  : index % 3 === 1
                    ? "#7DD3FC"
                    : "#A5F3FC",
            };
          },
        ),
      [],
    );

  const organelles =
    useMemo(
      () =>
        Array.from({
          length: 18,
        }).map(
          (
            _,
            index,
          ) => {
            const angle =
              index *
              2.399963229728653;

            const radius =
              0.7 +
              (
                index %
                5
              ) *
                0.11;

            return {
              x:
                Math.cos(angle) *
                radius,
              y:
                Math.sin(angle) *
                radius *
                0.72,
              z:
                -0.35 +
                (
                  index %
                  6
                ) *
                  0.12,
              size:
                0.035 +
                (
                  index %
                  3
                ) *
                  0.012,
            };
          },
        ),
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

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.225,
          0.27,
          0.42,
          0.49,
        );

      const tissueFormation =
        range(
          p,
          0.225,
          0.315,
        );

      const cellFocus =
        range(
          p,
          0.29,
          0.405,
        );

      const dive =
        range(
          p,
          0.365,
          0.49,
        );

      group.visible =
        visibility >
        0.004;

      const targetScale =
        THREE.MathUtils.lerp(
          0.36,
          1.08,
          tissueFormation,
        ) *
        THREE.MathUtils.lerp(
          1,
          3.8,
          dive,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          reduced
            ? 20
            : 6.5,
          delta,
        ),
      );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          THREE.MathUtils.lerp(
            -5.7,
            1.85,
            dive,
          ),
          reduced
            ? 20
            : 6,
          delta,
        );

      group.position.y =
        THREE.MathUtils.damp(
          group.position.y,
          THREE.MathUtils.lerp(
            -0.12,
            0,
            cellFocus,
          ),
          6,
          delta,
        );

      if (!reduced) {
        group.rotation.z =
          Math.sin(
            state.clock.elapsedTime *
              0.17,
          ) *
          0.025;

        group.rotation.y =
          Math.sin(
            state.clock.elapsedTime *
              0.13,
          ) *
          0.05;
      }

      const membrane =
        membraneRef.current;

      if (
        membrane &&
        membrane.material instanceof
          THREE.MeshBasicMaterial
      ) {
        membrane.material.opacity =
          visibility *
          THREE.MathUtils.lerp(
            0.16,
            0.42,
            cellFocus,
          );
      }

      const nucleus =
        nucleusRef.current;

      if (
        nucleus &&
        nucleus.material instanceof
          THREE.MeshBasicMaterial
      ) {
        nucleus.material.opacity =
          visibility *
          THREE.MathUtils.lerp(
            0.2,
            0.82,
            cellFocus,
          );

        if (!reduced) {
          const pulse =
            1 +
            Math.sin(
              state.clock.elapsedTime *
                1.8,
            ) *
              0.04;

          nucleus.scale.setScalar(
            pulse,
          );
        }
      }

      group.children.forEach(
        (
          child,
          index,
        ) => {
          if (
            index <
              tissueCells.length &&
            child instanceof
              THREE.Mesh &&
            child.material instanceof
              THREE.MeshBasicMaterial
          ) {
            const fade =
              1 -
              range(
                p,
                0.315,
                0.405,
              );

            child.material.opacity =
              visibility *
              fade *
              0.22;
          }
        },
      );
    },
  );

  return (
    <group
      ref={groupRef}
      position={[
        0,
        -0.12,
        -5.7,
      ]}
    >
      {/* surrounding tissue cells */}

      {tissueCells.map(
        (
          cell,
          index,
        ) => (
          <mesh
            key={`tissue-${index}`}
            position={[
              cell.x,
              cell.y,
              cell.z,
            ]}
            scale={cell.scale}
          >
            <sphereGeometry
              args={[
                1,
                26,
                26,
              ]}
            />

            <meshBasicMaterial
              color={
                cell.color
              }
              transparent
              opacity={0}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ),
      )}

      {/* focused cell membrane */}

      <mesh ref={membraneRef}>
        <sphereGeometry
          args={[
            1.45,
            48,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#5EEAD4"
          wireframe
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* membrane glow */}

      <mesh>
        <sphereGeometry
          args={[
            1.5,
            40,
            40,
          ]}
        />

        <meshBasicMaterial
          color="#67E8F9"
          transparent
          opacity={0.045}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* nucleus */}

      <mesh
        ref={nucleusRef}
        position={[
          0.15,
          0.05,
          0.05,
        ]}
      >
        <sphereGeometry
          args={[
            0.48,
            36,
            36,
          ]}
        />

        <meshBasicMaterial
          color="#A5F3FC"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* nuclear halo */}

      <mesh
        position={[
          0.15,
          0.05,
          0.04,
        ]}
      >
        <sphereGeometry
          args={[
            0.64,
            26,
            26,
          ]}
        />

        <meshBasicMaterial
          color="#7DD3FC"
          transparent
          opacity={0.07}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* intracellular particles */}

      {organelles.map(
        (
          organelle,
          index,
        ) => (
          <mesh
            key={`organelle-${index}`}
            position={[
              organelle.x,
              organelle.y,
              organelle.z,
            ]}
          >
            <sphereGeometry
              args={[
                organelle.size,
                10,
                10,
              ]}
            />

            <meshBasicMaterial
              color={
                index % 2 === 0
                  ? "#99F6E4"
                  : "#7DD3FC"
              }
              transparent
              opacity={0.65}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ),
      )}

      {/* nucleus-targeting rings */}

      <mesh
        rotation={[
          1.18,
          0.18,
          0.1,
        ]}
      >
        <torusGeometry
          args={[
            0.82,
            0.012,
            8,
            90,
          ]}
        />

        <meshBasicMaterial
          color="#5EEAD4"
          transparent
          opacity={0.24}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          0.32,
          1.12,
          0.42,
        ]}
      >
        <torusGeometry
          args={[
            1.05,
            0.008,
            8,
            100,
          ]}
        />

        <meshBasicMaterial
          color="#7DD3FC"
          transparent
          opacity={0.16}
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
/* PAPER → KNOWLEDGE GRAPH                                */
/* ====================================================== */

const PAPER_GRAPH_ENTITIES = [
  { label: "CAF", x: -1.75, y: 0.75, color: "#5EEAD4" },
  { label: "TGF-β", x: -0.55, y: 1.28, color: "#A5F3FC" },
  { label: "CXCL12", x: 0.72, y: 0.72, color: "#7DD3FC" },
  { label: "CXCR4", x: 1.72, y: -0.08, color: "#99F6E4" },
  { label: "Tumor cell", x: 0.45, y: -1.05, color: "#67E8F9" },
  { label: "Bone niche", x: -1.2, y: -0.9, color: "#BAE6FD" },
] as const;

const PAPER_GRAPH_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 5],
] as const;

function PaperKnowledgeGraphScene({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(null);

  const paperRef =
    useRef<THREE.Mesh | null>(null);

  const nodeRefs =
    useRef<Array<THREE.Mesh | null>>([]);

  const edgeRefs =
    useRef<Array<THREE.Mesh | null>>([]);

  const edgeData =
    useMemo(
      () =>
        PAPER_GRAPH_EDGES.map(
          ([sourceIndex, targetIndex]) => {
            const source =
              PAPER_GRAPH_ENTITIES[sourceIndex];

            const target =
              PAPER_GRAPH_ENTITIES[targetIndex];

            const start =
              new THREE.Vector3(
                source.x,
                source.y,
                0,
              );

            const end =
              new THREE.Vector3(
                target.x,
                target.y,
                0,
              );

            const midpoint =
              start
                .clone()
                .add(end)
                .multiplyScalar(0.5);

            const length =
              start.distanceTo(end);

            const angle =
              Math.atan2(
                target.y - source.y,
                target.x - source.x,
              );

            return {
              midpoint,
              length,
              angle,
            };
          },
        ),
      [],
    );

  useFrame((state, delta) => {
    const group =
      groupRef.current;

    if (!group) {
      return;
    }

    const p =
      progress.get();

    const visibility =
      bell(
        p,
        0.47,
        0.505,
        0.655,
        0.705,
      );

    const extraction =
      range(
        p,
        0.515,
        0.605,
      );

    const graphFormation =
      range(
        p,
        0.57,
        0.665,
      );

    group.visible =
      visibility > 0.004;

    group.position.z =
      THREE.MathUtils.damp(
        group.position.z,
        THREE.MathUtils.lerp(
          -4.5,
          -1.7,
          graphFormation,
        ),
        reduced ? 20 : 6,
        delta,
      );

    if (!reduced) {
      group.rotation.y =
        Math.sin(
          state.clock.elapsedTime * 0.15,
        ) * 0.035;
    }

    const paper =
      paperRef.current;

    if (
      paper &&
      paper.material instanceof
        THREE.MeshBasicMaterial
    ) {
      paper.material.opacity =
        visibility *
        (1 - extraction) *
        0.24;

      paper.scale.setScalar(
        THREE.MathUtils.lerp(
          1,
          0.86,
          extraction,
        ),
      );
    }

    nodeRefs.current.forEach(
      (node, index) => {
        if (!node) return;

        const entity =
          PAPER_GRAPH_ENTITIES[index];

        const localReveal =
          range(
            graphFormation,
            index * 0.08,
            Math.min(
              1,
              index * 0.08 + 0.34,
            ),
          );

        node.visible =
          localReveal > 0.01;

        node.position.x =
          THREE.MathUtils.damp(
            node.position.x,
            THREE.MathUtils.lerp(
              0,
              entity.x,
              localReveal,
            ),
            reduced ? 20 : 8,
            delta,
          );

        node.position.y =
          THREE.MathUtils.damp(
            node.position.y,
            THREE.MathUtils.lerp(
              0,
              entity.y,
              localReveal,
            ),
            reduced ? 20 : 8,
            delta,
          );

        const scale =
          THREE.MathUtils.lerp(
            0.15,
            1,
            localReveal,
          );

        node.scale.setScalar(scale);

        if (
          node.material instanceof
            THREE.MeshBasicMaterial
        ) {
          node.material.opacity =
            visibility *
            localReveal *
            0.92;
        }
      },
    );

    edgeRefs.current.forEach(
      (edge, index) => {
        if (
          !edge ||
          !(
            edge.material instanceof
            THREE.MeshBasicMaterial
          )
        ) {
          return;
        }

        const localReveal =
          range(
            graphFormation,
            0.34 + index * 0.06,
            0.62 + index * 0.06,
          );

        edge.visible =
          localReveal > 0.01;

        edge.material.opacity =
          visibility *
          localReveal *
          0.42;

        edge.scale.x =
          localReveal;
      },
    );
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, -4.5]}
    >
      {/* source paper */}
      <mesh ref={paperRef}>
        <planeGeometry args={[4.9, 3.05]} />
        <meshBasicMaterial
          color="#DFFBFF"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* abstract-like lines */}
      {Array.from({ length: 11 }).map((_, index) => (
        <mesh
          key={`paper-line-${index}`}
          position={[
            -0.45 + (index % 3) * 0.12,
            1.05 - index * 0.19,
            0.025,
          ]}
          scale={[
            1.65 - (index % 4) * 0.17,
            1,
            1,
          ]}
        >
          <planeGeometry args={[1, 0.025]} />
          <meshBasicMaterial
            color={
              index === 2 ||
              index === 5 ||
              index === 8
                ? "#5EEAD4"
                : "#64748B"
            }
            transparent
            opacity={
              index === 2 ||
              index === 5 ||
              index === 8
                ? 0.52
                : 0.22
            }
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* extracted entity nodes */}
      {PAPER_GRAPH_ENTITIES.map((entity, index) => (
        <mesh
          key={entity.label}
          ref={(node) => {
            nodeRefs.current[index] = node;
          }}
          position={[0, 0, 0.16]}
          visible={false}
        >
          <sphereGeometry args={[0.12, 20, 20]} />
          <meshBasicMaterial
            color={entity.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />

          <pointLight
            color={entity.color}
            intensity={0.16}
            distance={0.7}
            decay={2}
          />
        </mesh>
      ))}

      {/* mechanistic edges */}
      {edgeData.map((edge, index) => (
        <mesh
          key={`paper-edge-${index}`}
          ref={(mesh) => {
            edgeRefs.current[index] = mesh;
          }}
          position={[
            edge.midpoint.x,
            edge.midpoint.y,
            0.08,
          ]}
          rotation={[0, 0, edge.angle]}
          visible={false}
        >
          <planeGeometry
            args={[edge.length, 0.018]}
          />
          <meshBasicMaterial
            color={
              index % 2 === 0
                ? "#5EEAD4"
                : "#7DD3FC"
            }
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}



/* ====================================================== */
/* EVIDENCE FLOW + CONTRADICTION MODE                     */
/* ====================================================== */

const EVIDENCE_FLOW_NODES = [
  { x: -1.85, y: 0.72, z: -0.15, color: "#5EEAD4", kind: "support" },
  { x: -0.75, y: 1.18, z: 0.05, color: "#34D399", kind: "support" },
  { x: 0.45, y: 0.86, z: 0.12, color: "#7DD3FC", kind: "support" },
  { x: 1.58, y: 0.18, z: 0.05, color: "#F59E0B", kind: "limited" },
  { x: 0.82, y: -0.92, z: 0.12, color: "#FB7185", kind: "conflict" },
  { x: -0.72, y: -1.08, z: -0.04, color: "#5EEAD4", kind: "support" },
] as const;

const EVIDENCE_FLOW_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
  [1, 4],
] as const;

function EvidenceFlowScene({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(null);

  const pulseRefs =
    useRef<Array<THREE.Mesh | null>>([]);

  const edgeData =
    useMemo(
      () =>
        EVIDENCE_FLOW_EDGES.map(
          ([sourceIndex, targetIndex]) => {
            const source =
              EVIDENCE_FLOW_NODES[sourceIndex];

            const target =
              EVIDENCE_FLOW_NODES[targetIndex];

            const start =
              new THREE.Vector3(
                source.x,
                source.y,
                source.z,
              );

            const end =
              new THREE.Vector3(
                target.x,
                target.y,
                target.z,
              );

            const direction =
              end.clone().sub(start);

            const distance =
              direction.length();

            const midpoint =
              start
                .clone()
                .add(end)
                .multiplyScalar(0.5);

            const quaternion =
              new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize(),
              );

            return {
              start,
              end,
              midpoint,
              distance,
              quaternion,
              sourceIndex,
              targetIndex,
            };
          },
        ),
      [],
    );

  useFrame((state, delta) => {
    const group =
      groupRef.current;

    if (!group) return;

    const p =
      progress.get();

    const visibility =
      bell(
        p,
        0.61,
        0.655,
        0.79,
        0.835,
      );

    const contradiction =
      range(
        p,
        0.705,
        0.79,
      );

    group.visible =
      visibility > 0.004;

    const targetScale =
      THREE.MathUtils.lerp(
        0.7,
        1.12,
        range(
          p,
          0.62,
          0.75,
        ),
      );

    group.scale.setScalar(
      THREE.MathUtils.damp(
        group.scale.x,
        targetScale,
        reduced ? 20 : 7,
        delta,
      ),
    );

    if (!reduced) {
      group.rotation.y =
        Math.sin(
          state.clock.elapsedTime * 0.16,
        ) * 0.05;

      group.rotation.z =
        Math.sin(
          state.clock.elapsedTime * 0.11,
        ) * 0.025;
    }

    pulseRefs.current.forEach(
      (pulse, index) => {
        if (!pulse) return;

        const edge =
          edgeData[index];

        const phase =
          (
            state.clock.elapsedTime *
              (
                index === 4
                  ? 0.07
                  : 0.11
              ) +
            index * 0.17
          ) % 1;

        pulse.position.lerpVectors(
          edge.start,
          edge.end,
          phase,
        );

        const conflictEdge =
          index === 3 ||
          index === 4;

        const activeOpacity =
          conflictEdge
            ? THREE.MathUtils.lerp(
                0.42,
                1,
                contradiction,
              )
            : 0.86;

        if (
          pulse.material instanceof
            THREE.MeshBasicMaterial
        ) {
          pulse.material.opacity =
            visibility *
            activeOpacity;
        }

        pulse.visible =
          visibility > 0.02;
      },
    );
  });

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -2.6,
      ]}
    >
      {EVIDENCE_FLOW_NODES.map(
        (
          node,
          index,
        ) => (
          <group
            key={`evidence-node-${index}`}
            position={[
              node.x,
              node.y,
              node.z,
            ]}
          >
            <mesh>
              <sphereGeometry
                args={[
                  node.kind === "conflict"
                    ? 0.13
                    : 0.105,
                  18,
                  18,
                ]}
              />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={
                  node.kind === "conflict"
                    ? 0.88
                    : 0.76
                }
                blending={
                  THREE.AdditiveBlending
                }
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            <mesh>
              <sphereGeometry
                args={[
                  node.kind === "conflict"
                    ? 0.22
                    : 0.17,
                  16,
                  16,
                ]}
              />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={
                  node.kind === "conflict"
                    ? 0.1
                    : 0.055
                }
                blending={
                  THREE.AdditiveBlending
                }
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        ),
      )}

      {edgeData.map(
        (
          edge,
          index,
        ) => {
          const conflictEdge =
            index === 3 ||
            index === 4;

          return (
            <group key={`evidence-edge-${index}`}>
              <mesh
                position={
                  edge.midpoint
                }
                quaternion={
                  edge.quaternion
                }
              >
                <cylinderGeometry
                  args={[
                    conflictEdge
                      ? 0.014
                      : 0.009,
                    conflictEdge
                      ? 0.014
                      : 0.009,
                    edge.distance,
                    6,
                  ]}
                />
                <meshBasicMaterial
                  color={
                    conflictEdge
                      ? "#FB7185"
                      : index === 2
                        ? "#FBBF24"
                        : "#5EEAD4"
                  }
                  transparent
                  opacity={
                    conflictEdge
                      ? 0.34
                      : 0.22
                  }
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              {!reduced && (
                <mesh
                  ref={(mesh) => {
                    pulseRefs.current[index] =
                      mesh;
                  }}
                >
                  <sphereGeometry
                    args={[
                      conflictEdge
                        ? 0.032
                        : 0.025,
                      12,
                      12,
                    ]}
                  />
                  <meshBasicMaterial
                    color={
                      conflictEdge
                        ? "#FFF1F2"
                        : "#FFFFFF"
                    }
                    transparent
                    opacity={0}
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
        },
      )}
    </group>
  );
}



/* ====================================================== */
/* HYPOTHESIS BIRTH                                       */
/* ====================================================== */

function HypothesisBirthScene({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(null);

  const coreRef =
    useRef<THREE.Mesh | null>(null);

  const particles =
    useMemo(
      () =>
        Array.from({
          length: 24,
        }).map((_, index) => {
          const angle =
            (
              index /
              24
            ) *
            Math.PI *
            2;

          const radius =
            1.6 +
            (
              index %
              5
            ) *
              0.23;

          return {
            start:
              new THREE.Vector3(
                Math.cos(angle) *
                  radius,
                Math.sin(angle) *
                  radius *
                  0.62,
                -0.6 +
                  (
                    index %
                    6
                  ) *
                    0.22,
              ),
            phase:
              (
                index %
                7
              ) /
              7,
          };
        }),
      [],
    );

  const particleRefs =
    useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state, delta) => {
    const group =
      groupRef.current;

    const core =
      coreRef.current;

    if (
      !group ||
      !core
    ) {
      return;
    }

    const p =
      progress.get();

    const visibility =
      bell(
        p,
        0.77,
        0.815,
        0.91,
        0.95,
      );

    const convergence =
      range(
        p,
        0.79,
        0.89,
      );

    group.visible =
      visibility > 0.004;

    particleRefs.current.forEach(
      (
        particle,
        index,
      ) => {
        if (!particle) return;

        const data =
          particles[index];

        const local =
          THREE.MathUtils.clamp(
            convergence *
              1.18 -
              data.phase *
                0.18,
            0,
            1,
          );

        particle.position.lerpVectors(
          data.start,
          new THREE.Vector3(
            0,
            0,
            0,
          ),
          local,
        );

        const scale =
          THREE.MathUtils.lerp(
            1,
            0.42,
            local,
          );

        particle.scale.setScalar(
          scale,
        );

        if (
          particle.material instanceof
            THREE.MeshBasicMaterial
        ) {
          particle.material.opacity =
            visibility *
            THREE.MathUtils.lerp(
              0.65,
              0.08,
              local,
            );
        }
      },
    );

    const targetCoreScale =
      THREE.MathUtils.lerp(
        0.3,
        1.4,
        convergence,
      );

    core.scale.setScalar(
      THREE.MathUtils.damp(
        core.scale.x,
        targetCoreScale,
        reduced ? 20 : 8,
        delta,
      ),
    );

    if (
      core.material instanceof
        THREE.MeshBasicMaterial
    ) {
      core.material.opacity =
        visibility *
        THREE.MathUtils.lerp(
          0.18,
          0.96,
          convergence,
        );
    }

    if (!reduced) {
      group.rotation.z +=
        delta * 0.09;

      const pulse =
        1 +
        Math.sin(
          state.clock.elapsedTime *
            2.4,
        ) *
          0.07;

      core.scale.multiplyScalar(
        pulse,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -2.25,
      ]}
    >
      {particles.map(
        (
          data,
          index,
        ) => (
          <mesh
            key={`hypothesis-particle-${index}`}
            ref={(mesh) => {
              particleRefs.current[index] =
                mesh;
            }}
            position={data.start}
          >
            <sphereGeometry
              args={[
                0.035 +
                  (
                    index %
                    3
                  ) *
                    0.008,
                10,
                10,
              ]}
            />
            <meshBasicMaterial
              color={
                index % 4 === 0
                  ? "#34D399"
                  : index % 4 === 1
                    ? "#5EEAD4"
                    : index % 4 === 2
                      ? "#7DD3FC"
                      : "#FBBF24"
              }
              transparent
              opacity={0}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ),
      )}

      <mesh ref={coreRef}>
        <sphereGeometry
          args={[
            0.22,
            30,
            30,
          ]}
        />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <torusGeometry
          args={[
            0.72,
            0.012,
            8,
            100,
          ]}
        />
        <meshBasicMaterial
          color="#5EEAD4"
          transparent
          opacity={0.18}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          1.05,
          0.3,
          0.2,
        ]}
      >
        <torusGeometry
          args={[
            1.05,
            0.008,
            8,
            110,
          ]}
        />
        <meshBasicMaterial
          color="#7DD3FC"
          transparent
          opacity={0.11}
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
/* RESEARCH CONSTELLATION                                 */
/* ====================================================== */

function ResearchConstellation({
  progress,
  reduced,
}: JourneyProps) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const materialRef =
    useRef<THREE.PointsMaterial | null>(
      null,
    );

  const positions =
    useMemo(() => {
      const count = 90;
      const array =
        new Float32Array(
          count * 3,
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const arm =
          i % 5;

        const radius =
          0.6 +
          (
            i /
            count
          ) *
            5.2;

        const angle =
          radius *
            1.35 +
          arm *
            (
              Math.PI *
              2 /
              5
            );

        array[
          i * 3
        ] =
          Math.cos(angle) *
          radius;

        array[
          i * 3 + 1
        ] =
          Math.sin(angle) *
          radius *
          0.58;

        array[
          i * 3 + 2
        ] =
          -1.5 +
          Math.sin(
            i * 0.73,
          ) *
            1.2;
      }

      return array;
    }, []);

  useFrame(
    (
      _state,
      delta,
    ) => {
      const points =
        pointsRef.current;

      const material =
        materialRef.current;

      if (
        !points ||
        !material
      ) {
        return;
      }

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.885,
          0.92,
          0.975,
          1,
        );

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          visibility * 0.72,
          reduced ? 20 : 8,
          delta,
        );

      points.visible =
        visibility > 0.004;

      const scale =
        THREE.MathUtils.lerp(
          0.58,
          1.28,
          range(
            p,
            0.89,
            0.985,
          ),
        );

      points.scale.setScalar(
        THREE.MathUtils.damp(
          points.scale.x,
          scale,
          reduced ? 20 : 6,
          delta,
        ),
      );

      if (!reduced) {
        points.rotation.z +=
          delta * 0.025;

        points.rotation.y +=
          delta * 0.012;
      }
    },
  );

  return (
    <points
      ref={pointsRef}
      position={[
        0,
        0,
        -5,
      ]}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            positions,
            3,
          ]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#A5F3FC"
        size={0.055}
        transparent
        opacity={0}
        sizeAttenuation
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}


/* ====================================================== */
/* PERSISTENT PARTICLE FIELD                              */
/* ====================================================== */

function MolecularField({
  progress,
  reduced,
}: JourneyProps) {
  const pointsRef =
    useRef<THREE.Points | null>(
      null,
    );

  const materialRef =
    useRef<THREE.PointsMaterial | null>(
      null,
    );

  const count =
    reduced
      ? 220
      : 520;

  const positions =
    useMemo(() => {
      const array =
        new Float32Array(
          count * 3,
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const angle =
          Math.random() *
          Math.PI *
          2;

        const radius =
          THREE.MathUtils.randFloat(
            0.35,
            8.2,
          );

        array[
          i * 3
        ] =
          Math.cos(angle) *
          radius;

        array[
          i * 3 + 1
        ] =
          Math.sin(angle) *
          radius *
          0.62;

        array[
          i * 3 + 2
        ] =
          THREE.MathUtils.randFloat(
            -22,
            5,
          );
      }

      return array;
    }, [count]);

  useFrame(
    (
      _state,
      delta,
    ) => {
      const points =
        pointsRef.current;

      const material =
        materialRef.current;

      if (
        !points ||
        !material
      ) {
        return;
      }

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.245,
          0.31,
          0.91,
          0.995,
        );

      const targetOpacity =
        visibility *
        THREE.MathUtils.lerp(
          0.5,
          0.82,
          range(
            p,
            0.4,
            0.72,
          ),
        );

      material.opacity =
        THREE.MathUtils.damp(
          material.opacity,
          targetOpacity,
          7,
          delta,
        );

      points.visible =
        visibility >
        0.005;

      if (
        reduced ||
        visibility <
          0.005
      ) {
        return;
      }

      const attribute =
        points.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;

      const speed =
        THREE.MathUtils.lerp(
          1.3,
          5.4,
          range(
            p,
            0.32,
            0.68,
          ),
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        let z =
          attribute.getZ(i);

        z +=
          delta *
          (
            speed +
            (i % 6) *
              0.16
          );

        if (z > 5.5) {
          z =
            THREE.MathUtils.randFloat(
              -22,
              -13,
            );

          const angle =
            Math.random() *
            Math.PI *
            2;

          const radius =
            THREE.MathUtils.randFloat(
              0.3,
              8.2,
            );

          attribute.setX(
            i,
            Math.cos(angle) *
              radius,
          );

          attribute.setY(
            i,
            Math.sin(angle) *
              radius *
              0.62,
          );
        }

        attribute.setZ(
          i,
          z,
        );
      }

      attribute.needsUpdate =
        true;
    },
  );

  return (
    <points
      ref={pointsRef}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            positions,
            3,
          ]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#99F6E4"
        size={0.038}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        toneMapped={false}
      />
    </points>
  );
}

/* ====================================================== */
/* ENERGY TUNNEL                                          */
/* ====================================================== */

function EnergyTunnel({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const rings =
    useMemo(
      () =>
        Array.from({
          length: 8,
        }).map(
          (
            _,
            index,
          ) => ({
            radius:
              1.05 +
              index *
                0.68,
            z:
              -1.2 -
              index *
                1.35,
          }),
        ),
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

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.325,
          0.395,
          0.585,
          0.67,
        );

      group.visible =
        visibility >
        0.01;

      const targetScale =
        THREE.MathUtils.lerp(
          0.62,
          1.6,
          range(
            p,
            0.38,
            0.64,
          ),
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      if (!reduced) {
        group.rotation.z +=
          delta *
          0.11;

        group.rotation.y =
          Math.sin(
            state.clock.elapsedTime *
              0.23,
          ) *
          0.09;
      }

      group.children.forEach(
        (
          child,
          index,
        ) => {
          if (
            child instanceof
              THREE.Mesh &&
            child.material instanceof
              THREE.MeshBasicMaterial
          ) {
            child.material.opacity =
              visibility *
              (
                0.32 -
                index *
                  0.018
              );
          }
        },
      );
    },
  );

  return (
    <group ref={groupRef}>
      {rings.map(
        (
          ring,
          index,
        ) => (
          <mesh
            key={index}
            position={[
              0,
              0,
              ring.z,
            ]}
            rotation={[
              1.12,
              index *
                0.04,
              index *
                0.21,
            ]}
          >
            <torusGeometry
              args={[
                ring.radius,
                0.017,
                8,
                100,
              ]}
            />

            <meshBasicMaterial
              color={
                index %
                    3 ===
                  0
                  ? "#5EEAD4"
                  : index %
                        3 ===
                      1
                    ? "#7DD3FC"
                    : "#A5F3FC"
              }
              transparent
              opacity={0}
              blending={
                THREE.AdditiveBlending
              }
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ),
      )}
    </group>
  );
}

/* ====================================================== */
/* DNA                                                    */
/* ====================================================== */

function JourneyDNA({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const nodes =
    useMemo(() => {
      return Array.from({
        length: 28,
      }).map(
        (
          _,
          index,
        ) => {
          const y =
            (
              index -
              13.5
            ) *
            0.24;

          const angle =
            index *
            0.52;

          return {
            a:
              new THREE.Vector3(
                Math.cos(angle) *
                  1.1,
                y,
                Math.sin(angle) *
                  1.1,
              ),

            b:
              new THREE.Vector3(
                Math.cos(
                  angle +
                    Math.PI,
                ) *
                  1.1,
                y,
                Math.sin(
                  angle +
                    Math.PI,
                ) *
                  1.1,
              ),
          };
        },
      );
    }, []);

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

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.625,
          0.69,
          0.82,
          0.895,
        );

      group.visible =
        visibility >
        0.01;

      const formation =
        range(
          p,
          0.64,
          0.76,
        );

      const exit =
        range(
          p,
          0.82,
          0.895,
        );

      const targetScale =
        THREE.MathUtils.lerp(
          0.34,
          1.35,
          formation,
        ) *
        THREE.MathUtils.lerp(
          1,
          2.4,
          exit,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      group.position.z =
        THREE.MathUtils.damp(
          group.position.z,
          THREE.MathUtils.lerp(
            -3.8,
            1.5,
            formation,
          ),
          6,
          delta,
        );

      if (!reduced) {
        group.rotation.y +=
          delta *
          (
            0.12 +
            visibility *
              0.2
          );

        group.rotation.z =
          Math.sin(
            state.clock.elapsedTime *
              0.28,
          ) *
          0.08;
      }

      group.children.forEach(
        (child) => {
          if (
            child instanceof
            THREE.Group
          ) {
            child.children.forEach(
              (mesh) => {
                if (
                  mesh instanceof
                    THREE.Mesh &&
                  mesh.material instanceof
                    THREE.MeshBasicMaterial
                ) {
                  mesh.material.opacity =
                    visibility *
                    0.92;
                }
              },
            );
          }
        },
      );
    },
  );

  return (
    <group
      ref={groupRef}
      rotation={[
        0,
        0,
        Math.PI / 2,
      ]}
    >
      {nodes.map(
        (
          node,
          index,
        ) => {
          const direction =
            node.b
              .clone()
              .sub(
                node.a,
              );

          const distance =
            direction.length();

          const midpoint =
            node.a
              .clone()
              .add(
                node.b,
              )
              .multiplyScalar(
                0.5,
              );

          const quaternion =
            new THREE.Quaternion()
              .setFromUnitVectors(
                new THREE.Vector3(
                  0,
                  1,
                  0,
                ),
                direction
                  .clone()
                  .normalize(),
              );

          return (
            <group
              key={index}
            >
              <mesh
                position={
                  node.a
                }
              >
                <sphereGeometry
                  args={[
                    0.075,
                    10,
                    10,
                  ]}
                />

                <meshBasicMaterial
                  color="#99F6E4"
                  transparent
                  opacity={0}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              <mesh
                position={
                  node.b
                }
              >
                <sphereGeometry
                  args={[
                    0.075,
                    10,
                    10,
                  ]}
                />

                <meshBasicMaterial
                  color="#7DD3FC"
                  transparent
                  opacity={0}
                  blending={
                    THREE.AdditiveBlending
                  }
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              <mesh
                position={
                  midpoint
                }
                quaternion={
                  quaternion
                }
              >
                <cylinderGeometry
                  args={[
                    0.012,
                    0.012,
                    distance,
                    6,
                  ]}
                />

                <meshBasicMaterial
                  color="#7DD3FC"
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
        },
      )}
    </group>
  );
}

/* ====================================================== */
/* SINGULARITY                                            */
/* ====================================================== */

function Singularity({
  progress,
  reduced,
}: JourneyProps) {
  const groupRef =
    useRef<THREE.Group | null>(
      null,
    );

  const coreRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  useFrame(
    (
      state,
      delta,
    ) => {
      const group =
        groupRef.current;

      const core =
        coreRef.current;

      if (
        !group ||
        !core
      ) {
        return;
      }

      const p =
        progress.get();

      const visibility =
        bell(
          p,
          0.23,
          0.3,
          0.85,
          0.92,
        );

      group.visible =
        visibility >
        0.005;

      const collapse =
        range(
          p,
          0.92,
          0.995,
        );

      const targetScale =
        THREE.MathUtils.lerp(
          0.44,
          1.35,
          range(
            p,
            0.25,
            0.76,
          ),
        ) *
        THREE.MathUtils.lerp(
          1,
          3.0,
          collapse,
        );

      group.scale.setScalar(
        THREE.MathUtils.damp(
          group.scale.x,
          targetScale,
          6,
          delta,
        ),
      );

      if (!reduced) {
        group.rotation.z +=
          delta *
          0.13;
      }

      const pulse =
        1 +
        Math.sin(
          state.clock.elapsedTime *
            2.5,
        ) *
          0.12;

      core.scale.setScalar(
        pulse,
      );

      group.children.forEach(
        (child) => {
          if (
            child instanceof
              THREE.Mesh &&
            child.material instanceof
              THREE.MeshBasicMaterial
          ) {
            child.material.opacity =
              visibility *
              (
                child ===
                  core
                  ? 0.95
                  : 0.25
              );
          }
        },
      );
    },
  );

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry
          args={[
            0.18,
            28,
            28,
          ]}
        />

        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          1.1,
          0.1,
          0,
        ]}
      >
        <torusGeometry
          args={[
            1.2,
            0.016,
            8,
            120,
          ]}
        />

        <meshBasicMaterial
          color="#7DD3FC"
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation={[
          0.2,
          1,
          0.5,
        ]}
      >
        <torusGeometry
          args={[
            1.86,
            0.01,
            8,
            140,
          ]}
        />

        <meshBasicMaterial
          color="#5EEAD4"
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

/* ====================================================== */
/* CAMERA                                                 */
/* ====================================================== */

function JourneyCamera({
  progress,
  reduced,
}: JourneyProps) {
  const {
    camera,
  } =
    useThree();

  const {
    focusedCountry,
  } =
    useCountryFocus();

  const lookTarget =
    useRef(
      new THREE.Vector3(),
    );

  const focusAmount =
    useRef(0);

  useFrame(
    (
      state,
      delta,
    ) => {
      const p =
        progress.get();

      let targetZ = 9.4;
      let targetY = 0.8;
      let targetX = 0;

      if (p < 0.215) {
        const t =
          range(
            p,
            0.02,
            0.215,
          );

        targetZ =
          THREE.MathUtils.lerp(
            9.4,
            7.15,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0.8,
            0.28,
            t,
          );
      } else if (
        p < 0.315
      ) {
        const t =
          range(
            p,
            0.215,
            0.315,
          );

        targetZ =
          THREE.MathUtils.lerp(
            7.15,
            4.45,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0.28,
            0.06,
            t,
          );
      } else if (
        p < 0.455
      ) {
        const t =
          range(
            p,
            0.315,
            0.455,
          );

        targetZ =
          THREE.MathUtils.lerp(
            4.45,
            2.75,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0.06,
            0,
            t,
          );

        targetX =
          Math.sin(
            t *
              Math.PI,
          ) *
          0.055;
      } else if (
        p < 0.67
      ) {
        const t =
          range(
            p,
            0.455,
            0.67,
          );

        targetZ =
          THREE.MathUtils.lerp(
            5.8,
            3.75,
            t,
          );

        targetX =
          Math.sin(
            t *
              Math.PI *
              2,
          ) *
          0.11;

        targetY =
          Math.sin(
            t *
              Math.PI,
          ) *
          0.16;
      } else if (
        p < 0.86
      ) {
        const t =
          range(
            p,
            0.67,
            0.86,
          );

        targetZ =
          THREE.MathUtils.lerp(
            6.2,
            3.65,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            0,
            -0.08,
            t,
          );
      } else {
        const t =
          range(
            p,
            0.86,
            1,
          );

        targetZ =
          THREE.MathUtils.lerp(
            5.3,
            3.25,
            t,
          );

        targetY =
          THREE.MathUtils.lerp(
            -0.08,
            0,
            t,
          );
      }

      const canFocus =
        Boolean(
          focusedCountry,
        ) &&
        p < 0.215;

      focusAmount.current =
        THREE.MathUtils.damp(
          focusAmount.current,
          canFocus
            ? 1
            : 0,
          reduced
            ? 20
            : 4,
          delta,
        );

      targetZ =
        THREE.MathUtils.lerp(
          targetZ,
          5.35,
          focusAmount.current,
        );

      targetY =
        THREE.MathUtils.lerp(
          targetY,
          0.18,
          focusAmount.current,
        );

      if (
        !reduced &&
        !canFocus
      ) {
        targetX +=
          Math.sin(
            state.clock.elapsedTime *
              0.18,
          ) *
          0.032;

        targetY +=
          Math.sin(
            state.clock.elapsedTime *
              0.13,
          ) *
          0.022;
      }

      camera.position.x =
        THREE.MathUtils.damp(
          camera.position.x,
          targetX,
          5,
          delta,
        );

      camera.position.y =
        THREE.MathUtils.damp(
          camera.position.y,
          targetY,
          5,
          delta,
        );

      camera.position.z =
        THREE.MathUtils.damp(
          camera.position.z,
          targetZ,
          5,
          delta,
        );

      const targetLookY =
        canFocus
          ? 0.22
          : 0;

      lookTarget.current.y =
        THREE.MathUtils.damp(
          lookTarget.current.y,
          targetLookY,
          5,
          delta,
        );

      camera.lookAt(
        lookTarget.current,
      );

      if (
        camera instanceof
        THREE.PerspectiveCamera
      ) {
        let targetFov =
          THREE.MathUtils.lerp(
            47,
            44,
            range(
              p,
              0,
              0.215,
            ),
          );

        if (
          p > 0.215 &&
          p < 0.455
        ) {
          targetFov =
            THREE.MathUtils.lerp(
              44,
              36,
              range(
                p,
                0.215,
                0.455,
              ),
            );
        } else if (
          p >= 0.455
        ) {
          targetFov =
            THREE.MathUtils.lerp(
              48,
              54,
              range(
                p,
                0.455,
                0.67,
              ),
            );
        }

        if (p > 0.86) {
          targetFov =
            THREE.MathUtils.lerp(
              54,
              48,
              range(
                p,
                0.86,
                1,
              ),
            );
        }

        if (canFocus) {
          targetFov =
            THREE.MathUtils.lerp(
              targetFov,
              32,
              focusAmount.current,
            );
        }

        camera.fov =
          THREE.MathUtils.damp(
            camera.fov,
            targetFov,
            5,
            delta,
          );

        camera.updateProjectionMatrix();
      }
    },
  );

  return null;
}

/* ====================================================== */
/* WORLD                                                  */
/* ====================================================== */

function JourneyWorld({
  progress,
  reduced,
}: JourneyProps) {
  return (
    <CountryFocusProvider>
      <ambientLight
        intensity={0.1}
      />

      <directionalLight
        position={[
          5,
          2,
          6,
        ]}
        intensity={1.1}
        color="#E6FFFB"
      />

      <pointLight
        position={[
          -4,
          -2,
          3,
        ]}
        intensity={0.3}
        color="#38BDF8"
      />

      <pointLight
        position={[
          4,
          1,
          2,
        ]}
        intensity={0.3}
        color="#5EEAD4"
      />

      <Stars
        reduced={reduced}
      />

      <JourneyEarth
        progress={progress}
        reduced={reduced}
      />

      <CinematicCellDive
        progress={progress}
        reduced={reduced}
      />

      <PaperKnowledgeGraphScene
        progress={progress}
        reduced={reduced}
      />

      <EvidenceFlowScene
        progress={progress}
        reduced={reduced}
      />

      <HypothesisBirthScene
        progress={progress}
        reduced={reduced}
      />

      <ResearchConstellation
        progress={progress}
        reduced={reduced}
      />

      <OrbitSystem
        reduced={reduced}
      />

      <MolecularField
        progress={progress}
        reduced={reduced}
      />

      <EnergyTunnel
        progress={progress}
        reduced={reduced}
      />

      <JourneyDNA
        progress={progress}
        reduced={reduced}
      />

      <Singularity
        progress={progress}
        reduced={reduced}
      />

      <JourneyCamera
        progress={progress}
        reduced={reduced}
      />
    </CountryFocusProvider>
  );
}

/* ====================================================== */
/* TEXT                                                   */
/* ====================================================== */

function JourneyCopy({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const earthOpacity = useTransform(
    progress,
    [0.01, 0.045, 0.18, 0.22],
    [0, 1, 1, 0],
  );

  const earthY = useTransform(
    progress,
    [0.01, 0.06],
    [12, 0],
  );

  const transitionOpacity = useTransform(
    progress,
    [0.23, 0.265, 0.31, 0.345],
    [0, 1, 1, 0],
  );

  const transitionY = useTransform(
    progress,
    [0.23, 0.28],
    [14, 0],
  );

  const cellularOpacity = useTransform(
    progress,
    [0.355, 0.39, 0.43, 0.465],
    [0, 1, 1, 0],
  );

  const cellularY = useTransform(
    progress,
    [0.355, 0.40],
    [12, 0],
  );

  const molecularOpacity = useTransform(
    progress,
    [0.475, 0.52, 0.54, 0.58],
    [0, 1, 1, 0],
  );

  const molecularY = useTransform(
    progress,
    [0.475, 0.525],
    [12, 0],
  );

  const genomicOpacity = useTransform(
    progress,
    [0.68, 0.72, 0.75, 0.79],
    [0, 1, 1, 0],
  );

  const genomicY = useTransform(
    progress,
    [0.68, 0.73],
    [12, 0],
  );

  return (
    <>
      {/* PLANETARY SCALE */}
      <motion.div
        style={{ opacity: earthOpacity, y: earthY }}
        className="pointer-events-none absolute inset-x-0 top-[10vh] z-20 mx-auto max-w-5xl px-6 text-center"
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-teal-200/65">
          From organism to mechanism
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-[76px]">
          Life exists
          <span className="block bg-gradient-to-r from-teal-200 via-cyan-100 to-sky-300 bg-clip-text text-transparent">
            in layers.
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300/78">
          Move from the scale of a living organism into the cellular and molecular systems that shape disease.
        </p>

        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-teal-100/10 bg-[#071722]/55 px-3.5 py-2 font-mono text-[7px] font-semibold uppercase tracking-[0.18em] text-teal-100/55 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,.65)]" />
          Global research links · Tashkent → Doha → USA
        </div>

        <div className="mx-auto mt-3 hidden w-fit items-center gap-2 sm:flex">
          {[
            ["🇺🇿", "Tashkent"],
            ["🇶🇦", "Doha"],
            ["🇺🇸", "Baltimore"],
          ].map(([flag, city], index) => (
            <div
              key={city}
              className="flex items-center gap-1.5 rounded-full border border-teal-100/[0.08] bg-[#071722]/42 px-2.5 py-1.5 font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-300/70 backdrop-blur-xl"
            >
              <span className="text-[11px] leading-none">
                {flag}
              </span>

              <span>
                {city}
              </span>

              {index < 2 && (
                <span className="ml-1 text-teal-300/45">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* TRANSITION */}
      <motion.div
        style={{ opacity: transitionOpacity, y: transitionY }}
        className="pointer-events-none absolute inset-x-0 top-[42vh] z-20 px-6 text-center"
      >
        <p className="text-[8px] font-semibold uppercase tracking-[0.44em] text-teal-200/60">
          Scale transition
        </p>

        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
          Cross the scale barrier.
          <span className="block text-teal-100/85">From tissue into a living cell.</span>
        </h3>
      </motion.div>

      {/* CELLULAR LAYER */}
      <motion.div
        style={{ opacity: cellularOpacity, y: cellularY }}
        className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 px-6 text-center"
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.44em] text-teal-200/60">
          Layer 01 / Cellular
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-[72px]">
          Cancer begins
          <span className="block bg-gradient-to-r from-teal-200 via-cyan-100 to-sky-300 bg-clip-text text-transparent">
            inside living systems.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300/78">
          Tumor cells, fibroblasts, immune cells and their microenvironment interact as one dynamic biological layer.
        </p>
      </motion.div>

      {/* MOLECULAR / PATHWAY LAYER */}
      <motion.div
        style={{ opacity: molecularOpacity, y: molecularY }}
        className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 px-6 text-center"
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-sky-200/65">
          Layer 02 / Molecular signaling
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-[72px]">
          Cells communicate
          <span className="block bg-gradient-to-r from-teal-200 via-cyan-100 to-sky-300 bg-clip-text text-transparent">
            through molecular networks.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300/82">
          Ligands, receptors, proteins and signaling pathways transmit biological information across the tumor system.
        </p>
      </motion.div>

      {/* GENOMIC / PROTEIN LAYER */}
      <motion.div
        style={{ opacity: genomicOpacity, y: genomicY }}
        className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 px-6 text-center"
      >
        <p className="text-[8px] font-semibold uppercase tracking-[0.44em] text-sky-200/65">
          Layer 03 / Genes & proteins
        </p>

        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Molecular changes become
          <span className="block bg-gradient-to-r from-sky-200 via-cyan-100 to-sky-300 bg-clip-text text-transparent">
            biological behavior.
          </span>
        </h3>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400/85">
          Genes and proteins feed into pathways, processes and ultimately the phenotypes we recognize as disease.
        </p>
      </motion.div>
    </>
  );
}


function CellDiveReticle({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.235,
        0.275,
        0.39,
        0.455,
      ],
      [
        0,
        0.72,
        0.72,
        0,
      ],
    );

  const scale =
    useTransform(
      progress,
      [
        0.235,
        0.455,
      ],
      [
        1.25,
        0.64,
      ],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
        scale,
      }}
      className="
        pointer-events-none
        absolute
        left-1/2
        top-1/2
        z-[15]
        h-[42vmin]
        w-[42vmin]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        border
        border-teal-100/10
      "
    >
      <span
        className="
          absolute
          left-1/2
          top-[-7px]
          h-3.5
          w-px
          -translate-x-1/2
          bg-teal-200/30
        "
      />

      <span
        className="
          absolute
          bottom-[-7px]
          left-1/2
          h-3.5
          w-px
          -translate-x-1/2
          bg-teal-200/30
        "
      />

      <span
        className="
          left-[-7px]
          top-1/2
          absolute
          h-px
          w-3.5
          -translate-y-1/2
          bg-teal-200/30
        "
      />

      <span
        className="
          right-[-7px]
          top-1/2
          absolute
          h-px
          w-3.5
          -translate-y-1/2
          bg-teal-200/30
        "
      />

      <span
        className="
          absolute
          left-1/2
          top-1/2
          h-2
          w-2
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-200/90
          shadow-[0_0_18px_rgba(153,246,228,.65)]
        "
      />
    </motion.div>
  );
}




/* ====================================================== */
/* PAPER → GRAPH HUD                                      */
/* ====================================================== */

function PaperGraphHUD({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [0.58, 0.62, 0.68, 0.72],
      [0, 1, 1, 0],
    );

  const y =
    useTransform(
      progress,
      [0.58, 0.63],
      [reduced ? 0 : 14, 0],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, y }}
      className="pointer-events-none absolute left-1/2 top-[12vh] z-[24] w-[min(92vw,720px)] -translate-x-1/2 text-center"
    >
      <div className="mx-auto w-fit rounded-full border border-teal-100/10 bg-[#06131d]/68 px-3 py-1.5 font-mono text-[7px] font-semibold uppercase tracking-[0.18em] text-teal-100/60 backdrop-blur-xl">
        Literature intelligence
      </div>

      <h3 className="mt-4 text-[clamp(1.35rem,3vw,2.7rem)] font-semibold tracking-[-0.045em] text-slate-50">
        From paper to mechanism.
      </h3>

      <p className="mx-auto mt-3 max-w-xl text-[11px] leading-6 text-slate-400 sm:text-xs">
        Biological entities emerge from the literature and assemble into a structured, inspectable knowledge graph.
      </p>

      <div className="mx-auto mt-4 flex w-fit items-center gap-2 font-mono text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span>Abstract</span>
        <span className="text-teal-300/45">→</span>
        <span className="text-teal-100/75">Entities</span>
        <span className="text-teal-300/45">→</span>
        <span className="text-cyan-100/80">Mechanism graph</span>
      </div>
    </motion.div>
  );
}



/* ====================================================== */
/* EVIDENCE INTELLIGENCE HUD                              */
/* ====================================================== */

function EvidenceIntelligenceHUD({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [0.72, 0.76, 0.82, 0.85],
      [0, 1, 1, 0],
    );

  const y =
    useTransform(
      progress,
      [0.72, 0.77],
      [reduced ? 0 : 14, 0],
    );

  const contradictionOpacity =
    useTransform(
      progress,
      [0.76, 0.80, 0.82, 0.84],
      [0, 1, 1, 0],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, y }}
      className="
        pointer-events-none
        absolute
        left-1/2
        top-[12vh]
        z-[25]
        w-[min(92vw,760px)]
        -translate-x-1/2
        text-center
      "
    >
      <div className="
        mx-auto
        w-fit
        rounded-full
        border
        border-emerald-200/10
        bg-[#06131d]/68
        px-3
        py-1.5
        font-mono
        text-[7px]
        font-semibold
        uppercase
        tracking-[0.18em]
        text-emerald-100/60
        backdrop-blur-xl
      ">
        Evidence intelligence
      </div>

      <h3 className="
        mt-4
        text-[clamp(1.35rem,3vw,2.8rem)]
        font-semibold
        tracking-[-0.045em]
        text-slate-50
      ">
        Evidence is not binary.
      </h3>

      <p className="
        mx-auto
        mt-3
        max-w-xl
        text-[11px]
        leading-6
        text-slate-400
        sm:text-xs
      ">
        BioLayers separates supporting, contextual, limited and contradictory signals instead of collapsing them into a single answer.
      </p>

      <div className="
        mx-auto
        mt-4
        flex
        w-fit
        flex-wrap
        items-center
        justify-center
        gap-2
      ">
        {[
          ["Supporting", "border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-200"],
          ["Contextual", "border-teal-300/15 bg-teal-300/[0.05] text-teal-200"],
          ["Limited", "border-amber-300/15 bg-amber-300/[0.05] text-amber-200"],
        ].map(([label, classes]) => (
          <span
            key={label}
            className={`rounded-full border px-2.5 py-1 font-mono text-[7px] font-semibold uppercase tracking-[0.13em] ${classes}`}
          >
            {label}
          </span>
        ))}

        <motion.span
          style={{
            opacity:
              contradictionOpacity,
          }}
          className="
            rounded-full
            border
            border-rose-300/20
            bg-rose-300/[0.06]
            px-2.5
            py-1
            font-mono
            text-[7px]
            font-semibold
            uppercase
            tracking-[0.13em]
            text-rose-200
            shadow-[0_0_24px_rgba(251,113,133,.08)]
          "
        >
          Contradictory
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ====================================================== */
/* HYPOTHESIS BIRTH HUD                                   */
/* ====================================================== */

function HypothesisBirthHUD({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [0.82, 0.855, 0.91, 0.935],
      [0, 1, 1, 0],
    );

  const y =
    useTransform(
      progress,
      [0.82, 0.86],
      [reduced ? 0 : 14, 0],
    );

  const cardScale =
    useTransform(
      progress,
      [0.835, 0.91],
      [0.94, 1],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
        y,
        scale: cardScale,
      }}
      className="
        pointer-events-none
        absolute
        left-1/2
        top-[12vh]
        z-[26]
        w-[min(92vw,690px)]
        -translate-x-1/2
      "
    >
      <div className="
        rounded-[22px]
        border
        border-teal-100/10
        bg-[#06131d]/78
        p-4
        shadow-[0_24px_70px_rgba(1,8,15,.32)]
        backdrop-blur-2xl
        sm:p-5
      ">
        <div className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        ">
          <div>
            <p className="
              font-mono
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-teal-200/55
            ">
              Generated hypothesis
              · illustrative
            </p>

            <h4 className="
              mt-2
              text-sm
              font-semibold
              tracking-[-0.025em]
              text-slate-100
              sm:text-base
            ">
              Evidence paths converge into a testable mechanistic question.
            </h4>
          </div>

          <span className="
            rounded-full
            border
            border-amber-300/12
            bg-amber-300/[0.04]
            px-2.5
            py-1
            font-mono
            text-[7px]
            font-semibold
            uppercase
            tracking-[0.13em]
            text-amber-200/80
          ">
            Hypothesis · not conclusion
          </span>
        </div>

        <div className="
          mt-4
          grid
          gap-2
          sm:grid-cols-3
        ">
          {[
            ["Supporting", "4 evidence paths", "text-emerald-200"],
            ["Conflicting", "1 unresolved signal", "text-rose-200"],
            ["Missing", "Human validation", "text-amber-200"],
          ].map(
            (
              [label, value, accent],
            ) => (
              <div
                key={label}
                className="
                  rounded-[14px]
                  border
                  border-teal-100/[0.06]
                  bg-teal-100/[0.025]
                  px-3
                  py-2.5
                "
              >
                <p className="
                  font-mono
                  text-[6px]
                  uppercase
                  tracking-[0.15em]
                  text-slate-500
                ">
                  {label}
                </p>

                <p className={`mt-1.5 text-[10px] font-semibold ${accent}`}>
                  {value}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ====================================================== */
/* RESEARCH CONSTELLATION HUD                             */
/* ====================================================== */

function ResearchConstellationHUD({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [0.92, 0.95, 0.975, 1],
      [0, 1, 1, 0],
    );

  const y =
    useTransform(
      progress,
      [0.92, 0.96],
      [reduced ? 0 : 14, 0],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, y }}
      className="
        pointer-events-none
        absolute
        left-1/2
        top-[12vh]
        z-[27]
        w-[min(92vw,760px)]
        -translate-x-1/2
        text-center
      "
    >
      <p className="
        font-mono
        text-[7px]
        font-semibold
        uppercase
        tracking-[0.22em]
        text-sky-200/55
      ">
        Research constellation
      </p>

      <h3 className="
        mt-3
        text-[clamp(1.45rem,3.2vw,3rem)]
        font-semibold
        tracking-[-0.05em]
        text-white
      ">
        Every mechanism is part of a larger map.
      </h3>

      <p className="
        mx-auto
        mt-3
        max-w-xl
        text-[11px]
        leading-6
        text-slate-400
        sm:text-xs
      ">
        BioLayers connects cells, genes, proteins, pathways, evidence and hypotheses into one evolving research space.
      </p>

      <div className="
        mx-auto
        mt-4
        flex
        w-fit
        items-center
        gap-2
        rounded-full
        border
        border-sky-200/10
        bg-[#06131d]/62
        px-3
        py-1.5
        font-mono
        text-[7px]
        font-semibold
        uppercase
        tracking-[0.14em]
        text-sky-100/60
        backdrop-blur-xl
      ">
        Evidence → Mechanism → Hypothesis
      </div>
    </motion.div>
  );
}


/* ====================================================== */
/* SCALE-DIVE HUD                                         */
/* ====================================================== */

function ScaleDiveHUD({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.22,
        0.26,
        0.435,
        0.49,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const scale =
    useTransform(
      progress,
      [
        0.215,
        0.49,
      ],
      [
        0.96,
        1.035,
      ],
    );

  const earthActive =
    useTransform(
      progress,
      [
        0.19,
        0.235,
        0.27,
      ],
      [
        1,
        1,
        0.26,
      ],
    );

  const tissueActive =
    useTransform(
      progress,
      [
        0.225,
        0.275,
        0.345,
        0.405,
      ],
      [
        0.25,
        1,
        1,
        0.3,
      ],
    );

  const cellActive =
    useTransform(
      progress,
      [
        0.31,
        0.37,
        0.46,
      ],
      [
        0.25,
        1,
        1,
      ],
    );

  const nucleusActive =
    useTransform(
      progress,
      [
        0.365,
        0.425,
        0.485,
      ],
      [
        0.2,
        1,
        0.72,
      ],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
        scale:
          reduced
            ? 1
            : scale,
      }}
      className="
        pointer-events-none
        absolute
        inset-x-0
        bottom-[8vh]
        z-[24]
        px-5
      "
    >
      <div
        className="
          mx-auto
          flex
          w-fit
          max-w-[92vw]
          items-center
          gap-2
          rounded-full
          border
          border-teal-100/10
          bg-[#06131d]/72
          px-3
          py-2
          shadow-[0_16px_50px_rgba(1,8,15,.26)]
          backdrop-blur-2xl
          sm:gap-3
          sm:px-4
        "
      >
        {[
          {
            label: "Earth",
            code: "10⁷ m",
            opacity:
              earthActive,
          },
          {
            label: "Tissue",
            code: "10⁻³ m",
            opacity:
              tissueActive,
          },
          {
            label: "Cell",
            code: "10⁻⁵ m",
            opacity:
              cellActive,
          },
          {
            label: "Nucleus",
            code: "10⁻⁶ m",
            opacity:
              nucleusActive,
          },
        ].map(
          (
            item,
            index,
          ) => (
            <div
              key={
                item.label
              }
              className="
                flex
                items-center
                gap-2
              "
            >
              <motion.div
                style={{
                  opacity:
                    item.opacity,
                }}
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-teal-200
                    shadow-[0_0_9px_rgba(94,234,212,.7)]
                  "
                />

                <div>
                  <p
                    className="
                      font-mono
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[0.17em]
                      text-teal-50/90
                      sm:text-[8px]
                    "
                  >
                    {
                      item.label
                    }
                  </p>

                  <p
                    className="
                      mt-0.5
                      font-mono
                      text-[6px]
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    "
                  >
                    {
                      item.code
                    }
                  </p>
                </div>
              </motion.div>

              {index <
                3 && (
                <span
                  className="
                    text-[9px]
                    text-teal-300/28
                  "
                >
                  →
                </span>
              )}
            </div>
          ),
        )}
      </div>
    </motion.div>
  );
}


/* ====================================================== */
/* ATMOSPHERIC ENTRY                                      */
/* ====================================================== */

function AtmosphericEntry({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.205,
        0.235,
        0.305,
        0.35,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const shockScale =
    useTransform(
      progress,
      [
        0.215,
        0.33,
      ],
      [
        0.18,
        3.2,
      ],
    );

  const beamScale =
    useTransform(
      progress,
      [
        0.21,
        0.32,
      ],
      [
        0.15,
        1,
      ],
    );

  return (
    <motion.div
      style={{
        opacity,
      }}
      className="
        pointer-events-none
        absolute
        inset-0
        z-[12]
        overflow-hidden
      "
    >
      <motion.div
        style={{
          scale:
            shockScale,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[36vmin]
          w-[36vmin]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-teal-100/30
          shadow-[0_0_45px_rgba(94,234,212,.18),0_0_100px_rgba(125,211,252,.16)]
        "
      />

      <motion.div
        style={{
          scaleY:
            beamScale,
        }}
        className="
          absolute
          bottom-[-10vh]
          left-1/2
          h-[85vh]
          w-[2px]
          origin-bottom
          -translate-x-1/2
          bg-gradient-to-t
          from-teal-200/10
          via-teal-100/75
          to-transparent
          shadow-[0_0_18px_rgba(255,255,255,.8),0_0_58px_rgba(94,234,212,.34)]
        "
      />

      {!reduced &&
        Array.from({
          length: 16,
        }).map(
          (
            _,
            index,
          ) => (
            <motion.span
              key={index}
              animate={{
                y: [
                  "-15vh",
                  "115vh",
                ],
                opacity: [
                  0,
                  0.85,
                  0.35,
                  0,
                ],
                scaleY: [
                  0.2,
                  1.2,
                  2.3,
                ],
              }}
              transition={{
                duration:
                  1.55 +
                  (
                    index %
                    5
                  ) *
                    0.22,
                repeat:
                  Infinity,
                delay:
                  (
                    index %
                    8
                  ) *
                  0.13,
                ease:
                  "linear",
              }}
              className="
                absolute
                top-0
                w-px
                rounded-full
                bg-gradient-to-b
                from-transparent
                via-teal-100/75
                to-sky-300/10
                shadow-[0_0_10px_rgba(94,234,212,.42)]
              "
              style={{
                left: `${
                  7 +
                  (
                    index *
                    37
                  ) %
                    86
                }%`,
                height:
                  58 +
                  (
                    index %
                    6
                  ) *
                    16,
              }}
            />
          ),
        )}
    </motion.div>
  );
}

/* ====================================================== */
/* GENE MATERIALIZATION                                   */
/* ====================================================== */

function GeneMaterialization({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.515,
        0.56,
        0.69,
        0.755,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const genes = [
    {
      name: "TP53",
      x: "15%",
      y: "38%",
    },
    {
      name: "BRCA1",
      x: "72%",
      y: "28%",
    },
    {
      name: "PTEN",
      x: "78%",
      y: "64%",
    },
    {
      name: "EGFR",
      x: "21%",
      y: "69%",
    },
    {
      name: "KRAS",
      x: "61%",
      y: "78%",
    },
    {
      name: "PIK3CA",
      x: "8%",
      y: "82%",
    },
    {
      name: "MYC",
      x: "87%",
      y: "42%",
    },
    {
      name: "AKT1",
      x: "32%",
      y: "27%",
    },
  ];

  return (
    <motion.div
      style={{
        opacity,
      }}
      className="
        pointer-events-none
        absolute
        inset-0
        z-[14]
      "
    >
      {genes.map(
        (
          gene,
          index,
        ) => (
          <motion.div
            key={
              gene.name
            }
            initial={
              reduced
                ? false
                : {
                    scale: 0.7,
                    opacity: 0,
                    filter:
                      "blur(8px)",
                  }
            }
            animate={
              reduced
                ? undefined
                : {
                    y: [
                      -5,
                      5,
                      -5,
                    ],
                  }
            }
            whileInView={{
              scale: 1,
              opacity: 1,
              filter:
                "blur(0px)",
            }}
            transition={{
              duration:
                0.75,
              delay:
                index *
                0.045,
            }}
            className="
              absolute
              -translate-x-1/2
              -translate-y-1/2
            "
            style={{
              left:
                gene.x,
              top:
                gene.y,
            }}
          >
            <div
              className="
                relative
                rounded-full
                border
                border-teal-100/18
                bg-teal-300/[0.05]
                px-3
                py-1.5
                font-mono
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-teal-50/85
                shadow-[0_0_24px_rgba(94,234,212,.10)]
                backdrop-blur-2xl
              "
            >
              <span
                className="
                  absolute
                  -left-1
                  top-1/2
                  h-2
                  w-2
                  -translate-y-1/2
                  rounded-full
                  bg-teal-200
                  shadow-[0_0_12px_rgba(94,234,212,.75)]
                "
              />

              {gene.name}
            </div>
          </motion.div>
        ),
      )}
    </motion.div>
  );
}


/* ====================================================== */
/* DNA → GRAPH FORMATION                                  */
/* ====================================================== */

function DNAToGraphBridge({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.735,
        0.775,
        0.835,
        0.875,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const ringScale =
    useTransform(
      progress,
      [
        0.745,
        0.82,
        0.875,
      ],
      [
        0.55,
        1.15,
        2.4,
      ],
    );

  const particles =
    useMemo(
      () =>
        Array.from({
          length: 22,
        }).map(
          (
            _,
            index,
          ) => ({
            left:
              12 +
              (
                index *
                37
              ) %
                76,

            top:
              18 +
              (
                index *
                29
              ) %
                64,

            delay:
              (
                index %
                8
              ) *
              0.04,

            size:
              2 +
              (
                index %
                3
              ),
          }),
        ),
      [],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
      }}
      className="
        pointer-events-none
        absolute
        inset-0
        z-[16]
        overflow-hidden
      "
    >
      {/* expanding molecular shockwave */}

      <motion.div
        style={{
          scale:
            ringScale,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[28vmin]
          w-[28vmin]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-teal-100/22
          shadow-[0_0_45px_rgba(94,234,212,.14),0_0_110px_rgba(125,211,252,.08)]
        "
      />

      <motion.div
        style={{
          scale:
            ringScale,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[46vmin]
          w-[46vmin]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-cyan-200/10
        "
      />

      {/* molecular fragments */}

      {particles.map(
        (
          particle,
          index,
        ) => (
          <motion.span
            key={index}
            initial={
              reduced
                ? false
                : {
                    left: "50%",
                    top: "50%",
                    opacity: 0,
                    scale: 0.3,
                  }
            }
            animate={
              reduced
                ? undefined
                : {
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    opacity: [
                      0,
                      0.9,
                      0.55,
                    ],
                    scale: [
                      0.35,
                      1.2,
                      0.8,
                    ],
                  }
            }
            transition={{
              duration:
                1.15,
              delay:
                particle.delay,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              absolute
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-gradient-to-br
              from-white
              via-teal-100
              to-sky-300
              shadow-[0_0_12px_rgba(94,234,212,.65)]
            "
            style={{
              width:
                particle.size,
              height:
                particle.size,
            }}
          />
        ),
      )}

      {/* temporary connective web */}

      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {[
          [50, 50, 20, 28],
          [50, 50, 22, 68],
          [50, 50, 78, 26],
          [50, 50, 80, 67],
          [50, 50, 38, 46],
          [50, 50, 62, 46],
          [50, 50, 50, 18],
        ].map(
          (
            line,
            index,
          ) => (
            <motion.line
              key={index}
              x1={
                line[0]
              }
              y1={
                line[1]
              }
              x2={
                line[2]
              }
              y2={
                line[3]
              }
              stroke={
                index %
                    2 ===
                  0
                  ? "rgba(196,181,253,.38)"
                  : "rgba(103,232,249,.32)"
              }
              strokeWidth="0.22"
              vectorEffect="non-scaling-stroke"
              initial={
                reduced
                  ? false
                  : {
                      pathLength: 0,
                      opacity: 0,
                    }
              }
              animate={
                reduced
                  ? undefined
                  : {
                      pathLength: 1,
                      opacity: [
                        0,
                        0.8,
                        0.25,
                      ],
                    }
              }
              transition={{
                duration:
                  0.9,
                delay:
                  0.12 +
                  index *
                    0.045,
              }}
            />
          ),
        )}
      </svg>

      <motion.div
        initial={
          reduced
            ? false
            : {
                opacity: 0,
                scale: 0.7,
              }
        }
        animate={
          reduced
            ? undefined
            : {
                opacity: [
                  0,
                  1,
                  0.2,
                ],
                scale: [
                  0.7,
                  1.15,
                  1,
                ],
              }
        }
        transition={{
          duration:
            1.1,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-3
          w-3
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-200
          shadow-[0_0_18px_rgba(94,234,212,.95),0_0_55px_rgba(167,139,250,.75),0_0_95px_rgba(34,211,238,.35)]
        "
      />
    </motion.div>
  );
}

/* ====================================================== */
/* KNOWLEDGE GRAPH                                        */
/* ====================================================== */

const GRAPH_NODES: GraphNode[] = [
  { id: "caf", label: "CAF", kind: "cell", x: 10, y: 48, size: 1.1 },
  { id: "tgfb", label: "TGF-β", kind: "ligand", x: 24, y: 38, size: 1 },
  { id: "tgfbr", label: "TGFBR", kind: "receptor", x: 37, y: 48, size: 1 },
  { id: "smad", label: "SMAD2/3", kind: "protein", x: 50, y: 38, size: 1.05 },
  { id: "pathway", label: "TGF-β pathway", kind: "pathway", x: 61, y: 54, size: 1.18 },
  { id: "emt", label: "EMT", kind: "process", x: 73, y: 39, size: 1.05 },
  { id: "invasion", label: "Invasion", kind: "phenotype", x: 84, y: 52, size: 1.12 },
  { id: "metastasis", label: "Metastasis", kind: "disease", x: 93, y: 35, size: 1.3 },
  { id: "evidence", label: "Evidence", kind: "evidence", x: 50, y: 17, size: 1 },
];

const GRAPH_EDGES: GraphEdge[] = [
  { from: "caf", to: "tgfb" },
  { from: "tgfb", to: "tgfbr" },
  { from: "tgfbr", to: "smad" },
  { from: "smad", to: "pathway" },
  { from: "pathway", to: "emt" },
  { from: "emt", to: "invasion" },
  { from: "invasion", to: "metastasis" },
  { from: "evidence", to: "tgfb" },
  { from: "evidence", to: "smad" },
  { from: "evidence", to: "emt" },
  { from: "evidence", to: "metastasis" },
];

const GRAPH_INFO: Record<
  string,
  {
    title: string;
    subtitle: string;
    detail: string;
  }
> = {
  caf: {
    title: "Cancer-associated fibroblast",
    subtitle: "Cellular layer",
    detail:
      "A stromal cell population within the tumor microenvironment capable of influencing cancer behavior through signaling, extracellular-matrix remodeling and secreted factors.",
  },
  tgfb: {
    title: "TGF-β",
    subtitle: "Ligand layer",
    detail:
      "A secreted signaling molecule that can regulate stromal behavior, cellular plasticity and tumor-associated transcriptional programs.",
  },
  tgfbr: {
    title: "TGFBR",
    subtitle: "Receptor layer",
    detail:
      "The TGF-β receptor complex translates extracellular signaling into intracellular molecular activity.",
  },
  smad: {
    title: "SMAD2 / SMAD3",
    subtitle: "Protein layer",
    detail:
      "Intracellular signaling mediators that participate in canonical TGF-β signaling and downstream transcriptional regulation.",
  },
  pathway: {
    title: "TGF-β signaling",
    subtitle: "Pathway layer",
    detail:
      "A signaling pathway connecting extracellular cues with transcriptional and cellular responses.",
  },
  emt: {
    title: "EMT",
    subtitle: "Biological process layer",
    detail:
      "An epithelial–mesenchymal transition-associated program involving changes in adhesion, plasticity, migration and cellular state.",
  },
  invasion: {
    title: "Tumor invasion",
    subtitle: "Phenotype layer",
    detail:
      "A phenotype in which malignant cells acquire the ability to move through and penetrate surrounding tissue environments.",
  },
  metastasis: {
    title: "Metastatic progression",
    subtitle: "Disease layer",
    detail:
      "A high-level disease process emerging from interacting molecular, cellular, stromal and environmental mechanisms.",
  },
  evidence: {
    title: "Scientific evidence",
    subtitle: "Evidence layer",
    detail:
      "The literature layer that anchors mechanistic relationships to supporting publications and scientific context.",
  },
};

function getNodeKindClasses(kind: BiologicalLayer) {
  switch (kind) {
    case "cell":
      return "border-teal-200/35 bg-teal-400/[0.10] text-teal-50 shadow-[0_0_38px_rgba(45,212,191,.18)]";
    case "ligand":
    case "receptor":
      return "border-cyan-200/30 bg-cyan-400/[0.075] text-cyan-50 shadow-[0_0_32px_rgba(34,211,238,.14)]";
    case "gene":
    case "protein":
      return "border-sky-200/30 bg-sky-400/[0.075] text-sky-100 shadow-[0_0_32px_rgba(125,211,252,.14)]";
    case "pathway":
      return "border-indigo-200/25 bg-indigo-300/[0.055] text-indigo-100 shadow-[0_0_32px_rgba(165,180,252,.12)]";
    case "process":
      return "border-emerald-200/28 bg-emerald-300/[0.06] text-emerald-100 shadow-[0_0_32px_rgba(110,231,183,.12)]";
    case "phenotype":
      return "border-amber-200/28 bg-amber-300/[0.055] text-amber-100 shadow-[0_0_32px_rgba(252,211,77,.10)]";
    case "disease":
      return "border-rose-200/30 bg-rose-300/[0.065] text-rose-50 shadow-[0_0_36px_rgba(253,164,175,.12)]";
    case "evidence":
      return "border-teal-100/25 bg-teal-100/[0.065] text-teal-50 shadow-[0_0_34px_rgba(153,246,228,.10),0_0_55px_rgba(45,212,191,.08)]";
    default:
      return "border-white/15 bg-white/[0.05] text-slate-100";
  }
}

function KnowledgeGraph({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const [
    hoveredNode,
    setHoveredNode,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedNode,
    setSelectedNode,
  ] =
    useState<string | null>(
      null,
    );

  const activeNode =
    selectedNode ??
    hoveredNode;

  const opacity =
    useTransform(
      progress,
      [
        0.82,
        0.86,
        0.91,
        0.94,
      ],
      [
        0,
        1,
        1,
        0,
      ],
    );

  const scale =
    useTransform(
      progress,
      [
        0.82,
        0.88,
        0.92,
        0.95,
      ],
      [
        0.82,
        1,
        1.03,
        0.4,
      ],
    );

  const nodeMap =
    useMemo(
      () =>
        new Map(
          GRAPH_NODES.map(
            (node) => [
              node.id,
              node,
            ],
          ),
        ),
      [],
    );

  const connectedIds =
    useMemo(() => {
      if (!activeNode) {
        return new Set<string>();
      }

      const ids =
        new Set<string>([
          activeNode,
        ]);

      GRAPH_EDGES.forEach(
        (edge) => {
          if (
            edge.from ===
            activeNode
          ) {
            ids.add(
              edge.to,
            );
          }

          if (
            edge.to ===
            activeNode
          ) {
            ids.add(
              edge.from,
            );
          }
        },
      );

      return ids;
    }, [activeNode]);

  const activeInfo =
    activeNode
      ? GRAPH_INFO[
          activeNode
        ]
      : null;

  return (
    <motion.div
      style={{
        opacity,
        scale,
      }}
      className="
        absolute
        inset-0
        z-[18]
        origin-center
      "
    >
      {/* TITLE */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[9vh]
          -translate-x-1/2
          text-center
        "
      >
        <p
          className="
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.42em]
            text-teal-200/60
          "
        >
          Biological Layer Map · illustrative
        </p>

        <h3
          className="
            mt-3
            text-3xl
            font-semibold
            tracking-[-0.05em]
            text-white
            sm:text-5xl
          "
        >
          See cancer across every layer.
        </h3>

        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-sm
            leading-7
            text-slate-300/78
          "
        >
          Move from cell to molecule, pathway, process and disease.
          Every layer remains connected to evidence.
        </p>
      </div>

      {/* GRAPH */}

      <div
        className="
          absolute
          left-1/2
          top-[57%]
          h-[46vh]
          w-[86vw]
          max-w-[1100px]
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <svg
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
          "
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {GRAPH_EDGES.map(
            (
              edge,
              index,
            ) => {
              const from =
                nodeMap.get(
                  edge.from,
                );

              const to =
                nodeMap.get(
                  edge.to,
                );

              if (
                !from ||
                !to
              ) {
                return null;
              }

              const isActive =
                !activeNode ||
                edge.from ===
                  activeNode ||
                edge.to ===
                  activeNode;

              return (
                <motion.line
                  key={`${edge.from}-${edge.to}`}
                  x1={
                    from.x
                  }
                  y1={
                    from.y
                  }
                  x2={
                    to.x
                  }
                  y2={
                    to.y
                  }
                  stroke={
                    isActive
                      ? index %
                            2 ===
                          0
                        ? "rgba(103,232,249,.75)"
                        : "rgba(216,180,254,.72)"
                      : "rgba(148,163,184,.08)"
                  }
                  strokeWidth={
                    isActive
                      ? "0.34"
                      : "0.15"
                  }
                  vectorEffect="non-scaling-stroke"
                  initial={
                    reduced
                      ? false
                      : {
                          pathLength: 0,
                          opacity: 0,
                        }
                  }
                  whileInView={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  animate={
                    !reduced &&
                    isActive &&
                    activeNode
                      ? {
                          opacity: [
                            0.55,
                            1,
                            0.55,
                          ],
                        }
                      : undefined
                  }
                  transition={{
                    pathLength: {
                      duration:
                        0.8,
                      delay:
                        index *
                        0.05,
                    },

                    opacity: {
                      duration:
                        1.4,
                      repeat:
                        activeNode
                          ? Infinity
                          : 0,
                    },
                  }}
                />
              );
            },
          )}
        </svg>

        {GRAPH_NODES.map(
          (
            node,
            index,
          ) => {
            const isSelected =
              selectedNode ===
              node.id;

            const isHovered =
              hoveredNode ===
              node.id;

            const isConnected =
              !activeNode ||
              connectedIds.has(
                node.id,
              );

            return (
              <motion.button
                type="button"
                key={
                  node.id
                }
                aria-pressed={
                  isSelected
                }
                aria-label={`Explore ${node.label}`}
                onMouseEnter={() => {
                  setHoveredNode(
                    node.id,
                  );
                }}
                onMouseLeave={() => {
                  setHoveredNode(
                    null,
                  );
                }}
                onFocus={() => {
                  setHoveredNode(
                    node.id,
                  );
                }}
                onBlur={() => {
                  setHoveredNode(
                    null,
                  );
                }}
                onClick={() => {
                  setSelectedNode(
                    (
                      current,
                    ) =>
                      current ===
                      node.id
                        ? null
                        : node.id,
                  );
                }}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.5,
                        filter:
                          "blur(10px)",
                      }
                }
                whileInView={{
                  opacity:
                    isConnected
                      ? 1
                      : 0.22,

                  scale:
                    node.size,

                  filter:
                    isConnected
                      ? "blur(0px)"
                      : "blur(1px)",
                }}
                whileHover={
                  reduced
                    ? undefined
                    : {
                        scale:
                          node.size *
                          1.12,
                        zIndex: 20,
                      }
                }
                transition={{
                  duration:
                    0.45,
                  delay:
                    index *
                    0.045,
                }}
                className="
                  absolute
                  -translate-x-1/2
                  -translate-y-1/2
                  cursor-pointer
                  rounded-full
                  outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-200/70
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#020105]
                "
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
              >
                <div
                  className={`
                    relative
                    flex
                    min-h-12
                    min-w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    px-4
                    text-center
                    font-mono
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    backdrop-blur-2xl
                    transition-all
                    duration-300
                    ${getNodeKindClasses(node.kind)}

                    ${
                      isSelected ||
                      isHovered
                        ? "border-white/55 bg-white/[0.10] shadow-[0_0_32px_rgba(255,255,255,.18),0_0_70px_rgba(103,232,249,.16)]"
                        : ""
                    }
                  `}
                >
                  {!reduced && (
                    <>
                      <motion.span
                        animate={{
                          scale: [
                            1,
                            1.8,
                            1,
                          ],

                          opacity: [
                            0.35,
                            0.95,
                            0.35,
                          ],
                        }}
                        transition={{
                          duration:
                            2 +
                            (
                              index %
                              4
                            ) *
                              0.25,

                          repeat:
                            Infinity,

                          ease:
                            "easeInOut",
                        }}
                        className="
                          absolute
                          h-1.5
                          w-1.5
                          rounded-full
                           bg-teal-200
                           shadow-[0_0_12px_rgba(94,234,212,.8)]
                        "
                      />

                      {(isSelected ||
                        isHovered) && (
                        <motion.span
                          initial={{
                            scale:
                              0.4,
                            opacity:
                              0,
                          }}
                          animate={{
                            scale: [
                              0.7,
                              1.8,
                            ],

                            opacity: [
                              0.55,
                              0,
                            ],
                          }}
                          transition={{
                            duration:
                              1.4,

                            repeat:
                              Infinity,

                            ease:
                              "easeOut",
                          }}
                          className="
                            absolute
                            -inset-3
                            rounded-full
                            border
                            border-cyan-200/30
                          "
                        />
                      )}
                    </>
                  )}

                  <span
                    className="
                      relative
                      z-10
                    "
                  >
                    {node.label}
                  </span>
                </div>
              </motion.button>
            );
          },
        )}
      </div>

      {/* DETAIL PANEL */}

      <motion.div
        animate={{
          opacity:
            activeInfo
              ? 1
              : 0,

          y:
            activeInfo
              ? 0
              : 14,
        }}
        transition={{
          duration:
            0.28,
        }}
        className="
          pointer-events-none
          absolute
          bottom-[5.5vh]
          left-1/2
          z-30
          w-[min(92vw,620px)]
          -translate-x-1/2
        "
      >
        {activeInfo && (
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-black/55
              px-5
              py-4
              shadow-[0_0_55px_rgba(76,29,149,.14)]
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    font-mono
                    text-[7px]
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-cyan-200/45
                  "
                >
                  {
                    activeInfo.subtitle
                  }
                </p>

                <h4
                  className="
                    mt-1
                    text-lg
                    font-semibold
                    tracking-[-0.03em]
                    text-white
                  "
                >
                  {
                    activeInfo.title
                  }
                </h4>
              </div>

              {selectedNode && (
                <span
                  className="
                    rounded-full
                    border
                    border-teal-200/15
                    bg-teal-300/[0.05]
                    px-3
                    py-1
                    font-mono
                    text-[7px]
                    uppercase
                    tracking-[0.2em]
                    text-teal-100/60
                  "
                >
                  Locked
                </span>
              )}
            </div>

            <p
              className="
                mt-3
                text-xs
                leading-6
                text-slate-300/82
                sm:text-sm
              "
            >
              {
                activeInfo.detail
              }
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}


/* ====================================================== */
/* CLINICAL LOOP                                          */
/* ====================================================== */

function ClinicalLoopHUD({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const opacity =
    useTransform(
      progress,
      [0.94, 0.965, 0.988, 1],
      [0, 1, 1, 0],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="
        pointer-events-none
        absolute
        inset-x-0
        bottom-[5vh]
        z-[29]
        px-5
        text-center
      "
    >
      <p className="
        font-mono
        text-[7px]
        font-semibold
        uppercase
        tracking-[0.22em]
        text-teal-200/45
      ">
        Translational loop
      </p>

      <p className="
        mx-auto
        mt-2
        max-w-lg
        text-[11px]
        leading-6
        text-slate-400/85
        sm:text-xs
      ">
        From biological complexity to structured evidence and testable mechanisms — organized so researchers can move from literature to hypothesis-driven experiments.
      </p>
    </motion.div>
  );
}


/* ====================================================== */
/* COLLAPSE INTO ABOUT                                    */
/* ====================================================== */

function AboutCollapse({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const opacity =
    useTransform(
      progress,
      [
        0.925,
        0.965,
        1,
      ],
      [
        0,
        1,
        0,
      ],
    );

  const scale =
    useTransform(
      progress,
      [
        0.925,
        1,
      ],
      [
        0.1,
        7,
      ],
    );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
        scale,
      }}
      className="
        pointer-events-none
        absolute
        left-1/2
        top-1/2
        z-[28]
        h-28
        w-28
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        border
        border-teal-200/20
        bg-teal-300/[0.03]
        shadow-[0_0_40px_rgba(45,212,191,.25),0_0_100px_rgba(34,211,238,.18),0_0_220px_rgba(6,17,26,.12)]
      "
    />
  );
}

/* ====================================================== */
/* MAIN                                                   */
/* ====================================================== */

export default function BioJourney() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null,
    );

  const reduced = Boolean(
    useReducedMotion(),
  );

  const {
    scrollYProgress,
  } = useScroll({
    target:
      sectionRef,
    offset: [
      "start start",
      "end end",
    ],
  });

  const progress =
    useSpring(
      scrollYProgress,
      {
        stiffness: reduced
          ? 1000
          : 78,
        damping: reduced
          ? 100
          : 24,
        mass: reduced
          ? 0.1
          : 0.34,
      },
    );

  const tealAura =
    useTransform(
      progress,
      [
        0,
        0.22,
        0.5,
        0.78,
        1,
      ],
      [
        0.3,
        0.46,
        0.58,
        0.48,
        0.28,
      ],
    );

  const cyanAura =
    useTransform(
      progress,
      [
        0.16,
        0.36,
        0.68,
        0.92,
        1,
      ],
      [
        0.06,
        0.24,
        0.34,
        0.2,
        0.06,
      ],
    );

  const iceAura =
    useTransform(
      progress,
      [
        0.42,
        0.66,
        0.9,
        1,
      ],
      [
        0.03,
        0.18,
        0.28,
        0.08,
      ],
    );

  const flash =
    useTransform(
      progress,
      [
        0.25,
        0.29,
        0.335,
        0.91,
        0.965,
        0.995,
      ],
      [
        0,
        0.22,
        0,
        0,
        0,
        0,
      ],
    );

  return (
    <section
      ref={sectionRef}
      id="bio-journey"
      aria-label="Biological scale journey from organism to molecular mechanism"
      className="
        relative
        h-[620vh]
        bg-[#06111a]
      "
    >
      <div
        className="
          sticky
          top-0
          h-screen
          overflow-hidden
          bg-[#06111a]
        "
      >
        {/* BASE */}

        <div
          className="
            absolute
            inset-0
            bg-[#06111a]
          "
        />

        {/* ALWAYS-ON DEPTH */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[1]
            bg-[radial-gradient(circle_at_50%_52%,rgba(13,45,55,.17)_0%,rgba(6,23,34,.13)_38%,rgba(4,13,20,.28)_100%)]
          "
        />

        {/* TEAL CORE AURA */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              tealAura,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[1]
            h-[82vw]
            w-[82vw]
            min-h-[720px]
            min-w-[720px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(45,212,191,.20)_0%,rgba(34,211,238,.10)_26%,rgba(14,116,144,.035)_48%,transparent_72%)]
            blur-[105px]
          "
        />

        {/* CYAN AURA */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              cyanAura,
          }}
          className="
            pointer-events-none
            absolute
            right-[-16vw]
            top-[10%]
            z-[1]
            h-[58vw]
            w-[58vw]
            min-h-[540px]
            min-w-[540px]
            rounded-full
            bg-[radial-gradient(circle,rgba(125,211,252,.18)_0%,rgba(34,211,238,.07)_30%,transparent_68%)]
            blur-[130px]
          "
        />

        {/* ICE-BLUE AURA */}

        <motion.div
          aria-hidden="true"
          style={{
            opacity:
              iceAura,
          }}
          className="
            pointer-events-none
            absolute
            bottom-[-22vw]
            left-[-14vw]
            z-[1]
            h-[60vw]
            w-[60vw]
            min-h-[560px]
            min-w-[560px]
            rounded-full
            bg-[radial-gradient(circle,rgba(153,246,228,.10)_0%,rgba(125,211,252,.05)_34%,transparent_70%)]
            blur-[140px]
          "
        />

        {/* SINGLE WEBGL CANVAS */}

        <div
          className="
            absolute
            inset-0
            z-[2]
            bg-[#06111a]
          "
        >
          <Canvas
            camera={{
              position: [
                0,
                0.8,
                9.4,
              ],
              fov: 47,
              near: 0.1,
              far: 100,
            }}
            dpr={
              reduced
                ? 1
                : [
                    1,
                    1.1,
                  ]
            }
            gl={{
              alpha: false,
              antialias: true,
              powerPreference:
                "high-performance",
            }}
            onCreated={({
              gl,
            }) => {
              gl.setClearColor(
                0x06111a,
                1,
              );

              gl.outputColorSpace =
                THREE.SRGBColorSpace;

              gl.toneMapping =
                THREE.ACESFilmicToneMapping;

              gl.toneMappingExposure =
                1.08;
            }}
          >
            <JourneyWorld
              progress={
                progress
              }
              reduced={
                reduced
              }
            />
          </Canvas>
        </div>

        {/* DOM EFFECTS */}

        <CellDiveReticle
          progress={
            progress
          }
        />

        <PaperGraphHUD
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <EvidenceIntelligenceHUD
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <HypothesisBirthHUD
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <ResearchConstellationHUD
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <ClinicalLoopHUD
          progress={
            progress
          }
        />

        <ScaleDiveHUD
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <AtmosphericEntry
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <GeneMaterialization
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <DNAToGraphBridge
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <KnowledgeGraph
          progress={
            progress
          }
          reduced={
            reduced
          }
        />

        <JourneyCopy
          progress={
            progress
          }
        />

        <AboutCollapse
          progress={
            progress
          }
        />

        {/* FLASH — removed */}

        {/* HUD */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-5
            left-1/2
            z-40
            flex
            w-[54vw]
            max-w-[720px]
            -translate-x-1/2
            items-center
            gap-4
          "
        >
          <span
            className="
              font-mono
              text-[7px]
              uppercase
              tracking-[0.28em]
              text-teal-200/35
            "
          >
            Macro
          </span>

          <div
            className="
              relative
              h-px
              flex-1
              overflow-hidden
              bg-white/[0.06]
            "
          >
            <motion.div
              style={{
                scaleX:
                  progress,
              }}
              className="
                h-full
                w-full
                origin-left
                bg-gradient-to-r
                from-teal-200
                via-cyan-300
                to-sky-300
                shadow-[0_0_14px_rgba(94,234,212,.55)]
              "
            />
          </div>

          <span
            className="
              font-mono
              text-[7px]
              uppercase
              tracking-[0.28em]
              text-cyan-200/25
            "
          >
            Molecular
          </span>
        </div>
      </div>
    </section>
  );
}