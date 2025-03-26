import { CombatManager } from '../CombatManager';
import { PhysicsEngine } from '../../physics/PhysicsEngine';
import { PhysicsConfig } from '../../physics/PhysicsConfig';
import * as THREE from 'three';
import {
  CombatState,
  CombatAction,
  StatusEffect
} from '../types';

describe('CombatManager', () => {
  let combatManager: CombatManager;
  let physicsEngine: PhysicsEngine;
  let mockParticipant1: CombatState;
  let mockParticipant2: CombatState;

  beforeEach(() => {
    physicsEngine = new PhysicsEngine(PhysicsConfig.getDefault());
    combatManager = new CombatManager(physicsEngine, {
      isRealTime: true,
      turnDuration: 1,
      maxEnergy: 100,
      energyRegenRate: 5,
      criticalMultiplier: 1.5,
      criticalChance: 0.1
    });

    mockParticipant1 = {
      id: 'robot1',
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      stats: {
        health: 100,
        energy: 100,
        attack: 20,
        defense: 10,
        speed: 5
      },
      faction: 'autobot',
      isTransformed: false,
      activeEffects: []
    };

    mockParticipant2 = {
      id: 'robot2',
      position: new THREE.Vector3(1, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      stats: {
        health: 100,
        energy: 100,
        attack: 15,
        defense: 15,
        speed: 4
      },
      faction: 'decepticon',
      isTransformed: false,
      activeEffects: []
    };
  });

  it('should initialize with participants', () => {
    combatManager.initialize([mockParticipant1, mockParticipant2]);
    expect(combatManager.isActive()).toBe(true);
    expect(combatManager.getAllParticipants()).toHaveLength(2);
  });

  it('should handle basic attack actions', () => {
    combatManager.initialize([mockParticipant1, mockParticipant2]);

    const attackAction: CombatAction = {
      type: 'attack',
      source: 'robot1',
      target: 'robot2',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(1, 0, 0)
    };

    combatManager.submitAction(attackAction);
    combatManager.update(0.016); // 60fps

    const target = combatManager.getParticipant('robot2');
    expect(target?.stats.health).toBeLessThan(100);
  });

  it('should handle ability actions', () => {
    combatManager.initialize([mockParticipant1, mockParticipant2]);

    const abilityAction: CombatAction = {
      type: 'ability',
      source: 'robot1',
      target: 'robot2',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(1, 0, 0),
      data: {
        energyCost: 30,
        effects: [{
          type: 'stun',
          duration: 2,
          strength: 1,
          source: 'robot1'
        }]
      }
    };

    combatManager.submitAction(abilityAction);
    combatManager.update(0.016);

    const source = combatManager.getParticipant('robot1');
    const target = combatManager.getParticipant('robot2');

    expect(source?.stats.energy).toBe(70);
    expect(target?.activeEffects).toHaveLength(1);
    expect(target?.activeEffects[0].type).toBe('stun');
  });

  it('should handle transformation actions', () => {
    combatManager.initialize([mockParticipant1]);

    const transformAction: CombatAction = {
      type: 'transform',
      source: 'robot1',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(1, 0, 0)
    };

    combatManager.submitAction(transformAction);
    combatManager.update(0.016);

    const participant = combatManager.getParticipant('robot1');
    expect(participant?.isTransformed).toBe(true);
  });

  it('should handle movement actions', () => {
    combatManager.initialize([mockParticipant1]);

    const newPosition = new THREE.Vector3(2, 0, 0);
    const moveAction: CombatAction = {
      type: 'move',
      source: 'robot1',
      position: newPosition,
      direction: new THREE.Vector3(1, 0, 0)
    };

    combatManager.submitAction(moveAction);
    combatManager.update(0.016);

    const participant = combatManager.getParticipant('robot1');
    expect(participant?.position.equals(newPosition)).toBe(true);
  });

  it('should update energy over time', () => {
    combatManager.initialize([mockParticipant1]);

    // Set initial energy to 50
    const participant = combatManager.getParticipant('robot1');
    if (participant) {
      participant.stats.energy = 50;
    }

    // Update for 1 second
    combatManager.update(1);

    const updatedParticipant = combatManager.getParticipant('robot1');
    expect(updatedParticipant?.stats.energy).toBeGreaterThan(50);
  });

  it('should handle status effects', () => {
    combatManager.initialize([mockParticipant1]);

    const participant = combatManager.getParticipant('robot1');
    if (participant) {
      participant.activeEffects.push({
        type: 'stun',
        duration: 1,
        strength: 1,
        source: 'robot2'
      });
    }

    // Update for 1 second
    combatManager.update(1);

    const updatedParticipant = combatManager.getParticipant('robot1');
    expect(updatedParticipant?.activeEffects).toHaveLength(0);
  });

  it('should end combat when only one participant remains', () => {
    combatManager.initialize([mockParticipant1, mockParticipant2]);

    // Set second participant's health to 0
    const participant2 = combatManager.getParticipant('robot2');
    if (participant2) {
      participant2.stats.health = 0;
    }

    combatManager.update(0.016);
    expect(combatManager.isActive()).toBe(false);
  });

  it('should validate actions based on combat state', () => {
    combatManager.initialize([mockParticipant1, mockParticipant2]);

    // Add stun effect to first participant
    const participant1 = combatManager.getParticipant('robot1');
    if (participant1) {
      participant1.activeEffects.push({
        type: 'stun',
        duration: 1,
        strength: 1,
        source: 'robot2'
      });
    }

    const attackAction: CombatAction = {
      type: 'attack',
      source: 'robot1',
      target: 'robot2',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(1, 0, 0)
    };

    combatManager.submitAction(attackAction);
    combatManager.update(0.016);

    const target = combatManager.getParticipant('robot2');
    expect(target?.stats.health).toBe(100); // No damage should be dealt while stunned
  });
}); 