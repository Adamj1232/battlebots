import { RobotConfig, RobotPart, PartStats } from '../game/entities/RobotParts';

const requiredParts = ['head', 'torso', 'arms', 'legs', 'weapon'] as const;
type RequiredPart = typeof requiredParts[number];
type StatKey = keyof PartStats;

export const validateRobotConfig = (config: RobotConfig): boolean => {
  if (!config) return false;

  // Check if all required parts are present
  const hasAllParts = requiredParts.every(part => 
    config[part] && typeof config[part] === 'object' && 'id' in (config[part] as RobotPart)
  );

  if (!hasAllParts) return false;

  // Validate each part
  return requiredParts.every(part => validateRobotPart(config[part] as RobotPart));
};

export const validateRobotPart = (part: RobotPart): boolean => {
  if (!part || typeof part !== 'object') return false;

  // Check required properties
  const requiredProps = ['id', 'type', 'stats'];
  const hasRequiredProps = requiredProps.every(prop => prop in part);
  if (!hasRequiredProps) return false;

  // Validate stats
  const stats = part.stats;
  if (!stats || typeof stats !== 'object') return false;

  const requiredStats: StatKey[] = ['health', 'speed', 'strength', 'defense'];
  const hasValidStats = requiredStats.every(stat => 
    typeof stats[stat] === 'number' && stats[stat] >= 0
  );

  return hasValidStats;
};

export const validateFactionCompatibility = (
  part: RobotPart,
  faction: 'autobot' | 'decepticon'
): boolean => {
  if (!part || !part.faction) return false;
  return part.faction === 'both' || part.faction === faction;
}; 