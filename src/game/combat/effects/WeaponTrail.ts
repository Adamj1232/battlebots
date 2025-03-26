import * as THREE from 'three';
import { CombatEffect, EffectType, EffectOptions } from './types';

export class WeaponTrail implements CombatEffect {
  type: EffectType = EffectType.WEAPON_TRAIL;
  position!: THREE.Vector3;
  options!: EffectOptions;
  isActive: boolean = true;
  timeAlive: number = 0;
  private trail: THREE.Line;
  private points: THREE.Vector3[] = [];
  private maxPoints: number = 10;

  constructor() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    this.trail = new THREE.Line(geometry, material);
  }

  initialize(position: THREE.Vector3, options: EffectOptions): void {
    this.position = position;
    this.options = options;
    this.points = [position.clone()];
    this.updateTrailGeometry();
  }

  update(deltaTime: number): void {
    this.timeAlive += deltaTime;
    
    // Add new point at current position
    this.points.push(this.position.clone());
    
    // Remove old points if we exceed maxPoints
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }

    // Fade out trail
    const opacity = Math.max(0, 1 - (this.timeAlive / this.options.particleLifetime));
    (this.trail.material as THREE.LineBasicMaterial).opacity = opacity;

    this.updateTrailGeometry();

    // Deactivate when fully faded
    if (opacity <= 0) {
      this.isActive = false;
    }
  }

  private updateTrailGeometry(): void {
    const positions = new Float32Array(this.points.length * 3);
    this.points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });

    this.trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.trail.geometry.attributes.position.needsUpdate = true;
  }

  isComplete(): boolean {
    return !this.isActive;
  }

  dispose(): void {
    this.trail.geometry.dispose();
    if (this.trail.material instanceof THREE.Material) {
      this.trail.material.dispose();
    }
  }

  getObject(): THREE.Object3D {
    return this.trail;
  }
} 