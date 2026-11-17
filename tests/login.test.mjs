import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

function screen(language = 'fr') {
  const state = { language, registering: false, saved: null, entered: 0 };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/components/LoginScreen.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, FormData: class { constructor(data) { this.data = data; } get(key) { return this.data[key] ?? null; } }, require(id) {
    if (id === 'react/jsx-runtime') return jsx;
    if (id === 'react') return { useSyncExternalStore:()=>state.language, useState(initial) {
      const field = typeof initial === 'boolean' ? 'registering' : 'language';
      return [state[field], value => { state[field] = value; }];
    } };
    if (id === '@/lib/profile') return { useProfile: () => ({ firstName: 'Ancien', lastName: 'Profil', companyName: 'Entreprise', email: 'old@example.test', country: 'France' }), saveProfile: value => { state.saved = value; } };
    if (id === '@/lib/session') return { enterDemo: () => { state.entered++; } };
    throw Error(id);
  } });
  function nodes() {
    const result = [];
    function walk(value) { if (Array.isArray(value)) return value.forEach(walk); if (value?.props) { result.push(value); walk(value.props.children); } }
    walk(exports.default());
    return result;
  }
  return { state, nodes };
}

test('registration opens an empty required form, saves the submitted profile and opens the space', () => {
  const page = screen();
  page.nodes().find(node => node.type === 'button' && node.props.children === 'Créer un compte').props.onClick();
  const nodes = page.nodes();
  assert.equal(nodes.find(node => node.props.id === 'login-welcome').props.children, 'Créez votre espace.');
  for (const name of ['email', 'firstName', 'lastName', 'companyName', 'country']) {
    const input = nodes.find(node => node.type === 'input' && node.props.name === name);
    assert(input.props.required, name + ' must be required');
    assert.equal(input.props.defaultValue, '', name + ' must not reuse the previous profile');
  }
  nodes.find(node => node.type === 'form').props.onSubmit({ preventDefault() {}, currentTarget: {
    email: ' NEW@EXAMPLE.TEST ', firstName: ' Camille ', lastName: ' Durand ', companyName: ' Atelier Rose ', country: ' France ', phone: ' 0102030405 ',
  } });
  assert.equal(page.state.saved.email, 'new@example.test');
  assert.equal(page.state.saved.firstName, 'Camille');
  assert.equal(page.state.saved.companyName, 'Atelier Rose');
  assert.equal(page.state.saved.phone, '0102030405');
  assert.equal(page.state.entered, 1);
  assert(!('password' in page.state.saved));
});

test('registration has an English version and a working return to sign-in', () => {
  const page = screen('en');
  page.nodes().find(node => node.type === 'button' && node.props.children === 'Create an account').props.onClick();
  assert.equal(page.nodes().find(node => node.props.id === 'login-welcome').props.children, 'Create your space.');
  page.nodes().find(node => node.type === 'button' && node.props.children === 'Sign in').props.onClick();
  assert.equal(page.nodes().find(node => node.props.id === 'login-welcome').props.children, 'Welcome to Horizon.');
  assert.equal(page.state.entered, 0);
  assert.equal(page.state.saved, null);
});
