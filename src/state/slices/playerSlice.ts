import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Robot, RobotColors } from '../../types/Robot';
import { RobotPart } from '../../game/entities/RobotParts';

export interface PlayerState {
  robot: Robot | null;
  unlockedParts: RobotPart[];
  level: number;
  experience: number;
}

const initialState: PlayerState = {
  robot: null,
  unlockedParts: [],
  level: 1,
  experience: 0,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setRobot: (state, action: PayloadAction<Robot>) => {
      state.robot = action.payload;
    },
    updateRobotParts: (state, action: PayloadAction<{ partType: string; part: RobotPart }>) => {
      if (state.robot) {
        state.robot.parts[action.payload.partType] = action.payload.part;
      }
    },
    updateRobotColors: (state, action: PayloadAction<Partial<RobotColors>>) => {
      if (state.robot) {
        state.robot.colors = { ...state.robot.colors, ...action.payload };
      }
    },
    unlockPart: (state, action: PayloadAction<RobotPart>) => {
      if (!state.unlockedParts.some(part => part.id === action.payload.id)) {
        state.unlockedParts.push(action.payload);
      }
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
    addExperience: (state, action: PayloadAction<number>) => {
      state.experience += action.payload;
      // Simple leveling logic - can be expanded later
      if (state.experience >= state.level * 1000) {
        state.level += 1;
        state.experience = 0;
      }
    },
  },
});

export const { 
  setRobot, 
  updateRobotParts, 
  updateRobotColors, 
  unlockPart, 
  setLevel, 
  addExperience 
} = playerSlice.actions;

export default playerSlice.reducer; 