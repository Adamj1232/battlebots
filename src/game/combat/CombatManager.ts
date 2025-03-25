import { Vector3 } from 'three';
import { CombatStats, DamageInfo, StatusEffect, AbilityInfo, CombatState, AttackOptions } from './types.js';

export class CombatManager {
  private combatants: Map<string, CombatState> = new Map();
  private stats: Map<string, CombatStats> = new Map();
  private abilities: Map<string, AbilityInfo[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // TODO: Add event listeners for input handling
  }

  public initializeCombatant(id: string, stats: CombatStats, abilities: AbilityInfo[]) {
    this.stats.set(id, stats);
    this.abilities.set(id, abilities);
    this.combatants.set(id, {
      isInCombat: false,
      activeEffects: [],
      lastAttackTime: 0,
      currentEnergy: stats.energy,
      abilityCooldowns: {}
    });
  }

  public performAttack(
    attackerId: string,
    targetId: string,
    options: AttackOptions
  ): boolean {
    const attacker = this.stats.get(attackerId);
    const target = this.stats.get(targetId);
    const attackerState = this.combatants.get(attackerId);

    if (!attacker || !target || !attackerState) return false;

    // Check attack cooldown
    const now = Date.now();
    if (now - attackerState.lastAttackTime < 500) return false; // 500ms cooldown

    // Calculate base damage
    const damage: DamageInfo = {
      amount: this.calculateDamage(attacker.attack, target.defense),
      type: 'physical',
      source: new Vector3(), // TODO: Get actual attacker position
      knockback: options.isMelee ? 5 : 2
    };

    this.applyDamage(targetId, damage);
    attackerState.lastAttackTime = now;
    return true;
  }

  public useAbility(
    userId: string,
    abilityId: string,
    targetId?: string
  ): boolean {
    const userState = this.combatants.get(userId);
    const userStats = this.stats.get(userId);
    const abilities = this.abilities.get(userId);

    if (!userState || !userStats || !abilities) return false;

    const ability = abilities.find(a => a.id === abilityId);
    if (!ability) return false;

    // Check cooldown
    if (userState.abilityCooldowns[abilityId] > Date.now()) return false;

    // Check energy cost
    if (userState.currentEnergy < ability.energyCost) return false;

    // Consume energy first
    userState.currentEnergy = Math.max(0, userState.currentEnergy - ability.energyCost);

    // Apply ability effects
    if (ability.damage && targetId) {
      const damage: DamageInfo = {
        amount: ability.damage,
        type: ability.damageType || 'physical',
        source: new Vector3(), // TODO: Get actual user position
      };
      this.applyDamage(targetId, damage);
    }

    // Apply status effects
    if (ability.effects && targetId) {
      ability.effects.forEach(effect => {
        this.applyStatusEffect(targetId, effect);
      });
    }

    // Update cooldown
    userState.abilityCooldowns[abilityId] = Date.now() + ability.cooldown;

    return true;
  }

  private calculateDamage(attack: number, defense: number): number {
    // Base damage is attack minus defense, minimum of 1
    const baseDamage = Math.max(1, attack - defense);
    // Add randomness between 0.8 and 1.2
    const randomFactor = 0.8 + Math.random() * 0.4;
    return Math.round(baseDamage * randomFactor);
  }

  public applyDamage(targetId: string, damage: DamageInfo): void {
    const targetStats = this.stats.get(targetId);
    if (!targetStats) return;

    // Apply damage directly since defense is already handled in calculateDamage
    targetStats.health = Math.max(0, targetStats.health - damage.amount);

    // TODO: Trigger visual effects and sound
    // TODO: Apply knockback using physics system
  }

  public applyStatusEffect(targetId: string, effect: StatusEffect): void {
    const targetState = this.combatants.get(targetId);
    if (!targetState) return;

    // Remove any existing effect of the same type
    targetState.activeEffects = targetState.activeEffects.filter(
      e => e.type !== effect.type
    );

    // Add new effect
    targetState.activeEffects.push({
      ...effect,
      duration: Date.now() + effect.duration
    });
  }

  public getStats(id: string): CombatStats | undefined {
    const stats = this.stats.get(id);
    const state = this.combatants.get(id);
    
    if (!stats || !state) return undefined;

    return {
      ...stats,
      energy: state.currentEnergy
    };
  }

  public update(deltaTime: number): void {
    const now = Date.now();

    // Update all combatants
    Array.from(this.combatants.entries()).forEach(([id, state]) => {
      // Update energy regeneration
      const stats = this.stats.get(id);
      if (stats) {
        const regenRate = stats.maxEnergy * 0.2; // 20% per second
        const regenAmount = regenRate * deltaTime;
        state.currentEnergy = Math.min(
          stats.maxEnergy,
          state.currentEnergy + regenAmount
        );
      }

      // Clean up expired effects
      state.activeEffects = state.activeEffects.filter(effect => {
        return effect.duration > now;
      });
    });
  }
} 