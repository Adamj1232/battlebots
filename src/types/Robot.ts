import { RobotPart } from '../game/entities/RobotParts';

export type Faction = 'autobot' | 'decepticon';

export interface RobotColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface RobotStats {
  health: number;
  energy: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Robot {
  id: string;
  name: string;
  faction: Faction;
  colors: RobotColors;
  stats: RobotStats;
  parts: {
    [key: string]: RobotPart;
  };
  level: number;
  experience: number;
} 