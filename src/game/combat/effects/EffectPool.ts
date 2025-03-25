import { EffectType, CombatEffect } from './types';

export abstract class EffectPool {
  private pool: CombatEffect[];
  private activeEffects: Set<CombatEffect>;
  private type: EffectType;

  constructor(type: EffectType, size: number) {
    this.type = type;
    this.pool = [];
    this.activeEffects = new Set();
    this.initializePool(size);
  }

  private initializePool(size: number): void {
    for (let i = 0; i < size; i++) {
      const effect = this.createEffect();
      this.pool.push(effect);
    }
  }

  protected abstract createEffect(): CombatEffect;

  public acquire(): CombatEffect | null {
    const effect = this.pool.pop();
    if (effect) {
      this.activeEffects.add(effect);
      effect.isActive = true;
      effect.timeAlive = 0;
      return effect;
    }
    return null;
  }

  public release(effect: CombatEffect): void {
    if (this.activeEffects.has(effect)) {
      this.activeEffects.delete(effect);
      effect.isActive = false;
      effect.dispose();
      this.pool.push(effect);
    }
  }

  public getActiveCount(): number {
    return this.activeEffects.size;
  }

  public getPoolSize(): number {
    return this.pool.length;
  }

  public getType(): EffectType {
    return this.type;
  }
} 