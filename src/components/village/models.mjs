import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
function material(color, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .04, ...extra }); }
function box(w, h, d, color, r = .1) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 3, h / 3, d / 3)), material(color)); m.castShadow = true; m.receiveShadow = true; return m; }
function cylinder(radius, height, color) { const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24), material(color)); m.castShadow = true; m.receiveShadow = true; return m; }
function textPlaque(text, width = .9, height = .3, color = '#713754') { const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 192; const ctx = canvas.getContext('2d'); if (!ctx)
    return new THREE.Group(); ctx.fillStyle = '#fffaf6'; ctx.fillRect(0, 0, 512, 192); ctx.fillStyle = color; const family = getComputedStyle(document.documentElement).getPropertyValue('--font-givaudan-text').trim() || 'sans-serif'; ctx.font = `400 48px ${family}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 100, 470); const texture = new THREE.CanvasTexture(canvas); return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false })); }
function bottle(liquidColor = 0xe4b578, capColor = 0x8a4b70, label = 'HORIZON') { const group = new THREE.Group(); group.userData.kind = 'sample-vial'; const profile = [[0, 0], [.25, 0], [.31, .045], [.32, .1], [.32, .94], [.28, 1.04], [.18, 1.15], [.18, 1.23], [0, 1.23]].map(([x, y]) => new THREE.Vector2(x, y)); const glass = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), new THREE.MeshPhysicalMaterial({ color: 0xfff8f4, transparent: true, opacity: .3, roughness: .15, metalness: .02, clearcoat: .85, side: THREE.DoubleSide, depthWrite: false })); glass.castShadow = false; group.add(glass); const liquid = cylinder(.285, .55, liquidColor); liquid.position.y = .32; liquid.material.roughness = .28; group.add(liquid); const cap = cylinder(.215, .23, capColor); cap.position.y = 1.29; group.add(cap); for (let i = 0; i < 16; i++) {
    const rib = box(.025, .18, .025, capColor, .008);
    rib.position.set(Math.sin(i * Math.PI / 8) * .211, 1.29, Math.cos(i * Math.PI / 8) * .211);
    group.add(rib);
} const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .025, 8, 24), material(capColor)); ring.rotation.x = Math.PI / 2; ring.position.y = 1.17; group.add(ring); if (label) {
    const tag = textPlaque(label, .48, .31);
    tag.position.set(0, .77, .325);
    group.add(tag);
} return group; }
function productModel(product, enabled = true) { const g = new THREE.Group(), t = (product || 'savon').toLowerCase(), ivory = enabled ? 0xf4e6d2 : 0xddd5dc, rose = enabled ? 0xd592b4 : 0xcfc4cf; if (t.includes('bougie')) {
    const jar = cylinder(.47, .75, ivory);
    jar.position.y = .38;
    g.add(jar);
    const wax = cylinder(.43, .025, 0xfff6df);
    wax.position.y = .77;
    g.add(wax);
    const wick = cylinder(.018, .16, 0x634c45);
    wick.position.y = .84;
    g.add(wick);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xf5c368 }));
    flame.scale.set(.65, 1.6, .65);
    flame.position.y = .99;
    g.add(flame);
}
else if (t.includes('gel') || t.includes('shamp')) {
    const body = box(.65, 1.1, .45, rose, .15);
    body.position.y = .55;
    g.add(body);
    const pump = box(.42, .12, .2, 0xfff8f4, .03);
    pump.position.set(.04, 1.22, 0);
    g.add(pump);
    const neck = cylinder(.1, .18, 0xf3ecec);
    neck.position.y = 1.11;
    g.add(neck);
    const label = textPlaque('SOIN', .43, .3);
    label.position.set(0, .58, .235);
    g.add(label);
}
else if (t.includes('parfum')) {
    const body = box(.85, .9, .5, ivory, .11);
    body.position.y = .45;
    body.material.transparent = true;
    body.material.opacity = .75;
    g.add(body);
    const cap = box(.48, .3, .4, rose, .05);
    cap.position.y = 1.06;
    g.add(cap);
    const label = textPlaque('FRAGRANCE', .63, .28);
    label.position.set(0, .5, .26);
    g.add(label);
}
else if (t.includes('crème') || t.includes('creme')) {
    const jar = cylinder(.52, .45, ivory);
    jar.position.y = .23;
    g.add(jar);
    const lid = cylinder(.55, .13, rose);
    lid.position.set(.8, .08, -.15);
    lid.rotation.z = .2;
    g.add(lid);
    const cream = cylinder(.47, .035, 0xfffaf0);
    cream.position.y = .47;
    g.add(cream);
}
else if (t.includes('autre') || t.includes('diffuseur')) {
    const jar = box(.55, .65, .45, ivory, .1);
    jar.position.y = .33;
    g.add(jar);
    for (let i = 0; i < 4; i++) {
        const reed = cylinder(.018, 1.2, 0xbb997f);
        reed.position.set((i - 1.5) * .08, 1.12, 0);
        reed.rotation.z = (i - 1.5) * .12;
        g.add(reed);
    }
}
else {
    const dish = box(1.55, .13, 1.08, rose, .06);
    dish.position.y = .07;
    g.add(dish);
    const soap = box(1.2, .43, .82, ivory, .17);
    soap.position.set(0, .34, 0);
    soap.rotation.y = -.14;
    g.add(soap);
    const bubbles = new THREE.Group();
    for (let i = 0; i < 3; i++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(.085 + i * .025, 12, 8), material(0xfffafb, { transparent: true, opacity: .7 }));
        m.position.set(.65 + i * .07, .2 + i * .1, .32 - i * .13);
        bubbles.add(m);
    }
    g.add(bubbles);
} return g; }
export { bottle, productModel };
