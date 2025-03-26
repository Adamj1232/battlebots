import * as THREE from 'three';
import { EventEmitter } from 'events';
import { CombatEvent, CombatVisualEffect } from './types';

interface EffectOptions {
  particleCount: number;
  particleSize: number;
  particleLifetime: number;
  effectScale: number;
  effectColor: THREE.Color;
  effectIntensity: number;
}

export class CombatEffects extends EventEmitter {
  private scene: THREE.Scene;
  private effects: Map<string, CombatVisualEffect> = new Map();
  private particleSystems: Map<string, THREE.Points> = new Map();
  private readonly MAX_PARTICLES = 1000;
  private readonly CHILD_FRIENDLY_COLORS = {
    damage: new THREE.Color(0xff4444),
    heal: new THREE.Color(0x44ff44),
    shield: new THREE.Color(0x4444ff),
    energy: new THREE.Color(0xffff44),
    transform: new THREE.Color(0xff44ff)
  };

  constructor(scene: THREE.Scene) {
    super();
    this.scene = scene;
    this.initializeParticleSystems();
  }

  private initializeParticleSystems(): void {
    // Create particle systems for different effect types
    const particleTypes = ['damage', 'heal', 'shield', 'energy', 'transform'];
    
    particleTypes.forEach(type => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.MAX_PARTICLES * 3);
      const colors = new Float32Array(this.MAX_PARTICLES * 3);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
      
      const points = new THREE.Points(geometry, material);
      this.scene.add(points);
      this.particleSystems.set(type, points);
    });
  }

  public handleCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'damage':
        this.createDamageEffect(event);
        break;
      case 'heal':
        this.createHealEffect(event);
        break;
      case 'effect':
        this.createStatusEffect(event);
        break;
      case 'transform':
        this.createTransformEffect(event);
        break;
      case 'victory':
        this.createVictoryEffect(event);
        break;
      case 'defeat':
        this.createDefeatEffect(event);
        break;
    }
  }

  private createDamageEffect(event: CombatEvent): void {
    if (!event.position) return;

    const effect: CombatVisualEffect = {
      type: 'damage',
      position: event.position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
      duration: 1.0,
      intensity: 1.0,
      color: this.CHILD_FRIENDLY_COLORS.damage,
      particleCount: 50,
      isChildFriendly: event.isChildFriendly
    };

    this.effects.set(`${event.type}-${Date.now()}`, effect);
    this.emitParticles(effect);
    this.createDamageNumber(event.amount || 0, event.position);
  }

  private createHealEffect(event: CombatEvent): void {
    if (!event.position) return;

    const effect: CombatVisualEffect = {
      type: 'heal',
      position: event.position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
      duration: 1.0,
      intensity: 1.0,
      color: this.CHILD_FRIENDLY_COLORS.heal,
      particleCount: 30,
      isChildFriendly: event.isChildFriendly
    };

    this.effects.set(`${event.type}-${Date.now()}`, effect);
    this.emitParticles(effect);
    this.createHealNumber(event.amount || 0, event.position);
  }

  private createStatusEffect(event: CombatEvent): void {
    if (!event.position) return;

    const effect: CombatVisualEffect = {
      type: 'effect',
      position: event.position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
      duration: 2.0,
      intensity: 1.0,
      color: this.CHILD_FRIENDLY_COLORS.shield,
      particleCount: 40,
      isChildFriendly: event.isChildFriendly
    };

    this.effects.set(`${event.type}-${Date.now()}`, effect);
    this.emitParticles(effect);
  }

  private createTransformEffect(event: CombatEvent): void {
    if (!event.position) return;

    const effect: CombatVisualEffect = {
      type: 'transform',
      position: event.position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(2, 2, 2),
      duration: 2.0,
      intensity: 1.0,
      color: this.CHILD_FRIENDLY_COLORS.transform,
      particleCount: 100,
      isChildFriendly: event.isChildFriendly
    };

    this.effects.set(`${event.type}-${Date.now()}`, effect);
    this.emitParticles(effect);
    this.createTransformRing(event.position);
  }

  private createVictoryEffect(event: CombatEvent): void {
    if (!event.position) return;

    const effect: CombatVisualEffect = {
      type: 'effect',
      position: event.position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(3, 3, 3),
      duration: 3.0,
      intensity: 1.0,
      color: this.CHILD_FRIENDLY_COLORS.energy,
      particleCount: 200,
      isChildFriendly: event.isChildFriendly
    };

    this.effects.set(`${event.type}-${Date.now()}`, effect);
    this.emitParticles(effect);
    this.createVictoryRing(event.position);
  }

  private createDefeatEffect(event: CombatEvent): void {
    if (!event.position) return;

    const effect: CombatVisualEffect = {
      type: 'effect',
      position: event.position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(2, 2, 2),
      duration: 2.0,
      intensity: 1.0,
      color: this.CHILD_FRIENDLY_COLORS.damage,
      particleCount: 150,
      isChildFriendly: event.isChildFriendly
    };

    this.effects.set(`${event.type}-${Date.now()}`, effect);
    this.emitParticles(effect);
    this.createDefeatRing(event.position);
  }

  private emitParticles(effect: CombatVisualEffect): void {
    const particleSystem = this.particleSystems.get(effect.type);
    if (!particleSystem) return;

    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    const colors = particleSystem.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < effect.particleCount; i++) {
      const i3 = i * 3;
      
      // Random position around effect center
      positions[i3] = effect.position.x + (Math.random() - 0.5) * effect.scale.x;
      positions[i3 + 1] = effect.position.y + (Math.random() - 0.5) * effect.scale.y;
      positions[i3 + 2] = effect.position.z + (Math.random() - 0.5) * effect.scale.z;

      // Set color
      colors[i3] = effect.color.r;
      colors[i3 + 1] = effect.color.g;
      colors[i3 + 2] = effect.color.b;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
  }

  private createDamageNumber(amount: number, position: THREE.Vector3): void {
    // Implementation for floating damage numbers
    // This would be handled by a separate UI system
  }

  private createHealNumber(amount: number, position: THREE.Vector3): void {
    // Implementation for floating heal numbers
    // This would be handled by a separate UI system
  }

  private createTransformRing(position: THREE.Vector3): void {
    // Implementation for transformation ring effect
    // This would create a circular particle effect
  }

  private createVictoryRing(position: THREE.Vector3): void {
    // Implementation for victory celebration ring
    // This would create an expanding ring of particles
  }

  private createDefeatRing(position: THREE.Vector3): void {
    // Implementation for defeat effect ring
    // This would create a contracting ring of particles
  }

  public update(deltaTime: number): void {
    // Update all active effects
    for (const [id, effect] of this.effects.entries()) {
      effect.duration -= deltaTime;
      
      if (effect.duration <= 0) {
        this.effects.delete(id);
      }
    }
  }

  public dispose(): void {
    // Clean up particle systems
    this.particleSystems.forEach(system => {
      this.scene.remove(system);
    });
    this.particleSystems.clear();
    this.effects.clear();
  }
} 