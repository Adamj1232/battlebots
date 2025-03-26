import { EventEmitter } from 'events';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import {
  CombatState,
  CombatAction,
  CombatEvent,
  CombatResult,
  CombatOptions,
  StatusEffect,
  CombatStats,
  AbilityInfo
} from './types';
import * as THREE from 'three';

export class CombatManager extends EventEmitter {
  private participants: Map<string, CombatState> = new Map();
  private activeActions: CombatAction[] = [];
  private options: CombatOptions;
  private physicsEngine: PhysicsEngine;
  private isCombatActive: boolean = false;
  private currentTurn: number = 0;
  private lastUpdateTime: number = 0;

  constructor(physicsEngine: PhysicsEngine, options: CombatOptions) {
    super();
    this.physicsEngine = physicsEngine;
    this.options = options;
  }

  public initialize(participants: CombatState[]): void {
    this.participants.clear();
    participants.forEach(participant => {
      this.participants.set(participant.id, participant);
    });
    this.isCombatActive = true;
    this.currentTurn = 0;
    this.lastUpdateTime = performance.now();
  }

  public update(deltaTime: number): void {
    if (!this.isCombatActive) return;

    // Update energy regeneration
    this.updateEnergy(deltaTime);

    // Process active actions
    this.processActiveActions(deltaTime);

    // Update status effects
    this.updateStatusEffects(deltaTime);

    // Check for victory/defeat conditions
    this.checkCombatEnd();

    // Update turn counter if in turn-based mode
    if (!this.options.isRealTime) {
      this.currentTurn++;
    }
  }

  public submitAction(action: CombatAction): void {
    if (!this.isCombatActive) return;

    const source = this.participants.get(action.source);
    if (!source) return;

    // Validate action based on combat state
    if (!this.validateAction(action, source)) return;

    // Add action to active actions
    this.activeActions.push(action);

    // Emit action submitted event
    this.emit('actionSubmitted', action);
  }

  private validateAction(action: CombatAction, source: CombatState): boolean {
    // Check if source is stunned
    if (source.activeEffects.some(effect => effect.type === 'stun')) {
      return false;
    }

    // Check energy cost for abilities
    if (action.type === 'ability') {
      const abilityData = action.data as { energyCost: number };
      if (source.stats.energy < abilityData.energyCost) {
        return false;
      }
    }

    return true;
  }

  private processActiveActions(deltaTime: number): void {
    for (let i = this.activeActions.length - 1; i >= 0; i--) {
      const action = this.activeActions[i];
      const result = this.executeAction(action);

      if (result) {
        this.emit('actionExecuted', { action, result });
      }

      // Remove completed actions
      if (this.isActionComplete(action)) {
        this.activeActions.splice(i, 1);
      }
    }
  }

  private executeAction(action: CombatAction): CombatResult | null {
    switch (action.type) {
      case 'attack':
        return this.executeAttack(action);
      case 'ability':
        return this.executeAbility(action);
      case 'transform':
        return this.executeTransform(action);
      case 'move':
        return this.executeMove(action);
      default:
        return null;
    }
  }

  private executeAttack(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    const target = action.target ? this.participants.get(action.target) : null;

    if (!source || !target || !action.position || !action.direction) return null;

    const damage = this.calculateDamage(source, target);
    const critical = this.rollCritical();
    const finalDamage = critical ? damage * this.options.criticalMultiplier : damage;

    // Apply damage
    target.stats.health -= finalDamage;

    // Create combat event
    const event: CombatEvent = {
      type: 'damage',
      source: action.source,
      target: action.target,
      amount: finalDamage,
      position: action.position,
      timestamp: performance.now(),
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    return {
      damage: finalDamage,
      critical,
      effects: [],
      position: action.position,
      direction: action.direction
    };
  }

  private calculateDamage(source: CombatState, target: CombatState): number {
    const baseDamage = source.stats.attack;
    const defense = target.stats.defense;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% variation

    return Math.max(1, Math.floor((baseDamage - defense) * randomFactor));
  }

  private rollCritical(): boolean {
    return Math.random() < this.options.criticalChance;
  }

  private executeAbility(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    const abilityData = action.data as { energyCost: number, effects: StatusEffect[] };
    source.stats.energy -= abilityData.energyCost;

    // Apply ability effects
    if (action.target) {
      const target = this.participants.get(action.target);
      if (target) {
        target.activeEffects.push(...abilityData.effects);
      }
    }

    return {
      damage: 0,
      critical: false,
      effects: abilityData.effects,
      position: action.position,
      direction: action.direction
    };
  }

  private executeTransform(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    source.isTransformed = !source.isTransformed;

    const event: CombatEvent = {
      type: 'transform',
      source: action.source,
      timestamp: performance.now(),
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    return {
      damage: 0,
      critical: false,
      effects: [],
      position: action.position,
      direction: action.direction
    };
  }

  private executeMove(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    // Update position using physics engine
    source.position.copy(action.position);

    return {
      damage: 0,
      critical: false,
      effects: [],
      position: action.position,
      direction: action.direction
    };
  }

  private updateEnergy(deltaTime: number): void {
    this.participants.forEach(participant => {
      participant.stats.energy = Math.min(
        this.options.maxEnergy,
        participant.stats.energy + deltaTime * this.options.energyRegenRate
      );
    });
  }

  private updateStatusEffects(deltaTime: number): void {
    this.participants.forEach(participant => {
      for (let i = participant.activeEffects.length - 1; i >= 0; i--) {
        const effect = participant.activeEffects[i];
        effect.duration -= deltaTime;

        if (effect.duration <= 0) {
          participant.activeEffects.splice(i, 1);
        }
      }
    });
  }

  private checkCombatEnd(): void {
    const aliveParticipants = Array.from(this.participants.values())
      .filter(participant => participant.stats.health > 0);

    if (aliveParticipants.length <= 1) {
      this.endCombat(aliveParticipants[0]?.id);
    }
  }

  private endCombat(winnerId?: string): void {
    this.isCombatActive = false;

    const event: CombatEvent = {
      type: winnerId ? 'victory' : 'defeat',
      source: winnerId || '',
      timestamp: performance.now(),
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);
  }

  private isActionComplete(action: CombatAction): boolean {
    // Implement action completion logic based on action type
    return true; // Placeholder
  }

  public getParticipant(id: string): CombatState | undefined {
    return this.participants.get(id);
  }

  public getAllParticipants(): CombatState[] {
    return Array.from(this.participants.values());
  }

  public isActive(): boolean {
    return this.isCombatActive;
  }

  public getCurrentTurn(): number {
    return this.currentTurn;
  }

  public initializeCombatant(id: string, stats: CombatStats, abilities: AbilityInfo[] = []): void {
    this.participants.set(id, {
      id,
      stats,
      abilities,
      activeEffects: [],
      cooldowns: new Map(),
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      faction: 'autobot',
      isTransformed: false
    });
  }

  public applyStatusEffect(targetId: string, effect: StatusEffect): void {
    const target = this.participants.get(targetId);
    if (target) {
      target.activeEffects.push(effect);
    }
  }
} 