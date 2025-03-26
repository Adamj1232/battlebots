import * as THREE from 'three';
import { Vector3 } from 'three';

export interface SolverConfig {
  iterations: number;
  tolerance: number;
}

export interface PhysicsConfigOptions {
  gravity: Vector3;
  solver: {
    iterations: number;
    tolerance: number;
  };
  constraints: {
    iterations: number;
    tolerance: number;
  };
  allowSleep: boolean;
}

export const getDefaultConfig = (): PhysicsConfigOptions => ({
  gravity: new Vector3(0, -9.81, 0),
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

export interface PhysicsConfig {
  mass: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  constraints: SolverConfig;
  allowSleep: boolean;
}

export interface PhysicsBodyConfig {
  mass: number;
  shape: 'box' | 'sphere' | 'cylinder';
  dimensions: THREE.Vector3;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  isTrigger?: boolean;
}

export interface PhysicsConstraint {
  type: 'point' | 'hinge' | 'cone' | 'slider';
  bodyA: any;
  bodyB: any;
  pivotA?: THREE.Vector3;
  pivotB?: THREE.Vector3;
  axisA?: THREE.Vector3;
  axisB?: THREE.Vector3;
  maxDistance?: number;
  stiffness?: number;
  damping?: number;
}

export interface PhysicsBody {
  id: string;
  object: THREE.Object3D;
  mass: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
}

export interface PhysicsWorld {
  gravity: THREE.Vector3;
  bodies: PhysicsBody[];
  constraints: PhysicsConstraint[];
  solver: SolverConfig;
}

export interface PhysicsRaycastResult {
  hit: boolean;
  distance: number;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  body: PhysicsBody | null;
} 