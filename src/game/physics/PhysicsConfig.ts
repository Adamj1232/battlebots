import * as THREE from 'three';

interface SolverConfig {
  iterations: number;
  tolerance: number;
}

interface PhysicsConfigOptions {
  gravity: THREE.Vector3;
  solver: SolverConfig;
  constraints: SolverConfig;
}

export class PhysicsConfig {
  public readonly gravity: THREE.Vector3;
  public readonly solver: SolverConfig;
  public readonly constraints: SolverConfig;

  constructor(options: PhysicsConfigOptions) {
    this.gravity = options.gravity;
    this.solver = options.solver;
    this.constraints = options.constraints;
  }

  public static getDefault(): PhysicsConfig {
    return new PhysicsConfig({
      gravity: new THREE.Vector3(0, -9.82, 0),
      solver: {
        iterations: 10,
        tolerance: 0.001
      },
      constraints: {
        iterations: 10,
        tolerance: 0.001
      }
    });
  }
} 