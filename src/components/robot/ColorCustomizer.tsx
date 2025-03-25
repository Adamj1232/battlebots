import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { updateRobotColors } from '../../state/slices/playerSlice';
import '../../styles/ColorCustomizer.css';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="color-picker">
    <label>{label}</label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const ColorCustomizer: React.FC = () => {
  const dispatch = useDispatch();
  const { robot } = useSelector((state: RootState) => state.player);

  const handleColorChange = (type: 'primary' | 'secondary' | 'accent', color: string) => {
    dispatch(updateRobotColors({
      primary: type === 'primary' ? color : robot.primaryColor,
      secondary: type === 'secondary' ? color : robot.secondaryColor,
      accent: type === 'accent' ? color : robot.accentColor
    }));
  };

  return (
    <div className="color-customizer">
      <h3>Color Scheme</h3>
      <div className="color-options">
        <ColorPicker
          label="Primary Color"
          value={robot.primaryColor}
          onChange={(color) => handleColorChange('primary', color)}
        />
        <ColorPicker
          label="Secondary Color"
          value={robot.secondaryColor}
          onChange={(color) => handleColorChange('secondary', color)}
        />
        <ColorPicker
          label="Accent Color"
          value={robot.accentColor}
          onChange={(color) => handleColorChange('accent', color)}
        />
      </div>
      <div className="color-preview">
        <div className="preview-swatch" style={{ backgroundColor: robot.primaryColor }} />
        <div className="preview-swatch" style={{ backgroundColor: robot.secondaryColor }} />
        <div className="preview-swatch" style={{ backgroundColor: robot.accentColor }} />
      </div>
    </div>
  );
}; 