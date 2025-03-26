import * as THREE from 'three';
import { CombatEffect, EffectType, EffectOptions } from './types';

export class EnvironmentalEffect implements CombatEffect {
  type: EffectType = EffectType.ENVIRONMENTAL;
  position!: THREE.Vector3;
  options!: EffectOptions;
  isActive: boolean = true;
  timeAlive: number = 0;
  private mesh: THREE.Mesh;
  private particleSystem: THREE.Points;

  constructor() {
    // Create ground impact mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x808080,
      transparent: true,
      opacity: 0.8
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;

    // Create particle system for debris
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  }

  initialize(position: THREE.Vector3, options: EffectOptions): void {
    this.position = position;
    this.options = options;
    
    // Position the effect
    this.mesh.position.copy(position);
    this.particleSystem.position.copy(position);
    
    // Initialize particles
    this.initializeParticles();
  }

  private initializeParticles(): void {
    const particleCount = this.options.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random position in a circle
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.options.effectScale;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 0.5; // Slight upward spread
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Random velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = Math.random() * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    const geometry = this.particleSystem.geometry as THREE.BufferGeometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  }

  update(deltaTime: number): void {
    this.timeAlive += deltaTime;

    // Update particle positions
    const positions = (this.particleSystem.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
    const velocities = (this.particleSystem.geometry as THREE.BufferGeometry).attributes.velocity.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Apply gravity
      velocities[i + 1] -= 9.81 * deltaTime;
    }

    (this.particleSystem.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;

    // Fade out effect
    const opacity = Math.max(0, 1 - (this.timeAlive / this.options.particleLifetime));
    (this.mesh.material as THREE.Material).opacity = opacity;
    (this.particleSystem.material as THREE.Material).opacity = opacity;

    if (opacity <= 0) {
      this.isActive = false;
    }
  }

  isComplete(): boolean {
    return !this.isActive;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }
    this.particleSystem.geometry.dispose();
    if (this.particleSystem.material instanceof THREE.Material) {
      this.particleSystem.material.dispose();
    }
  }

  getObject(): THREE.Object3D {
    const group = new THREE.Group();
    group.add(this.mesh);
    group.add(this.particleSystem);
    return group;
  }
} 