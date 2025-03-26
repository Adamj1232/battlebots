import { Object3D, Vector3, Box3, Mesh, MeshStandardMaterial, Color, Group, PointLight, SpotLight, SphereGeometry, BoxGeometry, BufferGeometry } from 'three';
import { CombatManager } from '../CombatManager';
import { CombatState, CombatAction, CombatEvent } from '../types';

export interface ArenaZone {
  id: string;
  name: string;
  type: 'open' | 'urban' | 'industrial' | 'underground' | 'space' | 'mystical' | 'futuristic';
  bounds: Box3;
  hazards: ArenaHazard[];
  destructibles: DestructibleObject[];
  spectators: SpectatorNPC[];
  advantages: ArenaAdvantage[];
}

export interface ArenaHazard {
  id: string;
  type: 'fire' | 'electricity' | 'acid' | 'radiation';
  position: Vector3;
  radius: number;
  damage: number;
  duration: number;
  isActive: boolean;
  visualEffect?: HazardVisualEffect;
}

export interface DestructibleObject {
  id: string;
  type: 'wall' | 'barrier' | 'platform' | 'cover' | 'pillar' | 'statue';
  position: Vector3;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  debris: string[];
  visualEffect?: DestructibleVisualEffect;
}

interface HazardVisualEffect {
  mesh: Mesh;
  light: PointLight | SpotLight;
  particles: Group;
  intensity: number;
}

interface DestructibleVisualEffect {
  mesh: Mesh;
  damageMaterial: MeshStandardMaterial;
  debris: Group;
  healthPercentage: number;
}

export interface SpectatorNPC {
  id: string;
  position: Vector3;
  type: 'civilian' | 'security' | 'reporter';
  reactions: {
    onBattleStart: string;
    onBattleEnd: string;
    onSpecialMove: string;
  };
}

export interface ArenaAdvantage {
  id: string;
  type: 'healing' | 'energy' | 'speed' | 'defense';
  position: Vector3;
  radius: number;
  effect: {
    type: string;
    value: number;
    duration: number;
  };
  isActive: boolean;
  respawnTime: number;
}

export class BattleArenaManager {
  private scene: Object3D;
  private combatManager: CombatManager;
  private currentArena: ArenaZone | null = null;
  private activeHazards: Map<string, ArenaHazard> = new Map();
  private destructibles: Map<string, DestructibleObject> = new Map();
  private spectators: Map<string, SpectatorNPC> = new Map();
  private advantages: Map<string, ArenaAdvantage> = new Map();
  private recentEvents: CombatEvent[] = [];

  constructor(scene: Object3D, combatManager: CombatManager) {
    this.scene = scene;
    this.combatManager = combatManager;
    
    // Listen for combat events
    this.combatManager.on('combatEvent', (event: CombatEvent) => {
      this.recentEvents.push(event);
      // Keep only the last 10 events
      if (this.recentEvents.length > 10) {
        this.recentEvents.shift();
      }
    });
  }

  public initializeArena(arena: ArenaZone): void {
    this.currentArena = arena;
    this.setupHazards(arena.hazards);
    this.setupDestructibles(arena.destructibles);
    this.setupSpectators(arena.spectators);
    this.setupAdvantages(arena.advantages);
  }

  private setupHazards(hazards: ArenaHazard[]): void {
    hazards.forEach(hazard => {
      this.activeHazards.set(hazard.id, hazard);
      this.createHazardVisuals(hazard);
    });
  }

  private setupDestructibles(destructibles: DestructibleObject[]): void {
    destructibles.forEach(obj => {
      this.destructibles.set(obj.id, obj);
      this.createDestructibleVisuals(obj);
    });
  }

  private setupSpectators(spectators: SpectatorNPC[]): void {
    spectators.forEach(spectator => {
      this.spectators.set(spectator.id, spectator);
      this.createSpectatorNPC(spectator);
    });
  }

