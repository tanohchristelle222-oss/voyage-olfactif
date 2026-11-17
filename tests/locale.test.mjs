import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

function environment() {
  const data = new Map(); let blocked = false;
  function load() {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/locale.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, localStorage: { getItem: key => data.get(key) ?? null, setItem(key, value) { if (blocked) throw Error('quota'); data.set(key,value); } }, window: { addEventListener() {}, removeEventListener() {} }, require: () => ({ useSyncExternalStore: (_subscribe,get) => get() }) });
    return exports;
  }
  return { data, load, block: () => { blocked = true; } };
}

test('home language inherits login choice, persists reloads and survives blocked storage', () => {
  const env = environment(); env.data.set('voyage-olfactif:login-language','en');
  const store = env.load(); assert.equal(store.useLocale(),'en');
  assert.equal(store.setLocale('fr'),true); assert.equal(env.load().useLocale(),'fr');
  env.block(); assert.equal(store.setLocale('en'),false); assert.equal(store.useLocale(),'en');
});

test('home content and FR/EN controls update without changing the number of project steps', () => {
  let language = 'fr', created = 0, destination = null;
  const modules = {};
  function load(name) {
    if (modules[name]) return modules[name];
    const exports = {};
    const source = fs.readFileSync(new URL('../src/'+name, import.meta.url),'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(code,{ exports, require(id) {
      if (id === 'react/jsx-runtime') return jsx;
      if (id === 'react') return { useEffect() {}, useState: value => [value, () => {}] };
      if (id === 'next/link') return { default: 'a' };
      if (id === 'next/navigation') return { useRouter: () => ({ push: value => { destination=value; } }) };
      if (id === 'motion/react') return { useReducedMotion: () => true, motion: new Proxy({}, { get: (_object,key) => key }) };
      if (id === '@/components/JourneyMap') return { default: 'figure' };
      if (id === '@/lib/locale') return { useLocale: () => language, setLocale: value => { language=value; } };
      if (id === '@/lib/home-copy') return load('lib/home-copy.ts');
      if (id === '@/lib/journey') return { TOTAL_STEPS: 5, createProject: () => { created++; } };
      throw Error(id);
    } });
    modules[name] = exports; return exports;
  }
  function nodes(element) { const result=[]; function walk(value) { if(Array.isArray(value)) return value.forEach(walk); if(value?.props){ if(typeof value.type === 'function') return walk(value.type(value.props)); result.push(value);walk(value.props.children);} }walk(element);return result; }
  function texts(element) { return nodes(element).flatMap(node => Array.isArray(node.props.children) ? node.props.children.filter(child=>typeof child==='string') : typeof node.props.children==='string' ? [node.props.children] : []).join(' '); }
  const home = load('components/HomePage.tsx'), picker = load('components/LanguageSwitcher.tsx');
  assert.match(texts(home.default()),/5 étapes/);
  nodes(picker.default()).find(node=>node.props['aria-label']==='English').props.onClick();
  assert.match(texts(home.default()),/Bring your fragrance idea to life/);
  assert.match(texts(home.default()),/5 steps/);
  assert.equal(nodes(picker.default()).find(node=>node.props['aria-label']==='English').props['aria-pressed'],true);
  nodes(home.default()).find(node=>node.type==='button'&&node.props.onClick).props.onClick();
  assert.equal(created,1); assert.equal(destination,'/voyage');
  nodes(picker.default()).find(node=>node.props['aria-label']==='Français').props.onClick();
  assert.match(texts(home.default()),/Donnez vie/);
});
