
import * as THREE from 'three';

export class WalkableArea {
  private root: THREE.Object3D;
  private meshes: THREE.Mesh[] = [];
  private raycaster = new THREE.Raycaster();

  constructor(root: THREE.Object3D) {
    this.root = root;

    console.log('[WalkableArea] Root:', root);
    console.log('[WalkableArea] Root name:', root.name);
    console.log('[WalkableArea] Root type:', root.type);
    console.log('[WalkableArea] Children:', root.children);

    root.updateMatrixWorld(true);

    root.traverse((object) => {
      const mesh = object as THREE.Mesh;

      console.log(
        '[WalkableArea] Node:',
        object.name,
        '| Type:',
        object.type,
        '| IsMesh:',
        mesh.isMesh,
      );

      if (mesh.isMesh && mesh.geometry) {
        this.meshes.push(mesh);
      }
    });

    console.log('[WalkableArea] Mesh count:', this.meshes.length);
    console.log(
      '[WalkableArea] Mesh names:',
      this.meshes.map((mesh) => mesh.name),
    );

    if (this.meshes.length > 0) {
      this.testRaycast();
    }
  }

  private testRaycast(): void {
    const firstMesh = this.meshes[0];
    const box = new THREE.Box3().setFromObject(firstMesh);
    const center = box.getCenter(new THREE.Vector3());

    const origin = new THREE.Vector3(
      center.x,
      box.max.y + 10,
      center.z,
    );

    this.raycaster.set(
      origin,
      new THREE.Vector3(0, -1, 0),
    );

    this.raycaster.far = 100;

    const hits = this.raycaster.intersectObjects(
      this.meshes,
      false,
    );

    console.log('[WalkableArea] Raycast test:', {
      meshName: firstMesh.name,
      bounds: {
        min: box.min,
        max: box.max,
      },
      origin,
      hitCount: hits.length,
      firstHit: hits[0] ?? null,
    });
  }

  getSupportedHeight(
    position: THREE.Vector3,
  ): number | null {
    if (this.meshes.length === 0) {
      return null;
    }

    this.root.updateMatrixWorld(true);

    const origin = new THREE.Vector3(
      position.x,
      position.y + 10,
      position.z,
    );

    this.raycaster.set(
      origin,
      new THREE.Vector3(0, -1, 0),
    );

    this.raycaster.far = 100;

    const hits = this.raycaster.intersectObjects(
      this.meshes,
      false,
    );

    const hit = hits.find(
      (item) => item.face && item.face.normal.y > 0.5,
    );

    return hit ? hit.point.y : null;
  }

  isWalkable(position: THREE.Vector3): boolean {
    return this.getSupportedHeight(position) !== null;
  }
}
