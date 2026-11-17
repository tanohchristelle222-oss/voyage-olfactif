import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';

function environment() {
  const data = new Map();
  let blocked = false;
  function load() {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/tracking.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, localStorage: {
      getItem: key => data.get(key) ?? null,
      setItem: (key, value) => { if (blocked) throw Error('quota'); data.set(key, value); },
    }, window: { addEventListener() {}, removeEventListener() {} }, require: () => ({ useSyncExternalStore: (_subscribe, snapshot) => snapshot() }) });
    return exports;
  }
  return { load, data, block: () => { blocked = true; } };
}

test('tracking deadlines persist across reloads and reviews only apply to received samples', () => {
  const env = environment(), tracking = env.load();
  env.data.set('voyage-olfactif:projets', 'unchanged projects');
  const store = tracking.useTracking();
  assert.equal(store.samples.length, 3);
  assert.equal(store.orders.length, 3);
  assert.strictEqual(tracking.useTracking(), store);
  assert.equal(env.load().useTracking().samples[0].estimatedAt, store.samples[0].estimatedAt);
  assert.equal(tracking.saveSampleReview(store.samples[0].id, 'À ajuster', 'Early').accepted, false);
  assert.equal(tracking.saveSampleReview('missing', 'À ajuster', '').accepted, false);
  assert.equal(tracking.saveSampleReview(store.samples[2].id, 'Invalid', '').accepted, false);
  assert.equal(tracking.saveSampleReview(store.samples[2].id, 'À ajuster', ' Moins sucré ').persisted, true);
  const reloaded = env.load().useTracking();
  assert.equal(reloaded.samples[2].review.comment, 'Moins sucré');
  assert.equal(reloaded.samples[2].review.verdict, 'À ajuster');
  assert.equal(reloaded.orders[0].estimatedAt, store.orders[0].estimatedAt);
  assert.equal(env.data.get('voyage-olfactif:projets'), 'unchanged projects');
});

test('countdown reaches zero without changing delivery status; blocked storage retains reviews for the session', () => {
  const env = environment(), tracking = env.load();
  const pending = tracking.seedTracking(1000).samples[0];
  assert.match(tracking.remainingTime(1000 + 90061000, 1000), /1 j · 01 h · 01 min · 01 s/);
  assert.match(tracking.remainingTime(pending.estimatedAt, pending.estimatedAt + 1000), /statut à confirmer/);
  assert.equal(tracking.isDelivered(pending, 'samples'), false);
  const received = tracking.useTracking().samples[2];
  env.block();
  const saved = tracking.saveSampleReview(received.id, 'Correspond à mon besoin', 'Très bien');
  assert.equal(saved.accepted, true);
  assert.equal(saved.persisted, false);
  assert.equal(tracking.useTracking().samples[2].review.comment, 'Très bien');
});
