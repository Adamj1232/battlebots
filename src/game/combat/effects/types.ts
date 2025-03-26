import * as THREE from 'three';
import { Vector3, Object3D } from 'three';

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
  position: Vector3;
  options: EffectOptions;
  isActive: boolean;
  timeAlive: number;
  isComplete(): boolean;
  initialize(position: Vector3, options?: any): void;
  update(deltaTime: number): void;
  dispose(): void;
  getObject(): Object3D;
}

export interface EffectPool {
  acquire(): CombatEffect | null;
  release(effect: CombatEffect): void;
  dispose(): void;
} 