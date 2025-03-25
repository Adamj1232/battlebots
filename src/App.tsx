import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './state/store';
import GameCanvas from './components/game/GameCanvas';
import StartScreen from './components/screens/StartScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import FactionSelectScreen from './components/screens/FactionSelectScreen';
import { RobotCustomizationScreen } from './components/screens/RobotCustomizationScreen';
import PhysicsTestPage from './pages/PhysicsTestPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import useAccessibility from './hooks/useAccessibility';
import './App.css';

const App: React.FC = () => {
  const { currentScreen, error } = useSelector((state: RootState) => state.game);
  const { colorblindMode } = useAccessibility();

  // Apply colorblind mode to root element
  useEffect(() => {
    document.documentElement.classList.toggle('colorblind-mode', colorblindMode);
  }, [colorblindMode]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen className="screen-transition" />;
      case 'start':
        return <StartScreen />;
      case 'faction-select':
        return <FactionSelectScreen />;
      case 'robot-customization':
        return <RobotCustomizationScreen />;
      case 'physics-test':
        return <PhysicsTestPage />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className={`app ${currentScreen}`}>
        <GameCanvas />
        <div className="screen-container">
          {error ? (
            <div className="error-overlay" role="alert">
              <h2>Oops! Something went wrong</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Reload Game
              </button>
            </div>
          ) : (
            renderScreen()
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
