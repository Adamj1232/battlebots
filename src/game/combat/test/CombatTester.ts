import { CombatManager } from '../CombatManager.js';
import { CombatStats, AbilityInfo, DamageInfo } from '../types.js';
import { getAbilities } from '../abilities/index.js';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export class CombatTester {
  private combatManager: CombatManager;

  constructor() {
    this.combatManager = new CombatManager();
  }

  public async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Run all test methods
    results.push(await this.testBasicCombat());
    results.push(await this.testAbilitySystem());
    results.push(await this.testStatusEffects());
    results.push(await this.testEnergySystem());
    results.push(await this.testDamageCalculations());
    results.push(await this.testCooldowns());

    return results;
  }

  private async testBasicCombat(): Promise<TestResult> {
    try {
      // Setup combatants
      const attacker = this.setupTestCombatant('attacker', {
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        speed: 5,
        energy: 100,
        maxEnergy: 100
      });

      const defender = this.setupTestCombatant('defender', {
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 15,
        speed: 4,
        energy: 100,
        maxEnergy: 100
      });

      // Test basic attack
      const attackResult = this.combatManager.performAttack(
        'attacker',
        'defender',
        { isMelee: true }
      );

      if (!attackResult) {
        return {
          success: false,
          message: 'Basic attack failed to execute'
        };
      }

      const defenderStats = this.combatManager.getStats('defender');
      if (!defenderStats || defenderStats.health >= 100) {
        return {
          success: false,
          message: 'Attack did not reduce defender health'
        };
      }

      return {
        success: true,
        message: 'Basic combat test passed',
        data: {
          damageDealt: 100 - defenderStats.health
        }
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Basic combat test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testAbilitySystem(): Promise<TestResult> {
    try {
      // Setup combatant with abilities
      const attacker = this.setupTestCombatant(
        'attacker',
        {
          health: 100,
          maxHealth: 100,
          attack: 20,
          defense: 10,
          speed: 5,
          energy: 100,
          maxEnergy: 100
        },
        getAbilities('autobot', 'robot')
      );

      const defender = this.setupTestCombatant('defender', {
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 15,
        speed: 4,
        energy: 100,
        maxEnergy: 100
      });

      // Get initial energy
      const initialEnergy = this.combatManager.getStats('attacker')?.energy || 0;

      // Test ability usage
      const ability = attacker.abilities[0];
      const useResult = this.combatManager.useAbility(
        'attacker',
        ability.id,
        'defender'
      );

      if (!useResult) {
        return {
          success: false,
          message: 'Failed to use ability'
        };
      }

      // Verify energy cost
      const attackerStats = this.combatManager.getStats('attacker');
      const expectedEnergy = initialEnergy - ability.energyCost;
      
      if (!attackerStats || attackerStats.energy !== expectedEnergy) {
        return {
          success: false,
          message: `Ability did not consume correct energy. Expected: ${expectedEnergy}, Got: ${attackerStats?.energy}`
        };
      }

      return {
        success: true,
        message: 'Ability system test passed',
        data: {
          energyUsed: initialEnergy - attackerStats.energy
        }
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Ability system test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testStatusEffects(): Promise<TestResult> {
    try {
      // Setup combatant
      const target = this.setupTestCombatant('target', {
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        speed: 5,
        energy: 100,
        maxEnergy: 100
      });

      // Apply status effect
      const effectDuration = 1000; // 1 second
      this.combatManager.applyStatusEffect('target', {
        type: 'slow',
        duration: effectDuration,
        strength: 0.5
      });

      // Verify effect is active
      const initialState = this.getCombatantState('target');
      if (!initialState || initialState.activeEffects.length === 0) {
        return {
          success: false,
          message: 'Status effect was not applied'
        };
      }

      // Wait for effect to expire and update
      await new Promise(resolve => setTimeout(resolve, effectDuration + 100));
      this.combatManager.update(0.1); // Force an update

      // Verify effect is removed
      const updatedState = this.getCombatantState('target');
      if (!updatedState || updatedState.activeEffects.length > 0) {
        return {
          success: false,
          message: 'Status effect did not expire'
        };
      }

      return {
        success: true,
        message: 'Status effects test passed'
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Status effects test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testEnergySystem(): Promise<TestResult> {
    try {
      // Setup combatant with half energy
      const combatant = this.setupTestCombatant('test', {
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        speed: 5,
        energy: 50,
        maxEnergy: 100
      });

      // Get initial state
      const initialStats = this.combatManager.getStats('test');
      if (!initialStats) {
        return {
          success: false,
          message: 'Could not get initial stats'
        };
      }

      // Test energy regeneration over 1 second
      this.combatManager.update(1.0);

      // Get updated stats
      const updatedStats = this.combatManager.getStats('test');
      if (!updatedStats) {
        return {
          success: false,
          message: 'Could not get updated stats'
        };
      }

      const energyRegenerated = updatedStats.energy - initialStats.energy;
      const expectedRegenAmount = 20; // 20% of maxEnergy per second

      if (energyRegenerated < expectedRegenAmount) {
        return {
          success: false,
          message: `Energy did not regenerate enough. Expected at least ${expectedRegenAmount}, got ${energyRegenerated}. Initial: ${initialStats.energy}, Updated: ${updatedStats.energy}`
        };
      }

      return {
        success: true,
        message: 'Energy system test passed',
        data: {
          initialEnergy: initialStats.energy,
          finalEnergy: updatedStats.energy,
          energyRegenerated
        }
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Energy system test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testDamageCalculations(): Promise<TestResult> {
    try {
      const testCases = [
        { attack: 20, defense: 10, expectedRange: [8, 12] },  // baseDamage = 10
        { attack: 10, defense: 20, expectedRange: [1, 2] },   // baseDamage = 1 (minimum)
        { attack: 30, defense: 0, expectedRange: [24, 36] }   // baseDamage = 30
      ];

      for (const testCase of testCases) {
        const attacker = this.setupTestCombatant('attacker', {
          health: 100,
          maxHealth: 100,
          attack: testCase.attack,
          defense: 10,
          speed: 5,
          energy: 100,
          maxEnergy: 100
        });

        const defender = this.setupTestCombatant('defender', {
          health: 100,
          maxHealth: 100,
          attack: 15,
          defense: testCase.defense,
          speed: 4,
          energy: 100,
          maxEnergy: 100
        });

        this.combatManager.performAttack(
          'attacker',
          'defender',
          { isMelee: true }
        );

        const defenderStats = this.combatManager.getStats('defender');
        const damageDealt = 100 - (defenderStats?.health || 0);

        if (
          damageDealt < testCase.expectedRange[0] ||
          damageDealt > testCase.expectedRange[1]
        ) {
          return {
            success: false,
            message: `Damage calculation outside expected range: ${damageDealt} not in [${testCase.expectedRange[0]}, ${testCase.expectedRange[1]}] for attack=${testCase.attack}, defense=${testCase.defense}`
          };
        }
      }

      return {
        success: true,
        message: 'Damage calculations test passed'
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Damage calculations test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testCooldowns(): Promise<TestResult> {
    try {
      // Setup combatant
      const attacker = this.setupTestCombatant(
        'attacker',
        {
          health: 100,
          maxHealth: 100,
          attack: 20,
          defense: 10,
          speed: 5,
          energy: 100,
          maxEnergy: 100
        },
        getAbilities('autobot', 'robot')
      );

      // Use ability
      const ability = attacker.abilities[0];
      this.combatManager.useAbility('attacker', ability.id);

      // Try to use ability again immediately
      const secondUse = this.combatManager.useAbility('attacker', ability.id);

      if (secondUse) {
        return {
          success: false,
          message: 'Ability cooldown was not enforced'
        };
      }

      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, ability.cooldown + 100));

      // Try again after cooldown
      const thirdUse = this.combatManager.useAbility('attacker', ability.id);

      if (!thirdUse) {
        return {
          success: false,
          message: 'Ability could not be used after cooldown'
        };
      }

      return {
        success: true,
        message: 'Cooldown system test passed'
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Cooldown system test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private setupTestCombatant(
    id: string,
    stats: CombatStats,
    abilities: AbilityInfo[] = []
  ) {
    this.combatManager.initializeCombatant(id, stats, abilities);
    return {
      id,
      stats,
      abilities
    };
  }

  private getCombatantState(id: string) {
    return (this.combatManager as any).combatants.get(id);
  }
} 