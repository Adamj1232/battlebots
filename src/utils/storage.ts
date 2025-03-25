import { RootState } from '../state/store';

const STORAGE_KEY = 'transformers_battle_arena_state';

export const saveGameState = (state: RootState): void => {
  try {
    const serializedState = JSON.stringify({
      player: state.player,
      game: {
        currentScreen: state.game.currentScreen,
        selectedFaction: state.game.selectedFaction,
        accessibility: state.game.accessibility
      }
    });
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const loadGameState = (): Partial<RootState> => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return {};
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return {};
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

export const saveRobotConfig = (robotConfig: any): void => {
  try {
    const serializedConfig = JSON.stringify(robotConfig);
    localStorage.setItem('robot_config', serializedConfig);
  } catch (error) {
    console.error('Failed to save robot config:', error);
  }
};

export const loadRobotConfig = (): any => {
  try {
    const serializedConfig = localStorage.getItem('robot_config');
    if (!serializedConfig) return null;
    return JSON.parse(serializedConfig);
  } catch (error) {
    console.error('Failed to load robot config:', error);
    return null;
  }
}; 