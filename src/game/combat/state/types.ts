import { CombatStats } from '../types';

export interface CombatStatistics {
  totalBattles: number;
  victories: number;
  defeats: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  totalEnergyUsed: number;
  averageBattleDuration: number;
  favoriteAbility: string;
  favoriteArena: string;
  lastBattleDate: string;
  streak: number;
  bestStreak: number;
  totalTransformations: number;
  totalSpecialMoves: number;
  totalEnvironmentalDamage: number;
  totalHazardsTriggered: number;
  totalAdvantagesCollected: number;
}

export interface CombatAchievement {
  id: string;
  name: string;
  description: string;
  category: 'battle' | 'ability' | 'transformation' | 'environment' | 'progression';
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  reward: {
    type: 'xp' | 'ability' | 'title' | 'cosmetic';
    value: string | number;
  };
  icon: string;
  unlockedDate?: string;
}

export interface CombatProgression {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  availablePoints: number;
  unlockedAbilities: string[];
  unlockedTransformations: string[];
  unlockedArenas: string[];
  titles: string[];
  activeTitle: string;
  cosmetics: string[];
}

export interface CombatState {
  statistics: CombatStatistics;
  achievements: CombatAchievement[];
  progression: CombatProgression;
  lastSaveDate: string;
  version: string;
}

export interface EnemyPersistence {
  id: string;
  type: string;
  position: [number, number, number];
  health: number;
  lastSeen: string;
  respawnTime: number;
  isActive: boolean;
  defeatedCount: number;
  drops: string[];
  specialEvents: string[];
}

export interface CombatSaveData {
  state: CombatState;
  enemies: EnemyPersistence[];
  currentArena: string;
  lastBattleResult?: {
    winner: string;
    duration: number;
    damageDealt: number;
    damageTaken: number;
    abilitiesUsed: string[];
    transformations: number;
    environmentalDamage: number;
  };
} 