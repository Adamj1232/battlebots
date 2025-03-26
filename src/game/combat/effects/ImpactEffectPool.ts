import { EffectPool, CombatEffect } from './types';
import { ImpactEffect } from './effects/ImpactEffect';

export class ImpactEffectPool implements EffectPool {
  private pool: ImpactEffect[] = [];
  private activeEffects: Set<ImpactEffect> = new Set();

  constructor(poolSize: number) {
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(new ImpactEffect());
    }
  }

  acquire(): CombatEffect | null {
    const effect = this.pool.pop();
    if (effect) {
      this.activeEffects.add(effect);
      return effect;
    }
    return null;
  }

  release(effect: CombatEffect): void {
    if (effect instanceof ImpactEffect) {
      effect.dispose();
      this.activeEffects.delete(effect);
      this.pool.push(effect);
    }
  }

  dispose(): void {
    this.pool.forEach(effect => effect.dispose());
    this.activeEffects.forEach(effect => effect.dispose());
    this.pool = [];
    this.activeEffects.clear();
  }
} 