import { Vector3, Object3D, Mesh, Box3, Euler } from 'three';
import { PhysicsEngine } from './PhysicsEngine';

interface Hazard {
  mesh: Mesh;
  type: 'explosion' | 'trap' | 'trapdoor' | 'spikes';
  damage: number;
  radius: number;
  duration: number;
  isActive: boolean;
  physicsBody: any; // Physics body
}

export class EnvironmentalHazards {
  private scene: Object3D;
  private physicsEngine: PhysicsEngine;
  private hazards: Map<string, Hazard> = new Map();
  private readonly HAZARD_CONFIGS = {
    explosion: {
      damage: 50,
      radius: 5,
      duration: 1000,
      force: 1000
    },
    trap: {
      damage: 30,
      radius: 2,
      duration: 500,
      force: 500
    },
    trapdoor: {
      damage: 20,
      radius: 3,
      duration: 2000,
      force: 300
    },
    spikes: {
      damage: 40,
      radius: 1,
      duration: 0,
      force: 200
    }
  };

  constructor(scene: Object3D, physicsEngine: PhysicsEngine) {
    this.scene = scene;
    this.physicsEngine = physicsEngine;
  }

  public createHazard(
    id: string,
    mesh: Mesh,
    type: Hazard['type'],
    position: Vector3,
    rotation: Euler
  ): void {
    const config = this.HAZARD_CONFIGS[type];
    
    // Create physics body for the hazard
    const physicsBody = this.physicsEngine.addRigidBody(mesh, {
      mass: type === 'trapdoor' ? 1 : 0,
      position,
      rotation,
      friction: 0.5,
      restitution: 0.3,
      constraints: { iterations: 10, tolerance: 0.001 },
      allowSleep: true
    });

    const hazard: Hazard = {
      mesh,
      type,
      damage: config.damage,
      radius: config.radius,
      duration: config.duration,
      isActive: true,
      physicsBody
    };

    this.hazards.set(id, hazard);
  }

  public activateHazard(id: string): void {
    const hazard = this.hazards.get(id);
    if (!hazard || !hazard.isActive) return;

    switch (hazard.type) {
      case 'explosion':
        this.activateExplosion(hazard);
        break;
      case 'trap':
        this.activateTrap(hazard);
        break;
      case 'trapdoor':
        this.activateTrapdoor(hazard);
        break;
      case 'spikes':
        this.activateSpikes(hazard);
        break;
    }
  }

  private activateExplosion(hazard: Hazard): void {
    const position = new Vector3();
    hazard.mesh.getWorldPosition(position);

    // Find all objects within radius
    const objects = this.scene.children.filter(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      return objPos.distanceTo(position) <= hazard.radius;
    });

    // Apply damage and force to objects
    objects.forEach(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      const distance = objPos.distanceTo(position);
      const force = (1 - distance / hazard.radius) * this.HAZARD_CONFIGS.explosion.force;
      
      const direction = objPos.clone().sub(position).normalize();
      this.physicsEngine.applyImpulse(obj, direction.multiplyScalar(force), objPos);
    });

    // Deactivate after duration
    setTimeout(() => {
      hazard.isActive = false;
      this.physicsEngine.removeBody(hazard.physicsBody);
      this.scene.remove(hazard.mesh);
      this.hazards.delete(hazard.mesh.uuid);
    }, hazard.duration);
  }

  private activateTrap(hazard: Hazard): void {
    // Create a trigger area
    const box = new Box3().setFromObject(hazard.mesh);
    const center = box.getCenter(new Vector3());

    // Check for objects in trigger area
    const objects = this.scene.children.filter(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      return box.containsPoint(objPos);
    });

    // Apply damage and force to objects
    objects.forEach(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      const direction = objPos.clone().sub(center).normalize();
      
      this.physicsEngine.applyImpulse(
        obj,
        direction.multiplyScalar(this.HAZARD_CONFIGS.trap.force),
        objPos
      );
    });

    // Deactivate after duration
    setTimeout(() => {
      hazard.isActive = false;
      this.physicsEngine.removeBody(hazard.physicsBody);
      this.scene.remove(hazard.mesh);
      this.hazards.delete(hazard.mesh.uuid);
    }, hazard.duration);
  }

  private activateTrapdoor(hazard: Hazard): void {
    // Apply downward force to the trapdoor
    this.physicsEngine.applyForce(
      hazard.physicsBody,
      new Vector3(0, -this.HAZARD_CONFIGS.trapdoor.force, 0)
    );

    // Check for objects on trapdoor
    const box = new Box3().setFromObject(hazard.mesh);
    const objects = this.scene.children.filter(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      return box.containsPoint(objPos);
    });

    // Apply damage to objects
    objects.forEach(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      const direction = new Vector3(0, -1, 0);
      
      this.physicsEngine.applyImpulse(
        obj,
        direction.multiplyScalar(this.HAZARD_CONFIGS.trapdoor.force),
        objPos
      );
    });

    // Deactivate after duration
    setTimeout(() => {
      hazard.isActive = false;
      this.physicsEngine.removeBody(hazard.physicsBody);
      this.scene.remove(hazard.mesh);
      this.hazards.delete(hazard.mesh.uuid);
    }, hazard.duration);
  }

  private activateSpikes(hazard: Hazard): void {
    // Check for objects in contact with spikes
    const box = new Box3().setFromObject(hazard.mesh);
    const objects = this.scene.children.filter(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      return box.containsPoint(objPos);
    });

    // Apply damage and force to objects
    objects.forEach(obj => {
      const objPos = new Vector3();
      obj.getWorldPosition(objPos);
      const direction = new Vector3(0, 1, 0);
      
      this.physicsEngine.applyImpulse(
        obj,
        direction.multiplyScalar(this.HAZARD_CONFIGS.spikes.force),
        objPos
      );
    });
  }

  public update(deltaTime: number): void {
    // Update hazard states and check for collisions
    this.hazards.forEach(hazard => {
      if (!hazard.isActive) return;

      // Update hazard-specific behavior
      switch (hazard.type) {
        case 'trapdoor':
          // Check if trapdoor has fallen below threshold
          const position = new Vector3();
          hazard.mesh.getWorldPosition(position);
          if (position.y < -10) {
            this.activateHazard(hazard.mesh.uuid);
          }
          break;
      }
    });
  }
} 