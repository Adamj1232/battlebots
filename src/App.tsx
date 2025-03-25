import React from 'react';
import { Provider } from 'react-redux';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StartScreen } from './components/screens/StartScreen';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { FactionSelectScreen } from './components/screens/FactionSelectScreen';
import { RobotCustomizationScreen } from './components/screens/RobotCustomizationScreen';
import { BattleScreen } from './components/screens/BattleScreen';
import { PhysicsTestPage } from './components/screens/PhysicsTestPage';
import { useSelector } from 'react-redux';
import { RootState } from './state/store';
import { store } from './state/store';
import './styles/App.css';

const AppContent: React.FC = () => {
  const currentScreen = useSelector((state: RootState) => state.game.currentScreen);

  switch (currentScreen) {
    case 'start':
      return <StartScreen />;
    case 'loading':
      return <LoadingScreen />;
    case 'faction-select':
      return <FactionSelectScreen />;
    case 'robot-customization':
      return <RobotCustomizationScreen />;
    case 'battle':
      return <BattleScreen />;
    case 'physics-test':
      return <PhysicsTestPage />;
    default:
      return <StartScreen />;
  }
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
