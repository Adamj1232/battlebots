import { Vector3 } from 'three';

export enum EffectType {
  IMPACT = 'IMPACT',
  WEAPON_TRAIL = 'WEAPON_TRAIL',
  STATUS_EFFECT = 'STATUS_EFFECT',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  TRANSFORMATION = 'TRANSFORMATION',
  SPECIAL_ABILITY = 'SPECIAL_ABILITY',
  DAMAGE_INDICATOR = 'DAMAGE_INDICATOR'
}

export interface EffectOptions {
  duration?: number;
  scale?: number;
  color?: string;
  intensity?: number;
  direction?: Vector3;
  parent?: any;
}

export interface CombatEffect {
  type: EffectType;
  position: Vector3;
  options: EffectOptions;
  isActive: boolean;
  timeAlive: number;
  
  initialize(position: Vector3, options: EffectOptions): void;
  update(deltaTime: number): void;
  isComplete(): boolean;
  dispose(): void;
} 