import { RobotConfig } from '../game/entities/RobotParts';

const STORAGE_KEY = 'saved_robots';

interface SavedRobot extends RobotConfig {
  id: string;
  name: string;
  createdAt: number;
}

export const saveRobot = (robot: RobotConfig, name: string): SavedRobot => {
  const savedRobots = getSavedRobots();
  const newRobot: SavedRobot = {
    ...robot,
    id: Date.now().toString(),
    name,
    createdAt: Date.now(),
  };

  savedRobots.push(newRobot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRobots));
  return newRobot;
};

export const getSavedRobots = (): SavedRobot[] => {
  const savedRobotsJson = localStorage.getItem(STORAGE_KEY);
  return savedRobotsJson ? JSON.parse(savedRobotsJson) : [];
};

export const loadRobot = (id: string): SavedRobot | null => {
  const savedRobots = getSavedRobots();
  return savedRobots.find(robot => robot.id === id) || null;
};

export const deleteRobot = (id: string): void => {
  const savedRobots = getSavedRobots();
  const filteredRobots = savedRobots.filter(robot => robot.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRobots));
}; 