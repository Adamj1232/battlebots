import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../state/slices/gameSlice';
import '../../styles/BattleScreen.css';

export const BattleScreen: React.FC = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine and battle scene here
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const handleExitBattle = () => {
    dispatch(setCurrentScreen('start'));
  };

  return (
    <div className="battle-screen">
      <canvas ref={canvasRef} className="battle-canvas" />
      
      <div className="battle-ui">
        <div className="top-bar">
          <button className="exit-button" onClick={handleExitBattle}>
            Exit Battle
          </button>
        </div>
        
        <div className="battle-arena">
          {/* Battle arena content will be added here */}
        </div>

        <div className="bottom-bar">
          <div className="player-stats">
            <h2>Your Robot</h2>
            <div className="stat-bar health">
              <label>Health</label>
              <div className="bar">
                <div className="fill" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="stat-bar energy">
              <label>Energy</label>
              <div className="bar">
                <div className="fill" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
          
          <div className="enemy-stats">
            <h2>Opponent</h2>
            <div className="stat-bar health">
              <label>Health</label>
              <div className="bar">
                <div className="fill" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="stat-bar energy">
              <label>Energy</label>
              <div className="bar">
                <div className="fill" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="battle-controls">
          {/* Battle controls will go here */}
        </div>
      </div>
    </div>
  );
}; 