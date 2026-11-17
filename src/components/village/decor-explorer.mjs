import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createDecor } from './map-decor.mjs';
import { fitDecor } from './decor-camera.mjs';
import { createMotionClock } from './motion-clock.mjs';

export function mountDecorExplorer(container, { kind, journey, onReady, onFallback }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch { onFallback(); return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const rig = createDecor(kind, journey, kind === 'coffret');
  const scene = new THREE.Scene(); scene.add(rig.root);
  scene.add(new THREE.HemisphereLight(0xf5f4ec, 0x626849, 1.4));
  const sun = new THREE.DirectionalLight(0xffecd7, 2.3);
  sun.position.set(-6, 14, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 60 });
  sun.shadow.bias = -.001; scene.add(sun);
  const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04); room.dispose(); pmrem.dispose();
  scene.environment = environment.texture; scene.environmentIntensity = .32;
  const camera = fitDecor(rig.root, (container.clientWidth || 900) / (container.clientHeight || 540));
  const controls = new OrbitControls(camera, renderer.domElement);
  const box = rig.root.userData.framingBox ?? new THREE.Box3().setFromObject(rig.root);
  controls.target.copy(box.getCenter(new THREE.Vector3()));
  controls.enableDamping = true; controls.enablePan = false;
  controls.minZoom = .5; controls.maxZoom = 3; controls.maxPolarAngle = Math.PI * .8;
  controls.update(); controls.saveState();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clock = createMotionClock({ fps: 30, reduced: preference.matches });
  const reduced = event => clock.setReduced(event.matches);
  const visible = () => clock.resetFrame();
  preference.addEventListener('change', reduced); document.addEventListener('visibilitychange', visible);
  let frame = 0, alive = true, ready = false;
  function resize() {
    const width = container.clientWidth || 900, height = container.clientHeight || 540;
    const fitted = fitDecor(rig.root, width / height);
    for (const key of ['left', 'right', 'top', 'bottom']) camera[key] = fitted[key];
    camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function render(ms) {
    if (!alive) return;
    frame = requestAnimationFrame(render);
    const tick = clock.tick(ms, document.hidden); if (!tick) return;
    rig.setArrival?.(true); rig.update(tick.time); controls.update(); renderer.render(scene, camera);
    if (!ready) { ready = true; onReady(); }
  }
  function lost(event) { event.preventDefault(); alive = false; cancelAnimationFrame(frame); onFallback(); }
  renderer.domElement.addEventListener('webglcontextlost', lost); frame = requestAnimationFrame(render);
  return {
    zoomBy(factor) { camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, .5, 3); camera.updateProjectionMatrix(); },
    reset() { controls.reset(); },
    destroy() {
      alive = false; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      preference.removeEventListener('change', reduced); document.removeEventListener('visibilitychange', visible);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      const geometries = new Set(), materials = new Set(), textures = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => { Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); }); material.dispose(); });
      textures.forEach(texture => texture.dispose()); environment.dispose(); sun.shadow.map?.dispose();
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
