import * as THREE from 'three';

export interface CombatStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  weight: number;
  specialAttack: number;
  specialDefense: number;
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
  lastDamageTaken: number;
  comboCount: number;
  isVulnerable: boolean;
  visualState: {
    damageLevel: number; // 0-1 for visual damage state
    isFlashing: boolean;
    currentEffect: string | null;
  };
}

export type DamageType = 'physical' | 'energy' | 'status' | 'special';
export type StatusEffectType = 'stun' | 'slow' | 'burn' | 'freeze' | 'shield' | 'heal' | 'defense_boost' | 'attack_boost' | 'speed_boost';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  intensity: number;
  source: string;
  visualEffect?: string;
}

export interface CombatAction {
  type: 'attack' | 'ability' | 'transform' | 'defend' | 'move';
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
  type: 'damage' | 'heal' | 'effect' | 'ability' | 'transform' | 'victory' | 'defeat';
  source: string;
  target?: string;
  amount?: number;
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
  visualFeedback: {
    hitEffect: string;
    damageNumber: string;
    screenShake: number;
    cameraFlash: number;
  };
}

export interface CombatOptions {
  isRealTime: boolean;
  turnDuration: number;
  criticalMultiplier: number;
  comboWindow: number;
  childFriendlyMode: boolean;
  visualFeedbackIntensity: number;
  soundFeedbackIntensity: number;
  maxSimultaneousEffects: number;
  difficulty: number;
  tutorialMode: boolean;
}

export interface CombatVisualEffect {
  type: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  duration: number;
  intensity: number;
  color: THREE.Color;
  particleCount: number;
  isChildFriendly: boolean;
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
  energyCost: number;
  cooldown: number;
  type: 'attack' | 'defense' | 'support' | 'transform' | 'special';
  effects: StatusEffect[];
  visualEffect: string;
  soundEffect: string;
  targetType: 'self' | 'enemy' | 'ally' | 'area';
  range: number;
  areaOfEffect?: number;
  isChildFriendly: boolean;
  warningDuration: number;
  damage?: number;
  damageType?: DamageType;
  duration?: number;
} 