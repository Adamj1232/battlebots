import { Color, Group, Material, Vector3 } from 'three';

export type RobotFaction = 'autobot' | 'decepticon';

export type PartCategory = 'head' | 'torso' | 'arm' | 'leg' | 'weapon';

export interface PartStyle {
  id: string;
  name: string;
  faction: RobotFaction;
  category: PartCategory;
}

export interface PartGenerationOptions {
  primaryColor: Color;
  secondaryColor: Color;
  metalness?: number;
  roughness?: number;
  scale?: Vector3;
  detailLevel?: number;
  style: PartStyle;
}

export interface AttachmentPoint {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  socketId: string;
}

export interface RobotPart {
  id: string;
  style: PartStyle;
  mesh: Group;
  attachmentPoints: Record<string, AttachmentPoint>;
  materials: Material[];
  category: PartCategory;
  updateColors: (primary: Color, secondary: Color) => void;
  setDamage: (amount: number) => void;
  animate: (animationType: string, progress: number) => void;
}

export interface RobotConfig {
  faction: RobotFaction;
  parts: {
    head: string;
    torso: string;
    leftArm: string;
    rightArm: string;
    leftLeg: string;
    rightLeg: string;
    weapon?: string;
  };
  colors: {
    primary: Color;
    secondary: Color;
  };
  materials: {
    metalness: number;
    roughness: number;
  };
}

export interface PartGeneratorFunction {
  (options: PartGenerationOptions): RobotPart;
}

export interface PartLibraryEntry {
  generator: PartGeneratorFunction;
  style: PartStyle;
}

export type PartLibrary = Record<PartCategory, Record<string, PartLibraryEntry>>; 