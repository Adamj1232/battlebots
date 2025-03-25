import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { calculateTotalStats } from '../../game/entities/RobotParts';
import '../../styles/StatsDisplay.css';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue = 100,
  color = '#00f2ff'
}) => (
  <div className="stat-bar">
    <span className="stat-label">{label}</span>
    <div className="stat-bar-container">
      <div
        className="stat-value"
        style={{
          width: `${(value / maxValue) * 100}%`,
          backgroundColor: color
        }}
      />
      <span className="stat-number">{value}</span>
    </div>
  </div>
);

export const StatsDisplay: React.FC = () => {
  const { robot } = useSelector((state: RootState) => state.player);
  const totalStats = calculateTotalStats(robot);

  return (
    <div className="stats-display">
      <h3>Robot Stats</h3>
      <div className="stats-grid">
        <StatBar label="Health" value={totalStats.health} color="#ff3d00" />
        <StatBar label="Defense" value={totalStats.defense} color="#00e676" />
        <StatBar label="Speed" value={totalStats.speed} color="#2196f3" />
        <StatBar label="Strength" value={totalStats.strength} color="#9c27b0" />
        <StatBar label="Energy" value={totalStats.energy} color="#ffc107" />
      </div>
    </div>
  );
}; 