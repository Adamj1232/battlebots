import * as THREE from 'three';
import { CombatEffect, EffectType, EffectOptions } from './types';

export class SpecialAbilityEffect implements CombatEffect {
  type: EffectType = EffectType.ENERGY;
  position!: THREE.Vector3;
  options!: EffectOptions;
  isActive: boolean = true;
  timeAlive: number = 0;
  private mesh: THREE.Mesh;
  private particleSystem: THREE.Points;
  private ringMesh: THREE.Mesh;
  private group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    
    // Create main effect mesh
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.group.add(this.mesh);

    // Create particle system for energy particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.group.add(this.particleSystem);

    // Create ring mesh for energy field
    const ringGeometry = new THREE.RingGeometry(1, 1.5, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ringMesh.rotation.x = Math.PI / 2;
    this.group.add(this.ringMesh);
  }

  initialize(position: THREE.Vector3, options: EffectOptions): void {
    this.position = position;
    this.options = options;
    this.mesh.position.copy(position);
    this.particleSystem.position.copy(position);
    this.ringMesh.position.copy(position);
    this.initializeParticles();
  }

  private initializeParticles(): void {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Random position in a sphere
      const radius = 1 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random velocity
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    this.particleSystem.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleSystem.userData.velocities = velocities;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    this.timeAlive += deltaTime;

    // Update particle positions
    const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
    const velocities = this.particleSystem.userData.velocities as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Reset particles that go too far
      const distance = Math.sqrt(
        positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
      );
      if (distance > 2) {
        positions[i] = 0;
        positions[i + 1] = 0;
        positions[i + 2] = 0;
      }
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;

    // Animate ring
    this.ringMesh.rotation.z += deltaTime * 2;
    if (this.ringMesh.material instanceof THREE.Material) {
      this.ringMesh.material.opacity = 0.5 + Math.sin(this.timeAlive * 4) * 0.2;
    }

    // Fade out effect
    if (this.timeAlive > 2) {
      const fadeOut = Math.max(0, 1 - (this.timeAlive - 2));
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.opacity = 0.8 * fadeOut;
      }
      if (this.particleSystem.material instanceof THREE.Material) {
        this.particleSystem.material.opacity = 0.8 * fadeOut;
      }
      if (this.ringMesh.material instanceof THREE.Material) {
        this.ringMesh.material.opacity = 0.5 * fadeOut;
      }

      if (fadeOut === 0) {
        this.isActive = false;
      }
    }
  }

  isComplete(): boolean {
    return !this.isActive;
  }

  getObject(): THREE.Object3D {
    return this.group;
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
    this.ringMesh.geometry.dispose();
    if (this.ringMesh.material instanceof THREE.Material) {
      this.ringMesh.material.dispose();
    }
  }
} 