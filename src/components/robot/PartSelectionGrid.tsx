import React from 'react';
import { PartCategory } from '../../game/robots/types';
import '../../styles/PartSelectionGrid.css';

interface PartSelectionGridProps {
  category: PartCategory;
  parts: string[];
  selectedPart?: string;
  onSelect: (partId: string) => void;
}

export const PartSelectionGrid: React.FC<PartSelectionGridProps> = ({
  category,
  parts,
  selectedPart,
  onSelect
}) => {
  const getCategoryLabel = (cat: PartCategory) => {
    switch (cat) {
      case 'head':
        return 'Head';
      case 'torso':
        return 'Torso';
      case 'arm':
        return 'Arms';
      case 'leg':
        return 'Legs';
      case 'weapon':
        return 'Weapons';
      default:
        return cat;
    }
  };

  return (
    <div className="part-selection">
      <h4 className="text-md font-medium mb-3">{getCategoryLabel(category)}</h4>
      <div className="grid grid-cols-2 gap-3">
        {parts.map((partId) => (
          <button
            key={partId}
            onClick={() => onSelect(partId)}
            className={`
              p-3 rounded-lg border-2 transition-colors
              ${selectedPart === partId
                ? 'bg-blue-600 border-blue-400'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }
            `}
          >
            <div className="text-sm truncate">{partId}</div>
          </button>
        ))}
      </div>
    </div>
  );
}; 