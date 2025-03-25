import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentScreen, setSelectedFaction } from '../../state/slices/gameSlice';
import { Faction } from '../../types/Robot';
import '../../styles/FactionSelectScreen.css';

export const FactionSelectScreen: React.FC = () => {
  const dispatch = useDispatch();

  const handleSelectFaction = (faction: Faction) => {
    dispatch(setSelectedFaction(faction));
    dispatch(setCurrentScreen('robot-customization'));
  };

  const handleBack = () => {
    dispatch(setCurrentScreen('start'));
  };

  return (
    <div className="faction-select-screen">
      <h2>Choose Your Faction</h2>
      <div className="faction-grid">
        <div 
          className="faction-card"
          onClick={() => handleSelectFaction('autobot')}
        >
          <div className="faction-icon autobot" />
          <h3>Autobots</h3>
          <p>Defenders of peace and justice, the Autobots fight to protect all sentient beings.</p>
          <ul>
            <li>Balanced combat capabilities</li>
            <li>Enhanced defensive systems</li>
            <li>Superior transformation technology</li>
          </ul>
        </div>
        <div 
          className="faction-card"
          onClick={() => handleSelectFaction('decepticon')}
        >
          <div className="faction-icon decepticon" />
          <h3>Decepticons</h3>
          <p>Masters of conquest and deception, the Decepticons seek ultimate power.</p>
          <ul>
            <li>Advanced weapons systems</li>
            <li>Superior offensive capabilities</li>
            <li>Ruthless combat tactics</li>
          </ul>
        </div>
      </div>
      <button className="back-button" onClick={handleBack}>
        Back to Menu
      </button>
    </div>
  );
}; 