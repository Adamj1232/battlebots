import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GameScreen = 
  | 'loading'
  | 'start'
  | 'faction-select'
  | 'robot-customization'
  | 'physics-test'
  | 'city-test';

interface GameState {
  currentScreen: GameScreen;
  error: string | null;
  accessibility: {
    colorblindMode: boolean;
    motionReduced: boolean;
    screenReader: boolean;
  };
}

const initialState: GameState = {
  currentScreen: 'loading',
  error: null,
  accessibility: {
    colorblindMode: false,
    motionReduced: false,
    screenReader: false
  }
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setScreen: (state, action: PayloadAction<GameScreen>) => {
      state.currentScreen = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateAccessibility: (state, action: PayloadAction<Partial<GameState['accessibility']>>) => {
      state.accessibility = {
        ...state.accessibility,
        ...action.payload
      };
    }
  }
});

export const { setScreen, setError, updateAccessibility } = gameSlice.actions;
export default gameSlice.reducer; 