  private setupAdvantages(advantages: ArenaAdvantage[]): void {
    advantages.forEach(advantage => {
      this.advantages.set(advantage.id, advantage);
      this.createAdvantageVisuals(advantage);
    });
  }

  public update(deltaTime: number): void {
    this.updateHazards(deltaTime);
    this.updateDestructibles(deltaTime);
    this.updateSpectators(deltaTime);
    this.updateAdvantages(deltaTime);
  }

  private updateHazards(deltaTime: number): void {
    this.activeHazards.forEach((hazard, id) => {
      if (hazard.isActive) {
        // Check for combatants in hazard area
        this.checkHazardCollisions(hazard);
        
        // Update hazard duration
        hazard.duration -= deltaTime;
        if (hazard.duration <= 0) {
          this.deactivateHazard(id);
        }
      }
    });
  }

  private updateDestructibles(deltaTime: number): void {
    this.destructibles.forEach((obj, id) => {
      if (!obj.isDestroyed) {
        // Check for damage from combat
        this.checkDestructibleDamage(obj);
      }
    });
  }

  private updateSpectators(deltaTime: number): void {
    this.spectators.forEach(spectator => {
      // Update spectator reactions based on combat events
      this.updateSpectatorReactions(spectator);
    });
  }

  private updateAdvantages(deltaTime: number): void {
    this.advantages.forEach((advantage, id) => {
      if (advantage.isActive) {
        // Check for combatants in advantage area
        this.checkAdvantageCollisions(advantage);
      } else {
        // Update respawn timer
        advantage.respawnTime -= deltaTime;
        if (advantage.respawnTime <= 0) {
          this.activateAdvantage(id);
        }
      }
    });
  }

  private checkHazardCollisions(hazard: ArenaHazard): void {
    // Check if any combatants are in the hazard area
    const participants = this.combatManager.getAllParticipants();
    participants.forEach(participant => {
      const position = this.getCombatantPosition(participant.id);
      if (position && this.isInRadius(position, hazard.position, hazard.radius)) {
        const action: CombatAction = {
          type: 'attack',
          source: hazard.id,
          target: participant.id,
          position: position,
          direction: new Vector3(0, 1, 0),
          data: { damage: hazard.damage },
          timestamp: Date.now(),
          isChildFriendly: true,
          warningDuration: 1000
        };
        this.combatManager.submitAction(action);
      }
    });
  }

  private checkDestructibleDamage(obj: DestructibleObject): void {
    // Check for damage from nearby combat
    const participants = this.combatManager.getAllParticipants();
    participants.forEach(participant => {
      const position = this.getCombatantPosition(participant.id);
      if (position && this.isInRadius(position, obj.position, 5)) {
        // Apply damage to destructible object
        obj.health -= 10;
        if (obj.health <= 0) {
          this.destroyObject(obj.id);
        }
      }
    });
  }

  private checkAdvantageCollisions(advantage: ArenaAdvantage): void {
    // Check if any combatants are in the advantage area
    const participants = this.combatManager.getAllParticipants();
    participants.forEach(participant => {
      const position = this.getCombatantPosition(participant.id);
      if (position && this.isInRadius(position, advantage.position, advantage.radius)) {
        this.applyAdvantage(participant.id, advantage);
      }
    });
  }

  private updateSpectatorReactions(spectator: SpectatorNPC): void {
    // Update spectator reactions based on combat events
    this.recentEvents.forEach((event: CombatEvent) => {
      if (event.type === 'ability') {
        this.triggerSpectatorReaction(spectator, 'onSpecialMove');
      }
    });
  }

  private triggerSpectatorReaction(spectator: SpectatorNPC, reactionType: keyof SpectatorNPC['reactions']): void {
    // Play spectator reaction animation/effect
    const reaction = spectator.reactions[reactionType];
    // Implementation would depend on your animation system
  }

