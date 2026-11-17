import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createProjectVillage } from '../src/components/village/project-village.mjs';
import { createMapDecor, DECOR_AREAS, fitDecor } from '../src/components/village/map-decor.mjs';
import { fragranceState } from '../src/components/village/fragrance-state.mjs';

globalThis.document = { createElement: () => ({ getContext: () => null }) };

test('the local project village has five businesses, working people and recognizable ingredient stations', () => {
  const rig = createProjectVillage(), village = rig.root.userData.projectVillage;
  assert.deepEqual(village.buildings.map(building => building.userData.kind), ['vanilla-greenhouse','laboratory','pistachio-workshop','company-reception','sample-dispatch']);
  assert.equal(village.tasks.length, 6);
  assert(village.tasks.some(person => person.userData.role === 'pipetting'));
  assert(village.tasks.some(person => person.userData.role === 'packing-samples'));
  assert(village.van.userData.wheels.length === 4);
  let count = 0; rig.root.traverse(object => { if (object.isMesh) count++; });
  assert(count < 550, 'miniature must stay light enough to coexist with the other map scenes');
  assert(village.vanilla.children.length > 10 && village.pistachio.children.length > 10);
  assert(createMapDecor().some(item => item.kind === 'projectVillage'));
  assert(createMapDecor().some(item => item.kind === 'village'), 'the existing start village is retained');
});

test('work gestures, walking, transport, liquids and vapor animate deterministically', () => {
  const rig = createProjectVillage(), village = rig.root.userData.projectVillage;
  const state = fragranceState({ answers: { 1: { fields: { scentFamily: 'pistache' } } } });
  rig.setState(state);
  assert.equal(village.liquidVials[0].liquid.material.color.getHex(), state.colors[0]);
  const pose = () => [
    ...village.tasks.flatMap(person => person.userData.arms.map(arm => arm.rotation.x)),
    ...village.visitor.position.toArray(), ...village.van.position.toArray(),
    ...village.vapors.flatMap(({sprite}) => [...sprite.position.toArray(),sprite.material.opacity]),
    ...village.liquidVials.map(vial => vial.liquid.scale.y),
  ];
  rig.update(1); const before = pose(); rig.update(3);
  assert.notDeepEqual(pose(), before);
  const frozen = pose(); rig.update(3); assert.deepEqual(pose(), frozen);
});

test('visitor and van avoid the company buildings and the animated village stays framed', () => {
  const rig = createProjectVillage(), village = rig.root.userData.projectVillage;
  const footprints = village.buildings.map(building => new THREE.Box3().setFromObject(building));
  const slot = DECOR_AREAS.find(area => area.kind === 'projectVillage');
  const camera = fitDecor(rig.root, slot.width / slot.height);
  for (let time = 0; time < 120; time += .4) {
    rig.update(time);
    for (const moving of [village.visitor,village.van]) {
      const bounds = new THREE.Box3().setFromObject(moving);
      for (const building of footprints) assert(!(bounds.min.x < building.max.x && bounds.max.x > building.min.x && bounds.min.z < building.max.z && bounds.max.z > building.min.z), `${moving.userData.role || 'van'} intersects a building at ${time}`);
    }
    if (Math.round(time*10) % 40 === 0) {
      const bounds = new THREE.Box3().setFromObject(rig.root);
      for (const x of [bounds.min.x,bounds.max.x]) for (const y of [bounds.min.y,bounds.max.y]) for (const z of [bounds.min.z,bounds.max.z]) {
        const point = new THREE.Vector3(x,y,z).project(camera);
        assert(Math.abs(point.x) < 1 && Math.abs(point.y) < 1, 'village must stay inside its own slot');
      }
    }
  }
});
