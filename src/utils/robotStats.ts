import { RobotConfig, PartStats } from '../game/entities/RobotParts';

export const calculateRobotStats = (parts: RobotConfig): PartStats => {
  const baseStats: PartStats = {
    health: 100,
    speed: 10,
    strength: 10,
    defense: 10,
    energy: 100
  };

  return Object.entries(parts).reduce((acc, [key, part]) => {
    if (typeof part === 'object' && 'stats' in part) {
      return {
        health: acc.health + part.stats.health,
        speed: acc.speed + part.stats.speed,
        strength: acc.strength + part.stats.strength,
        defense: acc.defense + part.stats.defense,
        energy: acc.energy + part.stats.energy
      };
    }
    return acc;
  }, baseStats);
};

export const calculateSpecialAbilities = (parts: RobotConfig): string[] => {
  return Object.values(parts)
    .filter((part): part is NonNullable<typeof part> => 
      typeof part === 'object' && 
      'specialAbility' in part && 
      part.specialAbility !== undefined
    )
    .map(part => part.specialAbility!.name);
};

export const calculateTotalPower = (stats: PartStats): number => {
  return (
    stats.health * 0.3 +
    stats.speed * 0.2 +
    stats.strength * 0.2 +
    stats.defense * 0.2 +
    stats.energy * 0.1
  );
}; 