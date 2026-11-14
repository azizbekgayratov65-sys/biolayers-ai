/*
  Three.js point cloud for a real CT scan, in the same visual language as
  the cell model: additive glowing points, one colour per structure.
  A horizontal plane follows the slice shown in the 2D viewer, and the
  cloud can be cut at that plane to look inside the chest.
*/

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { CT_CLASSES, type CtClassId, type CtPointCloud } from "./ctPoints";

export type CtSceneHandle = {
  setCloud: (cloud: CtPointCloud) => void;
  setClassVisible: (id: CtClassId, visible: boolean) => void;
  /* Slice position as a fraction from inferior (0) to superior (1). */
  setSlice: (fraction: number) => void;
  setCut: (on: boolean) => void;
  resetView: () => void;
  /* Turn the camera around its target (radians) — used by hand control. */
  rotateBy: (dTheta: number, dPhi: number) => void;
  /* Multiply the camera distance (below 1 zooms in) — used by hand control. */
  zoomBy: (factor: number) => void;
  dispose: () => void;
};

const BASE_ALPHA: Record<CtClassId, number> = { airway: 0.85, parenchyma: 0.3, vessel: 0.75, bone: 0.5 };
const SIZE: Record<CtClassId, number> = { airway: 1.1, parenchyma: 0.85, vessel: 1.05, bone: 1.0 };

