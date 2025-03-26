import { Combatant } from '../types';
import { EnemyAI } from '../ai/EnemyAI';

interface SpawnPoint {
  x: number;
  y: number;
  z: number;
}

interface EnemySpawnConfig {
  minSpawnDistance: number;
  maxSpawnDistance: number;
  respawnDelay: number;
  maxActiveEnemies: number;
}

export class EnemySpawnService {
  private activeEnemies: Map<string, Combatant> = new Map();
  private spawnPoints: SpawnPoint[] = [];
  private spawnConfig: EnemySpawnConfig;
  private respawnTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<EnemySpawnConfig> = {}) {
    this.spawnConfig = {
      minSpawnDistance: config.minSpawnDistance || 10,
      maxSpawnDistance: config.maxSpawnDistance || 30,
      respawnDelay: config.respawnDelay || 5000,
      maxActiveEnemies: config.maxActiveEnemies || 3
    };
  }

  public setSpawnPoints(points: SpawnPoint[]): void {
    this.spawnPoints = points;
  }

  public spawnEnemy(enemy: Combatant): void {
    if (this.activeEnemies.size >= this.spawnConfig.maxActiveEnemies) {
      return;
    }

    const spawnPoint = this.getRandomSpawnPoint();
    if (!spawnPoint) {
      return;
    }

    enemy.position = spawnPoint;
    this.activeEnemies.set(enemy.id, enemy);
  }

  public handleEnemyDeath(enemyId: string): void {
    const enemy = this.activeEnemies.get(enemyId);
    if (!enemy) return;

    this.activeEnemies.delete(enemyId);
    
    // Schedule respawn
    const respawnTimer = setTimeout(() => {
      this.respawnEnemy(enemy);
    }, this.spawnConfig.respawnDelay);

    this.respawnTimers.set(enemyId, respawnTimer);
  }

  private respawnEnemy(enemy: Combatant): void {
    const spawnPoint = this.getRandomSpawnPoint();
    if (!spawnPoint) return;

    enemy.position = spawnPoint;
    enemy.stats.health = enemy.stats.maxHealth;
    enemy.stats.energy = enemy.stats.maxEnergy;
    
    this.activeEnemies.set(enemy.id, enemy);
    this.respawnTimers.delete(enemy.id);
  }

  private getRandomSpawnPoint(): SpawnPoint | null {
    if (this.spawnPoints.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * this.spawnPoints.length);
    const basePoint = this.spawnPoints[randomIndex];

    // Add some random variation to the spawn point
    return {
      x: basePoint.x + (Math.random() - 0.5) * 2,
      y: basePoint.y + (Math.random() - 0.5) * 2,
      z: basePoint.z + (Math.random() - 0.5) * 2
    };
  }

  public getActiveEnemies(): Combatant[] {
    return Array.from(this.activeEnemies.values());
  }

  public clearAllEnemies(): void {
    this.activeEnemies.clear();
    this.respawnTimers.forEach(timer => clearTimeout(timer));
    this.respawnTimers.clear();
  }
} 