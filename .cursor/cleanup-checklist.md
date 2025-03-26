# Instructions for Implementing Primitive-Based Robot System

Follow these high-level instructions to pivot our Transformers Battle Arena game to use primitive-based robot representations instead of external 3D models.

## Implementation Steps

### 1. Core Primitive Generation

Create a robust system for generating robot parts from Three.js primitives:

- Implement a `PartGenerator` class that creates different robot parts
- Design distinct visual styles for Autobots vs Decepticons
- Create variations for each part type (heads, torsos, arms, legs, weapons)
- Implement a consistent socket system for connecting parts

### 2. Robot Assembly

Create a modular robot assembly system:

- Implement a hierarchy of parts with proper parent-child relationships
- Create a standardized attachment system between components
- Support runtime part swapping for customization
- Maintain compatibility with existing animation and physics systems

### 3. Update Customization UI

Modify the robot customization screens:

- Update part selection UI to show primitive-based parts
- Create previews of different part combinations
- Implement color and material customization
- Update robot stats based on part selection

### 4. Battle System Integration

Ensure the battle system works with primitive-based robots:

- Update targeting to work with primitive parts
- Implement damage visualization on primitives (color shifts, deformation)
- Create impact effects appropriate for primitive robots
- Ensure animations function properly on the new robot representation

### 5. Performance Optimization

Optimize the new system for browser performance:

- Implement geometry sharing between similar parts
- Set up material caching to reduce state changes
- Create efficient update loops for animations
- Optimize rendering with appropriate draw order

### 6. Code Cleanup

Remove unnecessary code related to external models:

- Remove model loading code
- Clean up asset management for external models
- Remove unused dependencies
- Update documentation to reflect the new approach

## Transition Process

To make this transition smooth:

1. First implement a prototype of a single robot with primitives
2. Test its integration with physics and combat systems
3. Expand to create all part variations
4. Update the UI to support the new system
5. Remove old model-based code

This pivot will improve performance, provide more consistent visual style, and simplify future extensions to the game.