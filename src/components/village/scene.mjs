import * as THREE from 'three';
import { createMotionClock } from './motion-clock.mjs';
import { bottle, productModel } from './models.mjs';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const C = { ivory: 0xdacdbb, white: 0xf0e7d8, navy: 0x263e50, blue: 0x497b83, mint: 0x8f9f72, leaf: 0x557c58, plum: 0xc28921, pink: 0xc97898, lilac: 0x8a79a3, stone: 0xd3d9cc };
const locations = [[-4, .1], [-3, -3.25], [0, -3.3], [3.9, .1], [3.6, -3.25], [0, 2.1]];
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...extra });
let finishes = new Map();
function finishTexture(kind) { if (finishes.has(kind))
    return finishes.get(kind); const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256; const ctx = canvas.getContext('2d'); if (!ctx)
    return null; ctx.fillStyle = kind === 'asphalt' ? '#999999' : '#dddddd'; ctx.fillRect(0, 0, 256, 256); let seed = 17; const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; for (let i = 0; i < 6500; i++) {
    const tone = Math.floor((kind === 'grass' ? 115 : kind === 'asphalt' ? 90 : 185) + rand() * (kind === 'grass' ? 105 : 55));
    ctx.fillStyle = `rgba(${tone},${tone},${tone},${.08 + rand() * .2})`;
    const x = rand() * 256, y = rand() * 256;
    ctx.fillRect(x, y, kind === 'wood' ? 1 : 1 + rand() * 2, kind === 'wood' ? 8 + rand() * 38 : 1 + rand() * 2);
} if (kind === 'paving') {
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 2;
    for (let row = 0; row < 8; row++) {
        const y = row * 32;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
        for (let x = (row % 2) * 32; x <= 256; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 32);
            ctx.stroke();
        }
    }
} if (kind === 'fabric') {
    ctx.strokeStyle = 'rgba(90,90,90,.16)';
    ctx.lineWidth = .5;
    for (let x = 0; x < 256; x += 3) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
    }
} const map = new THREE.CanvasTexture(canvas); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(kind === 'asphalt' || kind === 'grass' ? 5 : kind === 'paving' ? 3 : 2, kind === 'asphalt' || kind === 'grass' ? 5 : kind === 'paving' ? 3 : 2); map.colorSpace = THREE.SRGBColorSpace; const bump = map.clone(); bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true; const result = { map, bump }; finishes.set(kind, result); return result; }
function surface(color, kind) { const texture = finishTexture(kind); const material = mat(color, { roughness: kind === 'wood' ? .66 : kind === 'fabric' ? .9 : .91 }); if (texture) {
    material.map = texture.map;
    material.bumpMap = texture.bump;
    material.bumpScale = kind === 'paving' ? .025 : kind === 'stucco' ? .012 : .008;
} return material; }
function cube(w, h, d, color, finish = null) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), finish ? surface(color, finish) : mat(color)); m.castShadow = true; m.receiveShadow = true; return m; }
function rounded(w, h, d, color, r = .05, extra = {}) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 3, h / 3, d / 3)), new THREE.MeshPhysicalMaterial({ color, roughness: .28, metalness: .25, clearcoat: .8, ...extra })); m.castShadow = true; m.receiveShadow = true; return m; }
function cyl(r, h, color, n = 12) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, n), mat(color)); m.castShadow = true; m.receiveShadow = true; return m; }
function at(parent, object, x, y, z) { object.position.set(x, y, z); parent.add(object); return object; }
function orb(r, color) { return new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat(color)); }
function line(points, color = C.blue) { const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))); return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color })); }
function frame(points) { const group = new THREE.Group(); for (let i = 1; i < points.length; i++) {
    const a = new THREE.Vector3(...points[i - 1]), b = new THREE.Vector3(...points[i]), length = a.distanceTo(b), bar = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, length, 8), mat(0x5c7778, { roughness: .3, metalness: .65 }));
    bar.position.copy(a).lerp(b, .5);
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    group.add(bar);
} return group; }
function architecture(g, w, h, d) { at(g, cube(w + .035, .15, d + .035, 0xafa494, 'stone'), 0, .16, 0); const pipe = cyl(.022, h - .15, 0x737d7b, 10); pipe.material.metalness = .6; at(g, pipe, w / 2 - .075, h / 2 + .12, d / 2 + .065); const side = new THREE.Group(); side.position.set(w / 2 + .015, 0, -.3); side.rotation.y = Math.PI / 2; windowPane(side, 0, h * .58, 0, .7, .75); g.add(side); }
function roof(g, w, d, y) { at(g, cube(w + .12, .16, d + .12, C.white, 'stone'), 0, y, 0); for (const x of [-w / 2, w / 2])
    at(g, cube(.12, .22, d + .12, C.white), x, y + .14, 0); for (const z of [-d / 2, d / 2])
    at(g, cube(w, .22, .12, C.white), 0, y + .14, z); at(g, cube(w - .18, .025, d - .18, 0x777d78, 'asphalt'), 0, y + .09, 0); }
