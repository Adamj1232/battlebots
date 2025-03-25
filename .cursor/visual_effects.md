# Visual Effects Implementation

Create impressive but performant visual effects for the battle system that provide clear feedback while maintaining the sci-fi aesthetic.

## Core Visual Effect Types
- Impact effects (sparks, metal fragments, energy bursts)
- Weapon trails (melee swings, projectile paths)
- Status effect indicators (burning, freezing, electrified)
- Environmental reactions (ground impacts, wall damage)
- Transformation sequences (robot to vehicle transitions)
- Special ability effects (ultimates, special attacks)
- Health/damage indicators (robot part damage visualization)

## Technical Implementation
- Use instanced particle systems for performance
- Implement shader-based effects for energy weapons
- Create texture atlas for particle variations
- Design LOD system for effects based on distance/importance
- Implement effect pooling for frequently used particles
- Create composite effects from reusable components
- Design screen-space effects for player feedback

## Performance Considerations
- Limit particle count based on device capabilities
- Implement effect culling for off-screen combat
- Design effects with appropriate lifetimes
- Use billboards for distant effects
- Implement priority system for effect limits
- Optimize shader complexity for mobile compatibility
- Create fallback effects for performance-constrained scenarios

## Child-Friendly Design
- Use clear, readable effect designs
- Implement consistent color language (red=damage, etc.)
- Create effects that telegraph enemy actions
- Design distinctive effects for different ability types
- Ensure effects don't obscure critical gameplay elements
- Create satisfying visual feedback that encourages strategic play
- Use effects to guide player attention to important events

## Animation Integration
- Synchronize effects with animation keyframes
- Create seamless transitions between combat states
- Implement procedural animation for reactive effects
- Design animation blending for smooth combat flow
- Create impact reactions appropriate to attack strength
- Implement camera reactions to major effects
- Design transformation animations with appropriate weight