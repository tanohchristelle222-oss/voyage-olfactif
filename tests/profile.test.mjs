import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';

function environment() {
  const data=new Map();
  let blocked=false;
  const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(blocked)throw Error('quota');data.set(k,v)}};
  function load(file){
    const exports={};
    const code=ts.transpileModule(fs.readFileSync(new URL('../src/lib/'+file+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInNewContext(code,{exports,localStorage,window:{addEventListener(){},removeEventListener(){}},require:id=>{if(id==='react')return {useSyncExternalStore:(_subscribe,get)=>get()};throw Error(id)}});
    return exports;
  }
  return {data,load,block:()=>blocked=true};
}

test('profile persists contact and photo without creating or replacing projects',()=>{
  const env=environment(),profile=env.load('profile'),journey=env.load('journey');
  assert.equal(journey.useProjects().projects.length,0);
  assert(profile.saveProfile({firstName:'Léa',lastName:'Martin',companyName:'Maison Lune',sector:'Cosmétique & soin',email:'lea@example.test',avatarUrl:'data:image/png;base64,example'}));
  assert.equal(journey.useProjects().projects.length,0);
  const reload=env.load('profile');
  assert.equal(reload.useProfile().lastName,'Martin');
  assert.equal(reload.useProfile().avatarUrl,'data:image/png;base64,example');
  assert.strictEqual(reload.useProfile(),reload.useProfile());
  journey.createProject();
  assert.equal(reload.useProfile().houseName,'Maison Lune');
  assert.equal(Object.keys(journey.useJourney().journey.answers).length,0);
  assert.equal(journey.useProjects().projects.length,1);
});

test('company names remain compatible with both profile formats without overwriting a project',()=>{
  const env=environment();
  env.data.set('voyage-olfactif:profil',JSON.stringify({firstName:'Léa',houseName:'Ancienne maison'}));
  const profile=env.load('profile'),journey=env.load('journey');
  assert.equal(profile.useProfile().companyName,'Ancienne maison');
  journey.createProject();
  journey.saveField(1,'name','Aube');
  profile.saveProfile({companyName:'Maison Lune',lastName:'Martin'});
  assert.equal(profile.useProfile().houseName,'Maison Lune');
  assert.equal(journey.useJourney().journey.answers[1].fields.name,'Aube');
  profile.saveProfile({houseName:'Maison Rose'});
  assert.equal(profile.useProfile().companyName,'Maison Rose');
});

test('old projects retain their idea, target, house and progress after migration to five steps',()=>{
  const env=environment();
  const oldAnswers={
    1:{text:'Notre histoire',tags:[],fields:{name:'Maison Héritage',sector:'Maison & bougies'}},
    2:{text:'Une bougie boisée',tags:['Boisé'],fields:{name:'Aube'}},
    3:{text:'Sportifs français',tags:['Mixte']},
    4:{text:'Famille boisée',tags:[]},
    5:{text:'Sans colorant',tags:[]},
    6:{text:'Brief existant',tags:[]},
    7:{text:'Échantillon existant',tags:[]},
  };
  env.data.set('voyage-olfactif:projets',JSON.stringify({activeId:'ancien',projects:[{id:'ancien',createdAt:123,journey:{answers:oldAnswers,completed:[1,2,3,4,5]}}]}));
  const profile=env.load('profile'),journey=env.load('journey');
  assert.equal(profile.useProfile().companyName,'Maison Héritage');
  assert.equal(journey.TOTAL_STEPS,5);
  const migrated=journey.useJourney().journey;
  assert.equal(migrated.answers[1].fields.name,'Aube');
  assert.equal(migrated.answers[1].fields.target,'Sportifs français');
  assert(migrated.answers[1].tags.includes('Mixte'));
  assert.equal(migrated.answers[2].text,'Sans colorant');
  assert.equal(migrated.answers[3].text,'Famille boisée');
  assert.equal(migrated.legacyAnswers[1].text,'Notre histoire');
  assert.equal(journey.currentStepOf(migrated),4);
  journey.saveField(1,'name','Aube modifiée');
  const reloaded=env.load('journey');
  assert.equal(reloaded.useJourney().journey.answers[1].fields.name,'Aube modifiée');
  assert.equal(reloaded.useJourney().journey.legacyAnswers[1].fields.name,'Maison Héritage');
  assert.equal(env.load('profile').useProfile().companyName,'Maison Héritage');
  assert.equal(JSON.parse(env.data.get('voyage-olfactif:projets')).v,2);
});

test('older profiles migrate and blocked storage preserves the session copy',()=>{
  const env=environment();
  env.data.set('voyage-olfactif:profil',JSON.stringify({firstName:'Ancien',email:'old@example.test'}));
  const p=env.load('profile');
  assert.equal(p.useProfile().lastName,'');
  env.block();
  assert.equal(p.saveProfile({firstName:'Nouveau'}),false);
  assert.equal(p.useProfile().firstName,'Nouveau');
  assert.equal(JSON.parse(env.data.get('voyage-olfactif:profil')).firstName,'Ancien');
});
