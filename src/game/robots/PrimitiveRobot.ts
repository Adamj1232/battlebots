import { Color, Group, Object3D, Scene } from 'three';
import { PartGenerator } from './PartGenerator';
import { PartCategory, RobotConfig, RobotPart } from './types';

export class PrimitiveRobot {
  private scene: Scene;
  private partGenerator: PartGenerator;
  private parts: Record<string, RobotPart>;
  private root: Group;
  private config?: RobotConfig;

  public traverse(callback: (object: Object3D) => void): void {
    this.root.traverse(callback);
  }

  public getPart(partName: string): RobotPart | null {
    return this.parts[partName] || null;
  }

  public getAllParts(): Record<string, RobotPart> {
    return { ...this.parts };
  }

  constructor(scene: Scene, partGenerator: PartGenerator) {
    this.scene = scene;
    this.partGenerator = partGenerator;
    this.parts = {};
    this.root = new Group();
    scene.add(this.root);
  }

  public assembleParts(config: RobotConfig): void {
    this.config = config;
    this.clearParts();

    // Generate and assemble parts
    const partConfigs = {
      head: { id: config.parts.head, socket: 'head_to_torso' },
      torso: { id: config.parts.torso, socket: null },
      leftArm: { id: config.parts.leftArm, socket: 'torso_to_left_arm' },
      rightArm: { id: config.parts.rightArm, socket: 'torso_to_right_arm' },
      leftLeg: { id: config.parts.leftLeg, socket: 'torso_to_left_leg' },
      rightLeg: { id: config.parts.rightLeg, socket: 'torso_to_right_leg' }
    } as const;

    if (config.parts.weapon) {
      (partConfigs as any)['weapon'] = { id: config.parts.weapon, socket: 'arm_to_weapon' };
    }

    // First generate all parts
    for (const [partName, partConfig] of Object.entries(partConfigs)) {
      const part = this.partGenerator.generatePart(partConfig.id, {
        primaryColor: config.colors.primary,
        secondaryColor: config.colors.secondary,
        metalness: config.materials.metalness,
        roughness: config.materials.roughness,
        style: {
          id: partConfig.id,
          name: partName,
          faction: config.faction,
          category: this.getCategoryFromPartName(partName)
        }
      });

      if (part) {
        this.parts[partName] = part;
      }
    }

    // Then assemble them in the correct order
    // Start with torso as the root
    if (this.parts.torso) {
      this.root.add(this.parts.torso.mesh);

      // Attach other parts to their parent sockets
      for (const [partName, partConfig] of Object.entries(partConfigs)) {
        if (partName === 'torso' || !partConfig.socket || !this.parts[partName]) continue;

        const part = this.parts[partName];
        const parentPart = this.findParentPart(partConfig.socket);
        
        if (parentPart) {
          const attachmentPoint = parentPart.attachmentPoints[partName];
          if (attachmentPoint) {
            part.mesh.position.copy(attachmentPoint.position);
            part.mesh.rotation.setFromVector3(attachmentPoint.rotation);
            part.mesh.scale.copy(attachmentPoint.scale);
            parentPart.mesh.add(part.mesh);
          }
        }
      }
    }
  }

  public swapPart(category: PartCategory, newPartId: string): void {
    const partName = this.findPartNameByCategory(category);
    if (!partName || !this.config) return;

    // Update config
    (this.config!.parts as any)[partName] = newPartId;

    // Generate new part
    const newPart = this.partGenerator.generatePart(newPartId, {
      primaryColor: this.config.colors.primary,
      secondaryColor: this.config.colors.secondary,
      metalness: this.config.materials.metalness,
      roughness: this.config.materials.roughness,
      style: {
        id: newPartId,
        name: partName,
        faction: this.config.faction,
        category
      }
    });

    if (!newPart) return;

    // Find the old part and its parent
    const oldPart = this.parts[partName];
    if (oldPart) {
      const parent = oldPart.mesh.parent;
      if (parent) {
        // Copy transform from old part
        newPart.mesh.position.copy(oldPart.mesh.position);
        newPart.mesh.rotation.copy(oldPart.mesh.rotation);
        newPart.mesh.scale.copy(oldPart.mesh.scale);

        // Replace old part with new part
        parent.remove(oldPart.mesh);
        parent.add(newPart.mesh);
      }
    }

    // Update parts registry
    this.parts[partName] = newPart;
  }

  public updateColors(primary: Color, secondary: Color): void {
    Object.values(this.parts).forEach(part => {
      part.updateColors(primary, secondary);
    });
  }

  public animate(animationType: string, progress: number): void {
    Object.values(this.parts).forEach(part => {
      part.animate(animationType, progress);
    });
  }

  public setDamage(partName: string, amount: number): void {
    const part = this.parts[partName];
    if (part) {
      part.setDamage(amount);
    }
  }

  private clearParts(): void {
    // Remove all parts from scene
    Object.values(this.parts).forEach(part => {
      if (part.mesh.parent) {
        part.mesh.parent.remove(part.mesh);
      }
    });

    this.parts = {};
  }

  private getCategoryFromPartName(partName: string): PartCategory {
    if (partName === 'head') return 'head';
    if (partName === 'torso') return 'torso';
    if (partName.includes('Arm')) return 'arm';
    if (partName.includes('Leg')) return 'leg';
    if (partName === 'weapon') return 'weapon';
    throw new Error(`Unknown part name: ${partName}`);
  }

  private findPartNameByCategory(category: PartCategory): string | null {
    for (const [partName, part] of Object.entries(this.parts)) {
      if (part.category === category) {
        return partName;
      }
    }
    return null;
  }

  private findParentPart(socketId: string): RobotPart | null {
    for (const part of Object.values(this.parts)) {
      for (const attachmentPoint of Object.values(part.attachmentPoints)) {
        if (attachmentPoint.socketId === socketId) {
          return part;
        }
      }
    }
    return null;
  }

  public dispose(): void {
    this.clearParts();
    if (this.root.parent) {
      this.root.parent.remove(this.root);
    }
  }
} 