import { RobotPart } from '../game/entities/RobotParts';
import { AppDispatch } from '../state/store';
import { unlockPart } from '../state/slices/playerSlice';

interface UnlockRequirement {
  type: 'level' | 'achievement' | 'mission';
  value: string | number;
}

interface UnlockCondition {
  requirement: UnlockRequirement;
  check: (playerData: any) => boolean;
}

const unlockConditions: Record<string, UnlockCondition> = {
  level: {
    requirement: { type: 'level', value: 5 },
    check: (playerData) => playerData.level >= 5,
  },
  achievement: {
    requirement: { type: 'achievement', value: 'first_victory' },
    check: (playerData) => playerData.achievements.includes('first_victory'),
  },
  mission: {
    requirement: { type: 'mission', value: 'tutorial_complete' },
    check: (playerData) => playerData.completedMissions.includes('tutorial_complete'),
  },
};

export const checkPartUnlock = (
  part: RobotPart,
  playerData: any,
  dispatch: AppDispatch
): boolean => {
  if (!part.unlockRequirement) return true;

  const condition = unlockConditions[part.unlockRequirement.type];
  if (!condition) return true;

  const isUnlocked = condition.check(playerData);
  if (isUnlocked) {
    dispatch(unlockPart(part));
  }

  return isUnlocked;
};

export const getUnlockRequirementText = (requirement: UnlockRequirement): string => {
  switch (requirement.type) {
    case 'level':
      return `Reach Level ${requirement.value}`;
    case 'achievement':
      return `Complete Achievement: ${requirement.value}`;
    case 'mission':
      return `Complete Mission: ${requirement.value}`;
    default:
      return 'Unknown requirement';
  }
}; 