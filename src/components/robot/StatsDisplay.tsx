import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { Robot } from '../../types/Robot';
import '../../styles/StatsDisplay.css';

interface RobotStats {
  health: number;
  energy: number;
  strength: number;
  defense: number;
  speed: number;
}

const calculateTotalStats = (robot: Robot | null): RobotStats => {
  if (!robot) {
    return {
      health: 0,
      energy: 0,
      strength: 0,
      defense: 0,
      speed: 0
    };
  }

  const totalStats: RobotStats = {
    health: 0,
    energy: 0,
    strength: 0,
    defense: 0,
    speed: 0
  };

  // Sum up stats from all parts
  Object.values(robot.parts).forEach(part => {
    if (part) {
      totalStats.health += part.stats.health;
      totalStats.energy += part.stats.energy;
      totalStats.strength += part.stats.strength;
      totalStats.defense += part.stats.defense;
      totalStats.speed += part.stats.speed;
    }
  });

  return totalStats;
};

export const StatsDisplay: React.FC = () => {
  const robot = useSelector((state: RootState) => state.player.robot);
  const totalStats = calculateTotalStats(robot);

  return (
    <div className="stats-display">
      <h3>Total Stats</h3>
      <div className="stats-grid">
        <div className="stat">
          <label>Health</label>
          <div className="stat-bar">
            <div className="fill" style={{ width: `${totalStats.health / 4}%` }}></div>
            <span className="value">{totalStats.health}</span>
          </div>
        </div>
        <div className="stat">
          <label>Energy</label>
          <div className="stat-bar">
            <div className="fill" style={{ width: `${totalStats.energy / 4}%` }}></div>
            <span className="value">{totalStats.energy}</span>
          </div>
        </div>
        <div className="stat">
          <label>Strength</label>
          <div className="stat-bar">
            <div className="fill" style={{ width: `${totalStats.strength / 4}%` }}></div>
            <span className="value">{totalStats.strength}</span>
          </div>
        </div>
        <div className="stat">
          <label>Defense</label>
          <div className="stat-bar">
            <div className="fill" style={{ width: `${totalStats.defense / 4}%` }}></div>
            <span className="value">{totalStats.defense}</span>
          </div>
        </div>
        <div className="stat">
          <label>Speed</label>
          <div className="stat-bar">
            <div className="fill" style={{ width: `${totalStats.speed / 4}%` }}></div>
            <span className="value">{totalStats.speed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 