import * as THREE from 'three';

export interface SolverConfig {
  iterations: number;
  tolerance: number;
}

export interface PhysicsConfigOptions {
  gravity: THREE.Vector3;
  solver: SolverConfig;
  constraints: SolverConfig;
  allowSleep?: boolean;
}

export class PhysicsConfig {
  public readonly gravity: THREE.Vector3;
  public readonly solver: SolverConfig;
  public readonly constraints: SolverConfig;
  public readonly allowSleep: boolean;

  constructor(options: PhysicsConfigOptions) {
    this.gravity = options.gravity;
    this.solver = options.solver;
    this.constraints = options.constraints;
    this.allowSleep = options.allowSleep ?? true;
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
      },
      allowSleep: true
    });
  }
}

export interface PhysicsBodyConfig {
  mass: number;
  shape: 'box' | 'sphere' | 'cylinder';
  dimensions: THREE.Vector3;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
} 