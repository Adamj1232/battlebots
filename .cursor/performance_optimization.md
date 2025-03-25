# Performance Optimization Context

Implement techniques to maintain high performance with physics and a complex city environment.

Key optimizations:
- Use simplified collision geometries for physics
- Implement LOD (Level of Detail) for distant objects
- Apply physics sleeping for inactive objects
- Utilize instanced rendering for similar objects
- Implement object pooling for frequently created/destroyed elements
- Use frustum and occlusion culling effectively
- Optimize state updates to minimize unnecessary renders
- Apply texture compression where appropriate
- Balance physics simulation steps for performance

Priority areas:
- Maintain stable 60fps during battles
- Ensure smooth transitions between city zones
- Optimize memory usage for long play sessions
- Minimize garbage collection pauses
- Ensure consistent physics regardless of frame rate