import { World } from 'cannon-es';
import { Vector3 } from 'three';
import { PhysicsBody } from './PhysicsBody';
import { PhysicsConfig } from './PhysicsConfig';

export interface PhysicsWorldOptions {
  gravity?: Vector3;
  allowSleep?: boolean;
  solver?: {
    iterations?: number;
    tolerance?: number;
  };
}

export class PhysicsEngine {
  private world!: World;
  private bodies: Map<string, PhysicsBody>;
  private config: PhysicsConfig;
  private isInitialized: boolean;

  constructor(options: PhysicsWorldOptions = {}) {
    this.bodies = new Map();
    this.isInitialized = false;
    this.config = new PhysicsConfig(options);
  }

  public initialize(): void {
    if (this.isInitialized) return;

    this.world = new World({
      gravity: this.config.gravity as any
    });

    this.isInitialized = true;
  }

  public addBody(id: string, body: PhysicsBody): void {
    if (!this.isInitialized) {
      throw new Error('PhysicsEngine must be initialized before adding bodies');
    }

    this.bodies.set(id, body);
    this.world.addBody(body.getBody());
  }

  public removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body.getBody());
      this.bodies.delete(id);
    }
  }

  public update(deltaTime: number): void {
    if (!this.isInitialized) return;

    this.world.step(deltaTime);
    
    // Update all body positions and rotations
    this.bodies.forEach((body) => {
      body.update();
    });
  }

  public getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  public getWorld(): World {
    return this.world;
  }

  public dispose(): void {
    this.bodies.clear();
    this.world = undefined as any;
    this.isInitialized = false;
  }
} 