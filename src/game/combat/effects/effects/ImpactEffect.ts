import { Vector3, Object3D, Mesh, SphereGeometry, MeshStandardMaterial } from 'three';
import { CombatEffect, EffectOptions, EffectType } from '../types';

export class ImpactEffect implements CombatEffect {
  type: EffectType = EffectType.IMPACT;
  position: Vector3 = new Vector3();
  options: EffectOptions = {
    particleCount: 10,
    particleSize: 0.1,
    particleLifetime: 1.0,
    effectScale: 1.0,
    effectColor: '#ff0000',
    effectIntensity: 1.0
  };
  isActive: boolean = false;
  timeAlive: number = 0;
  private mesh: Mesh;
  private duration: number = 1.0;
  private scale: number = 1.0;

  constructor() {
    const geometry = new SphereGeometry(0.5, 16, 16);
    const material = new MeshStandardMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 1.0
    });
    this.mesh = new Mesh(geometry, material);
  }

  initialize(position: Vector3, options: any = {}): void {
    this.position.copy(position);
    this.mesh.position.copy(position);
    this.timeAlive = 0;
    this.scale = options.scale || 1.0;
    this.mesh.scale.set(this.scale, this.scale, this.scale);
  }

  update(deltaTime: number): void {
    this.timeAlive += deltaTime;
    const progress = this.timeAlive / this.duration;
    
    // Fade out effect
    const opacity = 1 - progress;
    (this.mesh.material as MeshStandardMaterial).opacity = opacity;
    
    // Shrink effect
    const currentScale = this.scale * (1 - progress);
    this.mesh.scale.set(currentScale, currentScale, currentScale);
  }

  isComplete(): boolean {
    return this.timeAlive >= this.duration;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    if (this.mesh.material instanceof MeshStandardMaterial) {
      this.mesh.material.dispose();
    }
    this.mesh.removeFromParent();
  }

  getObject(): Object3D {
    return this.mesh;
  }
} 