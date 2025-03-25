import React, { useState } from 'react';
import useScreenTransition from '../../hooks/useScreenTransition';
import '../../styles/StartScreen.css';

const StartScreen: React.FC = () => {
  const { transitionToScreen } = useScreenTransition();
  const [showOptions, setShowOptions] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const handleStartGame = async () => {
    await transitionToScreen('faction-select');
  };

  const handlePhysicsTest = async () => {
    await transitionToScreen('physics-test');
  };

  return (
    <div className="start-screen">
      <div className="game-title">
        <h1>TRANSFORMERS</h1>
        <h2>BATTLE ARENA</h2>
      </div>
      
      <div className="menu-buttons">
        <button className="start-button" onClick={handleStartGame}>
          START GAME
        </button>
        <button 
          className="options-button" 
          onClick={() => setShowOptions(true)}
        >
          OPTIONS
        </button>
        <button 
          className="credits-button" 
          onClick={() => setShowCredits(true)}
        >
          CREDITS
        </button>
        <button 
          className="physics-test-button" 
          onClick={handlePhysicsTest}
        >
          PHYSICS TEST
        </button>
      </div>

      {showOptions && (
        <div className="modal">
          <div className="modal-content">
            <h2>Options</h2>
            {/* Options content will go here */}
            <button onClick={() => setShowOptions(false)}>Close</button>
          </div>
        </div>
      )}

      {showCredits && (
        <div className="modal">
          <div className="modal-content">
            <h2>Credits</h2>
            {/* Credits content will go here */}
            <button onClick={() => setShowCredits(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="footer">
        <p>A game for 7-10 year olds</p>
      </div>
    </div>
  );
};

export default StartScreen; 