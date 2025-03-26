import { Vector2, Camera, Raycaster, Object3D, Vector3 } from 'three';
import { CombatManager } from './CombatManager';
import { TargetingSystem } from './targeting/TargetingSystem';

export class CombatControls {
  private camera: Camera;
  private raycaster: Raycaster;
  private mousePosition: Vector2;
  private combatManager: CombatManager;
  private targetingSystem: TargetingSystem;
  private targetingMode: boolean = false;
  private selectedAbility: string | null = null;
  private playerId: string;
  private scene: Object3D;

  constructor(
    camera: Camera, 
    scene: Object3D, 
    combatManager: CombatManager,
    targetingSystem: TargetingSystem,
    playerId: string
  ) {
    this.camera = camera;
    this.scene = scene;
    this.combatManager = combatManager;
    this.targetingSystem = targetingSystem;
    this.playerId = playerId;
    this.raycaster = new Raycaster();
    this.mousePosition = new Vector2();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Basic attack on left click
    window.addEventListener('click', (event) => {
      if (!this.targetingMode) {
        this.handleBasicAttack(event);
      } else {
        this.handleTargetedAbility(event);
      }
    });

    // Track mouse position for targeting
    window.addEventListener('mousemove', (event) => {
      this.updateMousePosition(event);
      this.updateTargeting();
    });

    // Ability hotkeys (number keys 1-4 for easy access)
    window.addEventListener('keydown', (event) => {
      this.handleAbilityHotkeys(event);
    });

    // Right click to cancel targeting
    window.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (this.targetingMode) {
        this.cancelTargeting();
      }
    });
  }

  private updateMousePosition(event: MouseEvent): void {
    // Convert mouse position to normalized device coordinates
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private updateTargeting(): void {
    const target = this.getTargetUnderMouse();
    if (target) {
      const isValidTarget = this.isValidTarget(target);
      this.targetingSystem.showPlayerTargeting(target.position, isValidTarget);
    }
  }

  private handleBasicAttack(event: MouseEvent): void {
    const target = this.getTargetUnderMouse();
    if (target && target.userData.combatId && this.isValidTarget(target)) {
      this.combatManager.submitAction({
        type: 'attack',
        source: this.playerId,
        target: target.userData.combatId,
        position: this.scene.getObjectByName(this.playerId)?.position || new Vector3(),
        direction: target.position.clone().sub(this.scene.getObjectByName(this.playerId)?.position || new Vector3()).normalize(),
        data: { isMelee: this.isInMeleeRange(target) },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });
    }
  }

  private handleTargetedAbility(event: MouseEvent): void {
    if (!this.selectedAbility) return;

    const target = this.getTargetUnderMouse();
    if (target && target.userData.combatId && this.isValidTarget(target)) {
      this.combatManager.submitAction({
        type: 'ability',
        source: this.playerId,
        target: target.userData.combatId,
        position: this.scene.getObjectByName(this.playerId)?.position || new Vector3(),
        direction: target.position.clone().sub(this.scene.getObjectByName(this.playerId)?.position || new Vector3()).normalize(),
        data: { abilityId: this.selectedAbility },
        timestamp: Date.now(),
        isChildFriendly: true,
        warningDuration: 1000
      });
    }

    this.cancelTargeting();
  }

  private isValidTarget(target: Object3D): boolean {
    // Check if target is an enemy and alive
    const participant = this.combatManager.getParticipant(target.userData.combatId);
    return target.userData.combatId && 
           target.userData.combatId !== this.playerId &&
           participant !== undefined &&
           participant.stats !== undefined &&
           participant.stats.health > 0;
  }

  private handleAbilityHotkeys(event: KeyboardEvent): void {
    // Simple number keys 1-4 for abilities
    const abilityKeys = ['1', '2', '3', '4'];
    const keyIndex = abilityKeys.indexOf(event.key);
    
    if (keyIndex !== -1) {
      // TODO: Get actual ability ID from player's equipped abilities
      const abilityId = `ability_${keyIndex + 1}`;
      this.startTargeting(abilityId);
    }

    // Space bar for transformation
    if (event.code === 'Space') {
      this.handleTransformation();
    }
  }

  private startTargeting(abilityId: string): void {
    this.targetingMode = true;
    this.selectedAbility = abilityId;
  }

  private cancelTargeting(): void {
    this.targetingMode = false;
    this.selectedAbility = null;
  }

  private getTargetUnderMouse(): Object3D | null {
    this.raycaster.setFromCamera(this.mousePosition, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    // Find the first intersected object that has a combatId
    for (const intersect of intersects) {
      let current: Object3D | null = intersect.object;
      while (current) {
        if (current.userData.combatId) {
          return current;
        }
        current = current.parent;
      }
    }
    
    return null;
  }

  private isInMeleeRange(target: Object3D): boolean {
    // Simple distance check for melee range
    const playerPosition = this.scene.getObjectByName(this.playerId)?.position;
    if (!playerPosition) return false;

    const distance = playerPosition.distanceTo(target.position);
    return distance <= 5; // 5 units is melee range
  }

  private handleTransformation(): void {
    // TODO: Implement transformation logic
    console.log('Transform!');
  }

  public update(): void {
    // Update targeting indicators if in targeting mode
    if (this.targetingMode) {
      this.updateTargeting();
    }
  }
} 