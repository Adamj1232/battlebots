import * as THREE from 'three';
import { PhysicsBody } from '../physics/PhysicsBody';
import { PhysicsEngine } from '../physics/PhysicsEngine';

export type CollectibleType = 'energon' | 'repair' | 'powerup';

export interface CollectibleConfig {
  type: CollectibleType;
  value: number;
  position: THREE.Vector3;
  rotation?: THREE.Euler;
}

export class Collectible {
  private mesh: THREE.Mesh;
  private physicsBody: PhysicsBody;
  private type: CollectibleType;
  private value: number;
  private collected: boolean = false;
  private floatAnimation: boolean = true;
  private initialY: number;

  constructor(engine: PhysicsEngine, config: CollectibleConfig) {
    this.type = config.type;
    this.value = config.value;
    this.initialY = config.position.y;

    // Create visual representation
    const geometry = this.getGeometryForType(config.type);
    const material = this.getMaterialForType(config.type);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(config.position);
    if (config.rotation) {
      this.mesh.rotation.copy(config.rotation);
    }

    // Create physics body (trigger volume)
    this.physicsBody = new PhysicsBody(this.mesh, engine, {
      mass: 0,
      shape: 'sphere',
      dimensions: new THREE.Vector3(0.5, 0.5, 0.5),
      isTrigger: true
    });
  }

  private getGeometryForType(type: CollectibleType): THREE.BufferGeometry {
    switch (type) {
      case 'energon':
        return new THREE.OctahedronGeometry(0.5);
      case 'repair':
        return new THREE.BoxGeometry(0.5, 0.5, 0.5);
      case 'powerup':
        return new THREE.SphereGeometry(0.5);
      default:
        return new THREE.SphereGeometry(0.5);
    }
  }

  private getMaterialForType(type: CollectibleType): THREE.Material {
    switch (type) {
      case 'energon':
        return new THREE.MeshPhongMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.5
        });
      case 'repair':
        return new THREE.MeshPhongMaterial({
          color: 0xff0000,
          emissive: 0xff0000,
          emissiveIntensity: 0.5
        });
      case 'powerup':
        return new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5
        });
      default:
        return new THREE.MeshPhongMaterial({ color: 0xffffff });
    }
  }

  public update(deltaTime: number): void {
    if (this.collected) return;

    if (this.floatAnimation) {
      const floatOffset = Math.sin(Date.now() * 0.002) * 0.2;
      this.mesh.position.y = this.initialY + floatOffset;
    }

    this.mesh.rotation.y += deltaTime;
  }

  public collect(): { type: CollectibleType; value: number } {
    if (this.collected) return { type: this.type, value: 0 };
    
    this.collected = true;
    this.mesh.visible = false;
    this.physicsBody.setEnabled(false);
    
    return {
      type: this.type,
      value: this.value
    };
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public dispose(): void {
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    if (this.mesh.material) {
      (this.mesh.material as THREE.Material).dispose();
    }
    this.physicsBody.dispose();
  }
} 