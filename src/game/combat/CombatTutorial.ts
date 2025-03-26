import * as THREE from 'three';
import { EventEmitter } from 'events';
import { CombatManager } from './CombatManager';
import { CombatEvent } from './types';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  hint: string;
  requiredAction?: string;
  requiredTarget?: string;
  completionCondition: (event: CombatEvent) => boolean;
  visualHint?: {
    position: THREE.Vector3;
    scale: number;
    color: string;
  };
}

interface TutorialStepEvent {
  title: string;
  description: string;
  hint: string;
  visualHint?: {
    position: THREE.Vector3;
    scale: number;
    color: string;
  };
}

export class CombatTutorial extends EventEmitter {
  private combatManager: CombatManager;
  private currentStep: number = 0;
  private isActive: boolean = false;
  private steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Transformers Battle Arena!',
      description: 'Let\'s learn how to fight like a true Transformer!',
      hint: 'Press SPACE to continue',
      completionCondition: () => true
    },
    {
      id: 'basic_attack',
      title: 'Basic Attack',
      description: 'Press SPACE to perform a basic attack. Watch for the warning indicators!',
      hint: 'Press SPACE to attack',
      requiredAction: 'attack',
      completionCondition: (event) => event.type === 'damage'
    },
    {
      id: 'defend',
      title: 'Defending',
      description: 'Hold SHIFT to defend against enemy attacks. This will reduce damage taken!',
      hint: 'Hold SHIFT to defend',
      requiredAction: 'defend',
      completionCondition: (event) => event.type === 'effect' && event.visualEffect === 'shield_effect'
    },
    {
      id: 'transform',
      title: 'Transformation',
      description: 'Press TAB to switch between robot and vehicle modes. Each mode has unique advantages!',
      hint: 'Press TAB to transform',
      requiredAction: 'transform',
      completionCondition: (event) => event.type === 'transform'
    },
    {
      id: 'special_ability',
      title: 'Special Abilities',
      description: 'Press E to use your special ability when your energy is full!',
      hint: 'Press E to use special ability',
      requiredAction: 'ability',
      completionCondition: (event) => event.type === 'effect' && event.visualEffect === 'ability_effect'
    },
    {
      id: 'targeting',
      title: 'Targeting Enemies',
      description: 'Click on enemies to target them. Watch for the red warning indicators!',
      hint: 'Click to target enemies',
      requiredAction: 'target',
      completionCondition: (event) => event.type === 'damage' && event.target !== undefined
    },
    {
      id: 'completion',
      title: 'You\'re Ready!',
      description: 'Great job! You\'ve learned the basics of combat. Now go out there and fight!',
      hint: 'Press SPACE to start battling',
      completionCondition: () => true
    }
  ];

  constructor(combatManager: CombatManager) {
    super();
    this.combatManager = combatManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.combatManager.on('combatEvent', this.handleCombatEvent.bind(this));
  }

  public start(): void {
    this.isActive = true;
    this.currentStep = 0;
    this.showCurrentStep();
  }

  public stop(): void {
    this.isActive = false;
    this.hideCurrentStep();
  }

  private showCurrentStep(): void {
    if (!this.isActive || this.currentStep >= this.steps.length) return;

    const step = this.steps[this.currentStep];
    this.emit('tutorialStep', {
      title: step.title,
      description: step.description,
      hint: step.hint,
      visualHint: step.visualHint
    } as TutorialStepEvent);
  }

  private hideCurrentStep(): void {
    this.emit('tutorialStep', null);
  }

  private handleCombatEvent(event: CombatEvent): void {
    if (!this.isActive || this.currentStep >= this.steps.length) return;

    const step = this.steps[this.currentStep];
    if (step.completionCondition(event)) {
      this.nextStep();
    }
  }

  private nextStep(): void {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    } else {
      this.showCurrentStep();
    }
  }

  private complete(): void {
    this.isActive = false;
    this.emit('tutorialComplete');
  }

  public skip(): void {
    this.complete();
  }

  public getCurrentStep(): TutorialStep | null {
    if (!this.isActive || this.currentStep >= this.steps.length) {
      return null;
    }
    return this.steps[this.currentStep];
  }

  public isTutorialActive(): boolean {
    return this.isActive;
  }

  public dispose(): void {
    this.combatManager.removeListener('combatEvent', this.handleCombatEvent.bind(this));
  }
} 