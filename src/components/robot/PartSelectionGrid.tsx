import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { updateRobotParts } from '../../state/slices/playerSlice';
import { RobotPart } from '../../game/entities/RobotParts';
import { Faction } from '../../types/Robot';
import '../../styles/PartSelectionGrid.css';

type PartType = 'head' | 'torso' | 'arms' | 'legs' | 'weapon';

const mockParts: RobotPart[] = [
  {
    id: 'head1',
    name: 'Basic Head',
    type: 'head',
    faction: 'autobot',
    rarity: 'common',
    modelPath: '/models/head1.glb',
    previewImage: '/images/head1.png',
    description: 'Standard issue head unit',
    stats: {
      health: 50,
      energy: 40,
      strength: 30,
      defense: 45,
      speed: 35
    }
  },
  {
    id: 'torso1',
    name: 'Basic Torso',
    type: 'torso',
    faction: 'autobot',
    rarity: 'common',
    modelPath: '/models/torso1.glb',
    previewImage: '/images/torso1.png',
    description: 'Standard issue torso unit',
    stats: {
      health: 70,
      energy: 50,
      strength: 40,
      defense: 60,
      speed: 30
    }
  },
  {
    id: 'arms1',
    name: 'Basic Arms',
    type: 'arms',
    faction: 'autobot',
    rarity: 'common',
    modelPath: '/models/arms1.glb',
    previewImage: '/images/arms1.png',
    description: 'Standard issue arm units',
    stats: {
      health: 40,
      energy: 45,
      strength: 55,
      defense: 35,
      speed: 50
    }
  },
  {
    id: 'legs1',
    name: 'Basic Legs',
    type: 'legs',
    faction: 'autobot',
    rarity: 'common',
    modelPath: '/models/legs1.glb',
    previewImage: '/images/legs1.png',
    description: 'Standard issue leg units',
    stats: {
      health: 45,
      energy: 35,
      strength: 30,
      defense: 40,
      speed: 60
    }
  }
];

export const PartSelectionGrid: React.FC = () => {
  const dispatch = useDispatch();
  const robot = useSelector((state: RootState) => state.player.robot);
  const [selectedType, setSelectedType] = useState<PartType>('head');

  const handlePartSelect = (part: RobotPart) => {
    if (!robot) return;
    dispatch(updateRobotParts({ 
      partType: part.type,
      part: part
    }));
  };

  const filteredParts = mockParts.filter(part => part.type === selectedType);

  return (
    <div className="part-selection-grid">
      <div className="part-type-selector">
        <button 
          className={`type-button ${selectedType === 'head' ? 'selected' : ''}`}
          onClick={() => setSelectedType('head')}
        >
          Head
        </button>
        <button 
          className={`type-button ${selectedType === 'torso' ? 'selected' : ''}`}
          onClick={() => setSelectedType('torso')}
        >
          Torso
        </button>
        <button 
          className={`type-button ${selectedType === 'arms' ? 'selected' : ''}`}
          onClick={() => setSelectedType('arms')}
        >
          Arms
        </button>
        <button 
          className={`type-button ${selectedType === 'legs' ? 'selected' : ''}`}
          onClick={() => setSelectedType('legs')}
        >
          Legs
        </button>
      </div>

      <div className="parts-grid">
        {filteredParts.map((part) => (
          <div 
            key={part.id}
            className={`part-card ${robot?.parts[part.type]?.id === part.id ? 'selected' : ''}`}
            onClick={() => handlePartSelect(part)}
          >
            <h3>{part.name}</h3>
            <div className="stats">
              <div className="stat">
                <label>Health</label>
                <div className="stat-bar">
                  <div className="fill" style={{ width: `${part.stats.health}%` }}></div>
                  <span className="value">{part.stats.health}</span>
                </div>
              </div>
              <div className="stat">
                <label>Energy</label>
                <div className="stat-bar">
                  <div className="fill" style={{ width: `${part.stats.energy}%` }}></div>
                  <span className="value">{part.stats.energy}</span>
                </div>
              </div>
              <div className="stat">
                <label>Strength</label>
                <div className="stat-bar">
                  <div className="fill" style={{ width: `${part.stats.strength}%` }}></div>
                  <span className="value">{part.stats.strength}</span>
                </div>
              </div>
              <div className="stat">
                <label>Defense</label>
                <div className="stat-bar">
                  <div className="fill" style={{ width: `${part.stats.defense}%` }}></div>
                  <span className="value">{part.stats.defense}</span>
                </div>
              </div>
              <div className="stat">
                <label>Speed</label>
                <div className="stat-bar">
                  <div className="fill" style={{ width: `${part.stats.speed}%` }}></div>
                  <span className="value">{part.stats.speed}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 