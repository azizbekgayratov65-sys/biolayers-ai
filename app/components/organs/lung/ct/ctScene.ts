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
  dispose: () => void;
};

const BASE_ALPHA: Record<CtClassId, number> = { airway: 0.85, parenchyma: 0.28, vessel: 0.8, bone: 0.35 };
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
      uColors: { value: CT_CLASSES.map((c) => new THREE.Color(c.color)) },
      uAlpha: { value: alpha },
      uSizes: { value: CT_CLASSES.map((c) => SIZE[c.id]) },
      uScale: { value: 13 },
      uPixelRatio: { value: pixelRatio },
      uTime: { value: 0 },
      uCutY: { value: 0 },
      uCut: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aClass;
      uniform vec3 uColors[4];
      uniform float uAlpha[4];
      uniform float uSizes[4];
      uniform float uScale;
      uniform float uPixelRatio;
      uniform float uTime;
      uniform float uCutY;
      uniform float uCut;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        int c = int(aClass + 0.5);
        vColor = uColors[c];
        float twinkle = 0.85 + 0.15 * sin(uTime * 1.7 + position.x * 40.0 + position.y * 31.0 + position.z * 23.0);
        vAlpha = uAlpha[c] * twinkle;
        if (uCut > 0.5 && position.y > uCutY) vAlpha = 0.0;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uSizes[c] * uScale * uPixelRatio / max(0.05, -mv.z), 1.0, 16.0 * uPixelRatio);
        if (vAlpha < 0.001) {
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = 0.0;
        }
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d);
        float core = smoothstep(0.22, 0.0, d);
        gl_FragColor = vec4(vColor * (0.85 + 0.7 * core), a * vAlpha);
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
    material.uniforms.uTime.value = reducedMotion ? 0 : (performance.now() - start) / 1000;
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
      points.geometry = geometry;
      extent = cloud.extent;
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
