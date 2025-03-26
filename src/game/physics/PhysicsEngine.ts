import * as CANNON from 'cannon-es';
import { PhysicsConfig } from './types';

export class PhysicsEngine {
  private world: CANNON.World;
  private bodies: Map<string, THREE.Object3D> = new Map();

  constructor(config: PhysicsConfig) {
    this.world = new CANNON.World();
    this.world.gravity.set(config.gravity.x, config.gravity.y, config.gravity.z);

    // Configure solver
    (this.world.solver as any).iterations = config.solver.iterations;
    (this.world.solver as any).tolerance = config.solver.tolerance;

    // Create ground plane
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: new CANNON.Material()
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
  }

  public initialize(): void {
    // Initialize any additional physics settings
    this.world.allowSleep = true;
  }

  public update(deltaTime: number): void {
    this.world.step(deltaTime);
  }

  public addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  public removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }

  public rayTest(from: CANNON.Vec3, to: CANNON.Vec3, result: CANNON.RaycastResult): void {
    this.world.rayTest(from, to, result);
  }

  public dispose(): void {
    // Remove all bodies
    while (this.world.bodies.length > 0) {
      this.world.removeBody(this.world.bodies[0]);
    }
  }

  public getBody(id: string): THREE.Object3D | undefined {
    return this.bodies.get(id);
  }
} 