import { Object3D, AnimationMixer, AnimationClip, LoopOnce } from 'three';
import { CombatManager } from './CombatManager';
import { CombatEffects } from './CombatEffects';

interface TransformationState {
  isTransforming: boolean;
  currentForm: 'robot' | 'vehicle';
  transformationProgress: number;
  lastTransformTime: number;
  mixer?: AnimationMixer;
}

export class TransformationManager {
  private scene: Object3D;
  private combatManager: CombatManager;
  private effects: CombatEffects;
  private transformations: Map<string, TransformationState> = new Map();
  private transformationCooldown: number = 2000; // 2 seconds cooldown
  private transformationDuration: number = 1000; // 1 second animation

  constructor(scene: Object3D, combatManager: CombatManager, effects: CombatEffects) {
    this.scene = scene;
    this.combatManager = combatManager;
    this.effects = effects;
  }

  public registerTransformable(id: string, initialForm: 'robot' | 'vehicle' = 'robot'): void {
    const object = this.scene.getObjectByName(id);
    if (!object) return;

    const mixer = new AnimationMixer(object);
    
    this.transformations.set(id, {
      isTransforming: false,
      currentForm: initialForm,
      transformationProgress: 0,
      lastTransformTime: 0,
      mixer
    });
  }

  public startTransformation(id: string): boolean {
    const state = this.transformations.get(id);
    if (!state) return false;

    const now = Date.now();
    if (state.isTransforming || now - state.lastTransformTime < this.transformationCooldown) {
      return false;
    }

    const object = this.scene.getObjectByName(id);
    if (!object) return false;

    // Start transformation
    state.isTransforming = true;
    state.transformationProgress = 0;
    state.lastTransformTime = now;

    // Create transformation effect
    this.effects.handleCombatEvent({
      type: 'transform',
      source: id,
      position: object.position,
      timestamp: Date.now()
    });

    // Play transformation animation
    this.playTransformationAnimation(id, state.currentForm === 'robot' ? 'vehicle' : 'robot');

    return true;
  }

  private playTransformationAnimation(id: string, targetForm: 'robot' | 'vehicle'): void {
    const state = this.transformations.get(id);
    const object = this.scene.getObjectByName(id);
    if (!state || !object || !state.mixer) return;

    // Get the appropriate animation clip
    const clipName = `transform_to_${targetForm}`;
    const clip = object.userData.animations?.[clipName] as AnimationClip;
    if (!clip) return;

    // Play the animation
    const action = state.mixer.clipAction(clip);
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().play();

    // Handle animation completion
    setTimeout(() => {
      this.completeTransformation(id, targetForm);
    }, this.transformationDuration);
  }

  private completeTransformation(id: string, newForm: 'robot' | 'vehicle'): void {
    const state = this.transformations.get(id);
    if (!state) return;

    // Update state
    state.isTransforming = false;
    state.currentForm = newForm;
    state.transformationProgress = 0;

    // Apply form-specific stats
    this.updateStatsForForm(id, newForm);
  }

  private updateStatsForForm(id: string, form: 'robot' | 'vehicle'): void {
    const participant = this.combatManager['participants'].get(id);
    if (!participant) return;

    if (form === 'vehicle') {
      // Vehicle form: faster, less defense
      participant.stats.speed *= 1.5;
      participant.stats.defense *= 0.7;
    } else {
      // Robot form: normal stats
      participant.stats.speed /= 1.5;
      participant.stats.defense /= 0.7;
    }
  }

  public update(deltaTime: number): void {
    // Update animation mixers
    this.transformations.forEach((state, id) => {
      if (state.mixer) {
        state.mixer.update(deltaTime);
      }

      if (state.isTransforming) {
        state.transformationProgress = Math.min(1, 
          state.transformationProgress + (deltaTime / this.transformationDuration)
        );
      }
    });
  }

  public getCurrentForm(id: string): 'robot' | 'vehicle' | undefined {
    return this.transformations.get(id)?.currentForm;
  }

  public isTransforming(id: string): boolean {
    return this.transformations.get(id)?.isTransforming || false;
  }
} 