import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UpdatableObject } from '../engine/GameEngine';

interface CameraConfig {
  distance: number;
  height: number;
  smoothness: number;
  maxPitch: number;
  minPitch: number;
  maxDistance: number;
  minDistance: number;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private target: UpdatableObject;
  private config: CameraConfig;
  private currentDistance: number;
  private targetDistance: number;
  private currentHeight: number;
  private targetHeight: number;
  private movementEffects: THREE.Group;

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    target: UpdatableObject,
    config: Partial<CameraConfig> = {}
  ) {
    this.camera = camera;
    this.controls = controls;
    this.target = target;
    this.config = {
      distance: config.distance || 10,
      height: config.height || 5,
      smoothness: config.smoothness || 0.1,
      maxPitch: config.maxPitch || Math.PI * 0.6,
      minPitch: config.minPitch || Math.PI * 0.2,
      maxDistance: config.maxDistance || 20,
      minDistance: config.minDistance || 5
    };

    this.currentDistance = this.config.distance;
    this.targetDistance = this.config.distance;
    this.currentHeight = this.config.height;
    this.targetHeight = this.config.height;

    // Create movement effects group
    this.movementEffects = new THREE.Group();
    this.camera.add(this.movementEffects);

    // Configure controls
    this.setupControls();
  }

  private setupControls(): void {
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = this.config.maxDistance;
    this.controls.minDistance = this.config.minDistance;
    this.controls.maxPolarAngle = this.config.maxPitch;
    this.controls.minPolarAngle = this.config.minPitch;
  }

  public update(deltaTime: number): void {
    if (!this.target) return;

    // Update camera position
    const targetPosition = this.target.position;

    // Calculate target camera position
    const targetCameraPos = new THREE.Vector3();
    targetCameraPos.copy(targetPosition);
    targetCameraPos.y += this.currentHeight;

    // Apply camera rotation
    const cameraOffset = new THREE.Vector3(0, 0, this.currentDistance);
    cameraOffset.applyQuaternion(this.camera.quaternion);
    targetCameraPos.add(cameraOffset);

    // Smoothly move camera
    this.camera.position.lerp(targetCameraPos, this.config.smoothness);

    // Update movement effects
    this.updateMovementEffects(deltaTime);
  }

  private updateMovementEffects(deltaTime: number): void {
    // Add subtle camera shake based on movement
    if (this.target.physicsBody) {
      const velocity = this.target.physicsBody.getBody().velocity;
      const speed = velocity.length();
      
      if (speed > 5) {
        const shakeIntensity = Math.min(speed / 20, 0.1);
        this.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        this.camera.position.z += (Math.random() - 0.5) * shakeIntensity;
      }
    }
  }

  public setTarget(target: UpdatableObject): void {
    this.target = target;
  }

  public setDistance(distance: number): void {
    this.targetDistance = THREE.MathUtils.clamp(
      distance,
      this.config.minDistance,
      this.config.maxDistance
    );
  }

  public setHeight(height: number): void {
    this.targetHeight = height;
  }

  public dispose(): void {
    this.controls.dispose();
    this.movementEffects.clear();
    this.camera.remove(this.movementEffects);
  }

  private updateRotation(deltaTime: number): void {
    if (!this.target) return;

    const targetPosition = this.target.position;
    const direction = new THREE.Vector3();
    direction.subVectors(this.camera.position, targetPosition);
    direction.normalize();

    // Apply the rotation
    this.camera.position.copy(targetPosition).add(direction.multiplyScalar(this.currentDistance));
    this.camera.lookAt(targetPosition);
  }
} 