  private applyAdvantage(combatantId: string, advantage: ArenaAdvantage): void {
    // Apply advantage effect to combatant
    const action: CombatAction = {
      type: 'ability',
      source: advantage.id,
      target: combatantId,
      position: advantage.position,
      direction: new Vector3(0, 1, 0),
      data: {
        energyCost: 0,
        effects: [{
          type: advantage.effect.type,
          duration: advantage.effect.duration,
          intensity: advantage.effect.value,
          source: advantage.id
        }],
        cooldown: 0
      },
      timestamp: Date.now(),
      isChildFriendly: true,
      warningDuration: 1000
    };
    this.combatManager.submitAction(action);
    
    // Deactivate advantage
    this.deactivateAdvantage(advantage.id);
  }

  private isInRadius(position1: Vector3, position2: Vector3, radius: number): boolean {
    return position1.distanceTo(position2) <= radius;
  }

  private getCombatantPosition(combatantId: string): Vector3 | null {
    // Implementation would depend on your combat system
    return null;
  }

  private createHazardVisuals(hazard: ArenaHazard): void {
    const group = new Group();
    
    // Create hazard mesh
    const geometry = new SphereGeometry(hazard.radius, 32, 32);
    const material = this.createHazardMaterial(hazard.type);
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(hazard.position);
    
    // Create hazard light
    const light = this.createHazardLight(hazard.type);
    light.position.copy(hazard.position);
    
    // Create particle system
    const particles = this.createHazardParticles(hazard.type);
    particles.position.copy(hazard.position);
    
    // Add all to group
    group.add(mesh);
    group.add(light);
    group.add(particles);
    
    // Store visual effect
    hazard.visualEffect = {
      mesh,
      light,
      particles,
      intensity: 1.0
    };
    
    this.scene.add(group);
  }

  private createDestructibleVisuals(obj: DestructibleObject): void {
    const group = new Group();
    
    // Create destructible mesh
    const geometry = this.getDestructibleGeometry(obj.type);
    const material = this.createDestructibleMaterial(obj.type);
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(obj.position);
    
    // Create damage material
    const damageMaterial = this.createDamageMaterial(obj.type);
    
    // Create debris group
    const debris = new Group();
    
    // Add all to group
    group.add(mesh);
    group.add(debris);
    
    // Store visual effect
    obj.visualEffect = {
      mesh,
      damageMaterial,
      debris,
      healthPercentage: 1.0
    };
    
    this.scene.add(group);
  }

  private createHazardMaterial(type: ArenaHazard['type']): MeshStandardMaterial {
    const material = new MeshStandardMaterial();
    
    switch (type) {
      case 'fire':
        material.color = new Color(1, 0.3, 0);
        material.emissive = new Color(1, 0.5, 0);
        material.transparent = true;
        material.opacity = 0.8;
        break;
      case 'electricity':
        material.color = new Color(0, 0.8, 1);
        material.emissive = new Color(0, 0.5, 1);
        material.transparent = true;
        material.opacity = 0.7;
        break;
      case 'acid':
        material.color = new Color(0, 1, 0.3);
        material.emissive = new Color(0, 0.5, 0.2);
        material.transparent = true;
        material.opacity = 0.6;
        break;
      case 'radiation':
        material.color = new Color(1, 0, 0.5);
        material.emissive = new Color(1, 0, 0.3);
        material.transparent = true;
        material.opacity = 0.5;
        break;
    }
    
    return material;
  }

  private createHazardLight(type: ArenaHazard['type']): PointLight | SpotLight {
    const light = new PointLight();
    
    switch (type) {
      case 'fire':
        light.color = new Color(1, 0.3, 0);
        light.intensity = 2;
        light.distance = 10;
        break;
      case 'electricity':
        light.color = new Color(0, 0.8, 1);
        light.intensity = 1.5;
        light.distance = 8;
        break;
      case 'acid':
        light.color = new Color(0, 1, 0.3);
        light.intensity = 1;
        light.distance = 6;
        break;
      case 'radiation':
        light.color = new Color(1, 0, 0.5);
        light.intensity = 1.2;
        light.distance = 7;
        break;
    }
    
    return light;
  }

