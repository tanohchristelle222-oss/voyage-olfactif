import * as THREE from 'three';
import { ROAD, MAP_PINS } from './journey-route.mjs';
const PINS = MAP_PINS;
export function createScentRibbon() {
    const tokens = ROAD.match(/[MC]|-?\d+(?:\.\d+)?/g), curve = new THREE.CurvePath();
    let index = 0, from;
    while (index < tokens.length) {
        const command = tokens[index++];
        if (command === 'M') {
            from = new THREE.Vector3(+tokens[index++], 960 - Number(tokens[index++]), 0);
            continue;
        }
        const p = Array.from({ length: 3 }, () => new THREE.Vector3(+tokens[index++], 960 - Number(tokens[index++]), 0));
        curve.add(new THREE.CubicBezierCurve3(from, ...p));
        from = p[2];
    }
    const root = new THREE.Group();
    root.name = 'courant-de-senteurs';
    const geometry = new THREE.TubeGeometry(curve, 280, 2.1, 6, false);
    const ribbon = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xd080a7, transparent: true, opacity: .28, roughness: .35, metalness: .08, depthWrite: false }));
    root.add(ribbon);
    const motes = Array.from({ length: 22 }, (_, i) => { const particle = new THREE.Mesh(new THREE.SphereGeometry(3.3 + (i % 3) * .8, 8, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xd8b571 : 0xcc8caf, transparent: true, opacity: .45, depthWrite: false })); root.add(particle); return particle; });
    const traveler = new THREE.Group();
    const halo = new THREE.Mesh(new THREE.SphereGeometry(15, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffc948, transparent: true, opacity: .16, depthWrite: false, toneMapped: false }));
    traveler.add(halo);
    traveler.add(new THREE.Mesh(new THREE.SphereGeometry(6, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffdc68, toneMapped: false })));
    root.add(traveler);
    root.userData.traveler = traveler;
    let arrived = false;
    const destinations = PINS.map(([x, y]) => {
        let nearest = 0, distance = Infinity;
        for (let i = 0; i <= 1200; i++) {
            const point = curve.getPoint(i / 1200), d = Math.hypot(point.x - x, point.y - (960 - y));
            if (d < distance) {
                distance = d;
                nearest = i / 1200;
            }
        }
        return nearest;
    });
    let destination = destinations[0];
    function setState(state) { destination = destinations[state.current - 1]; ribbon.material.color.setHex(state.colors[0]); motes.forEach((particle, i) => particle.material.color.setHex(state.colors[i % 3])); }
    function update(time) {
        motes.forEach((particle, i) => { const progress = (time * .045 + i / motes.length) % 1; particle.position.copy(curve.getPoint(progress)); particle.position.z = 4 + Math.sin(time + i) * 1.2; particle.scale.setScalar(.95 + Math.sin(time * .8 + i) * .15); particle.material.opacity = progress <= destination ? .68 : .33; });
        const phase = time % 17, progress = Math.min(1, phase / 10);
        arrived = phase >= 10 && phase < 15;
        traveler.visible = phase < 15;
        traveler.position.copy(curve.getPoint(progress));
        traveler.position.z = 12;
        halo.scale.setScalar(1 + Math.sin(time * 2.5) * .1);
    }
    update(0);
    return { root, update, setState, destinations, get arrived() { return arrived; } };
}
