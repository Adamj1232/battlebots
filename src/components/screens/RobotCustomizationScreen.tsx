import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { PrimitiveRobot } from '../../game/robots/PrimitiveRobot';
import { PartGenerator } from '../../game/robots/PartGenerator';
import { RobotPreview } from '../robot/RobotPreview';
import { Scene, Color, Object3D } from 'three';
import { RobotFaction } from '../../game/robots/types';
import { setCurrentScreen } from '../../state/slices/gameSlice';
import '../../styles/RobotCustomizationScreen.css';

// Type for the simplified part categories in the UI
type UIPartCategory = 'head' | 'torso' | 'arms' | 'legs';

// Map UI categories to actual part categories
const categoryMap: Record<UIPartCategory, string> = {
  head: 'head',
  torso: 'torso',
  arms: 'arm',
  legs: 'leg'
};

const partCategories: UIPartCategory[] = ['head', 'torso', 'arms', 'legs'];

export const RobotCustomizationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const sceneRef = useRef<Scene>(new Scene());
  const [partGenerator] = useState(() => new PartGenerator());
  const [selectedFaction] = useState<RobotFaction>('autobot');
  const [robot, setRobot] = useState<PrimitiveRobot | null>(null);
  const [config, setConfig] = useState({
    faction: selectedFaction,
    parts: {
      head: `${selectedFaction}-basic-head`,
      torso: `${selectedFaction}-basic-torso`,
      leftArm: `${selectedFaction}-basic-arm`,
      rightArm: `${selectedFaction}-basic-arm`,
      leftLeg: `${selectedFaction}-basic-leg`,
      rightLeg: `${selectedFaction}-basic-leg`
    },
    colors: {
      primary: new Color('#29b6f6'),
      secondary: new Color('#0288d1')
    },
    materials: {
      metalness: 0.7,
      roughness: 0.3
    }
  });

  // Initialize robot
  useEffect(() => {
    const newRobot = new PrimitiveRobot(sceneRef.current, partGenerator);
    newRobot.assembleParts(config);
    
    // Center the robot
    newRobot.traverse((object: Object3D) => {
      if (object.name === 'root') {
        object.position.y = -1;
      }
    });

    setRobot(newRobot);

    return () => {
      newRobot.dispose();
    };
  }, []);

  // Handle updates to config
  useEffect(() => {
    if (robot) {
      robot.assembleParts(config);
      robot.updateColors(config.colors.primary, config.colors.secondary);
    }
  }, [config, robot]);

  const handlePartSelect = (category: UIPartCategory) => {
    const actualCategory = categoryMap[category];
    const partId = `${selectedFaction}-basic-${actualCategory}`;
    
    setConfig(prev => ({
      ...prev,
      parts: {
        ...prev.parts,
        [category === 'arms' ? 'leftArm' : category]: partId,
        ...(category === 'arms' ? { rightArm: partId } : {}),
        ...(category === 'legs' ? { rightLeg: partId } : {})
      }
    }));
  };

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [type]: new Color(color)
      }
    }));
  };

  const isPartSelected = (category: UIPartCategory) => {
    const partId = `${selectedFaction}-basic-${categoryMap[category]}`;
    if (category === 'arms') {
      return config.parts.leftArm === partId && config.parts.rightArm === partId;
    }
    if (category === 'legs') {
      return config.parts.leftLeg === partId && config.parts.rightLeg === partId;
    }
    return config.parts[category] === partId;
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
          <div className="preview-container">
            <RobotPreview scene={sceneRef.current} />
          </div>
        </div>
        <div className="controls-section">
          <div className="part-selection">
            <h2>Select Parts</h2>
            <div className="parts-grid">
              {partCategories.map(category => (
                <button
                  key={category}
                  className={`part-button ${isPartSelected(category) ? 'selected' : ''}`}
                  onClick={() => handlePartSelect(category)}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="color-selection">
            <h2>Colors</h2>
            <div className="color-pickers">
              <div className="color-picker">
                <label>Primary Color</label>
                <input
                  type="color"
                  value={'#' + config.colors.primary.getHexString()}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                />
              </div>
              <div className="color-picker">
                <label>Secondary Color</label>
                <input
                  type="color"
                  value={'#' + config.colors.secondary.getHexString()}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
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