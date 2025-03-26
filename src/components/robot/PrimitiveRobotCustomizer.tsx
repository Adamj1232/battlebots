import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Color, Scene, WebGLRenderer } from 'three';
import { PrimitiveRobot } from '../../game/robots/PrimitiveRobot';
import { PartGenerator } from '../../game/robots/PartGenerator';
import { PartCategory, RobotConfig, RobotFaction } from '../../game/robots/types';
import { RobotPreview } from './RobotPreview';
import { StatsDisplay } from './StatsDisplay';
import { PartSelectionGrid } from './PartSelectionGrid';
import { ColorCustomizer } from './ColorCustomizer';

interface PrimitiveRobotCustomizerProps {
  initialConfig?: RobotConfig;
  faction: RobotFaction;
  onConfigChange?: (config: RobotConfig) => void;
  onSave?: (config: RobotConfig) => void;
}

export const PrimitiveRobotCustomizer: React.FC<PrimitiveRobotCustomizerProps> = ({
  initialConfig,
  faction,
  onConfigChange,
  onSave
}) => {
  // Refs
  const sceneRef = useRef<Scene>();
  const robotRef = useRef<PrimitiveRobot>();
  const partGeneratorRef = useRef<PartGenerator>();

  // State
  const [config, setConfig] = useState<RobotConfig>(() => initialConfig || {
    faction,
    parts: {
      head: `${faction}-basic-head`,
      torso: `${faction}-basic-torso`,
      leftArm: `${faction}-basic-arm`,
      rightArm: `${faction}-basic-arm`,
      leftLeg: `${faction}-basic-leg`,
      rightLeg: `${faction}-basic-leg`
    },
    colors: {
      primary: new Color(faction === 'autobot' ? 0xff0000 : 0x660066),
      secondary: new Color(faction === 'autobot' ? 0x0000ff : 0x330033)
    },
    materials: {
      metalness: 0.7,
      roughness: 0.3
    }
  });

  // Initialize scene and robot
  useEffect(() => {
    if (!sceneRef.current) {
      sceneRef.current = new Scene();
    }

    if (!partGeneratorRef.current) {
      partGeneratorRef.current = new PartGenerator();
    }

    if (!robotRef.current && sceneRef.current && partGeneratorRef.current) {
      robotRef.current = new PrimitiveRobot(sceneRef.current, partGeneratorRef.current);
      robotRef.current.assembleParts(config);
    }

    return () => {
      robotRef.current?.dispose();
    };
  }, []);

  // Update robot when config changes
  useEffect(() => {
    if (robotRef.current) {
      robotRef.current.assembleParts(config);
      onConfigChange?.(config);
    }
  }, [config, onConfigChange]);

  // Handlers
  const handlePartChange = useCallback((category: PartCategory, partId: string) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      switch (category) {
        case 'head':
          newConfig.parts.head = partId;
          break;
        case 'torso':
          newConfig.parts.torso = partId;
          break;
        case 'arm':
          // Ask which arm to change
          if (window.confirm('Change left arm? (Cancel for right arm)')) {
            newConfig.parts.leftArm = partId;
          } else {
            newConfig.parts.rightArm = partId;
          }
          break;
        case 'leg':
          // Ask which leg to change
          if (window.confirm('Change left leg? (Cancel for right leg)')) {
            newConfig.parts.leftLeg = partId;
          } else {
            newConfig.parts.rightLeg = partId;
          }
          break;
        case 'weapon':
          newConfig.parts.weapon = partId;
          break;
      }
      return newConfig;
    });
  }, []);

  const handleColorChange = useCallback((type: 'primary' | 'secondary', color: Color) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [type]: color
      }
    }));
  }, []);

  const handleMaterialChange = useCallback((property: 'metalness' | 'roughness', value: number) => {
    setConfig(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [property]: value
      }
    }));
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(config);
  }, [config, onSave]);

  // Available parts for current faction
  const availableParts = useMemo(() => {
    if (!partGeneratorRef.current) return {};

    return {
      head: partGeneratorRef.current.getAvailableParts('head', faction),
      torso: partGeneratorRef.current.getAvailableParts('torso', faction),
      arm: partGeneratorRef.current.getAvailableParts('arm', faction),
      leg: partGeneratorRef.current.getAvailableParts('leg', faction),
      weapon: partGeneratorRef.current.getAvailableParts('weapon', faction)
    };
  }, [faction]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-900 text-white rounded-lg">
      <div className="flex gap-6">
        {/* Left column - Part selection */}
        <div className="w-1/3">
          <h2 className="text-xl font-bold mb-4">Parts</h2>
          <div className="space-y-4">
            {Object.entries(availableParts).map(([category, parts]) => (
              <PartSelectionGrid
                key={category}
                category={category as PartCategory}
                parts={parts}
                selectedPart={config.parts[category as keyof typeof config.parts]}
                onSelect={(partId) => handlePartChange(category as PartCategory, partId)}
              />
            ))}
          </div>
        </div>

        {/* Center column - Robot preview */}
        <div className="w-1/3">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
            <RobotPreview
              scene={sceneRef.current}
              onRotate={(x, y) => {
                // Implement rotation logic
              }}
            />
          </div>
        </div>

        {/* Right column - Colors and materials */}
        <div className="w-1/3">
          <h2 className="text-xl font-bold mb-4">Customization</h2>
          <div className="space-y-6">
            <ColorCustomizer
              primaryColor={config.colors.primary}
              secondaryColor={config.colors.secondary}
              onPrimaryColorChange={(color) => handleColorChange('primary', color)}
              onSecondaryColorChange={(color) => handleColorChange('secondary', color)}
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Metalness</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.materials.metalness}
                  onChange={(e) => handleMaterialChange('metalness', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Roughness</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.materials.roughness}
                  onChange={(e) => handleMaterialChange('roughness', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - Stats and save button */}
      <div className="flex justify-between items-end">
        <StatsDisplay config={config} />
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Save Robot
        </button>
      </div>
    </div>
  );
}; 