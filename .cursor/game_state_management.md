# Game State Management

Create a Redux store structure for game state management, including robot configuration, battle stats, game progression, and player achievements.

## Environment State Requirements
- Track destructible object states
- Store collected items and their respawn timers
- Maintain NPC states and dialogue progress
- Record discovered areas and secrets
- Persist physics-affected object positions

## Physics State Requirements
- Store robot momentum and velocity between sessions
- Maintain constraint states for connected objects
- Record impact damage to environment
- Track energy consumption from movement
- Store transformation state (robot/vehicle)

## Performance Considerations
- Implement selective state serialization
- Use immutable data patterns for state updates
- Optimize state synchronization with physics engine
- Implement state compression for large environments