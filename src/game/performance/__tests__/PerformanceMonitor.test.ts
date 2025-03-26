import { PerformanceMonitor } from '../PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should initialize with zero metrics', () => {
    const metrics = monitor.getMetrics();
    expect(metrics.fps).toBe(0);
    expect(metrics.physicsTime).toBe(0);
    expect(metrics.renderTime).toBe(0);
    expect(metrics.memoryUsage).toBe(0);
    expect(metrics.activeBodies).toBe(0);
    expect(metrics.drawCalls).toBe(0);
  });

  it('should record performance metrics', () => {
    monitor.recordPhysicsTime(10);
    monitor.recordRenderTime(8);
    monitor.updateActiveBodies(50);
    monitor.updateDrawCalls(75);

    const metrics = monitor.getMetrics();
    expect(metrics.physicsTime).toBe(10);
    expect(metrics.renderTime).toBe(8);
    expect(metrics.activeBodies).toBe(50);
    expect(metrics.drawCalls).toBe(75);
  });

  it('should detect performance issues', () => {
    monitor.recordPhysicsTime(20);
    monitor.recordRenderTime(20);
    monitor.updateActiveBodies(150);
    monitor.updateDrawCalls(150);

    const warnings = monitor.getPerformanceWarnings();
    expect(warnings).toContain('High physics time: 20.00ms');
    expect(warnings).toContain('High render time: 20.00ms');
    expect(warnings).toContain('High number of active bodies: 150');
    expect(warnings).toContain('High number of draw calls: 150');
  });

  it('should evaluate performance acceptability', () => {
    // Good performance
    monitor.recordPhysicsTime(10);
    monitor.recordRenderTime(10);
    expect(monitor.isPerformanceAcceptable()).toBe(true);

    // Poor performance
    monitor.recordPhysicsTime(20);
    monitor.recordRenderTime(20);
    expect(monitor.isPerformanceAcceptable()).toBe(false);
  });

  it('should reset metrics', () => {
    monitor.recordPhysicsTime(10);
    monitor.recordRenderTime(8);
    monitor.updateActiveBodies(50);
    monitor.updateDrawCalls(75);

    monitor.reset();
    const metrics = monitor.getMetrics();
    expect(metrics.fps).toBe(0);
    expect(metrics.physicsTime).toBe(0);
    expect(metrics.renderTime).toBe(0);
    expect(metrics.memoryUsage).toBe(0);
    expect(metrics.activeBodies).toBe(0);
    expect(metrics.drawCalls).toBe(0);
  });
}); 