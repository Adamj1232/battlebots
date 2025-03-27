import { BoxGeometry, Color, ConeGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry, Vector3 } from 'three';
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
    // Register head styles
    this.registerPartType({
      id: `${faction}-basic-head`,
      name: `Basic ${faction} Head`,
      faction,
      category: 'head'
    }, this.generateBasicHead.bind(this));

    this.registerPartType({
      id: `${faction}-advanced-head`,
      name: `Advanced ${faction} Head`,
      faction,
      category: 'head'
    }, this.generateAdvancedHead.bind(this));

    this.registerPartType({
      id: `${faction}-elite-head`,
      name: `Elite ${faction} Head`,
      faction,
      category: 'head'
    }, this.generateEliteHead.bind(this));

    // Register torso styles
    this.registerPartType({
      id: `${faction}-basic-torso`,
      name: `Basic ${faction} Torso`,
      faction,
      category: 'torso'
    }, this.generateBasicTorso.bind(this));

    this.registerPartType({
      id: `${faction}-advanced-torso`,
      name: `Advanced ${faction} Torso`,
      faction,
      category: 'torso'
    }, this.generateAdvancedTorso.bind(this));

    this.registerPartType({
      id: `${faction}-elite-torso`,
      name: `Elite ${faction} Torso`,
      faction,
      category: 'torso'
    }, this.generateEliteTorso.bind(this));

    // Register arm styles
    this.registerPartType({
      id: `${faction}-basic-arm`,
      name: `Basic ${faction} Arm`,
      faction,
      category: 'arm'
    }, this.generateBasicArm.bind(this));

    this.registerPartType({
      id: `${faction}-advanced-arm`,
      name: `Advanced ${faction} Arm`,
      faction,
      category: 'arm'
    }, this.generateAdvancedArm.bind(this));

    this.registerPartType({
      id: `${faction}-elite-arm`,
      name: `Elite ${faction} Arm`,
      faction,
      category: 'arm'
    }, this.generateEliteArm.bind(this));

    // Register leg styles
    this.registerPartType({
      id: `${faction}-basic-leg`,
      name: `Basic ${faction} Leg`,
      faction,
      category: 'leg'
    }, this.generateBasicLeg.bind(this));

    this.registerPartType({
      id: `${faction}-advanced-leg`,
      name: `Advanced ${faction} Leg`,
      faction,
      category: 'leg'
    }, this.generateAdvancedLeg.bind(this));

    this.registerPartType({
      id: `${faction}-elite-leg`,
      name: `Elite ${faction} Leg`,
      faction,
      category: 'leg'
    }, this.generateEliteLeg.bind(this));

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
    
    // Create basic head shape with more detail
    const headMesh = new Mesh(
      this.getHeadGeometry(options.style.faction),
      materials.primary
    );
    group.add(headMesh);

    // Add eyes with glow effect
    const eyeMaterial = materials.glow;
    const leftEye = this.createEye(eyeMaterial);
    const rightEye = this.createEye(eyeMaterial);
    
    // Position eyes based on faction
    if (options.style.faction === 'autobot') {
      leftEye.position.set(-0.2, 0.1, 0.4);
      rightEye.position.set(0.2, 0.1, 0.4);
    } else {
      leftEye.position.set(-0.25, 0, 0.4);
      rightEye.position.set(0.25, 0, 0.4);
    }
    
    group.add(leftEye);
    group.add(rightEye);

    // Add faction-specific details
    if (options.style.faction === 'autobot') {
      // Add crest detail
      const crestGeometry = new BoxGeometry(0.6, 0.2, 0.1);
      const crest = new Mesh(crestGeometry, materials.secondary);
      crest.position.set(0, 0.3, 0.3);
      group.add(crest);
    } else {
      // Add angular details
      const detailGeometry = new BoxGeometry(0.4, 0.1, 0.1);
      const leftDetail = new Mesh(detailGeometry, materials.secondary);
      const rightDetail = new Mesh(detailGeometry, materials.secondary);
      leftDetail.position.set(-0.3, 0.2, 0.3);
      rightDetail.position.set(0.3, 0.2, 0.3);
      group.add(leftDetail);
      group.add(rightDetail);
    }

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'head',
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

  private getHeadGeometry(faction: RobotFaction) {
    if (faction === 'autobot') {
      // Rounded shape for Autobots
      return new SphereGeometry(0.5, 16, 16);
    } else {
      // Angular shape for Decepticons
      return new BoxGeometry(0.8, 0.8, 0.8);
    }
  }

  private createEye(material: MeshStandardMaterial): Mesh {
    return new Mesh(
      new SphereGeometry(0.1, 8, 8),
      material
    );
  }

  private generateBasicTorso(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create main torso shape
    const torsoMesh = new Mesh(
      new BoxGeometry(1.2, 1.5, 0.8),
      materials.primary
    );
    group.add(torsoMesh);

    // Add faction-specific details
    if (options.style.faction === 'autobot') {
      // Add circular chest emblem
      const emblemGeometry = new SphereGeometry(0.2, 16, 16);
      const emblem = new Mesh(emblemGeometry, materials.secondary);
      emblem.position.set(0, 0.3, 0.4);
      group.add(emblem);

      // Add shoulder guards
      const guardGeometry = new BoxGeometry(0.3, 0.4, 0.1);
      const leftGuard = new Mesh(guardGeometry, materials.secondary);
      const rightGuard = new Mesh(guardGeometry, materials.secondary);
      leftGuard.position.set(-0.8, 0.6, 0);
      rightGuard.position.set(0.8, 0.6, 0);
      group.add(leftGuard);
      group.add(rightGuard);
    } else {
      // Add angular chest details
      const detailGeometry = new BoxGeometry(0.4, 0.3, 0.1);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, 0.3, 0.4);
      group.add(detail);

      // Add shoulder spikes
      const spikeGeometry = new ConeGeometry(0.1, 0.3, 8);
      const leftSpike = new Mesh(spikeGeometry, materials.secondary);
      const rightSpike = new Mesh(spikeGeometry, materials.secondary);
      leftSpike.position.set(-0.8, 0.6, 0);
      rightSpike.position.set(0.8, 0.6, 0);
      leftSpike.rotation.z = Math.PI / 4;
      rightSpike.rotation.z = -Math.PI / 4;
      group.add(leftSpike);
      group.add(rightSpike);
    }

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
          socketId: 'head_to_torso'
        },
        leftArm: {
          position: new Vector3(-0.7, 0.4, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_arm'
        },
        rightArm: {
          position: new Vector3(0.7, 0.4, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_right_arm'
        },
        leftLeg: {
          position: new Vector3(-0.4, -0.75, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_leg'
        },
        rightLeg: {
          position: new Vector3(0.4, -0.75, 0),
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
    
    // Create upper arm with more detail
    const upperArm = new Mesh(
      new BoxGeometry(0.3, 0.8, 0.3),
      materials.primary
    );
    upperArm.position.y = -0.4;
    group.add(upperArm);

    // Add faction-specific shoulder detail
    if (options.style.faction === 'autobot') {
      const shoulderGeometry = new BoxGeometry(0.4, 0.2, 0.2);
      const shoulder = new Mesh(shoulderGeometry, materials.secondary);
      shoulder.position.set(0, 0, 0);
      group.add(shoulder);
    } else {
      const shoulderGeometry = new ConeGeometry(0.2, 0.3, 8);
      const shoulder = new Mesh(shoulderGeometry, materials.secondary);
      shoulder.position.set(0, 0, 0);
      shoulder.rotation.z = Math.PI / 2;
      group.add(shoulder);
    }

    // Create lower arm with joint
    const lowerArm = new Mesh(
      new BoxGeometry(0.25, 0.6, 0.25),
      materials.secondary
    );
    lowerArm.position.y = -1.1;
    group.add(lowerArm);

    // Add elbow joint
    const jointGeometry = new SphereGeometry(0.15, 8, 8);
    const joint = new Mesh(jointGeometry, materials.primary);
    joint.position.y = -0.8;
    group.add(joint);

    // Add weapon mount point
    const weaponMount = new Group();
    weaponMount.position.set(0, -1.4, 0);
    group.add(weaponMount);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'arm',
      attachmentPoints: {
        weapon: {
          position: new Vector3(0, -1.4, 0),
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
    
    // Create upper leg with more detail
    const upperLeg = new Mesh(
      new BoxGeometry(0.35, 0.9, 0.35),
      materials.primary
    );
    upperLeg.position.y = -0.45;
    group.add(upperLeg);

    // Add hip joint
    const hipJoint = new Mesh(
      new SphereGeometry(0.2, 8, 8),
      materials.secondary
    );
    hipJoint.position.y = 0;
    group.add(hipJoint);

    // Create lower leg with knee joint
    const lowerLeg = new Mesh(
      new BoxGeometry(0.3, 0.7, 0.3),
      materials.secondary
    );
    lowerLeg.position.y = -1.25;
    group.add(lowerLeg);

    // Add knee joint
    const kneeJoint = new Mesh(
      new SphereGeometry(0.15, 8, 8),
      materials.primary
    );
    kneeJoint.position.y = -0.8;
    group.add(kneeJoint);

    // Create foot with faction-specific details
    const foot = new Mesh(
      new BoxGeometry(0.4, 0.2, 0.5),
      materials.primary
    );
    foot.position.y = -1.7;
    foot.position.z = 0.1;
    group.add(foot);

    // Add faction-specific details
    if (options.style.faction === 'autobot') {
      // Add circular detail on upper leg
      const detailGeometry = new SphereGeometry(0.1, 8, 8);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, -0.2, 0.2);
      group.add(detail);
    } else {
      // Add angular detail on upper leg
      const detailGeometry = new BoxGeometry(0.2, 0.1, 0.1);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, -0.2, 0.2);
      detail.rotation.z = Math.PI / 4;
      group.add(detail);
    }

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
      // Autobot weapon - energy blaster with more detail
      const barrelGeometry = new ConeGeometry(0.15, 0.8, 8);
      const barrel = new Mesh(barrelGeometry, materials.primary);
      barrel.rotation.x = -Math.PI / 2;
      group.add(barrel);

      // Add energy core
      const coreGeometry = new SphereGeometry(0.1, 8, 8);
      const core = new Mesh(coreGeometry, materials.glow);
      core.position.set(0, 0, 0.3);
      group.add(core);

      // Add grip
      const gripGeometry = new BoxGeometry(0.2, 0.4, 0.1);
      const grip = new Mesh(gripGeometry, materials.secondary);
      grip.position.set(0, 0.2, 0);
      group.add(grip);
    } else {
      // Decepticon weapon - angular cannon with more detail
      const barrelGeometry = new BoxGeometry(0.3, 0.3, 1);
      const barrel = new Mesh(barrelGeometry, materials.primary);
      group.add(barrel);

      // Add energy core
      const coreGeometry = new BoxGeometry(0.15, 0.15, 0.15);
      const core = new Mesh(coreGeometry, materials.glow);
      core.position.set(0, 0, 0.3);
      core.rotation.z = Math.PI / 4;
      group.add(core);

      // Add grip
      const gripGeometry = new BoxGeometry(0.2, 0.4, 0.1);
      const grip = new Mesh(gripGeometry, materials.secondary);
      grip.position.set(0, 0.2, 0);
      grip.rotation.z = Math.PI / 4;
      group.add(grip);
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

  private generateAdvancedHead(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create main head shape with more detail
    const headMesh = new Mesh(
      this.getHeadGeometry(options.style.faction),
      materials.primary
    );
    group.add(headMesh);

    // Add enhanced eyes with glow effect
    const eyeMaterial = materials.glow;
    const leftEye = this.createEye(eyeMaterial);
    const rightEye = this.createEye(eyeMaterial);
    
    // Position eyes based on faction
    if (options.style.faction === 'autobot') {
      leftEye.position.set(-0.2, 0.1, 0.4);
      rightEye.position.set(0.2, 0.1, 0.4);
    } else {
      leftEye.position.set(-0.25, 0, 0.4);
      rightEye.position.set(0.25, 0, 0.4);
    }
    
    group.add(leftEye);
    group.add(rightEye);

    // Add advanced faction-specific details
    if (options.style.faction === 'autobot') {
      // Add advanced crest with energy lines
      const crestGeometry = new BoxGeometry(0.6, 0.2, 0.1);
      const crest = new Mesh(crestGeometry, materials.secondary);
      crest.position.set(0, 0.3, 0.3);
      group.add(crest);

      // Add energy lines
      const lineGeometry = new BoxGeometry(0.4, 0.05, 0.05);
      const line1 = new Mesh(lineGeometry, materials.glow);
      const line2 = new Mesh(lineGeometry, materials.glow);
      line1.position.set(-0.2, 0.35, 0.3);
      line2.position.set(0.2, 0.35, 0.3);
      group.add(line1);
      group.add(line2);

      // Add cheek guards
      const guardGeometry = new BoxGeometry(0.2, 0.15, 0.1);
      const leftGuard = new Mesh(guardGeometry, materials.secondary);
      const rightGuard = new Mesh(guardGeometry, materials.secondary);
      leftGuard.position.set(-0.4, 0, 0.3);
      rightGuard.position.set(0.4, 0, 0.3);
      group.add(leftGuard);
      group.add(rightGuard);
    } else {
      // Add advanced angular details
      const detailGeometry = new BoxGeometry(0.4, 0.1, 0.1);
      const leftDetail = new Mesh(detailGeometry, materials.secondary);
      const rightDetail = new Mesh(detailGeometry, materials.secondary);
      leftDetail.position.set(-0.3, 0.2, 0.3);
      rightDetail.position.set(0.3, 0.2, 0.3);
      group.add(leftDetail);
      group.add(rightDetail);

      // Add energy spikes
      const spikeGeometry = new ConeGeometry(0.05, 0.2, 8);
      const spikes = [];
      for (let i = 0; i < 4; i++) {
        const spike = new Mesh(spikeGeometry, materials.glow);
        spike.position.set(-0.3 + (i * 0.2), 0.3, 0.3);
        spike.rotation.z = Math.PI / 4;
        spikes.push(spike);
        group.add(spike);
      }

      // Add cheek armor
      const armorGeometry = new BoxGeometry(0.25, 0.2, 0.1);
      const leftArmor = new Mesh(armorGeometry, materials.secondary);
      const rightArmor = new Mesh(armorGeometry, materials.secondary);
      leftArmor.position.set(-0.45, 0, 0.3);
      rightArmor.position.set(0.45, 0, 0.3);
      leftArmor.rotation.z = -Math.PI / 6;
      rightArmor.rotation.z = Math.PI / 6;
      group.add(leftArmor);
      group.add(rightArmor);
    }

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'head',
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

  private generateEliteHead(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create elite head shape with maximum detail
    const headMesh = new Mesh(
      this.getHeadGeometry(options.style.faction),
      materials.primary
    );
    group.add(headMesh);

    // Add elite eyes with enhanced glow effect
    const eyeMaterial = materials.glow;
    const leftEye = this.createEye(eyeMaterial);
    const rightEye = this.createEye(eyeMaterial);
    
    // Position eyes based on faction
    if (options.style.faction === 'autobot') {
      leftEye.position.set(-0.2, 0.1, 0.4);
      rightEye.position.set(0.2, 0.1, 0.4);
    } else {
      leftEye.position.set(-0.25, 0, 0.4);
      rightEye.position.set(0.25, 0, 0.4);
    }
    
    group.add(leftEye);
    group.add(rightEye);

    // Add elite faction-specific details
    if (options.style.faction === 'autobot') {
      // Add elite crest with energy matrix
      const crestGeometry = new BoxGeometry(0.6, 0.2, 0.1);
      const crest = new Mesh(crestGeometry, materials.secondary);
      crest.position.set(0, 0.3, 0.3);
      group.add(crest);

      // Add energy matrix lines
      for (let i = 0; i < 3; i++) {
        const lineGeometry = new BoxGeometry(0.4, 0.05, 0.05);
        const line = new Mesh(lineGeometry, materials.glow);
        line.position.set(0, 0.35 + (i * 0.05), 0.3);
        group.add(line);
      }

      // Add elite cheek guards with energy accents
      const guardGeometry = new BoxGeometry(0.2, 0.15, 0.1);
      const leftGuard = new Mesh(guardGeometry, materials.secondary);
      const rightGuard = new Mesh(guardGeometry, materials.secondary);
      leftGuard.position.set(-0.4, 0, 0.3);
      rightGuard.position.set(0.4, 0, 0.3);
      group.add(leftGuard);
      group.add(rightGuard);

      // Add energy accents
      const accentGeometry = new BoxGeometry(0.15, 0.05, 0.05);
      const leftAccent = new Mesh(accentGeometry, materials.glow);
      const rightAccent = new Mesh(accentGeometry, materials.glow);
      leftAccent.position.set(-0.4, 0.1, 0.3);
      rightAccent.position.set(0.4, 0.1, 0.3);
      group.add(leftAccent);
      group.add(rightAccent);

      // Add forehead detail
      const foreheadGeometry = new BoxGeometry(0.3, 0.1, 0.1);
      const forehead = new Mesh(foreheadGeometry, materials.secondary);
      forehead.position.set(0, 0.4, 0.3);
      group.add(forehead);
    } else {
      // Add elite angular details with energy spikes
      const detailGeometry = new BoxGeometry(0.4, 0.1, 0.1);
      const leftDetail = new Mesh(detailGeometry, materials.secondary);
      const rightDetail = new Mesh(detailGeometry, materials.secondary);
      leftDetail.position.set(-0.3, 0.2, 0.3);
      rightDetail.position.set(0.3, 0.2, 0.3);
      group.add(leftDetail);
      group.add(rightDetail);

      // Add energy spikes
      const spikeGeometry = new ConeGeometry(0.05, 0.2, 8);
      const spikes = [];
      for (let i = 0; i < 6; i++) {
        const spike = new Mesh(spikeGeometry, materials.glow);
        spike.position.set(-0.4 + (i * 0.16), 0.3, 0.3);
        spike.rotation.z = Math.PI / 4;
        spikes.push(spike);
        group.add(spike);
      }

      // Add elite cheek armor with energy lines
      const armorGeometry = new BoxGeometry(0.25, 0.2, 0.1);
      const leftArmor = new Mesh(armorGeometry, materials.secondary);
      const rightArmor = new Mesh(armorGeometry, materials.secondary);
      leftArmor.position.set(-0.45, 0, 0.3);
      rightArmor.position.set(0.45, 0, 0.3);
      leftArmor.rotation.z = -Math.PI / 6;
      rightArmor.rotation.z = Math.PI / 6;
      group.add(leftArmor);
      group.add(rightArmor);

      // Add energy lines
      const lineGeometry = new BoxGeometry(0.2, 0.05, 0.05);
      const leftLine = new Mesh(lineGeometry, materials.glow);
      const rightLine = new Mesh(lineGeometry, materials.glow);
      leftLine.position.set(-0.45, 0.1, 0.3);
      rightLine.position.set(0.45, 0.1, 0.3);
      group.add(leftLine);
      group.add(rightLine);

      // Add forehead spikes
      const foreheadSpikeGeometry = new ConeGeometry(0.05, 0.15, 8);
      const foreheadSpikes = [];
      for (let i = 0; i < 3; i++) {
        const spike = new Mesh(foreheadSpikeGeometry, materials.glow);
        spike.position.set(-0.2 + (i * 0.2), 0.4, 0.3);
        spike.rotation.z = Math.PI / 4;
        foreheadSpikes.push(spike);
        group.add(spike);
      }
    }

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'head',
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

  private generateAdvancedTorso(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create main torso shape with more detail
    const torsoMesh = new Mesh(
      new BoxGeometry(1.2, 1.5, 0.8),
      materials.primary
    );
    group.add(torsoMesh);

    // Add advanced faction-specific details
    if (options.style.faction === 'autobot') {
      // Add advanced chest emblem with energy matrix
      const emblemGeometry = new SphereGeometry(0.2, 16, 16);
      const emblem = new Mesh(emblemGeometry, materials.secondary);
      emblem.position.set(0, 0.3, 0.4);
      group.add(emblem);

      // Add energy matrix lines
      for (let i = 0; i < 3; i++) {
        const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
        const line = new Mesh(lineGeometry, materials.glow);
        line.position.set(0, 0.3 + (i * 0.1), 0.4);
        group.add(line);
      }

      // Add advanced shoulder guards with energy accents
      const guardGeometry = new BoxGeometry(0.3, 0.4, 0.1);
      const leftGuard = new Mesh(guardGeometry, materials.secondary);
      const rightGuard = new Mesh(guardGeometry, materials.secondary);
      leftGuard.position.set(-0.8, 0.6, 0);
      rightGuard.position.set(0.8, 0.6, 0);
      group.add(leftGuard);
      group.add(rightGuard);

      // Add energy accents
      const accentGeometry = new BoxGeometry(0.2, 0.05, 0.05);
      const leftAccent = new Mesh(accentGeometry, materials.glow);
      const rightAccent = new Mesh(accentGeometry, materials.glow);
      leftAccent.position.set(-0.8, 0.7, 0);
      rightAccent.position.set(0.8, 0.7, 0);
      group.add(leftAccent);
      group.add(rightAccent);
    } else {
      // Add advanced angular chest details
      const detailGeometry = new BoxGeometry(0.4, 0.3, 0.1);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, 0.3, 0.4);
      group.add(detail);

      // Add energy lines
      const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
      const leftLine = new Mesh(lineGeometry, materials.glow);
      const rightLine = new Mesh(lineGeometry, materials.glow);
      leftLine.position.set(-0.2, 0.3, 0.4);
      rightLine.position.set(0.2, 0.3, 0.4);
      group.add(leftLine);
      group.add(rightLine);

      // Add advanced shoulder spikes
      const spikeGeometry = new ConeGeometry(0.1, 0.3, 8);
      const leftSpike = new Mesh(spikeGeometry, materials.secondary);
      const rightSpike = new Mesh(spikeGeometry, materials.secondary);
      leftSpike.position.set(-0.8, 0.6, 0);
      rightSpike.position.set(0.8, 0.6, 0);
      leftSpike.rotation.z = Math.PI / 4;
      rightSpike.rotation.z = -Math.PI / 4;
      group.add(leftSpike);
      group.add(rightSpike);

      // Add energy spikes
      const energySpikeGeometry = new ConeGeometry(0.05, 0.2, 8);
      const energySpikes = [];
      for (let i = 0; i < 4; i++) {
        const spike = new Mesh(energySpikeGeometry, materials.glow);
        spike.position.set(-0.7 + (i * 0.5), 0.6, 0);
        spike.rotation.z = Math.PI / 4;
        energySpikes.push(spike);
        group.add(spike);
      }
    }

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
          socketId: 'head_to_torso'
        },
        leftArm: {
          position: new Vector3(-0.7, 0.4, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_arm'
        },
        rightArm: {
          position: new Vector3(0.7, 0.4, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_right_arm'
        },
        leftLeg: {
          position: new Vector3(-0.4, -0.75, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_leg'
        },
        rightLeg: {
          position: new Vector3(0.4, -0.75, 0),
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

  private generateEliteTorso(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create elite torso shape with maximum detail
    const torsoMesh = new Mesh(
      new BoxGeometry(1.2, 1.5, 0.8),
      materials.primary
    );
    group.add(torsoMesh);

    // Add elite faction-specific details
    if (options.style.faction === 'autobot') {
      // Add elite chest emblem with energy matrix
      const emblemGeometry = new SphereGeometry(0.2, 16, 16);
      const emblem = new Mesh(emblemGeometry, materials.secondary);
      emblem.position.set(0, 0.3, 0.4);
      group.add(emblem);

      // Add energy matrix lines
      for (let i = 0; i < 5; i++) {
        const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
        const line = new Mesh(lineGeometry, materials.glow);
        line.position.set(0, 0.3 + (i * 0.08), 0.4);
        group.add(line);
      }

      // Add elite shoulder guards with energy accents
      const guardGeometry = new BoxGeometry(0.3, 0.4, 0.1);
      const leftGuard = new Mesh(guardGeometry, materials.secondary);
      const rightGuard = new Mesh(guardGeometry, materials.secondary);
      leftGuard.position.set(-0.8, 0.6, 0);
      rightGuard.position.set(0.8, 0.6, 0);
      group.add(leftGuard);
      group.add(rightGuard);

      // Add energy accents
      for (let i = 0; i < 3; i++) {
        const accentGeometry = new BoxGeometry(0.2, 0.05, 0.05);
        const leftAccent = new Mesh(accentGeometry, materials.glow);
        const rightAccent = new Mesh(accentGeometry, materials.glow);
        leftAccent.position.set(-0.8, 0.7 + (i * 0.1), 0);
        rightAccent.position.set(0.8, 0.7 + (i * 0.1), 0);
        group.add(leftAccent);
        group.add(rightAccent);
      }

      // Add chest armor plates
      const plateGeometry = new BoxGeometry(0.2, 0.15, 0.1);
      for (let i = 0; i < 3; i++) {
        const plate = new Mesh(plateGeometry, materials.secondary);
        plate.position.set(-0.3 + (i * 0.3), 0.2, 0.4);
        group.add(plate);
      }
    } else {
      // Add elite angular chest details
      const detailGeometry = new BoxGeometry(0.4, 0.3, 0.1);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, 0.3, 0.4);
      group.add(detail);

      // Add energy lines
      for (let i = 0; i < 3; i++) {
        const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
        const line = new Mesh(lineGeometry, materials.glow);
        line.position.set(-0.2 + (i * 0.2), 0.3, 0.4);
        group.add(line);
      }

      // Add elite shoulder spikes
      const spikeGeometry = new ConeGeometry(0.1, 0.3, 8);
      const leftSpike = new Mesh(spikeGeometry, materials.secondary);
      const rightSpike = new Mesh(spikeGeometry, materials.secondary);
      leftSpike.position.set(-0.8, 0.6, 0);
      rightSpike.position.set(0.8, 0.6, 0);
      leftSpike.rotation.z = Math.PI / 4;
      rightSpike.rotation.z = -Math.PI / 4;
      group.add(leftSpike);
      group.add(rightSpike);

      // Add energy spikes
      const energySpikeGeometry = new ConeGeometry(0.05, 0.2, 8);
      const energySpikes = [];
      for (let i = 0; i < 6; i++) {
        const spike = new Mesh(energySpikeGeometry, materials.glow);
        spike.position.set(-0.8 + (i * 0.32), 0.6, 0);
        spike.rotation.z = Math.PI / 4;
        energySpikes.push(spike);
        group.add(spike);
      }

      // Add chest armor plates
      const plateGeometry = new BoxGeometry(0.2, 0.15, 0.1);
      for (let i = 0; i < 3; i++) {
        const plate = new Mesh(plateGeometry, materials.secondary);
        plate.position.set(-0.3 + (i * 0.3), 0.2, 0.4);
        plate.rotation.z = Math.PI / 4;
        group.add(plate);
      }
    }

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
          socketId: 'head_to_torso'
        },
        leftArm: {
          position: new Vector3(-0.7, 0.4, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_arm'
        },
        rightArm: {
          position: new Vector3(0.7, 0.4, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_right_arm'
        },
        leftLeg: {
          position: new Vector3(-0.4, -0.75, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
          socketId: 'torso_to_left_leg'
        },
        rightLeg: {
          position: new Vector3(0.4, -0.75, 0),
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

  private generateAdvancedArm(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create upper arm with more detail
    const upperArm = new Mesh(
      new BoxGeometry(0.3, 0.8, 0.3),
      materials.primary
    );
    upperArm.position.y = -0.4;
    group.add(upperArm);

    // Add advanced faction-specific shoulder detail
    if (options.style.faction === 'autobot') {
      const shoulderGeometry = new BoxGeometry(0.4, 0.2, 0.2);
      const shoulder = new Mesh(shoulderGeometry, materials.secondary);
      shoulder.position.set(0, 0, 0);
      group.add(shoulder);

      // Add energy lines
      const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
      const line = new Mesh(lineGeometry, materials.glow);
      line.position.set(0, 0.1, 0);
      group.add(line);
    } else {
      const shoulderGeometry = new ConeGeometry(0.2, 0.3, 8);
      const shoulder = new Mesh(shoulderGeometry, materials.secondary);
      shoulder.position.set(0, 0, 0);
      shoulder.rotation.z = Math.PI / 2;
      group.add(shoulder);

      // Add energy spikes
      const spikeGeometry = new ConeGeometry(0.05, 0.15, 8);
      const spike = new Mesh(spikeGeometry, materials.glow);
      spike.position.set(0, 0.1, 0);
      spike.rotation.z = Math.PI / 2;
      group.add(spike);
    }

    // Create lower arm with joint
    const lowerArm = new Mesh(
      new BoxGeometry(0.25, 0.6, 0.25),
      materials.secondary
    );
    lowerArm.position.y = -1.1;
    group.add(lowerArm);

    // Add elbow joint with energy effect
    const jointGeometry = new SphereGeometry(0.15, 8, 8);
    const joint = new Mesh(jointGeometry, materials.primary);
    joint.position.y = -0.8;
    group.add(joint);

    // Add energy ring around joint
    const ringGeometry = new TorusGeometry(0.15, 0.02, 8, 16);
    const ring = new Mesh(ringGeometry, materials.glow);
    ring.position.y = -0.8;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Add weapon mount point
    const weaponMount = new Group();
    weaponMount.position.set(0, -1.4, 0);
    group.add(weaponMount);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'arm',
      attachmentPoints: {
        weapon: {
          position: new Vector3(0, -1.4, 0),
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

  private generateEliteArm(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create upper arm with maximum detail
    const upperArm = new Mesh(
      new BoxGeometry(0.3, 0.8, 0.3),
      materials.primary
    );
    upperArm.position.y = -0.4;
    group.add(upperArm);

    // Add elite faction-specific shoulder detail
    if (options.style.faction === 'autobot') {
      const shoulderGeometry = new BoxGeometry(0.4, 0.2, 0.2);
      const shoulder = new Mesh(shoulderGeometry, materials.secondary);
      shoulder.position.set(0, 0, 0);
      group.add(shoulder);

      // Add energy lines
      for (let i = 0; i < 3; i++) {
        const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
        const line = new Mesh(lineGeometry, materials.glow);
        line.position.set(0, 0.1 + (i * 0.1), 0);
        group.add(line);
      }

      // Add armor plates
      const plateGeometry = new BoxGeometry(0.15, 0.1, 0.1);
      for (let i = 0; i < 3; i++) {
        const plate = new Mesh(plateGeometry, materials.secondary);
        plate.position.set(0, -0.2 + (i * 0.2), 0);
        group.add(plate);
      }
    } else {
      const shoulderGeometry = new ConeGeometry(0.2, 0.3, 8);
      const shoulder = new Mesh(shoulderGeometry, materials.secondary);
      shoulder.position.set(0, 0, 0);
      shoulder.rotation.z = Math.PI / 2;
      group.add(shoulder);

      // Add energy spikes
      for (let i = 0; i < 3; i++) {
        const spikeGeometry = new ConeGeometry(0.05, 0.15, 8);
        const spike = new Mesh(spikeGeometry, materials.glow);
        spike.position.set(0, 0.1 + (i * 0.1), 0);
        spike.rotation.z = Math.PI / 2;
        group.add(spike);
      }

      // Add armor plates
      const plateGeometry = new BoxGeometry(0.15, 0.1, 0.1);
      for (let i = 0; i < 3; i++) {
        const plate = new Mesh(plateGeometry, materials.secondary);
        plate.position.set(0, -0.2 + (i * 0.2), 0);
        plate.rotation.z = Math.PI / 4;
        group.add(plate);
      }
    }

    // Create lower arm with joint
    const lowerArm = new Mesh(
      new BoxGeometry(0.25, 0.6, 0.25),
      materials.secondary
    );
    lowerArm.position.y = -1.1;
    group.add(lowerArm);

    // Add elbow joint with energy effect
    const jointGeometry = new SphereGeometry(0.15, 8, 8);
    const joint = new Mesh(jointGeometry, materials.primary);
    joint.position.y = -0.8;
    group.add(joint);

    // Add energy rings around joint
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new TorusGeometry(0.15 + (i * 0.02), 0.02, 8, 16);
      const ring = new Mesh(ringGeometry, materials.glow);
      ring.position.y = -0.8;
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    }

    // Add weapon mount point
    const weaponMount = new Group();
    weaponMount.position.set(0, -1.4, 0);
    group.add(weaponMount);

    return {
      id: options.style.id,
      style: options.style,
      mesh: group,
      materials: Object.values(materials),
      category: 'arm',
      attachmentPoints: {
        weapon: {
          position: new Vector3(0, -1.4, 0),
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

  private generateAdvancedLeg(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create upper leg with more detail
    const upperLeg = new Mesh(
      new BoxGeometry(0.35, 0.9, 0.35),
      materials.primary
    );
    upperLeg.position.y = -0.45;
    group.add(upperLeg);

    // Add hip joint with energy effect
    const hipJoint = new Mesh(
      new SphereGeometry(0.2, 8, 8),
      materials.secondary
    );
    hipJoint.position.y = 0;
    group.add(hipJoint);

    // Add energy ring around hip joint
    const hipRingGeometry = new TorusGeometry(0.2, 0.02, 8, 16);
    const hipRing = new Mesh(hipRingGeometry, materials.glow);
    hipRing.position.y = 0;
    hipRing.rotation.x = Math.PI / 2;
    group.add(hipRing);

    // Create lower leg with knee joint
    const lowerLeg = new Mesh(
      new BoxGeometry(0.3, 0.7, 0.3),
      materials.secondary
    );
    lowerLeg.position.y = -1.25;
    group.add(lowerLeg);

    // Add knee joint with energy effect
    const kneeJoint = new Mesh(
      new SphereGeometry(0.15, 8, 8),
      materials.primary
    );
    kneeJoint.position.y = -0.8;
    group.add(kneeJoint);

    // Add energy ring around knee joint
    const kneeRingGeometry = new TorusGeometry(0.15, 0.02, 8, 16);
    const kneeRing = new Mesh(kneeRingGeometry, materials.glow);
    kneeRing.position.y = -0.8;
    kneeRing.rotation.x = Math.PI / 2;
    group.add(kneeRing);

    // Create foot with faction-specific details
    const foot = new Mesh(
      new BoxGeometry(0.4, 0.2, 0.5),
      materials.primary
    );
    foot.position.y = -1.7;
    foot.position.z = 0.1;
    group.add(foot);

    // Add advanced faction-specific details
    if (options.style.faction === 'autobot') {
      // Add circular detail on upper leg
      const detailGeometry = new SphereGeometry(0.1, 8, 8);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, -0.2, 0.2);
      group.add(detail);

      // Add energy lines
      const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
      const line = new Mesh(lineGeometry, materials.glow);
      line.position.set(0, -0.2, 0.2);
      group.add(line);
    } else {
      // Add angular detail on upper leg
      const detailGeometry = new BoxGeometry(0.2, 0.1, 0.1);
      const detail = new Mesh(detailGeometry, materials.secondary);
      detail.position.set(0, -0.2, 0.2);
      detail.rotation.z = Math.PI / 4;
      group.add(detail);

      // Add energy spikes
      const spikeGeometry = new ConeGeometry(0.05, 0.15, 8);
      const spike = new Mesh(spikeGeometry, materials.glow);
      spike.position.set(0, -0.2, 0.2);
      spike.rotation.z = Math.PI / 4;
      group.add(spike);
    }

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

  private generateEliteLeg(options: PartGenerationOptions): RobotPart {
    const group = new Group();
    const materials = this.createMaterials(options);
    
    // Create upper leg with maximum detail
    const upperLeg = new Mesh(
      new BoxGeometry(0.35, 0.9, 0.35),
      materials.primary
    );
    upperLeg.position.y = -0.45;
    group.add(upperLeg);

    // Add hip joint with energy effect
    const hipJoint = new Mesh(
      new SphereGeometry(0.2, 8, 8),
      materials.secondary
    );
    hipJoint.position.y = 0;
    group.add(hipJoint);

    // Add energy rings around hip joint
    for (let i = 0; i < 3; i++) {
      const hipRingGeometry = new TorusGeometry(0.2 + (i * 0.02), 0.02, 8, 16);
      const hipRing = new Mesh(hipRingGeometry, materials.glow);
      hipRing.position.y = 0;
      hipRing.rotation.x = Math.PI / 2;
      group.add(hipRing);
    }

    // Create lower leg with knee joint
    const lowerLeg = new Mesh(
      new BoxGeometry(0.3, 0.7, 0.3),
      materials.secondary
    );
    lowerLeg.position.y = -1.25;
    group.add(lowerLeg);

    // Add knee joint with energy effect
    const kneeJoint = new Mesh(
      new SphereGeometry(0.15, 8, 8),
      materials.primary
    );
    kneeJoint.position.y = -0.8;
    group.add(kneeJoint);

    // Add energy rings around knee joint
    for (let i = 0; i < 3; i++) {
      const kneeRingGeometry = new TorusGeometry(0.15 + (i * 0.02), 0.02, 8, 16);
      const kneeRing = new Mesh(kneeRingGeometry, materials.glow);
      kneeRing.position.y = -0.8;
      kneeRing.rotation.x = Math.PI / 2;
      group.add(kneeRing);
    }

    // Create foot with faction-specific details
    const foot = new Mesh(
      new BoxGeometry(0.4, 0.2, 0.5),
      materials.primary
    );
    foot.position.y = -1.7;
    foot.position.z = 0.1;
    group.add(foot);

    // Add elite faction-specific details
    if (options.style.faction === 'autobot') {
      // Add circular details on upper leg
      for (let i = 0; i < 3; i++) {
        const detailGeometry = new SphereGeometry(0.1, 8, 8);
        const detail = new Mesh(detailGeometry, materials.secondary);
        detail.position.set(0, -0.2 + (i * 0.2), 0.2);
        group.add(detail);

        // Add energy lines
        const lineGeometry = new BoxGeometry(0.3, 0.05, 0.05);
        const line = new Mesh(lineGeometry, materials.glow);
        line.position.set(0, -0.2 + (i * 0.2), 0.2);
        group.add(line);
      }

      // Add armor plates
      const plateGeometry = new BoxGeometry(0.15, 0.1, 0.1);
      for (let i = 0; i < 3; i++) {
        const plate = new Mesh(plateGeometry, materials.secondary);
        plate.position.set(0, -0.2 + (i * 0.2), 0.2);
        group.add(plate);
      }
    } else {
      // Add angular details on upper leg
      for (let i = 0; i < 3; i++) {
        const detailGeometry = new BoxGeometry(0.2, 0.1, 0.1);
        const detail = new Mesh(detailGeometry, materials.secondary);
        detail.position.set(0, -0.2 + (i * 0.2), 0.2);
        detail.rotation.z = Math.PI / 4;
        group.add(detail);

        // Add energy spikes
        const spikeGeometry = new ConeGeometry(0.05, 0.15, 8);
        const spike = new Mesh(spikeGeometry, materials.glow);
        spike.position.set(0, -0.2 + (i * 0.2), 0.2);
        spike.rotation.z = Math.PI / 4;
        group.add(spike);
      }

      // Add armor plates
      const plateGeometry = new BoxGeometry(0.15, 0.1, 0.1);
      for (let i = 0; i < 3; i++) {
        const plate = new Mesh(plateGeometry, materials.secondary);
        plate.position.set(0, -0.2 + (i * 0.2), 0.2);
        plate.rotation.z = Math.PI / 4;
        group.add(plate);
      }
    }

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
}

export default PartGenerator; 