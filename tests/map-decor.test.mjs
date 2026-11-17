import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createMapDecor, fitDecor, DECOR_AREAS } from '../src/components/village/map-decor.mjs';

globalThis.document = { createElement: () => ({ getContext: () => null }) };

test('all roadside illustrations have real 3D geometry fitted inside their map area', () => {
  const items = createMapDecor();
  assert.deepEqual(items.map(item => item.kind), ['village', 'tubes', 'flowers', 'vanilla', 'forest', 'coffret', 'greenhouse']);
  for (const item of items) {
    let meshes = 0;
    item.root.traverse(object => { if (object.isMesh) meshes++; });
    assert(meshes > 3, item.kind + ' must contain several modeled objects');
    const box = new THREE.Box3().setFromObject(item.root);
    assert(!box.isEmpty());
    const camera = fitDecor(item.root, item.width / item.height);
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(camera);
      assert(Number.isFinite(p.x) && Math.abs(p.x) < 1, item.kind + ' horizontal framing');
      assert(Number.isFinite(p.y) && Math.abs(p.y) < 1, item.kind + ' vertical framing');
      assert(Math.abs(p.z) < 1, item.kind + ' camera depth');
    }
    item.update(3.5);
    item.update(40);
    item.root.traverse(object => assert(object.position.toArray().every(Number.isFinite)));
  }
});

test('roadside illustration areas stay inside the map and leave all five pin bodies unobstructed', () => {
  const pins = [[164,855],[665,488],[942,592],[1185,513],[1040,276]];
  for (const area of DECOR_AREAS) {
    assert(area.x >= 0 && area.y >= 60);
    assert(area.x + area.width <= 1440 && area.y + area.height <= 960);
    for (const [x,y] of pins) {
      const overlap = area.x < x + 24 && area.x + area.width > x - 24 && area.y < y && area.y + area.height > y - 76;
      assert(!overlap, area.kind + ' overlaps a pin');
    }
  }
});
