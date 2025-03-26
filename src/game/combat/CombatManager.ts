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
  AbilityInfo,
  CombatVisualEffect
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
  private visualEffects: CombatVisualEffect[] = [];
  private comboTimers: Map<string, number> = new Map();
  private tutorialState: {
    currentStep: number;
    isActive: boolean;
    hints: string[];
  } = {
    currentStep: 0,
    isActive: false,
    hints: []
  };

  constructor(physicsEngine: PhysicsEngine, options: CombatOptions) {
    super();
    this.physicsEngine = physicsEngine;
    this.options = {
      ...options,
      childFriendlyMode: true, // Default to child-friendly mode
      visualFeedbackIntensity: 1.0,
      soundFeedbackIntensity: 1.0,
      maxSimultaneousEffects: 10,
      difficulty: 0.5,
      tutorialMode: true
    };
  }

  public initialize(participants: CombatState[]): void {
    this.participants.clear();
    participants.forEach(participant => {
      this.participants.set(participant.id, {
        ...participant,
        lastDamageTaken: 0,
        comboCount: 0,
        isVulnerable: true,
        visualState: {
          damageLevel: 0,
          isFlashing: false,
          currentEffect: null
        }
      });
    });
    this.isCombatActive = true;
    this.currentTurn = 0;
    this.lastUpdateTime = performance.now();
    
    if (this.options.tutorialMode) {
      this.startTutorial();
    }
  }

  public update(deltaTime: number): void {
    if (!this.isCombatActive) return;

    // Update energy regeneration
    this.updateEnergy(deltaTime);

    // Process active actions
    this.processActiveActions(deltaTime);

    // Update status effects
    this.updateStatusEffects(deltaTime);

    // Update visual effects
    this.updateVisualEffects(deltaTime);

    // Update combo timers
    this.updateComboTimers(deltaTime);

    // Check for victory/defeat conditions
    this.checkCombatEnd();

    // Update turn counter if in turn-based mode
    if (!this.options.isRealTime) {
      this.currentTurn++;
    }
  }

  private updateVisualEffects(deltaTime: number): void {
    // Remove expired effects
    this.visualEffects = this.visualEffects.filter(effect => {
      effect.duration -= deltaTime;
      return effect.duration > 0;
    });

    // Limit simultaneous effects
    if (this.visualEffects.length > this.options.maxSimultaneousEffects) {
      this.visualEffects = this.visualEffects.slice(-this.options.maxSimultaneousEffects);
    }
  }

  private updateComboTimers(deltaTime: number): void {
    for (const [id, timer] of this.comboTimers.entries()) {
      if (timer <= deltaTime) {
        this.comboTimers.delete(id);
        const participant = this.participants.get(id);
        if (participant) {
          participant.comboCount = 0;
        }
      } else {
        this.comboTimers.set(id, timer - deltaTime);
      }
    }
  }

  private startTutorial(): void {
    this.tutorialState = {
      currentStep: 0,
      isActive: true,
      hints: [
        "Welcome to Transformers Battle Arena! Let's learn how to fight!",
        "Press SPACE to attack. Watch for the warning indicators!",
        "Use TAB to switch between robot and vehicle modes.",
        "Press E to use special abilities when your energy is full.",
        "Remember to dodge enemy attacks when you see the red warning!",
        "Great job! You're ready to battle!"
      ]
    };
    this.emit('tutorialStart', this.tutorialState.hints[0]);
  }

  public submitAction(action: CombatAction): boolean {
    const source = this.participants.get(action.source);
    if (!source || !this.validateAction(action, source)) {
      return false;
    }

    // Add warning duration for child-friendly mode
    if (this.options.childFriendlyMode) {
      action.warningDuration = this.calculateWarningDuration(action);
    }

    this.activeActions.push(action);
    this.emit('actionSubmitted', action);

    return true;
  }

  private calculateWarningDuration(action: CombatAction): number {
    const baseWarning = 1.0; // Base warning time in seconds
    const difficultyFactor = 1 - this.options.difficulty; // Higher difficulty = shorter warning
    const comboFactor = Math.max(0.5, 1 - (action.source ? this.getComboCount(action.source) * 0.1 : 0));
    
    return baseWarning * difficultyFactor * comboFactor;
  }

  private getComboCount(id: string): number {
    return this.participants.get(id)?.comboCount || 0;
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

    // Check cooldowns
    if (source.cooldowns.has(action.type)) {
      return false;
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
      case 'defend':
        return this.executeDefend(action);
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
    target.lastDamageTaken = performance.now();
    target.comboCount++;

    // Update combo timer
    this.comboTimers.set(action.source, this.options.comboWindow);

    // Update visual state
    target.visualState.damageLevel = 1 - (target.stats.health / target.stats.maxHealth);
    target.visualState.isFlashing = true;

    // Create combat event
    const event: CombatEvent = {
      type: 'damage',
      source: action.source,
      target: action.target,
      amount: finalDamage,
      position: action.position,
      timestamp: performance.now(),
      visualEffect: critical ? 'critical_hit' : 'normal_hit',
      soundEffect: critical ? 'critical_sound' : 'hit_sound',
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    return {
      damage: finalDamage,
      critical,
      effects: [],
      position: action.position,
      direction: action.direction,
      visualFeedback: {
        hitEffect: critical ? 'critical_spark' : 'normal_spark',
        damageNumber: finalDamage.toString(),
        screenShake: critical ? 0.5 : 0.2,
        cameraFlash: critical ? 0.3 : 0.1
      }
    };
  }

  private calculateDamage(source: CombatState, target: CombatState): number {
    const baseDamage = source.stats.attack;
    const defense = target.stats.defense;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% variation
    const comboBonus = this.getComboCount(source.id) * 0.1; // 10% bonus per combo
    const difficultyFactor = 1 + (this.options.difficulty * 0.2); // Up to 20% more damage on higher difficulty

    return Math.max(1, Math.floor((baseDamage - defense) * randomFactor * (1 + comboBonus) * difficultyFactor));
  }

  private rollCritical(): boolean {
    const baseChance = 0.1; // 10% base critical chance
    const difficultyBonus = this.options.difficulty * 0.05; // Up to 5% more on higher difficulty
    return Math.random() < (baseChance + difficultyBonus);
  }

  private executeAbility(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    const abilityData = action.data as { energyCost: number, effects: StatusEffect[], cooldown: number };
    source.stats.energy -= abilityData.energyCost;

    // Apply ability effects
    if (action.target) {
      const target = this.participants.get(action.target);
      if (target) {
        target.activeEffects.push(...abilityData.effects);
      }
    }

    // Set cooldown
    source.cooldowns.set(action.type, abilityData.cooldown);

    return {
      damage: 0,
      critical: false,
      effects: abilityData.effects,
      position: action.position,
      direction: action.direction,
      visualFeedback: {
        hitEffect: 'ability_effect',
        damageNumber: '',
        screenShake: 0.1,
        cameraFlash: 0.1
      }
    };
  }

  private executeTransform(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    const event: CombatEvent = {
      type: 'transform',
      source: action.source,
      timestamp: performance.now(),
      visualEffect: 'transform_effect',
      soundEffect: 'transform_sound',
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    return {
      damage: 0,
      critical: false,
      effects: [],
      position: action.position,
      direction: action.direction,
      visualFeedback: {
        hitEffect: 'transform_spark',
        damageNumber: '',
        screenShake: 0.1,
        cameraFlash: 0.1
      }
    };
  }

  private executeDefend(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    const event: CombatEvent = {
      type: 'effect',
      source: action.source,
      timestamp: performance.now(),
      visualEffect: 'shield_effect',
      soundEffect: 'shield_sound',
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    return {
      damage: 0,
      critical: false,
      effects: [],
      position: action.position,
      direction: action.direction,
      visualFeedback: {
        hitEffect: 'shield_spark',
        damageNumber: '',
        screenShake: 0.1,
        cameraFlash: 0.1
      }
    };
  }

  private executeMove(action: CombatAction): CombatResult | null {
    const source = this.participants.get(action.source);
    if (!source || !action.position || !action.direction) return null;

    const event: CombatEvent = {
      type: 'effect',
      source: action.source,
      timestamp: performance.now(),
      visualEffect: 'move_trail',
      soundEffect: 'move_sound',
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    return {
      damage: 0,
      critical: false,
      effects: [],
      position: action.position,
      direction: action.direction,
      visualFeedback: {
        hitEffect: 'move_trail',
        damageNumber: '',
        screenShake: 0,
        cameraFlash: 0
      }
    };
  }

  private updateEnergy(deltaTime: number): void {
    const energyRegenRate = 1.0; // Energy points per second
    const maxEnergy = 100; // Maximum energy points

    for (const participant of this.participants.values()) {
      if (participant.stats.energy < maxEnergy) {
        participant.stats.energy = Math.min(
          maxEnergy,
          participant.stats.energy + (energyRegenRate * deltaTime)
        );
      }
    }
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
      visualEffect: winnerId ? 'victory_effect' : 'defeat_effect',
      soundEffect: winnerId ? 'victory_sound' : 'defeat_sound',
      isChildFriendly: this.options.childFriendlyMode
    };

    this.emit('combatEvent', event);

    if (this.tutorialState.isActive) {
      this.tutorialState.isActive = false;
      this.emit('tutorialEnd');
    }
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
      isTransformed: false,
      lastDamageTaken: 0,
      comboCount: 0,
      isVulnerable: true,
      visualState: {
        damageLevel: 0,
        isFlashing: false,
        currentEffect: null
      }
    });
  }

  public applyStatusEffect(targetId: string, effect: StatusEffect): void {
    const target = this.participants.get(targetId);
    if (target) {
      target.activeEffects.push(effect);
    }
  }

  public setDifficulty(difficulty: number): void {
    this.options.difficulty = Math.max(0, Math.min(1, difficulty));
  }

  public toggleChildFriendlyMode(enabled: boolean): void {
    this.options.childFriendlyMode = enabled;
  }

  public toggleTutorialMode(enabled: boolean): void {
    this.options.tutorialMode = enabled;
    if (enabled && !this.tutorialState.isActive) {
      this.startTutorial();
    }
  }

  public skip(): void {
    this.tutorialState.isActive = false;
    this.emit('tutorialComplete');
  }
} 