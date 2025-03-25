import { Vector3 } from 'three';

export interface PhysicsConfigOptions {
  gravity?: Vector3;
  allowSleep?: boolean;
  solver?: {
    iterations?: number;
    tolerance?: number;
  };
}

export class PhysicsConfig {
  public gravity: Vector3;
  public allowSleep: boolean;
  public solver: {
    iterations: number;
    tolerance: number;
  };

  constructor(options: PhysicsConfigOptions = {}) {
    this.gravity = options.gravity || new Vector3(0, -9.81, 0);
    this.allowSleep = options.allowSleep ?? true;
    this.solver = {
      iterations: options.solver?.iterations ?? 10,
      tolerance: options.solver?.tolerance ?? 0.001
    };
  }
} 