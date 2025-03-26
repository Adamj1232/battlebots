import * as THREE from 'three';
import { CombatManager } from './CombatManager';
import { CombatEvent } from './types';

interface ControlState {
  isAttacking: boolean;
  isDefending: boolean;
  isTransforming: boolean;
  isUsingAbility: boolean;
  targetPosition: THREE.Vector3 | null;
  lastActionTime: number;
  actionCooldown: number;
}

export class CombatControls {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private combatManager: CombatManager;
  private playerId: string;
  private state: ControlState;
  private readonly ACTION_COOLDOWN = 0.5; // seconds
  private readonly CHILD_FRIENDLY_KEYBINDS = {
    attack: 'Space',
    defend: 'Shift',
    transform: 'Tab',
    ability: 'E',
    target: 'Mouse1'
  };
  private readonly TUTORIAL_HINTS = {
    attack: 'Press SPACE to attack!',
    defend: 'Hold SHIFT to defend!',
    transform: 'Press TAB to transform!',
    ability: 'Press E to use special ability!',
    target: 'Click to target enemies!'
  };

  constructor(scene: THREE.Scene, camera: THREE.Camera, combatManager: CombatManager, playerId: string) {
    this.scene = scene;
    this.camera = camera;
    this.combatManager = combatManager;
    this.playerId = playerId;
    this.state = {
      isAttacking: false,
      isDefending: false,
      isTransforming: false,
      isUsingAbility: false,
      targetPosition: null,
      lastActionTime: 0,
      actionCooldown: this.ACTION_COOLDOWN
    };

    this.setupEventListeners();
  }

  public setupEventListeners(): void {
    // Keyboard controls
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse controls
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Touch controls for mobile
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchmove', this.handleTouchMove.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const now = performance.now();
    if (now - this.state.lastActionTime < this.state.actionCooldown) return;

    switch (event.code) {
      case this.CHILD_FRIENDLY_KEYBINDS.attack:
        this.state.isAttacking = true;
        this.performAttack();
        break;
      case this.CHILD_FRIENDLY_KEYBINDS.defend:
        this.state.isDefending = true;
        this.performDefend();
        break;
      case this.CHILD_FRIENDLY_KEYBINDS.transform:
        this.state.isTransforming = true;
        this.performTransform();
        break;
      case this.CHILD_FRIENDLY_KEYBINDS.ability:
        this.state.isUsingAbility = true;
        this.performAbility();
        break;
    }

    this.state.lastActionTime = now;
  }

  private handleKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case this.CHILD_FRIENDLY_KEYBINDS.attack:
        this.state.isAttacking = false;
        break;
      case this.CHILD_FRIENDLY_KEYBINDS.defend:
        this.state.isDefending = false;
        break;
      case this.CHILD_FRIENDLY_KEYBINDS.transform:
        this.state.isTransforming = false;
        break;
      case this.CHILD_FRIENDLY_KEYBINDS.ability:
        this.state.isUsingAbility = false;
        break;
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.state.targetPosition = this.getMousePosition(event);
      this.performAttack();
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.state.isAttacking) {
      this.state.targetPosition = this.getMousePosition(event);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      this.state.targetPosition = null;
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.state.targetPosition = this.getTouchPosition(touch);
    this.performAttack();
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (this.state.isAttacking) {
      const touch = event.touches[0];
      this.state.targetPosition = this.getTouchPosition(touch);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.state.targetPosition = null;
  }

  private getMousePosition(event: MouseEvent): THREE.Vector3 {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    return this.screenToWorld(mouse);
  }

  private getTouchPosition(touch: Touch): THREE.Vector3 {
    const mouse = new THREE.Vector2(
      (touch.clientX / window.innerWidth) * 2 - 1,
      -(touch.clientY / window.innerHeight) * 2 + 1
    );

    return this.screenToWorld(mouse);
  }

  private screenToWorld(screenPos: THREE.Vector2): THREE.Vector3 {
    // Create a plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();

    // Set up the raycaster
    raycaster.setFromCamera(screenPos, this.camera);
    const intersection = new THREE.Vector3();

    // Find intersection with the plane
    raycaster.ray.intersectPlane(plane, intersection);
    return intersection;
  }

  private performAttack(): void {
    if (!this.state.targetPosition) return;

    this.combatManager.submitAction({
      type: 'attack',
      source: this.playerId,
      position: this.state.targetPosition,
      direction: this.state.targetPosition.clone().normalize(),
      timestamp: performance.now(),
      isChildFriendly: true,
      warningDuration: 1.0
    });
  }

  private performDefend(): void {
    this.combatManager.submitAction({
      type: 'defend',
      source: this.playerId,
      position: new THREE.Vector3(), // Will be updated by the combat manager
      direction: new THREE.Vector3(),
      timestamp: performance.now(),
      isChildFriendly: true,
      warningDuration: 0.5
    });
  }

  private performTransform(): void {
    this.combatManager.submitAction({
      type: 'transform',
      source: this.playerId,
      position: new THREE.Vector3(), // Will be updated by the combat manager
      direction: new THREE.Vector3(),
      timestamp: performance.now(),
      isChildFriendly: true,
      warningDuration: 1.0
    });
  }

  private performAbility(): void {
    if (!this.state.targetPosition) return;

    this.combatManager.submitAction({
      type: 'ability',
      source: this.playerId,
      position: this.state.targetPosition,
      direction: this.state.targetPosition.clone().normalize(),
      timestamp: performance.now(),
      isChildFriendly: true,
      warningDuration: 1.5
    });
  }

  public update(deltaTime: number): void {
    // Update continuous actions
    if (this.state.isAttacking && this.state.targetPosition) {
      this.performAttack();
    }
  }

  public dispose(): void {
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
} 