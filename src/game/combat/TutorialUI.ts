import * as THREE from 'three';
import { CombatTutorial } from './CombatTutorial';

interface TutorialUIProps {
  container: HTMLElement;
  tutorial: CombatTutorial;
  camera: THREE.Camera;
  scene: THREE.Scene;
}

export class TutorialUI {
  private container: HTMLElement;
  private tutorial: CombatTutorial;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private tutorialOverlay: HTMLDivElement = document.createElement('div');
  private hintOverlay: HTMLDivElement = document.createElement('div');
  private visualHint: THREE.Mesh | null = null;
  private boundHandleTutorialStep: (step: any) => void;
  private boundHandleTutorialComplete: () => void;

  constructor({ container, tutorial, camera, scene }: TutorialUIProps) {
    this.container = container;
    this.tutorial = tutorial;
    this.camera = camera;
    this.scene = scene;
    this.boundHandleTutorialStep = this.handleTutorialStep.bind(this);
    this.boundHandleTutorialComplete = this.handleTutorialComplete.bind(this);

    this.createUI();
    this.setupEventListeners();
  }

  private createUI(): void {
    // Create tutorial overlay
    this.tutorialOverlay.className = 'tutorial-overlay';
    this.tutorialOverlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      max-width: 600px;
      display: none;
      z-index: 1000;
    `;

    // Create hint overlay
    this.hintOverlay.className = 'tutorial-hint';
    this.hintOverlay.style.cssText = `
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      text-align: center;
      display: none;
      z-index: 1000;
    `;

    this.container.appendChild(this.tutorialOverlay);
    this.container.appendChild(this.hintOverlay);
  }

  private setupEventListeners(): void {
    this.tutorial.on('tutorialStep', this.boundHandleTutorialStep);
    this.tutorial.on('tutorialComplete', this.boundHandleTutorialComplete);
  }

  private handleTutorialStep(step: {
    title: string;
    description: string;
    hint: string;
    visualHint?: {
      position: THREE.Vector3;
      scale: number;
      color: string;
    };
  } | null): void {
    if (!step) {
      this.hideTutorial();
      return;
    }

    this.showTutorial(step);
    this.updateVisualHint(step.visualHint);
  }

  private showTutorial(step: {
    title: string;
    description: string;
    hint: string;
  }): void {
    this.tutorialOverlay.innerHTML = `
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">${step.title}</h2>
      <p style="font-size: 1.2rem; margin-bottom: 1.5rem;">${step.description}</p>
      <button class="skip-tutorial" style="
        background: #ff4444;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
      ">Skip Tutorial</button>
    `;

    this.hintOverlay.textContent = step.hint;
    this.tutorialOverlay.style.display = 'block';
    this.hintOverlay.style.display = 'block';

    // Add skip button event listener
    const skipButton = this.tutorialOverlay.querySelector('.skip-tutorial');
    if (skipButton) {
      skipButton.addEventListener('click', () => this.tutorial.skip());
    }
  }

  private hideTutorial(): void {
    this.tutorialOverlay.style.display = 'none';
    this.hintOverlay.style.display = 'none';
    this.removeVisualHint();
  }

  private updateVisualHint(hint?: {
    position: THREE.Vector3;
    scale: number;
    color: string;
  }): void {
    this.removeVisualHint();

    if (!hint) return;

    // Create a glowing sphere to highlight the target
    const geometry = new THREE.SphereGeometry(hint.scale, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: hint.color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    this.visualHint = new THREE.Mesh(geometry, material);
    this.visualHint.position.copy(hint.position);
    this.scene.add(this.visualHint);
  }

  private removeVisualHint(): void {
    if (this.visualHint) {
      this.scene.remove(this.visualHint);
      this.visualHint = null;
    }
  }

  private handleTutorialComplete(): void {
    this.hideTutorial();
  }

  public update(): void {
    if (this.visualHint) {
      // Make the visual hint pulse
      const scale = this.visualHint.scale.x;
      this.visualHint.scale.setScalar(
        scale + Math.sin(Date.now() * 0.003) * 0.1
      );
    }
  }

  public dispose(): void {
    this.tutorial.removeListener('tutorialStep', this.boundHandleTutorialStep);
    this.tutorial.removeListener('tutorialComplete', this.boundHandleTutorialComplete);
    this.removeVisualHint();
    this.container.removeChild(this.tutorialOverlay);
    this.container.removeChild(this.hintOverlay);
  }

  public skip(): void {
    this.tutorial.skip();
  }
} 