import { PhysicsConfig } from '../PhysicsConfig';
import * as THREE from 'three';

describe('PhysicsConfig', () => {
  it('should create a default configuration with child-friendly settings', () => {
    const config = PhysicsConfig.getDefault();
    
    expect(config.gravity.y).toBe(-7.5); // More forgiving gravity
    expect(config.collisionMargin).toBe(0.15); // More forgiving collision detection
    expect(config.maxSubSteps).toBe(3); // Smoother physics simulation
    expect(config.allowSleep).toBe(true);
  });

  it('should allow custom configuration', () => {
    const customGravity = new THREE.Vector3(0, -5, 0);
    const config = new PhysicsConfig({
      gravity: customGravity,
      solver: {
        iterations: 20,
        tolerance: 0.01
      },
      constraints: {
        iterations: 15,
        tolerance: 0.01
      },
      allowSleep: false,
      collisionMargin: 0.2,
      maxSubSteps: 5
    });

    expect(config.gravity).toBe(customGravity);
    expect(config.solver.iterations).toBe(20);
    expect(config.constraints.iterations).toBe(15);
    expect(config.allowSleep).toBe(false);
    expect(config.collisionMargin).toBe(0.2);
    expect(config.maxSubSteps).toBe(5);
  });
}); 