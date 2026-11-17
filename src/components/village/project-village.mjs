import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makePerson, makeVan } from './scene.mjs';
import { vaporTexture } from './test-tubes.mjs';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createMotionClock } from './motion-clock.mjs';
import { fitDecor } from './decor-camera.mjs';
const surface = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .75, ...extra });
function add(root, geometry, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
}
function box(root, width, height, depth, color, x, y, z) {
    return add(root, new RoundedBoxGeometry(width, height, depth, 2, .025), surface(color), x, y, z);
}
function rod(root, a, b, radius = .025, color = 0xb89e79) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), direction = end.clone().sub(start);
    const object = add(root, new THREE.CylinderGeometry(radius, radius, direction.length(), 7), surface(color));
    object.position.copy(start.add(end).multiplyScalar(.5));
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return object;
}
function bead(root, radius, color, x, y, z) {
    return add(root, new THREE.SphereGeometry(radius, 12, 8), surface(color), x, y, z);
}
function plantLeaf(root, x, y, z, size = .25) {
    const leaf = bead(root, 1, 0x3e7d40, x, y, z);
    leaf.scale.set(size, .035, size * .4);
    leaf.rotation.z = .35;
    return leaf;
}
function vial(root, x, y, z, color, scale = .3) {
    const object = new THREE.Group();
    object.position.set(x, y, z);
    object.scale.setScalar(scale);
    root.add(object);
    const glass = add(object, new THREE.CylinderGeometry(.25, .25, .8, 16), new THREE.MeshPhysicalMaterial({ color: 0xe8f6f2, transparent: true, opacity: .22, roughness: .08, clearcoat: 1, depthWrite: false }), 0, .4, 0);
    glass.castShadow = false;
    const liquid = add(object, new THREE.CylinderGeometry(.22, .22, .45, 16), new THREE.MeshPhysicalMaterial({ color, roughness: .2, transparent: true, opacity: .94, clearcoat: 1 }), 0, .25, 0);
    add(object, new THREE.CylinderGeometry(.26, .26, .16, 16), surface(0x94205f, { roughness: .4 }), 0, .86, 0);
    return { object, liquid };
}
function table(root, x, z, width = 1.8, depth = .65) {
    const object = new THREE.Group();
    object.position.set(x, .14, z);
    root.add(object);
    box(object, width, .1, depth, 0xc9a77a, 0, .73, 0);
    for (const side of [-1, 1])
        box(object, .07, .72, depth * .8, 0xeee3d2, side * (width / 2 - .1), .36, 0);
    return object;
}
function pavilion(root, x, z, width, depth, kind) {
    const object = new THREE.Group();
    object.position.set(x, .14, z);
    object.userData.kind = kind;
    root.add(object);
    box(object, width + .15, .13, depth + .15, 0xe2cfac, 0, .07, 0);
    const height = kind === 'laboratory' ? 2.15 : 1.9;
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xc2dedb, transparent: true, opacity: .13, roughness: .1, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 });
    for (const px of [-width / 2, width / 2]) {
        for (const pz of [-depth / 2, depth / 2])
            rod(object, [px, .12, pz], [px, height, pz], .045);
        const pane = add(object, new THREE.PlaneGeometry(depth, height - .2), glass, px, height / 2, 0);
        pane.rotation.y = Math.PI / 2;
        pane.castShadow = false;
    }
    box(object, width, .65, .12, 0xdacbb7, 0, .45, -depth / 2);
    const back = add(object, new THREE.PlaneGeometry(width, height - .75), glass, 0, (height + .75) / 2, -depth / 2);
    back.castShadow = false;
    for (const pz of [-depth / 2, depth / 2]) {
        rod(object, [-width / 2, height, pz], [width / 2, height, pz], .045);
        rod(object, [-width / 2, height, pz], [0, height + .65, pz], .035);
        rod(object, [0, height + .65, pz], [width / 2, height, pz], .035);
    }
    rod(object, [0, height + .65, -depth / 2], [0, height + .65, depth / 2], .04);
    for (const side of [-1, 1]) {
        const pitch = Math.atan2(.65, width / 2), roofWidth = Math.hypot(width / 2, .65);
        const roof = add(object, new THREE.PlaneGeometry(roofWidth, depth), glass, side * width / 4, height + .325, 0);
        roof.rotation.set(-Math.PI / 2, -side * pitch, 0);
        roof.castShadow = false;
    }
    return object;
}
function booth(root, x, z, width, depth, kind) {
    const object = new THREE.Group();
    object.position.set(x, .14, z);
    object.userData.kind = kind;
    root.add(object);
    box(object, width + .15, .13, depth + .15, 0xd9c29d, 0, .07, 0);
    box(object, width, 1.8, .12, 0xe6d9c4, 0, .95, -depth / 2);
    for (const px of [-width / 2, width / 2])
        box(object, .1, 1.8, depth, 0xe6d9c4, px, .95, 0);
    box(object, width + .2, .1, depth + .2, 0x8d245a, 0, 1.9, 0);
    box(object, width + .2, .23, .14, 0xa72c69, 0, 1.72, depth / 2 + .15);
    return object;
}
function orchid(root, x, y, z) {
    for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5, petal = bead(root, 1, 0xfff2d5, x + Math.sin(angle) * .09, y, z + Math.cos(angle) * .09);
        petal.scale.set(.065, .025, .13);
        petal.rotation.y = angle;
    }
    bead(root, .04, 0xe0ae36, x, y + .03, z);
}
function vanillaPlants(root, x, z) {
    const group = new THREE.Group();
    group.position.set(x, .3, z);
    root.add(group);
    for (const side of [-1, 1])
        rod(group, [side * .75, 0, 0], [side * .75, 1.7, 0]);
    rod(group, [-.75, 1.7, 0], [.75, 1.7, 0]);
    for (let i = 0; i < 5; i++) {
        const px = -.65 + i * .3;
        rod(group, [px, .1, 0], [px, 1.7, 0], .022, 0x427244);
        plantLeaf(group, px + .12, .7 + (i % 2) * .3, .05, .22);
        orchid(group, px, 1.3 + i % 2 * .3, .13);
        const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(px, 1.2, .2), new THREE.Vector3(px + .04, .9, .24), new THREE.Vector3(px, .55, .2)]);
        add(group, new THREE.TubeGeometry(curve, 12, .035, 6, false), surface(0x493023));
    }
    return group;
}
function pistachioTree(root) {
    const group = new THREE.Group();
    group.position.set(5.1, .14, .7);
    root.add(group);
    rod(group, [0, 0, 0], [0, 1.65, 0], .07, 0x87633f);
    for (let i = 0; i < 7; i++) {
        const angle = i * 2.4, px = Math.sin(angle) * .35, pz = Math.cos(angle) * .35, y = 1.4 + i % 3 * .17;
        rod(group, [0, .9, 0], [px, y, pz], .02, 0x87633f);
        plantLeaf(group, px, y, pz, .36);
        const shell = bead(group, .095, 0xc5a67d, px, y - .15, pz);
        shell.scale.set(.7, 1.2, .8);
        const seed = bead(group, .065, 0x8eb344, px, y - .15, pz + .06);
        seed.scale.y = 1.3;
    }
    return group;
}
export function createProjectVillage() {
    const root = new THREE.Group();
    root.name = 'village-des-fragrances-projet';
    box(root, 13.8, .18, 9.8, 0xd7c7ab, 0, .04, 0);
    box(root, 13.5, .025, 9.5, 0xd8d1bc, 0, .15, 0);
    box(root, 3.7, .015, 6.7, 0xede1ce, 0, .17, .45);
    box(root, 10.9, .018, 1.2, 0xede1ce, 0, .18, 1.25);
    const buildings = [
        pavilion(root, -3.7, -1.55, 3.1, 2.8, 'vanilla-greenhouse'),
        pavilion(root, .35, -1.9, 4, 3, 'laboratory'),
        booth(root, 4, -.9, 2.65, 2.25, 'pistachio-workshop'),
        booth(root, -3.65, 2.15, 2.6, 1.5, 'company-reception'),
        booth(root, 3.65, 2.15, 2.7, 1.5, 'sample-dispatch'),
    ];
    const vanilla = vanillaPlants(root, -3.8, -1.6), pistachio = pistachioTree(root);
    const labBench = table(root, .35, -.6, 3.5, .7);
    const liquidVials = [];
    for (let i = 0; i < 7; i++)
        liquidVials.push(vial(labBench, (i - 3) * .4, .79, 0, [0xd48b1e, 0xc12d79, 0x84a73b][i % 3], .3));
    const plantBench = table(root, -3.7, .2, 2.5, .65);
    for (let i = 0; i < 6; i++) {
        const pod = box(plantBench, .035, .025, .5, 0x493023, -.55 + i * .14, .8, 0);
        pod.rotation.y = -.15;
    }
    const nuts = table(root, 3.9, .45, 2.1, .7);
    box(nuts, 1.45, .06, .48, 0xb78755, 0, .8, 0);
    for (let i = 0; i < 12; i++) {
        const shell = bead(nuts, .095, 0xd2ba93, (i % 6 - 2.5) * .21, .9, Math.floor(i / 6) * .18 - .1);
        shell.scale.set(.7, .5, 1);
        const kernel = bead(nuts, .055, 0x85a73b, (i % 6 - 2.5) * .21, .93, Math.floor(i / 6) * .18 - .07);
        kernel.scale.z = 1.3;
    }
    const packing = table(root, 3.65, 2.55, 2.2, .8);
    box(packing, 1.3, .12, .6, 0x94205f, 0, .84, 0);
    for (let i = 0; i < 5; i++)
        liquidVials.push(vial(packing, (i - 2) * .22, .91, 0, 0xe3ae49, .23));
    const packageBox = box(packing, .4, .32, .38, 0xb68b56, .8, .94, -.05);
    table(root, -3.65, 2.65, 2.15, .6);
    const booklet = box(root, .45, .025, .32, 0x94205f, -3.8, .95, 2.65);
    booklet.rotation.y = .2;
    // Les gestes de travail sont distincts de la marche du visiteur.
    const tasks = [
        { x: -.6, z: -1.1, role: 'pipetting', coat: 0xf8f1e3 },
        { x: .65, z: -1.1, role: 'smelling', coat: 0xf8f1e3 },
        { x: 4, z: -.05, role: 'sorting-pistachios', coat: 0x94205f },
        { x: 3.65, z: 2, role: 'packing-samples', coat: 0xf5e9da },
        { x: -3.7, z: 2.1, role: 'welcoming', coat: 0x94205f },
        { x: -4.85, z: -.1, role: 'checking-vanilla', coat: 0xb18d74 },
    ].map((task, index) => {
        const person = makePerson(task.coat, [0xd4ac8a, 0x9f6d50, 0xe5c3a4][index % 3]);
        person.position.set(task.x, .2, task.z);
        root.add(person);
        person.userData.role = task.role;
        if (task.role === 'smelling')
            box(person.userData.arms[1], .025, .27, .015, 0xfff7eb, 0, -.33, .04);
        if (task.role === 'pipetting') {
            const tool = new THREE.Group();
            person.userData.arms[1].add(tool);
            tool.position.set(0, -.32, .3);
            rod(tool, [0, -.18, 0], [0, .08, 0], .012, 0xd4e6df);
            bead(tool, .025, 0x94205f, 0, .09, 0);
            person.userData.tool = tool;
        }
        return person;
    });
    const visitor = makePerson(0x314b57, 0xd8b28f);
    visitor.userData.role = 'visiting-client';
    root.add(visitor);
    box(visitor.userData.body, .18, .23, .045, 0x94205f, -.2, .6, .08);
    const van = makeVan();
    van.scale.setScalar(.65);
    root.add(van);
    const vanRoute = new THREE.CurvePath();
    const point = (x, z) => new THREE.Vector3(x, 0, z);
    let current = point(-5.6, 4.05);
    const straight = (x, z) => { const next = point(x, z); vanRoute.add(new THREE.LineCurve3(current, next)); current = next; };
    const turn = (cx, cz, x, z) => { const next = point(x, z); vanRoute.add(new THREE.QuadraticBezierCurve3(current, point(cx, cz), next)); current = next; };
    straight(5.6, 4.05);
    turn(6.1, 4.05, 6.1, 3.55);
    straight(6.1, -3.55);
    turn(6.1, -4.05, 5.6, -4.05);
    straight(-5.6, -4.05);
    turn(-6.1, -4.05, -6.1, -3.55);
    straight(-6.1, 3.55);
    turn(-6.1, 4.05, -5.6, 4.05);
    const smokeMap = vaporTexture();
    const vapors = [-.7, .5, 3.65].flatMap((x, emitter) => Array.from({ length: 10 }, (_, index) => {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeMap, color: 0xac7e98, transparent: true, opacity: 0, depthWrite: false }));
        root.add(sprite);
        return { sprite, x, z: emitter === 2 ? 2.55 : -.6, base: emitter === 2 ? 1.3 : 1.35, phase: index / 10, emitter };
    }));
    root.userData.framingBox = new THREE.Box3(new THREE.Vector3(-7, -.1, -5), new THREE.Vector3(7, 3.5, 5));
    root.userData.projectVillage = { buildings, tasks, visitor, van, vapors, liquidVials, vanilla, pistachio };
    function setState(state) { liquidVials.forEach((v, i) => v.liquid.material.color.setHex(state.colors[i % 3])); }
    function update(time) {
        tasks.forEach((person, index) => {
            const rig = person.userData, phase = time * 1.8 + index * 1.4;
            rig.arms[0].rotation.x = -.85 + Math.sin(phase) * .23;
            rig.arms[1].rotation.x = (index === 1 ? -1.8 : -1.05) + Math.sin(phase + .6) * .22;
            rig.body.rotation.y = Math.sin(time * .75 + index) * .07;
            if (rig.tool)
                rig.tool.rotation.x = -rig.arms[1].rotation.x;
        });
        const a = time * .42, x = Math.sin(a) * 1.55, z = 2.2 + Math.cos(a) * 1.05;
        visitor.position.set(x, .2, z);
        visitor.rotation.y = Math.atan2(Math.cos(a) * 1.55, -Math.sin(a) * 1.05);
        visitor.userData.legs.forEach((leg, index) => leg.rotation.x = Math.sin(time * 5 + index * Math.PI) * .36);
        visitor.userData.arms.forEach((arm, index) => arm.rotation.x = -Math.sin(time * 5 + index * Math.PI) * .22);
        visitor.userData.knees.forEach((knee, index) => knee.rotation.x = .06 + Math.max(0, Math.sin(time * 5 + index * Math.PI)) * .3);
        const progress = (time * .018 + .04) % 1, location = vanRoute.getPointAt(progress), forward = vanRoute.getPointAt((progress + .002) % 1);
        van.position.set(location.x, .18, location.z);
        van.rotation.y = Math.atan2(forward.x - location.x, forward.z - location.z);
        van.userData.wheels.forEach(wheel => wheel.rotation.x = time * 2.7);
        vapors.forEach(({ sprite, x, z, base, phase, emitter }) => { const age = (time * .32 + phase + emitter * .12) % 1; sprite.position.set(x + Math.sin(age * 5) * age * .2, base + age * 1.1, z + Math.cos(age * 6) * age * .12); const size = .12 + age * .48; sprite.scale.set(size, size * 1.3, 1); sprite.material.opacity = Math.sin(age * Math.PI) * .45; });
        vanilla.rotation.z = Math.sin(time * .8) * .018;
        pistachio.rotation.z = Math.sin(time * .9 + .5) * .03;
        packageBox.position.y = .94 + Math.max(0, Math.sin(time * 1.4)) * .07;
        liquidVials.slice(0, 7).forEach((v, index) => { const level = .35 + Math.sin(time * .9 + index) * .13; v.liquid.scale.y = level / .45; v.liquid.position.y = .025 + level / 2; });
    }
    update(0);
    return { root, update, setState };
}
export function mountProjectVillageView(container, { state, onReady, onFallback }) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    }
    catch {
        onFallback();
        return () => { };
    }
    renderer.setPixelRatio(Math.max(2, Math.min(window.devicePixelRatio || 1, 2.5)));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    container.append(renderer.domElement);
    const rig = createProjectVillage();
    rig.setState(state);
    const scene = new THREE.Scene();
    scene.add(rig.root);
    scene.add(new THREE.HemisphereLight(0xf5f4ec, 0x626849, 1.4));
    const sun = new THREE.DirectionalLight(0xffecd7, 2.3);
    sun.position.set(-6, 14, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, far: 45 });
    sun.shadow.bias = -.001;
    scene.add(sun);
    const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer), environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .32;
    room.dispose();
    pmrem.dispose();
    let camera, alive = true, frame = 0, ready = false;
    function resize() { const width = container.clientWidth || 900, height = container.clientHeight || 540; renderer.setSize(width, height, false); camera = fitDecor(rig.root, width / height); }
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)'), clock = createMotionClock({ fps: 24, reduced: preference.matches });
    const reduced = event => clock.setReduced(event.matches);
    preference.addEventListener('change', reduced);
    const visible = () => clock.resetFrame();
    document.addEventListener('visibilitychange', visible);
    function render(ms) { if (!alive)
        return; frame = requestAnimationFrame(render); const tick = clock.tick(ms, document.hidden); if (!tick)
        return; rig.update(tick.time); renderer.render(scene, camera); if (!ready) {
        ready = true;
        onReady();
    } }
    function lost(event) { event.preventDefault(); alive = false; cancelAnimationFrame(frame); onFallback(); }
    renderer.domElement.addEventListener('webglcontextlost', lost);
    frame = requestAnimationFrame(render);
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); preference.removeEventListener('change', reduced); document.removeEventListener('visibilitychange', visible); renderer.domElement.removeEventListener('webglcontextlost', lost); const geometries = new Set(), materials = new Set(), textures = new Set(); scene.traverse(object => { if (object.geometry)
        geometries.add(object.geometry); if (object.material)
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m)); }); geometries.forEach(g => g.dispose()); materials.forEach(m => { Object.values(m).forEach(value => { if (value?.isTexture)
        textures.add(value); }); m.dispose(); }); textures.forEach(t => t.dispose()); environment.dispose(); sun.shadow.map?.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
}
