import { Object3D, Mesh, Color, MeshStandardMaterial } from 'three';
import { RobotCustomization } from './RobotCustomization';

interface PartDamageState {
  damageLevel: number; // 0 to 1
  visualEffect: string;
  isRepairing: boolean;
  repairProgress: number;
}

export class PartDamageSystem {
  private scene: Object3D;
  private customization: RobotCustomization;
  private damageStates: Map<string, PartDamageState> = new Map();
  private readonly REPAIR_RATE = 0.1; // Damage repair rate per second

  constructor(scene: Object3D, customization: RobotCustomization) {
    this.scene = scene;
    this.customization = customization;
  }

  public applyDamage(partId: string, damage: number): void {
    const part = this.scene.getObjectByName(partId);
    if (!part) return;

    const currentState = this.damageStates.get(partId) || {
      damageLevel: 0,
      visualEffect: '',
      isRepairing: false,
      repairProgress: 0
    };

    // Update damage level
    currentState.damageLevel = Math.min(1, currentState.damageLevel + damage);
    currentState.isRepairing = false;
    currentState.repairProgress = 0;

    // Get visual effect for current damage level
    currentState.visualEffect = this.customization.getVisualDamageEffect(partId, currentState.damageLevel);

    // Apply visual damage
    this.applyVisualDamage(part, currentState);

    this.damageStates.set(partId, currentState);
  }

  public startRepair(partId: string): void {
    const state = this.damageStates.get(partId);
    if (!state) return;

    state.isRepairing = true;
    state.repairProgress = 0;
  }

  public update(deltaTime: number): void {
    this.damageStates.forEach((state, partId) => {
      if (state.isRepairing) {
        // Update repair progress
        state.repairProgress = Math.min(1, state.repairProgress + (deltaTime * this.REPAIR_RATE));
        
        // Update damage level based on repair progress
        state.damageLevel = 1 - state.repairProgress;

        // Get updated visual effect
        state.visualEffect = this.customization.getVisualDamageEffect(partId, state.damageLevel);

        // Apply updated visuals
        const part = this.scene.getObjectByName(partId);
        if (part) {
          this.applyVisualDamage(part, state);
        }

        // Check if repair is complete
        if (state.repairProgress >= 1) {
          state.isRepairing = false;
          state.repairProgress = 0;
        }
      }
    });
  }

  private applyVisualDamage(part: Object3D, state: PartDamageState): void {
    // Apply damage textures and effects
    part.traverse((child) => {
      if (child instanceof Mesh) {
        // Apply damage texture
        if (child.material instanceof MeshStandardMaterial) {
          // In a real implementation, this would apply damage textures
          // For now, we'll just tint the material based on damage level
          const originalColor = new Color(0xffffff);
          const damageColor = new Color(0xff0000);
          const finalColor = originalColor.clone().lerp(damageColor, state.damageLevel);
          child.material.color = finalColor;
        }
      }
    });

    // Apply particle effects or other visual effects based on state.visualEffect
    // This would be implemented based on your visual effects system
  }

  public getDamageLevel(partId: string): number {
    return this.damageStates.get(partId)?.damageLevel || 0;
  }

  public isPartDamaged(partId: string): boolean {
    return (this.damageStates.get(partId)?.damageLevel || 0) > 0;
  }

  public isPartRepairing(partId: string): boolean {
    return this.damageStates.get(partId)?.isRepairing || false;
  }
} 