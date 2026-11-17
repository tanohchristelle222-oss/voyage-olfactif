import * as THREE from 'three';
// Cadre orthographique ajusté à chaque objet : aucun village minuscule au centre d'un grand canevas.
export function fitDecor(root, aspect) {
  const box = root.userData.framingBox?.clone() ?? new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 150);
  camera.position.copy(center).add(new THREE.Vector3(10, 9, 15).normalize().multiplyScalar(35));
  camera.lookAt(center); camera.updateMatrixWorld(true);
  const inverse = camera.matrixWorldInverse;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const p = new THREE.Vector3(x, y, z).applyMatrix4(inverse);
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const halfHeight = Math.max((maxY - minY) / 2, (maxX - minX) / (2 * aspect)) * 1.035;
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
  camera.left = midX - halfHeight * aspect; camera.right = midX + halfHeight * aspect;
  camera.top = midY + halfHeight; camera.bottom = midY - halfHeight; camera.updateProjectionMatrix();
  return camera;
}

