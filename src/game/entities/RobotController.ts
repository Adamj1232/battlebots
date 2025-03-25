import * as THREE from 'three';
import { PhysicsBody } from '../physics/PhysicsBody';
import { InputManager } from '../engine/InputManager';
import { InputState } from '../engine/InputManager';

export class RobotController {
  private robot: THREE.Object3D;
  private physicsBody: PhysicsBody;
  private inputManager: InputManager;
  private moveSpeed: number = 5;
  private jumpForce: number = 10;
  private isGrounded: boolean = false;
  private canJump: boolean = true;
  private isTransforming: boolean = false;
  private transformationProgress: number = 0;
  private transformationDuration: number = 1;

  constructor(robot: THREE.Object3D, physicsBody: PhysicsBody, inputManager: InputManager) {
    this.robot = robot;
    this.physicsBody = physicsBody;
    this.inputManager = inputManager;
  }

  public update(deltaTime: number, input: InputState): void {
    const moveDirection = new THREE.Vector3();

    // Handle movement
    if (input.forward) moveDirection.z -= 1;
    if (input.backward) moveDirection.z += 1;
    if (input.left) moveDirection.x -= 1;
    if (input.right) moveDirection.x += 1;

    // Normalize movement direction
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      moveDirection.multiplyScalar(this.moveSpeed * deltaTime);
      
      // Apply movement force
      this.physicsBody.applyForce(moveDirection);
      
      // Rotate robot to face movement direction
      if (moveDirection.length() > 0) {
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        this.robot.rotation.y = THREE.MathUtils.lerp(
          this.robot.rotation.y,
          targetRotation,
          10 * deltaTime
        );
      }
    }

    // Handle jumping
    if (input.jump && this.canJump && this.isGrounded) {
      this.physicsBody.applyImpulse(new THREE.Vector3(0, this.jumpForce, 0));
      this.canJump = false;
      this.isGrounded = false;
      setTimeout(() => {
        this.canJump = true;
      }, 500);
    }

    // Handle transformation
    if (input.transform && !this.isTransforming) {
      this.startTransformation();
    }

    if (this.isTransforming) {
      this.updateTransformation(deltaTime);
    }

    // Check if grounded
    this.checkGrounded();
  }

  private checkGrounded(): void {
    const rayStart = this.robot.position.clone();
    const rayEnd = rayStart.clone().add(new THREE.Vector3(0, -1.1, 0));
    const rayResult = this.physicsBody.rayTest(rayStart, rayEnd);
    this.isGrounded = rayResult !== null;
  }

  private startTransformation(): void {
    this.isTransforming = true;
    this.transformationProgress = 0;
    
    // Disable physics during transformation
    this.physicsBody.setEnabled(false);
  }

  private updateTransformation(deltaTime: number): void {
    this.transformationProgress += deltaTime / this.transformationDuration;

    if (this.transformationProgress >= 1) {
      this.completeTransformation();
      return;
    }

    // Apply transformation animation
    const scale = THREE.MathUtils.lerp(1, 1.5, this.transformationProgress);
    this.robot.scale.setScalar(scale);
    
    // Add some rotation for effect
    this.robot.rotation.y += deltaTime * Math.PI;
  }

  private completeTransformation(): void {
    this.isTransforming = false;
    this.transformationProgress = 0;
    
    // Reset scale and enable physics
    this.robot.scale.setScalar(1.5);
    this.physicsBody.setEnabled(true);
    
    // Update physics body size
    this.physicsBody.updateSize(new THREE.Vector3(1.5, 3, 1.5));
  }

  public dispose(): void {
    // Clean up any resources
  }
} 