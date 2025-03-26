import { Scene, Mesh, CircleGeometry, MeshBasicMaterial, Vector3, Object3D, RingGeometry, Color } from 'three';
import { CombatManager } from '../CombatManager';

interface TargetIndicator {
  mesh: Mesh;
  target: string;
  type: 'player' | 'enemy';
  warningTime: number;
}

export class TargetingSystem {
  private scene: Scene;
  private combatManager: CombatManager;
  private indicators: Map<string, TargetIndicator> = new Map();
  private readonly WARNING_DURATION = 2.0; // seconds before enemy attack
  private readonly INDICATOR_HEIGHT = 0.1; // slightly above ground

  constructor(scene: Scene, combatManager: CombatManager) {
    this.scene = scene;
    this.combatManager = combatManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for enemy attack preparations
    this.combatManager.on('enemyAttackStart', (data: { 
      enemyId: string, 
      targetId: string, 
      attackType: string,
      position: Vector3 
    }) => {
      this.showEnemyAttackWarning(data.enemyId, data.targetId, data.attackType, data.position);
    });

    // Listen for attack completions
    this.combatManager.on('attackComplete', (attackerId: string) => {
      this.removeIndicator(attackerId);
    });
  }

  public showPlayerTargeting(position: Vector3, isValidTarget: boolean): void {
    const indicator = this.getOrCreateIndicator('playerTarget', 'player');
    indicator.mesh.position.copy(position);
    indicator.mesh.position.y = this.INDICATOR_HEIGHT;

    // Update color based on valid target
    const material = indicator.mesh.material as MeshBasicMaterial;
    material.color = new Color(isValidTarget ? 0x00ff00 : 0xff0000);
    material.opacity = isValidTarget ? 0.6 : 0.3;
  }

  public showEnemyAttackWarning(enemyId: string, targetId: string, attackType: string, position: Vector3): void {
    const indicator = this.getOrCreateIndicator(enemyId, 'enemy');
    indicator.target = targetId;
    indicator.warningTime = this.WARNING_DURATION;
    indicator.mesh.position.copy(position);
    indicator.mesh.position.y = this.INDICATOR_HEIGHT;

    // Style based on attack type
    const material = indicator.mesh.material as MeshBasicMaterial;
    switch (attackType) {
      case 'melee':
        material.color = new Color(0xff4400);
        break;
      case 'ranged':
        material.color = new Color(0xff00ff);
        break;
      case 'special':
        material.color = new Color(0xffff00);
        break;
      default:
        material.color = new Color(0xff0000);
    }
  }

  private getOrCreateIndicator(id: string, type: 'player' | 'enemy'): TargetIndicator {
    if (this.indicators.has(id)) {
      return this.indicators.get(id)!;
    }

    const geometry = type === 'player' 
      ? new CircleGeometry(1, 32)
      : new RingGeometry(1.5, 2, 32);

    const material = new MeshBasicMaterial({
      color: type === 'player' ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });

    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Lay flat on ground
    this.scene.add(mesh);

    const indicator: TargetIndicator = {
      mesh,
      target: '',
      type,
      warningTime: 0
    };

    this.indicators.set(id, indicator);
    return indicator;
  }

  public update(deltaTime: number): void {
    // Update enemy attack warnings
    for (const [id, indicator] of this.indicators) {
      if (indicator.type === 'enemy' && indicator.warningTime > 0) {
        indicator.warningTime -= deltaTime;
        
        // Pulse the warning indicator
        const warningPhase = Math.sin(indicator.warningTime * Math.PI * 2) * 0.3 + 0.7;
        const material = indicator.mesh.material as MeshBasicMaterial;
        material.opacity = warningPhase;
        
        // Scale the indicator based on remaining time
        const scale = 1 + (1 - indicator.warningTime / this.WARNING_DURATION) * 0.5;
        indicator.mesh.scale.set(scale, scale, scale);

        if (indicator.warningTime <= 0) {
          this.removeIndicator(id);
        }
      }
    }
  }

  private removeIndicator(id: string): void {
    const indicator = this.indicators.get(id);
    if (indicator) {
      this.scene.remove(indicator.mesh);
      indicator.mesh.geometry.dispose();
      if (!Array.isArray(indicator.mesh.material)) {
        indicator.mesh.material.dispose();
      }
      this.indicators.delete(id);
    }
  }

  public dispose(): void {
    // Clean up all indicators
    for (const [id] of this.indicators) {
      this.removeIndicator(id);
    }
  }
} 