import { EffectPool } from './EffectPool.js';
import { ImpactEffect } from './ImpactEffect.js';
import { EffectType } from './types.js';

export class ImpactEffectPool extends EffectPool {
  constructor(size: number) {
    super(EffectType.IMPACT, size);
  }

  protected createEffect(): ImpactEffect {
    return new ImpactEffect();
  }

  public acquire(): ImpactEffect | null {
    return super.acquire() as ImpactEffect;
  }
} 