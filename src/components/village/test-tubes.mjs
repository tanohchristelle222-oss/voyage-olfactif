import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function add(group, geometry, material, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position); mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh); return mesh;
}
const surface = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .6, ...extra });
function box(group, width, height, depth, color, position) {
  return add(group, new RoundedBoxGeometry(width, height, depth, 3, .035), surface(color), position);
}
function glassProfile(radius, height) {
  const points = [];
  for (let i = 0; i <= 12; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 24;
    points.push(new THREE.Vector2(Math.cos(angle) * radius, radius + Math.sin(angle) * radius));
  }
  points.push(new THREE.Vector2(radius, height - .06), new THREE.Vector2(radius + .025, height - .035), new THREE.Vector2(radius + .025, height), new THREE.Vector2(radius - .025, height), new THREE.Vector2(radius - .025, radius));
  for (let i = 0; i <= 12; i++) {
    const angle = -i * Math.PI / 24;
    points.push(new THREE.Vector2(Math.cos(angle) * (radius - .025), radius + Math.sin(angle) * (radius - .025)));
  }
  return points;
}
export function vaporTexture() {
  const size = 64, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x / (size - 1) - .5) * 2, dy = (y / (size - 1) - .5) * 2;
    const radius = dx * dx + dy * dy;
    const soft = Math.max(0, 1 - radius);
    const i = (y * size + x) * 4;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
    pixels[i + 3] = Math.round(255 * soft * soft * (.8 + .2 * Math.sin(x * .19 + y * .11)));
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.needsUpdate = true; return texture;
}

