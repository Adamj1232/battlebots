import { BoxGeometry, Color, ConeGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';
import { PartCategory, PartGenerationOptions, PartGeneratorFunction, PartLibrary, PartStyle, RobotFaction, RobotPart } from './types';

export class PartGenerator {
  private partLibrary: PartLibrary = {
    head: {},
    torso: {},
    arm: {},
    leg: {},
    weapon: {}
  };

  constructor() {
    this.initializeDefaultParts();
  }

  private initializeDefaultParts() {
    // Register default part generators for each faction
    this.registerBasicParts('autobot');
    this.registerBasicParts('decepticon');
  }

  private registerBasicParts(faction: RobotFaction) {
    // Register basic head styles
    this.registerPartType({
      id: `${faction}-basic-head`,
      name: `Basic ${faction} Head`,
      faction,
      category: 'head'
    }, this.generateBasicHead.bind(this));

    // Register basic torso styles
    this.registerPartType({
      id: `${faction}-basic-torso`,
      name: `Basic ${faction} Torso`,
      faction,
      category: 'torso'
    }, this.generateBasicTorso.bind(this));

    // Register basic arm styles
    this.registerPartType({
      id: `${faction}-basic-arm`,
      name: `Basic ${faction} Arm`,
      faction,
      category: 'arm'
    }, this.generateBasicArm.bind(this));

    // Register basic leg styles
    this.registerPartType({
      id: `${faction}-basic-leg`,
      name: `Basic ${faction} Leg`,
      faction,
      category: 'leg'
    }, this.generateBasicLeg.bind(this));

    // Register basic weapon styles
    this.registerPartType({
      id: `${faction}-basic-weapon`,
      name: `Basic ${faction} Weapon`,
      faction,
      category: 'weapon'
    }, this.generateBasicWeapon.bind(this));
  }

  public registerPartType(style: PartStyle, generator: PartGeneratorFunction) {
    if (!this.partLibrary[style.category]) {
      this.partLibrary[style.category] = {};
    }

    this.partLibrary[style.category][style.id] = {
      style,
      generator
    };
  }

  public generatePart(partId: string, options: PartGenerationOptions): RobotPart | null {
    // Find the part entry in the library
    const category = this.getCategoryFromId(partId);
    if (!category || !this.partLibrary[category][partId]) {
      console.error(`Part not found: ${partId}`);
      return null;
    }

    const entry = this.partLibrary[category][partId];
    return entry.generator(options);
  }

  private getCategoryFromId(partId: string): PartCategory | null {
    for (const [category, parts] of Object.entries(this.partLibrary)) {
      if (parts[partId]) {
        return category as PartCategory;
      }
    }
    return null;
  }

  private createMaterials(options: PartGenerationOptions) {
    return {
      primary: new MeshStandardMaterial({
        color: options.primaryColor,
        metalness: options.metalness || 0.7,
        roughness: options.roughness || 0.3,
      }),
      secondary: new MeshStandardMaterial({
        color: options.secondaryColor,
        metalness: options.metalness || 0.7,
        roughness: options.roughness || 0.3,
      }),
      glow: new MeshStandardMaterial({
        color: options.style.faction === 'autobot' ? 0x00ffff : 0xff0000,
        emissive: options.style.faction === 'autobot' ? 0x00ffff : 0xff0000,
        emissiveIntensity: 0.5,
        metalness: 0,
        roughness: 0.5,
      })
    };
  }

  private applyDamageEffect(materials: Record<string, MeshStandardMaterial>, amount: number) {
    Object.values(materials).forEach(material => {
      material.roughness = Math.min(1, material.roughness + amount * 0.5);
      material.metalness = Math.max(0, material.metalness - amount * 0.3);
    });
  }

  private animatePart(group: Group, animationType: string, progress: number) {
    switch (animationType) {
      case 'idle':
        group.rotation.y = Math.sin(progress * Math.PI * 2) * 0.1;
        break;
      case 'attack':
        group.position.z = Math.sin(progress * Math.PI) * 0.5;
        break;
      case 'hit':
        group.position.x = Math.sin(progress * Math.PI * 4) * 0.2;
        break;
    }
  }

  public getAvailableParts(category: PartCategory, faction: RobotFaction): PartStyle[] {
    return Object.values(this.partLibrary[category])
      .filter(entry => entry.style.faction === faction)
      .map(entry => entry.style);
  }

  // Basic part generators
  private generateBasicHead(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create basic head shape
    const headMesh = new Mesh(
      this.getHeadGeometry(options.style.faction),
      materials.primary
    );
    group.add(headMesh);

    // Add eyes
    const eyeMaterial = materials.glow;
    const leftEye = this.createEye(eyeMaterial);
    const rightEye = this.createEye(eyeMaterial);
    
    leftEye.position.set(-0.2, 0, 0.4);
    rightEye.position.set(0.2, 0, 0.4);
    
    group.add(leftEye);
    group.add(rightEye);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'head',
      attachmentPoints: {
        torso: {
          position: new Vector3(0, -0.5, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'head_to_torso'
        }
      },
      updateColors: (primary: Color, secondary: Color) => {
        materials.primary.color = primary;
        materials.secondary.color = secondary;
      },
      setDamage: (amount: number) => {
        this.applyDamageEffect(materials, amount);
      },
      animate: (animationType: string, progress: number) => {
        this.animatePart(group, animationType, progress);
      }
    };
  }

  private getHeadGeometry(faction: RobotFaction) {
    if (faction === 'autobot') {
      // Rounded shape for Autobots
      return new SphereGeometry(0.5, 16, 16);
    } else {
      // Angular shape for Decepticons
      return new BoxGeometry(1, 1, 1);
    }
  }

  private createEye(material: MeshStandardMaterial) {
    const eyeGeometry = new SphereGeometry(0.1, 8, 8);
    return new Mesh(eyeGeometry, material);
  }

  private generateBasicTorso(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create basic torso shape
    const torsoGeometry = options.style.faction === 'autobot' 
      ? new BoxGeometry(1.2, 1.5, 0.8)  // More rectangular for Autobots
      : new BoxGeometry(1, 2, 0.6);      // Slimmer for Decepticons
    
    const torsoMesh = new Mesh(torsoGeometry, materials.primary);
    group.add(torsoMesh);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'torso',
      attachmentPoints: {
        head: {
          position: new Vector3(0, 0.75, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_head'
        },
        leftArm: {
          position: new Vector3(-0.7, 0.3, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_arm'
        },
        rightArm: {
          position: new Vector3(0.7, 0.3, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_right_arm'
        },
        leftLeg: {
          position: new Vector3(-0.3, -0.75, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_leg'
        },
        rightLeg: {
          position: new Vector3(0.3, -0.75, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_right_leg'
        }
      },
      updateColors: (primary: Color, secondary: Color) => {
        materials.primary.color = primary;
        materials.secondary.color = secondary;
      },
      setDamage: (amount: number) => {
        this.applyDamageEffect(materials, amount);
      },
      animate: (animationType: string, progress: number) => {
        this.animatePart(group, animationType, progress);
      }
    };
  }

  private generateBasicArm(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create basic arm shape
    const upperArmGeometry = new BoxGeometry(0.3, 0.8, 0.3);
    const upperArm = new Mesh(upperArmGeometry, materials.primary);
    group.add(upperArm);

    const forearmGeometry = new BoxGeometry(0.25, 0.6, 0.25);
    const forearm = new Mesh(forearmGeometry, materials.secondary);
    forearm.position.y = -0.7;
    group.add(forearm);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'arm',
      attachmentPoints: {
        weapon: {
          position: new Vector3(0, -1, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'arm_to_weapon'
        }
      },
      updateColors: (primary: Color, secondary: Color) => {
        materials.primary.color = primary;
        materials.secondary.color = secondary;
      },
      setDamage: (amount: number) => {
        this.applyDamageEffect(materials, amount);
      },
      animate: (animationType: string, progress: number) => {
        this.animatePart(group, animationType, progress);
      }
    };
  }

  private generateBasicLeg(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create basic leg shape
    const upperLegGeometry = new BoxGeometry(0.4, 0.9, 0.4);
    const upperLeg = new Mesh(upperLegGeometry, materials.primary);
    group.add(upperLeg);

    const lowerLegGeometry = new BoxGeometry(0.35, 0.7, 0.35);
    const lowerLeg = new Mesh(lowerLegGeometry, materials.secondary);
    lowerLeg.position.y = -0.8;
    group.add(lowerLeg);

    const footGeometry = new BoxGeometry(0.5, 0.2, 0.6);
    const foot = new Mesh(footGeometry, materials.primary);
    foot.position.y = -1.3;
    foot.position.z = 0.1;
    group.add(foot);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'leg',
      attachmentPoints: {},
      updateColors: (primary: Color, secondary: Color) => {
        materials.primary.color = primary;
        materials.secondary.color = secondary;
      },
      setDamage: (amount: number) => {
        this.applyDamageEffect(materials, amount);
      },
      animate: (animationType: string, progress: number) => {
        this.animatePart(group, animationType, progress);
      }
    };
  }

  private generateBasicWeapon(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    if (options.style.faction === 'autobot') {
      // Autobot weapon - energy blaster
      const barrelGeometry = new ConeGeometry(0.15, 0.8, 8);
      const barrel = new Mesh(barrelGeometry, materials.primary);
      barrel.rotation.x = -Math.PI / 2;
      group.add(barrel);
    } else {
      // Decepticon weapon - angular cannon
      const barrelGeometry = new BoxGeometry(0.3, 0.3, 1);
      const barrel = new Mesh(barrelGeometry, materials.primary);
      group.add(barrel);
    }

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'weapon',
      attachmentPoints: {},
      updateColors: (primary: Color, secondary: Color) => {
        materials.primary.color = primary;
        materials.secondary.color = secondary;
      },
      setDamage: (amount: number) => {
        this.applyDamageEffect(materials, amount);
      },
      animate: (animationType: string, progress: number) => {
        this.animatePart(group, animationType, progress);
      }
    };
  }
}

export default PartGenerator; 