import * as THREE from 'three';
import { fitDecor } from './decor-camera.mjs';
import { DECOR_AREAS } from './map-layout.mjs';
export { DECOR_AREAS } from './map-layout.mjs';

export { fitDecor } from './decor-camera.mjs';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createTestTubes } from './test-tubes.mjs';
import { createRoadsideTrees } from './roadside-trees.mjs';
import { fragranceState } from './fragrance-state.mjs';
import { createInspirationGreenhouse, createSampleCoffret } from './fragrance-world.mjs';
import { createScentRibbon } from './scent-ribbon.mjs';
import { createMotionClock } from './motion-clock.mjs';
import { createProjectVillage } from './project-village.mjs';
import { createVillage, updateVillage } from './scene.mjs';

// Même repère que le SVG : la route et ses épingles restent indépendantes.

const material = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: .56, ...props });
function mesh(parent, geometry, surface, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, surface);
  object.position.set(x, y, z);
  object.castShadow = object.receiveShadow = true;
  parent.add(object);
  return object;
}
function stem(parent, from, to, radius, color) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), direction = b.clone().sub(a);
  const object = mesh(parent, new THREE.CylinderGeometry(radius, radius * 1.1, direction.length(), 7), material(color));
  object.position.copy(a.add(b).multiplyScalar(.5));
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return object;
}
function blossom(parent, x, y, z, rose = false, size = 1) {
  const flower = new THREE.Group();
  flower.position.set(x, y, z);
  flower.scale.setScalar(size);
  const colors = rose ? [0xb65476, 0xd87898, 0xed9bb4] : [0xfaf6e9, 0xfffdf6, 0xf1e7d7];
  for (let ring = 0; ring < (rose ? 3 : 1); ring++) {
    const count = rose ? 7 : 5, radius = rose ? .11 + ring * .10 : .22;
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count + ring * .5;
      const petal = mesh(flower, new THREE.SphereGeometry(1, 14, 10), material(colors[ring % 3], { roughness: .72, side: THREE.DoubleSide }), Math.sin(angle) * radius, (2 - ring) * .035, Math.cos(angle) * radius);
      petal.scale.set(rose ? .16 : .13, rose ? .10 : .045, rose ? .23 : .27);
      petal.rotation.set(rose ? -.5 : -.16, angle, 0);
    }
  }
  mesh(flower, new THREE.SphereGeometry(rose ? .09 : .075, 12, 8), material(rose ? 0xa94468 : 0xd4a936), 0, .09, 0);
  parent.add(flower);
  return flower;
}
function vanilla() {
  const group = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const points = [[-1.35, .03, i * .14], [-.5, .13, i * .14 + .1], [.45, .22, i * .16], [1.3, .38, i * .12]].map(p => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(points);
    mesh(group, new THREE.TubeGeometry(curve, 32, .045, 10, false), material(i === 0 ? 0x38251b : 0x59402b, { roughness: .85 }));
    const seam = points.map(p => p.clone().add(new THREE.Vector3(0, .04, 0)));
    mesh(group, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seam), 32, .007, 4, false), material(0x8b6941));
  }
  blossom(group, .5, .35, -.2, false, 1.15);
  const shape = [[0, 0], [.065, .015], [.1, .1], [.055, .22], [0, .35]].map(p => new THREE.Vector2(...p));
  for (let i = 0; i < 3; i++) {
    mesh(group, new THREE.LatheGeometry(shape, 20), new THREE.MeshPhysicalMaterial({ color: 0xd58a27, roughness: .16, clearcoat: 1, metalness: .12 }), .7 + i * .35, .02 + i % 2 * .15, .55);
  }
  return group;
}
function forest() {
  const group = new THREE.Group();
  for (let t = 0; t < 4; t++) {
    const tree = new THREE.Group(), height = [2.4, 3, 2.1, 2.8][t];
    tree.position.set((t - 1.5) * .85, 0, (t % 2) * .65);
    stem(tree, [0, 0, 0], [0, height, 0], .045, 0x73533c);
    const needles = new THREE.InstancedMesh(new THREE.ConeGeometry(.075, .36, 5), material(0x476b44, { roughness: .95 }), 180);
    const dummy = new THREE.Object3D();
    let index = 0;
    for (let layer = 0; layer < 9; layer++) {
      const y = .4 + layer * (height - .45) / 9, radius = .64 * (1 - layer / 10);
      for (let branch = 0; branch < 5; branch++) {
        const angle = branch * Math.PI * 2 / 5 + layer * .75;
        stem(tree, [0, y, 0], [Math.sin(angle) * radius, y - .12, Math.cos(angle) * radius], .009, 0x66543c);
        for (let n = 0; n < 4; n++) {
          const r = radius * (.3 + n * .22);
          dummy.position.set(Math.sin(angle) * r, y + .04, Math.cos(angle) * r);
          dummy.rotation.set(.45 * Math.cos(angle), angle, -.45 * Math.sin(angle));
          dummy.scale.setScalar(.75 + (9 - layer) * .035); dummy.updateMatrix();
          needles.setMatrixAt(index, dummy.matrix);
          needles.setColorAt(index++, new THREE.Color([0x365b3b, 0x54794b, 0x638450][(layer + n) % 3]));
        }
      }
    }
    needles.castShadow = needles.receiveShadow = true; tree.add(needles); group.add(tree);
  }
  return group;
}
export function createDecor(kind, journey = {}, previewCoffret = false) {
  const area = DECOR_AREAS.find(area => area.kind === kind);
  if (!area) throw new Error('Unknown map decor: ' + kind);
  let rig;
  switch (kind) {
    case 'village': {
      const village = createVillage({ completed: [], unlocked: -1 });
      rig = { root: village.root, update: time => updateVillage(village, time) }; break;
    }
    case 'tubes': rig = createTestTubes(); break;
    case 'projectVillage': rig = createProjectVillage(); break;
    case 'coffret': rig = createSampleCoffret(); break;
    case 'greenhouse': rig = createInspirationGreenhouse(); break;
    default: {
      const root = kind === 'vanilla' ? vanilla() : forest();
      rig = { root, update(time) { root.rotation.z = Math.sin(time * .65) * .012; } };
    }
  }
  rig.setState?.(fragranceState(journey, previewCoffret), true);
  return { ...area, ...rig };
}
export function createMapDecor(journey = {}, previewCoffret = false) {
  return DECOR_AREAS.map(area => createDecor(area.kind, journey, previewCoffret));
}
export function mountMapDecor(container, { onReady, onFallback, journey = {}, previewCoffret = false }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { onFallback(); return () => {}; }
  renderer.setPixelRatio(Math.max(2, Math.min(window.devicePixelRatio || 1, 2.5)));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true; renderer.autoClear = false;
  renderer.domElement.setAttribute('aria-hidden', 'true'); container.append(renderer.domElement);
  const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04); room.dispose(); pmrem.dispose();
  const items = createMapDecor(journey, previewCoffret).map(item => {
    const scene = new THREE.Scene(); scene.environment = environment.texture; scene.environmentIntensity = .32; scene.add(item.root);
    scene.add(new THREE.HemisphereLight(0xf5f4ec, 0x626849, 1.4));
    const light = new THREE.DirectionalLight(0xffecd7, 2.3); light.position.set(-6, 14, 10); light.castShadow = true;
    const size = item.kind === 'village' ? 12 : item.kind === 'projectVillage' ? 8 : 4;
    Object.assign(light.shadow.camera, { left: -size, right: size, top: size, bottom: -size, far: 45 });
    light.shadow.mapSize.set(512, 512); light.shadow.bias = -.001; scene.add(light);
    return { ...item, scene, light, camera: fitDecor(item.root, item.width / item.height) };
  });
  const roadside = createRoadsideTrees();
  const treeScene = new THREE.Scene(); treeScene.add(roadside.root);
  const scentRibbon = createScentRibbon(); treeScene.add(scentRibbon.root); scentRibbon.setState(fragranceState(journey, previewCoffret));
  treeScene.add(new THREE.HemisphereLight(0xf7f4e9, 0x657454, 1.5));
  const treeSun = new THREE.DirectionalLight(0xffecd5, 2.1); treeSun.position.set(-300, 800, 1000); treeScene.add(treeSun);
  const treeCamera = new THREE.OrthographicCamera(0, 1440, 900, 0, .1, 2000); treeCamera.position.set(0, 0, 1000); treeCamera.lookAt(0, 0, 0);
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = createMotionClock({ fps: 24, reduced: preference.matches });
  let playing = true, alive = true, frame = 0, clock = 0, dirty = true, first = true;
  function reduced(event) { motion.setReduced(event.matches); dirty = true; }
  preference.addEventListener('change', reduced);
  const visible = () => motion.resetFrame();
  document.addEventListener('visibilitychange', visible);
  function resize() { renderer.setSize(container.clientWidth || 1440, container.clientHeight || 900, false); dirty = true; }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function render(ms) {
    if (!alive) return;
    frame = requestAnimationFrame(render);
    const tick = motion.tick(ms, document.hidden);
    if (!tick || (!playing && !dirty)) return;
    if (playing) clock = tick.time;
    if (playing) scentRibbon.update(clock);
    items.find(item => item.kind === "coffret").setArrival(scentRibbon.arrived, !playing);
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return;
    renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.setScissorTest(true);
    for (const item of items) {
      const x = item.x / 1440 * width, y = (960 - item.y - item.height) / 900 * height;
      const w = item.width / 1440 * width, h = item.height / 900 * height;
      const previousLid = item.root.userData.lid?.rotation.x;
      if (playing) item.update(clock);
      const lidMoved = previousLid !== undefined && Math.abs(item.root.userData.lid.rotation.x - previousLid) > .001;
      if (first || (item.kind === 'coffret' && (dirty || lidMoved))) renderer.shadowMap.needsUpdate = true;
      renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); renderer.clearDepth(); renderer.render(item.scene, item.camera);
    }
    if (playing) roadside.update(clock);
    renderer.setViewport(0, 0, width, height); renderer.setScissor(0, 0, width, height); renderer.clearDepth(); renderer.render(treeScene, treeCamera);
    dirty = false;
    if (first) { first = false; onReady(); }
  }
  function lost(event) { event.preventDefault(); playing = false; onFallback(); }
  renderer.domElement.addEventListener('webglcontextlost', lost);
  frame = requestAnimationFrame(render);
  function destroy() {
    alive = false; cancelAnimationFrame(frame); observer.disconnect(); preference.removeEventListener('change', reduced); document.removeEventListener('visibilitychange', visible);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    const geometries = new Set(), materials = new Set(), textures = new Set();
    items.forEach(({ scene, light }) => { light.shadow.map?.dispose(); scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
    }); });
    treeScene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
    geometries.forEach(g => g.dispose()); materials.forEach(m => { Object.values(m).forEach(value => { if (value?.isTexture) textures.add(value); }); m.dispose(); }); textures.forEach(t => t.dispose());
    pictureCache.forEach(texture => texture.dispose());
    environment.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  }
  const pictureCache = new Map();
  const greenhouse = items.find(item => item.kind === 'greenhouse');
  const textureLoader = new THREE.TextureLoader();
  greenhouse.cards.forEach(card => {
    const texture = textureLoader.load(`/images/tracking/${card.key}.png`, loaded => {
      if (!alive) { loaded.dispose(); return; }
      loaded.colorSpace = THREE.SRGBColorSpace; dirty = true;
    }, undefined, () => { if (alive) dirty = true; });
    pictureCache.set(card.key, texture); card.photo.material.map = texture; card.photo.material.color.setHex(0xffffff); card.photo.material.needsUpdate = true;
  });
  function setJourney(nextJourney, nextPreview = false) {
    const state = fragranceState(nextJourney, nextPreview);
    items.forEach(item => item.setState?.(state, !playing)); scentRibbon.setState(state); dirty = true;
    if (!playing) { items.forEach(item => item.update(clock)); scentRibbon.update(clock); }
  }
  return { destroy, setJourney };
}