export function createCtScene(container: HTMLElement, reducedMotion: boolean): CtSceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none;cursor:grab;";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.4;
  controls.maxDistance = 14;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.5;
  renderer.domElement.addEventListener("pointerdown", () => {
    controls.autoRotate = false;
  });

  const alpha = CT_CLASSES.map((c) => BASE_ALPHA[c.id]);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAlpha: { value: alpha },
      uSizes: { value: CT_CLASSES.map((c) => SIZE[c.id]) },
      uScale: { value: 13 },
      uPixelRatio: { value: pixelRatio },
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uHeart: { value: new THREE.Vector3() },
      uTop: { value: 1 },
      uCutY: { value: 0 },
      uCut: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aClass;
      attribute float aHu;
      uniform float uAlpha[4];
      uniform float uSizes[4];
      uniform float uScale;
      uniform float uPixelRatio;
      uniform float uTime;
      uniform float uBreath;
      uniform vec3 uHeart;
      uniform float uTop;
      uniform float uCutY;
      uniform float uCut;
      varying vec3 vColor;
      varying float vAlpha;
      varying float vBoost;

      vec3 ramp3(vec3 a, vec3 b, vec3 c, float t) {
        return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, t * 2.0 - 1.0);
      }

      void main() {
        int c = int(aClass + 0.5);
        float seed = fract(sin(dot(position, vec3(12.9898, 78.233, 37.719))) * 43758.5453);

        // Neon colour by class, shifted by density.
        if (c == 0) {
          vColor = mix(vec3(0.0, 0.96, 0.83), vec3(0.49, 1.0, 0.31), clamp((aHu + 1024.0) / 64.0, 0.0, 1.0));
        } else if (c == 1) {
          vColor = mix(vec3(0.19, 0.36, 1.0), vec3(0.0, 0.9, 1.0), clamp((aHu + 960.0) / 460.0, 0.0, 1.0));
        } else if (c == 2) {
          vColor = ramp3(vec3(1.0, 0.18, 0.6), vec3(1.0, 0.48, 0.1), vec3(1.0, 0.84, 0.04), clamp((aHu + 500.0) / 700.0, 0.0, 1.0));
        } else {
          vColor = mix(vec3(0.61, 0.36, 1.0), vec3(0.93, 0.88, 1.0), clamp((aHu - 250.0) / 900.0, 0.0, 1.0));
        }

        // Breathing: the lungs swell, the skeleton barely moves.
        float swell = c == 3 ? 0.006 : 0.028;
        vec3 p = position * vec3(1.0 + swell * uBreath, 1.0 + swell * 1.2 * uBreath, 1.0 + swell * uBreath);
        float fr = 0.6 + 0.9 * seed;
        p += (c == 3 ? 0.0015 : 0.004) * vec3(sin(uTime * fr + seed * 40.0), cos(uTime * fr * 0.8 + seed * 31.0), sin(uTime * fr * 0.7 + seed * 23.0));

        // Pulses: blood waves from the heart through the vessels, air waves down the airways, sparkle in the tissue.
        float boost = 0.0;
        if (c == 2) boost = pow(0.5 + 0.5 * sin(length(position - uHeart) * 10.0 - uTime * 5.0), 8.0) * 1.6;
        else if (c == 0) boost = pow(0.5 + 0.5 * sin((uTop - position.y) * 5.0 - uTime * 1.46), 6.0) * 1.4;
        boost += pow(0.5 + 0.5 * sin(uTime * (1.2 + 2.8 * fract(seed * 41.0)) + seed * 100.0), 12.0) * (c == 1 ? 1.4 : 0.7);
        vBoost = boost;

        vAlpha = uAlpha[c];
        if (uCut > 0.5 && position.y > uCutY) vAlpha = 0.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uSizes[c] * (1.0 + 0.3 * boost) * uScale * uPixelRatio / max(0.05, -mv.z), 1.0, 18.0 * uPixelRatio);
        if (vAlpha < 0.001) {
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = 0.0;
        }
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vBoost;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d);
        float core = smoothstep(0.22, 0.0, d);
        vec3 c = vColor * (0.85 + 0.7 * core) * (1.0 + 0.8 * vBoost) + vec3(core * 0.25 * vBoost);
        gl_FragColor = vec4(c, a * vAlpha * (1.0 + 0.6 * vBoost));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  let geometry = new THREE.BufferGeometry();
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // Slice plane that follows the 2D viewer.
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.visible = false;
  scene.add(plane);
  const edgeGeometry = new THREE.EdgesGeometry(planeGeometry);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  plane.add(edges);

  let extent: [number, number, number] = [1.5, 1.5, 1.5];
  let sliceFraction = 0.5;

  const homePosition = () => {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitH = (extent[1] * 1.15) / tanHalf;
    const fitW = (extent[0] * 1.2) / (tanHalf * Math.max(0.2, camera.aspect));
    const dist = Math.max(fitH, fitW, 3);
    return new THREE.Vector3(0.25, 0.15, 1).normalize().multiplyScalar(dist);
  };

  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  camera.position.copy(homePosition());
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const applySlice = () => {
    const y = -extent[1] + sliceFraction * 2 * extent[1];
    plane.position.y = y;
    plane.scale.set(extent[0] * 2.1, extent[2] * 2.1, 1);
    material.uniforms.uCutY.value = y;
  };

  const start = performance.now();
  let frame = 0;
  const tick = () => {
    frame = requestAnimationFrame(tick);
    const t = reducedMotion ? 0 : (performance.now() - start) / 1000;
    material.uniforms.uTime.value = t;
    material.uniforms.uBreath.value = reducedMotion ? 0 : Math.sin((t * Math.PI * 2) / 4.3);
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  return {
    setCloud(cloud) {
      geometry.dispose();
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
      geometry.setAttribute("aClass", new THREE.BufferAttribute(cloud.classes, 1));
      geometry.setAttribute("aHu", new THREE.BufferAttribute(cloud.hu, 1));
      points.geometry = geometry;
      extent = cloud.extent;
      // Heart sits in front of the spine, a little below the middle of the chest.
      (material.uniforms.uHeart.value as THREE.Vector3).set(0.05 * extent[0], -0.15 * extent[1], 0.15 * extent[2]);
      material.uniforms.uTop.value = extent[1];
      plane.visible = true;
      applySlice();
      controls.target.set(0, 0, 0);
      camera.position.copy(homePosition());
    },
    setClassVisible(id, visible) {
      const index = CT_CLASSES.findIndex((c) => c.id === id);
      alpha[index] = visible ? BASE_ALPHA[id] : 0;
      material.uniforms.uAlpha.value = alpha;
    },
    setSlice(fraction) {
      sliceFraction = Math.min(1, Math.max(0, fraction));
      applySlice();
    },
    setCut(on) {
      material.uniforms.uCut.value = on ? 1 : 0;
    },
    resetView() {
      controls.target.set(0, 0, 0);
      camera.position.copy(homePosition());
      controls.autoRotate = !reducedMotion;
    },
    rotateBy(dTheta, dPhi) {
      controls.autoRotate = false;
      const offset = camera.position.clone().sub(controls.target);
      const sph = new THREE.Spherical().setFromVector3(offset);
      sph.theta -= dTheta;
      sph.phi = Math.min(Math.PI - 0.05, Math.max(0.05, sph.phi - dPhi));
      offset.setFromSpherical(sph);
      camera.position.copy(controls.target).add(offset);
    },
    zoomBy(factor) {
      const offset = camera.position.clone().sub(controls.target);
      const len = Math.min(controls.maxDistance, Math.max(controls.minDistance, offset.length() * factor));
      offset.setLength(len);
      camera.position.copy(controls.target).add(offset);
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      planeGeometry.dispose();
      planeMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
