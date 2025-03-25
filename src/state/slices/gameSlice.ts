import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GameState {
  currentScreen: string;
  engineInitialized: boolean;
  showCanvas: boolean;
  isLoading: boolean;
  loadingProgress: number;
  gameStarted: boolean;
  gamePaused: boolean;
  currentLevel: number;
  selectedFaction: 'autobots' | 'decepticons' | null;
  error: string | null;
  accessibility: {
    colorblindMode: boolean;
    motionReduced: boolean;
    screenReader: boolean;
  };
}

const initialState: GameState = {
  currentScreen: 'start',
  engineInitialized: false,
  showCanvas: false,
  isLoading: false,
  loadingProgress: 0,
  gameStarted: false,
  gamePaused: false,
  currentLevel: 1,
  selectedFaction: null,
  error: null,
  accessibility: {
    colorblindMode: false,
    motionReduced: false,
    screenReader: false,
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      return { ...state, ...action.payload };
    },
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
      state.showCanvas = ['robot-customization', 'city', 'battle', 'physics-test'].includes(action.payload);
    },
    setLoadingProgress: (state, action: PayloadAction<number>) => {
      state.loadingProgress = action.payload;
    },
    startGame: (state) => {
      state.gameStarted = true;
      state.gamePaused = false;
    },
    pauseGame: (state) => {
      state.gamePaused = true;
    },
    resumeGame: (state) => {
      state.gamePaused = false;
    },
    setSelectedFaction: (state, action: PayloadAction<'autobots' | 'decepticons'>) => {
      state.selectedFaction = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateAccessibility: (state, action: PayloadAction<Partial<GameState['accessibility']>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
  },
});

export const {
  setGameState,
  setCurrentScreen,
  setLoadingProgress,
  startGame,
  pauseGame,
  resumeGame,
  setSelectedFaction,
  setError,
  updateAccessibility,
} = gameSlice.actions;

export default gameSlice.reducer; 