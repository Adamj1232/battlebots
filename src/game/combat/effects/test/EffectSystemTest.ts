import { Vector3 } from 'three';
import { CombatEffectManager } from '../CombatEffectManager.js';
import { EffectType } from '../types.js';

export class EffectSystemTest {
  private effectManager: CombatEffectManager;
  private testResults: { [key: string]: boolean } = {};

  constructor() {
    this.effectManager = CombatEffectManager.getInstance();
  }

  public runTests(): void {
    console.log('Running Effect System Tests...');
    
    this.testEffectCreation();
    this.testEffectPooling();
    this.testPerformanceScaling();
    this.testEffectCleanup();
    
    this.printResults();
  }

  private testEffectCreation(): void {
    console.log('\nTesting Effect Creation...');
    
    const position = new Vector3(0, 0, 0);
    const effect = this.effectManager.spawnEffect(EffectType.IMPACT, position, {
      scale: 2,
      duration: 0.5,
      intensity: 1
    });

    this.testResults['Effect Creation'] = effect !== null;
    console.log(`Effect Creation: ${this.testResults['Effect Creation'] ? 'PASS' : 'FAIL'}`);
  }

  private testEffectPooling(): void {
    console.log('\nTesting Effect Pooling...');
    
    const position = new Vector3(0, 0, 0);
    const effects: any[] = [];
    
    // Create multiple effects
    for (let i = 0; i < 5; i++) {
      effects.push(this.effectManager.spawnEffect(EffectType.IMPACT, position));
    }
    
    // Wait for effects to complete
    for (let i = 0; i < 10; i++) {
      this.effectManager.update(0.1);
    }
    
    // Try to create more effects
    const newEffect = this.effectManager.spawnEffect(EffectType.IMPACT, position);
    
    this.testResults['Effect Pooling'] = newEffect !== null;
    console.log(`Effect Pooling: ${this.testResults['Effect Pooling'] ? 'PASS' : 'FAIL'}`);
  }

  private testPerformanceScaling(): void {
    console.log('\nTesting Performance Scaling...');
    
    const position = new Vector3(0, 0, 0);
    const maxEffects = 100;
    const effects: any[] = [];
    
    // Try to create more effects than the maximum
    for (let i = 0; i < maxEffects + 10; i++) {
      effects.push(this.effectManager.spawnEffect(EffectType.IMPACT, position));
    }
    
    // Count active effects
    let activeCount = 0;
    for (let i = 0; i < 10; i++) {
      this.effectManager.update(0.1);
      activeCount = effects.filter(e => e && e.isActive).length;
    }
    
    this.testResults['Performance Scaling'] = activeCount <= maxEffects;
    console.log(`Performance Scaling: ${this.testResults['Performance Scaling'] ? 'PASS' : 'FAIL'}`);
  }

  private testEffectCleanup(): void {
    console.log('\nTesting Effect Cleanup...');
    
    const position = new Vector3(0, 0, 0);
    const effect = this.effectManager.spawnEffect(EffectType.IMPACT, position, {
      duration: 0.1
    });
    
    // Wait for effect to complete
    for (let i = 0; i < 10; i++) {
      this.effectManager.update(0.1);
    }
    
    this.testResults['Effect Cleanup'] = effect ? !effect.isActive : false;
    console.log(`Effect Cleanup: ${this.testResults['Effect Cleanup'] ? 'PASS' : 'FAIL'}`);
  }

  private printResults(): void {
    console.log('\nTest Results:');
    Object.entries(this.testResults).forEach(([test, passed]) => {
      console.log(`${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const allPassed = Object.values(this.testResults).every(result => result);
    console.log(`\nOverall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  }
} 