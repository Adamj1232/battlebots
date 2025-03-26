import * as THREE from 'three';
import { EventEmitter } from 'events';
import { CombatEvent, CombatResult } from './types';

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
  private particleSystems: Map<THREE.Points, EffectOptions>;
  private meshEffects: Map<THREE.Object3D, EffectOptions>;
  private effectOptions: Map<string, EffectOptions>;
  private effectPool: Map<string, THREE.Points[]>;
  private maxPoolSize: number;

  constructor(scene: THREE.Scene) {
    super();
    this.scene = scene;
    this.particleSystems = new Map();
    this.meshEffects = new Map();
    this.effectOptions = new Map();
    this.effectPool = new Map();
    this.maxPoolSize = 20;
    this.initializeEffectOptions();
  }

  private initializeEffectOptions(): void {
    // Impact effects
    this.effectOptions.set('impact', {
      particleCount: 20,
      particleSize: 0.1,
      particleLifetime: 1,
      effectScale: 1,
      effectColor: new THREE.Color(0xff8800),
      effectIntensity: 1
    });

    // Energy effects
    this.effectOptions.set('energy', {
      particleCount: 30,
      particleSize: 0.15,
      particleLifetime: 1.5,
      effectScale: 1.2,
      effectColor: new THREE.Color(0x00ffff),
      effectIntensity: 1.2
    });

    // Status effect indicators
    this.effectOptions.set('stun', {
      particleCount: 15,
      particleSize: 0.08,
      particleLifetime: 2,
      effectScale: 1.5,
      effectColor: new THREE.Color(0xffff00),
      effectIntensity: 0.8
    });

    this.effectOptions.set('burn', {
      particleCount: 25,
      particleSize: 0.12,
      particleLifetime: 1.2,
      effectScale: 1.3,
      effectColor: new THREE.Color(0xff0000),
      effectIntensity: 1.1
    });

    this.effectOptions.set('freeze', {
      particleCount: 20,
      particleSize: 0.1,
      particleLifetime: 1.5,
      effectScale: 1.4,
      effectColor: new THREE.Color(0x00ffff),
      effectIntensity: 0.9
    });

    // Transform effect
    this.effectOptions.set('transform', {
      particleCount: 32,
      particleSize: 0.1,
      particleLifetime: 1,
      effectScale: 1,
      effectColor: new THREE.Color(0x00ffff),
      effectIntensity: 0.1
    });
  }

  public handleCombatEvent(event: CombatEvent): void {
    if (!event.position) return;

    switch (event.type) {
      case 'damage':
        this.createImpactEffect(event.position);
        break;
      case 'ability':
        this.createEnergyEffect(event.position);
        break;
      case 'effect':
        if (event.effect) {
          this.createStatusEffect(event.position, event.effect.type);
        }
        break;
      case 'transform':
        this.createTransformEffect(event.position);
        break;
      case 'victory':
        this.createVictoryEffect(event.position);
        break;
      case 'defeat':
        this.createDefeatEffect(event.position);
        break;
    }
  }

  private createImpactEffect(position: THREE.Vector3): void {
    const options = this.effectOptions.get('impact');
    if (!options) return;

    const particles = this.createParticleSystem(options);
    particles.position.copy(position);
    this.scene.add(particles);

    // Remove particles after lifetime
    setTimeout(() => {
      this.scene.remove(particles);
      this.recycleEffect(particles);
    }, options.particleLifetime * 1000);
  }

  private createEnergyEffect(position: THREE.Vector3): void {
    const options = this.effectOptions.get('energy');
    if (!options) return;

    const particles = this.createParticleSystem(options);
    particles.position.copy(position);
    this.scene.add(particles);

    // Remove particles after lifetime
    setTimeout(() => {
      this.scene.remove(particles);
      this.recycleEffect(particles);
    }, options.particleLifetime * 1000);
  }

  private createStatusEffect(position: THREE.Vector3, type: string): void {
    const options = this.effectOptions.get(type);
    if (!options) return;

    const particles = this.createParticleSystem(options);
    particles.position.copy(position);
    this.scene.add(particles);

    // Remove particles after lifetime
    setTimeout(() => {
      this.scene.remove(particles);
      this.recycleEffect(particles);
    }, options.particleLifetime * 1000);
  }

  private createTransformEffect(position: THREE.Vector3): void {
    // Create a ring mesh using a circle geometry and line material
    const segments = 32;
    const radius = 0.5;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * radius,
        Math.sin(theta) * radius,
        0
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });

    const ring = new THREE.Line(geometry, material);
    ring.position.copy(position);
    this.scene.add(ring);
    this.meshEffects.set(ring, this.effectOptions.get('transform')!);

    const options = this.effectOptions.get('transform')!;
    const duration = options.particleLifetime * 1000;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        ring.scale.set(1 + progress * 2, 1 + progress * 2, 1);
        ring.material.opacity = 0.8 * (1 - progress);
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(ring);
        this.recycleEffect(ring);
      }
    };

    animate();
  }

  private createVictoryEffect(position: THREE.Vector3): void {
    // Create a burst of particles in victory colors
    const colors = [0x00ff00, 0xffff00, 0xff00ff];
    colors.forEach((color, index) => {
      const options = {
        particleCount: 30,
        particleSize: 0.15,
        particleLifetime: 2,
        effectScale: 1.5,
        effectColor: new THREE.Color(color),
        effectIntensity: 1.2
      };

      const particles = this.createParticleSystem(options);
      particles.position.copy(position);
      this.scene.add(particles);

      setTimeout(() => {
        this.scene.remove(particles);
        this.recycleEffect(particles);
      }, options.particleLifetime * 1000);
    });
  }

  private createDefeatEffect(position: THREE.Vector3): void {
    // Create a dark, dissipating effect
    const options = {
      particleCount: 40,
      particleSize: 0.2,
      particleLifetime: 2,
      effectScale: 2,
      effectColor: new THREE.Color(0x000000),
      effectIntensity: 1.5
    };

    const particles = this.createParticleSystem(options);
    particles.position.copy(position);
    this.scene.add(particles);

    setTimeout(() => {
      this.scene.remove(particles);
      this.recycleEffect(particles);
    }, options.particleLifetime * 1000);
  }

  private createParticleSystem(options: EffectOptions): THREE.Points {
    // Convert color to hex string
    const colorHex = options.effectColor instanceof THREE.Color 
      ? '#' + options.effectColor.getHexString()
      : options.effectColor;

    // Try to get a recycled particle system
    const recycled = this.getRecycledParticleSystem(colorHex);
    if (recycled) {
      return recycled;
    }

    // Create new particle system
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(options.particleCount * 3);
    const velocities = new Float32Array(options.particleCount * 3);
    const lifetimes = new Float32Array(options.particleCount);

    // Initialize particles
    for (let i = 0; i < options.particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * options.particleSize;
      positions[i3 + 1] = (Math.random() - 0.5) * options.particleSize;
      positions[i3 + 2] = (Math.random() - 0.5) * options.particleSize;

      velocities[i3] = (Math.random() - 0.5) * options.effectIntensity;
      velocities[i3 + 1] = (Math.random() - 0.5) * options.effectIntensity;
      velocities[i3 + 2] = (Math.random() - 0.5) * options.effectIntensity;

      lifetimes[i] = Math.random() * options.particleLifetime;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
      size: options.particleSize,
      color: options.effectColor,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    points.userData = {
      type: 'particleSystem',
      options,
      velocities,
      lifetimes,
      maxLifetime: options.particleLifetime
    };

    this.particleSystems.set(points, options);
    return points;
  }

  private animateParticleSystem(points: THREE.Points, options: EffectOptions): void {
    const positions = points.geometry.getAttribute('position');
    const velocities = points.geometry.getAttribute('velocity');
    const lifetimes = points.geometry.getAttribute('lifetime');

    const animate = () => {
      for (let i = 0; i < options.particleCount; i++) {
        const i3 = i * 3;
        lifetimes.setX(i, lifetimes.getX(i) - 0.016); // Assuming 60fps

        if (lifetimes.getX(i) > 0) {
          positions.setX(i3, positions.getX(i3) + velocities.getX(i3));
          positions.setY(i3 + 1, positions.getY(i3 + 1) + velocities.getY(i3 + 1));
          positions.setZ(i3 + 2, positions.getZ(i3 + 2) + velocities.getZ(i3 + 2));
        }
      }

      positions.needsUpdate = true;
      lifetimes.needsUpdate = true;

      if (lifetimes.getX(0) > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private getRecycledParticleSystem(colorHex: string): THREE.Points | null {
    const recycled = this.effectPool.get(colorHex);
    if (recycled && recycled.length > 0) {
      const system = recycled.pop()!;
      system.visible = true;
      return system;
    }
    return null;
  }

  private recycleParticleSystem(system: THREE.Points, colorHex: string): void {
    if (!this.effectPool.has(colorHex)) {
      this.effectPool.set(colorHex, []);
    }
    const pool = this.effectPool.get(colorHex)!;
    
    if (pool.length < this.maxPoolSize) {
      system.visible = false;
      pool.push(system);
    } else {
      system.geometry.dispose();
      if (system.material instanceof THREE.Material) {
        system.material.dispose();
      } else {
        system.material.forEach((m: THREE.Material) => m.dispose());
      }
      system.removeFromParent();
    }
  }

  private recycleEffect(system: THREE.Points | THREE.Object3D): void {
    if (system instanceof THREE.Points) {
      const options = this.particleSystems.get(system);
      if (options) {
        const colorHex = options.effectColor instanceof THREE.Color 
          ? '#' + options.effectColor.getHexString()
          : options.effectColor;
        this.recycleParticleSystem(system, colorHex);
        this.particleSystems.delete(system);
      }
    } else {
      const options = this.meshEffects.get(system);
      if (options) {
        if (system instanceof THREE.Mesh || system instanceof THREE.Line) {
          system.geometry.dispose();
          if (system.material instanceof THREE.Material) {
            system.material.dispose();
          } else {
            system.material.forEach((m: THREE.Material) => m.dispose());
          }
        }
        system.removeFromParent();
        this.meshEffects.delete(system);
      }
    }
  }

  private updateParticleSystem(system: THREE.Points, deltaTime: number): void {
    const positions = system.geometry.getAttribute('position');
    const velocities = system.geometry.getAttribute('velocity');
    const lifetimes = system.geometry.getAttribute('lifetime');

    const positionsArray = positions.array as Float32Array;
    const velocitiesArray = velocities.array as Float32Array;
    const lifetimesArray = lifetimes.array as Float32Array;

    for (let i = 0; i < lifetimesArray.length; i++) {
      lifetimesArray[i] += deltaTime;

      if (lifetimesArray[i] >= system.userData.maxLifetime) {
        // Reset particle
        const i3 = i * 3;
        positionsArray[i3] = (Math.random() - 0.5) * system.userData.options.particleSize;
        positionsArray[i3 + 1] = (Math.random() - 0.5) * system.userData.options.particleSize;
        positionsArray[i3 + 2] = (Math.random() - 0.5) * system.userData.options.particleSize;

        velocitiesArray[i3] = (Math.random() - 0.5) * system.userData.options.effectIntensity;
        velocitiesArray[i3 + 1] = (Math.random() - 0.5) * system.userData.options.effectIntensity;
        velocitiesArray[i3 + 2] = (Math.random() - 0.5) * system.userData.options.effectIntensity;

        lifetimesArray[i] = 0;
      } else {
        // Update position based on velocity
        const i3 = i * 3;
        positionsArray[i3] += velocitiesArray[i3] * deltaTime;
        positionsArray[i3 + 1] += velocitiesArray[i3 + 1] * deltaTime;
        positionsArray[i3 + 2] += velocitiesArray[i3 + 2] * deltaTime;
      }
    }

    positions.needsUpdate = true;
    velocities.needsUpdate = true;
    lifetimes.needsUpdate = true;
  }

  public update(deltaTime: number): void {
    this.particleSystems.forEach((options, system) => {
      this.updateParticleSystem(system, deltaTime);
    });
  }

  public dispose(): void {
    // Clean up particle systems
    this.particleSystems.forEach((options, system) => {
      system.geometry.dispose();
      if (system.material instanceof THREE.Material) {
        system.material.dispose();
      } else {
        system.material.forEach((m: THREE.Material) => m.dispose());
      }
      system.removeFromParent();
    });

    // Clean up mesh effects
    this.meshEffects.forEach((options, mesh) => {
      if (mesh instanceof THREE.Mesh || mesh instanceof THREE.Line) {
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        } else {
          mesh.material.forEach((m: THREE.Material) => m.dispose());
        }
      }
      mesh.removeFromParent();
    });

    // Clean up effect pool
    this.effectPool.forEach((pool, colorHex) => {
      pool.forEach(system => {
        system.geometry.dispose();
        if (system.material instanceof THREE.Material) {
          system.material.dispose();
        } else {
          system.material.forEach((m: THREE.Material) => m.dispose());
        }
        system.removeFromParent();
      });
    });

    this.particleSystems.clear();
    this.meshEffects.clear();
    this.effectPool.clear();
  }
} 