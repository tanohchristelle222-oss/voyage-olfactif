import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { bottle } from './models.mjs';
import { vaporTexture } from './test-tubes.mjs';
const material = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: .65, ...props });
function add(root, geometry, surface, x = 0, y = 0, z = 0) { const object = new THREE.Mesh(geometry, surface); object.position.set(x, y, z); object.castShadow = object.receiveShadow = true; root.add(object); return object; }
function box(root, w, h, d, color, x = 0, y = 0, z = 0) { return add(root, new RoundedBoxGeometry(w, h, d, 2, .035), material(color), x, y, z); }
function rod(root, a, b, r = .025, color = 0x89684c) { const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), direction = to.clone().sub(from); const object = add(root, new THREE.CylinderGeometry(r, r, direction.length(), 7), material(color)); object.position.copy(from.add(to).multiplyScalar(.5)); object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); return object; }
function leaf(root, x, y, z, scale = .3) { const object = add(root, new THREE.SphereGeometry(1, 12, 7), material(0x3b7b3e), x, y, z); object.scale.set(scale, .035, scale * .38); object.rotation.z = .4; return object; }
function rose(root, x, y, z) {
    const flower = new THREE.Group();
    flower.position.set(x, y, z);
    root.add(flower);
    for (let ring = 0; ring < 3; ring++)
        for (let i = 0; i < 7; i++) {
            const angle = i * Math.PI * 2 / 7 + ring * .5;
            const petal = add(flower, new THREE.SphereGeometry(1, 12, 8), material([0x9b205c, 0xd43f87, 0xeb70a4][ring]), Math.sin(angle) * (.07 + ring * .07), .07 - ring * .025, Math.cos(angle) * (.07 + ring * .07));
            petal.scale.set(.14, .085, .18);
            petal.rotation.set(-.5, angle, 0);
        }
    return flower;
}
export function createScentGarden() {
    const root = new THREE.Group();
    root.name = 'jardin-olfactif';
    box(root, 4.6, .22, 2.3, 0xddcfb7, 0, .11, 0);
    box(root, 4.4, .035, 2.1, 0x67513a, 0, .24, 0);
    const blooms = [];
    for (let i = 0; i < 4; i++) {
        const x = -1.65 + (i % 2) * .55, z = -.4 + Math.floor(i / 2) * .65, y = .9 + (i % 2) * .22;
        rod(root, [x, .25, z], [x, y, z], .017, 0x658650);
        leaf(root, x + .16, y * .65, z);
        blooms.push(rose(root, x, y, z));
    }
    // Un petit agrume chargé de fruits, une treille de vanille et des pistaches.
    rod(root, [.05, .23, -.3], [.05, 1.55, -.3], .065, 0x866445);
    for (let i = 0; i < 5; i++) {
        const angle = i * 2.4;
        const canopy = add(root, new THREE.SphereGeometry(.35, 12, 8), material(0x4e8633), Math.sin(angle) * .3, 1.5 + (i % 2) * .24, -.3 + Math.cos(angle) * .25);
        canopy.scale.y = .8;
        const fruit = add(root, new THREE.SphereGeometry(.12, 14, 10), material(i % 2 ? 0xe8ba44 : 0xdf9633, { roughness: .4 }), Math.sin(angle) * .4, 1.35 + (i % 2) * .27, -.3 + Math.cos(angle) * .35);
        fruit.userData.phase = i;
    }
    for (const x of [1, 1.9])
        rod(root, [x, .22, -.75], [x, 2, -.75]);
    rod(root, [1, 1.9, -.75], [1.9, 1.9, -.75]);
    for (let i = 0; i < 4; i++) {
        const x = 1.1 + i * .22;
        rod(root, [x, .5, -.72], [x, 1.8, -.72], .017, 0x57844c);
        leaf(root, x, 1 + i % 2 * .3, -.7, .24);
        const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 1.55, -.64), new THREE.Vector3(x + .07, 1.1, -.57), new THREE.Vector3(x, .8, -.58)]);
        add(root, new THREE.TubeGeometry(curve, 12, .025, 6, false), material(0x4e3628));
    }
    for (let i = 0; i < 5; i++) {
        const seed = add(root, new THREE.SphereGeometry(.13, 12, 8), material(i % 2 ? 0xc1be82 : 0xa3ac62), 1.1 + i * .16, .39, .5 + (i % 2) * .16);
        seed.scale.set(.7, .55, 1.15);
    }
    root.userData.framingBox = new THREE.Box3(new THREE.Vector3(-2.4, 0, -1.2), new THREE.Vector3(2.4, 2.5, 1.2));
    let selected = 'inspiration';
    function setState(state) { selected = state.key; }
    function update(time) { blooms.forEach((flower, i) => { const openness = (selected === 'rose' ? .85 : .72) + Math.sin(time * 1.2 + i) * .24; flower.scale.set(openness, .8 + openness * .25, openness); flower.rotation.z = Math.sin(time * .9 + i) * .07; }); root.rotation.z = Math.sin(time * .65) * .012; }
    update(0);
    return { root, update, setState };
}
export function createInspirationGreenhouse() {
    const root = new THREE.Group();
    root.name = 'serre-des-inspirations';
    box(root, 3, .16, 2.05, 0xc4a57b, 0, .08, 0);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xcbe3df, transparent: true, opacity: .13, roughness: .1, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
    for (const x of [-1.35, 1.35]) {
        add(root, new THREE.PlaneGeometry(1.9, 1.55), glass, x, .95, 0).rotation.y = Math.PI / 2;
        for (const z of [-.9, .9]) {
            rod(root, [x, .15, z], [x, 1.75, z]);
            rod(root, [x, 1.75, z], [0, 2.45, z]);
        }
    }
    for (const z of [-.9, .9]) {
        rod(root, [-1.35, .16, z], [1.35, .16, z]);
        rod(root, [-1.35, 1.75, z], [1.35, 1.75, z]);
    }
    rod(root, [0, 2.45, -.9], [0, 2.45, .9]);
    for (const side of [-1, 1]) {
        const roof = add(root, new THREE.PlaneGeometry(1.52, 1.9), glass, side * .675, 2.1, 0);
        roof.rotation.set(-Math.PI / 2, side * -.48, 0);
    }
    box(root, 2.5, .12, .7, 0xd6b994, 0, .45, .1);
    const cards = ['rose', 'vanille', 'pistache'].map((key, i) => { const group = new THREE.Group(); group.position.set((i - 1) * .78, .98, .15); root.add(group); const rim = box(group, .7, .9, .055, 0xa3296a); const photo = add(group, new THREE.PlaneGeometry(.59, .77), new THREE.MeshBasicMaterial({ color: 0xf2e4d2, toneMapped: false }), 0, 0, .033); return { key, group, rim, photo, baseX: (i - 1) * .78 }; });
    let selected = 'inspiration';
    function setState(state) { selected = state.key; cards.forEach(card => { card.rim.material.color.setHex(card.key === selected ? 0x94205f : 0xc5b392); }); }
    function update(time) { cards.forEach((card, i) => { const active = card.key === selected; card.group.position.y = .98 + (active ? .2 : 0) + Math.sin(time * .95 + i) * .09; card.group.rotation.y = Math.sin(time * .7 + i) * .12; card.group.scale.setScalar(active ? 1.08 : 1); }); }
    root.userData.framingBox = new THREE.Box3(new THREE.Vector3(-1.6, 0, -1.1), new THREE.Vector3(1.6, 2.65, 1.1));
    return { root, update, setState, cards };
}
export function createSampleCoffret() {
    const root = new THREE.Group();
    root.name = 'coffret-final';
    box(root, 2.8, .22, 2, 0xb88a36, 0, .11, 0);
    box(root, 2.6, .12, 1.8, 0xc96696, 0, .28, 0);
    for (const x of [-1.25, 1.25])
        box(root, .12, 1.05, 1.8, 0xb79168, x, .78, 0);
    for (const z of [-.85, .85])
        box(root, 2.6, 1.05, .1, 0xb79168, 0, .78, z);
    const lid = new THREE.Group();
    lid.position.set(0, 1.34, -.9);
    root.add(lid);
    const arch = new THREE.Shape();
    arch.moveTo(-.95, 0);
    arch.lineTo(.95, 0);
    arch.quadraticCurveTo(.95, .42, 0, .5);
    arch.quadraticCurveTo(-.95, .42, -.95, 0);
    const top = add(lid, new THREE.ExtrudeGeometry(arch, { depth: 2.72, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 2, curveSegments: 24 }), material(0xa31662, { roughness: .4 }), -1.36, .02, .9);
    top.rotation.y = Math.PI / 2;
    box(lid, 2.45, .035, 1.6, 0xf3e7d7, 0, -.025, .9);
    for (const x of [-.88, .88]) {
        const points = Array.from({ length: 25 }, (_, i) => { const z = -.92 + i * 1.84 / 24; return new THREE.Vector3(x, .1 + .43 * (1 - z * z / .95 ** 2), .9 + z); });
        add(lid, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, .028, 7, false), material(0xd9a642, { metalness: .7, roughness: .25 }));
    }
    const lock = new THREE.Group();
    lock.position.set(0, 1.07, .96);
    root.add(lock);
    box(lock, .27, .26, .1, 0xc99b38, 0, 0, 0).material.metalness = .65;
    const shackle = add(lock, new THREE.TorusGeometry(.105, .024, 8, 24, Math.PI), material(0xf0cf74, { metalness: .75, roughness: .25 }), 0, .13, 0);
    const keyhole = add(lock, new THREE.SphereGeometry(.025, 10, 8), material(0x4c352c), 0, .02, .055);
    keyhole.scale.y = 1.3;
    const samples = [];
    const scentMap = vaporTexture();
    const vapor = [];
    for (let i = 0; i < 3; i++) {
        const sample = bottle([0xd4a146, 0xb44d78, 0xc4aa6a][i], 0x94205f, '');
        sample.scale.setScalar(.58);
        sample.position.set((i - 1) * .73, .38, -.05);
        root.add(sample);
        const cap = new THREE.Group();
        const pieces = sample.children.slice(2, -1);
        pieces.forEach(piece => cap.add(piece));
        sample.add(cap);
        sample.userData.cap = cap;
        for (let n = 0; n < 12; n++) {
            const particle = new THREE.Sprite(new THREE.SpriteMaterial({ map: scentMap, color: 0xa67f96, transparent: true, opacity: 0, depthWrite: false }));
            sample.add(particle);
            vapor.push({ particle, index: i, phase: n / 12 });
        }
        samples.push(sample);
    }
    const brief = box(root, 1.4, .025, .42, 0xfff8e9, 0, .46, .55);
    for (let i = 0; i < 3; i++)
        box(root, .78 - i * .12, .01, .018, 0xc6a8b5, -.05, .48, .45 + i * .09);
    let open = 0, target = 0, last = 0, requested = false, arriving = false;
    function setArrival(value, instant = false) { arriving = Boolean(value); target = requested || arriving ? 1 : 0; if (instant) {
        open = target;
        lid.rotation.x = -open * 1.35;
    } }
    function setState(state, instant = false) { requested = state.coffretOpen; setArrival(arriving, instant); samples.forEach((sample, i) => sample.children[1].material.color.setHex(state.colors[i])); }
    function update(time) {
        const delta = Math.min(.1, Math.max(0, time - last));
        last = time;
        open = THREE.MathUtils.damp(open, target, 3.8, delta);
        lid.rotation.x = -open * 1.35;
        lock.position.set(open * .3, 1.07 - open * .25, .96 + open * .07);
        lock.rotation.z = Math.sin(time * 2) * open * .12;
        shackle.rotation.z = -open * .6;
        shackle.position.y = .13 + open * .08;
        samples.forEach((sample, i) => { sample.position.y = .38 + open * (.2 + Math.sin(time * 1.1 + i) * .055); sample.userData.cap.position.y = open * .28; sample.userData.cap.rotation.z = open * .16; });
        brief.position.y = .46 + open * .07;
        vapor.forEach(({ particle, index, phase }) => { const age = (time * .32 + phase + index * .13) % 1; particle.position.set(Math.sin(age * 6 + index) * age * .23, 1.43 + age * 1.7, Math.cos(age * 5 + index) * age * .15); const size = .16 + age * .55; particle.scale.set(size * .8, size * 1.3, 1); particle.material.opacity = open * Math.sin(age * Math.PI) * .52; particle.material.rotation = age * .7 + index; });
    }
    root.userData.framingBox = new THREE.Box3(new THREE.Vector3(-1.5, 0, -1.2), new THREE.Vector3(1.5, 3.5, 1.1));
    root.userData.lid = lid;
    root.userData.lock = lock;
    root.userData.vapor = vapor;
    return { root, update, setState, setArrival };
}
