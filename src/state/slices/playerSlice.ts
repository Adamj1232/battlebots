import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RobotPart, RobotConfig } from '../../game/entities/RobotParts';

export type Faction = 'autobot' | 'decepticon';
export type RobotPartType = 'head' | 'torso' | 'arms' | 'legs';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface RobotStats {
  attack: number;
  defense: number;
  speed: number;
  special: number;
}

export interface Robot {
  parts: {
    head: string;
    torso: string;
    arms: string;
    legs: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  stats: {
    attack: number;
    defense: number;
    speed: number;
    special: number;
  };
}

export interface UnlockedParts {
  head: RobotPart[];
  torso: RobotPart[];
  arms: RobotPart[];
  legs: RobotPart[];
}

export interface PlayerState {
  name: string;
  faction: Faction | null;
  level: number;
  experience: number;
  robot: RobotConfig;
  unlockedParts: {
    head: RobotPart[];
    torso: RobotPart[];
    arms: RobotPart[];
    legs: RobotPart[];
    weapon: RobotPart[];
  };
  achievements: string[];
}

const initialState: PlayerState = {
  name: '',
  faction: null,
  level: 1,
  experience: 0,
  robot: {
    head: {
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
      }
    },
    torso: {
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
    arms: {
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
    legs: {
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
    weapon: {
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
      }
    },
    primaryColor: '#ff3d00',
    secondaryColor: '#ff9100',
    accentColor: '#ffeb3b'
  },
  unlockedParts: {
    head: [],
    torso: [],
    arms: [],
    legs: [],
    weapon: []
  },
  achievements: []
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setFaction: (state, action: PayloadAction<Faction>) => {
      state.faction = action.payload;
    },
    updateRobotPart: (state, action: PayloadAction<{ type: keyof RobotConfig; part: RobotPart }>) => {
      const { type, part } = action.payload;
      if (type !== 'primaryColor' && type !== 'secondaryColor' && type !== 'accentColor') {
        state.robot[type] = part;
      }
    },
    updateRobotColors: (state, action: PayloadAction<{ primary: string; secondary: string; accent: string }>) => {
      state.robot.primaryColor = action.payload.primary;
      state.robot.secondaryColor = action.payload.secondary;
      state.robot.accentColor = action.payload.accent;
    },
    unlockPart: (state, action: PayloadAction<RobotPart>) => {
      const part = action.payload;
      state.unlockedParts[part.type].push(part);
    },
    addExperience: (state, action: PayloadAction<number>) => {
      state.experience += action.payload;
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload);
      }
    }
  }
});

export const {
  setPlayerName,
  setFaction,
  updateRobotPart,
  updateRobotColors,
  unlockPart,
  addExperience,
  unlockAchievement
} = playerSlice.actions;

export default playerSlice.reducer; 