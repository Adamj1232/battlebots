import * as THREE from 'three';
import { Robot } from '../../types/Robot';

export class RobotAssembly {
  private scene: THREE.Scene;
  private robot: Robot;
  private parts: {
    head?: THREE.Group;
    torso?: THREE.Group;
    arms?: THREE.Group;
    legs?: THREE.Group;
  } = {};

  constructor(scene: THREE.Scene, robot: Robot) {
    this.scene = scene;
    this.robot = robot;
    this.loadParts();
  }

  private async loadParts() {
    // Create placeholder geometries for each part
    this.parts.head = this.loadPart('head');
    this.parts.torso = this.loadPart('torso');
    this.parts.arms = this.loadPart('arms');
    this.parts.legs = this.loadPart('legs');

    // Position the parts
    this.positionParts();

    // Apply colors
    this.applyColors();
  }

  private loadPart(type: string): THREE.Group {
    const group = new THREE.Group();
    let geometry: THREE.BufferGeometry;

    switch (type) {
      case 'head':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'torso':
        geometry = new THREE.BoxGeometry(2, 3, 1);
        break;
      case 'arms':
        geometry = new THREE.BoxGeometry(4, 0.5, 0.5);
        break;
      case 'legs':
        geometry = new THREE.BoxGeometry(1, 2, 1);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    this.scene.add(group);
    return group;
  }

  private positionParts() {
    if (this.parts.head) {
      this.parts.head.position.set(0, 4, 0);
    }
    if (this.parts.torso) {
      this.parts.torso.position.set(0, 2, 0);
    }
    if (this.parts.arms) {
      this.parts.arms.position.set(0, 2.5, 0);
    }
    if (this.parts.legs) {
      this.parts.legs.position.set(0, 0, 0);
    }
  }

  private applyColors() {
    const applyColorToGroup = (group: THREE.Group | undefined, color: string) => {
      if (group) {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            (child.material as THREE.MeshStandardMaterial).color.setHex(
              parseInt(color.replace('#', '0x'))
            );
          }
        });
      }
    };

    // Apply primary color to torso
    applyColorToGroup(this.parts.torso, this.robot.colors.primary);

    // Apply secondary color to arms and legs
    applyColorToGroup(this.parts.arms, this.robot.colors.secondary);
    applyColorToGroup(this.parts.legs, this.robot.colors.secondary);

    // Apply accent color to head
    applyColorToGroup(this.parts.head, this.robot.colors.accent);
  }

  public updateColors() {
    this.applyColors();
  }

  public dispose() {
    Object.values(this.parts).forEach(part => {
      if (part) {
        part.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
        this.scene.remove(part);
      }
    });
  }
} 