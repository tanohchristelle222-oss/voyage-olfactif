import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';

function environment() {
  const data = new Map();
  const sessionData = new Map();
  let blocked = false;
  const storage = {
    getItem(key) { if (blocked) throw Error('blocked'); return sessionData.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('blocked'); sessionData.set(key, value); },
  };
  function load() {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/session.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, sessionStorage: storage, localStorage: {getItem:key=>data.get(key)??null}, window: { addEventListener() {}, removeEventListener() {} }, require: () => ({ useSyncExternalStore: (_subscribe, snapshot) => snapshot() }) });
    return exports;
  }
  return { load, data, sessionData, block: () => { blocked = true; } };
}

test('demo session survives reload and logout preserves projects and profile', () => {
  const env = environment();
  env.data.set('voyage-olfactif:profil', 'existing profile');
  env.data.set('voyage-olfactif:projets', 'existing projects');
  const session = env.load();
  assert.equal(session.useDemoSession(), false);
  session.enterDemo();
  assert.equal(env.load().useDemoSession(), true);
  session.leaveDemo();
  assert.equal(env.load().useDemoSession(), false);
  assert.equal(env.data.get('voyage-olfactif:profil'), 'existing profile');
  assert.equal(env.data.get('voyage-olfactif:projets'), 'existing projects');
});

test('demo can be entered and exited when browser storage is blocked', () => {
  const env = environment();
  env.block();
  const session = env.load();
  assert.equal(session.useDemoSession(), false);
  session.enterDemo();
  assert.equal(session.useDemoSession(), true);
  session.leaveDemo();
  assert.equal(session.useDemoSession(), false);
});

test('a new visit ignores a former persistent connection and opens sign-in', () => {
  const env=environment();
  env.data.set('voyage-olfactif:demo-session','active');
  assert.equal(env.load().useDemoSession(),false);
  env.load().enterDemo();
  assert.equal(env.load().useDemoSession(),true);
  env.sessionData.clear();
  assert.equal(env.load().useDemoSession(),false);
});
