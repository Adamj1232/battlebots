import { EventEmitter } from 'events';
import { CombatState, CombatStatistics, CombatAchievement, CombatProgression, EnemyPersistence, CombatSaveData } from './types';
import { CombatEvent } from '../types';

export class CombatStateManager extends EventEmitter {
  private state: CombatState;
  private enemies: Map<string, EnemyPersistence>;
  private saveInterval: number = 5 * 60 * 1000; // 5 minutes
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.state = this.initializeState();
    this.enemies = new Map();
    this.startAutoSave();
  }

  private initializeState(): CombatState {
    return {
      statistics: {
        totalBattles: 0,
        victories: 0,
        defeats: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalHealing: 0,
        totalEnergyUsed: 0,
        averageBattleDuration: 0,
        favoriteAbility: '',
        favoriteArena: '',
        lastBattleDate: new Date().toISOString(),
        streak: 0,
        bestStreak: 0,
        totalTransformations: 0,
        totalSpecialMoves: 0,
        totalEnvironmentalDamage: 0,
        totalHazardsTriggered: 0,
        totalAdvantagesCollected: 0
      },
      achievements: this.initializeAchievements(),
      progression: {
        level: 1,
        experience: 0,
        experienceToNextLevel: 1000,
        availablePoints: 0,
        unlockedAbilities: [],
        unlockedTransformations: [],
        unlockedArenas: ['citySquare'],
        titles: ['Novice Fighter'],
        activeTitle: 'Novice Fighter',
        cosmetics: []
      },
      lastSaveDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  private initializeAchievements(): CombatAchievement[] {
    return [
      {
        id: 'first_victory',
        name: 'First Victory',
        description: 'Win your first battle',
        category: 'battle',
        requirement: 1,
        currentProgress: 0,
        isUnlocked: false,
        reward: {
          type: 'xp',
          value: 500
        },
        icon: '🏆'
      },
      {
        id: 'ability_master',
        name: 'Ability Master',
        description: 'Use abilities 100 times',
        category: 'ability',
        requirement: 100,
        currentProgress: 0,
        isUnlocked: false,
        reward: {
          type: 'ability',
          value: 'special_ability'
        },
        icon: '✨'
      },
      {
        id: 'transformation_king',
        name: 'Transformation King',
        description: 'Transform 50 times',
        category: 'transformation',
        requirement: 50,
        currentProgress: 0,
        isUnlocked: false,
        reward: {
          type: 'title',
          value: 'Transformation King'
        },
        icon: '👑'
      }
    ];
  }

  public async loadState(): Promise<void> {
    try {
      const savedData = localStorage.getItem('combatState');
      if (savedData) {
        const data: CombatSaveData = JSON.parse(savedData);
        this.state = data.state;
        this.enemies = new Map(Object.entries(data.enemies));
        this.emit('stateLoaded', this.state);
      }
    } catch (error) {
      console.error('Error loading combat state:', error);
    }
  }

  public async saveState(): Promise<void> {
    try {
      const saveData: CombatSaveData = {
        state: this.state,
        enemies: Array.from(this.enemies.values()),
        currentArena: 'citySquare' // This should come from your arena manager
      };
      localStorage.setItem('combatState', JSON.stringify(saveData));
      this.state.lastSaveDate = new Date().toISOString();
      this.emit('stateSaved', this.state);
    } catch (error) {
      console.error('Error saving combat state:', error);
    }
  }

  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.saveState();
    }, this.saveInterval);
  }

  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  public updateStatistics(event: CombatEvent): void {
    const stats = this.state.statistics;
    
    switch (event.type) {
      case 'damage':
        stats.totalDamageDealt += event.amount || 0;
        break;
      case 'heal':
        stats.totalHealing += event.amount || 0;
        break;
      case 'ability':
        stats.totalSpecialMoves++;
        // Energy cost is not directly available in CombatEvent
        // We'll need to get it from the CombatAction that triggered this event
        break;
      case 'transform':
        stats.totalTransformations++;
        break;
      case 'victory':
        stats.victories++;
        stats.streak++;
        stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
        break;
      case 'defeat':
        stats.defeats++;
        stats.streak = 0;
        break;
    }

    stats.totalBattles = stats.victories + stats.defeats;
    this.checkAchievements();
  }

  public addExperience(amount: number): void {
    const progression = this.state.progression;
    progression.experience += amount;

    // Level up if enough experience
    while (progression.experience >= progression.experienceToNextLevel) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    const progression = this.state.progression;
    progression.level++;
    progression.experience -= progression.experienceToNextLevel;
    progression.experienceToNextLevel = Math.floor(progression.experienceToNextLevel * 1.5);
    progression.availablePoints += 2;
    
    this.emit('levelUp', {
      level: progression.level,
      availablePoints: progression.availablePoints
    });
  }

  private checkAchievements(): void {
    this.state.achievements.forEach(achievement => {
      if (!achievement.isUnlocked) {
        switch (achievement.id) {
          case 'first_victory':
            if (this.state.statistics.victories >= achievement.requirement) {
              this.unlockAchievement(achievement);
            }
            break;
          case 'ability_master':
            if (this.state.statistics.totalSpecialMoves >= achievement.requirement) {
              this.unlockAchievement(achievement);
            }
            break;
          case 'transformation_king':
            if (this.state.statistics.totalTransformations >= achievement.requirement) {
              this.unlockAchievement(achievement);
            }
            break;
        }
      }
    });
  }

  private unlockAchievement(achievement: CombatAchievement): void {
    achievement.isUnlocked = true;
    achievement.unlockedDate = new Date().toISOString();
    
    // Apply reward
    switch (achievement.reward.type) {
      case 'xp':
        this.addExperience(achievement.reward.value as number);
        break;
      case 'ability':
        this.state.progression.unlockedAbilities.push(achievement.reward.value as string);
        break;
      case 'title':
        this.state.progression.titles.push(achievement.reward.value as string);
        break;
      case 'cosmetic':
        this.state.progression.cosmetics.push(achievement.reward.value as string);
        break;
    }

    this.emit('achievementUnlocked', achievement);
  }

  public updateEnemyState(enemyId: string, state: Partial<EnemyPersistence>): void {
    const enemy = this.enemies.get(enemyId);
    if (enemy) {
      Object.assign(enemy, state);
      this.enemies.set(enemyId, enemy);
    }
  }

  public getEnemyState(enemyId: string): EnemyPersistence | undefined {
    return this.enemies.get(enemyId);
  }

  public getState(): CombatState {
    return { ...this.state };
  }

  public getStatistics(): CombatStatistics {
    return { ...this.state.statistics };
  }

  public getAchievements(): CombatAchievement[] {
    return [...this.state.achievements];
  }

  public getProgression(): CombatProgression {
    return { ...this.state.progression };
  }
} 