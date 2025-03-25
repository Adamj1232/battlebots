import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../state/slices/gameSlice';
import '../../styles/StartScreen.css';

export const StartScreen: React.FC = () => {
  const dispatch = useDispatch();

  const handleStartGame = () => {
    dispatch(setCurrentScreen('faction-select'));
  };

  const handlePhysicsTest = () => {
    dispatch(setCurrentScreen('physics-test'));
  };

  const handleOptions = () => {
    dispatch(setCurrentScreen('options'));
  };

  const handleCredits = () => {
    dispatch(setCurrentScreen('credits'));
  };

  return (
    <div className="start-screen">
      <div className="logo">
        <h1>Transformers</h1>
        <h2>Battle Arena</h2>
      </div>

      <div className="menu">
        <button className="menu-button primary" onClick={handleStartGame}>
          Start Game
        </button>
        <button className="menu-button" onClick={handlePhysicsTest}>
          Physics Test
        </button>
        <button className="menu-button" onClick={handleOptions}>
          Options
        </button>
        <button className="menu-button" onClick={handleCredits}>
          Credits
        </button>
      </div>

      <div className="version">
        <span>Version 0.1.0</span>
      </div>
    </div>
  );
}; 