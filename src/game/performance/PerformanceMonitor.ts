export interface PerformanceMetrics {
  fps: number;
  physicsTime: number;
  renderTime: number;
  memoryUsage: number;
  activeBodies: number;
  drawCalls: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    physicsTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    activeBodies: 0,
    drawCalls: 0
  };

  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private lastFPSUpdate: number = performance.now();
  private fpsUpdateInterval: number = 1000; // Update FPS every second

  public update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFPSUpdate >= this.fpsUpdateInterval) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
    }

    // Update memory usage
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
  }

  public recordPhysicsTime(time: number): void {
    this.metrics.physicsTime = time;
  }

  public recordRenderTime(time: number): void {
    this.metrics.renderTime = time;
  }

  public updateActiveBodies(count: number): void {
    this.metrics.activeBodies = count;
  }

  public updateDrawCalls(count: number): void {
    this.metrics.drawCalls = count;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public isPerformanceAcceptable(): boolean {
    return (
      this.metrics.fps >= 30 &&
      this.metrics.physicsTime < 16 && // Less than 16ms for physics
      this.metrics.renderTime < 16 && // Less than 16ms for rendering
      this.metrics.memoryUsage < 500 // Less than 500MB
    );
  }

  public getPerformanceWarnings(): string[] {
    const warnings: string[] = [];

    if (this.metrics.fps < 30) {
      warnings.push(`Low FPS: ${this.metrics.fps}`);
    }

    if (this.metrics.physicsTime >= 16) {
      warnings.push(`High physics time: ${this.metrics.physicsTime.toFixed(2)}ms`);
    }

    if (this.metrics.renderTime >= 16) {
      warnings.push(`High render time: ${this.metrics.renderTime.toFixed(2)}ms`);
    }

    if (this.metrics.memoryUsage >= 500) {
      warnings.push(`High memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB`);
    }

    if (this.metrics.activeBodies > 100) {
      warnings.push(`High number of active bodies: ${this.metrics.activeBodies}`);
    }

    if (this.metrics.drawCalls > 100) {
      warnings.push(`High number of draw calls: ${this.metrics.drawCalls}`);
    }

    return warnings;
  }

  public reset(): void {
    this.metrics = {
      fps: 0,
      physicsTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      activeBodies: 0,
      drawCalls: 0
    };
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastFPSUpdate = performance.now();
  }
} 