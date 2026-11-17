import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
globalThis.document = { createElement: () => ({ getContext: () => null }) };
const {createVillage, updateVillage, sampleRoute} = await import('../src/components/village/scene.mjs');

test('decorative village retains its six buildings and animated sample van', () => {
  const village = createVillage({ completed: [true, true, false, false, false, false, false], unlocked: 2 });
  assert.equal(village.stages.length, 7);
  assert.deepEqual(village.stages.map(s => s.userData.room), [0,1,2,3,4,5,6]);
  assert.equal(village.stages[6], village.van);
  assert(village.buildings[2].userData.unlocked);
  assert(!village.buildings[3].userData.unlocked);
  let count=0;
  village.root.traverse(o => {
    if (!o.isMesh) return;
    count++;
    o.geometry.computeBoundingBox();
    assert([...o.geometry.boundingBox.min.toArray(), ...o.geometry.boundingBox.max.toArray()].every(Number.isFinite));
  });
  assert(count < 1000);
});

test('animated walking routes avoid all six buildings and repeat without jumps', () => {
  const village=createVillage();
  const bounds=village.buildings.map(b=>new Box3().setFromObject(b));
  const start=village.walkers.map(w=>w.person.position.clone());
  const vanStart=village.van.position.clone();
  updateVillage(village,2);
  village.walkers.forEach((w,i)=>assert(w.person.position.distanceTo(start[i])>.2));
  assert(village.van.position.distanceTo(vanStart)>.5);
  for(let t=0;t<150;t+=.5){
    updateVillage(village,t);
    for(const {person} of village.walkers) for(const b of bounds){
      const p=person.position;
      assert(!(p.x>b.min.x-.1&&p.x<b.max.x+.1&&p.z>b.min.z-.1&&p.z<b.max.z+.1));
    }
  }
  const route=village.walkers[0].route;
  assert.deepEqual(sampleRoute(route,0),sampleRoute(route,route.total));
  const before=village.walkers[0].person.position.clone();
  updateVillage(village,149.5);
  assert(before.equals(village.walkers[0].person.position));
});
