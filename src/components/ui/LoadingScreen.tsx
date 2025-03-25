import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import '../../styles/LoadingScreen.css';

const LOADING_TIPS = [
  "Autobots transform into cars, trucks, and planes!",
  "Decepticons often transform into military vehicles!",
  "Optimus Prime is the leader of the Autobots!",
  "Megatron is the leader of the Decepticons!",
  "Some robots can combine to form even bigger robots!",
  "The faster you move, the harder it is to aim your weapons!",
  "Use buildings for cover during battles!",
  "Different weapons work better against different robots!",
  "Collect energon cubes to power up your special abilities!",
  "Work together with your teammates to win battles!"
];

interface LoadingScreenProps {
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ className = '' }) => {
  const { loadingProgress } = useSelector((state: RootState) => state.game);
  const [currentTip, setCurrentTip] = useState(LOADING_TIPS[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  const progressText = `Loading... ${Math.round(loadingProgress)}%`;

  return (
    <div 
      className={`loading-screen ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(loadingProgress)}
      aria-label={progressText}
    >
      <div className="loading-content">
        <h2 className="loading-title">{progressText}</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <div 
          className={`loading-tip ${isVisible ? 'visible' : ''}`}
          aria-live="polite"
        >
          <p>{currentTip}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 