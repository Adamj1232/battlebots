import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../state/store';
import { updateRobotPart } from '../../state/slices/playerSlice';
import { SciFiButton } from '../common/SciFiButton';
import { getAvailableParts, RobotPart } from '../../game/entities/RobotParts';
import '../../styles/PartSelectionGrid.css';

interface PartCardProps {
  id: string;
  name: string;
  description: string;
  rarity: string;
  stats: {
    health: number;
    speed: number;
    strength: number;
    defense: number;
    energy: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const PartCard: React.FC<PartCardProps> = ({
  name,
  description,
  rarity,
  stats,
  isSelected,
  onSelect,
}) => (
  <div className={`part-card ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
    <div className={`rarity-badge ${rarity}`}>{rarity}</div>
    <h3>{name}</h3>
    <p>{description}</p>
    <div className="part-stats">
      {Object.entries(stats).map(([stat, value]) => (
        <div key={stat} className="stat-bar">
          <span className="stat-label">{stat}</span>
          <div className="stat-bar-container">
            <div className="stat-value" style={{ width: `${(value / 100) * 100}%` }} />
            <span className="stat-number">{value}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PartSelectionGrid: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedFaction } = useSelector((state: RootState) => state.game);
  const { robot } = useSelector((state: RootState) => state.player);
  const [selectedType, setSelectedType] = React.useState<'head' | 'torso' | 'arms' | 'legs'>('head');

  const availableParts = React.useMemo(() => {
    if (!selectedFaction) return [];
    // Convert faction name to correct format
    const faction = selectedFaction === 'autobots' ? 'autobot' : 'decepticon';
    return getAvailableParts(selectedType, faction);
  }, [selectedType, selectedFaction]);

  const handlePartSelect = (part: RobotPart) => {
    dispatch(updateRobotPart({ type: part.type, part }));
  };

  return (
    <div className="part-selection">
      <div className="part-type-buttons">
        {(['head', 'torso', 'arms', 'legs'] as const).map((type) => (
          <SciFiButton
            key={type}
            variant={selectedType === type ? 'primary' : 'outline'}
            onClick={() => setSelectedType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </SciFiButton>
        ))}
      </div>

      <div className="parts-grid">
        {availableParts.map((part) => (
          <PartCard
            key={part.id}
            {...part}
            isSelected={robot[selectedType].id === part.id}
            onSelect={() => handlePartSelect(part)}
          />
        ))}
      </div>
    </div>
  );
}; 