import React from 'react';
import { RobotConfig } from '../../game/robots/types';
import '../../styles/StatsDisplay.css';

interface RobotStats {
  health: number;
  energy: number;
  strength: number;
  defense: number;
  speed: number;
}

interface StatsDisplayProps {
  config: RobotConfig;
}

const calculateTotalStats = (config: RobotConfig): RobotStats => {
  // For now, return mock stats based on the number of parts
  // In a real implementation, this would calculate based on actual part stats
  const partCount = Object.values(config.parts).filter(Boolean).length;
  
  return {
    health: partCount * 20,
    energy: partCount * 15,
    strength: partCount * 18,
    defense: partCount * 16,
    speed: partCount * 14
  };
};

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ config }) => {
  const totalStats = calculateTotalStats(config);

  return (
    <div className="stats-display">
      <h3 className="text-lg font-bold mb-4">Total Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="stat">
          <label className="block text-sm font-medium mb-1">Health</label>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${Math.min(100, totalStats.health / 2)}%` }}
            />
          </div>
          <span className="text-sm mt-1">{totalStats.health}</span>
        </div>
        <div className="stat">
          <label className="block text-sm font-medium mb-1">Energy</label>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, totalStats.energy / 2)}%` }}
            />
          </div>
          <span className="text-sm mt-1">{totalStats.energy}</span>
        </div>
        <div className="stat">
          <label className="block text-sm font-medium mb-1">Strength</label>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{ width: `${Math.min(100, totalStats.strength / 2)}%` }}
            />
          </div>
          <span className="text-sm mt-1">{totalStats.strength}</span>
        </div>
        <div className="stat">
          <label className="block text-sm font-medium mb-1">Defense</label>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${Math.min(100, totalStats.defense / 2)}%` }}
            />
          </div>
          <span className="text-sm mt-1">{totalStats.defense}</span>
        </div>
        <div className="stat">
          <label className="block text-sm font-medium mb-1">Speed</label>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${Math.min(100, totalStats.speed / 2)}%` }}
            />
          </div>
          <span className="text-sm mt-1">{totalStats.speed}</span>
        </div>
      </div>
    </div>
  );
}; 