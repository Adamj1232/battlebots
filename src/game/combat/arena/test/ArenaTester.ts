import { Object3D } from 'three';
import { BattleArenaManager } from '../BattleArenaManager';
import { ARENA_CONFIGS } from '../arenaConfigs';
import { CombatManager } from '../../CombatManager';
import { ArenaHazard, DestructibleObject, SpectatorNPC, ArenaAdvantage } from '../BattleArenaManager';

export class ArenaTester {
  private scene: Object3D;
  private arenaManager: BattleArenaManager;
  private combatManager: CombatManager;

  constructor(scene: Object3D, combatManager: CombatManager) {
    this.scene = scene;
    this.combatManager = combatManager;
    this.arenaManager = new BattleArenaManager(scene, combatManager);
  }

  public async testArenaInitialization(): Promise<void> {
    console.log('Testing arena initialization...');

    // Test each arena configuration
    for (const [arenaId, arenaConfig] of Object.entries(ARENA_CONFIGS)) {
      console.log(`\nTesting arena: ${arenaConfig.name}`);
      
      // Initialize arena
      this.arenaManager.initializeArena(arenaConfig);

      // Verify hazards
      console.log('Verifying hazards...');
      arenaConfig.hazards.forEach((hazard: ArenaHazard) => {
        console.log(`- Hazard ${hazard.id}: ${hazard.type} at ${hazard.position.x}, ${hazard.position.y}, ${hazard.position.z}`);
      });

      // Verify destructibles
      console.log('Verifying destructibles...');
      arenaConfig.destructibles.forEach((destructible: DestructibleObject) => {
        console.log(`- Destructible ${destructible.id}: ${destructible.type} with ${destructible.health} health`);
      });

      // Verify spectators
      console.log('Verifying spectators...');
      arenaConfig.spectators.forEach((spectator: SpectatorNPC) => {
        console.log(`- Spectator ${spectator.id}: ${spectator.type} at ${spectator.position.x}, ${spectator.position.y}, ${spectator.position.z}`);
      });

      // Verify advantages
      console.log('Verifying advantages...');
      arenaConfig.advantages.forEach((advantage: ArenaAdvantage) => {
        console.log(`- Advantage ${advantage.id}: ${advantage.type} with ${advantage.effect.value} value`);
      });
    }
  }

  public async testHazardSystem(): Promise<void> {
    console.log('\nTesting hazard system...');

    // Initialize test arena
    this.arenaManager.initializeArena(ARENA_CONFIGS.citySquare);

    // Test hazard damage
    console.log('Testing hazard damage...');
    const hazard = ARENA_CONFIGS.citySquare.hazards[0];
    console.log(`- Hazard ${hazard.id} deals ${hazard.damage} damage over ${hazard.duration} seconds`);

    // Simulate hazard duration
    console.log('Simulating hazard duration...');
    let remainingDuration = hazard.duration;
    while (remainingDuration > 0) {
      this.arenaManager.update(1); // Update with 1 second delta time
      remainingDuration -= 1;
      console.log(`- Hazard duration remaining: ${remainingDuration} seconds`);
    }
  }

  public async testDestructibleSystem(): Promise<void> {
    console.log('\nTesting destructible system...');

    // Initialize test arena
    this.arenaManager.initializeArena(ARENA_CONFIGS.factory);

    // Test destructible damage
    console.log('Testing destructible damage...');
    const destructible = ARENA_CONFIGS.factory.destructibles[0];
    console.log(`- Initial health: ${destructible.health}/${destructible.maxHealth}`);

    // Simulate damage
    console.log('Simulating damage...');
    for (let i = 0; i < 5; i++) {
      this.arenaManager.update(1); // Update with 1 second delta time
      console.log(`- Health after damage: ${destructible.health}/${destructible.maxHealth}`);
    }
  }

  public async testSpectatorSystem(): Promise<void> {
    console.log('\nTesting spectator system...');

    // Initialize test arena
    this.arenaManager.initializeArena(ARENA_CONFIGS.subwayStation);

    // Test spectator reactions
    console.log('Testing spectator reactions...');
    const spectator = ARENA_CONFIGS.subwayStation.spectators[0];
    console.log(`- Spectator ${spectator.id} reactions:`);
    console.log(`  * Battle start: ${spectator.reactions.onBattleStart}`);
    console.log(`  * Battle end: ${spectator.reactions.onBattleEnd}`);
    console.log(`  * Special move: ${spectator.reactions.onSpecialMove}`);
  }

  public async testAdvantageSystem(): Promise<void> {
    console.log('\nTesting advantage system...');

    // Initialize test arena
    this.arenaManager.initializeArena(ARENA_CONFIGS.citySquare);

    // Test advantage effects
    console.log('Testing advantage effects...');
    ARENA_CONFIGS.citySquare.advantages.forEach((advantage: ArenaAdvantage) => {
      console.log(`- Advantage ${advantage.id}:`);
      console.log(`  * Type: ${advantage.type}`);
      console.log(`  * Effect: ${advantage.effect.type} (${advantage.effect.value} value)`);
      console.log(`  * Duration: ${advantage.effect.duration} seconds`);
      console.log(`  * Respawn time: ${advantage.respawnTime} seconds`);
    });
  }

  public async runAllTests(): Promise<void> {
    console.log('Starting arena system tests...\n');
    
    await this.testArenaInitialization();
    await this.testHazardSystem();
    await this.testDestructibleSystem();
    await this.testSpectatorSystem();
    await this.testAdvantageSystem();

    console.log('\nAll arena system tests completed!');
  }
} 