export function createTestTubes() {
  const root = new THREE.Group(); root.name = 'tubes-a-essai-etape-2';
  box(root, 3.5, .16, 1.35, 0xe6dcc9, [0, .08, 0]);
  box(root, .12, 1.32, .75, 0xcbaa7f, [-1.48, .8, 0]);
  box(root, .12, 1.32, .75, 0xcbaa7f, [1.48, .8, 0]);
  // Une vraie planche percée : le verre et le liquide restent visibles dans les trous.
  const outline = new THREE.Shape(); outline.moveTo(-1.5, -.45); outline.lineTo(1.5, -.45); outline.lineTo(1.5, .45); outline.lineTo(-1.5, .45); outline.closePath();
  for (const x of [-.95, 0, .95]) { const hole = new THREE.Path(); hole.absarc(x, 0, .375, 0, Math.PI * 2, true); outline.holes.push(hole); }
  const rail = add(root, new THREE.ExtrudeGeometry(outline, { depth: .13, bevelEnabled: false, curveSegments: 24 }), surface(0xd7b78a), [0, 1.43, 0]);
  rail.rotation.x = Math.PI / 2;
  const notebook = new THREE.Group(); notebook.position.set(1.7, .21, .5); notebook.rotation.y = -.25; root.add(notebook);
  box(notebook, .65, .09, .92, 0x94205f, [0, 0, 0]); box(notebook, .6, .065, .86, 0xf8edda, [0, .06, 0]);
  for (let i = 0; i < 3; i++) {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-.17, .1, -.25 + i * .22), new THREE.Vector3(-.12, .1, -.19 + i * .22), new THREE.Vector3(-.035, .1, -.31 + i * .22)]);
    add(notebook, new THREE.TubeGeometry(path, 6, .012, 5, false), surface(0x94205f));
  }
  const vaporMap = vaporTexture();
  const tubes = [-.95, 0, .95].map((x, index) => {
    const height = [2.5, 3.35, 2.95][index], radius = .285;
    const group = new THREE.Group(); group.position.set(x, .22, index === 1 ? -.06 : .04); root.add(group);
    const glass = add(group, new THREE.LatheGeometry(glassProfile(radius, height), 40), new THREE.MeshPhysicalMaterial({ color: 0xeaf7f8, metalness: .02, roughness: .07, transparent: true, opacity: .22, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }));
    glass.castShadow = false; glass.renderOrder = 4;
    const rim = add(group, new THREE.TorusGeometry(radius, .023, 10, 40), new THREE.MeshPhysicalMaterial({ color: 0xf3fbff, roughness: .06, transparent: true, opacity: .48, clearcoat: 1, depthWrite: false }), [0, height - .005, 0]); rim.rotation.x = Math.PI / 2; rim.renderOrder = 5; rim.castShadow = false;
    const color = [0xd99a32, 0x9b255d, 0xe398ac][index];
    const liquidMaterial = new THREE.MeshPhysicalMaterial({ color, roughness: .14, metalness: .02, transparent: true, opacity: .96, clearcoat: 1, depthWrite: false });
    const liquid = add(group, new THREE.CylinderGeometry(.253, .253, 1, 32), liquidMaterial);
    const base = add(group, new THREE.SphereGeometry(.253, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), liquidMaterial, [0, radius, 0]); base.renderOrder = liquid.renderOrder = 1;
    const meniscus = add(group, new THREE.CircleGeometry(.252, 36), surface(color, { roughness: .12, metalness: .22, side: THREE.DoubleSide })); meniscus.rotation.x = -Math.PI / 2; meniscus.renderOrder = 2;
    const rings = Array.from({ length: 2 }, () => {
      const ring = add(group, new THREE.TorusGeometry(1, .017, 5, 32), new THREE.MeshBasicMaterial({ color: 0xffe2d8, transparent: true, opacity: .2, depthWrite: false })); ring.rotation.x = Math.PI / 2; ring.renderOrder = 3; ring.castShadow = false; return ring;
    });
    const bubbles = Array.from({ length: 14 }, (_, i) => {
      const bubble = add(group, new THREE.SphereGeometry(1, 8, 6), new THREE.MeshPhysicalMaterial({ color: 0xffecd7, roughness: .1, transparent: true, opacity: .55, clearcoat: 1, depthWrite: false }));
      bubble.userData.phase = i / 14; bubble.renderOrder = 3; bubble.castShadow = false; return bubble;
    });
    const steam = Array.from({ length: 14 }, (_, i) => {
      const particle = new THREE.Sprite(new THREE.SpriteMaterial({ map: vaporMap, color: 0x987385, transparent: true, opacity: 0, depthWrite: false }));
      particle.userData.phase = (i + .5) / 14; group.add(particle); return particle;
    });
    return { group, height, radius, liquid, meniscus, rings, bubbles, steam, index };
  });
  root.userData.tubes = tubes;
  // Enveloppe stable incluant la vapeur : les panaches ne changent jamais le cadrage.
  root.userData.framingBox = new THREE.Box3(new THREE.Vector3(-1.9, 0, -.85), new THREE.Vector3(2.2, 5.2, 1.05));
  let lastTime = 0;
  let targetColors = null;
  function setState(state, instant = false) {
    targetColors = state.colors.map(color => new THREE.Color(color));
    if (instant) tubes.forEach((tube, i) => { tube.liquid.material.color.copy(targetColors[i]); tube.meniscus.material.color.copy(targetColors[i]); });
  }
  function update(time) {
    const blend = 1 - Math.exp(-Math.min(.1, Math.max(0, time - lastTime)) * 3);
    lastTime = time;
    tubes.forEach(tube => {
      const { index, height, radius, liquid, meniscus, rings, bubbles, steam } = tube;
      if (targetColors) { liquid.material.color.lerp(targetColors[index], blend); meniscus.material.color.lerp(targetColors[index], blend); }
      const level = .49 + .29 * Math.sin(time * .95 + index * 2.1);
      const top = radius + (height - radius - .22) * level;
      liquid.scale.y = top - radius; liquid.position.y = (top + radius) / 2;
      meniscus.position.y = top + .004; meniscus.rotation.x = -Math.PI / 2 + Math.sin(time * 3 + index) * .018;
      bubbles.forEach((bubble, i) => {
        const age = (time * (.65 + (i % 3) * .05) + bubble.userData.phase + index * .17) % 1;
        const angle = i * 2.4 + time * .3;
        bubble.position.set(Math.sin(angle) * (.06 + i % 3 * .04), radius + .025 + age * (top - radius - .06), Math.cos(angle) * .12);
        const size = .025 + age * .028; bubble.scale.setScalar(size); bubble.material.opacity = Math.sin(age * Math.PI) * .85;
      });
      rings.forEach((ring, i) => {
        const age = (time * 1.4 + i * .5 + index * .2) % 1;
        ring.scale.setScalar(.035 + age * .195); ring.position.y = top + .012; ring.material.opacity = (1 - age) * .5;
      });
      steam.forEach((particle, i) => {
        const age = (time * .22 + particle.userData.phase + index * .2) % 1;
        particle.position.set(Math.sin(age * 5 + index) * age * .15 + age * age * .15, height + .05 + age * 1.12, Math.cos(age * 6 + i) * age * .09);
        const size = .18 + age * .5; particle.scale.set(size * .7, size * 1.45, 1);
        particle.material.opacity = Math.sin(age * Math.PI) * .5; particle.material.rotation = index + age * .65;
      });
    });
  }
  update(0);
  return { root, update, setState };
}
