import * as THREE from 'three';

export interface CombatStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  battlesWon: number;
  battlesLost: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  criticalHits: number;
  abilitiesUsed: number;
  transformations: number;
  longestCombo: number;
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
  timestamp: number;
  isChildFriendly: boolean;
  warningDuration: number;
}

export interface CombatEvent {
  type: 'damage' | 'heal' | 'effect' | 'transform' | 'ability' | 'victory' | 'defeat';
  source: string;
  target?: string;
  amount?: number;
  effect?: StatusEffect;
  position?: THREE.Vector3;
  timestamp: number;
  visualEffect?: string;
  soundEffect?: string;
  isChildFriendly: boolean;
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
  criticalMultiplier: number;
  childFriendlyMode: boolean;
  maxSimultaneousEffects: number;
  difficulty: number;
  tutorialMode: boolean;
  maxEnergy: number;
  energyRegenRate: number;
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
  type: 'attack' | 'support';
  visualEffect: string;
  soundEffect: string;
  targetType: 'enemy' | 'self' | 'area';
  isChildFriendly: boolean;
  warningDuration: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface Combatant {
  id: string;
  name: string;
  stats: CombatStats;
  position: {
    x: number;
    y: number;
    z: number;
  };
  abilities: Ability[];
  statusEffects: StatusEffect[];
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  damage?: number;
  effects?: StatusEffect[];
  targetType: 'enemy' | 'self' | 'area';
  range: number;
  areaOfEffect?: number;
}

export enum TargetType {
  Robot = 'robot',
  Environment = 'environment',
  Projectile = 'projectile'
}

export interface HitInfo {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  partName: string;
  targetType: TargetType;
}

export interface DamageInfo {
  partName: string;
  amount: number;
  type?: DamageType;
  source?: string;
}

export interface CombatTarget {
  type: TargetType;
  position: THREE.Vector3;
  part?: string;
  object: THREE.Object3D;
} 