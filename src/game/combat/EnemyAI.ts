import { Object3D, Vector3 } from 'three';
import { CombatManager } from './CombatManager';
import { CombatStats } from './types';

interface AIState {
  currentTarget?: string;
  lastActionTime: number;
  lastPositionChange: number;
  currentBehavior: 'aggressive' | 'defensive' | 'ranged';
  isRetreating: boolean;
}

export class EnemyAI {
  private combatManager: CombatManager;
  private scene: Object3D;
  private enemies: Map<string, AIState> = new Map();
  private difficulty: number; // 0-1 scale

  constructor(scene: Object3D, combatManager: CombatManager, difficulty: number = 0.5) {
    this.scene = scene;
    this.combatManager = combatManager;
    this.difficulty = Math.max(0, Math.min(1, difficulty));
  }

  public registerEnemy(enemyId: string): void {
    this.enemies.set(enemyId, {
      lastActionTime: 0,
      lastPositionChange: 0,
      currentBehavior: 'aggressive',
      isRetreating: false
    });
  }

  public update(deltaTime: number): void {
    const now = Date.now();

    Array.from(this.enemies.entries()).forEach(([enemyId, state]) => {
      // Skip if not enough time has passed since last action
      // Higher difficulty = faster actions
      const minActionDelay = 2000 - (this.difficulty * 1000);
      if (now - state.lastActionTime < minActionDelay) return;

      const enemyObj = this.scene.getObjectByName(enemyId);
      if (!enemyObj) return;

      // Update behavior based on health
      this.updateBehavior(enemyId, state);

      // Execute current behavior
      switch (state.currentBehavior) {
        case 'aggressive':
          this.executeAggressiveBehavior(enemyId, state, enemyObj);
          break;
        case 'defensive':
          this.executeDefensiveBehavior(enemyId, state, enemyObj);
          break;
        case 'ranged':
          this.executeRangedBehavior(enemyId, state, enemyObj);
          break;
      }

      state.lastActionTime = now;
    });
  }

  private updateBehavior(enemyId: string, state: AIState): void {
    const participant = this.combatManager['participants'].get(enemyId);
    if (!participant) return;

    const healthPercentage = participant.stats.health / participant.stats.maxHealth;

    // Change behavior based on health
    if (healthPercentage < 0.3) {
      state.currentBehavior = 'defensive';
      state.isRetreating = true;
    } else if (healthPercentage < 0.6) {
      state.currentBehavior = 'ranged';
      state.isRetreating = false;
    } else {
      state.currentBehavior = 'aggressive';
      state.isRetreating = false;
    }
  }

  private executeAggressiveBehavior(enemyId: string, state: AIState, enemyObj: Object3D): void {
    const target = this.findNearestTarget(enemyObj.position);
    if (!target) return;

    state.currentTarget = target.userData.combatId;

    // Move towards target
    this.moveTowards(enemyObj, target.position);

    // Attack if in range
    if (this.isInRange(enemyObj.position, target.position, 5)) {
      this.combatManager.submitAction({
        type: 'attack',
        source: enemyId,
        target: target.userData.combatId,
        position: enemyObj.position,
        direction: target.position.clone().sub(enemyObj.position).normalize(),
        data: { isMelee: true }
      });
    }

    // Use abilities based on difficulty
    if (Math.random() < this.difficulty * 0.3) {
      this.useRandomAbility(enemyId, target.userData.combatId);
    }
  }

  private executeDefensiveBehavior(enemyId: string, state: AIState, enemyObj: Object3D): void {
    const target = this.findNearestTarget(enemyObj.position);
    if (!target) return;

    state.currentTarget = target.userData.combatId;

    // Move away from target if too close
    if (this.isInRange(enemyObj.position, target.position, 8)) {
      this.moveAway(enemyObj, target.position);
    }

    // Attack only if player is very close
    if (this.isInRange(enemyObj.position, target.position, 4)) {
      this.combatManager.submitAction({
        type: 'attack',
        source: enemyId,
        target: target.userData.combatId,
        position: enemyObj.position,
        direction: target.position.clone().sub(enemyObj.position).normalize(),
        data: { isMelee: true }
      });
    }
  }

  private executeRangedBehavior(enemyId: string, state: AIState, enemyObj: Object3D): void {
    const target = this.findNearestTarget(enemyObj.position);
    if (!target) return;

    state.currentTarget = target.userData.combatId;

    // Maintain optimal range
    const distanceToTarget = enemyObj.position.distanceTo(target.position);
    if (distanceToTarget < 8) {
      this.moveAway(enemyObj, target.position);
    } else if (distanceToTarget > 12) {
      this.moveTowards(enemyObj, target.position);
    }

    // Perform ranged attacks
    if (this.isInRange(enemyObj.position, target.position, 15)) {
      this.combatManager.submitAction({
        type: 'attack',
        source: enemyId,
        target: target.userData.combatId,
        position: enemyObj.position,
        direction: target.position.clone().sub(enemyObj.position).normalize(),
        data: { isMelee: false }
      });
    }
  }

  private findNearestTarget(position: Vector3): Object3D | null {
    let nearest: Object3D | null = null;
    let minDistance = Infinity;

    this.scene.traverse((object) => {
      if (object.userData.isPlayer) {
        const distance = position.distanceTo(object.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = object;
        }
      }
    });

    return nearest;
  }

  private moveTowards(enemy: Object3D, targetPosition: Vector3): void {
    const direction = targetPosition.clone().sub(enemy.position).normalize();
    const speed = 0.1 + (this.difficulty * 0.1); // Speed increases with difficulty
    enemy.position.add(direction.multiplyScalar(speed));
  }

  private moveAway(enemy: Object3D, targetPosition: Vector3): void {
    const direction = enemy.position.clone().sub(targetPosition).normalize();
    const speed = 0.15 + (this.difficulty * 0.1);
    enemy.position.add(direction.multiplyScalar(speed));
  }

  private isInRange(from: Vector3, to: Vector3, range: number): boolean {
    return from.distanceTo(to) <= range;
  }

  private useRandomAbility(enemyId: string, targetId: string): void {
    // Simple random ability usage
    const abilityId = `ability_${Math.floor(Math.random() * 4) + 1}`;
    this.combatManager.submitAction({
      type: 'ability',
      source: enemyId,
      target: targetId,
      position: this.scene.getObjectByName(enemyId)?.position || new Vector3(),
      direction: new Vector3(0, 1, 0),
      data: { abilityId }
    });
  }

  public setDifficulty(difficulty: number): void {
    this.difficulty = Math.max(0, Math.min(1, difficulty));
  }
} 