import { Vector3 } from 'three';

export interface CombatStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  maxEnergy: number;
}

export interface DamageInfo {
  amount: number;
  type: DamageType;
  source: Vector3;
  knockback?: number;
}

export type DamageType = 'physical' | 'energy' | 'special';

export interface AbilityInfo {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  damage?: number;
  damageType?: DamageType;
  range: number;
  duration?: number;
  effects?: StatusEffect[];
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  strength: number;
}

export type StatusEffectType = 
  | 'stun'
  | 'slow'
  | 'damage_over_time'
  | 'speed_boost'
  | 'defense_boost'
  | 'attack_boost'
  | 'heal';

export interface CombatState {
  isInCombat: boolean;
  currentTarget?: string;
  activeEffects: StatusEffect[];
  lastAttackTime: number;
  currentEnergy: number;
  abilityCooldowns: Record<string, number>;
}

export interface AttackOptions {
  isMelee: boolean;
  range?: number;
  spread?: number;
  chargeTime?: number;
} 