import test from 'node:test';
import assert from 'node:assert/strict';
import { createMotionClock } from '../src/components/village/motion-clock.mjs';
import { createTestTubes } from '../src/components/village/test-tubes.mjs';
import { createScentRibbon } from '../src/components/village/scent-ribbon.mjs';
import { createSampleCoffret } from '../src/components/village/fragrance-world.mjs';
import { createRoadsideTrees } from '../src/components/village/roadside-trees.mjs';
import { fragranceState } from '../src/components/village/fragrance-state.mjs';

test('frame clock advances normally and gently under reduced motion instead of freezing', () => {
  const normal = createMotionClock(), reduced = createMotionClock({ reduced: true });
  let a, b;
  for (let frame = 0; frame <= 120; frame++) {
    a = normal.tick(frame * 1000 / 60) || a;
    b = reduced.tick(frame * 1000 / 60) || b;
  }
  assert(a.time > 1.9 && a.time <= 2.01);
  assert(b.time > .95 && b.time < 1.01);
  normal.tick(10000, true);
  const resumed = normal.tick(10100);
  assert(resumed.time - a.time <= .101, 'hidden tabs must not jump the animation forward');
  normal.setReduced(true);
  assert(normal.tick(10200).time > resumed.time);
});

for (const reduced of [false, true]) test(`travel light unlocks the chest and reveals fragrant samples with reduced motion ${reduced}`, () => {
  const clock = createMotionClock({ reduced });
  const ribbon = createScentRibbon(), chest = createSampleCoffret(), tubes = createTestTubes();
  const state = fragranceState({ answers: {}, completed: [] });
  ribbon.setState(state); chest.setState(state, true); tubes.setState(state, true);
  const start = tubes.root.userData.tubes[0].meniscus.position.y;
  let moving = false, arrived = false, open = false, vapor = false, unlocked = false;
  const duration = reduced ? 32 : 16;
  for (let frame = 0; frame <= duration * 60; frame++) {
    const tick = clock.tick(frame * 1000 / 60); if (!tick) continue;
    ribbon.update(tick.time); chest.setArrival(ribbon.arrived); chest.update(tick.time); tubes.update(tick.time);
    moving ||= Math.abs(tubes.root.userData.tubes[0].meniscus.position.y - start) > .12;
    arrived ||= ribbon.arrived;
    open ||= chest.root.userData.lid.rotation.x < -1;
    vapor ||= chest.root.userData.vapor.some(({ particle }) => particle.material.opacity > .2);
    unlocked ||= chest.root.userData.lock.position.x > .2;
  }
  assert(moving && arrived && open && vapor && unlocked);
  assert(Math.abs(chest.root.userData.lid.rotation.x) < .1, 'the chest closes after the arrival sequence');
  assert.equal(state.ready, false, 'the animation must not validate the brief');
});

test('wind visibly bends larger pine trees without shifting their planted bases', () => {
  const rig = createRoadsideTrees();
  const bases = rig.trees.map(tree => tree.position.toArray());
  const rotations = rig.trees.map(tree => tree.rotation.z);
  rig.update(1.5);
  assert(rig.trees.some((tree, i) => Math.abs(tree.rotation.z - rotations[i]) * 80 > 3));
  assert.deepEqual(rig.trees.map(tree => tree.position.toArray()), bases);
  assert(rig.trees.some(tree => tree.userData.branches.some(branch => Math.abs(branch.rotation.z) > .015)), 'crowns must move independently');
});

test('visible low-frame-rate animation follows elapsed time instead of running five times slower', () => {
  const clock = createMotionClock();
  clock.tick(0);
  assert.equal(clock.tick(500).time, .5);
  assert.equal(clock.tick(1000).time, 1);
  clock.resetFrame();
  assert.equal(clock.tick(20000).time, 1, 'returning from another tab must not jump the scene forward');
  assert(Math.abs(clock.tick(20100).time - 1.1) < .0001);
});
