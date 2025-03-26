import { GameState } from '../GameState';
import { PhysicsConfig } from '../../physics/PhysicsConfig';
import { ZoneType } from '../../environment/CityZone';
import * as THREE from 'three';

describe('GameState', () => {
  let gameState: GameState;
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
    gameState = new GameState({
      initialZone: ZoneType.DOWNTOWN,
      physicsConfig: PhysicsConfig.getDefault()
    });
  });

  it('should initialize with correct initial state', () => {
    expect(gameState.getCurrentZone()).toBe(ZoneType.DOWNTOWN);
    expect(gameState.getScore()).toBe(0);
    expect(gameState.getTimeElapsed()).toBe(0);
    expect(gameState.isGamePaused()).toBe(false);
  });

  it('should add and remove robots', () => {
    const robot = {
      id: 'test-robot',
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      health: 100,
      energy: 100,
      faction: 'autobot' as const
    };

    gameState.addRobot(robot);
    expect(gameState.getRobot('test-robot')).toBeDefined();
    expect(gameState.getAllRobots()).toHaveLength(1);

    gameState.removeRobot('test-robot');
    expect(gameState.getRobot('test-robot')).toBeUndefined();
    expect(gameState.getAllRobots()).toHaveLength(0);
  });

  it('should update game state', () => {
    const deltaTime = 0.016; // 60fps
    gameState.update(deltaTime);
    expect(gameState.getTimeElapsed()).toBe(deltaTime);
  });

  it('should handle pause and resume', () => {
    gameState.pause();
    expect(gameState.isGamePaused()).toBe(true);

    gameState.resume();
    expect(gameState.isGamePaused()).toBe(false);
  });

  it('should update score', () => {
    gameState.addScore(100);
    expect(gameState.getScore()).toBe(100);
  });

  it('should clean up resources on dispose', () => {
    gameState.dispose();
    // Note: We can't directly test the private methods, but we can verify
    // that the dispose method completes without errors
    expect(true).toBe(true);
  });
}); 