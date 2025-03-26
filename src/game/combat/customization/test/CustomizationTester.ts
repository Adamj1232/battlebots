import { RobotCustomization } from '../RobotCustomization';
import { PartDamageSystem } from '../PartDamageSystem';
import { ROBOT_PARTS, PART_COMBINATIONS, STRATEGIC_ADVANTAGES } from '../partConfigs';
import { Object3D } from 'three';

export class CustomizationTester {
  private customization: RobotCustomization;
  private damageSystem: PartDamageSystem;
  private scene: Object3D;

  constructor(scene: Object3D) {
    this.scene = scene;
    this.customization = new RobotCustomization();
    this.damageSystem = new PartDamageSystem(scene, this.customization);
    
    // Initialize parts
    ROBOT_PARTS.forEach(part => this.customization.addPart(part));
    PART_COMBINATIONS.forEach(combo => this.customization.addCombination(combo));
  }

  public testPartEquipping(): void {
    console.log('Testing part equipping...');

    // Test equipping individual parts
    const headPart = ROBOT_PARTS.find(p => p.id === 'autobot_head_1');
    const torsoPart = ROBOT_PARTS.find(p => p.id === 'autobot_torso_1');

    if (headPart && torsoPart) {
      this.customization.equipPart(headPart.id);
      this.customization.equipPart(torsoPart.id);

      // Verify stats
      const stats = this.customization.getCombatStats();
      console.log('Combined stats:', stats);

      // Verify abilities
      const abilities = this.customization.getAbilities();
      console.log('Available abilities:', abilities);

      // Verify combination ability
      const combinationEffect = this.customization.getCombinationVisualEffect();
      console.log('Combination visual effect:', combinationEffect);
    }
  }

  public testDamageSystem(): void {
    console.log('Testing damage system...');

    // Test applying damage to parts
    const headPart = ROBOT_PARTS.find(p => p.id === 'autobot_head_1');
    if (headPart) {
      // Apply damage
      this.damageSystem.applyDamage(headPart.id, 0.5);
      console.log('Damage level:', this.damageSystem.getDamageLevel(headPart.id));

      // Test repair
      this.damageSystem.startRepair(headPart.id);
      console.log('Is repairing:', this.damageSystem.isPartRepairing(headPart.id));

      // Simulate repair progress
      this.damageSystem.update(5); // 5 seconds of repair
      console.log('Updated damage level:', this.damageSystem.getDamageLevel(headPart.id));
    }
  }

  public testStrategicAdvantages(): void {
    console.log('Testing strategic advantages...');

    // Test Matrix Mastery combination
    const matrixMastery = STRATEGIC_ADVANTAGES.matrixMastery;
    console.log('Matrix Mastery advantages:', matrixMastery);

    // Test Ion Rush combination
    const ionRush = STRATEGIC_ADVANTAGES.ionRush;
    console.log('Ion Rush advantages:', ionRush);

    // Test Dark Mastery combination
    const darkMastery = STRATEGIC_ADVANTAGES.darkMastery;
    console.log('Dark Mastery advantages:', darkMastery);
  }

  public runAllTests(): void {
    console.log('Running all customization tests...');
    this.testPartEquipping();
    this.testDamageSystem();
    this.testStrategicAdvantages();
    console.log('All customization tests completed.');
  }
} 