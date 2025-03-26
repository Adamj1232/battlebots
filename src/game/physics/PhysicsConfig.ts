import * as THREE from 'three';

interface SolverConfig {
  iterations: number;
  tolerance: number;
}

interface PhysicsConfigOptions {
  gravity: THREE.Vector3;
  solver: SolverConfig;
  constraints: SolverConfig;
  allowSleep?: boolean;
  collisionMargin?: number;
  maxSubSteps?: number;
}

export class PhysicsConfig {
  public readonly gravity: THREE.Vector3;
  public readonly solver: SolverConfig;
  public readonly constraints: SolverConfig;
  public readonly allowSleep: boolean;
  public readonly collisionMargin: number;
  public readonly maxSubSteps: number;

  constructor(options: PhysicsConfigOptions) {
    this.gravity = options.gravity;
    this.solver = options.solver;
    this.constraints = options.constraints;
    this.allowSleep = options.allowSleep ?? true;
    this.collisionMargin = options.collisionMargin ?? 0.1;
    this.maxSubSteps = options.maxSubSteps ?? 3;
  }

  public static getDefault(): PhysicsConfig {
    return new PhysicsConfig({
      gravity: new THREE.Vector3(0, -7.5, 0),
      solver: {
        iterations: 10,
        tolerance: 0.001
      },
      constraints: {
        iterations: 10,
        tolerance: 0.001
      },
      allowSleep: true,
      collisionMargin: 0.15,
      maxSubSteps: 3
    });
  }
} 