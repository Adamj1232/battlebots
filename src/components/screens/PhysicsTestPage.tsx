import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../state/slices/gameSlice';
import { PhysicsTest } from '../game/PhysicsTest';
import '../../styles/PhysicsTestPage.css';

export const PhysicsTestPage: React.FC = () => {
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(setCurrentScreen('start'));
  };

  return (
    <div className="physics-test-page">
      <div className="test-controls">
        <button className="back-button" onClick={handleBack}>
          Back to Menu
        </button>
        <h2>Physics Test Environment</h2>
      </div>

      <div className="test-area">
        <div className="test-canvas">
          <PhysicsTest />
        </div>

        <div className="test-panel">
          <div className="test-options">
            <h3>Test Options</h3>
            <p>Use mouse to control camera:</p>
            <ul>
              <li>Left click + drag to rotate</li>
              <li>Right click + drag to pan</li>
              <li>Scroll to zoom</li>
            </ul>
          </div>

          <div className="test-results">
            <h3>Test Objects</h3>
            <ul>
              <li>Red Box</li>
              <li>Green Sphere</li>
              <li>Blue Cylinder</li>
            </ul>
            <p>Objects will fall under gravity and interact with the ground plane.</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 