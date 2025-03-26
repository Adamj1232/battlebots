import React from 'react';
import { Color } from 'three';
import '../../styles/ColorCustomizer.css';

interface ColorCustomizerProps {
  primaryColor: Color;
  secondaryColor: Color;
  onPrimaryColorChange: (color: Color) => void;
  onSecondaryColorChange: (color: Color) => void;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  primaryColor,
  secondaryColor,
  onPrimaryColorChange,
  onSecondaryColorChange
}) => {
  const colorToHex = (color: Color) => '#' + color.getHexString();
  const hexToColor = (hex: string) => new Color(hex);

  return (
    <div className="color-customizer">
      <h3 className="text-lg font-bold mb-4">Color Scheme</h3>
      <div className="space-y-4">
        <div className="color-input">
          <label htmlFor="primary-color" className="block text-sm font-medium mb-2">
            Primary Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              id="primary-color"
              value={colorToHex(primaryColor)}
              onChange={(e) => onPrimaryColorChange(hexToColor(e.target.value))}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <div className="preview-box w-12 h-12 rounded" style={{ backgroundColor: colorToHex(primaryColor) }} />
          </div>
        </div>
        <div className="color-input">
          <label htmlFor="secondary-color" className="block text-sm font-medium mb-2">
            Secondary Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              id="secondary-color"
              value={colorToHex(secondaryColor)}
              onChange={(e) => onSecondaryColorChange(hexToColor(e.target.value))}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <div className="preview-box w-12 h-12 rounded" style={{ backgroundColor: colorToHex(secondaryColor) }} />
          </div>
        </div>
      </div>
    </div>
  );
}; 