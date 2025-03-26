export interface RobotPart {
  id: string;
  name: string;
  type: 'head' | 'torso' | 'arms' | 'legs';
  faction: 'autobot' | 'decepticon';
  stats: {
    health?: number;
    defense?: number;
    specialDefense?: number;
    attack?: number;
    specialAttack?: number;
    speed?: number;
    energy?: number;
  };
  abilities: string[];
  visualEffects: {
    damage: string[];
    abilities: string[];
  };
}

export interface PartCombination {
  parts: string[];
  specialAbility: {
    id: string;
    name: string;
    description: string;
    damage: number;
    damageType: string;
    energyCost: number;
    cooldown: number;
    range: number;
    type: string;
    effects: any[];
    visualEffect: string;
    soundEffect: string;
    targetType: string;
    isChildFriendly: boolean;
    warningDuration: number;
  };
  visualEffect: string;
}

export class RobotCustomization {
  public getVisualDamageEffect(partId: string, damageLevel: number): string {
    // Implementation would return appropriate visual effect based on damage level
    return `damage_${Math.floor(damageLevel * 3)}`;
  }
} 