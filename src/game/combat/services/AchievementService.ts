import { Achievement, CombatStats } from '../types';

export class AchievementService {
  private achievements: Achievement[] = [
    {
      id: 'first_blood',
      title: 'First Blood',
      description: 'Win your first battle',
      icon: '⚔️',
      isUnlocked: false
    },
    {
      id: 'combo_master',
      title: 'Combo Master',
      description: 'Perform a 10-hit combo',
      icon: '🔥',
      isUnlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'critical_expert',
      title: 'Critical Expert',
      description: 'Land 50 critical hits',
      icon: '💥',
      isUnlocked: false,
      progress: 0,
      maxProgress: 50
    },
    {
      id: 'survivor',
      title: 'Survivor',
      description: 'Win 10 battles',
      icon: '🛡️',
      isUnlocked: false,
      progress: 0,
      maxProgress: 10
    }
  ];

  private stats: CombatStats = {
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    attack: 20,
    defense: 10,
    speed: 5,
    battlesWon: 0,
    battlesLost: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    criticalHits: 0,
    abilitiesUsed: 0,
    transformations: 0,
    longestCombo: 0
  };

  constructor() {
    this.loadProgress();
  }

  private loadProgress(): void {
    const savedStats = localStorage.getItem('combatStats');
    const savedAchievements = localStorage.getItem('achievements');

    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
    if (savedAchievements) {
      this.achievements = JSON.parse(savedAchievements);
    }
  }

  private saveProgress(): void {
    localStorage.setItem('combatStats', JSON.stringify(this.stats));
    localStorage.setItem('achievements', JSON.stringify(this.achievements));
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  public getStats(): CombatStats {
    return this.stats;
  }

  public updateStats(updates: Partial<CombatStats>): void {
    this.stats = { ...this.stats, ...updates };
    this.checkAchievements();
    this.saveProgress();
  }

  private checkAchievements(): void {
    // First Blood
    if (this.stats.battlesWon > 0) {
      this.unlockAchievement('first_blood');
    }

    // Combo Master
    const comboAchievement = this.achievements.find(a => a.id === 'combo_master');
    if (comboAchievement && this.stats.longestCombo > (comboAchievement.progress || 0)) {
      comboAchievement.progress = this.stats.longestCombo;
      if (this.stats.longestCombo >= 10) {
        this.unlockAchievement('combo_master');
      }
    }

    // Critical Expert
    const criticalAchievement = this.achievements.find(a => a.id === 'critical_expert');
    if (criticalAchievement) {
      criticalAchievement.progress = this.stats.criticalHits;
      if (this.stats.criticalHits >= 50) {
        this.unlockAchievement('critical_expert');
      }
    }

    // Survivor
    const survivorAchievement = this.achievements.find(a => a.id === 'survivor');
    if (survivorAchievement) {
      survivorAchievement.progress = this.stats.battlesWon;
      if (this.stats.battlesWon >= 10) {
        this.unlockAchievement('survivor');
      }
    }
  }

  private unlockAchievement(id: string): void {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      this.saveProgress();
    }
  }
} 