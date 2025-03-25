import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsEngine } from './PhysicsEngine';
import { PhysicsBodyConfig } from './types';

export class PhysicsBody {
  private object: THREE.Object3D;
  private engine: PhysicsEngine;
  private body: CANNON.Body;
  private enabled: boolean = true;

  constructor(object: THREE.Object3D, engine: PhysicsEngine, config: PhysicsBodyConfig) {
    this.object = object;
    this.engine = engine;

    // Create physics shape
    let shape: CANNON.Shape;
    switch (config.shape) {
      case 'box':
        shape = new CANNON.Box(new CANNON.Vec3(
          config.dimensions.x / 2,
          config.dimensions.y / 2,
          config.dimensions.z / 2
        ));
        break;
      case 'sphere':
        shape = new CANNON.Sphere(config.dimensions.x / 2);
        break;
      case 'cylinder':
        shape = new CANNON.Cylinder(
          config.dimensions.x / 2,
          config.dimensions.x / 2,
          config.dimensions.y,
          16
        );
        break;
      default:
        throw new Error(`Unsupported physics shape: ${config.shape}`);
    }

    // Create physics body
    this.body = new CANNON.Body({
      mass: config.mass,
      shape: shape,
      position: new CANNON.Vec3(
        object.position.x,
        object.position.y,
        object.position.z
      ),
      quaternion: new CANNON.Quaternion(
        object.quaternion.x,
        object.quaternion.y,
        object.quaternion.z,
        object.quaternion.w
      )
    });

    // Set physics properties
    if (config.friction !== undefined) {
      this.body.material = new CANNON.Material();
      this.body.material.friction = config.friction;
    }
    if (config.restitution !== undefined) {
      this.body.material = this.body.material || new CANNON.Material();
      this.body.material.restitution = config.restitution;
    }
    if (config.linearDamping !== undefined) {
      this.body.linearDamping = config.linearDamping;
    }
    if (config.angularDamping !== undefined) {
      this.body.angularDamping = config.angularDamping;
    }

    // Add body to physics world
    this.engine.addBody(this.body);
  }

  public getBody(): CANNON.Body {
    return this.body;
  }

  public update(): void {
    if (!this.enabled) return;

    // Update object position and rotation from physics body
    this.object.position.copy(new THREE.Vector3(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    ));
    this.object.quaternion.copy(new THREE.Quaternion(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    ));
  }

  public applyForce(force: THREE.Vector3, worldPoint?: THREE.Vector3): void {
    const cannonForce = new CANNON.Vec3(force.x, force.y, force.z);
    if (worldPoint) {
      const cannonPoint = new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
      this.body.applyForce(cannonForce, cannonPoint);
    } else {
      this.body.applyForce(cannonForce, this.body.position);
    }
  }

  public applyImpulse(impulse: THREE.Vector3, worldPoint?: THREE.Vector3): void {
    const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
    if (worldPoint) {
      const cannonPoint = new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
      this.body.applyImpulse(cannonImpulse, cannonPoint);
    } else {
      this.body.applyImpulse(cannonImpulse, this.body.position);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.body.type = enabled ? CANNON.Body.DYNAMIC : CANNON.Body.STATIC;
  }

  public updateSize(dimensions: THREE.Vector3): void {
    // Create new shape with updated dimensions
    let shape: CANNON.Shape;
    switch (this.body.shapes[0].type) {
      case CANNON.Shape.types.BOX:
        shape = new CANNON.Box(new CANNON.Vec3(
          dimensions.x / 2,
          dimensions.y / 2,
          dimensions.z / 2
        ));
        break;
      case CANNON.Shape.types.SPHERE:
        shape = new CANNON.Sphere(dimensions.x / 2);
        break;
      case CANNON.Shape.types.CYLINDER:
        shape = new CANNON.Cylinder(
          dimensions.x / 2,
          dimensions.x / 2,
          dimensions.y,
          16
        );
        break;
      default:
        throw new Error('Unsupported physics shape type');
    }

    // Remove old shape and add new one
    this.body.shapes = [shape];
    this.body.updateBoundingRadius();
  }

  public rayTest(from: THREE.Vector3, to: THREE.Vector3): CANNON.RaycastResult | null {
    const raycastResult = new CANNON.RaycastResult();
    const rayFrom = new CANNON.Vec3(from.x, from.y, from.z);
    const rayTo = new CANNON.Vec3(to.x, to.y, to.z);
    
    this.engine.rayTest(rayFrom, rayTo, raycastResult);
    
    return raycastResult.hasHit ? raycastResult : null;
  }

  public getEngine(): PhysicsEngine {
    return this.engine;
  }

  public dispose(): void {
    if (this.body) {
      this.engine.removeBody(this.body);
    }
  }
} 