import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { updateRobotColors } from '../../state/slices/playerSlice';
import '../../styles/ColorCustomizer.css';

export const ColorCustomizer: React.FC = () => {
  const dispatch = useDispatch();
  const robot = useSelector((state: RootState) => state.player.robot);

  const handleColorChange = (type: 'primary' | 'secondary' | 'accent', color: string) => {
    if (!robot) return;
    dispatch(updateRobotColors({ [type]: color }));
  };

  if (!robot) return null;

  return (
    <div className="color-customizer">
      <h3>Color Scheme</h3>
      <div className="color-inputs">
        <div className="color-input">
          <label htmlFor="primary-color">Primary Color</label>
          <input
            type="color"
            id="primary-color"
            value={robot.colors.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
          />
        </div>
        <div className="color-input">
          <label htmlFor="secondary-color">Secondary Color</label>
          <input
            type="color"
            id="secondary-color"
            value={robot.colors.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
          />
        </div>
        <div className="color-input">
          <label htmlFor="accent-color">Accent Color</label>
          <input
            type="color"
            id="accent-color"
            value={robot.colors.accent}
            onChange={(e) => handleColorChange('accent', e.target.value)}
          />
        </div>
      </div>
      <div className="color-preview">
        <div className="preview-box" style={{ backgroundColor: robot.colors.primary }} />
        <div className="preview-box" style={{ backgroundColor: robot.colors.secondary }} />
        <div className="preview-box" style={{ backgroundColor: robot.colors.accent }} />
      </div>
    </div>
  );
}; 