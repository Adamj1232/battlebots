import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Faction } from '../../types/Robot';

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  soundEffects: boolean;
  backgroundMusic: boolean;
}

export interface GameState {
  currentScreen: string;
  selectedFaction: Faction | null;
  isLoading: boolean;
  error: string | null;
  loadingProgress: number;
  accessibility: AccessibilitySettings;
}

const initialState: GameState = {
  currentScreen: 'start',
  selectedFaction: null,
  isLoading: false,
  error: null,
  loadingProgress: 0,
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    soundEffects: true,
    backgroundMusic: true,
  },
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    },
    setSelectedFaction: (state, action: PayloadAction<Faction>) => {
      state.selectedFaction = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (!action.payload) {
        state.loadingProgress = 0;
      }
    },
    setLoadingProgress: (state, action: PayloadAction<number>) => {
      state.loadingProgress = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateAccessibility: (state, action: PayloadAction<Partial<AccessibilitySettings>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    resetGame: (state) => {
      state.currentScreen = 'start';
      state.selectedFaction = null;
      state.isLoading = false;
      state.error = null;
      state.loadingProgress = 0;
    },
  },
});

export const {
  setCurrentScreen,
  setSelectedFaction,
  setLoading,
  setLoadingProgress,
  setError,
  updateAccessibility,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer; 