function glass(w, h, color = 0x9cbbc0) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ color, roughness: .075, metalness: .25, transparent: true, opacity: .55, clearcoat: 1, envMapIntensity: 1.3, side: THREE.DoubleSide })); }
function windowPane(g, x, y, z, w, h) { at(g, cube(w + .12, h + .12, .055, 0x5d655f), x, y, z); at(g, cube(w, h, .05, 0x273a40), x, y, z + .035); at(g, glass(w - .045, h - .045), x, y, z + .067); at(g, cube(.025, h, .035, 0x717a73), x, y, z + .09); at(g, cube(w + .19, .045, .14, C.white, 'stone'), x, y - h / 2 - .07, z + .045); at(g, cube(w, .025, .035, 0x717a73), x, y + .12, z + .09); }
function door(g, x, z, color = C.navy) { at(g, cube(.65, 1.47, .065, 0x70756b), x, .77, z); at(g, rounded(.57, 1.4, .07, color, .012, { roughness: .5, metalness: .1 }), x, .77, z + .04); at(g, cube(.43, .75, .03, 0x233238), x, .99, z + .086); at(g, glass(.4, .72), x, .99, z + .105); at(g, cube(.45, .15, .035, color), x, .32, z + .09); at(g, cube(.018, .13, .045, 0xb8b5a6), x + .19, .69, z + .12); at(g, cube(.9, .1, .36, C.white, 'stone'), x, .08, z + .13); }
function awning(g, w, z, y = 1.68) { const awn = new THREE.Group(); awn.position.set(0, y, z); for (let i = 0; i < 8; i++) {
    const stripe = cube(w / 8, .018, .72, i % 2 ? C.white : C.navy, 'fabric');
    stripe.rotation.x = .22;
    at(awn, stripe, -w / 2 + w / 16 + i * w / 8, 0, .14);
    at(awn, cube(w / 8, .085, .018, i % 2 ? C.white : C.navy, 'fabric'), -w / 2 + w / 16 + i * w / 8, -.15, .49);
} g.add(awn); }
function plant(parent, x, z, scale = 1, flowers = false) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); at(g, cyl(.17, .31, 0xd8d0c3), 0, .155, 0); at(g, cyl(.145, .035, 0x647660), 0, .32, 0); if (flowers) {
    for (let i = 0; i < 5; i++) {
        const a = i * 2.4, fx = Math.sin(a) * .15, fz = Math.cos(a) * .15;
        at(g, cyl(.014, .45, C.leaf, 5), fx, .52, fz);
        const bloom = orb(.095, [C.pink, C.white, C.lilac][i % 3]);
        bloom.scale.y = .6;
        at(g, bloom, fx, .77 + Math.sin(a) * .05, fz);
        at(g, orb(.04, 0xe3cd95), fx, .82 + Math.sin(a) * .05, fz);
    }
}
else {
    at(g, cyl(.045, .48, 0xb8a58d), 0, .5, 0);
    at(g, orb(.34, C.leaf), 0, .84, 0);
    at(g, orb(.25, 0xa8c9bc), -.12, 1.08, .02);
} parent.add(g); return g; }
function tree(parent, x, z, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); at(g, cyl(.18, .08, 0x9b9b87), 0, .08, 0); at(g, cyl(.04, 1.08, 0x76654d), 0, .58, 0); for (let i = 0; i < 3; i++) {
    const branch = cyl(.019, .38, 0x76654d);
    branch.rotation.z = (i - 1) * .5;
    at(g, branch, Math.sin(i * 2) * .1, .95, Math.cos(i * 2) * .08);
} const geometry = new THREE.SphereGeometry(.16, 7, 5), leaves = new THREE.InstancedMesh(geometry, mat(0x69825a), 40), dummy = new THREE.Object3D(); for (let i = 0; i < 40; i++) {
    const angle = i * 2.39996, r = .15 + .28 * Math.sqrt((i % 13) / 13);
    dummy.position.set(Math.cos(angle) * r, 1.22 + Math.sin(i * 1.71) * .3, Math.sin(angle) * r);
    dummy.scale.set(1, .8 + (i % 3) * .2, .8);
    dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);
    leaves.setColorAt(i, new THREE.Color([0x557044, 0x6b8355, 0x7d915e, 0x485f3e][i % 4]));
} leaves.instanceMatrix.needsUpdate = true; g.add(leaves); parent.add(g); return g; }
function greenhouse() {
    const g = new THREE.Group();
    const w = 2.75, d = 2.1;
    at(g, cube(w, 1.25, d, 0x83a49b, 'stucco'), 0, .68, 0);
    windowPane(g, -.55, .77, d / 2, .92, .72);
    door(g, .77, d / 2 + .02);
    at(g, cube(w + .18, .13, d + .18, C.white), 0, 1.35, 0);
    const roofY = 1.43, top = 2.46, half = w / 2 + .06, z = d / 2 + .07;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-half, roofY, z, 0, top, z, 0, top, -z, -half, roofY, z, 0, top, -z, -half, roofY, -z, half, roofY, z, half, roofY, -z, 0, top, -z, half, roofY, z, 0, top, -z, 0, top, z, -half, roofY, z, half, roofY, z, 0, top, z, -half, roofY, -z, 0, top, -z, half, roofY, -z], 3));
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xa0b4b9, roughness: .08, metalness: .2, transparent: true, opacity: .32, clearcoat: 1, envMapIntensity: 1.3, side: THREE.DoubleSide, depthWrite: false })));
    for (const pz of [-z, 0, z]) {
        g.add(frame([[-half, roofY, pz], [0, top, pz], [half, roofY, pz]]));
    }
    for (const ratio of [-1, -.5, 0, .5, 1]) {
        const x = half * ratio, y = top - Math.abs(ratio) * (top - roofY);
        g.add(frame([[x, y, z], [x, y, -z]]));
    }
    g.add(frame([[-half, roofY, z], [-half, roofY, -z], [half, roofY, -z], [half, roofY, z], [-half, roofY, z]]));
    for (let i = 0; i < 4; i++) {
        const v = bottle([0xe2c394, 0xd3a6c4, 0xa8c3a5][i % 3], C.navy, '');
        v.scale.setScalar(.34);
        at(g, v, (i - 1.5) * .5, 1.44, 0);
    }
    return g;
}
function shop(kind) {
    const g = new THREE.Group();
    const h = kind === 'project' ? 2.65 : 1.9, w = kind === 'project' ? 2.75 : 2.4, d = 2.05;
    at(g, cube(w, h, d, kind === 'project' ? 0x9a94aa : kind === 'flowers' ? 0xc9876e : 0xc9aa69, 'stucco'), 0, h / 2 + .07, 0);
    roof(g, w, d, h + .11);
    architecture(g, w, h, d);
    door(g, -.66, d / 2 + .04);
    windowPane(g, .42, 1.05, d / 2 + .035, 1.08, 1.12);
    if (kind !== 'project')
        awning(g, w + .12, d / 2 + .03, 1.72);
    else {
        windowPane(g, 0, 2.16, d / 2 + .035, 1.95, .47);
        at(g, cube(.1, h, .12, C.white), -w / 2 + .06, h / 2, .99);
        at(g, cube(.2, .3, .23, C.navy), -.6, h + .26, -.4);
    }
    if (kind === 'flowers') {
        plant(g, -1.38, 1.32, .9, true);
        plant(g, 1.35, 1.28, 1.1, true);
        plant(g, 1.47, .58, .8, true);
        at(g, cube(.65, .46, .6, 0xc3c5af), 1.6, .24, .02);
        plant(g, 1.6, .02, .7, true);
    }
    else if (kind === 'laboratory') {
        at(g, cube(.27, .42, .3, C.navy), .2, 2.2, -.2);
    }
    else if (kind === 'summary') {
        const v = bottle(0xe5c197, C.plum, '');
        v.scale.setScalar(.36);
        at(g, v, .42, .63, 1.12);
    }
    else {
        const p = productModel('Parfum');
        p.scale.setScalar(.32);
        at(g, p, .4, .58, 1.12);
    }
    return g;
}
function makeBuilding(index, completed = false, unlocked = false) { const g = index === 0 ? greenhouse() : shop(index === 1 ? 'project' : index === 3 ? 'flowers' : index === 4 ? 'laboratory' : index === 5 ? 'summary' : 'audience'); g.userData = { room: index, kind: 'village-building', anchorHeight: index === 1 ? 3.08 : index === 0 ? 2.8 : 2.55, completed, unlocked }; const accent = completed ? 0x8fae8c : unlocked ? C.plum : 0xb7c8c2; const base = at(g, cube(index === 0 ? 3.03 : 2.95, .09, 2.48, accent), 0, .015, 0); base.receiveShadow = true; return g; }
function lamp(parent, x, z) { const g = new THREE.Group(); at(g, cyl(.09, .12, 0xb3b9af), 0, .06, 0); at(g, cyl(.025, 1.37, 0x8d9d99, 6), 0, .77, 0); at(g, cube(.23, .3, .23, 0xf5e5b9), 0, 1.5, 0); const cap = new THREE.Mesh(new THREE.ConeGeometry(.22, .16, 4), mat(0x8d9d99)); cap.rotation.y = Math.PI / 4; at(g, cap, 0, 1.73, 0); at(parent, g, x, .12, z); }
function bench(parent, x, z) { const g = new THREE.Group(); for (let i = 0; i < 4; i++) {
    at(g, cube(1.45, .045, .075, 0x95836a, 'wood'), 0, .42, -.12 + i * .09);
    at(g, cube(1.45, .065, .05, 0x95836a, 'wood'), 0, .58 + i * .1, -.17);
} for (const px of [-.56, .56]) {
    at(g, cube(.05, .4, .05, 0x8eaaa0), px, .22, .08);
    at(g, cube(.05, .8, .05, 0x8eaaa0), px, .43, -.18);
} at(parent, g, x, .12, z); }
function capsule(r, length, color) { const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, length, 4, 8), mat(color, { roughness: .82 })); return mesh; }
function makePerson(color = C.navy, skin = 0xdab79d) { const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const torso = capsule(.115, .23, color); torso.scale.z = .65; at(body, torso, 0, .7, 0); at(body, cube(.19, .12, .13, 0x343d43), 0, .46, 0); at(body, cyl(.032, .09, skin, 8), 0, .965, 0); const head = orb(.085, skin); head.scale.y = 1.22; at(body, head, 0, 1.055, 0); const hair = orb(.088, 0x50453d); hair.scale.set(1, .55, .96); at(body, hair, 0, 1.12, -.01); at(body, orb(.017, skin), 0, 1.06, .075); const legs = [], arms = [], knees = []; for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * .059, .47, 0);
    at(leg, capsule(.041, .15, 0x38434a), 0, -.105, 0);
    const knee = new THREE.Group();
    knee.position.y = -.22;
    at(knee, capsule(.033, .15, 0x38434a), 0, -.105, 0);
    at(knee, rounded(.078, .055, .15, 0x3b342e, .018, { roughness: .8, metalness: 0 }), 0, -.224, .034);
    leg.add(knee);
    body.add(leg);
    legs.push(leg);
    knees.push(knee);
    const arm = new THREE.Group();
    arm.position.set(side * .135, .85, 0);
    at(arm, capsule(.029, .12, color), 0, -.08, 0);
    const forearm = capsule(.025, .12, color);
    forearm.rotation.x = -.12;
    at(arm, forearm, 0, -.235, .013);
    at(arm, orb(.029, skin), 0, -.32, .025);
    body.add(arm);
    arms.push(arm);
} const shadow = new THREE.Mesh(new THREE.CircleGeometry(.19, 16), new THREE.MeshBasicMaterial({ color: 0x263a2b, transparent: true, opacity: .18, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; at(root, shadow, 0, -.015, 0); root.traverse(o => { if (o.isMesh)
    o.castShadow = false; }); root.userData = { kind: 'walking-person', body, legs, arms, knees }; return root; }
function makeVan() { const g = new THREE.Group(), paint = 0x334c5b, trim = 0x252d30; at(g, rounded(.91, .65, 1.48, paint, .07), 0, .62, -.2); at(g, rounded(.86, .56, .65, paint, .09), 0, .57, .75); at(g, rounded(.86, .19, .45, paint, .055), 0, .39, 1); at(g, rounded(.94, .095, 1.82, trim, .025), 0, .295, .02); const screen = glass(.73, .32, 0x63828b); screen.rotation.x = -.2; at(g, screen, 0, .74, 1.075); for (const side of [-1, 1]) {
    const pane = glass(.33, .29, 0x63828b);
    pane.rotation.y = side * Math.PI / 2;
    at(g, pane, side * .438, .735, .75);
    at(g, rounded(.045, .12, .13, 0x26343a, .015), side * .54, .7, .86);
    at(g, cube(.1, .015, .02, 0x9caaa9), side * .487, .66, .88);
    at(g, cube(.012, .016, .15, 0xb9c3c2), side * .464, .62, -.08);
    g.add(line([[side * .461, .36, .48], [side * .461, .89, .48], [side * .461, .89, -.65], [side * .461, .36, -.65]], 0x253b47));
    at(g, rounded(.14, .075, .045, 0xece5cb, .02, { roughness: .12, emissive: 0x7b7050, emissiveIntensity: .2 }), side * .28, .415, 1.235);
    at(g, cube(.09, .16, .025, 0x853d39), side * .34, .47, -.96);
} at(g, cube(.4, .065, .025, 0x232a2e), 0, .34, 1.238); at(g, rounded(.8, .07, .055, 0x818c8d, .015, { metalness: .7, roughness: .28 }), 0, .25, 1.24); at(g, cube(.012, .51, .015, 0x263c48), 0, .65, -.95); const wheels = []; for (const x of [-.45, .45])
    for (const z of [-.67, .68]) {
        const pivot = new THREE.Group(), tire = new THREE.Mesh(new THREE.TorusGeometry(.145, .048, 8, 24), mat(0x242729, { roughness: .95 }));
        tire.rotation.y = Math.PI / 2;
        pivot.add(tire);
        const hub = cyl(.106, .1, 0x98a3a6, 20);
        hub.material.metalness = .75;
        hub.material.roughness = .25;
        hub.rotation.z = Math.PI / 2;
        pivot.add(hub);
        at(g, pivot, x, .2, z);
        wheels.push(pivot);
    } const shadow = new THREE.Mesh(new THREE.CircleGeometry(.6, 16), new THREE.MeshBasicMaterial({ color: 0x26382a, transparent: true, opacity: .2, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.scale.y = 1.65; at(g, shadow, 0, .006, .05); g.traverse(o => { if (o.isMesh)
    o.castShadow = false; }); g.userData = { kind: 'delivery-van', wheels }; return g; }
function routeInfo(points) { const lengths = points.map((p, i) => Math.hypot(points[(i + 1) % points.length][0] - p[0], points[(i + 1) % points.length][1] - p[1])); return { points, lengths, total: lengths.reduce((a, b) => a + b, 0) }; }
function sampleRoute(route, distance) { let d = ((distance % route.total) + route.total) % route.total; for (let i = 0; i < route.points.length; i++) {
    if (d <= route.lengths[i] || i === route.points.length - 1) {
        const a = route.points[i], b = route.points[(i + 1) % route.points.length], t = route.lengths[i] ? d / route.lengths[i] : 0;
        return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) };
    }
    d -= route.lengths[i];
} return { x: 0, z: 0, yaw: 0 }; }
function routeHeading(route, d) { const a = sampleRoute(route, d - .18), b = sampleRoute(route, d + .18); return Math.atan2(b.x - a.x, b.z - a.z); }
function smokeTexture() { const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256; const ctx = canvas.getContext('2d'); if (!ctx)
    return null; ctx.clearRect(0, 0, 256, 256); let seed = 137; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; for (let i = 0; i < 45; i++) {
    const angle = random() * Math.PI * 2, spread = random() * 62, x = 128 + Math.cos(angle) * spread, y = 128 + Math.sin(angle) * spread, r = 30 + random() * 39;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(174,184,192,0.28)');
    gradient.addColorStop(.4, 'rgba(190,199,206,0.16)');
    gradient.addColorStop(1, 'rgba(202,210,216,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
} const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture; }
function makeSmoke(parent, x, y, z, texture, seed) { const root = new THREE.Group(); root.userData.kind = 'smoke-emitter'; const particles = Array.from({ length: 18 }, (_, i) => { const material = new THREE.SpriteMaterial({ map: texture, color: 0xe2e7ec, transparent: true, opacity: 0, depthWrite: false, rotation: i * 2.4 }); const sprite = new THREE.Sprite(material); sprite.userData = { phase: i / 18, seed: seed + i * .83 }; root.add(sprite); return sprite; }); at(parent, root, x, y, z); root.userData.particles = particles; return root; }
function createVillage(options = {}) {
    finishes = new Map();
    const root = new THREE.Group();
    root.userData.kind = 'fragrance-village';
    at(root, cube(14, .22, 12.3, 0x858978, 'stone'), 0, -.1, 0);
    at(root, cube(13.75, .055, 12.05, 0x696d69, 'asphalt'), 0, .035, 0);
    at(root, cube(11.95, .055, 9.6, C.mint, 'grass'), 0, .07, -.1);
    at(root, cube(2.45, .02, 7.4, 0xbcb29e, 'paving'), 0, .11, -.1);
    at(root, cube(10.8, .022, 1, 0xbcb29e, 'paving'), 0, .12, 1.88);
    const buildings = locations.map(([x, z], i) => at(root, makeBuilding(i, !!options.completed?.[i], i <= (options.unlocked ?? 0)), x, .13, z));
    const texture = smokeTexture();
    const scents = [makeSmoke(root, 3.8, 2.56, -3.45, texture, 0), makeSmoke(root, -3.6, 3.2, -3.65, texture, 3)];
    const trees = [tree(root, -5.3, -2, .85), tree(root, -1.6, -4.6, .7), tree(root, 5.3, -3.4, .75), tree(root, -4.5, 3.35, .9), tree(root, 4.65, 3.1, .75)];
    plant(root, -5.4, 1.65, .8, true);
    plant(root, -1.45, 2.45, .85, true);
    plant(root, 1.45, 2.45, .85);
    plant(root, 5.3, 1.8, .9, true);
    for (const [x, z] of [[-5.9, 2.3], [-2.3, 4.35], [1.9, 4.35], [5.8, 2.4]])
        lamp(root, x, z);
    bench(root, -3.5, 4.2);
    bench(root, 4, -1.6);
    const perimeter = routeInfo([[-5.2, 3.5], [-2, 3.5], [-2, -1.5], [2, -1.5], [2, 3.5], [5.1, 3.5], [5.1, 4.3], [-5.2, 4.3]]), plaza = routeInfo([[-1.7, -1.3], [1.7, -1.3], [1.7, .55], [-1.7, .55]]);
    const walkers = Array.from({ length: 6 }, (_, i) => { const person = makePerson([C.navy, 0xc999b0, 0xd2d4c2, 0xa9bca8, C.lilac, 0x779da5][i], [0xe0bca1, 0xb98568, 0xe4cbb4][i % 3]); root.add(person); return { person, route: i < 4 ? perimeter : plaza, speed: .34 + (i % 3) * .045, offset: i < 4 ? i * perimeter.total / 4 : (i - 4) * plaza.total / 2, phase: i * 1.7 }; });
    const van = makeVan();
    van.userData.room = 6;
    van.userData.anchorHeight = 1.55;
    van.userData.completed = !!options.completed?.[6];
    van.userData.unlocked = (options.unlocked ?? 0) >= 6;
    root.add(van);
    const vanRoute = routeInfo([[-6.35, 5.25], [5.9, 5.25], [6.35, 4.8], [6.35, -5.2], [-6.35, -5.2]]);
    const village = { root, buildings, stages: [...buildings, van], walkers, van, vanRoute, scents, trees };
    updateVillage(village, 0);
    return village;
}
function updateVillage(v, time) { for (const w of v.walkers) {
    const p = sampleRoute(w.route, w.offset + time * w.speed);
    w.person.position.set(p.x, .14, p.z);
    w.person.rotation.y = routeHeading(w.route, w.offset + time * w.speed);
    const gait = time * 5.8 + w.phase, rig = w.person.userData;
    rig.body.position.y = Math.abs(Math.sin(gait)) * .012;
    rig.legs.forEach((l, i) => l.rotation.x = Math.sin(gait + i * Math.PI) * .34);
    rig.arms.forEach((a, i) => a.rotation.x = -Math.sin(gait + i * Math.PI) * .24);
    rig.knees.forEach((k, i) => k.rotation.x = .06 + Math.max(0, Math.sin(gait + i * Math.PI)) * .35);
} const p = sampleRoute(v.vanRoute, 8 + time * .55); v.van.position.set(p.x, .07, p.z); v.van.rotation.y = routeHeading(v.vanRoute, 8 + time * .55); v.van.userData.wheels.forEach(w => w.rotation.x = time * 2.9); v.scents.forEach(emitter => emitter.userData.particles.forEach(p => { const age = (time * .18 + p.userData.phase) % 1, seed = p.userData.seed; const drift = age * age * .65; p.position.set(drift + Math.sin(age * 9 + seed) * age * .16, age * 2.55, Math.cos(age * 7 + seed) * age * .15); const size = .32 + age * 1.28; p.scale.set(size, size * (.88 + Math.sin(seed) * .12), 1); const fade = Math.min(age * 9, 1) * Math.pow(1 - age, 1.1); p.material.opacity = fade * .52; p.material.rotation = seed + age * .65; })); v.trees.forEach((t, i) => t.rotation.z = Math.sin(time * .65 + i) * .012); }
function mount(container, options) {
    if (!container)
        return;
    function fallback() { container.classList.add('no-webgl'); container.innerHTML = '<div class="webgl-unavailable"><b>Votre parcours reste accessible.</b><p>La vue 3D nécessite WebGL. Les sept étapes restent accessibles dans la liste du parcours.</p></div>'; options.onFallback?.(); }
    if (!window.WebGL2RenderingContext) {
        fallback();
        return;
    }
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    }
    catch {
        fallback();
        return;
    }
    container.classList.remove('no-webgl');
    container.innerHTML = '';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-label', 'Village des senteurs en trois dimensions. Des personnages se promènent entre les étapes de votre projet.');
    canvas.setAttribute('role', 'img');
    container.append(canvas);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xe9f0f4, 0x6c715d, 1.25));
    const sun = new THREE.DirectionalLight(0xffecd0, 2.3);
    sun.position.set(-5, 12, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 10, bottom: -10, near: 1, far: 35 });
    sun.shadow.bias = -.001;
    scene.add(sun);
    let environment = null;
    try {
        const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
        environment = pmrem.fromScene(room, .04);
        scene.environment = environment.texture;
        scene.environmentIntensity = .35;
        room.dispose();
        pmrem.dispose();
    }
    catch { }
    const village = createVillage(options), world = village.root;
    scene.add(world);
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 120);
    const cameraDirection = new THREE.Vector3(11, 11.5, 17).normalize();
    let yaw = -.08, targetYaw = -.08, frame = 0, alive = true, clock = 0, dirty = true, drag = null, dragged = false;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const motion = createMotionClock({ fps: 30, reduced: preference?.matches });
    let playing = true;
    function reduced(e) { motion.setReduced(e.matches); dirty = true; }
    preference?.addEventListener?.('change', reduced);
    const visible = () => motion.resetFrame();
    document.addEventListener('visibilitychange', visible);
    const markers = (options.preview ? [] : village.stages).map((b, i) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'village-access-target ' + (options.completed[i] ? 'finished' : i === options.unlocked ? 'next' : 'locked'); button.disabled = i > options.unlocked && !options.completed[i]; button.setAttribute('aria-label', options.labels[i]); button.innerHTML = ''; button.onclick = () => options.onSelect(i); container.append(button); return button; });
    function resize() { const w = container.clientWidth || 900, h = container.clientHeight || 600, aspect = w / h, distance = Math.max(23, 18 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * aspect)); camera.aspect = aspect; camera.position.copy(cameraDirection).multiplyScalar(distance); camera.position.y += .7; camera.lookAt(0, .7, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true); renderer.setSize(w, h, false); dirty = true; }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
    function hit(e) { const r = canvas.getBoundingClientRect(); pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(pointer, camera); let o = ray.intersectObjects(village.stages, true)[0]?.object; while (o && o.userData.room === undefined)
        o = o.parent; return o?.userData.room ?? -1; }
    canvas.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, yaw: targetYaw }; dragged = false; canvas.setPointerCapture?.(e.pointerId); };
    canvas.onpointermove = e => { if (drag) {
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) + Math.abs(e.clientY - drag.y) > 6)
            dragged = true;
        targetYaw = THREE.MathUtils.clamp(drag.yaw + dx * .003, -.48, .4);
        dirty = true;
    }
    else {
        const n = hit(e);
        canvas.style.cursor = n < 0 ? 'grab' : (n <= options.unlocked || options.completed[n]) ? 'pointer' : 'not-allowed';
    } };
    canvas.onpointerup = e => { if (!options.preview && drag && !dragged) {
        const n = hit(e);
        if (n >= 0 && (n <= options.unlocked || options.completed[n]))
            options.onSelect(n);
    } drag = null; };
    canvas.onpointercancel = () => drag = null;
    canvas.style.touchAction = 'pan-y';
    const reset = container.parentElement.querySelector('[data-reset-view]');
    if (reset)
        reset.onclick = () => { targetYaw = -.08; dirty = true; };
    function labels() { const positions = (options.preview ? [] : village.stages).map((b, i) => { const p = b.localToWorld(new THREE.Vector3(0, b.userData.anchorHeight, 0)).project(camera), m = markers[i], w = m.offsetWidth || 150, h = m.offsetHeight || 42; return { x: THREE.MathUtils.clamp((p.x * .5 + .5) * container.clientWidth, w / 2 + 5, container.clientWidth - w / 2 - 5), y: THREE.MathUtils.clamp((-p.y * .5 + .5) * container.clientHeight, h + 5, container.clientHeight - 10), w, h }; }); for (let pass = 0; pass < 3; pass++)
        for (let i = 0; i < positions.length; i++)
            for (let j = i + 1; j < positions.length; j++) {
                const a = positions[i], b = positions[j];
                if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 5 && Math.abs(a.y - b.y) < Math.max(a.h, b.h) + 5) {
                    const upper = a.y < b.y ? a : b;
                    upper.y = Math.max(upper.h + 4, Math.min(a.y, b.y) - upper.h - 6);
                }
            } positions.forEach((p, i) => { markers[i].style.left = p.x + 'px'; markers[i].style.top = p.y + 'px'; }); }
    function animate(ms) { if (!alive)
        return; if (!container.isConnected) {
        destroy();
        return;
    } frame = requestAnimationFrame(animate); const tick = motion.tick(ms, document.hidden); if (!tick) return; const rotating = Math.abs(targetYaw - yaw) > .0001; if (!playing && !dirty && !rotating)
        return; if (playing) {
        clock = tick.time;
        updateVillage(village, clock);
    } yaw += (targetYaw - yaw) * .12; world.rotation.y = yaw; if (rotating)
        renderer.shadowMap.needsUpdate = true; world.updateMatrixWorld(true); labels(); renderer.render(scene, camera); dirty = false; }
    function destroy() { if (!alive)
        return; alive = false; cancelAnimationFrame(frame); ro.disconnect(); preference?.removeEventListener?.('change', reduced); document.removeEventListener('visibilitychange', visible); if (reset)
        reset.onclick = null; const geometries = new Set(), materials = new Set(); scene.traverse(o => { if (o.geometry)
        geometries.add(o.geometry); if (o.material)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); }); geometries.forEach(g => g.dispose()); const textures = new Set(); materials.forEach(m => { for (const key of ['map', 'bumpMap', 'normalMap', 'roughnessMap'])
        if (m[key])
            textures.add(m[key]); m.dispose(); }); textures.forEach(t => t.dispose()); environment?.dispose(); finishes.clear(); sun.shadow.map?.dispose(); renderer.forceContextLoss?.(); renderer.dispose(); canvas.remove(); markers.forEach(m => m.remove()); }
    options.onReady?.();
    frame = requestAnimationFrame(animate);
    return destroy;
}
export { mount, createVillage, updateVillage, makeBuilding, makePerson, makeVan, sampleRoute };
