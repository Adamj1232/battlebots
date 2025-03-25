import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../state/slices/gameSlice';
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
          {/* Physics test canvas will be added here */}
        </div>

        <div className="test-panel">
          <div className="test-options">
            <h3>Test Options</h3>
            {/* Test options will be added here */}
          </div>

          <div className="test-results">
            <h3>Test Results</h3>
            {/* Test results will be displayed here */}
          </div>
        </div>
      </div>
    </div>
  );
}; 