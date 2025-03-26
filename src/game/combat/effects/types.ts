import * as THREE from 'three';

export enum EffectType {
  IMPACT = 'impact',
  ENERGY = 'energy',
  STATUS = 'status',
  TRANSFORM = 'transform',
  WEAPON_TRAIL = 'weapon_trail',
  ENVIRONMENTAL = 'environmental'
}

export interface EffectOptions {
  particleCount: number;
  particleSize: number;
  particleLifetime: number;
  effectScale: number;
  effectColor: THREE.Color | string;
  effectIntensity: number;
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
}

export interface CombatEffect {
  type: EffectType;
  position: THREE.Vector3;
  options: EffectOptions;
  isActive: boolean;
  timeAlive: number;
  
  initialize(position: THREE.Vector3, options: EffectOptions): void;
  update(deltaTime: number): void;
  isComplete(): boolean;
  dispose(): void;
  getObject(): THREE.Object3D;
} 