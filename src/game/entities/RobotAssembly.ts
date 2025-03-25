import * as THREE from 'three';
import { loadModel } from '../../utils/modelLoader';
import { RobotPart, RobotConfig } from './RobotParts';

interface AttachmentPoint {
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface PartTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export class RobotAssembly {
  private scene: THREE.Scene;
  private robotGroup: THREE.Group;
  private parts: Map<string, THREE.Group>;
  private attachmentPoints: Map<string, AttachmentPoint>;
  private config: RobotConfig;
  private isTransforming: boolean;

  constructor(scene: THREE.Scene, config: RobotConfig) {
    this.scene = scene;
    this.config = config;
    this.robotGroup = new THREE.Group();
    this.parts = new Map();
    this.attachmentPoints = new Map();
    this.isTransforming = false;

    this.initializeAttachmentPoints();
    this.scene.add(this.robotGroup);
  }

  private initializeAttachmentPoints(): void {
    // Define standard attachment points for each part type
    this.attachmentPoints.set('head', {
      name: 'head_socket',
      position: new THREE.Vector3(0, 2, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    });

    this.attachmentPoints.set('torso', {
      name: 'torso_socket',
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    });

    this.attachmentPoints.set('left_arm', {
      name: 'left_arm_socket',
      position: new THREE.Vector3(-1, 1.5, 0),
      rotation: new THREE.Euler(0, 0, -0.1),
      scale: new THREE.Vector3(1, 1, 1)
    });

    this.attachmentPoints.set('right_arm', {
      name: 'right_arm_socket',
      position: new THREE.Vector3(1, 1.5, 0),
      rotation: new THREE.Euler(0, 0, 0.1),
      scale: new THREE.Vector3(1, 1, 1)
    });

    this.attachmentPoints.set('legs', {
      name: 'legs_socket',
      position: new THREE.Vector3(0, -1, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    });

    this.attachmentPoints.set('weapon', {
      name: 'weapon_socket',
      position: new THREE.Vector3(1.5, 1, 0.5),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    });
  }

  public async loadParts(): Promise<void> {
    const partPromises = Object.entries(this.config).map(async ([type, part]) => {
      if (typeof part === 'string') return; // Skip color properties
      if (!part.modelPath) return;

      try {
        const model = await loadModel(part.modelPath);
        this.parts.set(type, model);
        this.attachPart(type, model);
      } catch (error) {
        console.error(`Failed to load model for ${type}:`, error);
      }
    });

    await Promise.all(partPromises);
  }

  private attachPart(type: string, model: THREE.Group): void {
    const attachmentPoint = this.attachmentPoints.get(type);
    if (!attachmentPoint) return;

    model.position.copy(attachmentPoint.position);
    model.rotation.copy(attachmentPoint.rotation);
    model.scale.copy(attachmentPoint.scale);

    this.robotGroup.add(model);
  }

  public async updatePart(type: string, newPart: RobotPart): Promise<void> {
    if (!newPart.modelPath) return;

    // Remove existing part
    const existingPart = this.parts.get(type);
    if (existingPart) {
      this.robotGroup.remove(existingPart);
    }

    try {
      const model = await loadModel(newPart.modelPath);
      this.parts.set(type, model);
      this.attachPart(type, model);
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
    }
  }

  public updateColors(primary: string, secondary: string, accent: string): void {
    this.robotGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => this.updateMaterialColor(mat, primary, secondary, accent));
        } else if (mesh.material) {
          this.updateMaterialColor(mesh.material, primary, secondary, accent);
        }
      }
    });
  }

  private updateMaterialColor(
    material: THREE.Material,
    primary: string,
    secondary: string,
    accent: string
  ): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Assign colors based on material name or other properties
      if (material.name.includes('primary')) {
        material.color.set(primary);
      } else if (material.name.includes('secondary')) {
        material.color.set(secondary);
      } else if (material.name.includes('accent')) {
        material.color.set(accent);
      }
      material.needsUpdate = true;
    }
  }

  public startTransformation(): void {
    if (this.isTransforming) return;
    this.isTransforming = true;

    // Store initial transforms
    const initialTransforms = new Map<string, PartTransform>();
    this.parts.forEach((part, type) => {
      initialTransforms.set(type, {
        position: part.position.clone(),
        rotation: part.rotation.clone(),
        scale: part.scale.clone()
      });
    });

    // Define transformation keyframes
    const transformationSteps = this.getTransformationSteps();
    let currentStep = 0;

    const animate = () => {
      if (!this.isTransforming || currentStep >= transformationSteps.length) {
        this.isTransforming = false;
        return;
      }

      const step = transformationSteps[currentStep];
      this.applyTransformationStep(step);
      currentStep++;

      requestAnimationFrame(animate);
    };

    animate();
  }

  private getTransformationSteps(): Array<Map<string, PartTransform>> {
    // Define keyframes for transformation sequence
    const steps: Array<Map<string, PartTransform>> = [];
    
    // Add transformation keyframes here
    // Example: Spreading parts out
    const step1 = new Map<string, PartTransform>();
    step1.set('head', {
      position: new THREE.Vector3(0, 3, 0),
      rotation: new THREE.Euler(0, Math.PI, 0),
      scale: new THREE.Vector3(1, 1, 1)
    });
    // Add more part transforms...
    steps.push(step1);

    // Add more steps as needed
    return steps;
  }

  private applyTransformationStep(
    transforms: Map<string, PartTransform>
  ): void {
    transforms.forEach((transform, type) => {
      const part = this.parts.get(type);
      if (!part) return;

      part.position.lerp(transform.position, 0.1);
      part.rotation.x += (transform.rotation.x - part.rotation.x) * 0.1;
      part.rotation.y += (transform.rotation.y - part.rotation.y) * 0.1;
      part.rotation.z += (transform.rotation.z - part.rotation.z) * 0.1;
      part.scale.lerp(transform.scale, 0.1);
    });
  }

  public dispose(): void {
    this.parts.forEach((part) => {
      part.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
    });

    this.scene.remove(this.robotGroup);
  }
} 