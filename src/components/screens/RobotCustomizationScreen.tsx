import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { SciFiButton } from '../common/SciFiButton';
import useScreenTransition from '../../hooks/useScreenTransition';
import { PartSelectionGrid } from '../robot/PartSelectionGrid';
import { StatsDisplay } from '../robot/StatsDisplay';
import { ColorCustomizer } from '../robot/ColorCustomizer';
import { TutorialOverlay } from '../tutorial/TutorialOverlay';
import { saveRobot } from '../../utils/robotStorage';
import { setPlayerName } from '../../state/slices/playerSlice';
import '../../styles/RobotCustomizationScreen.css';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Robot Customization',
    description: 'Let\'s customize your robot to make it unique and powerful!',
    position: { x: 0, y: 0 }
  },
  {
    id: 'body',
    title: 'Choose Your Body',
    description: 'Select a body type that matches your fighting style.',
    position: { x: 0, y: 0 }
  },
  {
    id: 'weapons',
    title: 'Add Weapons',
    description: 'Equip your robot with powerful weapons to defeat your opponents.',
    position: { x: 0, y: 0 }
  },
  {
    id: 'finish',
    title: 'Ready to Battle!',
    description: 'Your robot is ready for the arena. Let\'s start the battle!',
    position: { x: 0, y: 0 }
  }
];

export const RobotCustomizationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedFaction } = useSelector((state: RootState) => state.game);
  const { robot } = useSelector((state: RootState) => state.player);
  const { transitionToScreen } = useScreenTransition();
  const [showTutorial, setShowTutorial] = useState(true);
  const [robotName, setRobotName] = useState('');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (robotName.trim()) {
      dispatch(setPlayerName(robotName.trim()));
      setShowTutorial(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (robotName) {
      saveRobot(robot, robotName);
      await transitionToScreen('city');
    }
  };

  const handleBack = async () => {
    await transitionToScreen('faction-select');
  };

  return (
    <div className="robot-customization-screen">
      {showTutorial ? (
        <div className="tutorial-overlay">
          <h2>Welcome to the Robot Workshop!</h2>
          <p>First, let's give your robot a name:</p>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={robotName}
              onChange={(e) => setRobotName(e.target.value)}
              placeholder="Enter robot name"
              maxLength={20}
              required
            />
            <button type="submit">Continue</button>
          </form>
        </div>
      ) : (
        <>
          <h1>Customize Your {selectedFaction === 'autobots' ? 'Autobot' : 'Decepticon'}</h1>

          <div className="customization-layout">
            <div className="preview-section">
              <div className="robot-name-input">
                <label htmlFor="robotName">Name Your Robot:</label>
                <input
                  type="text"
                  id="robotName"
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  placeholder="Enter robot name..."
                />
              </div>
              <ColorCustomizer />
            </div>

            <div className="controls-section">
              <PartSelectionGrid />
              <StatsDisplay />
            </div>
          </div>

          <div className="button-container">
            <SciFiButton variant="outline" onClick={handleBack}>
              Back
            </SciFiButton>
            <SciFiButton
              variant="primary"
              onClick={handleSaveAndContinue}
              disabled={!robotName}
            >
              Save & Continue
            </SciFiButton>
          </div>
        </>
      )}

      {showTutorial && (
        <TutorialOverlay
          steps={tutorialSteps}
          onComplete={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}; 