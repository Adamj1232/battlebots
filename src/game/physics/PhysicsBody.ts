import { Body, Box, Sphere, Cylinder, Vec3, Material } from 'cannon-es';
import { Mesh, Vector3 } from 'three';

export interface PhysicsBodyOptions {
  mass?: number;
  shape: 'box' | 'sphere' | 'cylinder';
  dimensions?: Vector3;
  radius?: number;
  height?: number;
  position?: Vector3;
  material?: Material;
}

export class PhysicsBody {
  private body: Body;
  private object3D: Mesh;
  private position: Vector3;

  constructor(object3D: Mesh, options: PhysicsBodyOptions) {
    if (!options.shape) {
      throw new Error('Shape is required for PhysicsBody');
    }

    this.object3D = object3D;
    this.position = new Vector3();

    // Create the physics body
    const mass = options.mass ?? 0;
    const position = options.position || new Vector3();
    const material = options.material || new Material();

    let shape;
    switch (options.shape) {
      case 'box':
        if (!options.dimensions) {
          throw new Error('Box shape requires dimensions');
        }
        shape = new Box(new Vec3(
          options.dimensions.x / 2,
          options.dimensions.y / 2,
          options.dimensions.z / 2
        ));
        break;
      case 'sphere':
        if (options.radius === undefined) {
          throw new Error('Sphere shape requires radius');
        }
        shape = new Sphere(options.radius);
        break;
      case 'cylinder':
        if (options.radius === undefined || options.height === undefined) {
          throw new Error('Cylinder shape requires radius and height');
        }
        shape = new Cylinder(options.radius, options.radius, options.height / 2, 8);
        break;
      default:
        throw new Error(`Unsupported shape: ${options.shape}`);
    }

    this.body = new Body({
      mass,
      position: new Vec3(position.x, position.y, position.z),
      shape,
      material
    });
  }

  public update(): void {
    // Update the Three.js object position and rotation
    this.object3D.position.copy(this.body.position as any);
    this.object3D.quaternion.copy(this.body.quaternion as any);
  }

  public getBody(): Body {
    return this.body;
  }

  public setPosition(position: Vector3): void {
    this.body.position.copy(position as any);
  }

  public setRotation(rotation: Vector3): void {
    this.body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
  }

  public applyForce(force: Vector3, worldPoint?: Vector3): void {
    this.body.applyForce(force as any, worldPoint as any);
  }

  public applyImpulse(impulse: Vector3, worldPoint?: Vector3): void {
    this.body.applyImpulse(impulse as any, worldPoint as any);
  }

  public setVelocity(velocity: Vector3): void {
    this.body.velocity.copy(velocity as any);
  }

  public setAngularVelocity(angularVelocity: Vector3): void {
    this.body.angularVelocity.copy(angularVelocity as any);
  }

  public dispose(): void {
    if (this.body) {
      this.body = undefined as any;
    }
    if (this.object3D) {
      this.object3D = undefined as any;
    }
  }
} 