import { Vector2, Camera, Raycaster, Object3D } from 'three';
import { CombatManager } from './CombatManager';

export class CombatControls {
  private camera: Camera;
  private raycaster: Raycaster;
  private mousePosition: Vector2;
  private combatManager: CombatManager;
  private targetingMode: boolean = false;
  private selectedAbility: string | null = null;
  private playerId: string;
  private scene: Object3D;

  constructor(camera: Camera, scene: Object3D, combatManager: CombatManager, playerId: string) {
    this.camera = camera;
    this.scene = scene;
    this.combatManager = combatManager;
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

  private handleBasicAttack(event: MouseEvent): void {
    const target = this.getTargetUnderMouse();
    if (target && target.userData.combatId) {
      this.combatManager.performAttack(
        this.playerId,
        target.userData.combatId,
        { isMelee: this.isInMeleeRange(target) }
      );
    }
  }

  private handleTargetedAbility(event: MouseEvent): void {
    if (!this.selectedAbility) return;

    const target = this.getTargetUnderMouse();
    if (target && target.userData.combatId) {
      this.combatManager.useAbility(
        this.playerId,
        this.selectedAbility,
        target.userData.combatId
      );
    }

    this.cancelTargeting();
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
    // TODO: Show targeting UI
  }

  private cancelTargeting(): void {
    this.targetingMode = false;
    this.selectedAbility = null;
    // TODO: Hide targeting UI
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
    // Update targeting indicators, range indicators, etc.
    if (this.targetingMode) {
      // TODO: Update targeting UI
    }
  }
} 