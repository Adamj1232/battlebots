import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentScreen } from '../../state/slices/gameSlice';
import { RootState } from '../../state/store';
import '../../styles/RobotCustomizationScreen.css';

export const RobotCustomizationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const selectedFaction = useSelector((state: RootState) => state.game.selectedFaction);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [robotColors, setRobotColors] = useState({
    primary: '#ff0000',
    secondary: '#0000ff',
    accent: '#ffff00'
  });

  const handlePartSelect = (part: string) => {
    setSelectedPart(part);
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    setRobotColors(prev => ({
      ...prev,
      [colorType]: color
    }));
  };

  const handleBack = () => {
    dispatch(setCurrentScreen('faction-select'));
  };

  const handleComplete = () => {
    dispatch(setCurrentScreen('battle'));
  };

  return (
    <div className="robot-customization-screen">
      <h1>Customize Your Robot</h1>

      <div className="customization-layout">
        <div className="preview-section">
          {/* 3D Robot Preview will go here */}
        </div>

        <div className="controls-section">
          <div className="part-selection">
            <h2>Robot Parts</h2>
            <div className="parts-grid">
              <button
                className={`part-button ${selectedPart === 'head' ? 'selected' : ''}`}
                onClick={() => handlePartSelect('head')}
              >
                Head
              </button>
              <button
                className={`part-button ${selectedPart === 'torso' ? 'selected' : ''}`}
                onClick={() => handlePartSelect('torso')}
              >
                Torso
              </button>
              <button
                className={`part-button ${selectedPart === 'arms' ? 'selected' : ''}`}
                onClick={() => handlePartSelect('arms')}
              >
                Arms
              </button>
              <button
                className={`part-button ${selectedPart === 'legs' ? 'selected' : ''}`}
                onClick={() => handlePartSelect('legs')}
              >
                Legs
              </button>
            </div>
          </div>

          <div className="color-selection">
            <h2>Colors</h2>
            <div className="color-pickers">
              <div className="color-picker">
                <label>Primary Color</label>
                <input
                  type="color"
                  value={robotColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                />
              </div>
              <div className="color-picker">
                <label>Secondary Color</label>
                <input
                  type="color"
                  value={robotColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                />
              </div>
              <div className="color-picker">
                <label>Accent Color</label>
                <input
                  type="color"
                  value={robotColors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="button-group">
            <button className="back-button" onClick={handleBack}>
              Back
            </button>
            <button className="complete-button" onClick={handleComplete}>
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 