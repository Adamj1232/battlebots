import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import playerReducer, { PlayerState } from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer,
  },
});

export interface RootState {
  game: ReturnType<typeof gameReducer>;
  player: PlayerState;
}

export type AppDispatch = typeof store.dispatch;

export default store; 