  private createHazardParticles(type: ArenaHazard['type']): Group {
    const group = new Group();
    // Implementation would depend on your particle system
    return group;
  }

  private getDestructibleGeometry(type: DestructibleObject['type']): BufferGeometry {
    // Implementation would depend on your geometry system
    return new BoxGeometry(1, 1, 1);
  }

  private createDestructibleMaterial(type: DestructibleObject['type']): MeshStandardMaterial {
    const material = new MeshStandardMaterial();
    
    switch (type) {
      case 'wall':
        material.color = new Color(0.8, 0.8, 0.8);
        break;
      case 'barrier':
        material.color = new Color(0.6, 0.6, 0.6);
        break;
      case 'platform':
        material.color = new Color(0.7, 0.7, 0.7);
        break;
      case 'cover':
        material.color = new Color(0.5, 0.5, 0.5);
        break;
      case 'pillar':
        material.color = new Color(0.9, 0.9, 0.9);
        break;
      case 'statue':
        material.color = new Color(0.7, 0.7, 0.7);
        break;
    }
    
    return material;
  }

  private createDamageMaterial(type: DestructibleObject['type']): MeshStandardMaterial {
    const material = new MeshStandardMaterial();
    material.color = new Color(0.3, 0.3, 0.3);
    material.emissive = new Color(0.2, 0.2, 0.2);
    material.metalness = 0.8;
    material.roughness = 0.2;
    return material;
  }

  private updateHazardVisuals(hazard: ArenaHazard, deltaTime: number): void {
    if (!hazard.visualEffect) return;
    
    const { mesh, light, particles } = hazard.visualEffect;
    let { intensity } = hazard.visualEffect;
    
    // Update hazard intensity based on duration
    intensity = hazard.duration / 10;
    
    // Update visual effects
    if (mesh.material instanceof MeshStandardMaterial) {
      mesh.material.opacity = 0.8 * intensity;
      mesh.material.emissiveIntensity = intensity;
    }
    
    light.intensity = 2 * intensity;
    
    // Update particles
    // Implementation would depend on your particle system
  }

  private updateDestructibleVisuals(obj: DestructibleObject): void {
    if (!obj.visualEffect) return;
    
    const { mesh, damageMaterial, debris } = obj.visualEffect;
    let { healthPercentage } = obj.visualEffect;
    
    // Update damage visuals based on health
    healthPercentage = obj.health / obj.maxHealth;
    
    // Update material based on damage
    if (mesh.material instanceof MeshStandardMaterial) {
      mesh.material.color.setRGB(
        0.8 * healthPercentage,
        0.8 * healthPercentage,
        0.8 * healthPercentage
      );
    }
    
    // Update debris if destroyed
    if (obj.isDestroyed) {
      this.createDebris(obj);
    }
  }

  private createDebris(obj: DestructibleObject): void {
    if (!obj.visualEffect) return;
    
    const { debris } = obj.visualEffect;
    
    // Create debris pieces based on object type
    // Implementation would depend on your debris system
  }

  private createSpectatorNPC(spectator: SpectatorNPC): void {
    // Implementation would depend on your NPC system
  }

  private createAdvantageVisuals(advantage: ArenaAdvantage): void {
    // Implementation would depend on your visual effects system
  }

  private deactivateHazard(id: string): void {
    const hazard = this.activeHazards.get(id);
    if (hazard) {
      hazard.isActive = false;
      // Remove hazard visuals
    }
  }

  private destroyObject(id: string): void {
    const obj = this.destructibles.get(id);
    if (obj) {
      obj.isDestroyed = true;
      // Create debris and effects
    }
  }

  private deactivateAdvantage(id: string): void {
    const advantage = this.advantages.get(id);
    if (advantage) {
      advantage.isActive = false;
      advantage.respawnTime = 30; // 30 seconds respawn time
      // Remove advantage visuals
    }
  }

  private activateAdvantage(id: string): void {
    const advantage = this.advantages.get(id);
    if (advantage) {
      advantage.isActive = true;
      // Show advantage visuals
    }
  }
} 