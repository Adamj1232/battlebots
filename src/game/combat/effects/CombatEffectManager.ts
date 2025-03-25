import { Vector3 } from 'three';
import { EffectPool } from './EffectPool.js';
import { EffectType, CombatEffect } from './types.js';
import { ImpactEffectPool } from './ImpactEffectPool.js';

export class CombatEffectManager {
  private static instance: CombatEffectManager;
  private effectPools: Map<EffectType, EffectPool>;
  private activeEffects: Set<CombatEffect>;
  private maxActiveEffects: number;
  private devicePerformance: 'high' | 'medium' | 'low' = 'medium';

  private constructor() {
    this.effectPools = new Map();
    this.activeEffects = new Set();
    this.maxActiveEffects = this.detectDevicePerformance();
    this.initializeEffectPools();
  }

  public static getInstance(): CombatEffectManager {
    if (!CombatEffectManager.instance) {
      CombatEffectManager.instance = new CombatEffectManager();
    }
    return CombatEffectManager.instance;
  }

  private detectDevicePerformance(): number {
    // In Node.js environment (testing), return medium performance
    if (typeof window === 'undefined') {
      this.devicePerformance = 'medium';
      return 50;
    }

    // Browser environment checks
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasLowMemory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
    
    if (isMobile || hasLowMemory) {
      this.devicePerformance = 'low';
      return 20;
    }
    
    const hasHighEndGPU = this.detectHighEndGPU();
    this.devicePerformance = hasHighEndGPU ? 'high' : 'medium';
    return hasHighEndGPU ? 100 : 50;
  }

  private detectHighEndGPU(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return false;

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return false;

      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return renderer.toLowerCase().includes('nvidia') || 
             renderer.toLowerCase().includes('amd') ||
             renderer.toLowerCase().includes('rtx');
    } catch (e) {
      return false;
    }
  }

  private initializeEffectPools(): void {
    // Initialize pools for each effect type
    Object.values(EffectType).forEach(type => {
      const poolSize = this.getPoolSizeForType(type);
      switch (type) {
        case EffectType.IMPACT:
          this.effectPools.set(type, new ImpactEffectPool(poolSize));
          break;
        // Add other effect pool types here
        default:
          console.warn(`No pool implementation for effect type: ${type}`);
      }
    });
  }

  private getPoolSizeForType(type: EffectType): number {
    // Adjust pool sizes based on effect type and device performance
    const baseSizes = {
      [EffectType.IMPACT]: 10,
      [EffectType.WEAPON_TRAIL]: 5,
      [EffectType.STATUS_EFFECT]: 8,
      [EffectType.ENVIRONMENTAL]: 3,
      [EffectType.TRANSFORMATION]: 2,
      [EffectType.SPECIAL_ABILITY]: 4,
      [EffectType.DAMAGE_INDICATOR]: 15
    };

    const multiplier = this.devicePerformance === 'high' ? 1.5 : 
                      this.devicePerformance === 'medium' ? 1 : 0.5;

    return Math.floor(baseSizes[type] * multiplier);
  }

  public spawnEffect(type: EffectType, position: Vector3, options: any = {}): CombatEffect | null {
    if (this.activeEffects.size >= this.maxActiveEffects) {
      // Remove oldest effect if we're at capacity
      const oldestEffect = Array.from(this.activeEffects)[0];
      this.recycleEffect(oldestEffect);
    }

    const pool = this.effectPools.get(type);
    if (!pool) return null;

    const effect = pool.acquire();
    if (!effect) return null;

    effect.initialize(position, options);
    this.activeEffects.add(effect);
    return effect;
  }

  public update(deltaTime: number): void {
    this.activeEffects.forEach(effect => {
      effect.update(deltaTime);
      if (effect.isComplete()) {
        this.recycleEffect(effect);
      }
    });
  }

  private recycleEffect(effect: CombatEffect): void {
    this.activeEffects.delete(effect);
    const pool = this.effectPools.get(effect.type);
    if (pool) {
      pool.release(effect);
    }
  }

  public clear(): void {
    this.activeEffects.forEach(effect => this.recycleEffect(effect));
  }
} 