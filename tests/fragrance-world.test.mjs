import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fragranceState } from '../src/components/village/fragrance-state.mjs';
import { createScentGarden, createInspirationGreenhouse, createSampleCoffret } from '../src/components/village/fragrance-world.mjs';
import { createTestTubes } from '../src/components/village/test-tubes.mjs';
import { createScentRibbon } from '../src/components/village/scent-ribbon.mjs';
import { fitDecor, DECOR_AREAS } from '../src/components/village/map-decor.mjs';
import { TREE_SPOTS } from '../src/components/village/roadside-trees.mjs';

const project = (text, key = '') => ({ answers: { 1: { text, tags: [], fields: { scentFamily: key } } }, legacyAnswers: {1: {text:'Maison Rose'}}, completed: [1] });

test('the world uses the active idea or explicit family and never changes project progress', () => {
  const input = project('Je veux une crème sucrée à la pistache');
  const original = JSON.stringify(input);
  assert.equal(fragranceState(input).key, 'pistache');
  assert.equal(fragranceState(input).current, 2);
  assert.equal(fragranceState(project('Sans rose, plutôt une vanille douce')).key, 'vanille');
  assert.equal(fragranceState(project('Vanille', 'boise')).key, 'boise');
  assert.equal(fragranceState(project('')).key, 'inspiration');
  assert.equal(fragranceState(input).coffretOpen, false);
  assert.equal(fragranceState(input, true).coffretOpen, true);
  assert.equal(fragranceState({ ...input, completed: [1,2,3,4] }).ready, true);
  assert.equal(JSON.stringify(input), original);
});

test('the laboratory follows selected colors, including an instant update while paused', () => {
  const rig = createTestTubes();
  const rose = fragranceState(project('', 'rose'));
  const vanilla = fragranceState(project('', 'vanille'));
  rig.setState(rose, true);
  assert.equal(rig.root.userData.tubes[0].liquid.material.color.getHex(), rose.colors[0]);
  rig.setState(vanilla);
  for (let t = 0; t < 4; t += .05) rig.update(t);
  assert(new THREE.Vector3().fromArray(rig.root.userData.tubes[0].liquid.material.color.toArray()).distanceTo(new THREE.Vector3().fromArray(new THREE.Color(vanilla.colors[0]).toArray())) < .001);
  rig.setState(rose, true);
  assert.equal(rig.root.userData.tubes[0].meniscus.material.color.getHex(), rose.colors[0]);
});

test('the sample box opens in preview or after the brief, closes, and remains within its camera', () => {
  const rig = createSampleCoffret(), closed = fragranceState(project('rose'));
  const camera = fitDecor(rig.root, 1);
  rig.setState(closed, true);
  assert(Math.abs(rig.root.userData.lid.rotation.x) < .00001);
  rig.setState(fragranceState(project('rose'), true));
  for (let time = 0; time < 4; time += .05) rig.update(time);
  assert(rig.root.userData.lid.rotation.x < -1.3);
  const box = new THREE.Box3().setFromObject(rig.root);
  for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) for (const z of [box.min.z,box.max.z]) {
    const point = new THREE.Vector3(x,y,z).project(camera);
    assert(Math.abs(point.x) < 1 && Math.abs(point.y) < 1);
  }
  rig.setState(closed, true);
  assert(Math.abs(rig.root.userData.lid.rotation.x) < .00001);
});

test('garden, inspiration cards and scent currents move and freeze at a constant clock', () => {
  const garden = createScentGarden(), serre = createInspirationGreenhouse(), ribbon = createScentRibbon();
  const state = fragranceState(project('rose'));
  const poses = root => { const values=[]; root.traverse(object => values.push(...object.position.toArray(),...object.rotation.toArray().slice(0,3),...object.scale.toArray())); return values; };
  for (const rig of [garden, serre, ribbon]) {
    rig.setState(state, true); rig.update(1);
    const before = poses(rig.root); rig.update(3);
    assert.notDeepEqual(poses(rig.root), before);
    const frozen = poses(rig.root); rig.update(3);
    assert.deepEqual(poses(rig.root), frozen);
  }
  assert(serre.cards.find(card => card.key === 'rose').group.scale.x > 1);
  assert(ribbon.destinations.every((value, i, list) => value > 0 && value < 1 && (i === 0 || value > list[i-1])));
});

test('new greenhouse leaves every roadside tree area free', () => {
  const greenhouse = DECOR_AREAS.find(area => area.kind === 'greenhouse');
  for (const tree of TREE_SPOTS) {
    const radius = tree.height * 20 / 95 + 2;
    assert(!(tree.x - radius < greenhouse.x + greenhouse.width && tree.x + radius > greenhouse.x && tree.y - tree.height < greenhouse.y + greenhouse.height && tree.y + 4 > greenhouse.y));
  }
});
