import * as THREE from 'three';

export interface RobotColors {
  primary: THREE.ColorRepresentation;
  secondary: THREE.ColorRepresentation;
  accent: THREE.ColorRepresentation;
}

export default class BasicRobot {
  private scene: THREE.Scene;
  private robotGroup: THREE.Group;
  private colors: RobotColors;
  private animationMixer: THREE.AnimationMixer;
  private currentAction?: THREE.AnimationAction;

  constructor(scene: THREE.Scene, colors: RobotColors) {
    this.scene = scene;
    this.colors = colors;
    this.robotGroup = new THREE.Group();
    this.animationMixer = new THREE.AnimationMixer(this.robotGroup);
    
    this.createRobot();
    this.scene.add(this.robotGroup);
  }

  private createRobot(): void {
    // Create torso
    const torsoGeometry = new THREE.BoxGeometry(2, 3, 1);
    const torsoMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.primary,
      metalness: 0.8,
      roughness: 0.2
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 4;
    torso.castShadow = true;
    this.robotGroup.add(torso);

    // Create head
    const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.secondary,
      metalness: 0.8,
      roughness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 6;
    head.castShadow = true;
    this.robotGroup.add(head);

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.accent,
      emissive: this.colors.accent,
      emissiveIntensity: 0.5
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 6.1, 0.6);
    this.robotGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 6.1, 0.6);
    this.robotGroup.add(rightEye);

    // Create arms
    const armGeometry = new THREE.CylinderGeometry(0.3, 0.2, 2);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.secondary,
      metalness: 0.8,
      roughness: 0.2
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.5, 4, 0);
    leftArm.rotation.z = -0.2;
    leftArm.castShadow = true;
    this.robotGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.5, 4, 0);
    rightArm.rotation.z = 0.2;
    rightArm.castShadow = true;
    this.robotGroup.add(rightArm);

    // Create legs
    const legGeometry = new THREE.CylinderGeometry(0.4, 0.3, 3);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.primary,
      metalness: 0.8,
      roughness: 0.2
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.7, 2, 0);
    leftLeg.castShadow = true;
    this.robotGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.7, 2, 0);
    rightLeg.castShadow = true;
    this.robotGroup.add(rightLeg);

    // Create feet
    const footGeometry = new THREE.BoxGeometry(0.6, 0.3, 1);
    const footMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.secondary,
      metalness: 0.8,
      roughness: 0.2
    });

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.7, 0.3, 0);
    leftFoot.castShadow = true;
    this.robotGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.7, 0.3, 0);
    rightFoot.castShadow = true;
    this.robotGroup.add(rightFoot);
  }

  public setPosition(x: number, y: number, z: number): void {
    this.robotGroup.position.set(x, y, z);
  }

  public setRotation(x: number, y: number, z: number): void {
    this.robotGroup.rotation.set(x, y, z);
  }

  public update(deltaTime: number): void {
    // Update animations
    this.animationMixer.update(deltaTime);
  }

  public playAnimation(name: string): void {
    // Animation placeholder - to be implemented with actual animations
    if (this.currentAction) {
      this.currentAction.stop();
    }
    
    // Example: Create a simple rotation animation
    const times = [0, 1, 2];
    const values = [
      0, 0, 0,
      0, Math.PI, 0,
      0, Math.PI * 2, 0
    ];
    
    const track = new THREE.VectorKeyframeTrack(
      '.rotation',
      times,
      values
    );
    
    const clip = new THREE.AnimationClip(name, 2, [track]);
    this.currentAction = this.animationMixer.clipAction(clip);
    this.currentAction.play();
  }

  public dispose(): void {
    // Dispose of all geometries and materials
    this.robotGroup.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Remove from scene
    this.scene.remove(this.robotGroup);
  }
} 