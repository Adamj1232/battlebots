import { Vector3, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import { CombatEffect, EffectOptions, EffectType } from './types.js';

export class ImpactEffect implements CombatEffect {
  public readonly type: EffectType = EffectType.IMPACT;
  public position: Vector3;
  public options: EffectOptions;
  public isActive: boolean;
  public timeAlive: number;
  
  private mesh: Mesh;
  private material: MeshBasicMaterial;
  private maxScale: number = 2;
  private fadeOutDuration: number = 0.5;
  private initialIntensity: number = 1;

  constructor() {
    this.position = new Vector3();
    this.options = {};
    this.isActive = false;
    this.timeAlive = 0;
    
    // Create the visual mesh
    const geometry = new SphereGeometry(0.1, 8, 8);
    this.material = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 1
    });
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.visible = false;
  }

  public initialize(position: Vector3, options: EffectOptions): void {
    this.position.copy(position);
    this.options = options;
    this.timeAlive = 0;
    this.isActive = true;
    
    // Configure effect based on options
    this.maxScale = options.scale || 2;
    this.fadeOutDuration = options.duration || 0.5;
    this.initialIntensity = options.intensity || 1;
    
    // Update mesh properties
    this.mesh.position.copy(position);
    this.mesh.scale.set(0.1, 0.1, 0.1);
    this.material.opacity = this.initialIntensity;
    this.mesh.visible = true;
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return;
    
    this.timeAlive += deltaTime;
    
    // Scale up effect
    const scale = Math.min(this.maxScale * (this.timeAlive / 0.2), this.maxScale);
    this.mesh.scale.set(scale, scale, scale);
    
    // Fade out
    const fadeProgress = Math.min(this.timeAlive / this.fadeOutDuration, 1);
    this.material.opacity = this.initialIntensity * (1 - fadeProgress);
  }

  public isComplete(): boolean {
    return this.timeAlive >= this.fadeOutDuration;
  }

  public dispose(): void {
    this.mesh.visible = false;
    this.isActive = false;
  }

  public getMesh(): Mesh {
    return this.mesh;
  }
} 