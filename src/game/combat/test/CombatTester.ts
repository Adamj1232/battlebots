import { CombatManager } from '../CombatManager.js';
import { CombatStats, AbilityInfo, CombatOptions } from '../types.js';
import { getAbilities } from '../abilities/index.js';
import { PhysicsEngine } from '../../physics/PhysicsEngine.js';
import { PhysicsConfig } from '../../physics/types.js';
import * as THREE from 'three';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export class CombatTester {
  private combatManager: CombatManager;

  constructor() {
    const physicsEngine = new PhysicsEngine(PhysicsConfig.getDefault());
    const combatOptions: CombatOptions = {
      isRealTime: true,
      turnDuration: 5,
      criticalMultiplier: 1.5,
      childFriendlyMode: true,
      maxSimultaneousEffects: 10,
      difficulty: 0.5,
      tutorialMode: true,
      maxEnergy: 100,
      energyRegenRate: 20,
      criticalChance: 0.1
    };
    this.combatManager = new CombatManager(physicsEngine, combatOptions);
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
        maxEnergy: 100,
        battlesWon: 0,
        battlesLost: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        criticalHits: 0,
        abilitiesUsed: 0,
        transformations: 0,
        longestCombo: 0
      });

      const defender = this.setupTestCombatant('defender', {
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 15,
        speed: 4,
        energy: 100,
        maxEnergy: 100,
        battlesWon: 0,
        battlesLost: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        criticalHits: 0,
        abilitiesUsed: 0,
        transformations: 0,
        longestCombo: 0
      });

      // Test basic attack
      this.combatManager.submitAction({
        type: 'attack',
        source: 'attacker',
        target: 'defender',
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(0, 1, 0),
        data: { isMelee: true },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });

      const defenderState = this.combatManager.getParticipant('defender');
      if (!defenderState || defenderState.stats.health >= 100) {
        return {
          success: false,
          message: 'Attack did not reduce defender health'
        };
      }

      return {
        success: true,
        message: 'Basic combat test passed',
        data: {
          damageDealt: 100 - defenderState.stats.health
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
          maxEnergy: 100,
          battlesWon: 0,
          battlesLost: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          criticalHits: 0,
          abilitiesUsed: 0,
          transformations: 0,
          longestCombo: 0
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
        maxEnergy: 100,
        battlesWon: 0,
        battlesLost: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        criticalHits: 0,
        abilitiesUsed: 0,
        transformations: 0,
        longestCombo: 0
      });

      // Get initial energy
      const attackerState = this.combatManager.getParticipant('attacker');
      const initialEnergy = attackerState?.stats.energy || 0;

      // Test ability usage
      const ability = attacker.abilities[0];
      this.combatManager.submitAction({
        type: 'ability',
        source: 'attacker',
        target: 'defender',
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(0, 1, 0),
        data: { abilityId: ability.id },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });

      // Verify energy cost
      const updatedAttackerState = this.combatManager.getParticipant('attacker');
      const expectedEnergy = initialEnergy - ability.energyCost;
      
      if (!updatedAttackerState || updatedAttackerState.stats.energy !== expectedEnergy) {
        return {
          success: false,
          message: `Ability did not consume correct energy. Expected: ${expectedEnergy}, Got: ${updatedAttackerState?.stats.energy}`
        };
      }

      return {
        success: true,
        message: 'Ability system test passed',
        data: {
          energyUsed: initialEnergy - updatedAttackerState.stats.energy
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
        maxEnergy: 100,
        battlesWon: 0,
        battlesLost: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        criticalHits: 0,
        abilitiesUsed: 0,
        transformations: 0,
        longestCombo: 0
      });

      // Apply status effect
      const effectDuration = 1000; // 1 second
      this.combatManager.applyStatusEffect('target', {
        type: 'slow',
        duration: effectDuration,
        strength: 0.5,
        source: 'test'
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
        maxEnergy: 100,
        battlesWon: 0,
        battlesLost: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        criticalHits: 0,
        abilitiesUsed: 0,
        transformations: 0,
        longestCombo: 0
      });

      // Get initial state
      const initialState = this.combatManager.getParticipant('test');
      if (!initialState) {
        return {
          success: false,
          message: 'Could not get initial stats'
        };
      }

      // Test energy regeneration over 1 second
      this.combatManager.update(1.0);

      // Get updated stats
      const updatedState = this.combatManager.getParticipant('test');
      if (!updatedState) {
        return {
          success: false,
          message: 'Could not get updated stats'
        };
      }

      const energyRegenerated = updatedState.stats.energy - initialState.stats.energy;
      const expectedRegenAmount = 20; // 20% of maxEnergy per second

      if (energyRegenerated < expectedRegenAmount) {
        return {
          success: false,
          message: `Energy did not regenerate enough. Expected at least ${expectedRegenAmount}, got ${energyRegenerated}. Initial: ${initialState.stats.energy}, Updated: ${updatedState.stats.energy}`
        };
      }

      return {
        success: true,
        message: 'Energy system test passed',
        data: {
          initialEnergy: initialState.stats.energy,
          finalEnergy: updatedState.stats.energy,
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
          maxEnergy: 100,
          battlesWon: 0,
          battlesLost: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          criticalHits: 0,
          abilitiesUsed: 0,
          transformations: 0,
          longestCombo: 0
        });

        const defender = this.setupTestCombatant('defender', {
          health: 100,
          maxHealth: 100,
          attack: 15,
          defense: testCase.defense,
          speed: 4,
          energy: 100,
          maxEnergy: 100,
          battlesWon: 0,
          battlesLost: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          criticalHits: 0,
          abilitiesUsed: 0,
          transformations: 0,
          longestCombo: 0
        });

        this.combatManager.submitAction({
          type: 'attack',
          source: 'attacker',
          target: 'defender',
          position: new THREE.Vector3(),
          direction: new THREE.Vector3(0, 1, 0),
          data: { isMelee: true },
          timestamp: Date.now(),
          isChildFriendly: true,
          warningDuration: 1000
        });

        const defenderState = this.combatManager.getParticipant('defender');
        const damageDealt = 100 - (defenderState?.stats.health || 0);

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
          maxEnergy: 100,
          battlesWon: 0,
          battlesLost: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          criticalHits: 0,
          abilitiesUsed: 0,
          transformations: 0,
          longestCombo: 0
        },
        getAbilities('autobot', 'robot')
      );

      // Use ability
      const ability = attacker.abilities[0];
      this.combatManager.submitAction({
        type: 'ability',
        source: 'attacker',
        target: 'defender',
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(0, 1, 0),
        data: { abilityId: ability.id },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });

      // Try to use ability again immediately
      this.combatManager.submitAction({
        type: 'ability',
        source: 'attacker',
        target: 'defender',
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(0, 1, 0),
        data: { abilityId: ability.id },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });

      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, ability.cooldown + 100));

      // Try again after cooldown
      this.combatManager.submitAction({
        type: 'ability',
        source: 'attacker',
        target: 'defender',
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(0, 1, 0),
        data: { abilityId: ability.id },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });

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