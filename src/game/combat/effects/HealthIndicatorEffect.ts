import * as THREE from 'three';
import { CombatEffect, EffectType, EffectOptions } from './types';

export class HealthIndicatorEffect implements CombatEffect {
  type: EffectType = EffectType.STATUS;
  position!: THREE.Vector3;
  options!: EffectOptions;
  isActive: boolean = true;
  timeAlive: number = 0;
  private healthBar: THREE.Mesh;
  private damageText: THREE.Sprite;
  private group: THREE.Group;
  private currentHealth: number = 100;
  private maxHealth: number = 100;

  constructor() {
    this.group = new THREE.Group();

    // Create health bar background
    const backgroundGeometry = new THREE.PlaneGeometry(2, 0.2);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5
    });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    this.group.add(background);

    // Create health bar
    const healthGeometry = new THREE.PlaneGeometry(2, 0.2);
    const healthMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
    this.group.add(this.healthBar);

    // Create damage text sprite
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    context.font = 'bold 48px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('0', 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0
    });
    this.damageText = new THREE.Sprite(spriteMaterial);
    this.damageText.scale.set(1, 0.25, 1);
    this.damageText.position.y = 0.3;
    this.group.add(this.damageText);
  }

  initialize(position: THREE.Vector3, options: EffectOptions): void {
    this.position = position;
    this.options = options;
    this.group.position.copy(position);
    this.group.lookAt(new THREE.Vector3(0, 0, 0));
  }

  setHealth(current: number, max: number): void {
    this.currentHealth = current;
    this.maxHealth = max;
    const healthPercent = current / max;
    this.healthBar.scale.x = healthPercent;
    if (this.healthBar.material instanceof THREE.MeshBasicMaterial) {
      this.healthBar.material.color.setHex(
        healthPercent > 0.6 ? 0x00ff00 :
        healthPercent > 0.3 ? 0xffff00 :
        0xff0000
      );
    }
  }

  showDamage(amount: number): void {
    if (!this.damageText.material || !this.damageText.material.map) return;
    
    const canvas = this.damageText.material.map.image as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 48px Arial';
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`-${amount}`, 128, 32);
    this.damageText.material.map.needsUpdate = true;
    this.damageText.material.opacity = 1;
    this.timeAlive = 0;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    this.timeAlive += deltaTime;

    // Fade out damage text
    if (this.damageText.material && this.damageText.material.opacity > 0) {
      this.damageText.material.opacity = Math.max(0, 1 - this.timeAlive);
    }
  }

  isComplete(): boolean {
    return false; // Health indicator stays active
  }

  getObject(): THREE.Object3D {
    return this.group;
  }

  dispose(): void {
    this.healthBar.geometry.dispose();
    if (this.healthBar.material instanceof THREE.Material) {
      this.healthBar.material.dispose();
    }
    if (this.damageText.material instanceof THREE.Material) {
      this.damageText.material.dispose();
    }
  }
} 