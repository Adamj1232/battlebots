import React from 'react';
import { useDispatch } from 'react-redux';
import { SciFiButton } from '../common/SciFiButton';
import useScreenTransition from '../../hooks/useScreenTransition';
import { setSelectedFaction } from '../../state/slices/gameSlice';
import '../../styles/FactionSelectScreen.css';

const FactionSelectScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { transitionToScreen } = useScreenTransition();

  const handleSelectFaction = async (faction: 'autobots' | 'decepticons') => {
    dispatch(setSelectedFaction(faction));
    await transitionToScreen('robot-customization');
  };

  const handleBack = async () => {
    await transitionToScreen('start');
  };

  return (
    <div className="faction-select-screen">
      <h1>CHOOSE YOUR SIDE</h1>
      
      <div className="factions-container">
        <div 
          className="faction-card autobot" 
          onClick={() => handleSelectFaction('autobots')}
        >
          <div className="faction-logo autobot-logo"></div>
          <h2>AUTOBOTS</h2>
          <p>Brave heroes who protect Earth and fight for peace!</p>
          <ul className="faction-traits">
            <li>Strong Defenses</li>
            <li>Healing Abilities</li>
            <li>Team Bonuses</li>
          </ul>
        </div>
        
        <div 
          className="faction-card decepticon" 
          onClick={() => handleSelectFaction('decepticons')}
        >
          <div className="faction-logo decepticon-logo"></div>
          <h2>DECEPTICONS</h2>
          <p>Powerful warriors seeking to conquer and rule!</p>
          <ul className="faction-traits">
            <li>Powerful Attacks</li>
            <li>Stealth Abilities</li>
            <li>Special Weapons</li>
          </ul>
        </div>
      </div>
      
      <SciFiButton variant="outline" onClick={handleBack}>
        BACK
      </SciFiButton>
    </div>
  );
};

export default FactionSelectScreen; 