import * as THREE from 'three';
import { CombatManager } from './CombatManager';
import { CombatControls } from './CombatControls';
import { CombatEffects } from './CombatEffects';
import { CombatUI } from './CombatUI';
import { CombatTutorial } from './CombatTutorial';
import { TutorialUI } from './TutorialUI';
import { CombatEvent } from './types';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { CombatOptions } from './types';

interface CombatSceneProps {
  container: HTMLElement;
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  physicsEngine: PhysicsEngine;
  playerId: string;
}

export class CombatScene {
  private container: HTMLElement;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private physicsEngine: PhysicsEngine;
  private playerId: string;
  private combatManager: CombatManager;
  private combatControls: CombatControls;
  private combatEffects: CombatEffects;
  private combatUI: CombatUI;
  private combatTutorial: CombatTutorial;
  private tutorialUI: TutorialUI;
  private isActive: boolean = false;

  constructor({ container, camera, scene, renderer, physicsEngine, playerId }: CombatSceneProps) {
    this.container = container;
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.physicsEngine = physicsEngine;
    this.playerId = playerId;

    // Initialize combat components with required parameters
    const combatOptions: CombatOptions = {
      isRealTime: true,
      turnDuration: 5.0, // 5 seconds per turn in turn-based mode
      childFriendlyMode: true,
      visualFeedbackIntensity: 1.0,
      soundFeedbackIntensity: 1.0,
      maxSimultaneousEffects: 10,
      difficulty: 0.5,
      tutorialMode: true,
      criticalMultiplier: 1.5,
      comboWindow: 2.0
    };

    this.combatManager = new CombatManager(this.physicsEngine, combatOptions);
    this.combatControls = new CombatControls(this.scene, this.camera, this.combatManager, this.playerId);
    this.combatEffects = new CombatEffects(this.scene);
    this.combatUI = new CombatUI(this.scene, this.camera);
    this.combatTutorial = new CombatTutorial(this.combatManager);
    this.tutorialUI = new TutorialUI({
      container: this.container,
      tutorial: this.combatTutorial,
      camera: this.camera,
      scene: this.scene
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.combatManager.on('combatEvent', this.handleCombatEvent.bind(this));
  }

  private handleCombatEvent(event: CombatEvent): void {
    // Handle combat events
    this.combatEffects.handleCombatEvent(event);
    this.combatUI.handleCombatEvent(event);
  }

  public start(): void {
    this.isActive = true;
    this.combatManager.initialize([]); // Initialize with empty participants array
    this.combatTutorial.start();
  }

  public stop(): void {
    this.isActive = false;
    this.combatManager.initialize([]); // Reset combat state
    this.combatControls.dispose();
    this.combatTutorial.stop();
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update all components
    this.combatManager.update(deltaTime);
    this.combatControls.update(deltaTime);
    this.combatEffects.update(deltaTime);
    this.combatUI.update(deltaTime);
    this.tutorialUI.update();
  }

  public resize(width: number, height: number): void {
    // Update camera aspect ratio
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    // Update renderer size
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    // Clean up all components
    this.combatManager.removeListener('combatEvent', this.handleCombatEvent.bind(this));
    this.combatControls.dispose();
    this.combatEffects.dispose();
    this.combatUI.dispose();
    this.combatTutorial.dispose();
    this.tutorialUI.dispose();
  }
} 