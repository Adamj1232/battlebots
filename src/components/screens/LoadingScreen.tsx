import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import '../../styles/LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  const { loadingProgress } = useSelector((state: RootState) => state.game);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h2>Loading...</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p className="progress-text">{Math.round(loadingProgress)}%</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 