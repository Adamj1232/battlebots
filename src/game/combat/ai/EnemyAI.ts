import { Combatant, Ability } from '../types';

export class EnemyAI {
  private enemy: Combatant;
  private target: Combatant | null = null;
  private lastActionTime: number = 0;
  private decisionDelay: number = 1000; // 1 second between decisions

  constructor(enemy: Combatant) {
    this.enemy = enemy;
  }

  public update(target: Combatant | null, deltaTime: number): void {
    this.target = target;
    const currentTime = Date.now();

    if (currentTime - this.lastActionTime >= this.decisionDelay) {
      this.makeDecision();
      this.lastActionTime = currentTime;
    }
  }

  private makeDecision(): void {
    if (!this.target) return;

    // Calculate distance to target
    const distance = this.calculateDistance(this.enemy.position, this.target.position);

    // If too far, move closer
    if (distance > 5) {
      this.moveTowardsTarget();
      return;
    }

    // If in range, try to use abilities
    if (this.enemy.stats.energy >= 20) {
      const ability = this.chooseAbility();
      if (ability) {
        this.useAbility(ability);
        return;
      }
    }

    // If no ability available, try to maintain optimal distance
    if (distance < 3) {
      this.moveAwayFromTarget();
    }
  }

  private calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private moveTowardsTarget(): void {
    if (!this.target) return;

    const direction = {
      x: this.target.position.x - this.enemy.position.x,
      y: this.target.position.y - this.enemy.position.y,
      z: this.target.position.z - this.enemy.position.z
    };

    // Normalize direction
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
      direction.z /= length;
    }

    // Move in direction
    this.enemy.position.x += direction.x * 0.1;
    this.enemy.position.y += direction.y * 0.1;
    this.enemy.position.z += direction.z * 0.1;
  }

  private moveAwayFromTarget(): void {
    if (!this.target) return;

    const direction = {
      x: this.enemy.position.x - this.target.position.x,
      y: this.enemy.position.y - this.target.position.y,
      z: this.enemy.position.z - this.target.position.z
    };

    // Normalize direction
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
      direction.z /= length;
    }

    // Move away
    this.enemy.position.x += direction.x * 0.1;
    this.enemy.position.y += direction.y * 0.1;
    this.enemy.position.z += direction.z * 0.1;
  }

  private chooseAbility(): Ability | null {
    // Simple ability selection based on energy and cooldowns
    return this.enemy.abilities.find(ability => 
      this.enemy.stats.energy >= ability.energyCost
    ) || null;
  }

  private useAbility(ability: Ability): void {
    if (!this.target) return;

    // Apply ability effects
    if (ability.damage) {
      this.target.stats.health -= ability.damage;
    }

    if (ability.effects) {
      this.target.statusEffects.push(...ability.effects);
    }

    // Consume energy
    this.enemy.stats.energy -= ability.energyCost;
  }
} 