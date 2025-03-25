import * as THREE from 'three';
import { PhysicsBody } from '../physics/PhysicsBody';
import { PhysicsEngine } from '../physics/PhysicsEngine';

export interface DestructibleConfig {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  maxHealth: number;
  type: 'crate' | 'barrier' | 'wall';
}

export class DestructibleObject {
  private mesh: THREE.Group;
  private physicsBody: PhysicsBody;
  private maxHealth: number;
  private currentHealth: number;
  private destroyed: boolean = false;
  private debrisObjects: THREE.Object3D[] = [];
  private debrisBodies: PhysicsBody[] = [];

  constructor(engine: PhysicsEngine, config: DestructibleConfig) {
    this.maxHealth = config.maxHealth;
    this.currentHealth = config.maxHealth;

    // Create visual representation
    this.mesh = this.createMeshForType(config.type);
    this.mesh.position.copy(config.position);
    if (config.rotation) {
      this.mesh.rotation.copy(config.rotation);
    }
    if (config.scale) {
      this.mesh.scale.copy(config.scale);
    }

    // Create physics body
    this.physicsBody = new PhysicsBody(this.mesh, engine, {
      mass: 0,
      shape: 'box',
      dimensions: new THREE.Vector3(1, 1, 1).multiply(this.mesh.scale),
      friction: 0.5,
      restitution: 0.2
    });
  }

  private createMeshForType(type: string): THREE.Group {
    const group = new THREE.Group();

    switch (type) {
      case 'crate':
        const crateGeometry = new THREE.BoxGeometry(1, 1, 1);
        const crateMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const crateMesh = new THREE.Mesh(crateGeometry, crateMaterial);
        group.add(crateMesh);
        break;

      case 'barrier':
        const barrierGeometry = new THREE.BoxGeometry(2, 1, 0.5);
        const barrierMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const barrierMesh = new THREE.Mesh(barrierGeometry, barrierMaterial);
        group.add(barrierMesh);
        break;

      case 'wall':
        const wallGeometry = new THREE.BoxGeometry(2, 3, 0.5);
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xA0A0A0 });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        group.add(wallMesh);
        break;
    }

    return group;
  }

  public takeDamage(amount: number): void {
    if (this.destroyed) return;

    this.currentHealth -= amount;
    
    // Visual feedback
    this.mesh.scale.setScalar(0.95);
    setTimeout(() => {
      if (!this.destroyed) {
        this.mesh.scale.setScalar(1);
      }
    }, 100);

    if (this.currentHealth <= 0) {
      this.destroy();
    }
  }

  private destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    // Create debris
    const debrisCount = 5;
    const originalGeometry = (this.mesh.children[0] as THREE.Mesh).geometry;
    const originalMaterial = (this.mesh.children[0] as THREE.Mesh).material;

    for (let i = 0; i < debrisCount; i++) {
      const debrisGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const debrisMesh = new THREE.Mesh(debrisGeometry, originalMaterial);
      
      // Position debris around the original object
      const angle = (i / debrisCount) * Math.PI * 2;
      const radius = 0.5;
      debrisMesh.position.set(
        this.mesh.position.x + Math.cos(angle) * radius,
        this.mesh.position.y,
        this.mesh.position.z + Math.sin(angle) * radius
      );

      // Add physics to debris
      const debrisBody = new PhysicsBody(debrisMesh, this.physicsBody.getEngine(), {
        mass: 1,
        shape: 'box',
        dimensions: new THREE.Vector3(0.3, 0.3, 0.3),
        friction: 0.5,
        restitution: 0.5
      });

      // Apply random force
      const force = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        5 + Math.random() * 5,
        (Math.random() - 0.5) * 10
      );
      debrisBody.applyImpulse(force);

      this.debrisObjects.push(debrisMesh);
      this.debrisBodies.push(debrisBody);
    }

    // Hide original mesh and disable physics
    this.mesh.visible = false;
    this.physicsBody.setEnabled(false);

    // Clean up debris after delay
    setTimeout(() => {
      this.cleanup();
    }, 5000);
  }

  private cleanup(): void {
    // Remove debris
    this.debrisObjects.forEach((debris, index) => {
      debris.parent?.remove(debris);
      (debris as THREE.Mesh).geometry.dispose();
      this.debrisBodies[index].dispose();
    });
    this.debrisObjects = [];
    this.debrisBodies = [];
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public dispose(): void {
    this.cleanup();
    this.mesh.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.physicsBody.dispose();
  }
} 