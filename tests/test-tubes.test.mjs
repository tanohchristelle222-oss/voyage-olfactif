import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTestTubes } from '../src/components/village/test-tubes.mjs';
import { fitDecor } from '../src/components/village/map-decor.mjs';

test('liquid levels rise and fall independently while bubbles remain below their moving surfaces', () => {
  const scene = createTestTubes();
  const tubes = scene.root.userData.tubes;
  assert.equal(tubes.length, 3);
  assert.equal(new Set(tubes.map(tube => tube.height)).size, 3);
  const ranges = tubes.map(() => ({ min: Infinity, max: -Infinity }));
  for (let time = 0; time < 120; time += .4) {
    scene.update(time);
    tubes.forEach((tube, index) => {
      const top = tube.meniscus.position.y;
      ranges[index].min = Math.min(ranges[index].min, top);
      ranges[index].max = Math.max(ranges[index].max, top);
      assert(top > tube.radius && top < tube.height - .2);
      assert(Math.abs(tube.liquid.position.y - tube.liquid.scale.y / 2 - tube.radius) < .00001);
      for (const bubble of tube.bubbles) {
        assert(bubble.position.y < top);
        assert(bubble.position.y > tube.radius);
        assert(Math.hypot(bubble.position.x, bubble.position.z) + bubble.scale.x < .253);
      }
      for (const particle of tube.steam) {
        assert(particle.position.y > tube.height);
        assert(particle.material.opacity >= 0 && particle.material.opacity <= .5);
      }
    });
  }
  assert(ranges.every(range => range.max - range.min > .8));
});

test('boiling stays framed and the same clock value freezes liquid, bubbles and vapor', () => {
  const scene = createTestTubes();
  const camera = fitDecor(scene.root, 255 / 245);
  for (const time of [0, 3.5, 10, 23, 57, 100]) {
    scene.update(time);
    const bounds = new THREE.Box3().setFromObject(scene.root);
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const point = new THREE.Vector3(x, y, z).project(camera);
      assert(Math.abs(point.x) < 1 && Math.abs(point.y) < 1);
    }
  }
  const snapshot = () => scene.root.userData.tubes.flatMap(tube => [tube.liquid.position.y, tube.liquid.scale.y, ...tube.bubbles.flatMap(item => item.position.toArray()), ...tube.steam.flatMap(item => [...item.position.toArray(), item.material.opacity])]);
  scene.update(11.5);
  const frozen = snapshot();
  scene.update(11.5);
  assert.deepEqual(snapshot(), frozen);
});
