import { Object3D, Vector3, Box3, Mesh, MeshStandardMaterial, Euler } from 'three';
import { PhysicsEngine } from './PhysicsEngine';
import { PhysicsConfig } from './types';

interface DestructibleObject {
  mesh: Mesh;
  originalPosition: Vector3;
  originalRotation: Euler;
  health: number;
  fragments: Mesh[];
  isDestroyed: boolean;
}

export class EnvironmentDestruction {
  private scene: Object3D;
  private physicsEngine: PhysicsEngine;
  private destructibles: Map<string, DestructibleObject> = new Map();
  private readonly FRAGMENT_COUNT = 5;
  private readonly MIN_DAMAGE_THRESHOLD = 20;

  constructor(scene: Object3D, physicsEngine: PhysicsEngine) {
    this.scene = scene;
    this.physicsEngine = physicsEngine;
  }

  public registerDestructible(id: string, mesh: Mesh, health: number = 100): void {
    const destructible: DestructibleObject = {
      mesh,
      originalPosition: mesh.position.clone(),
      originalRotation: mesh.rotation.clone(),
      health,
      fragments: [],
      isDestroyed: false
    };

    this.destructibles.set(id, destructible);
  }

  public applyDamage(id: string, damage: number, impactPoint: Vector3): void {
    const destructible = this.destructibles.get(id);
    if (!destructible || destructible.isDestroyed) return;

    destructible.health -= damage;

    if (destructible.health <= 0) {
      this.destroyObject(id, impactPoint);
    } else if (damage >= this.MIN_DAMAGE_THRESHOLD) {
      this.createDamageEffect(destructible, impactPoint);
    }
  }

  private destroyObject(id: string, impactPoint: Vector3): void {
    const destructible = this.destructibles.get(id);
    if (!destructible) return;

    // Create fragments
    this.createFragments(destructible, impactPoint);

    // Hide original mesh
    destructible.mesh.visible = false;
    destructible.isDestroyed = true;

    // Add physics bodies for fragments
    destructible.fragments.forEach(fragment => {
      this.physicsEngine.addRigidBody(fragment, {
        mass: 1,
        position: fragment.position,
        rotation: fragment.rotation,
        friction: 0.5,
        restitution: 0.3,
        linearDamping: 0.5,
        angularDamping: 0.5,
        constraints: { iterations: 10, tolerance: 0.001 },
        allowSleep: true
      });
    });
  }

  private createFragments(destructible: DestructibleObject, impactPoint: Vector3): void {
    const geometry = destructible.mesh.geometry;
    const material = (destructible.mesh.material as MeshStandardMaterial).clone();

    // Create bounding box for fragment sizing
    const box = new Box3().setFromObject(destructible.mesh);
    const size = box.getSize(new Vector3());
    const fragmentSize = size.divideScalar(this.FRAGMENT_COUNT);

    // Create fragments
    for (let i = 0; i < this.FRAGMENT_COUNT; i++) {
      const fragment = new Mesh(geometry, material);
      fragment.scale.copy(fragmentSize);
      
      // Position fragment
      const offset = new Vector3(
        (Math.random() - 0.5) * size.x,
        (Math.random() - 0.5) * size.y,
        (Math.random() - 0.5) * size.z
      );
      fragment.position.copy(destructible.mesh.position).add(offset);

      // Apply impulse from impact point
      const impulse = fragment.position.clone().sub(impactPoint).normalize();
      fragment.userData.impulse = impulse.multiplyScalar(10);

      destructible.fragments.push(fragment);
      this.scene.add(fragment);
    }
  }

  private createDamageEffect(destructible: DestructibleObject, impactPoint: Vector3): void {
    // Create visual damage effect (cracks, dents, etc.)
    const material = destructible.mesh.material as MeshStandardMaterial;
    material.roughness = Math.min(1, material.roughness + 0.2);
    material.metalness = Math.max(0, material.metalness - 0.1);

    // Add small random rotation for visual effect
    destructible.mesh.rotation.x += (Math.random() - 0.5) * 0.1;
    destructible.mesh.rotation.y += (Math.random() - 0.5) * 0.1;
    destructible.mesh.rotation.z += (Math.random() - 0.5) * 0.1;
  }

  public reset(): void {
    this.destructibles.forEach(destructible => {
      // Restore original mesh
      destructible.mesh.visible = true;
      destructible.mesh.position.copy(destructible.originalPosition);
      destructible.mesh.rotation.copy(destructible.originalRotation);

      // Remove fragments
      destructible.fragments.forEach(fragment => {
        this.scene.remove(fragment);
        this.physicsEngine.removeBody(fragment);
      });
      destructible.fragments = [];

      // Reset state
      destructible.health = 100;
      destructible.isDestroyed = false;
    });
  }
} 