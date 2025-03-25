import { Vector3, Object3D, Mesh, MeshBasicMaterial, SphereGeometry, Color } from 'three';
import { DamageType } from './types';

export class CombatEffects {
  private effects: Map<string, Object3D> = new Map();
  private scene: Object3D;

  constructor(scene: Object3D) {
    this.scene = scene;
  }

  public createImpactEffect(position: Vector3, type: DamageType): void {
    const effect = this.createEffectMesh(type);
    effect.position.copy(position);
    
    this.scene.add(effect);
    
    // Animate the effect
    const startScale = effect.scale.clone();
    const duration = 500; // milliseconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Scale up and fade out
      effect.scale.copy(startScale).multiplyScalar(1 + progress);
      (effect.material as MeshBasicMaterial).opacity = 1 - progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(effect);
        effect.geometry.dispose();
        (effect.material as MeshBasicMaterial).dispose();
      }
    };
    
    animate();
  }

  public createDamageNumber(position: Vector3, amount: number): void {
    // TODO: Implement floating damage numbers using HTML overlay
  }

  private createEffectMesh(type: DamageType): Mesh {
    const geometry = new SphereGeometry(0.5, 8, 8);
    const material = new MeshBasicMaterial({
      color: this.getEffectColor(type),
      transparent: true,
      opacity: 1
    });
    
    return new Mesh(geometry, material);
  }

  private getEffectColor(type: DamageType): Color {
    switch (type) {
      case 'physical':
        return new Color(0xffaa00); // Orange
      case 'energy':
        return new Color(0x00aaff); // Blue
      case 'special':
        return new Color(0xff00ff); // Purple
      default:
        return new Color(0xffffff); // White
    }
  }

  public createBeamEffect(start: Vector3, end: Vector3, type: DamageType): void {
    // TODO: Implement beam/projectile effects
  }

  public createStatusEffect(target: Object3D, type: string): void {
    // TODO: Implement persistent status effect particles
  }

  public createTransformationEffect(position: Vector3): void {
    // TODO: Implement transformation visual effects
  }
} 