export interface PartStats {
  health: number;
  speed: number;
  strength: number;
  defense: number;
  energy: number;
}

export interface RobotPart {
  id: string;
  name: string;
  description: string;
  type: 'head' | 'torso' | 'arms' | 'legs' | 'weapon';
  faction: 'autobot' | 'decepticon' | 'both';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  modelPath: string;
  previewImage: string;
  stats: PartStats;
  specialAbility?: {
    name: string;
    description: string;
    effect: string;
  };
  unlockRequirement?: {
    type: 'level' | 'achievement' | 'mission';
    value: string | number;
  };
}

export interface RobotConfig {
  head: RobotPart;
  torso: RobotPart;
  arms: RobotPart;
  legs: RobotPart;
  weapon: RobotPart;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// Define base stats for balancing
const BASE_STATS: PartStats = {
  health: 100,
  speed: 10,
  strength: 10,
  defense: 10,
  energy: 100
};

// Part collections
export const HEADS: RobotPart[] = [
  {
    id: 'scout-head',
    name: 'Scout Visor',
    description: 'Enhanced scanning and targeting capabilities',
    type: 'head',
    faction: 'both',
    rarity: 'common',
    modelPath: '/models/parts/heads/scout_head.glb',
    previewImage: '/images/parts/heads/scout_head.png',
    stats: {
      health: 50,
      speed: 15,
      strength: 5,
      defense: 5,
      energy: 80
    },
    specialAbility: {
      name: 'Eagle Eye',
      description: 'Increases accuracy and reveals hidden enemies',
      effect: 'accuracy_boost'
    }
  },
  {
    id: 'warrior-head',
    name: 'Warrior Helm',
    description: 'Reinforced armor plating with tactical display',
    type: 'head',
    faction: 'both',
    rarity: 'rare',
    modelPath: '/models/parts/heads/warrior_head.glb',
    previewImage: '/images/parts/heads/warrior_head.png',
    stats: {
      health: 100,
      speed: 5,
      strength: 10,
      defense: 15,
      energy: 90
    },
    specialAbility: {
      name: 'Battle Focus',
      description: 'Increases damage resistance during combat',
      effect: 'defense_boost'
    }
  }
];

export const TORSOS: RobotPart[] = [
  {
    id: 'agile-torso',
    name: 'Agile Frame',
    description: 'Lightweight and flexible design',
    type: 'torso',
    faction: 'autobot',
    rarity: 'common',
    modelPath: '/models/parts/torsos/agile_torso.glb',
    previewImage: '/images/parts/torsos/agile_torso.png',
    stats: {
      health: 80,
      speed: 20,
      strength: 8,
      defense: 8,
      energy: 100
    }
  },
  {
    id: 'heavy-torso',
    name: 'Heavy Armor',
    description: 'Maximum protection for intense combat',
    type: 'torso',
    faction: 'decepticon',
    rarity: 'rare',
    modelPath: '/models/parts/torsos/heavy_torso.glb',
    previewImage: '/images/parts/torsos/heavy_torso.png',
    stats: {
      health: 150,
      speed: 5,
      strength: 15,
      defense: 20,
      energy: 120
    }
  }
];

export const ARMS: RobotPart[] = [
  {
    id: 'power-arms',
    name: 'Power Fists',
    description: 'Enhanced strength for melee combat',
    type: 'arms',
    faction: 'both',
    rarity: 'common',
    modelPath: '/models/parts/arms/power_arms.glb',
    previewImage: '/images/parts/arms/power_arms.png',
    stats: {
      health: 70,
      speed: 8,
      strength: 20,
      defense: 10,
      energy: 90
    }
  },
  {
    id: 'precision-arms',
    name: 'Precision Servos',
    description: 'High accuracy and quick movements',
    type: 'arms',
    faction: 'autobot',
    rarity: 'rare',
    modelPath: '/models/parts/arms/precision_arms.glb',
    previewImage: '/images/parts/arms/precision_arms.png',
    stats: {
      health: 60,
      speed: 15,
      strength: 12,
      defense: 8,
      energy: 100
    }
  }
];

export const LEGS: RobotPart[] = [
  {
    id: 'scout-legs',
    name: 'Scout Legs',
    description: 'Fast and agile movement',
    type: 'legs',
    faction: 'both',
    rarity: 'common',
    modelPath: '/models/parts/legs/scout_legs.glb',
    previewImage: '/images/parts/legs/scout_legs.png',
    stats: {
      health: 60,
      speed: 25,
      strength: 5,
      defense: 5,
      energy: 70
    }
  },
  {
    id: 'tank-legs',
    name: 'Tank Treads',
    description: 'Heavy duty all-terrain mobility',
    type: 'legs',
    faction: 'decepticon',
    rarity: 'rare',
    modelPath: '/models/parts/legs/tank_legs.glb',
    previewImage: '/images/parts/legs/tank_legs.png',
    stats: {
      health: 120,
      speed: 8,
      strength: 15,
      defense: 18,
      energy: 110
    }
  }
];

export const WEAPONS: RobotPart[] = [
  {
    id: 'energy-blade',
    name: 'Energy Blade',
    description: 'Close-range energy weapon',
    type: 'weapon',
    faction: 'both',
    rarity: 'common',
    modelPath: '/models/parts/weapons/energy_blade.glb',
    previewImage: '/images/parts/weapons/energy_blade.png',
    stats: {
      health: 40,
      speed: 12,
      strength: 18,
      defense: 5,
      energy: 90
    },
    specialAbility: {
      name: 'Energy Slash',
      description: 'Powerful melee attack with energy damage',
      effect: 'energy_damage'
    }
  },
  {
    id: 'plasma-cannon',
    name: 'Plasma Cannon',
    description: 'Long-range heavy weapon',
    type: 'weapon',
    faction: 'both',
    rarity: 'rare',
    modelPath: '/models/parts/weapons/plasma_cannon.glb',
    previewImage: '/images/parts/weapons/plasma_cannon.png',
    stats: {
      health: 30,
      speed: 5,
      strength: 25,
      defense: 3,
      energy: 120
    },
    specialAbility: {
      name: 'Charged Shot',
      description: 'Powerful ranged attack with charge-up mechanic',
      effect: 'charged_shot'
    }
  }
];

// Helper functions for robot configuration
export function calculateTotalStats(config: RobotConfig): PartStats {
  const parts = [config.head, config.torso, config.arms, config.legs, config.weapon];
  
  return parts.reduce((total, part) => ({
    health: total.health + part.stats.health,
    speed: total.speed + part.stats.speed,
    strength: total.strength + part.stats.strength,
    defense: total.defense + part.stats.defense,
    energy: total.energy + part.stats.energy
  }), { ...BASE_STATS });
}

export function getDefaultRobotConfig(faction: 'autobot' | 'decepticon'): RobotConfig {
  return {
    head: HEADS[0],
    torso: TORSOS[0],
    arms: ARMS[0],
    legs: LEGS[0],
    weapon: WEAPONS[0],
    primaryColor: faction === 'autobot' ? '#ff3d00' : '#7c4dff',
    secondaryColor: faction === 'autobot' ? '#ff9100' : '#2196f3',
    accentColor: '#ffeb3b'
  };
}

export function isPartCompatible(part: RobotPart, faction: 'autobot' | 'decepticon'): boolean {
  return part.faction === 'both' || part.faction === faction;
}

export function getAvailableParts(type: RobotPart['type'], faction: 'autobot' | 'decepticon'): RobotPart[] {
  const partCollections = {
    head: HEADS,
    torso: TORSOS,
    arms: ARMS,
    legs: LEGS,
    weapon: WEAPONS
  };

  return partCollections[type].filter(part => isPartCompatible(part, faction));
} 