import * as THREE from 'three';

// Pieds des sapins dans le même repère que les épingles de la carte.
export const TREE_SPOTS = [
  { x: 24, y: 905, height: 60 }, { x: 280, y: 945, height: 50 },
  { x: 365, y: 925, height: 56 }, { x: 470, y: 895, height: 66 },
  { x: 490, y: 390, height: 57 }, { x: 610, y: 590, height: 46 },
  { x: 565, y: 430, height: 52 }, { x: 625, y: 325, height: 53 },
  { x: 925, y: 210, height: 57 }, { x: 1020, y: 230, height: 62 },
  { x: 1175, y: 170, height: 60 }, { x: 1330, y: 385, height: 55 },
  { x: 1375, y: 420, height: 66 }, { x: 1365, y: 560, height: 52 },
  { x: 1100, y: 710, height: 61 }, { x: 970, y: 950, height: 65 },
].map(spot => ({ ...spot, height: Math.round(spot.height * 1.4) }));

export function createRoadsideTrees() {
  const root = new THREE.Group(); root.name = 'sapins-le-long-du-parcours';
  const trunkGeometry = new THREE.CylinderGeometry(2.7, 3.2, 24, 8);
  const crownGeometries = [new THREE.ConeGeometry(20, 42, 7), new THREE.ConeGeometry(15.5, 38, 7), new THREE.ConeGeometry(11.5, 34, 7)];
  const palette = [0x235f3a, 0x408449, 0x579548];
  const crowns = palette.map(color => new THREE.MeshStandardMaterial({ color, roughness: .92, flatShading: true }));
  const bark = new THREE.MeshStandardMaterial({ color: 0x806044, roughness: .95 });
  const shadeGeometry = new THREE.CircleGeometry(1, 24), shadeMaterial = new THREE.MeshBasicMaterial({ color: 0x3f4933, transparent: true, opacity: .12, depthWrite: false });
  const trees = TREE_SPOTS.map((spot, index) => {
    const tree = new THREE.Group(); tree.position.set(spot.x, 960 - spot.y, 0); tree.scale.setScalar(spot.height / 95);
    const shadow = new THREE.Mesh(shadeGeometry, shadeMaterial); shadow.position.set(spot.x + 3, 960 - spot.y - 1, -6); shadow.scale.set(spot.height * .28, spot.height * .065, 1); root.add(shadow);
    const trunk = new THREE.Mesh(trunkGeometry, bark); trunk.position.y = 12; tree.add(trunk);
    crownGeometries.forEach((geometry, layer) => {
      const crown = new THREE.Mesh(geometry, crowns[(layer + index % 2) % crowns.length]);
      crown.position.y = [34, 56, 78][layer]; crown.rotation.y = index * .7 + layer * .16; tree.add(crown);
    });
    root.add(tree); return tree;
  });
  function update(time) { trees.forEach((tree, index) => { tree.rotation.z = Math.sin(time * .95 + index * 1.7) * .045 + Math.sin(time * 1.8 + index) * .012; }); }
  update(0);
  return { root, trees, update };
}
