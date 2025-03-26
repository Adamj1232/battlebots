import { CombatStats, AbilityInfo } from '../types';
import { getAbilities } from '../abilities';

export interface RobotPart {
  id: string;
  name: string;
  type: 'head' | 'torso' | 'arms' | 'legs' | 'weapon' | 'special';
  faction: 'autobot' | 'decepticon';
  stats: Partial<CombatStats>;
  abilities: string[]; // IDs of abilities this part enables
  visualEffects: {
    damage: string[];
    abilities: string[];
  };
}

export interface PartCombination {
  parts: string[]; // Array of part IDs
  specialAbility: AbilityInfo;
  visualEffect: string;
}

export class RobotCustomization {
  private parts: Map<string, RobotPart> = new Map();
  private combinations: PartCombination[] = [];
  private activeParts: Map<string, RobotPart> = new Map();

  constructor() {
    this.initializeParts();
    this.initializeCombinations();
  }

  private initializeParts(): void {
    // Example parts - these would come from a configuration file in production
    this.parts.set('autobot_head_1', {
      id: 'autobot_head_1',
      name: 'Optimus Prime Helmet',
      type: 'head',
      faction: 'autobot',
      stats: {
        health: 20,
        defense: 5,
        specialDefense: 3
      },
      abilities: ['matrixVision'],
      visualEffects: {
        damage: ['head_damage_1', 'head_damage_2'],
        abilities: ['matrix_glow']
      }
    });

    this.parts.set('autobot_torso_1', {
      id: 'autobot_torso_1',
      name: 'Matrix Core',
      type: 'torso',
      faction: 'autobot',
      stats: {
        health: 40,
        defense: 8,
        energy: 30
      },
      abilities: ['matrixCharge'],
      visualEffects: {
        damage: ['torso_damage_1', 'torso_damage_2'],
        abilities: ['matrix_pulse']
      }
    });

    // Add more parts here...
  }

  private initializeCombinations(): void {
    // Example combinations - these would come from a configuration file in production
    this.combinations.push({
      parts: ['autobot_head_1', 'autobot_torso_1'],
      specialAbility: {
        id: 'matrixMastery',
        name: 'Matrix Mastery',
        description: 'Channel the power of the Matrix for a devastating attack',
        damage: 50,
        damageType: 'special',
        energyCost: 40,
        cooldown: 15000,
        range: 10,
        type: 'attack',
        effects: [],
        visualEffect: 'matrix_burst',
        soundEffect: 'matrix_sound',
        targetType: 'enemy',
        isChildFriendly: true,
        warningDuration: 1000
      },
      visualEffect: 'matrix_combination'
    });

    // Add more combinations here...
  }

  public addPart(part: RobotPart): void {
    this.parts.set(part.id, part);
  }

  public addCombination(combination: PartCombination): void {
    this.combinations.push(combination);
  }

  public equipPart(partId: string): boolean {
    const part = this.parts.get(partId);
    if (!part) return false;

    // Check if we already have a part of this type equipped
    const existingPart = Array.from(this.activeParts.values())
      .find(p => p.type === part.type);

    if (existingPart) {
      this.activeParts.delete(existingPart.id);
    }

    this.activeParts.set(partId, part);
    return true;
  }

  public getCombatStats(): CombatStats {
    const baseStats: CombatStats = {
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      attack: 20,
      defense: 10,
      speed: 5,
      weight: 100,
      specialAttack: 15,
      specialDefense: 10
    };

    // Combine stats from all equipped parts
    Array.from(this.activeParts.values()).forEach(part => {
      Object.entries(part.stats).forEach(([stat, value]) => {
        if (value !== undefined) {
          baseStats[stat as keyof CombatStats] += value;
        }
      });
    });

    return baseStats;
  }

  public getAbilities(): AbilityInfo[] {
    const baseAbilities = getAbilities('autobot', 'robot');
    const partAbilities: AbilityInfo[] = [];
    const combinationAbilities: AbilityInfo[] = [];

    // Get abilities from individual parts
    Array.from(this.activeParts.values()).forEach(part => {
      part.abilities.forEach(abilityId => {
        const ability = this.findAbilityById(abilityId);
        if (ability) partAbilities.push(ability);
      });
    });

    // Check for combination abilities
    const equippedPartIds = Array.from(this.activeParts.keys());
    this.combinations.forEach(combination => {
      if (combination.parts.every(partId => equippedPartIds.includes(partId))) {
        combinationAbilities.push(combination.specialAbility);
      }
    });

    return [...baseAbilities, ...partAbilities, ...combinationAbilities];
  }

  public getVisualDamageEffect(partId: string, damageLevel: number): string {
    const part = this.parts.get(partId);
    if (!part) return '';

    const effects = part.visualEffects.damage;
    const index = Math.min(Math.floor(damageLevel * effects.length), effects.length - 1);
    return effects[index];
  }

  public getCombinationVisualEffect(): string {
    const equippedPartIds = Array.from(this.activeParts.keys());
    const combination = this.combinations.find(combo =>
      combo.parts.every(partId => equippedPartIds.includes(partId))
    );
    return combination?.visualEffect || '';
  }

  private findAbilityById(abilityId: string): AbilityInfo | undefined {
    // This would search through all available abilities
    // For now, we'll just return undefined
    return undefined;
  }
} 