import * as THREE from 'three';

export interface CombatStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface CombatState {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  stats: CombatStats;
  faction: 'autobot' | 'decepticon';
  isTransformed: boolean;
  activeEffects: StatusEffect[];
  abilities: AbilityInfo[];
  cooldowns: Map<string, number>;
}

export type DamageType = 'physical' | 'energy' | 'status' | 'special';
export type StatusEffectType = 'stun' | 'slow' | 'burn' | 'freeze' | 'shield' | 'heal' | 'defense_boost' | 'attack_boost' | 'speed_boost';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  strength: number;
  source: string;
}

export interface CombatAction {
  type: 'attack' | 'ability' | 'transform' | 'move';
  source: string;
  target?: string;
  position?: THREE.Vector3;
  direction?: THREE.Vector3;
  data?: any;
}

export interface CombatEvent {
  type: 'damage' | 'heal' | 'effect' | 'transform' | 'ability' | 'victory' | 'defeat';
  source: string;
  target?: string;
  amount?: number;
  effect?: StatusEffect;
  position?: THREE.Vector3;
  timestamp: number;
}

export interface CombatResult {
  damage: number;
  critical: boolean;
  effects: StatusEffect[];
  position: THREE.Vector3;
  direction: THREE.Vector3;
}

export interface CombatOptions {
  isRealTime: boolean;
  turnDuration: number;
  maxEnergy: number;
  energyRegenRate: number;
  criticalMultiplier: number;
  criticalChance: number;
}

export interface EffectOptions {
  particleCount: number;
  particleSize: number;
  particleLifetime: number;
  effectScale: number;
  effectColor: THREE.Color | string;
  effectIntensity: number;
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material | THREE.Material[];
}

export interface AbilityInfo {
  id: string;
  name: string;
  description: string;
  damage: number;
  damageType: DamageType;
  energyCost: number;
  cooldown: number;
  range: number;
  duration?: number;
  effects?: StatusEffect[];
} 