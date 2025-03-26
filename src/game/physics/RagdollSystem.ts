import { Object3D, Vector3, Euler, Mesh, Skeleton, Bone, Quaternion } from 'three';
import { PhysicsEngine } from './PhysicsEngine';
import { PhysicsConfig } from './types';

interface RagdollJoint {
  bone: Bone;
  body: any; // Physics body
  constraint: any; // Physics constraint
  position: Vector3;
  rotation: Euler;
}

export class RagdollSystem {
  private scene: Object3D;
  private physicsEngine: PhysicsEngine;
  private ragdolls: Map<string, RagdollJoint[]> = new Map();
  private readonly JOINT_CONFIGS: PhysicsConfig = {
    mass: 1,
    position: new Vector3(),
    rotation: new Euler(),
    friction: 0.5,
    restitution: 0.3,
    linearDamping: 0.5,
    angularDamping: 0.5,
    constraints: { iterations: 10, tolerance: 0.001 },
    allowSleep: true
  };

  constructor(scene: Object3D, physicsEngine: PhysicsEngine) {
    this.scene = scene;
    this.physicsEngine = physicsEngine;
  }

  public createRagdoll(id: string, mesh: Mesh, skeleton: Skeleton): void {
    const joints: RagdollJoint[] = [];

    // Create physics bodies for each bone
    skeleton.bones.forEach(bone => {
      if (!bone.parent) return; // Skip root bone

      const joint = this.createJoint(bone, mesh);
      if (joint) {
        joints.push(joint);
      }
    });

    // Create constraints between joints
    this.createConstraints(joints);

    this.ragdolls.set(id, joints);
  }

  private createJoint(bone: Bone, mesh: Mesh): RagdollJoint | null {
    // Get bone's world position and rotation
    const position = new Vector3();
    const quaternion = new Quaternion();
    bone.getWorldPosition(position);
    bone.getWorldQuaternion(quaternion);

    // Convert quaternion to Euler for physics engine
    const rotation = new Euler();
    rotation.setFromQuaternion(quaternion);

    // Create physics body for the joint
    const body = this.physicsEngine.addRigidBody(mesh, {
      ...this.JOINT_CONFIGS,
      position,
      rotation
    });

    if (!body) return null;

    return {
      bone,
      body,
      constraint: null,
      position: position.clone(),
      rotation: rotation.clone()
    };
  }

  private createConstraints(joints: RagdollJoint[]): void {
    joints.forEach(joint => {
      const parentJoint = joints.find(j => j.bone === joint.bone.parent);
      if (!parentJoint) return;

      // Create constraint between parent and child joints
      const constraint = this.physicsEngine.addConstraint(
        parentJoint.body,
        joint.body,
        {
          pivotA: parentJoint.position,
          pivotB: joint.position,
          axisA: new Vector3(0, 1, 0),
          axisB: new Vector3(0, 1, 0),
          stiffness: 0.8,
          damping: 0.5
        }
      );

      joint.constraint = constraint;
      parentJoint.constraint = constraint;
    });
  }

  public applyImpulse(id: string, impulse: Vector3, point: Vector3): void {
    const ragdoll = this.ragdolls.get(id);
    if (!ragdoll) return;

    // Apply impulse to all joints
    ragdoll.forEach(joint => {
      this.physicsEngine.applyImpulse(joint.body, impulse, point);
    });
  }

  public removeRagdoll(id: string): void {
    const ragdoll = this.ragdolls.get(id);
    if (!ragdoll) return;

    // Remove constraints and bodies
    ragdoll.forEach(joint => {
      if (joint.constraint) {
        this.physicsEngine.removeConstraint(joint.constraint);
      }
      if (joint.body) {
        this.physicsEngine.removeBody(joint.body);
      }
    });

    this.ragdolls.delete(id);
  }

  public update(deltaTime: number): void {
    // Update bone positions and rotations based on physics bodies
    this.ragdolls.forEach(joints => {
      joints.forEach(joint => {
        if (joint.body) {
          const position = new Vector3();
          const rotation = new Euler();
          
          this.physicsEngine.getBodyTransform(joint.body, position, rotation);
          
          joint.bone.position.copy(position);
          joint.bone.rotation.copy(rotation);
        }
      });
    });
  }
} 