import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { setError, setGameState } from '../../state/slices/gameSlice';
import GameEngine from '../../game/engine/GameEngine';
import ErrorBoundary from '../common/ErrorBoundary';
import useAccessibility from '../../hooks/useAccessibility';

interface GameCanvasProps {
  className?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const dispatch = useDispatch();
  const { colorblindMode, motionReduced, screenReader } = useAccessibility();
  
  const {
    showCanvas,
    engineInitialized,
    gamePaused,
    currentScreen,
  } = useSelector((state: RootState) => state.game);

  useEffect(() => {
    if (!canvasRef.current || engineInitialized) return;

    try {
      engineRef.current = new GameEngine(canvasRef.current);
      engineRef.current.initialize().then(() => {
        dispatch(setGameState({ engineInitialized: true }));
      }).catch((error: Error) => {
        console.error('Failed to initialize game engine:', error);
        dispatch(setError('Failed to initialize game engine. Please refresh the page.'));
      });
    } catch (error) {
      console.error('Error creating game engine:', error);
      dispatch(setError('Failed to create game engine. Please refresh the page.'));
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [dispatch, engineInitialized]);

  // Update engine when accessibility settings change
  useEffect(() => {
    if (!engineRef.current) return;
    
    engineRef.current.updateAccessibilitySettings({
      colorblindMode,
      motionReduced,
      screenReader
    });
  }, [colorblindMode, motionReduced, screenReader]);

  // Update engine state when game is paused/resumed
  useEffect(() => {
    if (!engineRef.current) return;
    
    if (gamePaused) {
      engineRef.current.pause();
    } else {
      engineRef.current.resume();
    }
  }, [gamePaused]);

  // Handle screen transitions
  useEffect(() => {
    if (!engineRef.current) return;
    
    engineRef.current.handleScreenTransition(currentScreen);
  }, [currentScreen]);

  if (!showCanvas) return null;

  return (
    <ErrorBoundary>
      <canvas
        ref={canvasRef}
        className={`game-canvas ${className}`}
        aria-label={screenReader ? "Game viewport" : undefined}
        role="application"
        tabIndex={0}
      />
    </ErrorBoundary>
  );
};

export default GameCanvas; 